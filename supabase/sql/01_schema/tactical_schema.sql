-- =====================================================
-- INTENTIA STRATEGY HUB — CAMADA TÁTICA
-- Schema para planos táticos por canal
-- =====================================================

-- =====================================================
-- TABLE: tactical_plans
-- Plano tático geral vinculado a um projeto
-- =====================================================
create table if not exists public.tactical_plans (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'in_progress', 'completed')),
  overall_tactical_score integer default 0,
  strategic_coherence_score integer default 0,
  structure_clarity_score integer default 0,
  segmentation_quality_score integer default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id)
);

create index if not exists tactical_plans_project_id_idx on public.tactical_plans (project_id);
create index if not exists tactical_plans_user_id_idx on public.tactical_plans (user_id);

-- =====================================================
-- TABLE: tactical_channel_plans
-- Plano tático específico por canal
-- =====================================================
create table if not exists public.tactical_channel_plans (
  id uuid primary key default uuid_generate_v4(),
  tactical_plan_id uuid not null references public.tactical_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('google', 'meta', 'linkedin', 'tiktok')),

  -- Tipo e estrutura de campanha
  campaign_type text,
  campaign_structure jsonb default '{}',
  funnel_role text,
  funnel_stage text check (funnel_stage in ('awareness', 'consideration', 'conversion', 'retention')),

  -- Google Ads específico
  ad_group_structure jsonb default '[]',
  bidding_strategy text,
  extensions_plan jsonb default '[]',
  quality_score_factors jsonb default '{}',

  -- Segmentação
  segmentation jsonb default '{}',

  -- Métricas e testes
  key_metrics jsonb default '[]',
  testing_plan jsonb default '[]',

  -- Score tático do canal
  tactical_score integer default 0,
  coherence_score integer default 0,
  clarity_score integer default 0,
  segmentation_score integer default 0,

  -- Alertas
  alerts jsonb default '[]',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tactical_plan_id, channel)
);

create index if not exists tactical_channel_plans_tactical_plan_id_idx on public.tactical_channel_plans (tactical_plan_id);
create index if not exists tactical_channel_plans_user_id_idx on public.tactical_channel_plans (user_id);

-- =====================================================
-- TABLE: copy_frameworks
-- Frameworks de copy por canal (sem textos finais)
-- =====================================================
create table if not exists public.copy_frameworks (
  id uuid primary key default uuid_generate_v4(),
  tactical_plan_id uuid not null references public.tactical_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('google', 'meta', 'linkedin', 'tiktok')),
  framework_type text not null check (framework_type in ('pain_solution_proof_cta', 'comparison', 'authority', 'custom')),
  framework_name text not null,
  structure jsonb not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists copy_frameworks_tactical_plan_id_idx on public.copy_frameworks (tactical_plan_id);
create index if not exists copy_frameworks_user_id_idx on public.copy_frameworks (user_id);

