import { supabase } from "@/integrations/supabase/client";
import type { UrlAnalysis } from "./urlAnalyzer";

// =====================================================
// TYPES
// =====================================================

export interface AiAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  recommendations: AiRecommendation[];
  competitivePosition: string;
  investmentReadiness: {
    score: number;
    level: "low" | "medium" | "high";
    justification: string;
  };
  channelRecommendations: AiChannelRecommendation[];
  provider: string;
  model: string;
  analyzedAt: string;
}

export interface AiRecommendation {
  priority: "high" | "medium" | "low";
  category: string;
  title: string;
  description: string;
  expectedImpact: string;
}

export interface AiChannelRecommendation {
  channel: string;
  verdict: "recommended" | "caution" | "not_recommended";
  reasoning: string;
  suggestedBudgetAllocation: string;
}

// =====================================================
// BENCHMARK AI TYPES
// =====================================================

export interface BenchmarkAiResult {
  executiveSummary: string;
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  strategicGaps: { area: string; gap: string; recommendation: string }[];
  marketPositioning: string;
  differentiationOpportunities: string[];
  threatAssessment: { threat: string; severity: "high" | "medium" | "low"; mitigation: string }[];
  actionPlan: { priority: "high" | "medium" | "low"; action: string; expectedOutcome: string; timeframe: string }[];
  overallVerdict: {
    competitorThreatLevel: number;
    summary: string;
  };
  provider: string;
  model: string;
  analyzedAt: string;
}

// =====================================================
// FETCH USER API KEY
// =====================================================

export interface UserApiKey {
  provider: "google_gemini" | "anthropic_claude";
  api_key_encrypted: string;
  preferred_model: string;
  is_active: boolean;
}

async function getUserApiKey(userId: string): Promise<UserApiKey | null> {
  const { data, error } = await (supabase as any)
    .from("user_api_keys")
    .select("provider, api_key_encrypted, preferred_model, is_active")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("last_validated_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  return data[0];
}

export async function getUserActiveKeys(userId: string): Promise<UserApiKey[]> {
  const { data, error } = await (supabase as any)
    .from("user_api_keys")
    .select("provider, api_key_encrypted, preferred_model, is_active")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error || !data) return [];
  return data;
}

// =====================================================
// BUILD PROMPT
// =====================================================

