-- =====================================================
-- INTENTIA STRATEGY HUB — SECURITY AUDIT FIX
-- Correções de vulnerabilidades encontradas na auditoria
-- Data: 2025-02-11
-- =====================================================
-- IMPORTANTE: Execute este SQL no Supabase SQL Editor
-- na ordem apresentada. Cada seção é independente.
-- =====================================================

-- =====================================================
-- 🔴 CRÍTICA 1: Status Page — Remover CRUD aberto para anon/authenticated
-- Problema: Qualquer pessoa pode criar/editar/deletar serviços,
-- incidentes, manutenções e dados de uptime sem autenticação.
-- Solução: Remover policies de escrita. Apenas service_role
-- (Edge Functions) pode modificar essas tabelas.
-- =====================================================

-- platform_services: remover INSERT/UPDATE/DELETE para anon e authenticated
DROP POLICY IF EXISTS "Anon can insert services" ON platform_services;
DROP POLICY IF EXISTS "Anon can update services" ON platform_services;
DROP POLICY IF EXISTS "Anon can delete services" ON platform_services;
DROP POLICY IF EXISTS "Auth can insert services" ON platform_services;
DROP POLICY IF EXISTS "Auth can update services" ON platform_services;
DROP POLICY IF EXISTS "Auth can delete services" ON platform_services;

-- platform_incidents: remover INSERT/UPDATE/DELETE para anon e authenticated
DROP POLICY IF EXISTS "Anon can insert incidents" ON platform_incidents;
DROP POLICY IF EXISTS "Anon can update incidents" ON platform_incidents;
DROP POLICY IF EXISTS "Anon can delete incidents" ON platform_incidents;
DROP POLICY IF EXISTS "Auth can insert incidents" ON platform_incidents;
DROP POLICY IF EXISTS "Auth can update incidents" ON platform_incidents;
DROP POLICY IF EXISTS "Auth can delete incidents" ON platform_incidents;

-- platform_incident_updates: remover INSERT/UPDATE/DELETE para anon e authenticated
DROP POLICY IF EXISTS "Anon can insert incident updates" ON platform_incident_updates;
DROP POLICY IF EXISTS "Anon can update incident updates" ON platform_incident_updates;
DROP POLICY IF EXISTS "Anon can delete incident updates" ON platform_incident_updates;
DROP POLICY IF EXISTS "Auth can insert incident updates" ON platform_incident_updates;
DROP POLICY IF EXISTS "Auth can update incident updates" ON platform_incident_updates;
DROP POLICY IF EXISTS "Auth can delete incident updates" ON platform_incident_updates;

-- platform_maintenances: remover INSERT/UPDATE/DELETE para anon e authenticated
DROP POLICY IF EXISTS "Anon can insert maintenances" ON platform_maintenances;
DROP POLICY IF EXISTS "Anon can update maintenances" ON platform_maintenances;
DROP POLICY IF EXISTS "Anon can delete maintenances" ON platform_maintenances;
DROP POLICY IF EXISTS "Auth can insert maintenances" ON platform_maintenances;
DROP POLICY IF EXISTS "Auth can update maintenances" ON platform_maintenances;
DROP POLICY IF EXISTS "Auth can delete maintenances" ON platform_maintenances;

-- platform_uptime_daily: remover INSERT/UPDATE/DELETE para anon e authenticated
DROP POLICY IF EXISTS "Anon can insert uptime" ON platform_uptime_daily;
DROP POLICY IF EXISTS "Anon can update uptime" ON platform_uptime_daily;
DROP POLICY IF EXISTS "Anon can delete uptime" ON platform_uptime_daily;
DROP POLICY IF EXISTS "Auth can insert uptime" ON platform_uptime_daily;
DROP POLICY IF EXISTS "Auth can update uptime" ON platform_uptime_daily;
DROP POLICY IF EXISTS "Auth can delete uptime" ON platform_uptime_daily;

-- Manter apenas SELECT público (necessário para a página /status)
-- As policies "Anyone can read *" do status_page_schema.sql continuam ativas.
-- Escrita agora é APENAS via service_role (Edge Functions usam SUPABASE_SERVICE_ROLE_KEY).

-- =====================================================
-- 🔴 CRÍTICA 2: admin_users — Remover SELECT público
-- Problema: password_hash (SHA-256 sem salt) exposto para anon/authenticated.
-- Solução: Remover SELECT policies. Login do admin deve ser via Edge Function.
-- =====================================================

DROP POLICY IF EXISTS "admin_users_select_anon" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_for_login" ON admin_users;

-- Nenhum usuário (anon ou authenticated) pode ler admin_users.
-- O login do admin deve ser feito via Edge Function com service_role.
-- Se o admin panel atual faz SELECT direto, ele precisará ser adaptado
-- para chamar uma Edge Function de autenticação.

-- =====================================================
-- 🔴 CRÍTICA 3: user_feature_overrides — Remover CRUD para anon
-- Problema: Qualquer pessoa pode habilitar features premium para qualquer user_id.
-- Solução: Remover policies anon. Manter apenas authenticated com filtro por user_id.
-- =====================================================

-- Remover todas as policies anon
DROP POLICY IF EXISTS "user_feature_overrides_select_anon" ON user_feature_overrides;
DROP POLICY IF EXISTS "user_feature_overrides_insert_anon" ON user_feature_overrides;
DROP POLICY IF EXISTS "user_feature_overrides_update_anon" ON user_feature_overrides;
DROP POLICY IF EXISTS "user_feature_overrides_delete_anon" ON user_feature_overrides;

