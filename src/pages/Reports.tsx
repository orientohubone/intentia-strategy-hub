import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Download,
  Star,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
  Lightbulb,
  Users,
  Megaphone,
  Heart,
  Eye,
  FolderOpen,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Tipos para os relatórios

interface ProjectReports {
  projectName: string;
  projectId: string;
  reports: Report[];
}


type ReportsCacheState = {
  reports: Report[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const reportsCache = new Map<string, ReportsCacheState>();
const REPORT_TYPES = [
  { value: "all", label: "Todos os Tipos" },
  { value: "project_analysis", label: "Análise de Projeto" },
  { value: "campaign_analysis", label: "Performance" },
  { value: "benchmark", label: "Benchmark" },
  { value: "consolidated", label: "Consolidado" },
];

const CATEGORIES = [
  { value: "all", label: "Todas as Categorias" },
  { value: "Análise de Projeto", label: "Análise de Projeto" },
  { value: "Performance", label: "Performance" },
  { value: "Benchmark", label: "Benchmark" },
  { value: "Consolidado", label: "Consolidado" },
];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Mais Recentes" },
  { value: "date_asc", label: "Mais Antigos" },
  { value: "name_asc", label: "Nome (A-Z)" },
  { value: "name_desc", label: "Nome (Z-A)" },
  { value: "score_desc", label: "Maior Score" },
  { value: "score_asc", label: "Menor Score" },
];

const TYPE_CATEGORY_FALLBACK: Record<string, string> = {
  project_analysis: "Análise de Projeto",
  campaign_analysis: "Performance",
  benchmark: "Benchmark Competitivo",
  consolidated: "Consolidado",
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "project_analysis":
      return <Target className="h-4 w-4" />;
    case "campaign_analysis":
      return <BarChart3 className="h-4 w-4" />;
    case "benchmark":
      return <TrendingUp className="h-4 w-4" />;
    case "consolidated":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getTypeContainerClass = (type: string) => {
  switch (type) {
    case "project_analysis":
      return "bg-primary/10 text-primary border-primary/20";
    case "campaign_analysis":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "benchmark":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "consolidated":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

const toText = (value: unknown, fallback = "N/A") => {
  if (value === null || value === undefined) return fallback;
  const toDisplayString = (input: unknown): string => {
    if (input === null || input === undefined) return "";
    if (typeof input === "string" || typeof input === "number" || typeof input === "boolean") {
      return String(input).trim();
    }
    if (Array.isArray(input)) {
      return input.map((item) => toDisplayString(item)).filter(Boolean).join(" | ");
    }
    if (typeof input === "object") {
      const record = input as Record<string, unknown>;
      const preferredKeys = [
        "title",
        "name",
        "label",
        "summary",
        "description",
        "text",
        "action",
        "recommendation",
        "value",
      ];

      for (const key of preferredKeys) {
        const candidate = record[key];
        const parsed = toDisplayString(candidate);
        if (parsed) return parsed;
      }

      try {
        return JSON.stringify(record);
      } catch {
        return "";
      }
    }
    return "";
  };

  const text = toDisplayString(value);
  return text.length > 0 ? text : fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item, "")).filter(Boolean);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidateKeys = ["recommendations", "recomendacoes", "actions", "next_steps", "items", "list", "points"];
    for (const key of candidateKeys) {
      if (record[key] !== undefined) {
        const nested = toStringArray(record[key]);
        if (nested.length > 0) return nested;
      }
    }
    return Object.values(record).map((item) => toText(item, "")).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map((item) => toText(item, "")).filter(Boolean);
      } catch {
        // fallback below
      }
    }
    return trimmed
      .split(/\r?\n|;/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const sanitizeFilename = (name: string) =>
  name
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "relatorio";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const parseJsonObject = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return null;
    }
  }
  return null;
};

const normalizeAiAnalysis = (metadata: Record<string, unknown>) => {
  const directCandidates = [
    metadata.ai_analysis,
    metadata.aiAnalysis,
    metadata.ai_enrichment,
    metadata.aiEnrichment,
    metadata.ia_analysis,
    metadata.iaAnalysis,
    metadata.ia_enriquecimento,
    metadata.ai,
  ];

  for (const candidate of directCandidates) {
    const parsed = parseJsonObject(candidate);
    if (parsed) return parsed;
  }

  const nestedCandidates = [
    parseJsonObject(metadata.analysis)?.ai,
    parseJsonObject(metadata.enrichment)?.ai,
    parseJsonObject(metadata.metadata)?.ai_analysis,
  ];

  for (const candidate of nestedCandidates) {
    const parsed = parseJsonObject(candidate);
    if (parsed) return parsed;
  }

  return {} as Record<string, unknown>;
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Análise de Projeto":
      return <Target className="h-3.5 w-3.5" />;
    case "Insight Estratégico":
      return <Lightbulb className="h-3.5 w-3.5" />;
    case "Performance":
      return <BarChart3 className="h-3.5 w-3.5" />;
    case "Benchmark Competitivo":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "Consolidado":
      return <FileText className="h-3.5 w-3.5" />;
    default:
      return <FolderOpen className="h-3.5 w-3.5" />;
  }
};