function buildAnalysisPrompt(
  projectName: string,
  projectNiche: string,
  projectUrl: string,
  heuristic: UrlAnalysis
): string {
  return `Você é um consultor sênior de marketing digital B2B. Analise os dados heurísticos abaixo de um site e forneça uma análise estratégica aprofundada.

## Dados do Projeto
- **Nome:** ${projectName}
- **Nicho:** ${projectNiche}
- **URL:** ${projectUrl}

## Dados Heurísticos (coletados automaticamente)

### Meta
- Título: ${heuristic.meta.title || "Não encontrado"}
- Descrição: ${heuristic.meta.description || "Não encontrada"}
- OG Title: ${heuristic.meta.ogTitle || "Não encontrado"}
- Idioma: ${heuristic.meta.language || "Não detectado"}

### Conteúdo
- H1: ${heuristic.content.h1.join(", ") || "Nenhum"}
- H2: ${heuristic.content.h2.slice(0, 5).join(", ") || "Nenhum"}
- Palavras: ${heuristic.content.wordCount}
- CTAs: ${heuristic.content.ctaCount} (${heuristic.content.ctaTexts.slice(0, 5).join(", ")})
- Formulários: ${heuristic.content.formCount}
- Imagens: ${heuristic.content.imageCount} (${heuristic.content.imagesWithAlt} com alt)
- Vídeo: ${heuristic.content.hasVideo ? "Sim" : "Não"}
- Prova social: ${heuristic.content.hasSocialProof ? "Sim" : "Não"}
- Depoimentos: ${heuristic.content.hasTestimonials ? "Sim" : "Não"}
- Preços: ${heuristic.content.hasPricing ? "Sim" : "Não"}
- FAQ: ${heuristic.content.hasFAQ ? "Sim" : "Não"}

### Técnico
- HTTPS: ${heuristic.technical.hasHttps ? "Sim" : "Não"}
- Viewport (mobile): ${heuristic.technical.hasViewport ? "Sim" : "Não"}
- Analytics: ${heuristic.technical.hasAnalytics ? "Sim" : "Não"}
- Pixel: ${heuristic.technical.hasPixel ? "Sim" : "Não"}
- Schema/Structured Data: ${heuristic.technical.hasStructuredData ? "Sim" : "Não"}
- Tempo de carga estimado: ${heuristic.technical.loadTimeEstimate}

### Scores Heurísticos (0-100)
- Proposta de Valor: ${heuristic.scores.valueProposition}
- Clareza da Oferta: ${heuristic.scores.offerClarity}
- Jornada do Usuário: ${heuristic.scores.userJourney}
- SEO: ${heuristic.scores.seoReadiness}
- Conversão: ${heuristic.scores.conversionOptimization}
- Conteúdo: ${heuristic.scores.contentQuality}
- **Score Geral: ${heuristic.overallScore}/100**

### Insights Heurísticos
${heuristic.insights.map((i) => `- [${i.type.toUpperCase()}] ${i.title}: ${i.description}`).join("\n")}

---

## Instruções de Resposta

Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem comentários, sem texto antes ou depois. Use o formato exato abaixo:

{
  "summary": "Resumo executivo de 2-3 frases sobre a prontidão digital do site para investimento em marketing B2B",
  "strengths": ["Ponto forte 1", "Ponto forte 2", "..."],
  "weaknesses": ["Fraqueza 1", "Fraqueza 2", "..."],
  "opportunities": ["Oportunidade 1", "Oportunidade 2", "..."],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "SEO|Conversão|Conteúdo|Técnico|UX|Branding",
      "title": "Título da recomendação",
      "description": "Descrição detalhada do que fazer",
      "expectedImpact": "Impacto esperado em 1 frase"
    }
  ],
  "competitivePosition": "Análise da posição competitiva no nicho ${projectNiche}",
  "investmentReadiness": {
    "score": 0-100,
    "level": "low|medium|high",
    "justification": "Justificativa para o nível de prontidão"
  },
  "channelRecommendations": [
    {
      "channel": "Google Ads|Meta Ads|LinkedIn Ads|TikTok Ads",
      "verdict": "recommended|caution|not_recommended",
      "reasoning": "Justificativa para a recomendação",
      "suggestedBudgetAllocation": "Ex: 40% do budget"
    }
  ]
}

Forneça entre 3-5 itens em strengths, weaknesses e opportunities. Forneça entre 4-6 recommendations ordenadas por prioridade. Forneça exatamente 4 channelRecommendations (Google, Meta, LinkedIn, TikTok).`;
}

// =====================================================
// CALL GEMINI API
// =====================================================

async function callGeminiApi(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errMsg = errorData?.error?.message || response.statusText;
    if (response.status === 404 || errMsg.toLowerCase().includes("not found")) {
      throw new Error(
        `Modelo "${model}" não encontrado. Sua API key pode não ter acesso a este modelo. Tente outro modelo em Configurações → Integrações de IA.`
      );
    }
    if (response.status === 403 || errMsg.toLowerCase().includes("permission")) {
      throw new Error(
        `Sua API key não tem permissão para usar o modelo "${model}". Selecione outro modelo em Configurações → Integrações de IA.`
      );
    }
    throw new Error(
      `Erro na API Gemini (${response.status}): ${errMsg}`
    );
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Resposta vazia da API Gemini");
  return text;
}

// =====================================================
// CALL CLAUDE API
// =====================================================

