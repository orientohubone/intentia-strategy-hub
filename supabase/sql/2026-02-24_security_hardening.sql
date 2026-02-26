-- Security Hardening Migration
-- Revoke permissive policies that expose sensitive data or allow unauthorized modifications.

-- 1. Secure admin_users table (prevent password hash leakage)
-- Only service_role should access admin_users.
DROP POLICY IF EXISTS "admin_users_select_for_login" ON admin_users;
DROP POLICY IF EXISTS "admin_users_select_anon" ON admin_users;

-- 2. Secure feature_flags table (prevent unauthorized updates)
-- Authenticated users should only SELECT, not UPDATE. Updates must go through Admin API (service_role).
DROP POLICY IF EXISTS "feature_flags_update_auth" ON feature_flags;

-- 3. Secure plan_features table (prevent unauthorized updates)
-- Authenticated users should only SELECT, not UPDATE. Updates must go through Admin API (service_role).
DROP POLICY IF EXISTS "plan_features_update_auth" ON plan_features;

-- 4. Secure tenant_settings table (prevent listing all users)
-- Authenticated users should only see their own settings (via existing "tenant_settings_select_own").
-- The "tenant_settings_select_admin" policy allowed any authenticated user to see ALL rows.
DROP POLICY IF EXISTS "tenant_settings_select_admin" ON tenant_settings;

-- 5. Verification Logs (ensure restrictive access if not already)
-- Create policy if it doesn't exist to allow service_role to insert/select, but restrict users.
-- Assuming verification_logs exists from context, but if it was created without RLS enabled, we should enable it.
ALTER TABLE IF EXISTS verification_logs ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (implicit, but good to know)
-- No public policies for verification_logs should exist.
