
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            // Supabase API URL - Env var exported by default when deployed.
            Deno.env.get('SUPABASE_URL') ?? '',
            // Supabase Service Role Key - Env var exported by default when deployed.
            // DANGER: Never expose this key in client-side code.
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { targetUserId } = await req.json()

        if (!targetUserId) {
            return new Response(JSON.stringify({ error: 'Missing targetUserId' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Capture access metadata - Sanitize IP to avoid port variaton causing duplication
        const rawIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
        // Take first IP if comma separated, and remove port if present (simple check)
        const clientIP = rawIP.split(',')[0].trim().split(':')[0] || rawIP;

        const region = req.headers.get("cf-ipcountry") || "unknown";
        const userAgent = req.headers.get("user-agent") || "unknown";

        console.log(`Live Dashboard Access: User ${targetUserId}`);

        // Log access directly and throw if fails
        const { error: logError } = await supabaseClient.from('live_dashboard_access_logs').insert({
            user_id: targetUserId,
            viewer_ip: clientIP,
            viewer_region: region,
            viewer_agent: userAgent
        });

        if (logError) {
            console.error("Log insert failed:", logError.message);
            return new Response(JSON.stringify({ error: `Log Insert Failed` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        // 1. Fetch Campaigns + Projects
        const { data: campaigns, error: campaignsError } = await supabaseClient
            .from('campaigns')
            .select('id,name,channel,status,project_id,budget_total,budget_spent,projects!inner(name), created_at')
            .eq('user_id', targetUserId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (campaignsError) throw campaignsError;

        const campaignIds = (campaigns || []).map((c: any) => c.id);

        // 2. Fetch Metrics Summaries
        let summariesMap: Record<string, any> = {};
        if (campaignIds.length > 0) {
            const { data: summariesData, error: summariesError } = await supabaseClient
                .from('v_campaign_metrics_summary')
                .select('*')
                .eq('user_id', targetUserId)
                .in('campaign_id', campaignIds);

            if (summariesError) throw summariesError;
            (summariesData || []).forEach((s: any) => { summariesMap[s.campaign_id] = s; });
        }

        // 3. Fetch Latest Metrics (Snapshot recente)
        let latestMetricsMap: Record<string, any> = {};
        if (campaignIds.length > 0) {
            const { data: latestData, error: latestError } = await supabaseClient
                .from('campaign_metrics')
                .select('*')
                .eq('user_id', targetUserId)
                .in('campaign_id', campaignIds)
                .order('period_end', { ascending: false });

            if (latestError) throw latestError;

            // Filter to keep only the absolute latest per campaign
            (latestData || []).forEach((m: any) => {
                if (!latestMetricsMap[m.campaign_id]) {
                    latestMetricsMap[m.campaign_id] = m;
                }
            });
        }

        // 4. Fetch Allocations (Budget Planned)
        const { data: allocations, error: allocError } = await supabaseClient
            .from('budget_allocations')
            .select('*')
            .eq('user_id', targetUserId)
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (allocError) throw allocError;

        // 5. Fetch Historical Metrics for Chart (Actual Spent)
        let monthlyActuals: Record<string, number> = {};
        if (campaignIds.length > 0) {
            const { data: historyData, error: historyError } = await supabaseClient
                .from('campaign_metrics')
                .select('cost, period_end, created_at')
                .eq('user_id', targetUserId)
                .in('campaign_id', campaignIds)
                .not('period_end', 'is', null);

            if (historyError) throw historyError;

            (historyData || []).forEach((m: any) => {
                const dateStr = m.period_end || m.created_at;
                if (!dateStr) return;
                const date = new Date(dateStr);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                monthlyActuals[key] = (monthlyActuals[key] || 0) + (Number(m.cost) || 0);
            });
        }

        // Return unified payload
        return new Response(
            JSON.stringify({
                campaigns: campaigns.map((c: any) => ({
                    ...c,
                    project_name: c.projects?.name || "Sem projeto"
                })),
                summariesByCampaign: summariesMap,
                latestMetricsByCampaign: latestMetricsMap,
                allocations,
                monthlyActuals,
                accessInfo: { ip: clientIP, region } // Optional feedback
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
