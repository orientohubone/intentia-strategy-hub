-- Sistema de Chamados de Atendimento
-- Criado em: 2026-02-14
-- Isolamento por tenant com RLS

-- Tabela de chamados
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenant_settings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados do chamado
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('comercial', 'desenvolvimento', 'financeiro', 'duvidas', 'sugestoes', 'bug', 'outros')),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (priority IN ('baixa', 'normal', 'alta', 'urgente')),
  status VARCHAR(20) NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_analise', 'em_andamento', 'aguardando_cliente', 'resolvido', 'cancelado')),
  
  -- Conteúdo
  description TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- Array de URLs de anexos
  
  -- Metadados
  ticket_number VARCHAR(20) UNIQUE NOT NULL, -- Formato: SUP-2024-00001
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Admin responsável
  
  -- Controle de tempo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  first_response_at TIMESTAMPTZ, -- Primeira resposta do admin
  resolved_at TIMESTAMPTZ, -- Quando foi resolvido
  sla_deadline TIMESTAMPTZ, -- Prazo SLA baseado na prioridade
  
  -- Métricas
  response_time_minutes INTEGER, -- Tempo até primeira resposta
  resolution_time_hours INTEGER, -- Tempo total até resolução
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5), -- Avaliação 1-5
  
  -- Índices
  CONSTRAINT valid_ticket_number CHECK (ticket_number ~* '^SUP-\d{4}-\d{5}$')
);

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

-- Tabela de categorias e SLAs
CREATE TABLE IF NOT EXISTS support_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT '#6366f1', -- Cor para UI
  icon VARCHAR(50) DEFAULT 'MessageCircle', -- Ícone Lucide
  
  -- SLA em horas
  sla_first_response INTEGER DEFAULT 2, -- Primeira resposta
  sla_resolution INTEGER DEFAULT 24, -- Resolução total
  
  -- Controle
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de notas internas (só admins veem)
CREATE TABLE IF NOT EXISTS support_ticket_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  note TEXT NOT NULL,
  is_visible_to_client BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de avaliações de satisfação
CREATE TABLE IF NOT EXISTS support_ticket_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_ticket_rating UNIQUE (ticket_id, user_id)
);

-- Função para gerar número do ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
BEGIN
  year_part := EXTRACT(year FROM CURRENT_DATE)::TEXT;
  
  -- Buscar último ticket do ano
  SELECT LPAD(COUNT(*) + 1, 5, '0') INTO sequence_part
  FROM support_tickets 
  WHERE ticket_number LIKE 'SUP-' || year_part || '-%';
  
  NEW.ticket_number := 'SUP-' || year_part || '-' || sequence_part;
  
  -- Calcular SLA baseado na prioridade
  CASE NEW.priority
    WHEN 'baixa' THEN NEW.sla_deadline := NOW() + INTERVAL '24 hours';
    WHEN 'normal' THEN NEW.sla_deadline := NOW() + INTERVAL '8 hours';
    WHEN 'alta' THEN NEW.sla_deadline := NOW() + INTERVAL '4 hours';
    WHEN 'urgente' THEN NEW.sla_deadline := NOW() + INTERVAL '1 hour';
  END CASE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar número do ticket
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION generate_ticket_number();

-- Trigger para updated_at
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at nas mensagens
CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON support_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at nas categorias
CREATE TRIGGER update_support_categories_updated_at
  BEFORE UPDATE ON support_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at nas notas
CREATE TRIGGER update_support_notes_updated_at
  BEFORE UPDATE ON support_ticket_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX idx_support_tickets_tenant_id ON support_tickets(tenant_id);
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_ticket_number ON support_tickets(ticket_number);

CREATE INDEX idx_support_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX idx_support_messages_sender_id ON support_ticket_messages(sender_id);
CREATE INDEX idx_support_messages_created_at ON support_ticket_messages(created_at);

CREATE INDEX idx_support_notes_ticket_id ON support_ticket_notes(ticket_id);
CREATE INDEX idx_support_notes_admin_id ON support_ticket_notes(admin_id);

-- RLS - Row Level Security
-- Apenas usuários do mesmo tenant podem ver os chamados
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_ratings ENABLE ROW LEVEL SECURITY;

