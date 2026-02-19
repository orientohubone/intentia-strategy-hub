import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret, x-webhook-secret",
};

type OrchestratorAction = "dispatch_due" | "run_jobs" | "dispatch_and_run" | "webhook_enqueue";

function ensureAbsoluteUrl(raw: string): string {
  const trimmed = raw?.trim?.() ?? "";
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function normalizeCompetitorUrls(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return [...new Set(value.map((item) => ensureAbsoluteUrl(String(item))).filter(Boolean))];
  if (typeof value === "string") {
    return [...new Set(value.split(/\r?\n|,|;/).map((item) => ensureAbsoluteUrl(item)).filter(Boolean))];
  }
  return [];
}

function deriveScoresFromPageSpeed(raw: any): {
  performance_score: number | null;
  seo_score: number | null;
  accessibility_score: number | null;
  best_practices_score: number | null;
} {
  const categories = raw?.lighthouseResult?.categories || {};
  const toScore = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
  };
  return {
    performance_score: toScore(categories?.performance?.score),
    seo_score: toScore(categories?.seo?.score),
    accessibility_score: toScore(categories?.accessibility?.score),
    best_practices_score: toScore(categories?.["best-practices"]?.score),
  };
}

function toDomain(value: string): string {
  try {
    return new URL(ensureAbsoluteUrl(value)).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function buildMonitoringInsights(args: {
  previous: any | null;
  performanceScore: number | null;
  seoScore: number | null;
  serpData: any | null;
  intelligenceData: any | null;
}) {
  const { previous, performanceScore, seoScore, serpData, intelligenceData } = args;
  const changes: string[] = [];

  const previousSeo = typeof previous?.seo_score === "number" ? previous.seo_score : null;
  const previousPerf = typeof previous?.performance_score === "number" ? previous.performance_score : null;
  const seoDelta = previousSeo !== null && seoScore !== null ? seoScore - previousSeo : null;
  const perfDelta = previousPerf !== null && performanceScore !== null ? performanceScore - previousPerf : null;

  if (seoDelta !== null && Math.abs(seoDelta) >= 3) {
    changes.push(seoDelta > 0 ? `SEO melhorou ${seoDelta} pts` : `SEO caiu ${Math.abs(seoDelta)} pts`);
  }
  if (perfDelta !== null && Math.abs(perfDelta) >= 5) {
    changes.push(perfDelta > 0 ? `Performance melhorou ${perfDelta} pts` : `Performance caiu ${Math.abs(perfDelta)} pts`);
  }

  const currentPos = typeof serpData?.targetPosition === "number" ? serpData.targetPosition : null;
  const prevPos = typeof previous?.serp_data?.targetPosition === "number" ? previous.serp_data.targetPosition : null;
  const serpDelta = currentPos !== null && prevPos !== null ? prevPos - currentPos : null;
  if (serpDelta !== null && Math.abs(serpDelta) >= 1) {
    changes.push(serpDelta > 0 ? `Ranking subiu ${serpDelta} posição(ões)` : `Ranking caiu ${Math.abs(serpDelta)} posição(ões)`);
  }

  const currentCompetitors = Array.isArray(intelligenceData?.competitors) ? intelligenceData.competitors : [];
  const prevCompetitors = Array.isArray(previous?.intelligence_data?.competitors) ? previous.intelligence_data.competitors : [];
  const prevMap = new Map<string, any>(prevCompetitors.map((c: any) => [toDomain(c?.domain || c?.url || ""), c]));

  for (const c of currentCompetitors) {
    const key = toDomain(c?.domain || c?.url || "");
    const prev = prevMap.get(key);
    if (!prev) {
      changes.push(`Novo concorrente detectado: ${key}`);
      continue;
    }

    if (typeof c?.title === "string" && typeof prev?.title === "string" && c.title.trim() && prev.title.trim() && c.title !== prev.title) {
      changes.push(`${key}: título da página mudou`);
    }

    const currentPriceMentions = Number(c?.priceSignals?.mentions || 0);
    const prevPriceMentions = Number(prev?.priceSignals?.mentions || 0);
    if (Math.abs(currentPriceMentions - prevPriceMentions) >= 3) {
      changes.push(`${key}: sinal de preço alterado (${prevPriceMentions} -> ${currentPriceMentions})`);
    }

    const currentButtons = Number(c?.designSignals?.buttonCount || 0);
    const prevButtons = Number(prev?.designSignals?.buttonCount || 0);
    if (Math.abs(currentButtons - prevButtons) >= 3) {
      changes.push(`${key}: provável mudança de layout/CTAs`);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    seoDelta,
    performanceDelta: perfDelta,
    serpPosition: currentPos,
    serpDelta,
    changeCount: changes.length,
    changes: changes.slice(0, 12),
  };
}

async function invokeEdge(
  supabaseUrl: string,
  serviceRoleKey: string,
  fnName: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/${fnName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Function ${fnName} failed with HTTP ${response.status}`);
  }
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY env vars" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = (body?.action || "dispatch_and_run") as OrchestratorAction;
    const limit = Math.max(1, Math.min(Number(body?.limit) || 10, 50));

    const cronSecret = Deno.env.get("INTERNAL_CRON_SECRET");
    const webhookSecret = Deno.env.get("SEO_MONITOR_WEBHOOK_SECRET");
    const authHeader = req.headers.get("authorization");
    const hasCronAccess = !!cronSecret && req.headers.get("x-cron-secret") === cronSecret;
    const hasWebhookAccess = !!webhookSecret && req.headers.get("x-webhook-secret") === webhookSecret;

    if (!authHeader && !hasCronAccess && !hasWebhookAccess) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const enqueueByConfig = async (config: any, triggerSource: "scheduled" | "webhook", payload: Record<string, unknown> = {}) => {
      const { data: job, error } = await supabase
        .from("seo_monitoring_jobs")
        .insert({
          config_id: config.id,
          project_id: config.project_id,
          user_id: config.user_id,
          trigger_source: triggerSource,
          status: "queued",
          payload,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (triggerSource === "scheduled") {
        const nextRunAt = new Date(Date.now() + Number(config.interval_seconds || 300) * 1000).toISOString();
        await supabase
          .from("seo_live_monitoring_configs")
          .update({
            next_run_at: nextRunAt,
            last_status: "queued",
            last_error: null,
          })
          .eq("id", config.id);
      }

      return job?.id;
    };

    const dispatchDue = async () => {
      const nowIso = new Date().toISOString();
      const { data: configs, error } = await supabase
        .from("seo_live_monitoring_configs")
        .select("id, project_id, user_id, interval_seconds")
        .eq("enabled", true)
        .not("next_run_at", "is", null)
        .lte("next_run_at", nowIso)
        .order("next_run_at", { ascending: true })
        .limit(limit);
      if (error) throw error;

      let queued = 0;
      for (const cfg of configs || []) {
        await enqueueByConfig(cfg, "scheduled");
        queued++;
      }
      return { queued };
    };

    const runJobs = async () => {
      const { data: jobs, error } = await supabase
        .from("seo_monitoring_jobs")
        .select("id, config_id, project_id, user_id, trigger_source, payload")
        .eq("status", "queued")
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw error;

      let completed = 0;
      let failed = 0;

      for (const job of jobs || []) {
        try {
          await supabase
            .from("seo_monitoring_jobs")
            .update({ status: "running", run_started_at: new Date().toISOString(), error_message: null })
            .eq("id", job.id);

          const { data: project, error: projectError } = await supabase
            .from("projects")
            .select("id, name, niche, url, competitor_urls")
            .eq("id", job.project_id)
            .eq("user_id", job.user_id)
            .single();
          if (projectError || !project?.url) throw new Error("Project not found or URL missing");

          const { data: config } = await supabase
            .from("seo_live_monitoring_configs")
            .select("id, strategy, enabled, interval_seconds")
            .eq("id", job.config_id)
            .maybeSingle();

          const strategy = config?.strategy === "desktop" ? "desktop" : "mobile";
          const normalizedUrl = ensureAbsoluteUrl(project.url);
          const competitorUrls = normalizeCompetitorUrls(project.competitor_urls).slice(0, 5);
          const niche = (project.niche || "").trim() || project.name;

          const { data: keys } = await supabase
            .from("user_api_keys")
            .select("provider, api_key_encrypted, preferred_model, is_active")
            .eq("user_id", job.user_id)
            .eq("is_active", true);

          const aiKeys = (keys || [])
            .filter((k: any) => k.api_key_encrypted && String(k.api_key_encrypted).trim())
            .map((k: any) => ({
              provider: k.provider,
              apiKey: k.api_key_encrypted,
              model: k.preferred_model || (k.provider === "google_gemini" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514"),
            }));

          const targetDomain = (() => {
            try {
              return new URL(normalizedUrl).hostname;
            } catch {
              return undefined;
            }
          })();

          const searchTerms = [...new Set([`${project.name} ${niche}`.trim(), project.name].filter(Boolean))].slice(0, 10);

          const [pageSpeedSettled, serpSettled, intelligenceSettled] = await Promise.allSettled([
            invokeEdge(supabaseUrl, serviceRoleKey, "pagespeed", { url: normalizedUrl, strategy }),
            invokeEdge(supabaseUrl, serviceRoleKey, "seo-serp", { searchTerms, targetDomain }),
            invokeEdge(supabaseUrl, serviceRoleKey, "seo-intelligence", {
              url: normalizedUrl,
              competitorUrls,
              brandName: project.name,
              niche,
              aiKeys,
            }),
          ]);

          const pageSpeedRaw = pageSpeedSettled.status === "fulfilled" ? pageSpeedSettled.value : null;
          const serpData = serpSettled.status === "fulfilled" ? serpSettled.value : null;
          let intelligenceData = intelligenceSettled.status === "fulfilled" ? intelligenceSettled.value : null;
          const scores = deriveScoresFromPageSpeed(pageSpeedRaw);

          const { data: previousSnapshot } = await supabase
            .from("seo_analysis_history")
            .select("seo_score, performance_score, serp_data, intelligence_data, analyzed_at")
            .eq("project_id", job.project_id)
            .eq("user_id", job.user_id)
            .order("analyzed_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const monitoringInsights = buildMonitoringInsights({
            previous: previousSnapshot || null,
            performanceScore: scores.performance_score,
            seoScore: scores.seo_score,
            serpData,
            intelligenceData,
          });

          if (intelligenceData && typeof intelligenceData === "object") {
            intelligenceData = {
              ...intelligenceData,
              monitoringInsights,
            };
          } else {
            intelligenceData = { monitoringInsights };
          }

          await supabase.from("seo_analysis_history").insert({
            project_id: job.project_id,
            user_id: job.user_id,
            strategy,
            performance_score: scores.performance_score,
            seo_score: scores.seo_score,
            accessibility_score: scores.accessibility_score,
            best_practices_score: scores.best_practices_score,
            pagespeed_result: pageSpeedRaw,
            serp_data: serpData,
            intelligence_data: intelligenceData,
            analyzed_url: normalizedUrl,
          });

          await supabase
            .from("seo_monitoring_jobs")
            .update({
              status: "completed",
              run_finished_at: new Date().toISOString(),
              result_summary: {
                hasPageSpeed: !!pageSpeedRaw,
                hasSerp: !!serpData,
                hasIntelligence: !!intelligenceData,
                competitors: intelligenceData?.competitors?.length || 0,
                changeCount: monitoringInsights.changeCount || 0,
                topChanges: monitoringInsights.changes || [],
              },
            })
            .eq("id", job.id);

          if (job.config_id) {
            const nextRunAt = config?.enabled
              ? new Date(Date.now() + Number(config.interval_seconds || 300) * 1000).toISOString()
              : null;

            await supabase
              .from("seo_live_monitoring_configs")
              .update({
                last_run_at: new Date().toISOString(),
                last_status: "completed",
                last_error: null,
                next_run_at: nextRunAt,
              })
              .eq("id", job.config_id);
          }

          completed++;
        } catch (err: any) {
          await supabase
            .from("seo_monitoring_jobs")
            .update({
              status: "failed",
              run_finished_at: new Date().toISOString(),
              error_message: err?.message || "Unknown error",
            })
            .eq("id", job.id);

          if (job.config_id) {
            await supabase
              .from("seo_live_monitoring_configs")
              .update({
                last_run_at: new Date().toISOString(),
                last_status: "failed",
                last_error: err?.message || "Unknown error",
              })
              .eq("id", job.config_id);
          }
          failed++;
        }
      }

      return { completed, failed, processed: completed + failed };
    };

    if (action === "webhook_enqueue") {
      if (!hasWebhookAccess) {
        return new Response(
          JSON.stringify({ success: false, error: "Invalid webhook secret" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const projectId = String(body?.projectId || "");
      const projectUrl = String(body?.projectUrl || "").trim();
      const payload = typeof body?.payload === "object" && body?.payload ? body.payload : {};

      let configsQuery = supabase
        .from("seo_live_monitoring_configs")
        .select("id, project_id, user_id, interval_seconds")
        .eq("enabled", true);

      if (projectId) {
        configsQuery = configsQuery.eq("project_id", projectId);
      } else if (projectUrl) {
        const { data: projects } = await supabase
          .from("projects")
          .select("id")
          .eq("url", ensureAbsoluteUrl(projectUrl));
        const projectIds = (projects || []).map((p: any) => p.id);
        if (projectIds.length === 0) {
          return new Response(JSON.stringify({ success: true, queued: 0 }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        configsQuery = configsQuery.in("project_id", projectIds);
      }

      const { data: configs, error: cfgError } = await configsQuery.limit(limit);
      if (cfgError) throw cfgError;

      let queued = 0;
      for (const cfg of configs || []) {
        await enqueueByConfig(cfg, "webhook", payload as Record<string, unknown>);
        queued++;
      }

      return new Response(
        JSON.stringify({ success: true, action, queued }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let dispatchResult: Record<string, unknown> = {};
    let runResult: Record<string, unknown> = {};

    if (action === "dispatch_due" || action === "dispatch_and_run") {
      dispatchResult = await dispatchDue();
    }

    if (action === "run_jobs" || action === "dispatch_and_run") {
      runResult = await runJobs();
    }

    return new Response(
      JSON.stringify({ success: true, action, ...dispatchResult, ...runResult }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("[seo-monitor-orchestrator] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err?.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
