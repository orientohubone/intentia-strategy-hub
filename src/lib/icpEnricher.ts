import { supabase } from "@/integrations/supabase/client";
import { getUserActiveKeys, type UserApiKey } from "./aiAnalyzer";
import { getClaudeMaxTokens } from "./aiModels";

// =====================================================
// TYPES
// =====================================================

export interface IcpEnrichmentInput {
  name: string;
  description: string;
  industry?: string;
  companySize?: string;
  location?: string;
  keywords: string[];
}

type ProjectContext = {
  name?: string;
  niche?: string;
  url?: string;
  solutionContext?: string;
};

function buildEditorialPrompt(audienceName: string, icp: IcpEnrichmentResult, project?: ProjectContext): string {
  const siteContext = project?.url
    ? `Site oficial: ${project.url}\nUse a proposta de valor, serviços e linguagem do site para alinhar o tom e exemplos. Se houver menção a "vendasimples" ou nome do projeto, mantenha coerência com essa oferta. NÃO invente recursos, planos ou garantias que não estejam alinhados ao site.`
    : "Site não informado. Use somente o ICP e mantenha o tom B2B brasileiro.";
  const projectContext = `Projeto/Produto: ${project?.name || "(sem nome)"}\nNicho/Produto: ${project?.niche || "(sem nicho informado)"}`;
  const solutionContext = project?.solutionContext
    ? `Contexto da solução (use como fonte principal de tom e proposta de valor): ${project.solutionContext}`
    : "Contexto da solução não fornecido.";

  return `Você é um estrategista de conteúdo B2B. Crie um plano de comunicação com 6 a 10 blocos (posts), para o público "${audienceName}", usando fielmente as DORES PRINCIPAIS e GATILHOS DE COMPRA do ICP refinado e alinhando com o site do projeto.

${projectContext}
${siteContext}
${solutionContext}

ICP (resumo): ${icp.refinedDescription}
Dores (use explicitamente): ${icp.idealProfile.painPoints.join(", ")}
Gatilhos (use explicitamente): ${icp.idealProfile.buyingTriggers.join(", ")}
Recomendações: ${icp.recommendations.join(" | ")}
Keywords: ${icp.suggestedKeywords.join(", ")}

Regras:
- Cada bloco deve citar pelo menos uma dor e um gatilho correspondente.
- Reforço da mensagem deve conectar dor → gatilho → solução.
- CTA único e claro, coerente com a dor/gatilho citado.
- Legenda completa (2-4 frases) pronta para uso.
- Se o projeto/produto for "vendasimples" (ou nome do projeto), mantenha o tom, proposta de valor e diferenciais condizentes com o site.
- Use o nicho, a URL do projeto e o contexto da solução para contextualizar exemplos e CTA; não cite soluções genéricas que contradizem o site.
- Estruture como um minicalendário (ex.: Bloco 1..10) mantendo coesão entre os blocos.

Retorne APENAS JSON válido no formato:
{
  "lines": [
    {"headline": "...", "message": "...", "cta": "...", "caption": "..."}
  ]
}`;
}

function buildProjectEditorialPrompt(projectName: string, items: { name: string; icp: IcpEnrichmentResult }[], project?: ProjectContext): string {
  const blocks = items
    .map((i, idx) => `### Público ${idx + 1}: ${i.name}
ICP: ${i.icp.refinedDescription}
Dores: ${i.icp.idealProfile.painPoints.join(", ")}
Gatilhos: ${i.icp.idealProfile.buyingTriggers.join(", ")}`)
    .join("\n\n");

  return `Você é um estrategista de conteúdo B2B. Gere um plano de comunicação (1-2 blocos por público, total 6-10 blocos) para o projeto "${projectName}".

Site oficial: ${project?.url || "não informado"}
Nicho/Produto: ${project?.niche || "(sem nicho informado)"}
Contexto da solução: ${project?.solutionContext || "não fornecido"}
Se o nome do projeto ou domínio remeter a "vendasimples", mantenha aderência à proposta de valor do site (tom, ofertas, benefícios).

Use dores, gatilhos e contexto de cada ICP abaixo:
${blocks}

Retorne APENAS JSON válido com um array "lines":
{
  "lines": [
    { "audienceName": "nome", "headline": "...", "message": "...", "cta": "...", "caption": "..." }
  ]
}`;
}

