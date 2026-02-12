import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// API endpoints per provider for fetching campaign data
const SYNC_CONFIGS: Record<string, {
  campaignsUrl: (accountId: string) => string;
  metricsUrl: (accountId: string, campaignId: string) => string;
  headers: (token: string) => Record<string, string>;
  parseCampaigns: (data: any) => Array<{
    id: string;
    name: string;
    status: string;
    budget: number;
    spent: number;
    startDate: string | null;
    endDate: string | null;
  }>;
  parseMetrics: (data: any) => {
    impressions: number;
    clicks: number;
    conversions: number;
    cost: number;
    revenue: number;
  };
  refreshTokenUrl?: string;
  refreshTokenBody?: (refreshToken: string, clientId: string, clientSecret: string) => any;
}> = {
  google_ads: {
    campaignsUrl: (accountId) =>
      `https://googleads.googleapis.com/v16/customers/${accountId}/googleAds:searchStream`,
    metricsUrl: (accountId, campaignId) =>
      `https://googleads.googleapis.com/v16/customers/${accountId}/googleAds:searchStream`,
    headers: (token) => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "developer-token": Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN") || "",
    }),
    parseCampaigns: (data) => {
      if (!data?.results) return [];
      return data.results.map((r: any) => ({
        id: r.campaign?.id || "",
        name: r.campaign?.name || "",
        status: r.campaign?.status?.toLowerCase() || "unknown",
        budget: Number(r.campaignBudget?.amountMicros || 0) / 1000000,
        spent: Number(r.metrics?.costMicros || 0) / 1000000,
        startDate: r.campaign?.startDate || null,
        endDate: r.campaign?.endDate || null,
      }));
    },
    parseMetrics: (data) => {
      const m = data?.results?.[0]?.metrics || {};
      return {
        impressions: Number(m.impressions || 0),
        clicks: Number(m.clicks || 0),
        conversions: Number(m.conversions || 0),
        cost: Number(m.costMicros || 0) / 1000000,
        revenue: Number(m.conversionsValue || 0),
      };
    },
    refreshTokenUrl: "https://oauth2.googleapis.com/token",
    refreshTokenBody: (refreshToken, clientId, clientSecret) => ({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  },
  meta_ads: {
    campaignsUrl: (accountId) =>
      `https://graph.facebook.com/v19.0/act_${accountId}/campaigns?fields=id,name,status,daily_budget,lifetime_budget,start_time,stop_time&limit=100`,
    metricsUrl: (accountId, campaignId) =>
      `https://graph.facebook.com/v19.0/${campaignId}/insights?fields=impressions,clicks,actions,spend,action_values&date_preset=last_30d`,
    headers: (token) => ({ Authorization: `Bearer ${token}` }),
    parseCampaigns: (data) => {
      if (!data?.data) return [];
      return data.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        status: c.status?.toLowerCase() || "unknown",
        budget: Number(c.lifetime_budget || c.daily_budget || 0) / 100,
        spent: 0,
        startDate: c.start_time ? c.start_time.split("T")[0] : null,
        endDate: c.stop_time ? c.stop_time.split("T")[0] : null,
      }));
    },
    parseMetrics: (data) => {
      const m = data?.data?.[0] || {};
      const purchases = m.actions?.find((a: any) => a.action_type === "purchase")?.value || 0;
      const purchaseValue = m.action_values?.find((a: any) => a.action_type === "purchase")?.value || 0;
      return {
        impressions: Number(m.impressions || 0),
        clicks: Number(m.clicks || 0),
        conversions: Number(purchases),
        cost: Number(m.spend || 0),
        revenue: Number(purchaseValue),
      };
    },
  },
  linkedin_ads: {
    campaignsUrl: (accountId) =>
      `https://api.linkedin.com/rest/adCampaigns?q=search&search=(account:(values:List(urn%3Ali%3AsponsoredAccount%3A${accountId})))&count=100`,
    metricsUrl: (accountId, campaignId) =>
      `https://api.linkedin.com/rest/adAnalytics?q=analytics&pivot=CAMPAIGN&campaigns=List(urn%3Ali%3AsponsoredCampaign%3A${campaignId})&dateRange=(start:(year:2024,month:1,day:1))&timeGranularity=ALL`,
    headers: (token) => ({
      Authorization: `Bearer ${token}`,
      "LinkedIn-Version": "202401",
      "X-Restli-Protocol-Version": "2.0.0",
    }),
    parseCampaigns: (data) => {
      if (!data?.elements) return [];
      return data.elements.map((c: any) => ({
        id: String(c.id),
        name: c.name || "",
        status: c.status?.toLowerCase() || "unknown",
        budget: Number(c.totalBudget?.amount || c.dailyBudget?.amount || 0) / 100,
        spent: 0,
        startDate: c.runSchedule?.start ? new Date(c.runSchedule.start).toISOString().split("T")[0] : null,
        endDate: c.runSchedule?.end ? new Date(c.runSchedule.end).toISOString().split("T")[0] : null,
      }));
    },
    parseMetrics: (data) => {
      const m = data?.elements?.[0] || {};
      return {
        impressions: Number(m.impressions || 0),
        clicks: Number(m.clicks || 0),
        conversions: Number(m.externalWebsiteConversions || 0),
        cost: Number(m.costInLocalCurrency || 0) / 100,
        revenue: 0,
      };
    },
  },
  tiktok_ads: {
    campaignsUrl: (accountId) =>
      `https://business-api.tiktok.com/open_api/v1.3/campaign/get/?advertiser_id=${accountId}&page_size=100`,
    metricsUrl: (accountId, campaignId) =>
      `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id=${accountId}&report_type=BASIC&dimensions=["campaign_id"]&metrics=["spend","impressions","clicks","conversion","total_complete_payment_rate"]&data_level=AUCTION_CAMPAIGN&lifetime=true&filters=[{"field_name":"campaign_ids","filter_type":"IN","filter_value":["${campaignId}"]}]`,
    headers: (token) => ({
      "Access-Token": token,
      "Content-Type": "application/json",
    }),
    parseCampaigns: (data) => {
      if (!data?.data?.list) return [];
      return data.data.list.map((c: any) => ({
        id: c.campaign_id,
        name: c.campaign_name || "",
        status: c.operation_status?.toLowerCase() || "unknown",
        budget: Number(c.budget || 0),
        spent: 0,
        startDate: null,
        endDate: null,
      }));
    },
    parseMetrics: (data) => {
      const m = data?.data?.list?.[0]?.metrics || {};
      return {
        impressions: Number(m.impressions || 0),
        clicks: Number(m.clicks || 0),
        conversions: Number(m.conversion || 0),
        cost: Number(m.spend || 0),
        revenue: 0,
      };
    },
  },
};