const getCategoryTone = (category: string) => {
  switch (category) {
    case "Análise de Projeto":
      return "bg-primary/10 text-primary border-primary/20";
    case "Insight Estratégico":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "Performance":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "Benchmark Competitivo":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Consolidado":
      return "bg-violet-500/10 text-violet-600 border-violet-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export default function Reports() {
  const { user } = useAuth();
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  // Carregar relatórios do Supabase
  useEffect(() => {
    if (!userId) {
      setReports([]);
      setLoading(false);
      return;
    }

    const cached = reportsCache.get(userId);
    if (cached) {
      setReports(cached.reports);
      setLoading(false);
      if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
        void loadReports({ silent: true });
      }
      return;
    }

    void loadReports();
  }, [userId]);

  const loadReports = async (options?: { silent?: boolean }) => {
    if (!userId) return [] as Report[];
    const cached = reportsCache.get(userId);

    try {
      if (!options?.silent && !cached) setLoading(true);
      
      // Buscar projetos com dados completos das análises
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select(`
          id,
          name,
          url,
          niche,
          score,
          heuristic_analysis,
          ai_analysis,
          insights (
            id,
            title,
            type,
            description,
            action,
            created_at,
            metadata
          ),
          project_channel_scores (
            id,
            channel,
            score,
            created_at,
            metadata
          ),
          benchmarks (
            id,
            competitor_name,
            competitor_url,
            competitor_niche,
            overall_score,
            value_proposition_score,
            offer_clarity_score,
            user_journey_score,
            strengths,
            weaknesses,
            opportunities,
            threats,
            strategic_insights,
            recommendations,
            created_at,
            metadata
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }) as any;

      if (projectsError) throw projectsError;

      // Buscar relatórios já salvos na tabela reports (fonte oficial quando disponível)
      let persistedReports: any[] = [];
      const { data: reportsFromDb, error: reportsError } = await supabase
        .from("reports")
        .select(`
          id,
          project_id,
          title,
          type,
          category,
          format,
          score,
          is_favorite,
          metadata,
          campaign_name,
          channel,
          created_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false }) as any;

      if (reportsError) {
        // Mantém compatibilidade com ambientes onde a tabela ainda não foi migrada.
        console.warn("Tabela reports indisponível, usando fallback dinâmico:", reportsError.message);
      } else {
        persistedReports = reportsFromDb || [];
      }

      // Transformar dados em relatórios
      const transformedReports: Report[] = [];

      projects?.forEach((project: any) => {
        const insights = project.insights || [];
        const channelScores = project.project_channel_scores || [];
        const benchmarks = project.benchmarks || [];

        const insightEvents = insights.map((insight: any) => ({
          id: insight.id,
          title: insight.title,
          type: insight.type,
          description: insight.description,
          action: insight.action,
          score: insight.metadata?.score ?? null,
          created_at: insight.created_at,
          metadata: insight.metadata || {},
        }));

        const channelEvents = channelScores.map((channelScore: any) => ({
          id: channelScore.id,
          channel: channelScore.channel,
          score: channelScore.score,
          created_at: channelScore.created_at,
          metadata: channelScore.metadata || {},
        }));

        const benchmarkEvents = benchmarks.map((benchmark: any) => ({
          id: benchmark.id,
          competitor_name: benchmark.competitor_name,
          competitor_url: benchmark.competitor_url,
          competitor_niche: benchmark.competitor_niche,
          overall_score: benchmark.overall_score,
          value_proposition_score: benchmark.value_proposition_score,
          offer_clarity_score: benchmark.offer_clarity_score,
          user_journey_score: benchmark.user_journey_score,
          strengths: benchmark.strengths,
          weaknesses: benchmark.weaknesses,
          opportunities: benchmark.opportunities,
          threats: benchmark.threats,
          strategic_insights: benchmark.strategic_insights,
          recommendations: benchmark.recommendations,
          created_at: benchmark.created_at,
          metadata: benchmark.metadata || {},
        }));

        const timeline = [
          ...insightEvents.map((event: any) => ({
            source: "insight",
            title: event.title || "Insight",
            date: event.created_at,
            details: event.description || event.action || "",
          })),
          ...channelEvents.map((event: any) => ({
            source: "performance",
            title: `Performance ${String(event.channel || "").toUpperCase()}`,
            date: event.created_at,
            details: `Score ${event.score ?? "-"}/100`,
          })),
          ...benchmarkEvents.map((event: any) => ({
            source: "benchmark",
            title: `Benchmark vs ${event.competitor_name || "Concorrente"}`,
            date: event.created_at,
            details: `Score ${event.overall_score ?? "-"}/100`,
          })),
        ]
          .filter((event) => event.date)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // 1. Relatório de Análise Heurística + IA (se existir análise do projeto)
        if (
          project.heuristic_analysis ||
          project.ai_analysis ||
          insightEvents.length > 0 ||
          channelEvents.length > 0 ||
          benchmarkEvents.length > 0
        ) {
          transformedReports.push({
            id: `analysis-${project.id}`,
            title: `Análise Completa - ${project.name}`,
            type: "project_analysis",
            category: "Análise de Projeto",
            projectName: project.name,
            projectId: project.id,
            date: project.created_at || new Date().toISOString(),
            isFavorite: false,
            format: "pdf",
            score: project.score || 75,
            metadata: {
              url: project.url,
              niche: project.niche,
              heuristic_analysis: project.heuristic_analysis,
              ai_analysis: project.ai_analysis,
              project_score: project.score,
              insight_events: insightEvents,
              channel_events: channelEvents,
              benchmark_events: benchmarkEvents,
              event_timeline: timeline,
            },
          });
        }

        // 2. Relatórios de Insights (se existirem insights individuais)
        insights.forEach((insight: any) => {
          transformedReports.push({
            id: `insight-${insight.id}`,
            title: `Insight - ${insight.title}`,
            type: "project_analysis",
            category: "Insight Estratégico",
            projectName: project.name,
            projectId: project.id,
            date: insight.created_at,
            isFavorite: false,
            format: "pdf",
            score: insight.metadata?.score || 75,
            metadata: {
              type: insight.type,
              description: insight.description,
              action: insight.action,
              ...insight.metadata
            },
          });
        });

        // 3. Relatórios de Performance por Canal
        channelScores.forEach((channelScore: any) => {
          transformedReports.push({
            id: `channel-${channelScore.id}`,
            title: `Performance - ${channelScore.channel.charAt(0).toUpperCase() + channelScore.channel.slice(1)}`,
            type: "campaign_analysis",
            category: "Performance",
            projectName: project.name,
            projectId: project.id,
            campaignName: `${channelScore.channel.charAt(0).toUpperCase() + channelScore.channel.slice(1)}`,
            channel: channelScore.channel.charAt(0).toUpperCase() + channelScore.channel.slice(1),
            date: channelScore.created_at,
            isFavorite: false,
            format: "pdf",
            score: channelScore.score,
            metadata: channelScore.metadata || {},
          });
        });

        // 4. Relatórios de Benchmark
        benchmarks.forEach((benchmark: any) => {
          transformedReports.push({
            id: `benchmark-${benchmark.id}`,
            title: `Benchmark - vs ${benchmark.competitor_name}`,
            type: "benchmark",
            category: "Benchmark Competitivo",
            projectName: project.name,
            projectId: project.id,
            date: benchmark.created_at,
            isFavorite: false,
            format: "pdf",
            score: benchmark.overall_score || 80,
            metadata: {
              competitor_name: benchmark.competitor_name,
              competitor_url: benchmark.competitor_url,
              competitor_niche: benchmark.competitor_niche,
              overall_score: benchmark.overall_score,
              value_proposition_score: benchmark.value_proposition_score,
              offer_clarity_score: benchmark.offer_clarity_score,
              user_journey_score: benchmark.user_journey_score,
              strengths: benchmark.strengths,
              weaknesses: benchmark.weaknesses,
              opportunities: benchmark.opportunities,
              threats: benchmark.threats,
              strategic_insights: benchmark.strategic_insights,
              recommendations: benchmark.recommendations,
            },
          });
        });
      });

      // 5. Relatório Consolidado (se houver análises)
      if (transformedReports.length > 0) {
        transformedReports.push({
          id: "consolidated",
          title: `Relatório Consolidado - ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
          type: "consolidated",
          category: "Consolidado",
          projectName: "Todos os Projetos",
          projectId: "all",
          date: new Date().toISOString(),
          isFavorite: false,
          format: "pdf",
          score: Math.round(transformedReports.reduce((acc, r) => acc + r.score, 0) / transformedReports.length),
          metadata: {
            total_reports: transformedReports.length,
            projects_analyzed: [...new Set(transformedReports.map(r => r.projectId))].length,
            analysis_types: [...new Set(transformedReports.map(r => r.type))],
          },
        });
      }

      const projectNameById = new Map(
        (projects || []).map((project: any) => [project.id, project.name])
      );

      const normalizedPersistedReports: Report[] = persistedReports.map((report: any) => {
        const projectId = report.project_id || report.metadata?.project_id || "unknown";
        const projectName =
          projectNameById.get(projectId) ||
          report.metadata?.project_name ||
          report.metadata?.projectName ||
          "Projeto";

        return {
          id: `db-${report.id}`,
          title: report.title || "Relatório",
          type: report.type || "consolidated",
          category: report.category || TYPE_CATEGORY_FALLBACK[report.type] || "Consolidado",
          projectName,
          projectId,
          date: report.created_at || new Date().toISOString(),
          isFavorite: Boolean(report.is_favorite),
          format: report.format || "pdf",
          score: toNumber(report.score) ?? 0,
          metadata: report.metadata || {},
          campaignName: report.campaign_name || undefined,
          channel: report.channel || undefined,
        };
      });

      const persistedSignature = new Set(
        normalizedPersistedReports.map((report) => {
          const title = report.title.trim().toLowerCase();
          return `${report.type}|${report.projectId}|${title}`;
        })
      );

      const generatedFallback = transformedReports.filter((report) => {
        const title = report.title.trim().toLowerCase();
        const signature = `${report.type}|${report.projectId}|${title}`;
        return !persistedSignature.has(signature);
      });

      const finalReports =
        normalizedPersistedReports.length > 0
          ? [...normalizedPersistedReports, ...generatedFallback]
          : transformedReports;

      setReports(finalReports);
      reportsCache.set(userId, { reports: finalReports, fetchedAt: Date.now() });
      console.log("Relatórios carregados:", finalReports.length);
      return finalReports;
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar relatórios");
      return [] as Report[];
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  // Agrupar relatórios por projeto
  const reportsByProject = reports.reduce((acc, report) => {
    const projectId = report.projectId || "unknown";
    if (!acc[projectId]) {
      acc[projectId] = {
        projectName: report.projectName || "Projeto Desconhecido",
        projectId,
        reports: []
      };
    }
    acc[projectId].reports.push(report);
    return acc;
  }, {} as Record<string, ProjectReports>);

  // Filtrar relatórios
  const filteredProjects = Object.entries(reportsByProject)
    .map(([projectId, projectData]) => {
      const filteredReports = projectData.reports
        .filter((report) => {
          const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.campaignName?.toLowerCase().includes(searchTerm.toLowerCase());
          
          const matchesType = selectedType === "all" || report.type === selectedType;
          const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
          const matchesFavorites = !showFavoritesOnly || report.isFavorite;

          return matchesSearch && matchesType && matchesCategory && matchesFavorites;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "date_desc":
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            case "date_asc":
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "name_asc":
              return a.title.localeCompare(b.title);
            case "name_desc":
              return b.title.localeCompare(a.title);
            case "score_desc":
              return b.score - a.score;
            case "score_asc":
              return a.score - b.score;
            default:
              return 0;
          }
        });

      return {
        ...projectData,
        reports: filteredReports,
      };
    })
    .filter((project) => project.reports.length > 0);

  const buildConsolidatedReport = (sourceReports: Report[]): Report => {
    const baseReports = sourceReports.filter((report) => report.type !== "consolidated");
    const safeBase = baseReports.length > 0 ? baseReports : sourceReports;

    const byTypeCounts = safeBase.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const projectMap = safeBase.reduce((acc, report) => {
      const key = report.projectId || "unknown";
      if (!acc[key]) {
        acc[key] = { projectName: report.projectName || "Projeto", count: 0, scoreTotal: 0 };
      }
      acc[key].count += 1;
      acc[key].scoreTotal += report.score || 0;
      return acc;
    }, {} as Record<string, { projectName: string; count: number; scoreTotal: number }>);

    const byProject = Object.entries(projectMap)
      .map(([projectId, data]) => ({
        projectId,
        projectName: data.projectName,
        count: data.count,
        avgScore: Math.round(data.scoreTotal / Math.max(1, data.count)),
      }))
      .sort((a, b) => b.avgScore - a.avgScore);

    const topReports = [...safeBase]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((report) => ({
        title: report.title,
        projectName: report.projectName,
        type: report.type,
        score: report.score,
        date: report.date,
      }));

    const timeline = [...safeBase]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map((report) => ({
        title: report.title,
        projectName: report.projectName,
        type: report.type,
        date: report.date,
        score: report.score,
      }));

    const lowScoreCount = safeBase.filter((report) => report.score < 60).length;
    const highScoreCount = safeBase.filter((report) => report.score >= 80).length;
    const recommendations = [
      lowScoreCount > 0
        ? `${lowScoreCount} relatório(s) com score abaixo de 60. Priorize plano de ação nesses projetos.`
        : "Não há relatórios críticos abaixo de 60 no período.",
      highScoreCount > 0
        ? `${highScoreCount} relatório(s) com score acima de 80. Escale as estratégias que já performam bem.`
        : "Ainda não há blocos com score acima de 80 para escala imediata.",
      "Reavalie semanalmente os projetos com maior volume de insights para acompanhar evolução.",
    ];

    return {
      id: `consolidated-${Date.now()}`,
      title: `Relatório Consolidado - ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
      type: "consolidated",
      category: "Consolidado",
      projectName: "Todos os Projetos",
      projectId: "all",
      date: new Date().toISOString(),
      isFavorite: false,
      format: "pdf",
      score: Math.round(safeBase.reduce((acc, report) => acc + report.score, 0) / Math.max(1, safeBase.length)),
      metadata: {
        total_reports: safeBase.length,
        projects_analyzed: [...new Set(safeBase.map((report) => report.projectId))].length,
        analysis_types: [...new Set(safeBase.map((report) => report.type))],
        by_type_counts: byTypeCounts,
        by_project: byProject,
        top_reports: topReports,
        recent_timeline: timeline,
        recommendations,
      },
    };
  };

  const handleDownload = async (report: Report, format: "pdf" | "json" | "html" = "html") => {
    try {
      toast.success(`Preparando ${format.toUpperCase()}...`);
      
      // Gerar HTML com dados completos das análises
      let htmlContent = '';
      
      if (report.type === "project_analysis") {
        const metadata = (report.metadata || {}) as Record<string, unknown>;
        const heuristic = (metadata.heuristic_analysis || {}) as Record<string, unknown>;
        const ai = normalizeAiAnalysis(metadata);
        const insightEvents = Array.isArray(metadata.insight_events) ? metadata.insight_events : [];
        const channelEvents = Array.isArray(metadata.channel_events) ? metadata.channel_events : [];
        const benchmarkEvents = Array.isArray(metadata.benchmark_events) ? metadata.benchmark_events : [];
        const timelineEvents = Array.isArray(metadata.event_timeline) ? metadata.event_timeline : [];
        const aiExecutiveSummary = toText(
          ai.executive_summary ?? ai.executiveSummary ?? ai.summary ?? ai.resumo_executivo ?? "",
          ""
        );
        const aiStrengths = toStringArray(ai.strengths ?? ai.pontos_fortes ?? ai.strength_points);
        const aiWeaknesses = toStringArray(ai.weaknesses ?? ai.pontos_fracos ?? ai.weak_points ?? ai.gaps);
        const aiRecommendations = toStringArray(
          ai.recommendations ?? ai.recomendacoes ?? ai.actions ?? ai.next_steps
        );
        const hasAiSection =
          aiExecutiveSummary.length > 0 ||
          aiStrengths.length > 0 ||
          aiWeaknesses.length > 0 ||
          aiRecommendations.length > 0 ||
          Object.keys(ai).length > 0;
        const heuristicScores = heuristic?.scores || {};
        const scoreValue = (...values: unknown[]) => {
          for (const value of values) {
            const parsed = toNumber(value);
            if (parsed !== null) return parsed;
          }
          return null;
        };
        const heuristicCards = [
          {
            label: "Proposta de Valor",
            value: scoreValue(heuristicScores.valueProposition, heuristicScores.value_proposition),
          },
          {
            label: "Clareza da Oferta",
            value: scoreValue(heuristicScores.offerClarity, heuristicScores.offer_clarity),
          },
          {
            label: "Jornada do Usuário",
            value: scoreValue(heuristicScores.userJourney, heuristicScores.user_journey),
          },
          {
            label: "SEO",
            value: scoreValue(heuristicScores.seoReadiness, heuristicScores.seo_readiness, heuristicScores.seo),
          },
          {
            label: "Conversão",
            value: scoreValue(heuristicScores.conversionOptimization, heuristicScores.conversion_optimization),
          },
          {
            label: "Conteúdo",
            value: scoreValue(heuristicScores.contentQuality, heuristicScores.content_quality),
          },
        ].filter((item) => item.value !== null);
        const legacyCards = [
          { label: "Proposta de Valor", data: heuristic.proposta },
          { label: "Clareza da Oferta", data: heuristic.clareza },
          { label: "Jornada do Usuário", data: heuristic.jornada },
          { label: "SEO", data: heuristic.seo },
        ].filter((item) => item.data);
        
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Análise de Projeto - ${report.projectName}</title>
  <style>
    :root{
      --bg:#fcfcfd;
      --card:#ffffff;
      --text:#111827;
      --muted:#6b7280;
      --border:#e5e7eb;
      --primary:#ff5a1f;
      --primary-soft:#fff1eb;
      --success:#10b981;
      --shadow:0 1px 3px rgba(17,24,39,0.08),0 1px 2px rgba(17,24,39,0.06);
    }
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#fff 0%,var(--bg) 100%);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);padding:28px}
    .container{max-width:980px;margin:0 auto}
    .hero{background:linear-gradient(135deg,var(--primary-soft) 0%,#fff 100%);border:1px solid #ffd9ca;border-radius:14px;padding:20px 22px;box-shadow:var(--shadow);margin-bottom:18px}
    .hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
    .hero h1{margin:0;font-size:24px;line-height:1.2}
    .hero p{margin:4px 0 0;color:var(--muted);font-size:12px}
    .score-pill{background:var(--card);border:1px solid #ffd9ca;border-radius:999px;padding:8px 12px;font-weight:700;color:var(--primary);font-size:13px;white-space:nowrap}
    .summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
    .summary-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 12px}
    .summary-card .k{font-size:11px;color:var(--muted);display:block}
    .summary-card .v{font-size:13px;font-weight:600}
    .section{margin-top:18px}
    .section-title{font-size:15px;font-weight:700;margin:0 0 10px;padding-left:10px;border-left:4px solid var(--primary)}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;box-shadow:var(--shadow)}
    .card h3{margin:0 0 8px;font-size:13px}
    .score{font-size:30px;font-weight:800;color:var(--success)}
    .score-item{display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:12px}
    .score-value{font-weight:700}
    .muted{color:var(--muted)}
    ul{margin:8px 0 0 18px;padding:0}
    li{margin:4px 0}
    .badge{display:inline-block;padding:3px 8px;border-radius:999px;font-size:10px;text-transform:uppercase;font-weight:700;background:#f3f4f6;color:#374151}
    .badge-warning{background:#fef3c7;color:#92400e}
    .badge-opportunity{background:#dbeafe;color:#1e40af}
    .badge-improvement{background:#f3f4f6;color:#374151}
    .event-list{display:grid;grid-template-columns:1fr;gap:8px}
    .event p{margin:4px 0;font-size:12px}
    .timeline{border-left:2px solid #fed7c8;padding-left:12px}
    .timeline .event{position:relative}
    .timeline .event:before{content:"";position:absolute;left:-18px;top:6px;width:8px;height:8px;border-radius:999px;background:var(--primary)}
    .metadata{background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;white-space:pre-wrap}
    .footer{margin-top:22px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--muted);text-align:center}
    @media (max-width: 760px){
      .summary{grid-template-columns:repeat(2,minmax(0,1fr))}
      .grid{grid-template-columns:1fr}
      body{padding:16px}
    }
  </style>
</head>
<body>
  <div class="container">
  <div class="hero">
    <div class="hero-top">
      <div>
        <h1>Análise de Projeto</h1>
        <p>Relatório centralizado de desempenho e inteligência estratégica</p>
      </div>
      <div class="score-pill">Score Geral: ${report.score}/100</div>
    </div>
    <div class="summary">
      <div class="summary-card">
        <span class="k">Projeto</span>
        <span class="v">${escapeHtml(report.projectName)}</span>
      </div>
      <div class="summary-card">
        <span class="k">URL</span>
        <span class="v">${escapeHtml(metadata.url || 'N/A')}</span>
      </div>
      <div class="summary-card">
        <span class="k">Nicho</span>
        <span class="v">${escapeHtml(metadata.niche || 'N/A')}</span>
      </div>
      <div class="summary-card">
        <span class="k">Data</span>
        <span class="v">${new Date(report.date).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  </div>

  ${(heuristicCards.length > 0 || legacyCards.length > 0) ? `
  <div class="section">
    <h2 class="section-title">Análise Heurística</h2>
    <div class="grid">
      ${heuristicCards.map((card) => `
      <div class="card">
        <h3>${card.label}</h3>
        <div class="score-item">
          <span>Score:</span>
          <span class="score-value">${card.value ?? 0}/100</span>
        </div>
      </div>`).join("")}

      ${legacyCards.map((card) => `
      <div class="card">
        <h3>${card.label}</h3>
        <div class="score-item">
          <span>Score:</span>
          <span class="score-value">${card.data?.score || 0}/100</span>
        </div>
        <p><strong>Veredito:</strong> ${escapeHtml(toText(card.data?.veredito))}</p>
        <p><strong>Insights:</strong> ${escapeHtml(toText(card.data?.insights))}</p>
      </div>`).join("")}
    </div>
  </div>` : ''}

  ${(heuristicCards.length === 0 && legacyCards.length === 0 && Object.keys(heuristic).length > 0) ? `
  <div class="section">
    <h2 class="section-title">Análise Heurística</h2>
    <div class="card">
      <p class="muted">Dados heurísticos detectados, porém em formato não padronizado para visualização resumida.</p>
      <div class="metadata">${escapeHtml(JSON.stringify(heuristic, null, 2))}</div>
    </div>
  </div>` : ''}

  ${hasAiSection ? `
  <div class="section">
    <h2 class="section-title">Análise por IA</h2>
    ${aiExecutiveSummary ? `
    <div class="card">
      <h3>Resumo Executivo</h3>
      <p>${escapeHtml(aiExecutiveSummary)}</p>
    </div>` : ""}
    
    ${aiStrengths.length > 0 ? `
    <div class="card">
      <h3>Pontos Fortes</h3>
      <ul>${aiStrengths.map((s) => `<li>${escapeHtml(toText(s))}</li>`).join('')}</ul>
    </div>` : ''}
    
    ${aiWeaknesses.length > 0 ? `
    <div class="card">
      <h3>Pontos a Melhorar</h3>
      <ul>${aiWeaknesses.map((w) => `<li>${escapeHtml(toText(w))}</li>`).join('')}</ul>
    </div>` : ''}
    
    ${aiRecommendations.length > 0 ? `
    <div class="card">
      <h3>Recomendações Estratégicas</h3>
      <ul>${aiRecommendations.map((item) => `<li>${escapeHtml(toText(item))}</li>`).join("")}</ul>
    </div>` : ''}

    ${aiExecutiveSummary.length === 0 && aiStrengths.length === 0 && aiWeaknesses.length === 0 && aiRecommendations.length === 0 && Object.keys(ai).length > 0 ? `
    <div class="card">
      <h3>Dados de IA</h3>
      <div class="metadata">${escapeHtml(JSON.stringify(ai, null, 2))}</div>
    </div>` : ""}
  </div>` : ''}

  ${insightEvents.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Eventos de Insights (${insightEvents.length})</h2>
    <div class="event-list">
    ${insightEvents.map((event: any) => `
      <div class="card event">
        <p><strong>Título:</strong> ${escapeHtml(toText(event.title))}</p>
        <p><strong>Tipo:</strong> ${escapeHtml(toText(event.type, "improvement"))}</p>
        <p><strong>Data:</strong> ${event.created_at ? new Date(event.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
        <p><strong>Descrição:</strong> ${escapeHtml(toText(event.description))}</p>
        <p><strong>Ação:</strong> ${escapeHtml(toText(event.action))}</p>
      </div>
    `).join("")}
    </div>
  </div>` : ''}

  ${channelEvents.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Eventos de Performance (${channelEvents.length})</h2>
    <div class="grid">
    ${channelEvents.map((event: any) => `
      <div class="card event">
        <p><strong>Canal:</strong> ${escapeHtml(toText(event.channel)).toUpperCase()}</p>
        <p><strong>Score:</strong> ${toNumber(event.score) ?? 0}/100</p>
        <p><strong>Data:</strong> ${event.created_at ? new Date(event.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
      </div>
    `).join("")}
    </div>
  </div>` : ''}

  ${benchmarkEvents.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Eventos de Benchmark (${benchmarkEvents.length})</h2>
    <div class="grid">
    ${benchmarkEvents.map((event: any) => `
      <div class="card event">
        <p><strong>Concorrente:</strong> ${escapeHtml(toText(event.competitor_name))}</p>
        <p><strong>URL:</strong> ${escapeHtml(toText(event.competitor_url))}</p>
        <p><strong>Score:</strong> ${toNumber(event.overall_score) ?? 0}/100</p>
        <p><strong>Data:</strong> ${event.created_at ? new Date(event.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
      </div>
    `).join("")}
    </div>
  </div>` : ''}

  ${timelineEvents.length > 0 ? `
  <div class="section">
    <h2 class="section-title">Linha do Tempo Consolidada (${timelineEvents.length})</h2>
    <div class="timeline">
    ${timelineEvents.map((event: any) => `
      <div class="card event">
        <p><strong>Origem:</strong> ${escapeHtml(toText(event.source))}</p>
        <p><strong>Evento:</strong> ${escapeHtml(toText(event.title))}</p>
        <p><strong>Data:</strong> ${event.date ? new Date(event.date).toLocaleDateString('pt-BR') : 'N/A'}</p>
        <p><strong>Detalhes:</strong> ${escapeHtml(toText(event.details))}</p>
      </div>
    `).join("")}
    </div>
  </div>` : ''}

  ${report.category === "Insight Estratégico" ? `
  <div class="section">
    <h2 class="section-title">Insight Estratégico</h2>
    <div class="card">
      <span class="badge badge-${toText(metadata.type, "improvement")}">${escapeHtml(toText(metadata.type, "improvement"))}</span>
      <h3>${escapeHtml(report.title.replace('Insight - ', ''))}</h3>
      <p><strong>Descrição:</strong> ${escapeHtml(toText(metadata.description))}</p>
      <p><strong>Ação Recomendada:</strong> ${escapeHtml(toText(metadata.action))}</p>
    </div>
  </div>` : ''}

  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
</body>
</html>`;
      } else if (report.type === "campaign_analysis") {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Performance - ${report.campaignName}</title>
  <style>
    :root{--bg:#fcfcfd;--card:#fff;--text:#111827;--muted:#6b7280;--border:#e5e7eb;--primary:#ff5a1f;--primary-soft:#fff1eb;--success:#10b981;--shadow:0 1px 3px rgba(17,24,39,0.08),0 1px 2px rgba(17,24,39,0.06)}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#fff 0%,var(--bg) 100%);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);padding:28px}
    .container{max-width:980px;margin:0 auto}
    .hero{background:linear-gradient(135deg,var(--primary-soft) 0%,#fff 100%);border:1px solid #ffd9ca;border-radius:14px;padding:20px 22px;box-shadow:var(--shadow);margin-bottom:18px}
    .hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
    .hero h1{margin:0;font-size:24px;line-height:1.2}
    .hero p{margin:4px 0 0;color:var(--muted);font-size:12px}
    .score-pill{background:var(--card);border:1px solid #ffd9ca;border-radius:999px;padding:8px 12px;font-weight:700;color:var(--primary);font-size:13px;white-space:nowrap}
    .summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
    .summary-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 12px}
    .summary-card .k{font-size:11px;color:var(--muted);display:block}
    .summary-card .v{font-size:13px;font-weight:600}
    .section{margin-top:18px}
    .section-title{font-size:15px;font-weight:700;margin:0 0 10px;padding-left:10px;border-left:4px solid var(--primary)}
    .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;box-shadow:var(--shadow)}
    .score{font-size:30px;font-weight:800;color:var(--success)}
    .metadata{background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;white-space:pre-wrap}
    .footer{margin-top:22px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--muted);text-align:center}
    @media (max-width:760px){body{padding:16px}.summary{grid-template-columns:repeat(2,minmax(0,1fr))}}
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-top">
        <div>
          <h1>Análise de Performance</h1>
          <p>Visão tática para decisões por canal e campanha</p>
        </div>
        <div class="score-pill">Score: ${report.score}/100</div>
      </div>
      <div class="summary">
        <div class="summary-card"><span class="k">Campanha</span><span class="v">${escapeHtml(toText(report.campaignName))}</span></div>
        <div class="summary-card"><span class="k">Canal</span><span class="v">${escapeHtml(toText(report.channel))}</span></div>
        <div class="summary-card"><span class="k">Projeto</span><span class="v">${escapeHtml(toText(report.projectName))}</span></div>
        <div class="summary-card"><span class="k">Data</span><span class="v">${new Date(report.date).toLocaleDateString('pt-BR')}</span></div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Diagnóstico</h2>
      <div class="card">
        <p>Score de <strong>${report.score}/100</strong> indica ${report.score >= 80 ? 'performance excelente' : report.score >= 60 ? 'performance boa' : 'performance com oportunidade de evolução'}.</p>
      </div>
    </div>

    ${report.metadata && Object.keys(report.metadata).length > 0 ? `
    <div class="section">
      <h2 class="section-title">Métricas Detalhadas</h2>
      <div class="card">
        <div class="metadata">${escapeHtml(JSON.stringify(report.metadata, null, 2))}</div>
      </div>
    </div>` : ''}

    <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
</body>
</html>`;
      } else if (report.type === "benchmark") {
        const metadata = report.metadata || {};
        const benchmarkStrengths = toStringArray(metadata.strengths);
        const benchmarkWeaknesses = toStringArray(metadata.weaknesses);
        const benchmarkStrategicInsights = toStringArray(metadata.strategic_insights);
        const benchmarkRecommendations = toStringArray(metadata.recommendations);
        
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Benchmark - ${metadata.competitor_name || 'Concorrente'}</title>
  <style>
    :root{--bg:#fcfcfd;--card:#fff;--text:#111827;--muted:#6b7280;--border:#e5e7eb;--primary:#ff5a1f;--primary-soft:#fff1eb;--accent:#7c3aed;--shadow:0 1px 3px rgba(17,24,39,0.08),0 1px 2px rgba(17,24,39,0.06)}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#fff 0%,var(--bg) 100%);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);padding:28px}
    .container{max-width:980px;margin:0 auto}
    .hero{background:linear-gradient(135deg,var(--primary-soft) 0%,#fff 100%);border:1px solid #ffd9ca;border-radius:14px;padding:20px 22px;box-shadow:var(--shadow);margin-bottom:18px}
    .hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
    .hero h1{margin:0;font-size:24px;line-height:1.2}
    .hero p{margin:4px 0 0;color:var(--muted);font-size:12px}
    .score-pill{background:var(--card);border:1px solid #ffd9ca;border-radius:999px;padding:8px 12px;font-weight:700;color:var(--primary);font-size:13px;white-space:nowrap}
    .summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
    .summary-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 12px}
    .summary-card .k{font-size:11px;color:var(--muted);display:block}
    .summary-card .v{font-size:13px;font-weight:600}
    .section{margin-top:18px}
    .section-title{font-size:15px;font-weight:700;margin:0 0 10px;padding-left:10px;border-left:4px solid var(--primary)}
    .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;box-shadow:var(--shadow)}
    .score-item{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}
    .score-value{font-weight:700;color:var(--accent)}
    .comparison{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .footer{margin-top:22px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--muted);text-align:center}
    ul{margin:8px 0 0 18px;padding:0}
    li{margin:4px 0}
    @media (max-width:760px){body{padding:16px}.summary{grid-template-columns:repeat(2,minmax(0,1fr))}.comparison{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-top">
        <div>
          <h1>Benchmark Competitivo</h1>
          <p>Comparativo estratégico com concorrentes diretos</p>
        </div>
        <div class="score-pill">Score: ${report.score}/100</div>
      </div>
      <div class="summary">
        <div class="summary-card"><span class="k">Concorrente</span><span class="v">${escapeHtml(toText(metadata.competitor_name))}</span></div>
        <div class="summary-card"><span class="k">URL</span><span class="v">${escapeHtml(toText(metadata.competitor_url))}</span></div>
        <div class="summary-card"><span class="k">Nicho</span><span class="v">${escapeHtml(toText(metadata.competitor_niche))}</span></div>
        <div class="summary-card"><span class="k">Projeto</span><span class="v">${escapeHtml(toText(report.projectName))}</span></div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Comparativo de Score</h2>
      <div class="comparison">
        <div class="card">
          <div class="score-item"><span>Overall</span><span class="score-value">${metadata.overall_score || 0}/100</span></div>
          <div class="score-item"><span>Proposta de Valor</span><span class="score-value">${metadata.value_proposition_score || 0}/100</span></div>
          <div class="score-item"><span>Clareza</span><span class="score-value">${metadata.offer_clarity_score || 0}/100</span></div>
          <div class="score-item"><span>Jornada</span><span class="score-value">${metadata.user_journey_score || 0}/100</span></div>
        </div>
      </div>
    </div>

  ${benchmarkStrengths.length > 0 ? `
  <div class="section"><h2 class="section-title">Pontos Fortes</h2><div class="card"><ul>${benchmarkStrengths.map((s) => `<li>${escapeHtml(toText(s))}</li>`).join('')}</ul></div></div>` : ''}

  ${benchmarkWeaknesses.length > 0 ? `
  <div class="section"><h2 class="section-title">Pontos Fracos</h2><div class="card"><ul>${benchmarkWeaknesses.map((w) => `<li>${escapeHtml(toText(w))}</li>`).join('')}</ul></div></div>` : ''}

  ${benchmarkStrategicInsights.length > 0 ? `
  <div class="section"><h2 class="section-title">Insights Estratégicos</h2><div class="card"><ul>${benchmarkStrategicInsights.map((item) => `<li>${escapeHtml(toText(item))}</li>`).join("")}</ul></div></div>` : ''}

  ${benchmarkRecommendations.length > 0 ? `
  <div class="section"><h2 class="section-title">Recomendações</h2><div class="card"><ul>${benchmarkRecommendations.map((item) => `<li>${escapeHtml(toText(item))}</li>`).join("")}</ul></div></div>` : ''}

  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div></div>
</body>
</html>`;
      } else if (report.type === "consolidated") {
        const metadata = (report.metadata || {}) as Record<string, unknown>;
        const byTypeCounts = (metadata.by_type_counts || {}) as Record<string, number>;
        const byProject = Array.isArray(metadata.by_project) ? metadata.by_project : [];
        const topReports = Array.isArray(metadata.top_reports) ? metadata.top_reports : [];
        const recentTimeline = Array.isArray(metadata.recent_timeline) ? metadata.recent_timeline : [];
        const consolidatedRecommendations = toStringArray(metadata.recommendations);

        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(report.title)}</title>
  <style>
    :root{--bg:#fcfcfd;--card:#fff;--text:#111827;--muted:#6b7280;--border:#e5e7eb;--primary:#ff5a1f;--primary-soft:#fff1eb;--success:#10b981;--shadow:0 1px 3px rgba(17,24,39,0.08),0 1px 2px rgba(17,24,39,0.06)}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#fff 0%,var(--bg) 100%);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);padding:24px}
    .container{max-width:980px;margin:0 auto}
    .hero{background:linear-gradient(135deg,var(--primary-soft) 0%,#fff 100%);border:1px solid #ffd9ca;border-radius:14px;padding:20px 22px;box-shadow:var(--shadow);margin-bottom:18px}
    .hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
    .hero h1{margin:0;font-size:24px;line-height:1.2}
    .hero p{margin:4px 0 0;color:var(--muted);font-size:12px}
    .score-pill{background:var(--card);border:1px solid #ffd9ca;border-radius:999px;padding:8px 12px;font-weight:700;color:var(--primary);font-size:13px;white-space:nowrap}
    .summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}
    .summary-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:10px 12px}
    .summary-card .k{font-size:11px;color:var(--muted);display:block}
    .summary-card .v{font-size:13px;font-weight:600}
    .section{margin-top:18px}
    .section-title{font-size:15px;font-weight:700;margin:0 0 10px;padding-left:10px;border-left:4px solid var(--primary)}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;box-shadow:var(--shadow)}
    .score-value{font-weight:700;color:var(--success)}
    .list{margin:0;padding-left:18px}
    .list li{margin:4px 0}
    .meta{font-size:11px;color:var(--muted)}
    .footer{margin-top:20px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--muted);text-align:center}
    @media (max-width:760px){body{padding:16px}.summary{grid-template-columns:repeat(2,minmax(0,1fr))}.grid{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <div class="hero-top">
        <div>
          <h1>${escapeHtml(report.title)}</h1>
          <p>Visão consolidada das análises estratégicas da Intentia</p>
        </div>
        <div class="score-pill">Score Médio: ${report.score}/100</div>
      </div>
      <div class="summary">
        <div class="summary-card"><span class="k">Relatórios</span><span class="v">${toText(metadata.total_reports, "0")}</span></div>
        <div class="summary-card"><span class="k">Projetos analisados</span><span class="v">${toText(metadata.projects_analyzed, "0")}</span></div>
        <div class="summary-card"><span class="k">Tipos de análise</span><span class="v">${toStringArray(metadata.analysis_types).length}</span></div>
        <div class="summary-card"><span class="k">Data</span><span class="v">${new Date(report.date).toLocaleDateString('pt-BR')}</span></div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Distribuição por Tipo</h2>
      <div class="grid">
        ${Object.entries(byTypeCounts).map(([type, count]) => `
        <div class="card">
          <p><strong>${escapeHtml(type)}</strong></p>
          <p class="score-value">${count} relatório(s)</p>
        </div>`).join("") || `<div class="card"><p class="meta">Sem distribuição disponível.</p></div>`}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Projetos com Melhor Score Médio</h2>
      <div class="grid">
        ${byProject.slice(0, 6).map((project) => {
          const p = project as Record<string, unknown>;
          return `
        <div class="card">
          <p><strong>${escapeHtml(toText(p.projectName))}</strong></p>
          <p class="meta">${toText(p.count, "0")} relatório(s)</p>
          <p class="score-value">Score médio: ${toText(p.avgScore, "0")}/100</p>
        </div>`;
        }).join("") || `<div class="card"><p class="meta">Sem projetos consolidados.</p></div>`}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Relatórios Destaque</h2>
      <div class="card">
        <ul class="list">
          ${topReports.map((item) => {
            const r = item as Record<string, unknown>;
            return `<li><strong>${escapeHtml(toText(r.title))}</strong> • ${escapeHtml(toText(r.projectName))} • ${escapeHtml(toText(r.type))} • ${toText(r.score, "0")}/100</li>`;
          }).join("") || "<li>Sem destaques disponíveis.</li>"}
        </ul>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Linha do Tempo Recente</h2>
      <div class="card">
        <ul class="list">
          ${recentTimeline.map((item) => {
            const t = item as Record<string, unknown>;
            return `<li>${new Date(toText(t.date, new Date().toISOString())).toLocaleDateString('pt-BR')} • <strong>${escapeHtml(toText(t.title))}</strong> (${escapeHtml(toText(t.type))})</li>`;
          }).join("") || "<li>Sem eventos recentes.</li>"}
        </ul>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Recomendações Estratégicas</h2>
      <div class="card">
        <ul class="list">
          ${consolidatedRecommendations.map((item) => `<li>${escapeHtml(toText(item))}</li>`).join("") || "<li>Sem recomendações consolidadas.</li>"}
        </ul>
      </div>
    </div>

    <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
</body>
</html>`;
      } else {
        // Genérico para outros tipos
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${report.title}</title>
  <style>
    :root{--bg:#fcfcfd;--card:#fff;--text:#111827;--muted:#6b7280;--border:#e5e7eb;--primary:#ff5a1f;--primary-soft:#fff1eb;--success:#10b981;--shadow:0 1px 3px rgba(17,24,39,0.08),0 1px 2px rgba(17,24,39,0.06)}
    *{box-sizing:border-box}
    body{margin:0;background:linear-gradient(180deg,#fff 0%,var(--bg) 100%);font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--text);padding:24px}
    .container{max-width:900px;margin:0 auto}
    .hero{background:linear-gradient(135deg,var(--primary-soft) 0%,#fff 100%);border:1px solid #ffd9ca;border-radius:14px;padding:18px 20px;box-shadow:var(--shadow);margin-bottom:16px}
    .hero h1{margin:0;font-size:22px}
    .hero p{margin:6px 0 0;font-size:12px;color:var(--muted)}
    .card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px;box-shadow:var(--shadow)}
    .score{font-size:28px;font-weight:800;color:var(--success)}
    .metadata{background:#f8fafc;border:1px solid #e2e8f0;padding:8px;border-radius:8px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:10px;white-space:pre-wrap}
    .footer{margin-top:20px;padding-top:12px;border-top:1px solid var(--border);font-size:10px;color:var(--muted);text-align:center}
    @media (max-width:760px){body{padding:16px}}
  </style>
</head>
<body>
  <div class="container">
  <div class="hero">
    <h1>${escapeHtml(report.title)}</h1>
    <p>Relatório gerado automaticamente pela Intentia</p>
  </div>
  <div class="card">
    <p><strong>Tipo:</strong> ${escapeHtml(report.type)}</p>
    <p><strong>Categoria:</strong> ${escapeHtml(report.category)}</p>
    <p><strong>Projeto:</strong> ${escapeHtml(report.projectName)}</p>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    <p><strong>Score:</strong> <span class="score">${report.score}/100</span></p>
  </div>
  
  ${report.metadata ? `
  <div class="card">
    <h2>Metadados</h2>
    <div class="metadata">${escapeHtml(JSON.stringify(report.metadata, null, 2))}</div>
  </div>` : ''}
  
  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
  </div>
</body>
</html>`;
      }

      if (format === "json") {
        const jsonBlob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
        const jsonUrl = window.URL.createObjectURL(jsonBlob);
        const jsonLink = document.createElement("a");
        jsonLink.href = jsonUrl;
        jsonLink.download = `${sanitizeFilename(report.title)}.json`;
        document.body.appendChild(jsonLink);
        jsonLink.click();
        document.body.removeChild(jsonLink);
        window.URL.revokeObjectURL(jsonUrl);
        toast.success("Download JSON concluído!");
        return;
      }

      if (format === "pdf") {
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";
        document.body.appendChild(printFrame);

        const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
        if (!frameDoc) throw new Error("Não foi possível preparar impressão.");
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();

        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1200);
        }, 250);

        toast.success("Visualização pronta. Salve como PDF na janela de impressão.");
        return;
      }

      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sanitizeFilename(report.title)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Download HTML concluído!");
    } catch (error: unknown) {
      console.error("Erro ao fazer download:", error);
      const message = error instanceof Error ? error.message : "Falha ao gerar arquivo";
      toast.error(`Erro ao fazer download: ${message}`);
    }
  };

  const handleGenerateConsolidatedReport = async () => {
    const sourceReports = reports.length > 0 ? reports : await loadReports({ silent: true });

    if (!sourceReports || sourceReports.length === 0) {
      toast.error("Não há dados suficientes para gerar o consolidado.");
      return;
    }

    const baseReports = sourceReports.filter((report) => report.type !== "consolidated");
    if (baseReports.length === 0 && sourceReports.length === 0) {
      toast.error("Não há análises para consolidar.");
      return;
    }

    const consolidatedReport = buildConsolidatedReport(sourceReports);
    await handleDownload(consolidatedReport, "pdf");
  };

  const handleToggleFavorite = async (reportId: string) => {
    try {
      // Encontrar o relatório atual
      const currentReport = reports.find(r => r.id === reportId);
      if (!currentReport) {
        console.error('Relatório não encontrado:', reportId);
        toast.error("Relatório não encontrado");
        return;
      }

      const newFavoriteStatus = !currentReport.isFavorite;
      
      // Simplificar: apenas atualizar estado local por enquanto
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, isFavorite: newFavoriteStatus }
          : report
      ));

      toast.success(newFavoriteStatus ? "Adicionado aos favoritos!" : "Removido dos favoritos!");
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error);
      toast.error("Erro ao atualizar favorito");
    }
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const toggleCategory = (projectId: string, category: string) => {
    const key = `${projectId}:${category}`;
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const setProjectCategoriesExpanded = (
    projectId: string,
    categories: string[],
    expanded: boolean
  ) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      categories.forEach((category) => {
        const key = `${projectId}:${category}`;
        if (expanded) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <SEO title="Relatórios" description="Central de relatórios e análises" />
        <DashboardLayout>
          <FeatureGate featureKey="reports" withLayout={false} pageTitle="Relatórios">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/70 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </FeatureGate>
        </DashboardLayout>
      </>
    );
  }

  const totalReports = reports.length;
  const favoriteReports = reports.filter((report) => report.isFavorite).length;
  const aiReports = reports.filter(
    (report) => report.type === "project_analysis" || report.type === "campaign_analysis"
  ).length;
  const averageScore =
    reports.length > 0 ? Math.round(reports.reduce((acc, report) => acc + report.score, 0) / reports.length) : 0;

  return (
    <>
      <SEO title="Relatórios" description="Central de relatórios e análises" />
      <DashboardLayout>
        <FeatureGate featureKey="reports" withLayout={false} pageTitle="Relatórios">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.07] to-orange-500/[0.05] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
                  <p className="text-muted-foreground">
                    Central de relatórios e análises geradas pela plataforma
                  </p>
                </div>
                <Button className="gap-2 shadow-sm" onClick={handleGenerateConsolidatedReport}>
                  <Download className="h-4 w-4" />
                  Gerar Relatório Consolidado
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-primary/20 bg-primary/[0.03]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalReports}</div>
                  <p className="text-xs text-muted-foreground">Gerados este mês</p>
                </CardContent>
              </Card>
              <Card className="border-amber-500/20 bg-amber-500/[0.03]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Star className="h-4 w-4 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{favoriteReports}</div>
                  <p className="text-xs text-muted-foreground">Relatórios marcados</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Análises de IA</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">{aiReports}</div>
                  <p className="text-xs text-muted-foreground">Com inteligência artificial</p>
                </CardContent>
              </Card>
              <Card className="border-blue-500/20 bg-blue-500/[0.03]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{averageScore}</div>
                  <p className="text-xs text-muted-foreground">Qualidade geral</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="border-border/80 shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar relatórios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-[180px] bg-background">
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[150px] bg-background">
                        <SelectValue placeholder="Ordenar" />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant={showFavoritesOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Favoritos
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Reports List - Agrupados por Projeto */}
            <div className="space-y-3">
              {filteredProjects.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
                    <p className="text-muted-foreground text-center">
                      Tente ajustar os filtros ou criar novas análises para gerar relatórios.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map((project) => {
                  const isExpanded = expandedProjects.has(project.projectId);
                  const reportCount = project.reports.length;
                  const favoriteCount = project.reports.filter(r => r.isFavorite).length;
                  const avgScore = Math.round(project.reports.reduce((acc, r) => acc + r.score, 0) / reportCount);
                  const categoryPriority: Record<string, number> = {
                    "Análise de Projeto": 1,
                    "Insight Estratégico": 2,
                    "Performance": 3,
                    "Benchmark Competitivo": 4,
                    "Consolidado": 5,
                  };
                  const reportsByCategory = project.reports.reduce((acc, report) => {
                    const key = report.category || "Outros";
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(report);
                    return acc;
                  }, {} as Record<string, Report[]>);
                  const sortedCategoryEntries = Object.entries(reportsByCategory).sort((a, b) => {
                    const aOrder = categoryPriority[a[0]] ?? 999;
                    const bOrder = categoryPriority[b[0]] ?? 999;
                    if (aOrder !== bOrder) return aOrder - bOrder;
                    return a[0].localeCompare(b[0]);
                  });

                  return (
                    <div key={project.projectId} className="space-y-3">
                      {/* Project Header */}
                      <Card className="border-border/80 shadow-sm">
                        <CardContent className="p-0">
                          <button
                            onClick={() => toggleProject(project.projectId)}
                            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                              <div>
                                <h3 className="font-semibold text-sm sm:text-base">{project.projectName}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {reportCount} relatório{reportCount !== 1 ? "s" : ""}
                                  {favoriteCount > 0 && ` · ${favoriteCount} favorito${favoriteCount !== 1 ? "s" : ""}`}
                                  <span className="text-xs text-muted-foreground"> · Score médio: {avgScore}/100</span>
                                </p>
                              </div>
                            </div>
                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </CardContent>
                      </Card>

                      {/* Reports for this Project */}
                      {isExpanded && (
                        <div className="space-y-2 pl-8">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                setProjectCategoriesExpanded(
                                  project.projectId,
                                  sortedCategoryEntries.map(([category]) => category),
                                  false
                                )
                              }
                            >
                              Colapsar todas
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                setProjectCategoriesExpanded(
                                  project.projectId,
                                  sortedCategoryEntries.map(([category]) => category),
                                  true
                                )
                              }
                            >
                              Expandir todas
                            </Button>
                          </div>
                          {sortedCategoryEntries.map(([category, categoryReports]) => (
                            <div key={category} className="space-y-2">
                              {(() => {
                                const categoryKey = `${project.projectId}:${category}`;
                                const isCategoryExpanded = expandedCategories.has(categoryKey);
                                return (
                                  <>
                                    <button
                                      onClick={() => toggleCategory(project.projectId, category)}
                                      className="w-full flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2 hover:bg-muted/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`h-7 w-7 rounded-md border flex items-center justify-center ${getCategoryTone(category)}`}>
                                          {getCategoryIcon(category)}
                                        </div>
                                        <p className="text-xs font-semibold text-foreground">{category}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px]">
                                          {categoryReports.length} relatório{categoryReports.length !== 1 ? "s" : ""}
                                        </Badge>
                                        {isCategoryExpanded ? (
                                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </div>
                                    </button>

                                    {isCategoryExpanded && categoryReports.map((report) => (
                                      <Card key={report.id} className="border-border/80 hover:border-primary/20 hover:shadow-md transition-all">
                                        <CardContent className="p-4">
                                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                              <div className="flex items-start gap-3">
                                                <div
                                                  className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 ${getTypeContainerClass(report.type)}`}
                                                >
                                                  {getTypeIcon(report.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <h4 className="font-semibold text-foreground leading-tight">
                                                    {report.title}
                                                  </h4>
                                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    {report.campaignName && (
                                                      <Badge variant="outline" className="text-xs">
                                                        <Megaphone className="h-3 w-3 mr-1" />
                                                        {report.campaignName}
                                                      </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-xs">
                                                      <Calendar className="h-3 w-3 mr-1" />
                                                      {formatDate(report.date)}
                                                    </Badge>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 w-full lg:w-auto">
                                              <div className="text-left sm:text-right">
                                                <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                                                  {report.score}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Score</p>
                                              </div>
                                              <div className="flex flex-wrap items-center gap-1.5">
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleToggleFavorite(report.id)}
                                                  className="p-2"
                                                >
                                                  <Star
                                                    className={`h-4 w-4 ${
                                                      report.isFavorite
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-muted-foreground"
                                                    }`}
                                                  />
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleDownload(report, "pdf")}
                                                  className="h-8 px-2 text-[10px] min-w-[56px]"
                                                >
                                                  PDF
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleDownload(report, "json")}
                                                  className="h-8 px-2 text-[10px] min-w-[56px]"
                                                >
                                                  JSON
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleDownload(report, "html")}
                                                  className="h-8 px-2 text-[10px] min-w-[56px]"
                                                >
                                                  HTML
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </FeatureGate>
      </DashboardLayout>
    </>
  );
}






