export type CampaignChannel = "google" | "meta" | "linkedin" | "tiktok";

export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface Campaign {
  id: string;
  user_id: string;
  project_id: string;
  tactical_plan_id: string | null;
  tactical_channel_plan_id: string | null;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  objective: string | null;
  notes: string | null;
  budget_total: number;
  budget_spent: number;
  start_date: string | null;
  end_date: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CampaignWithProject extends Campaign {
  project_name?: string;
  budget_pacing?: number;
  total_impressions?: number;
  total_clicks?: number;
  total_conversions?: number;
  total_cost?: number;
}

export type MetricSource = "manual" | "api" | "import";

export interface CampaignMetrics {
  id: string;
  campaign_id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cpa: number;
  roas: number;
  cost: number;
  reach: number;
  frequency: number;
  video_views: number;
  vtr: number;
  leads: number;
  cpl: number;
  quality_score: number;
  avg_position: number;
  search_impression_share: number;
  engagement_rate: number;
  revenue: number;
  sessions: number;
  first_visits: number;
  leads_month: number;
  mql_rate: number;
  sql_rate: number;
  clients_web: number;
  revenue_web: number;
  avg_ticket: number;
  google_ads_cost: number;
  cac_month: number;
  cost_per_conversion: number;
  ltv: number;
  cac_ltv_ratio: number;
  cac_ltv_benchmark: number;
  roi_accumulated: number;
  roi_period_months: number;
  notes: string;
  source: MetricSource;
  custom_metrics: Record<string, unknown>;
  created_at: string;
}

export interface MetricsSummary {
  campaign_id: string;
  campaign_name: string;
  channel: CampaignChannel;
  project_id: string;
  total_entries: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_leads: number;
  total_cost: number;
  total_revenue: number;
  total_sessions: number;
  total_first_visits: number;
  total_leads_month: number;
  total_clients_web: number;
  total_revenue_web: number;
  total_google_ads_cost: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_cpa: number;
  avg_cpl: number;
  calc_roas: number;
  avg_mql_rate: number;
  avg_sql_rate: number;
  avg_ticket: number;
  calc_cac: number;
  avg_ltv: number;
  avg_cac_ltv_ratio: number;
  avg_roi_accumulated: number;
  max_roi_period_months: number;
  first_period: string;
  last_period: string;
}

export interface MetricFieldConfig {
  key: string;
  label: string;
  suffix?: string;
  prefix?: string;
  type: "integer" | "decimal" | "currency" | "percent";
}

export const COMMON_METRICS: MetricFieldConfig[] = [
  { key: "impressions", label: "Impressões", type: "integer" },
  { key: "clicks", label: "Cliques", type: "integer" },
  { key: "ctr", label: "CTR", suffix: "%", type: "percent" },
  { key: "cpc", label: "CPC", prefix: "R$", type: "currency" },
  { key: "cpm", label: "CPM", prefix: "R$", type: "currency" },
  { key: "conversions", label: "Conversões", type: "integer" },
  { key: "cpa", label: "CPA", prefix: "R$", type: "currency" },
  { key: "cost", label: "Custo Total", prefix: "R$", type: "currency" },
  { key: "revenue", label: "Receita", prefix: "R$", type: "currency" },
  { key: "roas", label: "ROAS", suffix: "x", type: "decimal" },
];

export const CHANNEL_SPECIFIC_METRICS: Record<CampaignChannel, MetricFieldConfig[]> = {
  google: [
    { key: "sessions", label: "Sessões", type: "integer" },
    { key: "first_visits", label: "Primeira Visita", type: "integer" },
    { key: "leads_month", label: "Leads do Mês", type: "integer" },
    { key: "mql_rate", label: "Taxa Usuário → MQL", suffix: "%", type: "percent" },
    { key: "sql_rate", label: "Taxa Lead → SQL", suffix: "%", type: "percent" },
    { key: "clients_web", label: "Clientes Web", type: "integer" },
    { key: "revenue_web", label: "Receita Web", prefix: "R$", type: "currency" },
    { key: "avg_ticket", label: "Ticket Médio", prefix: "R$", type: "currency" },
    { key: "google_ads_cost", label: "Custo Google Ads", prefix: "R$", type: "currency" },
    { key: "cac_month", label: "CAC/Mês", prefix: "R$", type: "currency" },
    { key: "cost_per_conversion", label: "Custo por Conversão", prefix: "R$", type: "currency" },
    { key: "ltv", label: "LTV", prefix: "R$", type: "currency" },
    { key: "cac_ltv_ratio", label: "Relação CAC:LTV", suffix: "x", type: "decimal" },
    { key: "cac_ltv_benchmark", label: "Benchmark CAC:LTV", suffix: "x", type: "decimal" },
    { key: "roi_accumulated", label: "ROI Acumulado", suffix: "%", type: "percent" },
    { key: "roi_period_months", label: "Período ROI (meses)", type: "integer" },
    { key: "quality_score", label: "Índice de Qualidade", type: "decimal" },
    { key: "avg_position", label: "Posição Média", type: "decimal" },
    { key: "search_impression_share", label: "Impression Share", suffix: "%", type: "percent" },
  ],
  meta: [
    { key: "reach", label: "Alcance", type: "integer" },
    { key: "frequency", label: "Frequência", type: "decimal" },
  ],
  linkedin: [
    { key: "leads", label: "Leads", type: "integer" },
    { key: "cpl", label: "CPL", prefix: "R$", type: "currency" },
    { key: "engagement_rate", label: "Engagement Rate", suffix: "%", type: "percent" },
  ],
  tiktok: [
    { key: "video_views", label: "Video Views", type: "integer" },
    { key: "vtr", label: "VTR", suffix: "%", type: "percent" },
  ],
};

export interface BudgetAllocation {
  id: string;
  user_id: string;
  project_id: string;
  channel: CampaignChannel;
  month: number;
  year: number;
  planned_budget: number;
  actual_spent: number;
  created_at: string;
  updated_at: string;
}

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Rascunho",
  active: "Ativa",
  paused: "Pausada",
  completed: "Concluída",
  archived: "Arquivada",
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  paused: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  archived: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  linkedin: "LinkedIn Ads",
  tiktok: "TikTok Ads",
};

export const CHANNEL_COLORS: Record<CampaignChannel, string> = {
  google: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  meta: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
  linkedin: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
  tiktok: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
};

export const CAMPAIGN_STATUS_FLOW: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ["active"],
  active: ["paused", "completed"],
  paused: ["active", "completed"],
  completed: ["archived"],
  archived: [],
};
