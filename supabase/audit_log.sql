-- =====================================================
-- INTENTIA STRATEGY HUB — AUDIT LOG
-- Registro automático de todas as operações por tenant
-- =====================================================

-- =====================================================
-- TABLE: audit_log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  table_name text NOT NULL,
  record_id uuid,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_fields text[],
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON public.audit_log (user_id);
CREATE INDEX IF NOT EXISTS audit_log_table_name_idx ON public.audit_log (table_name);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_operation_idx ON public.audit_log (operation);
CREATE INDEX IF NOT EXISTS audit_log_user_table_idx ON public.audit_log (user_id, table_name, created_at DESC);

-- Particionamento por mês (para escalabilidade futura)
-- Por enquanto, cleanup automático de logs antigos

-- =====================================================
-- RLS: cada usuário vê apenas seus próprios logs
-- =====================================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_own" ON public.audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Apenas triggers internos podem inserir (não o client)
CREATE POLICY "audit_log_insert_system" ON public.audit_log
  FOR INSERT WITH CHECK (true);

-- Ninguém pode atualizar ou deletar logs
-- (sem policy = bloqueado por RLS)

-- =====================================================
-- GENERIC AUDIT TRIGGER FUNCTION
-- Captura INSERT, UPDATE, DELETE em qualquer tabela
-- =====================================================
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _user_id uuid;
  _old_data jsonb;
  _new_data jsonb;
  _changed text[];
  _record_id uuid;
  _key text;
BEGIN
  -- Extrair user_id do JWT (se disponível)
  _user_id := auth.uid();

  -- Determinar dados e record_id baseado na operação
  IF TG_OP = 'DELETE' THEN
    _old_data := to_jsonb(OLD);
    _new_data := NULL;
    _record_id := OLD.id;
  ELSIF TG_OP = 'INSERT' THEN
    _old_data := NULL;
    _new_data := to_jsonb(NEW);
    _record_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    _old_data := to_jsonb(OLD);
    _new_data := to_jsonb(NEW);
    _record_id := NEW.id;

    -- Calcular campos alterados
    _changed := ARRAY[]::text[];
    FOR _key IN SELECT jsonb_object_keys(_new_data)
    LOOP
      IF _key NOT IN ('updated_at') AND (_old_data ->> _key) IS DISTINCT FROM (_new_data ->> _key) THEN
        _changed := array_append(_changed, _key);
      END IF;
    END LOOP;

    -- Se nada mudou (exceto updated_at), não logar
    IF array_length(_changed, 1) IS NULL THEN
      IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
    END IF;
  END IF;

  -- Remover campos sensíveis do log
  IF _old_data IS NOT NULL THEN
    _old_data := _old_data - 'api_key_encrypted' - 'html_snapshot';
  END IF;
  IF _new_data IS NOT NULL THEN
    _new_data := _new_data - 'api_key_encrypted' - 'html_snapshot';
  END IF;

  -- Inserir no audit log
  INSERT INTO public.audit_log (
    user_id, table_name, record_id, operation,
    old_data, new_data, changed_fields
  ) VALUES (
    COALESCE(_user_id, (CASE WHEN TG_OP = 'DELETE' THEN (OLD).user_id ELSE (NEW).user_id END)),
    TG_TABLE_NAME,
    _record_id,
    TG_OP,
    _old_data,
    _new_data,
    _changed
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- =====================================================
-- ATTACH AUDIT TRIGGERS TO ALL TABLES
-- =====================================================

-- tenant_settings
DROP TRIGGER IF EXISTS audit_tenant_settings ON public.tenant_settings;
CREATE TRIGGER audit_tenant_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.tenant_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- projects
DROP TRIGGER IF EXISTS audit_projects ON public.projects;
CREATE TRIGGER audit_projects
  AFTER INSERT OR UPDATE OR DELETE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- project_channel_scores
DROP TRIGGER IF EXISTS audit_project_channel_scores ON public.project_channel_scores;
CREATE TRIGGER audit_project_channel_scores
  AFTER INSERT OR UPDATE OR DELETE ON public.project_channel_scores
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- insights
DROP TRIGGER IF EXISTS audit_insights ON public.insights;
CREATE TRIGGER audit_insights
  AFTER INSERT OR UPDATE OR DELETE ON public.insights
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- audiences
DROP TRIGGER IF EXISTS audit_audiences ON public.audiences;
CREATE TRIGGER audit_audiences
  AFTER INSERT OR UPDATE OR DELETE ON public.audiences
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- benchmarks
DROP TRIGGER IF EXISTS audit_benchmarks ON public.benchmarks;
CREATE TRIGGER audit_benchmarks
  AFTER INSERT OR UPDATE OR DELETE ON public.benchmarks
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- notifications
DROP TRIGGER IF EXISTS audit_notifications ON public.notifications;
CREATE TRIGGER audit_notifications
  AFTER INSERT OR UPDATE OR DELETE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- user_api_keys
DROP TRIGGER IF EXISTS audit_user_api_keys ON public.user_api_keys;
CREATE TRIGGER audit_user_api_keys
  AFTER INSERT OR UPDATE OR DELETE ON public.user_api_keys
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- tactical_plans
DROP TRIGGER IF EXISTS audit_tactical_plans ON public.tactical_plans;
CREATE TRIGGER audit_tactical_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.tactical_plans
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- tactical_channel_plans
DROP TRIGGER IF EXISTS audit_tactical_channel_plans ON public.tactical_channel_plans;
CREATE TRIGGER audit_tactical_channel_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.tactical_channel_plans
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- copy_frameworks
DROP TRIGGER IF EXISTS audit_copy_frameworks ON public.copy_frameworks;
CREATE TRIGGER audit_copy_frameworks
  AFTER INSERT OR UPDATE OR DELETE ON public.copy_frameworks
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- segmentation_plans
DROP TRIGGER IF EXISTS audit_segmentation_plans ON public.segmentation_plans;
CREATE TRIGGER audit_segmentation_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.segmentation_plans
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- testing_plans
DROP TRIGGER IF EXISTS audit_testing_plans ON public.testing_plans;
CREATE TRIGGER audit_testing_plans
  AFTER INSERT OR UPDATE OR DELETE ON public.testing_plans
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- =====================================================
-- CLEANUP: Remover logs com mais de 90 dias
-- Executar via cron job no Supabase
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.audit_log
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$;

-- Para agendar no Supabase (pg_cron):
-- SELECT cron.schedule('cleanup-audit-logs', '0 3 * * 0', 'SELECT public.cleanup_old_audit_logs()');
