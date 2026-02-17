-- =====================================================
-- DEBUG DO ERRO DE AUTH
-- =====================================================

-- 1. Verificar se há triggers bloqueando auth.users
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_condition
FROM information_schema.triggers 
WHERE event_object_table = 'users'
AND trigger_schema = 'auth';

-- 2. Verificar RLS em auth.users
SELECT 
  schemaname,
  tablename,
  rowsecurity,
  forcerlspolicy
FROM pg_tables 
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- 3. Verificar políticas em auth.users
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- 4. Verificar constraints em auth.users
SELECT 
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'auth.users'::regclass;

-- 5. Contar usuários totais
SELECT COUNT(*) as total_users FROM auth.users;

-- 6. Verificar último usuário criado
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
