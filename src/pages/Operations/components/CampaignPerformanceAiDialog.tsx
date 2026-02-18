import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Expand,
  Lightbulb,
  Minimize2,
  Sparkles,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  XCircle,
  Download,
} from "lucide-react";
import type { PerformanceAiResult } from "@/lib/aiAnalyzer";
import { AI_MODEL_LABELS } from "@/lib/aiModels";
import { exportPerformanceAnalysisAsPdf } from "@/lib/exportAnalysis";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: PerformanceAiResult;
  campaignName: string;
  channel: string;
}

const HEALTH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/20" },
  poor: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  average: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/20" },
  good: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
  excellent: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
};

const HEALTH_LABELS: Record<string, string> = {
  critical: "Crítico",
  poor: "Ruim",
  average: "Médio",
  good: "Bom",
  excellent: "Excelente",
};

const TREND_ICONS: Record<string, { icon: typeof ArrowUp; color: string; label: string }> = {
  improving: { icon: ArrowUp, color: "text-green-500", label: "Em melhoria" },
  stable: { icon: ArrowRight, color: "text-yellow-500", label: "Estável" },
  declining: { icon: ArrowDown, color: "text-red-500", label: "Em declínio" },
};

const VERDICT_COLORS: Record<string, { bg: string; text: string }> = {
  below: { bg: "bg-red-500/10", text: "text-red-500" },
  on_track: { bg: "bg-green-500/10", text: "text-green-500" },
  above: { bg: "bg-emerald-500/10", text: "text-emerald-500" },
};

const VERDICT_LABELS: Record<string, string> = {
  below: "Abaixo",
  on_track: "No alvo",
  above: "Acima",
};

const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-red-500/10", text: "text-red-500" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  low: { bg: "bg-blue-500/10", text: "text-blue-500" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  immediate: { bg: "bg-red-500/10", text: "text-red-500", label: "Imediato" },
  short_term: { bg: "bg-orange-500/10", text: "text-orange-500", label: "Curto prazo" },
  medium_term: { bg: "bg-blue-500/10", text: "text-blue-500", label: "Médio prazo" },
};

const EFFORT_LABELS: Record<string, string> = {
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
};

