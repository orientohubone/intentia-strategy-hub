import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  Archive,
  FolderOpen,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  Calendar,
  X,
} from "lucide-react";
import {
  type CampaignChannel,
  type CampaignStatus,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  CAMPAIGN_STATUS_FLOW,
} from "@/lib/operationalTypes";
import { CampaignMetricsForm, type MetricsFormData } from "@/components/CampaignMetricsForm";
import { CampaignPerformanceCards } from "@/components/CampaignPerformanceCards";

interface MetricsSummaryData {
  campaign_id: string;
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

interface Campaign {
  id: string;
  user_id: string;
  project_id: string;
  tactical_plan_id: string | null;
  tactical_channel_plan_id: string | null;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  objective: string | null;
  notes: string | null;
  budget_total: number;
  budget_spent: number;
  start_date: string | null;
  end_date: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  project_name?: string;
}

interface OperationalStats {
  total_campaigns: number;
  active_campaigns: number;
  paused_campaigns: number;
  completed_campaigns: number;
  draft_campaigns: number;
  total_budget: number;
  total_spent: number;
}

const defaultFormData = {
  name: "",
  project_id: "",
  channel: "" as string,
  objective: "",
  notes: "",
  budget_total: "",
  start_date: "",
  end_date: "",
};

export default function Operations() {
  const { user } = useAuth();
  const { projects } = useTenantData();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState(defaultFormData);
  const [metricsSummaries, setMetricsSummaries] = useState<Record<string, MetricsSummaryData>>({});
  const [metricsFormCampaignId, setMetricsFormCampaignId] = useState<string | null>(null);
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set());

