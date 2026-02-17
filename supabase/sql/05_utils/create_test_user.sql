-- =====================================================
-- CRIAR USUÁRIO DE TESTE MANUALMENTE
-- =====================================================

-- Criar usuário diretamente como já verificado
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'teste@exemplo.com',
  now(), -- Já confirmado
  now(),
  now(),
  '{"name": "Usuário Teste"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Criar tenant_settings para o usuário
INSERT INTO tenant_settings (
  user_id,
  company_name,
  plan,
  monthly_analyses_limit,
  analyses_used
) SELECT 
  u.id,
  'Empresa Teste',
  'professional',
  50,
  0
FROM auth.users u 
WHERE u.email = 'teste@exemplo.com'
AND NOT EXISTS (
  SELECT 1 FROM tenant_settings ts WHERE ts.user_id = u.id
);

-- Verificar criação
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  ts.company_name,
  ts.plan
FROM auth.users u
LEFT JOIN tenant_settings ts ON u.id = ts.user_id
WHERE u.email = 'teste@exemplo.com';
