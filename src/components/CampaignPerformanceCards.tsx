import { Badge } from "@/components/ui/badge";
import {
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Percent,
  Video,
  Search,
  Zap,
  UserCheck,
  Receipt,
  Calculator,
  Clock,
  ArrowRightLeft,
  Activity,
} from "lucide-react";
import {
  type CampaignChannel,
  CHANNEL_LABELS,
} from "@/lib/operationalTypes";

interface MetricsSummary {
  total_entries: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_leads: number;
  total_cost: number;
  total_revenue: number;
  total_sessions: number;
  total_first_visits: number;
  total_leads_month: number;
  total_clients_web: number;
  total_revenue_web: number;
  total_google_ads_cost: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_cpa: number;
  avg_cpl: number;
  calc_roas: number;
  avg_mql_rate: number;
  avg_sql_rate: number;
  avg_ticket: number;
  calc_cac: number;
  avg_ltv: number;
  avg_cac_ltv_ratio: number;
  avg_roi_accumulated: number;
  max_roi_period_months: number;
  first_period: string;
  last_period: string;
}

interface CampaignPerformanceCardsProps {
  summary: MetricsSummary;
  channel: CampaignChannel;
  campaignName: string;
}

interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}

function KpiCard({ label, value, icon: Icon, color, subtitle }: KpiCardProps) {
  return (
    <div className="bg-background border rounded-lg p-3 space-y-1">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-base sm:text-lg font-bold">{value}</p>
      {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

const formatNumber = (n: number) =>
  new Intl.NumberFormat("pt-BR").format(n);

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const formatPercent = (n: number) => `${n.toFixed(2)}%`;

const formatDate = (d: string) => {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
};

export function CampaignPerformanceCards({ summary, channel, campaignName }: CampaignPerformanceCardsProps) {
  const commonCards: KpiCardProps[] = [
    {
      label: "Impressões",
      value: formatNumber(summary.total_impressions),
      icon: Eye,
      color: "text-blue-500",
    },
    {
      label: "Cliques",
      value: formatNumber(summary.total_clicks),
      icon: MousePointerClick,
      color: "text-green-500",
      subtitle: `CTR: ${formatPercent(summary.avg_ctr)}`,
    },
    {
      label: "Conversões",
      value: formatNumber(summary.total_conversions),
      icon: Target,
      color: "text-purple-500",
      subtitle: summary.avg_cpa > 0 ? `CPA: ${formatCurrency(summary.avg_cpa)}` : undefined,
    },
    {
      label: "Custo Total",
      value: formatCurrency(summary.total_cost),
      icon: DollarSign,
      color: "text-red-500",
      subtitle: summary.avg_cpc > 0 ? `CPC: ${formatCurrency(summary.avg_cpc)}` : undefined,
    },
    {
      label: "Receita",
      value: formatCurrency(summary.total_revenue),
      icon: TrendingUp,
      color: "text-emerald-500",
      subtitle: summary.calc_roas > 0 ? `ROAS: ${summary.calc_roas.toFixed(2)}x` : undefined,
    },
  ];

  const channelCards: KpiCardProps[] = [];

  if (channel === "google") {
    if (summary.total_sessions > 0) {
      channelCards.push({
        label: "Sessões",
        value: formatNumber(summary.total_sessions),
        icon: Activity,
        color: "text-blue-600",
        subtitle: summary.total_first_visits > 0 ? `${formatNumber(summary.total_first_visits)} 1ª visita` : undefined,
      });
    }
    if (summary.total_leads_month > 0) {
      channelCards.push({
        label: "Leads/Mês",
        value: formatNumber(summary.total_leads_month),
        icon: Users,
        color: "text-sky-500",
        subtitle: summary.avg_mql_rate > 0 ? `MQL: ${formatPercent(summary.avg_mql_rate)}` : undefined,
      });
    }
    if (summary.avg_sql_rate > 0) {
      channelCards.push({
        label: "Taxa SQL",
        value: formatPercent(summary.avg_sql_rate),
        icon: Percent,
        color: "text-violet-500",
        subtitle: "Lead → Cliente",
      });
    }
    if (summary.total_clients_web > 0) {
      channelCards.push({
        label: "Clientes Web",
        value: formatNumber(summary.total_clients_web),
        icon: UserCheck,
        color: "text-green-600",
        subtitle: summary.total_revenue_web > 0 ? `Receita: ${formatCurrency(summary.total_revenue_web)}` : undefined,
      });
    }
    if (summary.avg_ticket > 0) {
      channelCards.push({
        label: "Ticket Médio",
        value: formatCurrency(summary.avg_ticket),
        icon: Receipt,
        color: "text-amber-500",
      });
    }
    if (summary.total_google_ads_cost > 0) {
      channelCards.push({
        label: "Custo Google Ads",
        value: formatCurrency(summary.total_google_ads_cost),
        icon: DollarSign,
        color: "text-orange-500",
        subtitle: summary.calc_cac > 0 ? `CAC: ${formatCurrency(summary.calc_cac)}` : undefined,
      });
    }
    if (summary.avg_ltv > 0) {
      channelCards.push({
        label: "LTV",
        value: formatCurrency(summary.avg_ltv),
        icon: Calculator,
        color: "text-teal-500",
        subtitle: summary.avg_cac_ltv_ratio > 0 ? `CAC:LTV 1:${summary.avg_cac_ltv_ratio.toFixed(1)}` : undefined,
      });
    }
    if (summary.avg_roi_accumulated !== 0) {
      channelCards.push({
        label: "ROI Acumulado",
        value: formatPercent(summary.avg_roi_accumulated),
        icon: TrendingUp,
        color: summary.avg_roi_accumulated >= 0 ? "text-emerald-600" : "text-red-500",
        subtitle: summary.max_roi_period_months > 0 ? `Período: ${summary.max_roi_period_months} meses` : undefined,
      });
    }
  }

  if (channel === "linkedin" && summary.total_leads > 0) {
    channelCards.push({
      label: "Leads",
      value: formatNumber(summary.total_leads),
      icon: Users,
      color: "text-sky-500",
      subtitle: summary.avg_cpl > 0 ? `CPL: ${formatCurrency(summary.avg_cpl)}` : undefined,
    });
  }

  if (channel === "meta" && summary.total_leads > 0) {
    channelCards.push({
      label: "Leads",
      value: formatNumber(summary.total_leads),
      icon: Users,
      color: "text-indigo-500",
      subtitle: summary.avg_cpl > 0 ? `CPL: ${formatCurrency(summary.avg_cpl)}` : undefined,
    });
  }

  const allCards = [...commonCards, ...channelCards];

  const hasData = summary.total_entries > 0;

  if (!hasData) {
    return (
      <div className="bg-muted/30 border border-dashed rounded-lg p-4 text-center">
        <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Nenhuma métrica registrada</p>
        <p className="text-xs text-muted-foreground mt-1">Registre métricas para ver os KPIs</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Performance</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{summary.total_entries} registro{summary.total_entries !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{formatDate(summary.first_period)} — {formatDate(summary.last_period)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {allCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
