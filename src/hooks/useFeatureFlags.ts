import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// =====================================================
// TYPES
// =====================================================

export interface FeatureFlag {
  feature_key: string;
  feature_name: string;
  description: string | null;
  category: string;
  status: "active" | "disabled" | "development" | "maintenance" | "deprecated";
  status_message: string | null;
}

export interface PlanFeatureAccess {
  feature_key: string;
  is_enabled: boolean;
  usage_limit: number | null;
  limit_period: string | null;
}

export type FeatureStatus = "available" | "plan_blocked" | "disabled" | "development" | "maintenance" | "deprecated";

export interface FeatureCheck {
  available: boolean;
  status: FeatureStatus;
  message?: string;
}

// =====================================================
// HOOK
// =====================================================

export function useFeatureFlags() {
  const { user } = useAuth();
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [planAccess, setPlanAccess] = useState<PlanFeatureAccess[]>([]);
  const [userPlan, setUserPlan] = useState<string>("starter");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Load feature flags
      const { data: flags } = await (supabase as any)
        .from("feature_flags")
        .select("feature_key, feature_name, description, category, status, status_message");

      // Load user's plan
      const { data: tenant } = await (supabase as any)
        .from("tenant_settings")
        .select("plan")
        .eq("user_id", user.id)
        .single();

      const plan = tenant?.plan || "starter";
      setUserPlan(plan);

      // Load plan features for user's plan
      const { data: pf } = await (supabase as any)
        .from("plan_features")
        .select("feature_key, is_enabled, usage_limit, limit_period")
        .eq("plan", plan);

      if (flags) setFeatures(flags);
      if (pf) setPlanAccess(pf);
    } catch (err) {
      console.error("[feature-flags] Error loading:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build lookup maps
  const featureMap = useMemo(() => {
    const map = new Map<string, FeatureFlag>();
    for (const f of features) map.set(f.feature_key, f);
    return map;
  }, [features]);

  const planAccessMap = useMemo(() => {
    const map = new Map<string, PlanFeatureAccess>();
    for (const pa of planAccess) map.set(pa.feature_key, pa);
    return map;
  }, [planAccess]);

  /**
   * Check if a feature is available for the current user.
   * Returns { available, status, message }
   */
  const checkFeature = useCallback(
    (featureKey: string): FeatureCheck => {
      const flag = featureMap.get(featureKey);

      // Feature doesn't exist in flags — allow by default (backwards compat)
      if (!flag) return { available: true, status: "available" };

      // Check global status first
      if (flag.status === "disabled") {
        return { available: false, status: "disabled", message: "Recurso desativado." };
      }
      if (flag.status === "development") {
        return {
          available: false,
          status: "development",
          message: flag.status_message || "Recurso em desenvolvimento. Em breve!",
        };
      }
      if (flag.status === "maintenance") {
        return {
          available: false,
          status: "maintenance",
          message: flag.status_message || "Recurso em manutenção. Voltamos em breve.",
        };
      }
      if (flag.status === "deprecated") {
        return {
          available: false,
          status: "deprecated",
          message: flag.status_message || "Recurso descontinuado.",
        };
      }

      // Feature is active — check plan access
      const pa = planAccessMap.get(featureKey);
      if (pa && !pa.is_enabled) {
        return {
          available: false,
          status: "plan_blocked",
          message: `Disponível no plano Professional. Faça upgrade para desbloquear.`,
        };
      }

      return { available: true, status: "available" };
    },
    [featureMap, planAccessMap]
  );

  /**
   * Simple boolean check — is this feature available?
   */
  const isFeatureAvailable = useCallback(
    (featureKey: string): boolean => checkFeature(featureKey).available,
    [checkFeature]
  );

  return {
    features,
    userPlan,
    loading,
    checkFeature,
    isFeatureAvailable,
    refresh: loadData,
  };
}
