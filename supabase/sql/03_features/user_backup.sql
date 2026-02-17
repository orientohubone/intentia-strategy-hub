-- =====================================================
-- INTENTIA STRATEGY HUB — USER DATA BACKUP SYSTEM
-- Snapshot automático + export sob demanda por tenant
-- =====================================================

-- =====================================================
-- TABLE: user_data_backups
-- Armazena snapshots JSON completos dos dados do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_data_backups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  backup_type text NOT NULL CHECK (backup_type IN ('auto', 'manual', 'pre_delete')),
  backup_data jsonb NOT NULL,
  tables_included text[] NOT NULL,
  record_counts jsonb NOT NULL,
  size_bytes bigint,
  checksum text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + INTERVAL '90 days')
);

CREATE INDEX IF NOT EXISTS user_data_backups_user_id_idx ON public.user_data_backups (user_id);
CREATE INDEX IF NOT EXISTS user_data_backups_created_at_idx ON public.user_data_backups (created_at DESC);
CREATE INDEX IF NOT EXISTS user_data_backups_type_idx ON public.user_data_backups (backup_type);
CREATE INDEX IF NOT EXISTS user_data_backups_expires_idx ON public.user_data_backups (expires_at);

-- RLS
ALTER TABLE public.user_data_backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_data_backups_select_own" ON public.user_data_backups
  FOR SELECT USING (auth.uid() = user_id);

-- Apenas system/triggers podem inserir backups
CREATE POLICY "user_data_backups_insert_system" ON public.user_data_backups
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário pode deletar seus próprios backups
CREATE POLICY "user_data_backups_delete_own" ON public.user_data_backups
  FOR DELETE USING (auth.uid() = user_id);

-- Ninguém pode atualizar backups (imutáveis)

-- =====================================================
-- FUNCTION: create_user_backup
-- Cria um snapshot completo dos dados do usuário
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_user_backup(
  _user_id uuid,
  _backup_type text DEFAULT 'manual',
  _notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _backup_id uuid;
  _data jsonb;
  _counts jsonb;
  _tables text[];
  _size bigint;
  _tenant jsonb;
  _projects jsonb;
  _channel_scores jsonb;
  _insights jsonb;
  _audiences jsonb;
  _benchmarks jsonb;
  _notifications jsonb;
  _api_keys jsonb;
  _tactical_plans jsonb;
  _tactical_channels jsonb;
  _copy_frameworks jsonb;
  _segmentation jsonb;
  _testing jsonb;
BEGIN
  -- Coletar dados de cada tabela
  SELECT COALESCE(jsonb_agg(to_jsonb(t.*)), '[]'::jsonb)
  INTO _tenant
  FROM public.tenant_settings t WHERE t.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(p.*) - 'html_snapshot'), '[]'::jsonb)
  INTO _projects
  FROM public.projects p WHERE p.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(cs.*)), '[]'::jsonb)
  INTO _channel_scores
  FROM public.project_channel_scores cs WHERE cs.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(i.*)), '[]'::jsonb)
  INTO _insights
  FROM public.insights i WHERE i.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(a.*)), '[]'::jsonb)
  INTO _audiences
  FROM public.audiences a WHERE a.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(b.*)), '[]'::jsonb)
  INTO _benchmarks
  FROM public.benchmarks b WHERE b.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(n.*)), '[]'::jsonb)
  INTO _notifications
  FROM public.notifications n WHERE n.user_id = _user_id;

  -- API keys: mascarar a chave
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', ak.id,
      'provider', ak.provider,
      'preferred_model', ak.preferred_model,
      'is_active', ak.is_active,
      'last_validated_at', ak.last_validated_at,
      'created_at', ak.created_at
    )
  ), '[]'::jsonb)
  INTO _api_keys
  FROM public.user_api_keys ak WHERE ak.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(tp.*)), '[]'::jsonb)
  INTO _tactical_plans
  FROM public.tactical_plans tp WHERE tp.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(tc.*)), '[]'::jsonb)
  INTO _tactical_channels
  FROM public.tactical_channel_plans tc WHERE tc.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(cf.*)), '[]'::jsonb)
  INTO _copy_frameworks
  FROM public.copy_frameworks cf WHERE cf.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(sp.*)), '[]'::jsonb)
  INTO _segmentation
  FROM public.segmentation_plans sp WHERE sp.user_id = _user_id;

  SELECT COALESCE(jsonb_agg(to_jsonb(tp2.*)), '[]'::jsonb)
  INTO _testing
  FROM public.testing_plans tp2 WHERE tp2.user_id = _user_id;

  -- Montar objeto completo
  _data := jsonb_build_object(
    'version', '2.5.0',
    'exported_at', now(),
    'user_id', _user_id,
    'tenant_settings', _tenant,
    'projects', _projects,
    'project_channel_scores', _channel_scores,
    'insights', _insights,
    'audiences', _audiences,
    'benchmarks', _benchmarks,
    'notifications', _notifications,
    'user_api_keys', _api_keys,
    'tactical_plans', _tactical_plans,
    'tactical_channel_plans', _tactical_channels,
    'copy_frameworks', _copy_frameworks,
    'segmentation_plans', _segmentation,
    'testing_plans', _testing
  );

  -- Contagens
  _counts := jsonb_build_object(
    'tenant_settings', jsonb_array_length(_tenant),
    'projects', jsonb_array_length(_projects),
    'project_channel_scores', jsonb_array_length(_channel_scores),
    'insights', jsonb_array_length(_insights),
    'audiences', jsonb_array_length(_audiences),
    'benchmarks', jsonb_array_length(_benchmarks),
    'notifications', jsonb_array_length(_notifications),
    'user_api_keys', jsonb_array_length(_api_keys),
    'tactical_plans', jsonb_array_length(_tactical_plans),
    'tactical_channel_plans', jsonb_array_length(_tactical_channels),
    'copy_frameworks', jsonb_array_length(_copy_frameworks),
    'segmentation_plans', jsonb_array_length(_segmentation),
    'testing_plans', jsonb_array_length(_testing)
  );

  _tables := ARRAY[
    'tenant_settings', 'projects', 'project_channel_scores', 'insights',
    'audiences', 'benchmarks', 'notifications', 'user_api_keys',
    'tactical_plans', 'tactical_channel_plans', 'copy_frameworks',
    'segmentation_plans', 'testing_plans'
  ];

  _size := octet_length(_data::text);

  -- Inserir backup
  INSERT INTO public.user_data_backups (
    user_id, backup_type, backup_data, tables_included,
    record_counts, size_bytes, checksum, notes
  ) VALUES (
    _user_id, _backup_type, _data, _tables,
    _counts, _size, md5(_data::text), _notes
  )
  RETURNING id INTO _backup_id;

  RETURN _backup_id;
