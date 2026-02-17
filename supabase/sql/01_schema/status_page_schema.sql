-- ============================================
-- STATUS PAGE SCHEMA
-- Tabelas para gerenciar status dos serviços,
-- incidentes e manutenções programadas.
-- ============================================

-- 1. Serviços monitorados
CREATE TABLE IF NOT EXISTS platform_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Core',
  icon TEXT DEFAULT 'Server',
  status TEXT NOT NULL DEFAULT 'operational'
    CHECK (status IN ('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance')),
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Incidentes
CREATE TABLE IF NOT EXISTS platform_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'investigating'
    CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  severity TEXT NOT NULL DEFAULT 'minor'
    CHECK (severity IN ('minor', 'major', 'critical')),
  affected_services UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- 3. Atualizações de incidentes (timeline)
CREATE TABLE IF NOT EXISTS platform_incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES platform_incidents(id) ON DELETE CASCADE,
  status TEXT NOT NULL
    CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Manutenções programadas
CREATE TABLE IF NOT EXISTS platform_maintenances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  affected_services UUID[] DEFAULT '{}',
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Métricas diárias de uptime
CREATE TABLE IF NOT EXISTS platform_uptime_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES platform_services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational'
    CHECK (status IN ('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance')),
  uptime_percentage NUMERIC(6,3) NOT NULL DEFAULT 100.000,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(service_id, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_status ON platform_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON platform_incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_updates_incident ON platform_incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_maintenances_status ON platform_maintenances(status);
CREATE INDEX IF NOT EXISTS idx_maintenances_scheduled ON platform_maintenances(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_uptime_daily_service_date ON platform_uptime_daily(service_id, date DESC);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_platform_services_updated
  BEFORE UPDATE ON platform_services
  FOR EACH ROW EXECUTE FUNCTION update_status_updated_at();

CREATE TRIGGER trg_platform_incidents_updated
  BEFORE UPDATE ON platform_incidents
  FOR EACH ROW EXECUTE FUNCTION update_status_updated_at();

CREATE TRIGGER trg_platform_maintenances_updated
  BEFORE UPDATE ON platform_maintenances
  FOR EACH ROW EXECUTE FUNCTION update_status_updated_at();

-- Auto-set resolved_at when incident status changes to 'resolved'
CREATE OR REPLACE FUNCTION set_incident_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_incident_resolved
  BEFORE UPDATE ON platform_incidents
  FOR EACH ROW EXECUTE FUNCTION set_incident_resolved_at();

-- RLS: Leitura pública (todos autenticados), escrita apenas via service_role
ALTER TABLE platform_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_maintenances ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_uptime_daily ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (qualquer pessoa autenticada ou anônima pode ver o status)
CREATE POLICY "Anyone can read services" ON platform_services FOR SELECT USING (true);
CREATE POLICY "Anyone can read incidents" ON platform_incidents FOR SELECT USING (true);
CREATE POLICY "Anyone can read incident updates" ON platform_incident_updates FOR SELECT USING (true);
CREATE POLICY "Anyone can read maintenances" ON platform_maintenances FOR SELECT USING (true);
CREATE POLICY "Anyone can read uptime" ON platform_uptime_daily FOR SELECT USING (true);

-- Escrita bloqueada para usuários normais (apenas service_role/admin)
-- Não criamos políticas de INSERT/UPDATE/DELETE para authenticated,
-- então apenas service_role pode modificar essas tabelas.

-- ============================================
-- SEED DATA: Serviços iniciais
-- ============================================

INSERT INTO platform_services (name, description, category, icon, status, sort_order) VALUES
  ('Plataforma Web', 'Interface principal da aplicação, dashboard e navegação', 'Core', 'Globe', 'operational', 1),
  ('Autenticação', 'Login, cadastro, recuperação de senha e sessões', 'Core', 'Shield', 'operational', 2),
  ('Banco de Dados', 'Armazenamento de projetos, insights, benchmarks e configurações', 'Core', 'Database', 'operational', 3),
  ('API & Edge Functions', 'Endpoints de análise, exportação e processamento', 'Core', 'Server', 'operational', 4),
  ('Análise Heurística de URL', 'Diagnóstico automático de páginas web com scores e insights', 'Análise', 'Zap', 'operational', 5),
  ('Análise por IA', 'Análise aprofundada via Google Gemini e Anthropic Claude', 'Análise', 'Brain', 'operational', 6),
  ('Benchmark Competitivo', 'Comparação com concorrentes, SWOT e gap analysis', 'Análise', 'BarChart3', 'operational', 7),
  ('Notificações', 'Sistema de notificações em tempo real', 'Comunicação', 'Bell', 'operational', 8),
  ('CDN & Assets', 'Entrega de arquivos estáticos, imagens e recursos', 'Infraestrutura', 'Wifi', 'operational', 9)
ON CONFLICT DO NOTHING;
