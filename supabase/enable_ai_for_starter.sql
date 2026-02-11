-- =============================================================
-- Migration: Feature Flags granulares para IA
-- Estratégia:
--   Starter:      ai_api_keys ✅ | ai_project_analysis ✅ (limitado) | demais ❌
--   Professional:  tudo ✅
--   Enterprise:    tudo ✅
-- Admin pode fazer override por cliente para negociação
-- =============================================================

-- 1. Adicionar novas feature flags de IA (se não existirem)
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order) VALUES
  ('ai_performance_analysis', 'Análise de Performance por IA', 'Análise completa de KPIs, funil, budget e projeções de campanhas via IA', 'ai', 'active', 23),
  ('ai_insights_enrichment', 'Enriquecimento de Insights por IA', 'Análise aprofundada e geração de novos insights estratégicos via IA', 'ai', 'active', 24)
ON CONFLICT (feature_key) DO NOTHING;

-- 2. Atualizar plan_features — Starter
-- Liberar ai_api_keys (configurar keys) e ai_project_analysis (limitado)
UPDATE plan_features SET is_enabled = true
WHERE feature_key = 'ai_api_keys' AND plan = 'starter';

UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'monthly'
WHERE feature_key = 'ai_project_analysis' AND plan = 'starter';

-- Novas features de IA — bloqueadas no Starter
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('ai_performance_analysis', 'starter', false, NULL, NULL),
  ('ai_insights_enrichment', 'starter', false, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 3. Atualizar plan_features — Professional (tudo liberado)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('ai_performance_analysis', 'professional', true, NULL, NULL),
  ('ai_insights_enrichment', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 4. Atualizar plan_features — Enterprise (tudo liberado)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('ai_performance_analysis', 'enterprise', true, NULL, NULL),
  ('ai_insights_enrichment', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- =============================================================
-- Resultado esperado:
--
-- | Feature                    | Starter       | Professional | Enterprise |
-- |----------------------------|---------------|--------------|------------|
-- | ai_api_keys                | ✅            | ✅           | ✅         |
-- | ai_project_analysis        | ✅ (3/mês)    | ✅ ilimitado | ✅         |
-- | ai_benchmark_enrichment    | ❌            | ✅           | ✅         |
-- | ai_performance_analysis    | ❌            | ✅           | ✅         |
-- | ai_insights_enrichment     | ❌            | ✅           | ✅         |
--
-- Admin pode liberar qualquer feature para qualquer cliente via
-- user_feature_overrides no painel admin (tab Clientes → toggle)
-- =============================================================
