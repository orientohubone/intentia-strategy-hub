-- =====================================================
-- DEBUG: Fix trigger handle_new_user (versão corrigida)
-- =====================================================

-- 1. Remover trigger antigo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Remover função antiga
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Criar função corrigida com tratamento de erro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir com tratamento de erro e campos completos
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
    ) ON CONFLICT (user_id) DO UPDATE SET
      full_name = COALESCE(
        EXCLUDED.full_name,
        tenant_settings.full_name
      ),
      email = COALESCE(
        EXCLUDED.email,
        tenant_settings.email
      );
  EXCEPTION WHEN OTHERS THEN
    -- Se falhar, tentar inserção básica
    INSERT INTO public.tenant_settings (
      user_id,
      company_name,
      plan,
      monthly_analyses_limit,
      analyses_used
    ) VALUES (
      NEW.id,
      split_part(NEW.email, '@', 1),
      'starter',
      5,
      0
    ) ON CONFLICT (user_id) DO NOTHING;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Testar função
SELECT 'handle_new_user function created successfully' as status; 
