-- Criar usuário de teste para revisão do Meta App
-- Email: meta-review@orientohub.com.br
-- Senha: MetaReview2026!

-- 1. Criar usuário no Supabase Auth
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  phone,
  phone_confirmed_at,
  email_change_confirm_token,
  email_change_confirm_token_expires_at,
  recovery_token,
  recovery_token_expires_at,
  user_metadata,
  app_metadata,
  is_sso_user,
  is_sso_user_created_at
) VALUES (
  gen_random_uuid(), -- ID único gerado
  'authenticated',
  'authenticated',
  'meta-review@orientohub.com.br',
  crypt('MetaReview2026!', 'bf'), -- Senha criptografada
  now(),
  now(),
  now(),
  now(),
  now(),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  '{"full_name": "Meta Review Account"}', -- user_metadata
  '{"provider": "email"}', -- app_metadata
  false,
  NULL
);

-- 2. Criar tenant_settings para o usuário
-- Nota: O ID do usuário precisa ser o mesmo gerado acima
-- Substitua <USER_ID> pelo ID retornado no INSERT anterior

INSERT INTO tenant_settings (
  user_id,
  company_name,
  plan,
  monthly_analyses_limit,
  max_projects,
  created_at,
  updated_at
) VALUES (
  '<USER_ID>', -- Substituir pelo ID gerado no INSERT anterior
  'Meta Review Account',
  'starter',
  5,
  5,
  now(),
  now()
);

-- 3. Verificar se o usuário foi criado
SELECT 
  u.id,
  u.email,
  u.created_at,
  t.company_name,
  t.plan,
  t.max_projects
FROM auth.users u
LEFT JOIN tenant_settings t ON u.id = t.user_id
WHERE u.email = 'meta-review@orientohub.com.br';
