// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'

// Fix: Add a type declaration for the Deno global object to allow TypeScript to compile in non-Deno environments.
declare const Deno: any;

// For signature verification
async function verifySignature(req: Request, body: string): Promise<boolean> {
  const signature = req.headers.get('x-hub-signature-256')
  if (!signature) {
    console.error('Missing x-hub-signature-256 header')
    return false
  }

  const FB_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET')
  if (!FB_APP_SECRET) {
    console.error('Missing FACEBOOK_APP_SECRET from environment variables')
    return false
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(FB_APP_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const expectedSignature = `sha256=${Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`
  
  return signature === expectedSignature
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Handle Facebook Webhook Verification
  if (req.method === 'GET') {
    try {
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')
      const verifyToken = Deno.env.get('FACEBOOK_WEBHOOK_VERIFY_TOKEN')

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully!')
        return new Response(challenge, { status: 200 })
      } else {
        console.error('Webhook verification failed.')
        return new Response('Forbidden', { status: 403 })
      }
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  }

  // Handle Incoming Messages
  if (req.method === 'POST') {
    const rawBody = await req.text()

    if (!(await verifySignature(req, rawBody))) {
      return new Response('Signature verification failed', { status: 403 })
    }

    try {
      const body = JSON.parse(rawBody)

      if (body.object === 'page') {
        for (const entry of body.entry) {
          for (const event of entry.messaging) {
            if (event.message && !event.message.is_echo) {
              const senderPsid = event.sender.id
              const pageId = event.recipient.id
              const messageText = event.message.text
              
              // --- Database Logic ---
              // 1. Find our internal page and user IDs
              const { data: page } = await supabaseAdmin.from('pages').select('id, user_id, page_access_token').eq('page_id', pageId).single()
              if (!page) {
                console.warn(`Received message for un-tracked page with ID: ${pageId}`)
                continue; // Skip this message
              }

              // 2. Find or create the user profile based on PSID
              let { data: userProfile } = await supabaseAdmin.from('user_profiles').select('id').eq('psid', senderPsid).single()
              
              if (!userProfile) {
                let userName = `User ${senderPsid.slice(-4)}`;
                let avatarUrl = `https://picsum.photos/seed/${senderPsid}/100/100`;

                // Fetch user details from Graph API to create a better profile
                try {
                    const pageAccessToken = page.page_access_token;
                    const profileUrl = `https://graph.facebook.com/v19.0/${senderPsid}?fields=first_name,last_name,profile_pic&access_token=${pageAccessToken}`;
                    const profileResponse = await fetch(profileUrl);
                    const profileData = await profileResponse.json();

                    if (profileData && !profileData.error) {
                        userName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
                        if (profileData.profile_pic) {
                            avatarUrl = profileData.profile_pic;
                        }
                    } else {
                        console.error("Could not fetch user profile from FB:", profileData.error?.message);
                    }
                } catch (e) {
                    console.error("Error fetching user profile from FB:", e.message);
                }

                const { data: newUserProfile, error: createUserError } = await supabaseAdmin.from('user_profiles').insert({
                  psid: senderPsid,
                  name: userName,
                  avatar_url: avatarUrl,
                  email: 'unknown@facebook.com', // Email is not available via this API
                  joined_at: new Date().toISOString(),
                }).select('id').single()
                
                if (createUserError) throw createUserError
                userProfile = newUserProfile
              }
              
              // 3. Find or create the conversation
              let { data: conversation } = await supabaseAdmin.from('conversations').select('id').eq('page_id', page.id).eq('user_profile_id', userProfile.id).single()

              if (!conversation) {
                  const { data: newConversation, error: createConvError } = await supabaseAdmin.from('conversations').insert({
                      page_id: page.id,
                      user_id: page.user_id,
                      user_profile_id: userProfile.id
                  }).select('id').single()

                  if(createConvError) throw createConvError
                  conversation = newConversation
              }

              // 4. Insert the new message
              const { error: messageError } = await supabaseAdmin.from('messages').insert({
                conversation_id: conversation.id,
                user_id: page.user_id,
                direction: 'in',
                text: messageText,
                status: 'delivered', // Mark as delivered initially
              })
              if (messageError) throw messageError

              // 5. Update conversation metadata
              const { data: convForUpdate, error: fetchConvError } = await supabaseAdmin
                .from('conversations')
                .select('unread_count')
                .eq('id', conversation.id)
                .single()

              if (fetchConvError) {
                console.error(`Could not fetch conversation ${conversation.id} to update unread count.`, fetchConvError)
                // Fallback to only updating last message if fetch fails
                await supabaseAdmin
                  .from('conversations')
                  .update({ last_message: messageText, last_message_at: new Date().toISOString() })
                  .eq('id', conversation.id)
              } else {
                const { error: updateConvError } = await supabaseAdmin
                  .from('conversations')
                  .update({
                    last_message: messageText,
                    last_message_at: new Date().toISOString(),
                    unread_count: (convForUpdate.unread_count || 0) + 1,
                  })
                  .eq('id', conversation.id)
                if (updateConvError) throw updateConvError
              }
              
              // The frontend is now listening for this change via Supabase Realtime
            }
          }
        }
      }

      return new Response('EVENT_RECEIVED', { status: 200 })
    } catch (error) {
      console.error('Error processing webhook event:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
  }

  return new Response('Method not allowed', { status: 405 })
})