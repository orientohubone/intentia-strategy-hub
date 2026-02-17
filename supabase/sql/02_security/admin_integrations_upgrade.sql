-- =====================================================
-- UPGRADE: Add Integrations Category to Admin Panel
-- Execute this SQL to update existing admin_schema.sql
-- =====================================================

-- 1. Update feature_flags table to include integrations category
ALTER TABLE feature_flags 
DROP CONSTRAINT IF EXISTS feature_flags_category_check;

ALTER TABLE feature_flags 
ADD CONSTRAINT feature_flags_category_check 
CHECK (category IN (
  'analysis', 'ai', 'benchmark', 'tactical', 'export', 'social', 'general', 'admin', 'integrations'
));

-- 2. Insert new integration features
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, status_message, icon, sort_order) VALUES
  ('google_ads_integration', 'Google Ads Integration', 'Integração com Google Ads API', 'integrations', 'development', 'Em breve', 'GoogleAdsLogo', 77),
  ('meta_ads_integration', 'Meta Ads Integration', 'Integração com Meta Ads API', 'integrations', 'development', 'Em breve', 'FacebookLogo', 78),
  ('linkedin_ads_integration', 'LinkedIn Ads Integration', 'Integração com LinkedIn Ads API', 'integrations', 'development', 'Em breve', 'LinkedinLogo', 79),
  ('tiktok_ads_integration', 'TikTok Ads Integration', 'Integração com TikTok Ads API', 'integrations', 'development', 'Em breve', 'Music2', 80),
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

-- 3. Add plan features for integrations (Starter)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('google_ads_integration', 'starter', false, NULL, NULL),
  ('meta_ads_integration', 'starter', false, NULL, NULL),
  ('linkedin_ads_integration', 'starter', false, NULL, NULL),
  ('tiktok_ads_integration', 'starter', false, NULL, NULL),
  ('seo_analysis', 'starter', true, NULL, NULL),
  ('performance_monitoring', 'starter', true, NULL, NULL),
  ('ai_performance_analysis', 'starter', false, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 4. Add plan features for integrations (Professional)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('google_ads_integration', 'professional', false, NULL, NULL),
  ('meta_ads_integration', 'professional', false, NULL, NULL),
  ('linkedin_ads_integration', 'professional', false, NULL, NULL),
  ('tiktok_ads_integration', 'professional', false, NULL, NULL),
  ('seo_analysis', 'professional', true, NULL, NULL),
  ('performance_monitoring', 'professional', true, NULL, NULL),
  ('ai_performance_analysis', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 5. Add plan features for integrations (Enterprise)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('google_ads_integration', 'enterprise', false, NULL, NULL),
  ('meta_ads_integration', 'enterprise', false, NULL, NULL),
  ('linkedin_ads_integration', 'enterprise', false, NULL, NULL),
  ('tiktok_ads_integration', 'enterprise', false, NULL, NULL),
  ('seo_analysis', 'enterprise', true, NULL, NULL),
  ('performance_monitoring', 'enterprise', true, NULL, NULL),
  ('ai_performance_analysis', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 6. Update category index if needed
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);

-- =====================================================
-- Verification Query
-- =====================================================

-- Check if integrations category exists
SELECT category, COUNT(*) as feature_count 
FROM feature_flags 
WHERE category = 'integrations' 
GROUP BY category;

-- Check plan features for integrations
SELECT pf.feature_key, pf.plan, pf.is_enabled, f.category
FROM plan_features pf
JOIN feature_flags f ON pf.feature_key = f.feature_key
WHERE f.category = 'integrations'
ORDER BY pf.plan, pf.feature_key;
