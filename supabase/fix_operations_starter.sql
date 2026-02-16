-- =====================================================
-- FIX: Liberar Operations para Starter
-- Executar no Supabase SQL Editor
-- =====================================================

-- 1. Diagnóstico: verificar se a feature operations existe
SELECT feature_key, status, status_message FROM feature_flags WHERE feature_key = 'operations';

-- 2. Diagnóstico: verificar plan_features para operations
SELECT feature_key, plan, is_enabled, usage_limit, limit_period FROM plan_features WHERE feature_key = 'operations';

-- 3. Diagnóstico: verificar se há overrides bloqueando
SELECT * FROM user_feature_overrides WHERE feature_key = 'operations';

-- 4. FIX: Garantir que a feature flag existe e está active
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order)
VALUES (
  'operations',
  'Operações e Campanhas',
  'Gestão de campanhas, métricas, budget, calendário e timeline por canal',
  'tactical',
  'active',
  43
)
ON CONFLICT (feature_key) DO UPDATE SET status = 'active', status_message = NULL;

-- 5. FIX: Garantir plan_features para os 3 planos
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('operations', 'starter', true, 2, 'monthly')
ON CONFLICT (feature_key, plan) DO UPDATE SET is_enabled = true, usage_limit = 2, limit_period = 'monthly';

INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('operations', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET is_enabled = true, usage_limit = NULL, limit_period = NULL;

INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('operations', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET is_enabled = true, usage_limit = NULL, limit_period = NULL;

-- 6. Verificação final
SELECT ff.feature_key, ff.status, pf.plan, pf.is_enabled, pf.usage_limit
FROM feature_flags ff
JOIN plan_features pf ON ff.feature_key = pf.feature_key
WHERE ff.feature_key = 'operations'
ORDER BY pf.plan;
