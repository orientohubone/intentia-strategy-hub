import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// BACKLINKS & AUTHORITY ANALYSIS (from HTML)
// =====================================================

interface BacklinkAnalysis {
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

async function analyzeBacklinks(url: string, html: string): Promise<BacklinkAnalysis> {
  const parsedUrl = new URL(url);
  const baseDomain = parsedUrl.hostname.replace(/^www\./, "");

  // Extract all links
  const linkRegex = /<a[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const externalLinks: { url: string; domain: string; anchorText: string }[] = [];
  const domainSet = new Set<string>();
  let internalLinks = 0;
  let nofollowCount = 0;
  let dofollowCount = 0;
  const anchorTexts: Record<string, number> = {};
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    const anchor = match[2].replace(/<[^>]+>/g, "").trim().slice(0, 100);
    const fullTag = match[0];

    if (!href.startsWith("http")) {
      internalLinks++;
      continue;
    }

    try {
      const linkDomain = new URL(href).hostname.replace(/^www\./, "");
      if (linkDomain === baseDomain || linkDomain.endsWith(`.${baseDomain}`)) {
        internalLinks++;
        continue;
      }

      domainSet.add(linkDomain);
      if (externalLinks.length < 50) {
        externalLinks.push({ url: href, domain: linkDomain, anchorText: anchor || linkDomain });
      }

      if (/rel=["'][^"']*nofollow/i.test(fullTag)) {
        nofollowCount++;
      } else {
        dofollowCount++;
      }

      if (anchor) {
        anchorTexts[anchor] = (anchorTexts[anchor] || 0) + 1;
      }
    } catch {
      // invalid URL
    }
  }

  // Authority signals
  const hasHttps = url.startsWith("https");
  const hasSitemap = /sitemap/i.test(html);
  const structuredDataCount = (html.match(/application\/ld\+json/gi) || []).length;
  const socialProfiles: string[] = [];
  if (/facebook\.com|fb\.com/i.test(html)) socialProfiles.push("Facebook");
  if (/instagram\.com/i.test(html)) socialProfiles.push("Instagram");
  if (/linkedin\.com/i.test(html)) socialProfiles.push("LinkedIn");
  if (/twitter\.com|x\.com/i.test(html)) socialProfiles.push("X/Twitter");
  if (/youtube\.com/i.test(html)) socialProfiles.push("YouTube");

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : null;
  const hreflangCount = (html.match(/hreflang=/gi) || []).length;

  // Check robots.txt and sitemap.xml
  let hasRobotsTxt = false;
  try {
    const robotsResp = await fetch(`${parsedUrl.origin}/robots.txt`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; IntentiaBot/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    hasRobotsTxt = robotsResp.ok && (await robotsResp.text()).length > 10;
  } catch {}

  return {
    externalLinks,
    internalLinks,
    externalLinkCount: externalLinks.length,
    uniqueReferringDomains: [...domainSet],
    nofollowCount,
    dofollowCount,
    anchorTextDistribution: anchorTexts,
    authoritySignals: {
      hasHttps,
      hasSitemap,
      hasRobotsTxt,
      structuredDataCount,
      socialProfiles,
      canonicalUrl,
      hreflangCount,
    },
  };
}

// =====================================================
// COMPETITOR MONITORING (fetch + basic metrics)
// =====================================================

interface CompetitorMetrics {
  domain: string;
  url: string;
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

async function analyzeCompetitor(competitorUrl: string): Promise<CompetitorMetrics> {
  const domain = new URL(competitorUrl).hostname.replace(/^www\./, "");
  const base: CompetitorMetrics = {
    domain,
    url: competitorUrl,
    reachable: false,
    title: null,
    description: null,
    h1Count: 0,
    wordCount: 0,
    externalLinkCount: 0,
    hasHttps: competitorUrl.startsWith("https"),
    hasStructuredData: false,
    hasSitemap: false,
    socialProfiles: [],
    ctaCount: 0,
    imageCount: 0,
  };

  try {
    const resp = await fetch(competitorUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IntentiaBot/1.0)",
        "Accept": "text/html",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!resp.ok) return base;
    const html = await resp.text();
    base.reachable = true;

    // Title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    base.title = titleMatch ? titleMatch[1].trim().slice(0, 200) : null;

    // Description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)
      || html.match(/<meta[^>]*content=["']([^"']*?)["'][^>]*name=["']description["']/i);
    base.description = descMatch ? descMatch[1].trim().slice(0, 300) : null;

    // H1
    base.h1Count = (html.match(/<h1[^>]*>/gi) || []).length;

    // Word count
    const textOnly = html.replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ");
    base.wordCount = textOnly.split(/\s+/).filter(w => w.length > 1).length;

    // External links
    const extLinkRegex = /href=["'](https?:\/\/[^"']+)["']/gi;
    let extCount = 0;
    let m;
    while ((m = extLinkRegex.exec(html)) !== null) {
      try {
        const ld = new URL(m[1]).hostname.replace(/^www\./, "");
        if (ld !== domain) extCount++;
      } catch {}
    }
    base.externalLinkCount = extCount;

    // Structured data
    base.hasStructuredData = /application\/ld\+json/i.test(html);

    // Social
    if (/facebook\.com|fb\.com/i.test(html)) base.socialProfiles.push("Facebook");
    if (/instagram\.com/i.test(html)) base.socialProfiles.push("Instagram");
    if (/linkedin\.com/i.test(html)) base.socialProfiles.push("LinkedIn");
    if (/twitter\.com|x\.com/i.test(html)) base.socialProfiles.push("X/Twitter");

    // CTAs
    const ctaKeywords = /comprar|assinar|começar|iniciar|testar|agendar|solicitar|contato|demo|trial|free|grátis|cadastr|registr|sign.?up|get.?started/gi;
    base.ctaCount = (html.match(ctaKeywords) || []).length;

    // Images
    base.imageCount = (html.match(/<img[^>]+>/gi) || []).length;

    // Sitemap
    try {
      const sitemapResp = await fetch(`${new URL(competitorUrl).origin}/sitemap.xml`, {
        signal: AbortSignal.timeout(3000),
      });
      base.hasSitemap = sitemapResp.ok;
    } catch {}

  } catch {}

  return base;
}

// =====================================================
// LLM VISIBILITY CHECK
// =====================================================

interface LlmVisibilityResult {
  provider: string;
  model: string;
  query: string;
  mentioned: boolean;
  mentionContext: string | null;
  competitorsMentioned: string[];
  fullResponse: string;
}

async function checkLlmVisibility(
  brandName: string,
  niche: string,
  competitors: string[],
  aiProvider: string,
  aiApiKey: string,
  aiModel: string,
): Promise<LlmVisibilityResult> {
  const prompt = `Você é um especialista em ${niche}. Um cliente pergunta: "Quais são as melhores empresas/soluções de ${niche} no Brasil? Me recomende as top 5 com uma breve justificativa para cada." Responda de forma natural e objetiva.`;

  let fullResponse = "";

  try {
    if (aiProvider === "google_gemini") {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${aiApiKey}`;
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
        }),
      });
      const data = await resp.json();
      fullResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } else if (aiProvider === "anthropic_claude") {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": aiApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: aiModel,
          max_tokens: 1024,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await resp.json();
      fullResponse = data?.content?.[0]?.text || "";
    }
  } catch (err: any) {
    console.error(`[seo-intelligence] LLM error (${aiProvider}):`, err?.message);
    fullResponse = "";
  }

  const lowerResponse = fullResponse.toLowerCase();
  const mentioned = lowerResponse.includes(brandName.toLowerCase());
  const competitorsMentioned = competitors.filter(c =>
    lowerResponse.includes(c.toLowerCase().replace(/^www\./, "").split(".")[0])
  );

  // Extract context around brand mention
  let mentionContext: string | null = null;
  if (mentioned) {
    const idx = lowerResponse.indexOf(brandName.toLowerCase());
    const start = Math.max(0, idx - 80);
    const end = Math.min(fullResponse.length, idx + brandName.length + 120);
    mentionContext = fullResponse.slice(start, end).trim();
  }

  return {
    provider: aiProvider,
    model: aiModel,
    query: prompt.slice(0, 200),
    mentioned,
    mentionContext,
    competitorsMentioned,
    fullResponse: fullResponse.slice(0, 2000),
  };
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { url, competitorUrls, brandName, niche, aiKeys } = body;
    // aiKeys: [{ provider, apiKey, model }]

    if (!url) {
      return new Response(
        JSON.stringify({ error: "Missing required field: url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[seo-intelligence] Analyzing: ${url}`);

    // 1. Fetch main site HTML
    let html = "";
    try {
      const resp = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; IntentiaBot/1.0)",
          "Accept": "text/html",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
      });
      if (resp.ok) html = await resp.text();
    } catch (err: any) {
      console.warn(`[seo-intelligence] Failed to fetch ${url}:`, err?.message);
    }

    // 2. Backlinks & Authority
    let backlinks: BacklinkAnalysis | null = null;
    if (html) {
      backlinks = await analyzeBacklinks(url, html);
      console.log(`[seo-intelligence] Backlinks: ${backlinks.externalLinkCount} external, ${backlinks.uniqueReferringDomains.length} domains`);
    }

    // 3. Competitor monitoring (parallel)
    const competitors: CompetitorMetrics[] = [];
    if (competitorUrls && Array.isArray(competitorUrls) && competitorUrls.length > 0) {
      const competitorPromises = competitorUrls.slice(0, 5).map((cu: string) => analyzeCompetitor(cu));
      const results = await Promise.allSettled(competitorPromises);
      for (const r of results) {
        if (r.status === "fulfilled") competitors.push(r.value);
      }
      console.log(`[seo-intelligence] Competitors analyzed: ${competitors.length}`);
    }

    // 4. LLM Visibility (if AI keys provided)
    const llmResults: LlmVisibilityResult[] = [];
    const llmErrors: string[] = [];
    console.log(`[seo-intelligence] aiKeys received: ${JSON.stringify(aiKeys?.map((k: any) => ({ provider: k?.provider, model: k?.model, hasKey: !!k?.apiKey })))}`);
    console.log(`[seo-intelligence] brandName=${brandName}, niche=${niche}`);
    if (aiKeys && Array.isArray(aiKeys) && aiKeys.length > 0 && brandName && niche) {
      const competitorDomains = (competitorUrls || []).map((cu: string) => {
        try { return new URL(cu).hostname; } catch { return cu; }
      });

      for (const key of aiKeys.slice(0, 2)) {
        if (!key.provider || !key.apiKey || !key.model) {
          console.warn(`[seo-intelligence] Skipping invalid key:`, JSON.stringify({ provider: key?.provider, model: key?.model, hasKey: !!key?.apiKey }));
          llmErrors.push(`Key inválida: ${key?.provider || 'sem provider'}`);
          continue;
        }
        try {
          console.log(`[seo-intelligence] Calling LLM: ${key.provider}/${key.model}`);
          const result = await checkLlmVisibility(
            brandName, niche, competitorDomains, key.provider, key.apiKey, key.model
          );
          llmResults.push(result);
          console.log(`[seo-intelligence] LLM ${key.provider}/${key.model}: mentioned=${result.mentioned}, responseLen=${result.fullResponse?.length}`);
        } catch (err: any) {
          const errMsg = `${key.provider}/${key.model}: ${err?.message || 'Erro desconhecido'}`;
          console.error(`[seo-intelligence] LLM check failed:`, errMsg);
          llmErrors.push(errMsg);
        }
      }
    } else {
      console.warn(`[seo-intelligence] LLM skipped: aiKeys=${aiKeys?.length || 0}, brandName=${!!brandName}, niche=${!!niche}`);
      if (!aiKeys || !Array.isArray(aiKeys) || aiKeys.length === 0) llmErrors.push('Nenhuma API key fornecida');
      if (!brandName) llmErrors.push('Nome da marca não informado');
      if (!niche) llmErrors.push('Nicho não informado');
    }

    return new Response(
      JSON.stringify({ backlinks, competitors, llmResults, llmErrors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[seo-intelligence] Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
