import { ReactNode } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureBlockedScreen } from "@/components/FeatureBlockedScreen";

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  withLayout?: boolean;
  /** Page title shown in the fallback */
  pageTitle?: string;
}

export function FeatureGate({ featureKey, children, withLayout = true, pageTitle }: FeatureGateProps) {
  const { checkFeature, loading } = useFeatureFlags();

  if (loading) {
    if (withLayout) {
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary" />
          </div>
        </DashboardLayout>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary" />
      </div>
    );
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
