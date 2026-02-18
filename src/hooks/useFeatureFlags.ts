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

export interface UserFeatureOverride {
  feature_key: string;
  is_enabled: boolean;
  reason: string | null;
}

export type FeatureStatus = "available" | "plan_blocked" | "disabled" | "development" | "maintenance" | "deprecated";

export interface FeatureCheck {
  available: boolean;
  status: FeatureStatus;
  message?: string;
}

type FeatureFlagsState = {
  features: FeatureFlag[];
  planAccess: PlanFeatureAccess[];
  userOverrides: UserFeatureOverride[];
  userPlan: string;
  fetchedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const featureFlagsCache = new Map<string, FeatureFlagsState>();
const featureFlagsInFlight = new Map<string, Promise<FeatureFlagsState>>();

// =====================================================
// HOOK
// =====================================================

export function useFeatureFlags() {
  const { user } = useAuth();
  const userId = user?.id;
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [planAccess, setPlanAccess] = useState<PlanFeatureAccess[]>([]);
  const [userOverrides, setUserOverrides] = useState<UserFeatureOverride[]>([]);
  const [userPlan, setUserPlan] = useState<string>("starter");
  const [loading, setLoading] = useState(true);

  const applyState = useCallback((state: FeatureFlagsState) => {
    setFeatures(state.features);
    setPlanAccess(state.planAccess);
    setUserOverrides(state.userOverrides);
    setUserPlan(state.userPlan);
  }, []);

  const loadData = useCallback(async (options?: { force?: boolean; silent?: boolean }) => {
    if (!userId) return;

    const force = !!options?.force;
    const silent = !!options?.silent;
    const cached = featureFlagsCache.get(userId);
    const isCacheFresh = !!cached && (Date.now() - cached.fetchedAt < CACHE_TTL_MS);

    if (!force && cached && isCacheFresh) {
      applyState(cached);
      if (!silent) setLoading(false);
      return;
    }

    if (!silent && !cached) {
      setLoading(true);
    }

    try {
      let request = featureFlagsInFlight.get(userId);
      if (!request || force) {
        request = (async () => {
          const [flagsRes, tenantRes, overridesRes] = await Promise.all([
            (supabase as any)
              .from("feature_flags")
              .select("feature_key, feature_name, description, category, status, status_message"),
            (supabase as any)
              .from("tenant_settings")
              .select("plan")
              .eq("user_id", userId)
              .single(),
            (supabase as any)
              .from("user_feature_overrides")
              .select("feature_key, is_enabled, reason")
              .eq("user_id", userId),
          ]);

          const plan = tenantRes?.data?.plan || "starter";
          const { data: pf } = await (supabase as any)
            .from("plan_features")
            .select("feature_key, is_enabled, usage_limit, limit_period")
            .eq("plan", plan);

          return {
            features: flagsRes?.data || [],
            planAccess: pf || [],
            userOverrides: overridesRes?.data || [],
            userPlan: plan,
            fetchedAt: Date.now(),
          } as FeatureFlagsState;
        })();
        featureFlagsInFlight.set(userId, request);
      }

      const next = await request;
      featureFlagsCache.set(userId, next);
      applyState(next);
    } catch (err) {
      console.error("[feature-flags] Error loading:", err);
    } finally {
      featureFlagsInFlight.delete(userId);
      setLoading(false);
    }
  }, [applyState, userId]);

  useEffect(() => {
    if (!userId) {
      setFeatures([]);
      setPlanAccess([]);
      setUserOverrides([]);
      setUserPlan("starter");
      setLoading(false);
      return;
    }

    const cached = featureFlagsCache.get(userId);
    if (cached) {
      applyState(cached);
      setLoading(false);
      void loadData({ silent: true });
      return;
    }

    void loadData();
  }, [applyState, loadData, userId]);

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

  const overrideMap = useMemo(() => {
    const map = new Map<string, UserFeatureOverride>();
    for (const o of userOverrides) map.set(o.feature_key, o);
    return map;
  }, [userOverrides]);

  /**
   * Check if a feature is available for the current user.
   * Priority: disabled (absolute block) → user override → global status → plan access
   * Returns { available, status, message }
   */
  const checkFeature = useCallback(
    (featureKey: string): FeatureCheck => {
      const flag = featureMap.get(featureKey);

      // Feature doesn't exist in flags — allow by default (backwards compat)
      if (!flag) return { available: true, status: "available" };

      // "disabled" is an absolute block — no override can bypass it
      if (flag.status === "disabled") {
        return { available: false, status: "disabled", message: "Recurso desativado." };
      }

      // Check per-user override BEFORE global status (allows admin to grant
      // access to specific users even when feature is in development/maintenance)
      const override = overrideMap.get(featureKey);
      if (override) {
        if (override.is_enabled) {
          return { available: true, status: "available" };
        } else {
          return {
            available: false,
            status: "plan_blocked",
            message: "Esse recurso faz parte do plano Professional. Faça upgrade e desbloqueie ferramentas avançadas de estratégia e execução.",
          };
        }
      }

      // No override — check global status
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
          message: "Esse recurso faz parte do plano Professional. Faça upgrade e desbloqueie ferramentas avançadas de estratégia e execução.",
        };
      }

      return { available: true, status: "available" };
    },
    [featureMap, planAccessMap, overrideMap]
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
    refresh: () => loadData({ force: true }),
  };
}
