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
  project_id uuid references public.projects(id) on delete set null,
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
