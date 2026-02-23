-- Aggregated monthly budget stats from budget_allocations
-- Source of truth for OperationsStats totals
-- Safe to re-run
create or replace view public.v_budget_stats_monthly as
select
  user_id,
  month,
  year,
  sum(planned_budget) as total_planned,
  sum(coalesce(actual_spent, 0)) as total_spent,
  count(*) as allocation_count,
  now() at time zone 'utc' as generated_at
from public.budget_allocations
group by user_id, month, year;

-- Helpful index for month/year lookups (no-op if exists)
create index if not exists idx_budget_allocations_user_month_year
  on public.budget_allocations (user_id, year, month);
