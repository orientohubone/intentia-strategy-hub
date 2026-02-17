-- =====================================================
-- UPDATE: Starter Plan — Tudo habilitado com limites
-- Executar no Supabase SQL Editor
-- Data: 2026-02-16
-- =====================================================

-- 1. Criar feature flag 'operations' se não existir
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order)
VALUES (
  'operations',
  'Operações e Campanhas',
  'Gestão de campanhas, métricas, budget, calendário e timeline por canal',
  'tactical',
  'active',
  43
)
ON CONFLICT (feature_key) DO NOTHING;

-- 2. Inserir plan_features para 'operations' nos 3 planos
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('operations', 'starter', true, 2, 'monthly'),
  ('operations', 'professional', true, NULL, NULL),
  ('operations', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 3. Atualizar TODAS as features do Starter para habilitado com limites
-- (features que estavam false agora ficam true com limites)

-- Dados Estruturados Generator: false → true (3/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'monthly'
WHERE feature_key = 'structured_data_generator' AND plan = 'starter';

-- AI Project Analysis: false → true (5/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 5, limit_period = 'monthly'
WHERE feature_key = 'ai_project_analysis' AND plan = 'starter';

-- AI Benchmark Enrichment: false → true (3/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'monthly'
WHERE feature_key = 'ai_benchmark_enrichment' AND plan = 'starter';

-- AI API Keys: false → true (sem limite)
UPDATE plan_features SET is_enabled = true, usage_limit = NULL, limit_period = NULL
WHERE feature_key = 'ai_api_keys' AND plan = 'starter';

-- Benchmark Gap Analysis: false → true (3/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'monthly'
WHERE feature_key = 'benchmark_gap_analysis' AND plan = 'starter';

-- Tactical Plan: false → true (1/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 1, limit_period = 'monthly'
WHERE feature_key = 'tactical_plan' AND plan = 'starter';

-- Tactical Templates: false → true (3 total)
UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'unlimited'
WHERE feature_key = 'tactical_templates' AND plan = 'starter';

-- Tactical Playbook: false → true (1/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 1, limit_period = 'monthly'
WHERE feature_key = 'tactical_playbook' AND plan = 'starter';

-- Export PDF: false → true (3/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'monthly'
WHERE feature_key = 'export_pdf' AND plan = 'starter';

-- Export CSV: false → true (3/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'monthly'
WHERE feature_key = 'export_csv' AND plan = 'starter';

-- Export AI Results: false → true (2/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 2, limit_period = 'monthly'
WHERE feature_key = 'export_ai_results' AND plan = 'starter';

-- Brand Guide: false → true (1 total)
UPDATE plan_features SET is_enabled = true, usage_limit = 1, limit_period = 'unlimited'
WHERE feature_key = 'brand_guide' AND plan = 'starter';

-- Brand Posts: false → true (5/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 5, limit_period = 'monthly'
WHERE feature_key = 'brand_posts' AND plan = 'starter';

-- Audiences: 1 → 5 (1 público por projeto)
UPDATE plan_features SET is_enabled = true, usage_limit = 5, limit_period = 'unlimited'
WHERE feature_key = 'audiences' AND plan = 'starter';

-- Backup System: false → true (4/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 4, limit_period = 'monthly'
WHERE feature_key = 'backup_system' AND plan = 'starter';

-- AI Performance Analysis: false → true (3/mês)
UPDATE plan_features SET is_enabled = true, usage_limit = 3, limit_period = 'monthly'
WHERE feature_key = 'ai_performance_analysis' AND plan = 'starter';

-- 4. CORREÇÃO: Forçar status 'active' na feature operations (caso já existisse com outro status)
UPDATE feature_flags SET status = 'active', status_message = NULL
WHERE feature_key = 'operations';

-- 5. CORREÇÃO: Forçar is_enabled = true para operations no Starter (caso ON CONFLICT tenha ignorado)
UPDATE plan_features SET is_enabled = true, usage_limit = 2, limit_period = 'monthly'
WHERE feature_key = 'operations' AND plan = 'starter';

-- 6. Verificação: listar todas as features do Starter
-- SELECT feature_key, is_enabled, usage_limit, limit_period
-- FROM plan_features
-- WHERE plan = 'starter'
-- ORDER BY feature_key;
