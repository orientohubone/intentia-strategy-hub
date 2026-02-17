-- Habilitar APENAS Google Ads e Meta Ads para Professional (teste)
-- LinkedIn e TikTok continuam bloqueados

-- 1. Mudar status para 'active' com mensagem personalizada
UPDATE feature_flags 
SET status = 'active', 
    status_message = 'Conecte suas contas de anúncios. Disponível nos planos Professional e Enterprise.'
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration');

-- 2. Manter LinkedIn e TikTok em development
UPDATE feature_flags 
SET status = 'development', 
    status_message = 'Em desenvolvimento. Em breve disponível nos planos Professional e Enterprise.'
WHERE feature_key IN ('linkedin_ads_integration', 'tiktok_ads_integration');

-- 3. Habilitar APENAS Google e Meta para Professional
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('google_ads_integration', 'professional', true, NULL, NULL),
  ('meta_ads_integration', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET
  is_enabled = true,
  usage_limit = NULL,
  limit_period = NULL;

-- 4. Habilitar Google e Meta para Enterprise
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('google_ads_integration', 'enterprise', true, NULL, NULL),
  ('meta_ads_integration', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET
  is_enabled = true,
  usage_limit = NULL,
  limit_period = NULL;

-- 5. Manter LinkedIn e TikTok bloqueados em todos os planos
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('linkedin_ads_integration', 'starter', false, NULL, NULL),
  ('linkedin_ads_integration', 'professional', false, NULL, NULL),
  ('linkedin_ads_integration', 'enterprise', false, NULL, NULL),
  ('tiktok_ads_integration', 'starter', false, NULL, NULL),
  ('tiktok_ads_integration', 'professional', false, NULL, NULL),
  ('tiktok_ads_integration', 'enterprise', false, NULL, NULL)
ON CONFLICT (feature_key, plan) DO UPDATE SET
  is_enabled = false;

-- 6. VERIFICAÇÃO: Status final esperado
SELECT 
  f.feature_key,
  f.status,
  f.status_message,
  pf.plan,
  pf.is_enabled,
  CASE 
    WHEN pf.is_enabled THEN '✅ LIBERADO'
    ELSE '🔒 BLOQUEADO'
  END as acesso,
  CASE 
    WHEN pf.plan = 'starter' AND NOT pf.is_enabled THEN '📈 Faça upgrade para Professional'
    WHEN pf.is_enabled THEN '🚀 Disponível'
    ELSE '🔒 Bloqueado'
  END as status_ui
FROM feature_flags f
LEFT JOIN plan_features pf ON f.feature_key = pf.feature_key
WHERE f.feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration')
ORDER BY f.feature_key, pf.plan;
