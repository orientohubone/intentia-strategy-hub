import { supabase } from "@/integrations/supabase/client";

export interface SeoLiveMonitoringConfig {
  enabled: boolean;
  intervalSec: number;
  strategy: "mobile" | "desktop";
}

const DEFAULT_CONFIG: SeoLiveMonitoringConfig = {
  enabled: false,
  intervalSec: 300,
  strategy: "mobile",
};

function normalizeConfig(input?: Partial<SeoLiveMonitoringConfig> | null): SeoLiveMonitoringConfig {
  return {
    enabled: !!input?.enabled,
    intervalSec: typeof input?.intervalSec === "number" && input.intervalSec > 0 ? input.intervalSec : DEFAULT_CONFIG.intervalSec,
    strategy: input?.strategy === "desktop" ? "desktop" : "mobile",
  };
}

export async function getSeoLiveMonitoringConfig(
  userId?: string | null,
  projectId?: string | null,
): Promise<SeoLiveMonitoringConfig> {
  if (!userId || !projectId) return DEFAULT_CONFIG;

  const { data, error } = await (supabase as any)
    .from("seo_live_monitoring_configs")
    .select("enabled, interval_seconds, strategy")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data) return DEFAULT_CONFIG;

  return normalizeConfig({
    enabled: !!data.enabled,
    intervalSec: Number(data.interval_seconds) || DEFAULT_CONFIG.intervalSec,
    strategy: data.strategy === "desktop" ? "desktop" : "mobile",
  });
}

export async function setSeoLiveMonitoringConfig(
  userId?: string | null,
  projectId?: string | null,
  config?: Partial<SeoLiveMonitoringConfig>,
): Promise<SeoLiveMonitoringConfig> {
  if (!userId || !projectId) return DEFAULT_CONFIG;

  const current = await getSeoLiveMonitoringConfig(userId, projectId);
  const next = normalizeConfig({
    enabled: config?.enabled ?? current.enabled,
    intervalSec: config?.intervalSec ?? current.intervalSec,
    strategy: config?.strategy ?? current.strategy,
  });

  const nextRunAt = next.enabled
    ? new Date(Date.now() + next.intervalSec * 1000).toISOString()
    : null;

  const { error } = await (supabase as any)
    .from("seo_live_monitoring_configs")
    .upsert(
      {
        user_id: userId,
        project_id: projectId,
        enabled: next.enabled,
        interval_seconds: next.intervalSec,
        strategy: next.strategy,
        next_run_at: nextRunAt,
      },
      { onConflict: "user_id,project_id" },
    );

  if (error) return current;
  return next;
}
