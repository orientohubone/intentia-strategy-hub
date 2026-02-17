-- Migrar usuário de teste para plano Professional
-- Para uso no Admin Panel ou SQL direto

-- 1. Primeiro encontre o ID do usuário
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'meta-review@orientohub.com.br';

-- 2. Depois de obter o ID, migre para Professional
-- Substitua <USER_ID> pelo ID encontrado acima
UPDATE tenant_settings 
SET plan = 'professional',
    updated_at = now()
WHERE user_id = '<USER_ID>';

-- 3. Verificar a migração
SELECT 
  u.id,
  u.email,
  u.created_at,
  t.company_name,
  t.plan,
  t.max_projects,
  t.monthly_analyses_limit,
  t.updated_at as plano_atualizado_em
FROM auth.users u
LEFT JOIN tenant_settings t ON u.id = t.user_id
WHERE u.email = 'meta-review@orientohub.com.br';