async function callClaudeApi(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  // Claude API requires CORS proxy or backend call
  // We'll use the Supabase Edge Function as proxy
  const { data, error } = await (supabase as any).functions.invoke("ai-analyze", {
    body: {
      provider: "anthropic",
      apiKey,
      model,
      prompt,
    },
  });

  if (error) {
    const errMsg = error.message || "";
    if (errMsg.includes("not_found") || errMsg.includes("404") || errMsg.toLowerCase().includes("not found")) {
      throw new Error(
        `Modelo "${model}" não encontrado. Sua API key pode não ter acesso a este modelo. Tente outro modelo em Configurações → Integrações de IA.`
      );
    }
    if (errMsg.includes("permission") || errMsg.includes("403") || errMsg.includes("authentication")) {
      throw new Error(
        `Sua API key não tem permissão para usar o modelo "${model}". Selecione outro modelo em Configurações → Integrações de IA.`
      );
    }
    throw new Error(`Erro na API Claude: ${errMsg}`);
  }
  if (!data?.text) throw new Error("Resposta vazia da API Claude");
  return data.text;
}

// =====================================================
// PARSE AI RESPONSE
// =====================================================

function parseAiResponse(
  text: string,
  provider: string,
  model: string
): AiAnalysisResult {
  // Clean response — remove markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  return {
    summary: parsed.summary || "",
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    opportunities: parsed.opportunities || [],
    recommendations: (parsed.recommendations || []).map((r: any) => ({
      priority: r.priority || "medium",
      category: r.category || "Geral",
      title: r.title || "",
      description: r.description || "",
      expectedImpact: r.expectedImpact || "",
    })),
    competitivePosition: parsed.competitivePosition || "",
    investmentReadiness: {
      score: parsed.investmentReadiness?.score || 0,
      level: parsed.investmentReadiness?.level || "medium",
      justification: parsed.investmentReadiness?.justification || "",
    },
    channelRecommendations: (parsed.channelRecommendations || []).map((c: any) => ({
      channel: c.channel || "",
      verdict: c.verdict || "caution",
      reasoning: c.reasoning || "",
      suggestedBudgetAllocation: c.suggestedBudgetAllocation || "",
    })),
    provider,
    model,
    analyzedAt: new Date().toISOString(),
  };
}

// =====================================================
// MAIN: RUN AI ANALYSIS
// =====================================================

export async function runAiAnalysis(
  projectId: string,
  userId: string,
  projectName: string,
  projectNiche: string,
  projectUrl: string,
  heuristic: UrlAnalysis,
  overrideProvider?: "google_gemini" | "anthropic_claude",
  overrideModel?: string
): Promise<AiAnalysisResult> {
  // 1. Get user's API key(s)
  let apiKeyEntry: UserApiKey | null = null;

  if (overrideProvider) {
    const allKeys = await getUserActiveKeys(userId);
    apiKeyEntry = allKeys.find((k) => k.provider === overrideProvider) || null;
  } else {
    apiKeyEntry = await getUserApiKey(userId);
  }

  if (!apiKeyEntry) {
    throw new Error("Nenhuma API key ativa encontrada. Configure em Configurações → Integrações de IA.");
  }

  const modelToUse = overrideModel || apiKeyEntry.preferred_model;

  // 2. Build prompt
  const prompt = buildAnalysisPrompt(projectName, projectNiche, projectUrl, heuristic);

  // 3. Call AI API
  let responseText: string;

  if (apiKeyEntry.provider === "google_gemini") {
    responseText = await callGeminiApi(
      apiKeyEntry.api_key_encrypted,
      modelToUse,
      prompt
    );
  } else if (apiKeyEntry.provider === "anthropic_claude") {
    responseText = await callClaudeApi(
      apiKeyEntry.api_key_encrypted,
      modelToUse,
      prompt
    );
  } else {
    throw new Error(`Provider não suportado: ${apiKeyEntry.provider}`);
  }

  // 4. Parse response
  const result = parseAiResponse(
    responseText,
    apiKeyEntry.provider,
    modelToUse
  );

  // 5. Save to project
  await (supabase as any)
    .from("projects")
    .update({
      ai_analysis: result,
      ai_completed_at: result.analyzedAt,
    })
    .eq("id", projectId)
    .eq("user_id", userId);

  return result;
}

// =====================================================
// BENCHMARK AI: BUILD PROMPT
// =====================================================

