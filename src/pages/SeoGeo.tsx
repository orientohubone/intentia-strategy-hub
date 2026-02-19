import { useState, useEffect, useMemo } from "react";
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
import { Switch } from "@/components/ui/switch";
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
  Download,
  History,
  FileJson,
  FileCode,
  Trash2,
} from "lucide-react";
import {
  fetchPageSpeedInsights,
  parsePageSpeedApiResponse,
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
import { exportAsJson, exportAsHtml, exportAsPdf, type SeoAnalysisExportData } from "@/lib/seoExport";
import { getSeoLiveMonitoringConfig, setSeoLiveMonitoringConfig } from "@/lib/seoLiveMonitoring";

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

function ensureAbsoluteUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function normalizeCompetitorUrls(value: unknown): string[] {
  if (!value) return [];

  const coerceList = (input: string): string[] =>
    input
      .split(/\r?\n|,|;/)
      .map((item) => ensureAbsoluteUrl(item))
      .filter(Boolean);

  if (Array.isArray(value)) {
    return [...new Set(value.map((item) => ensureAbsoluteUrl(String(item))).filter(Boolean))];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return [...new Set(parsed.map((item) => ensureAbsoluteUrl(String(item))).filter(Boolean))];
        }
      } catch {
        // fallback below
      }
    }
    return [...new Set(coerceList(trimmed))];
  }

  return [];
}

function getDomainFromUrl(raw: string): string {
  try {
    return new URL(ensureAbsoluteUrl(raw)).hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//, "").split("/")[0];
  }
}

