-- SQL para criar as tabelas de suporte que faltam
-- Execute este SQL no Supabase Dashboard

-- Tabela de mensagens/respostas do chamado
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  -- Quem enviou
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('client', 'admin')),
  
  -- Conteúdo
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- Array de URLs de anexos
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_internal BOOLEAN DEFAULT FALSE, -- Mensagem interna entre admins
  read_at TIMESTAMPTZ -- Quando foi lida
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados da notificação
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}', -- Dados adicionais
  action_url VARCHAR(500), -- URL para ação
  action_text VARCHAR(100), -- Texto do botão de ação
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS para support_ticket_messages
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Políticas para support_ticket_messages
CREATE POLICY "Users can view messages from own tenant tickets" ON support_ticket_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    )
  );

CREATE POLICY "Users can create messages in own tenant tickets" ON support_ticket_messages
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE tenant_id = current_setting('app.current_tenant_id')::UUID
    ) AND
    sender_id = auth.uid()
  );

-- RLS para notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- Trigger para updated_at nas mensagens
CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON support_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at nas notificações
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_support_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX idx_support_messages_sender_id ON support_ticket_messages(sender_id);
CREATE INDEX idx_support_messages_created_at ON support_ticket_messages(created_at);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
