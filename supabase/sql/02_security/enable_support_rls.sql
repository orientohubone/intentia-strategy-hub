-- Reativar RLS e criar políticas corretas para suporte
-- Execute este SQL no Supabase Dashboard

-- ============================================
-- 1. HABILITAR RLS em todas as tabelas
-- ============================================
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_ratings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. LIMPAR políticas antigas
-- ============================================
DROP POLICY IF EXISTS "Users can view own tenant tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets for own tenant" ON support_tickets;
DROP POLICY IF EXISTS "Users can update own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admin panel can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admin panel can manage all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Authenticated users can view tickets" ON support_tickets;
DROP POLICY IF EXISTS "Authenticated users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Authenticated users can update tickets" ON support_tickets;

DROP POLICY IF EXISTS "Users can view messages from own tenant tickets" ON support_ticket_messages;
DROP POLICY IF EXISTS "Users can create messages in own tenant tickets" ON support_ticket_messages;
DROP POLICY IF EXISTS "Admin panel can manage all messages" ON support_ticket_messages;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON support_ticket_messages;
DROP POLICY IF EXISTS "Authenticated users can create messages" ON support_ticket_messages;

DROP POLICY IF EXISTS "Admins can manage notes" ON support_ticket_notes;
DROP POLICY IF EXISTS "Users can rate own tickets" ON support_ticket_ratings;
DROP POLICY IF EXISTS "Service role full access ratings" ON support_ticket_ratings;

DROP POLICY IF EXISTS "Admin panel can manage notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role full access notifications" ON notifications;

-- Limpar políticas novas (caso já existam de execução anterior)
DROP POLICY IF EXISTS "Users can view own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Service role full access tickets" ON support_tickets;

DROP POLICY IF EXISTS "Users can view own ticket messages" ON support_ticket_messages;
DROP POLICY IF EXISTS "Users can send messages on own tickets" ON support_ticket_messages;
DROP POLICY IF EXISTS "Service role full access messages" ON support_ticket_messages;

DROP POLICY IF EXISTS "Service role full access notes" ON support_ticket_notes;

DROP POLICY IF EXISTS "Anyone can view categories" ON support_categories;
DROP POLICY IF EXISTS "Service role full access categories" ON support_categories;

-- ============================================
-- 3. SUPPORT_TICKETS — Políticas
-- ============================================

-- SELECT: usuário vê seus próprios tickets
CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: usuário cria tickets para si mesmo
CREATE POLICY "Users can create own tickets"
  ON support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: usuário pode atualizar seus tickets (ex: cancelar)
-- Admin também pode atualizar via service_role
CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- service_role pode fazer tudo (admin panel usa service_role)
CREATE POLICY "Service role full access tickets"
  ON support_tickets FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. SUPPORT_TICKET_MESSAGES — Políticas
-- ============================================

-- SELECT: usuário vê mensagens dos seus tickets
CREATE POLICY "Users can view own ticket messages"
  ON support_ticket_messages FOR SELECT
  TO authenticated
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets WHERE user_id = auth.uid()
    )
  );

-- INSERT: usuário pode enviar mensagens nos seus tickets
CREATE POLICY "Users can send messages on own tickets"
  ON support_ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    ticket_id IN (
      SELECT id FROM support_tickets WHERE user_id = auth.uid()
    )
  );

-- service_role pode fazer tudo (admin panel)
CREATE POLICY "Service role full access messages"
  ON support_ticket_messages FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. SUPPORT_TICKET_NOTES — Políticas (só admin)
-- ============================================

CREATE POLICY "Service role full access notes"
  ON support_ticket_notes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 6. SUPPORT_TICKET_RATINGS — Políticas
-- ============================================

-- Usuário pode avaliar seus próprios tickets
CREATE POLICY "Users can rate own tickets"
  ON support_ticket_ratings FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Service role full access ratings"
  ON support_ticket_ratings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 7. NOTIFICATIONS — Políticas
-- ============================================

-- SELECT: usuário vê suas notificações
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT: qualquer authenticated pode criar (sistema envia notificações)
CREATE POLICY "Authenticated can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: usuário pode marcar como lida
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- DELETE: usuário pode deletar suas notificações
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- service_role pode fazer tudo
CREATE POLICY "Service role full access notifications"
  ON notifications FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 8. SUPPORT_CATEGORIES — Políticas
-- ============================================
ALTER TABLE support_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view categories" ON support_categories;
DROP POLICY IF EXISTS "Service role full access categories" ON support_categories;

-- SELECT: todos authenticated podem ver categorias
CREATE POLICY "Anyone can view categories"
  ON support_categories FOR SELECT
  TO authenticated
  USING (true);

-- service_role pode gerenciar
CREATE POLICY "Service role full access categories"
  ON support_categories FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 9. VIEWS — Permissões
-- ============================================

-- v_admin_support_dashboard: APENAS service_role (faz JOIN com auth.users)
-- Revogar acesso de authenticated (causa "permission denied for table users")
REVOKE SELECT ON v_admin_support_dashboard FROM authenticated;
GRANT SELECT ON v_admin_support_dashboard TO service_role;

-- Garantir que a view NÃO tem security_invoker (deve rodar como definer/owner)
ALTER VIEW v_admin_support_dashboard SET (security_invoker = false);

-- v_support_stats: acessível por authenticated (não acessa auth.users)
GRANT SELECT ON v_support_stats TO authenticated;
GRANT SELECT ON v_support_stats TO service_role;

-- ============================================
-- 10. VERIFICAÇÃO
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN (
  'support_tickets', 
  'support_ticket_messages', 
  'support_ticket_notes', 
  'support_ticket_ratings',
  'support_categories',
  'notifications'
);

-- Listar todas as políticas criadas
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN (
  'support_tickets', 
  'support_ticket_messages', 
  'support_ticket_notes', 
  'support_ticket_ratings',
  'support_categories',
  'notifications'
)
ORDER BY tablename, policyname;

-- Verificar se as views existem
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('v_admin_support_dashboard', 'v_support_stats');

-- Verificar permissões das views
SELECT 
  table_name,
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('v_admin_support_dashboard', 'v_support_stats')
ORDER BY table_name, grantee;
