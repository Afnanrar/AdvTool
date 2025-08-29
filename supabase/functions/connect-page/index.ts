// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
// supabase/functions/connect-page/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { getUser } from '../_shared/user.ts'

const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0';

// Fix: Add a type declaration for the Deno global object to allow TypeScript to compile in non-Deno environments.
declare const Deno: any;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { id: pageId, name, access_token, picture } = await req.json();
    const user = await getUser(req);

    if (!user) throw new Error('User not found');
    
    const FB_APP_ID = Deno.env.get('FACEBOOK_APP_ID');
    const FB_APP_SECRET = Deno.env.get('FACEBOOK_APP_SECRET');

    if (!FB_APP_ID || !FB_APP_SECRET) {
        throw new Error("Facebook App ID or Secret not configured in environment variables.");
    }

    // Exchange short-lived token for a long-lived one
    const longLivedTokenUrl = `${FB_GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${FB_APP_ID}&client_secret=${FB_APP_SECRET}&fb_exchange_token=${access_token}`;
    const tokenResponse = await fetch(longLivedTokenUrl);
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error.message);

    const longLivedToken = tokenData.access_token;
    
    // NOTE: In a production app, you MUST encrypt the longLivedToken before storing it.
    // Supabase Vault is the recommended way to store the encryption key.
    // For this prototype, we store it as plaintext with this warning.
    //
    // Example with a hypothetical encryption service:
    // const encryptedToken = await encryptToken(longLivedToken, Deno.env.get('ENCRYPTION_KEY_ID'));
    
    const { data: newPage, error } = await supabaseAdmin
      .from('pages')
      .insert({
        user_id: user.id,
        page_id: pageId,
        name: name,
        avatar_url: picture.data.url,
        page_access_token: longLivedToken, // In production, this would be the encryptedToken
      })
      .select('id, page_id, name, avatar_url')
      .single()

    if (error) throw error
    
    // Do not send token to client
    const safeNewPage = { ...newPage, page_access_token: '' };

    return new Response(JSON.stringify(safeNewPage), {
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