-- =====================================================
-- Adicionar colunas metadata para suportar relatórios
-- =====================================================

-- Adicionar coluna metadata na tabela insights
ALTER TABLE public.insights 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Adicionar comentário na coluna
COMMENT ON COLUMN public.insights.metadata IS 'Metadados adicionais do insight, incluindo scores, análises de IA, etc.';

-- Criar tabela para relatórios gerados
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('project_analysis', 'campaign_analysis', 'benchmark', 'consolidated')),
  category text NOT NULL,
  file_url text,
  file_size text,
  format text NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'html', 'json', 'csv')),
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  is_favorite boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  campaign_name text,
  channel text,
  competitor_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS reports_user_id_idx ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS reports_project_id_idx ON public.reports(project_id);
CREATE INDEX IF NOT EXISTS reports_type_idx ON public.reports(type);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS reports_is_favorite_idx ON public.reports(is_favorite);

-- RLS Policies para reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver seus próprios relatórios
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir seus próprios relatórios
CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios relatórios
CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios relatórios
CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Adicionar coluna metadata na tabela benchmarks (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'benchmarks' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.benchmarks ADD COLUMN metadata jsonb DEFAULT '{}';
    COMMENT ON COLUMN public.benchmarks.metadata IS 'Metadados adicionais do benchmark, incluindo análises detalhadas';
  END IF;
END
$$;

-- Adicionar coluna score como alias para overall_score (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'benchmarks' AND column_name = 'score'
  ) THEN
    ALTER TABLE public.benchmarks ADD COLUMN score integer GENERATED ALWAYS AS (overall_score) STORED;
    COMMENT ON COLUMN public.benchmarks.score IS 'Score gerado automaticamente a partir de overall_score para compatibilidade';
  END IF;
END
$$;

-- Adicionar coluna metadata na tabela project_channel_scores (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_channel_scores' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.project_channel_scores ADD COLUMN metadata jsonb DEFAULT '{}';
    COMMENT ON COLUMN public.project_channel_scores.metadata IS 'Metadados adicionais do score do canal, incluindo análises de performance';
  END IF;
END
$$;
