-- Criar tenant_settings para usuário de teste Meta
-- Email: meta-review@orientohub.com.br
-- 
-- INSTRUÇÕES:
-- 1. Primeiro crie o usuário pela UI: https://intentia.com.br/auth
--    Email: meta-review@orientohub.com.br
--    Senha: MetaReview2026!
-- 2. Execute este SELECT para obter o ID do usuário:
--    SELECT id FROM auth.users WHERE email = 'meta-review@orientohub.com.br';
-- 3. Copie o ID gerado e substitua <USER_ID> abaixo
-- 4. Execute o INSERT

-- Substitua <USER_ID> pelo ID real do usuário
INSERT INTO tenant_settings (
  user_id,
  company_name,
  plan,
  monthly_analyses_limit,
  max_projects,
  created_at,
  updated_at
) VALUES (
  '<USER_ID>',
  'Meta Review Account',
  'starter',
  5,
  5,
  now(),
  now()
);

-- Verificar se foi criado
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
