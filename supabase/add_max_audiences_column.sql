-- =====================================================
-- Migration: Add max_audiences column to tenant_settings
-- Default: 5 for starter, -1 (unlimited) for pro/enterprise
-- =====================================================

ALTER TABLE public.tenant_settings
  ADD COLUMN IF NOT EXISTS max_audiences integer NOT NULL DEFAULT 5;

-- Set unlimited for existing professional/enterprise users
UPDATE public.tenant_settings
  SET max_audiences = -1
  WHERE plan IN ('professional', 'enterprise');
