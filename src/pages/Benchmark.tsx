import { useEffect, useState, useRef, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { SEO } from "@/components/SEO";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { BenchmarkDetailDialog, BenchmarkDetail } from "@/components/BenchmarkDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, TrendingUp, Target, BarChart3, Users, FileText, FileSpreadsheet, FolderOpen, ChevronDown, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { exportBenchmarksPdf } from "@/lib/reportGenerator";
import { exportBenchmarksCsv } from "@/lib/exportCsv";
import { getUserBenchmarkLimit } from "@/lib/urlAnalyzer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getUserActiveKeys, runBenchmarkAiAnalysis } from "@/lib/aiAnalyzer";
import type { BenchmarkAiResult } from "@/lib/aiAnalyzer";
import { AI_MODEL_LABELS, getModelsForProvider } from "@/lib/aiModels";

interface BenchmarkSummary {
  id: string;
  project_id: string;
  project_name: string;
  competitor_name: string;
  competitor_url: string;
  competitor_niche: string;
  overall_score: number;
  value_proposition_score: number;
  offer_clarity_score: number;
  user_journey_score: number;
  score_gap: number;
  strengths: string[];
  weaknesses: string[];
  analysis_date: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  niche: string;
  score: number;
}

type BenchmarkCacheState = {
  benchmarks: BenchmarkSummary[];
  projects: Project[];
  stats: any;
  fetchedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const benchmarkCache = new Map<string, BenchmarkCacheState>();

export default function Benchmark() {
  const { user } = useAuth();
  const userId = user?.id;
  const [benchmarks, setBenchmarks] = useState<BenchmarkSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const { isFeatureAvailable, userPlan } = useFeatureFlags();
  const canAiEnrichment = isFeatureAvailable("ai_benchmark_enrichment");
  const isStarter = userPlan === "starter";
  const [benchmarkLimit, setBenchmarkLimit] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [stats, setStats] = useState<any>(null);
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (projectId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  // AI enrichment state
  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [availableAiModels, setAvailableAiModels] = useState<{ provider: string; model: string; label: string }[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, BenchmarkAiResult>>({});
  const aiNotificationSentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBenchmarks([]);
      setProjects([]);
      setStats(null);
      setLoading(false);
      return;
    }

    const cached = benchmarkCache.get(userId);
    if (cached) {
      setBenchmarks(cached.benchmarks);
      setProjects(cached.projects);
      setStats(cached.stats);
      setLoading(false);
      if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
        void loadData({ silent: true });
      }
      return;
    }

    void loadData();
  }, [userId]);

  // Load benchmark limit for Starter plan
  useEffect(() => {
    if (!user || !isStarter) return;
    getUserBenchmarkLimit(user.id).then((limit) => setBenchmarkLimit(limit));
  }, [user, isStarter]);

  // Load AI keys
  useEffect(() => {
    const loadAiKeys = async () => {
      if (!user) return;
      const keys = await getUserActiveKeys(user.id);
      setHasAiKeys(keys.length > 0);
      const models: { provider: string; model: string; label: string }[] = [];
      for (const key of keys) {
        const allProviderModels = getModelsForProvider(key.provider);
        for (const m of allProviderModels) {
          models.push({
            provider: key.provider,
            model: m.value,
            label: m.label,
          });
        }
      }
      setAvailableAiModels(models);
      if (models.length > 0 && !selectedAiModel) {
        const preferred = keys[0];
        const preferredKey = `${preferred.provider}::${preferred.preferred_model}`;
        const hasPreferred = models.some(m => `${m.provider}::${m.model}` === preferredKey);
        setSelectedAiModel(hasPreferred ? preferredKey : `${models[0].provider}::${models[0].model}`);
      }
    };
    loadAiKeys();
  }, [user]);

  const loadData = async (options?: { silent?: boolean }) => {
    if (!userId) return;
    const cached = benchmarkCache.get(userId);
    if (!options?.silent && !cached) setLoading(true);
    try {
      const [benchmarksResult, projectsResult, statsResult] = await Promise.all([
        supabase
          .from("v_benchmark_summary")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, name, niche, score")
          .order("created_at", { ascending: false }),
        supabase
          .from("v_benchmark_stats")
          .select("*")
      ]);

      if (benchmarksResult.error) throw benchmarksResult.error;
      if (projectsResult.error) throw projectsResult.error;
      if (statsResult.error) throw statsResult.error;

      const nextBenchmarks = benchmarksResult.data || [];
      const nextProjects = projectsResult.data || [];
      const nextStats = statsResult.data || [];
      setBenchmarks(nextBenchmarks);
      setProjects(nextProjects);
      setStats(nextStats);
      benchmarkCache.set(userId, {
        benchmarks: nextBenchmarks,
        projects: nextProjects,
        stats: nextStats,
        fetchedAt: Date.now(),
      });
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  const filteredAndSortedBenchmarks = benchmarks
    .filter(benchmark => {
      const matchesSearch = 
        benchmark.competitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        benchmark.competitor_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
        benchmark.competitor_niche.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesProject = filterProject === "all" || benchmark.project_id === filterProject;
      
      return matchesSearch && matchesProject;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "overall_score":
          return b.overall_score - a.overall_score;
        case "score_gap":
          return Math.abs(b.score_gap) - Math.abs(a.score_gap);
        case "competitor_name":
          return a.competitor_name.localeCompare(b.competitor_name);
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const groupedByProject = useMemo(() => {
    const groups: Record<string, { projectId: string; projectName: string; benchmarks: BenchmarkSummary[]; avgScore: number }> = {};
    for (const b of filteredAndSortedBenchmarks) {
      if (!groups[b.project_id]) {
        groups[b.project_id] = {
          projectId: b.project_id,
          projectName: b.project_name,
          benchmarks: [],
          avgScore: 0,
        };
      }
      groups[b.project_id].benchmarks.push(b);
    }
    for (const g of Object.values(groups)) {
      g.avgScore = Math.round(g.benchmarks.reduce((s, b) => s + b.overall_score, 0) / g.benchmarks.length);
    }
    return Object.values(groups);
  }, [filteredAndSortedBenchmarks]);

  const handleViewBenchmark = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("benchmarks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Get project name
      const summary = benchmarks.find((b) => b.id === id);

      setSelectedBenchmark({
        ...data,
        project_name: summary?.project_name || "Projeto",
        score_gap: summary?.score_gap || 0,
      } as BenchmarkDetail);
      setDetailOpen(true);
    } catch (error: any) {
      toast.error("Erro ao carregar detalhes: " + error.message);
    }
  };

  const handleBenchmarkAiAnalysis = async (benchmarkId: string) => {
    if (!user || !selectedBenchmark) return;

    const [provider, model] = selectedAiModel.split("::");
    if (!provider || !model) {
      toast.error("Selecione um modelo de IA antes de analisar.");
      return;
    }

    const b = selectedBenchmark;
    const project = projects.find((p) => p.id === b.project_id);

    setAiAnalyzing(benchmarkId);

    try {
      const result = await runBenchmarkAiAnalysis(
        benchmarkId,
        user.id,
        {
          competitorName: b.competitor_name,
          competitorUrl: b.competitor_url,
          competitorNiche: b.competitor_niche,
          overallScore: b.overall_score,
          valuePropositionScore: b.value_proposition_score,
          valuePropositionAnalysis: b.value_proposition_analysis,
          offerClarityScore: b.offer_clarity_score,
          offerClarityAnalysis: b.offer_clarity_analysis,
          userJourneyScore: b.user_journey_score,
          userJourneyAnalysis: b.user_journey_analysis,
          strengths: b.strengths || [],
          weaknesses: b.weaknesses || [],
          opportunities: b.opportunities || [],
          threats: b.threats || [],
          channelPresence: b.channel_presence || {},
          channelEffectiveness: b.channel_effectiveness || {},
          strategicInsights: b.strategic_insights || "",
          recommendations: b.recommendations || "",
          scoreGap: b.score_gap,
          projectName: b.project_name || project?.name || "Projeto",
          projectScore: project?.score || 0,
        },
        provider as "google_gemini" | "anthropic_claude",
        model
      );

      setAiResults((prev) => ({ ...prev, [benchmarkId]: result }));
      toast.success("Benchmark enriquecido com IA!");

      // Single notification — guarded by ref
      if (aiNotificationSentRef.current !== benchmarkId) {
        aiNotificationSentRef.current = benchmarkId;
        await (supabase as any).from("notifications").insert({
          user_id: user.id,
          title: "Benchmark Enriquecido com IA",
          message: `Análise IA do benchmark "${b.competitor_name}" concluída. Nível de ameaça: ${result.overallVerdict.competitorThreatLevel}/100.`,
          type: "success",
          read: false,
          action_url: "/benchmark",
          action_text: "Ver Resultados",
        });
      }
    } catch (error: any) {
      console.error("Erro na análise IA do benchmark:", error?.message || "Unknown error");
      toast.error(`Análise IA falhou: ${error.message}`);
    } finally {
      setAiAnalyzing(null);
      aiNotificationSentRef.current = null;
    }
  };

  const handleDeleteBenchmark = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este benchmark?")) return;

    try {
      const { error } = await supabase
        .from("benchmarks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Benchmark excluído com sucesso");
      loadData();
    } catch (error: any) {
      toast.error("Erro ao excluir benchmark: " + error.message);
    }
  };

  if (loading) {
    return (
      <FeatureGate featureKey="benchmark_swot" withLayout={false} pageTitle="Benchmark Competitivo">
      <DashboardLayout>
        <SEO title="Benchmark" noindex />
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-muted rounded-lg"></div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2].map(i => (
                    <div key={i} className="h-48 bg-muted rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
      </DashboardLayout>
      </FeatureGate>
    );
  }

  return (
    <FeatureGate featureKey="benchmark_swot" withLayout={false} pageTitle="Benchmark Competitivo">
    <DashboardLayout>
      <SEO title="Benchmark" noindex />
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Benchmark Competitivo</h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Análise comparativa com concorrentes — gerada automaticamente a partir das URLs cadastradas nos projetos.
                </p>
                {isStarter && benchmarkLimit !== null && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                      benchmarks.length >= benchmarkLimit
                        ? "bg-red-500/10 text-red-500 border-red-500/30"
                        : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    }`}>
                      {benchmarks.length >= benchmarkLimit
                        ? `Esgotado (${benchmarks.length}/${benchmarkLimit})`
                        : `${benchmarks.length}/${benchmarkLimit} benchmarks`
                      } — Starter
                    </Badge>
                  </div>
                )}
              </div>
              {benchmarks.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    title="Expandir todos"
                    onClick={() => setExpandedGroups(new Set(groupedByProject.map(g => g.projectId)))}
                  >
                    <ChevronsUpDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    title="Recolher todos"
                    onClick={() => setExpandedGroups(new Set())}
                  >
                    <ChevronsDownUp className="h-3.5 w-3.5" />
                  </Button>
                  <div className="w-px h-5 bg-border mx-0.5" />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      const avgScore = benchmarks.reduce((s, b) => s + b.overall_score, 0) / benchmarks.length;
                      exportBenchmarksPdf({
                        benchmarks: benchmarks.map(b => ({
                          competitor_name: b.competitor_name,
                          competitor_url: b.competitor_url,
                          competitor_niche: b.competitor_niche,
                          overall_score: b.overall_score,
                          score_gap: b.score_gap,
                          strengths: [],
                          weaknesses: [],
                          project_name: b.project_name,
                        })),
                        totalBenchmarks: benchmarks.length,
                        averageScore: avgScore,
                      });
                    }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => {
                      exportBenchmarksCsv(benchmarks.map(b => ({
                        competitor_name: b.competitor_name,
                        competitor_url: b.competitor_url,
                        competitor_niche: b.competitor_niche,
                        overall_score: b.overall_score,
                        score_gap: b.score_gap,
                        value_proposition_score: b.value_proposition_score,
                        offer_clarity_score: b.offer_clarity_score,
                        user_journey_score: b.user_journey_score,
                        project_name: b.project_name,
                        created_at: b.created_at,
                      })));
                    }}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">CSV</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                    <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Análises</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">{benchmarks.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg shrink-0">
                    <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Score Médio</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                      {benchmarks.length > 0 
                        ? Math.round(benchmarks.reduce((acc, b) => acc + b.overall_score, 0) / benchmarks.length)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg shrink-0">
                    <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Melhor Score</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                      {benchmarks.length > 0 
                        ? Math.max(...benchmarks.map(b => b.overall_score))
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg shrink-0">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Concorrentes</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                      {new Set(benchmarks.map(b => b.competitor_url)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, URL ou nicho..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os projetos</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Mais recentes</SelectItem>
                  <SelectItem value="overall_score">Maior score</SelectItem>
                  <SelectItem value="score_gap">Maior gap</SelectItem>
                  <SelectItem value="competitor_name">Nome (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Benchmarks List */}
            {filteredAndSortedBenchmarks.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 sm:p-12 text-center">
                <div className="space-y-3">
                  <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Target className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Compare-se com a concorrência</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {searchTerm || filterProject !== "all" 
                      ? "Tente ajustar os filtros ou busca."
                      : "Adicione URLs de concorrentes nos seus projetos e execute a análise. Benchmarks com SWOT e gap analysis serão gerados automaticamente."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedByProject.map((group) => {
                  const isGroupExpanded = expandedGroups.has(group.projectId);
                  return (
                    <div key={group.projectId} className="space-y-3">
                      {/* Project header — clickable to expand/collapse */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <button
                          onClick={() => toggleGroup(group.projectId)}
                          className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 text-left group"
                        >
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${!isGroupExpanded ? "-rotate-90" : ""}`} />
                              <h2 className="text-sm sm:text-base font-semibold text-foreground truncate group-hover:text-primary transition-colors">{group.projectName}</h2>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap ml-[22px]">
                              <span className="text-[10px] sm:text-xs text-muted-foreground">{group.benchmarks.length} concorrentes</span>
                              <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-primary/10 text-primary border-primary/30">
                                Score médio: {group.avgScore}
                              </Badge>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Benchmark cards grid — only visible when expanded */}
                      {isGroupExpanded && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {group.benchmarks.map((benchmark) => (
                            <BenchmarkCard
                              key={benchmark.id}
                              id={benchmark.id}
                              competitorName={benchmark.competitor_name}
                              competitorUrl={benchmark.competitor_url}
                              competitorNiche={benchmark.competitor_niche}
                              overallScore={benchmark.overall_score}
                              valuePropositionScore={benchmark.value_proposition_score}
                              offerClarityScore={benchmark.offer_clarity_score}
                              userJourneyScore={benchmark.user_journey_score}
                              scoreGap={benchmark.score_gap}
                              strengths={benchmark.strengths}
                              weaknesses={benchmark.weaknesses}
                              analysisDate={benchmark.analysis_date}
                              onView={() => handleViewBenchmark(benchmark.id)}
                              onDelete={() => handleDeleteBenchmark(benchmark.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

      {/* Detail Dialog */}
      <BenchmarkDetailDialog
        benchmark={selectedBenchmark}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        hasAiKeys={hasAiKeys && canAiEnrichment}
        availableAiModels={availableAiModels}
        selectedAiModel={selectedAiModel}
        onAiModelChange={setSelectedAiModel}
        onAiAnalysis={handleBenchmarkAiAnalysis}
        aiAnalyzing={aiAnalyzing}
        aiResult={selectedBenchmark ? aiResults[selectedBenchmark.id] || null : null}
      />
    </DashboardLayout>
    </FeatureGate>
  );
}
