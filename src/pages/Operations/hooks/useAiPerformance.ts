import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CAMPAIGN_STATUS_LABELS,
  CHANNEL_LABELS,
} from "@/lib/operationalTypes";
import { getUserActiveKeys,
  runPerformanceAiAnalysis,
  type PerformanceAiResult,
  type PerformanceMetricsForPrompt,
} from "@/lib/aiAnalyzer";
import { getModelsForProvider } from "@/lib/aiModels";
import { notifyPerformanceAnalysisCompleted } from "@/lib/notificationService";
import type { Campaign, MetricsSummaryData } from "../types";
import type { CampaignMetrics as CampaignMetricsType } from "@/lib/operationalTypes";

export function useAiPerformance(
  campaigns: Campaign[],
  metricsSummaries: Record<string, MetricsSummaryData>,
  campaignMetricsEntries: Record<string, CampaignMetricsType[]>,
  projects: any[],
) {
  const { user } = useAuth();
  const { isFeatureAvailable } = useFeatureFlags();
  const canAiKeys = isFeatureAvailable("ai_api_keys");
  const canAiPerformance = isFeatureAvailable("ai_performance_analysis");

  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [availableAiModels, setAvailableAiModels] = useState<{ provider: string; model: string; label: string }[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, PerformanceAiResult>>({});
  const [aiDialogCampaignId, setAiDialogCampaignId] = useState<string | null>(null);
  const aiNotificationSentRef = useRef<string | null>(null);

  // Check AI keys
  useEffect(() => {
    const checkAiKeys = async () => {
      if (!user) return;
      const keys = await getUserActiveKeys(user.id);
      setHasAiKeys(keys.length > 0);
      const models: { provider: string; model: string; label: string }[] = [];
      for (const key of keys) {
        const allProviderModels = getModelsForProvider(key.provider);
        for (const m of allProviderModels) {
          models.push({ provider: key.provider, model: m.value, label: m.label });
        }
      }
      setAvailableAiModels(models);
      if (models.length > 0 && !selectedAiModel) {
        const preferred = keys[0];
        const preferredKey = `${preferred.provider}::${preferred.preferred_model}`;
        const hasPreferred = models.some((m) => `${m.provider}::${m.model}` === preferredKey);
        setSelectedAiModel(hasPreferred ? preferredKey : `${models[0].provider}::${models[0].model}`);
      }
    };
    checkAiKeys();
  }, [user]);

  // Load saved AI analyses from campaigns
  useEffect(() => {
    if (campaigns.length > 0) {
      const loadSavedAnalyses = async () => {
        if (!user) return;
        const { data } = await (supabase as any)
          .from("campaigns")
          .select("id, performance_ai_analysis")
          .eq("user_id", user.id)
          .not("performance_ai_analysis", "is", null);
        if (data) {
          const map: Record<string, PerformanceAiResult> = {};
          data.forEach((c: any) => {
            if (c.performance_ai_analysis) map[c.id] = c.performance_ai_analysis;
          });
          setAiResults((prev) => ({ ...prev, ...map }));
        }
      };
      loadSavedAnalyses();
    }
  }, [campaigns, user]);

  const handleAiPerformanceAnalysis = async (campaign: Campaign) => {
    if (!user) return;
    const summary = metricsSummaries[campaign.id];
    if (!summary || summary.total_entries === 0) {
      toast.error("Registre métricas antes de solicitar a análise por IA.");
      return;
    }
    const [provider, model] = selectedAiModel.split("::");
    if (!provider || !model) {
      toast.error("Selecione um modelo de IA antes de analisar.");
      return;
    }

    const project = projects.find((p) => p.id === campaign.project_id);
    const recentMetrics = (campaignMetricsEntries[campaign.id] || []).slice(0, 6).map((m: any) => ({
      periodStart: m.period_start,
      periodEnd: m.period_end,
      impressions: m.impressions || 0,
      clicks: m.clicks || 0,
      conversions: m.conversions || 0,
      cost: m.cost || 0,
      revenue: m.revenue || 0,
      ctr: m.ctr || 0,
      cpc: m.cpc || 0,
      roas: m.roas || 0,
      sessions: m.sessions || 0,
      leadsMonth: m.leads_month || 0,
      clientsWeb: m.clients_web || 0,
      googleAdsCost: m.google_ads_cost || 0,
      cacMonth: m.cac_month || 0,
      ltv: m.ltv || 0,
    }));

    const metricsData: PerformanceMetricsForPrompt = {
      campaignName: campaign.name,
      channel: CHANNEL_LABELS[campaign.channel] || campaign.channel,
      objective: campaign.objective || "",
      status: CAMPAIGN_STATUS_LABELS[campaign.status] || campaign.status,
      budgetTotal: campaign.budget_total || 0,
      budgetSpent: campaign.budget_spent || 0,
      startDate: campaign.start_date,
      endDate: campaign.end_date,
      summary: {
        totalEntries: summary.total_entries,
        totalImpressions: summary.total_impressions,
        totalClicks: summary.total_clicks,
        totalConversions: summary.total_conversions,
        totalLeads: summary.total_leads,
        totalCost: summary.total_cost,
        totalRevenue: summary.total_revenue,
        totalSessions: summary.total_sessions,
        totalFirstVisits: summary.total_first_visits,
        totalLeadsMonth: summary.total_leads_month,
        totalClientsWeb: summary.total_clients_web,
        totalRevenueWeb: summary.total_revenue_web,
        totalGoogleAdsCost: summary.total_google_ads_cost,
        avgCtr: summary.avg_ctr,
        avgCpc: summary.avg_cpc,
        avgCpa: summary.avg_cpa,
        avgCpl: summary.avg_cpl,
        calcRoas: summary.calc_roas,
        avgMqlRate: summary.avg_mql_rate,
        avgSqlRate: summary.avg_sql_rate,
        avgTicket: summary.avg_ticket,
        calcCac: summary.calc_cac,
        avgLtv: summary.avg_ltv,
        avgCacLtvRatio: summary.avg_cac_ltv_ratio,
        avgRoiAccumulated: summary.avg_roi_accumulated,
        maxRoiPeriodMonths: summary.max_roi_period_months,
        firstPeriod: summary.first_period,
        lastPeriod: summary.last_period,
      },
      recentMetrics,
      projectName: project?.name || campaign.project_name || "Projeto",
      projectNiche: (project as any)?.niche || "Marketing B2B",
    };

    setAiAnalyzing(campaign.id);
    try {
      const result = await runPerformanceAiAnalysis(
        campaign.id,
        user.id,
        metricsData,
        provider as "google_gemini" | "anthropic_claude",
        model
      );
      setAiResults((prev) => ({ ...prev, [campaign.id]: result }));
      toast.success("Análise de performance por IA concluída!");

      if (aiNotificationSentRef.current !== campaign.id) {
        aiNotificationSentRef.current = campaign.id;
        await notifyPerformanceAnalysisCompleted(user.id, campaign.name, result.overallHealth.score);
      }
    } catch (error: any) {
      console.error("Erro na análise de performance:", error);
      toast.error(`Análise falhou: ${error.message}`);
    } finally {
      setAiAnalyzing(null);
      aiNotificationSentRef.current = null;
    }
  };

  return {
    canAiKeys,
    canAiPerformance,
    hasAiKeys,
    availableAiModels,
    selectedAiModel,
    setSelectedAiModel,
    aiAnalyzing,
    setAiAnalyzing,
    aiResults,
    aiDialogCampaignId,
    setAiDialogCampaignId,
    handleAiPerformanceAnalysis,
  };
}