interface BenchmarkData {
  competitorName: string;
  competitorUrl: string;
  competitorNiche: string;
  overallScore: number;
  valuePropositionScore: number;
  valuePropositionAnalysis: string;
  offerClarityScore: number;
  offerClarityAnalysis: string;
  userJourneyScore: number;
  userJourneyAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  channelPresence: Record<string, number>;
  channelEffectiveness: Record<string, { score: number; recommended: boolean; risks: number }>;
  strategicInsights: string;
  recommendations: string;
  scoreGap: number;
  projectName: string;
  projectScore: number;
}

function buildBenchmarkPrompt(data: BenchmarkData): string {
  return `Você é um analista estratégico de marketing B2B. Analise os dados de benchmark competitivo abaixo e forneça uma análise aprofundada.

## Dados do Benchmark

**Projeto:** ${data.projectName} (Score: ${data.projectScore})
**Concorrente:** ${data.competitorName} (Score: ${data.overallScore})
**URL do Concorrente:** ${data.competitorUrl}
**Nicho:** ${data.competitorNiche}
**Gap de Score:** ${data.scoreGap > 0 ? "+" : ""}${data.scoreGap} (${data.scoreGap > 0 ? "concorrente à frente" : "projeto à frente"})

### Scores Detalhados do Concorrente
- Proposta de Valor: ${data.valuePropositionScore}/100 — ${data.valuePropositionAnalysis || "Sem análise"}
- Clareza da Oferta: ${data.offerClarityScore}/100 — ${data.offerClarityAnalysis || "Sem análise"}
- Jornada do Usuário: ${data.userJourneyScore}/100 — ${data.userJourneyAnalysis || "Sem análise"}

### SWOT do Concorrente
- Forças: ${data.strengths.join("; ") || "Nenhuma identificada"}
- Fraquezas: ${data.weaknesses.join("; ") || "Nenhuma identificada"}
- Oportunidades: ${data.opportunities.join("; ") || "Nenhuma identificada"}
- Ameaças: ${data.threats.join("; ") || "Nenhuma identificada"}

### Presença por Canal
${Object.entries(data.channelPresence || {}).map(([ch, sc]) => `- ${ch}: ${sc}/100`).join("\n") || "Sem dados"}

### Insights Estratégicos Existentes
${data.strategicInsights || "Nenhum"}

### Recomendações Existentes
${data.recommendations || "Nenhuma"}

## Instruções

Com base nos dados acima, forneça uma análise competitiva aprofundada em formato JSON com a seguinte estrutura:

{
  "executiveSummary": "Resumo executivo de 2-3 frases sobre a posição competitiva do concorrente vs o projeto",
  "competitiveAdvantages": ["Vantagem competitiva 1 do concorrente", "..."],
  "competitiveDisadvantages": ["Desvantagem competitiva 1 do concorrente", "..."],
  "strategicGaps": [
    {
      "area": "Área do gap (ex: SEO, Conteúdo, UX)",
      "gap": "Descrição do gap entre projeto e concorrente",
      "recommendation": "O que fazer para fechar esse gap"
    }
  ],
  "marketPositioning": "Análise de como o concorrente se posiciona no mercado vs o projeto",
  "differentiationOpportunities": ["Oportunidade de diferenciação 1", "..."],
  "threatAssessment": [
    {
      "threat": "Descrição da ameaça",
      "severity": "high|medium|low",
      "mitigation": "Como mitigar essa ameaça"
    }
  ],
  "actionPlan": [
    {
      "priority": "high|medium|low",
      "action": "Ação a tomar",
      "expectedOutcome": "Resultado esperado",
      "timeframe": "Curto prazo|Médio prazo|Longo prazo"
    }
  ],
  "overallVerdict": {
    "competitorThreatLevel": 0-100,
    "summary": "Resumo do nível de ameaça do concorrente e próximos passos"
  }
}

Forneça 3-5 itens em competitiveAdvantages e competitiveDisadvantages. Forneça 3-5 strategicGaps. Forneça 3-5 differentiationOpportunities. Forneça 2-4 threatAssessment. Forneça 4-6 actionPlan ordenados por prioridade.`;
}

