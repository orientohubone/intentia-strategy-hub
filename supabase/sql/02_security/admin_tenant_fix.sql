-- =====================================================
-- FIX: Add full_name and email to tenant_settings
-- So the admin panel can display user info
-- =====================================================

-- Add columns (safe — IF NOT EXISTS equivalent via DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenant_settings' AND column_name = 'full_name') THEN
    ALTER TABLE public.tenant_settings ADD COLUMN full_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenant_settings' AND column_name = 'email') THEN
    ALTER TABLE public.tenant_settings ADD COLUMN email TEXT;
  END IF;
END $$;

-- Backfill existing users from auth.users
UPDATE public.tenant_settings ts
SET 
  full_name = COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ),
  email = u.email
FROM auth.users u
WHERE ts.user_id = u.id
  AND (ts.full_name IS NULL OR ts.email IS NULL);
