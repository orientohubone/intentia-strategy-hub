import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeUrl, saveAnalysisResults, analyzeCompetitors, cleanBenchmarks } from "@/lib/urlAnalyzer";
import type { UrlAnalysis } from "@/lib/urlAnalyzer";
import { runAiAnalysis, getUserActiveKeys } from "@/lib/aiAnalyzer";
import { AI_MODEL_LABELS, getModelsForProvider } from "@/lib/aiModels";
import type { AiAnalysisResult, UserApiKey } from "@/lib/aiAnalyzer";
import { exportAsJson, exportAsMarkdown, exportAsHtml, exportAsPdf } from "@/lib/exportAnalysis";
import { fetchProjectReport, generateConsolidatedReport } from "@/lib/reportGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Globe,
  Shield,
  Eye,
  MousePointerClick,
  FileText,
  Settings,
  Download,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  FolderOpen,
} from "lucide-react";

type Insight = {
  id: string;
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action?: string | null;
};

type ChannelScore = {
  id?: string;
  channel: "google" | "meta" | "linkedin" | "tiktok";
  score: number;
  objective?: string | null;
  funnel_role?: string | null;
  is_recommended?: boolean | null;
  risks?: string[] | null;
};

const channelList: ChannelScore["channel"][] = ["google", "meta", "linkedin", "tiktok"];

