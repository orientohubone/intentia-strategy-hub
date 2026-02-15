// =====================================================
// PageSpeed Insights API v5 — Core Web Vitals & SEO
// Docs: https://developers.google.com/speed/docs/insights/v5/get-started
// Calls via Supabase Edge Function (pagespeed) with server-side API key
// =====================================================

import { supabase } from "@/integrations/supabase/client";

export interface CoreWebVitals {
  lcp: MetricResult; // Largest Contentful Paint
  inp: MetricResult; // Interaction to Next Paint
  cls: MetricResult; // Cumulative Layout Shift
  fcp: MetricResult; // First Contentful Paint
  ttfb: MetricResult; // Time to First Byte
}

export interface MetricResult {
  value: string;
  numericValue: number;
  score: number; // 0-1
  category: "FAST" | "AVERAGE" | "SLOW" | "NONE";
}

export interface LighthouseCategory {
  id: string;
  title: string;
  score: number; // 0-1
}

export interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  scoreDisplayMode: string;
  displayValue?: string;
  numericValue?: number;
  details?: any;
}

export interface SeoAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
}

export interface PageSpeedResult {
  url: string;
  fetchTime: string;
  strategy: "mobile" | "desktop";
  // Category scores (0-100)
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  // Core Web Vitals
  coreWebVitals: CoreWebVitals;
  // Key audits
  performanceAudits: LighthouseAudit[];
  seoAudits: SeoAudit[];
  accessibilityAudits: SeoAudit[];
  // Opportunities
  opportunities: LighthouseAudit[];
  // Diagnostics
  diagnostics: LighthouseAudit[];
  // Screenshot
  screenshotUrl?: string;
  // Raw categories
  categories: Record<string, LighthouseCategory>;
}

// =====================================================
// FETCH PageSpeed Insights via Supabase Edge Function
// =====================================================