-- =====================================================
-- TABLE: segmentation_plans
-- Relação público × canal × mensagem
-- =====================================================
create table if not exists public.segmentation_plans (
  id uuid primary key default uuid_generate_v4(),
  tactical_plan_id uuid not null references public.tactical_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  audience_id uuid references public.audiences (id) on delete set null,
  channel text not null check (channel in ('google', 'meta', 'linkedin', 'tiktok')),
  audience_name text not null,
  targeting_criteria jsonb default '{}',
  message_angle text,
  priority text check (priority in ('high', 'medium', 'low')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists segmentation_plans_tactical_plan_id_idx on public.segmentation_plans (tactical_plan_id);
create index if not exists segmentation_plans_user_id_idx on public.segmentation_plans (user_id);

-- =====================================================
-- TABLE: testing_plans
-- Plano de testes por canal
-- =====================================================
create table if not exists public.testing_plans (
  id uuid primary key default uuid_generate_v4(),
  tactical_plan_id uuid not null references public.tactical_plans (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('google', 'meta', 'linkedin', 'tiktok')),
  test_name text not null,
  hypothesis text not null,
  what_to_test text not null,
  success_criteria text not null,
  priority text check (priority in ('high', 'medium', 'low')),
  status text not null default 'planned' check (status in ('planned', 'running', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testing_plans_tactical_plan_id_idx on public.testing_plans (tactical_plan_id);
create index if not exists testing_plans_user_id_idx on public.testing_plans (user_id);

-- =====================================================
-- Triggers updated_at
-- =====================================================
drop trigger if exists set_tactical_plans_updated_at on public.tactical_plans;
create trigger set_tactical_plans_updated_at
  before update on public.tactical_plans
  for each row execute function public.set_updated_at();

drop trigger if exists set_tactical_channel_plans_updated_at on public.tactical_channel_plans;
create trigger set_tactical_channel_plans_updated_at
  before update on public.tactical_channel_plans
  for each row execute function public.set_updated_at();

drop trigger if exists set_copy_frameworks_updated_at on public.copy_frameworks;
create trigger set_copy_frameworks_updated_at
  before update on public.copy_frameworks
  for each row execute function public.set_updated_at();

drop trigger if exists set_segmentation_plans_updated_at on public.segmentation_plans;
create trigger set_segmentation_plans_updated_at
  before update on public.segmentation_plans
  for each row execute function public.set_updated_at();

drop trigger if exists set_testing_plans_updated_at on public.testing_plans;
create trigger set_testing_plans_updated_at
  before update on public.testing_plans
  for each row execute function public.set_updated_at();

-- =====================================================
-- RLS
-- =====================================================
alter table public.tactical_plans enable row level security;
alter table public.tactical_channel_plans enable row level security;
alter table public.copy_frameworks enable row level security;
alter table public.segmentation_plans enable row level security;
alter table public.testing_plans enable row level security;

-- tactical_plans
create policy "tactical_plans_select_own" on public.tactical_plans for select using (auth.uid() = user_id);
create policy "tactical_plans_insert_own" on public.tactical_plans for insert with check (auth.uid() = user_id);
create policy "tactical_plans_update_own" on public.tactical_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tactical_plans_delete_own" on public.tactical_plans for delete using (auth.uid() = user_id);

-- tactical_channel_plans
create policy "tactical_channel_plans_select_own" on public.tactical_channel_plans for select using (auth.uid() = user_id);
create policy "tactical_channel_plans_insert_own" on public.tactical_channel_plans for insert with check (auth.uid() = user_id);
create policy "tactical_channel_plans_update_own" on public.tactical_channel_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tactical_channel_plans_delete_own" on public.tactical_channel_plans for delete using (auth.uid() = user_id);

-- copy_frameworks
create policy "copy_frameworks_select_own" on public.copy_frameworks for select using (auth.uid() = user_id);
create policy "copy_frameworks_insert_own" on public.copy_frameworks for insert with check (auth.uid() = user_id);
create policy "copy_frameworks_update_own" on public.copy_frameworks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "copy_frameworks_delete_own" on public.copy_frameworks for delete using (auth.uid() = user_id);

-- segmentation_plans
create policy "segmentation_plans_select_own" on public.segmentation_plans for select using (auth.uid() = user_id);
create policy "segmentation_plans_insert_own" on public.segmentation_plans for insert with check (auth.uid() = user_id);
create policy "segmentation_plans_update_own" on public.segmentation_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "segmentation_plans_delete_own" on public.segmentation_plans for delete using (auth.uid() = user_id);

-- testing_plans
create policy "testing_plans_select_own" on public.testing_plans for select using (auth.uid() = user_id);
create policy "testing_plans_insert_own" on public.testing_plans for insert with check (auth.uid() = user_id);
create policy "testing_plans_update_own" on public.testing_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "testing_plans_delete_own" on public.testing_plans for delete using (auth.uid() = user_id);
