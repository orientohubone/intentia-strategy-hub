-- Melhorar nomes e descrições das features flags de integrações
-- Para ficar mais claro no Admin Panel

-- 1. Atualizar nomes e descrições para serem mais claros
UPDATE feature_flags 
SET 
  feature_name = 'Google Ads Integration',
  description = 'Conecte sua conta do Google Ads para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'google_ads_integration';

UPDATE feature_flags 
SET 
  feature_name = 'Meta Ads Integration',
  description = 'Conecte sua conta do Meta Ads (Facebook/Instagram) para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'meta_ads_integration';

UPDATE feature_flags 
SET 
  feature_name = 'LinkedIn Ads Integration',
  description = 'Conecte sua conta do LinkedIn Ads para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'linkedin_ads_integration';

UPDATE feature_flags 
SET 
  feature_name = 'TikTok Ads Integration',
  description = 'Conecte sua conta do TikTok Ads para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'tiktok_ads_integration';

-- 2. Verificar as atualizações
SELECT 
  feature_key,
  feature_name,
  description,
  status,
  status_message,
  category,
  sort_order
FROM feature_flags 
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration')
ORDER BY sort_order;
