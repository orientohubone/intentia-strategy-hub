-- =============================================================================
-- Intentia Strategy Hub — Integrações com APIs de Marketing
-- Tabelas: ad_integrations, integration_sync_logs
-- =============================================================================

-- 1. Tabela principal de integrações
CREATE TABLE IF NOT EXISTS ad_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_ads', 'meta_ads', 'linkedin_ads', 'tiktok_ads')),
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'expired', 'syncing')),
  
  -- Credenciais OAuth / API
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Dados da conta conectada
  account_id TEXT,
  account_name TEXT,
  account_currency TEXT DEFAULT 'BRL',
  
  -- Configurações de sincronização
  sync_enabled BOOLEAN NOT NULL DEFAULT false,
  sync_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (sync_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  
  -- Mapeamento de projetos (quais contas/campanhas mapear para quais projetos)
  project_mappings JSONB DEFAULT '[]'::jsonb,
  
  -- Metadados
  scopes TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_provider UNIQUE (user_id, provider)
);

-- 2. Tabela de logs de sincronização
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES ad_integrations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_ads', 'meta_ads', 'linkedin_ads', 'tiktok_ads')),
  
  -- Status do sync
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'partial')),
  
  -- Detalhes
  sync_type TEXT NOT NULL DEFAULT 'full' CHECK (sync_type IN ('full', 'incremental', 'manual')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  -- Resultados
  records_fetched INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Período sincronizado
  period_start DATE,
  period_end DATE,
  
  -- Erros
  error_message TEXT,
  error_details JSONB,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_ad_integrations_user_id ON ad_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_integrations_provider ON ad_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_ad_integrations_status ON ad_integrations(status);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_user_id ON integration_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration_id ON integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_created_at ON integration_sync_logs(created_at DESC);

-- 4. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_ad_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ad_integrations_updated_at ON ad_integrations;
CREATE TRIGGER trg_ad_integrations_updated_at
  BEFORE UPDATE ON ad_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_ad_integrations_updated_at();

-- 5. RLS
ALTER TABLE ad_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- ad_integrations policies
CREATE POLICY "Users can view their own integrations"
  ON ad_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
  ON ad_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON ad_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON ad_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- integration_sync_logs policies
CREATE POLICY "Users can view their own sync logs"
  ON integration_sync_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync logs"
  ON integration_sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. View: resumo de integrações por usuário
CREATE OR REPLACE VIEW v_integration_summary AS
SELECT
  ai.id,
  ai.user_id,
  ai.provider,
  ai.status,
  ai.account_id,
  ai.account_name,
  ai.account_currency,
  ai.sync_enabled,
  ai.sync_frequency,
  ai.last_sync_at,
  ai.next_sync_at,
  ai.error_message,
  ai.error_count,
  ai.scopes,
  ai.project_mappings,
  ai.created_at,
  ai.updated_at,
  COALESCE(ls.total_syncs, 0) AS total_syncs,
  COALESCE(ls.successful_syncs, 0) AS successful_syncs,
  COALESCE(ls.failed_syncs, 0) AS failed_syncs,
  COALESCE(ls.total_records_fetched, 0) AS total_records_fetched,
  ls.last_sync_status,
  ls.last_sync_duration_ms
FROM ad_integrations ai
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_syncs,
    COUNT(*) FILTER (WHERE isl.status = 'completed') AS successful_syncs,
    COUNT(*) FILTER (WHERE isl.status = 'failed') AS failed_syncs,
    SUM(isl.records_fetched) AS total_records_fetched,
    (SELECT s2.status FROM integration_sync_logs s2 WHERE s2.integration_id = ai.id ORDER BY s2.created_at DESC LIMIT 1) AS last_sync_status,
    (SELECT s3.duration_ms FROM integration_sync_logs s3 WHERE s3.integration_id = ai.id ORDER BY s3.created_at DESC LIMIT 1) AS last_sync_duration_ms
  FROM integration_sync_logs isl
  WHERE isl.integration_id = ai.id
) ls ON true;

-- Aplicar security_invoker na view
ALTER VIEW v_integration_summary SET (security_invoker = true);
