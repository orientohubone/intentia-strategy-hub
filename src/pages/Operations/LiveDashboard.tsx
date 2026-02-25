import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import {
  Activity,
  Archive,
  ArrowLeft,
  BarChart3,
  Calculator,
  CheckCircle2,
  CircleGauge,
  Clock3,
  Coins,
  Copy,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Globe,
  Maximize,
  Megaphone,
  Minimize,
  MousePointerClick,
  PauseCircle,
  Percent,
  PlayCircle,
  Radio,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingUp,
  WalletCards,
  Users,
  Wallet,
} from "lucide-react";
import type { CampaignChannel, CampaignMetrics, CampaignStatus } from "@/lib/operationalTypes";
import { CAMPAIGN_STATUS_LABELS, CHANNEL_LABELS } from "@/lib/operationalTypes";

type CampaignRow = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  project_id: string;
  project_name: string;
  budget_total: number;
  budget_spent: number;
};

type MetricsSummaryRow = {
  campaign_id: string;
  total_entries: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_leads: number;
  total_cost: number;
  total_revenue: number;
  total_sessions: number;
  avg_ctr: number;
  avg_cpc: number;
  avg_cpa: number;
  calc_roas: number;
};

type BudgetAllocationRow = {
  id: string;
  month: number;
  year: number;
  planned_budget: number;
  actual_spent: number;
  channel: CampaignChannel;
};

const CHANNEL_ORDER: CampaignChannel[] = ["google", "meta", "linkedin", "tiktok"];

const CHANNEL_META: Record<CampaignChannel, { logo: string; accent: string; ring: string }> = {
  google: { logo: "/google-ads.svg", accent: "text-blue-500", ring: "border-blue-500/30" },
  meta: { logo: "/meta-ads.svg", accent: "text-indigo-500", ring: "border-indigo-500/30" },
  linkedin: { logo: "/linkedin-ads.svg", accent: "text-sky-500", ring: "border-sky-500/30" },
  tiktok: { logo: "/tiktok-ads.svg", accent: "text-pink-500", ring: "border-pink-500/30" },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value || 0);

const formatPercent = (value: number) => `${(value || 0).toFixed(1)}%`;

