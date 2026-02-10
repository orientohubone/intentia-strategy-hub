import { useState, useEffect, useCallback } from "react";
import type { AdminSession, AdminUser } from "@/lib/adminAuth";
import { getAdminSession, clearAdminSession } from "@/lib/adminAuth";

export function useAdminAuth() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(() => {
    const s = getAdminSession();
    setSession(s);
    setAdmin(s?.admin ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    checkSession();

    // Re-check session every 60 seconds (for expiry)
    const interval = setInterval(checkSession, 60_000);
    return () => clearInterval(interval);
  }, [checkSession]);

  const logout = useCallback(() => {
    clearAdminSession();
    setSession(null);
    setAdmin(null);
  }, []);

  const refresh = useCallback(() => {
    checkSession();
  }, [checkSession]);

  return {
    admin,
    session,
    loading,
    isAuthenticated: !!session,
    logout,
    refresh,
  };
}
