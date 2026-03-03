import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Search,
  FolderOpen,
  Maximize2,
  Minimize2,
  Calendar,
  Zap,
  FileText,
  FileSpreadsheet,
  Sparkles,
  Loader2,
  Brain,
  Target,
  Clock,
  CheckCircle2,
  ChevronDown,
  Settings,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { exportInsightsPdf } from "@/lib/reportGenerator";
import { exportInsightsCsv } from "@/lib/exportCsv";
import { runInsightsAiEnrichment, getUserActiveKeys } from "@/lib/aiAnalyzer";
import type { InsightAiEnrichment } from "@/lib/aiAnalyzer";
import { getModelsForProvider } from "@/lib/aiModels";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Insight = {
  id: string;
  project_id: string;
  project_name?: string;
  project_niche?: string;
  project_url?: string;
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action?: string | null;
  created_at: string;
  source?: "heuristic" | "ai";
  priority?: "critical" | "high" | "medium" | "low" | null;
  ai_enrichment?: InsightAiEnrichment | null;
  ai_provider?: string | null;
  ai_model?: string | null;
  ai_enriched_at?: string | null;
};

const typeConfig = {
  warning: {
    label: "Alerta",
    icon: AlertTriangle,
    iconBg: "bg-amber-500/10",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    iconColor: "text-amber-500",
  },
  opportunity: {
    label: "Oportunidade",
    icon: TrendingUp,
    iconBg: "bg-emerald-500/10",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    iconColor: "text-emerald-500",
  },
  improvement: {
    label: "Melhoria",
    icon: Lightbulb,
    iconBg: "bg-blue-500/10",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    iconColor: "text-blue-500",
  },
};

type ProjectGroup = {
  projectId: string;
  projectName: string;
  projectNiche: string;
  projectUrl: string;
  insights: Insight[];
  warnings: number;
  opportunities: number;
  improvements: number;
  hasAiEnrichment: boolean;
};