// =====================================================
// BENCHMARK AI: PARSE RESPONSE
// =====================================================

function parseBenchmarkAiResponse(
  text: string,
  provider: string,
  model: string
): BenchmarkAiResult {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  return {
    executiveSummary: parsed.executiveSummary || "",
    competitiveAdvantages: parsed.competitiveAdvantages || [],
    competitiveDisadvantages: parsed.competitiveDisadvantages || [],
    strategicGaps: (parsed.strategicGaps || []).map((g: any) => ({
      area: g.area || "",
      gap: g.gap || "",
      recommendation: g.recommendation || "",
    })),
    marketPositioning: parsed.marketPositioning || "",
    differentiationOpportunities: parsed.differentiationOpportunities || [],
    threatAssessment: (parsed.threatAssessment || []).map((t: any) => ({
      threat: t.threat || "",
      severity: t.severity || "medium",
      mitigation: t.mitigation || "",
    })),
    actionPlan: (parsed.actionPlan || []).map((a: any) => ({
      priority: a.priority || "medium",
      action: a.action || "",
      expectedOutcome: a.expectedOutcome || "",
      timeframe: a.timeframe || "",
    })),
    overallVerdict: {
      competitorThreatLevel: parsed.overallVerdict?.competitorThreatLevel || 0,
      summary: parsed.overallVerdict?.summary || "",
    },
    provider,
    model,
    analyzedAt: new Date().toISOString(),
  };
}

// =====================================================
// MAIN: RUN BENCHMARK AI ANALYSIS
// =====================================================

export async function runBenchmarkAiAnalysis(
  benchmarkId: string,
  userId: string,
  benchmarkData: BenchmarkData,
  overrideProvider?: "google_gemini" | "anthropic_claude",
  overrideModel?: string
): Promise<BenchmarkAiResult> {
  // 1. Get user's API key(s)
  let apiKeyEntry: UserApiKey | null = null;

  if (overrideProvider) {
    const allKeys = await getUserActiveKeys(userId);
    apiKeyEntry = allKeys.find((k) => k.provider === overrideProvider) || null;
  } else {
    apiKeyEntry = await getUserApiKey(userId);
  }

  if (!apiKeyEntry) {
    throw new Error("Nenhuma API key ativa encontrada. Configure em Configurações → Integrações de IA.");
  }

  const modelToUse = overrideModel || apiKeyEntry.preferred_model;

  // 2. Build prompt
  const prompt = buildBenchmarkPrompt(benchmarkData);

  // 3. Call AI API
  let responseText: string;

  if (apiKeyEntry.provider === "google_gemini") {
    responseText = await callGeminiApi(
      apiKeyEntry.api_key_encrypted,
      modelToUse,
      prompt
    );
  } else if (apiKeyEntry.provider === "anthropic_claude") {
    responseText = await callClaudeApi(
      apiKeyEntry.api_key_encrypted,
      modelToUse,
      prompt
    );
  } else {
    throw new Error(`Provider não suportado: ${apiKeyEntry.provider}`);
  }

  // 4. Parse response
  const result = parseBenchmarkAiResponse(
    responseText,
    apiKeyEntry.provider,
    modelToUse
  );

  // 5. Save to benchmark
  await (supabase as any)
    .from("benchmarks")
    .update({
      ai_analysis: result,
    })
    .eq("id", benchmarkId)
    .eq("user_id", userId);

  return result;
}

// =====================================================
// INSIGHTS AI ENRICHMENT: TYPES
// =====================================================

export interface InsightAiEnrichment {
  deepAnalysis: string;
  rootCause: string;
  impact: string;
  actionPlan: { step: string; effort: "low" | "medium" | "high"; timeframe: string }[];
  priority: "critical" | "high" | "medium" | "low";
  relatedMetrics: string[];
  benchmarkContext: string;
}

export interface InsightsEnrichmentResult {
  enrichedInsights: {
    insightId: string;
    enrichment: InsightAiEnrichment;
  }[];
  newInsights: {
    type: "warning" | "opportunity" | "improvement";
    title: string;
    description: string;
    action: string;
    priority: "critical" | "high" | "medium" | "low";
    enrichment: InsightAiEnrichment;
  }[];
  strategicSummary: string;
  provider: string;
  model: string;
  analyzedAt: string;
}

