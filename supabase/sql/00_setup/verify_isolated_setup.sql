-- =====================================================
-- VERIFICATION ISOLATED SETUP (Fluxo B)
-- =====================================================

-- Tabela para logs de verificação (isolada)
CREATE TABLE IF NOT EXISTS verification_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  email text not null,
  magic_link text,
  sent_at timestamptz not null default now(),
  clicked_at timestamptz,
  status text not null check (status in ('sent', 'clicked', 'expired', 'error')),
  error_message text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS verification_logs_user_id_idx ON verification_logs(user_id);
CREATE INDEX IF NOT EXISTS verification_logs_status_idx ON verification_logs(status);

-- RLS: usuários veem apenas seus próprios logs
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own verification logs" ON verification_logs
FOR SELECT USING (auth.uid() = user_id);

-- View para dashboard (opcional)
CREATE OR REPLACE VIEW v_verification_summary AS
SELECT 
  user_id,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'clicked') as total_clicked,
  COUNT(*) FILTER (WHERE status = 'expired') as total_expired,
  MAX(sent_at) as last_sent
FROM verification_logs 
GROUP BY user_id;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Para verificar setup:
-- SELECT * FROM verification_logs WHERE user_id = 'seu_user_id';
-- SELECT * FROM v_verification_summary WHERE user_id = 'seu_user_id';
