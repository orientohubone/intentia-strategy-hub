-- =====================================================
-- SEO & Performance Category Setup
-- Execute this SQL to create the new category and move features
-- =====================================================

-- 1. Update feature_flags table to include seo_performance category
ALTER TABLE feature_flags 
DROP CONSTRAINT IF EXISTS feature_flags_category_check;

ALTER TABLE feature_flags 
ADD CONSTRAINT feature_flags_category_check 
CHECK (category IN (
  'analysis', 'ai', 'benchmark', 'tactical', 'export', 'social', 'general', 'admin', 'integrations', 'seo_performance'
));

-- 2. Update existing SEO and Performance features to new category
UPDATE feature_flags 
SET category = 'seo_performance', updated_at = now()
WHERE feature_key IN (
  'seo_analysis',
  'performance_monitoring',
  'ai_performance_analysis'
);

-- 3. Insert SEO and Performance features if they don't exist
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, status_message, icon, sort_order) VALUES
  ('seo_analysis', 'SEO Analysis', 'Análise SEO e PageSpeed Insights', 'seo_performance', 'active', NULL, 'Search', 81),
  ('performance_monitoring', 'Performance Monitoring', 'Monitoramento de performance de campanhas', 'seo_performance', 'active', NULL, 'Gauge', 82),
  ('ai_performance_analysis', 'AI Performance Analysis', 'Análise de performance por IA', 'seo_performance', 'active', NULL, 'TrendingUp', 83)
ON CONFLICT (feature_key) DO UPDATE SET
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  status_message = EXCLUDED.status_message,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 4. Add plan features for SEO and Performance (Starter)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('seo_analysis', 'starter', true, NULL, NULL),
  ('performance_monitoring', 'starter', true, NULL, NULL),
  ('ai_performance_analysis', 'starter', false, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 5. Add plan features for SEO and Performance (Professional)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('seo_analysis', 'professional', true, NULL, NULL),
  ('performance_monitoring', 'professional', true, NULL, NULL),
  ('ai_performance_analysis', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 6. Add plan features for SEO and Performance (Enterprise)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('seo_analysis', 'enterprise', true, NULL, NULL),
  ('performance_monitoring', 'enterprise', true, NULL, NULL),
  ('ai_performance_analysis', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- =====================================================
-- Verification
-- =====================================================

-- Check SEO & Performance category
SELECT 
  feature_key,
  feature_name,
  category,
  status,
  sort_order
FROM feature_flags 
WHERE category = 'seo_performance'
ORDER BY sort_order;

-- Check all categories now
SELECT 
  category,
  COUNT(*) as feature_count,
  STRING_AGG(feature_name, ', ' ORDER BY sort_order) as features
FROM feature_flags 
GROUP BY category
ORDER BY category;
