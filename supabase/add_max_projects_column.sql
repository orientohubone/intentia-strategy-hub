-- =====================================================
-- Migration: Add max_projects column to tenant_settings
-- Default: 5 for starter, -1 (unlimited) for pro/enterprise
-- =====================================================

ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS max_projects integer NOT NULL DEFAULT 5;

-- Set unlimited for existing professional/enterprise users
UPDATE public.tenant_settings
  SET max_projects = -1
  WHERE plan IN ('professional', 'enterprise');

-- =====================================================
-- Update enforce_project_limit trigger to use max_projects
-- from tenant_settings instead of hardcoded values
-- =====================================================
CREATE OR REPLACE FUNCTION public.enforce_project_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _plan text;
  _max integer;
  _current integer;
BEGIN
  SELECT plan, COALESCE(max_projects, 5) INTO _plan, _max
  FROM public.tenant_settings
  WHERE user_id = NEW.user_id;

  -- -1 means unlimited
  IF _max = -1 THEN
    RETURN NEW;
  END IF;

  -- Fallback if no tenant_settings found
  IF _max IS NULL THEN
    _max := CASE _plan
      WHEN 'starter' THEN 5
      WHEN 'professional' THEN 999999
      WHEN 'enterprise' THEN 999999
      ELSE 5
    END;
  END IF;

  SELECT count(*) INTO _current
  FROM public.projects
  WHERE user_id = NEW.user_id AND deleted_at IS NULL;

  IF _current >= _max THEN
    RAISE EXCEPTION 'Project limit reached (% of %). Upgrade your plan.', _current, _max;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_project_limit ON public.projects;
CREATE TRIGGER enforce_project_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_project_limit();
