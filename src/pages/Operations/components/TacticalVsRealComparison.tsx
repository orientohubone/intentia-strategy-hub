import { useState, useEffect, memo, useMemo, useRef } from "react";
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
  MonitorUp,
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

  return (
    <div className={`
      relative transition-all duration-300 rounded-xl border
      ${expanded ? "bg-card shadow-lg border-primary/30 ring-1 ring-primary/10" : "bg-card/40 hover:bg-card border-border hover:border-primary/30 shadow-sm"}
    `}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative">
            <AdherenceRing score={channelGap.adherenceScore} size={48} />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center text-[8px] text-white font-bold">
                  !
                </span>
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5 mt-0.5 flex-wrap">
              <div className={`p-1.5 rounded-md bg-white shadow-sm border ${channelGap.channel === "google" ? "border-blue-100" :
                channelGap.channel === "meta" ? "border-blue-50" :
                  channelGap.channel === "linkedin" ? "border-blue-200" : "border-slate-200"
                }`}>
                <img
                  src={`/${channelGap.channel === "google" ? "google-ads" : channelGap.channel === "meta" ? "meta-ads" : channelGap.channel === "linkedin" ? "linkedin-ads" : "tiktok-ads"}.svg`}
                  alt={CHANNEL_LABELS[channelGap.channel]}
                  className="h-3.5 w-3.5 object-contain"
                />
              </div>
              <h4 className="font-bold text-sm tracking-tight text-foreground">
                {CHANNEL_LABELS[channelGap.channel]}
              </h4>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-bold uppercase tracking-wider bg-primary/5 text-primary border-primary/10">
                {channelGap.campaigns.length} {channelGap.campaigns.length === 1 ? 'Ativa' : 'Ativas'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium line-clamp-1 opacity-80">
              {channelGap.summary}
            </p>
          </div>
        </div>
        <div className={`
          h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300
          ${expanded ? "bg-primary text-primary-foreground rotate-180" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}
        `}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-5 animate-in slide-in-from-top-2 duration-300">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Adherence & Scores Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Structural Match */}
            {plan && (
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-muted/30">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Layers className="h-3 w-3 text-primary" />
                  Aderência Estrutural
                </h5>
                <div className="space-y-2">
                  <StructureMatchItem label={`Tipo: ${plan.campaign_type || "N/A"}`} match={channelGap.structureMatch.campaignTypeMatch} />
                  <StructureMatchItem label={`Funil: ${plan.funnel_stage || "N/A"}`} match={channelGap.structureMatch.funnelStageMatch} />
                  <StructureMatchItem label={`Lances: ${plan.bidding_strategy || "N/A"}`} match={channelGap.structureMatch.biddingStrategyMatch} />
                </div>
              </div>
            )}

            {/* Tactical Ratings */}
            {plan && (
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-muted/30">
                <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Crosshair className="h-3 w-3 text-primary" />
                  Ratings Táticos
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-medium">Tático</span>
                    <span className={`text-base font-black ${getScoreColor(plan.tactical_score)}`}>{plan.tactical_score}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-muted-foreground uppercase font-medium">Coerência</span>
                    <span className={`text-base font-black ${getScoreColor(plan.coherence_score)}`}>{plan.coherence_score}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Metric Gaps Table with Modern Styling */}
          {hasMetrics ? (
            <div className="space-y-3">
              <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Target className="h-3 w-3 text-primary" />
                Performance vs Planejado
              </h5>
              <div className="rounded-xl border border-muted/40 overflow-hidden bg-card/30 backdrop-blur-sm">
                <div className="grid grid-cols-12 gap-2 items-center py-2.5 px-3 bg-muted/50 text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                  <div className="col-span-4 sm:col-span-3">Métrica</div>
                  <div className="col-span-2 text-right">Plan.</div>
                  <div className="col-span-2 text-right">Real</div>
                  <div className="col-span-2 sm:col-span-3 text-right">Gap</div>
                  <div className="col-span-2 sm:col-span-2 text-right">Status</div>
                </div>
                <div className="divide-y divide-border/30">
                  {channelGap.metricGaps.map((gap, i) => (
                    <MetricGapRow key={i} gap={gap} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-muted/10 rounded-xl border border-dashed text-center">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-2">
                <Info className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-xs font-medium text-muted-foreground">Sem métricas-alvo definidas</p>
            </div>
          )}

          {/* Warning for Missing Plan */}
          {!plan && (
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Configuração Incompleta</p>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 leading-relaxed">
                  Não encontramos um plano tático ativo para este canal. As métricas estão sendo comparadas com médias de mercado ou dados históricos.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Global cache to persist analysis results across navigation/remounts
const analysisCache = new Map<string, { analysis: ProjectGapAnalysis; dataKey: string }>();

function TacticalVsRealComparison({ projectId, projectName, campaigns, metricsSummaries }: Props) {
  const { user } = useAuth();

  // Create a unique key for the input data to detect actual changes
  const dataKey = useMemo(() => {
    try {
      const campaignIds = campaigns.map(c => `${c.id}:${c.status}`).sort().join('|');
      // For metrics, we just use the count of campaign summaries and a sample of IDs to catch major shifts
      // without stringifying the whole metrics object every time
      const metricsSample = Object.keys(metricsSummaries).slice(0, 5).join(',');
      return `${projectId}-${campaignIds}-${Object.keys(metricsSummaries).length}-${metricsSample}`;
    } catch (e) {
      return `${projectId}-${campaigns.length}-${new Date().getTime()}`;
    }
  }, [projectId, campaigns, metricsSummaries]);

  // Try to recover from cache first
  const initialData = useMemo(() => {
    const cached = analysisCache.get(projectId);
    if (cached && cached.dataKey === dataKey) {
      return cached.analysis;
    }
    return null;
  }, [projectId, dataKey]);

  const [loading, setLoading] = useState(!initialData);
  const [ready, setReady] = useState(!!initialData);
  const [gapAnalysis, setGapAnalysis] = useState<ProjectGapAnalysis | null>(initialData);
  const [expanded, setExpanded] = useState(false);

  // Use a ref to track the last data analyzed and avoid redundant calls
  const lastAnalyzedKey = useRef<string | null>(initialData ? dataKey : null);

  useEffect(() => {
    const shouldLoad = user && projectId && campaigns.length > 0 && lastAnalyzedKey.current !== dataKey;

    if (shouldLoad) {
      loadGapAnalysis();
    } else if (!user || !projectId || campaigns.length === 0) {
      setLoading(false);
      setReady(true);
    }
  }, [user, projectId, dataKey]);

  const loadGapAnalysis = async () => {
    if (!user) return;

    // Only show loading if we don't have any data for this project yet
    if (!gapAnalysis || gapAnalysis.projectId !== projectId) {
      setLoading(true);
    }

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

      const analysis: ProjectGapAnalysis = {
        projectId,
        projectName,
        overallAdherence,
        channelGaps,
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter((c) => c.status === "active").length,
        channelsPlanned: channelPlans.length,
        channelsExecuted: new Set(campaigns.map((c) => c.channel)).size,
      };

      setGapAnalysis(analysis);

      // Update cache
      analysisCache.set(projectId, { analysis, dataKey });
      lastAnalyzedKey.current = dataKey;
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
    <div className={`
      relative overflow-hidden transition-all duration-700 ease-out rounded-2xl border bg-card/50 backdrop-blur-md
      ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
    `}>
      {/* Main Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-primary/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner border border-primary/10">
            <GitCompareArrows className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                Comparativo Tático vs Real
              </h3>
              {overallAdherence > 0 && (
                <Badge variant="outline" className={`
                  text-[10px] font-black px-2 py-0.5 border-none shadow-sm
                  ${overallAdherence >= 70 ? "bg-emerald-500/10 text-emerald-600 animate-pulse" :
                    overallAdherence >= 50 ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}
                `}>
                  ADERÊNCIA {overallAdherence}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-1">
              <Target className="h-3.5 w-3.5 text-primary/60" />
              {channelsPlanned} planejado(s)
              <ArrowRight className="h-3 w-3 opacity-40" />
              <Layers className="h-3.5 w-3.5 text-primary/60 ml-0.5" />
              {channelsExecuted} em operação
            </p>
          </div>
        </div>
        <div className={`
          h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500
          ${expanded ? "bg-primary text-primary-foreground rotate-180 shadow-md shadow-primary/20" : "bg-muted/30 text-muted-foreground"}
        `}>
          <ChevronDown className="h-5 w-5" />
        </div>
      </button>

      {expanded && (
        <div className="p-5 pt-0 space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Global Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group p-4 rounded-2xl bg-muted/10 border border-muted/20 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Target className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Aderência</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${getScoreColor(overallAdherence)}`}>{overallAdherence}</span>
                <span className="text-xs font-bold text-muted-foreground/60">%</span>
              </div>
              <div className="w-full h-1 bg-muted/30 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 delay-300 ${overallAdherence >= 70 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${overallAdherence}%` }}
                />
              </div>
            </div>

            <div className="relative group p-4 rounded-2xl bg-muted/10 border border-muted/20 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <Layers className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Canais</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{channelsExecuted}</span>
                <span className="text-xs font-bold text-muted-foreground/60">/ {channelsPlanned}</span>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground mt-2">Canais sob gestão</p>
            </div>

            <div className="relative group p-4 rounded-2xl bg-muted/10 border border-muted/20 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                  <MonitorUp className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Campanhas</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-foreground">{gapAnalysis.totalCampaigns}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-600">{gapAnalysis.activeCampaigns} ativas</span>
              </div>
            </div>

            <div className="relative group p-4 rounded-2xl bg-muted/10 border border-muted/20 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Alertas GLOBAIS</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${criticalTotal > 0 ? "text-red-500" : "text-emerald-500"}`}>{criticalTotal}</span>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground mt-2">Desvios críticos detectados</p>
            </div>
          </div>

          {/* Sub-header for Channels */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border/40" />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Análise por Canal</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border/40" />
          </div>

          {/* Channel Gap Cards - Now in an even cleaner spacing */}
          <div className="grid grid-cols-1 gap-4">
            {channelGaps.map((cg) => (
              <ChannelGapCard key={cg.channel} channelGap={cg} />
            ))}
          </div>

          {/* Bottom Info Section */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="p-2 rounded-xl bg-primary/10">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h5 className="text-xs font-semibold text-foreground tracking-normal">Como interpretamos esta análise?</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Este comparativo utiliza um motor de análise de aderência (30% estrutural, 70% métricas).
                Sinalizadores <span className="text-red-500 font-bold">(!) Alerta</span> indicam desvios críticos onde o custo por aquisição ou ROI divergem significativamente do planejado no Plano Tático.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const MemoizedTacticalVsRealComparison = memo(TacticalVsRealComparison);
export default MemoizedTacticalVsRealComparison;
