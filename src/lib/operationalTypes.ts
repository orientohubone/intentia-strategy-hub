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

// --- Tactical vs Real Gap Analysis ---

export type GapStatus = "on_track" | "above" | "below" | "critical" | "no_data";

export interface TacticalMetricTarget {
  metric: string;
  target: string;
}

export interface TacticalChannelPlanSummary {
  id: string;
  channel: CampaignChannel;
  campaign_type: string | null;
  funnel_stage: string | null;
  funnel_role: string | null;
  bidding_strategy: string | null;
  key_metrics: TacticalMetricTarget[];
  tactical_score: number;
  coherence_score: number;
  clarity_score: number;
  segmentation_score: number;
}

export interface MetricGap {
  metric: string;
  planned: string;
  actual: number | null;
  gap: number | null;
  gapPercent: number | null;
  status: GapStatus;
  unit: string;
}

export interface ChannelGapAnalysis {
  channel: CampaignChannel;
  tacticalPlan: TacticalChannelPlanSummary | null;
  campaigns: { id: string; name: string; status: CampaignStatus }[];
  metricGaps: MetricGap[];
  adherenceScore: number;
  structureMatch: {
    campaignTypeMatch: boolean;
    funnelStageMatch: boolean;
    biddingStrategyMatch: boolean;
  };
  summary: string;
}

export interface ProjectGapAnalysis {
  projectId: string;
  projectName: string;
  overallAdherence: number;
  channelGaps: ChannelGapAnalysis[];
  totalCampaigns: number;
  activeCampaigns: number;
  channelsPlanned: number;
  channelsExecuted: number;
}