export interface IcpEnrichmentResult {
  refinedDescription: string;
  idealProfile: {
    industry: string;
    companySize: string;
    location: string;
    decisionMakers: string[];
    painPoints: string[];
    buyingTriggers: string[];
    budgetRange: string;
  };
  demographicInsights: string;
  marketContext: string;
  suggestedKeywords: string[];
  recommendations: string[];
  dataSources: { source: string; success: boolean }[];
  provider: string;
  model: string;
  enrichedAt: string;
}

export interface EditorialLine {
  headline: string;
  message: string;
  cta: string;
  caption: string;
  audienceName?: string;
}

// =====================================================
// FETCH ENRICHMENT DATA FROM EDGE FUNCTION
// =====================================================

interface EnrichmentSourceData {
  sources: { source: string; url: string; success: boolean; textLength: number }[];
  enrichmentData: { source: string; text: string }[];
  totalSourcesFound: number;
}

async function fetchEnrichmentData(
  industry: string,
  location: string,
  companySize: string,
  keywords: string[]
): Promise<EnrichmentSourceData> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { sources: [], enrichmentData: [], totalSourcesFound: 0 };
    }

    const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;

    const response = await fetch(`${supabaseUrl}/functions/v1/enrich-icp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ industry, location, companySize, keywords }),
    });

    if (!response.ok) {
      console.warn("[icpEnricher] Edge function returned", response.status);
      return { sources: [], enrichmentData: [], totalSourcesFound: 0 };
    }

    return await response.json();
  } catch (err) {
    console.warn("[icpEnricher] Failed to fetch enrichment data:", err);
    return { sources: [], enrichmentData: [], totalSourcesFound: 0 };
  }
}

// =====================================================
// BUILD PROMPT
// =====================================================

function buildIcpPrompt(input: IcpEnrichmentInput, externalData: EnrichmentSourceData): string {
  const externalSection = externalData.enrichmentData.length > 0
    ? `\n## Dados de Fontes Públicas (SEBRAE, IBGE)\n\n${externalData.enrichmentData.map((d) => `### ${d.source}\n${d.text}`).join("\n\n")}\n`
    : "\n## Dados Externos\nNenhuma fonte pública retornou dados. Use seu conhecimento sobre o mercado brasileiro para enriquecer o ICP.\n";

  return `Você é um especialista em marketing B2B e definição de ICP (Ideal Customer Profile) para o mercado brasileiro.

O usuário criou um público-alvo com as seguintes informações. Sua tarefa é REFINAR e ENRIQUECER esse ICP com dados de mercado, tornando-o mais preciso e acionável para campanhas de marketing digital.

## Dados do Público-Alvo (inseridos pelo usuário)

- **Nome:** ${input.name}
- **Descrição:** ${input.description}
- **Indústria:** ${input.industry || "Não especificada"}
- **Porte da empresa:** ${input.companySize || "Não especificado"}
- **Localização:** ${input.location || "Não especificada"}
- **Palavras-chave:** ${input.keywords.length > 0 ? input.keywords.join(", ") : "Nenhuma"}
${externalSection}
---

## Instruções de Resposta

Responda EXCLUSIVAMENTE em JSON válido, sem markdown, sem comentários, sem texto antes ou depois. Use o formato exato abaixo:

{
  "refinedDescription": "Descrição refinada e detalhada do ICP em 3-5 frases, incorporando dados de mercado e sendo mais específica que a original",
  "idealProfile": {
    "industry": "Indústria/segmento refinado com sub-segmentos relevantes",
    "companySize": "Porte ideal refinado (ex: PMEs de 50-200 funcionários, faturamento R$ 5-50M/ano)",
    "location": "Localização refinada com contexto regional",
    "decisionMakers": ["Cargo/papel decisor 1", "Cargo/papel decisor 2", "..."],
    "painPoints": ["Dor principal 1", "Dor principal 2", "Dor principal 3", "..."],
    "buyingTriggers": ["Gatilho de compra 1", "Gatilho de compra 2", "..."],
    "budgetRange": "Faixa de investimento típica para este perfil (ex: R$ 5.000-15.000/mês em marketing digital)"
  },
  "demographicInsights": "Dados demográficos e econômicos relevantes do mercado-alvo (tamanho do mercado, crescimento, concentração geográfica)",
  "marketContext": "Contexto de mercado atual: tendências, desafios do setor, oportunidades para marketing B2B",
  "suggestedKeywords": ["keyword refinada 1", "keyword refinada 2", "keyword refinada 3", "..."],
  "recommendations": [
    "Recomendação estratégica 1 para atingir este ICP",
    "Recomendação estratégica 2",
    "Recomendação estratégica 3"
  ]
}

Forneça entre 3-5 decisionMakers, 4-6 painPoints, 3-5 buyingTriggers, 6-10 suggestedKeywords e 3-5 recommendations. Todas as informações devem ser relevantes para o mercado brasileiro.`;
}