export default function CampaignPerformanceAiDialog({
  open,
  onOpenChange,
  analysis,
  campaignName,
  channel,
}: Props) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["health", "kpi", "funnel", "budget", "strengths", "risks", "actions", "projections"])
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const healthStyle = HEALTH_COLORS[analysis.overallHealth.level] || HEALTH_COLORS.average;
  const trendInfo = TREND_ICONS[analysis.overallHealth.trend] || TREND_ICONS.stable;
  const TrendIcon = trendInfo.icon;
  const modelLabel = AI_MODEL_LABELS[analysis.model] || analysis.model;
  const analyzedDate = new Date(analysis.analyzedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const SectionHeader = ({
    sectionKey,
    icon: Icon,
    title,
    badge,
    color = "text-foreground",
  }: {
    sectionKey: string;
    icon: typeof Activity;
    title: string;
    badge?: string;
    color?: string;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between py-2"
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-semibold">{title}</span>
        {badge && (
          <Badge variant="secondary" className="text-[10px]">
            {badge}
          </Badge>
        )}
      </div>
      {expandedSections.has(sectionKey) ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`overflow-y-auto p-0 transition-all duration-200 ${
          isFullscreen
            ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none"
            : "max-w-3xl max-h-[90vh]"
        }`}
      >
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5 text-primary" />
                Análise de Performance — {campaignName}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => exportPerformanceAnalysisAsPdf(campaignName, channel, analysis)}
                  title="Exportar PDF"
                >
                  <Download className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-[10px]">
                {channel}
              </Badge>
              <span>·</span>
              <span>{modelLabel}</span>
              <span>·</span>
              <span>{analyzedDate}</span>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6">
          <div className="space-y-4 pb-4">
            {/* Executive Summary */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{analysis.executiveSummary}</p>
            </div>

            {/* Overall Health */}
            <div>
              <SectionHeader sectionKey="health" icon={Activity} title="Saúde Geral" color="text-primary" />
              {expandedSections.has("health") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  <div className={`${healthStyle.bg} border ${healthStyle.border} rounded-lg p-4 text-center`}>
                    <p className={`text-3xl font-bold ${healthStyle.text}`}>
                      {analysis.overallHealth.score}
                    </p>
                    <p className={`text-xs font-medium ${healthStyle.text} mt-1`}>
                      {HEALTH_LABELS[analysis.overallHealth.level] || analysis.overallHealth.level}
                    </p>
                  </div>
                  <div className="bg-muted/50 border rounded-lg p-4 text-center flex flex-col items-center justify-center">
                    <TrendIcon className={`h-6 w-6 ${trendInfo.color} mb-1`} />
                    <p className={`text-xs font-medium ${trendInfo.color}`}>{trendInfo.label}</p>
                  </div>
                  <div className="bg-muted/50 border rounded-lg p-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {analysis.overallHealth.justification}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* KPI Analysis */}
            {analysis.kpiAnalysis.length > 0 && (
              <div>
                <SectionHeader
                  sectionKey="kpi"
                  icon={BarChart3}
                  title="Análise de KPIs"
                  badge={`${analysis.kpiAnalysis.length} métricas`}
                  color="text-blue-500"
                />
                {expandedSections.has("kpi") && (
                  <div className="space-y-2 mt-2">
                    {analysis.kpiAnalysis.map((kpi, i) => {
                      const vStyle = VERDICT_COLORS[kpi.verdict] || VERDICT_COLORS.on_track;
                      return (
                        <div key={i} className="bg-card border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium">{kpi.metric}</span>
                            <Badge className={`text-[10px] ${vStyle.bg} ${vStyle.text} border-0`}>
                              {VERDICT_LABELS[kpi.verdict] || kpi.verdict}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div className="bg-muted/50 rounded px-2.5 py-1.5">
                              <p className="text-[10px] text-muted-foreground">Atual</p>
                              <p className="text-xs font-semibold">{kpi.currentValue}</p>
                            </div>
                            <div className="bg-muted/50 rounded px-2.5 py-1.5">
                              <p className="text-[10px] text-muted-foreground">Benchmark</p>
                              <p className="text-xs font-semibold">{kpi.benchmark}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{kpi.insight}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Funnel Analysis */}
            {analysis.funnelAnalysis.length > 0 && (
              <div>
                <SectionHeader
                  sectionKey="funnel"
                  icon={Target}
                  title="Análise de Funil"
                  badge={`${analysis.funnelAnalysis.filter((f) => f.bottleneck).length} gargalos`}
                  color="text-purple-500"
                />
                {expandedSections.has("funnel") && (
                  <div className="space-y-2 mt-2">
                    {analysis.funnelAnalysis.map((stage, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg p-3 ${
                          stage.bottleneck
                            ? "bg-red-500/5 border-red-500/20"
                            : "bg-card"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          {stage.bottleneck ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          )}
                          <span className="text-sm font-medium">{stage.stage}</span>
                          {stage.bottleneck && (
                            <Badge className="text-[10px] bg-red-500/10 text-red-500 border-0">
                              Gargalo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1.5">{stage.performance}</p>
                        <div className="bg-muted/50 rounded px-2.5 py-1.5">
                          <p className="text-[10px] text-muted-foreground">Recomendação</p>
                          <p className="text-xs">{stage.recommendation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Budget Efficiency */}
            <div>
              <SectionHeader
                sectionKey="budget"
                icon={DollarSign}
                title="Eficiência de Budget"
                badge={`Score: ${analysis.budgetEfficiency.score}/100`}
                color="text-emerald-500"
              />
              {expandedSections.has("budget") && (
                <div className="space-y-3 mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.budgetEfficiency.wasteAreas.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1.5">
                          <XCircle className="h-3.5 w-3.5" />
                          Áreas de Desperdício
                        </p>
                        <ul className="space-y-1">
                          {analysis.budgetEfficiency.wasteAreas.map((w, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-red-400 mt-0.5">•</span>
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.budgetEfficiency.optimizationOpportunities.length > 0 && (
                      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-500 mb-2 flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Oportunidades de Otimização
                        </p>
                        <ul className="space-y-1">
                          {analysis.budgetEfficiency.optimizationOpportunities.map((o, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-green-400 mt-0.5">•</span>
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {analysis.budgetEfficiency.recommendedReallocation && (
                    <div className="bg-muted/50 border rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground mb-1">Realocação Recomendada</p>
                      <p className="text-xs">{analysis.budgetEfficiency.recommendedReallocation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Strengths & Weaknesses */}
            <div>
              <SectionHeader sectionKey="strengths" icon={ThumbsUp} title="Pontos Fortes & Fracos" color="text-amber-500" />
              {expandedSections.has("strengths") && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green-500 mb-2 flex items-center gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      Pontos Fortes
                    </p>
                    <ul className="space-y-1.5">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1.5">
                      <ThumbsDown className="h-3.5 w-3.5" />
                      Pontos Fracos
                    </p>
                    <ul className="space-y-1.5">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <XCircle className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Risks */}
            {analysis.risks.length > 0 && (
              <div>
                <SectionHeader
                  sectionKey="risks"
                  icon={AlertTriangle}
                  title="Riscos"
                  badge={`${analysis.risks.filter((r) => r.severity === "high").length} alto(s)`}
                  color="text-red-500"
                />
                {expandedSections.has("risks") && (
                  <div className="space-y-2 mt-2">
                    {analysis.risks.map((risk, i) => {
                      const sStyle = SEVERITY_COLORS[risk.severity] || SEVERITY_COLORS.medium;
                      return (
                        <div key={i} className={`${sStyle.bg} border rounded-lg p-3`}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <AlertTriangle className={`h-3.5 w-3.5 ${sStyle.text} flex-shrink-0`} />
                            <span className="text-sm font-medium flex-1">{risk.risk}</span>
                            <Badge className={`text-[10px] ${sStyle.bg} ${sStyle.text} border-0`}>
                              {risk.severity === "high" ? "Alto" : risk.severity === "medium" ? "Médio" : "Baixo"}
                            </Badge>
                          </div>
                          <div className="bg-background/50 rounded px-2.5 py-1.5">
                            <p className="text-[10px] text-muted-foreground">Mitigação</p>
                            <p className="text-xs">{risk.mitigation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Action Plan */}
            {analysis.actionPlan.length > 0 && (
              <div>
                <SectionHeader
                  sectionKey="actions"
                  icon={TrendingUp}
                  title="Plano de Ação"
                  badge={`${analysis.actionPlan.length} ações`}
                  color="text-primary"
                />
                {expandedSections.has("actions") && (
                  <div className="space-y-2 mt-2">
                    {analysis.actionPlan.map((action, i) => {
                      const pStyle = PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.short_term;
                      return (
                        <div key={i} className="bg-card border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold text-muted-foreground w-5">{i + 1}.</span>
                            <span className="text-sm font-medium flex-1">{action.action}</span>
                            <Badge className={`text-[10px] ${pStyle.bg} ${pStyle.text} border-0`}>
                              {pStyle.label}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 ml-7">
                            <div className="bg-muted/50 rounded px-2.5 py-1.5">
                              <p className="text-[10px] text-muted-foreground">Impacto Esperado</p>
                              <p className="text-xs">{action.expectedImpact}</p>
                            </div>
                            <div className="bg-muted/50 rounded px-2.5 py-1.5">
                              <p className="text-[10px] text-muted-foreground">Esforço</p>
                              <p className="text-xs">{EFFORT_LABELS[action.effort] || action.effort}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Projections */}
            {analysis.projections.length > 0 && (
              <div>
                <SectionHeader
                  sectionKey="projections"
                  icon={TrendingUp}
                  title="Projeções"
                  badge={`${analysis.projections.length} métricas`}
                  color="text-cyan-500"
                />
                {expandedSections.has("projections") && (
                  <div className="space-y-2 mt-2">
                    {analysis.projections.map((proj, i) => (
                      <div key={i} className="bg-card border rounded-lg p-3">
                        <p className="text-sm font-medium mb-2">{proj.metric}</p>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="bg-muted/50 rounded px-2.5 py-1.5 text-center">
                            <p className="text-[10px] text-muted-foreground">Atual</p>
                            <p className="text-xs font-semibold">{proj.current}</p>
                          </div>
                          <div className="bg-blue-500/5 border border-blue-500/20 rounded px-2.5 py-1.5 text-center">
                            <p className="text-[10px] text-blue-500">30 dias</p>
                            <p className="text-xs font-semibold">{proj.projected30d}</p>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded px-2.5 py-1.5 text-center">
                            <p className="text-[10px] text-emerald-500">90 dias</p>
                            <p className="text-xs font-semibold">{proj.projected90d}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">{proj.assumption}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
