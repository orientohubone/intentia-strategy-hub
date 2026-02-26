import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeUrl, saveAnalysisResults, analyzeCompetitors, cleanBenchmarks, saveCompetitorBenchmark, checkBenchmarkLimit } from "@/lib/urlAnalyzer";
import type { UrlAnalysis } from "@/lib/urlAnalyzer";
import { AnalysisProgressTracker } from "@/components/AnalysisProgressTracker";
import { AiAnalysisCard } from "@/components/AiAnalysisCard";
import { StructuredDataViewer } from "@/components/StructuredDataViewer";
import type { CompetitorStructuredData } from "@/components/StructuredDataViewer";
import { StructuredDataGenerator } from "@/components/StructuredDataGenerator";
import { runAiAnalysis, getUserActiveKeys } from "@/lib/aiAnalyzer";
import { AI_MODEL_LABELS, getModelsForProvider } from "@/lib/aiModels";
import type { AiAnalysisResult, UserApiKey } from "@/lib/aiAnalyzer";
import { exportAsJson, exportAsMarkdown, exportAsHtml, exportAsPdf } from "@/lib/exportAnalysis";
import { notifyProjectCreated, notifyProjectDeleted, notifyAiAnalysisCompleted } from "@/lib/notificationService";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  ChevronDown,
  ChevronsUpDown,
  ShieldAlert,
  BarChart3,
  Plus,
  Target,
  Search,
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
  const { isFeatureAvailable, checkFeature } = useFeatureFlags();
  const canAnalyze = isFeatureAvailable("url_heuristic_analysis");
  const heuristicCheck = checkFeature("url_heuristic_analysis");
  const canAiAnalysis = isFeatureAvailable("ai_project_analysis");
  const canAiKeys = isFeatureAvailable("ai_api_keys");
  const {
    projects,
    tenantSettings,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch,
  } = useTenantData();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [channelScores, setChannelScores] = useState<Record<string, ChannelScore[]>>({});
  const [insights, setInsights] = useState<Record<string, Insight[]>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [competitorTotal, setCompetitorTotal] = useState(0);
  const [currentCompetitorIndex, setCurrentCompetitorIndex] = useState(0);
  const [formState, setFormState] = useState({
    name: "",
    niche: "",
    url: "",
    competitorUrls: "" as string,
    solutionContext: "",
    missingFeatures: "",
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
  const [competitorSdMap, setCompetitorSdMap] = useState<Record<string, CompetitorStructuredData[]>>({});
  const SECTION_KEYS = ["heuristic", "ai", "overview", "channels", "insights"] as const;
  type SectionKey = typeof SECTION_KEYS[number];
  const [collapsedSections, setCollapsedSections] = useState<Record<string, Set<SectionKey>>>({});

  // Auto open dialog if "new=1" is in URL
  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setIsDialogOpen(true);
      // Optional: Remove query param so it doesn't reopen on refresh
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const isSectionCollapsed = (projectId: string, section: SectionKey) =>
    collapsedSections[projectId]?.has(section) ?? false;

  const toggleSection = (projectId: string, section: SectionKey) => {
    setCollapsedSections((prev) => {
      const current = new Set(prev[projectId] || []);
      if (current.has(section)) current.delete(section);
      else current.add(section);
      return { ...prev, [projectId]: current };
    });
  };

  const collapseAll = (projectId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [projectId]: new Set(SECTION_KEYS),
    }));
  };

  const expandAll = (projectId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [projectId]: new Set(),
    }));
  };

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
      const { data: scoreData } = await supabase
        .from("project_channel_scores")
        .select("id, channel, score, objective, funnel_role, is_recommended, risks")
        .eq("project_id", activeProjectId);

      const { data: insightData } = await supabase
        .from("insights")
        .select("id, type, title, description, action")
        .eq("project_id", activeProjectId)
        .order("created_at", { ascending: false });

      // Fetch competitor benchmarks with structured data
      const { data: benchmarkData } = await supabase
        .from("benchmarks")
        .select("competitor_name, competitor_url, structured_data, html_snapshot, html_snapshot_at")
        .eq("project_id", activeProjectId);

      setChannelScores((prev) => ({
        ...prev,
        [activeProjectId]: (scoreData || []) as ChannelScore[],
      }));
      setInsights((prev) => ({
        ...prev,
        [activeProjectId]: (insightData || []) as Insight[],
      }));
      if (benchmarkData && benchmarkData.length > 0) {
        setCompetitorSdMap((prev) => ({
          ...prev,
          [activeProjectId]: benchmarkData.map((b: any) => ({
            name: b.competitor_name,
            url: b.competitor_url,
            structuredData: b.structured_data || null,
            htmlSnapshot: b.html_snapshot || null,
            htmlSnapshotAt: b.html_snapshot_at || null,
          })),
        }));
      }
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
      const projectName = formState.name.trim();
      const projectNiche = formState.niche.trim();

      const shouldAnalyze = canAnalyze;

      if (editingId) {
        const result = await updateProject(editingId, {
          name: projectName,
          niche: projectNiche,
          url: urlToAnalyze,
          competitor_urls: competitorUrls,
          solution_context: formState.solutionContext,
          // campo adicional para lacunas/funcionalidades ausentes
          missing_features: formState.missingFeatures,
          status: shouldAnalyze ? "analyzing" : formState.status,
          last_update: new Date().toISOString(),
        } as any);
        projectId = editingId;
        toast.success(shouldAnalyze ? "Projeto atualizado! Iniciando análise..." : "Projeto atualizado!");
      } else {
        const result = await createProject({
          name: projectName,
          niche: projectNiche,
          url: urlToAnalyze,
          competitor_urls: competitorUrls,
          solution_context: formState.solutionContext,
          // campo adicional para lacunas/funcionalidades ausentes
          missing_features: formState.missingFeatures,
          score: 0,
          status: shouldAnalyze ? "analyzing" : "pending",
          last_update: new Date().toISOString(),
        } as any);
        projectId = result.id;
        toast.success(shouldAnalyze ? "Projeto criado! Iniciando análise..." : "Projeto criado! Análise heurística indisponível no momento.");
        if (!editingId && user) notifyProjectCreated(user.id, projectName);
      }
      setFormState({ name: "", niche: "", url: "", competitorUrls: "", solutionContext: "", missingFeatures: "", status: "pending" });
      setEditingId(null);
      setIsDialogOpen(false);

      // Run URL analysis in background (only if feature is available)
      if (user && shouldAnalyze) {
        setAnalyzing(true);
        setAnalysisComplete(false);
        setCompetitorTotal(competitorUrls.length);
        setCurrentCompetitorIndex(0);
        try {
          const analysis = await analyzeUrl(urlToAnalyze);
          await saveAnalysisResults(projectId, user.id, analysis);
          // Store heuristic results in local state
          setHeuristicResults(prev => ({ ...prev, [projectId]: analysis }));
          // Clean old benchmarks for this project before generating new ones
          await cleanBenchmarks(projectId, user.id);
          // Analyze competitors and generate benchmarks (with plan limit enforcement)
          if (competitorUrls.length > 0) {
            for (let i = 0; i < competitorUrls.length; i++) {
              // Check limit before each competitor (saveCompetitorBenchmark also checks, but we avoid unnecessary URL fetches)
              const limitCheck = await checkBenchmarkLimit(user.id);
              if (!limitCheck.allowed) {
                toast.info(`Limite de ${limitCheck.limit} benchmarks atingido no plano Starter. Faça upgrade para ilimitados.`);
                break;
              }

              setCurrentCompetitorIndex(i);
              try {
                const compAnalysis = await analyzeUrl(competitorUrls[i]);
                let competitorName: string;
                try {
                  competitorName = new URL(competitorUrls[i]).hostname.replace("www.", "");
                } catch {
                  competitorName = competitorUrls[i];
                }
                // Save benchmark (reuse internal logic — also enforces limit internally)
                await saveCompetitorBenchmark(projectId, user.id, { name: competitorName, niche: projectNiche, url: competitorUrls[i] }, compAnalysis);
              } catch (err: any) {
                console.error(`[benchmark] Erro ao analisar concorrente ${competitorUrls[i]}:`, err.message);
              }
            }
          }
          setAnalysisComplete(true);
          toast.success(`Análise concluída! Score: ${analysis.overallScore}/100`);
          // Single notification — guarded by ref to prevent duplicates
          if (notificationSentRef.current !== projectId) {
            notificationSentRef.current = projectId;
            await supabase.from("notifications").insert({
              user_id: user.id,
              title: "Análise Heurística Concluída",
              message: `Análise de "${projectName || 'Projeto'}" concluída com score ${analysis.overallScore}/100.`,
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
      solutionContext: (project as any).solution_context || "",
      missingFeatures: (project as any).missing_features || "",
      status: project.status as any,
    });
    setIsDialogOpen(true);
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

    await supabase
      .from("project_channel_scores")
      .upsert(payload, { onConflict: "project_id,channel" });
  };

  const handleReanalyze = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project || !user) return;

    const competitors = project.competitor_urls || [];
    setAnalyzing(true);
    setAnalysisComplete(false);
    setCompetitorTotal(competitors.length);
    setCurrentCompetitorIndex(0);
    try {
      await updateProject(projectId, { status: "analyzing" });
      const analysis = await analyzeUrl(project.url);
      await saveAnalysisResults(projectId, user.id, analysis);
      // Store heuristic results in local state
      setHeuristicResults(prev => ({ ...prev, [projectId]: analysis }));
      // Clean old benchmarks for this project
      await cleanBenchmarks(projectId, user.id);
      // Analyze competitors if any
      if (competitors.length > 0) {
        for (let i = 0; i < competitors.length; i++) {
          setCurrentCompetitorIndex(i);
          try {
            const compAnalysis = await analyzeUrl(competitors[i]);
            let competitorName: string;
            try {
              competitorName = new URL(competitors[i]).hostname.replace("www.", "");
            } catch {
              competitorName = competitors[i];
            }
            await saveCompetitorBenchmark(projectId, user.id, { name: competitorName, niche: project.niche, url: competitors[i] }, compAnalysis);
          } catch (err: any) {
            console.error(`[benchmark] Erro ao analisar concorrente ${competitors[i]}:`, err.message);
          }
        }
      }
      setAnalysisComplete(true);
      toast.success(`Reanálise concluída! Score: ${analysis.overallScore}/100`);
      // Single notification — guarded by ref to prevent duplicates
      if (notificationSentRef.current !== projectId) {
        notificationSentRef.current = projectId;
        await supabase.from("notifications").insert({
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
        await notifyAiAnalysisCompleted(user.id, project.name, projectId, result.investmentReadiness.score);
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
    await supabase
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
      const { error } = await supabase
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
      await supabase.from("insights").delete().eq("id", insightId);
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
    const projectName = projects.find(p => p.id === projectId)?.name || 'Projeto';
    try {
      await deleteProject(projectId);
      toast.success("Projeto excluído com sucesso!");
      if (user) notifyProjectDeleted(user.id, projectName);
    } catch (error: any) {
      console.error("Erro ao excluir projeto:", error);
      toast.error(error?.message || "Erro ao excluir projeto. Tente novamente.");
    }
  };

  const projectList = useMemo(() => projects, [projects]);

  return (
    <DashboardLayout>
      <SEO title="Projetos" noindex />
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Projetos</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus projetos e análises.</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden sidebar-scroll">
            <DialogHeader>
              <DialogTitle>{editingId ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
              <DialogDescription>
                {editingId ? "Atualize as informações do seu projeto." : "Preencha os dados do projeto para receber seu diagnóstico heurístico e score de mídia."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProjectSubmit} className="grid gap-4 mt-2">
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="solutionContext">Contexto da solução</Label>
                  <textarea
                    id="solutionContext"
                    className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Descreva o produto/solução, funcionalidades, diferenciais e proposta de valor. Isso será usado na linha editorial."
                    value={formState.solutionContext}
                    onChange={(e) => setFormState((prev) => ({ ...prev, solutionContext: e.target.value }))}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="missingFeatures">O que não temos (lacunas/funcionalidades ausentes)</Label>
                  <textarea
                    id="missingFeatures"
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Liste funcionalidades, integrações ou características que ainda não existem no projeto (ex.: checkout nativo, onboarding guiado, integrações ERP X)."
                    value={formState.missingFeatures}
                    onChange={(e) => setFormState((prev) => ({ ...prev, missingFeatures: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Usaremos estas lacunas para deixar o ICP e o plano de comunicação mais coerentes (não inventar features ausentes).</p>
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
              {!canAnalyze && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {heuristicCheck.status === "plan_blocked"
                      ? "O Diagnóstico Heurístico de URL não está disponível no seu plano atual. Faça upgrade para desbloquear esta funcionalidade."
                      : heuristicCheck.status === "disabled"
                        ? "O Diagnóstico Heurístico de URL está temporariamente desativado."
                        : heuristicCheck.status === "maintenance"
                          ? "O Diagnóstico Heurístico de URL está em manutenção. Voltamos em breve."
                          : heuristicCheck.status === "development"
                            ? "O Diagnóstico Heurístico de URL está em desenvolvimento. Em breve!"
                            : heuristicCheck.message || "Diagnóstico heurístico indisponível no momento."}
                    {" "}O projeto será criado sem análise automática.
                  </span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Button type="submit" disabled={analyzing} className="text-sm">
                  {analyzing ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></span>
                      <span className="hidden sm:inline">Análise em andamento...</span>
                      <span className="sm:hidden">Analisando...</span>
                    </>
                  ) : editingId ? "Salvar alterações" : canAnalyze ? (
                    <><span className="hidden sm:inline">Criar projeto e analisar URL</span><span className="sm:hidden">Criar e analisar</span></>
                  ) : "Criar projeto"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" disabled={analyzing} onClick={() => {
                    setEditingId(null);
                    setFormState({ name: "", niche: "", url: "", competitorUrls: "", solutionContext: "", missingFeatures: "", status: "pending" });
                    setIsDialogOpen(false);
                  }}>
                    Cancelar
                  </Button>
                )}
                {tenantSettings && (() => {
                  const plan = tenantSettings.plan || 'starter';
                  const maxProj = (tenantSettings as any).max_projects ?? (plan === 'starter' ? 5 : -1);
                  const projCount = projects.filter((p: any) => !p.deleted_at).length;
                  const projUnlimited = maxProj < 0;
                  const projAtLimit = !projUnlimited && projCount >= maxProj;
                  const projNear = !projUnlimited && !projAtLimit && maxProj - projCount <= 1;

                  const aUsed = tenantSettings.analyses_used;
                  const aLimit = tenantSettings.monthly_analyses_limit;
                  const aUnlimited = aLimit < 0;
                  const aAtLimit = !aUnlimited && aUsed >= aLimit;
                  const aNear = !aUnlimited && !aAtLimit && aLimit - aUsed <= 2;

                  const worst = projAtLimit || aAtLimit ? "limit" : projNear || aNear ? "near" : "ok";
                  return (
                    <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md border ${worst === "limit"
                      ? "bg-red-500/10 border-red-500/20 text-red-500"
                      : worst === "near"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        : "bg-muted/50 border-border text-muted-foreground"
                      }`}>
                      <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="font-medium">
                        {projUnlimited ? `${projCount} proj` : `${projCount}/${maxProj} proj`}
                      </span>
                      <span className="text-muted-foreground/50">|</span>
                      <span className="font-medium">
                        {aUnlimited ? `${aUsed} análises` : `${aUsed}/${aLimit} análises`}
                      </span>
                      {(projAtLimit || aAtLimit) && <span className="text-[10px]">• Limite atingido</span>}
                    </div>
                  );
                })()}
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Analysis Progress Tracker */}
        <AnalysisProgressTracker
          isAnalyzing={analyzing}
          competitorCount={competitorTotal}
          currentCompetitor={currentCompetitorIndex}
          isComplete={analysisComplete}
        />

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg bg-card p-4 space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-20 bg-muted rounded" />
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-24 bg-muted rounded-full" />
                  <div className="h-6 w-24 bg-muted rounded-full" />
                  <div className="h-6 w-24 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && projectList.length === 0 && (
          <div className="flex flex-col items-center text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/30">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Crie seu primeiro projeto</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">Primeiro passo para seu diagnóstico estratégico completo com scores, insights e recomendações por canal.</p>
            <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Projeto
            </Button>
          </div>
        )}

        {!loading && projectList.length > 0 && (
          <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                    <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Projetos</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">{projectList.length}</p>
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
                      {projectList.length > 0 ? Math.round(projectList.reduce((acc, p) => acc + p.score, 0) / projectList.length) : 0}
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
                      {projectList.length > 0 ? Math.max(...projectList.map(p => p.score)) : 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg shrink-0">
                    <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Insights</p>
                    <p className="text-lg sm:text-xl font-bold text-foreground">
                      {Object.values(insights).reduce((acc, arr) => acc + arr.length, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.url.toLowerCase().includes(searchTerm.toLowerCase()) || p.niche.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => {
            const isActive = activeProjectId === project.id;
            const scores = channelScores[project.id] || channelList.map((channel) => ({ channel, score: 0 } as ChannelScore));
            const projectInsights = insights[project.id] || [];

            return (
              <React.Fragment key={project.id}>
                <div id={`project-${project.id}`} className="border border-border rounded-xl bg-card p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <h2 className="text-lg font-semibold text-foreground line-clamp-1">{project.name}</h2>
                      <div className="flex gap-1 shrink-0">
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted transition-colors disabled:opacity-50"
                                onClick={() => handleReanalyze(project.id)}
                                disabled={analyzing || !canAnalyze}
                              >
                                <RefreshCw className={`h-3 w-3 ${analyzing ? "animate-spin" : ""}`} />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Reanalisar URL</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7">
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
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-wrap">
                      <Badge variant="secondary" className="text-[10px] font-medium">{project.niche}</Badge>
                      <span className="truncate max-w-full text-xs opacity-80" title={project.url}>{project.url}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-muted/40 rounded-lg p-2 flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase opacity-80">Score</span>
                        <span className={`text-lg font-bold ${project.score >= 70 ? "text-green-600" : project.score >= 50 ? "text-yellow-600" : "text-red-500"}`}>{project.score}</span>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2 flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase opacity-80">Status</span>
                        <span className="text-sm font-semibold capitalize mt-auto">{project.status === "completed" ? "Concluído" : "Pendente"}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Button size="sm" className="w-full flex justify-center items-center gap-1.5 mt-2" variant="outline" onClick={() => setActiveProjectId(project.id)}>
                      <FolderOpen className="h-3.5 w-3.5" />
                      Visualizar & Gerenciar
                    </Button>
                  </div>
                </div>

                {/* Project Detail Dialog overlays the space instead of expanding inline */}
                <Dialog open={isActive} onOpenChange={(open) => { if (!open) setActiveProjectId(null); }}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden sidebar-scroll">
                    <div className="space-y-6 pt-2">
                      <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                          <span className="line-clamp-1">{project.name}</span>
                          <Badge variant={project.score >= 70 ? "default" : project.score >= 50 ? "secondary" : "destructive"} className="shrink-0 text-xs">
                            Score: {project.score}
                          </Badge>
                        </DialogTitle>
                        <DialogDescription className="flex items-center gap-2 text-xs truncate">
                          <span>{project.niche}</span> • <span>{project.url}</span>
                        </DialogDescription>
                      </DialogHeader>
                      {/* Removed old manage button row */}


                      <div className="space-y-6">
                        {/* Collapse / Expand All */}
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                            onClick={() => expandAll(project.id)}
                          >
                            <ChevronsUpDown className="h-3.5 w-3.5" />
                            Expandir todas
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                            onClick={() => collapseAll(project.id)}
                          >
                            <ChevronsUpDown className="h-3.5 w-3.5 rotate-90" />
                            Colapsar todas
                          </Button>
                        </div>

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
                            <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                                    onClick={() => toggleSection(project.id, "heuristic")}
                                  >
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "heuristic") ? "-rotate-90" : ""}`} />
                                    <FileSearch className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                    <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">Análise Heurística</h3>
                                    <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline-flex">
                                      {project.heuristic_completed_at
                                        ? new Date(project.heuristic_completed_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                        : "Concluída"}
                                    </Badge>
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/5"
                                    onClick={() => window.location.href = `/seo-geo?project=${project.id}`}
                                    title="Análise completa de SEO, Core Web Vitals e Performance"
                                  >
                                    <Globe className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">SEO & Performance</span>
                                    <span className="sm:hidden">SEO</span>
                                  </Button>
                                  {hasAiKeys && canAiAnalysis ? (
                                    <>
                                      <Select
                                        value={selectedAiModel}
                                        onValueChange={setSelectedAiModel}
                                        disabled={aiAnalyzing === project.id}
                                      >
                                        <SelectTrigger className="h-8 w-[130px] sm:w-[160px] text-xs border-primary/30 bg-primary/5">
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
                                        disabled={project.status !== "completed" || analyzing || aiAnalyzing === project.id || !canAiAnalysis}
                                        title={!canAiAnalysis ? "Análise por IA indisponível no seu plano" : project.status !== "completed" ? "Aguardando conclusão da análise heurística" : "Executar análise por IA"}
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
                                    <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground text-xs" onClick={() => window.location.href = "/settings"}>
                                      <Settings className="h-3.5 w-3.5" />
                                      <span className="hidden sm:inline">Configurar IA</span>
                                      <span className="sm:hidden">Config IA</span>
                                    </Button>
                                  )}
                                </div>
                              </div>

                              {!isSectionCollapsed(project.id, "heuristic") && (<>
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

                                {/* Structured Data & HTML Snapshot (unified: principal + competitors) */}
                                {(() => {
                                  // Build structured data from Edge Function response, DB columns, or synthesize from meta
                                  const sd = ha.structuredData || (project as any).structured_data;
                                  const hs = ha.htmlSnapshot || (project as any).html_snapshot;
                                  // If no structured data from Edge Function, synthesize OG from existing meta
                                  const fallbackSd = !sd && ha.meta ? {
                                    jsonLd: [],
                                    microdata: [],
                                    openGraph: Object.fromEntries(
                                      [
                                        ha.meta.ogTitle && ["og:title", ha.meta.ogTitle],
                                        ha.meta.ogDescription && ["og:description", ha.meta.ogDescription],
                                        ha.meta.ogImage && ["og:image", ha.meta.ogImage],
                                        ha.meta.language && ["og:locale", ha.meta.language],
                                      ].filter(Boolean) as [string, string][]
                                    ),
                                    twitterCard: {},
                                  } : null;
                                  const finalSd = sd || fallbackSd;
                                  const compSd = competitorSdMap[project.id] || [];
                                  return (
                                    <>
                                      <StructuredDataViewer
                                        structuredData={finalSd}
                                        htmlSnapshot={hs}
                                        htmlSnapshotAt={(project as any).html_snapshot_at}
                                        competitors={compSd}
                                        projectName={project.name}
                                      />
                                      <StructuredDataGenerator
                                        projectStructuredData={finalSd}
                                        projectMeta={ha.meta}
                                        projectUrl={project.url}
                                        projectName={project.name}
                                        projectNiche={project.niche}
                                        competitors={compSd}
                                      />
                                    </>
                                  );
                                })()}

                                {/* AI Analysis Status / Results */}
                                {project.status === "completed" && !aiResults[project.id] && !project.ai_analysis && aiAnalyzing !== project.id && (
                                  <div className={`rounded-lg border border-dashed p-3 flex items-center gap-3 ${canAiAnalysis ? "border-primary/30 bg-primary/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                                    <Sparkles className={`h-5 w-5 flex-shrink-0 ${canAiAnalysis ? "text-primary" : "text-amber-500"}`} />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium text-foreground">
                                        {canAiAnalysis ? "Análise por IA disponível" : "Análise por IA indisponível no seu plano"}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        {!canAiAnalysis
                                          ? "Faça upgrade para o plano Professional para desbloquear a análise por IA."
                                          : hasAiKeys
                                            ? "Clique em \"Analisar com IA\" para obter insights semânticos aprofundados."
                                            : "Configure suas API keys em Configurações → Integrações de IA para habilitar."}
                                      </p>
                                    </div>
                                    {canAiAnalysis && !hasAiKeys && (
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
                              </>)}
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
                            <div className="border border-primary/20 rounded-xl p-3 sm:p-4 md:p-6 space-y-5 bg-primary/[0.02]">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                                    onClick={() => toggleSection(project.id, "ai")}
                                  >
                                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "ai") ? "-rotate-90" : ""}`} />
                                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                                    <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">Análise por IA</h3>
                                    <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline-flex">
                                      {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {ai.model.split("-").slice(0, 3).join("-")}
                                    </Badge>
                                  </button>
                                  {/* Mobile: dropdown export | Desktop: inline buttons */}
                                  {(() => {
                                    const ha = heuristicResults[project.id] || project.heuristic_analysis as UrlAnalysis | undefined;
                                    const exportData = { projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha as UrlAnalysis | undefined, ai };
                                    return (
                                      <>
                                        <div className="hidden sm:flex items-center gap-1">
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
                                        </div>
                                        <div className="sm:hidden">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                              <Button size="icon" variant="ghost" className="h-7 w-7">
                                                <Download className="h-3.5 w-3.5" />
                                              </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                              <DropdownMenuItem onClick={() => exportAsJson(exportData)}>Exportar JSON</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => exportAsMarkdown(exportData)}>Exportar Markdown</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => exportAsHtml(exportData)}>Exportar HTML</DropdownMenuItem>
                                              <DropdownMenuItem onClick={() => exportAsPdf(exportData)}>Exportar PDF</DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                                {ai.analyzedAt && (
                                  <p className="text-[10px] text-muted-foreground pl-7 sm:pl-9">
                                    {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {new Date(ai.analyzedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                  </p>
                                )}
                              </div>

                              {!isSectionCollapsed(project.id, "ai") && (<>
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
                              </>)}
                            </div>
                          );
                        })()}

                        {/* Project Score Overview */}
                        <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                          <button
                            type="button"
                            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => toggleSection(project.id, "overview")}
                          >
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "overview") ? "-rotate-90" : ""}`} />
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                            <h3 className="text-sm sm:text-base font-semibold text-foreground">Visão Geral do Projeto</h3>
                          </button>
                          {!isSectionCollapsed(project.id, "overview") && (
                            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                              <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                                <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Score</p>
                                <p className={`text-xl sm:text-3xl font-bold ${project.score >= 70 ? "text-green-600" : project.score >= 50 ? "text-yellow-600" : "text-red-500"
                                  }`}>{project.score}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">de 100</p>
                              </div>
                              <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                                <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Status</p>
                                <p className="text-sm sm:text-lg font-semibold text-foreground capitalize">{project.status === "completed" ? "Concluído" : project.status === "analyzing" ? "Analisando" : "Pendente"}</p>
                              </div>
                              <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                                <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Análise</p>
                                <p className="text-sm sm:text-lg font-semibold text-foreground">
                                  {project.last_update ? new Date(project.last_update).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }) : "—"}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Channel Scores Cards */}
                        <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => toggleSection(project.id, "channels")}
                            >
                              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "channels") ? "-rotate-90" : ""}`} />
                              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                              <h3 className="text-sm sm:text-base font-semibold text-foreground">Scores por Canal</h3>
                            </button>
                            {!isSectionCollapsed(project.id, "channels") && (
                              <Button size="sm" variant="outline" className="text-xs" onClick={() => handleChannelSave(project.id)}>
                                <span className="hidden sm:inline">Salvar alterações</span>
                                <span className="sm:hidden">Salvar</span>
                              </Button>
                            )}
                          </div>
                          {!isSectionCollapsed(project.id, "channels") && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {channelList.map((channel) => {
                                const existing = scores.find((item) => item.channel === channel) || { channel, score: 0 } as ChannelScore;
                                const channelNames: Record<string, string> = { google: "Google Ads", meta: "Meta Ads", linkedin: "LinkedIn Ads", tiktok: "TikTok Ads" };
                                const channelLogos: Record<string, string> = { google: "/google-ads.svg", meta: "/meta-ads.svg", linkedin: "/linkedin-ads.svg", tiktok: "/tiktok-ads.svg" };
                                const channelColors: Record<string, string> = { google: "border-blue-500/30 bg-blue-500/5", meta: "border-indigo-500/30 bg-indigo-500/5", linkedin: "border-cyan-500/30 bg-cyan-500/5", tiktok: "border-zinc-500/30 bg-zinc-500/5" };
                                const scoreColor = existing.score >= 70 ? "text-green-600" : existing.score >= 50 ? "text-yellow-600" : "text-red-500";

                                return (
                                  <div key={channel} className={`rounded-xl border p-3 sm:p-4 space-y-3 ${channelColors[channel]}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white dark:bg-gray-900 border border-border/50 p-1 sm:p-1.5 flex-shrink-0">
                                          <img src={channelLogos[channel]} alt={channelNames[channel]} className={`w-full h-full object-contain ${channel === "tiktok" ? "dark:brightness-0 dark:invert" : ""}`} />
                                        </div>
                                        <h4 className="text-sm sm:text-base font-semibold text-foreground">{channelNames[channel]}</h4>
                                      </div>
                                      <span className={`text-xl sm:text-2xl font-bold ${scoreColor}`}>{existing.score}</span>
                                    </div>
                                    {existing.is_recommended !== undefined && (
                                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${existing.is_recommended ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
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
                          )}
                        </div>

                        {/* Insights Section */}
                        <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                          <button
                            type="button"
                            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => toggleSection(project.id, "insights")}
                          >
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "insights") ? "-rotate-90" : ""}`} />
                            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                            <h3 className="text-sm sm:text-base font-semibold text-foreground">Insights ({projectInsights.length})</h3>
                          </button>

                          {!isSectionCollapsed(project.id, "insights") && (<>
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
                          </>)}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* AI Analysis Card - shown when analyzing this project */}
                {aiAnalyzing === project.id && (
                  <AiAnalysisCard
                    projectName={project.name}
                    model={selectedAiModel.split("::")[1] || "IA"}
                    onComplete={() => setAiAnalyzing(null)}
                    onCancel={() => setAiAnalyzing(null)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
