-- Debug: Verificar exatamente o que está no banco
SELECT 
  feature_key,
  feature_name,
  description,
  status,
  status_message,
  category,
  sort_order,
  updated_at
FROM feature_flags 
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration')
ORDER BY sort_order;

-- Verificar se o SQL anterior foi executado
SELECT 
  'feature_flags' as table_name,
  COUNT(*) as total_rows
FROM feature_flags 
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration')

UNION ALL

SELECT 
  'plan_features' as table_name,
  COUNT(*) as total_rows
FROM plan_features 
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration');