export default function Projects() {
  const { user } = useAuth();
  const {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  } = useTenantData();

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [channelScores, setChannelScores] = useState<Record<string, ChannelScore[]>>({});
  const [insights, setInsights] = useState<Record<string, Insight[]>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    niche: "",
    url: "",
    competitorUrls: "" as string,
    status: "pending" as "pending" | "analyzing" | "completed",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [heuristicResults, setHeuristicResults] = useState<Record<string, UrlAnalysis>>({});
  const [aiResults, setAiResults] = useState<Record<string, AiAnalysisResult>>({});
  const [aiAnalyzing, setAiAnalyzing] = useState<string | null>(null);
  const [availableAiModels, setAvailableAiModels] = useState<{ provider: string; model: string; label: string }[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");
  const notificationSentRef = useRef<string | null>(null);
  const aiNotificationSentRef = useRef<string | null>(null);
  const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
  const [editingInsight, setEditingInsight] = useState<Partial<Insight>>({});
  const [insightDraft, setInsightDraft] = useState({
    type: "warning" as Insight["type"],
    title: "",
    description: "",
    action: "",
  });

  // Check if user has AI API keys configured and load available models
  useEffect(() => {
    const checkAiKeys = async () => {
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
        // Default to the user's preferred model if available
        const preferred = keys[0];
        const preferredKey = `${preferred.provider}::${preferred.preferred_model}`;
        const hasPreferred = models.some(m => `${m.provider}::${m.model}` === preferredKey);
        setSelectedAiModel(hasPreferred ? preferredKey : `${models[0].provider}::${models[0].model}`);
      }
    };
    checkAiKeys();
  }, [user]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!activeProjectId) return;
      const { data: scoreData } = await (supabase as any)
        .from("project_channel_scores")
        .select("id, channel, score, objective, funnel_role, is_recommended, risks")
        .eq("project_id", activeProjectId);

      const { data: insightData } = await (supabase as any)
        .from("insights")
        .select("id, type, title, description, action")
        .eq("project_id", activeProjectId)
        .order("created_at", { ascending: false });

      setChannelScores((prev) => ({
        ...prev,
        [activeProjectId]: (scoreData || []) as ChannelScore[],
      }));
      setInsights((prev) => ({
        ...prev,
        [activeProjectId]: (insightData || []) as Insight[],
      }));
    };

    fetchDetails();
  }, [activeProjectId]);

  const handleProjectSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validações básicas
    if (!formState.name.trim()) {
      toast.error("Nome do projeto é obrigatório");
      return;
    }
    if (!formState.niche.trim()) {
      toast.error("Nicho é obrigatório");
      return;
    }
    if (!formState.url.trim()) {
      toast.error("URL é obrigatória");
      return;
    }
    if (!formState.url.startsWith('http')) {
      toast.error("URL deve começar com http:// ou https://");
      return;
    }
    
    // Parse competitor URLs
    const competitorUrls = formState.competitorUrls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u.length > 0 && u.startsWith("http"));

    try {
      let projectId: string;
      const urlToAnalyze = formState.url.trim();

      if (editingId) {
        const result = await updateProject(editingId, {
          name: formState.name.trim(),
          niche: formState.niche.trim(),
          url: urlToAnalyze,
          competitor_urls: competitorUrls,
          status: "analyzing",
          last_update: new Date().toISOString(),
        });
        projectId = editingId;
        toast.success("Projeto atualizado! Iniciando análise...");
      } else {
        const result = await createProject({
          name: formState.name.trim(),
          niche: formState.niche.trim(),
          url: urlToAnalyze,
          competitor_urls: competitorUrls,
          score: 0,
          status: "analyzing",
          last_update: new Date().toISOString(),
        });
        projectId = result.id;
        toast.success("Projeto criado! Iniciando análise...");
      }

      setFormState({ name: "", niche: "", url: "", competitorUrls: "", status: "pending" });
      setEditingId(null);

      // Run URL analysis in background
      if (user) {
        setAnalyzing(true);
        try {
          const analysis = await analyzeUrl(urlToAnalyze);
          await saveAnalysisResults(projectId, user.id, analysis);
          // Store heuristic results in local state
          setHeuristicResults(prev => ({ ...prev, [projectId]: analysis }));
          // Clean old benchmarks for this project before generating new ones
          await cleanBenchmarks(projectId, user.id);
          // Analyze competitors and generate benchmarks
          if (competitorUrls.length > 0) {
            toast.info(`Analisando ${competitorUrls.length} concorrente(s)...`);
            await analyzeCompetitors(projectId, user.id, competitorUrls, formState.niche.trim());
          }
          toast.success(`Análise concluída! Score: ${analysis.overallScore}/100`);
          // Single notification — guarded by ref to prevent duplicates
          if (notificationSentRef.current !== projectId) {
            notificationSentRef.current = projectId;
            await (supabase as any).from("notifications").insert({
              user_id: user.id,
              title: "Análise Heurística Concluída",
              message: `Análise de "${formState.name.trim() || 'Projeto'}" concluída com score ${analysis.overallScore}/100.`,
              type: "success",
              read: false,
              action_url: "/projects",
              action_text: "Ver Projeto",
            });
          }
          await refetch();
          // Auto-open project management to show heuristic results
          setTimeout(() => setActiveProjectId(projectId), 300);
        } catch (analysisError: any) {
          console.error("Erro na análise:", analysisError);
          toast.error(`Análise falhou: ${analysisError.message}. Você pode reanalisar depois.`);
          await updateProject(projectId, { status: "pending" });
        } finally {
          setAnalyzing(false);
          notificationSentRef.current = null;
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar projeto:", error);
      toast.error(error?.message || "Erro ao salvar projeto. Tente novamente.");
    }
  };

  const startEdit = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);
    if (!project) return;
    setEditingId(projectId);
    setFormState({
      name: project.name,
      niche: project.niche,
      url: project.url,
      competitorUrls: (project.competitor_urls || []).join("\n"),
      status: project.status,
    });
  };

  const handleChannelSave = async (projectId: string) => {
    const scores = channelScores[projectId] || [];
    const payload = scores.map((score) => ({
      project_id: projectId,
      channel: score.channel,
      score: score.score,
      objective: score.objective,
      funnel_role: score.funnel_role,
      is_recommended: score.is_recommended ?? true,
      risks: score.risks ?? [],
    }));

    await (supabase as any)
      .from("project_channel_scores")
      .upsert(payload, { onConflict: "project_id,channel" });
  };

  const handleReanalyze = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !user) return;

    setAnalyzing(true);
    try {
      await updateProject(projectId, { status: "analyzing" });
      toast.info("Reanalisando URL...");
      const analysis = await analyzeUrl(project.url);
      await saveAnalysisResults(projectId, user.id, analysis);
      // Store heuristic results in local state
      setHeuristicResults(prev => ({ ...prev, [projectId]: analysis }));
      // Clean old benchmarks for this project
      await cleanBenchmarks(projectId, user.id);
      // Analyze competitors if any
      const competitors = project.competitor_urls || [];
      if (competitors.length > 0) {
        toast.info(`Analisando ${competitors.length} concorrente(s)...`);
        await analyzeCompetitors(projectId, user.id, competitors, project.niche);
      }
      toast.success(`Reanálise concluída! Score: ${analysis.overallScore}/100`);
      // Single notification — guarded by ref to prevent duplicates
      if (notificationSentRef.current !== projectId) {
        notificationSentRef.current = projectId;
        await (supabase as any).from("notifications").insert({
          user_id: user.id,
          title: "Análise Heurística Concluída",
          message: `Reanálise de "${project.name}" concluída com score ${analysis.overallScore}/100.`,
          type: "success",
          read: false,
          action_url: "/projects",
          action_text: "Ver Projeto",
        });
      }
      await refetch();
      // Force re-render of active project details
      setActiveProjectId(null);
      setTimeout(() => setActiveProjectId(projectId), 300);
    } catch (error: any) {
      console.error("Erro na reanálise:", error);
      toast.error(`Reanálise falhou: ${error.message}`);
      await updateProject(projectId, { status: "pending" });
    } finally {
      setAnalyzing(false);
      notificationSentRef.current = null;
    }
  };

  const handleAiAnalysis = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !user) return;

    const heuristic = heuristicResults[projectId] || project.heuristic_analysis;
    if (!heuristic) {
      toast.error("Dados heurísticos não disponíveis. Reanalize a URL primeiro.");
      return;
    }

    // Parse selected model
    const [provider, model] = selectedAiModel.split("::");
    if (!provider || !model) {
      toast.error("Selecione um modelo de IA antes de analisar.");
      return;
    }

    setAiAnalyzing(projectId);

    try {
      const result = await runAiAnalysis(
        projectId,
        user.id,
        project.name,
        project.niche,
        project.url,
        heuristic as UrlAnalysis,
        provider as "google_gemini" | "anthropic_claude",
        model
      );

      setAiResults((prev) => ({ ...prev, [projectId]: result }));
      toast.success("Análise por IA concluída!");

      // Single notification — guarded by ref to prevent duplicates
      if (aiNotificationSentRef.current !== projectId) {
        aiNotificationSentRef.current = projectId;
        await (supabase as any).from("notifications").insert({
          user_id: user.id,
          title: "Análise por IA Concluída",
          message: `Análise por IA de "${project.name}" concluída. Prontidão para investimento: ${result.investmentReadiness.score}/100.`,
          type: "success",
          read: false,
          action_url: "/projects",
          action_text: "Ver Resultados",
        });
      }

      await refetch();
    } catch (error: any) {
      console.error("Erro na análise por IA:", error);
      toast.error(`Análise por IA falhou: ${error.message}`);
    } finally {
      setAiAnalyzing(null);
      aiNotificationSentRef.current = null;
    }
  };

  const handleInsightCreate = async (projectId: string) => {
    if (!insightDraft.title || !insightDraft.description) return;
    await (supabase as any)
      .from("insights")
      .insert({
        project_id: projectId,
        type: insightDraft.type,
        title: insightDraft.title,
        description: insightDraft.description,
        action: insightDraft.action || null,
      });
    setInsightDraft({ type: "warning", title: "", description: "", action: "" });
    setActiveProjectId(projectId);
  };

  const handleInsightUpdate = async (projectId: string, insightId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("insights")
        .update(editingInsight)
        .eq("id", insightId);
      
      if (error) throw error;
      
      setInsights((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).map((item) =>
          item.id === insightId ? { ...item, ...editingInsight } : item
        ),
      }));
      
      setEditingInsightId(null);
      setEditingInsight({});
      toast.success("Insight atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar insight:", error);
      toast.error("Erro ao atualizar insight. Tente novamente.");
    }
  };

  const handleInsightDelete = async (projectId: string, insightId: string) => {
    try {
      await (supabase as any).from("insights").delete().eq("id", insightId);
      setInsights((prev) => ({
        ...prev,
        [projectId]: (prev[projectId] || []).filter((item) => item.id !== insightId),
      }));
      toast.success("Insight removido com sucesso!");
    } catch (error: any) {
      console.error("Erro ao remover insight:", error);
      toast.error("Erro ao remover insight. Tente novamente.");
    }
  };

  const startEditInsight = (insight: Insight) => {
    setEditingInsightId(insight.id);
    setEditingInsight({
      type: insight.type,
      title: insight.title,
      description: insight.description,
      action: insight.action,
    });
  };

  const cancelEditInsight = () => {
    setEditingInsightId(null);
    setEditingInsight({});
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success("Projeto excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir projeto:", error);
      toast.error(error?.message || "Erro ao excluir projeto. Tente novamente.");
    }
  };

  const projectList = useMemo(() => projects, [projects]);

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
                <p className="text-muted-foreground">Gerencie seus projetos e análises.</p>
              </div>
            </div>

            <form onSubmit={handleProjectSubmit} className="grid gap-4 p-4 border border-border rounded-lg bg-card">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Projeto</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="niche">Nicho</Label>
                  <Input
                    id="niche"
                    value={formState.niche}
                    onChange={(e) => setFormState((prev) => ({ ...prev, niche: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL do Projeto</Label>
                  <Input
                    id="url"
                    placeholder="https://meusite.com.br"
                    value={formState.url}
                    onChange={(e) => setFormState((prev) => ({ ...prev, url: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={formState.status}
                    onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="pending">Pendente</option>
                    <option value="analyzing">Em análise</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitors">URLs dos Concorrentes (uma por linha)</Label>
                <textarea
                  id="competitors"
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder={"https://concorrente1.com.br\nhttps://concorrente2.com.br\nhttps://concorrente3.com.br"}
                  value={formState.competitorUrls}
                  onChange={(e) => setFormState((prev) => ({ ...prev, competitorUrls: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Adicione as URLs dos seus principais concorrentes para gerar um benchmark comparativo automático.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={analyzing}>
                  {analyzing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></span>
                      Analisando URL...
                    </>
                  ) : editingId ? "Salvar alterações" : "Criar projeto e analisar URL"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" disabled={analyzing} onClick={() => {
                    setEditingId(null);
                    setFormState({ name: "", niche: "", url: "", competitorUrls: "", status: "pending" });
                  }}>
                    Cancelar
                  </Button>
                )}
                {analyzing && (
                  <span className="text-sm text-muted-foreground">
                    Analisando proposta de valor, clareza, jornada e canais...
                  </span>
                )}
              </div>
            </form>

            {loading && <p className="text-sm text-muted-foreground">Carregando projetos...</p>}
            {!loading && projectList.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
            )}

            <div className="space-y-4">
              {projectList.map((project) => {
                const isActive = activeProjectId === project.id;
                const scores = channelScores[project.id] || channelList.map((channel) => ({ channel, score: 0 } as ChannelScore));
                const projectInsights = insights[project.id] || [];

                return (
                  <div key={project.id} className="border border-border rounded-lg bg-card p-4 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{project.name}</h2>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <span>{project.niche} •</span>
                          <span className="truncate max-w-[200px]">{project.url}</span>
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted transition-colors disabled:opacity-50"
                                  onClick={() => handleReanalyze(project.id)}
                                  disabled={analyzing}
                                >
                                  <RefreshCw className={`h-3 w-3 ${analyzing ? "animate-spin" : ""}`} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Reanalisar URL</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setActiveProjectId(isActive ? null : project.id)}>
                          <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
                          {isActive ? "Fechar" : "Gerenciar"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => startEdit(project.id)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            {project.status === "completed" && (
                              <DropdownMenuItem onClick={async () => {
                                if (!user) return;
                                toast.info("Gerando relatório...");
                                try {
                                  const report = await fetchProjectReport(project.id, user.id);
                                  generateConsolidatedReport(report);
                                } catch (e: any) {
                                  toast.error("Erro ao gerar relatório: " + e.message);
                                }
                              }}>
                                <FileText className="h-3.5 w-3.5 mr-2" />
                                Relatório PDF
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o projeto "{project.name}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {isActive && (
                      <div className="space-y-6">
                        {/* Heuristic Analysis Results */}
                        {(heuristicResults[project.id] || project.heuristic_analysis) && (() => {
                          const ha = (heuristicResults[project.id] || project.heuristic_analysis) as UrlAnalysis;
                          const scoreItems = [
                            { label: "Proposta de Valor", value: ha.scores.valueProposition, icon: TrendingUp, color: "text-primary" },
                            { label: "Clareza da Oferta", value: ha.scores.offerClarity, icon: Eye, color: "text-blue-500" },
                            { label: "Jornada do Usuário", value: ha.scores.userJourney, icon: MousePointerClick, color: "text-purple-500" },
                            { label: "SEO", value: ha.scores.seoReadiness, icon: Globe, color: "text-green-500" },
                            { label: "Conversão", value: ha.scores.conversionOptimization, icon: CheckCircle2, color: "text-amber-500" },
                            { label: "Conteúdo", value: ha.scores.contentQuality, icon: FileText, color: "text-cyan-500" },
                          ];
                          const getScoreColor = (v: number) => v >= 70 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-500";
                          const getScoreBg = (v: number) => v >= 70 ? "bg-green-500" : v >= 50 ? "bg-yellow-500" : "bg-red-500";

                          return (
                            <div className="border border-border rounded-xl p-4 sm:p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileSearch className="h-5 w-5 text-primary" />
                                  <h3 className="text-base font-semibold text-foreground">Análise Heurística</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {project.heuristic_completed_at
                                      ? new Date(project.heuristic_completed_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                      : "Concluída"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  {hasAiKeys ? (
                                    <>
                                      <Select
                                        value={selectedAiModel}
                                        onValueChange={setSelectedAiModel}
                                        disabled={aiAnalyzing === project.id}
                                      >
                                        <SelectTrigger className="h-8 w-[160px] text-xs border-primary/30 bg-primary/5">
                                          <SelectValue placeholder="Modelo IA" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableAiModels.map((m) => (
                                            <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`} className="text-xs">
                                              {m.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Button
                                        size="icon"
                                        className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex-shrink-0"
                                        disabled={project.status !== "completed" || analyzing || aiAnalyzing === project.id}
                                        title={project.status !== "completed" ? "Aguardando conclusão da análise heurística" : "Executar análise por IA"}
                                        onClick={() => handleAiAnalysis(project.id)}
                                      >
                                        {aiAnalyzing === project.id ? (
                                          <div className="relative flex items-center justify-center h-4 w-4">
                                            <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-foreground animate-lab-bubble"></span>
                                            <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/80 animate-lab-bubble-delay -translate-x-1"></span>
                                            <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/60 animate-lab-bubble-delay-2 translate-x-1"></span>
                                          </div>
                                        ) : (
                                          <Sparkles className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </>
                                  ) : (
                                    <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => window.location.href = "/settings"}>
                                      <Settings className="h-4 w-4" />
                                      Configurar IA
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {/* Score Grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                {scoreItems.map((item) => {
                                  const Icon = item.icon;
                                  return (
                                    <div key={item.label} className="bg-muted/50 rounded-lg p-3 text-center space-y-1">
                                      <Icon className={`h-4 w-4 mx-auto ${item.color}`} />
                                      <p className={`text-xl font-bold ${getScoreColor(item.value)}`}>{item.value}</p>
                                      <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
                                      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${getScoreBg(item.value)}`} style={{ width: `${item.value}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Technical & Content Summary */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5" /> Técnico
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    <Badge variant={ha.technical.hasHttps ? "default" : "destructive"} className="text-[10px]">
                                      {ha.technical.hasHttps ? "✓ HTTPS" : "✗ Sem HTTPS"}
                                    </Badge>
                                    <Badge variant={ha.technical.hasViewport ? "default" : "destructive"} className="text-[10px]">
                                      {ha.technical.hasViewport ? "✓ Mobile" : "✗ Sem viewport"}
                                    </Badge>
                                    <Badge variant={ha.technical.hasAnalytics ? "default" : "secondary"} className="text-[10px]">
                                      {ha.technical.hasAnalytics ? "✓ Analytics" : "✗ Sem analytics"}
                                    </Badge>
                                    <Badge variant={ha.technical.hasStructuredData ? "default" : "secondary"} className="text-[10px]">
                                      {ha.technical.hasStructuredData ? "✓ Schema" : "✗ Sem schema"}
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      ⏱ {ha.technical.loadTimeEstimate}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    <FileText className="h-3.5 w-3.5" /> Conteúdo
                                  </p>
                                  <div className="flex flex-wrap gap-1.5">
                                    <Badge variant="outline" className="text-[10px]">
                                      {ha.content.wordCount} palavras
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      {ha.content.ctaCount} CTAs
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      {ha.content.formCount} formulários
                                    </Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      {ha.content.imageCount} imagens
                                    </Badge>
                                    {ha.content.hasVideo && <Badge className="text-[10px]">✓ Vídeo</Badge>}
                                    {ha.content.hasSocialProof && <Badge className="text-[10px]">✓ Prova social</Badge>}
                                    {ha.content.hasPricing && <Badge className="text-[10px]">✓ Preços</Badge>}
                                    {ha.content.hasFAQ && <Badge className="text-[10px]">✓ FAQ</Badge>}
                                  </div>
                                </div>
                              </div>

                              {/* Meta Info */}
                              {(ha.meta.title || ha.meta.description) && (
                                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                                  {ha.meta.title && (
                                    <p className="text-xs"><span className="font-medium text-foreground">Título:</span> <span className="text-muted-foreground">{ha.meta.title}</span></p>
                                  )}
                                  {ha.meta.description && (
                                    <p className="text-xs"><span className="font-medium text-foreground">Descrição:</span> <span className="text-muted-foreground">{ha.meta.description.substring(0, 160)}</span></p>
                                  )}
                                  {ha.content.h1.length > 0 && (
                                    <p className="text-xs"><span className="font-medium text-foreground">H1:</span> <span className="text-muted-foreground">{ha.content.h1[0]}</span></p>
                                  )}
                                </div>
                              )}

                              {/* AI Analysis Status / Results */}
                              {project.status === "completed" && !aiResults[project.id] && !project.ai_analysis && aiAnalyzing !== project.id && (
                                <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
                                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-foreground">Análise por IA disponível</p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {hasAiKeys
                                        ? "Clique em \"Analisar com IA\" para obter insights semânticos aprofundados."
                                        : "Configure suas API keys em Configurações → Integrações de IA para habilitar."}
                                    </p>
                                  </div>
                                  {!hasAiKeys && (
                                    <Button size="sm" variant="outline" className="text-xs flex-shrink-0" onClick={() => window.location.href = "/settings"}>
                                      Configurar
                                    </Button>
                                  )}
                                </div>
                              )}

                              {/* AI Analyzing Loading — Lab animation */}
                              {aiAnalyzing === project.id && (
                                <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 p-4 flex items-center gap-4">
                                  <div className="relative h-10 w-10 flex items-center justify-center flex-shrink-0">
                                    <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                                    <span className="absolute h-2 w-2 rounded-full bg-primary animate-lab-bubble"></span>
                                    <span className="absolute h-1.5 w-1.5 rounded-full bg-primary/70 animate-lab-bubble-delay -translate-x-1.5"></span>
                                    <span className="absolute h-1.5 w-1.5 rounded-full bg-primary/50 animate-lab-bubble-delay-2 translate-x-1.5"></span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground">Preparando análise semântica...</p>
                                    <p className="text-xs text-muted-foreground">
                                      Processando com {selectedAiModel.split("::")[1] ? (AI_MODEL_LABELS[selectedAiModel.split("::")[1]] || selectedAiModel.split("::")[1]) : "IA"}. Isso pode levar até 30 segundos.
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* AI Analysis Results Section */}
                        {(() => {
                          const ai = aiResults[project.id] || project.ai_analysis as AiAnalysisResult | undefined;
                          if (!ai) return null;

                          const verdictConfig: Record<string, { label: string; color: string }> = {
                            recommended: { label: "Recomendado", color: "text-green-600 bg-green-500/10" },
                            caution: { label: "Cautela", color: "text-yellow-600 bg-yellow-500/10" },
                            not_recommended: { label: "Não recomendado", color: "text-red-500 bg-red-500/10" },
                          };
                          const priorityConfig: Record<string, { label: string; color: string }> = {
                            high: { label: "Alta", color: "bg-red-500" },
                            medium: { label: "Média", color: "bg-yellow-500" },
                            low: { label: "Baixa", color: "bg-blue-500" },
                          };
                          const readinessColor = ai.investmentReadiness.score >= 70 ? "text-green-600" : ai.investmentReadiness.score >= 50 ? "text-yellow-600" : "text-red-500";

                          return (
                            <div className="border border-primary/20 rounded-xl p-4 sm:p-6 space-y-5 bg-primary/[0.02]">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-5 w-5 text-primary" />
                                  <h3 className="text-base font-semibold text-foreground">Análise por IA</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {ai.model.split("-").slice(0, 3).join("-")}
                                  </Badge>
                                  {ai.analyzedAt && (
                                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                      {new Date(ai.analyzedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    const ha = heuristicResults[project.id] || project.heuristic_analysis as UrlAnalysis | undefined;
                                    const exportData = { projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha as UrlAnalysis | undefined, ai };
                                    return (
                                      <>
                                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsJson(exportData)} title="Exportar JSON">
                                          <Download className="h-3 w-3 mr-1" />JSON
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsMarkdown(exportData)} title="Exportar Markdown">
                                          MD
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsHtml(exportData)} title="Exportar HTML">
                                          HTML
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsPdf(exportData)} title="Exportar PDF">
                                          PDF
                                        </Button>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Summary */}
                              <div className="bg-muted/40 rounded-lg p-3">
                                <p className="text-sm text-foreground leading-relaxed">{ai.summary}</p>
                              </div>

                              {/* Investment Readiness */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-muted/30 rounded-lg p-3 text-center">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Prontidão p/ Investimento</p>
                                  <p className={`text-2xl font-bold ${readinessColor}`}>{ai.investmentReadiness.score}</p>
                                  <Badge className={`mt-1 text-[10px] ${ai.investmentReadiness.level === "high" ? "bg-green-500" : ai.investmentReadiness.level === "medium" ? "bg-yellow-500" : "bg-red-500"}`}>
                                    {ai.investmentReadiness.level === "high" ? "Alto" : ai.investmentReadiness.level === "medium" ? "Médio" : "Baixo"}
                                  </Badge>
                                </div>
                                <div className="bg-muted/30 rounded-lg p-3 sm:col-span-2">
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Justificativa</p>
                                  <p className="text-xs text-foreground leading-relaxed">{ai.investmentReadiness.justification}</p>
                                </div>
                              </div>

                              {/* SWOT-like: Strengths, Weaknesses, Opportunities */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 space-y-1.5">
                                  <p className="text-xs font-semibold text-green-700 dark:text-green-400">Pontos Fortes</p>
                                  {ai.strengths.map((s, i) => (
                                    <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {s}
                                    </p>
                                  ))}
                                </div>
                                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-1.5">
                                  <p className="text-xs font-semibold text-red-700 dark:text-red-400">Fraquezas</p>
                                  {ai.weaknesses.map((w, i) => (
                                    <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                                      <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span> {w}
                                    </p>
                                  ))}
                                </div>
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 space-y-1.5">
                                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Oportunidades</p>
                                  {ai.opportunities.map((o, i) => (
                                    <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                                      <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span> {o}
                                    </p>
                                  ))}
                                </div>
                              </div>

                              {/* Channel Recommendations */}
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-foreground">Recomendações por Canal</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {ai.channelRecommendations.map((ch, i) => {
                                    const vc = verdictConfig[ch.verdict] || verdictConfig.caution;
                                    return (
                                      <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                          <p className="text-xs font-semibold text-foreground">{ch.channel}</p>
                                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vc.color}`}>{vc.label}</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground">{ch.reasoning}</p>
                                        {ch.suggestedBudgetAllocation && (
                                          <p className="text-[10px] text-primary font-medium">Budget: {ch.suggestedBudgetAllocation}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Recommendations */}
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-foreground">Recomendações Estratégicas</p>
                                <div className="space-y-2">
                                  {ai.recommendations.map((rec, i) => {
                                    const pc = priorityConfig[rec.priority] || priorityConfig.medium;
                                    return (
                                      <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-1">
                                        <div className="flex items-center gap-2">
                                          <span className={`h-2 w-2 rounded-full ${pc.color} flex-shrink-0`}></span>
                                          <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                                          <Badge variant="outline" className="text-[9px] ml-auto">{rec.category}</Badge>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground pl-4">{rec.description}</p>
                                        <p className="text-[10px] text-primary font-medium pl-4">Impacto: {rec.expectedImpact}</p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Competitive Position */}
                              {ai.competitivePosition && (
                                <div className="bg-muted/30 rounded-lg p-3">
                                  <p className="text-xs font-semibold text-foreground mb-1">Posição Competitiva</p>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed">{ai.competitivePosition}</p>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Project Score Overview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-1">Score Geral</p>
                            <p className={`text-3xl font-bold ${
                              project.score >= 70 ? "text-green-600" : project.score >= 50 ? "text-yellow-600" : "text-red-500"
                            }`}>{project.score}</p>
                            <p className="text-xs text-muted-foreground mt-1">de 100</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                            <p className="text-lg font-semibold text-foreground capitalize">{project.status === "completed" ? "Concluído" : project.status === "analyzing" ? "Analisando..." : "Pendente"}</p>
                          </div>
                          <div className="bg-muted/50 rounded-xl p-4 text-center sm:col-span-2 lg:col-span-1">
                            <p className="text-sm text-muted-foreground mb-1">Última Análise</p>
                            <p className="text-lg font-semibold text-foreground">
                              {project.last_update ? new Date(project.last_update).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            </p>
                          </div>
                        </div>

                        {/* Channel Scores Cards */}
                        <div className="border border-border rounded-xl p-4 sm:p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-foreground">Scores por Canal</h3>
                            <Button size="sm" variant="outline" onClick={() => handleChannelSave(project.id)}>Salvar alterações</Button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {channelList.map((channel) => {
                              const existing = scores.find((item) => item.channel === channel) || { channel, score: 0 } as ChannelScore;
                              const channelNames: Record<string, string> = { google: "Google Ads", meta: "Meta Ads", linkedin: "LinkedIn Ads", tiktok: "TikTok Ads" };
                              const channelColors: Record<string, string> = { google: "border-blue-500/30 bg-blue-500/5", meta: "border-indigo-500/30 bg-indigo-500/5", linkedin: "border-cyan-500/30 bg-cyan-500/5", tiktok: "border-zinc-500/30 bg-zinc-500/5" };
                              const scoreColor = existing.score >= 70 ? "text-green-600" : existing.score >= 50 ? "text-yellow-600" : "text-red-500";

                              return (
                                <div key={channel} className={`rounded-xl border p-4 space-y-3 ${channelColors[channel]}`}>
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-foreground">{channelNames[channel]}</h4>
                                    <span className={`text-2xl font-bold ${scoreColor}`}>{existing.score}</span>
                                  </div>
                                  {existing.is_recommended !== undefined && (
                                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                                      existing.is_recommended ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
                                    }`}>
                                      {existing.is_recommended ? "✓ Recomendado" : "✗ Não recomendado"}
                                    </span>
                                  )}
                                  {existing.objective && (
                                    <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Objetivo:</span> {existing.objective}</p>
                                  )}
                                  {existing.funnel_role && (
                                    <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Funil:</span> {existing.funnel_role}</p>
                                  )}
                                  {existing.risks && existing.risks.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-foreground mb-1">Riscos:</p>
                                      <ul className="space-y-1">
                                        {existing.risks.map((risk, i) => (
                                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                            <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                                            <span>{risk}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {/* Editable score */}
                                  <div className="pt-2 border-t border-border/50">
                                    <label className="text-xs text-muted-foreground">Ajustar score:</label>
                                    <Input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={existing.score}
                                      className="h-8 mt-1"
                                      onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setChannelScores((prev) => {
                                          const current = prev[project.id] || [];
                                          const updated = current.filter((item) => item.channel !== channel);
                                          updated.push({ ...existing, channel, score: value });
                                          return { ...prev, [project.id]: updated };
                                        });
                                      }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Insights Section */}
                        <div className="border border-border rounded-xl p-4 sm:p-6 space-y-4">
                          <h3 className="text-base font-semibold text-foreground">Insights ({projectInsights.length})</h3>
                          
                          {projectInsights.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum insight gerado. Clique em "Reanalisar URL" para gerar insights automáticos.</p>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {projectInsights.map((insight) => {
                                const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
                                  warning: { label: "Alerta", color: "border-yellow-500/30 bg-yellow-500/5", icon: "⚠️" },
                                  opportunity: { label: "Oportunidade", color: "border-green-500/30 bg-green-500/5", icon: "💡" },
                                  improvement: { label: "Melhoria", color: "border-blue-500/30 bg-blue-500/5", icon: "🔧" },
                                };
                                const config = typeConfig[insight.type] || typeConfig.improvement;

                                return editingInsightId === insight.id ? (
                                  <div key={insight.id} className="border border-border rounded-lg p-3 space-y-2">
                                    <select
                                      className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                                      value={editingInsight.type || insight.type}
                                      onChange={(e) => setEditingInsight((prev) => ({ ...prev, type: e.target.value as Insight["type"] }))}
                                    >
                                      <option value="warning">Alerta</option>
                                      <option value="opportunity">Oportunidade</option>
                                      <option value="improvement">Melhoria</option>
                                    </select>
                                    <Input placeholder="Título" value={editingInsight.title || ""} onChange={(e) => setEditingInsight((prev) => ({ ...prev, title: e.target.value }))} className="h-8" />
                                    <Input placeholder="Descrição" value={editingInsight.description || ""} onChange={(e) => setEditingInsight((prev) => ({ ...prev, description: e.target.value }))} className="h-8" />
                                    <Input placeholder="Ação (opcional)" value={editingInsight.action || ""} onChange={(e) => setEditingInsight((prev) => ({ ...prev, action: e.target.value }))} className="h-8" />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleInsightUpdate(project.id, insight.id)}>Salvar</Button>
                                      <Button size="sm" variant="outline" onClick={cancelEditInsight}>Cancelar</Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div key={insight.id} className={`rounded-lg border p-3 space-y-2 ${config.color}`}>
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2 min-w-0">
                                        <span className="text-base flex-shrink-0">{config.icon}</span>
                                        <div className="min-w-0">
                                          <span className="inline-block text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-0.5">{config.label}</span>
                                          <p className="text-sm font-medium text-foreground leading-tight">{insight.title}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-0.5 flex-shrink-0">
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEditInsight(insight)}>
                                          <span className="text-xs">✏️</span>
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleInsightDelete(project.id, insight.id)}>
                                          <span className="text-xs">🗑️</span>
                                        </Button>
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                                    {insight.action && (
                                      <p className="text-xs text-primary font-medium">→ {insight.action}</p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Add insight form */}
                          <details className="group">
                            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                              + Adicionar insight manualmente
                            </summary>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              <select
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                value={insightDraft.type}
                                onChange={(e) => setInsightDraft((prev) => ({ ...prev, type: e.target.value as Insight["type"] }))}
                              >
                                <option value="warning">Alerta</option>
                                <option value="opportunity">Oportunidade</option>
                                <option value="improvement">Melhoria</option>
                              </select>
                              <Input placeholder="Título" value={insightDraft.title} onChange={(e) => setInsightDraft((prev) => ({ ...prev, title: e.target.value }))} />
                              <Input placeholder="Descrição" value={insightDraft.description} onChange={(e) => setInsightDraft((prev) => ({ ...prev, description: e.target.value }))} />
                              <Input placeholder="Ação (opcional)" value={insightDraft.action} onChange={(e) => setInsightDraft((prev) => ({ ...prev, action: e.target.value }))} />
                            </div>
                            <div className="flex justify-end mt-3">
                              <Button size="sm" onClick={() => handleInsightCreate(project.id)}>Adicionar insight</Button>
                            </div>
                          </details>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
