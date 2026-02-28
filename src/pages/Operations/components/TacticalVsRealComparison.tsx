import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GitCompareArrows,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Minus,
  Target,
  Layers,
  Crosshair,
  ArrowRight,
  Info,
  Loader2,
} from "lucide-react";
import {
  type CampaignChannel,
  type CampaignStatus,
  type ProjectGapAnalysis,
  type ChannelGapAnalysis,
  type MetricGap,
  type TacticalChannelPlanSummary,
  type TacticalMetricTarget,
  type GapStatus,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  CAMPAIGN_STATUS_LABELS,
  GAP_STATUS_CONFIG,
  buildMetricGaps,
  computeAdherenceScore,
} from "@/lib/operationalTypes";
import { getScoreColor, getScoreLabel } from "@/lib/tacticalTypes";

interface Props {
  projectId: string;
  projectName: string;
  campaigns: {
    id: string;
    name: string;
    channel: CampaignChannel;
    status: string;
    objective: string | null;
  }[];
  metricsSummaries: Record<string, Record<string, number | null>>;
}

type CampaignRef = { id: string; name: string; status: CampaignStatus };

const GapStatusIcon = ({ status }: { status: GapStatus }) => {
  switch (status) {
    case "on_track":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />;
    case "above":
      return <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
    case "below":
      return <TrendingDown className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />;
    case "critical":
      return <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
    default:
      return <Minus className="h-3.5 w-3.5 text-gray-400" />;
  }
};

function formatMetricValue(value: number | null, unit: string): string {
  if (value === null || value === undefined) return "—";
  if (unit === "R$") return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (unit === "%") return `${value.toFixed(1)}%`;
  if (unit === "x") return `${value.toFixed(2)}x`;
  if (Number.isInteger(value)) return value.toLocaleString("pt-BR");
  return value.toFixed(2);
}

function AdherenceRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-muted/30" strokeWidth={4} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold">{score}</span>
    </div>
  );
}

function StructureMatchItem({ label, match }: { label: string; match: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {match ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
      ) : (
        <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
      )}
      <span className={match ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </div>
  );
}

