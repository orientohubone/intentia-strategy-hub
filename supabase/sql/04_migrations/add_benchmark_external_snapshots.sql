-- Add cache table for aggregated benchmark data sourced from trusted external APIs
create table if not exists public.benchmark_external_snapshots (
  id uuid primary key default uuid_generate_v4(),
  niche_id text not null unique,
  label text not null,
  description text,
  display text,
  ratio numeric not null check (ratio >= 0),
  tags text[] default '{}',
  source_data jsonb default '{}',
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists benchmark_external_snapshots_niche_id_idx on public.benchmark_external_snapshots (niche_id);
create index if not exists benchmark_external_snapshots_fetched_at_idx on public.benchmark_external_snapshots (fetched_at desc);
