import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Verify user identity with their JWT
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabaseAuth.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    // Parse request body for action type
    const body = await req.json().catch(() => ({}));
    const action = body.action || "export"; // "export" | "create_backup" | "list_backups" | "download_backup"

    // Use service role client for data access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === "export") {
      // Direct export — collect all user data and return as JSON
      const data = await collectUserData(supabase, userId);

      return new Response(JSON.stringify(data, null, 2), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="intentia-backup-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    if (action === "create_backup") {
      // Create a server-side backup stored in user_data_backups
      const { data: backupId, error } = await supabase.rpc("create_user_backup", {
        _user_id: userId,
        _backup_type: "manual",
        _notes: body.notes || "Manual backup via export",
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, backup_id: backupId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "list_backups") {
      const { data: backups, error } = await supabase
        .from("user_data_backups")
        .select("id, backup_type, tables_included, record_counts, size_bytes, checksum, notes, created_at, expires_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ backups }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "download_backup") {
      const backupId = body.backup_id;
      if (!backupId) {
        return new Response(
          JSON.stringify({ error: "Missing backup_id" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: backup, error } = await supabase
        .from("user_data_backups")
        .select("backup_data, created_at")
        .eq("id", backupId)
        .eq("user_id", userId)
        .single();

      if (error || !backup) {
        return new Response(
          JSON.stringify({ error: "Backup not found or access denied" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const dateStr = new Date(backup.created_at).toISOString().split("T")[0];
      return new Response(JSON.stringify(backup.backup_data, null, 2), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="intentia-backup-${dateStr}.json"`,
        },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: export, create_backup, list_backups, download_backup" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function collectUserData(supabase: any, userId: string) {
  const tables = [
    { key: "tenant_settings", table: "tenant_settings" },
    { key: "projects", table: "projects", exclude: ["html_snapshot"] },
    { key: "project_channel_scores", table: "project_channel_scores" },
    { key: "insights", table: "insights" },
    { key: "audiences", table: "audiences" },
    { key: "benchmarks", table: "benchmarks" },
    { key: "notifications", table: "notifications" },
    { key: "tactical_plans", table: "tactical_plans" },
    { key: "tactical_channel_plans", table: "tactical_channel_plans" },
    { key: "copy_frameworks", table: "copy_frameworks" },
    { key: "segmentation_plans", table: "segmentation_plans" },
    { key: "testing_plans", table: "testing_plans" },
  ];

  const result: Record<string, any> = {
    version: "2.5.0",
    exported_at: new Date().toISOString(),
    user_id: userId,
    user_email: null,
  };

  // Get user email
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  if (userData?.user) {
    result.user_email = userData.user.email;
  }

  const counts: Record<string, number> = {};

  for (const t of tables) {
    const { data, error } = await supabase
      .from(t.table)
      .select("*")
      .eq("user_id", userId);

    if (error) {
      result[t.key] = [];
      counts[t.key] = 0;
      continue;
    }

    // Remove sensitive/large fields
    let cleaned = data || [];
    if (t.exclude) {
      cleaned = cleaned.map((row: any) => {
        const copy = { ...row };
        t.exclude!.forEach((field) => delete copy[field]);
        return copy;
      });
    }

    // Mask API keys
    if (t.key === "user_api_keys") {
      cleaned = cleaned.map((row: any) => ({
        ...row,
        api_key_encrypted: "***MASKED***",
      }));
    }

    result[t.key] = cleaned;
    counts[t.key] = cleaned.length;
  }

  // API keys separately (with masking)
  const { data: apiKeys } = await supabase
    .from("user_api_keys")
    .select("id, provider, preferred_model, is_active, last_validated_at, created_at")
    .eq("user_id", userId);

  result.user_api_keys = apiKeys || [];
  counts.user_api_keys = (apiKeys || []).length;

  result.record_counts = counts;

  return result;
}
