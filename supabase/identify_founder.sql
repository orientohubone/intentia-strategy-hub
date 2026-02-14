-- Identificar quem é o FOUNDER do admin painel
-- Execute este SQL para encontrar o usuário correto

-- 1. Encontrar o usuário com o CNPJ do founder
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as current_role,
  u.raw_user_meta_data->>'name' as name,
  u.raw_user_meta_data->>'cnpj' as user_cnpj,
  u.created_at
FROM auth.users u
WHERE u.raw_user_meta_data->>'cnpj' = '64.999.887/0001-56'
   OR u.raw_user_meta_data->>'role' = 'founder'
ORDER BY u.created_at;

-- 2. Verificar todos os tickets existentes
SELECT 
  st.id,
  st.ticket_number,
  st.subject,
  st.category,
  st.status,
  st.created_at,
  u.email as user_email,
  u.raw_user_meta_data->>'name' as user_name,
  ts.company_name as tenant_company,
  ts.cnpj as tenant_cnpj
FROM support_tickets st
LEFT JOIN auth.users u ON st.user_id = u.id
LEFT JOIN tenant_settings ts ON st.tenant_id = ts.id
ORDER BY st.created_at DESC;

-- 3. Verificar se o founder já tem role correto
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as current_role,
  u.raw_user_meta_data
FROM auth.users u
WHERE u.raw_user_meta_data->>'cnpj' = '64.999.887/0001-56';
