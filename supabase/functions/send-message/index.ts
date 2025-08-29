// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
// supabase/functions/send-message/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { getUser } from '../_shared/user.ts'

const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0/me/messages';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { conversationId, text, tag } = await req.json();
    const user = await getUser(req);

    if (!user) throw new Error('User not found');

    // Fetch conversation details and page access token securely
    const { data: convData, error: convError } = await supabaseAdmin
        .from('conversations')
        .select(`
            page_id,
            page:pages!inner(page_access_token),
            user_profile:user_profiles!inner(psid)
        `)
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();
    
    if (convError || !convData) throw convError || new Error("Conversation not found.");

    // NOTE: In a production app, the token would be encrypted in the database.
    // You would need to decrypt it here before using it.
    //
    // Example with a hypothetical decryption service:
    // const accessToken = await decryptToken(convData.page.page_access_token, Deno.env.get('ENCRYPTION_KEY_ID'));
    const accessToken = convData.page.page_access_token;
    
    // Fix: Use the correct Page-Scoped ID (psid) for the recipient
    const recipientId = convData.user_profile.psid;

    if (!recipientId) {
      throw new Error(`User profile for this conversation is missing a Facebook PSID. Cannot send message.`);
    }

    const messagePayload: any = {
        recipient: { id: recipientId },
        message: { text: text },
        messaging_type: 'RESPONSE',
    };

    if (tag) {
        messagePayload.messaging_type = 'MESSAGE_TAG';
        messagePayload.tag = tag;
    }

    const fbResponse = await fetch(`${FB_GRAPH_URL}?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload),
    });

    const fbData = await fbResponse.json();
    if (fbData.error) throw new Error(`Facebook API Error: ${fbData.error.message}`);
    
    // Insert the sent message into our database
    const { data: newMessage, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        direction: 'out',
        text: text,
        tag: tag,
        status: 'sent', // Or 'delivered' based on FB response
        api_response: fbData,
      })
      .select('id, conversationId: conversation_id, direction, text, attachments, tag, windowState: window_state, status, createdAt: created_at, sentAt: sent_at, apiResponse: api_response')
      .single();
    
    if (insertError) throw insertError;
    
    // Update the conversation's last message
    await supabaseAdmin
        .from('conversations')
        .update({ last_message: text, last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

    return new Response(JSON.stringify({ newMessage, pageId: convData.page_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})