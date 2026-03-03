import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  RefreshCw,
  FileSearch,
  TrendingUp,
  Eye,
  MousePointerClick,
  Globe,
  CheckCircle2,
  FileText,
  Shield,
  Sparkles,
  Settings,
  Download,
  AlertTriangle,
  Lightbulb,
  Zap,
  Target,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { StructuredDataViewer } from "@/components/StructuredDataViewer";
import { StructuredDataGenerator } from "@/components/StructuredDataGenerator";
import { ScoreRing } from "@/components/ScoreRing";
import { toast } from "sonner";
import { analyzeUrl } from "@/lib/urlAnalyzer";
import type { UrlAnalysis } from "@/lib/urlAnalyzer";
import type { AiAnalysisResult } from "@/lib/aiAnalyzer";
import type { CompetitorStructuredData } from "@/components/StructuredDataViewer";
import { exportAsJson, exportAsMarkdown, exportAsHtml, exportAsPdf } from "@/lib/exportAnalysis";
import { AI_MODEL_LABELS } from "@/lib/aiModels";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";

interface Project {
  id: string;
  name: string;
  url: string;
  niche: string;
  score: number;
  status: string;
  heuristic_analysis: UrlAnalysis | null;
  ai_analysis: AiAnalysisResult | null;
  heuristic_completed_at: string | null;
  structured_data: any;
  html_snapshot: string | null;
  html_snapshot_at: string | null;
}

// ── Global Cache ────────────────────────────────────────────────
const CACHE_TTL = 1000 * 60 * 2;
const detailCache = new Map<string, { project: Project; aiModels: any[]; hasKeys: boolean; timestamp: number }>();