// =====================================================
// CALL AI APIs (reusing pattern from aiAnalyzer)
// =====================================================

async function callGeminiApi(apiKey: string, model: string, prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Erro na API Gemini (${response.status}): ${errorData?.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Resposta vazia da API Gemini");
  return text;
}

async function callClaudeApi(apiKey: string, model: string, prompt: string): Promise<string> {
  const maxTokens = getClaudeMaxTokens(model);
  const response = await fetch("/api/claude-proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey, model, prompt, maxTokens }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Erro na API Claude: ${data?.error || response.statusText}`);
  }
  if (!data?.text) throw new Error("Resposta vazia da API Claude");
  return data.text;
}

// =====================================================
// PARSE RESPONSE
// =====================================================

function parseIcpResponse(
  text: string,
  provider: string,
  model: string,
  dataSources: { source: string; success: boolean }[]
): IcpEnrichmentResult {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  return {
    refinedDescription: parsed.refinedDescription || "",
    idealProfile: {
      industry: parsed.idealProfile?.industry || "",
      companySize: parsed.idealProfile?.companySize || "",
      location: parsed.idealProfile?.location || "",
      decisionMakers: parsed.idealProfile?.decisionMakers || [],
      painPoints: parsed.idealProfile?.painPoints || [],
      buyingTriggers: parsed.idealProfile?.buyingTriggers || [],
      budgetRange: parsed.idealProfile?.budgetRange || "",
    },
    demographicInsights: parsed.demographicInsights || "",
    marketContext: parsed.marketContext || "",
    suggestedKeywords: parsed.suggestedKeywords || [],
    recommendations: parsed.recommendations || [],
    dataSources,
    provider,
    model,
    enrichedAt: new Date().toISOString(),
  };
}

function parseEditorialResponse(text: string): EditorialLine[] {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);
  const lines = Array.isArray(parsed.lines) ? parsed.lines : Array.isArray(parsed) ? parsed : [];
  return lines.map((l: any) => ({
    headline: l.headline || "",
    message: l.message || "",
    cta: l.cta || "",
    caption: l.caption || "",
    audienceName: l.audienceName || l.audience || undefined,
  }));
}

function parseProjectEditorialResponse(text: string): EditorialLine[] {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) cleaned = cleaned.slice(7);
  if (cleaned.startsWith("```")) cleaned = cleaned.slice(3);
  if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);
  const lines = Array.isArray(parsed.lines) ? parsed.lines : [];
  return lines.map((l: any) => ({
    audienceName: l.audienceName || l.audience || undefined,
    headline: l.headline || "",
    message: l.message || "",
    cta: l.cta || "",
    caption: l.caption || "",
  }));
}

// =====================================================
// MAIN: RUN ICP ENRICHMENT
// =====================================================

