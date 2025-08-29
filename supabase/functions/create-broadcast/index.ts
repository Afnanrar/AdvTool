// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
// supabase/functions/create-broadcast/index.ts
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
    const { pageId, campaignName, audience, message, tag, scheduledAt } = await req.json()
    const user = await getUser(req);
    if (!user) throw new Error('User not found');

    // --- Calculate audience size ---
    let totalRecipients = 0;
    // In a real app, this logic would be more complex, especially for labels.
    // This is a simplified version for the prototype.
    if (audience === 'all' || audience === 'vip') { // VIP is not implemented, so treat as all for now
        const { count, error } = await supabaseAdmin
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('page_id', pageId)
            .eq('user_id', user.id);
        if (error) throw error;
        totalRecipients = count || 0;
    } else {
        // NOTE: 'active_24h' and 'inactive_24h' would require more complex queries
        // on the `last_message_at` field, which is not implemented here for brevity.
        // We'll just estimate for the prototype.
        const { count, error } = await supabaseAdmin
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('page_id', pageId)
            .eq('user_id', user.id);
        if (error) throw error;
        totalRecipients = Math.floor((count || 0) * 0.75); // Dummy calculation
    }

    const { error } = await supabaseAdmin
      .from('broadcasts')
      .insert({
        page_id: pageId,
        user_id: user.id,
        campaign_name: campaignName,
        audience: audience,
        message: message,
        tag: tag,
        scheduled_at: scheduledAt,
        status: 'Scheduled', // Always start as scheduled, cron job will pick it up
        is_template: false,
        total_recipients: totalRecipients, // Save the calculated count
      })
    
    if (error) throw error

    // NOTE: A separate process (the 'process-broadcasts' function) will now pick this up.

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