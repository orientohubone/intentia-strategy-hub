-- =====================================================
-- INTENTIA STRATEGY HUB — GUARDRAILS
-- Soft delete, rate limiting, proteções extras
-- =====================================================

-- =====================================================
-- 1. SOFT DELETE: Adicionar deleted_at em tabelas críticas
--    Dados "deletados" ficam ocultos mas recuperáveis
-- =====================================================

-- projects
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS projects_deleted_at_idx ON public.projects (deleted_at) WHERE deleted_at IS NOT NULL;

-- audiences
ALTER TABLE public.audiences ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS audiences_deleted_at_idx ON public.audiences (deleted_at) WHERE deleted_at IS NOT NULL;

-- benchmarks
ALTER TABLE public.benchmarks ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS benchmarks_deleted_at_idx ON public.benchmarks (deleted_at) WHERE deleted_at IS NOT NULL;

-- tactical_plans
ALTER TABLE public.tactical_plans ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS tactical_plans_deleted_at_idx ON public.tactical_plans (deleted_at) WHERE deleted_at IS NOT NULL;

-- =====================================================
-- 2. UPDATE RLS: Filtrar soft-deleted records
--    SELECT policies agora excluem deleted_at IS NOT NULL
-- =====================================================

-- projects: recriar policy de SELECT
DROP POLICY IF EXISTS "projects_select_own" ON public.projects;
CREATE POLICY "projects_select_own" ON public.projects
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Policy para ver deletados (para restore)
CREATE POLICY "projects_select_own_deleted" ON public.projects
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- audiences
DROP POLICY IF EXISTS "audiences_select_own" ON public.audiences;
CREATE POLICY "audiences_select_own" ON public.audiences
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "audiences_select_own_deleted" ON public.audiences
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- benchmarks
DROP POLICY IF EXISTS "benchmarks_select_own" ON public.benchmarks;
CREATE POLICY "benchmarks_select_own" ON public.benchmarks
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "benchmarks_select_own_deleted" ON public.benchmarks
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- tactical_plans
DROP POLICY IF EXISTS "tactical_plans_select_own" ON public.tactical_plans;
CREATE POLICY "tactical_plans_select_own" ON public.tactical_plans
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "tactical_plans_select_own_deleted" ON public.tactical_plans
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NOT NULL);

