import { supabase } from "@/integrations/supabase/client";

// =====================================================
// ADMIN AUTH — CNPJ + Password authentication
// Separate from Supabase Auth (user auth)
// =====================================================

export interface AdminUser {
  id: string;
  cnpj: string;
  name: string;
  role: "founder" | "admin" | "support";
  is_active: boolean;
  last_login_at: string | null;
}

export interface AdminSession {
  admin: AdminUser;
  token: string;
  expires_at: number;
}

const ADMIN_SESSION_KEY = "intentia_admin_session";
const SESSION_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

// =====================================================
// CNPJ FORMATTING
// =====================================================

export function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function cleanCnpj(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

export function isValidCnpj(cnpj: string): boolean {
  const digits = cleanCnpj(cnpj);
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validate check digits
  const calc = (str: string, weights: number[]) =>
    str.split("").reduce((sum, d, i) => sum + parseInt(d) * weights[i], 0);

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calc(digits.slice(0, 12), w1) % 11;
  const check1 = d1 < 2 ? 0 : 11 - d1;
  if (parseInt(digits[12]) !== check1) return false;

  const d2 = calc(digits.slice(0, 13), w2) % 11;
  const check2 = d2 < 2 ? 0 : 11 - d2;
  if (parseInt(digits[13]) !== check2) return false;

  return true;
}

// =====================================================
// SESSION MANAGEMENT
// =====================================================

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session: AdminSession = JSON.parse(raw);
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

function setAdminSession(admin: AdminUser): AdminSession {
  const session: AdminSession = {
    admin,
    token: generateToken(),
    expires_at: Date.now() + SESSION_DURATION_MS,
  };
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

// =====================================================
// LOGIN
// =====================================================

export interface AdminLoginResult {
  success: boolean;
  error?: string;
  session?: AdminSession;
}

export async function adminLogin(cnpj: string, password: string): Promise<AdminLoginResult> {
  const cleanedCnpj = cleanCnpj(cnpj);

  if (!isValidCnpj(cleanedCnpj)) {
    return { success: false, error: "CNPJ inválido." };
  }

  try {
    // Check login attempts via RPC
    const { data: canLogin } = await (supabase as any).rpc("check_admin_login_attempts", {
      p_cnpj: cleanedCnpj,
    });

    if (canLogin === false) {
      return {
        success: false,
        error: "Conta bloqueada temporariamente. Tente novamente em 15 minutos.",
      };
    }

    // Fetch admin user (service role would be ideal, but we use anon + RPC for security)
    const { data: admin, error } = await (supabase as any)
      .from("admin_users")
      .select("id, cnpj, name, role, is_active, last_login_at, password_hash")
      .eq("cnpj", cleanedCnpj)
      .single();

    if (error || !admin) {
      // Increment attempts even if user not found (prevent enumeration)
      await (supabase as any).rpc("increment_admin_login_attempts", { p_cnpj: cleanedCnpj });
      return { success: false, error: "CNPJ ou senha incorretos." };
    }

    if (!admin.is_active) {
      return { success: false, error: "Conta administrativa desativada." };
    }

    // Verify password — simple comparison with SHA-256 hash
    // In production, use bcrypt via Edge Function
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (hashHex !== admin.password_hash) {
      await (supabase as any).rpc("increment_admin_login_attempts", { p_cnpj: cleanedCnpj });
      return { success: false, error: "CNPJ ou senha incorretos." };
    }

    // Success — reset attempts and create session
    await (supabase as any).rpc("reset_admin_login_attempts", { p_cnpj: cleanedCnpj });

    const adminUser: AdminUser = {
      id: admin.id,
      cnpj: admin.cnpj,
      name: admin.name,
      role: admin.role,
      is_active: admin.is_active,
      last_login_at: admin.last_login_at,
    };

    const session = setAdminSession(adminUser);
    return { success: true, session };
  } catch (err: any) {
    console.error("[admin-auth] Login error:", err);
    return { success: false, error: "Erro interno. Tente novamente." };
  }
}

export function adminLogout(): void {
  clearAdminSession();
}
