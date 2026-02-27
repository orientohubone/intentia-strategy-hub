import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useTenantData } from "@/hooks/useTenantData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeUrl, saveAnalysisResults, cleanBenchmarks, saveCompetitorBenchmark, checkBenchmarkLimit } from "@/lib/urlAnalyzer";
import type { UrlAnalysis } from "@/lib/urlAnalyzer";
import type { CompetitorStructuredData } from "@/components/StructuredDataViewer";
import { runAiAnalysis, getUserActiveKeys } from "@/lib/aiAnalyzer";
import { getModelsForProvider } from "@/lib/aiModels";
import type { AiAnalysisResult } from "@/lib/aiAnalyzer";
import { notifyProjectCreated, notifyProjectDeleted, notifyAiAnalysisCompleted } from "@/lib/notificationService";

export type Insight = {
  id: string;
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action?: string | null;
};

export type ChannelScore = {
  id?: string;
  channel: "google" | "meta" | "linkedin" | "tiktok";
  score: number;
  objective?: string | null;
  funnel_role?: string | null;
  is_recommended?: boolean | null;
  risks?: string[] | null;
};

export const channelList: ChannelScore["channel"][] = ["google", "meta", "linkedin", "tiktok"];

export function useProjectsData() {
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
    if (!user) return;
    const scores = channelScores[projectId] || [];
    const payload = scores.map((score) => ({
      project_id: projectId,
      user_id: user.id,
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
    if (!user || !insightDraft.title || !insightDraft.description) return;
    await supabase
      .from("insights")
      .insert({
        project_id: projectId,
        user_id: user.id,
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

  return {
    searchParams, setSearchParams,
    isDialogOpen, setIsDialogOpen,
    searchTerm, setSearchTerm,
    activeProjectId, setActiveProjectId,
    channelScores, setChannelScores,
    insights, setInsights,
    analyzing, setAnalyzing,
    analysisComplete, setAnalysisComplete,
    competitorTotal, setCompetitorTotal,
    currentCompetitorIndex, setCurrentCompetitorIndex,
    formState, setFormState,
    editingId, setEditingId,
    hasAiKeys, setHasAiKeys,
    heuristicResults, setHeuristicResults,
    aiResults, setAiResults,
    aiAnalyzing, setAiAnalyzing,
    availableAiModels, setAvailableAiModels,
    selectedAiModel, setSelectedAiModel,
    competitorSdMap, setCompetitorSdMap,
    collapsedSections, setCollapsedSections,
    editingInsightId, setEditingInsightId,
    editingInsight, setEditingInsight,
    insightDraft, setInsightDraft,
    
    // Derived & Handlers
    user,
    loading,
    canAnalyze,
    canAiAnalysis,
    heuristicCheck,
    tenantSettings,
    projectList,
    channelList,
    
    isSectionCollapsed,
    toggleSection,
    collapseAll,
    expandAll,
    handleProjectSubmit,
    startEdit,
    handleChannelSave,
    handleReanalyze,
    handleAiAnalysis,
    handleInsightCreate,
    handleInsightUpdate,
    handleInsightDelete,
    startEditInsight,
    cancelEditInsight,
    handleDeleteProject
  };
}
