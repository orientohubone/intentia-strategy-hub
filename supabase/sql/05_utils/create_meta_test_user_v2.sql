-- Criar usuário de teste para revisão do Meta App
-- Email: meta-review@orientohub.com.br
-- Senha: MetaReview2026!

-- 1. Criar usuário no Supabase Auth (schema correto)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_token_current,
  banned_until,
  reauthentication_token,
  reauthentication_token_sent_at,
  is_sso_user,
  is_sso_user_created_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_user_meta_data,
  is_super_admin,
  app_metadata
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- instance_id padrão
  gen_random_uuid(), -- ID único gerado
  'authenticated',
  'authenticated',
  'meta-review@orientohub.com.br',
  crypt('MetaReview2026!', 'bf'), -- Senha criptografada
  now(),
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  NULL,
  now(),
  now(),
  now(),
  '{"full_name": "Meta Review Account"}', -- raw_user_meta_data
  false,
  '{"provider": "email"}' -- app_metadata
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
