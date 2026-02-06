import { supabase } from "@/integrations/supabase/client";

// =====================================================
// TYPES (mirrors Edge Function types)
// =====================================================

export interface UrlAnalysis {
  meta: MetaAnalysis;
  content: ContentAnalysis;
  technical: TechnicalAnalysis;
  scores: ScoreAnalysis;
  channelScores: ChannelScoreResult[];
  insights: InsightResult[];
  overallScore: number;
}

export interface MetaAnalysis {
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

export interface ContentAnalysis {
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

export interface TechnicalAnalysis {
  hasHttps: boolean;
  hasViewport: boolean;
  hasCharset: boolean;
  hasStructuredData: boolean;
  loadTimeEstimate: string;
  hasAnalytics: boolean;
  hasPixel: boolean;
}

export interface ScoreAnalysis {
  valueProposition: number;
  offerClarity: number;
  userJourney: number;
  seoReadiness: number;
  conversionOptimization: number;
  contentQuality: number;
}

export interface ChannelScoreResult {
  channel: "google" | "meta" | "linkedin" | "tiktok";
  score: number;
  objective: string;
  funnel_role: string;
  is_recommended: boolean;
  risks: string[];
}

export interface InsightResult {
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action: string;
}

// =====================================================
// ANALYZE URL via Supabase Edge Function
// =====================================================

export async function analyzeUrl(url: string): Promise<UrlAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-url", {
    body: { url },
  });

  if (error) {
    throw new Error(error.message || "Erro ao analisar URL");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as UrlAnalysis;
}

// =====================================================
// SAVE ANALYSIS RESULTS to Supabase
// =====================================================

export async function saveAnalysisResults(
  projectId: string,
  userId: string,
  analysis: UrlAnalysis
): Promise<void> {
  // 1. Update project score and status
  const { error: projectError } = await (supabase as any)
    .from("projects")
    .update({
      score: analysis.overallScore,
      status: "completed",
      last_update: new Date().toISOString(),
    })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (projectError) {
    console.error("Error updating project:", projectError);
    throw new Error("Erro ao atualizar projeto com resultados da análise");
  }

  // 2. Upsert channel scores
  for (const cs of analysis.channelScores) {
    const { error: channelError } = await (supabase as any)
      .from("project_channel_scores")
      .upsert(
        {
          project_id: projectId,
          user_id: userId,
          channel: cs.channel,
          score: cs.score,
          objective: cs.objective,
          funnel_role: cs.funnel_role,
          is_recommended: cs.is_recommended,
          risks: cs.risks,
        },
        { onConflict: "project_id,channel" }
      );

    if (channelError) {
      console.error(`Error upserting channel score (${cs.channel}):`, channelError);
    }
  }

  // 3. Delete old insights for this project, then insert new ones
  await (supabase as any)
    .from("insights")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (analysis.insights.length > 0) {
    const insightRows = analysis.insights.map((insight) => ({
      project_id: projectId,
      user_id: userId,
      type: insight.type,
      title: insight.title,
      description: insight.description,
      action: insight.action,
    }));

    const { error: insightsError } = await (supabase as any)
      .from("insights")
      .insert(insightRows);

    if (insightsError) {
      console.error("Error inserting insights:", insightsError);
    }
  }
}
