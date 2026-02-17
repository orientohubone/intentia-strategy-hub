-- =====================================================
-- CRIAR USUÁRIO META REVIEW
-- =====================================================

-- 1. Criar usuário no auth.users (manualmente)
-- Primeiro verifica se já existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'meta-review@orientohub.com.br') THEN
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_user_meta_data,
      is_super_admin
    ) VALUES (
      gen_random_uuid(),
      'meta-review@orientohub.com.br',
      crypt('MetaReview2026!', gen_salt('bf')),
      now(), -- Já confirmado
      now(),
      now(),
      '{"name": "Meta Review", "company": "Meta"}',
      false
    );
  END IF;
END $$;

-- 2. Criar tenant_settings para o usuário
INSERT INTO tenant_settings (
  user_id,
  company_name,
  plan,
  monthly_analyses_limit,
  analyses_used
) SELECT 
  u.id,
  'Meta',
  'professional',
  50,
  0
FROM auth.users u 
WHERE u.email = 'meta-review@orientohub.com.br'
AND NOT EXISTS (
  SELECT 1 FROM tenant_settings ts WHERE ts.user_id = u.id
);

-- 3. Verificar criação
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  u.raw_user_meta_data,
  ts.company_name,
  ts.plan,
  ts.monthly_analyses_limit
FROM auth.users u
LEFT JOIN tenant_settings ts ON u.id = ts.user_id
WHERE u.email = 'meta-review@orientohub.com.br';

-- 4. Testar login (opcional)
-- Para testar, você pode fazer login normal com:
-- Email: meta-review@orientohub.com.br
-- Senha: MetaReview2026!