// Refresh access token if expired
async function refreshAccessToken(
  integration: any,
  supabase: any
): Promise<string | null> {
  const config = SYNC_CONFIGS[integration.provider];
  if (!config?.refreshTokenUrl || !integration.refresh_token) return null;

  const clientId = Deno.env.get(`${integration.provider.toUpperCase().replace("_ADS", "_ADS")}_CLIENT_ID`) || "";
  const clientSecret = Deno.env.get(`${integration.provider.toUpperCase().replace("_ADS", "_ADS")}_CLIENT_SECRET`) || "";

  if (!clientId || !clientSecret) return null;

  try {
    const body = config.refreshTokenBody
      ? config.refreshTokenBody(integration.refresh_token, clientId, clientSecret)
      : {};

    const response = await fetch(config.refreshTokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body).toString(),
    });

    const data = await response.json();
    if (!data.access_token) return null;

    // Update token in DB
    await supabase
      .from("ad_integrations")
      .update({
        access_token: data.access_token,
        token_expires_at: data.expires_in
          ? new Date(Date.now() + data.expires_in * 1000).toISOString()
          : null,
        ...(data.refresh_token ? { refresh_token: data.refresh_token } : {}),
      })
      .eq("id", integration.id);

    return data.access_token;
  } catch (e) {
    console.error("Token refresh failed:", e);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { provider, integration_id } = await req.json();

    if (!provider || !integration_id) {
      return new Response(
        JSON.stringify({ error: "Missing provider or integration_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get integration
    const { data: integration, error: intError } = await supabase
      .from("ad_integrations")
      .select("*")
      .eq("id", integration_id)
      .eq("user_id", user.id)
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "Integration not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (integration.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "Integration is not connected" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = SYNC_CONFIGS[provider];
    if (!config) {
      return new Response(
        JSON.stringify({ error: `Unknown provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create sync log
    const syncStartedAt = new Date().toISOString();
    const { data: syncLog, error: logError } = await supabase
      .from("integration_sync_logs")
      .insert({
        user_id: user.id,
        integration_id,
        provider,
        status: "running",
        sync_type: "manual",
        started_at: syncStartedAt,
      })
      .select()
      .single();

    if (logError) {
      console.error("Error creating sync log:", logError);
    }

    // Check if token needs refresh
    let accessToken = integration.access_token;
    if (integration.token_expires_at && new Date(integration.token_expires_at) < new Date()) {
      const newToken = await refreshAccessToken(integration, supabase);
      if (newToken) {
        accessToken = newToken;
      } else {
        // Mark as expired
        await supabase
          .from("ad_integrations")
          .update({ status: "expired", error_message: "Token expired and refresh failed" })
          .eq("id", integration_id);

        if (syncLog) {
          await supabase
            .from("integration_sync_logs")
            .update({ status: "failed", error_message: "Token expired", completed_at: new Date().toISOString() })
            .eq("id", syncLog.id);
        }

        return new Response(
          JSON.stringify({ error: "Token expired. Please reconnect." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch campaigns
    let recordsFetched = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsFailed = 0;

    try {
      const campaignsResponse = await fetch(config.campaignsUrl(integration.account_id || ""), {
        headers: config.headers(accessToken),
      });

      if (!campaignsResponse.ok) {
        throw new Error(`Campaigns API returned ${campaignsResponse.status}: ${await campaignsResponse.text()}`);
      }

      const campaignsData = await campaignsResponse.json();
      const campaigns = config.parseCampaigns(campaignsData);
      recordsFetched = campaigns.length;

      // For each campaign, try to fetch metrics and upsert into campaign_metrics
      for (const campaign of campaigns) {
        try {
          const metricsResponse = await fetch(
            config.metricsUrl(integration.account_id || "", campaign.id),
            { headers: config.headers(accessToken) }
          );

          if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json();
            const metrics = config.parseMetrics(metricsData);

            // Find matching campaign in our DB by name or external ID
            const { data: existingCampaigns } = await supabase
              .from("campaigns")
              .select("id")
              .eq("user_id", user.id)
              .ilike("name", `%${campaign.name}%`)
              .limit(1);

            if (existingCampaigns && existingCampaigns.length > 0) {
              const campaignId = existingCampaigns[0].id;

              // Upsert metrics
              const periodEnd = new Date().toISOString().split("T")[0];
              const periodStart = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

              const { error: metricsError } = await supabase
                .from("campaign_metrics")
                .insert({
                  campaign_id: campaignId,
                  user_id: user.id,
                  period_start: periodStart,
                  period_end: periodEnd,
                  impressions: metrics.impressions,
                  clicks: metrics.clicks,
                  conversions: metrics.conversions,
                  cost: metrics.cost,
                  revenue: metrics.revenue,
                  ctr: metrics.clicks > 0 && metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0,
                  cpc: metrics.clicks > 0 ? metrics.cost / metrics.clicks : 0,
                  cpa: metrics.conversions > 0 ? metrics.cost / metrics.conversions : 0,
                  roas: metrics.cost > 0 ? metrics.revenue / metrics.cost : 0,
                  source: "api",
                });

              if (metricsError) {
                recordsFailed++;
              } else {
                recordsCreated++;
              }
            } else {
              recordsUpdated++; // Fetched but no matching campaign
            }
          }
        } catch (e) {
          console.warn(`Error fetching metrics for campaign ${campaign.id}:`, e);
          recordsFailed++;
        }
      }
    } catch (e) {
      console.error("Sync error:", e);

      // Update sync log as failed
      if (syncLog) {
        await supabase
          .from("integration_sync_logs")
          .update({
            status: "failed",
            error_message: e.message,
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - new Date(syncStartedAt).getTime(),
          })
          .eq("id", syncLog.id);
      }

      // Update integration error
      await supabase
        .from("ad_integrations")
        .update({
          error_message: e.message,
          error_count: (integration.error_count || 0) + 1,
          status: (integration.error_count || 0) >= 4 ? "error" : "connected",
        })
        .eq("id", integration_id);

      return new Response(
        JSON.stringify({ error: `Sync failed: ${e.message}`, records_fetched: recordsFetched }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update sync log as completed
    const completedAt = new Date().toISOString();
    if (syncLog) {
      await supabase
        .from("integration_sync_logs")
        .update({
          status: recordsFailed > 0 && recordsCreated === 0 ? "failed" : recordsFailed > 0 ? "partial" : "completed",
          completed_at: completedAt,
          duration_ms: Date.now() - new Date(syncStartedAt).getTime(),
          records_fetched: recordsFetched,
          records_created: recordsCreated,
          records_updated: recordsUpdated,
          records_failed: recordsFailed,
          period_start: new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
          period_end: new Date().toISOString().split("T")[0],
        })
        .eq("id", syncLog.id);
    }

    // Update integration last_sync
    await supabase
      .from("ad_integrations")
      .update({
        last_sync_at: completedAt,
        error_message: null,
        error_count: 0,
      })
      .eq("id", integration_id);

    return new Response(
      JSON.stringify({
        success: true,
        records_fetched: recordsFetched,
        records_created: recordsCreated,
        records_updated: recordsUpdated,
        records_failed: recordsFailed,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("integration-sync error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
