import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// TYPES
// =====================================================

interface UrlAnalysis {
  meta: MetaAnalysis;
  content: ContentAnalysis;
  technical: TechnicalAnalysis;
  scores: ScoreAnalysis;
  channelScores: ChannelScoreAnalysis[];
  insights: InsightAnalysis[];
  overallScore: number;
  htmlSnapshot: string;
  structuredData: StructuredDataResult;
}

interface StructuredDataResult {
  jsonLd: any[];
  microdata: MicrodataItem[];
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
}

interface MicrodataItem {
  type: string;
  properties: Record<string, string>;
}

interface MetaAnalysis {
  title: string | null;
  description: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonical: string | null;
  favicon: string | null;
  language: string | null;
  hasRobotsMeta: boolean;
}

interface ContentAnalysis {
  h1: string[];
  h2: string[];
  h3: string[];
  headingHierarchyValid: boolean;
  ctaCount: number;
  ctaTexts: string[];
  formCount: number;
  imageCount: number;
  imagesWithAlt: number;
  wordCount: number;
  paragraphCount: number;
  linkCount: number;
  externalLinkCount: number;
  hasVideo: boolean;
  hasSocialProof: boolean;
  hasTestimonials: boolean;
  hasPricing: boolean;
  hasFAQ: boolean;
}

interface TechnicalAnalysis {
  hasHttps: boolean;
  hasViewport: boolean;
  hasCharset: boolean;
  hasStructuredData: boolean;
  loadTimeEstimate: string;
  hasAnalytics: boolean;
  hasPixel: boolean;
}

interface ScoreAnalysis {
  valueProposition: number;    // Proposta de valor (0-100)
  offerClarity: number;        // Clareza da oferta (0-100)
  userJourney: number;         // Jornada do usuário (0-100)
  seoReadiness: number;        // Prontidão SEO (0-100)
  conversionOptimization: number; // Otimização de conversão (0-100)
  contentQuality: number;      // Qualidade do conteúdo (0-100)
}

interface ChannelScoreAnalysis {
  channel: "google" | "meta" | "linkedin" | "tiktok";
  score: number;
  objective: string;
  funnel_role: string;
  is_recommended: boolean;
  risks: string[];
}

interface InsightAnalysis {
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action: string;
}

// =====================================================
// STRUCTURED DATA EXTRACTION
// =====================================================

function extractJsonLd(html: string): any[] {
  const results: any[] = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      // Handle @graph arrays
      if (Array.isArray(parsed)) {
        results.push(...parsed);
      } else if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
        results.push(...parsed["@graph"]);
      } else {
        results.push(parsed);
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  }
  return results;
}

function extractMicrodata(html: string): MicrodataItem[] {
  const items: MicrodataItem[] = [];
  const itemRegex = /<[^>]*itemscope[^>]*itemtype=["']([^"']*)["'][^>]*>(.*?)<\/(?:div|section|article|span|li|tr)>/gis;
  let match;
  while ((match = itemRegex.exec(html)) !== null) {
    const type = match[1];
    const block = match[2];
    const properties: Record<string, string> = {};
    const propRegex = /itemprop=["']([^"']*)["'][^>]*(?:content=["']([^"']*)["']|>([^<]*))/gi;
    let propMatch;
    while ((propMatch = propRegex.exec(block)) !== null) {
      const key = propMatch[1];
      const value = (propMatch[2] || propMatch[3] || "").trim();
      if (key && value) properties[key] = value;
    }
    if (Object.keys(properties).length > 0) {
      items.push({ type, properties });
    }
  }
  return items.slice(0, 20);
}

function extractOpenGraph(html: string): Record<string, string> {
  const og: Record<string, string> = {};
  const regex = /<meta[^>]*(?:property|name)=["'](og:[^"']*)["'][^>]*content=["']([^"']*)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    og[match[1]] = match[2];
  }
  // Also try reversed order (content before property)
  const regex2 = /<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["'](og:[^"']*)["']/gi;
  while ((match = regex2.exec(html)) !== null) {
    if (!og[match[2]]) og[match[2]] = match[1];
  }
  return og;
}

