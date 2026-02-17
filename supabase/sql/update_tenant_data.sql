-- =====================================================
-- UPDATE: Corrigir tenant_settings com nome e email
-- =====================================================

UPDATE public.tenant_settings 
SET 
  full_name = 'José',
  email = 'zeitsocialmidia@gmail.com',
  updated_at = NOW()
WHERE user_id = '6e241550-3187-4790-a1ad-ab17dfdbdec6';

-- Verificar atualização
SELECT 
  user_id,
  company_name,
  full_name,
  email,
  plan,
  updated_at
FROM public.tenant_settings 
WHERE user_id = '6e241550-3187-4790-a1ad-ab17dfdbdec6';
