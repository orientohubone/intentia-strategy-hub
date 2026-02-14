import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { ProjectCard } from "@/components/ProjectCard";
import { ChannelCard } from "@/components/ChannelCard";
import { StatsCard } from "@/components/StatsCard";
import { ScoreRing } from "@/components/ScoreRing";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Target, BarChart3, Zap, FileText, FileSpreadsheet, ChevronDown, ChevronUp, AlertTriangle, Lightbulb, TrendingUp, ArrowRight, Megaphone, Play, Pause, CheckCircle2, Archive, FileEdit, DollarSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportDashboardPdf } from "@/lib/reportGenerator";
import { exportProjectsCsv } from "@/lib/exportCsv";
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

const statusMap = {
  pending: "pendente",
  analyzing: "em_analise",
  completed: "completo",
} as const;

const formatDate = (iso?: string | null) => {
  if (!iso) return "Sem atualização";
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR");
};

export default function Dashboard() {
  const { user } = useAuth();
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
  const [hasAiKey, setHasAiKey] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email || "Usuário";
  const hasAvatar = !!(user?.user_metadata?.avatar_url);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!user) return;
      try {
        const { data, error } = await (supabase as any)
          .from("insights")
          .select("id, type, title, description, action, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(6);
        
        if (error) {
          console.error("Error fetching insights:", error);
          setInsights([]);
        } else {
          setInsights((data || []) as Insight[]);
        }

        // Get total insights count
        const { count: totalCount, error: totalError } = await supabase
          .from("insights")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (!totalError) setTotalInsightsCount(totalCount || 0);

        // Calculate insights created this week
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: weeklyCount, error: weeklyError } = await supabase
          .from("insights")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", oneWeekAgo);
        
        if (weeklyError) {
          console.error("Error fetching weekly insights:", weeklyError);
          setInsightsThisWeek(0);
        } else {
          setInsightsThisWeek(weeklyCount || 0);
        }
      } catch (err) {
        console.error("Unexpected error fetching insights:", err);
        setInsights([]);
        setInsightsThisWeek(0);
      }
    };

    const fetchAudiencesCount = async () => {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from("audiences")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        
        if (error) {
          console.error("Error fetching audiences count:", error);
          setAudiencesCount(0);
        } else {
          setAudiencesCount(count || 0);
        }
      } catch (err) {
        console.error("Unexpected error fetching audiences:", err);
        setAudiencesCount(0);
      }
    };

    const fetchBenchmarksCount = async () => {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from("benchmarks")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        
        if (error) {
          console.error("Error fetching benchmarks count:", error);
          setBenchmarksCount(0);
        } else {
          setBenchmarksCount(count || 0);
        }
      } catch (err) {
        console.error("Unexpected error fetching benchmarks:", err);
        setBenchmarksCount(0);
      }
    };

    const fetchProjectsThisMonth = async () => {
      if (!user) return;
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      try {
        const { count, error } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", oneMonthAgo);
        
        if (error) {
          console.error("Error fetching projects this month:", error);
          setProjectsThisMonth(0);
        } else {
          setProjectsThisMonth(count || 0);
        }
      } catch (err) {
        console.error("Unexpected error fetching projects:", err);
        setProjectsThisMonth(0);
      }
    };

    const fetchRecentCampaigns = async () => {
      if (!user) return;
      try {
        const { data, error } = await (supabase as any)
          .from("campaigns")
          .select("id, name, channel, status, budget_total, budget_spent, project_id, created_at")
          .eq("user_id", user.id)
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .limit(6);
        if (error) {
          console.error("Error fetching campaigns:", error);
          setRecentCampaigns([]);
        } else {
          const projectMap = new Map(projects.map(p => [p.id, p.name]));
          setRecentCampaigns((data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            channel: c.channel,
            status: c.status,
            budget_total: c.budget_total || 0,
            budget_spent: c.budget_spent || 0,
            project_name: projectMap.get(c.project_id) || "Projeto",
          })));
        }
      } catch (err) {
        console.error("Unexpected error fetching campaigns:", err);
        setRecentCampaigns([]);
      }
    };

    const fetchAiKeys = async () => {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from("user_api_keys")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if (!error && count && count > 0) setHasAiKey(true);
      } catch {}
    };

    const fetchAllStats = async () => {
      setStatsLoading(true);
      await Promise.all([
        fetchInsights(),
        fetchAudiencesCount(),
        fetchBenchmarksCount(),
        fetchProjectsThisMonth(),
        fetchRecentCampaigns(),
        fetchAiKeys(),
      ]);
      setStatsLoading(false);
    };

    fetchAllStats();
  }, [user]);

  useEffect(() => {
    const fetchChannelScores = async () => {
      if (!user || projects.length === 0) return;
      const { data } = await (supabase as any)
        .from("project_channel_scores")
        .select("project_id, channel, score, objective, funnel_role, is_recommended, risks")
        .eq("user_id", user.id);

      const grouped = (data || []).reduce((acc, item) => {
        acc[item.project_id] = acc[item.project_id] || [];
        acc[item.project_id].push(item as ChannelScore);
        return acc;
      }, {} as Record<string, ChannelScore[]>);

      setChannelScores(grouped);
    };

    fetchChannelScores();
  }, [user, projects]);

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
  }, [projects]);

  const visibleInsights = insightsExpanded ? insights : insights.slice(0, 3);

  return (
    <DashboardLayout>
      <SEO title="Dashboard" noindex />
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-6">
              <div className="flex-1 relative overflow-hidden rounded-2xl gradient-primary p-5 sm:p-8 shadow-lg">
                <div className="absolute inset-0">
                  <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-black/10 rounded-full blur-2xl"></div>
                  <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                </div>
                <div className="relative z-10">
                  <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                    Olá, {fullName}
                  </h1>
                  <p className="text-sm sm:text-base text-primary-foreground/80 mt-1">
                    Sua central de inteligência estratégica para decisões de marketing mais assertivas.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 card-elevated shrink-0">
                <ScoreRing score={averageScore} size="md" label="Score Médio" />
                <div className="pl-4 border-l border-border">
                  <p className="text-sm text-muted-foreground">Prontidão Geral</p>
                  <p className="text-lg font-semibold text-foreground">
                    {averageScore >= 70 ? "Alta" : averageScore >= 50 ? "Moderada" : "Baixa"}
                  </p>
                  <p className="text-xs text-muted-foreground">{projects.length} projetos ativos</p>
                </div>
              </div>
            </div>

            {/* Onboarding Checklist */}
            {(loading || statsLoading) ? (
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px] rounded-xl border border-border p-3 sm:p-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-muted mb-3" />
                    <div className="h-3 w-20 bg-muted rounded mb-2" />
                    <div className="h-2 w-full bg-muted rounded mb-1" />
                    <div className="h-2 w-2/3 bg-muted rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <OnboardingChecklist
                data={{
                  projectsCount: projects.length,
                  hasAnalysis: projects.some((p) => p.status === "completed"),
                  hasAiKey,
                  benchmarksCount,
                  audiencesCount,
                  hasAvatar,
                }}
              />
            )}

            {/* Stats Grid */}
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

            {/* Main Content Grid */}
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

            {/* Channel Strategy Overview */}
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
                {loading && (
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
                {!loading && activeChannelScores.length === 0 && (
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
          </div>
    </DashboardLayout>
  );
}
