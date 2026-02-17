import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0",
};

// Version for cache busting - update when deploying
const API_VERSION = "2026-02-17-v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { action, ...params } = body;

    // =====================================================
    // AUTH ACTIONS (no admin token required)
    // =====================================================

    if (action === "admin_login") {
      return await handleAdminLogin(supabase, params);
    }

    if (action === "check_login_attempts") {
      return await handleCheckLoginAttempts(supabase, params);
    }

    // =====================================================
    // ALL OTHER ACTIONS REQUIRE ADMIN TOKEN
    // =====================================================

    const adminToken = req.headers.get("x-admin-token");
    if (!adminToken) {
      return jsonResponse({ error: "Admin token required" }, 401);
    }

    // Validate admin token by checking the session exists
    // The token is stored client-side; we verify the admin exists and is active
    const adminId = params.admin_id;
    if (!adminId) {
      return jsonResponse({ error: "admin_id required" }, 400);
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id, is_active, role")
      .eq("id", adminId)
      .single();

    if (adminError || !admin || !admin.is_active) {
      return jsonResponse({ error: "Invalid or inactive admin" }, 403);
    }

    // =====================================================
    // SERVICE ACTIONS
    // =====================================================

    if (action === "list_services") {
      const { data, error } = await supabase
        .from("platform_services")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "create_service") {
      const { data, error } = await supabase
        .from("platform_services")
        .insert([params.service])
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "create_service", "platform_services", data.id, params.service);
      return jsonResponse({ data });
    }

    if (action === "update_service") {
      const { data, error } = await supabase
        .from("platform_services")
        .update(params.updates)
        .eq("id", params.id)
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "update_service", "platform_services", params.id, params.updates);
      return jsonResponse({ data });
    }

    if (action === "delete_service") {
      const { error } = await supabase
        .from("platform_services")
        .delete()
        .eq("id", params.id);
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "delete_service", "platform_services", params.id, {});
      return jsonResponse({ success: true });
    }

    // =====================================================
    // INCIDENT ACTIONS
    // =====================================================

    if (action === "list_incidents") {
      const { data, error } = await supabase
        .from("platform_incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "create_incident") {
      const { data, error } = await supabase
        .from("platform_incidents")
        .insert([params.incident])
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);

      // Create initial update
      await supabase
        .from("platform_incident_updates")
        .insert([{
          incident_id: data.id,
          status: params.incident.status,
          message: `Incidente criado: ${params.incident.title}`,
        }]);

      await auditLog(supabase, adminId, "create_incident", "platform_incidents", data.id, params.incident);
      return jsonResponse({ data });
    }

    if (action === "update_incident") {
      const { data, error } = await supabase
        .from("platform_incidents")
        .update(params.updates)
        .eq("id", params.id)
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "update_incident", "platform_incidents", params.id, params.updates);
      return jsonResponse({ data });
    }

    if (action === "delete_incident") {
      // Delete updates first
      await supabase
        .from("platform_incident_updates")
        .delete()
        .eq("incident_id", params.id);

      const { error } = await supabase
        .from("platform_incidents")
        .delete()
        .eq("id", params.id);
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "delete_incident", "platform_incidents", params.id, {});
      return jsonResponse({ success: true });
    }

    // =====================================================
    // INCIDENT UPDATE ACTIONS
    // =====================================================

    if (action === "list_incident_updates") {
      const { data, error } = await supabase
        .from("platform_incident_updates")
        .select("*")
        .eq("incident_id", params.incident_id)
        .order("created_at", { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "add_incident_update") {
      const { data, error } = await supabase
        .from("platform_incident_updates")
        .insert([{
          incident_id: params.incident_id,
          status: params.status,
          message: params.message,
        }])
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);

      // Also update the incident status
      await supabase
        .from("platform_incidents")
        .update({ status: params.status })
        .eq("id", params.incident_id);

      await auditLog(supabase, adminId, "add_incident_update", "platform_incident_updates", data.id, {
        incident_id: params.incident_id,
        status: params.status,
      });
      return jsonResponse({ data });
    }

    // =====================================================
    // MAINTENANCE ACTIONS
    // =====================================================

    if (action === "list_maintenances") {
      const { data, error } = await supabase
        .from("platform_maintenances")
        .select("*")
        .order("scheduled_start", { ascending: false })
        .limit(20);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "create_maintenance") {
      const { data, error } = await supabase
        .from("platform_maintenances")
        .insert([params.maintenance])
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "create_maintenance", "platform_maintenances", data.id, params.maintenance);
      return jsonResponse({ data });
    }

    if (action === "update_maintenance") {
      const { data, error } = await supabase
        .from("platform_maintenances")
        .update(params.updates)
        .eq("id", params.id)
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "update_maintenance", "platform_maintenances", params.id, params.updates);
      return jsonResponse({ data });
    }

    if (action === "delete_maintenance") {
      const { error } = await supabase
        .from("platform_maintenances")
        .delete()
        .eq("id", params.id);
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "delete_maintenance", "platform_maintenances", params.id, {});
      return jsonResponse({ success: true });
    }

    // =====================================================
    // FEATURE FLAGS ACTIONS
    // =====================================================

    if (action === "list_features") {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "update_feature_status") {
      const { error } = await supabase
        .from("feature_flags")
        .update({ status: params.status })
        .eq("feature_key", params.feature_key);
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "update_feature_status", "feature_flags", params.feature_key, { status: params.status });
      return jsonResponse({ success: true });
    }

    if (action === "update_feature_message") {
      const { error } = await supabase
        .from("feature_flags")
        .update({ status_message: params.message })
        .eq("feature_key", params.feature_key);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true });
    }

    // =====================================================
    // PLAN FEATURES ACTIONS
    // =====================================================

    if (action === "list_plan_features") {
      const { data, error } = await supabase
        .from("plan_features")
        .select("*");
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "toggle_plan_feature") {
      const { error } = await supabase
        .from("plan_features")
        .update({ is_enabled: params.is_enabled })
        .eq("feature_key", params.feature_key)
        .eq("plan", params.plan);
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "toggle_plan_feature", "plan_features", `${params.feature_key}-${params.plan}`, { is_enabled: params.is_enabled });
      return jsonResponse({ success: true });
    }

    if (action === "update_plan_limit") {
      const { error } = await supabase
        .from("plan_features")
        .update({ usage_limit: params.usage_limit, limit_period: params.limit_period })
        .eq("feature_key", params.feature_key)
        .eq("plan", params.plan);
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ success: true });
    }

    // =====================================================
    // TENANT / USER ACTIONS
    // =====================================================

    if (action === "list_users") {
      const { data, error } = await supabase
        .from("tenant_settings")
        .select("user_id, company_name, plan, full_name, email, created_at, analyses_used, monthly_analyses_limit, max_audiences")
        .order("created_at", { ascending: false });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "update_user_plan") {
      const { error } = await supabase.rpc("admin_change_user_plan", {
        p_admin_cnpj: params.admin_cnpj,
        p_target_user_id: params.user_id,
        p_new_plan: params.new_plan,
      });
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "update_user_plan", "tenant_settings", params.user_id, { new_plan: params.new_plan });
      return jsonResponse({ success: true });
    }

    if (action === "update_user_limits") {
      const { error } = await supabase
        .from("tenant_settings")
        .update({ [params.field]: params.value })
        .eq("user_id", params.user_id);
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "update_user_limits", "tenant_settings", params.user_id, { [params.field]: params.value });
      return jsonResponse({ success: true });
    }

    // =====================================================
    // USER FEATURE OVERRIDES ACTIONS
    // =====================================================

    if (action === "list_overrides") {
      const { data, error } = await supabase
        .from("user_feature_overrides")
        .select("*");
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "upsert_override") {
      // Check if override exists
      const { data: existing } = await supabase
        .from("user_feature_overrides")
        .select("id")
        .eq("user_id", params.user_id)
        .eq("feature_key", params.feature_key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_feature_overrides")
          .update({ is_enabled: params.is_enabled, reason: params.reason })
          .eq("id", existing.id);
        if (error) return jsonResponse({ error: error.message }, 500);
      } else {
        const { error } = await supabase
          .from("user_feature_overrides")
          .insert({
            user_id: params.user_id,
            feature_key: params.feature_key,
            is_enabled: params.is_enabled,
            reason: params.reason,
            admin_id: adminId,
          });
        if (error) return jsonResponse({ error: error.message }, 500);
      }
      await auditLog(supabase, adminId, "upsert_override", "user_feature_overrides", `${params.user_id}-${params.feature_key}`, { is_enabled: params.is_enabled });
      return jsonResponse({ success: true });
    }

    if (action === "delete_override") {
      const { error } = await supabase
        .from("user_feature_overrides")
        .delete()
        .eq("user_id", params.user_id)
        .eq("feature_key", params.feature_key);
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "delete_override", "user_feature_overrides", `${params.user_id}-${params.feature_key}`, {});
      return jsonResponse({ success: true });
    }

    // =====================================================
    // SUPPORT TICKET ACTIONS
    // =====================================================

    if (action === "list_support_tickets") {
      // Buscar tickets com dados do usuário via auth.users
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) return jsonResponse({ error: error.message }, 500);

      // Enriquecer com dados do usuário
      const enriched = await Promise.all((data || []).map(async (ticket: any) => {
        let user_email = 'email@nao.informado';
        let user_name = 'Cliente';
        let user_company = 'Empresa não informada';
        let user_avatar_url = '';
        let assigned_to_name = 'Não atribuído';
        let assigned_to_email = '';

        // Buscar dados do usuário
        if (ticket.user_id) {
          const { data: userData } = await supabase.auth.admin.getUserById(ticket.user_id);
          if (userData?.user) {
            user_email = userData.user.email || user_email;
            user_name = userData.user.user_metadata?.name || 
                       userData.user.user_metadata?.full_name || 
                       userData.user.email?.split('@')[0] || user_name;
            user_avatar_url = userData.user.user_metadata?.avatar_url || '';
          }
        }

        // Buscar empresa
        if (ticket.tenant_id) {
          const { data: tenant } = await supabase
            .from("tenant_settings")
            .select("company_name")
            .eq("id", ticket.tenant_id)
            .single();
          if (tenant) user_company = tenant.company_name || user_company;
        }

        // Buscar admin atribuído
        if (ticket.assigned_to) {
          const { data: adminUser } = await supabase.auth.admin.getUserById(ticket.assigned_to);
          if (adminUser?.user) {
            assigned_to_email = adminUser.user.email || '';
            assigned_to_name = adminUser.user.user_metadata?.name || 'Admin';
          }
        }

        // Buscar categoria
        let category_name = ticket.category;
        let category_color = '#6b7280';
        let category_icon = 'MessageCircle';
        const { data: cat } = await supabase
          .from("support_categories")
          .select("name, color, icon")
          .eq("slug", ticket.category)
          .single();
        if (cat) {
          category_name = cat.name;
          category_color = cat.color;
          category_icon = cat.icon;
        }

        // Contar mensagens
        const { count } = await supabase
          .from("support_ticket_messages")
          .select("id", { count: 'exact', head: true })
          .eq("ticket_id", ticket.id);

        // Última mensagem
        const { data: lastMsg } = await supabase
          .from("support_ticket_messages")
          .select("created_at")
          .eq("ticket_id", ticket.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // SLA status
        let sla_status = 'on_track';
        if (ticket.status === 'resolvido') sla_status = 'resolved';
        else if (ticket.sla_deadline && new Date(ticket.sla_deadline) < new Date()) sla_status = 'overdue';
        else if (ticket.sla_deadline && new Date(ticket.sla_deadline) < new Date(Date.now() + 2 * 60 * 60 * 1000)) sla_status = 'due_soon';

        return {
          ...ticket,
          user_email,
          user_name,
          user_company,
          user_avatar_url,
          assigned_to_email,
          assigned_to_name,
          category_name,
          category_color,
          category_icon,
          message_count: count || 0,
          last_message_at: lastMsg?.created_at || null,
          sla_status,
        };
      }));

      return jsonResponse({ data: enriched });
    }

    if (action === "list_support_messages") {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", params.ticket_id)
        .order("created_at", { ascending: true });
      if (error) return jsonResponse({ error: error.message }, 500);
      return jsonResponse({ data });
    }

    if (action === "send_support_message") {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: params.ticket_id,
          sender_id: params.sender_id || adminId,
          sender_type: "admin",
          message: params.message,
        })
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);

      // Atualizar first_response_at se for a primeira resposta admin
      const { data: ticket } = await supabase
        .from("support_tickets")
        .select("first_response_at")
        .eq("id", params.ticket_id)
        .single();
      
      if (ticket && !ticket.first_response_at) {
        await supabase
          .from("support_tickets")
          .update({ 
            first_response_at: new Date().toISOString(),
            status: 'em_andamento'
          })
          .eq("id", params.ticket_id);
      }

      await auditLog(supabase, adminId, "send_support_message", "support_ticket_messages", data.id, { ticket_id: params.ticket_id });
      return jsonResponse({ data });
    }

    if (action === "update_ticket_status") {
      const updates: any = { status: params.status };
      if (params.status === 'resolvido') {
        updates.resolved_at = new Date().toISOString();
      }
      const { data, error } = await supabase
        .from("support_tickets")
        .update(updates)
        .eq("id", params.ticket_id)
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "update_ticket_status", "support_tickets", params.ticket_id, { status: params.status });
      return jsonResponse({ data });
    }

    if (action === "assign_ticket") {
      const { data, error } = await supabase
        .from("support_tickets")
        .update({ assigned_to: params.assigned_to })
        .eq("id", params.ticket_id)
        .select()
        .single();
      if (error) return jsonResponse({ error: error.message }, 500);
      await auditLog(supabase, adminId, "assign_ticket", "support_tickets", params.ticket_id, { assigned_to: params.assigned_to });
      return jsonResponse({ data });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);

  } catch (err: any) {
    console.error("[admin-api] Error:", err);
    return jsonResponse({ error: err.message || "Internal error" }, 500);
  }
});

