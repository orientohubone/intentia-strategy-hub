-- =====================================================
-- Migration: Add html_snapshot and structured_data to projects
-- Version: 2.5.0
-- Description: Stores cleaned HTML snapshot and extracted
--              structured data (JSON-LD, Microdata, OG, Twitter)
--              from heuristic URL analysis
-- =====================================================

-- Add html_snapshot column (text, nullable)
-- Stores cleaned HTML (no scripts, styles, SVGs, comments)
-- Truncated at 500KB max
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS html_snapshot text;

-- Add structured_data column (jsonb, nullable)
-- Stores extracted structured data:
-- {
--   "jsonLd": [...],        -- JSON-LD objects from <script type="application/ld+json">
--   "microdata": [...],     -- Microdata items (itemscope/itemprop)
--   "openGraph": {...},     -- Open Graph meta tags (og:*)
--   "twitterCard": {...}    -- Twitter Card meta tags (twitter:*)
-- }
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS structured_data jsonb;

-- Add snapshot timestamp to track when the HTML was captured
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS html_snapshot_at timestamptz;

-- Comment columns for documentation
COMMENT ON COLUMN public.projects.html_snapshot IS 'Cleaned HTML snapshot (no scripts/styles/SVGs/comments, max 500KB)';
COMMENT ON COLUMN public.projects.structured_data IS 'Extracted structured data: jsonLd, microdata, openGraph, twitterCard';
COMMENT ON COLUMN public.projects.html_snapshot_at IS 'Timestamp of when the HTML snapshot was captured';
