import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ScoreRing";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Layers,
} from "lucide-react";
import { CHANNELS, CHANNEL_LIST, getScoreColor, getScoreLabel } from "@/lib/tacticalTypes";
import type { ChannelKey } from "@/lib/tacticalTypes";

interface ChannelScore {
  channel: ChannelKey;
  score: number;
  objective: string | null;
  funnel_role: string | null;
  is_recommended: boolean;
  risks: string[] | null;
}

interface TacticalPlanData {
  id: string;
  project_id: string;
  status: "draft" | "in_progress" | "completed";
  overall_tactical_score: number;
  strategic_coherence_score: number;
  structure_clarity_score: number;
  segmentation_quality_score: number;
  notes: string | null;
}

interface Props {
  tacticalPlan: TacticalPlanData;
  channelScores: ChannelScore[];
  projectName: string;
  onTabChange: (tab: ChannelKey) => void;
}

export function TacticalOverview({ tacticalPlan, channelScores, projectName, onTabChange }: Props) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: "Rascunho", color: "bg-muted text-muted-foreground" },
    in_progress: { label: "Em Progresso", color: "bg-amber-500/10 text-amber-600" },
    completed: { label: "Concluído", color: "bg-green-500/10 text-green-600" },
  };

  const status = statusConfig[tacticalPlan.status] || statusConfig.draft;

  const alerts: { type: "warning" | "info"; message: string }[] = [];

  if (channelScores.length === 0) {
    alerts.push({
      type: "warning",
      message: "Nenhum score estratégico por canal encontrado. Execute a análise estratégica primeiro para obter recomendações mais precisas.",
    });
  }

  const notRecommended = channelScores.filter((c) => !c.is_recommended);
  if (notRecommended.length > 0) {
    notRecommended.forEach((c) => {
      const ch = CHANNELS[c.channel];
      alerts.push({
        type: "warning",
        message: `${ch.fullLabel} não é recomendado pela análise estratégica (score: ${c.score}). Planeje com cautela.`,
      });
    });
  }

  const scoreItems = [
    { label: "Score Tático Geral", value: tacticalPlan.overall_tactical_score },
    { label: "Coerência Estratégica", value: tacticalPlan.strategic_coherence_score },
    { label: "Clareza da Estrutura", value: tacticalPlan.structure_clarity_score },
    { label: "Qualidade da Segmentação", value: tacticalPlan.segmentation_quality_score },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-foreground">{projectName}</h2>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Plano tático — visão consolidada de todos os canais
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Score Tático</p>
              <p className={`text-2xl font-bold ${getScoreColor(tacticalPlan.overall_tactical_score)}`}>
                {tacticalPlan.overall_tactical_score || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                alert.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-blue-500/30 bg-blue-500/5"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  alert.type === "warning" ? "text-amber-500" : "text-blue-500"
                }`}
              />
              <p className="text-sm text-muted-foreground">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreItems.map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-4 text-center space-y-2">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className={`text-3xl font-bold ${getScoreColor(item.value)}`}>
              {item.value || "—"}
            </p>
            {item.value > 0 && (
              <p className={`text-xs font-medium ${getScoreColor(item.value)}`}>
                {getScoreLabel(item.value)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Channel Cards */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Canais de Mídia
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {CHANNEL_LIST.map((ch) => {
            const stratScore = channelScores.find((c) => c.channel === ch.key);
            const isRecommended = stratScore?.is_recommended ?? true;

            return (
              <button
                key={ch.key}
                onClick={() => onTabChange(ch.key)}
                className="text-left rounded-xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${ch.bgColor} flex items-center justify-center`}>
                      <span className={`text-sm font-bold ${ch.color}`}>
                        {ch.label.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ch.fullLabel}</p>
                      {stratScore?.funnel_role && (
                        <p className="text-xs text-muted-foreground">{stratScore.funnel_role}</p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isRecommended ? (
                      <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600 bg-green-500/5">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Recomendado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500 bg-red-500/5">
                        <XCircle className="h-3 w-3 mr-1" />
                        Não recomendado
                      </Badge>
                    )}
                  </div>
                  {stratScore && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Score Estratégico</p>
                      <p className={`text-lg font-bold ${getScoreColor(stratScore.score)}`}>
                        {stratScore.score}
                      </p>
                    </div>
                  )}
                </div>

                {stratScore?.objective && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    {stratScore.objective}
                  </p>
                )}

                {stratScore?.risks && stratScore.risks.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    <p className="text-[10px] text-amber-600">{stratScore.risks.length} risco(s) identificado(s)</p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dependency Info */}
      <div className="rounded-xl border border-border bg-muted/30 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Dependência com a Camada Estratégica</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O plano tático consome dados da análise estratégica: scores por canal, públicos definidos e
            mensagem central. Alterações na estratégia podem gerar alertas de incoerência no plano tático.
          </p>
        </div>
      </div>
    </div>
  );
}
