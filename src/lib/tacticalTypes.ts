// Tactical Layer — Application-level types and constants

export type ChannelKey = "google" | "meta" | "linkedin" | "tiktok";

export interface ChannelConfig {
  key: ChannelKey;
  label: string;
  fullLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  campaignTypes: string[];
  funnelStages: string[];
  biddingStrategies: string[];
  extensions: string[];
}

export const CHANNELS: Record<ChannelKey, ChannelConfig> = {
  google: {
    key: "google",
    label: "Google",
    fullLabel: "Google Ads",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    campaignTypes: ["Search", "Performance Max", "Display", "YouTube", "Discovery", "Shopping"],
    funnelStages: ["Awareness", "Consideration", "Conversion", "Retention"],
    biddingStrategies: [
      "Maximizar Cliques",
      "Maximizar Conversões",
      "CPA Alvo",
      "ROAS Alvo",
      "Parcela de Impressões",
      "CPC Manual",
    ],
    extensions: [
      "Sitelinks",
      "Frases de Destaque",
      "Snippets Estruturados",
      "Extensão de Chamada",
      "Extensão de Local",
      "Extensão de Preço",
      "Extensão de Promoção",
      "Extensão de Imagem",
    ],
  },
  meta: {
    key: "meta",
    label: "Meta",
    fullLabel: "Meta Ads",
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
    campaignTypes: ["Reconhecimento", "Tráfego", "Engajamento", "Leads", "Vendas", "Promoção de App"],
    funnelStages: ["Awareness", "Consideration", "Conversion"],
    biddingStrategies: [
      "Menor Custo",
      "Custo por Resultado Alvo",
      "ROAS Mínimo",
      "Limite de Lance",
    ],
    extensions: [],
  },
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    fullLabel: "LinkedIn Ads",
    color: "text-sky-700",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30",
    campaignTypes: ["Sponsored Content", "Message Ads", "Dynamic Ads", "Text Ads", "Document Ads"],
    funnelStages: ["Awareness", "Consideration", "Conversion"],
    biddingStrategies: [
      "Entrega Máxima",
      "Custo Alvo",
      "Lance Manual",
    ],
    extensions: [],
  },
  tiktok: {
    key: "tiktok",
    label: "TikTok",
    fullLabel: "TikTok Ads",
    color: "text-gray-900 dark:text-gray-100",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30",
    campaignTypes: ["In-Feed Ads", "TopView", "Spark Ads", "Brand Takeover", "Branded Effects"],
    funnelStages: ["Awareness", "Consideration", "Conversion"],
    biddingStrategies: [
      "Menor Custo",
      "Custo por Resultado",
      "Limite de Lance",
    ],
    extensions: [],
  },
};

export const CHANNEL_LIST: ChannelConfig[] = Object.values(CHANNELS);

export const FUNNEL_STAGES = [
  { value: "awareness", label: "Topo — Awareness", color: "text-blue-600 bg-blue-500/10" },
  { value: "consideration", label: "Meio — Consideration", color: "text-amber-600 bg-amber-500/10" },
  { value: "conversion", label: "Fundo — Conversion", color: "text-green-600 bg-green-500/10" },
  { value: "retention", label: "Pós-venda — Retention", color: "text-purple-600 bg-purple-500/10" },
] as const;

export const COPY_FRAMEWORK_TYPES = [
  {
    value: "pain_solution_proof_cta" as const,
    label: "Dor → Solução → Prova → CTA",
    description: "Identifica a dor do público, apresenta a solução, comprova com evidência e direciona para ação.",
    steps: ["Dor / Problema", "Solução / Benefício", "Prova / Evidência", "CTA / Chamada para Ação"],
  },
  {
    value: "comparison" as const,
    label: "Comparação",
    description: "Compara a situação atual (sem a solução) com o cenário ideal (com a solução).",
    steps: ["Cenário Atual (Sem)", "Cenário Ideal (Com)", "Diferencial", "CTA"],
  },
  {
    value: "authority" as const,
    label: "Autoridade",
    description: "Posiciona a marca como referência no assunto com dados, credenciais e prova social.",
    steps: ["Credencial / Dado", "Expertise Demonstrada", "Resultado Comprovado", "CTA"],
  },
  {
    value: "custom" as const,
    label: "Personalizado",
    description: "Framework customizado para necessidades específicas do canal ou campanha.",
    steps: ["Etapa 1", "Etapa 2", "Etapa 3", "CTA"],
  },
];

export const QUALITY_SCORE_FACTORS = [
  { key: "ad_relevance", label: "Relevância do Anúncio", description: "Quão relevante é o anúncio para a intenção de busca" },
  { key: "landing_page", label: "Experiência da Landing Page", description: "Qualidade e relevância da página de destino" },
  { key: "expected_ctr", label: "CTR Esperado", description: "Probabilidade de clique baseada no histórico" },
];

export interface TacticalAlert {
  type: "warning" | "error" | "info";
  channel: ChannelKey;
  title: string;
  description: string;
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-green-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

export function getScoreBgColor(score: number): string {
  if (score >= 70) return "bg-green-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 70) return "Bom";
  if (score >= 50) return "Regular";
  if (score >= 30) return "Fraco";
  return "Crítico";
}
