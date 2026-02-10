-- =====================================================
-- RLS Policies: Allow authenticated users to READ feature_flags and plan_features
-- These tables were previously only accessible via anon role (admin panel).
-- Authenticated users need SELECT access for the useFeatureFlags hook to work.
-- =====================================================

-- Feature flags: authenticated SELECT (users need to read global feature status)
CREATE POLICY "feature_flags_select_authenticated" ON feature_flags
  FOR SELECT TO authenticated USING (true);

-- Plan features: authenticated SELECT (users need to check their plan's feature access)
CREATE POLICY "plan_features_select_authenticated" ON plan_features
  FOR SELECT TO authenticated USING (true);

-- =====================================================
-- RLS Policies: Allow anon role to manage user_feature_overrides (admin panel)
-- The admin panel operates under the anon role and needs full CRUD access.
-- =====================================================

-- User feature overrides: anon SELECT (admin needs to list all overrides)
CREATE POLICY "user_feature_overrides_select_anon" ON user_feature_overrides
  FOR SELECT TO anon USING (true);

-- User feature overrides: anon INSERT (admin creates overrides for users)
CREATE POLICY "user_feature_overrides_insert_anon" ON user_feature_overrides
  FOR INSERT TO anon WITH CHECK (true);

-- User feature overrides: anon UPDATE (admin toggles overrides)
CREATE POLICY "user_feature_overrides_update_anon" ON user_feature_overrides
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- User feature overrides: anon DELETE (admin removes overrides)
CREATE POLICY "user_feature_overrides_delete_anon" ON user_feature_overrides
  FOR DELETE TO anon USING (true);

-- =====================================================
-- RLS Policies: Allow authenticated role FULL access to user_feature_overrides
-- The admin panel may also run under authenticated role if the admin
-- is simultaneously logged in as a Supabase Auth user.
-- The existing "user_overrides_select_own" policy only allows users to
-- read their OWN overrides. We need broader access for admin operations.
-- =====================================================

-- User feature overrides: authenticated SELECT ALL (admin needs to see all users' overrides)
CREATE POLICY "user_feature_overrides_select_all_authenticated" ON user_feature_overrides
  FOR SELECT TO authenticated USING (true);

-- User feature overrides: authenticated INSERT (admin creates overrides)
CREATE POLICY "user_feature_overrides_insert_authenticated" ON user_feature_overrides
  FOR INSERT TO authenticated WITH CHECK (true);

-- User feature overrides: authenticated UPDATE (admin toggles overrides)
CREATE POLICY "user_feature_overrides_update_authenticated" ON user_feature_overrides
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- User feature overrides: authenticated DELETE (admin removes overrides)
CREATE POLICY "user_feature_overrides_delete_authenticated" ON user_feature_overrides
  FOR DELETE TO authenticated USING (true);
