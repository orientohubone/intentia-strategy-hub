-- =============================================================
-- Trigger: Sincronizar campaigns.budget_spent com campaign_metrics
-- Atualiza automaticamente ao INSERT/UPDATE/DELETE em campaign_metrics
-- Usa GREATEST(cost, google_ads_cost) para evitar double-counting
-- =============================================================

CREATE OR REPLACE FUNCTION sync_campaign_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
  target_campaign_id UUID;
BEGIN
  -- Determina o campaign_id afetado
  IF TG_OP = 'DELETE' THEN
    target_campaign_id := OLD.campaign_id;
  ELSE
    target_campaign_id := NEW.campaign_id;
  END IF;

  -- Atualiza budget_spent com a soma dos custos das metricas
  UPDATE campaigns
  SET budget_spent = COALESCE(
    (
      SELECT SUM(GREATEST(cm.cost, cm.google_ads_cost))
      FROM campaign_metrics cm
      WHERE cm.campaign_id = target_campaign_id
    ), 0
  )
  WHERE id = target_campaign_id;

  -- Se foi UPDATE que mudou o campaign_id, atualiza o antigo tambem
  IF TG_OP = 'UPDATE' AND OLD.campaign_id IS DISTINCT FROM NEW.campaign_id THEN
    UPDATE campaigns
    SET budget_spent = COALESCE(
      (
        SELECT SUM(GREATEST(cm.cost, cm.google_ads_cost))
        FROM campaign_metrics cm
        WHERE cm.campaign_id = OLD.campaign_id
      ), 0
    )
    WHERE id = OLD.campaign_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger se existir (para recriar)
DROP TRIGGER IF EXISTS trg_sync_budget_spent ON campaign_metrics;

-- Criar trigger
CREATE TRIGGER trg_sync_budget_spent
  AFTER INSERT OR UPDATE OR DELETE ON campaign_metrics
  FOR EACH ROW EXECUTE FUNCTION sync_campaign_budget_spent();

-- =============================================================
-- Backfill: atualizar budget_spent para campanhas existentes
-- =============================================================

UPDATE campaigns c
SET budget_spent = COALESCE(
  (
    SELECT SUM(GREATEST(cm.cost, cm.google_ads_cost))
    FROM campaign_metrics cm
    WHERE cm.campaign_id = c.id
  ), 0
);
