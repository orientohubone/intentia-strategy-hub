-- =============================================================
-- Intentia Strategy Hub — Gestão de Budget (v3.6)
-- Views e funções para alocação, pacing e projeções de budget
-- Pré-requisito: operational_schema.sql (budget_allocations já existe)
-- =============================================================

-- 1. View: Resumo de budget por projeto/canal/mês
CREATE OR REPLACE VIEW v_budget_summary
WITH (security_invoker = true)
AS
SELECT
  ba.id,
  ba.user_id,
  ba.project_id,
  p.name AS project_name,
  ba.channel,
  ba.month,
  ba.year,
  ba.planned_budget,
  ba.actual_spent,
  CASE
    WHEN ba.planned_budget > 0 THEN ROUND((ba.actual_spent / ba.planned_budget) * 100, 1)
    ELSE 0
  END AS pacing_percent,
  ba.planned_budget - ba.actual_spent AS remaining,
  ba.created_at,
  ba.updated_at
FROM budget_allocations ba
JOIN projects p ON p.id = ba.project_id;

-- 2. View: Pacing consolidado por projeto (mês atual)
CREATE OR REPLACE VIEW v_budget_project_pacing
WITH (security_invoker = true)
AS
SELECT
  ba.user_id,
  ba.project_id,
  p.name AS project_name,
  ba.month,
  ba.year,
  COUNT(DISTINCT ba.channel) AS channels_allocated,
  SUM(ba.planned_budget) AS total_planned,
  SUM(ba.actual_spent) AS total_spent,
  SUM(ba.planned_budget) - SUM(ba.actual_spent) AS total_remaining,
  CASE
    WHEN SUM(ba.planned_budget) > 0 THEN ROUND((SUM(ba.actual_spent) / SUM(ba.planned_budget)) * 100, 1)
    ELSE 0
  END AS overall_pacing,
  -- Projeção: baseada no ritmo diário atual
  CASE
    WHEN EXTRACT(DAY FROM CURRENT_DATE) > 0 AND SUM(ba.actual_spent) > 0 THEN
      ROUND(
        (SUM(ba.actual_spent) / EXTRACT(DAY FROM CURRENT_DATE)) *
        EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')),
        2
      )
    ELSE 0
  END AS projected_spend,
  CASE
    WHEN EXTRACT(DAY FROM CURRENT_DATE) > 0 AND SUM(ba.planned_budget) > 0 AND SUM(ba.actual_spent) > 0 THEN
      ROUND(
        ((SUM(ba.actual_spent) / EXTRACT(DAY FROM CURRENT_DATE)) *
        EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')))
        / SUM(ba.planned_budget) * 100,
        1
      )
    ELSE 0
  END AS projected_pacing
FROM budget_allocations ba
JOIN projects p ON p.id = ba.project_id
GROUP BY ba.user_id, ba.project_id, p.name, ba.month, ba.year;

-- 3. Função: Atualizar actual_spent de budget_allocations
-- com base nas métricas reais das campanhas do mesmo projeto/canal/mês
-- Usa GREATEST(cost, google_ads_cost) para pegar o valor correto por canal
CREATE OR REPLACE FUNCTION sync_budget_actual_spent(
  p_user_id UUID,
  p_project_id UUID,
  p_channel TEXT,
  p_month INTEGER,
  p_year INTEGER
) RETURNS VOID AS $$
DECLARE
  v_total_cost NUMERIC(12,2);
BEGIN
  -- Soma o custo real: GREATEST(cost, google_ads_cost) evita double-counting
  -- Para Google: google_ads_cost pode ser preenchido separadamente
  -- Para outros canais: cost é o campo principal
  SELECT COALESCE(SUM(GREATEST(cm.cost, cm.google_ads_cost)), 0)
  INTO v_total_cost
  FROM campaign_metrics cm
  JOIN campaigns c ON c.id = cm.campaign_id
  WHERE c.user_id = p_user_id
    AND c.project_id = p_project_id
    AND c.channel = p_channel
    AND c.is_deleted = FALSE
    AND EXTRACT(MONTH FROM cm.period_start) = p_month
    AND EXTRACT(YEAR FROM cm.period_start) = p_year;

  -- Atualiza o actual_spent na alocação
  UPDATE budget_allocations
  SET actual_spent = v_total_cost
  WHERE user_id = p_user_id
    AND project_id = p_project_id
    AND channel = p_channel
    AND month = p_month
    AND year = p_year;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Função: Sincronizar todos os budgets de um usuário para o mês atual
-- Atualiza tanto budget_allocations.actual_spent quanto campaigns.budget_spent
CREATE OR REPLACE FUNCTION sync_all_budgets(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  r RECORD;
  v_month INTEGER := EXTRACT(MONTH FROM CURRENT_DATE);
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  -- 1. Sincronizar budget_allocations.actual_spent
  FOR r IN
    SELECT DISTINCT project_id, channel
    FROM budget_allocations
    WHERE user_id = p_user_id
      AND month = v_month
      AND year = v_year
  LOOP
    PERFORM sync_budget_actual_spent(p_user_id, r.project_id, r.channel, v_month, v_year);
  END LOOP;

  -- 2. Sincronizar campaigns.budget_spent com total de métricas reais
  -- Usa GREATEST(cost, google_ads_cost) consistente com trg_sync_budget_spent
  UPDATE campaigns c
  SET budget_spent = sub.total_cost
  FROM (
    SELECT cm.campaign_id, COALESCE(SUM(GREATEST(cm.cost, cm.google_ads_cost)), 0) AS total_cost
    FROM campaign_metrics cm
    JOIN campaigns camp ON camp.id = cm.campaign_id
    WHERE camp.user_id = p_user_id
      AND camp.is_deleted = FALSE
    GROUP BY cm.campaign_id
  ) sub
  WHERE c.id = sub.campaign_id
    AND c.user_id = p_user_id
    AND c.is_deleted = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
