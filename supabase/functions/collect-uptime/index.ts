import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// COLLECT UPTIME — Edge Function
// Collects daily uptime metrics for all platform services.
// Should be called once per day via cron/webhook.
//
// It reads the current status of each service from
// platform_services and inserts/upserts a record into
// platform_uptime_daily for today's date.
//
// If a service had an incident during the day, the uptime
// percentage is reduced based on the incident severity.
// =====================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check: require internal secret or valid service call
    // This function should only be called by pg_cron or authorized systems
    const authHeader = req.headers.get("Authorization");
    const internalSecret = Deno.env.get("INTERNAL_CRON_SECRET");
    const providedSecret = req.headers.get("x-cron-secret");

    // Allow if: has valid JWT (Supabase invocation) OR has valid cron secret
    if (!authHeader && !(internalSecret && providedSecret === internalSecret)) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split("T")[0];

    // 1. Get all visible services
    const { data: services, error: svcError } = await supabase
      .from("platform_services")
      .select("id, name, status")
      .eq("is_visible", true);

    if (svcError) throw svcError;
    if (!services || services.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No services to collect uptime for.", date: today }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Get active incidents for today to calculate impact
    const todayStart = `${today}T00:00:00Z`;
    const todayEnd = `${today}T23:59:59Z`;

    const { data: incidents } = await supabase
      .from("platform_incidents")
      .select("id, status, severity, affected_services, created_at, resolved_at")
      .or(`resolved_at.is.null,resolved_at.gte.${todayStart}`)
      .lte("created_at", todayEnd);

    // 3. Get active maintenances for today
    const { data: maintenances } = await supabase
      .from("platform_maintenances")
      .select("id, status, affected_services, scheduled_start, scheduled_end")
      .in("status", ["scheduled", "in_progress"])
      .lte("scheduled_start", todayEnd)
      .gte("scheduled_end", todayStart);

    // 4. Calculate uptime for each service
    const uptimeRecords = services.map((service: any) => {
      let uptimePercentage = 100.0;
      let worstStatus = service.status;

      // Check incidents affecting this service
      if (incidents) {
        for (const inc of incidents) {
          const affected = inc.affected_services || [];
          if (affected.includes(service.id)) {
            // Reduce uptime based on severity
            switch (inc.severity) {
              case "critical":
                uptimePercentage = Math.min(uptimePercentage, 0);
                worstStatus = "major_outage";
                break;
              case "major":
                uptimePercentage = Math.min(uptimePercentage, 50);
                if (worstStatus === "operational") worstStatus = "partial_outage";
                break;
              case "minor":
                uptimePercentage = Math.min(uptimePercentage, 95);
                if (worstStatus === "operational") worstStatus = "degraded";
                break;
            }

            // If incident was resolved today, partial uptime
            if (inc.resolved_at) {
              const createdAt = new Date(inc.created_at).getTime();
              const resolvedAt = new Date(inc.resolved_at).getTime();
              const dayStart = new Date(todayStart).getTime();
              const dayEnd = new Date(todayEnd).getTime();

              const incidentStart = Math.max(createdAt, dayStart);
              const incidentEnd = Math.min(resolvedAt, dayEnd);
              const dayDuration = dayEnd - dayStart;
              const incidentDuration = Math.max(0, incidentEnd - incidentStart);

              const downtimeFraction = incidentDuration / dayDuration;
              const adjustedUptime = (1 - downtimeFraction) * 100;
              uptimePercentage = Math.max(adjustedUptime, uptimePercentage === 100 ? adjustedUptime : uptimePercentage);
            }
          }
        }
      }

      // Check maintenances affecting this service
      if (maintenances) {
        for (const m of maintenances) {
          const affected = m.affected_services || [];
          if (affected.includes(service.id)) {
            if (worstStatus === "operational") worstStatus = "maintenance";
            // Maintenance doesn't heavily impact uptime, slight reduction
            uptimePercentage = Math.min(uptimePercentage, 99.5);
          }
        }
      }

      // If service is currently not operational and no incidents explain it
      if (service.status !== "operational" && uptimePercentage === 100) {
        switch (service.status) {
          case "major_outage": uptimePercentage = 0; break;
          case "partial_outage": uptimePercentage = 75; break;
          case "degraded": uptimePercentage = 95; break;
          case "maintenance": uptimePercentage = 99.5; break;
        }
        worstStatus = service.status;
      }

      return {
        service_id: service.id,
        date: today,
        status: worstStatus,
        uptime_percentage: Math.round(uptimePercentage * 1000) / 1000,
        response_time_ms: null, // Can be populated by external monitoring integration
      };
    });

    // 5. Upsert records (one per service per day)
    // Since we have UNIQUE(service_id, date), we use upsert
    const { data: upserted, error: upsertError } = await supabase
      .from("platform_uptime_daily")
      .upsert(uptimeRecords, { onConflict: "service_id,date" })
      .select();

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        services_processed: uptimeRecords.length,
        records: upserted?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[collect-uptime] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
