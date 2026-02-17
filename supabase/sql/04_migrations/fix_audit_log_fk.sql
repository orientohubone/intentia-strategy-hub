-- =====================================================
-- FIX: Remover TODAS as FKs para auth.users
-- 
-- CAUSA: Quando RLS está ativo, qualquer FK que referencia
-- auth.users faz o PostgreSQL verificar a tabela auth.users.
-- O role 'authenticated' não tem SELECT em auth.users,
-- causando "permission denied for table users" em SELECT,
-- INSERT e UPDATE.
--
-- SOLUÇÃO: Remover as FKs. Os user_ids continuam sendo
-- armazenados, só não são mais validados via FK constraint.
-- A integridade é garantida pelo Supabase Auth.
-- =====================================================

-- PASSO 1: Listar TODAS as FKs que referenciam auth.users
-- (execute primeiro para ver o que será removido)
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name
FROM pg_constraint 
WHERE confrelid = 'auth.users'::regclass 
  AND contype = 'f'
ORDER BY table_name;

-- PASSO 2: Remover APENAS FKs de tabelas do schema PUBLIC
-- (ignora auth.identities e outras tabelas do Supabase)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT 
      c.conrelid::regclass::text AS tbl,
      c.conname AS cname
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE c.confrelid = 'auth.users'::regclass 
      AND c.contype = 'f'
      AND n.nspname = 'public'
  LOOP
    RAISE NOTICE 'Removendo FK % da tabela %', r.cname, r.tbl;
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I', 
      replace(r.tbl, 'public.', ''), r.cname);
  END LOOP;
END $$;

-- PASSO 3: Verificar que não restou nenhuma FK para auth.users
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name
FROM pg_constraint 
WHERE confrelid = 'auth.users'::regclass 
  AND contype = 'f'
ORDER BY table_name;
-- Deve retornar 0 rows
