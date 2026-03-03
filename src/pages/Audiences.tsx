import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { toast } from "sonner";
import { Users, Target, TrendingUp, Globe, FileSpreadsheet, FolderOpen, ChevronDown, ChevronsDownUp, ChevronsUpDown, BarChart3, Sparkles, Brain, PenSquare, Rows } from "lucide-react";
import { IcpEnrichmentDialog } from "@/components/IcpEnrichmentDialog";
import { EditorialDialog } from "@/components/audience/EditorialDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { exportAudiencesCsv } from "@/lib/exportCsv";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { getUserActiveKeys } from "@/lib/aiAnalyzer";
import { getModelsForProvider } from "@/lib/aiModels";
import { runIcpEnrichment, type IcpEnrichmentResult, generateEditorialLine, generateProjectEditorialPlan, type EditorialLine, type ProjectContext } from "@/lib/icpEnricher";
import { notifyAudienceCreated, notifyIcpEnriched } from "@/lib/notificationService";
import { supabase } from "@/integrations/supabase/client";

type Audience = {
  id: string;
  name: string;
  description: string;
  industry?: string;
  company_size?: string;
  location?: string;
  keywords: string[];
  project_id?: string;
  project_name?: string;
  project_url?: string;
  project_niche?: string;
  created_at: string;
  icp_enrichment?: IcpEnrichmentResult;
  icp_enriched_at?: string;
};

type SavedPlan = {
  id: string;
  title: string;
  lines: EditorialLine[];
  created_at: string;
  project_id?: string | null;
  version?: number | null;
};

