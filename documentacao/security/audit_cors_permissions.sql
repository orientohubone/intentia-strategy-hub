-- Auditoria e endurecimento de permissões (Supabase/Postgres)
-- Ajuste project_ref/schemas conforme necessário. Rodar com role de admin/service.

-- 1) Listar grants por tabela (schema public)
select grantee, table_schema, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
order by table_name, grantee;

-- 2) Revogar CRUD de anon/authenticated em tabelas sensíveis (exemplo: tudo em public)
-- Ajuste a lista de tabelas conforme seu schema real.
-- Exemplo genérico: revoga insert/update/delete/select de anon/authenticated.
-- Se precisar manter SELECT para usuários logados, remova authenticated dos revoke.
-- IMPORTANTE: valide antes de aplicar em produção.

do $$
declare
  r record;
begin
  for r in select tablename from pg_tables where schemaname='public' loop
    execute format('revoke select, insert, update, delete on public.%I from anon;', r.tablename);
    execute format('revoke insert, update, delete on public.%I from authenticated;', r.tablename);
  end loop;
end $$;

-- 3) Garantir RLS ligado em todas as tabelas do schema public
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname='public'
order by tablename;

-- Ativar RLS em todas (caso alguma esteja off)
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname='public' loop
    execute format('alter table public.%I enable row level security;', r.tablename);
  end loop;
end $$;

-- 4) Listar policies existentes
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname='public'
order by tablename, policyname;

-- 5) (Opcional) Revogar execute de RPCs para anon/authenticated
-- Ajuste nomes/assinaturas conforme suas functions
-- Exemplo genérico: remove execute de anon/authenticated e deixa service_role
-- do $$
-- declare r record;
-- begin
--   for r in select n.nspname as schema, p.proname as name, p.oid
--            from pg_proc p join pg_namespace n on n.oid=p.pronamespace
--            where n.nspname='public' loop
--     execute format('revoke execute on function %I.%I() from anon;', r.schema, r.name);
--     execute format('revoke execute on function %I.%I() from authenticated;', r.schema, r.name);
--   end loop;
-- end $$;

-- 6) Storage buckets: listar público/privado
select id, name, public from storage.buckets;
select * from storage.policies;
-- Se precisar, torne buckets privados e crie policies restritas a user_id
-- update storage.buckets set public=false where name in ('avatars', '...');

-- 7) CORS: ajustar via painel Supabase (Settings -> API). Não recomendado usar '*'.
-- Mantenha apenas domínios de produção/homolog. Para checar por SQL:
-- select * from auth.config; -- (não traz CORS, mas valida JWT exp, etc.)

-- 8) Conferir roles com execute em functions
select n.nspname, p.proname,
       array(select rolname from pg_roles r where has_function_privilege(r.oid, p.oid, 'EXECUTE')) as exec_roles
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public';

-- 9) Checklist manual
-- - Policies: confirmar que todas usam user_id = auth.uid()
-- - Nenhum grant de insert/update/delete para anon
-- - RPCs sensíveis sem execute para anon/authenticated
-- - Buckets não públicos (exceto assets públicos intencionais)
-- - Edge Functions exigem JWT ou secret
