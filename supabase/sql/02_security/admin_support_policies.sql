-- Políticas RLS para FOUNDER ver todos os tickets de suporte
-- Execute este SQL no Supabase Dashboard após criar as tabelas
-- IMPORTANTE: Apenas o founder tem acesso total para manter isolamento

-- Política para FOUNDER ver todos os tickets
CREATE POLICY "Founder can view all support tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' = 'founder'
    )
  );

-- Política para FOUNDER gerenciar todos os tickets
CREATE POLICY "Founder can manage all support tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' = 'founder'
    )
  );

-- Política para FOUNDER ver todas as mensagens
CREATE POLICY "Founder can view all support messages" ON support_ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' = 'founder'
    )
  );

-- Política para FOUNDER gerenciar todas as mensagens
CREATE POLICY "Founder can manage all support messages" ON support_ticket_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' = 'founder'
    )
  );

-- Política para FOUNDER ver todas as notas
CREATE POLICY "Founder can manage all support notes" ON support_ticket_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' = 'founder'
    )
  );

-- Política para FOUNDER ver todas as notificações de suporte
CREATE POLICY "Founder can view support notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' = 'founder'
    ) AND
    type IN ('support_ticket', 'support_message', 'support_status')
  );

-- Política para FOUNDER criar notificações de suporte
CREATE POLICY "Founder can create support notifications" ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() AND 
            raw_user_meta_data->>'role' = 'founder'
    ) AND
    type IN ('support_ticket', 'support_message', 'support_status')
  );