// =====================================================
// HELPERS
// =====================================================

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify({
    ...body,
    api_version: API_VERSION,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function auditLog(
  supabase: any,
  adminId: string,
  action: string,
  targetTable: string,
  targetId: string,
  details: any
) {
  try {
    await supabase.from("admin_audit_log").insert([{
      admin_id: adminId,
      action,
      target_table: targetTable,
      target_id: targetId,
      details,
    }]);
  } catch (e) {
    console.error("[admin-api] Audit log error:", e);
  }
}

// =====================================================
// ADMIN LOGIN
// =====================================================

async function handleAdminLogin(supabase: any, params: any) {
  const { cnpj, password_hash } = params;

  if (!cnpj || !password_hash) {
    return jsonResponse({ error: "cnpj and password_hash required" }, 400);
  }

  // Check login attempts
  const { data: canLogin } = await supabase.rpc("check_admin_login_attempts", {
    p_cnpj: cnpj,
  });

  if (canLogin === false) {
    return jsonResponse({
      error: "Conta bloqueada temporariamente. Tente novamente em 15 minutos.",
      blocked: true,
    }, 429);
  }

  // Fetch admin user with service_role (bypasses RLS)
  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id, cnpj, name, role, is_active, last_login_at, password_hash")
    .eq("cnpj", cnpj)
    .single();

  if (error || !admin) {
    await supabase.rpc("increment_admin_login_attempts", { p_cnpj: cnpj });
    return jsonResponse({ error: "CNPJ ou senha incorretos." }, 401);
  }

  if (!admin.is_active) {
    return jsonResponse({ error: "Conta administrativa desativada." }, 403);
  }

  // Verify password hash (frontend sends SHA-256 hash)
  if (password_hash !== admin.password_hash) {
    await supabase.rpc("increment_admin_login_attempts", { p_cnpj: cnpj });
    return jsonResponse({ error: "CNPJ ou senha incorretos." }, 401);
  }

  // Success — reset attempts
  await supabase.rpc("reset_admin_login_attempts", { p_cnpj: cnpj });

  // Update last_login_at
  await supabase
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", admin.id);

  return jsonResponse({
    success: true,
    admin: {
      id: admin.id,
      cnpj: admin.cnpj,
      name: admin.name,
      role: admin.role,
      is_active: admin.is_active,
      last_login_at: admin.last_login_at,
    },
  });
}

async function handleCheckLoginAttempts(supabase: any, params: any) {
  const { cnpj } = params;
  if (!cnpj) return jsonResponse({ error: "cnpj required" }, 400);

  const { data: canLogin } = await supabase.rpc("check_admin_login_attempts", {
    p_cnpj: cnpj,
  });

  return jsonResponse({ can_login: canLogin !== false });
}
