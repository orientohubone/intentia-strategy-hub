-- Add project_id column to audiences table
alter table public.audiences add column if not exists project_id uuid references public.projects(id) on delete set null;

-- Create index for project_id
create index if not exists idx_audiences_project_id on public.audiences(project_id);
