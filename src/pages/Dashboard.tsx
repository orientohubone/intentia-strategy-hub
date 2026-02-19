import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { ChannelCard } from "@/components/ChannelCard";
import { StatsCard } from "@/components/StatsCard";
import { ScoreRing } from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Target, BarChart3, Zap, FileText, FileSpreadsheet, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, TrendingUp, ArrowRight, Megaphone, Play, Pause, CheckCircle2, Archive, FileEdit, DollarSign, Globe, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportDashboardPdf } from "@/lib/reportGenerator";
import { exportProjectsCsv } from "@/lib/exportCsv";
import { cn } from "@/lib/utils";
import { useTenantData } from "@/hooks/useTenantData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  type CampaignChannel,
  type CampaignStatus,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
} from "@/lib/operationalTypes";

type Insight = {
  id: string;
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action?: string | null;
};

type ChannelScore = {
  project_id: string;
  channel: "google" | "meta" | "linkedin" | "tiktok";
  score: number;
  objective?: string | null;
  funnel_role?: string | null;
  is_recommended?: boolean | null;
  risks?: string[] | null;
};

type CampaignListItem = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  budget_total: number | null;
  budget_spent: number | null;
  project_id: string;
  created_at: string;
};

type DashboardStatsState = {
  insights: Insight[];
  audiencesCount: number;
  benchmarksCount: number;
  insightsThisWeek: number;
  projectsThisMonth: number;
  totalInsightsCount: number;
  recentCampaigns: {
    id: string;
    name: string;
    channel: CampaignChannel;
    status: CampaignStatus;
    budget_total: number;
    budget_spent: number;
    project_name: string;
  }[];
};

const statusMap = {
  pending: "pendente",
  analyzing: "em_analise",
  completed: "completo",
} as const;

const DASHBOARD_CACHE_TTL = 1000 * 60 * 2;
const dashboardStatsCache = new Map<string, { data: DashboardStatsState; timestamp: number }>();
const dashboardStatsInFlight = new Map<string, Promise<DashboardStatsState>>();
const dashboardChannelsCache = new Map<string, { data: Record<string, ChannelScore[]>; timestamp: number }>();
const dashboardChannelsInFlight = new Map<string, Promise<Record<string, ChannelScore[]>>>();
const DASHBOARD_BLOCKS_STORAGE_KEY_PREFIX = "dashboard:block-order";
const DASHBOARD_BLOCKS_DEFAULT_ORDER = ["stats", "main", "channels"] as const;
type DashboardBlockId = typeof DASHBOARD_BLOCKS_DEFAULT_ORDER[number];

const isValidBlockOrder = (order: unknown): order is DashboardBlockId[] => {
  if (!Array.isArray(order)) return false;
  if (order.length !== DASHBOARD_BLOCKS_DEFAULT_ORDER.length) return false;
  const asSet = new Set(order);
  return DASHBOARD_BLOCKS_DEFAULT_ORDER.every((id) => asSet.has(id));
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "Sem atualização";
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR");
};

