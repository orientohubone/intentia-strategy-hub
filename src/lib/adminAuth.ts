import { adminApiLogin } from "./adminApi";

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
    // Hash password client-side before sending to Edge Function
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Call Edge Function (uses service_role — bypasses RLS)
    const result = await adminApiLogin(cleanedCnpj, passwordHash);

    if (result.error) {
      return { success: false, error: result.error };
    }

    if (!result.success || !result.admin) {
      return { success: false, error: "Erro inesperado no login." };
    }

    const adminUser: AdminUser = {
      id: result.admin.id,
      cnpj: result.admin.cnpj,
      name: result.admin.name,
      role: result.admin.role,
      is_active: result.admin.is_active,
      last_login_at: result.admin.last_login_at,
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
