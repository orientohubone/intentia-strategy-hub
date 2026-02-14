-- View corrigida para admin com dados completos do cliente
-- Corrige problema no JOIN e busca de dados do usuário

-- Remover view antiga se existir
DROP VIEW IF EXISTS v_admin_support_dashboard;

-- Criar view corrigida com joins corretos
CREATE OR REPLACE VIEW v_admin_support_dashboard AS
SELECT 
  st.*,
  -- Dados do usuário que criou o ticket (CORREÇÃO: usar COALESCE para garantir valores)
  COALESCE(u.email, 'email@nao.informado') as user_email,
  COALESCE(
    CASE 
      WHEN u.raw_user_meta_data ? 'name' AND u.raw_user_meta_data->>'name' != '' 
      THEN u.raw_user_meta_data->>'name'
      WHEN u.raw_user_meta_data ? 'full_name' AND u.raw_user_meta_data->>'full_name' != ''
      THEN u.raw_user_meta_data->>'full_name'
      ELSE SPLIT_PART(u.email, '@', 1)
    END,
    'Cliente Sem Nome'
  ) as user_name,
  COALESCE(ts.company_name, 'Empresa não informada') as user_company,
  COALESCE(u.raw_user_meta_data->>'avatar_url', '') as user_avatar_url,
  
  -- Dados do admin atribuído
  assigned_admin.email as assigned_to_email,
  COALESCE(
    CASE 
      WHEN assigned_admin.raw_user_meta_data ? 'name' AND assigned_admin.raw_user_meta_data->>'name' != ''
      THEN assigned_admin.raw_user_meta_data->>'name'
      ELSE 'Não atribuído'
    END,
    'Não atribuído'
  ) as assigned_to_name,
  
  -- Dados da categoria
  COALESCE(sc.name, st.category) as category_name,
  COALESCE(sc.color, '#6b7280') as category_color,
  COALESCE(sc.icon, 'MessageCircle') as category_icon,
  
  -- Contagem de mensagens (CORREÇÃO: usar COUNT com COALESCE para evitar NULL)
  COALESCE(COUNT(stm.id), 0) as message_count,
  MAX(stm.created_at) as last_message_at,
  
  -- Status do SLA
  CASE 
    WHEN st.status = 'resolvido' THEN 'resolved'
    WHEN st.sla_deadline < NOW() THEN 'overdue'
    WHEN st.sla_deadline < NOW() + INTERVAL '2 hours' THEN 'due_soon'
    ELSE 'on_track'
  END as sla_status
FROM support_tickets st
-- JOINs com COALESCE para garantir dados mesmo que falhem
LEFT JOIN auth.users u ON st.user_id = u.id
LEFT JOIN tenant_settings ts ON st.tenant_id = ts.id
LEFT JOIN auth.users assigned_admin ON st.assigned_to = assigned_admin.id
LEFT JOIN support_categories sc ON st.category = sc.slug
LEFT JOIN support_ticket_messages stm ON st.id = stm.ticket_id
GROUP BY 
  st.id, 
  u.email, 
  u.raw_user_meta_data, 
  ts.company_name,
  assigned_admin.email, 
  assigned_admin.raw_user_meta_data,
  sc.name, 
  sc.color, 
  sc.icon;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_id ON support_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Garantir que a view tenha permissões corretas
-- Admins podem ver todos os tickets
GRANT SELECT ON v_admin_support_dashboard TO authenticated;
GRANT SELECT ON v_admin_support_dashboard TO service_role;
