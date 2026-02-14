-- =====================================================
-- VERIFICATION QUERY - Check if features were inserted
-- =====================================================

-- Check all features with their categories
SELECT 
  feature_key,
  feature_name,
  category,
  status,
  sort_order
FROM feature_flags 
WHERE category IN ('integrations', 'general', 'ai')
  AND sort_order >= 77
ORDER BY sort_order;

-- Check specific features we added
SELECT 
  feature_key,
  feature_name,
  category,
  status,
  status_message,
  icon,
  sort_order
FROM feature_flags 
WHERE feature_key IN (
  'google_ads_integration',
  'meta_ads_integration', 
  'linkedin_ads_integration',
  'tiktok_ads_integration',
  'seo_analysis',
  'performance_monitoring',
  'ai_performance_analysis'
)
ORDER BY sort_order;

-- Check plan features for the new features
SELECT 
  pf.feature_key,
  pf.plan,
  pf.is_enabled,
  f.category,
  f.feature_name
FROM plan_features pf
JOIN feature_flags f ON pf.feature_key = f.feature_key
WHERE pf.feature_key IN (
  'google_ads_integration',
  'meta_ads_integration', 
  'linkedin_ads_integration',
  'tiktok_ads_integration',
  'seo_analysis',
  'performance_monitoring',
  'ai_performance_analysis'
)
ORDER BY pf.plan, pf.feature_key;

-- Count features by category
SELECT 
  category,
  COUNT(*) as count,
  STRING_AGG(feature_name, ', ' ORDER BY sort_order) as features
FROM feature_flags 
GROUP BY category
ORDER BY category;
