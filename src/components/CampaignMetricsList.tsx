import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Calendar, ChevronDown } from "lucide-react";
import type { CampaignMetrics } from "@/lib/operationalTypes";

interface CampaignMetricsListProps {
  metrics: CampaignMetrics[];
  loading: boolean;
  onEdit: (metric: CampaignMetrics) => void;
  onDelete: (metricId: string) => void;
}

const formatNumber = (n: number) =>
  new Intl.NumberFormat("pt-BR").format(n);

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const formatDate = (d: string) => {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
};

export function CampaignMetricsList({ metrics, loading, onEdit, onDelete }: CampaignMetricsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
      </div>
    );
  }

  if (metrics.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Registros de Métricas ({metrics.length})
      </p>
      <div className="space-y-1">
        {metrics.map((m) => {
          const isExpanded = expandedId === m.id;
          return (
            <div key={m.id} className="bg-background border rounded-lg overflow-hidden">
              {/* Row header */}
              <div className="flex items-center gap-2 p-2.5 sm:p-3">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className="flex-1 flex items-center gap-2 text-left min-w-0"
                >
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">
                    {formatDate(m.period_start)} — {formatDate(m.period_end)}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {m.impressions > 0 && (
                    <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                      {formatNumber(m.impressions)} imp
                    </Badge>
                  )}
                  {m.cost > 0 && (
                    <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                      {formatCurrency(m.cost)}
                    </Badge>
                  )}
                  {m.conversions > 0 && (
                    <Badge variant="secondary" className="text-[10px] hidden sm:inline-flex">
                      {m.conversions} conv
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">{m.source}</Badge>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title="Editar"
                    onClick={(e) => { e.stopPropagation(); onEdit(m); }}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        title="Excluir"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir registro de métricas?</AlertDialogTitle>
                        <AlertDialogDescription>
                          O registro do período {formatDate(m.period_start)} — {formatDate(m.period_end)} será excluído permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(m.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t px-3 py-2.5 bg-muted/30">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-1.5 text-xs">
                    <MetricRow label="Impressões" value={formatNumber(m.impressions)} show={m.impressions > 0} />
                    <MetricRow label="Cliques" value={formatNumber(m.clicks)} show={m.clicks > 0} />
                    <MetricRow label="CTR" value={`${m.ctr}%`} show={m.ctr > 0} />
                    <MetricRow label="CPC" value={formatCurrency(m.cpc)} show={m.cpc > 0} />
                    <MetricRow label="CPM" value={formatCurrency(m.cpm)} show={m.cpm > 0} />
                    <MetricRow label="Conversões" value={formatNumber(m.conversions)} show={m.conversions > 0} />
                    <MetricRow label="CPA" value={formatCurrency(m.cpa)} show={m.cpa > 0} />
                    <MetricRow label="Custo" value={formatCurrency(m.cost)} show={m.cost > 0} />
                    <MetricRow label="Receita" value={formatCurrency(m.revenue)} show={m.revenue > 0} />
                    <MetricRow label="ROAS" value={`${m.roas}x`} show={m.roas > 0} />
                    <MetricRow label="Alcance" value={formatNumber(m.reach)} show={m.reach > 0} />
                    <MetricRow label="Frequência" value={String(m.frequency)} show={m.frequency > 0} />
                    <MetricRow label="Video Views" value={formatNumber(m.video_views)} show={m.video_views > 0} />
                    <MetricRow label="VTR" value={`${m.vtr}%`} show={m.vtr > 0} />
                    <MetricRow label="Leads" value={formatNumber(m.leads)} show={m.leads > 0} />
                    <MetricRow label="CPL" value={formatCurrency(m.cpl)} show={m.cpl > 0} />
                    <MetricRow label="Quality Score" value={String(m.quality_score)} show={m.quality_score > 0} />
                    <MetricRow label="Posição Média" value={String(m.avg_position)} show={m.avg_position > 0} />
                    <MetricRow label="Impression Share" value={`${m.search_impression_share}%`} show={m.search_impression_share > 0} />
                    <MetricRow label="Engagement Rate" value={`${m.engagement_rate}%`} show={m.engagement_rate > 0} />
                    <MetricRow label="Sessões" value={formatNumber(m.sessions)} show={m.sessions > 0} />
                    <MetricRow label="1ª Visita" value={formatNumber(m.first_visits)} show={m.first_visits > 0} />
                    <MetricRow label="Leads/Mês" value={formatNumber(m.leads_month)} show={m.leads_month > 0} />
                    <MetricRow label="Taxa MQL" value={`${m.mql_rate}%`} show={m.mql_rate > 0} />
                    <MetricRow label="Taxa SQL" value={`${m.sql_rate}%`} show={m.sql_rate > 0} />
                    <MetricRow label="Clientes Web" value={formatNumber(m.clients_web)} show={m.clients_web > 0} />
                    <MetricRow label="Receita Web" value={formatCurrency(m.revenue_web)} show={m.revenue_web > 0} />
                    <MetricRow label="Ticket Médio" value={formatCurrency(m.avg_ticket)} show={m.avg_ticket > 0} />
                    <MetricRow label="Custo Google Ads" value={formatCurrency(m.google_ads_cost)} show={m.google_ads_cost > 0} />
                    <MetricRow label="CAC/Mês" value={formatCurrency(m.cac_month)} show={m.cac_month > 0} />
                    <MetricRow label="Custo/Conversão" value={formatCurrency(m.cost_per_conversion)} show={m.cost_per_conversion > 0} />
                    <MetricRow label="LTV" value={formatCurrency(m.ltv)} show={m.ltv > 0} />
                    <MetricRow label="CAC:LTV" value={`${m.cac_ltv_ratio}x`} show={m.cac_ltv_ratio > 0} />
                    <MetricRow label="ROI Acumulado" value={`${m.roi_accumulated}%`} show={m.roi_accumulated !== 0} />
                    <MetricRow label="Período ROI" value={`${m.roi_period_months} meses`} show={m.roi_period_months > 0} />
                  </div>
                  {m.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {m.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricRow({ label, value, show }: { label: string; value: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="flex justify-between sm:flex-col sm:gap-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
