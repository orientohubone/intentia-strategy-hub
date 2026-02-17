-- =============================================================
-- Fase 2 — Métricas e Performance
-- Migração: campos adicionais em campaign_metrics
-- =============================================================

-- Campos específicos por canal (Google, Meta, LinkedIn, TikTok)
ALTER TABLE campaign_metrics
  ADD COLUMN IF NOT EXISTS reach INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frequency NUMERIC(6, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_views INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vtr NUMERIC(6, 4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpl NUMERIC(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_score NUMERIC(4, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_position NUMERIC(4, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS search_impression_share NUMERIC(6, 4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC(6, 4) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue NUMERIC(12, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'api', 'import'));

-- Índice para consultas de histórico por campanha + período
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_period
  ON campaign_metrics(campaign_id, period_start DESC);

-- =============================================================
-- View: resumo de métricas por campanha (últimos registros)
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
  MIN(cm.period_start) AS first_period,
  MAX(cm.period_end) AS last_period
FROM campaign_metrics cm
JOIN campaigns c ON c.id = cm.campaign_id
WHERE c.is_deleted = FALSE
GROUP BY cm.campaign_id, cm.user_id, c.name, c.channel, c.project_id;
