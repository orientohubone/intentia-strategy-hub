-- =====================================================
-- FIX: Admin Panel RLS — Allow anon access
-- O admin pode não estar logado no Supabase Auth,
-- então precisa de policies para 'anon' também.
-- =====================================================

-- Feature flags: anon SELECT
CREATE POLICY "feature_flags_select_anon" ON feature_flags
  FOR SELECT TO anon USING (true);

-- Feature flags: anon UPDATE (admin panel)
CREATE POLICY "feature_flags_update_anon" ON feature_flags
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Plan features: anon SELECT
CREATE POLICY "plan_features_select_anon" ON plan_features
  FOR SELECT TO anon USING (true);

-- Plan features: anon UPDATE (admin panel)
CREATE POLICY "plan_features_update_anon" ON plan_features
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Tenant settings: anon SELECT (admin needs to list users)
CREATE POLICY "tenant_settings_select_anon" ON tenant_settings
  FOR SELECT TO anon USING (true);

-- Admin audit log: anon INSERT (for admin_change_user_plan RPC logging)
CREATE POLICY "admin_audit_log_insert_anon" ON admin_audit_log
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "admin_audit_log_insert_auth" ON admin_audit_log
  FOR INSERT TO authenticated WITH CHECK (true);
