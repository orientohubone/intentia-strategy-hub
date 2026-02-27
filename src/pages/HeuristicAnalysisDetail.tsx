import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { StructuredDataViewer } from "@/components/StructuredDataViewer";
import { StructuredDataGenerator } from "@/components/StructuredDataGenerator";
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
    // Carregar imediatamente para melhor performance
    loadProject();
    loadAiConfig();
  }, [projectId, user]);

  const loadProject = async () => {
    if (!projectId || !user) return;
    setLoading(true);
    try {
      // Query ultra otimizada - campos mínimos essenciais
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, url, niche, score, status, heuristic_analysis, ai_analysis, heuristic_completed_at")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (error: any) {
      console.error("Error loading project:", error);
      toast.error("Erro ao carregar projeto");
      navigate("/heuristic-analysis");
    } finally {
      setLoading(false);
    }
  };

  const loadAiConfig = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("ai_api_keys")
        .select("provider, model")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const models = (data || []).map((k: any) => ({
        provider: k.provider,
        model: k.model,
        label: `${k.provider === "google_gemini" ? "Gemini" : "Claude"} - ${AI_MODEL_LABELS[k.model] || k.model}`,
      }));

      setAvailableAiModels(models);
      setHasAiKeys(models.length > 0);
      if (models.length > 0) {
        setSelectedAiModel(`${models[0].provider}::${models[0].model}`);
      }
    } catch (error) {
      console.error("Error loading AI config:", error);
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
      await loadProject();
    } catch (error: any) {
      console.error("Error analyzing:", error);
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
      await loadProject();
    } catch (error: any) {
      console.error("Error AI analysis:", error);
      toast.error("Erro na análise por IA: " + error.message);
    } finally {
      setAiAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <FeatureGate featureKey="projects" withLayout={false}>
        <DashboardLayout>
          <SEO title="Análise Heurística | Intentia" />
          <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
            {/* Header Skeleton - Minimal */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-muted animate-pulse"></div>
                <div className="min-w-0 flex-1">
                  <div className="h-8 bg-muted rounded w-1/3 mb-1 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-6 px-3 bg-muted rounded-full animate-pulse"></div>
                <div className="h-9 w-20 bg-muted rounded animate-pulse"></div>
              </div>
            </div>

            {/* Tabs Skeleton - Minimal */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg w-48 animate-pulse">
              <div className="h-8 flex-1 bg-background rounded"></div>
              <div className="h-8 flex-1 bg-background rounded"></div>
            </div>

            {/* Content Skeleton - Ultra Minimal */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-muted/50 rounded-lg p-2 text-center space-y-1 animate-pulse">
                    <div className="h-4 w-4 bg-muted rounded mx-auto"></div>
                    <div className="h-5 bg-muted rounded w-2/3 mx-auto"></div>
                  </div>
                ))}
              </div>
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

  const scoreItems = ha ? [
    { label: "Proposta de Valor", value: ha.scores.valueProposition, icon: TrendingUp, color: "text-primary" },
    { label: "Clareza da Oferta", value: ha.scores.offerClarity, icon: Eye, color: "text-blue-500" },
    { label: "Jornada do Usuário", value: ha.scores.userJourney, icon: MousePointerClick, color: "text-purple-500" },
    { label: "SEO", value: ha.scores.seoReadiness, icon: Globe, color: "text-green-500" },
    { label: "Conversão", value: ha.scores.conversionOptimization, icon: CheckCircle2, color: "text-amber-500" },
    { label: "Conteúdo", value: ha.scores.contentQuality, icon: FileText, color: "text-cyan-500" },
  ] : [];

  const getScoreColor = (v: number) => v >= 70 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-500";
  const getScoreBg = (v: number) => v >= 70 ? "bg-green-500" : v >= 50 ? "bg-yellow-500" : "bg-red-500";

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

  const readinessColor = ai ? (ai.investmentReadiness.score >= 70 ? "text-green-600" : ai.investmentReadiness.score >= 50 ? "text-yellow-600" : "text-red-500") : "";

  return (
    <FeatureGate featureKey="projects" withLayout={false}>
      <DashboardLayout>
        <SEO title={`Análise Heurística - ${project.name} | Intentia`} />
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/heuristic-analysis")}
                className="flex-shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                <p className="text-sm text-muted-foreground truncate">{project.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={project.score >= 70 ? "default" : project.score >= 50 ? "secondary" : "destructive"}>
                Score: {project.score}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReanalyze}
                disabled={analyzing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${analyzing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Reanalisar</span>
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="heuristic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="heuristic">
                <FileSearch className="h-4 w-4 mr-2" />
                Análise Heurística
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="h-4 w-4 mr-2" />
                Análise por IA
              </TabsTrigger>
            </TabsList>

            {/* Heuristic Analysis Tab */}
            <TabsContent value="heuristic" className="space-y-6 mt-6">
              {!ha ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Nenhuma análise disponível</CardTitle>
                    <CardDescription>Clique em "Reanalisar" para executar a análise heurística</CardDescription>
                  </CardHeader>
                </Card>
              ) : (
                <>
                  {/* Action Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate(`/seo-geo?project=${project.id}`)}
                      >
                        <Globe className="h-4 w-4" />
                        SEO & Performance
                      </Button>
                    </div>
                    {project.heuristic_completed_at && (
                      <Badge variant="outline" className="text-xs">
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

                  {/* Score Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {scoreItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Card key={item.label}>
                          <CardContent className="p-4 text-center space-y-2">
                            <Icon className={`h-5 w-5 mx-auto ${item.color}`} />
                            <p className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}</p>
                            <p className="text-xs text-muted-foreground leading-tight">{item.label}</p>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${getScoreBg(item.value)}`}
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Technical & Content Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Técnico
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        <Badge variant={ha.technical.hasHttps ? "default" : "destructive"}>
                          {ha.technical.hasHttps ? "✓ HTTPS" : "✗ Sem HTTPS"}
                        </Badge>
                        <Badge variant={ha.technical.hasViewport ? "default" : "destructive"}>
                          {ha.technical.hasViewport ? "✓ Mobile" : "✗ Sem viewport"}
                        </Badge>
                        <Badge variant={ha.technical.hasAnalytics ? "default" : "secondary"}>
                          {ha.technical.hasAnalytics ? "✓ Analytics" : "✗ Sem analytics"}
                        </Badge>
                        <Badge variant={ha.technical.hasStructuredData ? "default" : "secondary"}>
                          {ha.technical.hasStructuredData ? "✓ Schema" : "✗ Sem schema"}
                        </Badge>
                        <Badge variant="outline">⏱ {ha.technical.loadTimeEstimate}</Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Conteúdo
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-wrap gap-2">
                        <Badge variant="outline">{ha.content.wordCount} palavras</Badge>
                        <Badge variant="outline">{ha.content.ctaCount} CTAs</Badge>
                        <Badge variant="outline">{ha.content.formCount} formulários</Badge>
                        <Badge variant="outline">{ha.content.imageCount} imagens</Badge>
                        {ha.content.hasVideo && <Badge>✓ Vídeo</Badge>}
                        {ha.content.hasSocialProof && <Badge>✓ Prova social</Badge>}
                        {ha.content.hasPricing && <Badge>✓ Preços</Badge>}
                        {ha.content.hasFAQ && <Badge>✓ FAQ</Badge>}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Meta Info */}
                  {(ha.meta.title || ha.meta.description) && (
                    <Card>
                      <CardContent className="p-4 space-y-2">
                        {ha.meta.title && (
                          <p className="text-sm">
                            <span className="font-medium">Título:</span>{" "}
                            <span className="text-muted-foreground">{ha.meta.title}</span>
                          </p>
                        )}
                        {ha.meta.description && (
                          <p className="text-sm">
                            <span className="font-medium">Descrição:</span>{" "}
                            <span className="text-muted-foreground">{ha.meta.description.substring(0, 160)}</span>
                          </p>
                        )}
                        {ha.content.h1.length > 0 && (
                          <p className="text-sm">
                            <span className="font-medium">H1:</span>{" "}
                            <span className="text-muted-foreground">{ha.content.h1[0]}</span>
                          </p>
                        )}
                      </CardContent>
                    </Card>
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

            {/* AI Analysis Tab */}
            <TabsContent value="ai" className="space-y-6 mt-6">
              {!ai ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Análise por IA
                    </CardTitle>
                    <CardDescription>
                      {!canAiAnalysis
                        ? "Análise por IA indisponível no seu plano. Faça upgrade para Professional."
                        : !hasAiKeys
                        ? "Configure suas API keys em Configurações → Integrações de IA"
                        : "Execute a análise por IA para obter insights semânticos aprofundados"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {hasAiKeys && canAiAnalysis && (
                      <div className="flex items-center gap-3">
                        <Select value={selectedAiModel} onValueChange={setSelectedAiModel} disabled={aiAnalyzing}>
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Modelo IA" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableAiModels.map((m) => (
                              <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={handleAiAnalysis} disabled={aiAnalyzing || project.status !== "completed"} className="gap-2">
                          {aiAnalyzing ? (
                            <>
                              <div className="relative flex items-center justify-center h-4 w-4">
                                <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-foreground animate-lab-bubble"></span>
                              </div>
                              Analisando...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              Analisar com IA
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    {!hasAiKeys && canAiAnalysis && (
                      <Button variant="outline" onClick={() => navigate("/settings")}>
                        <Settings className="h-4 w-4 mr-2" />
                        Configurar API Keys
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Export Actions */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {ai.model.split("-").slice(0, 3).join("-")}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportAsJson({ projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha, ai })}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportAsMarkdown({ projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha, ai })}
                      >
                        MD
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportAsHtml({ projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha, ai })}
                      >
                        HTML
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => exportAsPdf({ projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha, ai })}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>

                  {/* Summary */}
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm leading-relaxed">{ai.summary}</p>
                    </CardContent>
                  </Card>

                  {/* Investment Readiness */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                          Prontidão p/ Investimento
                        </p>
                        <p className={`text-3xl font-bold ${readinessColor}`}>{ai.investmentReadiness.score}</p>
                        <Badge className={`mt-2 ${ai.investmentReadiness.level === "high" ? "bg-green-500" : ai.investmentReadiness.level === "medium" ? "bg-yellow-500" : "bg-red-500"}`}>
                          {ai.investmentReadiness.level === "high" ? "Alto" : ai.investmentReadiness.level === "medium" ? "Médio" : "Baixo"}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card className="sm:col-span-2">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Justificativa</p>
                        <p className="text-sm leading-relaxed">{ai.investmentReadiness.justification}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* SWOT */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-green-500/20 bg-green-500/5">
                      <CardHeader>
                        <CardTitle className="text-sm text-green-700 dark:text-green-400">Pontos Fortes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {ai.strengths.map((s, i) => (
                          <p key={i} className="text-sm flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span> {s}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-red-500/20 bg-red-500/5">
                      <CardHeader>
                        <CardTitle className="text-sm text-red-700 dark:text-red-400">Fraquezas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {ai.weaknesses.map((w, i) => (
                          <p key={i} className="text-sm flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span> {w}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                    <Card className="border-blue-500/20 bg-blue-500/5">
                      <CardHeader>
                        <CardTitle className="text-sm text-blue-700 dark:text-blue-400">Oportunidades</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {ai.opportunities.map((o, i) => (
                          <p key={i} className="text-sm flex items-start gap-2">
                            <span className="text-blue-500 mt-0.5">→</span> {o}
                          </p>
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Channel Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recomendações por Canal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ai.channelRecommendations.map((ch, i) => {
                          const vc = verdictConfig[ch.verdict] || verdictConfig.caution;
                          return (
                            <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">{ch.channel}</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${vc.color}`}>
                                  {vc.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{ch.reasoning}</p>
                              {ch.suggestedBudgetAllocation && (
                                <p className="text-xs text-primary font-medium">Budget: {ch.suggestedBudgetAllocation}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Recomendações Estratégicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {ai.recommendations.map((rec, i) => {
                        const pc = priorityConfig[rec.priority] || priorityConfig.medium;
                        return (
                          <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${pc.color}`}></span>
                              <p className="text-sm font-semibold">{rec.title}</p>
                              <Badge variant="outline" className="text-xs ml-auto">{rec.category}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground pl-4">{rec.description}</p>
                            <p className="text-xs text-primary font-medium pl-4">Impacto: {rec.expectedImpact}</p>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  {/* Competitive Position */}
                  {ai.competitivePosition && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Posição Competitiva</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">{ai.competitivePosition}</p>
                      </CardContent>
                    </Card>
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
