-- =====================================================
-- ADMIN PANEL SCHEMA
-- Painel administrativo do founder com controle de features e planos
-- =====================================================

-- Helper function (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Admin Users (autenticação separada por CNPJ + senha)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Admin',
  role TEXT NOT NULL DEFAULT 'founder' CHECK (role IN ('founder', 'admin', 'support')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger updated_at
CREATE TRIGGER set_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Feature Flags (controle global de funcionalidades)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'analysis', 'ai', 'benchmark', 'tactical', 'export', 'social', 'general', 'admin'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',        -- Funcionando normalmente
    'disabled',      -- Desativado (não aparece para ninguém)
    'development',   -- Em desenvolvimento (aparece com badge "Em breve")
    'maintenance',   -- Em manutenção (aparece com aviso)
    'deprecated'     -- Descontinuado (aparece com aviso de remoção)
  )),
  status_message TEXT,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Plan Features (quais features cada plano tem acesso)
CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key TEXT NOT NULL REFERENCES feature_flags(feature_key) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  usage_limit INTEGER,
  limit_period TEXT CHECK (limit_period IN ('daily', 'weekly', 'monthly', 'unlimited')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(feature_key, plan)
);

CREATE TRIGGER set_plan_features_updated_at
  BEFORE UPDATE ON plan_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Admin Audit Log (ações do admin)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User Overrides (override de features por usuário específico)
CREATE TABLE IF NOT EXISTS user_feature_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_key TEXT NOT NULL REFERENCES feature_flags(feature_key) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL,
  reason TEXT,
  admin_id UUID REFERENCES admin_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_key)
);

CREATE TRIGGER set_user_feature_overrides_updated_at
  BEFORE UPDATE ON user_feature_overrides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_status ON feature_flags(status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);
CREATE INDEX IF NOT EXISTS idx_plan_features_plan ON plan_features(plan);
CREATE INDEX IF NOT EXISTS idx_plan_features_key ON plan_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_feature_overrides_user ON user_feature_overrides(user_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feature_overrides ENABLE ROW LEVEL SECURITY;

-- Feature flags: readable by all authenticated users (needed for frontend checks)
CREATE POLICY "feature_flags_select_all" ON feature_flags
  FOR SELECT TO authenticated USING (true);

-- Plan features: readable by all authenticated users
CREATE POLICY "plan_features_select_all" ON plan_features
  FOR SELECT TO authenticated USING (true);

-- User overrides: users can read their own overrides
CREATE POLICY "user_overrides_select_own" ON user_feature_overrides
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Admin tables: only service_role can write (admin operations go through Edge Functions)
-- No direct INSERT/UPDATE/DELETE policies for authenticated users on admin tables

-- =====================================================
-- SEED: Feature Flags (todas as funcionalidades do sistema)
-- =====================================================

INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order) VALUES
  -- Analysis
  ('url_heuristic_analysis', 'Diagnóstico Heurístico de URL', 'Análise automática de proposta de valor, clareza, jornada, SEO, conversão e conteúdo', 'analysis', 'active', 10),
  ('structured_data_viewer', 'Visualizador de Dados Estruturados', 'Extração e visualização de JSON-LD, Open Graph, Twitter Card e Microdata', 'analysis', 'active', 11),
  ('structured_data_generator', 'Gerador de Dados Estruturados', 'Gap analysis e geração de snippets baseados na concorrência', 'analysis', 'active', 12),
  ('html_snapshot', 'HTML Snapshot', 'Versão limpa do HTML para referência rápida', 'analysis', 'active', 13),
  ('progress_tracker', 'Progress Tracker', 'Indicador visual step-by-step durante análise', 'analysis', 'active', 14),
  
  -- AI
  ('ai_project_analysis', 'Análise por IA de Projetos', 'Resumo executivo, SWOT, prontidão e recomendações via Gemini/Claude', 'ai', 'active', 20),
  ('ai_benchmark_enrichment', 'Enriquecimento de Benchmark por IA', 'Vantagens, desvantagens, gaps e plano de ação via IA', 'ai', 'active', 21),
  ('ai_api_keys', 'Configuração de API Keys', 'Configurar chaves Gemini e Claude por usuário', 'ai', 'active', 22),
  
  -- Benchmark
  ('benchmark_swot', 'Benchmark Competitivo SWOT', 'Análise SWOT automática com scores comparativos', 'benchmark', 'active', 30),
  ('benchmark_gap_analysis', 'Gap Analysis Competitivo', 'Identificação de gaps entre projeto e concorrentes', 'benchmark', 'active', 31),
  
  -- Tactical
  ('tactical_plan', 'Plano Tático por Canal', 'Estruturação de campanhas para Google, Meta, LinkedIn e TikTok', 'tactical', 'active', 40),
  ('tactical_templates', 'Templates Táticos por Nicho', '6 templates pré-preenchidos (SaaS, Consultoria, etc.)', 'tactical', 'active', 41),
  ('tactical_playbook', 'Playbook Gamificado', 'Diretivas de execução priorizadas com KPIs', 'tactical', 'active', 42),
  
  -- Export
  ('export_pdf', 'Relatórios PDF', 'Relatórios consolidados por projeto em PDF', 'export', 'active', 50),
  ('export_csv', 'Exportação CSV', 'Dados tabulares em CSV para análise externa', 'export', 'active', 51),
  ('export_ai_results', 'Exportação de Resultados IA', 'JSON, Markdown, HTML e PDF dos resultados de IA', 'export', 'active', 52),
  
  -- Social / Brand
  ('brand_guide', 'Brand Guide', 'Guia de marca com identidade visual', 'social', 'active', 60),
  ('brand_posts', 'Posts de Marca', 'Geração de posts para redes sociais', 'social', 'active', 61),
  
  -- General
  ('channel_scores', 'Score por Canal de Mídia', 'Scores para Google, Meta, LinkedIn e TikTok', 'general', 'active', 70),
  ('strategic_insights', 'Insights Estratégicos', 'Alertas, oportunidades e melhorias por projeto', 'general', 'active', 71),
  ('strategic_alerts', 'Alertas Estratégicos', 'Página dedicada com 4 categorias de alertas', 'general', 'active', 72),
  ('audiences', 'Públicos-Alvo', 'CRUD de audiências B2B com vinculação a projetos', 'general', 'active', 73),
  ('notifications', 'Notificações', 'Notificações real-time via Supabase', 'general', 'active', 74),
  ('dark_mode', 'Tema Escuro', 'Alternância entre tema claro e escuro', 'general', 'active', 75),
  ('backup_system', 'Backup & Segurança', 'Backup manual/automático e exportação de dados', 'general', 'active', 76)