-- Remover policies authenticated com USING(true) — muito permissivas
DROP POLICY IF EXISTS "user_feature_overrides_select_all_authenticated" ON user_feature_overrides;
DROP POLICY IF EXISTS "user_feature_overrides_insert_authenticated" ON user_feature_overrides;
DROP POLICY IF EXISTS "user_feature_overrides_update_authenticated" ON user_feature_overrides;
DROP POLICY IF EXISTS "user_feature_overrides_delete_authenticated" ON user_feature_overrides;

-- Manter apenas a policy original que filtra por user_id (SELECT own)
-- "user_overrides_select_own" já existe no admin_schema.sql: USING (auth.uid() = user_id)
-- Escrita em overrides deve ser APENAS via service_role (admin Edge Function).

-- =====================================================
-- 🟡 MÉDIA 1: feature_flags e plan_features — Remover UPDATE aberto
-- Problema: Qualquer usuário pode alterar feature flags globais e limites de planos.
-- Solução: Remover UPDATE para anon e authenticated. Apenas service_role pode modificar.
-- =====================================================

-- feature_flags: remover UPDATE
DROP POLICY IF EXISTS "feature_flags_update_anon" ON feature_flags;
DROP POLICY IF EXISTS "feature_flags_update_auth" ON feature_flags;

-- plan_features: remover UPDATE
DROP POLICY IF EXISTS "plan_features_update_anon" ON plan_features;
DROP POLICY IF EXISTS "plan_features_update_auth" ON plan_features;

-- SELECT continua permitido (frontend precisa ler feature flags).
-- Escrita agora é APENAS via service_role.

-- =====================================================
-- 🟡 MÉDIA 2: tenant_settings — Restringir SELECT
-- Problema: Qualquer pessoa pode listar todos os tenants (company_name, plan, etc).
-- Solução: Remover SELECT aberto. Manter apenas SELECT own (já existe).
-- =====================================================

DROP POLICY IF EXISTS "tenant_settings_select_anon" ON tenant_settings;
DROP POLICY IF EXISTS "tenant_settings_select_admin" ON tenant_settings;

-- A policy "tenant_settings_select_own" do schema.sql continua ativa:
-- FOR SELECT USING (auth.uid() = user_id)
-- Admin panel que precisa listar todos os tenants deve usar service_role.

-- =====================================================
-- 🟡 MÉDIA 3: platform_status_subscribers — Restringir SELECT/UPDATE
-- Problema: Qualquer pessoa pode listar todos os emails de subscribers.
-- Solução: Restringir SELECT e UPDATE. INSERT continua público.
-- =====================================================

-- Remover SELECT/UPDATE abertos
DROP POLICY IF EXISTS "Anon can read own sub" ON platform_status_subscribers;
DROP POLICY IF EXISTS "Auth can read own sub" ON platform_status_subscribers;
DROP POLICY IF EXISTS "Anon can update sub" ON platform_status_subscribers;
DROP POLICY IF EXISTS "Auth can update sub" ON platform_status_subscribers;

-- Novo: SELECT restrito por email (para verificação)
-- Nota: Não é possível filtrar por email do JWT em anon,
-- então SELECT para anon fica bloqueado. Verificação deve ser via Edge Function.
-- Para authenticated, permitir apenas ver própria subscription.
CREATE POLICY "Auth can read own subscription" ON platform_status_subscribers
  FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- UPDATE: apenas via service_role (verificação/unsubscribe via Edge Function)
-- Nenhuma policy de UPDATE para anon/authenticated.

-- INSERT continua público (as policies "Anyone can subscribe" e "Auth can subscribe" permanecem).

-- =====================================================
-- 🟡 MÉDIA 4: admin_audit_log — Restringir INSERT
-- Problema: anon e authenticated podem inserir no audit log.
-- Solução: Remover INSERT aberto. Apenas service_role pode inserir.
-- =====================================================

DROP POLICY IF EXISTS "admin_audit_log_insert_anon" ON admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log_insert_auth" ON admin_audit_log;

-- Audit log agora só pode ser escrito via service_role (Edge Functions e SECURITY DEFINER functions).

-- =====================================================
-- VERIFICAÇÃO: Confirmar que todas as tabelas têm RLS ativo
-- Execute esta query para verificar:
-- =====================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
--
-- Todas devem ter rowsecurity = true.
-- =====================================================

-- =====================================================
-- NOTA SOBRE O ADMIN PANEL
-- =====================================================
-- Após aplicar estas correções, o Admin Panel que usa o
-- Supabase client com anon key NÃO conseguirá mais:
--   1. Fazer login (SELECT em admin_users bloqueado)
--   2. Alterar feature flags (UPDATE bloqueado)
--   3. Gerenciar overrides (CRUD bloqueado)
--   4. Gerenciar status page (INSERT/UPDATE/DELETE bloqueado)
--
-- SOLUÇÃO: O Admin Panel deve ser migrado para usar Edge Functions
-- com service_role para todas as operações administrativas.
-- Isso é a prática recomendada pelo Supabase para operações admin.
--
-- Enquanto isso, você pode usar o Supabase Dashboard (SQL Editor)
-- para operações administrativas diretas.
-- =====================================================