// =====================================================
// INSIGHTS AI ENRICHMENT: BUILD PROMPT
// =====================================================

interface InsightForPrompt {
  id: string;
  type: string;
  title: string;
  description: string;
  action?: string | null;
}

function buildInsightsEnrichmentPrompt(
  projectName: string,
  projectNiche: string,
  projectUrl: string,
  insights: InsightForPrompt[]
): string {
  const insightsList = insights
    .map(
      (i, idx) =>
        `${idx + 1}. [ID: ${i.id}] [${i.type.toUpperCase()}] "${i.title}" — ${i.description}${i.action ? ` | Ação: ${i.action}` : ""}`
    )
    .join("\n");

  return `Você é um consultor sênior de marketing digital B2B. Analise os insights heurísticos abaixo de um projeto e forneça um enriquecimento estratégico aprofundado para cada um, além de identificar novos insights que a análise heurística pode ter perdido.

## Dados do Projeto
- **Nome:** ${projectName}
- **Nicho:** ${projectNiche}
- **URL:** ${projectUrl}

## Insights Heurísticos Existentes
${insightsList}

---

## Instruções

Para CADA insight existente, forneça uma análise aprofundada. Além disso, identifique 2-4 NOVOS insights que a análise heurística não detectou.

Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem comentários. Use o formato exato:

{
  "enrichedInsights": [
    {
      "insightId": "ID do insight original (copie exatamente)",
      "enrichment": {
        "deepAnalysis": "Análise aprofundada de 2-3 frases explicando o contexto estratégico deste insight para o nicho ${projectNiche}",
        "rootCause": "Causa raiz provável do problema ou oportunidade identificada",
        "impact": "Impacto estimado no negócio se não for tratado (para alertas) ou se for implementado (para oportunidades/melhorias)",
        "actionPlan": [
          {
            "step": "Passo concreto e acionável",
            "effort": "low|medium|high",
            "timeframe": "1 semana|2 semanas|1 mês|3 meses"
          }
        ],
        "priority": "critical|high|medium|low",
        "relatedMetrics": ["Métrica afetada 1", "Métrica afetada 2"],
        "benchmarkContext": "Como empresas referência no nicho ${projectNiche} lidam com isso"
      }
    }
  ],
  "newInsights": [
    {
      "type": "warning|opportunity|improvement",
      "title": "Título do novo insight descoberto pela IA",
      "description": "Descrição detalhada",
      "action": "Ação recomendada",
      "priority": "critical|high|medium|low",
      "enrichment": {
        "deepAnalysis": "Análise aprofundada",
        "rootCause": "Causa raiz",
        "impact": "Impacto estimado",
        "actionPlan": [
          {
            "step": "Passo concreto",
            "effort": "low|medium|high",
            "timeframe": "Prazo"
          }
        ],
        "priority": "critical|high|medium|low",
        "relatedMetrics": ["Métrica 1"],
        "benchmarkContext": "Contexto de benchmark"
      }
    }
  ],
  "strategicSummary": "Resumo estratégico de 3-4 frases sobre o estado geral do projeto, priorizando os insights mais críticos e indicando o caminho de ação recomendado"
}

Forneça 2-4 passos no actionPlan de cada insight. Forneça 2-4 newInsights. Seja específico para o nicho ${projectNiche}.`;
}

// =====================================================
// INSIGHTS AI ENRICHMENT: PARSE RESPONSE
// =====================================================

