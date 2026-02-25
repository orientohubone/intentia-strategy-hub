import { supabase } from "@/integrations/supabase/client";

export interface BacklinkAnalysis {
  externalLinks: { url: string; domain: string; anchorText: string }[];
  internalLinks: number;
  externalLinkCount: number;
  uniqueReferringDomains: string[];
  nofollowCount: number;
  dofollowCount: number;
  anchorTextDistribution: Record<string, number>;
  authoritySignals: {
    hasHttps: boolean;
    hasSitemap: boolean;
    hasRobotsTxt: boolean;
    structuredDataCount: number;
    socialProfiles: string[];
    canonicalUrl: string | null;
    hreflangCount: number;
  };
}

export interface CompetitorMetrics {
  domain: string;
  url: string;
  previewImageUrl?: string | null;
  reachable: boolean;
  title: string | null;
  description: string | null;
  h1Count: number;
  wordCount: number;
  externalLinkCount: number;
  hasHttps: boolean;
  hasStructuredData: boolean;
  hasSitemap: boolean;
  socialProfiles: string[];
  ctaCount: number;
  imageCount: number;
}

export interface LlmVisibilityResult {
  provider: string;
  model: string;
  query: string;
  mentioned: boolean;
  mentionContext: string | null;
  competitorsMentioned: string[];
  fullResponse: string;
}

export interface SeoIntelligenceResponse {
  backlinks: BacklinkAnalysis | null;
  competitors: CompetitorMetrics[];
  llmResults: LlmVisibilityResult[];
  llmErrors?: string[];
}

export async function fetchSeoIntelligence(params: {
  url: string;
  competitorUrls?: string[];
  brandName?: string;
  niche?: string;
  aiKeys?: { provider: string; apiKey: string; model: string }[];
}): Promise<SeoIntelligenceResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/seo-intelligence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": anonKey,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as SeoIntelligenceResponse;
}