function CompetitorFavicon({ url, domain }: { url: string; domain: string }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const sourceDomain = domain || getDomainFromUrl(url);
  const sources = [
    `https://www.google.com/s2/favicons?domain=${sourceDomain}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${sourceDomain}.ico`,
    `${ensureAbsoluteUrl(url).replace(/\/+$/, "")}/favicon.ico`,
  ];

  if (srcIndex >= sources.length) {
    return (
      <div className="h-6 w-6 rounded-md border border-border bg-muted flex items-center justify-center shrink-0">
        <span className="text-[10px] font-semibold text-muted-foreground">
          {sourceDomain.charAt(0).toUpperCase() || "?"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={sources[srcIndex]}
      alt={sourceDomain}
      className="h-6 w-6 rounded-md border border-border bg-muted object-contain shrink-0 p-0.5"
      onError={() => setSrcIndex((prev) => prev + 1)}
      loading="lazy"
    />
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

  // Analysis step tracking
  type AnalysisStep = "pagespeed" | "serp" | "backlinks" | "competitors" | "llm";
  const [completedSteps, setCompletedSteps] = useState<Set<AnalysisStep>>(new Set());

  // History
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [liveMonitoringEnabled, setLiveMonitoringEnabled] = useState(false);
  const [liveMonitoringIntervalSec, setLiveMonitoringIntervalSec] = useState(300);
  const [analysisCycleId, setAnalysisCycleId] = useState(0);
  const [lastAutoSavedCycleId, setLastAutoSavedCycleId] = useState(0);

  // Load history for selected project — returns items so callers can auto-restore
  const loadHistory = async (projectId: string): Promise<any[]> => {
    if (!user || !projectId) return [];
    setHistoryLoading(true);
    try {
      const { data } = await (supabase as any)
        .from("seo_analysis_history")
        .select("id, strategy, performance_score, seo_score, accessibility_score, best_practices_score, analyzed_url, analyzed_at, pagespeed_result, serp_data, intelligence_data")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("analyzed_at", { ascending: false })
        .limit(10);
      const items = data || [];
      setHistoryItems(items);
      return items;
    } catch {
      setHistoryItems([]);
      return [];
    } finally {
      setHistoryLoading(false);
    }
  };

  // Save analysis to history
  const saveToHistory = async () => {
    if (!user || !selectedProjectId || !result) return;
    const project = projects.find((p: any) => p.id === selectedProjectId);
    if (!project) return;

    try {
      await (supabase as any)
        .from("seo_analysis_history")
        .insert({
          project_id: selectedProjectId,
          user_id: user.id,
          strategy,
          performance_score: result.performanceScore,
          seo_score: result.seoScore,
          accessibility_score: result.accessibilityScore,
          best_practices_score: result.bestPracticesScore,
          pagespeed_result: result,
          serp_data: serpData,
          intelligence_data: intelData,
          analyzed_url: project.url,
        });
      // Reload history
      loadHistory(selectedProjectId);
    } catch (err: any) {
      console.error("Failed to save analysis:", err);
    }
  };

  // Restore from history
  const parseStoredPageSpeed = (raw: any, strategyFromItem?: "mobile" | "desktop"): PageSpeedResult | null => {
    if (!raw) return null;
    if (typeof raw.performanceScore === "number" && typeof raw.seoScore === "number") {
      return raw as PageSpeedResult;
    }
    if (raw?.lighthouseResult) {
      try {
        return parsePageSpeedApiResponse(raw, strategyFromItem || "mobile");
      } catch {
        return null;
      }
    }
    return null;
  };

  const restoreFromHistory = (item: any) => {
    const parsed = parseStoredPageSpeed(item.pagespeed_result, item.strategy);
    if (parsed) setResult(parsed);
    if (item.serp_data) setSerpData(item.serp_data);
    if (item.intelligence_data) setIntelData(item.intelligence_data);
    setStrategy(item.strategy || "mobile");
    setShowHistory(false);
  };

  // Delete history item
  const deleteHistoryItem = async (id: string) => {
    if (!user) return;
    await (supabase as any)
      .from("seo_analysis_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    setHistoryItems(prev => prev.filter(h => h.id !== id));
  };

  // Build export data
  const getExportData = (): SeoAnalysisExportData | null => {
    const project = projects.find((p: any) => p.id === selectedProjectId);
    if (!project || !result) return null;
    return {
      projectName: project.name,
      projectUrl: project.url,
      strategy,
      analyzedAt: result.fetchTime || new Date().toISOString(),
      pagespeed: result,
      serp: serpData,
      intelligence: intelData,
    };
  };

  // Load projects
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("projects")
        .select("id, name, url, niche, score, status, heuristic_analysis, competitor_urls")
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

  // Load history when project changes — auto-restore latest saved analysis
  useEffect(() => {
    if (!selectedProjectId) return;
    // Clear previous results when switching projects
    setResult(null);
    setSerpData(null);
    setIntelData(null);
    setError(null);
    setSerpError(null);
    setIntelError(null);
    setCompletedSteps(new Set());
    setShowHistory(false);

    (async () => {
      const items = await loadHistory(selectedProjectId);
      // Auto-restore the most recent analysis if available
      if (items.length > 0) {
        const latest = items[0];
        const parsed = parseStoredPageSpeed(latest.pagespeed_result, latest.strategy);
        if (parsed) setResult(parsed);
        if (latest.serp_data) setSerpData(latest.serp_data);
        if (latest.intelligence_data) setIntelData(latest.intelligence_data);
        if (latest.strategy) setStrategy(latest.strategy);
      }
    })();
  }, [selectedProjectId]);

  const selectedProject = projects.find((p: any) => p.id === selectedProjectId);
  const competitorUrlsForProject = useMemo(
    () => normalizeCompetitorUrls(selectedProject?.competitor_urls),
    [selectedProject?.competitor_urls]
  );

  useEffect(() => {
    if (!user?.id || !selectedProjectId) return;
    void (async () => {
      const config = await getSeoLiveMonitoringConfig(user.id, selectedProjectId);
      setLiveMonitoringEnabled(config.enabled);
      setLiveMonitoringIntervalSec(config.intervalSec);
    })();
  }, [user?.id, selectedProjectId]);

  useEffect(() => {
    if (!liveMonitoringEnabled || analysisCycleId === 0) return;
    if (analysisCycleId === lastAutoSavedCycleId) return;
    if (loading || serpLoading || intelLoading) return;
    if (!result) return;

    void (async () => {
      await saveToHistory();
      setLastAutoSavedCycleId(analysisCycleId);
    })();
  }, [liveMonitoringEnabled, analysisCycleId, lastAutoSavedCycleId, loading, serpLoading, intelLoading, result, serpData, intelData]);

  useEffect(() => {
    if (!user?.id || !selectedProjectId || !liveMonitoringEnabled) return;
    void setSeoLiveMonitoringConfig(user.id, selectedProjectId, {
      enabled: liveMonitoringEnabled,
      intervalSec: liveMonitoringIntervalSec,
      strategy,
    });
  }, [user?.id, selectedProjectId, liveMonitoringEnabled, liveMonitoringIntervalSec, strategy]);

  const handleAnalyze = async () => {
    const project = projects.find((p: any) => p.id === selectedProjectId);
    if (!project?.url) return;
    setAnalysisCycleId((prev) => prev + 1);

    setLoading(true);
    setError(null);
    setResult(null);
    setSerpData(null);
    setIntelData(null);
    setCompletedSteps(new Set());

    // Run PageSpeed + SERP ranking + Intelligence in parallel
    handleSerpFetch();
    handleIntelFetch();

    try {
      const data = await fetchPageSpeedInsights(project.url, strategy);
      setResult(data);
      setCompletedSteps(prev => new Set([...prev, "pagespeed"]));
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
      const competitorUrls = normalizeCompetitorUrls(project.competitor_urls);

      // Get user AI keys — use correct column names: api_key_encrypted, is_active
      let aiKeys: { provider: string; apiKey: string; model: string }[] = [];
      if (user) {
        const { data: keys, error: keysError } = await supabase
          .from("user_api_keys")
          .select("provider, api_key_encrypted, preferred_model, is_active")
          .eq("user_id", user.id)
          .eq("is_active", true);
        console.log("[SeoGeo] user_api_keys query result:", { keys: keys?.map((k: any) => ({ provider: k.provider, hasKey: !!k.api_key_encrypted, keyLen: k.api_key_encrypted?.length, model: k.preferred_model, is_active: k.is_active })), error: keysError });
        if (keys && keys.length > 0) {
          aiKeys = keys
            .filter((k: any) => k.api_key_encrypted && k.api_key_encrypted.trim())
            .map((k: any) => ({
              provider: k.provider,
              apiKey: k.api_key_encrypted,
              model: k.preferred_model || (k.provider === "google_gemini" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514"),
            }));
        }
        console.log("[SeoGeo] aiKeys to send:", aiKeys.map(k => ({ provider: k.provider, model: k.model, keyLen: k.apiKey?.length })));
      }

      // Use niche or fallback to project name for LLM queries
      const niche = project.niche?.trim() || project.name;

      const data = await fetchSeoIntelligence({
        url: project.url,
        competitorUrls,
        brandName: project.name,
        niche,
        aiKeys,
      });

      // Track completed steps based on returned data
      setCompletedSteps(prev => {
        const next = new Set(prev);
        if (data.backlinks) next.add("backlinks");
        if (data.competitors.length > 0) next.add("competitors");
        if (data.llmResults.length > 0) next.add("llm");
        return next;
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

      // Custom terms first (supports comma-separated)
      if (serpCustomTerm.trim()) {
        serpCustomTerm.split(",").forEach(t => {
          const trimmed = t.trim();
          if (trimmed) terms.push(trimmed);
        });
      }

      // Project name + niche
      const niche = project.niche?.trim() || "";
      if (niche) {
        terms.push(`${project.name} ${niche}`);
      }

      // Project name alone
      terms.push(project.name);

      // Deduplicate, max 10
      const uniqueTerms = [...new Set(terms)].slice(0, 10);

      const data = await fetchSerpRanking(uniqueTerms, targetDomain);
      setSerpData(data);
      setCompletedSteps(prev => new Set([...prev, "serp"]));
    } catch (err: any) {
      setSerpError(err.message || "Erro ao buscar ranking Google");
    } finally {
      setSerpLoading(false);
    }
  };

  const handleToggleLiveMonitoring = (enabled: boolean) => {
    setLiveMonitoringEnabled(enabled);
    void setSeoLiveMonitoringConfig(user?.id, selectedProjectId, {
      enabled,
      intervalSec: liveMonitoringIntervalSec,
      strategy,
    });
  };

  const handleChangeLiveInterval = (value: string) => {
    const intervalSec = Number(value);
    if (!Number.isFinite(intervalSec) || intervalSec <= 0) return;
    setLiveMonitoringIntervalSec(intervalSec);
    void setSeoLiveMonitoringConfig(user?.id, selectedProjectId, {
      enabled: liveMonitoringEnabled,
      intervalSec,
      strategy,
    });
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
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="flex-1 min-w-0 lg:min-w-[320px]">
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
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate max-w-[240px] pb-2.5 hidden xl:flex">
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

              <div className="min-w-[250px] lg:min-w-[280px]">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Monitoramento Live</label>
                <div className="flex items-center gap-2">
                  <div className="h-8 px-3 rounded-md border border-border bg-background flex items-center gap-2">
                    <Switch
                      checked={liveMonitoringEnabled}
                      onCheckedChange={handleToggleLiveMonitoring}
                      disabled={!selectedProjectId}
                    />
                    <span className="text-xs text-muted-foreground">
                      {liveMonitoringEnabled ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                  <Select
                    value={String(liveMonitoringIntervalSec)}
                    onValueChange={handleChangeLiveInterval}
                    disabled={!selectedProjectId}
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue placeholder="Intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="120">2 min</SelectItem>
                      <SelectItem value="300">5 min</SelectItem>
                      <SelectItem value="600">10 min</SelectItem>
                      <SelectItem value="900">15 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!selectedProjectId || loading}
                className="gap-2 shrink-0"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Analisando..." : "Analisar SEO & Performance"}
              </Button>
              <Button
                variant="outline"
                className="gap-2 shrink-0"
                disabled={!selectedProjectId}
                onClick={() => navigate(`/seo-monitoring?project=${selectedProjectId}`)}
              >
                <Activity className="h-4 w-4" />
                Abrir Monitoramento
              </Button>
            </div>
            {selectedProjectId && liveMonitoringEnabled && (
              <p className="text-xs text-muted-foreground mt-3">
                Monitoramento ativo: cada ciclo de análise salva automaticamente no histórico e alimenta a tela de monitoramento.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Loading State — Step-by-step progress */}
        {(loading || (intelLoading && !result)) && (
          <Card>
            <CardContent className="pt-6">
              <div className="py-8 space-y-6">
                <div className="text-center space-y-1">
                  <p className="text-base font-semibold text-foreground">Construindo análise completa...</p>
                  <p className="text-xs text-muted-foreground">Executando múltiplas análises em paralelo</p>
                </div>
                <div className="max-w-md mx-auto space-y-3">
                  {[
                    { key: "pagespeed" as AnalysisStep, label: "Core Web Vitals & Performance", icon: Gauge, loading: loading && !completedSteps.has("pagespeed") },
                    { key: "serp" as AnalysisStep, label: "Ranking no Google (SERP)", icon: Search, loading: serpLoading && !completedSteps.has("serp") },
                    { key: "backlinks" as AnalysisStep, label: "Backlinks & Autoridade", icon: Link2, loading: intelLoading && !completedSteps.has("backlinks") },
                    { key: "competitors" as AnalysisStep, label: `Monitoramento de Concorrentes${competitorUrlsForProject.length ? ` (${competitorUrlsForProject.length})` : ""}`, icon: Radar, loading: intelLoading && !completedSteps.has("competitors") },
                    { key: "llm" as AnalysisStep, label: "Visibilidade em LLMs (IA)", icon: Bot, loading: intelLoading && !completedSteps.has("llm") },
                  ].map((step) => {
                    const done = completedSteps.has(step.key);
                    const active = step.loading;
                    return (
                      <div key={step.key} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all ${done ? "border-green-500/30 bg-green-500/5" : active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30 opacity-50"}`}>
                        <div className="shrink-0">
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : active ? (
                            <RefreshCw className="h-5 w-5 text-primary animate-spin" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${done ? "text-green-600 dark:text-green-400" : active ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                          </p>
                        </div>
                        {done && <Badge variant="outline" className="text-[9px] text-green-600 border-green-500/30 shrink-0">OK</Badge>}
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[11px] text-muted-foreground">Isso pode levar de 15 a 60 segundos dependendo do site e das integrações</p>
              </div>
            </CardContent>
          </Card>
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
          <div className="space-y-4">
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

            {/* History in empty state */}
            {selectedProjectId && historyItems.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-5 w-5 text-primary" />
                    Análises Anteriores
                  </CardTitle>
                  <CardDescription>
                    Restaure uma análise anterior para visualizar sem precisar rodar novamente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {historyItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] gap-1">
                              {item.strategy === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                              {item.strategy === "mobile" ? "Mobile" : "Desktop"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.analyzed_at).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            {[
                              { label: "Perf", score: item.performance_score },
                              { label: "SEO", score: item.seo_score },
                              { label: "A11y", score: item.accessibility_score },
                              { label: "BP", score: item.best_practices_score },
                            ].map(s => s.score != null && (
                              <span key={s.label} className={`text-xs font-semibold ${getScoreColor(s.score)}`}>
                                {s.label}: {s.score}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => restoreFromHistory(item)}>
                            <RefreshCw className="h-3 w-3" />
                            Restaurar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={() => deleteHistoryItem(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Action Bar: Save / Export / History */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={saveToHistory}>
                  <Download className="h-3.5 w-3.5" />
                  Salvar análise
                </Button>
                {historyItems.length > 0 && (
                  <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => setShowHistory(!showHistory)}>
                    <History className="h-3.5 w-3.5" />
                    Histórico ({historyItems.length})
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">Exportar:</span>
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { const d = getExportData(); d && exportAsPdf(d); }}>
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { const d = getExportData(); d && exportAsHtml(d); }}>
                  <FileCode className="h-3.5 w-3.5" />
                  HTML
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => { const d = getExportData(); d && exportAsJson(d); }}>
                  <FileJson className="h-3.5 w-3.5" />
                  JSON
                </Button>
              </div>
            </div>

            {/* History Panel (collapsible) */}
            {showHistory && historyItems.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <History className="h-5 w-5 text-primary" />
                    Análises Anteriores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {historyItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] gap-1">
                              {item.strategy === "mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                              {item.strategy === "mobile" ? "Mobile" : "Desktop"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.analyzed_at).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            {[
                              { label: "Perf", score: item.performance_score },
                              { label: "SEO", score: item.seo_score },
                              { label: "A11y", score: item.accessibility_score },
                              { label: "BP", score: item.best_practices_score },
                            ].map(s => s.score != null && (
                              <span key={s.label} className={`text-xs font-semibold ${getScoreColor(s.score)}`}>
                                {s.label}: {s.score}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => restoreFromHistory(item)}>
                            <RefreshCw className="h-3 w-3" />
                            Restaurar
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={() => deleteHistoryItem(item.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                      Até 10 termos (separados por vírgula) + nome e nicho do projeto. Resultados via Google Custom Search API.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Termos separados por vírgula (ex: erp saas, sistema gestão)..."
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
                        Consultando Google Custom Search...
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
                              <div key={`${item.position}-${item.domain}`} className={`flex items-start gap-3 py-3 ${item.isTarget ? "bg-primary/5 -mx-3 px-3 rounded-lg" : ""}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${item.isTarget ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                                  {item.position}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
                                    {item.isTarget && (
                                      <Badge className="text-[9px] shrink-0">Seu site</Badge>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-primary/70 truncate">{item.domain}</p>
                                  {item.snippet && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.snippet}</p>
                                  )}
                                </div>
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1 shrink-0 mt-1"
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
                                  <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <CompetitorFavicon url={comp.url} domain={comp.domain} />
                                    <span className="truncate">{comp.domain}</span>
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

                {/* No AI keys / LLM errors message */}
                {intelData && intelData.llmResults.length === 0 && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 text-sm text-muted-foreground">
                        <Bot className="h-5 w-5 shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-medium text-foreground">Visibilidade em LLMs</p>
                          {intelData.llmErrors && intelData.llmErrors.length > 0 ? (
                            <div className="space-y-1.5">
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Não foi possível consultar os LLMs:</p>
                              {intelData.llmErrors.map((err, i) => (
                                <p key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                                  {err}
                                </p>
                              ))}
                              <p className="text-xs mt-2">Verifique suas API keys em <a href="/settings" className="text-primary hover:underline">Configurações → Integrações de IA</a>.</p>
                            </div>
                          ) : (
                            <p className="text-xs">Configure suas API keys em <a href="/settings" className="text-primary hover:underline">Configurações → Integrações de IA</a> para testar como sua marca aparece em respostas do Gemini e Claude.</p>
                          )}
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
                          {competitorUrlsForProject.length === 0 ? (
                            <p className="text-xs mt-0.5">Adicione URLs de concorrentes no projeto em <a href="/projects" className="text-primary hover:underline">Projetos</a> para comparar métricas automaticamente.</p>
                          ) : (
                            <p className="text-xs mt-0.5">
                              Há concorrentes cadastrados, mas nenhum retornou dados válidos nesta execução.
                              Verifique se as URLs estão corretas, acessíveis publicamente e tente novamente.
                            </p>
                          )}
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
                      Verificações de acessibilidade WCAG baseadas no Lighthouse — Score: {result.accessibilityScore}/100
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.accessibilityAudits.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Excelente! Nenhum problema de acessibilidade detectado</p>
                          <p className="text-xs text-muted-foreground mt-1">Seu site atende aos padrões WCAG verificados pelo Lighthouse</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary */}
                        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                          <ScoreGauge score={result.accessibilityScore} size="sm" label="Score" />
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p><span className="font-semibold text-red-500">{result.accessibilityAudits.filter(a => a.score !== null && a.score < 0.5).length}</span> problemas críticos</p>
                            <p><span className="font-semibold text-yellow-500">{result.accessibilityAudits.filter(a => a.score !== null && a.score >= 0.5 && a.score < 0.9).length}</span> avisos</p>
                            <p><span className="font-semibold text-foreground">{result.accessibilityAudits.length}</span> itens no total</p>
                          </div>
                        </div>

                        {/* Critical issues */}
                        {result.accessibilityAudits.filter(a => a.score !== null && a.score < 0.5).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" />
                              Problemas Críticos ({result.accessibilityAudits.filter(a => a.score !== null && a.score < 0.5).length})
                            </p>
                            {result.accessibilityAudits
                              .filter(a => a.score !== null && a.score < 0.5)
                              .map(a => (
                                <AuditItem key={a.id} title={a.title} score={a.score} description={a.description} />
                              ))}
                          </div>
                        )}

                        {/* Warnings */}
                        {result.accessibilityAudits.filter(a => a.score !== null && a.score >= 0.5 && a.score < 0.9).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-yellow-600 mb-2 flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Avisos ({result.accessibilityAudits.filter(a => a.score !== null && a.score >= 0.5 && a.score < 0.9).length})
                            </p>
                            {result.accessibilityAudits
                              .filter(a => a.score !== null && a.score >= 0.5 && a.score < 0.9)
                              .map(a => (
                                <AuditItem key={a.id} title={a.title} score={a.score} description={a.description} />
                              ))}
                          </div>
                        )}

                        {/* Remaining items */}
                        {result.accessibilityAudits.filter(a => a.score !== null && a.score >= 0.9).length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                              <Info className="h-3.5 w-3.5" />
                              Outros ({result.accessibilityAudits.filter(a => a.score !== null && a.score >= 0.9).length})
                            </p>
                            {result.accessibilityAudits
                              .filter(a => a.score !== null && a.score >= 0.9)
                              .map(a => (
                                <AuditItem key={a.id} title={a.title} score={a.score} description={a.description} />
                              ))}
                          </div>
                        )}
                      </div>
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
                      Sugestões do Lighthouse para melhorar a performance — ordenadas por impacto estimado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.opportunities.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-6">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Nenhuma oportunidade de melhoria identificada</p>
                          <p className="text-xs text-muted-foreground mt-1">Seu site já está otimizado segundo o Lighthouse</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Summary bar */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">{result.opportunities.length} oportunidades</span> identificadas.
                            {result.opportunities[0]?.details?.overallSavingsMs && (
                              <> A maior pode economizar até <span className="font-semibold text-foreground">{Math.round(result.opportunities[0].details.overallSavingsMs)}ms</span> no carregamento.</>
                            )}
                          </p>
                        </div>

                        {/* High impact */}
                        {(() => {
                          const high = result.opportunities.filter(a => (a.details?.overallSavingsMs || 0) >= 500);
                          const medium = result.opportunities.filter(a => {
                            const ms = a.details?.overallSavingsMs || 0;
                            return ms >= 100 && ms < 500;
                          });
                          const low = result.opportunities.filter(a => (a.details?.overallSavingsMs || 0) < 100);

                          return (
                            <>
                              {high.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-red-500 mb-2 flex items-center gap-1">
                                    <XCircle className="h-3.5 w-3.5" />
                                    Alto Impacto ({high.length})
                                  </p>
                                  {high.map(a => <OpportunityItem key={a.id} audit={a} />)}
                                </div>
                              )}
                              {medium.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-yellow-600 mb-2 flex items-center gap-1">
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    Médio Impacto ({medium.length})
                                  </p>
                                  {medium.map(a => <OpportunityItem key={a.id} audit={a} />)}
                                </div>
                              )}
                              {low.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                                    <Info className="h-3.5 w-3.5" />
                                    Baixo Impacto ({low.length})
                                  </p>
                                  {low.map(a => <OpportunityItem key={a.id} audit={a} />)}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
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
