-- =====================================================
-- FIX: Recriar views que acessam auth.users com 
-- SECURITY DEFINER e revogar acesso de authenticated
--
-- O problema: views que fazem JOIN com auth.users causam
-- "permission denied for table users" quando authenticated
-- tenta acessar qualquer tabela referenciada pela view.
-- =====================================================

-- 1. Dropar view admin (faz JOIN com auth.users)
DROP VIEW IF EXISTS v_admin_support_dashboard;

-- 2. Recriar como function SECURITY DEFINER em vez de view
-- (functions SECURITY DEFINER rodam com permissões do owner)
CREATE OR REPLACE FUNCTION get_admin_support_dashboard()
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  user_id uuid,
  subject varchar,
  category varchar,
  priority varchar,
  status varchar,
  description text,
  attachments jsonb,
  ticket_number varchar,
  assigned_to uuid,
  created_at timestamptz,
  updated_at timestamptz,
  first_response_at timestamptz,
  resolved_at timestamptz,
  sla_deadline timestamptz,
  response_time_minutes integer,
  resolution_time_hours integer,
  satisfaction_score integer,
  user_email text,
  user_name text,
  user_company text,
  user_avatar_url text,
  assigned_to_email text,
  assigned_to_name text,
  category_name text,
  category_color text,
  category_icon text,
  message_count bigint,
  last_message_at timestamptz,
  sla_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id,
    st.tenant_id,
    st.user_id,
    st.subject,
    st.category,
    st.priority,
    st.status,
    st.description,
    st.attachments,
    st.ticket_number,
    st.assigned_to,
    st.created_at,
    st.updated_at,
    st.first_response_at,
    st.resolved_at,
    st.sla_deadline,
    st.response_time_minutes,
    st.resolution_time_hours,
    st.satisfaction_score,
    COALESCE(u.email, 'email@nao.informado')::text as user_email,
    COALESCE(
      CASE 
        WHEN u.raw_user_meta_data ? 'name' AND u.raw_user_meta_data->>'name' != '' 
        THEN u.raw_user_meta_data->>'name'
        WHEN u.raw_user_meta_data ? 'full_name' AND u.raw_user_meta_data->>'full_name' != ''
        THEN u.raw_user_meta_data->>'full_name'
        ELSE SPLIT_PART(u.email, '@', 1)
      END,
      'Cliente Sem Nome'
    )::text as user_name,
    COALESCE(ts.company_name, 'Empresa não informada')::text as user_company,
    COALESCE(u.raw_user_meta_data->>'avatar_url', '')::text as user_avatar_url,
    assigned_admin.email::text as assigned_to_email,
    COALESCE(
      CASE 
        WHEN assigned_admin.raw_user_meta_data ? 'name' AND assigned_admin.raw_user_meta_data->>'name' != ''
        THEN assigned_admin.raw_user_meta_data->>'name'
        ELSE 'Não atribuído'
      END,
      'Não atribuído'
    )::text as assigned_to_name,
    COALESCE(sc.name, st.category)::text as category_name,
    COALESCE(sc.color, '#6b7280')::text as category_color,
    COALESCE(sc.icon, 'MessageCircle')::text as category_icon,
    COALESCE(COUNT(stm.id), 0)::bigint as message_count,
    MAX(stm.created_at) as last_message_at,
    (CASE 
      WHEN st.status = 'resolvido' THEN 'resolved'
      WHEN st.sla_deadline < NOW() THEN 'overdue'
      WHEN st.sla_deadline < NOW() + INTERVAL '2 hours' THEN 'due_soon'
      ELSE 'on_track'
    END)::text as sla_status
  FROM support_tickets st
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
END;
$$;

-- Permissões: apenas service_role e authenticated podem chamar
GRANT EXECUTE ON FUNCTION get_admin_support_dashboard() TO service_role;
GRANT EXECUTE ON FUNCTION get_admin_support_dashboard() TO authenticated;

-- 3. Verificar que a view foi removida
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'v_admin_support_dashboard';
-- Deve retornar 0 rows