-- =====================================================
-- 3. SOFT DELETE FUNCTION
--    Em vez de DELETE real, marca deleted_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.soft_delete_project(_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.projects
  SET deleted_at = now()
  WHERE id = _project_id AND user_id = auth.uid() AND deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found or already deleted';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_project(_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.projects
  SET deleted_at = NULL
  WHERE id = _project_id AND user_id = auth.uid() AND deleted_at IS NOT NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found or not deleted';
  END IF;
END;
$$;

-- =====================================================
-- 4. RATE LIMITING TABLE
--    Controla frequência de operações por usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  action_type text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT now(),
  request_count integer NOT NULL DEFAULT 1,
  UNIQUE (user_id, action_type, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limits_user_action_idx ON public.rate_limits (user_id, action_type, window_start DESC);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Apenas system pode gerenciar rate limits
CREATE POLICY "rate_limits_select_own" ON public.rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "rate_limits_insert_system" ON public.rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rate_limits_update_system" ON public.rate_limits
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 5. RATE LIMIT CHECK FUNCTION
--    Verifica se o usuário pode executar uma ação
-- =====================================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _user_id uuid,
  _action text,
  _max_requests integer,
  _window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _count integer;
  _window_start timestamptz;
BEGIN
  _window_start := date_trunc('hour', now());

  -- Contar requests na janela atual
  SELECT COALESCE(SUM(request_count), 0) INTO _count
  FROM public.rate_limits
  WHERE user_id = _user_id
    AND action_type = _action
    AND window_start >= now() - (_window_minutes || ' minutes')::interval;

  -- Se excedeu o limite, bloquear
  IF _count >= _max_requests THEN
    RETURN false;
  END IF;

  -- Registrar request
  INSERT INTO public.rate_limits (user_id, action_type, window_start, request_count)
  VALUES (_user_id, _action, _window_start, 1)
  ON CONFLICT (user_id, action_type, window_start)
  DO UPDATE SET request_count = rate_limits.request_count + 1;

  RETURN true;
END;
$$;

-- =====================================================
-- 6. RATE LIMIT ON PROJECT CREATION
--    Starter: max 10 projects/hora
--    Professional: max 50 projects/hora
-- =====================================================
CREATE OR REPLACE FUNCTION public.enforce_project_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _plan text;
  _max integer;
  _allowed boolean;
BEGIN
  -- Buscar plano do usuário
  SELECT plan INTO _plan
  FROM public.tenant_settings
  WHERE user_id = NEW.user_id;

  _max := CASE _plan
    WHEN 'starter' THEN 10
    WHEN 'professional' THEN 50
    WHEN 'enterprise' THEN 200
    ELSE 10
  END;

  _allowed := public.check_rate_limit(NEW.user_id, 'create_project', _max, 60);

  IF NOT _allowed THEN
    RAISE EXCEPTION 'Rate limit exceeded for project creation. Try again later.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_project_rate_limit ON public.projects;
CREATE TRIGGER enforce_project_rate_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_project_rate_limit();

-- =====================================================
-- 7. RATE LIMIT ON ANALYSIS (via analyses_used)
--    Starter: 5/mês, Professional: ilimitado
-- =====================================================
CREATE OR REPLACE FUNCTION public.enforce_analysis_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _plan text;
  _limit integer;
  _used integer;
BEGIN
  -- Só verificar quando heuristic_analysis muda (nova análise)
  IF OLD.heuristic_analysis IS NOT DISTINCT FROM NEW.heuristic_analysis THEN
    RETURN NEW;
  END IF;

  SELECT plan, monthly_analyses_limit, analyses_used
  INTO _plan, _limit, _used
  FROM public.tenant_settings
  WHERE user_id = NEW.user_id;

  -- Enterprise e Professional: sem limite
  IF _plan IN ('professional', 'enterprise') THEN
    RETURN NEW;
  END IF;

  -- Starter: verificar limite
  IF _used >= _limit THEN
    RAISE EXCEPTION 'Monthly analysis limit reached (% of %). Upgrade your plan.', _used, _limit;
  END IF;

  -- Incrementar contador
  UPDATE public.tenant_settings
  SET analyses_used = analyses_used + 1
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_analysis_limit ON public.projects;
CREATE TRIGGER enforce_analysis_limit
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_analysis_limit();

-- =====================================================
-- 8. PROJECT LIMIT PER PLAN
--    Starter: max 5 active projects
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
  SELECT plan INTO _plan
  FROM public.tenant_settings
  WHERE user_id = NEW.user_id;

  _max := CASE _plan
    WHEN 'starter' THEN 5
    WHEN 'professional' THEN 999999
    WHEN 'enterprise' THEN 999999
    ELSE 5
  END;

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

-- =====================================================
-- 9. CLEANUP: Rate limits antigos
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < now() - INTERVAL '7 days';
END;
$$;

-- Para agendar no Supabase (pg_cron):
-- SELECT cron.schedule('cleanup-rate-limits', '0 5 * * *', 'SELECT public.cleanup_old_rate_limits()');

-- =====================================================
-- 10. PERMANENT DELETE CLEANUP
--     Remove soft-deleted records após 30 dias
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_soft_deleted()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar backup antes de limpar
  -- (os triggers de audit já registraram o DELETE)

  DELETE FROM public.projects
  WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';

  DELETE FROM public.audiences
  WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';

  DELETE FROM public.benchmarks
  WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';

  DELETE FROM public.tactical_plans
  WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';
END;
$$;

-- Para agendar no Supabase (pg_cron):
-- SELECT cron.schedule('cleanup-soft-deleted', '0 6 1 * *', 'SELECT public.cleanup_soft_deleted()');
