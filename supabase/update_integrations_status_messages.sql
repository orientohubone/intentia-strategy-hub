-- Atualizar mensagens de status das features de integração
-- Starter: mensagem de desenvolvimento/upgrade
-- Professional/Enterprise: mensagem de disponibilidade

-- 1. Atualizar status para 'development' com mensagem personalizada
UPDATE feature_flags 
SET status = 'development',
    status_message = 'Conecte suas contas de anúncios. Disponível nos planos Professional e Enterprise.'
WHERE feature_key = 'google_ads_integration';

UPDATE feature_flags 
SET status = 'development',
    status_message = 'Conecte suas contas de anúncios. Disponível nos planos Professional e Enterprise.'
WHERE feature_key = 'meta_ads_integration';

UPDATE feature_flags 
SET status = 'development',
    status_message = 'Conecte suas contas de anúncios. Disponível nos planos Professional e Enterprise.'
WHERE feature_key = 'linkedin_ads_integration';

UPDATE feature_flags 
SET status = 'development',
    status_message = 'Conecte suas contas de anúncios. Disponível nos planos Professional e Enterprise.'
WHERE feature_key = 'tiktok_ads_integration';

-- 2. Manter Starter bloqueado mas com mensagem de upgrade
-- (já está false no enable_integrations_professional_only.sql)

-- 3. Verificar as atualizações
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
