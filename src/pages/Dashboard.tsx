import { useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { ChannelCard } from "@/components/ChannelCard";
import { InsightCard } from "@/components/InsightCard";
import { StatsCard } from "@/components/StatsCard";
import { ScoreRing } from "@/components/ScoreRing";
import { FolderOpen, Target, BarChart3, Zap } from "lucide-react";
import { useTenantData } from "@/hooks/useTenantData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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
  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email || "Usuário";

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

    const fetchAllStats = async () => {
      await Promise.all([
        fetchInsights(),
        fetchAudiencesCount(),
        fetchBenchmarksCount(),
        fetchProjectsThisMonth()
      ]);
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
  const latestChannelScores = latestProject ? channelScores[latestProject.id] || [] : [];

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Olá, {fullName} 👋
                </h1>
                <p className="text-muted-foreground">
                  Confira a visão estratégica dos seus projetos de mídia.
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 card-elevated">
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

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                value={insights.length}
                change={insightsThisWeek}
                changeLabel={insightsThisWeek > 0 ? "esta semana" : "nenhum novo"}
                icon={<Zap className="h-5 w-5 text-primary" />}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Projects Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Projetos Recentes</h2>
                  <a href="/projects" className="text-sm text-primary hover:underline">
                    Ver todos
                  </a>
                </div>
                <div className="space-y-4">
                  {loading && (
                    <p className="text-sm text-muted-foreground">Carregando projetos...</p>
                  )}
                  {!loading && projectCards.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
                  )}
                  {projectCards.map((project, i) => (
                    <ProjectCard key={i} {...project} />
                  ))}
                </div>
              </div>

              {/* Insights Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Insights Estratégicos</h2>
                  <a href="/insights" className="text-sm text-primary hover:underline">
                    Ver todos
                  </a>
                </div>
                <div className="space-y-3">
                  {insights.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum insight disponível.</p>
                  )}
                  {insights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      type={insight.type}
                      title={insight.title}
                      description={insight.description}
                      action={insight.action ?? undefined}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Channel Strategy Overview */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">
                Visão por Canal {latestProject ? `- ${latestProject.name}` : ""}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestChannelScores.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma análise de canal disponível.</p>
                )}
                {latestChannelScores.map((score) => (
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
        </main>
      </div>
    </div>
  );
}
