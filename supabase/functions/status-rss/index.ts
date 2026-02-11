import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// =====================================================
// STATUS RSS FEED — Edge Function
// Generates an RSS 2.0 XML feed of recent incidents.
// Accessible at: /functions/v1/status-rss
// =====================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const siteUrl = Deno.env.get("SITE_URL") || "https://intentia.com.br";

    // Load recent incidents (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: incidents, error } = await supabase
      .from("platform_incidents")
      .select("id, title, status, severity, created_at, updated_at, resolved_at")
      .gte("created_at", ninetyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Load updates for all incidents
    const incidentIds = (incidents || []).map((i: any) => i.id);
    let updatesMap: Record<string, any[]> = {};

    if (incidentIds.length > 0) {
      const { data: updates } = await supabase
        .from("platform_incident_updates")
        .select("incident_id, status, message, created_at")
        .in("incident_id", incidentIds)
        .order("created_at", { ascending: false });

      if (updates) {
        for (const u of updates) {
          if (!updatesMap[u.incident_id]) updatesMap[u.incident_id] = [];
          updatesMap[u.incident_id].push(u);
        }
      }
    }

    // Build RSS XML
    const escapeXml = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    const severityLabel: Record<string, string> = {
      minor: "Menor",
      major: "Maior",
      critical: "Crítico",
    };

    const statusLabel: Record<string, string> = {
      investigating: "Investigando",
      identified: "Identificado",
      monitoring: "Monitorando",
      resolved: "Resolvido",
    };

    const items = (incidents || []).map((inc: any) => {
      const updates = updatesMap[inc.id] || [];
      const latestUpdate = updates[0];
      const description = latestUpdate
        ? `[${statusLabel[latestUpdate.status] || latestUpdate.status}] ${latestUpdate.message}`
        : `Incidente ${severityLabel[inc.severity] || inc.severity}: ${escapeXml(inc.title)}`;

      return `    <item>
      <title>${escapeXml(inc.title)}</title>
      <link>${siteUrl}/status</link>
      <guid isPermaLink="false">incident-${inc.id}</guid>
      <pubDate>${new Date(inc.created_at).toUTCString()}</pubDate>
      <category>${severityLabel[inc.severity] || inc.severity}</category>
      <description>${escapeXml(description)}</description>
    </item>`;
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Intentia — Status da Plataforma</title>
    <link>${siteUrl}/status</link>
    <description>Incidentes e atualizações de status da plataforma Intentia.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/status-rss" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>Intentia Status</title>
      <link>${siteUrl}/status</link>
    </image>
${items.join("\n")}
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("[status-rss] Error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>${err.message}</description></channel></rss>`,
      { status: 500, headers: { "Content-Type": "application/rss+xml" } }
    );
  }
});
