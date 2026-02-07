-- ============================================
-- Tabela: contact_messages
-- Armazena mensagens enviadas pelo formulário de contato
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'replied', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_messages_updated_at();

-- Índices para performance
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_contact_messages_email ON contact_messages(email);
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- RLS: permitir INSERT anônimo (formulário público), SELECT/UPDATE apenas para admins
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode enviar mensagem (INSERT) — formulário público sem autenticação
CREATE POLICY "Anyone can insert contact messages"
  ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Apenas usuários autenticados podem ler mensagens (admin futuro)
CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas usuários autenticados podem atualizar status/notas
CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages
  FOR UPDATE
  USING (auth.role() = 'authenticated');
