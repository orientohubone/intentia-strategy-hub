-- =============================================================
-- Intentia Strategy Hub — Etapa Operacional (v3.0)
-- Schema: campaigns, campaign_metrics, budget_allocations
-- =============================================================

-- 1. Tabela de Campanhas
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tactical_plan_id UUID REFERENCES tactical_plans(id) ON DELETE SET NULL,
  tactical_channel_plan_id UUID REFERENCES tactical_channel_plans(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('google', 'meta', 'linkedin', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  objective TEXT,
  notes TEXT,
  budget_total NUMERIC(12, 2) DEFAULT 0,
  budget_spent NUMERIC(12, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Métricas de Campanha (por período)
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  ctr NUMERIC(6, 4) DEFAULT 0,
  cpc NUMERIC(10, 2) DEFAULT 0,
  cpm NUMERIC(10, 2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  cpa NUMERIC(10, 2) DEFAULT 0,
  roas NUMERIC(8, 2) DEFAULT 0,
  cost NUMERIC(12, 2) DEFAULT 0,
  custom_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Alocação de Budget
CREATE TABLE IF NOT EXISTS budget_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('google', 'meta', 'linkedin', 'tiktok')),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year BETWEEN 2020 AND 2100),
  planned_budget NUMERIC(12, 2) DEFAULT 0,
  actual_spent NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id, channel, month, year)
);

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_project_id ON campaigns(project_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_channel ON campaigns(channel);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_deleted ON campaigns(is_deleted);

CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_user_id ON campaign_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_period ON campaign_metrics(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_budget_allocations_user_id ON budget_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_project_id ON budget_allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_allocations_period ON budget_allocations(year, month);

-- =============================================================
-- Triggers: updated_at automático
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_budget_allocations_updated_at
  BEFORE UPDATE ON budget_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- Row Level Security (RLS)
-- =============================================================

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;

-- campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- campaign_metrics
CREATE POLICY "Users can view own campaign metrics"
  ON campaign_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaign metrics"
  ON campaign_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaign metrics"
  ON campaign_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaign metrics"
  ON campaign_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- budget_allocations
CREATE POLICY "Users can view own budget allocations"
  ON budget_allocations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budget allocations"
  ON budget_allocations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budget allocations"
  ON budget_allocations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budget allocations"
  ON budget_allocations FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================
-- Views para Dashboard Operacional
-- =============================================================

CREATE OR REPLACE VIEW v_campaign_summary
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
  c.created_at,
  c.updated_at,
  CASE
    WHEN c.budget_total > 0 THEN ROUND((c.budget_spent / c.budget_total) * 100, 1)
    ELSE 0
  END AS budget_pacing,
  COALESCE(
    (SELECT SUM(cm.impressions) FROM campaign_metrics cm WHERE cm.campaign_id = c.id), 0
  ) AS total_impressions,
  COALESCE(
    (SELECT SUM(cm.clicks) FROM campaign_metrics cm WHERE cm.campaign_id = c.id), 0
  ) AS total_clicks,
  COALESCE(
    (SELECT SUM(cm.conversions) FROM campaign_metrics cm WHERE cm.campaign_id = c.id), 0
  ) AS total_conversions,
  COALESCE(
    (SELECT SUM(cm.cost) FROM campaign_metrics cm WHERE cm.campaign_id = c.id), 0
  ) AS total_cost
FROM campaigns c
JOIN projects p ON p.id = c.project_id
WHERE c.is_deleted = FALSE;

CREATE OR REPLACE VIEW v_operational_stats
WITH (security_invoker = true)
AS
SELECT
  c.user_id,
  COUNT(*) FILTER (WHERE c.is_deleted = FALSE) AS total_campaigns,
  COUNT(*) FILTER (WHERE c.status = 'active' AND c.is_deleted = FALSE) AS active_campaigns,
  COUNT(*) FILTER (WHERE c.status = 'paused' AND c.is_deleted = FALSE) AS paused_campaigns,
  COUNT(*) FILTER (WHERE c.status = 'completed' AND c.is_deleted = FALSE) AS completed_campaigns,
  COUNT(*) FILTER (WHERE c.status = 'draft' AND c.is_deleted = FALSE) AS draft_campaigns,
  COALESCE(SUM(c.budget_total) FILTER (WHERE c.is_deleted = FALSE), 0) AS total_budget,
  COALESCE(SUM(c.budget_spent) FILTER (WHERE c.is_deleted = FALSE), 0) AS total_spent
FROM campaigns c
GROUP BY c.user_id;

-- =============================================================
-- Audit triggers (usa audit_trigger_func de audit_log.sql)
-- =============================================================

CREATE TRIGGER audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_campaign_metrics
  AFTER INSERT OR UPDATE OR DELETE ON campaign_metrics
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER audit_budget_allocations
  AFTER INSERT OR UPDATE OR DELETE ON budget_allocations
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
