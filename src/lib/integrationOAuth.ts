// =============================================================================
// Intentia Strategy Hub — OAuth Configuration for Ad Integrations
// =============================================================================

import type { AdProvider } from "./integrationTypes";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vofizgftwxgyosjrwcqy.supabase.co";
const APP_URL = window.location.origin;

export interface OAuthProviderConfig {
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  clientIdEnvKey: string;
  extraParams?: Record<string, string>;
}

export const OAUTH_CONFIGS: Record<AdProvider, OAuthProviderConfig> = {
  google_ads: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["https://www.googleapis.com/auth/adwords"],
    clientIdEnvKey: "GOOGLE_ADS_CLIENT_ID",
    extraParams: {
      access_type: "offline",
      prompt: "consent",
    },
  },
  meta_ads: {
    authUrl: "https://www.facebook.com/v19.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
    scopes: ["ads_read", "ads_management", "read_insights"],
    clientIdEnvKey: "META_ADS_CLIENT_ID",
  },
  linkedin_ads: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["r_ads", "r_ads_reporting", "r_organization_social"],
    clientIdEnvKey: "LINKEDIN_ADS_CLIENT_ID",
  },
  tiktok_ads: {
    authUrl: "https://business-api.tiktok.com/portal/auth",
    tokenUrl: "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
    scopes: ["ad.read", "campaign.read", "report.read"],
    clientIdEnvKey: "TIKTOK_ADS_CLIENT_ID",
    extraParams: {
      rid: "",
    },
  },
};

// Generate a cryptographically random state parameter
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Build the OAuth redirect URL — the Edge Function handles the actual redirect
export function getOAuthConnectUrl(provider: AdProvider, userAccessToken: string): string {
  return `${SUPABASE_URL}/functions/v1/oauth-connect?provider=${provider}&token=${encodeURIComponent(userAccessToken)}`;
}

// The callback URL that providers will redirect back to
export function getOAuthCallbackUrl(): string {
  return `${SUPABASE_URL}/functions/v1/oauth-callback`;
}

// The frontend page that receives the final redirect after Edge Function processes the callback
export function getOAuthReturnUrl(): string {
  return `${APP_URL}/oauth/callback`;
}
