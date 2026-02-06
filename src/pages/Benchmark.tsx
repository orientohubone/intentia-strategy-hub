import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { BenchmarkForm } from "@/components/BenchmarkForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, TrendingUp, Target, BarChart3, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Benchmark {
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

export default function Benchmark() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [showForm, setShowForm] = useState(false);
  const [editingBenchmark, setEditingBenchmark] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

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

  const handleCreateBenchmark = () => {
    setEditingBenchmark(null);
    setShowForm(true);
  };

  const handleEditBenchmark = (id: string) => {
    setEditingBenchmark(id);
    setShowForm(true);
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

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBenchmark(null);
    loadData();
  };

  const getStatsForProject = (projectId: string) => {
    return stats?.find((s: any) => s.project_id === projectId);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-5xl mx-auto">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 bg-muted rounded"></div>
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
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Benchmark Competitivo</h1>
                <p className="text-muted-foreground">
                  Análise comparativa com concorrentes e insights estratégicos
                </p>
              </div>
              <Button onClick={handleCreateBenchmark} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Benchmark
              </Button>
            </div>

            {/* Stats Cards */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Análises</p>
                        <p className="text-2xl font-bold">{benchmarks.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-success" />
                      <div>
                        <p className="text-sm text-muted-foreground">Score Médio</p>
                        <p className="text-2xl font-bold">
                          {benchmarks.length > 0 
                            ? Math.round(benchmarks.reduce((acc, b) => acc + b.overall_score, 0) / benchmarks.length)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-info" />
                      <div>
                        <p className="text-sm text-muted-foreground">Melhor Score</p>
                        <p className="text-2xl font-bold">
                          {benchmarks.length > 0 
                            ? Math.max(...benchmarks.map(b => b.overall_score))
                            : 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-warning" />
                      <div>
                        <p className="text-sm text-muted-foreground">Projetos Ativos</p>
                        <p className="text-2xl font-bold">{projects.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome, URL ou nicho..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterProject} onValueChange={setFilterProject}>
                      <SelectTrigger className="w-48">
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
                      <SelectTrigger className="w-48">
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
                </div>
              </CardContent>
            </Card>

            {/* Benchmarks List */}
            {filteredAndSortedBenchmarks.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Nenhum benchmark encontrado</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || filterProject !== "all" 
                          ? "Tente ajustar os filtros ou busca"
                          : "Crie seu primeiro benchmark para começar a análise competitiva"}
                      </p>
                    </div>
                    {!searchTerm && filterProject === "all" && (
                      <Button onClick={handleCreateBenchmark} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Criar Primeiro Benchmark
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onEdit={() => handleEditBenchmark(benchmark.id)}
                    onDelete={() => handleDeleteBenchmark(benchmark.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBenchmark ? "Editar Benchmark" : "Novo Benchmark"}
            </DialogTitle>
          </DialogHeader>
          <BenchmarkForm
            projectId={filterProject !== "all" ? filterProject : undefined}
            benchmarkId={editingBenchmark || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
