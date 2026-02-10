-- =============================================================
-- Fase 2b — Métricas Google Expandidas (Funil B2B Completo)
-- Migração: campos de funil, CAC, LTV, ROI em campaign_metrics
-- =============================================================

ALTER TABLE campaign_metrics
  ADD COLUMN IF NOT EXISTS sessions INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS first_visits INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mql_rate NUMERIC(6, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sql_rate NUMERIC(6, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clients_web INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_web NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_ticket NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS google_ads_cost NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cac_month NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cost_per_conversion NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ltv NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cac_ltv_ratio NUMERIC(6, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cac_ltv_benchmark NUMERIC(6, 2) DEFAULT 3,
  ADD COLUMN IF NOT EXISTS roi_accumulated NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS roi_period_months INTEGER DEFAULT 0;

-- =============================================================
-- View atualizada: inclui métricas Google de funil
-- =============================================================

CREATE OR REPLACE VIEW v_campaign_metrics_summary
WITH (security_invoker = true)
AS
SELECT
  cm.campaign_id,
  cm.user_id,
  c.name AS campaign_name,
  c.channel,
  c.project_id,
  COUNT(*) AS total_entries,
  SUM(cm.impressions) AS total_impressions,
  SUM(cm.clicks) AS total_clicks,
  SUM(cm.conversions) AS total_conversions,
  SUM(cm.leads) AS total_leads,
  SUM(cm.cost) AS total_cost,
  SUM(cm.revenue) AS total_revenue,
  -- Google funnel metrics
  SUM(cm.sessions) AS total_sessions,
  SUM(cm.first_visits) AS total_first_visits,
  SUM(cm.leads_month) AS total_leads_month,
  SUM(cm.clients_web) AS total_clients_web,
  SUM(cm.revenue_web) AS total_revenue_web,
  SUM(cm.google_ads_cost) AS total_google_ads_cost,
  -- Averages
  CASE WHEN SUM(cm.impressions) > 0
    THEN ROUND(SUM(cm.clicks)::NUMERIC / SUM(cm.impressions) * 100, 2)
    ELSE 0
  END AS avg_ctr,
  CASE WHEN SUM(cm.clicks) > 0
    THEN ROUND(SUM(cm.cost) / SUM(cm.clicks), 2)
    ELSE 0
  END AS avg_cpc,
  CASE WHEN SUM(cm.conversions) > 0
    THEN ROUND(SUM(cm.cost) / SUM(cm.conversions), 2)
    ELSE 0
  END AS avg_cpa,
  CASE WHEN SUM(cm.leads) > 0
    THEN ROUND(SUM(cm.cost) / SUM(cm.leads), 2)
    ELSE 0
  END AS avg_cpl,
  CASE WHEN SUM(cm.cost) > 0
    THEN ROUND(SUM(cm.revenue) / SUM(cm.cost), 2)
    ELSE 0
  END AS calc_roas,
  -- Google funnel averages
  CASE WHEN COUNT(*) > 0
    THEN ROUND(AVG(cm.mql_rate), 2)
    ELSE 0
  END AS avg_mql_rate,
  CASE WHEN COUNT(*) > 0
    THEN ROUND(AVG(cm.sql_rate), 2)
    ELSE 0
  END AS avg_sql_rate,
  CASE WHEN COUNT(*) > 0
    THEN ROUND(AVG(cm.avg_ticket), 2)
    ELSE 0
  END AS avg_ticket,
  CASE WHEN SUM(cm.clients_web) > 0
    THEN ROUND(SUM(cm.google_ads_cost) / SUM(cm.clients_web), 2)
    ELSE 0
  END AS calc_cac,
  CASE WHEN COUNT(*) > 0
    THEN ROUND(AVG(cm.ltv), 2)
    ELSE 0
  END AS avg_ltv,
  CASE WHEN COUNT(*) > 0
    THEN ROUND(AVG(cm.cac_ltv_ratio), 2)
    ELSE 0
  END AS avg_cac_ltv_ratio,
  CASE WHEN COUNT(*) > 0
    THEN ROUND(AVG(cm.roi_accumulated), 2)
    ELSE 0
  END AS avg_roi_accumulated,
  CASE WHEN COUNT(*) > 0
    THEN MAX(cm.roi_period_months)
    ELSE 0
  END AS max_roi_period_months,
  MIN(cm.period_start) AS first_period,
  MAX(cm.period_end) AS last_period
FROM campaign_metrics cm
JOIN campaigns c ON c.id = cm.campaign_id
WHERE c.is_deleted = FALSE
GROUP BY cm.campaign_id, cm.user_id, c.name, c.channel, c.project_id;
