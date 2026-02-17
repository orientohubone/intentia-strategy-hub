-- =====================================================
-- INSIGHTS AI ENRICHMENT
-- Adiciona campos para enriquecimento por IA nos insights
-- =====================================================

-- Coluna source: identifica origem do insight (heuristic ou ai)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insights' AND column_name = 'source') THEN
    ALTER TABLE public.insights ADD COLUMN source TEXT NOT NULL DEFAULT 'heuristic' CHECK (source IN ('heuristic', 'ai'));
  END IF;
END $$;

-- Coluna ai_enrichment: dados do enriquecimento por IA (JSONB)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insights' AND column_name = 'ai_enrichment') THEN
    ALTER TABLE public.insights ADD COLUMN ai_enrichment JSONB;
  END IF;
END $$;

-- Coluna priority: prioridade definida pela IA
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insights' AND column_name = 'priority') THEN
    ALTER TABLE public.insights ADD COLUMN priority TEXT CHECK (priority IN ('critical', 'high', 'medium', 'low'));
  END IF;
END $$;

-- Coluna ai_provider: qual IA gerou/enriqueceu
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insights' AND column_name = 'ai_provider') THEN
    ALTER TABLE public.insights ADD COLUMN ai_provider TEXT;
  END IF;
END $$;

-- Coluna ai_model: modelo usado
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insights' AND column_name = 'ai_model') THEN
    ALTER TABLE public.insights ADD COLUMN ai_model TEXT;
  END IF;
END $$;

-- Coluna ai_enriched_at: quando foi enriquecido
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'insights' AND column_name = 'ai_enriched_at') THEN
    ALTER TABLE public.insights ADD COLUMN ai_enriched_at TIMESTAMPTZ;
  END IF;
END $$;

-- Index para filtrar por source
CREATE INDEX IF NOT EXISTS insights_source_idx ON public.insights (source);
