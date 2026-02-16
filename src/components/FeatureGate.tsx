import { ReactNode } from "react";
import { useFeatureFlags, type FeatureCheck } from "@/hooks/useFeatureFlags";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Wrench,
  Clock,
  Archive,
  Lock,
  ArrowLeft,
  Sparkles,
  Rocket,
  CheckCircle2,
  Crown,
} from "lucide-react";

interface FeatureGateProps {
  featureKey: string;
  children: ReactNode;
  /** If true, wraps the fallback in DashboardLayout */
  withLayout?: boolean;
  /** Page title shown in the fallback */
  pageTitle?: string;
}

const STATUS_DISPLAY: Record<string, {
  icon: typeof ShieldAlert;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  badgeLabel: string;
}> = {
  disabled: {
    icon: ShieldAlert,
    title: "Recurso Desativado",
    color: "text-red-500",
    bgColor: "bg-red-500/5",
    borderColor: "border-red-500/20",
    badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",
    badgeLabel: "Desativado",
  },
  development: {
    icon: Wrench,
    title: "Em Desenvolvimento",
    color: "text-blue-500",
    bgColor: "bg-blue-500/5",
    borderColor: "border-blue-500/20",
    badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    badgeLabel: "Em breve",
  },
  maintenance: {
    icon: Clock,
    title: "Em Manutenção",
    color: "text-amber-500",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    badgeLabel: "Manutenção",
  },
  deprecated: {
    icon: Archive,
    title: "Recurso Descontinuado",
    color: "text-gray-500",
    bgColor: "bg-gray-500/5",
    borderColor: "border-gray-500/20",
    badgeClass: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    badgeLabel: "Descontinuado",
  },
  plan_blocked: {
    icon: Crown,
    title: "Desbloqueie Todo o Potencial",
    color: "text-primary",
    bgColor: "bg-primary/5",
    borderColor: "border-primary/20",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    badgeLabel: "Plano Professional",
  },
};

const UPGRADE_BENEFITS = [
  "Projetos e públicos ilimitados",
  "Análises por IA ilimitadas",
  "Plano Tático + Playbook ilimitados",
  "Operações e campanhas ilimitadas",
  "Exportação PDF e CSV ilimitada",
  "Suporte prioritário",
];

function FeatureBlockedFallback({ check, pageTitle }: { check: FeatureCheck; pageTitle?: string }) {
  const navigate = useNavigate();
  const display = STATUS_DISPLAY[check.status] || STATUS_DISPLAY.disabled;
  const Icon = display.icon;
  const isPlanBlocked = check.status === "plan_blocked";

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className={`max-w-lg w-full mx-auto text-center p-8 rounded-2xl border ${display.bgColor} ${display.borderColor}`}>
        <div className={`w-16 h-16 rounded-2xl ${display.bgColor} border ${display.borderColor} flex items-center justify-center mx-auto mb-5`}>
          <Icon className={`h-8 w-8 ${display.color}`} />
        </div>

        {pageTitle && (
          <p className="text-sm text-muted-foreground mb-1">{pageTitle}</p>
        )}

        <h2 className="text-xl font-bold mb-2">{display.title}</h2>

        <Badge className={`${display.badgeClass} mb-4`}>
          {display.badgeLabel}
        </Badge>

        <p className="text-sm text-muted-foreground mb-6">
          {check.message}
        </p>

        {isPlanBlocked && (
          <div className="text-left bg-card border border-border rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              O que você desbloqueia com o Professional:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {UPGRADE_BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Dashboard
          </Button>

          {isPlanBlocked && (
            <Button
              size="sm"
              onClick={() => navigate("/settings")}
              className="gap-2"
            >
              <Rocket className="h-4 w-4" />
              Fazer Upgrade
            </Button>
          )}
        </div>
      </div>
    </div>
  );
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
    if (withLayout) {
      return (
        <DashboardLayout>
          <FeatureBlockedFallback check={check} pageTitle={pageTitle} />
        </DashboardLayout>
      );
    }
    return <FeatureBlockedFallback check={check} pageTitle={pageTitle} />;
  }

  return <>{children}</>;
}
