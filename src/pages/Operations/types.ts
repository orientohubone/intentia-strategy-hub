import type { CampaignChannel, CampaignStatus } from "@/lib/operationalTypes";

export interface MetricsSummaryData {
  campaign_id: string;
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
  project_name?: string;
}

export interface OperationalStats {
  total_campaigns: number;
  active_campaigns: number;
  paused_campaigns: number;
  completed_campaigns: number;
  draft_campaigns: number;
  total_budget: number;
  total_spent: number;
}

export interface CampaignGroup {
  projectId: string;
  projectName: string;
  campaigns: Campaign[];
}

export const defaultFormData = {
  name: "",
  project_id: "",
  channel: "" as string,
  objective: "",
  notes: "",
  budget_total: "",
  start_date: "",
  end_date: "",
};

export type CampaignFormData = typeof defaultFormData;

export const EMPTY_METRICS_SUMMARY: MetricsSummaryData = {
  campaign_id: "",
  total_entries: 0,
  total_impressions: 0,
  total_clicks: 0,
  total_conversions: 0,
  total_leads: 0,
  total_cost: 0,
  total_revenue: 0,
  total_sessions: 0,
  total_first_visits: 0,
  total_leads_month: 0,
  total_clients_web: 0,
  total_revenue_web: 0,
  total_google_ads_cost: 0,
  avg_ctr: 0,
  avg_cpc: 0,
  avg_cpa: 0,
  avg_cpl: 0,
  calc_roas: 0,
  avg_mql_rate: 0,
  avg_sql_rate: 0,
  avg_ticket: 0,
  calc_cac: 0,
  avg_ltv: 0,
  avg_cac_ltv_ratio: 0,
  avg_roi_accumulated: 0,
  max_roi_period_months: 0,
  first_period: "",
  last_period: "",
};
