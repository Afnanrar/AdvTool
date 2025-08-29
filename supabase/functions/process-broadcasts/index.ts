// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
// supabase/functions/process-broadcasts/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdmin.ts'

const FB_GRAPH_URL = 'https://graph.facebook.com/v19.0/me/messages';

// Helper to send a single message
async function sendFbMessage(recipientPsid: string, text: string, tag: string | null, accessToken: string) {
    const messagePayload: any = {
        recipient: { id: recipientPsid },
        message: { text },
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

    return await fbResponse.json();
}

serve(async (_req) => {
    // This function is designed to be called by a cron job, not a user.
    // It processes one broadcast at a time to stay within execution limits.
    try {
        // Find one due broadcast to process
        const { data: broadcast, error: broadcastError } = await supabaseAdmin
            .from('broadcasts')
            .select(`
                *,
                page:pages!inner(page_access_token)
            `)
            .eq('status', 'Scheduled')
            .lte('scheduled_at', new Date().toISOString())
            .limit(1)
            .single();

        if (broadcastError) {
             if (broadcastError.code === 'PGRST116') { // "single()" returns no rows
                return new Response(JSON.stringify({ message: 'No broadcasts to process.' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }
            throw broadcastError;
        }

        if (!broadcast) {
            return new Response(JSON.stringify({ message: 'No broadcasts to process.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }
        
        // Mark as 'In Progress' to prevent reprocessing by subsequent cron runs
        await supabaseAdmin.from('broadcasts').update({ status: 'In Progress' }).eq('id', broadcast.id);
        
        // NOTE: In a production app, the token would be encrypted and need decryption here.
        const accessToken = broadcast.page.page_access_token;
        if (!accessToken) {
             await supabaseAdmin.from('broadcasts').update({ status: 'Failed', progress: 100 }).eq('id', broadcast.id);
             throw new Error(`Page ${broadcast.page_id} is missing a valid access token.`);
        }

        // Fetch audience PSIDs
        // This is a simplified audience query. A real implementation would handle labels, etc.
        const { data: profiles, error: profilesError } = await supabaseAdmin
            .from('conversations')
            .select('user_profile:user_profiles!inner(psid)')
            .eq('page_id', broadcast.page_id);

        if (profilesError) throw profilesError;
        
        const recipients = (profiles || []).map(p => p.user_profile?.psid).filter(Boolean) as string[];
        let sentCount = 0;
        let failedCount = 0;
        const startTime = new Date(broadcast.scheduled_at).getTime();

        // Loop and send messages
        for (const psid of recipients) {
            try {
                // Introduce a small delay to avoid hitting rate limits too quickly
                await new Promise(resolve => setTimeout(resolve, 250)); 
                
                const result = await sendFbMessage(psid, broadcast.message, broadcast.tag, accessToken);

                if (result.error) {
                    console.error(`Failed to send to ${psid}:`, result.error.message);
                    failedCount++;
                } else {
                    sentCount++;
                }

                // Update progress intermittently (e.g., every 10 messages) to provide feedback
                if ((sentCount + failedCount) % 10 === 0 && broadcast.total_recipients > 0) {
                    await supabaseAdmin.from('broadcasts').update({ 
                        sent_count: sentCount,
                        progress: (sentCount / broadcast.total_recipients) * 100
                    }).eq('id', broadcast.id);
                }
            } catch (e) {
                console.error(`Exception while sending to ${psid}:`, e.message);
                failedCount++;
            }
        }
        
        // Final update to mark as complete
        const timeSpent = `${Math.ceil((Date.now() - startTime) / 60000)}m`;
        await supabaseAdmin.from('broadcasts').update({ 
            status: 'Sent',
            sent_count: sentCount,
            progress: 100,
            time_spent: timeSpent
        }).eq('id', broadcast.id);

        return new Response(JSON.stringify({ success: true, message: `Processed broadcast ${broadcast.id}. Sent: ${sentCount}, Failed: ${failedCount}` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Broadcast processor error:', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
})
