-- =====================================================
-- TABLE: benchmarks
-- =====================================================
create table if not exists public.benchmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  competitor_name text not null,
  competitor_url text not null,
  competitor_niche text not null,
  overall_score integer not null default 0 check (overall_score >= 0 and overall_score <= 100),
  
  -- Análise de proposta de valor
  value_proposition_score integer not null default 0 check (value_proposition_score >= 0 and value_proposition_score <= 100),
  value_proposition_analysis text,
  
  -- Análise de clareza da oferta
  offer_clarity_score integer not null default 0 check (offer_clarity_score >= 0 and offer_clarity_score <= 100),
  offer_clarity_analysis text,
  
  -- Análise de jornada do usuário
  user_journey_score integer not null default 0 check (user_journey_score >= 0 and user_journey_score <= 100),
  user_journey_analysis text,
  
  -- Análise de canais
  channel_presence jsonb default '{}',
  channel_effectiveness jsonb default '{}',
  
  -- Pontos fortes e fracos
  strengths text[] default '{}',
  weaknesses text[] default '{}',
  opportunities text[] default '{}',
  threats text[] default '{}',
  
  -- Insights estratégicos
  strategic_insights text,
  recommendations text,
  
  -- Metadados
  analysis_date timestamptz not null default now(),
  last_update timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (project_id, competitor_url)
);

-- Índices para performance
create index if not exists benchmarks_user_id_idx on public.benchmarks (user_id);
create index if not exists benchmarks_project_id_idx on public.benchmarks (project_id);
create index if not exists benchmarks_created_at_idx on public.benchmarks (created_at desc);
create index if not exists benchmarks_overall_score_idx on public.benchmarks (overall_score desc);

-- Trigger para updated_at
drop trigger if exists set_benchmarks_updated_at on public.benchmarks;
create trigger set_benchmarks_updated_at
  before update on public.benchmarks
  for each row
  execute function public.set_updated_at();

-- =====================================================
-- View para resumo de benchmarks
-- =====================================================
create or replace view public.v_benchmark_summary as
select
  b.id,
  b.user_id,
  b.project_id,
  p.name as project_name,
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
  -- Calcular gap com o projeto principal
  (b.overall_score - p.score) as score_gap
from public.benchmarks b
join public.projects p on p.id = b.project_id;

-- =====================================================
-- RLS para benchmarks
-- =====================================================
alter table public.benchmarks enable row level security;

-- Policies
create policy "benchmarks_select_own" on public.benchmarks
  for select using (auth.uid() = user_id);

create policy "benchmarks_insert_own" on public.benchmarks
  for insert with check (auth.uid() = user_id);

create policy "benchmarks_update_own" on public.benchmarks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "benchmarks_delete_own" on public.benchmarks
  for delete using (auth.uid() = user_id);

-- =====================================================
-- View para estatísticas de benchmark
-- =====================================================
create or replace view public.v_benchmark_stats as
select
  user_id,
  project_id,
  count(*) as total_competitors,
  avg(overall_score) as avg_competitor_score,
  max(overall_score) as max_competitor_score,
  min(overall_score) as min_competitor_score,
  max(overall_score) - min(overall_score) as score_range,
  array_agg(competitor_name order by overall_score desc) as top_competitors
from public.benchmarks
group by user_id, project_id;
