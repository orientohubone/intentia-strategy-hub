-- =====================================================
-- VERIFICAR SE USUÁRIO JÁ EXISTE
-- =====================================================

-- Verificar se usuário existe no auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'meta-review@orientohub.com.br';

-- Verificar se existe em tenant_settings
SELECT 
  user_id,
  company_name,
  plan,
  created_at
FROM tenant_settings 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'meta-review@orientohub.com.br'
);

-- Contar usuários com email similar
SELECT 
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email LIKE '%meta-review%'
ORDER BY created_at DESC;