END;
$$;

-- =====================================================
-- FUNCTION: get_user_backup_data
-- Retorna o JSON completo de um backup específico
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_backup_data(_backup_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _data jsonb;
  _owner uuid;
BEGIN
  SELECT user_id, backup_data INTO _owner, _data
  FROM public.user_data_backups
  WHERE id = _backup_id;

  -- Verificar ownership
  IF _owner IS NULL THEN
    RAISE EXCEPTION 'Backup not found';
  END IF;

  IF _owner != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN _data;
END;
$$;

-- =====================================================
-- AUTO-BACKUP: Trigger antes de DELETE em projects
-- Cria backup automático quando um projeto é deletado
-- =====================================================
CREATE OR REPLACE FUNCTION public.auto_backup_on_project_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _existing_backup_count integer;
BEGIN
  -- Verificar se já existe um backup recente (últimas 24h)
  SELECT count(*) INTO _existing_backup_count
  FROM public.user_data_backups
  WHERE user_id = OLD.user_id
    AND backup_type = 'auto'
    AND created_at > now() - INTERVAL '24 hours';

  -- Se não há backup recente, criar um
  IF _existing_backup_count = 0 THEN
    PERFORM public.create_user_backup(
      OLD.user_id,
      'auto',
      'Auto-backup before project deletion: ' || OLD.name
    );
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS auto_backup_before_project_delete ON public.projects;
CREATE TRIGGER auto_backup_before_project_delete
  BEFORE DELETE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_backup_on_project_delete();

-- =====================================================
-- CLEANUP: Remover backups expirados
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_backups()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.user_data_backups
  WHERE expires_at < now();
END;
$$;

-- Para agendar no Supabase (pg_cron):
-- SELECT cron.schedule('cleanup-expired-backups', '0 4 * * 0', 'SELECT public.cleanup_expired_backups()');
