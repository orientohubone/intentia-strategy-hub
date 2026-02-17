-- Verificar detalhes das features de integração
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
