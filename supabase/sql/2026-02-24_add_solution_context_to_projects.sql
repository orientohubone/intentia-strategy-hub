-- Add solution_context to projects for plano de comunicação context
alter table projects
  add column if not exists solution_context text;
