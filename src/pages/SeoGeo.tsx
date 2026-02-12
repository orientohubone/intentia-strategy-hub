import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Globe,
  Search,
  Smartphone,
  Monitor,
  Gauge,
  Zap,
  Eye,
  Shield,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Image,
  FileText,
  MousePointerClick,
  LayoutDashboard,
  TrendingUp,
  Link2,
  Radar,
  Bot,
  Activity,
  ExternalLink,
  Info,
} from "lucide-react";
import {
  fetchPageSpeedInsights,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
  getMetricCategoryColor,
  getMetricCategoryBg,
  getMetricCategoryLabel,
  type PageSpeedResult,
  type MetricResult,
} from "@/lib/pagespeedApi";
import { fetchSerpRanking, type SerpResponse } from "@/lib/seoSerpApi";
import { fetchSeoIntelligence, type SeoIntelligenceResponse } from "@/lib/seoIntelligenceApi";

// =====================================================
// SCORE GAUGE COMPONENT
// =====================================================

function ScoreGauge({ score, size = "lg", label }: { score: number; size?: "sm" | "md" | "lg"; label: string }) {
  const sizeMap = { sm: 64, md: 80, lg: 120 };
  const strokeMap = { sm: 4, md: 5, lg: 6 };
  const fontMap = { sm: "text-lg", md: "text-xl", lg: "text-3xl" };
  const labelMap = { sm: "text-[9px]", md: "text-[10px]", lg: "text-xs" };

  const s = sizeMap[size];
  const stroke = strokeMap[size];
  const radius = (s - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 90 ? "stroke-green-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500";
  const bgRing = "stroke-muted";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: s, height: s }}>
        <svg width={s} height={s} className="-rotate-90">
          <circle cx={s / 2} cy={s / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className={bgRing} />
          <circle
            cx={s / 2} cy={s / 2} r={radius} fill="none" strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className={`${color} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontMap[size]} ${getScoreColor(score)}`}>{score}</span>
        </div>
      </div>
      <span className={`${labelMap[size]} text-muted-foreground font-medium`}>{label}</span>
    </div>
  );
}

// =====================================================
// CORE WEB VITAL CARD
// =====================================================