type InsightsCacheState = {
  insights: Insight[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const insightsCache = new Map<string, InsightsCacheState>();

export default function Insights() {
  const { user } = useAuth();
  const userId = user?.id;
  const { isFeatureAvailable } = useFeatureFlags();
  const canAiEnrichment = isFeatureAvailable("ai_insights_enrichment");
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!userId) {
      setInsights([]);
      setLoading(false);
      return;
    }

    const cached = insightsCache.get(userId);
    if (cached) {
      setInsights(cached.insights);
      setLoading(false);
      if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
        void fetchInsights({ silent: true });
      }
      return;
    }

    void fetchInsights();
  }, [userId]);

  const fetchInsights = async (options?: { silent?: boolean }) => {
    if (!userId) return;
    const cached = insightsCache.get(userId);
    try {
      if (!options?.silent && !cached) setLoading(true);
      const { data } = await (supabase as any)
        .from("insights")
        .select(`
          *,
          projects!inner(name, niche, url)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      const mapped = (data || []).map((item: any) => ({
        ...item,
        project_name: item.projects?.name,
        project_niche: item.projects?.niche,
        project_url: item.projects?.url,
      }));
      setInsights(mapped);
      insightsCache.set(userId, { insights: mapped, fetchedAt: Date.now() });
    } catch (error) {
      console.error("Erro ao buscar insights:", error?.message || "Unknown error");
      toast.error("Erro ao carregar insights");
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insight.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || insight.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [insights, searchTerm, filterType]);

  const groupedByProject = useMemo(() => {
    const groups: Record<string, ProjectGroup> = {};
    filteredInsights.forEach((insight) => {
      const pid = insight.project_id;
      if (!groups[pid]) {
        groups[pid] = {
          projectId: pid,
          projectName: insight.project_name || "Projeto",
          projectNiche: insight.project_niche || "",
          projectUrl: insight.project_url || "",
          insights: [],
          warnings: 0,
          opportunities: 0,
          improvements: 0,
          hasAiEnrichment: false,
        };
      }
      groups[pid].insights.push(insight);
      if (insight.ai_enrichment) groups[pid].hasAiEnrichment = true;
      if (insight.type === "warning") groups[pid].warnings++;
      else if (insight.type === "opportunity") groups[pid].opportunities++;
      else groups[pid].improvements++;
    });
    return Object.values(groups);
  }, [filteredInsights]);

  const stats = useMemo(() => ({
    total: filteredInsights.length,
    warnings: filteredInsights.filter((i) => i.type === "warning").length,
    opportunities: filteredInsights.filter((i) => i.type === "opportunity").length,
    improvements: filteredInsights.filter((i) => i.type === "improvement").length,
  }), [filteredInsights]);

  const [enrichingProject, setEnrichingProject] = useState<string | null>(null);
  const [expandedEnrichment, setExpandedEnrichment] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (projectId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };
  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [availableAiModels, setAvailableAiModels] = useState<{ provider: string; model: string; label: string }[]>([]);
  const [selectedAiModel, setSelectedAiModel] = useState<string>("");

  useEffect(() => {
    const checkAiKeys = async () => {
      if (!user) return;
      const keys = await getUserActiveKeys(user.id);
      setHasAiKeys(keys.length > 0);
      const models: { provider: string; model: string; label: string }[] = [];
      for (const key of keys) {
        const allProviderModels = getModelsForProvider(key.provider);
        for (const m of allProviderModels) {
          models.push({ provider: key.provider, model: m.value, label: m.label });
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
    checkAiKeys();
  }, [user]);

  const handleOpenInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setDialogOpen(true);
  };

  const handleEnrichWithAi = async (group: ProjectGroup) => {
    if (!user) return;
    if (enrichingProject) return;

    try {
      setEnrichingProject(group.projectId);
      toast.info("Enriquecendo insights com IA... Isso pode levar alguns segundos.");

      const heuristicInsights = group.insights
        .filter((i) => !i.ai_enrichment)
        .map((i) => ({
          id: i.id,
          type: i.type,
          title: i.title,
          description: i.description,
          action: i.action,
        }));

      if (heuristicInsights.length === 0) {
        toast.info("Todos os insights deste projeto já foram enriquecidos.");
        return;
      }

      const [provider, model] = selectedAiModel.split("::");

      const result = await runInsightsAiEnrichment(
        group.projectId,
        user.id,
        group.projectName,
        group.projectNiche,
        group.projectUrl,
        heuristicInsights,
        provider as "google_gemini" | "anthropic_claude" | undefined,
        model || undefined
      );

      toast.success(
        `Enriquecimento concluído! ${result.enrichedInsights.length} insights enriquecidos, ${result.newInsights.length} novos insights gerados.`
      );

      await fetchInsights();
    } catch (error: any) {
      console.error("Erro no enriquecimento:", error?.message || "Unknown error");
      toast.error(error.message || "Erro ao enriquecer insights com IA");
    } finally {
      setEnrichingProject(null);
    }
  };

  return (
    <FeatureGate featureKey="strategic_insights" withLayout={false} pageTitle="Insights Estratégicos">
      <DashboardLayout>
        <SEO title="Insights" noindex />
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Insights Estratégicos</h1>
              <p className="text-muted-foreground text-xs sm:text-sm">Insights gerados automaticamente a partir da análise dos seus projetos.</p>
            </div>
            {filteredInsights.length > 0 && (
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
                  onClick={() => exportInsightsPdf({
                    insights: filteredInsights.map(i => ({ type: i.type, title: i.title, description: i.description, action: i.action || undefined, project_name: i.project_name, created_at: i.created_at })),
                    counts: { warnings: stats.warnings, opportunities: stats.opportunities, improvements: stats.improvements },
                  })}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">PDF</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => exportInsightsCsv(filteredInsights.map(i => ({ type: i.type, title: i.title, description: i.description, action: i.action || undefined, project_name: i.project_name, created_at: i.created_at })))}
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Total</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-amber-500/10 rounded-lg shrink-0">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Alertas</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stats.warnings}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Oportunidades</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stats.opportunities}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Melhorias</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{stats.improvements}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="warning">Alertas</option>
              <option value="opportunity">Oportunidades</option>
              <option value="improvement">Melhorias</option>
            </select>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-36 bg-muted rounded" />
                      <div className="flex gap-1.5">
                        <div className="h-3 w-20 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted rounded-full" />
                      </div>
                    </div>
                    <div className="h-4 w-4 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredInsights.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-1">Seus insights aparecerão aqui</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Insights são gerados automaticamente ao analisar a URL de um projeto — alertas, oportunidades e melhorias práticas para sua estratégia.
              </p>
              <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={() => window.location.href = '/projects'}>
                <FolderOpen className="h-4 w-4" />
                Ir para Projetos
              </Button>
            </div>
          )}

          {/* Project Cards Grid */}
          {!loading && groupedByProject.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {groupedByProject.map((group) => {
                const isGroupExpanded = expandedGroups.has(group.projectId);
                return (
                  <div key={group.projectId} className={cn("rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg", isGroupExpanded ? "border-primary/30 col-span-1 lg:col-span-2" : "border-border hover:border-primary/50")}>
                    {/* Project Card Header */}
                    <div className="flex items-center gap-3 p-4 sm:p-5">
                      <button
                        onClick={() => toggleGroup(group.projectId)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">{group.projectName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                            <span>{group.insights.length} insight{group.insights.length !== 1 ? "s" : ""}</span>
                            {group.warnings > 0 && (
                              <><span className="opacity-40">·</span><span className="text-amber-500">{group.warnings} alertas</span></>
                            )}
                            {group.opportunities > 0 && (
                              <><span className="opacity-40">·</span><span className="text-emerald-500">{group.opportunities} oport.</span></>
                            )}
                            {group.improvements > 0 && (
                              <><span className="opacity-40">·</span><span className="text-blue-500">{group.improvements} melh.</span></>
                            )}
                            {group.hasAiEnrichment && (
                              <><span className="opacity-40">·</span><span className="text-purple-500 flex items-center gap-0.5"><Sparkles className="h-2.5 w-2.5" />IA</span></>
                            )}
                          </div>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0", !isGroupExpanded && "-rotate-90")} />
                      </button>
                      {/* Enrich with AI — preserved exactly */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasAiKeys && canAiEnrichment ? (
                          <>
                            <Select
                              value={selectedAiModel}
                              onValueChange={setSelectedAiModel}
                              disabled={enrichingProject === group.projectId}
                            >
                              <SelectTrigger className="h-8 w-[160px] text-xs border-primary/30 bg-primary/5 hidden sm:flex">
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
                              disabled={enrichingProject !== null}
                              title={group.hasAiEnrichment ? "Re-enriquecer insights com IA" : "Enriquecer insights com IA"}
                              onClick={() => handleEnrichWithAi(group)}
                            >
                              {enrichingProject === group.projectId ? (
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
                            <span className="hidden sm:inline">Configurar IA</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expanded: Insight cards grid */}
                    {isGroupExpanded && (
                      <div className="border-t border-border/50 p-4 sm:p-5 pt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                          {group.insights.map((insight) => {
                            const config = typeConfig[insight.type];
                            const Icon = config.icon;
                            const isAiSource = insight.source === "ai";
                            const hasEnrichment = !!insight.ai_enrichment;
                            const isExpanded = expandedEnrichment === insight.id;

                            return (
                              <div
                                key={insight.id}
                                className={cn(
                                  "rounded-xl border border-border bg-card p-3 sm:p-4 transition-all hover:shadow-md",
                                  isAiSource && "border-purple-500/20"
                                )}
                              >
                                <div className="flex items-start gap-2.5">
                                  <div className={cn("p-1.5 rounded-lg shrink-0 mt-0.5", config.iconBg)}>
                                    <Icon className={cn("h-3.5 w-3.5", config.iconColor)} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {/* Status line */}
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className={cn("text-[10px] font-medium", config.iconColor)}>{config.label}</span>
                                      {(isAiSource || hasEnrichment) && (
                                        <span className="text-[10px] text-purple-500 flex items-center gap-0.5">
                                          <Sparkles className="h-2.5 w-2.5" />
                                          {isAiSource ? "IA" : "Enriquecido"}
                                        </span>
                                      )}
                                      {insight.priority && (
                                        <span className={cn("text-[10px] font-medium ml-auto",
                                          insight.priority === "critical" ? "text-red-500" :
                                            insight.priority === "high" ? "text-orange-500" :
                                              insight.priority === "medium" ? "text-amber-500" :
                                                "text-muted-foreground"
                                        )}>
                                          {insight.priority === "critical" ? "Crítico" : insight.priority === "high" ? "Alta" : insight.priority === "medium" ? "Média" : "Baixa"}
                                        </span>
                                      )}
                                    </div>

                                    <h4
                                      className="font-medium text-foreground text-xs sm:text-sm leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                                      onClick={() => handleOpenInsight(insight)}
                                    >
                                      {insight.title}
                                    </h4>
                                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{insight.description}</p>
                                    {insight.action && (
                                      <p className="text-[11px] sm:text-xs text-primary font-medium mt-1.5 leading-snug line-clamp-1">
                                        <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline mr-0.5 sm:mr-1" />
                                        {insight.action}
                                      </p>
                                    )}

                                    {/* AI Enrichment preview — preserved exactly */}
                                    {hasEnrichment && (
                                      <div className="mt-2 pt-2 border-t border-border/50">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setExpandedEnrichment(isExpanded ? null : insight.id); }}
                                          className="flex items-center gap-1 text-[10px] sm:text-[11px] text-purple-500 hover:text-purple-400 font-medium transition-colors w-full text-left"
                                        >
                                          <Brain className="h-3 w-3 flex-shrink-0" />
                                          <span>Análise IA</span>
                                          <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", isExpanded && "rotate-180")} />
                                        </button>
                                        {isExpanded && insight.ai_enrichment && (
                                          <div className="mt-2 space-y-2 text-[10px] sm:text-[11px]">
                                            <p className="text-muted-foreground leading-relaxed">{insight.ai_enrichment.deepAnalysis}</p>
                                            <div className="flex items-start gap-1.5">
                                              <Target className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                                              <div>
                                                <span className="font-medium text-foreground">Causa raiz:</span>
                                                <span className="text-muted-foreground ml-1">{insight.ai_enrichment.rootCause}</span>
                                              </div>
                                            </div>
                                            <div className="flex items-start gap-1.5">
                                              <TrendingUp className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                              <div>
                                                <span className="font-medium text-foreground">Impacto:</span>
                                                <span className="text-muted-foreground ml-1">{insight.ai_enrichment.impact}</span>
                                              </div>
                                            </div>
                                            {insight.ai_enrichment.actionPlan?.length > 0 && (
                                              <div className="space-y-1">
                                                <span className="font-medium text-foreground flex items-center gap-1">
                                                  <CheckCircle2 className="h-3 w-3 text-primary" />
                                                  Plano de ação:
                                                </span>
                                                {insight.ai_enrichment.actionPlan.map((step, idx) => (
                                                  <div key={idx} className="flex items-start gap-1.5 ml-4">
                                                    <span className="text-muted-foreground">{idx + 1}.</span>
                                                    <span className="text-muted-foreground flex-1">{step.step}</span>
                                                    <Badge variant="outline" className={cn("text-[8px] px-1 py-0 flex-shrink-0",
                                                      step.effort === "low" ? "text-green-500 border-green-500/30" :
                                                        step.effort === "medium" ? "text-yellow-500 border-yellow-500/30" :
                                                          "text-red-500 border-red-500/30"
                                                    )}>
                                                      {step.effort === "low" ? "Fácil" : step.effort === "medium" ? "Médio" : "Alto"}
                                                    </Badge>
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleOpenInsight(insight); }}
                                              className="text-[10px] text-primary hover:underline font-medium mt-1"
                                            >
                                              Ver detalhes completos →
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5 sm:mt-2 flex items-center gap-1">
                                      <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                      {new Date(insight.created_at).toLocaleDateString("pt-BR")}
                                    </p>
                                  </div>
                                </div>
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

        {/* Insight Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setFullscreen(false); setDialogOpen(v); }}>
          <DialogContent className={cn(
            "overflow-y-auto p-0 transition-all duration-200",
            fullscreen
              ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none"
              : "max-w-lg max-h-[90vh]"
          )}>
            {selectedInsight && (() => {
              const config = typeConfig[selectedInsight.type];
              const Icon = config.icon;
              return (
                <>
                  {/* Dialog Header */}
                  <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
                    <DialogHeader>
                      <div className="flex items-center gap-2 mb-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 flex-shrink-0"
                          onClick={() => setFullscreen((f) => !f)}
                          title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                        >
                          {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        <DialogTitle className="text-lg">Detalhe do Insight</DialogTitle>
                      </div>
                    </DialogHeader>
                  </div>

                  {/* Dialog Body */}
                  <div className="px-6 py-5 space-y-5">
                    {/* Type + Project + Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={cn("text-xs", config.badgeColor)}>
                        <Icon className="h-3.5 w-3.5 mr-1" />
                        {config.label}
                      </Badge>
                      {selectedInsight.source === "ai" && (
                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/30">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Gerado por IA
                        </Badge>
                      )}
                      {selectedInsight.ai_enrichment && selectedInsight.source !== "ai" && (
                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-500 border-purple-500/30">
                          <Brain className="h-3 w-3 mr-1" />
                          Enriquecido
                        </Badge>
                      )}
                      {selectedInsight.priority && (
                        <Badge variant="outline" className={cn("text-xs",
                          selectedInsight.priority === "critical" ? "bg-red-500/10 text-red-500 border-red-500/30" :
                            selectedInsight.priority === "high" ? "bg-orange-500/10 text-orange-500 border-orange-500/30" :
                              selectedInsight.priority === "medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/30" :
                                "bg-slate-500/10 text-slate-500 border-slate-500/30"
                        )}>
                          {selectedInsight.priority === "critical" ? "Crítico" : selectedInsight.priority === "high" ? "Alta" : selectedInsight.priority === "medium" ? "Média" : "Baixa"}
                        </Badge>
                      )}
                      {selectedInsight.project_name && (
                        <Badge variant="secondary" className="text-xs">{selectedInsight.project_name}</Badge>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedInsight.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2 rounded-lg shrink-0", config.iconBg)}>
                          <Icon className={cn("h-4 w-4", config.iconColor)} />
                        </div>
                        <h3 className="font-semibold text-foreground text-base leading-snug pt-1">{selectedInsight.title}</h3>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Descrição</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedInsight.description}</p>
                    </div>

                    {/* Action */}
                    {selectedInsight.action && (
                      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                          <ArrowRight className="h-4 w-4 text-primary" />
                          Ação Recomendada
                        </h4>
                        <p className="text-sm text-primary font-medium">{selectedInsight.action}</p>
                      </div>
                    )}

                    {/* AI Enrichment Section */}
                    {selectedInsight.ai_enrichment && (
                      <div className="space-y-4 pt-2 border-t border-border">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <h4 className="text-sm font-semibold text-foreground">Análise por Inteligência Artificial</h4>
                          {selectedInsight.ai_provider && (
                            <Badge variant="outline" className="text-[10px] ml-auto bg-purple-500/5 text-purple-400 border-purple-500/20">
                              {selectedInsight.ai_provider === "google_gemini" ? "Gemini" : "Claude"} · {selectedInsight.ai_model}
                            </Badge>
                          )}
                        </div>

                        {/* Deep Analysis */}
                        <div className="rounded-lg bg-purple-500/5 border border-purple-500/10 p-4">
                          <p className="text-sm text-foreground leading-relaxed">{selectedInsight.ai_enrichment.deepAnalysis}</p>
                        </div>

                        {/* Root Cause */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Target className="h-4 w-4 text-orange-500" />
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-1">Causa Raiz</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">{selectedInsight.ai_enrichment.rootCause}</p>
                          </div>
                        </div>

                        {/* Impact */}
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-1">Impacto Estimado</h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">{selectedInsight.ai_enrichment.impact}</p>
                          </div>
                        </div>

                        {/* Action Plan */}
                        {selectedInsight.ai_enrichment.actionPlan?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              Plano de Ação
                            </h5>
                            <div className="space-y-2">
                              {selectedInsight.ai_enrichment.actionPlan.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3 rounded-lg border border-border p-3">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                                    {idx + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">{step.step}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                      <Badge variant="outline" className={cn("text-[10px]",
                                        step.effort === "low" ? "text-green-500 border-green-500/30 bg-green-500/5" :
                                          step.effort === "medium" ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/5" :
                                            "text-red-500 border-red-500/30 bg-red-500/5"
                                      )}>
                                        Esforço: {step.effort === "low" ? "Baixo" : step.effort === "medium" ? "Médio" : "Alto"}
                                      </Badge>
                                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                                        <Clock className="h-2.5 w-2.5 mr-1" />
                                        {step.timeframe}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Related Metrics */}
                        {selectedInsight.ai_enrichment.relatedMetrics?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Métricas Relacionadas</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedInsight.ai_enrichment.relatedMetrics.map((metric, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">{metric}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Benchmark Context */}
                        {selectedInsight.ai_enrichment.benchmarkContext && (
                          <div className="rounded-lg bg-muted/50 border border-border p-4">
                            <h5 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                              <Brain className="h-4 w-4 text-purple-500" />
                              Contexto de Benchmark
                            </h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">{selectedInsight.ai_enrichment.benchmarkContext}</p>
                          </div>
                        )}

                        {/* AI metadata */}
                        {selectedInsight.ai_enriched_at && (
                          <p className="text-[10px] text-muted-foreground/60 text-right">
                            Enriquecido em {new Date(selectedInsight.ai_enriched_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </FeatureGate>
  );
}
