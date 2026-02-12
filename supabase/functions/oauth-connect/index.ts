import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// OAuth configs per provider
const OAUTH_CONFIGS: Record<string, {
  authUrl: string;
  scopes: string[];
  clientIdEnv: string;
  extraParams?: Record<string, string>;
}> = {
  google_ads: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scopes: ["https://www.googleapis.com/auth/adwords"],
    clientIdEnv: "GOOGLE_ADS_CLIENT_ID",
    extraParams: { access_type: "offline", prompt: "consent" },
  },
  meta_ads: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    scopes: ["ads_read", "ads_management", "read_insights"],
    clientIdEnv: "META_ADS_CLIENT_ID",
  },
  linkedin_ads: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    scopes: ["r_ads", "r_ads_reporting", "r_organization_social"],
    clientIdEnv: "LINKEDIN_ADS_CLIENT_ID",
  },
  tiktok_ads: {
    authUrl: "https://business-api.tiktok.com/portal/auth",
    scopes: ["ad.read", "campaign.read", "report.read"],
    clientIdEnv: "TIKTOK_ADS_CLIENT_ID",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Read provider from body (POST via SDK) or query param (GET fallback)
    let provider: string | null = null;
    const url = new URL(req.url);
    provider = url.searchParams.get("provider");

    if (!provider && req.method === "POST") {
      try {
        const body = await req.json();
        provider = body.provider || null;
      } catch { /* ignore parse errors */ }
    }

    // Read token from Authorization header (sent by Supabase SDK)
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || null;

    if (!provider || !token) {
      return new Response(
        JSON.stringify({ error: "Missing provider or token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const config = OAUTH_CONFIGS[provider];
    if (!config) {
      return new Response(
        JSON.stringify({ error: `Unknown provider: ${provider}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client ID from env
    const clientId = Deno.env.get(config.clientIdEnv);
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: `OAuth not configured for ${provider}. Set ${config.clientIdEnv} in Supabase secrets.` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate state (contains user_id + provider for callback)
    const statePayload = JSON.stringify({ user_id: user.id, provider, ts: Date.now() });
    const stateB64 = btoa(statePayload);

    // Build callback URL
    const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback`;

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: config.scopes.join(" "),
      state: stateB64,
      ...(config.extraParams || {}),
    });

    const authorizationUrl = `${config.authUrl}?${params.toString()}`;

    // Return the authorization URL as JSON (frontend will redirect)
    return new Response(
      JSON.stringify({ url: authorizationUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("oauth-connect error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
