-- View melhorada para admin com dados completos
-- Substitui a view antiga por uma mais eficiente

-- Remover view antiga se existir
DROP VIEW IF EXISTS v_admin_support_dashboard;

-- Criar view melhorada com joins otimizados
CREATE OR REPLACE VIEW v_admin_support_dashboard AS
SELECT 
  st.*,
  -- Dados do usuário que criou o ticket
  u.email as user_email,
  COALESCE(u.raw_user_meta_data->>'name', 'Sem nome') as user_name,
  COALESCE(ts.company_name, 'Empresa não informada') as user_company,
  
  -- Dados do admin atribuído
  assigned_admin.email as assigned_to_email,
  COALESCE(assigned_admin.raw_user_meta_data->>'name', 'Não atribuído') as assigned_to_name,
  
  -- Dados da categoria
  COALESCE(sc.name, st.category) as category_name,
  COALESCE(sc.color, '#6b7280') as category_color,
  COALESCE(sc.icon, 'MessageCircle') as category_icon,
  
  -- Contagem de mensagens
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
LEFT JOIN auth.users u ON st.user_id = u.id
LEFT JOIN tenant_settings ts ON st.tenant_id = ts.id
LEFT JOIN auth.users assigned_admin ON st.assigned_to = assigned_admin.id
LEFT JOIN support_categories sc ON st.category = sc.slug
LEFT JOIN support_ticket_messages stm ON st.id = stm.ticket_id
GROUP BY 
  st.id, u.email, u.raw_user_meta_data, ts.company_name,
  assigned_admin.email, assigned_admin.raw_user_meta_data,
  sc.name, sc.color, sc.icon;
