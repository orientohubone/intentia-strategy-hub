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
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const [state, setState] = useState<{
    features: FeatureFlag[];
    planAccess: PlanFeatureAccess[];
    userOverrides: UserFeatureOverride[];
    userPlan: string;
    loading: boolean;
  }>({
    features: [],
    planAccess: [],
    userOverrides: [],
    userPlan: "starter",
    loading: true,
  });

  const { features, planAccess, userOverrides, userPlan, loading } = state;

  const applyState = useCallback((next: FeatureFlagsState) => {
    setState({
      features: next.features,
      planAccess: next.planAccess,
      userOverrides: next.userOverrides,
      userPlan: next.userPlan,
      loading: false,
    });
  }, []);

  const loadData = useCallback(async (options?: { force?: boolean; silent?: boolean }) => {
    if (!userId) return;

    const force = !!options?.force;
    const silent = !!options?.silent;
    const cached = featureFlagsCache.get(userId);
    const isCacheFresh = !!cached && (Date.now() - cached.fetchedAt < CACHE_TTL_MS);

    if (!force && cached && isCacheFresh) {
      applyState(cached);
      return;
    }

    if (!silent && !cached) {
      setState(prev => ({ ...prev, loading: true }));
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
    } catch (err: any) {
      console.error("[feature-flags] Error loading:", err?.message || "Unknown error");
      setState(prev => ({ ...prev, loading: false }));
    } finally {
      featureFlagsInFlight.delete(userId);
    }
  }, [applyState, userId]);

  useEffect(() => {
    if (!userId) {
      if (!authLoading) {
        setState({
          features: [],
          planAccess: [],
          userOverrides: [],
          userPlan: "starter",
          loading: false,
        });
      }
      return;
    }

    const cached = featureFlagsCache.get(userId);
    if (cached) {
      applyState(cached);
      void loadData({ silent: true });
      return;
    }

    void loadData();
  }, [applyState, loadData, userId, authLoading]);

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
      const override = overrideMap.get(featureKey);

      // Feature doesn't exist in flags — block by default if loading, allow for backwards compat if loaded
      if (!flag) {
        return {
          available: !loading,
          status: loading ? "development" : "available"
        };
      }

      // "disabled" is an absolute block — no override can bypass it
      if (flag.status === "disabled") {
        return { available: false, status: "disabled", message: "Recurso desativado." };
      }

      // NOVO: Status de desenvolvimento/manutenção tem precedência sobre o override
      // para garantir que a tela de "Em desenvolvimento" apareça mesmo para admins
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

      // Check per-user override (allows bypassing plan restrictions)
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
    [featureMap, planAccessMap, overrideMap, loading]
  );

  /**
   * Simple boolean check — is this feature available?
   */
  const isFeatureAvailable = useCallback(
    (featureKey: string): boolean => checkFeature(featureKey).available,
    [checkFeature]
  );

  /**
   * Determine if a feature should be visible in navigation
   * Priority: Always show if active, OR if user has an override (even if blocked by status)
   */
  const shouldShowInSidebar = useCallback(
    (featureKey: string): boolean => {
      const flag = featureMap.get(featureKey);
      const override = overrideMap.get(featureKey);

      if (!flag) return true; // Default to visible for unknown features
      if (flag.status === "active") return true;
      if (flag.status === "disabled") return !!override; // Only show disabled features if user has override

      // For development/maintenance/deprecated: show if user has override
      return !!override;
    },
    [featureMap, overrideMap]
  );

  return {
    features,
    userPlan,
    loading: loading || authLoading,
    checkFeature,
    isFeatureAvailable,
    shouldShowInSidebar,
    refresh: () => loadData({ force: true }),
  };
}
