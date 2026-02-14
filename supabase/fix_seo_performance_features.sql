-- =====================================================
-- FIX: Insert missing SEO and Performance features
-- Execute this SQL to add the missing features
-- =====================================================

-- Insert the missing features
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, status_message, icon, sort_order) VALUES
  ('seo_analysis', 'SEO Analysis', 'Análise SEO e PageSpeed Insights', 'general', 'active', NULL, 'Search', 81),
  ('performance_monitoring', 'Performance Monitoring', 'Monitoramento de performance de campanhas', 'general', 'active', NULL, 'Gauge', 82),
  ('ai_performance_analysis', 'AI Performance Analysis', 'Análise de performance por IA', 'ai', 'active', NULL, 'TrendingUp', 83)
ON CONFLICT (feature_key) DO UPDATE SET
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  status_message = EXCLUDED.status_message,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Add plan features for SEO and Performance (Starter)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('seo_analysis', 'starter', true, NULL, NULL),
  ('performance_monitoring', 'starter', true, NULL, NULL),
  ('ai_performance_analysis', 'starter', false, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- Add plan features for SEO and Performance (Professional)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('seo_analysis', 'professional', true, NULL, NULL),
  ('performance_monitoring', 'professional', true, NULL, NULL),
  ('ai_performance_analysis', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- Add plan features for SEO and Performance (Enterprise)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('seo_analysis', 'enterprise', true, NULL, NULL),
  ('performance_monitoring', 'enterprise', true, NULL, NULL),
  ('ai_performance_analysis', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- =====================================================
-- Verification
-- =====================================================

-- Check if the features were added
SELECT 
  feature_key,
  feature_name,
  category,
  status,
  sort_order
FROM feature_flags 
WHERE feature_key IN (
  'seo_analysis',
  'performance_monitoring',
  'ai_performance_analysis'
)
ORDER BY sort_order;
