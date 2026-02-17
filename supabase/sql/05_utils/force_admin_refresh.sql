-- Forçar refresh dos dados no Admin Panel
-- E verificar se as atualizações foram aplicadas

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

-- 2. Forçar atualização do timestamp para invalidar qualquer cache
UPDATE feature_flags 
SET updated_at = now()
WHERE feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration');

-- 3. Verificar plan_features também
SELECT 
  pf.feature_key,
  pf.plan,
  pf.is_enabled,
  pf.usage_limit,
  pf.limit_period,
  pf.updated_at,
  f.feature_name,
  f.status,
  f.status_message
FROM plan_features pf
JOIN feature_flags f ON pf.feature_key = f.feature_key
WHERE pf.feature_key IN ('google_ads_integration', 'meta_ads_integration', 'linkedin_ads_integration', 'tiktok_ads_integration')
ORDER BY pf.feature_key, pf.plan;

-- 4. Verificação final
-- Os dados foram atualizados com sucesso!
-- Para refresh do Admin Panel:
-- 1. Limpe cache do navegador (Ctrl+F5)
-- 2. Ou redeploy a Edge Function: supabase functions deploy admin-api
