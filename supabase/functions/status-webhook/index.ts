import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

// =====================================================
// STATUS WEBHOOK — Edge Function
// Receives status updates from external monitoring tools
// (UptimeRobot, Checkly, Pingdom, etc.) and updates
// the platform_services status + records uptime data.
//
// Authentication: x-webhook-secret header must match
// the WEBHOOK_SECRET env var.
//
// Supported payload formats:
//
// 1. Generic format:
//    { service_name: string, status: string, response_time_ms?: number }
//
// 2. UptimeRobot format:
//    { monitorFriendlyName: string, alertType: number, alertDetails: string }
//
// 3. Checkly format:
//    { check_name: string, response_time: number, has_errors: boolean }
// =====================================================

interface GenericPayload {
  service_name: string;
  status: "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";
  response_time_ms?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify webhook secret
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");

    if (!webhookSecret || providedSecret !== webhookSecret) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid webhook secret." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    let payload: GenericPayload;

    // Detect and normalize payload format
    if (body.monitorFriendlyName) {
      // UptimeRobot format
      // alertType: 1 = down, 2 = up, 3 = SSL expiry
      const status = body.alertType === 2 ? "operational" : "major_outage";
      payload = {
        service_name: body.monitorFriendlyName,
        status,
        response_time_ms: body.responsetime ? parseInt(body.responsetime) : undefined,
      };
    } else if (body.check_name !== undefined) {
      // Checkly format
      payload = {
        service_name: body.check_name,
        status: body.has_errors ? "major_outage" : "operational",
        response_time_ms: body.response_time ? Math.round(body.response_time) : undefined,
      };
    } else if (body.service_name) {
      // Generic format
      payload = body as GenericPayload;
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Unrecognized payload format. Expected service_name, monitorFriendlyName, or check_name." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the service by name (case-insensitive partial match)
    const { data: services } = await supabase
      .from("platform_services")
      .select("id, name, status")
      .ilike("name", `%${payload.service_name}%`);

    if (!services || services.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: `Service "${payload.service_name}" not found.` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const service = services[0];
    const today = new Date().toISOString().split("T")[0];

    // Update service status if changed
    if (service.status !== payload.status) {
      await supabase
        .from("platform_services")
        .update({ status: payload.status })
        .eq("id", service.id);
    }

    // Record uptime data for today
    if (payload.response_time_ms !== undefined) {
      const uptimePercentage = payload.status === "operational" ? 100 :
        payload.status === "degraded" ? 95 :
        payload.status === "partial_outage" ? 75 :
        payload.status === "major_outage" ? 0 : 99.5;

      await supabase
        .from("platform_uptime_daily")
        .upsert({
          service_id: service.id,
          date: today,
          status: payload.status,
          uptime_percentage: uptimePercentage,
          response_time_ms: payload.response_time_ms,
        }, { onConflict: "service_id,date" });
    }

    return new Response(
      JSON.stringify({
        success: true,
        service_id: service.id,
        service_name: service.name,
        previous_status: service.status,
        new_status: payload.status,
        response_time_ms: payload.response_time_ms || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[status-webhook] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
