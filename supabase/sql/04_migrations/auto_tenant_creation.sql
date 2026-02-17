-- =====================================================
-- AUTO TENANT CREATION
-- Trigger que cria tenant_settings automaticamente
-- quando um novo usuário é criado no auth.users
-- =====================================================

-- Function: cria tenant_settings para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.tenant_settings (
    user_id,
    company_name,
    plan,
    monthly_analyses_limit,
    analyses_used,
    full_name,
    email
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'company_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'starter',
    5,
    0,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    full_name = COALESCE(
      EXCLUDED.full_name,
      tenant_settings.full_name
    ),
    email = COALESCE(
      EXCLUDED.email,
      tenant_settings.email
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: dispara após INSERT em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- BACKFILL: Criar tenant_settings para usuários que
-- já existem em auth.users mas não têm registro
-- =====================================================

INSERT INTO public.tenant_settings (user_id, company_name, plan, monthly_analyses_limit, analyses_used, full_name, email)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'company_name',
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ),
  'starter',
  5,
  0,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  u.email
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.tenant_settings ts WHERE ts.user_id = u.id
);

-- =====================================================
-- UPDATE: Preencher full_name/email em registros existentes
-- que estão com esses campos NULL
-- =====================================================

UPDATE public.tenant_settings ts
SET 
  full_name = COALESCE(
    ts.full_name,
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  email = COALESCE(ts.email, u.email)
FROM auth.users u
WHERE ts.user_id = u.id
  AND (ts.full_name IS NULL OR ts.email IS NULL);
