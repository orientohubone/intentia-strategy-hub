-- =====================================================
-- Adicionar feature 'operations' que falta no seed
-- =====================================================

-- 1. Adicionar feature flag
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order)
VALUES ('operations', 'Operações & Campanhas', 'Gestão de campanhas, métricas, budget e calendário operacional', 'tactical', 'active', 43)
ON CONFLICT (feature_key) DO NOTHING;

-- 2. Adicionar feature 'support_chat' para controle do chat de suporte
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order)
VALUES ('support_chat', 'Chat de Suporte', 'Conversa em tempo real com o suporte via chat', 'admin', 'active', 77)
ON CONFLICT (feature_key) DO NOTHING;

-- 3. Adicionar feature 'integrations' para controle da página de integrações
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order)
VALUES ('integrations', 'Integrações de Marketing', 'Conexão com Google Ads, Meta Ads, LinkedIn Ads e TikTok Ads via OAuth', 'integrations', 'development', 78)
ON CONFLICT (feature_key) DO NOTHING;

-- 4. Adicionar feature 'seo_geo' para controle da página SEO & Performance
INSERT INTO feature_flags (feature_key, feature_name, description, category, status, sort_order)
VALUES ('seo_geo', 'SEO & Geolocalização', 'Análise SEO, PageSpeed Insights e dados geográficos', 'seo_performance', 'active', 84)
ON CONFLICT (feature_key) DO NOTHING;

-- 5. Plan features para 'operations'
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('operations', 'starter', false, NULL, NULL),
  ('operations', 'professional', true, NULL, NULL),
  ('operations', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 6. Plan features para 'support_chat'
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('support_chat', 'starter', false, NULL, NULL),
  ('support_chat', 'professional', true, NULL, NULL),
  ('support_chat', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 7. Plan features para 'integrations'
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('integrations', 'starter', false, NULL, NULL),
  ('integrations', 'professional', true, NULL, NULL),
  ('integrations', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;

-- 8. Plan features para 'seo_geo'
INSERT INTO plan_features (feature_key, plan, is_enabled, usage_limit, limit_period) VALUES
  ('seo_geo', 'starter', true, 3, 'monthly'),
  ('seo_geo', 'professional', true, NULL, NULL),
  ('seo_geo', 'enterprise', true, NULL, NULL)
ON CONFLICT (feature_key, plan) DO NOTHING;