export async function runIcpEnrichment(
  userId: string,
  audienceId: string,
  input: IcpEnrichmentInput,
  overrideProvider?: "google_gemini" | "anthropic_claude",
  overrideModel?: string
): Promise<IcpEnrichmentResult> {
  // 1. Get user API key
  const allKeys = await getUserActiveKeys(userId);
  let apiKeyEntry: UserApiKey | null = null;

  if (overrideProvider) {
    apiKeyEntry = allKeys.find((k) => k.provider === overrideProvider) || null;
  } else {
    apiKeyEntry = allKeys[0] || null;
  }

  if (!apiKeyEntry) {
    throw new Error("Nenhuma API key ativa encontrada. Configure em Configurações → Integrações de IA.");
  }

  const modelToUse = overrideModel || apiKeyEntry.preferred_model;

  // 2. Fetch external data from public sources
  const externalData = await fetchEnrichmentData(
    input.industry || "",
    input.location || "",
    input.companySize || "",
    input.keywords
  );

  // 3. Build prompt
  const prompt = buildIcpPrompt(input, externalData);

  // 4. Call AI
  let responseText: string;

  if (apiKeyEntry.provider === "google_gemini") {
    responseText = await callGeminiApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else if (apiKeyEntry.provider === "anthropic_claude") {
    responseText = await callClaudeApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else {
    throw new Error(`Provider não suportado: ${apiKeyEntry.provider}`);
  }

  // 5. Parse
  const dataSources = externalData.sources.map((s) => ({ source: s.source, success: s.success }));
  const result = parseIcpResponse(responseText, apiKeyEntry.provider, modelToUse, dataSources);

  // 6. Save to audience
  await (supabase as any)
    .from("audiences")
    .update({
      icp_enrichment: result,
      icp_enriched_at: result.enrichedAt,
    })
    .eq("id", audienceId)
    .eq("user_id", userId);

  return result;
}

export async function generateEditorialLine(
  userId: string,
  audienceId: string,
  icp: IcpEnrichmentResult,
  project?: ProjectContext,
  overrideProvider?: "google_gemini" | "anthropic_claude",
  overrideModel?: string
): Promise<EditorialLine[]> {
  const allKeys = await getUserActiveKeys(userId);
  let apiKeyEntry: UserApiKey | null = null;

  if (overrideProvider) {
    apiKeyEntry = allKeys.find((k) => k.provider === overrideProvider) || null;
  } else {
    apiKeyEntry = allKeys[0] || null;
  }

  if (!apiKeyEntry) {
    throw new Error("Nenhuma API key ativa encontrada. Configure em Configurações → Integrações de IA.");
  }

  const modelToUse = overrideModel || apiKeyEntry.preferred_model;
  const prompt = buildEditorialPrompt(audienceId, icp, project);

  let responseText: string;
  if (apiKeyEntry.provider === "google_gemini") {
    responseText = await callGeminiApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else if (apiKeyEntry.provider === "anthropic_claude") {
    responseText = await callClaudeApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else {
    throw new Error(`Provider não suportado: ${apiKeyEntry.provider}`);
  }

  return parseEditorialResponse(responseText);
}

export async function generateProjectEditorialPlan(
  userId: string,
  projectName: string,
  audiences: { id: string; name: string; icp: IcpEnrichmentResult }[],
  project?: ProjectContext,
  overrideProvider?: "google_gemini" | "anthropic_claude",
  overrideModel?: string
): Promise<EditorialLine[]> {
  if (audiences.length === 0) return [];

  const allKeys = await getUserActiveKeys(userId);
  let apiKeyEntry: UserApiKey | null = null;

  if (overrideProvider) {
    apiKeyEntry = allKeys.find((k) => k.provider === overrideProvider) || null;
  } else {
    apiKeyEntry = allKeys[0] || null;
  }

  if (!apiKeyEntry) {
    throw new Error("Nenhuma API key ativa encontrada. Configure em Configurações → Integrações de IA.");
  }

  const modelToUse = overrideModel || apiKeyEntry.preferred_model;
  const prompt = buildProjectEditorialPrompt(projectName, audiences.map((a) => ({ name: a.name, icp: a.icp })), project);

  let responseText: string;
  if (apiKeyEntry.provider === "google_gemini") {
    responseText = await callGeminiApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else if (apiKeyEntry.provider === "anthropic_claude") {
    responseText = await callClaudeApi(apiKeyEntry.api_key_encrypted, modelToUse, prompt);
  } else {
    throw new Error(`Provider não suportado: ${apiKeyEntry.provider}`);
  }

  return parseProjectEditorialResponse(responseText);
}