function MetricGapRow({ gap }: { gap: MetricGap }) {
  const config = GAP_STATUS_CONFIG[gap.status];
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-1.5 px-2 rounded-md hover:bg-accent/30 transition-colors text-xs">
      <div className="col-span-4 sm:col-span-3 font-medium truncate" title={gap.metric}>
        {gap.metric}
      </div>
      <div className="col-span-2 text-right text-muted-foreground">{gap.planned}</div>
      <div className="col-span-2 text-right font-medium">
        {formatMetricValue(gap.actual, gap.unit)}
      </div>
      <div className="col-span-2 sm:col-span-3 text-right">
        {gap.gapPercent !== null ? (
          <span className={config.color}>
            {gap.gapPercent > 0 ? "+" : ""}{gap.gapPercent.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </div>
      <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1">
        <GapStatusIcon status={gap.status} />
        <Badge className={`text-[10px] px-1.5 py-0 ${config.bgColor} ${config.color} border-0`}>
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

function ChannelGapCard({ channelGap }: { channelGap: ChannelGapAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const plan = channelGap.tacticalPlan;
  const hasMetrics = channelGap.metricGaps.length > 0;
  const criticalCount = channelGap.metricGaps.filter((g) => g.status === "critical").length;
  const belowCount = channelGap.metricGaps.filter((g) => g.status === "below").length;

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <AdherenceRing score={channelGap.adherenceScore} size={44} />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-sm">{CHANNEL_LABELS[channelGap.channel]}</h4>
              <Badge className={`text-[10px] ${CHANNEL_COLORS[channelGap.channel]}`}>
                {channelGap.campaigns.length} campanha{channelGap.campaigns.length !== 1 ? "s" : ""}
              </Badge>
              {criticalCount > 0 && (
                <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0">
                  {criticalCount} crítico{criticalCount !== 1 ? "s" : ""}
                </Badge>
              )}
              {belowCount > 0 && (
                <Badge className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border-0">
                  {belowCount} abaixo
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{channelGap.summary}</p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-2 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t p-3 sm:p-4 space-y-4">
          {/* Structure Match */}
          {plan && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Aderência Estrutural
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-muted/30 rounded-lg p-3">
                <StructureMatchItem label={`Tipo: ${plan.campaign_type || "Não definido"}`} match={channelGap.structureMatch.campaignTypeMatch} />
                <StructureMatchItem label={`Funil: ${plan.funnel_stage || "Não definido"}`} match={channelGap.structureMatch.funnelStageMatch} />
                <StructureMatchItem label={`Lances: ${plan.bidding_strategy || "Não definido"}`} match={channelGap.structureMatch.biddingStrategyMatch} />
              </div>
            </div>
          )}

          {/* Tactical Scores */}
          {plan && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="h-3.5 w-3.5" />
                Scores Táticos
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Tático", value: plan.tactical_score },
                  { label: "Coerência", value: plan.coherence_score },
                  { label: "Clareza", value: plan.clarity_score },
                  { label: "Segmentação", value: plan.segmentation_score },
                ].map((s) => (
                  <div key={s.label} className="bg-muted/30 rounded-lg p-2 text-center">
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className={`text-sm font-bold ${getScoreColor(s.value)}`}>{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{getScoreLabel(s.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metric Gaps Table */}
          {hasMetrics ? (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Gap de Métricas — Planejado vs Real
              </h5>
              <div className="rounded-lg border overflow-hidden">
                <div className="grid grid-cols-12 gap-2 items-center py-1.5 px-2 bg-muted/50 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4 sm:col-span-3">Métrica</div>
                  <div className="col-span-2 text-right">Planejado</div>
                  <div className="col-span-2 text-right">Real</div>
                  <div className="col-span-2 sm:col-span-3 text-right">Desvio</div>
                  <div className="col-span-2 sm:col-span-2 text-right">Status</div>
                </div>
                <div className="divide-y divide-border/50">
                  {channelGap.metricGaps.map((gap, i) => (
                    <MetricGapRow key={i} gap={gap} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground">
              <Info className="h-4 w-4 mx-auto mb-1" />
              Nenhuma métrica-alvo definida no plano tático para este canal.
            </div>
          )}

          {/* Campaigns in this channel */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Campanhas neste canal
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {channelGap.campaigns.map((c) => (
                <Badge key={c.id} variant="outline" className="text-[10px] gap-1">
                  {c.name}
                  <span className="text-muted-foreground">({CAMPAIGN_STATUS_LABELS[c.status as keyof typeof CAMPAIGN_STATUS_LABELS] || c.status})</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* No tactical plan warning */}
          {!plan && (
            <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-medium text-yellow-800 dark:text-yellow-300">Sem plano tático para este canal</p>
                <p className="text-yellow-700 dark:text-yellow-400 mt-0.5">
                  Crie um plano tático em <strong>Plano Tático</strong> para habilitar o comparativo completo.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TacticalVsRealComparison({ projectId, projectName, campaigns, metricsSummaries }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState<ProjectGapAnalysis | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user && projectId && campaigns.length > 0) {
      loadGapAnalysis();
    } else {
      setLoading(false);
      setReady(true);
    }
  }, [user, projectId, campaigns, metricsSummaries]);

  const loadGapAnalysis = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Load tactical plan for this project
      const { data: plan } = await (supabase as any)
        .from("tactical_plans")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .maybeSingle();

      let channelPlans: TacticalChannelPlanSummary[] = [];

      if (plan) {
        const { data: chPlans } = await (supabase as any)
          .from("tactical_channel_plans")
          .select("id, channel, campaign_type, funnel_stage, funnel_role, bidding_strategy, key_metrics, tactical_score, coherence_score, clarity_score, segmentation_score")
          .eq("tactical_plan_id", plan.id)
          .eq("user_id", user.id);

        if (chPlans) {
          channelPlans = chPlans.map((cp: any) => ({
            ...cp,
            key_metrics: Array.isArray(cp.key_metrics) ? cp.key_metrics : [],
          }));
        }
      }

      // 2. Group campaigns by channel
      const channelCampaigns: Record<CampaignChannel, typeof campaigns> = {
        google: [],
        meta: [],
        linkedin: [],
        tiktok: [],
      };
      campaigns.forEach((c) => {
        if (channelCampaigns[c.channel]) {
          channelCampaigns[c.channel].push(c);
        }
      });

      // 3. Aggregate metrics summaries per channel
      const channelMetrics: Record<CampaignChannel, Record<string, number | null>> = {
        google: {},
        meta: {},
        linkedin: {},
        tiktok: {},
      };

      for (const [channel, chCampaigns] of Object.entries(channelCampaigns)) {
        if (chCampaigns.length === 0) continue;
        const agg: Record<string, { sum: number; count: number }> = {};

        for (const c of chCampaigns) {
          const summary = metricsSummaries[c.id];
          if (!summary) continue;
          for (const [key, val] of Object.entries(summary)) {
            if (val === null || val === undefined || typeof val !== "number") continue;
            if (!agg[key]) agg[key] = { sum: 0, count: 0 };
            agg[key].sum += val;
            agg[key].count += 1;
          }
        }

        const avgKeys = new Set(["avg_ctr", "avg_cpc", "avg_cpa", "avg_cpl", "calc_roas", "avg_mql_rate", "avg_sql_rate", "avg_ticket", "calc_cac", "avg_ltv", "avg_cac_ltv_ratio", "avg_roi_accumulated"]);
        const result: Record<string, number | null> = {};
        for (const [key, { sum, count }] of Object.entries(agg)) {
          result[key] = avgKeys.has(key) ? sum / count : sum;
        }
        channelMetrics[channel as CampaignChannel] = result;
      }

      // 4. Build gap analysis per channel
      const allChannels: CampaignChannel[] = ["google", "meta", "linkedin", "tiktok"];
      const channelGaps: ChannelGapAnalysis[] = [];

      for (const ch of allChannels) {
        const chCampaigns = channelCampaigns[ch];
        const tacticalPlan = channelPlans.find((p) => p.channel === ch) || null;

        // Skip channels with no campaigns AND no tactical plan
        if (chCampaigns.length === 0 && !tacticalPlan) continue;

        const metrics = channelMetrics[ch];
        const keyMetrics: TacticalMetricTarget[] = tacticalPlan?.key_metrics || [];
        const metricGaps = buildMetricGaps(keyMetrics, metrics);

        // Structure match — check if any campaign matches the tactical plan config
        const structureMatch = {
          campaignTypeMatch: !tacticalPlan?.campaign_type || chCampaigns.length > 0,
          funnelStageMatch: !tacticalPlan?.funnel_stage || chCampaigns.length > 0,
          biddingStrategyMatch: !tacticalPlan?.bidding_strategy || chCampaigns.length > 0,
        };

        const adherenceScore = tacticalPlan
          ? computeAdherenceScore(metricGaps, structureMatch)
          : 0;

        // Generate summary
        let summary = "";
        if (!tacticalPlan && chCampaigns.length > 0) {
          summary = `${chCampaigns.length} campanha(s) sem plano tático definido`;
        } else if (tacticalPlan && chCampaigns.length === 0) {
          summary = "Plano tático definido, mas sem campanhas em execução";
        } else {
          const onTrack = metricGaps.filter((g) => g.status === "on_track" || g.status === "above").length;
          const total = metricGaps.filter((g) => g.status !== "no_data").length;
          if (total > 0) {
            summary = `${onTrack}/${total} métricas no alvo · Aderência ${adherenceScore}%`;
          } else {
            summary = `${chCampaigns.length} campanha(s) · Score tático ${tacticalPlan?.tactical_score || 0}`;
          }
        }

        channelGaps.push({
          channel: ch,
          tacticalPlan,
          campaigns: chCampaigns.map((c) => ({ id: c.id, name: c.name, status: c.status as CampaignStatus })),
          metricGaps,
          adherenceScore,
          structureMatch,
          summary,
        });
      }

      // 5. Compute overall
      const channelsWithScores = channelGaps.filter((g) => g.tacticalPlan);
      const overallAdherence = channelsWithScores.length > 0
        ? Math.round(channelsWithScores.reduce((sum, g) => sum + g.adherenceScore, 0) / channelsWithScores.length)
        : 0;

      setGapAnalysis({
        projectId,
        projectName,
        overallAdherence,
        channelGaps,
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c) => c.status === "active").length,
        channelsPlanned: channelPlans.length,
        channelsExecuted: new Set(campaigns.map((c) => c.channel)).size,
      });
    } catch (err) {
      console.error("[TacticalVsReal] Error:", err?.message || "Unknown error");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        setTimeout(() => setReady(true), 30);
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!gapAnalysis || gapAnalysis.channelGaps.length === 0) {
    return null;
  }

  const { overallAdherence, channelGaps, channelsPlanned, channelsExecuted } = gapAnalysis;
  const criticalTotal = channelGaps.reduce((sum, g) => sum + g.metricGaps.filter((m) => m.status === "critical").length, 0);

  return (
    <div className={`border rounded-lg overflow-hidden bg-card transition-opacity duration-500 ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-accent/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <GitCompareArrows className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">Comparativo Tático vs Real</h3>
              {overallAdherence > 0 && (
                <Badge className={`text-[10px] border-0 ${
                  overallAdherence >= 70
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                    : overallAdherence >= 50
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                }`}>
                  Aderência {overallAdherence}%
                </Badge>
              )}
              {criticalTotal > 0 && (
                <Badge className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-0">
                  {criticalTotal} alerta{criticalTotal !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {channelsPlanned} canal(is) planejado(s)
              <ArrowRight className="h-3 w-3 inline mx-1" />
              {channelsExecuted} em execução
              {channelsPlanned > 0 && channelsExecuted === 0 && " · Nenhuma campanha iniciada"}
            </p>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-2 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {/* Content */}
      {expanded && (
        <div className="border-t p-3 sm:p-4 space-y-3">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-muted/30 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Aderência Geral</p>
              <p className={`text-lg font-bold ${getScoreColor(overallAdherence)}`}>{overallAdherence}%</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Canais Ativos</p>
              <p className="text-lg font-bold">{channelsExecuted}/{channelsPlanned || channelsExecuted}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Campanhas</p>
              <p className="text-lg font-bold">{gapAnalysis.totalCampaigns}</p>
              <p className="text-[10px] text-muted-foreground">{gapAnalysis.activeCampaigns} ativa{gapAnalysis.activeCampaigns !== 1 ? "s" : ""}</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alertas</p>
              <p className={`text-lg font-bold ${criticalTotal > 0 ? "text-red-500" : "text-green-500"}`}>{criticalTotal}</p>
              <p className="text-[10px] text-muted-foreground">métrica{criticalTotal !== 1 ? "s" : ""} crítica{criticalTotal !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Channel Gap Cards */}
          <div className="space-y-2">
            {channelGaps.map((cg) => (
              <ChannelGapCard key={cg.channel} channelGap={cg} />
            ))}
          </div>

          {/* Info box */}
          <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3">
            <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              O comparativo cruza as métricas-alvo definidas no <strong>Plano Tático</strong> com os resultados reais das campanhas em <strong>Operações</strong>.
              A aderência é calculada com base na correspondência estrutural (30%) e no desempenho das métricas (70%).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
