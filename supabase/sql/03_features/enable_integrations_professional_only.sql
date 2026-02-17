-- Habilitar integrações APENAS para Professional e Enterprise
-- Starter continua bloqueado (mais seguro para produção)

-- 1. Mudar status das features para 'active'
UPDATE feature_flags 
SET status = 'active', 
    description = 'Integração com Google Ads API - Importação automática de campanhas e métricas'
WHERE feature_key = 'google_ads_integration';

UPDATE feature_flags 
SET status = 'active', 
    description = 'Integração com Meta Ads API - Importação automática de campanhas e métricas'
WHERE feature_key = 'meta_ads_integration';

UPDATE feature_flags 
SET status = 'active', 
    description = 'Integração com LinkedIn Ads API - Importação automática de campanhas e métricas'
WHERE feature_key = 'linkedin_ads_integration';

UPDATE feature_flags 
SET status = 'active', 
    description = 'Integração com TikTok Ads API - Importação automática de campanhas e métricas'
WHERE feature_key = 'tiktok_ads_integration';

-- 2. Habilitar APENAS para Professional e Enterprise
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('google_ads_integration', 'professional', true, NULL, NULL),
  ('meta_ads_integration', 'professional', true, NULL, NULL),
  ('linkedin_ads_integration', 'professional', true, NULL, NULL),
  ('tiktok_ads_integration', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET
  is_enabled = true,
  usage_limit = NULL,
  limit_period = NULL;

INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('google_ads_integration', 'enterprise', true, NULL, NULL),
  ('meta_ads_integration', 'enterprise', true, NULL, NULL),
  ('linkedin_ads_integration', 'enterprise', true, NULL, NULL),
  ('tiktok_ads_integration', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET
  is_enabled = true,
  usage_limit = NULL,
  limit_period = NULL;

-- 3. VERIFICAÇÃO: Starter continua bloqueado
SELECT 
  f.feature_key,
  f.status,
  pf.plan,
  pf.is_enabled,
  CASE 
    WHEN pf.is_enabled THEN '✅ LIBERADO'
    ELSE '🔒 BLOQUEADO'
  END as acesso
FROM feature_flags f
LEFT JOIN plan_features pf ON f.feature_key = pf.feature_key
WHERE f.feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration')
ORDER BY f.feature_key, pf.plan;
