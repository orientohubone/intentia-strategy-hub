import { useEffect, useState, useRef } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { BenchmarkDetailDialog, BenchmarkDetail } from "@/components/BenchmarkDetailDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, TrendingUp, Target, BarChart3, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getUserActiveKeys, runBenchmarkAiAnalysis } from "@/lib/aiAnalyzer";
import type { BenchmarkAiResult } from "@/lib/aiAnalyzer";

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

const AI_MODEL_LABELS: Record<string, string> = {
  "gemini-2.0-flash": "Gemini 2.0 Flash",
  "gemini-3-flash-preview": "Gemini 3 Flash",
  "gemini-3-pro-preview": "Gemini 3 Pro",
  "claude-sonnet-4-20250514": "Claude Sonnet 4",
  "claude-3-7-sonnet-20250219": "Claude 3.7 Sonnet",
  "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
  "claude-3-haiku-20240307": "Claude 3 Haiku",
  "claude-3-opus-20240229": "Claude 3 Opus",
};

export default function Benchmark() {
  const { user } = useAuth();
  const [benchmarks, setBenchmarks] = useState<BenchmarkSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [stats, setStats] = useState<any>(null);
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkDetail | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // AI enrichment state
  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [availableAiModels, setAvailableAiModels] = useState<{ provider: string; model: string; label: string }[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, BenchmarkAiResult>>({});
  const aiNotificationSentRef = useRef<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Load AI keys
  useEffect(() => {
    const loadAiKeys = async () => {
      if (!user) return;
      const keys = await getUserActiveKeys(user.id);
      setHasAiKeys(keys.length > 0);
      const models: { provider: string; model: string; label: string }[] = [];
      for (const key of keys) {
        const providerLabel = key.provider === "google_gemini" ? "Gemini" : "Claude";
        models.push({
          provider: key.provider,
          model: key.preferred_model,
          label: AI_MODEL_LABELS[key.preferred_model] || `${providerLabel} (${key.preferred_model})`,
        });
      }
      setAvailableAiModels(models);
      if (models.length > 0 && !selectedAiModel) {
        setSelectedAiModel(`${models[0].provider}::${models[0].model}`);
      }
    };
    loadAiKeys();
  }, [user]);

  const loadData = async () => {
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

      setBenchmarks(benchmarksResult.data || []);
      setProjects(projectsResult.data || []);
      setStats(statsResult.data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
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
      console.error("Erro na análise IA do benchmark:", error);
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
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-6">
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
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Benchmark Competitivo</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Análise comparativa com concorrentes — gerada automaticamente a partir das URLs cadastradas nos projetos.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Análises</p>
                    <p className="text-xl font-bold text-foreground">{benchmarks.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Target className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Score Médio</p>
                    <p className="text-xl font-bold text-foreground">
                      {benchmarks.length > 0 
                        ? Math.round(benchmarks.reduce((acc, b) => acc + b.overall_score, 0) / benchmarks.length)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Melhor Score</p>
                    <p className="text-xl font-bold text-foreground">
                      {benchmarks.length > 0 
                        ? Math.max(...benchmarks.map(b => b.overall_score))
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Users className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Concorrentes</p>
                    <p className="text-xl font-bold text-foreground">
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
                  <h3 className="text-lg font-semibold">Nenhum benchmark encontrado</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {searchTerm || filterProject !== "all" 
                      ? "Tente ajustar os filtros ou busca."
                      : "Adicione URLs de concorrentes nos seus projetos e execute uma análise para gerar benchmarks automaticamente."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAndSortedBenchmarks.map((benchmark) => (
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
        </main>
      </div>

      {/* Detail Dialog */}
      <BenchmarkDetailDialog
        benchmark={selectedBenchmark}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        hasAiKeys={hasAiKeys}
        availableAiModels={availableAiModels}
        selectedAiModel={selectedAiModel}
        onAiModelChange={setSelectedAiModel}
        onAiAnalysis={handleBenchmarkAiAnalysis}
        aiAnalyzing={aiAnalyzing}
        aiResult={selectedBenchmark ? aiResults[selectedBenchmark.id] || null : null}
      />
    </div>
  );
}