function VitalCard({ label, metric, description, icon: Icon }: {
  label: string;
  metric: MetricResult;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className={`rounded-xl border p-4 space-y-2 ${getMetricCategoryBg(metric.category)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        <Badge variant="outline" className={`text-[10px] ${getMetricCategoryColor(metric.category)}`}>
          {getMetricCategoryLabel(metric.category)}
        </Badge>
      </div>
      <p className={`text-2xl font-bold ${getMetricCategoryColor(metric.category)}`}>
        {metric.value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

// =====================================================
// SEO AUDIT ITEM
// =====================================================

function AuditItem({ title, score, description }: { title: string; score: number | null; description?: string }) {
  const passed = score === null ? null : score >= 0.9;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="mt-0.5 shrink-0">
        {passed === null ? (
          <Info className="h-4 w-4 text-muted-foreground" />
        ) : passed ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
}

// =====================================================
// OPPORTUNITY ITEM
// =====================================================

function OpportunityItem({ audit }: { audit: { title: string; displayValue?: string; description: string } }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{audit.title}</p>
          {audit.displayValue && (
            <Badge variant="outline" className="text-[10px] text-yellow-600">{audit.displayValue}</Badge>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{audit.description}</p>
      </div>
    </div>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function SeoGeo() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("project");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdParam || "");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PageSpeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serpLoading, setSerpLoading] = useState(false);
  const [serpError, setSerpError] = useState<string | null>(null);
  const [serpData, setSerpData] = useState<SerpResponse | null>(null);
  const [serpCustomTerm, setSerpCustomTerm] = useState("");
  const [intelLoading, setIntelLoading] = useState(false);
  const [intelError, setIntelError] = useState<string | null>(null);
  const [intelData, setIntelData] = useState<SeoIntelligenceResponse | null>(null);

  // Load projects
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("projects")
        .select("id, name, url, niche, score, status, heuristic_analysis")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) {
        setProjects(data);
        if (projectIdParam && !selectedProjectId) {
          setSelectedProjectId(projectIdParam);
        }
      }
    })();
  }, [user]);

  // Auto-analyze when project is selected via URL param
  useEffect(() => {
    if (projectIdParam && projects.length > 0 && !result && !loading) {
      const project = projects.find((p: any) => p.id === projectIdParam);
      if (project?.url) {
        handleAnalyze();
      }
    }
  }, [projectIdParam, projects]);

  const selectedProject = projects.find((p: any) => p.id === selectedProjectId);

  const handleAnalyze = async () => {
    const project = projects.find((p: any) => p.id === selectedProjectId);
    if (!project?.url) return;

    setLoading(true);
    setError(null);
    setResult(null);

    // Run PageSpeed + SERP ranking + Intelligence in parallel
    handleSerpFetch();
    handleIntelFetch();

    try {
      const data = await fetchPageSpeedInsights(project.url, strategy);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Erro ao analisar URL");
    } finally {
      setLoading(false);
    }
  };

  const handleIntelFetch = async () => {
    const project = projects.find((p: any) => p.id === selectedProjectId);
    if (!project?.url) return;

    setIntelLoading(true);
    setIntelError(null);
    setIntelData(null);

    try {
      // Get competitor URLs from project
      const competitorUrls = project.competitor_urls || [];

      // Get user AI keys
      let aiKeys: { provider: string; apiKey: string; model: string }[] = [];
      if (user) {
        const { data: keys } = await (supabase as any)
          .from("user_api_keys")
          .select("provider, api_key, preferred_model")
          .eq("user_id", user.id)
          .eq("is_valid", true);
        if (keys) {
          aiKeys = keys.map((k: any) => ({
            provider: k.provider,
            apiKey: k.api_key,
            model: k.preferred_model || (k.provider === "google_gemini" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514"),
          }));
        }
      }

      const data = await fetchSeoIntelligence({
        url: project.url,
        competitorUrls,
        brandName: project.name,
        niche: project.niche || "",
        aiKeys,
      });
      setIntelData(data);
    } catch (err: any) {
      setIntelError(err.message || "Erro na análise de inteligência");
    } finally {
      setIntelLoading(false);
    }
  };

  const handleSerpFetch = async () => {
    const project = projects.find((p: any) => p.id === selectedProjectId);
    if (!project) return;

    setSerpLoading(true);
    setSerpError(null);
    setSerpData(null);

    try {
      const targetDomain = project.url ? new URL(project.url).hostname : undefined;
      const terms: string[] = [];

      // Custom term first (if user typed one)
      if (serpCustomTerm.trim()) {
        terms.push(serpCustomTerm.trim());
      }

      // Project name + niche
      const niche = project.niche?.trim() || "";
      if (niche) {
        terms.push(`${project.name} ${niche}`);
      }

      // Project name alone
      terms.push(project.name);

      // Deduplicate
      const uniqueTerms = [...new Set(terms)].slice(0, 3);

      const data = await fetchSerpRanking(uniqueTerms, targetDomain);
      setSerpData(data);
    } catch (err: any) {
      setSerpError(err.message || "Erro ao buscar ranking Google");
    } finally {
      setSerpLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <SEO title="SEO & Performance" path="/seo-geo" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              SEO & Performance
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Core Web Vitals, SEO, acessibilidade e boas práticas — dados reais do Google PageSpeed Insights
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Projetos
          </Button>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Projeto</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto analisado..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.filter((p: any) => p.url).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        <span className="flex items-center gap-2">
                          {p.name}
                          {p.score && (
                            <Badge variant="outline" className="text-[10px]">Score {p.score}</Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProject?.url && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[200px] pb-2.5 hidden sm:flex">
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{selectedProject.url}</span>
                </p>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dispositivo</label>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button
                    size="sm"
                    variant={strategy === "mobile" ? "default" : "ghost"}
                    className="gap-1.5 h-8"
                    onClick={() => setStrategy("mobile")}
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                    Mobile
                  </Button>
                  <Button
                    size="sm"
                    variant={strategy === "desktop" ? "default" : "ghost"}
                    className="gap-1.5 h-8"
                    onClick={() => setStrategy("desktop")}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Desktop
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedProjectId || loading}
                className="gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Analisando..." : "Analisar SEO & Performance"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin border-t-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">Analisando com Google PageSpeed Insights...</p>
                    <p className="text-xs text-muted-foreground">Isso pode levar de 15 a 45 segundos dependendo do site</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-500">
                <XCircle className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Erro na análise</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && !result && !error && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Gauge className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2 max-w-md">
                  <h3 className="text-lg font-semibold text-foreground">Análise SEO & Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Selecione um projeto acima e clique em "Analisar" para obter dados reais do Google PageSpeed Insights,
                    incluindo Core Web Vitals, SEO, acessibilidade e oportunidades de melhoria.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Overview */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                      Visão Geral
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Análise {strategy === "mobile" ? "mobile" : "desktop"} • {new Date(result.fetchTime).toLocaleString("pt-BR")}
                    </CardDescription>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="gap-1">
                        {strategy === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                        {strategy === "mobile" ? "Mobile" : "Desktop"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Dados simulados via Lighthouse ({strategy})</TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4">
                  <ScoreGauge score={result.performanceScore} label="Performance" />
                  <ScoreGauge score={result.seoScore} label="SEO" />
                  <ScoreGauge score={result.accessibilityScore} label="Acessibilidade" />
                  <ScoreGauge score={result.bestPracticesScore} label="Boas Práticas" />
                </div>
                <div className="flex justify-center gap-6 pt-4 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    90–100 Bom
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    50–89 Precisa melhorar
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    0–49 Ruim
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Core Web Vitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Core Web Vitals
                </CardTitle>
                <CardDescription>
                  Métricas essenciais que o Google usa para avaliar a experiência do usuário e ranqueamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <VitalCard
                    label="LCP — Largest Contentful Paint"
                    metric={result.coreWebVitals.lcp}
                    description="Tempo para renderizar o maior elemento visível. Ideal: ≤ 2.5s"
                    icon={Image}
                  />
                  <VitalCard
                    label="INP — Interaction to Next Paint"
                    metric={result.coreWebVitals.inp}
                    description="Latência de resposta a interações do usuário. Ideal: ≤ 200ms"
                    icon={MousePointerClick}
                  />
                  <VitalCard
                    label="CLS — Cumulative Layout Shift"
                    metric={result.coreWebVitals.cls}
                    description="Estabilidade visual — quanto o layout se move. Ideal: ≤ 0.1"
                    icon={LayoutDashboard}
                  />
                  <VitalCard
                    label="FCP — First Contentful Paint"
                    metric={result.coreWebVitals.fcp}
                    description="Tempo para renderizar o primeiro conteúdo visível. Ideal: ≤ 1.8s"
                    icon={Eye}
                  />
                  <VitalCard
                    label="TTFB — Time to First Byte"
                    metric={result.coreWebVitals.ttfb}
                    description="Tempo de resposta do servidor. Ideal: ≤ 800ms"
                    icon={Clock}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs: SEO / Accessibility / Opportunities */}
            <Tabs defaultValue="seo" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="seo" className="gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  SEO
                  <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">
                    {result.seoScore}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="inteligencia" className="gap-1.5">
                  <Radar className="h-3.5 w-3.5" />
                  Inteligência
                  <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">
                    Beta
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="accessibility" className="gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Acessibilidade
                  <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">
                    {result.accessibilityScore}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="opportunities" className="gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Oportunidades
                  <Badge variant="outline" className="text-[9px] ml-1 h-4 px-1">
                    {result.opportunities.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* SEO Tab */}
              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Search className="h-5 w-5 text-primary" />
                      Auditoria SEO
                    </CardTitle>
                    <CardDescription>
                      Verificações de SEO baseadas no Lighthouse — {result.seoAudits.filter(a => a.score !== null && a.score >= 0.9).length} de {result.seoAudits.filter(a => a.score !== null).length} aprovadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Failed audits first */}
                    {result.seoAudits.filter(a => a.score !== null && a.score < 0.9).length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1">
                          <XCircle className="h-3.5 w-3.5" />
                          Itens que precisam de atenção ({result.seoAudits.filter(a => a.score !== null && a.score < 0.9).length})
                        </p>
                        {result.seoAudits
                          .filter(a => a.score !== null && a.score < 0.9)
                          .map(a => (
                            <AuditItem key={a.id} title={a.title} score={a.score} description={a.description} />
                          ))}
                      </div>
                    )}
                    {/* Passed audits */}
                    {result.seoAudits.filter(a => a.score !== null && a.score >= 0.9).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Aprovados ({result.seoAudits.filter(a => a.score !== null && a.score >= 0.9).length})
                        </p>
                        {result.seoAudits
                          .filter(a => a.score !== null && a.score >= 0.9)
                          .map(a => (
                            <AuditItem key={a.id} title={a.title} score={a.score} description={a.description} />
                          ))}
                      </div>
                    )}
                    {/* Informational */}
                    {result.seoAudits.filter(a => a.score === null).length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <Info className="h-3.5 w-3.5" />
                          Informacional ({result.seoAudits.filter(a => a.score === null).length})
                        </p>
                        {result.seoAudits
                          .filter(a => a.score === null)
                          .map(a => (
                            <AuditItem key={a.id} title={a.title} score={a.score} description={a.description} />
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </TabsContent>

              {/* Inteligência Tab */}
              <TabsContent value="inteligencia" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Search className="h-5 w-5 text-primary" />
                      Ranking Google por Projeto
                    </CardTitle>
                    <CardDescription>
                      Busca até 3 variações automaticamente (nome, nome+nicho, termo personalizado). O melhor resultado é exibido.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Termo personalizado (opcional)..."
                        value={serpCustomTerm}
                        onChange={(e) => setSerpCustomTerm(e.target.value)}
                        className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        onKeyDown={(e) => e.key === "Enter" && handleSerpFetch()}
                      />
                      <Button size="sm" className="gap-2 h-9" onClick={handleSerpFetch} disabled={!selectedProjectId || serpLoading}>
                        {serpLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        {serpLoading ? "Buscando..." : "Buscar ranking"}
                      </Button>
                    </div>

                    {serpError && (
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <XCircle className="h-4 w-4 shrink-0" />
                        {serpError}
                      </div>
                    )}

                    {!serpError && !serpData && !serpLoading && (
                      <div className="text-sm text-muted-foreground py-4 text-center">
                        Clique em "Buscar ranking" para consultar o Google com variações do nome do projeto.
                      </div>
                    )}

                    {serpLoading && (
                      <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Consultando Google com até 3 variações...
                      </div>
                    )}

                    {serpData && (
                      <div className="space-y-4">
                        {/* Query summary */}
                        <div className="flex flex-wrap items-center gap-2">
                          {serpData.targetDomain && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Globe className="h-3 w-3" />
                              {serpData.targetDomain}
                            </Badge>
                          )}
                          <Badge variant={serpData.targetPosition ? "default" : "secondary"} className="text-xs">
                            {serpData.targetPosition ? `Posição #${serpData.targetPosition}` : "Fora do top 20"}
                          </Badge>
                        </div>

                        {/* All queries tried */}
                        {serpData.allQueries && serpData.allQueries.length > 0 && (
                          <div className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                            <p className="text-[11px] font-semibold text-muted-foreground">Consultas realizadas:</p>
                            {serpData.allQueries.map((q, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${q.query === serpData.query ? "bg-primary" : "bg-muted-foreground/40"}`} />
                                <span className={q.query === serpData.query ? "font-semibold text-foreground" : "text-muted-foreground"}>
                                  "{q.query}"
                                </span>
                                <span className="text-muted-foreground">
                                  — {q.error ? `Erro: ${q.error}` : `${q.resultCount} resultados`}
                                  {q.targetPosition ? ` (posição #${q.targetPosition})` : ""}
                                </span>
                                {q.query === serpData.query && (
                                  <Badge variant="outline" className="text-[9px] h-4 px-1">melhor</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {serpData.results.length === 0 ? (
                          <div className="text-sm text-muted-foreground py-4 text-center">
                            Nenhum resultado encontrado. Tente um termo personalizado acima.
                          </div>
                        ) : (
                          <div className="divide-y divide-border">
                            {serpData.results.map((item) => (
                              <div key={`${item.position}-${item.domain}`} className="flex items-start gap-3 py-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${item.isTarget ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                  {item.position}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{item.domain}</p>
                                </div>
                                {item.isTarget && (
                                  <Badge className="text-[9px] shrink-0">Seu site</Badge>
                                )}
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
                {/* Intelligence Loading */}
                {intelLoading && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Analisando backlinks, concorrentes e visibilidade em LLMs...
                      </div>
                    </CardContent>
                  </Card>
                )}

                {intelError && (
                  <Card className="border-red-500/30">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 text-red-500 text-sm">
                        <XCircle className="h-4 w-4 shrink-0" />
                        {intelError}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Backlinks & Authority */}
                {intelData?.backlinks && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Link2 className="h-5 w-5 text-primary" />
                        Backlinks & Autoridade
                      </CardTitle>
                      <CardDescription>
                        Links externos, domínios de referência e sinais de autoridade do seu site
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-lg border border-border p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{intelData.backlinks.externalLinkCount}</p>
                          <p className="text-[11px] text-muted-foreground">Links externos</p>
                        </div>
                        <div className="rounded-lg border border-border p-3 text-center">
                          <p className="text-2xl font-bold text-foreground">{intelData.backlinks.uniqueReferringDomains.length}</p>
                          <p className="text-[11px] text-muted-foreground">Domínios únicos</p>
                        </div>
                        <div className="rounded-lg border border-border p-3 text-center">
                          <p className="text-2xl font-bold text-green-600">{intelData.backlinks.dofollowCount}</p>
                          <p className="text-[11px] text-muted-foreground">Dofollow</p>
                        </div>
                        <div className="rounded-lg border border-border p-3 text-center">
                          <p className="text-2xl font-bold text-yellow-600">{intelData.backlinks.nofollowCount}</p>
                          <p className="text-[11px] text-muted-foreground">Nofollow</p>
                        </div>
                      </div>

                      {/* Authority Signals */}
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <p className="text-[11px] font-semibold text-muted-foreground">Sinais de autoridade:</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={intelData.backlinks.authoritySignals.hasHttps ? "default" : "secondary"} className="text-[10px] gap-1">
                            {intelData.backlinks.authoritySignals.hasHttps ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            HTTPS
                          </Badge>
                          <Badge variant={intelData.backlinks.authoritySignals.hasRobotsTxt ? "default" : "secondary"} className="text-[10px] gap-1">
                            {intelData.backlinks.authoritySignals.hasRobotsTxt ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            robots.txt
                          </Badge>
                          <Badge variant={intelData.backlinks.authoritySignals.hasSitemap ? "default" : "secondary"} className="text-[10px] gap-1">
                            {intelData.backlinks.authoritySignals.hasSitemap ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            Sitemap
                          </Badge>
                          <Badge variant={intelData.backlinks.authoritySignals.structuredDataCount > 0 ? "default" : "secondary"} className="text-[10px] gap-1">
                            {intelData.backlinks.authoritySignals.structuredDataCount > 0 ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            Structured Data ({intelData.backlinks.authoritySignals.structuredDataCount})
                          </Badge>
                          {intelData.backlinks.authoritySignals.hreflangCount > 0 && (
                            <Badge variant="default" className="text-[10px] gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Hreflang ({intelData.backlinks.authoritySignals.hreflangCount})
                            </Badge>
                          )}
                        </div>
                        {intelData.backlinks.authoritySignals.socialProfiles.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <span>Redes sociais:</span>
                            {intelData.backlinks.authoritySignals.socialProfiles.map((s) => (
                              <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Top external links */}
                      {intelData.backlinks.externalLinks.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground mb-2">Links externos encontrados (top {Math.min(10, intelData.backlinks.externalLinks.length)}):</p>
                          <div className="divide-y divide-border">
                            {intelData.backlinks.externalLinks.slice(0, 10).map((link, i) => (
                              <div key={i} className="flex items-center gap-2 py-1.5 text-xs">
                                <span className="text-muted-foreground w-5 text-right shrink-0">{i + 1}</span>
                                <span className="font-medium text-foreground truncate flex-1">{link.anchorText || link.domain}</span>
                                <span className="text-muted-foreground truncate max-w-[150px]">{link.domain}</span>
                                <a href={link.url} target="_blank" rel="noreferrer" className="shrink-0">
                                  <ExternalLink className="h-3 w-3 text-primary" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Competitor Monitoring */}
                {intelData?.competitors && intelData.competitors.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Radar className="h-5 w-5 text-primary" />
                        Monitoramento de Concorrentes
                      </CardTitle>
                      <CardDescription>
                        Análise comparativa dos concorrentes cadastrados no projeto
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <div className="min-w-[700px]">
                          <div className="grid grid-cols-[1.5fr_repeat(5,1fr)] gap-3 text-[11px] text-muted-foreground font-semibold pb-3 border-b border-border">
                            <span>Domínio</span>
                            <span>Palavras (H1/Total)</span>
                            <span>Links ext.</span>
                            <span>CTAs</span>
                            <span>Imagens</span>
                            <span>Sinais</span>
                          </div>
                          <div className="divide-y divide-border">
                            {intelData.competitors.map((comp) => (
                              <div key={comp.domain} className="grid grid-cols-[1.5fr_repeat(5,1fr)] gap-3 py-3 text-xs">
                                <div>
                                  <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                                    {comp.domain}
                                    <a href={comp.url} target="_blank" rel="noreferrer">
                                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                    </a>
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                                    {comp.reachable ? (comp.title || "Sem título") : "Inacessível"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{comp.h1Count} / {comp.wordCount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{comp.externalLinkCount}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{comp.ctaCount}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold">{comp.imageCount}</p>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {comp.hasHttps && <Badge variant="outline" className="text-[9px] h-4 px-1">HTTPS</Badge>}
                                  {comp.hasStructuredData && <Badge variant="outline" className="text-[9px] h-4 px-1">Schema</Badge>}
                                  {comp.hasSitemap && <Badge variant="outline" className="text-[9px] h-4 px-1">Sitemap</Badge>}
                                  {comp.socialProfiles.map((s) => (
                                    <Badge key={s} variant="outline" className="text-[9px] h-4 px-1">{s}</Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* LLM Visibility */}
                {intelData?.llmResults && intelData.llmResults.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bot className="h-5 w-5 text-primary" />
                        Visibilidade em LLMs
                      </CardTitle>
                      <CardDescription>
                        Como sua marca aparece nas respostas de IAs generativas
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {intelData.llmResults.map((llm, i) => (
                        <div key={i} className="rounded-xl border border-border p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">
                                {llm.provider === "google_gemini" ? "Gemini" : "Claude"} — {llm.model}
                              </Badge>
                            </div>
                            <Badge variant={llm.mentioned ? "default" : "secondary"} className="text-[10px] gap-1">
                              {llm.mentioned ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                              {llm.mentioned ? "Mencionado" : "Não mencionado"}
                            </Badge>
                          </div>

                          {llm.mentionContext && (
                            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                              <p className="text-xs text-foreground">...{llm.mentionContext}...</p>
                            </div>
                          )}

                          {llm.competitorsMentioned.length > 0 && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <span>Concorrentes mencionados:</span>
                              {llm.competitorsMentioned.map((c) => (
                                <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                              ))}
                            </div>
                          )}

                          <details className="text-xs">
                            <summary className="text-muted-foreground cursor-pointer hover:text-foreground">Ver resposta completa</summary>
                            <div className="mt-2 bg-muted/30 rounded-lg p-3 text-muted-foreground whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                              {llm.fullResponse}
                            </div>
                          </details>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* No AI keys message */}
                {intelData && intelData.llmResults.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Bot className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Visibilidade em LLMs</p>
                          <p className="text-xs mt-0.5">Configure suas API keys em <a href="/settings" className="text-primary hover:underline">Configurações → Integrações de IA</a> para testar como sua marca aparece em respostas do Gemini e Claude.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* No competitors message */}
                {intelData && intelData.competitors.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Radar className="h-5 w-5 shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">Monitoramento de Concorrentes</p>
                          <p className="text-xs mt-0.5">Adicione URLs de concorrentes no projeto em <a href="/projects" className="text-primary hover:underline">Projetos</a> para comparar métricas automaticamente.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Accessibility Tab */}
              <TabsContent value="accessibility">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Eye className="h-5 w-5 text-primary" />
                      Auditoria de Acessibilidade
                    </CardTitle>
                    <CardDescription>
                      Problemas de acessibilidade detectados pelo Lighthouse
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.accessibilityAudits.length === 0 ? (
                      <div className="flex items-center gap-3 py-6 justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <p className="text-sm text-muted-foreground">Nenhum problema de acessibilidade detectado</p>
                      </div>
                    ) : (
                      result.accessibilityAudits.map(a => (
                        <AuditItem key={a.id} title={a.title} score={a.score} description={a.description} />
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Oportunidades de Melhoria
                    </CardTitle>
                    <CardDescription>
                      Sugestões do Lighthouse para melhorar a performance do site
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.opportunities.length === 0 ? (
                      <div className="flex items-center gap-3 py-6 justify-center">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <p className="text-sm text-muted-foreground">Nenhuma oportunidade de melhoria identificada</p>
                      </div>
                    ) : (
                      result.opportunities.map(a => (
                        <OpportunityItem key={a.id} audit={a} />
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Performance Metrics Detail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gauge className="h-5 w-5 text-primary" />
                  Métricas de Performance
                </CardTitle>
                <CardDescription>
                  Detalhamento das métricas de performance do Lighthouse
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.performanceAudits.map(audit => {
                    const score = audit.score !== null ? Math.round(audit.score * 100) : null;
                    return (
                      <div key={audit.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-10 text-center shrink-0">
                          {score !== null ? (
                            <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground">{audit.title}</p>
                            {audit.displayValue && (
                              <Badge variant="outline" className="text-[10px]">{audit.displayValue}</Badge>
                            )}
                          </div>
                        </div>
                        {score !== null && (
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                            <div
                              className={`h-full rounded-full ${getScoreBgColor(score)}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Heuristic Data Cross-Reference */}
            {selectedProject?.heuristic_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-5 w-5 text-primary" />
                    Cruzamento com Análise Heurística
                  </CardTitle>
                  <CardDescription>
                    Dados da análise heurística do Intentia combinados com PageSpeed Insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const ha = selectedProject.heuristic_analysis;
                    const scores = ha?.scores;
                    if (!scores) return null;

                    const items = [
                      {
                        label: "SEO Heurístico vs Google",
                        heuristic: scores.seoReadiness,
                        google: result.seoScore,
                        icon: Search,
                      },
                      {
                        label: "Conversão vs Performance",
                        heuristic: scores.conversionOptimization,
                        google: result.performanceScore,
                        icon: TrendingUp,
                      },
                      {
                        label: "Conteúdo vs Acessibilidade",
                        heuristic: scores.contentQuality,
                        google: result.accessibilityScore,
                        icon: Eye,
                      },
                    ];

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {items.map(item => {
                          const Icon = item.icon;
                          const diff = item.google - item.heuristic;
                          return (
                            <div key={item.label} className="bg-muted/30 rounded-lg p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-primary" />
                                <span className="text-xs font-semibold text-foreground">{item.label}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="text-center">
                                  <p className={`text-xl font-bold ${getScoreColor(item.heuristic)}`}>{item.heuristic}</p>
                                  <p className="text-[10px] text-muted-foreground">Intentia</p>
                                </div>
                                <span className="text-xs text-muted-foreground">vs</span>
                                <div className="text-center">
                                  <p className={`text-xl font-bold ${getScoreColor(item.google)}`}>{item.google}</p>
                                  <p className="text-[10px] text-muted-foreground">Google</p>
                                </div>
                              </div>
                              <div className="text-center">
                                <Badge variant="outline" className={`text-[10px] ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                                  {diff > 0 ? `+${diff}` : diff} pontos
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Screenshot */}
            {result.screenshotUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Image className="h-5 w-5 text-primary" />
                    Screenshot da Página
                  </CardTitle>
                  <CardDescription>
                    Captura renderizada pelo Lighthouse durante a análise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <img
                      src={result.screenshotUrl}
                      alt="Screenshot da página"
                      className="max-w-sm w-full rounded-lg border border-border shadow-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
