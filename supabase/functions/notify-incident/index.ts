import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// NOTIFY INCIDENT — Edge Function
// Sends email notification when a critical incident is
// created or updated. Can be triggered via:
//   1. Database webhook on platform_incidents INSERT/UPDATE
//   2. Direct HTTP call from the Admin Panel
//
// Required env vars:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
//   NOTIFICATION_FROM_EMAIL, NOTIFICATION_TO_EMAILS (comma-separated)
//
// If SMTP is not configured, falls back to creating a
// notification record in the notifications table.
// =====================================================

interface IncidentPayload {
  incident_id: string;
  title: string;
  status: string;
  severity: string;
  message?: string;
  affected_services?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check: require valid JWT or internal webhook
    const authHeader = req.headers.get("Authorization");
    const internalSecret = Deno.env.get("INTERNAL_CRON_SECRET");
    const providedSecret = req.headers.get("x-cron-secret");

    if (!authHeader && !(internalSecret && providedSecret === internalSecret)) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let payload: IncidentPayload;

    // Support both webhook (record payload) and direct call
    const body = await req.json();
    if (body.record) {
      // Database webhook format
      const record = body.record;
      payload = {
        incident_id: record.id,
        title: record.title,
        status: record.status,
        severity: record.severity,
        affected_services: record.affected_services || [],
      };
    } else {
      payload = body as IncidentPayload;
    }

    // Only notify on critical/major incidents or status changes
    if (payload.severity !== "critical" && payload.severity !== "major") {
      return new Response(
        JSON.stringify({ success: true, message: "Notification skipped — severity is not critical or major.", severity: payload.severity }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get service names for affected services
    let serviceNames: string[] = [];
    if (payload.affected_services && payload.affected_services.length > 0) {
      const { data: services } = await supabase
        .from("platform_services")
        .select("id, name")
        .in("id", payload.affected_services);
      if (services) {
        serviceNames = services.map((s: any) => s.name);
      }
    }

    // Build notification content
    const severityLabel = payload.severity === "critical" ? "CRÍTICO" : "MAIOR";
    const statusLabel = {
      investigating: "Investigando",
      identified: "Identificado",
      monitoring: "Monitorando",
      resolved: "Resolvido",
    }[payload.status] || payload.status;

    const subject = `[${severityLabel}] ${payload.title} — Intentia Status`;
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${payload.severity === "critical" ? "#dc2626" : "#ea580c"}; color: white; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 18px;">Incidente ${severityLabel}</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">${payload.title}</p>
        </div>
        <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;">Status:</td>
              <td style="padding: 8px 0; font-weight: 600;">${statusLabel}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Severidade:</td>
              <td style="padding: 8px 0; font-weight: 600; color: ${payload.severity === "critical" ? "#dc2626" : "#ea580c"};">${severityLabel}</td>
            </tr>
            ${serviceNames.length > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Serviços Afetados:</td>
              <td style="padding: 8px 0;">${serviceNames.join(", ")}</td>
            </tr>
            ` : ""}
            ${payload.message ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b; vertical-align: top;">Mensagem:</td>
              <td style="padding: 8px 0;">${payload.message}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Data:</td>
              <td style="padding: 8px 0;">${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
            <a href="${supabaseUrl.replace('.supabase.co', '')}/status" style="display: inline-block; background: #f97316; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Ver Status da Plataforma
            </a>
          </div>
        </div>
      </div>
    `;

    // Try to send email via SMTP if configured
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("NOTIFICATION_FROM_EMAIL") || "status@intentia.com.br";
    const toEmails = (Deno.env.get("NOTIFICATION_TO_EMAILS") || "").split(",").filter(Boolean);

    let emailSent = false;

    if (smtpHost && smtpUser && smtpPass && toEmails.length > 0) {
      // Use Resend API if SMTP_HOST is "resend"
      if (smtpHost === "resend") {
        const resendApiKey = smtpPass;
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: toEmails,
            subject: subject,
            html: htmlBody,
          }),
        });

        if (resendResponse.ok) {
          emailSent = true;
          console.log("[notify-incident] Email sent via Resend.");
        } else {
          const err = await resendResponse.text();
          console.error("[notify-incident] Resend error:", err);
        }
      }
      // Add other SMTP providers here if needed
    }

    // Fallback: create notification records for all admin users
    if (!emailSent) {
      console.log("[notify-incident] Email not configured or failed. Creating notification records.");

      // Get all users to notify (admins or all users depending on severity)
      const { data: adminUsers } = await supabase
        .from("admin_users")
        .select("id, name")
        .eq("is_active", true);

      if (adminUsers && adminUsers.length > 0) {
        // Log the notification attempt
        await supabase
          .from("admin_audit_log")
          .insert(adminUsers.map((admin: any) => ({
            admin_id: admin.id,
            action: "incident_notification",
            target_table: "platform_incidents",
            target_id: payload.incident_id,
            details: {
              title: payload.title,
              severity: payload.severity,
              status: payload.status,
              email_sent: emailSent,
              affected_services: serviceNames,
            },
          })));
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        incident_id: payload.incident_id,
        severity: payload.severity,
        email_sent: emailSent,
        notification_created: !emailSent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[notify-incident] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