export default function HeuristicAnalysisDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFeatureAvailable } = useFeatureFlags();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState("google_gemini::gemini-2.0-flash-exp");
  const [availableAiModels, setAvailableAiModels] = useState<any[]>([]);
  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [competitorSd, setCompetitorSd] = useState<CompetitorStructuredData[]>([]);

  const canAiAnalysis = isFeatureAvailable("ai_analysis");

  useEffect(() => {
    if (!projectId || !user) {
      navigate("/heuristic-analysis");
      return;
    }

    const cacheKey = `${user.id}:${projectId}`;
    const cached = detailCache.get(cacheKey);
    if (cached) {
      setProject(cached.project);
      setAvailableAiModels(cached.aiModels);
      setHasAiKeys(cached.hasKeys);
      setLoading(false);

      if (Date.now() - cached.timestamp >= CACHE_TTL) {
        void loadAll({ silent: true });
      }
      return;
    }

    void loadAll();
  }, [projectId, user]);

  const loadAll = async (options?: { silent?: boolean }) => {
    if (!projectId || !user) return;
    const cacheKey = `${user.id}:${projectId}`;
    const cached = detailCache.get(cacheKey);
    if (!options?.silent && !cached) setLoading(true);

    try {
      const projectRes = await supabase
        .from("projects")
        .select("id, name, url, niche, score, status, heuristic_analysis, ai_analysis, heuristic_completed_at")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      // ai_api_keys may not exist yet — handle gracefully
      let aiKeys: any[] = [];
      try {
        const aiRes = await supabase
          .from("ai_api_keys")
          .select("provider, model")
          .eq("user_id", user.id)
          .eq("is_active", true);
        if (!aiRes.error) aiKeys = aiRes.data || [];
      } catch { /* table may not exist */ }

      if (projectRes.error) throw projectRes.error;

      const nextProject = projectRes.data as Project;
      const nextModels = aiKeys.map((k: any) => ({
        provider: k.provider,
        model: k.model,
        label: `${k.provider === "google_gemini" ? "Gemini" : "Claude"} - ${AI_MODEL_LABELS[k.model] || k.model}`,
      }));
      const nextHasKeys = nextModels.length > 0;

      setProject(nextProject);
      setAvailableAiModels(nextModels);
      setHasAiKeys(nextHasKeys);

      if (nextModels.length > 0 && !nextModels.find((m: any) => `${m.provider}::${m.model}` === selectedAiModel)) {
        setSelectedAiModel(`${nextModels[0].provider}::${nextModels[0].model}`);
      }

      detailCache.set(cacheKey, {
        project: nextProject,
        aiModels: nextModels,
        hasKeys: nextHasKeys,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error("Error loading project:", error?.message || "Unknown error");
      if (!cached) {
        toast.error("Erro ao carregar projeto");
        navigate("/heuristic-analysis");
      }
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  const invalidateCache = () => {
    if (user && projectId) {
      detailCache.delete(`${user.id}:${projectId}`);
    }
  };

  const handleReanalyze = async () => {
    if (!project || !user) return;
    setAnalyzing(true);
    try {
      const analysis = await analyzeUrl(project.url);

      const { error } = await (supabase as any)
        .from("projects")
        .update({
          heuristic_analysis: analysis,
          heuristic_completed_at: new Date().toISOString(),
          status: "completed",
          score: analysis.overallScore,
        })
        .eq("id", project.id)
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Análise heurística concluída!");
      invalidateCache();
      await loadAll();
    } catch (error: any) {
      console.error("Error analyzing:", error?.message || "Unknown error");
      toast.error("Erro ao analisar: " + error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAiAnalysis = async () => {
    if (!project || !user || !canAiAnalysis) return;
    setAiAnalyzing(true);
    try {
      const [provider, model] = selectedAiModel.split("::");
      const { data, error } = await supabase.functions.invoke("ai-analyze", {
        body: {
          projectId: project.id,
          provider,
          model,
        },
      });

      if (error) throw error;
      toast.success("Análise por IA concluída!");
      invalidateCache();
      await loadAll();
    } catch (error: any) {
      console.error("Error AI analysis:", error?.message || "Unknown error");
      toast.error("Erro na análise por IA: " + error.message);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const getScoreColor = (v: number) =>
    v >= 70 ? "text-green-600 dark:text-green-400" : v >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500 dark:text-red-400";
  const getScoreBg = (v: number) =>
    v >= 70 ? "bg-green-500" : v >= 50 ? "bg-yellow-500" : "bg-red-500";
  const getScoreBgLight = (v: number) =>
    v >= 70 ? "bg-green-500/10 border-green-500/20" : v >= 50 ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20";

  if (loading) {
    return (
      <FeatureGate featureKey="projects" withLayout={false}>
        <DashboardLayout>
          <SEO title="Análise Heurística | Intentia" />
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-lg animate-pulse" />
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                <div className="h-3 w-64 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-3 animate-pulse space-y-2">
                  <div className="h-4 w-4 bg-muted rounded mx-auto" />
                  <div className="h-6 w-10 bg-muted rounded mx-auto" />
                  <div className="h-2 w-full bg-muted rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </DashboardLayout>
      </FeatureGate>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <SEO title="Análise Heurística | Intentia" />
        <div className="max-w-6xl mx-auto p-6">
          <p className="text-muted-foreground">Projeto não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  const ha = project.heuristic_analysis;
  const ai = project.ai_analysis;

  const scoreItems = ha
    ? [
      { label: "Proposta de Valor", short: "Valor", value: ha.scores.valueProposition, icon: TrendingUp, color: "text-primary" },
      { label: "Clareza da Oferta", short: "Oferta", value: ha.scores.offerClarity, icon: Eye, color: "text-blue-500" },
      { label: "Jornada do Usuário", short: "UX", value: ha.scores.userJourney, icon: MousePointerClick, color: "text-purple-500" },
      { label: "SEO Readiness", short: "SEO", value: ha.scores.seoReadiness, icon: Globe, color: "text-green-500" },
      { label: "Conversão", short: "CRO", value: ha.scores.conversionOptimization, icon: CheckCircle2, color: "text-amber-500" },
      { label: "Conteúdo", short: "Copy", value: ha.scores.contentQuality, icon: FileText, color: "text-cyan-500" },
    ]
    : [];

  const verdictConfig: Record<string, { label: string; color: string; bg: string }> = {
    recommended: { label: "Recomendado", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    caution: { label: "Cautela", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    not_recommended: { label: "Não recomendado", color: "text-red-500 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  };

  const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
    high: { label: "Alta", color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    medium: { label: "Média", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
    low: { label: "Baixa", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  };

  return (
    <FeatureGate featureKey="projects" withLayout={false}>
      <DashboardLayout>
        <SEO title={`Análise Heurística - ${project.name} | Intentia`} />
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/heuristic-analysis")}
                className="flex-shrink-0 h-9 w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate text-foreground">{project.name}</h1>
                <p className="text-xs text-muted-foreground truncate">{project.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <ScoreRing score={project.score} size="sm" label="" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleReanalyze}
                disabled={analyzing}
                className="gap-1.5 h-8 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Reanalisar</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="heuristic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="heuristic" className="gap-2">
                <FileSearch className="h-4 w-4" />
                Análise Heurística
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Análise Estratégica
              </TabsTrigger>
            </TabsList>

            {/* Heuristic Analysis Tab */}
            <TabsContent value="heuristic" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {!ha ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <FileSearch className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma análise disponível</h3>
                  <p className="text-sm text-muted-foreground">Clique em "Reanalisar" para executar a análise heurística</p>
                </div>
              ) : (
                <>
                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-8 text-xs"
                      onClick={() => navigate(`/seo-geo?project=${project.id}`)}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      SEO & Performance
                    </Button>
                    {project.heuristic_completed_at && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0">
                        {new Date(project.heuristic_completed_at).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Badge>
                    )}
                  </div>

                  {/* Score Grid — Premium */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                    {scoreItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className={`rounded-xl border p-3 sm:p-4 text-center space-y-1.5 ${getScoreBgLight(item.value)}`}>
                          <div className="flex items-center justify-center gap-1.5">
                            <Icon className={`h-3.5 w-3.5 ${item.color}`} />
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{item.short}</span>
                          </div>
                          <p className={`text-2xl sm:text-3xl font-bold ${getScoreColor(item.value)}`}>{item.value}</p>
                          <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getScoreBg(item.value)}`}
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Technical & Content Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Técnico</p>
                      </div>
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
                        <Badge variant="outline" className="text-[10px]">⏱ {ha.technical.loadTimeEstimate}</Badge>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <FileText className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Conteúdo</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="text-[10px]">{ha.content.wordCount} palavras</Badge>
                        <Badge variant="outline" className="text-[10px]">{ha.content.ctaCount} CTAs</Badge>
                        <Badge variant="outline" className="text-[10px]">{ha.content.formCount} formulários</Badge>
                        <Badge variant="outline" className="text-[10px]">{ha.content.imageCount} imagens</Badge>
                        {ha.content.hasVideo && <Badge className="text-[10px]">✓ Vídeo</Badge>}
                        {ha.content.hasSocialProof && <Badge className="text-[10px]">✓ Prova social</Badge>}
                        {ha.content.hasPricing && <Badge className="text-[10px]">✓ Preços</Badge>}
                        {ha.content.hasFAQ && <Badge className="text-[10px]">✓ FAQ</Badge>}
                      </div>
                    </div>
                  </div>

                  {/* Meta */}
                  {(ha.meta.title || ha.meta.description) && (
                    <div className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-2">
                      {ha.meta.title && (
                        <p className="text-sm">
                          <span className="font-medium text-foreground">Título:</span>{" "}
                          <span className="text-muted-foreground">{ha.meta.title}</span>
                        </p>
                      )}
                      {ha.meta.description && (
                        <p className="text-sm">
                          <span className="font-medium text-foreground">Descrição:</span>{" "}
                          <span className="text-muted-foreground">{ha.meta.description.substring(0, 160)}</span>
                        </p>
                      )}
                      {ha.content.h1.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium text-foreground">H1:</span>{" "}
                          <span className="text-muted-foreground">{ha.content.h1[0]}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Structured Data */}
                  {(ha.structuredData || project.structured_data) && (
                    <>
                      <StructuredDataViewer
                        structuredData={ha.structuredData || project.structured_data}
                        htmlSnapshot={ha.htmlSnapshot || project.html_snapshot}
                        htmlSnapshotAt={project.html_snapshot_at}
                        competitors={competitorSd}
                        projectName={project.name}
                      />
                      <StructuredDataGenerator
                        projectStructuredData={ha.structuredData || project.structured_data}
                        projectMeta={ha.meta}
                        projectUrl={project.url}
                        projectName={project.name}
                        projectNiche={project.niche}
                        competitors={competitorSd}
                      />
                    </>
                  )}
                </>
              )}
            </TabsContent>

            {/* AI Analysis Tab — Renamed to "Análise Estratégica" */}
            <TabsContent value="ai" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
              {!ai ? (
                <div className="rounded-xl border border-border bg-card p-8 sm:p-12">
                  <div className="max-w-md mx-auto text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Análise Estratégica</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                      {!canAiAnalysis
                        ? "Análise estratégica indisponível no seu plano. Faça upgrade para Professional."
                        : !hasAiKeys
                          ? "Configure suas API keys em Configurações → Integrações de IA"
                          : "Execute a análise estratégica para obter insights de posicionamento, canais recomendados e plano de ação."}
                    </p>
                    {hasAiKeys && canAiAnalysis && (
                      <div className="flex items-center justify-center gap-3">
                        <Select value={selectedAiModel} onValueChange={setSelectedAiModel} disabled={aiAnalyzing}>
                          <SelectTrigger className="w-[180px] h-9 text-xs">
                            <SelectValue placeholder="Modelo" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAiModels.map((m) => (
                              <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`} className="text-xs">
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAiAnalysis} disabled={aiAnalyzing || project.status !== "completed"} className="gap-2 h-9">
                          {aiAnalyzing ? (
                            <>
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              Analisando...
                            </>
                          ) : (
                            <>
                              <BarChart3 className="h-3.5 w-3.5" />
                              Iniciar Análise
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    {!hasAiKeys && canAiAnalysis && (
                      <Button variant="outline" onClick={() => navigate("/settings")} className="gap-2">
                        <Settings className="h-4 w-4" />
                        Configurar API Keys
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Export Bar */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] px-2 py-0">
                      {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {ai.model.split("-").slice(0, 3).join("-")}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {[
                        { label: "JSON", fn: exportAsJson },
                        { label: "MD", fn: exportAsMarkdown },
                        { label: "HTML", fn: exportAsHtml },
                        { label: "PDF", fn: exportAsPdf },
                      ].map((exp) => (
                        <Button
                          key={exp.label}
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[10px] px-2"
                          onClick={() => exp.fn({ projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha, ai })}
                        >
                          {exp.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                    <p className="text-sm leading-relaxed text-foreground">{ai.summary}</p>
                  </div>

                  {/* Investment Readiness — Premium Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className={`rounded-xl border p-5 text-center ${ai.investmentReadiness.score >= 70
                      ? "bg-green-500/5 border-green-500/20"
                      : ai.investmentReadiness.score >= 50
                        ? "bg-yellow-500/5 border-yellow-500/20"
                        : "bg-red-500/5 border-red-500/20"
                      }`}>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Prontidão p/ Investimento</p>
                      <p className={`text-4xl font-bold ${getScoreColor(ai.investmentReadiness.score)}`}>{ai.investmentReadiness.score}</p>
                      <Badge variant="outline" className={`mt-2 text-[10px] ${ai.investmentReadiness.level === "high"
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                        : ai.investmentReadiness.level === "medium"
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                          : "bg-red-500/10 text-red-500 border-red-500/20"
                        }`}>
                        {ai.investmentReadiness.level === "high" ? "Alto" : ai.investmentReadiness.level === "medium" ? "Médio" : "Baixo"}
                      </Badge>
                    </div>
                    <div className="sm:col-span-2 rounded-xl border border-border bg-card p-5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Justificativa</p>
                      <p className="text-sm leading-relaxed text-foreground">{ai.investmentReadiness.justification}</p>
                    </div>
                  </div>

                  {/* SWOT — Premium 3-Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-green-500/10 rounded-lg">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">Pontos Fortes</p>
                      </div>
                      <div className="space-y-2">
                        {ai.strengths.map((s, i) => (
                          <p key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-foreground">{s}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-red-500/10 rounded-lg">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Fraquezas</p>
                      </div>
                      <div className="space-y-2">
                        {ai.weaknesses.map((w, i) => (
                          <p key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                            <span className="text-foreground">{w}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <Lightbulb className="h-3.5 w-3.5 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Oportunidades</p>
                      </div>
                      <div className="space-y-2">
                        {ai.opportunities.map((o, i) => (
                          <p key={i} className="text-sm flex items-start gap-2">
                            <ChevronRight className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-foreground">{o}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Channel Recommendations — Premium Cards */}
                  <div className="rounded-xl border border-border bg-card">
                    <div className="p-4 sm:p-5 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <Target className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Recomendações por Canal</p>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ai.channelRecommendations.map((ch, i) => {
                          const vc = verdictConfig[ch.verdict] || verdictConfig.caution;
                          return (
                            <div key={i} className={`rounded-xl border p-4 space-y-2.5 ${vc.bg}`}>
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-foreground">{ch.channel}</p>
                                <Badge variant="outline" className={`text-[10px] ${vc.color}`}>
                                  {vc.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{ch.reasoning}</p>
                              {ch.suggestedBudgetAllocation && (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                  <BarChart3 className="h-3 w-3" />
                                  Budget: {ch.suggestedBudgetAllocation}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Strategic Recommendations */}
                  <div className="rounded-xl border border-border bg-card">
                    <div className="p-4 sm:p-5 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/10 rounded-lg">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Recomendações Estratégicas</p>
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 space-y-3">
                      {ai.recommendations.map((rec, i) => {
                        const pc = priorityConfig[rec.priority] || priorityConfig.medium;
                        return (
                          <div key={i} className={`rounded-xl border p-4 space-y-2 ${pc.bg}`}>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${getScoreBg(rec.priority === "high" ? 30 : rec.priority === "medium" ? 60 : 80)}`} />
                              <p className="text-sm font-semibold text-foreground flex-1">{rec.title}</p>
                              <Badge variant="outline" className="text-[10px] ml-auto">{rec.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground pl-4 leading-relaxed">{rec.description}</p>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-primary pl-4">
                              <ArrowUpRight className="h-3 w-3" />
                              Impacto: {rec.expectedImpact}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Competitive Position */}
                  {ai.competitivePosition && (
                    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                          <Globe className="h-3.5 w-3.5 text-purple-500" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Posição Competitiva</p>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{ai.competitivePosition}</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </FeatureGate>
  );
}
