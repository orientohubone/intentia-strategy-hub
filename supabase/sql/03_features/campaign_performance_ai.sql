-- =============================================================
-- Migration: Adicionar coluna de análise de performance por IA
-- em campaigns para armazenar resultado da análise
-- =============================================================

ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS performance_ai_analysis JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS performance_ai_analyzed_at TIMESTAMPTZ DEFAULT NULL;