function parseInsightsEnrichmentResponse(
  text: string,
  provider: string,
  model: string
): InsightsEnrichmentResult {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  return {
    enrichedInsights: (parsed.enrichedInsights || []).map((ei: any) => ({
      insightId: ei.insightId || "",
      enrichment: {
        deepAnalysis: ei.enrichment?.deepAnalysis || "",
        rootCause: ei.enrichment?.rootCause || "",
        impact: ei.enrichment?.impact || "",
        actionPlan: (ei.enrichment?.actionPlan || []).map((a: any) => ({
          step: a.step || "",
          effort: a.effort || "medium",
          timeframe: a.timeframe || "",
        })),
        priority: ei.enrichment?.priority || "medium",
        relatedMetrics: ei.enrichment?.relatedMetrics || [],
        benchmarkContext: ei.enrichment?.benchmarkContext || "",
      },
    })),
    newInsights: (parsed.newInsights || []).map((ni: any) => ({
      type: ni.type || "improvement",
      title: ni.title || "",
      description: ni.description || "",
      action: ni.action || "",
      priority: ni.priority || "medium",
      enrichment: {
        deepAnalysis: ni.enrichment?.deepAnalysis || "",
        rootCause: ni.enrichment?.rootCause || "",
        impact: ni.enrichment?.impact || "",
        actionPlan: (ni.enrichment?.actionPlan || []).map((a: any) => ({
          step: a.step || "",
          effort: a.effort || "medium",
          timeframe: a.timeframe || "",
        })),
        priority: ni.enrichment?.priority || ni.priority || "medium",
        relatedMetrics: ni.enrichment?.relatedMetrics || [],
        benchmarkContext: ni.enrichment?.benchmarkContext || "",
      },
    })),
    strategicSummary: parsed.strategicSummary || "",
    provider,
    model,
    analyzedAt: new Date().toISOString(),
  };
}

// =====================================================
// MAIN: RUN INSIGHTS AI ENRICHMENT
// =====================================================

export async function runInsightsAiEnrichment(
  projectId: string,
  userId: string,
  projectName: string,
  projectNiche: string,
  projectUrl: string,
  insights: InsightForPrompt[],
  overrideProvider?: "google_gemini" | "anthropic_claude",
  overrideModel?: string
): Promise<InsightsEnrichmentResult> {
  // 1. Get user's API key
  let apiKeyEntry: UserApiKey | null = null;

  if (overrideProvider) {
    const allKeys = await getUserActiveKeys(userId);
    apiKeyEntry = allKeys.find((k) => k.provider === overrideProvider) || null;
  } else {
    apiKeyEntry = await getUserApiKey(userId);
  }

  if (!apiKeyEntry) {
    throw new Error("Nenhuma API key ativa encontrada. Configure em Configurações → Integrações de IA.");
  }

  const modelToUse = overrideModel || apiKeyEntry.preferred_model;

  // 2. Build prompt
  const prompt = buildInsightsEnrichmentPrompt(projectName, projectNiche, projectUrl, insights);

  // 3. Call AI API
  let responseText: string;

  if (apiKeyEntry.provider === "google_gemini") {
    responseText = await callGeminiApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else if (apiKeyEntry.provider === "anthropic_claude") {
    responseText = await callClaudeApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else {
    throw new Error(`Provider não suportado: ${apiKeyEntry.provider}`);
  }

  // 4. Parse response
  const result = parseInsightsEnrichmentResponse(responseText, apiKeyEntry.provider, modelToUse);

  // 5. Update existing insights with enrichment
  for (const ei of result.enrichedInsights) {
    if (!ei.insightId) continue;
    await (supabase as any)
      .from("insights")
      .update({
        ai_enrichment: ei.enrichment,
        priority: ei.enrichment.priority,
        ai_provider: result.provider,
        ai_model: result.model,
        ai_enriched_at: result.analyzedAt,
      })
      .eq("id", ei.insightId)
      .eq("user_id", userId);
  }

  // 6. Insert new AI-generated insights
  for (const ni of result.newInsights) {
    await (supabase as any)
      .from("insights")
      .insert({
        project_id: projectId,
        user_id: userId,
        type: ni.type,
        title: ni.title,
        description: ni.description,
        action: ni.action,
        source: "ai",
        priority: ni.priority,
        ai_enrichment: ni.enrichment,
        ai_provider: result.provider,
        ai_model: result.model,
        ai_enriched_at: result.analyzedAt,
      });
  }

  return result;
}
