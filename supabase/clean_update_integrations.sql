-- UPDATE LIMPO - Features de Integrações
-- Apenas os updates necessários

UPDATE feature_flags 
SET feature_name = 'Google Ads Integration',
    description = 'Conecte sua conta do Google Ads para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'google_ads_integration';

UPDATE feature_flags 
SET feature_name = 'Meta Ads Integration',
    description = 'Conecte sua conta do Meta Ads (Facebook/Instagram) para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'meta_ads_integration';

UPDATE feature_flags 
SET feature_name = 'LinkedIn Ads Integration',
    description = 'Conecte sua conta do LinkedIn Ads para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'linkedin_ads_integration';

UPDATE feature_flags 
SET feature_name = 'TikTok Ads Integration',
    description = 'Conecte sua conta do TikTok Ads para importar campanhas, métricas e dados de performance automaticamente.'
WHERE feature_key = 'tiktok_ads_integration';

-- Status e mensagens
UPDATE feature_flags 
SET status = 'active',
    status_message = 'Conecte suas contas de anúncios. Disponível nos planos Professional e Enterprise.'
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration');

UPDATE feature_flags 
SET status = 'development',
    status_message = 'Em desenvolvimento. Em breve disponível nos planos Professional e Enterprise.'
WHERE feature_key IN ('linkedin_ads_integration', 'tiktok_ads_integration');
