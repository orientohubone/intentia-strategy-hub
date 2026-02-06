import { useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeUrl, saveAnalysisResults, analyzeCompetitors, cleanBenchmarks } from "@/lib/urlAnalyzer";
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
  const [editingInsightId, setEditingInsightId] = useState<string | null>(null);
  const [editingInsight, setEditingInsight] = useState<Partial<Insight>>({});
  const [insightDraft, setInsightDraft] = useState({
    type: "warning" as Insight["type"],
    title: "",
    description: "",
    action: "",
  });

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
          // Clean old benchmarks for this project before generating new ones
          await cleanBenchmarks(projectId, user.id);
          // Analyze competitors and generate benchmarks
          if (competitorUrls.length > 0) {
            toast.info(`Analisando ${competitorUrls.length} concorrente(s)...`);
            await analyzeCompetitors(projectId, user.id, competitorUrls, formState.niche.trim());
          }
          toast.success(`Análise concluída! Score: ${analysis.overallScore}/100`);
          await refetch();
        } catch (analysisError: any) {
          console.error("Erro na análise:", analysisError);
          toast.error(`Análise falhou: ${analysisError.message}. Você pode reanalisar depois.`);
          await updateProject(projectId, { status: "pending" });
        } finally {
          setAnalyzing(false);
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
      // Clean old benchmarks for this project
      await cleanBenchmarks(projectId, user.id);
      // Analyze competitors if any
      const competitors = project.competitor_urls || [];
      if (competitors.length > 0) {
        toast.info(`Analisando ${competitors.length} concorrente(s)...`);
        await analyzeCompetitors(projectId, user.id, competitors, project.niche);
      }
      toast.success(`Reanálise concluída! Score: ${analysis.overallScore}/100`);
      await refetch();
      // Refresh details if this project is active
      if (activeProjectId === projectId) {
        setActiveProjectId(null);
        setTimeout(() => setActiveProjectId(projectId), 100);
      }
    } catch (error: any) {
      console.error("Erro na reanálise:", error);
      toast.error(`Reanálise falhou: ${error.message}`);
      await updateProject(projectId, { status: "pending" });
    } finally {
      setAnalyzing(false);
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
                        <p className="text-sm text-muted-foreground">{project.niche} • {project.url}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => startEdit(project.id)}>Editar</Button>
                        <Button size="sm" variant="outline" onClick={() => handleReanalyze(project.id)} disabled={analyzing}>
                          {analyzing ? "Analisando..." : "Reanalisar URL"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setActiveProjectId(isActive ? null : project.id)}>
                          {isActive ? "Fechar" : "Gerenciar"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive">Excluir</Button>
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
                      </div>
                    </div>

                    {isActive && (
                      <div className="space-y-6">
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
