-- Debug completo do sistema de suporte
-- Execute este SQL para diagnosticar tudo

-- 1. Verificar se as tabelas existem
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name LIKE '%support%' OR table_name = 'notifications'
ORDER BY table_name;

-- 2. Verificar se há tickets
SELECT COUNT(*) as total_tickets FROM support_tickets;

-- 3. Verificar todos os tickets (limit 5)
SELECT 
  id,
  ticket_number,
  subject,
  category,
  status,
  created_at,
  user_id,
  tenant_id
FROM support_tickets 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Verificar políticas atuais
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('support_tickets', 'support_ticket_messages', 'notifications')
ORDER BY tablename, policyname;

-- 5. Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('support_tickets', 'support_ticket_messages', 'notifications');
