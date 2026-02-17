-- =====================================================
-- TABLE: seo_analysis_history
-- Stores SEO & Performance analysis results per project
-- =====================================================

create table if not exists public.seo_analysis_history (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  strategy text not null check (strategy in ('mobile', 'desktop')),
  
  -- PageSpeed scores
  performance_score integer,
  seo_score integer,
  accessibility_score integer,
  best_practices_score integer,
  
  -- Full PageSpeed result (JSON)
  pagespeed_result jsonb,
  
  -- SERP ranking data (JSON)
  serp_data jsonb,
  
  -- Intelligence data: backlinks, competitors, LLM (JSON)
  intelligence_data jsonb,
  
  -- Metadata
  analyzed_url text not null,
  analyzed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists seo_analysis_history_project_id_idx on public.seo_analysis_history (project_id);
create index if not exists seo_analysis_history_user_id_idx on public.seo_analysis_history (user_id);
create index if not exists seo_analysis_history_analyzed_at_idx on public.seo_analysis_history (analyzed_at desc);

-- RLS
alter table public.seo_analysis_history enable row level security;

create policy "Users can view own seo analysis history"
  on public.seo_analysis_history for select
  using (auth.uid() = user_id);

create policy "Users can insert own seo analysis history"
  on public.seo_analysis_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own seo analysis history"
  on public.seo_analysis_history for delete
  using (auth.uid() = user_id);
