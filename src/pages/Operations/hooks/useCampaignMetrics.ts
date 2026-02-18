import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CampaignMetrics as CampaignMetricsType } from "@/lib/operationalTypes";
import type { MetricsFormData } from "../components/CampaignMetricsForm";
import type { MetricsSummaryData } from "../types";

const numOrZero = (v: string) => (v ? parseFloat(v) : 0);
const intOrZero = (v: string) => (v ? parseInt(v, 10) : 0);

export function useCampaignMetrics() {
  const { user } = useAuth();
  const [metricsSummaries, setMetricsSummaries] = useState<Record<string, MetricsSummaryData>>({});
  const [metricsFormCampaignId, setMetricsFormCampaignId] = useState<string | null>(null);
  const [metricsFormDrafts, setMetricsFormDrafts] = useState<Record<string, Partial<MetricsFormData>>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());
  const [campaignMetricsEntries, setCampaignMetricsEntries] = useState<Record<string, CampaignMetricsType[]>>({});
  const [metricsEntriesLoading, setMetricsEntriesLoading] = useState<Record<string, boolean>>({});
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadMetricsSummaries();
    }
  }, [user]);

  const loadMetricsSummaries = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from("v_campaign_metrics_summary")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const map: Record<string, MetricsSummaryData> = {};
      (data || []).forEach((row: any) => {
        map[row.campaign_id] = row;
      });
      setMetricsSummaries(map);
    } catch (error: any) {
      console.error("Error loading metrics summaries:", error);
    }
  };

  const loadCampaignMetrics = async (campaignId: string) => {
    if (!user) return;
    setMetricsEntriesLoading((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const { data, error } = await (supabase as any)
        .from("campaign_metrics")
        .select("*")
        .eq("campaign_id", campaignId)
        .eq("user_id", user.id)
        .order("period_start", { ascending: false });

      if (error) throw error;
      setCampaignMetricsEntries((prev) => ({ ...prev, [campaignId]: data || [] }));
    } catch (error: any) {
      console.error("Error loading campaign metrics:", error);
    } finally {
      setMetricsEntriesLoading((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const toggleCampaignExpand = (campaignId: string) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(campaignId)) {
        next.delete(campaignId);
      } else {
        next.add(campaignId);
        if (!campaignMetricsEntries[campaignId] || campaignMetricsEntries[campaignId].length === 0) {
          loadCampaignMetrics(campaignId);
        }
      }
      return next;
    });
  };

  const buildMetricsPayload = (campaignId: string, data: MetricsFormData) => ({
    campaign_id: campaignId,
    user_id: user!.id,
    period_start: data.period_start,
    period_end: data.period_end,
    impressions: intOrZero(data.impressions),
    clicks: intOrZero(data.clicks),
    ctr: numOrZero(data.ctr),
    cpc: numOrZero(data.cpc),
    cpm: numOrZero(data.cpm),
    conversions: intOrZero(data.conversions),
    cpa: numOrZero(data.cpa),
    roas: numOrZero(data.roas),
    cost: numOrZero(data.cost),
    revenue: numOrZero(data.revenue),
    reach: intOrZero(data.reach),
    frequency: numOrZero(data.frequency),
    video_views: intOrZero(data.video_views),
    vtr: numOrZero(data.vtr),
    leads: intOrZero(data.leads),
    cpl: numOrZero(data.cpl),
    quality_score: numOrZero(data.quality_score),
    avg_position: numOrZero(data.avg_position),
    search_impression_share: numOrZero(data.search_impression_share),
    engagement_rate: numOrZero(data.engagement_rate),
    sessions: intOrZero(data.sessions),
    first_visits: intOrZero(data.first_visits),
    leads_month: intOrZero(data.leads_month),
    mql_rate: numOrZero(data.mql_rate),
    sql_rate: numOrZero(data.sql_rate),
    clients_web: intOrZero(data.clients_web),
    revenue_web: numOrZero(data.revenue_web),
    avg_ticket: numOrZero(data.avg_ticket),
    google_ads_cost: numOrZero(data.google_ads_cost),
    cac_month: numOrZero(data.cac_month),
    cost_per_conversion: numOrZero(data.cost_per_conversion),
    ltv: numOrZero(data.ltv),
    cac_ltv_ratio: numOrZero(data.cac_ltv_ratio),
    cac_ltv_benchmark: numOrZero(data.cac_ltv_benchmark),
    roi_accumulated: numOrZero(data.roi_accumulated),
    roi_period_months: intOrZero(data.roi_period_months),
    notes: data.notes || "",
    source: "manual",
  });

  const handleMetricsSubmit = async (campaignId: string, data: MetricsFormData, onReload: () => void) => {
    if (!user) return;
    try {
      const payload = buildMetricsPayload(campaignId, data);
      const { error } = await (supabase as any)
        .from("campaign_metrics")
        .insert(payload);

      if (error) throw error;

      toast.success("Métricas registradas com sucesso");
      setMetricsFormDrafts((prev) => {
        const next = { ...prev };
        delete next[campaignId];
        return next;
      });
      setMetricsFormCampaignId(null);
      loadMetricsSummaries();
      loadCampaignMetrics(campaignId);
      onReload();
    } catch (error: any) {
      console.error("Error saving metrics:", error);
      toast.error("Erro ao salvar métricas: " + error.message);
    }
  };

  const handleMetricsUpdate = async (campaignId: string, metricId: string, data: MetricsFormData, onReload: () => void) => {
    if (!user) return;
    try {
      const payload = buildMetricsPayload(campaignId, data);
      delete (payload as any).campaign_id;
      delete (payload as any).user_id;
      delete (payload as any).source;

      const { error } = await (supabase as any)
        .from("campaign_metrics")
        .update(payload)
        .eq("id", metricId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Métricas atualizadas com sucesso");
      setMetricsFormDrafts((prev) => {
        const next = { ...prev };
        delete next[campaignId];
        return next;
      });
      setMetricsFormCampaignId(null);
      setEditingMetricId(null);
      loadMetricsSummaries();
      loadCampaignMetrics(campaignId);
      onReload();
    } catch (error: any) {
      console.error("Error updating metrics:", error);
      toast.error("Erro ao atualizar métricas: " + error.message);
    }
  };

  const handleMetricsEdit = (campaignId: string, metric: CampaignMetricsType) => {
    const toStr = (v: number | null | undefined) => (v ? String(v) : "");
    const draft: Partial<MetricsFormData> = {
      period_start: metric.period_start || "",
      period_end: metric.period_end || "",
      impressions: toStr(metric.impressions),
      clicks: toStr(metric.clicks),
      ctr: toStr(metric.ctr),
      cpc: toStr(metric.cpc),
      cpm: toStr(metric.cpm),
      conversions: toStr(metric.conversions),
      cpa: toStr(metric.cpa),
      roas: toStr(metric.roas),
      cost: toStr(metric.cost),
      revenue: toStr(metric.revenue),
      reach: toStr(metric.reach),
      frequency: toStr(metric.frequency),
      video_views: toStr(metric.video_views),
      vtr: toStr(metric.vtr),
      leads: toStr(metric.leads),
      cpl: toStr(metric.cpl),
      quality_score: toStr(metric.quality_score),
      avg_position: toStr(metric.avg_position),
      search_impression_share: toStr(metric.search_impression_share),
      engagement_rate: toStr(metric.engagement_rate),
      sessions: toStr(metric.sessions),
      first_visits: toStr(metric.first_visits),
      leads_month: toStr(metric.leads_month),
      mql_rate: toStr(metric.mql_rate),
      sql_rate: toStr(metric.sql_rate),
      clients_web: toStr(metric.clients_web),
      revenue_web: toStr(metric.revenue_web),
      avg_ticket: toStr(metric.avg_ticket),
      google_ads_cost: toStr(metric.google_ads_cost),
      cac_month: toStr(metric.cac_month),
      cost_per_conversion: toStr(metric.cost_per_conversion),
      ltv: toStr(metric.ltv),
      cac_ltv_ratio: toStr(metric.cac_ltv_ratio),
      cac_ltv_benchmark: toStr(metric.cac_ltv_benchmark),
      roi_accumulated: toStr(metric.roi_accumulated),
      roi_period_months: toStr(metric.roi_period_months),
      notes: metric.notes || "",
    };
    setMetricsFormDrafts((prev) => ({ ...prev, [campaignId]: draft }));
    setEditingMetricId(metric.id);
    setMetricsFormCampaignId(campaignId);
  };

  const handleMetricsDelete = async (campaignId: string, metricId: string, onReload: () => void) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from("campaign_metrics")
        .delete()
        .eq("id", metricId)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Registro de métricas excluído");
      loadMetricsSummaries();
      loadCampaignMetrics(campaignId);
      onReload();
    } catch (error: any) {
      console.error("Error deleting metric:", error);
      toast.error("Erro ao excluir métricas: " + error.message);
    }
  };

  const cancelMetricsForm = (campaignId: string) => {
    setMetricsFormCampaignId(null);
    setEditingMetricId(null);
    setMetricsFormDrafts((prev) => {
      const next = { ...prev };
      delete next[campaignId];
      return next;
    });
  };

  const openNewMetricsForm = (campaignId: string) => {
    setEditingMetricId(null);
    setMetricsFormDrafts((prev) => {
      const next = { ...prev };
      delete next[campaignId];
      return next;
    });
    setMetricsFormCampaignId(campaignId);
  };

  return {
    metricsSummaries,
    metricsFormCampaignId,
    metricsFormDrafts,
    setMetricsFormDrafts,
    expandedCampaigns,
    campaignMetricsEntries,
    metricsEntriesLoading,
    editingMetricId,
    toggleCampaignExpand,
    handleMetricsSubmit,
    handleMetricsUpdate,
    handleMetricsEdit,
    handleMetricsDelete,
    cancelMetricsForm,
    openNewMetricsForm,
    loadMetricsSummaries,
  };
}