export default function Dashboard() {
  const { user } = useAuth();
  const userId = user?.id;
  const { projects, loading } = useTenantData();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [channelScores, setChannelScores] = useState<Record<string, ChannelScore[]>>({});
  const [audiencesCount, setAudiencesCount] = useState(0);
  const [benchmarksCount, setBenchmarksCount] = useState(0);
  const [insightsThisWeek, setInsightsThisWeek] = useState(0);
  const [projectsThisMonth, setProjectsThisMonth] = useState(0);
  const [totalInsightsCount, setTotalInsightsCount] = useState(0);
  const [insightsExpanded, setInsightsExpanded] = useState(false);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [selectedChannelProjectId, setSelectedChannelProjectId] = useState<string | null>(null);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const [recentCampaigns, setRecentCampaigns] = useState<{
    id: string;
    name: string;
    channel: CampaignChannel;
    status: CampaignStatus;
    budget_total: number;
    budget_spent: number;
    project_name: string;
  }[]>([]);
  const [campaignsExpanded, setCampaignsExpanded] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [dashboardBlocksOrder, setDashboardBlocksOrder] = useState<DashboardBlockId[]>([
    ...DASHBOARD_BLOCKS_DEFAULT_ORDER,
  ]);
  const [dashboardBlocksLoaded, setDashboardBlocksLoaded] = useState(false);
  const [draggingBlockId, setDraggingBlockId] = useState<DashboardBlockId | null>(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const blockDragStartPos = useRef({ x: 0, y: 0 });
  const blockDragMovedRef = useRef(false);
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email || "Usuário";
  const dashboardBlocksStorageKey = `${DASHBOARD_BLOCKS_STORAGE_KEY_PREFIX}:${userId || "guest"}`;

  const moveBlock = useCallback((sourceId: DashboardBlockId, targetId: DashboardBlockId) => {
    if (sourceId === targetId) return;
    setDashboardBlocksOrder((prev) => {
      const sourceIndex = prev.indexOf(sourceId);
      const targetIndex = prev.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const next = [...prev];
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, sourceId);
      return next;
    });
  }, []);

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: DashboardBlockId) => {
    setDraggingBlockId(blockId);
    setIsDraggingBlock(true);
    blockDragMovedRef.current = false;
    blockDragStartPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBlockMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingBlock || !draggingBlockId) return;
      const deltaX = e.clientX - blockDragStartPos.current.x;
      const deltaY = e.clientY - blockDragStartPos.current.y;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        blockDragMovedRef.current = true;
      }
    },
    [isDraggingBlock, draggingBlockId]
  );

  const handleBlockMouseUp = useCallback(() => {
    setIsDraggingBlock(false);
    setDraggingBlockId(null);
    blockDragMovedRef.current = false;
  }, []);

  const handleBlockHover = useCallback(
    (targetId: DashboardBlockId) => {
      if (!isDraggingBlock || !draggingBlockId || !blockDragMovedRef.current) return;
      if (draggingBlockId === targetId) return;
      moveBlock(draggingBlockId, targetId);
    },
    [isDraggingBlock, draggingBlockId, moveBlock]
  );

  useEffect(() => {
    if (!userId) {
      setInsights([]);
      setAudiencesCount(0);
      setBenchmarksCount(0);
      setInsightsThisWeek(0);
      setProjectsThisMonth(0);
      setTotalInsightsCount(0);
      setRecentCampaigns([]);
      setStatsLoading(false);
      return;
    }

    const applyState = (next: DashboardStatsState) => {
      setInsights(next.insights);
      setAudiencesCount(next.audiencesCount);
      setBenchmarksCount(next.benchmarksCount);
      setInsightsThisWeek(next.insightsThisWeek);
      setProjectsThisMonth(next.projectsThisMonth);
      setTotalInsightsCount(next.totalInsightsCount);
      setRecentCampaigns(next.recentCampaigns);
    };

    const cached = dashboardStatsCache.get(userId);
    const isValidCache = cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_TTL;
    if (isValidCache) {
      applyState(cached.data);
      setStatsLoading(false);
    } else {
      setStatsLoading(true);
    }

    const loadStats = async () => {
      if (dashboardStatsInFlight.has(userId)) {
        return dashboardStatsInFlight.get(userId)!;
      }

      const loadPromise = (async () => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [insightsRes, totalInsightsRes, weeklyInsightsRes, audiencesRes, benchmarksRes, projectsMonthRes, campaignsRes] = await Promise.all([
          supabase
            .from("insights")
            .select("id, type, title, description, action, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(6),
          supabase
            .from("insights")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("insights")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", oneWeekAgo),
          supabase
            .from("audiences")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("benchmarks")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("projects")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", oneMonthAgo),
          supabase
            .from("campaigns")
            .select("id, name, channel, status, budget_total, budget_spent, project_id, created_at")
            .eq("user_id", userId)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(6),
        ]);

        if (insightsRes.error) {
          console.error("Error fetching insights:", insightsRes.error);
        }
        if (weeklyInsightsRes.error) {
          console.error("Error fetching weekly insights:", weeklyInsightsRes.error);
        }
        if (audiencesRes.error) {
          console.error("Error fetching audiences count:", audiencesRes.error);
        }
        if (benchmarksRes.error) {
          console.error("Error fetching benchmarks count:", benchmarksRes.error);
        }
        if (projectsMonthRes.error) {
          console.error("Error fetching projects this month:", projectsMonthRes.error);
        }
        if (campaignsRes.error) {
          console.error("Error fetching campaigns:", campaignsRes.error);
        }

        const projectMap = new Map(projects.map((p) => [p.id, p.name]));
        const next: DashboardStatsState = {
          insights: ((insightsRes.data || []) as Insight[]),
          audiencesCount: audiencesRes.count || 0,
          benchmarksCount: benchmarksRes.count || 0,
          insightsThisWeek: weeklyInsightsRes.count || 0,
          projectsThisMonth: projectsMonthRes.count || 0,
          totalInsightsCount: totalInsightsRes.count || 0,
          recentCampaigns: ((campaignsRes.data || []) as CampaignListItem[]).map((c) => ({
            id: c.id,
            name: c.name,
            channel: c.channel,
            status: c.status,
            budget_total: c.budget_total || 0,
            budget_spent: c.budget_spent || 0,
            project_name: projectMap.get(c.project_id) || "Projeto",
          })),
        };

        dashboardStatsCache.set(userId, { data: next, timestamp: Date.now() });
        return next;
      })();

      dashboardStatsInFlight.set(userId, loadPromise);
      try {
        return await loadPromise;
      } finally {
        dashboardStatsInFlight.delete(userId);
      }
    };

    let active = true;
    loadStats()
      .then((next) => {
        if (!active) return;
        applyState(next);
      })
      .catch((err) => {
        console.error("Unexpected error fetching dashboard stats:", err);
      })
      .finally(() => {
        if (!active) return;
        setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, projects]);

  useEffect(() => {
    if (!userId || projects.length === 0) {
      setChannelScores({});
      setChannelsLoading(false);
      return;
    }

    const cached = dashboardChannelsCache.get(userId);
    const isValidCache = cached && Date.now() - cached.timestamp < DASHBOARD_CACHE_TTL;
    if (isValidCache) {
      setChannelScores(cached.data);
      setChannelsLoading(false);
    } else {
      setChannelsLoading(true);
    }

    const loadChannels = async () => {
      if (dashboardChannelsInFlight.has(userId)) {
        return dashboardChannelsInFlight.get(userId)!;
      }

      const loadPromise = (async () => {
        const { data, error } = await supabase
          .from("project_channel_scores")
          .select("project_id, channel, score, objective, funnel_role, is_recommended, risks")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching channel scores:", error);
          return {} as Record<string, ChannelScore[]>;
        }

        const grouped = (data || []).reduce((acc, item) => {
          acc[item.project_id] = acc[item.project_id] || [];
          acc[item.project_id].push(item as ChannelScore);
          return acc;
        }, {} as Record<string, ChannelScore[]>);

        dashboardChannelsCache.set(userId, { data: grouped, timestamp: Date.now() });
        return grouped;
      })();

      dashboardChannelsInFlight.set(userId, loadPromise);
      try {
        return await loadPromise;
      } finally {
        dashboardChannelsInFlight.delete(userId);
      }
    };

    let active = true;
    loadChannels()
      .then((grouped) => {
        if (!active) return;
        setChannelScores(grouped);
      })
      .finally(() => {
        if (!active) return;
        setChannelsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, projects.length]);

  const projectCards = useMemo(() => {
    return projects.map((project) => {
      const scores = channelScores[project.id] || [];
      const channelScoreMap = scores.reduce(
        (acc, score) => {
          acc[score.channel] = score.score;
          return acc;
        },
        { google: 0, meta: 0, linkedin: 0, tiktok: 0 }
      );

      return {
        name: project.name,
        niche: project.niche,
        url: project.url,
        score: project.score,
        status: statusMap[project.status],
        lastUpdate: formatDate(project.updated_at),
        channelScores: channelScoreMap,
      };
    });
  }, [projects, channelScores]);

  const averageScore = useMemo(() => {
    if (projects.length === 0) return 0;
    return Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length);
  }, [projects]);

  const latestProject = projects[0];
  const channelProject = selectedChannelProjectId
    ? projects.find((p) => p.id === selectedChannelProjectId)
    : latestProject;
  const activeChannelScores = channelProject ? channelScores[channelProject.id] || [] : [];

  useEffect(() => {
    if (projects.length > 0 && !selectedChannelProjectId) {
      setSelectedChannelProjectId(projects[0]?.id || null);
    }
  }, [projects, selectedChannelProjectId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(dashboardBlocksStorageKey);
    if (!stored) {
      setDashboardBlocksOrder([...DASHBOARD_BLOCKS_DEFAULT_ORDER]);
      setDashboardBlocksLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (isValidBlockOrder(parsed)) {
        setDashboardBlocksOrder(parsed);
        setDashboardBlocksLoaded(true);
        return;
      }
    } catch {
      // no-op
    }
    setDashboardBlocksOrder([...DASHBOARD_BLOCKS_DEFAULT_ORDER]);
    setDashboardBlocksLoaded(true);
  }, [dashboardBlocksStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!dashboardBlocksLoaded) return;
    window.localStorage.setItem(dashboardBlocksStorageKey, JSON.stringify(dashboardBlocksOrder));
  }, [dashboardBlocksOrder, dashboardBlocksStorageKey, dashboardBlocksLoaded]);

  useEffect(() => {
    if (!isDraggingBlock) return;

    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleBlockMouseMove);
    document.addEventListener("mouseup", handleBlockMouseUp);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.removeEventListener("mousemove", handleBlockMouseMove);
      document.removeEventListener("mouseup", handleBlockMouseUp);
    };
  }, [isDraggingBlock, handleBlockMouseMove, handleBlockMouseUp]);

  const visibleInsights = insightsExpanded ? insights : insights.slice(0, 3);
  const blockLabels: Record<DashboardBlockId, string> = {
    stats: "Indicadores",
    main: "Projetos e Insights",
    channels: "Visão por Canal",
  };

  const getBlockOrder = (blockId: DashboardBlockId) => {
    const idx = dashboardBlocksOrder.indexOf(blockId);
    return idx === -1 ? DASHBOARD_BLOCKS_DEFAULT_ORDER.indexOf(blockId) : idx;
  };

  return (
    <DashboardLayout>
      <SEO title="Dashboard" noindex />
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Dashboard Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Visão operacional dos seus projetos, campanhas e insights.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <ScoreRing score={averageScore} size="sm" />
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground">Score Médio</p>
                  <p className="text-sm font-semibold text-foreground">
                    {averageScore >= 70 ? "Alto" : averageScore >= 50 ? "Moderado" : averageScore > 0 ? "Baixo" : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:gap-6">
            {/* Stats Grid */}
            <section
              className={cn(
                "space-y-2 rounded-xl transition-colors",
                isDraggingBlock && draggingBlockId === "stats" && "opacity-80 ring-2 ring-primary/30"
              )}
              style={{ order: getBlockOrder("stats") }}
              onMouseEnter={() => handleBlockHover("stats")}
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onMouseDown={(e) => handleBlockMouseDown(e, "stats")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-grab active:cursor-grabbing"
                  aria-label={`Reorganizar bloco ${blockLabels.stats}`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                  {blockLabels.stats}
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatsCard
                title="Projetos Ativos"
                value={projects.length}
                change={projectsThisMonth}
                changeLabel={projectsThisMonth > 0 ? "vs. mês anterior" : "sem novos projetos"}
                icon={<FolderOpen className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Públicos Mapeados"
                value={audiencesCount}
                change={audiencesCount > 0 ? 25 : 0}
                changeLabel={audiencesCount > 0 ? "novos este mês" : "nenhum cadastrado"}
                icon={<Target className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Benchmarks"
                value={benchmarksCount}
                change={benchmarksCount > 0 ? 10 : 0}
                changeLabel={benchmarksCount > 0 ? "análises feitas" : "nenhuma análise"}
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Insights Gerados"
                value={totalInsightsCount}
                change={insightsThisWeek}
                changeLabel={insightsThisWeek > 0 ? "esta semana" : "nenhum novo"}
                icon={<Zap className="h-5 w-5 text-primary" />}
              />
              </div>
            </section>

            {/* Main Content Grid */}
            <section
              className={cn(
                "space-y-2 rounded-xl transition-colors",
                isDraggingBlock && draggingBlockId === "main" && "opacity-80 ring-2 ring-primary/30"
              )}
              style={{ order: getBlockOrder("main") }}
              onMouseEnter={() => handleBlockHover("main")}
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onMouseDown={(e) => handleBlockMouseDown(e, "main")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-grab active:cursor-grabbing"
                  aria-label={`Reorganizar bloco ${blockLabels.main}`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                  {blockLabels.main}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Projects Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Projetos Recentes</h2>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {projects.length > 0 && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            const companyName = (user?.user_metadata?.company_name as string) || "Empresa";
                            exportDashboardPdf({
                              userName: fullName,
                              companyName,
                              projects: projects.map(p => ({ name: p.name, score: p.score, status: statusMap[p.status], niche: p.niche, url: p.url })),
                              totalProjects: projects.length,
                              completedProjects: projects.filter(p => p.status === "completed").length,
                              averageScore,
                              channelScores: [],
                              recentInsights: insights.map(i => ({ type: i.type, title: i.title, description: i.description })),
                              audiencesCount,
                              benchmarksCount,
                            });
                          }}
                        >
                          <FileText className="h-3 w-3" />
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 h-7 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            exportProjectsCsv(projects.map(p => ({ name: p.name, score: p.score, status: statusMap[p.status], niche: p.niche, url: p.url, created_at: p.created_at, updated_at: p.updated_at })));
                          }}
                        >
                          <FileSpreadsheet className="h-3 w-3" />
                          CSV
                        </Button>
                      </>
                    )}
                    <a href="/projects" className="text-sm text-primary hover:underline">
                      Ver todos
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  {loading && (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="h-4 w-40 bg-muted rounded" />
                            <div className="h-5 w-16 bg-muted rounded-full" />
                          </div>
                          <div className="h-3 w-56 bg-muted rounded" />
                          <div className="flex gap-2">
                            <div className="h-6 w-20 bg-muted rounded" />
                            <div className="h-6 w-20 bg-muted rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!loading && projectCards.length === 0 && (
                    <div className="flex flex-col items-center text-center py-8 px-4 rounded-xl border border-dashed border-border bg-muted/30">
                      <FolderOpen className="h-10 w-10 text-muted-foreground/40 mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">Comece criando seu primeiro projeto</p>
                      <p className="text-xs text-muted-foreground mb-4 max-w-xs">Insira a URL do seu negócio e descubra seu score estratégico em segundos.</p>
                      <Button size="sm" onClick={() => window.location.href = '/projects'} className="gap-2">
                        <Zap className="h-3.5 w-3.5" />
                        Criar Projeto
                      </Button>
                    </div>
                  )}
                  {(projectsExpanded ? projectCards : projectCards.slice(0, 2)).map((project, i) => (
                    <ProjectCard key={i} {...project} />
                  ))}
                  {projectCards.length > 2 && (
                    <button
                      onClick={() => setProjectsExpanded(!projectsExpanded)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border hover:bg-muted/40"
                    >
                      {projectsExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Ver mais {projectCards.length - 2} projetos
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Campaigns + Insights */}
              <div className="space-y-6">

                {/* Campaigns Card */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">Campanhas Recentes</h2>
                    <a href="/operations" className="text-sm text-primary hover:underline">
                      Ver todas
                    </a>
                  </div>
                  <div className="rounded-xl border border-border bg-card divide-y divide-border">
                    {statsLoading && (
                      <div className="divide-y divide-border">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="px-3.5 py-2.5 animate-pulse">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-muted" />
                              <div className="flex-1">
                                <div className="h-3 w-28 bg-muted rounded mb-1" />
                                <div className="h-2 w-16 bg-muted rounded" />
                              </div>
                              <div className="h-4 w-14 bg-muted rounded-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {!statsLoading && recentCampaigns.length === 0 && (
                      <div className="flex flex-col items-center text-center py-6 px-4">
                        <Megaphone className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">Campanhas aparecerão aqui quando você criar em <a href="/operations" className="text-primary hover:underline font-medium">Operações</a>.</p>
                      </div>
                    )}
                    {(campaignsExpanded ? recentCampaigns : recentCampaigns.slice(0, 3)).map((campaign) => {
                      const statusIcons: Record<CampaignStatus, typeof Play> = {
                        draft: FileEdit,
                        active: Play,
                        paused: Pause,
                        completed: CheckCircle2,
                        archived: Archive,
                      };
                      const StatusIcon = statusIcons[campaign.status];
                      const pacing = campaign.budget_total > 0
                        ? Math.round((campaign.budget_spent / campaign.budget_total) * 100)
                        : 0;
                      return (
                        <div key={campaign.id} className="px-3.5 py-2.5 hover:bg-muted/40 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                              <Megaphone className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{campaign.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{campaign.project_name}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={`text-[10px] px-1.5 py-0 ${CHANNEL_COLORS[campaign.channel]}`}>
                                {CHANNEL_LABELS[campaign.channel]}
                              </Badge>
                              <Badge className={`text-[10px] px-1.5 py-0 ${CAMPAIGN_STATUS_COLORS[campaign.status]}`}>
                                <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                                {CAMPAIGN_STATUS_LABELS[campaign.status]}
                              </Badge>
                            </div>
                          </div>
                          {campaign.budget_total > 0 && (
                            <div className="mt-1.5 ml-9">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
                                <span className="flex items-center gap-0.5">
                                  <DollarSign className="h-2.5 w-2.5" />
                                  R$ {campaign.budget_spent.toLocaleString("pt-BR")} / R$ {campaign.budget_total.toLocaleString("pt-BR")}
                                </span>
                                <span>{pacing}%</span>
                              </div>
                              <div className="h-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    pacing > 90 ? "bg-red-500" : pacing > 70 ? "bg-yellow-500" : "bg-primary"
                                  }`}
                                  style={{ width: `${Math.min(pacing, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {recentCampaigns.length > 3 && (
                      <button
                        onClick={() => setCampaignsExpanded(!campaignsExpanded)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/40"
                      >
                        {campaignsExpanded ? (
                          <>
                            <ChevronUp className="h-3.5 w-3.5" />
                            Mostrar menos
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3.5 w-3.5" />
                            Ver mais {recentCampaigns.length - 3}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

              {/* Insights Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Insights Estratégicos</h2>
                  <a href="/insights" className="text-sm text-primary hover:underline">
                    Ver todos
                  </a>
                </div>
                <div className="rounded-xl border border-border bg-card divide-y divide-border">
                  {statsLoading && (
                    <div className="divide-y divide-border">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="px-3.5 py-2.5 animate-pulse">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-muted" />
                            <div className="h-3 flex-1 bg-muted rounded" />
                            <div className="h-3 w-3 bg-muted rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!statsLoading && insights.length === 0 && (
                    <div className="flex flex-col items-center text-center py-6 px-4">
                      <Lightbulb className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-xs font-medium text-foreground mb-1">Insights surgem com a análise</p>
                      <p className="text-[11px] text-muted-foreground">Analise a URL de um projeto para receber alertas, oportunidades e melhorias.</p>
                    </div>
                  )}
                  {visibleInsights.map((insight) => {
                    const isOpen = expandedInsightId === insight.id;
                    const iconMap = { warning: AlertTriangle, opportunity: TrendingUp, improvement: Lightbulb };
                    const colorMap = { warning: "text-amber-500", opportunity: "text-green-500", improvement: "text-blue-500" };
                    const bgMap = { warning: "bg-amber-500/10", opportunity: "bg-green-500/10", improvement: "bg-blue-500/10" };
                    const Icon = iconMap[insight.type];
                    return (
                      <button
                        key={insight.id}
                        onClick={() => setExpandedInsightId(isOpen ? null : insight.id)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-md ${bgMap[insight.type]} flex items-center justify-center shrink-0`}>
                            <Icon className={`h-3.5 w-3.5 ${colorMap[insight.type]}`} />
                          </div>
                          <p className="text-xs font-medium text-foreground flex-1 truncate">{insight.title}</p>
                          {isOpen ? (
                            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                        {isOpen && (
                          <div className="mt-2 ml-9 space-y-1">
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.description}</p>
                            {insight.action && (
                              <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                                <ArrowRight className="h-3 w-3" />
                                {insight.action}
                              </p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                  {insights.length > 3 && (
                    <button
                      onClick={() => setInsightsExpanded(!insightsExpanded)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/40"
                    >
                      {insightsExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Ver mais {insights.length - 3}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              </div>
              </div>
            </section>

            {/* Channel Strategy Overview */}
            <section
              className={cn(
                "space-y-2 rounded-xl transition-colors",
                isDraggingBlock && draggingBlockId === "channels" && "opacity-80 ring-2 ring-primary/30"
              )}
              style={{ order: getBlockOrder("channels") }}
              onMouseEnter={() => handleBlockHover("channels")}
            >
              <div className="flex justify-end">
                <button
                  type="button"
                  onMouseDown={(e) => handleBlockMouseDown(e, "channels")}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-grab active:cursor-grabbing"
                  aria-label={`Reorganizar bloco ${blockLabels.channels}`}
                >
                  <GripVertical className="h-3.5 w-3.5" />
                  {blockLabels.channels}
                </button>
              </div>
              <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-semibold text-foreground truncate">
                  Visão por Canal {channelProject ? `- ${channelProject.name}` : ""}
                </h2>
                {projects.length > 1 && (
                  <select
                    className="h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={selectedChannelProjectId || ""}
                    onChange={(e) => setSelectedChannelProjectId(e.target.value)}
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(loading || channelsLoading) && (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="rounded-xl border border-border bg-card p-4 animate-pulse">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-lg bg-muted" />
                          <div className="h-4 w-16 bg-muted rounded" />
                        </div>
                        <div className="h-8 w-12 bg-muted rounded mb-2" />
                        <div className="h-2 w-full bg-muted rounded mb-1" />
                        <div className="h-2 w-2/3 bg-muted rounded" />
                      </div>
                    ))}
                  </>
                )}
                {!loading && !channelsLoading && activeChannelScores.length === 0 && (
                  <div className="col-span-full flex flex-col items-center text-center py-8 px-4 rounded-xl border border-dashed border-border bg-muted/30">
                    <Globe className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">Descubra os melhores canais para seu negócio</p>
                    <p className="text-xs text-muted-foreground max-w-sm">Ao analisar um projeto, o sistema avalia a adequação para Google, Meta, LinkedIn e TikTok com scores e recomendações.</p>
                  </div>
                )}
                {activeChannelScores.map((score) => (
                  <ChannelCard
                    key={score.channel}
                    channel={score.channel}
                    score={score.score}
                    objective={score.objective ?? "Não definido"}
                    funnelRole={score.funnel_role ?? "Não definido"}
                    isRecommended={score.is_recommended ?? true}
                    risks={score.risks ?? []}
                  />
                ))}
              </div>
              </div>
            </section>
            </div>
          </div>
    </DashboardLayout>
  );
}
