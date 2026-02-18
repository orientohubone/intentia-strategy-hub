import { ReactNode } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureBlockedScreen } from "@/components/FeatureBlockedScreen";
import { Skeleton } from "@/components/ui/skeleton";

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  withLayout?: boolean;
  /** Page title shown in the fallback */
  pageTitle?: string;
  /** When true, shows blocked screen immediately while flags are still loading */
  blockWhileLoading?: boolean;
  /** Optional message used when blockWhileLoading is enabled */
  loadingBlockMessage?: string;
}

export function FeatureGate({
  featureKey,
  children,
  withLayout = true,
  pageTitle,
  blockWhileLoading = false,
  loadingBlockMessage,
}: FeatureGateProps) {
  const { checkFeature, loading } = useFeatureFlags();

  if (loading) {
    if (blockWhileLoading) {
      const optimisticBlock = {
        available: false,
        status: "plan_blocked" as const,
        message:
          loadingBlockMessage ||
          "Esse recurso faz parte do plano Professional. Faça upgrade e desbloqueie ferramentas avançadas.",
      };

      if (withLayout) {
        return (
          <DashboardLayout>
            <FeatureBlockedScreen check={optimisticBlock} pageTitle={pageTitle} />
          </DashboardLayout>
        );
      }
      return <FeatureBlockedScreen check={optimisticBlock} pageTitle={pageTitle} />;
    }

    if (withLayout) {
      return (
        <DashboardLayout>
          <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              <Skeleton className="h-24 rounded-xl lg:col-span-2" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
            <Skeleton className="h-32 rounded-xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>
        </DashboardLayout>
      );
    }
    return <>{children}</>;
  }

  const check = checkFeature(featureKey);

  if (!check.available) {
    const checkWithMessage = {
      ...check,
      message: check.message || "Este recurso não está disponível no momento."
    };
    
    if (withLayout) {
      return (
        <DashboardLayout>
          <FeatureBlockedScreen check={checkWithMessage} pageTitle={pageTitle} />
        </DashboardLayout>
      );
    }
    return <FeatureBlockedScreen check={checkWithMessage} pageTitle={pageTitle} />;
  }

  return <>{children}</>;
}
