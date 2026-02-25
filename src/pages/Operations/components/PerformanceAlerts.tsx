import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  DollarSign,
  TrendingDown,
  Target,
  TrendingUp,
  Star,
  Clock,
  ChevronDown,
  Bell,
  Filter,
  Zap,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  type CampaignChannel,
  type CampaignStatus,
  type PerformanceAlert,
  type AlertSeverity,
  type AlertCategory,
  type AlertCampaignData,
  type AlertSummaryData,
  ALERT_SEVERITY_CONFIG,
  ALERT_CATEGORY_CONFIG,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  evaluatePerformanceAlerts,
} from "@/lib/operationalTypes";

interface Props {
  campaigns: {
    id: string;
    name: string;
    channel: CampaignChannel;
    status: CampaignStatus;
    budget_total: number;
    budget_spent: number;
    start_date: string | null;
    end_date: string | null;
  }[];
  metricsSummaries: Record<string, Record<string, number | null>>;
}

const SEVERITY_ICONS: Record<AlertSeverity, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const CATEGORY_ICONS: Record<AlertCategory, typeof DollarSign> = {
  budget: DollarSign,
  efficiency: TrendingDown,
  conversion: Target,
  trend: TrendingUp,
  quality: Star,
  pacing: Clock,
};

export default function PerformanceAlerts({ campaigns, metricsSummaries }: Props) {
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "all">("all");
  const [filterCategory, setFilterCategory] = useState<AlertCategory | "all">("all");
  const [expanded, setExpanded] = useState(true);
  const [showRulesDialog, setShowRulesDialog] = useState(false);

  const alerts = useMemo(() => {
    const campaignData: AlertCampaignData[] = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      channel: c.channel,
      status: c.status,
      budget_total: c.budget_total,
      budget_spent: c.budget_spent,
      start_date: c.start_date,
      end_date: c.end_date,
    }));

    const summaries: Record<string, AlertSummaryData> = {};
    for (const [campaignId, summary] of Object.entries(metricsSummaries)) {
      if (!summary) continue;
      summaries[campaignId] = {
        total_entries: (summary.total_entries as number) || 0,
        total_impressions: (summary.total_impressions as number) || 0,
        total_clicks: (summary.total_clicks as number) || 0,
        total_conversions: (summary.total_conversions as number) || 0,
        total_leads: (summary.total_leads as number) || 0,
        total_cost: (summary.total_cost as number) || 0,
        total_revenue: (summary.total_revenue as number) || 0,
        total_sessions: (summary.total_sessions as number) || 0,
        avg_ctr: (summary.avg_ctr as number) || 0,
        avg_cpc: (summary.avg_cpc as number) || 0,
        avg_cpa: (summary.avg_cpa as number) || 0,
        avg_cpl: (summary.avg_cpl as number) || 0,
        calc_roas: (summary.calc_roas as number) || 0,
        calc_cac: (summary.calc_cac as number) || 0,
        avg_ltv: (summary.avg_ltv as number) || 0,
        avg_cac_ltv_ratio: (summary.avg_cac_ltv_ratio as number) || 0,
        avg_roi_accumulated: (summary.avg_roi_accumulated as number) || 0,
      };
    }

    return evaluatePerformanceAlerts(campaignData, summaries);
  }, [campaigns, metricsSummaries]);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
      if (filterCategory !== "all" && a.category !== filterCategory) return false;
      return true;
    });
  }, [alerts, filterSeverity, filterCategory]);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;

  const hasAlerts = alerts.length > 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => hasAlerts && setExpanded(!expanded)}
          className={`flex items-center gap-2 ${hasAlerts ? "cursor-pointer" : "cursor-default"}`}
        >
          <Bell className={`h-4 w-4 ${hasAlerts ? "text-amber-500" : "text-green-500"}`} />
          <h3 className="text-sm font-semibold text-foreground">Alertas de Performance</h3>
          {hasAlerts ? (
            <div className="flex items-center gap-1.5">
              {criticalCount > 0 && (
                <Badge className="text-[10px] px-1.5 py-0 bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800">
                  {criticalCount}
                </Badge>
              )}
              {warningCount > 0 && (
                <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                  {warningCount}
                </Badge>
              )}
              {infoCount > 0 && (
                <Badge className="text-[10px] px-1.5 py-0 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800">
                  {infoCount}
                </Badge>
              )}
            </div>
          ) : (
            <Badge className="text-[10px] px-1.5 py-0 bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800">
              Tudo OK
            </Badge>
          )}
        </button>
        <div className="flex items-center gap-1.5">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowRulesDialog(true)}
                  className="p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs bg-popover text-popover-foreground border-primary/50 shadow-lg shadow-primary/10">
                Como funcionam os alertas?
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {hasAlerts && (
            <button onClick={() => setExpanded(!expanded)}>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* No alerts state */}
      {!hasAlerts && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-3">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Nenhum alerta — todas as métricas estão dentro dos parâmetros esperados.
          </p>
        </div>
      )}

      {hasAlerts && expanded && (
        <>
          {/* Filters */}
          {alerts.length > 3 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="flex items-center gap-1 flex-wrap">
                <Button
                  variant={filterSeverity === "all" ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={() => setFilterSeverity("all")}
                >
                  Todos ({alerts.length})
                </Button>
                {criticalCount > 0 && (
                  <Button
                    variant={filterSeverity === "critical" ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setFilterSeverity(filterSeverity === "critical" ? "all" : "critical")}
                  >
                    Críticos ({criticalCount})
                  </Button>
                )}
                {warningCount > 0 && (
                  <Button
                    variant={filterSeverity === "warning" ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setFilterSeverity(filterSeverity === "warning" ? "all" : "warning")}
                  >
                    Atenção ({warningCount})
                  </Button>
                )}
                {infoCount > 0 && (
                  <Button
                    variant={filterSeverity === "info" ? "default" : "outline"}
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={() => setFilterSeverity(filterSeverity === "info" ? "all" : "info")}
                  >
                    Info ({infoCount})
                  </Button>
                )}
              </div>
              {/* Category filter chips */}
              <div className="flex items-center gap-1 flex-wrap ml-1">
                {(Object.keys(ALERT_CATEGORY_CONFIG) as AlertCategory[]).map((cat) => {
                  const count = alerts.filter((a) => a.category === cat).length;
                  if (count === 0) return null;
                  const CatIcon = CATEGORY_ICONS[cat];
                  return (
                    <Button
                      key={cat}
                      variant={filterCategory === cat ? "default" : "ghost"}
                      size="sm"
                      className="h-6 text-[10px] px-2 gap-1"
                      onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
                    >
                      <CatIcon className="h-3 w-3" />
                      {ALERT_CATEGORY_CONFIG[cat].label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alert Cards */}
          <div className="space-y-2">
            {filteredAlerts.map((alert) => {
              const severityCfg = ALERT_SEVERITY_CONFIG[alert.severity];
              const SeverityIcon = SEVERITY_ICONS[alert.severity];
              const CatIcon = CATEGORY_ICONS[alert.category];

              return (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 ${severityCfg.bgColor} ${severityCfg.borderColor}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 flex-shrink-0 ${severityCfg.color}`}>
                      <SeverityIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-sm font-medium ${severityCfg.color}`}>
                          {alert.title}
                        </span>
                        <Badge className={`text-[9px] px-1.5 py-0 ${CHANNEL_COLORS[alert.channel]}`}>
                          {CHANNEL_LABELS[alert.channel]}
                        </Badge>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 gap-0.5">
                          <CatIcon className="h-2.5 w-2.5" />
                          {ALERT_CATEGORY_CONFIG[alert.category].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {alert.description}
                      </p>
                      {alert.unit && (
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            Atual: <span className={`font-medium ${severityCfg.color}`}>
                              {alert.unit === "R$" ? `R$ ${alert.currentValue.toFixed(2)}` : `${alert.currentValue.toFixed(alert.unit === "%" ? 1 : 2)}${alert.unit}`}
                            </span>
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Limite: <span className="font-medium">
                              {alert.unit === "R$" ? `R$ ${alert.threshold.toFixed(2)}` : `${alert.threshold.toFixed(alert.unit === "%" ? 1 : 2)}${alert.unit}`}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAlerts.length === 0 && alerts.length > 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Nenhum alerta corresponde aos filtros selecionados.
            </p>
          )}
        </>
      )}
      {/* Rules Info Dialog */}
      <Dialog open={showRulesDialog} onOpenChange={setShowRulesDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden sidebar-scroll">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Zap className="h-5 w-5 text-amber-500" />
              Como funcionam os alertas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 text-sm">
            {/* How it works */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Monitoramento automático</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    Os alertas são gerados automaticamente sempre que você abre a página de Operações.
                    O sistema avalia <strong>11 regras</strong> contra as métricas reais de cada campanha ativa ou pausada.
                    Campanhas concluídas ou arquivadas são ignoradas.
                  </p>
                </div>
              </div>
            </div>

            {/* Severity levels */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Níveis de severidade</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">Crítico</span>
                    <span className="text-[11px] text-muted-foreground ml-2">Requer ação imediata — prejuízo ativo ou risco grave</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Atenção</span>
                    <span className="text-[11px] text-muted-foreground ml-2">Métrica fora do ideal — otimização recomendada</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Info</span>
                    <span className="text-[11px] text-muted-foreground ml-2">Observação — pode indicar oportunidade de melhoria</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules table */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Regras de alerta</p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-2.5 py-1.5 font-semibold text-muted-foreground">Regra</th>
                      <th className="text-left px-2.5 py-1.5 font-semibold text-muted-foreground">Condição</th>
                      <th className="text-center px-2.5 py-1.5 font-semibold text-muted-foreground">Nível</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { rule: "Budget estourado", condition: "Gasto ≥ 100% do total", level: "critical" },
                      { rule: "Budget quase esgotado", condition: "Gasto ≥ 90% do total", level: "warning" },
                      { rule: "ROAS negativo", condition: "ROAS < 1x (gasta mais que gera)", level: "critical" },
                      { rule: "ROAS baixo", condition: "ROAS < 2x", level: "warning" },
                      { rule: "Sem conversões", condition: "50+ cliques, 0 conversões/leads", level: "critical" },
                      { rule: "ROI negativo", condition: "ROI acumulado < 0%", level: "critical" },
                      { rule: "CAC:LTV desfavorável", condition: "Relação < 1x (Google)", level: "critical" },
                      { rule: "Alto gasto sem resultado", condition: "R$ 500+ sem conversões/receita", level: "critical" },
                      { rule: "CTR baixo", condition: "Abaixo do mínimo por canal", level: "warning" },
                      { rule: "CPC elevado", condition: "Acima do máximo por canal", level: "warning" },
                      { rule: "CPA elevado", condition: "Acima do benchmark por canal", level: "warning" },
                      { rule: "Budget subutilizado", condition: "Pacing < 50% do esperado", level: "info" },
                      { rule: "Sem métricas", condition: "Ativa há 7+ dias sem dados", level: "info" },
                    ].map((r) => (
                      <tr key={r.rule} className="hover:bg-muted/30">
                        <td className="px-2.5 py-1.5 font-medium text-foreground">{r.rule}</td>
                        <td className="px-2.5 py-1.5 text-muted-foreground">{r.condition}</td>
                        <td className="px-2.5 py-1.5 text-center">
                          <Badge className={`text-[9px] px-1.5 py-0 ${r.level === "critical" ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                              : r.level === "warning" ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                            }`}>
                            {r.level === "critical" ? "Crítico" : r.level === "warning" ? "Atenção" : "Info"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Thresholds per channel */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thresholds por canal</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { channel: "Google Ads", ctr: "1.5%", cpc: "R$ 8", cpa: "R$ 150", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800" },
                  { channel: "Meta Ads", ctr: "0.8%", cpc: "R$ 5", cpa: "R$ 100", color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800" },
                  { channel: "LinkedIn Ads", ctr: "0.4%", cpc: "R$ 15", cpa: "R$ 250", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800" },
                  { channel: "TikTok Ads", ctr: "0.5%", cpc: "R$ 4", cpa: "R$ 80", color: "text-pink-600 dark:text-pink-400", bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800" },
                ].map((ch) => (
                  <div key={ch.channel} className={`${ch.bg} border ${ch.border} rounded-lg p-2.5`}>
                    <p className={`text-[11px] font-semibold ${ch.color} mb-1.5`}>{ch.channel}</p>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-muted-foreground">CTR mín: <span className="font-medium text-foreground">{ch.ctr}</span></p>
                      <p className="text-[10px] text-muted-foreground">CPC máx: <span className="font-medium text-foreground">{ch.cpc}</span></p>
                      <p className="text-[10px] text-muted-foreground">CPA máx: <span className="font-medium text-foreground">{ch.cpa}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Os thresholds são baseados em benchmarks do mercado B2B brasileiro.
                Cada alerta mostra o valor atual e o limite que foi ultrapassado para facilitar a tomada de decisão.
                Alertas desaparecem automaticamente quando as métricas voltam ao normal.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