ON CONFLICT (feature_key) DO NOTHING;

-- =====================================================
-- SEED: Plan Features (mapeamento feature → plano)
-- =====================================================

-- Starter (gratuito)
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('url_heuristic_analysis', 'starter', true, 5, 'monthly'),
  ('structured_data_viewer', 'starter', true, NULL, NULL),
  ('structured_data_generator', 'starter', false, NULL, NULL),
  ('html_snapshot', 'starter', true, NULL, NULL),
  ('progress_tracker', 'starter', true, NULL, NULL),
  ('ai_project_analysis', 'starter', false, NULL, NULL),
  ('ai_benchmark_enrichment', 'starter', false, NULL, NULL),
  ('ai_api_keys', 'starter', false, NULL, NULL),
  ('benchmark_swot', 'starter', true, 5, 'monthly'),
  ('benchmark_gap_analysis', 'starter', false, NULL, NULL),
  ('tactical_plan', 'starter', false, NULL, NULL),
  ('tactical_templates', 'starter', false, NULL, NULL),
  ('tactical_playbook', 'starter', false, NULL, NULL),
  ('export_pdf', 'starter', false, NULL, NULL),
  ('export_csv', 'starter', false, NULL, NULL),
  ('export_ai_results', 'starter', false, NULL, NULL),
  ('brand_guide', 'starter', false, NULL, NULL),
  ('brand_posts', 'starter', false, NULL, NULL),
  ('channel_scores', 'starter', true, NULL, NULL),
  ('strategic_insights', 'starter', true, NULL, NULL),
  ('strategic_alerts', 'starter', true, NULL, NULL),
  ('audiences', 'starter', true, 1, 'unlimited'),
  ('notifications', 'starter', true, NULL, NULL),
  ('dark_mode', 'starter', true, NULL, NULL),
  ('backup_system', 'starter', false, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- Professional
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('url_heuristic_analysis', 'professional', true, NULL, NULL),
  ('structured_data_viewer', 'professional', true, NULL, NULL),
  ('structured_data_generator', 'professional', true, NULL, NULL),
  ('html_snapshot', 'professional', true, NULL, NULL),
  ('progress_tracker', 'professional', true, NULL, NULL),
  ('ai_project_analysis', 'professional', true, NULL, NULL),
  ('ai_benchmark_enrichment', 'professional', true, NULL, NULL),
  ('ai_api_keys', 'professional', true, NULL, NULL),
  ('benchmark_swot', 'professional', true, NULL, NULL),
  ('benchmark_gap_analysis', 'professional', true, NULL, NULL),
  ('tactical_plan', 'professional', true, NULL, NULL),
  ('tactical_templates', 'professional', true, NULL, NULL),
  ('tactical_playbook', 'professional', true, NULL, NULL),
  ('export_pdf', 'professional', true, NULL, NULL),
  ('export_csv', 'professional', true, NULL, NULL),
  ('export_ai_results', 'professional', true, NULL, NULL),
  ('brand_guide', 'professional', true, NULL, NULL),
  ('brand_posts', 'professional', true, NULL, NULL),
  ('channel_scores', 'professional', true, NULL, NULL),
  ('strategic_insights', 'professional', true, NULL, NULL),
  ('strategic_alerts', 'professional', true, NULL, NULL),
  ('audiences', 'professional', true, NULL, NULL),
  ('notifications', 'professional', true, NULL, NULL),
  ('dark_mode', 'professional', true, NULL, NULL),
  ('backup_system', 'professional', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- Enterprise
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('url_heuristic_analysis', 'enterprise', true, NULL, NULL),
  ('structured_data_viewer', 'enterprise', true, NULL, NULL),
  ('structured_data_generator', 'enterprise', true, NULL, NULL),
  ('html_snapshot', 'enterprise', true, NULL, NULL),
  ('progress_tracker', 'enterprise', true, NULL, NULL),
  ('ai_project_analysis', 'enterprise', true, NULL, NULL),
  ('ai_benchmark_enrichment', 'enterprise', true, NULL, NULL),
  ('ai_api_keys', 'enterprise', true, NULL, NULL),
  ('benchmark_swot', 'enterprise', true, NULL, NULL),
  ('benchmark_gap_analysis', 'enterprise', true, NULL, NULL),
  ('tactical_plan', 'enterprise', true, NULL, NULL),
  ('tactical_templates', 'enterprise', true, NULL, NULL),
  ('tactical_playbook', 'enterprise', true, NULL, NULL),
  ('export_pdf', 'enterprise', true, NULL, NULL),
  ('export_csv', 'enterprise', true, NULL, NULL),
  ('export_ai_results', 'enterprise', true, NULL, NULL),
  ('brand_guide', 'enterprise', true, NULL, NULL),
  ('brand_posts', 'enterprise', true, NULL, NULL),
  ('channel_scores', 'enterprise', true, NULL, NULL),
  ('strategic_insights', 'enterprise', true, NULL, NULL),
  ('strategic_alerts', 'enterprise', true, NULL, NULL),
  ('audiences', 'enterprise', true, NULL, NULL),
  ('notifications', 'enterprise', true, NULL, NULL),
  ('dark_mode', 'enterprise', true, NULL, NULL),
  ('backup_system', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- =====================================================
-- SEED: Admin User (founder)
-- Password: use bcrypt hash. This is a placeholder — 
-- the real hash should be generated securely.
-- For now we use a simple hash that the Edge Function will verify.
-- =====================================================

INSERT INTO admin_users (cnpj, password_hash, name, role) VALUES
  ('64999887000156', '0dd00a51701f1b448bae430e7473157b17a570bb52634bd5add6ea09d3378e20', 'Founder', 'founder')
ON CONFLICT (cnpj) DO NOTHING;

-- =====================================================
-- HELPER: Function to verify admin login (rate-limited)
-- =====================================================

CREATE OR REPLACE FUNCTION check_admin_login_attempts(p_cnpj TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_attempts INTEGER;
  v_locked_until TIMESTAMPTZ;
BEGIN
  SELECT login_attempts, locked_until INTO v_attempts, v_locked_until
  FROM admin_users WHERE cnpj = p_cnpj;
  
  IF NOT FOUND THEN RETURN FALSE; END IF;
  
  -- Check if locked
  IF v_locked_until IS NOT NULL AND v_locked_until > now() THEN
    RETURN FALSE;
  END IF;
  
  -- Reset lock if expired
  IF v_locked_until IS NOT NULL AND v_locked_until <= now() THEN
    UPDATE admin_users SET login_attempts = 0, locked_until = NULL WHERE cnpj = p_cnpj;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_admin_login_attempts(p_cnpj TEXT)
RETURNS VOID AS $$
DECLARE
  v_attempts INTEGER;
BEGIN
  UPDATE admin_users 
  SET login_attempts = login_attempts + 1
  WHERE cnpj = p_cnpj
  RETURNING login_attempts INTO v_attempts;
  
  -- Lock after 5 failed attempts for 15 minutes
  IF v_attempts >= 5 THEN
    UPDATE admin_users 
    SET locked_until = now() + INTERVAL '15 minutes'
    WHERE cnpj = p_cnpj;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION reset_admin_login_attempts(p_cnpj TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_users 
  SET login_attempts = 0, locked_until = NULL, last_login_at = now()
  WHERE cnpj = p_cnpj;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADMIN RPC: Change user plan (bypasses prevent_plan_escalation)
-- Called from admin panel to change a user's plan
-- =====================================================

CREATE OR REPLACE FUNCTION admin_change_user_plan(
  p_admin_cnpj TEXT,
  p_target_user_id UUID,
  p_new_plan TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_admin_id UUID;
  v_old_plan TEXT;
BEGIN
  -- Verify admin exists and is active
  SELECT id INTO v_admin_id FROM admin_users 
  WHERE cnpj = p_admin_cnpj AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Admin not found or inactive';
  END IF;
  
  -- Validate plan
  IF p_new_plan NOT IN ('starter', 'professional', 'enterprise') THEN
    RAISE EXCEPTION 'Invalid plan: %', p_new_plan;
  END IF;
  
  -- Get current plan
  SELECT plan INTO v_old_plan FROM tenant_settings WHERE user_id = p_target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update plan (SECURITY DEFINER bypasses the prevent_plan_escalation trigger check)
  UPDATE tenant_settings 
  SET plan = p_new_plan,
      monthly_analyses_limit = CASE 
        WHEN p_new_plan = 'starter' THEN 5
        WHEN p_new_plan = 'professional' THEN -1
        WHEN p_new_plan = 'enterprise' THEN -1
        ELSE 5
      END
  WHERE user_id = p_target_user_id;
  
  -- Log the action
  INSERT INTO admin_audit_log (admin_id, action, target_table, target_id, details)
  VALUES (
    v_admin_id,
    'change_plan',
    'tenant_settings',
    p_target_user_id::TEXT,
    jsonb_build_object('old_plan', v_old_plan, 'new_plan', p_new_plan)
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADDITIONAL RLS POLICIES for admin operations
-- Admin reads admin_users for login (via CNPJ lookup)
-- =====================================================

-- Allow authenticated users to SELECT admin_users (needed for login verification)
-- password_hash is exposed but verified client-side with SHA-256
-- In production, use an Edge Function with service_role for auth
CREATE POLICY "admin_users_select_for_login" ON admin_users
  FOR SELECT TO authenticated USING (true);

-- Also allow anon to read (admin might not be a Supabase user)
CREATE POLICY "admin_users_select_anon" ON admin_users
  FOR SELECT TO anon USING (true);

-- Feature flags: allow authenticated to UPDATE (admin panel uses Supabase client)
-- In production, restrict to service_role and use Edge Functions
CREATE POLICY "feature_flags_update_auth" ON feature_flags
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Plan features: allow authenticated to UPDATE
CREATE POLICY "plan_features_update_auth" ON plan_features
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Tenant settings: allow authenticated to SELECT all (admin needs to list users)
-- Note: regular users already have SELECT own via existing RLS
CREATE POLICY "tenant_settings_select_admin" ON tenant_settings
  FOR SELECT TO authenticated USING (true);
