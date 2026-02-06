-- Intentia Strategy Hub - Base schema + RLS

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- updated_at trigger function
-- =====================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- ENUM-like check constraints
-- =====================================================

-- projects.status: pending | analyzing | completed
-- tenant_settings.plan: starter | professional | enterprise
-- insights.type: warning | opportunity | improvement
-- project_channel_scores.channel: google | meta | linkedin | tiktok

-- =====================================================
-- TABLE: tenant_settings
-- =====================================================
create table if not exists public.tenant_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_name text not null,
  plan text not null check (plan in ('starter', 'professional', 'enterprise')),
  monthly_analyses_limit integer not null default 5,
  analyses_used integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists tenant_settings_user_id_idx on public.tenant_settings (user_id);

-- =====================================================
-- TABLE: projects
-- =====================================================
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  niche text not null,
  url text not null,
  score integer not null default 0,
  status text not null check (status in ('pending', 'analyzing', 'completed')),
  last_update timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_created_at_idx on public.projects (created_at desc);

-- =====================================================
-- TABLE: project_channel_scores
-- =====================================================
create table if not exists public.project_channel_scores (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('google', 'meta', 'linkedin', 'tiktok')),
  score integer not null default 0,
  objective text,
  funnel_role text,
  is_recommended boolean not null default true,
  risks text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, channel)
);

create index if not exists project_channel_scores_project_id_idx on public.project_channel_scores (project_id);
create index if not exists project_channel_scores_user_id_idx on public.project_channel_scores (user_id);

-- =====================================================
-- TABLE: insights
-- =====================================================
create table if not exists public.insights (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('warning', 'opportunity', 'improvement')),
  title text not null,
  description text not null,
  action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insights_project_id_idx on public.insights (project_id);
create index if not exists insights_user_id_idx on public.insights (user_id);

-- =====================================================
-- updated_at triggers
-- =====================================================
drop trigger if exists set_tenant_settings_updated_at on public.tenant_settings;
create trigger set_tenant_settings_updated_at
  before update on public.tenant_settings
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_project_channel_scores_updated_at on public.project_channel_scores;
create trigger set_project_channel_scores_updated_at
  before update on public.project_channel_scores
  for each row
  execute function public.set_updated_at();

drop trigger if exists set_insights_updated_at on public.insights;
create trigger set_insights_updated_at
  before update on public.insights
  for each row
  execute function public.set_updated_at();

-- =====================================================
-- Views (dashboard helpers)
-- =====================================================
create or replace view public.v_project_summary as
select
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
  jsonb_object_agg(pcs.channel, pcs.score) as channel_scores
from public.projects p
left join public.project_channel_scores pcs on pcs.project_id = p.id
group by p.id;

create or replace view public.v_dashboard_stats as
select
  user_id,
  count(*) filter (where status in ('pending','analyzing','completed')) as total_projects,
  count(*) filter (where status = 'completed') as completed_projects,
  count(*) filter (where status = 'analyzing') as analyzing_projects,
  count(*) filter (where status = 'pending') as pending_projects,
  coalesce(avg(score), 0) as average_score,
  max(updated_at) as last_project_update
from public.projects
group by user_id;

-- =====================================================
-- RLS
-- =====================================================
alter table public.tenant_settings enable row level security;
alter table public.projects enable row level security;
alter table public.project_channel_scores enable row level security;
alter table public.insights enable row level security;

-- tenant_settings policies
create policy "tenant_settings_select_own" on public.tenant_settings
  for select using (auth.uid() = user_id);

create policy "tenant_settings_insert_own" on public.tenant_settings
  for insert with check (auth.uid() = user_id);

create policy "tenant_settings_update_own" on public.tenant_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "tenant_settings_delete_own" on public.tenant_settings
  for delete using (auth.uid() = user_id);

-- projects policies
create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);

create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

-- project_channel_scores policies
create policy "project_channel_scores_select_own" on public.project_channel_scores
  for select using (auth.uid() = user_id);

create policy "project_channel_scores_insert_own" on public.project_channel_scores
  for insert with check (auth.uid() = user_id);

create policy "project_channel_scores_update_own" on public.project_channel_scores
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "project_channel_scores_delete_own" on public.project_channel_scores
  for delete using (auth.uid() = user_id);

-- insights policies
create policy "insights_select_own" on public.insights
  for select using (auth.uid() = user_id);

create policy "insights_insert_own" on public.insights
  for insert with check (auth.uid() = user_id);

create policy "insights_update_own" on public.insights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "insights_delete_own" on public.insights
  for delete using (auth.uid() = user_id);

-- audiences table
create table if not exists public.audiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  name text not null,
  description text not null,
  industry text,
  company_size text check (company_size in ('startup', 'small', 'medium', 'large', 'enterprise')),
  location text,
  keywords text[] default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- audiences indexes
create index if not exists idx_audiences_user_id on public.audiences(user_id);
create index if not exists idx_audiences_created_at on public.audiences(created_at);

-- audiences policies
create policy "audiences_select_own" on public.audiences
  for select using (auth.uid() = user_id);

create policy "audiences_insert_own" on public.audiences
  for insert with check (auth.uid() = user_id);

create policy "audiences_update_own" on public.audiences
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "audiences_delete_own" on public.audiences
  for delete using (auth.uid() = user_id);

-- trigger for updated_at on audiences
create trigger audiences_updated_at
  before update on public.audiences
  for each row
  execute function update_updated_at_column();
