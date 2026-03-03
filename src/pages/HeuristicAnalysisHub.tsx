import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileSearch,
  Search,
  TrendingUp,
  MousePointerClick,
  Globe,
  Calendar,
  FolderOpen,
  ArrowRight,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { ScoreRing } from "@/components/ScoreRing";
import type { UrlAnalysis } from "@/lib/urlAnalyzer";

interface Project {
  id: string;
  name: string;
  url: string;
  niche: string;
  score: number;
  status: string;
  heuristic_analysis: UrlAnalysis | null;
  heuristic_completed_at: string | null;
  last_update: string | null;
}

// ── Global Cache ────────────────────────────────────────────────
const CACHE_TTL = 1000 * 60 * 2;
const heuristicCache = new Map<string, { data: Project[]; timestamp: number }>();

export default function HeuristicAnalysisHub() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/projects");
      return;
    }

    const cached = heuristicCache.get(user.id);
    if (cached) {
      setProjects(cached.data);
      setLoading(false);

      if (Date.now() - cached.timestamp >= CACHE_TTL) {
        void loadProjects({ silent: true });
      }
      return;
    }

    void loadProjects();
  }, [user]);

  const loadProjects = async (options?: { silent?: boolean }) => {
    if (!user) return;
    const cached = heuristicCache.get(user.id);
    if (!options?.silent && !cached) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, url, niche, score, heuristic_analysis, heuristic_completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("heuristic_analysis", "is", null)
        .order("heuristic_completed_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      const next = data || [];
      setProjects(next);
      heuristicCache.set(user.id, { data: next, timestamp: Date.now() });
    } catch (error: any) {
      console.error("Error loading projects:", error?.message || "Unknown error");
      if (!cached) setProjects([]);
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  const filteredProjects = useMemo(
    () =>
      projects.filter(
        (project) =>
          project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.url.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [projects, searchTerm]
  );

  const avgScore = useMemo(
    () =>
      projects.length > 0
        ? Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length)
        : 0,
    [projects]
  );

  const bestScore = useMemo(
    () => (projects.length > 0 ? Math.max(...projects.map((p) => p.score)) : 0),
    [projects]
  );

  const getScoreColor = (v: number) =>
    v >= 70 ? "text-green-600 dark:text-green-400" : v >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500 dark:text-red-400";

  const getScoreBg = (v: number) =>
    v >= 70
      ? "bg-green-500/10 border-green-500/20"
      : v >= 50
        ? "bg-yellow-500/10 border-yellow-500/20"
        : "bg-red-500/10 border-red-500/20";

  return (
    <FeatureGate featureKey="projects" withLayout={false}>
      <DashboardLayout>
        <SEO title="Análise Heurística | Intentia" />
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Análise Heurística</h1>
                <p className="text-sm text-muted-foreground">
                  Visualize análises detalhadas de UX, conversão e performance dos seus projetos
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, nicho ou URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileSearch className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Análises</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{projects.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Score Médio</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{avgScore}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Melhor Score</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{bestScore}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg shrink-0">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Última Análise</p>
                  <p className="text-sm sm:text-base font-bold text-foreground">
                    {projects.length > 0 && projects[0].heuristic_completed_at
                      ? new Date(projects[0].heuristic_completed_at).toLocaleDateString("pt-BR", {
                        day: "numeric",
                        month: "short",
                      })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3 animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-20 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-10 w-10 bg-muted rounded-full" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-14 bg-muted rounded-lg" />
                    <div className="h-14 bg-muted rounded-lg" />
                    <div className="h-14 bg-muted rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <FileSearch className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {projects.length === 0
                  ? "Nenhuma análise heurística disponível"
                  : "Nenhum projeto encontrado"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {projects.length === 0
                  ? "Crie um projeto e execute a análise heurística para visualizar os resultados aqui."
                  : "Tente ajustar os termos de busca."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredProjects.map((project) => {
                const ha = project.heuristic_analysis;
                const avgProjectScore = ha
                  ? Math.round(
                    (ha.scores.valueProposition +
                      ha.scores.offerClarity +
                      ha.scores.userJourney +
                      ha.scores.seoReadiness +
                      ha.scores.conversionOptimization +
                      ha.scores.contentQuality) /
                    6
                  )
                  : project.score;

                return (
                  <button
                    key={project.id}
                    onClick={() => navigate(`/heuristic-analysis/${project.id}`)}
                    className="group text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                            <FolderOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {project.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/5 border-primary/20 text-primary">
                                {project.niche}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <ScoreRing score={avgProjectScore} size="sm" label="" />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-3">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{project.url.replace(/^https?:\/\//, "")}</span>
                      </div>
                    </div>

                    {/* Score Pills */}
                    {ha && (
                      <div className="grid grid-cols-3 gap-1.5 px-4 sm:px-5">
                        {[
                          { label: "Valor", value: ha.scores.valueProposition, icon: TrendingUp },
                          { label: "UX", value: ha.scores.userJourney, icon: MousePointerClick },
                          { label: "SEO", value: ha.scores.seoReadiness, icon: Globe },
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className={`rounded-lg p-2 text-center border ${getScoreBg(item.value)}`}>
                              <div className="flex items-center justify-center gap-1 mb-0.5">
                                <Icon className={`h-3 w-3 ${getScoreColor(item.value)}`} />
                                <span className={`text-sm font-bold ${getScoreColor(item.value)}`}>
                                  {item.value}
                                </span>
                              </div>
                              <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">{item.label}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 mt-3 border-t border-border/50 bg-muted/20">
                      {project.heuristic_completed_at ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(project.heuristic_completed_at).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-1 text-[11px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver análise
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </FeatureGate>
  );
}
