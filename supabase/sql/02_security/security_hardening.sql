-- =====================================================
-- INTENTIA STRATEGY HUB — SECURITY HARDENING
-- Correções de vulnerabilidades e endurecimento
-- =====================================================

-- =====================================================
-- 1. FIX: contact_messages — restringir SELECT/UPDATE
--    Antes: qualquer autenticado lia todas as mensagens
--    Depois: apenas admin (via service_role) ou dono do email
-- =====================================================

-- Remover policies antigas inseguras
DROP POLICY IF EXISTS "Authenticated users can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;

-- Nenhum usuário comum pode ler mensagens de contato
-- Acesso apenas via service_role (admin dashboard futuro)
-- Se precisar de admin, criar role check:
CREATE POLICY "Only service role can read contact messages"
  ON contact_messages
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR (auth.uid() IS NOT NULL AND email = auth.jwt() ->> 'email')
  );

CREATE POLICY "Only service role can update contact messages"
  ON contact_messages
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- =====================================================
-- 2. FIX: Storage avatars — isolamento por user_id
--    Antes: qualquer autenticado manipulava qualquer avatar
--    Depois: cada usuário só manipula seus próprios arquivos
-- =====================================================

-- Remover policies antigas
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;

-- Upload: apenas no path do próprio user_id
CREATE POLICY "Users upload own avatars only" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Update: apenas arquivos do próprio user_id
CREATE POLICY "Users update own avatars only" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Delete: apenas arquivos do próprio user_id
CREATE POLICY "Users delete own avatars only" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Leitura pública (avatares são públicos por design)
CREATE POLICY "Avatars publicly readable" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars'
);

-- =====================================================
-- 3. SECURE VIEWS — Adicionar security_invoker
--    Garante que views respeitam RLS do caller
-- =====================================================

-- Recriar views com security_invoker = true
-- Isso garante que mesmo via service_role acidental,
-- as views filtram por user_id do caller

CREATE OR REPLACE VIEW public.v_project_summary
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.user_id,
  p.name,
  p.niche,
  p.url,
  p.score,
  p.status,
  p.last_update,
  p.created_at,
  p.updated_at,
  jsonb_object_agg(pcs.channel, pcs.score) AS channel_scores
FROM public.projects p
LEFT JOIN public.project_channel_scores pcs ON pcs.project_id = p.id
GROUP BY p.id;

CREATE OR REPLACE VIEW public.v_dashboard_stats
WITH (security_invoker = true) AS
SELECT
  user_id,
  count(*) FILTER (WHERE status IN ('pending','analyzing','completed')) AS total_projects,
  count(*) FILTER (WHERE status = 'completed') AS completed_projects,
  count(*) FILTER (WHERE status = 'analyzing') AS analyzing_projects,
  count(*) FILTER (WHERE status = 'pending') AS pending_projects,
  coalesce(avg(score), 0) AS average_score,
  max(updated_at) AS last_project_update
FROM public.projects
GROUP BY user_id;

CREATE OR REPLACE VIEW public.v_benchmark_summary
WITH (security_invoker = true) AS
SELECT
  b.id,
  b.user_id,
  b.project_id,
  p.name AS project_name,
  b.competitor_name,
  b.competitor_url,
  b.competitor_niche,
  b.overall_score,
  b.value_proposition_score,
  b.offer_clarity_score,
  b.user_journey_score,
  b.channel_presence,
  b.strengths,
  b.weaknesses,
  b.analysis_date,
  b.created_at,
  b.updated_at,
  (b.overall_score - p.score) AS score_gap
FROM public.benchmarks b
JOIN public.projects p ON p.id = b.project_id;

CREATE OR REPLACE VIEW public.v_benchmark_stats
WITH (security_invoker = true) AS
SELECT
  user_id,
  project_id,
  count(*) AS total_competitors,
  avg(overall_score) AS avg_competitor_score,
  max(overall_score) AS max_competitor_score,
  min(overall_score) AS min_competitor_score,
  max(overall_score) - min(overall_score) AS score_range,
  array_agg(competitor_name ORDER BY overall_score DESC) AS top_competitors
FROM public.benchmarks
GROUP BY user_id, project_id;

-- =====================================================
-- 4. PREVENT PLAN ESCALATION
--    Usuário não pode alterar seu próprio plano via client
-- =====================================================

-- Revogar UPDATE no campo 'plan' para anon/authenticated
-- O plano só deve ser alterado via service_role (checkout backend)
CREATE OR REPLACE FUNCTION public.prevent_plan_self_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se o plano mudou e não é service_role, bloquear
  IF OLD.plan IS DISTINCT FROM NEW.plan THEN
    IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
      RAISE EXCEPTION 'Plan changes are only allowed via server-side operations';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_plan_escalation ON public.tenant_settings;
CREATE TRIGGER prevent_plan_escalation
  BEFORE UPDATE ON public.tenant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_plan_self_change();

-- =====================================================
-- 5. PREVENT analyses_used MANIPULATION
--    Usuário não pode resetar seu contador de análises
-- =====================================================

CREATE OR REPLACE FUNCTION public.prevent_analyses_reset()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.analyses_used < OLD.analyses_used THEN
    IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
      RAISE EXCEPTION 'Cannot decrease analyses_used counter';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_analyses_counter_reset ON public.tenant_settings;
CREATE TRIGGER prevent_analyses_counter_reset
  BEFORE UPDATE ON public.tenant_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_analyses_reset();