function extractTwitterCard(html: string): Record<string, string> {
  const tc: Record<string, string> = {};
  const regex = /<meta[^>]*(?:property|name)=["'](twitter:[^"']*)["'][^>]*content=["']([^"']*)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    tc[match[1]] = match[2];
  }
  const regex2 = /<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["'](twitter:[^"']*)["']/gi;
  while ((match = regex2.exec(html)) !== null) {
    if (!tc[match[2]]) tc[match[2]] = match[1];
  }
  return tc;
}

function extractStructuredData(html: string): StructuredDataResult {
  return {
    jsonLd: extractJsonLd(html),
    microdata: extractMicrodata(html),
    openGraph: extractOpenGraph(html),
    twitterCard: extractTwitterCard(html),
  };
}

// =====================================================
// HTML SNAPSHOT (cleaned)
// =====================================================

function cleanHtmlForSnapshot(html: string): string {
  let cleaned = html;
  // Remove inline scripts
  cleaned = cleaned.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  // Remove inline styles
  cleaned = cleaned.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  // Remove SVG blocks (usually large and not useful for analysis)
  cleaned = cleaned.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, "");
  // Remove noscript
  cleaned = cleaned.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");
  // Collapse whitespace
  cleaned = cleaned.replace(/\s{2,}/g, " ");
  // Trim
  cleaned = cleaned.trim();
  // Limit to 500KB to avoid DB bloat
  if (cleaned.length > 500000) {
    cleaned = cleaned.substring(0, 500000) + "\n<!-- TRUNCATED AT 500KB -->";
  }
  return cleaned;
}

// =====================================================
// HTML PARSER (lightweight, no dependencies)
// =====================================================

function extractTag(html: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, "gis");
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1].replace(/<[^>]*>/g, "").trim());
  }
  return matches;
}

function extractMetaContent(html: string, nameOrProperty: string): string | null {
  // Try name attribute
  let regex = new RegExp(
    `<meta[^>]*(?:name|property)=["']${nameOrProperty}["'][^>]*content=["']([^"']*)["']`,
    "i"
  );
  let match = regex.exec(html);
  if (match) return match[1];

  // Try reversed order (content before name)
  regex = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProperty}["']`,
    "i"
  );
  match = regex.exec(html);
  return match ? match[1] : null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
  return match ? match[1].trim() : null;
}

