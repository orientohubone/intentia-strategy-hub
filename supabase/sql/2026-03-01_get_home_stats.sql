-- Function to get home dashboard stats in a single RPC call
create or replace function get_home_stats()
returns json
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid;
  v_audiences_count int;
  v_benchmarks_count int;
  v_insights_count int;
  v_has_ai_key boolean;
  v_notifications_count int;
begin
  -- Get current user ID
  v_user_id := auth.uid();

  if v_user_id is null then
    -- Return empty stats or handle error
    return null;
  end if;

  select count(*) into v_audiences_count from audiences where user_id = v_user_id;
  select count(*) into v_benchmarks_count from benchmarks where user_id = v_user_id;
  select count(*) into v_insights_count from insights where user_id = v_user_id;
  select count(*) > 0 into v_has_ai_key from user_api_keys where user_id = v_user_id;
  select count(*) into v_notifications_count from notifications where user_id = v_user_id and read = false;

  return json_build_object(
    'audiencesCount', v_audiences_count,
    'benchmarksCount', v_benchmarks_count,
    'totalInsightsCount', v_insights_count,
    'hasAiKey', v_has_ai_key,
    'notificationsCount', v_notifications_count
  );
end;
$$;
