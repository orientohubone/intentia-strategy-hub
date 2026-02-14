-- Verificar e atualizar role do usuário para founder
-- Execute este SQL para garantir que o usuário tenha o role correto

-- 1. Verificar o role atual do usuário
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'role' as current_role,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'fersouluramal@gmail.com';

-- 2. Se o role não for 'founder', atualizar:
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"founder"'
)
WHERE email = 'fersouluramal@gmail.com' 
AND raw_user_meta_data->>'role' != 'founder';

-- 3. Verificar se há tickets criados
SELECT 
  st.id,
  st.ticket_number,
  st.subject,
  st.category,
  st.status,
  st.created_at,
  u.email as user_email,
  u.raw_user_meta_data->>'name' as user_name,
  ts.company_name as tenant_company
FROM support_tickets st
LEFT JOIN auth.users u ON st.user_id = u.id
LEFT JOIN tenant_settings ts ON st.tenant_id = ts.id
ORDER BY st.created_at DESC;