export const GAP_STATUS_CONFIG: Record<GapStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  on_track: { label: "No alvo", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/40", icon: "check" },
  above: { label: "Acima", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/40", icon: "trending-up" },
  below: { label: "Abaixo", color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/40", icon: "trending-down" },
  critical: { label: "Crítico", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/40", icon: "alert" },
  no_data: { label: "Sem dados", color: "text-gray-500 dark:text-gray-400", bgColor: "bg-gray-100 dark:bg-gray-800", icon: "minus" },
};

const METRIC_KEY_MAP: Record<string, { key: string; unit: string }> = {
  "ctr": { key: "avg_ctr", unit: "%" },
  "cpc": { key: "avg_cpc", unit: "R$" },
  "cpa": { key: "avg_cpa", unit: "R$" },
  "cpl": { key: "avg_cpl", unit: "R$" },
  "roas": { key: "calc_roas", unit: "x" },
  "conversões": { key: "total_conversions", unit: "" },
  "conversoes": { key: "total_conversions", unit: "" },
  "impressões": { key: "total_impressions", unit: "" },
  "impressoes": { key: "total_impressions", unit: "" },
  "cliques": { key: "total_clicks", unit: "" },
  "leads": { key: "total_leads", unit: "" },
  "custo": { key: "total_cost", unit: "R$" },
  "receita": { key: "total_revenue", unit: "R$" },
  "quality score": { key: "quality_score", unit: "" },
  "índice de qualidade": { key: "quality_score", unit: "" },
  "posição média": { key: "avg_position", unit: "" },
  "impression share": { key: "search_impression_share", unit: "%" },
  "alcance": { key: "reach", unit: "" },
  "frequência": { key: "frequency", unit: "" },
  "engagement rate": { key: "engagement_rate", unit: "%" },
  "video views": { key: "video_views", unit: "" },
  "vtr": { key: "vtr", unit: "%" },
  "sessões": { key: "total_sessions", unit: "" },
  "sessoes": { key: "total_sessions", unit: "" },
  "cac": { key: "calc_cac", unit: "R$" },
  "ltv": { key: "avg_ltv", unit: "R$" },
  "cac:ltv": { key: "avg_cac_ltv_ratio", unit: "x" },
  "roi": { key: "avg_roi_accumulated", unit: "%" },
};

export function parseMetricTarget(target: string): { value: number; unit: string } | null {
  if (!target) return null;
  const cleaned = target.replace(/[R$%x]/g, "").replace(",", ".").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  const unit = target.includes("%") ? "%" : target.includes("R$") ? "R$" : target.includes("x") ? "x" : "";
  return { value: num, unit };
}

export function matchMetricToSummary(metricLabel: string): { key: string; unit: string } | null {
  const lower = metricLabel.toLowerCase().trim();
  for (const [pattern, mapping] of Object.entries(METRIC_KEY_MAP)) {
    if (lower.includes(pattern)) return mapping;
  }
  return null;
}

export function computeGapStatus(planned: number, actual: number, isLowerBetter: boolean): GapStatus {
  if (planned === 0) return "no_data";
  const ratio = actual / planned;
  if (isLowerBetter) {
    if (ratio <= 1.0) return "on_track";
    if (ratio <= 1.15) return "above";
    if (ratio <= 1.5) return "below";
    return "critical";
  } else {
    if (ratio >= 0.9) return ratio >= 1.0 ? "above" : "on_track";
    if (ratio >= 0.7) return "below";
    return "critical";
  }
}

const LOWER_IS_BETTER_METRICS = new Set(["avg_cpc", "avg_cpa", "avg_cpl", "total_cost", "calc_cac", "avg_position"]);

export function buildMetricGaps(
  keyMetrics: TacticalMetricTarget[],
  summaryData: Record<string, number | null>
): MetricGap[] {
  return keyMetrics.map(({ metric, target }) => {
    const parsed = parseMetricTarget(target);
    const mapping = matchMetricToSummary(metric);

    if (!parsed || !mapping) {
      return { metric, planned: target, actual: null, gap: null, gapPercent: null, status: "no_data" as GapStatus, unit: "" };
    }

    const actual = summaryData[mapping.key] ?? null;
    if (actual === null || actual === undefined) {
      return { metric, planned: target, actual: null, gap: null, gapPercent: null, status: "no_data" as GapStatus, unit: mapping.unit || parsed.unit };
    }

    const gap = actual - parsed.value;
    const gapPercent = parsed.value !== 0 ? ((actual - parsed.value) / parsed.value) * 100 : null;
    const isLowerBetter = LOWER_IS_BETTER_METRICS.has(mapping.key);
    const status = computeGapStatus(parsed.value, actual, isLowerBetter);

    return { metric, planned: target, actual, gap, gapPercent, status, unit: mapping.unit || parsed.unit };
  });
}

export function computeAdherenceScore(gaps: MetricGap[], structureMatch: { campaignTypeMatch: boolean; funnelStageMatch: boolean; biddingStrategyMatch: boolean }): number {
  let score = 0;
  let total = 0;

  // Structure adherence (30%)
  const structurePoints = [structureMatch.campaignTypeMatch, structureMatch.funnelStageMatch, structureMatch.biddingStrategyMatch]
    .filter(Boolean).length;
  score += (structurePoints / 3) * 30;
  total += 30;

  // Metric adherence (70%)
  const metricsWithData = gaps.filter((g) => g.status !== "no_data");
  if (metricsWithData.length > 0) {
    const metricScore = metricsWithData.reduce((sum, g) => {
      if (g.status === "on_track" || g.status === "above") return sum + 1;
      if (g.status === "below") return sum + 0.5;
      return sum;
    }, 0);
    score += (metricScore / metricsWithData.length) * 70;
  }
  total += 70;

  return Math.round((score / total) * 100);
}

// --- Performance Alerts Engine ---

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertCategory = "budget" | "efficiency" | "conversion" | "trend" | "quality" | "pacing";

export interface PerformanceAlert {
  id: string;
  campaignId: string;
  campaignName: string;
  channel: CampaignChannel;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  unit: string;
}

export const ALERT_SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  critical: { label: "Crítico", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/40", borderColor: "border-red-200 dark:border-red-800", icon: "alert-triangle" },
  warning: { label: "Atenção", color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-950/40", borderColor: "border-amber-200 dark:border-amber-800", icon: "alert-circle" },
  info: { label: "Info", color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-50 dark:bg-blue-950/40", borderColor: "border-blue-200 dark:border-blue-800", icon: "info" },
};

export const ALERT_CATEGORY_CONFIG: Record<AlertCategory, { label: string; icon: string }> = {
  budget: { label: "Budget", icon: "dollar-sign" },
  efficiency: { label: "Eficiência", icon: "trending-down" },
  conversion: { label: "Conversão", icon: "target" },
  trend: { label: "Tendência", icon: "trending-up" },
  quality: { label: "Qualidade", icon: "star" },
  pacing: { label: "Pacing", icon: "clock" },
};

interface AlertRule {
  id: string;
  category: AlertCategory;
  check: (campaign: AlertCampaignData, summary: AlertSummaryData) => PerformanceAlert | null;
}

export interface AlertCampaignData {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  budget_total: number;
  budget_spent: number;
  start_date: string | null;
  end_date: string | null;
}

export interface AlertSummaryData {
  total_entries: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_leads: number;
  total_cost: number;
  total_revenue: number;
  total_sessions: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_cpa: number;
  avg_cpl: number;
  calc_roas: number;
  calc_cac: number;
  avg_ltv: number;
  avg_cac_ltv_ratio: number;
  avg_roi_accumulated: number;
}

function makeAlert(
  campaign: AlertCampaignData,
  severity: AlertSeverity,
  category: AlertCategory,
  title: string,
  description: string,
  metric: string,
  currentValue: number,
  threshold: number,
  unit: string
): PerformanceAlert {
  return {
    id: `${campaign.id}-${category}-${metric}`,
    campaignId: campaign.id,
    campaignName: campaign.name,
    channel: campaign.channel,
    severity,
    category,
    title,
    description,
    metric,
    currentValue,
    threshold,
    unit,
  };
}

const PERFORMANCE_ALERT_RULES: AlertRule[] = [
  // --- BUDGET ---
  {
    id: "budget_overspend",
    category: "budget",
    check: (c, _s) => {
      if (c.budget_total <= 0) return null;
      const pct = (c.budget_spent / c.budget_total) * 100;
      if (pct >= 100) return makeAlert(c, "critical", "budget", "Budget estourado", `A campanha "${c.name}" gastou ${pct.toFixed(0)}% do budget total.`, "budget_pacing", pct, 100, "%");
      if (pct >= 90) return makeAlert(c, "warning", "budget", "Budget quase esgotado", `A campanha "${c.name}" já consumiu ${pct.toFixed(0)}% do budget.`, "budget_pacing", pct, 90, "%");
      return null;
    },
  },
  {
    id: "budget_underutilized",
    category: "pacing",
    check: (c, _s) => {
      if (c.budget_total <= 0 || c.status !== "active" || !c.start_date) return null;
      const daysSinceStart = Math.max(1, Math.floor((Date.now() - new Date(c.start_date + "T00:00:00").getTime()) / 86400000));
      if (daysSinceStart < 7) return null;
      const totalDays = c.end_date ? Math.max(1, Math.floor((new Date(c.end_date + "T00:00:00").getTime() - new Date(c.start_date + "T00:00:00").getTime()) / 86400000)) : daysSinceStart * 2;
      const expectedPct = (daysSinceStart / totalDays) * 100;
      const actualPct = (c.budget_spent / c.budget_total) * 100;
      if (actualPct < expectedPct * 0.5 && expectedPct > 20) return makeAlert(c, "info", "pacing", "Budget subutilizado", `A campanha "${c.name}" gastou apenas ${actualPct.toFixed(0)}% quando o esperado seria ~${expectedPct.toFixed(0)}%.`, "budget_pacing_expected", actualPct, expectedPct * 0.5, "%");
      return null;
    },
  },
  // --- EFFICIENCY ---
  {
    id: "ctr_low",
    category: "efficiency",
    check: (c, s) => {
      if (s.total_entries < 1 || s.total_impressions < 100) return null;
      const thresholds: Record<CampaignChannel, number> = { google: 1.5, meta: 0.8, linkedin: 0.4, tiktok: 0.5 };
      const threshold = thresholds[c.channel] || 1.0;
      if (s.avg_ctr < threshold) return makeAlert(c, "warning", "efficiency", "CTR abaixo do esperado", `CTR de ${s.avg_ctr.toFixed(2)}% está abaixo do mínimo recomendado de ${threshold}% para ${CHANNEL_LABELS[c.channel]}.`, "avg_ctr", s.avg_ctr, threshold, "%");
      return null;
    },
  },
  {
    id: "cpc_high",
    category: "efficiency",
    check: (c, s) => {
      if (s.total_entries < 1 || s.avg_cpc <= 0) return null;
      const thresholds: Record<CampaignChannel, number> = { google: 8, meta: 5, linkedin: 15, tiktok: 4 };
      const threshold = thresholds[c.channel] || 8;
      if (s.avg_cpc > threshold) return makeAlert(c, "warning", "efficiency", "CPC elevado", `CPC médio de R$ ${s.avg_cpc.toFixed(2)} está acima de R$ ${threshold.toFixed(2)} para ${CHANNEL_LABELS[c.channel]}.`, "avg_cpc", s.avg_cpc, threshold, "R$");
      return null;
    },
  },
  // --- CONVERSION ---
  {
    id: "zero_conversions",
    category: "conversion",
    check: (c, s) => {
      if (s.total_entries < 2 || s.total_clicks < 50) return null;
      if (s.total_conversions === 0 && s.total_leads === 0) return makeAlert(c, "critical", "conversion", "Sem conversões", `A campanha "${c.name}" tem ${s.total_clicks} cliques mas nenhuma conversão ou lead registrado.`, "total_conversions", 0, 1, "");
      return null;
    },
  },
  {
    id: "cpa_high",
    category: "conversion",
    check: (c, s) => {
      if (s.total_entries < 1 || s.avg_cpa <= 0) return null;
      const thresholds: Record<CampaignChannel, number> = { google: 150, meta: 100, linkedin: 250, tiktok: 80 };
      const threshold = thresholds[c.channel] || 150;
      if (s.avg_cpa > threshold) return makeAlert(c, s.avg_cpa > threshold * 2 ? "critical" : "warning", "conversion", "CPA elevado", `CPA médio de R$ ${s.avg_cpa.toFixed(2)} está acima do benchmark de R$ ${threshold.toFixed(2)} para ${CHANNEL_LABELS[c.channel]}.`, "avg_cpa", s.avg_cpa, threshold, "R$");
      return null;
    },
  },
  {
    id: "roas_low",
    category: "conversion",
    check: (c, s) => {
      if (s.total_entries < 1 || s.total_revenue <= 0 || s.total_cost <= 0) return null;
      if (s.calc_roas < 1) return makeAlert(c, "critical", "conversion", "ROAS negativo", `ROAS de ${s.calc_roas.toFixed(2)}x indica que a campanha "${c.name}" está gastando mais do que gerando.`, "calc_roas", s.calc_roas, 1, "x");
      if (s.calc_roas < 2) return makeAlert(c, "warning", "conversion", "ROAS baixo", `ROAS de ${s.calc_roas.toFixed(2)}x está abaixo do mínimo recomendado de 2x.`, "calc_roas", s.calc_roas, 2, "x");
      return null;
    },
  },
  // --- QUALITY (Google B2B) ---
  {
    id: "cac_ltv_bad",
    category: "quality",
    check: (c, s) => {
      if (c.channel !== "google" || s.calc_cac <= 0 || s.avg_ltv <= 0) return null;
      const ratio = s.avg_cac_ltv_ratio;
      if (ratio > 0 && ratio < 1) return makeAlert(c, "critical", "quality", "CAC:LTV desfavorável", `Relação CAC:LTV de ${ratio.toFixed(2)}x indica que o custo de aquisição é maior que o valor do cliente.`, "avg_cac_ltv_ratio", ratio, 1, "x");
      return null;
    },
  },
  {
    id: "roi_negative",
    category: "quality",
    check: (c, s) => {
      if (s.avg_roi_accumulated === 0 || s.total_entries < 2) return null;
      if (s.avg_roi_accumulated < 0) return makeAlert(c, "critical", "quality", "ROI negativo", `ROI acumulado de ${s.avg_roi_accumulated.toFixed(1)}% indica prejuízo na campanha "${c.name}".`, "avg_roi_accumulated", s.avg_roi_accumulated, 0, "%");
      return null;
    },
  },
  // --- TREND ---
  {
    id: "no_metrics",
    category: "trend",
    check: (c, s) => {
      if (c.status !== "active") return null;
      if (!c.start_date) return null;
      const daysSinceStart = Math.floor((Date.now() - new Date(c.start_date + "T00:00:00").getTime()) / 86400000);
      if (daysSinceStart >= 7 && s.total_entries === 0) return makeAlert(c, "info", "trend", "Sem métricas registradas", `A campanha "${c.name}" está ativa há ${daysSinceStart} dias mas não tem métricas registradas.`, "total_entries", 0, 1, "");
      return null;
    },
  },
  {
    id: "high_spend_low_results",
    category: "trend",
    check: (c, s) => {
      if (s.total_cost < 500 || s.total_entries < 2) return null;
      if (s.total_conversions === 0 && s.total_leads === 0 && s.total_revenue === 0) return makeAlert(c, "critical", "trend", "Alto investimento sem resultados", `R$ ${s.total_cost.toFixed(2)} investidos sem conversões, leads ou receita registrados.`, "total_cost", s.total_cost, 500, "R$");
      return null;
    },
  },
];

export function evaluatePerformanceAlerts(
  campaigns: AlertCampaignData[],
  summaries: Record<string, AlertSummaryData>
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];

  for (const campaign of campaigns) {
    if (campaign.status === "archived" || campaign.status === "completed") continue;
    const summary = summaries[campaign.id];
    if (!summary) {
      // Still check budget and no-metrics rules with empty summary
      const emptySummary: AlertSummaryData = {
        total_entries: 0, total_impressions: 0, total_clicks: 0, total_conversions: 0,
        total_leads: 0, total_cost: 0, total_revenue: 0, total_sessions: 0,
        avg_ctr: 0, avg_cpc: 0, avg_cpa: 0, avg_cpl: 0, calc_roas: 0,
        calc_cac: 0, avg_ltv: 0, avg_cac_ltv_ratio: 0, avg_roi_accumulated: 0,
      };
      for (const rule of PERFORMANCE_ALERT_RULES) {
        const alert = rule.check(campaign, emptySummary);
        if (alert) alerts.push(alert);
      }
      continue;
    }

    for (const rule of PERFORMANCE_ALERT_RULES) {
      const alert = rule.check(campaign, summary);
      if (alert) alerts.push(alert);
    }
  }

  // Sort: critical first, then warning, then info
  const severityOrder: Record<AlertSeverity, number> = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

// --- Budget Management ---

export interface BudgetAllocationRow {
  id: string;
  user_id: string;
  project_id: string;
  project_name?: string;
  channel: CampaignChannel;
  month: number;
  year: number;
  planned_budget: number;
  actual_spent: number;
  pacing_percent: number;
  remaining: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetProjectSummary {
  project_id: string;
  project_name: string;
  month: number;
  year: number;
  channels: BudgetAllocationRow[];
  total_planned: number;
  total_spent: number;
  total_remaining: number;
  overall_pacing: number;
  projected_spend: number;
  projected_pacing: number;
}

export type BudgetPacingStatus = "healthy" | "caution" | "danger" | "overspent";

export const BUDGET_PACING_CONFIG: Record<BudgetPacingStatus, { label: string; color: string; bgColor: string; barColor: string }> = {
  healthy: { label: "Saudável", color: "text-green-600 dark:text-green-400", bgColor: "bg-green-50 dark:bg-green-950/40", barColor: "bg-green-500" },
  caution: { label: "Atenção", color: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-50 dark:bg-yellow-950/40", barColor: "bg-yellow-500" },
  danger: { label: "Crítico", color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-950/40", barColor: "bg-red-500" },
  overspent: { label: "Estourado", color: "text-red-700 dark:text-red-300", bgColor: "bg-red-100 dark:bg-red-900/40", barColor: "bg-red-600" },
};

export function getBudgetPacingStatus(pacingPercent: number): BudgetPacingStatus {
  if (pacingPercent >= 100) return "overspent";
  if (pacingPercent >= 90) return "danger";
  if (pacingPercent >= 70) return "caution";
  return "healthy";
}

export function computeBudgetProjection(actualSpent: number, plannedBudget: number): {
  projectedSpend: number;
  projectedPacing: number;
  projectedRemaining: number;
  willOverspend: boolean;
} {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  if (dayOfMonth === 0 || actualSpent <= 0 || plannedBudget <= 0) {
    return { projectedSpend: 0, projectedPacing: 0, projectedRemaining: plannedBudget, willOverspend: false };
  }

  const dailyRate = actualSpent / dayOfMonth;
  const projectedSpend = Math.round(dailyRate * daysInMonth * 100) / 100;
  const projectedPacing = Math.round((projectedSpend / plannedBudget) * 100 * 10) / 10;
  const projectedRemaining = Math.round((plannedBudget - projectedSpend) * 100) / 100;
  const willOverspend = projectedSpend > plannedBudget;

  return { projectedSpend, projectedPacing, projectedRemaining, willOverspend };
}

export function getExpectedPacing(): number {
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.round((dayOfMonth / daysInMonth) * 100 * 10) / 10;
}

export const MONTH_LABELS: Record<number, string> = {
  1: "Janeiro", 2: "Fevereiro", 3: "Março", 4: "Abril",
  5: "Maio", 6: "Junho", 7: "Julho", 8: "Agosto",
  9: "Setembro", 10: "Outubro", 11: "Novembro", 12: "Dezembro",
};

export function buildBudgetProjectSummary(allocations: BudgetAllocationRow[]): BudgetProjectSummary[] {
  const grouped = new Map<string, BudgetAllocationRow[]>();

  for (const alloc of allocations) {
    const key = `${alloc.project_id}::${alloc.month}::${alloc.year}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(alloc);
  }

  const summaries: BudgetProjectSummary[] = [];

  for (const [, channels] of grouped) {
    const first = channels[0];
    const totalPlanned = channels.reduce((s, c) => s + c.planned_budget, 0);
    const totalSpent = channels.reduce((s, c) => s + c.actual_spent, 0);
    const totalRemaining = totalPlanned - totalSpent;
    const overallPacing = totalPlanned > 0 ? Math.round((totalSpent / totalPlanned) * 100 * 10) / 10 : 0;
    const projection = computeBudgetProjection(totalSpent, totalPlanned);

    summaries.push({
      project_id: first.project_id,
      project_name: first.project_name || "Projeto",
      month: first.month,
      year: first.year,
      channels,
      total_planned: totalPlanned,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      overall_pacing: overallPacing,
      projected_spend: projection.projectedSpend,
      projected_pacing: projection.projectedPacing,
    });
  }

  return summaries.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}
