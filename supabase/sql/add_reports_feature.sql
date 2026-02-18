-- Adicionar feature flag para Relatórios Estratégicos
-- Esta feature controla o acesso à tela de relatórios

INSERT INTO feature_flags (
  id,
  feature_key,
  feature_name,
  description,
  category,
  status,
  status_message,
  icon,
  sort_order,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'reports_feature',
  'Relatórios Estratégicos',
  'Acesso à tela de relatórios estratégicos e análises de dados',
  'general',
  'development',
  'Feature em desenvolvimento - Aguardando implementação da tela de relatórios',
  'file-text',
  100,
  NOW(),
  NOW()
) ON CONFLICT (feature_key) DO UPDATE SET
  feature_name = EXCLUDED.feature_name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  status = EXCLUDED.status,
  status_message = EXCLUDED.status_message,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Adicionar configurações por plano para a feature
INSERT INTO plan_features (
  id,
  feature_key,
  plan,
  is_enabled,
  usage_limit,
  limit_period,
  created_at,
  updated_at
) VALUES
  (gen_random_uuid(), 'reports_feature', 'starter', false, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'reports_feature', 'professional', false, NULL, NULL, NOW(), NOW()),
  (gen_random_uuid(), 'reports_feature', 'enterprise', false, NULL, NULL, NOW(), NOW())
ON CONFLICT (feature_key, plan) DO UPDATE SET
  is_enabled = EXCLUDED.is_enabled,
  usage_limit = EXCLUDED.usage_limit,
  limit_period = EXCLUDED.limit_period,
  updated_at = NOW();

-- Verificar se a feature foi adicionada
SELECT 
  f.feature_key,
  f.feature_name,
  f.category,
  f.status,
  f.status_message,
  f.icon,
  pf.plan,
  pf.is_enabled as plan_enabled,
  pf.usage_limit,
  pf.limit_period
FROM feature_flags f
LEFT JOIN plan_features pf ON f.feature_key = pf.feature_key
WHERE f.feature_key = 'reports_feature'
ORDER BY pf.plan;
