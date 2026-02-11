// =====================================================
// ADMIN API — Calls admin-api Edge Function with service_role
// Uses fetch directly (not supabase.functions.invoke) to avoid
// automatic JWT injection which fails when no Supabase user is logged in.
// =====================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/admin-api`;
const ADMIN_SESSION_KEY = "intentia_admin_session";

function getStoredAdminSession(): { admin: { id: string }; token: string; expires_at: number } | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expires_at) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
}

interface AdminApiResponse<T = any> {
  data?: T;
  error?: string;
  success?: boolean;
  admin?: any;
  can_login?: boolean;
  blocked?: boolean;
}

async function callAdminApi<T = any>(
  action: string,
  params: Record<string, any> = {},
  requireAuth = true
): Promise<AdminApiResponse<T>> {
  const headers: Record<string, string> = {};

  if (requireAuth) {
    const session = getStoredAdminSession();
    if (!session) {
      return { error: "Sessão admin expirada. Faça login novamente." };
    }
    headers["x-admin-token"] = session.token;
    params.admin_id = session.admin.id;
  }

  try {
    const fetchHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      ...headers,
    };

    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: fetchHeaders,
      body: JSON.stringify({ action, ...params }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errMsg = data?.error || response.statusText || "Erro na operação.";
      console.error(`[adminApi] ${action} error (${response.status}):`, errMsg);
      return { error: errMsg };
    }

    if (data?.error) {
      return { error: data.error };
    }

    return data;
  } catch (err: any) {
    console.error(`[adminApi] ${action} fetch error:`, err);
    return { error: err.message || "Erro de conexão." };
  }
}

// =====================================================
// AUTH
// =====================================================

export async function adminApiLogin(cnpj: string, passwordHash: string) {
  return callAdminApi("admin_login", { cnpj, password_hash: passwordHash }, false);
}

export async function adminApiCheckLoginAttempts(cnpj: string) {
  return callAdminApi("check_login_attempts", { cnpj }, false);
}

// =====================================================
// SERVICES
// =====================================================

export async function adminListServices() {
  return callAdminApi("list_services");
}

export async function adminCreateService(service: Record<string, any>) {
  return callAdminApi("create_service", { service });
}

export async function adminUpdateService(id: string, updates: Record<string, any>) {
  return callAdminApi("update_service", { id, updates });
}

export async function adminDeleteService(id: string) {
  return callAdminApi("delete_service", { id });
}

// =====================================================
// INCIDENTS
// =====================================================

export async function adminListIncidents() {
  return callAdminApi("list_incidents");
}

export async function adminCreateIncident(incident: Record<string, any>) {
  return callAdminApi("create_incident", { incident });
}

export async function adminUpdateIncident(id: string, updates: Record<string, any>) {
  return callAdminApi("update_incident", { id, updates });
}

export async function adminDeleteIncident(id: string) {
  return callAdminApi("delete_incident", { id });
}

export async function adminListIncidentUpdates(incidentId: string) {
  return callAdminApi("list_incident_updates", { incident_id: incidentId });
}

export async function adminAddIncidentUpdate(incidentId: string, status: string, message: string) {
  return callAdminApi("add_incident_update", { incident_id: incidentId, status, message });
}

// =====================================================
// FEATURE FLAGS
// =====================================================

export async function adminListFeatures() {
  return callAdminApi("list_features");
}

export async function adminUpdateFeatureStatus(featureKey: string, status: string) {
  return callAdminApi("update_feature_status", { feature_key: featureKey, status });
}

export async function adminUpdateFeatureMessage(featureKey: string, message: string | null) {
  return callAdminApi("update_feature_message", { feature_key: featureKey, message });
}

// =====================================================
// PLAN FEATURES
// =====================================================

export async function adminListPlanFeatures() {
  return callAdminApi("list_plan_features");
}

export async function adminTogglePlanFeature(featureKey: string, plan: string, isEnabled: boolean) {
  return callAdminApi("toggle_plan_feature", { feature_key: featureKey, plan, is_enabled: isEnabled });
}

export async function adminUpdatePlanLimit(featureKey: string, plan: string, usageLimit: number | null, limitPeriod: string | null) {
  return callAdminApi("update_plan_limit", { feature_key: featureKey, plan, usage_limit: usageLimit, limit_period: limitPeriod });
}

// =====================================================
// USERS / TENANT
// =====================================================

export async function adminListUsers() {
  return callAdminApi("list_users");
}

export async function adminUpdateUserPlan(userId: string, newPlan: string, adminCnpj: string) {
  return callAdminApi("update_user_plan", { user_id: userId, new_plan: newPlan, admin_cnpj: adminCnpj });
}

export async function adminUpdateUserLimits(userId: string, field: string, value: number) {
  return callAdminApi("update_user_limits", { user_id: userId, field, value });
}

// =====================================================
// USER FEATURE OVERRIDES
// =====================================================

export async function adminListOverrides() {
  return callAdminApi("list_overrides");
}

export async function adminUpsertOverride(userId: string, featureKey: string, isEnabled: boolean, reason: string) {
  return callAdminApi("upsert_override", { user_id: userId, feature_key: featureKey, is_enabled: isEnabled, reason });
}

export async function adminDeleteOverride(userId: string, featureKey: string) {
  return callAdminApi("delete_override", { user_id: userId, feature_key: featureKey });
}

// =====================================================
// MAINTENANCES
// =====================================================

export async function adminListMaintenances() {
  return callAdminApi("list_maintenances");
}

export async function adminCreateMaintenance(maintenance: Record<string, any>) {
  return callAdminApi("create_maintenance", { maintenance });
}

export async function adminUpdateMaintenance(id: string, updates: Record<string, any>) {
  return callAdminApi("update_maintenance", { id, updates });
}

export async function adminDeleteMaintenance(id: string) {
  return callAdminApi("delete_maintenance", { id });
}
