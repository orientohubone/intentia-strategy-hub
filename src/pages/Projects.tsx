import { useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
  } = useTenantData();

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [channelScores, setChannelScores] = useState<Record<string, ChannelScore[]>>({});
  const [insights, setInsights] = useState<Record<string, Insight[]>>({});
  const [formState, setFormState] = useState({
    name: "",
    niche: "",
    url: "",
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
    
    try {
      if (editingId) {
        await updateProject(editingId, {
          name: formState.name.trim(),
          niche: formState.niche.trim(),
          url: formState.url.trim(),
          status: formState.status,
          last_update: new Date().toISOString(),
        });
        toast.success("Projeto atualizado com sucesso!");
      } else {
        await createProject({
          name: formState.name.trim(),
          niche: formState.niche.trim(),
          url: formState.url.trim(),
          score: 0,
          status: formState.status,
          last_update: new Date().toISOString(),
        });
        toast.success("Projeto criado com sucesso!");
      }

      setFormState({ name: "", niche: "", url: "", status: "pending" });
      setEditingId(null);
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
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
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
              <div className="flex items-center gap-3">
                <Button type="submit">{editingId ? "Salvar alterações" : "Criar projeto"}</Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={() => {
                    setEditingId(null);
                    setFormState({ name: "", niche: "", url: "", status: "pending" });
                  }}>
                    Cancelar
                  </Button>
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
                      <div className="grid gap-6">
                        <div className="border border-border rounded-lg p-4 space-y-4">
                          <h3 className="text-base font-semibold text-foreground">Scores por Canal</h3>
                          <div className="grid gap-4">
                            {channelList.map((channel) => {
                              const existing = scores.find((item) => item.channel === channel) || { channel, score: 0 };
                              return (
                                <div key={channel} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                                  <div className="text-sm font-medium capitalize">{channel}</div>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={existing.score}
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
                                  <Input
                                    placeholder="Objetivo"
                                    value={existing.objective ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setChannelScores((prev) => {
                                        const current = prev[project.id] || [];
                                        const updated = current.filter((item) => item.channel !== channel);
                                        updated.push({ ...existing, channel, objective: value });
                                        return { ...prev, [project.id]: updated };
                                      });
                                    }}
                                  />
                                  <Input
                                    placeholder="Papel no funil"
                                    value={existing.funnel_role ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setChannelScores((prev) => {
                                        const current = prev[project.id] || [];
                                        const updated = current.filter((item) => item.channel !== channel);
                                        updated.push({ ...existing, channel, funnel_role: value });
                                        return { ...prev, [project.id]: updated };
                                      });
                                    }}
                                  />
                                  <Input
                                    placeholder="Riscos (separados por vírgula)"
                                    value={(existing.risks || []).join(", ")}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setChannelScores((prev) => {
                                        const current = prev[project.id] || [];
                                        const updated = current.filter((item) => item.channel !== channel);
                                        updated.push({
                                          ...existing,
                                          channel,
                                          risks: value.split(",").map((item) => item.trim()).filter(Boolean),
                                        });
                                        return { ...prev, [project.id]: updated };
                                      });
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleChannelSave(project.id)}>Salvar canais</Button>
                          </div>
                        </div>

                        <div className="border border-border rounded-lg p-4 space-y-4">
                          <h3 className="text-base font-semibold text-foreground">Insights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <select
                              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                              value={insightDraft.type}
                              onChange={(e) => setInsightDraft((prev) => ({ ...prev, type: e.target.value as Insight["type"] }))}
                            >
                              <option value="warning">Alerta</option>
                              <option value="opportunity">Oportunidade</option>
                              <option value="improvement">Melhoria</option>
                            </select>
                            <Input
                              placeholder="Título"
                              value={insightDraft.title}
                              onChange={(e) => setInsightDraft((prev) => ({ ...prev, title: e.target.value }))}
                            />
                            <Input
                              placeholder="Descrição"
                              value={insightDraft.description}
                              onChange={(e) => setInsightDraft((prev) => ({ ...prev, description: e.target.value }))}
                            />
                            <Input
                              placeholder="Ação (opcional)"
                              value={insightDraft.action}
                              onChange={(e) => setInsightDraft((prev) => ({ ...prev, action: e.target.value }))}
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" onClick={() => handleInsightCreate(project.id)}>Adicionar insight</Button>
                          </div>
                          <div className="space-y-2">
                            {projectInsights.length === 0 && (
                              <p className="text-sm text-muted-foreground">Nenhum insight cadastrado.</p>
                            )}
                            {projectInsights.map((insight) => (
                              <div key={insight.id} className="flex items-start justify-between border border-border rounded-md p-3">
                                {editingInsightId === insight.id ? (
                                  <div className="flex-1 space-y-2">
                                    <select
                                      className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                                      value={editingInsight.type || insight.type}
                                      onChange={(e) => setEditingInsight((prev) => ({ ...prev, type: e.target.value as Insight["type"] }))}
                                    >
                                      <option value="warning">Alerta</option>
                                      <option value="opportunity">Oportunidade</option>
                                      <option value="improvement">Melhoria</option>
                                    </select>
                                    <Input
                                      placeholder="Título"
                                      value={editingInsight.title || ""}
                                      onChange={(e) => setEditingInsight((prev) => ({ ...prev, title: e.target.value }))}
                                      className="h-8"
                                    />
                                    <Input
                                      placeholder="Descrição"
                                      value={editingInsight.description || ""}
                                      onChange={(e) => setEditingInsight((prev) => ({ ...prev, description: e.target.value }))}
                                      className="h-8"
                                    />
                                    <Input
                                      placeholder="Ação (opcional)"
                                      value={editingInsight.action || ""}
                                      onChange={(e) => setEditingInsight((prev) => ({ ...prev, action: e.target.value }))}
                                      className="h-8"
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => handleInsightUpdate(project.id, insight.id)}>
                                        Salvar
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={cancelEditInsight}>
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-foreground">{insight.title}</p>
                                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                                      {insight.action && (
                                        <p className="text-xs text-primary mt-1">{insight.action}</p>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="ghost" onClick={() => startEditInsight(insight)}>
                                        Editar
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => handleInsightDelete(project.id, insight.id)}>
                                        Remover
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
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
