-- Verificar se as atualizações das features foram aplicadas
-- E forçar refresh se necessário

-- 1. Verificar dados atuais das features de integração
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

-- 2. Verificar se há cache ou se os dados não foram atualizados
-- Se updated_at for muito antigo, pode ser que o update não funcionou

-- 3. Forçar atualização do timestamp para invalidar cache
UPDATE feature_flags 
SET updated_at = now()
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration');

-- 4. Verificar plan_features também (para garantir consistência)
SELECT 
  pf.feature_key,
  pf.plan,
  pf.is_enabled,
  pf.usage_limit,
  pf.limit_period,
  pf.updated_at,
  f.feature_name,
  f.status
FROM plan_features pf
JOIN feature_flags f ON pf.feature_key = f.feature_key
WHERE pf.feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration')
ORDER BY pf.feature_key, pf.plan;
