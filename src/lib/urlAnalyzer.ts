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
  htmlSnapshot: string;
  structuredData: StructuredDataResult;
}

export interface StructuredDataResult {
  jsonLd: any[];
  microdata: MicrodataItem[];
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
}

export interface MicrodataItem {
  type: string;
  properties: Record<string, string>;
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
  console.log("[analyzeUrl] Chamando Edge Function rapid-action para:", url);

  const { data, error } = await supabase.functions.invoke("rapid-action", {
    body: { url },
  });

  console.log("[analyzeUrl] Response:", { data, error });

  if (error) {
    console.error("[analyzeUrl] Edge Function error:", error);
    throw new Error(error.message || "Erro ao conectar com a Edge Function");
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
  const now = new Date().toISOString();

  // 1. Update project score, status and store full heuristic analysis
  const { error: projectError } = await (supabase as any)
    .from("projects")
    .update({
      score: analysis.overallScore,
      status: "completed",
      heuristic_analysis: analysis,
      heuristic_completed_at: now,
      html_snapshot: analysis.htmlSnapshot,
      structured_data: analysis.structuredData,
      html_snapshot_at: now,
      last_update: now,
    })
    .eq("id", projectId)
    .eq("user_id", userId);

  if (projectError) {
    console.error("Error updating project:", projectError);
    throw new Error(`Erro ao atualizar projeto com resultados da análise: ${projectError.message || projectError.code || JSON.stringify(projectError)}`);
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

// =====================================================
// CREATE NOTIFICATION after heuristic analysis
// =====================================================

export async function createAnalysisNotification(
  projectId: string,
  userId: string,
  score: number
): Promise<void> {
  try {
    // Get project name
    const { data: project } = await (supabase as any)
      .from("projects")
      .select("name")
      .eq("id", projectId)
      .single();

    const projectName = project?.name || "Projeto";

    // Check if user has AI API keys configured
    const { data: apiKeys } = await (supabase as any)
      .from("user_api_keys")
      .select("provider")
      .eq("user_id", userId)
      .eq("is_active", true);

    const hasAiKeys = apiKeys && apiKeys.length > 0;

    const message = hasAiKeys
      ? `Análise heurística de "${projectName}" concluída com score ${score}/100. Você pode agora executar uma análise aprofundada por IA para insights mais detalhados.`
      : `Análise heurística de "${projectName}" concluída com score ${score}/100. Configure suas API keys em Configurações para habilitar análise por IA.`;

    // Remove previous heuristic notifications for this project to avoid duplicates
    await (supabase as any)
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .eq("title", "Análise Heurística Concluída")
      .ilike("message", `%"${projectName}"%`);

    await (supabase as any)
      .from("notifications")
      .insert({
        user_id: userId,
        title: "Análise Heurística Concluída",
        message,
        type: "success",
        read: false,
        action_url: "/projects",
        action_text: hasAiKeys ? "Analisar com IA" : "Ver Projeto",
      });
  } catch (error) {
    console.error("Error creating analysis notification:", error);
  }
}

// =====================================================
// CLEAN OLD BENCHMARKS for a project
// =====================================================

export async function cleanBenchmarks(
  projectId: string,
  userId: string
): Promise<void> {
  console.log(`[benchmark] Limpando benchmarks antigos para projeto ${projectId}`);
  const { data, error } = await (supabase as any)
    .from("benchmarks")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("[benchmark] Erro ao limpar benchmarks:", error);
  } else {
    console.log(`[benchmark] ${data?.length || 0} benchmarks removidos`);
  }
}

// =====================================================
// ANALYZE COMPETITORS and generate benchmarks
// =====================================================

export async function analyzeCompetitors(
  projectId: string,
  userId: string,
  competitorUrls: string[],
  niche: string
): Promise<void> {
  for (const url of competitorUrls) {
    try {
      console.log(`[benchmark] Analisando concorrente: ${url}`);
      const analysis = await analyzeUrl(url);

      // Extract domain as competitor name
      let competitorName: string;
      try {
        competitorName = new URL(url).hostname.replace("www.", "");
      } catch {
        competitorName = url;
      }

      await saveCompetitorBenchmark(projectId, userId, {
        name: competitorName,
        niche,
        url,
      }, analysis);

      console.log(`[benchmark] Concorrente analisado: ${competitorName} — Score: ${analysis.overallScore}`);
    } catch (err: any) {
      console.error(`[benchmark] Erro ao analisar concorrente ${url}:`, err.message);
    }
  }
}

export async function saveCompetitorBenchmark(
  projectId: string,
  userId: string,
  projectData: { name: string; niche: string; url: string },
  analysis: UrlAnalysis
): Promise<void> {
  // Derive SWOT from analysis
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  // Strengths — high scores
  if (analysis.scores.valueProposition >= 70) strengths.push("Proposta de valor clara e diferenciada");
  if (analysis.scores.offerClarity >= 70) strengths.push("Oferta bem estruturada e compreensível");
  if (analysis.scores.userJourney >= 70) strengths.push("Jornada do usuário otimizada para conversão");
  if (analysis.scores.seoReadiness >= 70) strengths.push("Boa prontidão para SEO e busca orgânica");
  if (analysis.scores.conversionOptimization >= 70) strengths.push("Otimização de conversão eficiente");
  if (analysis.scores.contentQuality >= 70) strengths.push("Conteúdo de alta qualidade");
  if (analysis.technical.hasHttps) strengths.push("Site seguro com HTTPS");
  if (analysis.technical.hasAnalytics) strengths.push("Analytics configurado para rastreamento");
  if (analysis.content.hasVideo) strengths.push("Conteúdo em vídeo presente");
  if (analysis.content.hasSocialProof) strengths.push("Prova social visível");
  if (analysis.content.ctaCount >= 3) strengths.push("Múltiplos CTAs estratégicos");

  // Weaknesses — low scores
  if (analysis.scores.valueProposition < 50) weaknesses.push("Proposta de valor fraca ou pouco clara");
  if (analysis.scores.offerClarity < 50) weaknesses.push("Falta de clareza na oferta");
  if (analysis.scores.userJourney < 50) weaknesses.push("Jornada do usuário deficiente");
  if (analysis.scores.seoReadiness < 50) weaknesses.push("SEO precário — baixa visibilidade orgânica");
  if (analysis.scores.conversionOptimization < 50) weaknesses.push("Baixa otimização para conversão");
  if (analysis.scores.contentQuality < 50) weaknesses.push("Conteúdo insuficiente ou de baixa qualidade");
  if (!analysis.technical.hasHttps) weaknesses.push("Site sem HTTPS — inseguro");
  if (!analysis.technical.hasViewport) weaknesses.push("Não otimizado para mobile");
  if (analysis.content.ctaCount === 0) weaknesses.push("Sem CTAs — visitantes sem direção");
  if (analysis.content.formCount === 0) weaknesses.push("Sem formulários de captura");
  if (!analysis.meta.description) weaknesses.push("Meta description ausente");

  // Opportunities — from insights
  analysis.insights
    .filter((i) => i.type === "opportunity")
    .slice(0, 5)
    .forEach((i) => opportunities.push(i.title));

  // Threats — from warnings
  analysis.insights
    .filter((i) => i.type === "warning")
    .slice(0, 5)
    .forEach((i) => threats.push(i.title));

  // Channel presence and effectiveness
  const channelPresence: Record<string, number> = {};
  const channelEffectiveness: Record<string, { score: number; recommended: boolean; risks: number }> = {};
  for (const cs of analysis.channelScores) {
    channelPresence[cs.channel] = cs.score;
    channelEffectiveness[cs.channel] = {
      score: cs.score,
      recommended: cs.is_recommended,
      risks: cs.risks.length,
    };
  }

  // Build strategic insights text
  const bestChannel = analysis.channelScores.reduce((a, b) => (a.score > b.score ? a : b));
  const worstChannel = analysis.channelScores.reduce((a, b) => (a.score < b.score ? a : b));
  const strategicInsights = [
    `Score geral: ${analysis.overallScore}/100.`,
    `Proposta de valor: ${analysis.scores.valueProposition}/100 | Clareza: ${analysis.scores.offerClarity}/100 | Jornada: ${analysis.scores.userJourney}/100.`,
    `SEO: ${analysis.scores.seoReadiness}/100 | Conversão: ${analysis.scores.conversionOptimization}/100 | Conteúdo: ${analysis.scores.contentQuality}/100.`,
    `Melhor canal: ${bestChannel.channel} (${bestChannel.score}/100). Pior canal: ${worstChannel.channel} (${worstChannel.score}/100).`,
    analysis.content.hasVideo ? "Vídeo presente — vantagem para Meta e TikTok." : "Sem vídeo — oportunidade de melhoria para canais visuais.",
    analysis.content.hasSocialProof ? "Prova social presente — fortalece confiança." : "Sem prova social — risco de baixa conversão.",
  ].join("\n");

  // Build recommendations
  const recommendations = analysis.insights
    .filter((i) => i.action)
    .slice(0, 8)
    .map((i) => `• ${i.action}`)
    .join("\n");

  // Value proposition analysis text
  const vpAnalysis = [
    analysis.meta.title ? `Título: "${analysis.meta.title}"` : "Sem título definido.",
    analysis.content.h1.length > 0 ? `H1: "${analysis.content.h1[0]}"` : "Sem H1 principal.",
    analysis.meta.description ? `Descrição: "${analysis.meta.description.substring(0, 120)}..."` : "Sem meta description.",
    `${analysis.content.ctaCount} CTAs identificados.`,
    analysis.content.hasSocialProof ? "Prova social presente." : "Sem prova social.",
  ].join(" ");

  // Offer clarity analysis text
  const ocAnalysis = [
    `Hierarquia de headings ${analysis.content.headingHierarchyValid ? "válida" : "inválida"}.`,
    `${analysis.content.h2.length} seções (H2) identificadas.`,
    `${analysis.content.wordCount} palavras no conteúdo.`,
    analysis.content.hasPricing ? "Preços visíveis." : "Sem informação de preços.",
    analysis.content.hasFAQ ? "FAQ presente." : "Sem FAQ.",
  ].join(" ");

  // User journey analysis text
  const ujAnalysis = [
    `${analysis.content.ctaCount} CTAs e ${analysis.content.formCount} formulários.`,
    `${analysis.content.linkCount} links na página.`,
    analysis.content.hasVideo ? "Vídeo explicativo presente." : "Sem vídeo.",
    analysis.content.hasTestimonials ? "Depoimentos presentes." : "Sem depoimentos.",
    `Tempo estimado de carregamento: ${analysis.technical.loadTimeEstimate}.`,
  ].join(" ");

  // Upsert benchmark (unique on project_id + competitor_url)
  const { error } = await (supabase as any)
    .from("benchmarks")
    .upsert(
      {
        project_id: projectId,
        user_id: userId,
        competitor_name: projectData.name,
        competitor_url: projectData.url,
        competitor_niche: projectData.niche,
        overall_score: analysis.overallScore,
        value_proposition_score: analysis.scores.valueProposition,
        value_proposition_analysis: vpAnalysis,
        offer_clarity_score: analysis.scores.offerClarity,
        offer_clarity_analysis: ocAnalysis,
        user_journey_score: analysis.scores.userJourney,
        user_journey_analysis: ujAnalysis,
        channel_presence: channelPresence,
        channel_effectiveness: channelEffectiveness,
        strengths: strengths.slice(0, 10),
        weaknesses: weaknesses.slice(0, 10),
        opportunities: opportunities.slice(0, 10),
        threats: threats.slice(0, 10),
        strategic_insights: strategicInsights,
        recommendations,
        structured_data: analysis.structuredData || null,
        html_snapshot: analysis.htmlSnapshot || null,
        html_snapshot_at: analysis.htmlSnapshot ? new Date().toISOString() : null,
        analysis_date: new Date().toISOString(),
        last_update: new Date().toISOString(),
      },
      { onConflict: "project_id,competitor_url" }
    );

  if (error) {
    console.error("Error generating benchmark:", error);
  } else {
    console.log("[benchmark] Auto-benchmark gerado para", projectData.name);
  }
}
