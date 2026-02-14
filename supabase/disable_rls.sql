-- Desabilitar RLS temporariamente para testar
-- Execute isso para ver se os tickets aparecem

-- Desabilitar RLS das tabelas de suporte
ALTER TABLE support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_ratings DISABLE ROW LEVEL SECURITY;

-- Verificar se está desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('support_tickets', 'support_ticket_messages', 'support_ticket_notes', 'support_ticket_ratings');
