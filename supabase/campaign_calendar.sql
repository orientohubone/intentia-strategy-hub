-- =============================================================
-- Intentia Strategy Hub — Calendário de Campanhas (v3.7)
-- Views: v_campaign_calendar, v_campaign_timeline
-- =============================================================

-- 1. View: Calendário de Campanhas (dados por campanha com duração e métricas)
CREATE OR REPLACE VIEW v_campaign_calendar
WITH (security_invoker = true)
AS
SELECT
  c.id,
  c.user_id,
  c.project_id,
  p.name AS project_name,
  c.name AS campaign_name,
  c.channel,
  c.status,
  c.objective,
  c.budget_total,
  c.budget_spent,
  c.start_date,
  c.end_date,
  -- Duração em dias
  CASE
    WHEN c.start_date IS NOT NULL AND c.end_date IS NOT NULL
    THEN (c.end_date - c.start_date) + 1
    ELSE NULL
  END AS duration_days,
  -- Dias restantes (NULL se sem end_date ou já encerrada)
  CASE
    WHEN c.end_date IS NOT NULL AND c.end_date >= CURRENT_DATE AND c.status IN ('active', 'paused')
    THEN (c.end_date - CURRENT_DATE)
    ELSE NULL
  END AS days_remaining,
  -- Dias desde início
  CASE
    WHEN c.start_date IS NOT NULL
    THEN (CURRENT_DATE - c.start_date)
    ELSE NULL
  END AS days_elapsed,
  -- Budget pacing
  CASE
    WHEN c.budget_total > 0
    THEN ROUND((c.budget_spent / c.budget_total) * 100, 1)
    ELSE 0
  END AS budget_pacing,
  -- Ending soon (próximos 7 dias)
  CASE
    WHEN c.end_date IS NOT NULL
      AND c.end_date >= CURRENT_DATE
      AND c.end_date <= CURRENT_DATE + INTERVAL '7 days'
      AND c.status = 'active'
    THEN TRUE
    ELSE FALSE
  END AS ending_soon,
  -- Métricas agregadas
  COALESCE(m.total_impressions, 0) AS total_impressions,
  COALESCE(m.total_clicks, 0) AS total_clicks,
  COALESCE(m.total_conversions, 0) AS total_conversions,
  COALESCE(m.total_cost, 0) AS total_cost,
  COALESCE(m.total_revenue, 0) AS total_revenue,
  COALESCE(m.entries_count, 0) AS metrics_entries,
  c.created_at,
  c.updated_at
FROM campaigns c
JOIN projects p ON p.id = c.project_id
LEFT JOIN LATERAL (
  SELECT
    SUM(cm.impressions) AS total_impressions,
    SUM(cm.clicks) AS total_clicks,
    SUM(cm.conversions) AS total_conversions,
    SUM(cm.cost) AS total_cost,
    SUM(COALESCE(cm.revenue, 0)) AS total_revenue,
    COUNT(*) AS entries_count
  FROM campaign_metrics cm
  WHERE cm.campaign_id = c.id
) m ON TRUE
WHERE c.is_deleted = FALSE;

-- 2. View: Timeline de Campanhas (agrupamento por projeto com sobreposições)
CREATE OR REPLACE VIEW v_campaign_timeline
WITH (security_invoker = true)
AS
SELECT
  c.id AS campaign_id,
  c.user_id,
  c.project_id,
  p.name AS project_name,
  c.name AS campaign_name,
  c.channel,
  c.status,
  c.start_date,
  c.end_date,
  c.budget_total,
  c.budget_spent,
  -- Normalizar datas para timeline (usar created_at se sem start_date)
  COALESCE(c.start_date, c.created_at::date) AS effective_start,
  COALESCE(c.end_date, CURRENT_DATE + INTERVAL '30 days') AS effective_end,
  -- Posição relativa no mês (para layout)
  EXTRACT(DAY FROM COALESCE(c.start_date, c.created_at::date)) AS start_day_of_month,
  EXTRACT(DAY FROM COALESCE(c.end_date, CURRENT_DATE + INTERVAL '30 days')) AS end_day_of_month,
  EXTRACT(MONTH FROM COALESCE(c.start_date, c.created_at::date)) AS start_month,
  EXTRACT(YEAR FROM COALESCE(c.start_date, c.created_at::date)) AS start_year,
  -- Contagem de sobreposições no mesmo canal/projeto
  (
    SELECT COUNT(*)
    FROM campaigns c2
    WHERE c2.project_id = c.project_id
      AND c2.channel = c.channel
      AND c2.id != c.id
      AND c2.is_deleted = FALSE
      AND c2.status NOT IN ('archived', 'completed')
      AND c2.start_date IS NOT NULL
      AND c.start_date IS NOT NULL
      AND c2.start_date <= COALESCE(c.end_date, CURRENT_DATE + INTERVAL '30 days')
      AND COALESCE(c2.end_date, CURRENT_DATE + INTERVAL '30 days') >= c.start_date
  ) AS overlap_count
FROM campaigns c
JOIN projects p ON p.id = c.project_id
WHERE c.is_deleted = FALSE
ORDER BY c.project_id, COALESCE(c.start_date, c.created_at::date);

-- =============================================================
-- Indexes para performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_campaigns_start_date ON campaigns(start_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_end_date ON campaigns(end_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_date_range ON campaigns(start_date, end_date);