  const toggleCampaignExpand = (campaignId: string) => {
    setExpandedCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(campaignId)) next.delete(campaignId);
      else next.add(campaignId);
      return next;
    });
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const expandAll = () => {
    const allKeys = groupedCampaigns.map((g) => g.projectId);
    setExpandedGroups(new Set(allKeys));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  useEffect(() => {
    if (user) {
      loadCampaigns();
      loadStats();
      loadMetricsSummaries();
    }
  }, [user]);

  const loadCampaigns = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("campaigns")
        .select("*, projects!inner(name)")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((c: any) => ({
        ...c,
        project_name: c.projects?.name || "Sem projeto",
      }));
      setCampaigns(mapped);
    } catch (error: any) {
      console.error("Error loading campaigns:", error);
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from("v_operational_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setStats(data || {
        total_campaigns: 0,
        active_campaigns: 0,
        paused_campaigns: 0,
        completed_campaigns: 0,
        draft_campaigns: 0,
        total_budget: 0,
        total_spent: 0,
      });
    } catch (error: any) {
      console.error("Error loading stats:", error);
    }
  };

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

  const handleMetricsSubmit = async (campaignId: string, data: MetricsFormData) => {
    if (!user) return;
    try {
      const numOrZero = (v: string) => (v ? parseFloat(v) : 0);
      const intOrZero = (v: string) => (v ? parseInt(v, 10) : 0);

      const payload: any = {
        campaign_id: campaignId,
        user_id: user.id,
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
      };

      const { error } = await (supabase as any)
        .from("campaign_metrics")
        .insert(payload);

      if (error) throw error;

      toast.success("Métricas registradas com sucesso");
      setMetricsFormCampaignId(null);
      loadMetricsSummaries();
    } catch (error: any) {
      console.error("Error saving metrics:", error);
      toast.error("Erro ao salvar métricas: " + error.message);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.name.trim()) {
      toast.error("Nome da campanha é obrigatório");
      return;
    }
    if (!formData.project_id) {
      toast.error("Selecione um projeto");
      return;
    }
    if (!formData.channel) {
      toast.error("Selecione um canal");
      return;
    }

    try {
      const payload: any = {
        user_id: user.id,
        name: formData.name.trim(),
        project_id: formData.project_id,
        channel: formData.channel,
        objective: formData.objective.trim() || null,
        notes: formData.notes.trim() || null,
        budget_total: formData.budget_total ? parseFloat(formData.budget_total) : 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingId) {
        const { error } = await (supabase as any)
          .from("campaigns")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", user.id);
        if (error) throw error;
        toast.success("Campanha atualizada com sucesso");
      } else {
        const { error } = await (supabase as any)
          .from("campaigns")
          .insert(payload);
        if (error) throw error;
        toast.success("Campanha criada com sucesso");
      }

      resetForm();
      loadCampaigns();
      loadStats();
    } catch (error: any) {
      console.error("Error saving campaign:", error);
      toast.error("Erro ao salvar campanha: " + error.message);
    }
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingId(campaign.id);
    setFormData({
      name: campaign.name,
      project_id: campaign.project_id,
      channel: campaign.channel,
      objective: campaign.objective || "",
      notes: campaign.notes || "",
      budget_total: campaign.budget_total ? String(campaign.budget_total) : "",
      start_date: campaign.start_date || "",
      end_date: campaign.end_date || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from("campaigns")
        .update({ is_deleted: true })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Campanha excluída com sucesso");
      loadCampaigns();
      loadStats();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast.error("Erro ao excluir campanha");
    }
  };

  const handleStatusChange = async (id: string, newStatus: CampaignStatus) => {
    if (!user) return;
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "active" && !campaigns.find((c) => c.id === id)?.start_date) {
        updateData.start_date = new Date().toISOString().split("T")[0];
      }
      if (newStatus === "completed") {
        updateData.end_date = new Date().toISOString().split("T")[0];
      }

      const { error } = await (supabase as any)
        .from("campaigns")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success(`Status alterado para ${CAMPAIGN_STATUS_LABELS[newStatus]}`);
      loadCampaigns();
      loadStats();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Erro ao alterar status");
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setShowCreateForm(false);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.objective || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || c.status === filterStatus;
      const matchesChannel = filterChannel === "all" || c.channel === filterChannel;
      const matchesProject = filterProject === "all" || c.project_id === filterProject;
      return matchesSearch && matchesStatus && matchesChannel && matchesProject;
    });
  }, [campaigns, searchTerm, filterStatus, filterChannel, filterProject]);

  const groupedCampaigns = useMemo(() => {
    const groups: Record<string, { projectId: string; projectName: string; campaigns: Campaign[] }> = {};
    filteredCampaigns.forEach((c) => {
      const key = c.project_id;
      if (!groups[key]) {
        groups[key] = { projectId: key, projectName: c.project_name || "Sem projeto", campaigns: [] };
      }
      groups[key].campaigns.push(c);
    });
    return Object.values(groups).sort((a, b) => a.projectName.localeCompare(b.projectName));
  }, [filteredCampaigns]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
  };

  const getStatusActions = (campaign: Campaign) => {
    const nextStatuses = CAMPAIGN_STATUS_FLOW[campaign.status] || [];
    return nextStatuses.map((status) => {
      const icons: Record<CampaignStatus, React.ElementType> = {
        draft: Edit2,
        active: Play,
        paused: Pause,
        completed: CheckCircle2,
        archived: Archive,
      };
      return { status, label: CAMPAIGN_STATUS_LABELS[status], Icon: icons[status] };
    });
  };

  return (
    <FeatureGate featureKey="operations" withLayout={false} pageTitle="Operações">
    <DashboardLayout>
      <SEO title="Operações | Intentia" description="Gestão de campanhas e métricas operacionais" />
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Megaphone className="h-6 w-6 text-primary" />
                Operações
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie campanhas, acompanhe métricas e controle budgets
              </p>
            </div>
            <div className="flex items-center gap-2">
              {groupedCampaigns.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={expandAll} title="Expandir todos">
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={collapseAll} title="Recolher todos">
                    <ChevronsDownUp className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button onClick={() => { resetForm(); setShowCreateForm(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Campanha</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-card border rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Megaphone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold">{stats.total_campaigns}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.active_campaigns} ativa{stats.active_campaigns !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Play className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Ativas</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active_campaigns}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.paused_campaigns} pausada{stats.paused_campaigns !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">Budget Total</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(stats.total_budget)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.total_budget > 0
                    ? `${Math.round((stats.total_spent / stats.total_budget) * 100)}% gasto`
                    : "Sem budget"}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Investido</span>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-primary">{formatCurrency(stats.total_spent)}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.completed_campaigns} concluída{stats.completed_campaigns !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativa</SelectItem>
                <SelectItem value="paused">Pausada</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="archived">Arquivada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os canais</SelectItem>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="meta">Meta Ads</SelectItem>
                <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                <SelectItem value="tiktok">TikTok Ads</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {(projects || []).map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-card border rounded-lg p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingId ? "Editar Campanha" : "Nova Campanha"}
                </h2>
                <Button variant="ghost" size="icon" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Nome da Campanha *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Ex: Campanha de Leads Q1"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-project">Projeto *</Label>
                  <Select
                    value={formData.project_id}
                    onValueChange={(v) => setFormData({ ...formData, project_id: v })}
                  >
                    <SelectTrigger id="campaign-project">
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {(projects || []).map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-channel">Canal *</Label>
                  <Select
                    value={formData.channel}
                    onValueChange={(v) => setFormData({ ...formData, channel: v })}
                  >
                    <SelectTrigger id="campaign-channel">
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Ads</SelectItem>
                      <SelectItem value="meta">Meta Ads</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                      <SelectItem value="tiktok">TikTok Ads</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-budget">Budget Total (R$)</Label>
                  <Input
                    id="campaign-budget"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.budget_total}
                    onChange={(e) => setFormData({ ...formData, budget_total: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-start">Data de Início</Label>
                  <Input
                    id="campaign-start"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-end">Data de Término</Label>
                  <Input
                    id="campaign-end"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="campaign-objective">Objetivo</Label>
                  <Input
                    id="campaign-objective"
                    placeholder="Ex: Gerar 200 leads qualificados"
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="campaign-notes">Observações</Label>
                  <Textarea
                    id="campaign-notes"
                    placeholder="Notas adicionais sobre a campanha..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                <Button onClick={handleSubmit}>
                  {editingId ? "Salvar Alterações" : "Criar Campanha"}
                </Button>
              </div>
            </div>
          )}

          {/* Campaign List — Grouped by Project */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : groupedCampaigns.length === 0 ? (
            <div className="bg-card border rounded-lg p-8 sm:p-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {campaigns.length === 0
                  ? "Crie sua primeira campanha para começar a gerenciar suas operações de marketing."
                  : "Nenhuma campanha corresponde aos filtros selecionados."}
              </p>
              {campaigns.length === 0 && (
                <Button onClick={() => { resetForm(); setShowCreateForm(true); }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeira Campanha
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {groupedCampaigns.map((group) => {
                const isExpanded = expandedGroups.has(group.projectId);
                const activeCount = group.campaigns.filter((c) => c.status === "active").length;
                const totalBudget = group.campaigns.reduce((sum, c) => sum + (c.budget_total || 0), 0);

                return (
                  <div key={group.projectId} className="bg-card border rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.projectId)}
                      className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-accent/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">{group.projectName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.campaigns.length} campanha{group.campaigns.length !== 1 ? "s" : ""}
                            {activeCount > 0 && ` · ${activeCount} ativa${activeCount !== 1 ? "s" : ""}`}
                            {totalBudget > 0 && ` · ${formatCurrency(totalBudget)}`}
                          </p>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {/* Group Content */}
                    {isExpanded && (
                      <div className="border-t divide-y">
                        {group.campaigns.map((campaign) => {
                          const statusActions = getStatusActions(campaign);
                          const budgetPacing = campaign.budget_total > 0
                            ? Math.round((campaign.budget_spent / campaign.budget_total) * 100)
                            : 0;

                          return (
                            <div key={campaign.id} className="p-3 sm:p-4 hover:bg-accent/30 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                {/* Campaign Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-medium text-sm sm:text-base truncate">{campaign.name}</h4>
                                    <Badge className={`text-xs ${CAMPAIGN_STATUS_COLORS[campaign.status]}`}>
                                      {CAMPAIGN_STATUS_LABELS[campaign.status]}
                                    </Badge>
                                    <Badge className={`text-xs ${CHANNEL_COLORS[campaign.channel]}`}>
                                      {CHANNEL_LABELS[campaign.channel]}
                                    </Badge>
                                  </div>
                                  {campaign.objective && (
                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                      <Target className="h-3 w-3 inline mr-1" />
                                      {campaign.objective}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                                    {campaign.budget_total > 0 && (
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        {formatCurrency(campaign.budget_total)}
                                        {budgetPacing > 0 && (
                                          <span className={`ml-1 ${budgetPacing >= 90 ? "text-red-500" : budgetPacing >= 70 ? "text-yellow-500" : "text-green-500"}`}>
                                            ({budgetPacing}%)
                                          </span>
                                        )}
                                      </span>
                                    )}
                                    {(campaign.start_date || campaign.end_date) && (
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(campaign.start_date)}
                                        {campaign.end_date && ` → ${formatDate(campaign.end_date)}`}
                                      </span>
                                    )}
                                  </div>
                                  {/* Budget Pacing Bar */}
                                  {campaign.budget_total > 0 && (
                                    <div className="mt-2 w-full max-w-xs">
                                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            budgetPacing >= 90 ? "bg-red-500" : budgetPacing >= 70 ? "bg-yellow-500" : "bg-green-500"
                                          }`}
                                          style={{ width: `${Math.min(budgetPacing, 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {statusActions.map(({ status, label, Icon }) => (
                                    <Button
                                      key={status}
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      title={label}
                                      onClick={() => handleStatusChange(campaign.id, status)}
                                    >
                                      <Icon className="h-4 w-4" />
                                    </Button>
                                  ))}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 ${expandedCampaigns.has(campaign.id) ? "text-primary" : ""}`}
                                    title="Métricas"
                                    onClick={() => toggleCampaignExpand(campaign.id)}
                                  >
                                    <BarChart3 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="Editar"
                                    onClick={() => handleEdit(campaign)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        title="Excluir"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          A campanha "{campaign.name}" será movida para a lixeira.
                                          Esta ação pode ser revertida em até 30 dias.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDelete(campaign.id)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Excluir
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>

                              {/* Metrics Section (expanded) */}
                              {expandedCampaigns.has(campaign.id) && (
                                <div className="mt-3 space-y-3 border-t pt-3">
                                  <CampaignPerformanceCards
                                    summary={metricsSummaries[campaign.id] || {
                                      total_entries: 0,
                                      total_impressions: 0,
                                      total_clicks: 0,
                                      total_conversions: 0,
                                      total_leads: 0,
                                      total_cost: 0,
                                      total_revenue: 0,
                                      total_sessions: 0,
                                      total_first_visits: 0,
                                      total_leads_month: 0,
                                      total_clients_web: 0,
                                      total_revenue_web: 0,
                                      total_google_ads_cost: 0,
                                      avg_ctr: 0,
                                      avg_cpc: 0,
                                      avg_cpa: 0,
                                      avg_cpl: 0,
                                      calc_roas: 0,
                                      avg_mql_rate: 0,
                                      avg_sql_rate: 0,
                                      avg_ticket: 0,
                                      calc_cac: 0,
                                      avg_ltv: 0,
                                      avg_cac_ltv_ratio: 0,
                                      avg_roi_accumulated: 0,
                                      max_roi_period_months: 0,
                                      first_period: "",
                                      last_period: "",
                                    }}
                                    channel={campaign.channel}
                                    campaignName={campaign.name}
                                  />

                                  {metricsFormCampaignId === campaign.id ? (
                                    <CampaignMetricsForm
                                      campaignId={campaign.id}
                                      campaignName={campaign.name}
                                      channel={campaign.channel}
                                      onSubmit={(data) => handleMetricsSubmit(campaign.id, data)}
                                      onCancel={() => setMetricsFormCampaignId(null)}
                                    />
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-2"
                                      onClick={() => setMetricsFormCampaignId(campaign.id)}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                      Registrar Métricas
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
    </DashboardLayout>
    </FeatureGate>
  );
}
