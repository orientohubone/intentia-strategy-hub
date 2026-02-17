-- =====================================================
-- FIX: Garantir que user_feature_overrides tem policy de SELECT para authenticated
-- Problema: O security_audit_fix.sql removeu todas as policies permissivas
-- mas a policy "user_overrides_select_own" pode não existir.
-- =====================================================

-- Dropar e recriar para garantir
DROP POLICY IF EXISTS "user_overrides_select_own" ON user_feature_overrides;

CREATE POLICY "user_overrides_select_own" ON user_feature_overrides
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Verificar: listar todas as policies da tabela
-- SELECT policyname, cmd, roles, qual FROM pg_policies WHERE tablename = 'user_feature_overrides';