export async function fetchPageSpeedInsights(
  url: string,
  strategy: "mobile" | "desktop" = "mobile"
): Promise<PageSpeedResult> {
  // Get current session token for auth
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error("Usuário não autenticado. Faça login novamente.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/pagespeed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": anonKey,
    },
    body: JSON.stringify({ url, strategy }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = data?.error || `Edge Function retornou HTTP ${response.status}`;
    throw new Error(msg);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return parsePageSpeedResponse(data, strategy);
}

// =====================================================
// PARSE RESPONSE
// =====================================================

function parsePageSpeedResponse(json: any, strategy: "mobile" | "desktop"): PageSpeedResult {
  const lighthouse = json.lighthouseResult;
  const audits = lighthouse?.audits || {};
  const categories = lighthouse?.categories || {};

  // Category scores
  const performanceScore = Math.round((categories.performance?.score || 0) * 100);
  const seoScore = Math.round((categories.seo?.score || 0) * 100);
  const accessibilityScore = Math.round((categories.accessibility?.score || 0) * 100);
  const bestPracticesScore = Math.round((categories["best-practices"]?.score || 0) * 100);

  // Core Web Vitals
  const coreWebVitals: CoreWebVitals = {
    lcp: parseMetric(audits["largest-contentful-paint"]),
    inp: parseMetric(audits["interaction-to-next-paint"] || audits["total-blocking-time"]),
    cls: parseMetric(audits["cumulative-layout-shift"]),
    fcp: parseMetric(audits["first-contentful-paint"]),
    ttfb: parseMetric(audits["server-response-time"]),
  };

  // Performance audits (key metrics)
  const perfAuditKeys = [
    "first-contentful-paint",
    "largest-contentful-paint",
    "total-blocking-time",
    "cumulative-layout-shift",
    "speed-index",
    "interactive",
    "server-response-time",
    "max-potential-fid",
  ];
  const performanceAudits = perfAuditKeys
    .map((key) => audits[key])
    .filter(Boolean)
    .map(parseAudit);

  // SEO audits
  const seoAuditRefs = categories.seo?.auditRefs || [];
  const seoAuditIds = new Set<string>();
  const seoAudits: SeoAudit[] = seoAuditRefs
    .map((ref: any) => audits[ref.id])
    .filter(Boolean)
    .map((a: any) => {
      seoAuditIds.add(a.id);
      return {
        id: a.id,
        title: a.title,
        description: stripMarkdownLinks(a.description || ""),
        score: a.score,
        displayValue: a.displayValue,
      };
    });

  // Accessibility audits — exclude any that already appear in SEO tab
  const a11yAuditRefs = categories.accessibility?.auditRefs || [];
  const accessibilityAudits: SeoAudit[] = a11yAuditRefs
    .map((ref: any) => audits[ref.id])
    .filter(Boolean)
    .filter((a: any) => a.score !== null && a.score < 1 && !seoAuditIds.has(a.id))
    .map((a: any) => ({
      id: a.id,
      title: a.title,
      description: stripMarkdownLinks(a.description || ""),
      score: a.score,
      displayValue: a.displayValue,
    }));

  // Opportunities (performance improvements) — exclude perf audit keys to avoid duplication with Core Web Vitals
  const opportunities: LighthouseAudit[] = Object.values(audits)
    .filter((a: any) =>
      a.details?.type === "opportunity" &&
      a.details?.overallSavingsMs > 0 &&
      !perfAuditKeys.includes(a.id) &&
      !seoAuditIds.has(a.id)
    )
    .sort((a: any, b: any) => (b.details?.overallSavingsMs || 0) - (a.details?.overallSavingsMs || 0))
    .slice(0, 10)
    .map(parseAudit);

  // Diagnostics
  const diagnostics: LighthouseAudit[] = Object.values(audits)
    .filter((a: any) => a.details?.type === "table" && a.score !== null && a.score < 1 && !perfAuditKeys.includes(a.id) && !seoAuditIds.has(a.id))
    .slice(0, 10)
    .map(parseAudit);

  // Screenshot
  const screenshotUrl = audits["final-screenshot"]?.details?.data;

  return {
    url: json.id || lighthouse?.requestedUrl || "",
    fetchTime: lighthouse?.fetchTime || new Date().toISOString(),
    strategy,
    performanceScore,
    seoScore,
    accessibilityScore,
    bestPracticesScore,
    coreWebVitals,
    performanceAudits,
    seoAudits,
    accessibilityAudits,
    opportunities,
    diagnostics,
    screenshotUrl,
    categories: Object.fromEntries(
      Object.entries(categories).map(([k, v]: [string, any]) => [
        k,
        { id: v.id, title: v.title, score: Math.round((v.score || 0) * 100) },
      ])
    ),
  };
}

function parseMetric(audit: any): MetricResult {
  if (!audit) {
    return { value: "N/A", numericValue: 0, score: 0, category: "NONE" };
  }
  const score = audit.score ?? 0;
  let category: MetricResult["category"] = "NONE";
  if (score >= 0.9) category = "FAST";
  else if (score >= 0.5) category = "AVERAGE";
  else if (score !== null) category = "SLOW";

  return {
    value: audit.displayValue || "N/A",
    numericValue: audit.numericValue || 0,
    score,
    category,
  };
}

function parseAudit(audit: any): LighthouseAudit {
  return {
    id: audit.id,
    title: audit.title,
    description: stripMarkdownLinks(audit.description || ""),
    score: audit.score,
    scoreDisplayMode: audit.scoreDisplayMode || "numeric",
    displayValue: audit.displayValue,
    numericValue: audit.numericValue,
    details: audit.details,
  };
}

function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

// =====================================================
// HELPERS
// =====================================================

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 90) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export function getScoreRingColor(score: number): string {
  if (score >= 90) return "stroke-green-500";
  if (score >= 50) return "stroke-yellow-500";
  return "stroke-red-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Bom";
  if (score >= 50) return "Precisa melhorar";
  return "Ruim";
}

export function getMetricCategoryColor(category: MetricResult["category"]): string {
  switch (category) {
    case "FAST": return "text-green-600 dark:text-green-400";
    case "AVERAGE": return "text-yellow-600 dark:text-yellow-400";
    case "SLOW": return "text-red-500";
    default: return "text-muted-foreground";
  }
}

export function getMetricCategoryBg(category: MetricResult["category"]): string {
  switch (category) {
    case "FAST": return "bg-green-500/10 border-green-500/30";
    case "AVERAGE": return "bg-yellow-500/10 border-yellow-500/30";
    case "SLOW": return "bg-red-500/10 border-red-500/30";
    default: return "bg-muted";
  }
}

export function getMetricCategoryLabel(category: MetricResult["category"]): string {
  switch (category) {
    case "FAST": return "Bom";
    case "AVERAGE": return "Precisa melhorar";
    case "SLOW": return "Ruim";
    default: return "Sem dados";
  }
}
