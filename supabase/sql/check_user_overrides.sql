-- Verificar se o usuário admin tem overrides para relatórios
-- Substitua 'SEU_USER_ID' pelo ID real do seu usuário

SELECT 
  u.id as user_id,
  u.email,
  u.full_name,
  u.created_at,
  ts.plan as user_plan,
  ufo.feature_key,
  ufo.is_enabled as override_enabled,
  ufo.reason as override_reason,
  ufo.created_at as override_created_at,
  f.status as feature_status,
  pf.is_enabled as plan_enabled,
  CASE 
    WHEN ufo.is_enabled THEN '✅ Override ATIVO'
    WHEN pf.is_enabled THEN '✅ Plano ATIVO'
    WHEN f.status = 'development' THEN '🔵 Em Desenvolvimento'
    ELSE '❌ Bloqueado'
  END as access_status
FROM auth.users u
LEFT JOIN tenant_settings ts ON u.id = ts.user_id
LEFT JOIN user_feature_overrides ufo ON u.id = ufo.user_id AND ufo.feature_key = 'reports_feature'
LEFT JOIN feature_flags f ON f.feature_key = 'reports_feature'
LEFT JOIN plan_features pf ON pf.feature_key = 'reports_feature' AND pf.plan = ts.plan
WHERE u.email = 'admin@test.com'  -- Altere para seu email ou remova esta linha para ver todos
ORDER BY u.created_at DESC;

-- Verificar todos os overrides de relatórios
SELECT 
  u.email,
  u.full_name,
  ts.plan,
  ufo.is_enabled,
  ufo.reason,
  ufo.created_at
FROM user_feature_overrides ufo
JOIN auth.users u ON ufo.user_id = u.id
JOIN tenant_settings ts ON u.id = ts.user_id
WHERE ufo.feature_key = 'reports_feature'
ORDER BY ufo.created_at DESC;
