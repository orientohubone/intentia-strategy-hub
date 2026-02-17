-- =====================================================
-- CRIAR USUÁRIO VIA AUTH API (SQL Function)
-- =====================================================

-- Função para criar usuário via auth.admin.createUser
CREATE OR REPLACE FUNCTION create_meta_user()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Necessário para acessar auth.users
AS $$
DECLARE
  user_uuid UUID;
  result JSON;
BEGIN
  -- Chamar a Auth API via RPC
  -- Isso simula o que a Edge Function faz
  SELECT 
    gen_random_uuid() as user_uuid
  INTO user_uuid;
  
  -- Criar usuário usando a função interna do Supabase
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin
  ) VALUES (
    user_uuid,
    'meta-review@orientohub.com.br',
    crypt('MetaReview2026!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"name": "Meta Review", "company": "Meta"}',
    false
  );
  
  -- Criar tenant_settings
  INSERT INTO tenant_settings (
    user_id,
    company_name,
    plan,
    monthly_analyses_limit,
    analyses_used
  ) VALUES (
    user_uuid,
    'Meta',
    'professional',
    50,
    0
  );
  
  -- Retornar sucesso
  result := json_build_object(
    'success', true,
    'user_id', user_uuid,
    'email', 'meta-review@orientohub.com.br'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Executar a função
SELECT create_meta_user();

-- Verificar resultado
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  ts.company_name,
  ts.plan
FROM auth.users u
LEFT JOIN tenant_settings ts ON u.id = ts.user_id
WHERE u.email = 'meta-review@orientohub.com.br';