-- Policies para support_tickets
CREATE POLICY "Users can view own tenant tickets" ON support_tickets
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant_id')::UUID
  );

CREATE POLICY "Users can create tickets for own tenant" ON support_tickets
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.current_tenant_id')::UUID AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update own tickets" ON support_tickets
  FOR UPDATE USING (
    tenant_id = current_setting('app.current_tenant_id')::UUID AND
    user_id = auth.uid()
  );

-- Policies para support_ticket_messages
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

-- Policies para support_ticket_notes (só admins)
CREATE POLICY "Admins can manage notes" ON support_ticket_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' IN ('admin', 'founder', 'support')
    )
  );

-- Policies para support_ticket_ratings
CREATE POLICY "Users can rate own tickets" ON support_ticket_ratings
  FOR ALL USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE tenant_id = current_setting('app.current_tenant_id')::UUID AND
            user_id = auth.uid()
    ) AND
    user_id = auth.uid()
  );

-- Categorias padrão
INSERT INTO support_categories (name, slug, description, color, icon, sla_first_response, sla_resolution) VALUES
('Comercial', 'comercial', 'Dúvidas sobre planos, preços e contratação', '#10b981', 'DollarSign', 2, 8),
('Desenvolvimento', 'desenvolvimento', 'Bugs, melhorias e novas funcionalidades', '#8b5cf6', 'Code', 4, 24),
('Financeiro', 'financeiro', 'Faturamento, pagamentos e cobranças', '#f59e0b', 'CreditCard', 2, 8),
('Dúvidas', 'duvidas', 'Ajuda para usar a plataforma', '#3b82f6', 'HelpCircle', 2, 4),
('Sugestões', 'sugestoes', 'Ideias e sugestões de melhorias', '#06b6d4', 'Lightbulb', 8, 48),
('Bugs', 'bug', 'Reportar erros e problemas técnicos', '#ef4444', 'Bug', 1, 8),
('Outros', 'outros', 'Assuntos não categorizados', '#6b7280', 'MoreHorizontal', 4, 24)
ON CONFLICT (slug) DO NOTHING;

-- View para estatísticas do tenant
CREATE OR REPLACE VIEW v_support_stats AS
SELECT 
  tenant_id,
  COUNT(*) as total_tickets,
  COUNT(*) FILTER (WHERE status = 'aberto') as open_tickets,
  COUNT(*) FILTER (WHERE status = 'em_andamento') as in_progress_tickets,
  COUNT(*) FILTER (WHERE status = 'resolvido') as resolved_tickets,
  COUNT(*) FILTER (WHERE priority = 'urgente') as urgent_tickets,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as tickets_this_week,
  AVG(response_time_minutes) as avg_response_time,
  AVG(resolution_time_hours) as avg_resolution_time,
  AVG(satisfaction_score) as avg_satisfaction
FROM support_tickets
GROUP BY tenant_id;

-- View para dashboard admin
CREATE OR REPLACE VIEW v_admin_support_dashboard AS
SELECT 
  st.*,
  tu.email as user_email,
  tu.raw_user_meta_data->>'name' as user_name,
  tu.raw_user_meta_data->>'company' as user_company,
  assigned_admin.email as assigned_to_email,
  assigned_admin.raw_user_meta_data->>'name' as assigned_to_name,
  sc.name as category_name,
  sc.color as category_color,
  sc.icon as category_icon,
  COUNT(stm.id) as message_count,
  MAX(stm.created_at) as last_message_at,
  -- Status do SLA
  CASE 
    WHEN st.status = 'resolvido' THEN 'resolved'
    WHEN st.sla_deadline < NOW() THEN 'overdue'
    WHEN st.sla_deadline < NOW() + INTERVAL '2 hours' THEN 'due_soon'
    ELSE 'on_track'
  END as sla_status
FROM support_tickets st
LEFT JOIN auth.users tu ON st.user_id = tu.id
LEFT JOIN auth.users assigned_admin ON st.assigned_to = assigned_admin.id
LEFT JOIN support_categories sc ON st.category = sc.slug
LEFT JOIN support_ticket_messages stm ON st.id = stm.ticket_id
GROUP BY st.id, tu.email, tu.raw_user_meta_data, assigned_admin.email, assigned_admin.raw_user_meta_data, sc.name, sc.color, sc.icon;
