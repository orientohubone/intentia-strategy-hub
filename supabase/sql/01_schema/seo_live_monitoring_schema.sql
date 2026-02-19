-- =====================================================
-- SEO LIVE MONITORING
-- Configura monitoramento contínuo por projeto/usuário
-- e fila de jobs para execução via scheduler/webhook.
-- =====================================================

create extension if not exists "uuid-ossp";

create table if not exists public.seo_live_monitoring_configs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  enabled boolean not null default false,
  interval_seconds integer not null default 300 check (interval_seconds between 60 and 86400),
  strategy text not null default 'mobile' check (strategy in ('mobile', 'desktop')),
  next_run_at timestamptz,
  last_run_at timestamptz,
  last_status text not null default 'idle' check (last_status in ('idle', 'queued', 'running', 'completed', 'failed')),
  last_error text,
  webhook_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, project_id)
);

create index if not exists seo_live_monitoring_configs_user_id_idx
  on public.seo_live_monitoring_configs (user_id);

create index if not exists seo_live_monitoring_configs_next_run_idx
  on public.seo_live_monitoring_configs (enabled, next_run_at);

drop trigger if exists set_seo_live_monitoring_configs_updated_at on public.seo_live_monitoring_configs;
create trigger set_seo_live_monitoring_configs_updated_at
  before update on public.seo_live_monitoring_configs
  for each row
  execute function public.set_updated_at();

create table if not exists public.seo_monitoring_jobs (
  id uuid primary key default uuid_generate_v4(),
  config_id uuid references public.seo_live_monitoring_configs (id) on delete set null,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  trigger_source text not null default 'manual' check (trigger_source in ('manual', 'scheduled', 'webhook')),
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  run_started_at timestamptz,
  run_finished_at timestamptz,
  payload jsonb not null default '{}'::jsonb,
  result_summary jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists seo_monitoring_jobs_user_id_idx
  on public.seo_monitoring_jobs (user_id);

create index if not exists seo_monitoring_jobs_status_created_at_idx
  on public.seo_monitoring_jobs (status, created_at);

create index if not exists seo_monitoring_jobs_project_created_at_idx
  on public.seo_monitoring_jobs (project_id, created_at desc);

drop trigger if exists set_seo_monitoring_jobs_updated_at on public.seo_monitoring_jobs;
create trigger set_seo_monitoring_jobs_updated_at
  before update on public.seo_monitoring_jobs
  for each row
  execute function public.set_updated_at();

alter table public.seo_live_monitoring_configs enable row level security;
alter table public.seo_monitoring_jobs enable row level security;

create policy "seo_live_monitoring_configs_select_own"
  on public.seo_live_monitoring_configs for select
  using (auth.uid() = user_id);

create policy "seo_live_monitoring_configs_insert_own"
  on public.seo_live_monitoring_configs for insert
  with check (auth.uid() = user_id);

create policy "seo_live_monitoring_configs_update_own"
  on public.seo_live_monitoring_configs for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "seo_live_monitoring_configs_delete_own"
  on public.seo_live_monitoring_configs for delete
  using (auth.uid() = user_id);

create policy "seo_monitoring_jobs_select_own"
  on public.seo_monitoring_jobs for select
  using (auth.uid() = user_id);

create policy "seo_monitoring_jobs_insert_own"
  on public.seo_monitoring_jobs for insert
  with check (auth.uid() = user_id);

create policy "seo_monitoring_jobs_update_own"
  on public.seo_monitoring_jobs for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "seo_monitoring_jobs_delete_own"
  on public.seo_monitoring_jobs for delete
  using (auth.uid() = user_id);

-- realtime events para monitoramento em tempo quase real
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'seo_analysis_history'
  ) then
    alter publication supabase_realtime add table public.seo_analysis_history;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'seo_live_monitoring_configs'
  ) then
    alter publication supabase_realtime add table public.seo_live_monitoring_configs;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'seo_monitoring_jobs'
  ) then
    alter publication supabase_realtime add table public.seo_monitoring_jobs;
  end if;
end $$;
