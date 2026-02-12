import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Token exchange configs per provider
const TOKEN_CONFIGS: Record<string, {
  tokenUrl: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  accountInfoUrl?: string;
  accountInfoHeaders?: (token: string) => Record<string, string>;
  parseAccountInfo?: (data: any) => { id: string; name: string; currency?: string };
  parseTokenResponse?: (data: any) => { access_token: string; refresh_token?: string; expires_in?: number };
}> = {
  google_ads: {
    tokenUrl: "https://oauth2.googleapis.com/token",
    clientIdEnv: "GOOGLE_ADS_CLIENT_ID",
    clientSecretEnv: "GOOGLE_ADS_CLIENT_SECRET",
    // Account info is fetched via custom logic below (listAccessibleCustomers)
  },
  meta_ads: {
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    clientIdEnv: "META_ADS_CLIENT_ID",
    clientSecretEnv: "META_ADS_CLIENT_SECRET",
    accountInfoUrl: "https://graph.facebook.com/v19.0/me?fields=id,name",
    accountInfoHeaders: (token) => ({ Authorization: `Bearer ${token}` }),
    parseAccountInfo: (data) => ({ id: data.id, name: data.name || "Meta Account" }),
  },
  linkedin_ads: {
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientIdEnv: "LINKEDIN_ADS_CLIENT_ID",
    clientSecretEnv: "LINKEDIN_ADS_CLIENT_SECRET",
    accountInfoUrl: "https://api.linkedin.com/v2/me",
    accountInfoHeaders: (token) => ({ Authorization: `Bearer ${token}` }),
    parseAccountInfo: (data) => ({
      id: data.id,
      name: `${data.localizedFirstName || ""} ${data.localizedLastName || ""}`.trim() || "LinkedIn Account",
    }),
  },
  tiktok_ads: {
    tokenUrl: "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
    clientIdEnv: "TIKTOK_ADS_CLIENT_ID",
    clientSecretEnv: "TIKTOK_ADS_CLIENT_SECRET",
    parseTokenResponse: (data) => ({
      access_token: data.data?.access_token,
      refresh_token: data.data?.refresh_token,
      expires_in: data.data?.expires_in,
    }),
    parseAccountInfo: (data) => ({
      id: data.data?.advertiser_id || "unknown",
      name: data.data?.advertiser_name || "TikTok Account",
    }),
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const appUrl = Deno.env.get("APP_URL") || "https://intentia.com.br";

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateB64 = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    // Handle OAuth errors from provider
    if (error) {
      const redirectUrl = `${appUrl}/oauth/callback?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription || "")}`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    if (!code || !stateB64) {
      const redirectUrl = `${appUrl}/oauth/callback?error=missing_params&error_description=Missing code or state`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    // Decode state
    let state: { user_id: string; provider: string; ts: number };
    try {
      state = JSON.parse(atob(stateB64));
    } catch {
      const redirectUrl = `${appUrl}/oauth/callback?error=invalid_state&error_description=Could not decode state`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    // Validate state age (max 10 minutes)
    if (Date.now() - state.ts > 600000) {
      const redirectUrl = `${appUrl}/oauth/callback?error=expired_state&error_description=OAuth session expired. Please try again.`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    const { user_id, provider } = state;
    const config = TOKEN_CONFIGS[provider];
    if (!config) {
      const redirectUrl = `${appUrl}/oauth/callback?error=unknown_provider&error_description=Unknown provider: ${provider}`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    const clientId = Deno.env.get(config.clientIdEnv);
    const clientSecret = Deno.env.get(config.clientSecretEnv);
    if (!clientId || !clientSecret) {
      const redirectUrl = `${appUrl}/oauth/callback?error=config_error&error_description=OAuth credentials not configured for ${provider}`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    const callbackUrl = `${supabaseUrl}/functions/v1/oauth-callback`;

    // Exchange code for tokens
    let tokenBody: URLSearchParams | string;
    let tokenHeaders: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };

    if (provider === "tiktok_ads") {
      tokenHeaders = { "Content-Type": "application/json" };
      tokenBody = JSON.stringify({
        app_id: clientId,
        secret: clientSecret,
        auth_code: code,
      });
    } else {
      tokenBody = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl,
      }).toString();
    }

    const tokenResponse = await fetch(config.tokenUrl, {
      method: "POST",
      headers: tokenHeaders,
      body: tokenBody,
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok && !tokenData.data?.access_token) {
      console.error("Token exchange failed:", tokenData);
      const errMsg = tokenData.error_description || tokenData.error || tokenData.message || "Token exchange failed";
      const redirectUrl = `${appUrl}/oauth/callback?error=token_error&error_description=${encodeURIComponent(errMsg)}`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    // Parse token response
    let accessToken: string;
    let refreshToken: string | null = null;
    let expiresIn: number | null = null;

    if (config.parseTokenResponse) {
      const parsed = config.parseTokenResponse(tokenData);
      accessToken = parsed.access_token;
      refreshToken = parsed.refresh_token || null;
      expiresIn = parsed.expires_in || null;
    } else {
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token || null;
      expiresIn = tokenData.expires_in || null;
    }

    if (!accessToken) {
      const redirectUrl = `${appUrl}/oauth/callback?error=no_token&error_description=No access token received`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    // Fetch account info
    let accountId = "unknown";
    let accountName = provider.replace("_ads", "").replace("_", " ") + " Account";
    let accountCurrency = "BRL";

    if (provider === "google_ads") {
      // Google Ads: use listAccessibleCustomers to get real Customer ID
      try {
        const devToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN") || "";
        const customersResponse = await fetch(
          "https://googleads.googleapis.com/v16/customers:listAccessibleCustomers",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": devToken,
            },
          }
        );
        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          // resourceNames format: "customers/1234567890"
          const resourceNames = customersData.resourceNames || [];
          if (resourceNames.length > 0) {
            accountId = resourceNames[0].replace("customers/", "");
            accountName = `Google Ads (${accountId})`;
            // Try to fetch customer descriptive name
            try {
              const detailResponse = await fetch(
                `https://googleads.googleapis.com/v16/customers/${accountId}`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "developer-token": devToken,
                  },
                }
              );
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                accountName = detailData.descriptiveName || detailData.id || accountName;
              }
            } catch { /* use default name */ }
          }
        } else {
          console.warn("listAccessibleCustomers failed:", await customersResponse.text());
        }
      } catch (e) {
        console.warn("Could not fetch Google Ads account info:", e);
      }
    } else if (config.accountInfoUrl && config.accountInfoHeaders) {
      // Other providers: use generic account info endpoint
      try {
        const infoResponse = await fetch(config.accountInfoUrl, {
          headers: config.accountInfoHeaders(accessToken),
        });
        if (infoResponse.ok) {
          const infoData = await infoResponse.json();
          if (config.parseAccountInfo) {
            const parsed = config.parseAccountInfo(infoData);
            accountId = parsed.id;
            accountName = parsed.name;
            if (parsed.currency) accountCurrency = parsed.currency;
          }
        }
      } catch (e) {
        console.warn("Could not fetch account info:", e);
      }
    }

    // Calculate token expiry
    const tokenExpiresAt = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    // Upsert integration record
    const { error: upsertError } = await supabase
      .from("ad_integrations")
      .upsert(
        {
          user_id,
          provider,
          status: "connected",
          access_token: accessToken,
          refresh_token: refreshToken,
          token_expires_at: tokenExpiresAt,
          account_id: accountId,
          account_name: accountName,
          account_currency: accountCurrency,
          sync_enabled: true,
          error_message: null,
          error_count: 0,
        },
        { onConflict: "user_id,provider" }
      );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      const redirectUrl = `${appUrl}/oauth/callback?error=db_error&error_description=${encodeURIComponent(upsertError.message)}`;
      return new Response(null, { status: 302, headers: { Location: redirectUrl } });
    }

    // Redirect back to app with success
    const redirectUrl = `${appUrl}/oauth/callback?provider=${provider}&status=connected&account=${encodeURIComponent(accountName)}`;
    return new Response(null, { status: 302, headers: { Location: redirectUrl } });

  } catch (err) {
    console.error("oauth-callback error:", err);
    const redirectUrl = `${appUrl}/oauth/callback?error=server_error&error_description=${encodeURIComponent(err.message)}`;
    return new Response(null, { status: 302, headers: { Location: redirectUrl } });
  }
});
