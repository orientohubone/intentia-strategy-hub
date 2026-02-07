-- =====================================================
-- Migration: Add structured_data and html_snapshot to benchmarks
-- Purpose: Store competitor structured data for unified comparison
-- =====================================================

-- Add structured_data column (JSON-LD, OG, Twitter Card, Microdata)
ALTER TABLE public.benchmarks ADD COLUMN IF NOT EXISTS structured_data jsonb;

-- Add html_snapshot column (cleaned HTML)
ALTER TABLE public.benchmarks ADD COLUMN IF NOT EXISTS html_snapshot text;

-- Add timestamp for when snapshot was taken
ALTER TABLE public.benchmarks ADD COLUMN IF NOT EXISTS html_snapshot_at timestamptz;

-- Comment columns
COMMENT ON COLUMN public.benchmarks.structured_data IS 'JSON-LD, Open Graph, Twitter Card, Microdata extracted from competitor URL';
COMMENT ON COLUMN public.benchmarks.html_snapshot IS 'Cleaned HTML snapshot of competitor page (scripts/styles/SVG removed)';
COMMENT ON COLUMN public.benchmarks.html_snapshot_at IS 'Timestamp when the HTML snapshot was captured';