function countPattern(html: string, pattern: RegExp): number {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

function extractCTAs(html: string): string[] {
  const ctas: string[] = [];
  
  // Buttons
  const buttonRegex = /<button[^>]*>(.*?)<\/button>/gis;
  let match;
  while ((match = buttonRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    if (text.length > 0 && text.length < 100) ctas.push(text);
  }

  // Links with CTA-like classes or text
  const ctaKeywords = /comprar|assinar|começar|iniciar|testar|agendar|solicitar|contato|demo|trial|free|grátis|cadastr|registr|sign.?up|get.?started|buy|start|try/i;
  const linkRegex = /<a[^>]*>(.*?)<\/a>/gis;
  while ((match = linkRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]*>/g, "").trim();
    if (text.length > 0 && text.length < 100 && ctaKeywords.test(text)) {
      ctas.push(text);
    }
  }

  // Input submit buttons
  const submitRegex = /<input[^>]*type=["']submit["'][^>]*value=["']([^"']*)["']/gi;
  while ((match = submitRegex.exec(html)) !== null) {
    if (match[1].trim()) ctas.push(match[1].trim());
  }

  return [...new Set(ctas)].slice(0, 20);
}

function checkSocialProof(html: string): boolean {
  const keywords = /depoiment|testimonial|review|avalia[çc][ãa]o|cliente.{0,20}diz|case.?study|cases?.?de?.?sucesso|parceiro|partner|trust|confian/i;
  return keywords.test(html);
}

function checkTestimonials(html: string): boolean {
  const keywords = /depoiment|testimonial|"[^"]{20,200}"\s*[-–—]\s*[A-Z]/i;
  return keywords.test(html);
}

function checkPricing(html: string): boolean {
  const keywords = /pre[çc]o|pricing|plano|plan|R\$|USD|\$\d|\/m[eê]s|\/month|grátis|free.?tier/i;
  return keywords.test(html);
}

function checkFAQ(html: string): boolean {
  const keywords = /faq|perguntas?.?frequentes|frequently.?asked|d[uú]vidas/i;
  return keywords.test(html);
}

// =====================================================
// ANALYSIS ENGINE
// =====================================================

function analyzeHTML(html: string, url: string): UrlAnalysis {
  const lowerHtml = html.toLowerCase();

  // --- META ANALYSIS ---
  const meta: MetaAnalysis = {
    title: extractTitle(html),
    description: extractMetaContent(html, "description"),
    ogTitle: extractMetaContent(html, "og:title"),
    ogDescription: extractMetaContent(html, "og:description"),
    ogImage: extractMetaContent(html, "og:image"),
    canonical: (() => {
      const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
      return m ? m[1] : null;
    })(),
    favicon: (() => {
      const m = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i);
      return m ? m[1] : null;
    })(),
    language: (() => {
      const m = html.match(/<html[^>]*lang=["']([^"']*)["']/i);
      return m ? m[1] : null;
    })(),
    hasRobotsMeta: /meta[^>]*name=["']robots["']/i.test(html),
  };

  // --- CONTENT ANALYSIS ---
  const h1s = extractTag(html, "h1");
  const h2s = extractTag(html, "h2");
  const h3s = extractTag(html, "h3");
  const ctaTexts = extractCTAs(html);
  const bodyText = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = bodyText.split(/\s+/).filter(w => w.length > 1);

  const content: ContentAnalysis = {
    h1: h1s.slice(0, 5),
    h2: h2s.slice(0, 15),
    h3: h3s.slice(0, 15),
    headingHierarchyValid: h1s.length === 1 && h2s.length > 0,
    ctaCount: ctaTexts.length,
    ctaTexts,
    formCount: countPattern(html, /<form/gi),
    imageCount: countPattern(html, /<img/gi),
    imagesWithAlt: countPattern(html, /<img[^>]*alt=["'][^"']+["']/gi),
    wordCount: words.length,
    paragraphCount: countPattern(html, /<p[\s>]/gi),
    linkCount: countPattern(html, /<a[\s]/gi),
    externalLinkCount: countPattern(html, /<a[^>]*href=["']https?:\/\/(?!.*?(?:localhost))/gi),
    hasVideo: /<video|youtube|vimeo|wistia|loom/i.test(html),
    hasSocialProof: checkSocialProof(html),
    hasTestimonials: checkTestimonials(html),
    hasPricing: checkPricing(html),
    hasFAQ: checkFAQ(html),
  };

  // --- TECHNICAL ANALYSIS ---
  const technical: TechnicalAnalysis = {
    hasHttps: url.startsWith("https"),
    hasViewport: /meta[^>]*name=["']viewport["']/i.test(html),
    hasCharset: /charset/i.test(html),
    hasStructuredData: /application\/ld\+json|itemtype|itemscope/i.test(html),
    loadTimeEstimate: html.length > 500000 ? "Lento (página pesada)" : html.length > 200000 ? "Moderado" : "Rápido",
    hasAnalytics: /google-analytics|gtag|ga\(|analytics\.js|googletagmanager/i.test(html),
    hasPixel: /fbq\(|facebook.*pixel|meta.*pixel|linkedin.*insight|tiktok.*pixel/i.test(html),
  };

  // --- SCORING ---
  const scores = calculateScores(meta, content, technical, url);
  const overallScore = Math.round(
    (scores.valueProposition * 0.25) +
    (scores.offerClarity * 0.20) +
    (scores.userJourney * 0.20) +
    (scores.seoReadiness * 0.15) +
    (scores.conversionOptimization * 0.10) +
    (scores.contentQuality * 0.10)
  );

  // --- CHANNEL SCORES ---
  const channelScores = calculateChannelScores(scores, content, technical, meta);

  // --- INSIGHTS ---
  const insights = generateInsights(meta, content, technical, scores, channelScores);

  // --- STRUCTURED DATA ---
  const structuredData = extractStructuredData(html);

  // --- HTML SNAPSHOT (cleaned) ---
  const htmlSnapshot = cleanHtmlForSnapshot(html);

  return { meta, content, technical, scores, channelScores, insights, overallScore, htmlSnapshot, structuredData };
}

// =====================================================
// SCORING ALGORITHMS
// =====================================================

function calculateScores(
  meta: MetaAnalysis,
  content: ContentAnalysis,
  technical: TechnicalAnalysis,
  url: string
): ScoreAnalysis {

  // --- PROPOSTA DE VALOR (0-100) ---
  let valueProposition = 30; // base
  if (meta.title && meta.title.length > 10) valueProposition += 10;
  if (meta.title && meta.title.length > 30 && meta.title.length < 70) valueProposition += 5;
  if (meta.description && meta.description.length > 50) valueProposition += 10;
  if (meta.description && meta.description.length > 100 && meta.description.length < 160) valueProposition += 5;
  if (content.h1.length === 1) valueProposition += 10;
  if (content.h1.length === 1 && content.h1[0].length > 15) valueProposition += 5;
  if (content.h2.length >= 2) valueProposition += 5;
  if (meta.ogTitle) valueProposition += 5;
  if (meta.ogDescription) valueProposition += 5;
  if (meta.ogImage) valueProposition += 5;
  if (content.hasSocialProof) valueProposition += 5;
  valueProposition = Math.min(100, valueProposition);

  // --- CLAREZA DA OFERTA (0-100) ---
  let offerClarity = 25;
  if (content.h1.length === 1) offerClarity += 15;
  if (content.headingHierarchyValid) offerClarity += 10;
  if (content.h2.length >= 3) offerClarity += 5;
  if (content.ctaCount >= 1) offerClarity += 10;
  if (content.ctaCount >= 3) offerClarity += 5;
  if (content.hasPricing) offerClarity += 10;
  if (content.paragraphCount >= 3) offerClarity += 5;
  if (content.wordCount > 200 && content.wordCount < 3000) offerClarity += 10;
  if (content.wordCount > 3000) offerClarity += 5;
  if (content.hasFAQ) offerClarity += 5;
  offerClarity = Math.min(100, offerClarity);

  // --- JORNADA DO USUÁRIO (0-100) ---
  let userJourney = 20;
  if (content.ctaCount >= 1) userJourney += 15;
  if (content.ctaCount >= 2) userJourney += 5;
  if (content.formCount >= 1) userJourney += 15;
  if (content.linkCount >= 5) userJourney += 5;
  if (content.hasVideo) userJourney += 10;
  if (content.hasSocialProof) userJourney += 10;
  if (content.hasTestimonials) userJourney += 10;
  if (content.hasFAQ) userJourney += 5;
  if (content.hasPricing) userJourney += 5;
  userJourney = Math.min(100, userJourney);

  // --- SEO READINESS (0-100) ---
  let seoReadiness = 15;
  if (technical.hasHttps) seoReadiness += 15;
  if (technical.hasViewport) seoReadiness += 10;
  if (technical.hasCharset) seoReadiness += 5;
  if (meta.title) seoReadiness += 10;
  if (meta.description) seoReadiness += 10;
  if (meta.canonical) seoReadiness += 5;
  if (content.headingHierarchyValid) seoReadiness += 10;
  if (content.imagesWithAlt > 0 && content.imageCount > 0) {
    seoReadiness += Math.round((content.imagesWithAlt / content.imageCount) * 10);
  }
  if (technical.hasStructuredData) seoReadiness += 10;
  if (meta.hasRobotsMeta) seoReadiness += 5;
  seoReadiness = Math.min(100, seoReadiness);

  // --- CONVERSÃO (0-100) ---
  let conversionOptimization = 15;
  if (content.ctaCount >= 1) conversionOptimization += 15;
  if (content.ctaCount >= 3) conversionOptimization += 10;
  if (content.formCount >= 1) conversionOptimization += 15;
  if (content.hasSocialProof) conversionOptimization += 10;
  if (content.hasTestimonials) conversionOptimization += 10;
  if (content.hasPricing) conversionOptimization += 10;
  if (technical.hasAnalytics) conversionOptimization += 10;
  if (technical.hasPixel) conversionOptimization += 5;
  conversionOptimization = Math.min(100, conversionOptimization);

  // --- QUALIDADE DO CONTEÚDO (0-100) ---
  let contentQuality = 20;
  if (content.wordCount > 300) contentQuality += 10;
  if (content.wordCount > 800) contentQuality += 10;
  if (content.paragraphCount >= 5) contentQuality += 10;
  if (content.h2.length >= 3) contentQuality += 10;
  if (content.imageCount >= 2) contentQuality += 10;
  if (content.hasVideo) contentQuality += 10;
  if (content.hasFAQ) contentQuality += 5;
  if (meta.language) contentQuality += 5;
  if (content.externalLinkCount >= 1) contentQuality += 5;
  contentQuality = Math.min(100, contentQuality);

  return {
    valueProposition,
    offerClarity,
    userJourney,
    seoReadiness,
    conversionOptimization,
    contentQuality,
  };
}

// =====================================================
// CHANNEL SCORING
// =====================================================

function calculateChannelScores(
  scores: ScoreAnalysis,
  content: ContentAnalysis,
  technical: TechnicalAnalysis,
  meta: MetaAnalysis
): ChannelScoreAnalysis[] {

  // --- GOOGLE ADS ---
  const googleBase = Math.round(
    (scores.seoReadiness * 0.30) +
    (scores.offerClarity * 0.25) +
    (scores.conversionOptimization * 0.25) +
    (scores.userJourney * 0.20)
  );
  const googleRisks: string[] = [];
  if (!technical.hasHttps) googleRisks.push("Site sem HTTPS reduz Quality Score");
  if (!meta.description) googleRisks.push("Sem meta description para anúncios de busca");
  if (content.ctaCount === 0) googleRisks.push("Sem CTAs claros para conversão pós-clique");
  if (!technical.hasAnalytics) googleRisks.push("Sem Google Analytics para tracking de conversões");
  if (content.formCount === 0) googleRisks.push("Sem formulários para captura de leads");

  // --- META ADS ---
  const metaBase = Math.round(
    (scores.valueProposition * 0.30) +
    (scores.contentQuality * 0.25) +
    (scores.conversionOptimization * 0.25) +
    (scores.userJourney * 0.20)
  );
  const metaRisks: string[] = [];
  if (!meta.ogImage) metaRisks.push("Sem OG Image para preview em anúncios");
  if (!meta.ogTitle) metaRisks.push("Sem OG Title otimizado para social");
  if (!content.hasVideo) metaRisks.push("Sem vídeo — conteúdo visual performa melhor no Meta");
  if (!technical.hasPixel) metaRisks.push("Sem Meta Pixel para retargeting e otimização");
  if (!content.hasSocialProof) metaRisks.push("Sem prova social visível na landing page");

  // --- LINKEDIN ADS ---
  const linkedinBase = Math.round(
    (scores.valueProposition * 0.35) +
    (scores.offerClarity * 0.25) +
    (scores.contentQuality * 0.25) +
    (scores.conversionOptimization * 0.15)
  );
  const linkedinRisks: string[] = [];
  if (content.wordCount < 200) linkedinRisks.push("Conteúdo muito curto para público B2B exigente");
  if (!content.hasSocialProof) linkedinRisks.push("Sem cases ou prova social para decisores B2B");
  if (!content.hasPricing) linkedinRisks.push("Sem transparência de preços — decisores B2B valorizam isso");
  if (content.ctaCount === 0) linkedinRisks.push("Sem CTAs para captura de leads qualificados");
  if (!content.hasTestimonials) linkedinRisks.push("Sem depoimentos de clientes corporativos");

  // --- TIKTOK ADS ---
  const tiktokBase = Math.round(
    (scores.contentQuality * 0.30) +
    (scores.valueProposition * 0.25) +
    (scores.userJourney * 0.25) +
    (scores.conversionOptimization * 0.20)
  );
  const tiktokRisks: string[] = [];
  if (!content.hasVideo) tiktokRisks.push("Sem vídeo — essencial para TikTok Ads");
  if (!technical.hasViewport) tiktokRisks.push("Site não otimizado para mobile (público TikTok é mobile-first)");
  if (content.wordCount > 2000) tiktokRisks.push("Conteúdo muito denso para público TikTok — prefira visual");
  if (!meta.ogImage) tiktokRisks.push("Sem imagem OG para compartilhamento social");

  return [
    {
      channel: "google",
      score: Math.min(100, googleBase),
      objective: "Captura de demanda ativa via busca",
      funnel_role: "Fundo de funil — intenção de compra",
      is_recommended: googleBase >= 50,
      risks: googleRisks,
    },
    {
      channel: "meta",
      score: Math.min(100, metaBase),
      objective: "Geração de demanda e awareness",
      funnel_role: "Topo e meio de funil — descoberta",
      is_recommended: metaBase >= 50,
      risks: metaRisks,
    },
    {
      channel: "linkedin",
      score: Math.min(100, linkedinBase),
      objective: "Alcance de decisores B2B",
      funnel_role: "Meio de funil — consideração B2B",
      is_recommended: linkedinBase >= 50,
      risks: linkedinRisks,
    },
    {
      channel: "tiktok",
      score: Math.min(100, tiktokBase),
      objective: "Awareness e engajamento visual",
      funnel_role: "Topo de funil — descoberta criativa",
      is_recommended: tiktokBase >= 40,
      risks: tiktokRisks,
    },
  ];
}

// =====================================================
// INSIGHT GENERATION
// =====================================================

function generateInsights(
  meta: MetaAnalysis,
  content: ContentAnalysis,
  technical: TechnicalAnalysis,
  scores: ScoreAnalysis,
  channelScores: ChannelScoreAnalysis[]
): InsightAnalysis[] {
  const insights: InsightAnalysis[] = [];

  // --- WARNINGS ---
  if (!technical.hasHttps) {
    insights.push({
      type: "warning",
      title: "Site sem HTTPS",
      description: "Seu site não usa HTTPS. Isso afeta a segurança, SEO e a confiança dos visitantes. Navegadores modernos marcam sites HTTP como 'não seguros'.",
      action: "Instale um certificado SSL/TLS no seu servidor",
    });
  }

  if (content.h1.length === 0) {
    insights.push({
      type: "warning",
      title: "Sem título principal (H1)",
      description: "A página não possui um H1 claro. O H1 é essencial para comunicar a proposta de valor e para SEO.",
      action: "Adicione um H1 claro e descritivo na página principal",
    });
  }

  if (content.h1.length > 1) {
    insights.push({
      type: "warning",
      title: "Múltiplos H1 detectados",
      description: `Foram encontrados ${content.h1.length} H1s na página. O ideal é ter apenas um H1 principal para clareza e SEO.`,
      action: "Mantenha apenas um H1 e converta os demais em H2",
    });
  }

  if (!meta.description) {
    insights.push({
      type: "warning",
      title: "Meta description ausente",
      description: "A meta description é usada por mecanismos de busca e redes sociais para descrever sua página. Sem ela, o Google gera um snippet automático que pode não representar bem seu negócio.",
      action: "Adicione uma meta description de 120-160 caracteres com sua proposta de valor",
    });
  }

  if (content.ctaCount === 0) {
    insights.push({
      type: "warning",
      title: "Nenhum CTA identificado",
      description: "Não foram encontrados botões ou links de ação claros. Sem CTAs, visitantes não sabem qual próximo passo tomar.",
      action: "Adicione CTAs visíveis como 'Começar Grátis', 'Agendar Demo' ou 'Falar com Vendas'",
    });
  }

  if (content.formCount === 0 && content.ctaCount < 2) {
    insights.push({
      type: "warning",
      title: "Sem mecanismo de captura de leads",
      description: "A página não possui formulários nem CTAs suficientes para converter visitantes em leads.",
      action: "Adicione um formulário de contato ou captura de email",
    });
  }

  if (!technical.hasViewport) {
    insights.push({
      type: "warning",
      title: "Site não otimizado para mobile",
      description: "Não foi detectada a meta tag viewport. Mais de 60% do tráfego web é mobile — seu site pode estar ilegível em smartphones.",
      action: "Adicione <meta name='viewport' content='width=device-width, initial-scale=1'>",
    });
  }

  // --- OPPORTUNITIES ---
  if (!content.hasVideo) {
    insights.push({
      type: "opportunity",
      title: "Adicionar vídeo explicativo",
      description: "Páginas com vídeo têm até 80% mais conversão. Nenhum vídeo foi detectado na sua página.",
      action: "Crie um vídeo curto (60-90s) explicando sua proposta de valor",
    });
  }

  if (!content.hasSocialProof) {
    insights.push({
      type: "opportunity",
      title: "Adicionar prova social",
      description: "Não foram encontrados elementos de prova social (depoimentos, logos de clientes, cases). Prova social aumenta significativamente a confiança e conversão.",
      action: "Adicione logos de clientes, depoimentos ou números de resultados",
    });
  }

  if (!content.hasFAQ) {
    insights.push({
      type: "opportunity",
      title: "Adicionar seção de FAQ",
      description: "Uma seção de perguntas frequentes ajuda a eliminar objeções e melhora o SEO com rich snippets.",
      action: "Crie uma FAQ com as 5-10 perguntas mais comuns dos seus clientes",
    });
  }

  if (!meta.ogImage) {
    insights.push({
      type: "opportunity",
      title: "Adicionar Open Graph Image",
      description: "Sem OG Image, links compartilhados em redes sociais ficam sem preview visual, reduzindo cliques.",
      action: "Crie uma imagem 1200x630px representando sua marca e adicione como og:image",
    });
  }

  if (!technical.hasStructuredData) {
    insights.push({
      type: "opportunity",
      title: "Implementar dados estruturados",
      description: "Dados estruturados (Schema.org) ajudam o Google a entender melhor seu conteúdo e podem gerar rich snippets nos resultados de busca.",
      action: "Adicione JSON-LD com Organization, Product ou Service schema",
    });
  }

  if (!technical.hasAnalytics && !technical.hasPixel) {
    insights.push({
      type: "opportunity",
      title: "Instalar tracking de conversões",
      description: "Sem analytics ou pixels de rastreamento, você não consegue medir o ROI de campanhas de mídia paga.",
      action: "Instale Google Analytics 4 e os pixels das plataformas que pretende anunciar",
    });
  }

  // --- IMPROVEMENTS ---
  if (scores.valueProposition < 60) {
    insights.push({
      type: "improvement",
      title: "Fortalecer proposta de valor",
      description: `Score de proposta de valor: ${scores.valueProposition}/100. A proposta de valor não está suficientemente clara ou diferenciada.`,
      action: "Reescreva o H1 e subtítulo focando no benefício principal para o cliente",
    });
  }

  if (scores.offerClarity < 60) {
    insights.push({
      type: "improvement",
      title: "Melhorar clareza da oferta",
      description: `Score de clareza: ${scores.offerClarity}/100. Visitantes podem não entender rapidamente o que você oferece.`,
      action: "Estruture a página com hierarquia clara: problema → solução → benefícios → CTA",
    });
  }

  if (scores.userJourney < 60) {
    insights.push({
      type: "improvement",
      title: "Otimizar jornada do usuário",
      description: `Score de jornada: ${scores.userJourney}/100. O caminho do visitante até a conversão pode ser melhorado.`,
      action: "Adicione CTAs progressivos, formulários e elementos de confiança ao longo da página",
    });
  }

  if (content.imageCount > 0 && content.imagesWithAlt < content.imageCount * 0.5) {
    insights.push({
      type: "improvement",
      title: "Adicionar alt text nas imagens",
      description: `Apenas ${content.imagesWithAlt} de ${content.imageCount} imagens possuem alt text. Isso afeta acessibilidade e SEO.`,
      action: "Adicione descrições alt relevantes em todas as imagens",
    });
  }

  if (meta.title && (meta.title.length < 20 || meta.title.length > 70)) {
    insights.push({
      type: "improvement",
      title: "Otimizar título da página",
      description: `O título tem ${meta.title.length} caracteres. O ideal é entre 30-60 caracteres para melhor exibição nos resultados de busca.`,
      action: "Reescreva o título com 30-60 caracteres incluindo sua palavra-chave principal",
    });
  }

  // Channel-specific insights
  const bestChannel = channelScores.reduce((a, b) => a.score > b.score ? a : b);
  const worstChannel = channelScores.reduce((a, b) => a.score < b.score ? a : b);

  insights.push({
    type: "opportunity",
    title: `Canal mais indicado: ${bestChannel.channel.charAt(0).toUpperCase() + bestChannel.channel.slice(1)} Ads`,
    description: `Com score ${bestChannel.score}/100, ${bestChannel.channel.charAt(0).toUpperCase() + bestChannel.channel.slice(1)} é o canal com maior potencial para seu negócio. ${bestChannel.objective}.`,
    action: `Priorize investimento em ${bestChannel.channel.charAt(0).toUpperCase() + bestChannel.channel.slice(1)} Ads para ${bestChannel.funnel_role.toLowerCase()}`,
  });

  if (worstChannel.score < 40) {
    insights.push({
      type: "warning",
      title: `Evitar investimento em ${worstChannel.channel.charAt(0).toUpperCase() + worstChannel.channel.slice(1)} Ads por enquanto`,
      description: `Score ${worstChannel.score}/100 indica que seu site não está preparado para ${worstChannel.channel.charAt(0).toUpperCase() + worstChannel.channel.slice(1)} Ads. Riscos: ${worstChannel.risks.slice(0, 2).join("; ")}.`,
      action: "Resolva os gaps identificados antes de investir neste canal",
    });
  }

  return insights.slice(0, 15); // Max 15 insights
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ error: "URL inválida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the URL
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let html: string;
    try {
      const response = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; IntentiaBot/1.0; +https://intentia.com.br)",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        },
        redirect: "follow",
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `Erro ao acessar URL: HTTP ${response.status}` }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      html = await response.text();
    } catch (fetchError: any) {
      clearTimeout(timeout);
      const message = fetchError.name === "AbortError"
        ? "Timeout: a página demorou mais de 15 segundos para responder"
        : `Erro ao acessar URL: ${fetchError.message}`;
      return new Response(
        JSON.stringify({ error: message }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Analyze
    const analysis = analyzeHTML(html, parsedUrl.toString());

    return new Response(
      JSON.stringify(analysis),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