const sizeConfig = {
  startup: { label: "Startup", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  small: { label: "Pequena", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  medium: { label: "Média", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  large: { label: "Grande", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  enterprise: { label: "Enterprise", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
};


type AudiencesCacheState = {
  audiences: Audience[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const audiencesCache = new Map<string, AudiencesCacheState>();
export default function Audiences() {
  const { user } = useAuth();
  const userId = user?.id;
  const { projects, tenantSettings } = useTenantData();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  };

  const handleLoadSavedPlan = async () => {
    if (!user) return;
    const ctx = editorialContext;
    if (!ctx?.audienceId) {
      toast.error("Nenhum público associado para carregar plano.");
      return;
    }
    setLoadingSavedPlan(true);
    try {
      const { data, error } = await (supabase as any)
        .from("communication_plans")
        .select("title, lines, project_id")
        .eq("audience_id", ctx.audienceId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast.info("Nenhum plano salvo encontrado.");
        return;
      }
      setProjectEditorialContent(null);
      setEditorialContent(data.lines as EditorialLine[]);
      setEditorialContext({
        title: data.title || ctx.title,
        audienceId: ctx.audienceId,
        projectId: data.project_id || ctx.projectId,
      });
      toast.success("Plano salvo carregado.");
    } catch (err: any) {
      console.error("Erro ao carregar plano salvo:", err?.message || "Unknown error");
      toast.error(err?.message || "Erro ao carregar plano salvo");
    } finally {
      setLoadingSavedPlan(false);
    }
  };

  const handleSelectSavedPlan = (planId: string) => {
    const plan = savedPlans.find((p) => p.id === planId);
    if (!plan) {
      toast.error("Plano não encontrado na lista.");
      return;
    }
    setProjectEditorialContent(null);
    setEditorialContent(plan.lines as EditorialLine[]);
    setEditorialContext((ctx) => ({
      title: plan.title || ctx?.title || "Plano salvo",
      audienceId: ctx?.audienceId,
      projectId: plan.project_id || ctx?.projectId,
    }));
    toast.success("Plano carregado do histórico.");
  };

  const fetchSavedPlans = async (audienceId: string): Promise<SavedPlan[]> => {
    setLoadingSavedList(true);
    try {
      const { data, error } = await (supabase as any)
        .from("communication_plans")
        .select("id, title, lines, created_at, project_id, version")
        .eq("audience_id", audienceId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      const list = (data || []) as SavedPlan[];
      setSavedPlans(list);
      return list;
    } catch (err) {
      console.error("Erro ao carregar histórico de planos:", err?.message || "Unknown error");
      toast.error(err?.message || "Erro ao carregar histórico");
      return [];
    } finally {
      setLoadingSavedList(false);
    }
  };

  const handleOpenSavedFromCard = async (audience: Audience) => {
    if (!user) return;
    setEditorialLoadingId(audience.id);
    setProjectEditorialContent(null);
    setEditorialContent([]);
    setEditorialContext({ title: `Plano — ${audience.name}`, audienceId: audience.id, projectId: audience.project_id });
    const list = await fetchSavedPlans(audience.id);
    if (list.length > 0) {
      const plan = list[0];
      setEditorialContent(plan.lines as EditorialLine[]);
      setEditorialContext({
        title: plan.title || `Plano — ${audience.name}`,
        audienceId: audience.id,
        projectId: plan.project_id || audience.project_id,
      });
    }
    setEditorialDialogOpen(true);
    setEditorialLoadingId(null);
  };

  const toProjectContext = (project: any | undefined): ProjectContext | undefined => {
    if (!project) return undefined;
    return {
      name: project.name,
      niche: project.niche,
      url: project.url,
      solutionContext: (project as any).solution_context ?? project.solutionContext,
      missingFeatures: (project as any).missing_features ?? project.missingFeatures,
    };
  };

  const fetchProjectContext = async (projectId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) return null;
      const resp = await fetch("/api/project-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ project_id: projectId }),
      });
      const json = await resp.json().catch(() => null);
      if (!resp.ok || json?.error) {
        console.warn("[project-context]", json?.error || resp.statusText);
        return null;
      }
      return {
        id: json.project.id,
        name: json.project.name,
        niche: json.project.niche,
        url: json.project.url,
        solutionContext: json.project.solution_context,
        missingFeatures: json.project.missing_features,
      } as { id: string; name?: string; niche?: string; url?: string; solutionContext?: string; missingFeatures?: string };
    } catch (err) {
      console.warn("[project-context] fetch error", err);
      return null;
    }
  };

  const handleGenerateEditorial = async (audience: Audience) => {
    if (!user) return;
    if (!audience.icp_enrichment) {
      toast.error("Refine o ICP antes de gerar a linha editorial.");
      return;
    }
    setEditorialLoadingId(audience.id);
    try {
      const [provider, model] = selectedAiModel.split("::");
      const projectInfo = toProjectContext(
        audience.project_id
          ? (await fetchProjectContext(audience.project_id)) || projects.find((p) => p.id === audience.project_id)
          : undefined
      );
      const result = await generateEditorialLine(
        user.id,
        audience.id,
        audience.icp_enrichment,
        projectInfo || { name: audience.project_name, niche: audience.project_niche, url: audience.project_url },
        provider as "google_gemini" | "anthropic_claude",
        model
      );
      const normalized = result.map((line) => ({ ...line, audienceName: audience.name }));
      setEditorialContent(normalized);
      setProjectEditorialContent(null);
      setEditorialContext({ title: `Plano — ${audience.name}`, audienceId: audience.id, projectId: audience.project_id });
      fetchSavedPlans(audience.id);
      setEditorialDialogOpen(true);
    } catch (err: any) {
      console.error("Erro ao gerar linha editorial:", err?.message || "Unknown error");
      toast.error(err?.message || "Erro ao gerar linha editorial");
    } finally {
      setEditorialLoadingId(null);
    }
  };

  const handleGenerateProjectEditorial = async () => {
    if (!user) return;
    const grouped = groupedByProject;
    const expanded = Array.from(expandedGroups);
    // pega grupos visíveis ou todos se nenhum expandido
    const targetGroups = expanded.length > 0 ? grouped.filter(g => expanded.includes(g.groupKey)) : grouped;
    const audiencesWithIcp = targetGroups.flatMap(g => g.audiences.filter(a => a.icp_enrichment));
    if (audiencesWithIcp.length === 0) {
      toast.error("Nenhum ICP refinado para gerar linha editorial deste projeto.");
      return;
    }
    setProjectEditorialLoading(true);
    try {
      const [provider, model] = selectedAiModel.split("::");
      const projectName = targetGroups[0]?.projectName || "Projeto";
      const projectInfo = toProjectContext(
        targetGroups[0]?.audiences[0]?.project_id
          ? (await fetchProjectContext(targetGroups[0].audiences[0].project_id)) || projects.find((p) => p.id === targetGroups[0].audiences[0].project_id)
          : undefined
      );
      const result = await generateProjectEditorialPlan(
        user.id,
        projectName,
        audiencesWithIcp.map(a => ({ id: a.id, name: a.name, icp: a.icp_enrichment! })),
        projectInfo || { name: projectName, niche: targetGroups[0]?.audiences[0]?.project_niche, url: targetGroups[0]?.audiences[0]?.project_url },
        provider as "google_gemini" | "anthropic_claude",
        model
      );
      setProjectEditorialContent(result);
      setEditorialContent(null);
      const anchorAudience = audiencesWithIcp[0];
      setEditorialContext({ title: `Plano do projeto — ${projectName}`, audienceId: anchorAudience?.id, projectId: anchorAudience?.project_id });
      if (anchorAudience?.id) fetchSavedPlans(anchorAudience.id);
      setEditorialDialogOpen(true);
    } catch (err: any) {
      console.error("Erro ao gerar linha editorial do projeto:", err?.message || "Unknown error");
      toast.error(err?.message || "Erro ao gerar linha editorial do projeto");
    } finally {
      setProjectEditorialLoading(false);
    }
  };

  // AI ICP Enrichment state
  const { isFeatureAvailable } = useFeatureFlags();
  const canAiKeys = isFeatureAvailable("ai_keys");
  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [availableAiModels, setAvailableAiModels] = useState<{ provider: string; model: string; label: string }[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [selectedEnrichmentAudience, setSelectedEnrichmentAudience] = useState<Audience | null>(null);
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false);
  const [editorialDialogOpen, setEditorialDialogOpen] = useState(false);
  const [editorialContent, setEditorialContent] = useState<EditorialLine[] | null>(null);
  const [projectEditorialContent, setProjectEditorialContent] = useState<EditorialLine[] | null>(null);
  const [editorialLoadingId, setEditorialLoadingId] = useState<string | null>(null);
  const [projectEditorialLoading, setProjectEditorialLoading] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [editorialContext, setEditorialContext] = useState<{ title: string; audienceId?: string; projectId?: string } | null>(null);
  const [loadingSavedPlan, setLoadingSavedPlan] = useState(false);
  const [loadingSavedList, setLoadingSavedList] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  // Load AI keys
  useEffect(() => {
    if (!user || !canAiKeys) return;
    (async () => {
      const keys = await getUserActiveKeys(user.id);
      setHasAiKeys(keys.length > 0);
      const models: { provider: string; model: string; label: string }[] = [];
      for (const k of keys) {
        const providerModels = getModelsForProvider(k.provider);
        for (const m of providerModels) {
          models.push({ provider: k.provider, model: m.value, label: m.label });
        }
      }
      setAvailableAiModels(models);
      if (models.length > 0 && !selectedAiModel) {
        const preferred = keys[0];
        const prefModel = models.find((m) => m.provider === preferred.provider && m.model === preferred.preferred_model);
        setSelectedAiModel(prefModel ? `${prefModel.provider}::${prefModel.model}` : `${models[0].provider}::${models[0].model}`);
      }
    })();
  }, [user, canAiKeys]);

  const handleSaveEditorialPlan = async () => {
    if (!user) return;
    const ctx = editorialContext;
    const lines = projectEditorialContent || editorialContent;
    if (!lines || lines.length === 0 || !ctx) {
      toast.error("Nada para salvar. Gere um plano primeiro.");
      return;
    }
    if (!ctx.audienceId) {
      toast.error("Não foi possível associar o plano a um público.");
      return;
    }
    setSavingPlan(true);
    try {
      const { error } = await (supabase as any)
        .from("communication_plans")
        .insert({
          audience_id: ctx.audienceId,
          project_id: ctx.projectId || null,
          user_id: user.id,
          title: ctx.title,
          lines,
        } as any);
      if (error) throw error;
      toast.success("Plano de comunicação salvo com sucesso.");
    } catch (err: any) {
      console.error("Erro ao salvar plano:", err?.message || "Unknown error");
      toast.error(err?.message || "Erro ao salvar plano");
    } finally {
      setSavingPlan(false);
      if (ctx?.audienceId) fetchSavedPlans(ctx.audienceId);
    }
  };

  const handleEnrichIcp = async (audience: Audience) => {
    if (!user) return;
    setEnrichingId(audience.id);
    try {
      const [provider, model] = selectedAiModel.split("::");
      const result = await runIcpEnrichment(
        user.id,
        audience.id,
        {
          name: audience.name,
          description: audience.description,
          industry: audience.industry,
          companySize: audience.company_size,
          location: audience.location,
          keywords: audience.keywords,
        },
        provider as "google_gemini" | "anthropic_claude",
        model
      );
      // Update local state
      setAudiences((prev) =>
        prev.map((a) =>
          a.id === audience.id
            ? { ...a, icp_enrichment: result, icp_enriched_at: result.enrichedAt }
            : a
        )
      );
      const updatedAudience = { ...audience, icp_enrichment: result, icp_enriched_at: result.enrichedAt };
      setSelectedEnrichmentAudience(updatedAudience);
      setEnrichmentDialogOpen(true);
      toast.success("ICP refinado com sucesso!");
      if (user) notifyIcpEnriched(user.id, audience.name);
    } catch (err: any) {
      console.error("Erro ao refinar ICP:", err?.message || "Unknown error");
      toast.error(err?.message || "Erro ao refinar ICP com IA");
    } finally {
      setEnrichingId(null);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    industry: "",
    company_size: "",
    location: "",
    keywords: "",
    project_id: "",
  });

  useEffect(() => {
    if (!userId) {
      setAudiences([]);
      setLoading(false);
      return;
    }

    const cached = audiencesCache.get(userId);
    if (cached) {
      setAudiences(cached.audiences);
      setLoading(false);
      if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
        void fetchAudiences({ silent: true });
      }
      return;
    }

    void fetchAudiences();
  }, [userId]);

  const fetchAudiences = async (options?: { silent?: boolean }) => {
    if (!userId) return;
    const cached = audiencesCache.get(userId);
    try {
      if (!options?.silent && !cached) setLoading(true);
      const { data, error } = await (supabase as any)
        .from("audiences")
        .select(`
          *,
          projects!inner(name, url, niche)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map((item: any) => ({
        ...item,
        project_name: item.projects?.name,
        project_url: item.projects?.url,
        project_niche: item.projects?.niche,
      }));
      setAudiences(mapped);
      audiencesCache.set(userId, { audiences: mapped, fetchedAt: Date.now() });
    } catch (error) {
      console.error("Erro ao buscar públicos:", error?.message || "Unknown error");
      toast.error("Erro ao carregar públicos-alvo");
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Nome e descrição são obrigatórios");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        industry: formData.industry.trim() || null,
        company_size: formData.company_size.trim() || null,
        location: formData.location.trim() || null,
        keywords: formData.keywords
          .split(",")
          .map(k => k.trim())
          .filter(Boolean),
        project_id: formData.project_id.trim() || null,
      };

      if (editingId) {
        // Update existing audience
        const { error } = await (supabase as any)
          .from("audiences")
          .update(payload)
          .eq("id", editingId)
          .eq("user_id", userId);

        if (error) throw error;
        toast.success("Público-alvo atualizado com sucesso!");
      } else {
        // Create new audience
        const { error } = await (supabase as any)
          .from("audiences")
          .insert({ ...payload, user_id: user.id });

        if (error) throw error;
        toast.success("Público-alvo criado com sucesso!");
        if (user) notifyAudienceCreated(user.id, formData.name.trim());
      }

      resetForm();
      fetchAudiences();
    } catch (error: any) {
      console.error("Erro ao salvar público-alvo:", error?.message || "Unknown error");
      toast.error(error?.message || "Erro ao salvar público-alvo");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      industry: "",
      company_size: "",
      location: "",
      keywords: "",
      project_id: "",
    });
    setEditingId(null);
    setShowCreateForm(false);
  };

  const startEdit = (audience: Audience) => {
    setEditingId(audience.id);
    setFormData({
      name: audience.name,
      description: audience.description,
      industry: audience.industry || "",
      company_size: audience.company_size || "",
      location: audience.location || "",
      keywords: audience.keywords.join(", "),
      project_id: audience.project_id || "",
    });
    setShowCreateForm(true);
  };

  const filteredAudiences = audiences.filter((audience) =>
    audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audience.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByProject = useMemo(() => {
    const groups: Record<string, { groupKey: string; projectName: string; audiences: Audience[] }> = {};
    for (const a of filteredAudiences) {
      const key = a.project_id || "__no_project__";
      if (!groups[key]) {
        groups[key] = {
          groupKey: key,
          projectName: a.project_name || "Sem projeto",
          audiences: [],
        };
      }
      groups[key].audiences.push(a);
    }
    return Object.values(groups);
  }, [filteredAudiences]);

  return (
    <FeatureGate featureKey="audiences" withLayout={false} pageTitle="Públicos-Alvo">
      <DashboardLayout>
        <SEO title="Públicos-Alvo" noindex />
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Públicos-Alvo</h1>
              <p className="text-sm text-muted-foreground">Gerencie seus públicos-alvo estratégicos.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {audiences.length > 0 && (
                <>
                  <Button size="sm" variant="outline" className="gap-1" title="Expandir todos" onClick={() => setExpandedGroups(new Set(groupedByProject.map(g => g.groupKey)))}>
                    <ChevronsUpDown className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" title="Recolher todos" onClick={() => setExpandedGroups(new Set())}>
                    <ChevronsDownUp className="h-3.5 w-3.5" />
                  </Button>
                  <div className="w-px h-5 bg-border mx-0.5" />
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => exportAudiencesCsv(audiences.map(a => ({ name: a.name, description: a.description, industry: a.industry, company_size: a.company_size, location: a.location, keywords: a.keywords, project_name: a.project_name, created_at: a.created_at })))}>
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">CSV</span>
                  </Button>
                  <Button size="sm" className="gap-1" variant="secondary" onClick={handleGenerateProjectEditorial} disabled={projectEditorialLoading}>
                    {projectEditorialLoading ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <Rows className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">Plano de comunicação do projeto</span>
                  </Button>
                </>
              )}
              <Button size="sm" onClick={() => setShowCreateForm(true)}>
                <Users className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Novo Público</span>
              </Button>
            </div>
          </div>

          <Input
            placeholder="Buscar públicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          {showCreateForm && (
            <div className="border border-border rounded-lg bg-card p-4 sm:p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editingId ? "Editar Público-Alvo" : "Novo Público-Alvo"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project">Projeto (opcional)</Label>
                    <select
                      id="project"
                      value={formData.project_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, project_id: e.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione um projeto</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Público</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Indústria</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => setFormData((prev) => ({ ...prev, industry: e.target.value }))}
                      placeholder="Ex: Tecnologia, Saúde, Financeiro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Porte da Empresa</Label>
                    <select
                      id="company_size"
                      value={formData.company_size}
                      onChange={(e) => setFormData((prev) => ({ ...prev, company_size: e.target.value }))}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Selecione...</option>
                      <option value="startup">Startup</option>
                      <option value="small">Pequena</option>
                      <option value="medium">Média</option>
                      <option value="large">Grande</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Ex: Brasil, São Paulo, Remoto"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="keywords">Palavras-chave (separadas por vírgula)</Label>
                    <Input
                      id="keywords"
                      value={formData.keywords}
                      onChange={(e) => setFormData((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="B2B, SaaS, decisores, tecnologia"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="submit">{editingId ? "Salvar" : "Criar Público"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  {tenantSettings && (() => {
                    const used = audiences.length;
                    const limit = (tenantSettings as any).max_audiences ?? 5;
                    const isUnlimited = limit < 0;
                    const remaining = isUnlimited ? Infinity : limit - used;
                    const atLimit = !isUnlimited && remaining <= 0;
                    const nearLimit = !isUnlimited && remaining > 0 && remaining <= 2;
                    return (
                      <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border ${atLimit
                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                        : nearLimit
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          : "bg-muted/50 border-border text-muted-foreground"
                        }`}>
                        <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-medium">
                          {isUnlimited
                            ? `${used} públicos`
                            : `${used}/${limit} públicos`}
                        </span>
                        {atLimit && <span className="text-[10px]">• Limite atingido</span>}
                        {nearLimit && <span className="text-[10px]">• {remaining} restante{remaining > 1 ? "s" : ""}</span>}
                      </div>
                    );
                  })()}
                </div>
              </form>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-36 bg-muted rounded" />
                      <div className="h-3 w-48 bg-muted rounded" />
                    </div>
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-20 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filteredAudiences.length === 0 && (
            <div className="flex flex-col items-center text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/30">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Defina seu público-alvo ideal</h3>
              <p className="text-sm text-muted-foreground max-w-md">Use o botão <strong>Novo Público</strong> acima para criar perfis de audiência B2B com indústria, porte, localização e keywords. Eles alimentam automaticamente seu plano tático.</p>
            </div>
          )}

          {/* Project Cards Grid */}
          {!loading && groupedByProject.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {groupedByProject.map((group) => {
                const isGroupExpanded = expandedGroups.has(group.groupKey);
                const icpCount = group.audiences.filter(a => a.icp_enrichment).length;
                return (
                  <div key={group.groupKey} className={`rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg ${isGroupExpanded ? "border-primary/30 col-span-1 lg:col-span-2" : "border-border hover:border-primary/50"}`}>
                    {/* Project Card Header */}
                    <button
                      onClick={() => toggleGroup(group.groupKey)}
                      className="w-full text-left p-4 sm:p-5 flex items-center gap-3 group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{group.projectName}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-muted-foreground">{group.audiences.length} público{group.audiences.length !== 1 ? "s" : ""}</span>
                          {icpCount > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                              <Brain className="h-2.5 w-2.5 mr-0.5" />
                              {icpCount} ICP
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${!isGroupExpanded ? "-rotate-90" : ""}`} />
                    </button>

                    {/* Expanded: Audience Sub-Cards */}
                    {isGroupExpanded && (
                      <div className="border-t border-border/50 p-4 sm:p-5 pt-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {group.audiences.map((audience) => {
                            const sizeInfo = audience.company_size ? sizeConfig[audience.company_size as keyof typeof sizeConfig] : null;
                            return (
                              <div key={audience.id} className={`rounded-xl border p-4 space-y-3 transition-all hover:shadow-md ${audience.icp_enrichment ? "border-green-500/20 bg-green-500/[0.02]" : "border-border bg-card"}`}>
                                {/* Audience Header */}
                                <div className="flex items-start gap-3">
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${audience.icp_enrichment ? "bg-green-500/10" : "bg-primary/10"}`}>
                                    <Target className={`h-4 w-4 ${audience.icp_enrichment ? "text-green-500" : "text-primary"}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{audience.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{audience.description}</p>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    {sizeInfo && (
                                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sizeInfo.color}`}>
                                        {sizeInfo.label}
                                      </Badge>
                                    )}
                                    {audience.icp_enrichment && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                                        <Brain className="h-2.5 w-2.5 mr-0.5" />
                                        ICP
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Meta */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {audience.industry && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                      <TrendingUp className="h-3 w-3" />
                                      <span>{audience.industry}</span>
                                    </div>
                                  )}
                                  {audience.location && (
                                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                      <Globe className="h-3 w-3" />
                                      <span>{audience.location}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Keywords */}
                                {audience.keywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {audience.keywords.slice(0, 4).map((keyword, index) => (
                                      <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/30 border-border/50">
                                        {keyword}
                                      </Badge>
                                    ))}
                                    {audience.keywords.length > 4 && (
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/30 border-border/50 text-muted-foreground">
                                        +{audience.keywords.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                )}

                                {/* Actions Footer */}
                                {canAiKeys && hasAiKeys && (
                                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        size="sm"
                                        variant={audience.icp_enrichment ? "outline" : "default"}
                                        className="h-7 text-[11px] gap-1"
                                        disabled={enrichingId === audience.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (audience.icp_enrichment) {
                                            setSelectedEnrichmentAudience(audience);
                                            setEnrichmentDialogOpen(true);
                                          } else {
                                            handleEnrichIcp(audience);
                                          }
                                        }}
                                      >
                                        {enrichingId === audience.id ? (
                                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                        ) : (
                                          <Brain className="h-3 w-3" />
                                        )}
                                        {audience.icp_enrichment ? "Ver ICP" : "Refinar"}
                                      </Button>
                                      {audience.icp_enrichment && (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="secondary"
                                            className="h-7 text-[11px] gap-1"
                                            onClick={(e) => { e.stopPropagation(); handleGenerateEditorial(audience); }}
                                            disabled={editorialLoadingId === audience.id}
                                          >
                                            {editorialLoadingId === audience.id ? (
                                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            ) : (
                                              <PenSquare className="h-3 w-3" />
                                            )}
                                            Plano
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 text-[11px] gap-1 text-muted-foreground"
                                            onClick={(e) => { e.stopPropagation(); handleOpenSavedFromCard(audience); }}
                                          >
                                            Salvos
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-[10px] text-muted-foreground hover:text-foreground"
                                      onClick={() => startEdit(audience)}
                                    >
                                      Editar
                                    </Button>
                                  </div>
                                )}
                                {!(canAiKeys && hasAiKeys) && (
                                  <div className="flex justify-end pt-2 border-t border-border/50">
                                    <Button size="sm" variant="ghost" className="h-7 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => startEdit(audience)}>
                                      Editar Público
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <IcpEnrichmentDialog
          audienceName={selectedEnrichmentAudience?.name || ""}
          enrichment={selectedEnrichmentAudience?.icp_enrichment || null}
          open={enrichmentDialogOpen}
          onOpenChange={setEnrichmentDialogOpen}
        />
        <EditorialDialog
          title={editorialContext?.title || (projectEditorialContent ? "Linha editorial do projeto" : "Linha editorial do público")}
          lines={projectEditorialContent || editorialContent || []}
          open={editorialDialogOpen}
          onOpenChange={setEditorialDialogOpen}
          onSave={handleSaveEditorialPlan}
          saving={savingPlan}
          onLoadSaved={handleLoadSavedPlan}
          loadingSaved={loadingSavedPlan}
          savedPlans={savedPlans}
          onSelectSaved={handleSelectSavedPlan}
        />
      </DashboardLayout>
    </FeatureGate>
  );
}




