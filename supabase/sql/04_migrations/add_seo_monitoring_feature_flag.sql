-- =====================================================
-- SEO Monitoring Intelligent - Feature Flag & Plan Control
-- Date: 2026-02-19
-- =====================================================

-- 1) Ensure feature flag exists and is semantically aligned
INSERT INTO feature_flags (
  feature_key,
  feature_name,
  description,
  category,
  status,
  status_message,
  icon,
  sort_order
) VALUES (
  'performance_monitoring',
  'Monitoramento SEO Inteligente',
  'Monitoramento contínuo de SEO com timeline agrupada, detecção de mudanças por ciclo, snapshots de concorrentes e execução manual/agendada/webhook.',
  'seo_performance',
  'active',
  NULL,
  'Activity',
  84
)
ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- 2) Ensure plans have explicit control row
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('performance_monitoring', 'starter', true, NULL, NULL),
  ('performance_monitoring', 'professional', true, NULL, NULL),
  ('performance_monitoring', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  usage_limit = EXCLUDED.usage_limit,
  limit_period = EXCLUDED.limit_period;

