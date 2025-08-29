// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
// supabase/functions/disconnect-page/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'
import { getUser } from '../_shared/user.ts'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { pageId } = await req.json() // This is the Supabase row UUID
    const user = await getUser(req);
    if (!user) throw new Error('User not found');

    const { error } = await supabaseAdmin
      .from('pages')
      .delete()
      .eq('id', pageId)
      .eq('user_id', user.id) // Ensure user owns the page
    
    if (error) throw error

    return new Response(JSON.stringify({ success: true }), {
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