export default function OperationsLiveDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("projectId");
  const viewId = searchParams.get("viewId");

  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [summariesByCampaign, setSummariesByCampaign] = useState<Record<string, MetricsSummaryRow>>({});
  const [latestMetricsByCampaign, setLatestMetricsByCampaign] = useState<Record<string, CampaignMetrics>>({});
  const [allocations, setAllocations] = useState<BudgetAllocationRow[]>([]);
  const [monthlyActuals, setMonthlyActuals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Auto-start live mode if in public view (TV mode)
  const [isLive, setIsLive] = useState(() => !!searchParams.get("viewId"));

  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => !!document.fullscreenElement);
  const [activeViewers, setActiveViewers] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const liveChannelRef = useRef<any>(null);

  const channelId = useMemo(() => {
    const target = user?.id || viewId;
    return target ? `live-dashboard-${target}` : null;
  }, [user?.id, viewId]);

  const loadDashboard = useCallback(async (silent = false) => {
    const targetUserId = user?.id || viewId;
    console.log("loadDashboard called. User:", user?.id, "ViewId:", viewId, "Silent:", silent);

    if (!targetUserId) {
      console.log("No user context for live dashboard.");
      setCampaigns([]);
      setSummariesByCampaign({});
      setLatestMetricsByCampaign({});
      setAllocations([]);
      return;
    }

    if (!silent) setLoading(true);
    try {
      // PROXY MODE via EDGE FUNCTION (TV/Public View without Login)
      if (!user && viewId) {
        console.log("Fetching live data via Edge Function (PROXY)... Target:", viewId);
        const { data, error } = await supabase.functions.invoke("view-live", {
          body: { targetUserId: viewId },
        });

        console.log("Edge Function Response:", { data, error });

        if (error) throw new Error(error.message || "Erro na edge function");
        if (!data) throw new Error("Nenhum dado retornado");

        // Map response to local state structure
        setCampaigns(data.campaigns || []);
        setSummariesByCampaign(data.summariesByCampaign || {});
        setLatestMetricsByCampaign(data.latestMetricsByCampaign || {});
        setAllocations(data.allocations || []);
        setMonthlyActuals(data.monthlyActuals || {});

        setLastUpdatedAt(new Date());
        return;
      }

      // DIRECT QUERY MODE (Authenticated User)
      // Only runs if user is logged in (normal flow)
      const currentUserId = user?.id || viewId; // Fallback just in case logic slips, but primarily user.id here

      let campaignsQuery = (supabase as any)
        .from("campaigns")
        .select("id,name,channel,status,project_id,budget_total,budget_spent,projects!inner(name)")
        .eq("user_id", currentUserId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (projectId) campaignsQuery = campaignsQuery.eq("project_id", projectId);

      const { data: campaignsData, error: campaignsError } = await campaignsQuery;
      if (campaignsError) throw campaignsError;

      const mappedCampaigns: CampaignRow[] = (campaignsData || []).map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        channel: campaign.channel,
        status: campaign.status,
        project_id: campaign.project_id,
        project_name: campaign.projects?.name || "Sem projeto",
        budget_total: Number(campaign.budget_total) || 0,
        budget_spent: Number(campaign.budget_spent) || 0,
      }));
      setCampaigns(mappedCampaigns);

      const campaignIds = mappedCampaigns.map((campaign) => campaign.id);
      const summaryMap: Record<string, MetricsSummaryRow> = {};
      if (campaignIds.length > 0) {
        const { data: summariesData, error: summariesError } = await (supabase as any)
          .from("v_campaign_metrics_summary")
          .select("campaign_id,total_entries,total_impressions,total_clicks,total_conversions,total_leads,total_cost,total_revenue,total_sessions,avg_ctr,avg_cpc,avg_cpa,calc_roas")
          .eq("user_id", currentUserId)
          .in("campaign_id", campaignIds);
        if (summariesError) throw summariesError;
        (summariesData || []).forEach((summary: MetricsSummaryRow) => {
          summaryMap[summary.campaign_id] = summary;
        });
      }
      setSummariesByCampaign(summaryMap);

      const latestMap: Record<string, CampaignMetrics> = {};
      if (campaignIds.length > 0) {
        const { data: latestMetricsData, error: latestMetricsError } = await (supabase as any)
          .from("campaign_metrics")
          .select("id,campaign_id,user_id,period_start,period_end,impressions,clicks,ctr,cpc,cpm,conversions,cpa,roas,cost,revenue,reach,frequency,video_views,vtr,leads,cpl,quality_score,avg_position,search_impression_share,engagement_rate,sessions,first_visits,leads_month,mql_rate,sql_rate,clients_web,revenue_web,avg_ticket,google_ads_cost,cac_month,cost_per_conversion,ltv,cac_ltv_ratio,cac_ltv_benchmark,roi_accumulated,roi_period_months,notes,source,custom_metrics,created_at")
          .eq("user_id", currentUserId)
          .in("campaign_id", campaignIds)
          .order("period_end", { ascending: false })
          .order("created_at", { ascending: false });

        if (latestMetricsError) throw latestMetricsError;

        (latestMetricsData || []).forEach((metric: CampaignMetrics) => {
          if (!latestMap[metric.campaign_id]) {
            latestMap[metric.campaign_id] = metric;
          }
        });
      }
      setLatestMetricsByCampaign(latestMap);

      // Buscando métricas históricas para evolucao mensal (Real)
      const { data: historyMetricsData, error: historyMetricsError } = await (supabase as any)
        .from("campaign_metrics")
        .select("cost, period_end, created_at")
        .eq("user_id", currentUserId)
        .in("campaign_id", campaignIds)
        .not("period_end", "is", null);

      if (historyMetricsError) throw historyMetricsError;

      const calculatedMonthlyActuals: Record<string, number> = {};
      (historyMetricsData || []).forEach((metric: any) => {
        const dateStr = metric.period_end || metric.created_at;
        if (!dateStr) return;
        const date = new Date(dateStr);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        calculatedMonthlyActuals[key] = (calculatedMonthlyActuals[key] || 0) + (Number(metric.cost) || 0);
      });
      setMonthlyActuals(calculatedMonthlyActuals);

      let budgetQuery = (supabase as any)
        .from("budget_allocations")
        .select("id,month,year,planned_budget,actual_spent,channel")
        .eq("user_id", currentUserId)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      if (projectId) budgetQuery = budgetQuery.eq("project_id", projectId);

      const { data: allocationsData, error: allocationsError } = await budgetQuery;
      if (allocationsError) throw allocationsError;
      setAllocations((allocationsData || []).map((row: any) => ({
        id: row.id,
        month: row.month,
        year: row.year,
        planned_budget: Number(row.planned_budget) || 0,
        actual_spent: Number(row.actual_spent) || 0,
        channel: row.channel,
      })));

      // Fetch Active Viewers (Wider window)
      // Fetch Active Viewers (Wider window)
      if (user) {
        // Widen window to 10 minutes to be extremely safe about timezones
        const timeWindow = new Date(Date.now() - 600 * 1000).toISOString();

        const { data: viewersData, error: viewersError } = await (supabase as any)
          .from("live_dashboard_access_logs")
          .select("viewer_ip")
          .eq("user_id", user.id)
          .gte("created_at", timeWindow);

        if (!viewersError && viewersData) {
          // Count unique IPs to avoid inflating count on page refreshes
          const uniqueIPs = new Set(viewersData.map((v: any) => v.viewer_ip)).size;
          setActiveViewers(uniqueIPs);
        }
      }

      setLastUpdatedAt(new Date());
    } catch (error: any) {
      console.error("Error loading live dashboard:", error);
      toast.error(error.message || "Erro ao carregar dashboard (TV Mode/Direct)");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [projectId, user, viewId]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!isLive) return;
    if (!user && !viewId) return;

    const interval = window.setInterval(() => void loadDashboard(true), 15000);
    return () => window.clearInterval(interval);
  }, [isLive, loadDashboard, user, viewId]);

  // Realtime canal para sincronizar play/pause entre dono e viewers
  useEffect(() => {
    if (!channelId) return;

    const channel = supabase.channel(channelId, { config: { broadcast: { ack: true } } });
    liveChannelRef.current = channel;

    channel.on('broadcast', { event: 'live_toggle' }, (payload) => {
      if (typeof payload?.payload?.isLive === 'boolean') {
        setIsLive(payload.payload.isLive);
      }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // noop
      }
    });

    return () => {
      channel.unsubscribe();
      liveChannelRef.current = null;
    };
  }, [channelId]);

  useEffect(() => {
    if (!authLoading && !user && isLive && !viewId) {
      setIsLive(false);
      toast.warning("Transmissão pausada: faça login para continuar.");
    }
  }, [authLoading, isLive, user, viewId]);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const projectName = useMemo(() => {
    if (campaigns.length === 0) return projectId ? "Projeto selecionado" : "Todos os projetos";
    return projectId ? campaigns[0].project_name : "Todos os projetos";
  }, [campaigns, projectId]);

  const totals = useMemo(() => {
    let budgetTotal = 0;
    let mediaCost = 0;
    let revenue = 0;
    let conversions = 0;
    let impressions = 0;
    let clicks = 0;
    let leads = 0;
    let sessions = 0;

    let manualLtv = 0;
    let manualAvgTicket = 0;

    campaigns.forEach((campaign) => {
      const summary = summariesByCampaign[campaign.id];
      const latest = latestMetricsByCampaign[campaign.id];

      if (latest?.ltv && latest.ltv > manualLtv) manualLtv = latest.ltv;
      if (latest?.avg_ticket && latest.avg_ticket > manualAvgTicket) manualAvgTicket = latest.avg_ticket;

      budgetTotal += campaign.budget_total || 0;

      // Sum basic aggregates
      mediaCost += campaign.budget_spent || summary?.total_cost || latest?.cost || latest?.google_ads_cost || 0;
      impressions += summary?.total_impressions || latest?.impressions || 0;
      clicks += summary?.total_clicks || latest?.clicks || 0;
      sessions += summary?.total_sessions || latest?.sessions || 0;

      // Revenue & Conversions & Leads prioritization logic
      // For Google/Performance campaigns, we prefer specific 'web' metrics from latest snapshot if available
      // otherwise fallback to summary aggregates, then generic latest metrics.

      let campRevenue = 0;
      let campConversions = 0;
      let campLeads = 0;

      if (campaign.channel === 'google' && latest) {
        campRevenue = latest.revenue_web || latest.revenue || summary?.total_revenue || 0;
        campConversions = latest.clients_web || latest.conversions || summary?.total_conversions || 0;
        campLeads = latest.leads_month || latest.leads || summary?.total_leads || 0;
      } else {
        // Standard fallback for other channels
        campRevenue = summary?.total_revenue || latest?.revenue || 0;
        campConversions = summary?.total_conversions || latest?.conversions || 0;
        campLeads = summary?.total_leads || latest?.leads || 0;
      }

      revenue += campRevenue;
      conversions += campConversions;
      leads += campLeads;
    });

    const cac = conversions > 0 ? mediaCost / conversions : 0;
    const avgTicket = manualAvgTicket > 0 ? manualAvgTicket : (conversions > 0 ? revenue / conversions : 0);

    // LTV Estimate: usa manual se setado, senao ticket * 6
    const ltv = manualLtv > 0 ? manualLtv : (avgTicket > 0 ? avgTicket * 6 : 0);

    const cacLtvRatio = cac > 0 && ltv > 0 ? ltv / cac : 0;

    // Payback (ROI Period)
    const paybackMonths = avgTicket > 0 ? cac / avgTicket : 0;

    return {
      budgetTotal,
      mediaCost,
      revenue,
      conversions,
      impressions,
      clicks,
      leads,
      sessions,
      roas: mediaCost > 0 ? revenue / mediaCost : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cac,
      avgTicket,
      ltv,
      cacLtvRatio,
      sessionsToLeads: sessions > 0 ? (leads / sessions) * 100 : 0,
      leadsToSales: leads > 0 ? (conversions / leads) * 100 : 0,
      paybackMonths: avgTicket > 0 ? cac / avgTicket : 0,
    };
  }, [campaigns, summariesByCampaign, latestMetricsByCampaign]);

  const currentMonthBudget = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const rows = allocations.filter((item) => item.month === month && item.year === year);
    const planned = rows.reduce((sum, item) => sum + item.planned_budget, 0);

    // Na dashboard, a visão ao vivo do atual mês bate sempre com as campanhas (saldo em tempo real)
    const actual = campaigns.reduce((sum, item) => sum + item.budget_spent, 0);

    const pacing = planned > 0 ? (actual / planned) * 100 : 0;
    return { planned, actual, pacing };
  }, [allocations, campaigns]);

  const byChannel = useMemo(() => {
    return CHANNEL_ORDER.map((channel) => {
      const rows = campaigns.filter((campaign) => campaign.channel === channel);
      const budget = rows.reduce((sum, row) => sum + row.budget_total, 0);
      const cost = rows.reduce((sum, row) => sum + row.budget_spent, 0);
      return {
        channel,
        campaigns: rows.length,
        budget,
        cost,
        pacing: budget > 0 ? (cost / budget) * 100 : 0,
      };
    }).filter((item) => item.campaigns > 0);
  }, [campaigns, summariesByCampaign]);



  const shareUrl = `${window.location.origin}/operations/live-dashboard?${new URLSearchParams({
    ...(projectId ? { projectId } : {}),
    ...(user ? { viewId: user.id } : {}), // Adiciona viewId para permitir visualizacao publica se RLS permitir
  }).toString()}`;

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch {
      toast.error("Navegador bloqueou o modo tela cheia");
    }
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link do dashboard copiado");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const handleToggleLive = () => {
    setIsLive((prev) => {
      const next = !prev;
      if (liveChannelRef.current) {
        liveChannelRef.current.send({
          type: 'broadcast',
          event: 'live_toggle',
          payload: { isLive: next },
        });
      }
      return next;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Carregando autenticação...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#070b16] text-foreground">
      <SEO title="Dashboard Operacional Ao Vivo | Intentia" description="Visão geral de campanhas, métricas e budget em tela cheia." />
      <div className="absolute inset-0 -z-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,125,55,0.13),transparent_40%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,125,55,0.18),transparent_35%),linear-gradient(180deg,#070b16_0%,#090f1d_100%)]" />

      <div className="max-w-[1700px] mx-auto p-4 lg:p-6 space-y-4">
        <Card className="border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur">
          <CardContent className="py-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Link to="/operations"><Button variant="outline" size="sm" className="gap-1.5"><ArrowLeft className="h-4 w-4" />Voltar</Button></Link>
              <Badge variant="secondary" className="text-xs">{projectName}</Badge>
              {isLive && (user || viewId) ? (
                <Badge className="gap-1.5 bg-red-600 text-white hover:bg-red-600 animate-pulse">
                  <Radio className="h-3.5 w-3.5" /> AO VIVO
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <PauseCircle className="h-3.5 w-3.5" /> Transmissão pausada
                </Badge>
              )}
              {user && (
                <Badge variant="outline" className={`gap-1.5 text-xs ${activeViewers > 0 ? "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900" : "text-slate-500"}`}>
                  <Eye className="h-3.5 w-3.5" /> {activeViewers} visualizando
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => void loadDashboard()}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Atualizar</Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyShareUrl}><Copy className="h-4 w-4" />Copiar link</Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleToggleFullscreen}>{isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}{isFullscreen ? "Sair tela cheia" : "Tela cheia"}</Button>
              {user && (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleToggleLive}
                  disabled={!user}
                >
                  {isLive ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  {isLive ? "Parar transmissão" : "Transmitir ao vivo"}
                </Button>
              )}
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {!user && !viewId && (
          <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300">Transmissão ao vivo interrompida</p>
                  <p className="text-sm text-red-700/80 dark:text-red-300/80">Faça login para continuar a transmissão e atualizar os dados em tempo real.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <SectionTitle title="Vendas & Operação" colorClass="text-blue-500" />
        <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-3">
          <TopCard icon={Megaphone} title="Campanhas" value={String(campaigns.length)} helper="Total ativas/pausadas" />
          <TopCard icon={Eye} title="Impressões" value={formatNumber(totals.impressions)} helper={`CTR geral ${formatPercent(totals.ctr)}`} />
          <TopCard icon={MousePointerClick} title="Cliques" value={formatNumber(totals.clicks)} helper="Tráfego consolidado" />
          <TopCard icon={Target} title="Conversões" value={formatNumber(totals.conversions)} helper="Resultados totais" />
          <TopCard icon={DollarSign} title="Custo Total" value={formatCurrency(totals.mediaCost)} helper={`Meta mês ${formatCurrency(currentMonthBudget.planned)}`} />
          <TopCard icon={TrendingUp} title="Receita" value={formatCurrency(totals.revenue)} helper={`ROAS ${totals.roas.toFixed(2)}x`} />
          <TopCard icon={Wallet} title="Regressiva" value={formatCurrency(Math.max(currentMonthBudget.planned - currentMonthBudget.actual, 0))} helper="Falta para meta do mês" />
        </div>

        <SectionTitle title="Indicadores Marketing" colorClass="text-fuchsia-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <TopCard icon={BarChart3} title="Leads Gerados" value={formatNumber(totals.leads)} helper={`Via ${formatNumber(totals.sessions)} sessões`} />
          <TopCard icon={DollarSign} title="Ticket Médio" value={formatCurrency(totals.avgTicket)} helper="Receita / conversões" />
          <TopCard icon={CircleGauge} title="CAC" value={formatCurrency(totals.cac)} helper="Custo por cliente" />
          <TopCard icon={Users} title="Clientes Web" value={formatNumber(totals.conversions)} helper="Vendas site" />
        </div>

        <SectionTitle title="Funil de Conversão" colorClass="text-amber-500" />
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-3">
          <TopCard icon={Filter} title="Taxa MQL" value={formatPercent(totals.sessionsToLeads)} helper="Sessões -> Leads" />
          <TopCard icon={Target} title="Taxa SQL" value={formatPercent(totals.leadsToSales)} helper="Leads -> Vendas" />
          <TopCard icon={Clock3} title="Payback (ROI)" value={`${totals.paybackMonths.toFixed(1)} meses`} helper="Tempo recuperação" />
          <TopCard icon={Coins} title="LTV (12M est.)" value={formatCurrency(totals.ltv)} helper="Lifetime estimado" />
          <TopCard icon={Activity} title="ROI Atual" value={`${(totals.roas * 100).toFixed(1)}%`} helper="Retorno direto" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Relação CAC:LTV</p>
                <span className="text-xs text-emerald-500 font-semibold">{totals.cacLtvRatio >= 3 ? "Bom" : "Atenção"}</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500" style={{ width: `${Math.min((totals.cacLtvRatio / 6) * 100, 100)}%` }} />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground"><span>0:1</span><span>3:1 mínimo saudável</span><span>6:1</span></div>
              <p className="mt-3 text-3xl font-bold text-emerald-500">{totals.cacLtvRatio.toFixed(1)}:1</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
            <CardContent className="pt-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Resumo do período</p>
              <div className="space-y-1.5 text-sm">
                <SummaryRow label="Investimento Ads" value={formatCurrency(totals.mediaCost)} />
                <SummaryRow label="Receita Web" value={formatCurrency(totals.revenue)} valueClass="text-emerald-500" />
                <SummaryRow label="ROI Atual" value={`${(totals.roas * 100).toFixed(1)}%`} valueClass="text-primary" />
                <SummaryRow label="Payback Estimado" value={`${totals.paybackMonths.toFixed(1)} meses`} valueClass="text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {byChannel.map((channel) => (
            <Card key={channel.channel} className={`border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 ${CHANNEL_META[channel.channel].ring}`}>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={CHANNEL_META[channel.channel].logo} alt={CHANNEL_LABELS[channel.channel]} className="h-4 w-4 object-contain" />
                    <p className={`text-sm font-semibold ${CHANNEL_META[channel.channel].accent}`}>{CHANNEL_LABELS[channel.channel]}</p>
                  </div>
                  <Badge variant="outline" className="text-[11px]">{channel.campaigns} campanhas</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Custo {formatCurrency(channel.cost)}</p>
                <p className="text-xs text-muted-foreground">Budget {formatCurrency(channel.budget)}</p>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${channel.pacing >= 100 ? "bg-red-500" : channel.pacing >= 80 ? "bg-primary" : "bg-emerald-500"}`} style={{ width: `${Math.min(channel.pacing, 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
          {campaigns.map((campaign) => {
            const summary = summariesByCampaign[campaign.id];
            const latestMetric = latestMetricsByCampaign[campaign.id];
            const budgetPacing = campaign.budget_total > 0 ? ((campaign.budget_spent || 0) / campaign.budget_total) * 100 : 0;
            const metricCards = buildCampaignMetricCards(campaign, latestMetric, summary);
            return (
              <Card key={campaign.id} className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
                <CardHeader className="pb-3">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-base truncate flex items-center gap-2">
                        <img src={CHANNEL_META[campaign.channel].logo} alt={CHANNEL_LABELS[campaign.channel]} className="h-4 w-4 object-contain flex-shrink-0" />
                        <span className="truncate">{campaign.name}</span>
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <Badge variant="secondary">{CAMPAIGN_STATUS_LABELS[campaign.status]}</Badge>
                        <Badge variant="outline" className={CHANNEL_META[campaign.channel].accent}>{CHANNEL_LABELS[campaign.channel]}</Badge>
                        <span className="text-muted-foreground">{campaign.project_name}</span>
                        {latestMetric?.period_start && latestMetric?.period_end && (
                          <span className="text-muted-foreground">
                            {latestMetric.period_start} - {latestMetric.period_end}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground min-w-[180px]">
                      <div className="flex justify-between mb-1"><span>Budget pacing</span><span>{formatPercent(budgetPacing)}</span></div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${budgetPacing >= 100 ? "bg-red-500" : budgetPacing >= 80 ? "bg-primary" : "bg-emerald-500"}`} style={{ width: `${Math.min(budgetPacing, 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2">
                    {metricCards.map((item) => (
                      <MetricCard
                        key={`${campaign.id}-${item.label}`}
                        icon={item.icon}
                        label={item.label}
                        value={item.value}
                        helper={item.helper}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90">
          <CardHeader className="pb-2"><CardTitle className="text-base">Lista Resumida (final)</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <span className="inline-flex items-center gap-1.5">
                      <Megaphone className="h-3.5 w-3.5 text-primary" />
                      Campanha
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      Canal
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1.5">
                      <CircleGauge className="h-3.5 w-3.5 text-primary" />
                      Status
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1.5 justify-end">
                      <Wallet className="h-3.5 w-3.5 text-blue-500" />
                      Planejado
                    </span>
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1.5 justify-end">
                      <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                      Investido
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => {
                  const summary = summariesByCampaign[campaign.id];
                  const statusMeta = getStatusMeta(campaign.status);
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="font-medium inline-flex items-center gap-2">
                          <Megaphone className="h-3.5 w-3.5 text-primary/80" />
                          {campaign.name}
                        </div>
                        <div className="text-xs text-muted-foreground">{campaign.project_name}</div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2">
                          <img
                            src={CHANNEL_META[campaign.channel].logo}
                            alt={CHANNEL_LABELS[campaign.channel]}
                            className="h-4 w-4 object-contain"
                          />
                          {CHANNEL_LABELS[campaign.channel]}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 ${statusMeta.className}`}>
                          <statusMeta.Icon className="h-3.5 w-3.5" />
                          {CAMPAIGN_STATUS_LABELS[campaign.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(campaign.budget_total || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(campaign.budget_spent || 0)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
                  <TableCell colSpan={3} className="text-right font-medium">Total Geral:</TableCell>
                  <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(campaigns.reduce((sum, c) => sum + (c.budget_total || 0), 0))}
                  </TableCell>
                  <TableCell className="text-right font-bold text-amber-600 dark:text-amber-500">
                    {formatCurrency(campaigns.reduce((sum, c) => sum + (c.budget_spent || 0), 0))}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5" />
          Última atualização: {lastUpdatedAt ? lastUpdatedAt.toLocaleTimeString("pt-BR") : "-"}
          {isLive && user && " • atualização automática a cada 15 segundos"}
        </div>

        <div className="mt-8 border-t border-slate-700/30 pt-4">
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-primary">Debug Dados Brutos (Clique para expandir)</summary>
            {user && (
              <div className="mt-2 p-4 bg-slate-950 text-slate-300 rounded overflow-auto max-h-96 font-mono text-[10px]">
                <p className="font-bold text-emerald-400 mb-2">Exemplo Campanha Google (Latest Metrics):</p>
                <pre>{JSON.stringify(Object.values(latestMetricsByCampaign).find(m => {
                  const camp = campaigns.find(c => c.id === m.campaign_id);
                  return camp?.channel === 'google';
                }) || "Nenhuma métrica google encontrada no latestMap", null, 2)}</pre>

                <p className="font-bold text-blue-400 mt-4 mb-2">Totals Object:</p>
                <pre>{JSON.stringify(totals, null, 2)}</pre>

                <p className="font-bold text-amber-400 mt-4 mb-2">Summaries Map (ids):</p>
                <pre>{JSON.stringify(Object.keys(summariesByCampaign), null, 2)}</pre>
              </div>
            )}
          </details>
        </div>
      </div>
    </div>
  );
}

function TopCard({ icon: Icon, title, value, helper }: { icon: React.ElementType; title: string; value: string; helper: string }) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:border-primary/30 transition-colors">
      <CardContent className="pt-4">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-primary" />{title}</p>
        <p className="text-xl font-bold mt-1">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{helper}</p>
      </CardContent>
    </Card>
  );
}

function getStatusMeta(status: CampaignStatus): { Icon: React.ElementType; className: string } {
  if (status === "active") return { Icon: PlayCircle, className: "text-emerald-500" };
  if (status === "paused") return { Icon: PauseCircle, className: "text-amber-500" };
  if (status === "completed") return { Icon: CheckCircle2, className: "text-blue-500" };
  if (status === "archived") return { Icon: Archive, className: "text-muted-foreground" };
  return { Icon: FileText, className: "text-violet-500" };
}

type DashboardMetricCardItem = {
  label: string;
  value: string;
  helper?: string;
  icon?: React.ElementType;
};

function buildCampaignMetricCards(
  campaign: CampaignRow,
  metric: CampaignMetrics | undefined,
  summary: MetricsSummaryRow | undefined
): DashboardMetricCardItem[] {
  const channel = campaign.channel;
  const baseCost = campaign.budget_spent || summary?.total_cost || 0;
  if (!metric) {
    return [
      { icon: Eye, label: "Impressões", value: formatNumber(summary?.total_impressions || 0) },
      { icon: MousePointerClick, label: "Cliques", value: formatNumber(summary?.total_clicks || 0), helper: `CTR ${formatPercent(summary?.avg_ctr || 0)}` },
      { icon: Target, label: "Conversões", value: formatNumber(summary?.total_conversions || 0) },
      { icon: BarChart3, label: "Leads", value: formatNumber(summary?.total_leads || 0) },
      { label: "Custo Total", value: formatCurrency(baseCost) },
      { label: "Receita", value: formatCurrency(summary?.total_revenue || 0), helper: `ROAS ${(summary?.calc_roas || 0).toFixed(2)}x` },
      { label: "Sessões", value: formatNumber(summary?.total_sessions || 0) },
      { label: "CPA", value: formatCurrency(summary?.avg_cpa || 0) },
    ];
  }

  const common: DashboardMetricCardItem[] = [
    { icon: Eye, label: "Impressões", value: formatNumber(metric.impressions) },
    { icon: MousePointerClick, label: "Cliques", value: formatNumber(metric.clicks), helper: `CTR ${formatPercent(metric.ctr)}` },
    { label: "CPC", value: formatCurrency(metric.cpc) },
    { label: "CPM", value: formatCurrency(metric.cpm) },
    { icon: Target, label: "Conversões", value: formatNumber(metric.conversions) },
    { label: "CPA", value: formatCurrency(metric.cpa) },
    { label: "Custo Total", value: formatCurrency(campaign.budget_spent || metric.cost || 0) },
    { label: "Receita", value: formatCurrency(metric.revenue) },
    { label: "ROAS", value: `${(metric.roas || 0).toFixed(2)}x` },
  ];

  if (channel === "google") {
    // Helper para pegar valor: tenta do metric (periodo atual), senao do summary (acumulado)
    const getVal = (mVal: number | undefined, sVal: number | undefined) => (mVal && mVal > 0 ? mVal : sVal || 0);

    const sessions = getVal(metric.sessions, summary?.total_sessions) || 1;
    const leads = getVal(metric.leads_month || metric.leads, summary?.total_leads);
    const conversions = getVal(metric.clients_web || metric.conversions, summary?.total_conversions);
    const revenue = getVal(metric.revenue_web || metric.revenue, summary?.total_revenue);
    const cost = campaign.budget_spent || getVal(metric.google_ads_cost || metric.cost, summary?.total_cost);

    /* 
      Cálculos de Taxas:
      Prioridade 1: Valor já calculado no metric (se > 0)
      Prioridade 2: Calcular usando dados do metric (se bases > 0)
      Prioridade 3: Calcular usando dados acumulados do summary
    */

    // MQL Rate (Leads / Sessões)
    const mqlRate = (metric.mql_rate && metric.mql_rate > 0)
      ? metric.mql_rate
      : (sessions > 0 ? (leads / sessions) * 100 : 0);

    // SQL Rate (Conv / Leads)
    const sqlRate = (metric.sql_rate && metric.sql_rate > 0)
      ? metric.sql_rate
      : (leads > 0 ? (conversions / leads) * 100 : 0);

    // Ticket Médio
    const avgTicket = (metric.avg_ticket && metric.avg_ticket > 0)
      ? metric.avg_ticket
      : (conversions > 0 ? revenue / conversions : 0);

    // CAC Mensal (Custo / Conv) - ou Geral
    const cacVal = (metric.cac_month && metric.cac_month > 0)
      ? metric.cac_month
      : (conversions > 0 ? cost / conversions : 0);

    // LTV
    const ltv = (metric.ltv && metric.ltv > 0)
      ? metric.ltv
      : (avgTicket * 6); // Estimativa padrão

    // CAC:LTV Ratio
    const cacLtvRatio = (metric.cac_ltv_ratio && metric.cac_ltv_ratio > 0)
      ? metric.cac_ltv_ratio
      : (cacVal > 0 ? ltv / cacVal : 0);

    // Payback (ROI Period)
    const paybackMonths = (metric.roi_period_months && metric.roi_period_months > 0)
      ? metric.roi_period_months
      : (avgTicket > 0 ? cacVal / avgTicket : 0);

    // ROI Acumulado
    const roiAccumulated = (metric.roi_accumulated && metric.roi_accumulated > 0)
      ? metric.roi_accumulated
      : (cost > 0 ? ((revenue - cost) / cost) * 100 : 0);

    return [
      ...common,
      { label: "Sessões", value: formatNumber(sessions) },
      { label: "1ª Visita", value: formatNumber(metric.first_visits || 0) },
      { label: "Leads", value: formatNumber(leads) },
      { label: "Taxa Usuário → MQL", value: formatPercent(mqlRate) },
      { label: "Taxa Lead → SQL", value: formatPercent(sqlRate) },
      { label: "Clientes Web", value: formatNumber(conversions) },
      { label: "Receita Web", value: formatCurrency(revenue) },
      { label: "Ticket Médio", value: formatCurrency(avgTicket) },
      { label: "Custo Google Ads", value: formatCurrency(cost) },
      { label: "CAC", value: formatCurrency(cacVal) },
      { label: "Custo/Conversão", value: formatCurrency(metric.cost_per_conversion || (conversions > 0 ? cost / conversions : 0)) },
      { label: "LTV Estimado", value: formatCurrency(ltv) },
      { label: "Relação CAC:LTV", value: `${cacLtvRatio.toFixed(2)}x` },
      { label: "Benchmark CAC:LTV", value: `${(metric.cac_ltv_benchmark || 3).toFixed(2)}x` }, // default 3x benchmark
      { label: "ROI Acumulado", value: formatPercent(roiAccumulated) },
      { label: "Payback (ROI)", value: `${paybackMonths.toFixed(1)} meses` },
      { label: "Índice de Qualidade", value: (metric.quality_score || 0).toFixed(2) },
      { label: "Posição Média", value: (metric.avg_position || 0).toFixed(2) },
      { label: "Impression Share", value: formatPercent(metric.search_impression_share) },
    ];
  }

  if (channel === "meta") {
    return [
      ...common,
      { label: "Alcance", value: formatNumber(metric.reach || 0) },
      { label: "Frequência", value: (metric.frequency || 0).toFixed(2) },
    ];
  }

  if (channel === "linkedin") {
    return [
      ...common,
      { label: "Leads", value: formatNumber(metric.leads || summary?.total_leads || 0) },
      { label: "CPL", value: formatCurrency(metric.cpl || summary?.avg_cpa || 0) },
      { label: "Engagement Rate", value: formatPercent(metric.engagement_rate || 0) },
    ];
  }

  if (channel === "tiktok") {
    return [
      ...common,
      { label: "Video Views", value: formatNumber(metric.video_views || 0) },
      { label: "VTR", value: formatPercent(metric.vtr || 0) },
    ];
  }

  return common;
}

function MetricCard({ icon: Icon, label, value, helper }: { icon?: React.ElementType; label: string; value: string; helper?: string }) {
  const visual = getMetricVisual(label, Icon);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 flex flex-col justify-between h-full min-h-[100px]">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1.5 mb-2">
          <span className={`inline-flex items-center justify-center h-5 w-5 rounded-md ${visual.bgClass}`}>
            <visual.Icon className={`h-3.5 w-3.5 ${visual.iconClass}`} />
          </span>
          <span className="truncate" title={label}>{label}</span>
        </p>
        <p className="text-xl font-bold leading-none tracking-tight">{value}</p>
      </div>
      {helper ? <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">{helper}</p> : null}
    </div>
  );
}

function getMetricVisual(label: string, explicitIcon?: React.ElementType): { Icon: React.ElementType; bgClass: string; iconClass: string } {
  if (explicitIcon) {
    return { Icon: explicitIcon, bgClass: "bg-primary/15", iconClass: "text-primary" };
  }

  const key = label.toLowerCase();

  // Mapeamento visual aprimorado
  if (key.includes("receita") || key.includes("roas") || key.includes("roi") || key.includes("ltv")) {
    return { Icon: TrendingUp, bgClass: "bg-emerald-500/15", iconClass: "text-emerald-500" };
  }
  if (key.includes("custo") || key.includes("cpc") || key.includes("cpm") || key.includes("cpa") || key.includes("cac") || key.includes("cpl")) {
    return { Icon: DollarSign, bgClass: "bg-amber-500/15", iconClass: "text-amber-500" };
  }
  if (key.includes("taxa") || key.includes("share") || key.includes("vtr")) {
    return { Icon: Percent, bgClass: "bg-blue-500/15", iconClass: "text-blue-500" };
  }
  if (key.includes("leads") || key.includes("clientes")) {
    return { Icon: Users, bgClass: "bg-fuchsia-500/15", iconClass: "text-fuchsia-500" };
  }
  if (key.includes("sessões") || key.includes("posição") || key.includes("qualidade")) {
    return { Icon: CircleGauge, bgClass: "bg-violet-500/15", iconClass: "text-violet-500" };
  }
  if (key.includes("web")) {
    return { Icon: Globe, bgClass: "bg-sky-500/15", iconClass: "text-sky-500" };
  }
  if (key.includes("ticket") || key.includes("ltv")) {
    return { Icon: Coins, bgClass: "bg-lime-500/15", iconClass: "text-lime-500" };
  }
  if (key.includes("período")) {
    return { Icon: Clock3, bgClass: "bg-indigo-500/15", iconClass: "text-indigo-500" };
  }
  if (key.includes("convers")) {
    return { Icon: Target, bgClass: "bg-rose-500/15", iconClass: "text-rose-500" };
  }
  if (key.includes("frequência")) {
    return { Icon: RefreshCw, bgClass: "bg-cyan-500/15", iconClass: "text-cyan-500" };
  }
  if (key.includes("video")) {
    return { Icon: PlayCircle, bgClass: "bg-pink-500/15", iconClass: "text-pink-500" };
  }
  if (key.includes("impress")) {
    return { Icon: Eye, bgClass: "bg-blue-500/15", iconClass: "text-blue-500" };
  }
  if (key.includes("cliques")) {
    return { Icon: MousePointerClick, bgClass: "bg-cyan-500/15", iconClass: "text-cyan-500" };
  }

  return { Icon: Calculator, bgClass: "bg-primary/15", iconClass: "text-primary" };
}

function SectionTitle({ title, colorClass }: { title: string; colorClass: string }) {
  return <div className={`text-xs font-semibold uppercase tracking-wider ${colorClass}`}>{title}</div>;
}

function SummaryRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-1">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

