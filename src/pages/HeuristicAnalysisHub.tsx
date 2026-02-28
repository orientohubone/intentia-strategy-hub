import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FileSearch,
  Search,
  TrendingUp,
  Eye,
  MousePointerClick,
  Globe,
  CheckCircle2,
  FileText,
  Calendar,
  FolderOpen,
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
    // Carregar imediatamente para melhor performance
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Query ultra minimal - apenas o essencial para performance máxima
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, url, niche, score, heuristic_analysis, heuristic_completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("heuristic_analysis", "is", null)
        .order("heuristic_completed_at", { ascending: false })
        .limit(10); // Máximo performance

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      console.error("Error loading projects:", error?.message || "Unknown error");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.niche.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (v: number) => v >= 70 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-500";

  return (
    <FeatureGate featureKey="projects" withLayout={false}>
      <DashboardLayout>
        <SEO title="Análise Heurística | Intentia" />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Análise Heurística</h1>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Análises</p>
                    <p className="text-2xl font-bold">{projects.length}</p>
                  </div>
                  <FileSearch className="h-8 w-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Score Médio</p>
                    <p className="text-2xl font-bold">
                      {projects.length > 0
                        ? Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length)
                        : 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Última Análise</p>
                    <p className="text-sm font-semibold">
                      {projects.length > 0 && projects[0].heuristic_completed_at
                        ? new Date(projects[0].heuristic_completed_at).toLocaleDateString("pt-BR", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Grid */}
          {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border rounded-lg bg-card p-4 space-y-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-5 w-40 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 w-20 bg-muted rounded-full" />
                  <div className="h-5 w-20 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
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
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => {
                const ha = project.heuristic_analysis;
                const avgScore = ha
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
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
                    onClick={() => navigate(`/heuristic-analysis/${project.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FolderOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base truncate group-hover:text-primary transition-colors">
                              {project.name}
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                {project.niche}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                        <ScoreRing score={avgScore} size="sm" label="" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{project.url.replace(/^https?:\/\//, "")}</span>
                      </div>

                      {ha && (
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Valor", value: ha.scores.valueProposition, icon: TrendingUp },
                            { label: "UX", value: ha.scores.userJourney, icon: MousePointerClick },
                            { label: "SEO", value: ha.scores.seoReadiness, icon: Globe },
                          ].map((item) => {
                            const Icon = item.icon;
                            return (
                              <div key={item.label} className="bg-muted/50 rounded-lg p-2 text-center">
                                <Icon className="h-3 w-3 mx-auto mb-1 text-muted-foreground" />
                                <p className={`text-sm font-bold ${getScoreColor(item.value)}`}>
                                  {item.value}
                                </p>
                                <p className="text-[9px] text-muted-foreground">{item.label}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {project.heuristic_completed_at && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(project.heuristic_completed_at).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DashboardLayout>
    </FeatureGate>
  );
}
