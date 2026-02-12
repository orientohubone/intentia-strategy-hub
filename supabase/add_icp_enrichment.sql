-- Add ICP enrichment columns to audiences table
ALTER TABLE audiences
  ADD COLUMN IF NOT EXISTS icp_enrichment jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS icp_enriched_at timestamptz DEFAULT NULL;

-- Comment for documentation
COMMENT ON COLUMN audiences.icp_enrichment IS 'AI-generated ICP enrichment result (JSON)';
COMMENT ON COLUMN audiences.icp_enriched_at IS 'Timestamp of last ICP enrichment';
