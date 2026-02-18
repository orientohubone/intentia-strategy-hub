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

// Tipos para os relatÃ³rios

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
  { value: "project_analysis", label: "AnÃ¡lise de Projeto" },
  { value: "campaign_analysis", label: "Performance" },
  { value: "benchmark", label: "Benchmark" },
  { value: "consolidated", label: "Consolidado" },
];

const CATEGORIES = [
  { value: "all", label: "Todas as Categorias" },
  { value: "AnÃ¡lise de Projeto", label: "AnÃ¡lise de Projeto" },
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

const getTypeColor = (type: string) => {
  switch (type) {
    case "project_analysis":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "campaign_analysis":
      return "text-green-600 bg-green-50 border-green-200";
    case "benchmark":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "consolidated":
      return "text-orange-600 bg-orange-50 border-orange-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
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
    if (!userId) return;
    const cached = reportsCache.get(userId);

    try {
      if (!options?.silent && !cached) setLoading(true);
      
      // Buscar projetos com dados completos das anÃ¡lises
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

      // Transformar dados em relatÃ³rios
      const transformedReports: Report[] = [];

      projects?.forEach((project: any) => {
        // 1. RelatÃ³rio de AnÃ¡lise HeurÃ­stica + IA (se existir anÃ¡lise do projeto)
        if (project.heuristic_analysis || project.ai_analysis) {
          transformedReports.push({
            id: `analysis-${project.id}`,
            title: `AnÃ¡lise Completa - ${project.name}`,
            type: "project_analysis",
            category: "AnÃ¡lise de Projeto",
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
              project_score: project.score
            },
          });
        }

        // 2. RelatÃ³rios de Insights (se existirem insights individuais)
        const insights = project.insights || [];
        insights.forEach((insight: any) => {
          transformedReports.push({
            id: `insight-${insight.id}`,
            title: `Insight - ${insight.title}`,
            type: "project_analysis",
            category: "Insight EstratÃ©gico",
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

        // 3. RelatÃ³rios de Performance por Canal
        const channelScores = project.project_channel_scores || [];
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

        // 4. RelatÃ³rios de Benchmark
        const benchmarks = project.benchmarks || [];
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

      // 5. RelatÃ³rio Consolidado (se houver anÃ¡lises)
      if (transformedReports.length > 0) {
        transformedReports.push({
          id: "consolidated",
          title: `RelatÃ³rio Consolidado - ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`,
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

      setReports(transformedReports);
      reportsCache.set(userId, { reports: transformedReports, fetchedAt: Date.now() });
      console.log('RelatÃ³rios carregados:', transformedReports.length);
    } catch (error) {
      console.error("Erro ao carregar relatÃ³rios:", error);
      toast.error("Erro ao carregar relatÃ³rios");
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  // Agrupar relatÃ³rios por projeto
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

  // Filtrar relatÃ³rios
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

  const handleDownload = async (report: Report) => {
    try {
      toast.success("Preparando download...");
      
      // Gerar HTML com dados completos das anÃ¡lises
      let htmlContent = '';
      
      if (report.type === "project_analysis") {
        const metadata = report.metadata || {};
        const heuristic = metadata.heuristic_analysis || {};
        const ai = metadata.ai_analysis || {};
        
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AnÃ¡lise de Projeto - ${report.projectName}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    h2{font-size:16px;color:#374151;margin-top:24px;margin-bottom:12px}
    h3{font-size:14px;color:#4b5563;margin-top:20px;margin-bottom:8px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .score{font-size:24px;font-weight:700;color:#059669}
    .score-item{display:flex;justify-content:space-between;margin-bottom:4px}
    .score-value{font-weight:600}
    .badge{display:inline-block;padding:2px 6px;border-radius:3px;font-size:9px;text-transform:uppercase;font-weight:600;margin-right:4px}
    .badge-warning{background:#fef3c7;color:#92400e}
    .badge-opportunity{background:#dbeafe;color:#1e40af}
    .badge-improvement{background:#f3f4f6;color:#374151}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .section{margin-bottom:20px}
    .metadata{background:#f3f4f6;padding:8px;border-radius:4px;font-family:monospace;font-size:10px}
  </style>
</head>
<body>
  <h1>AnÃ¡lise de Projeto</h1>
  <div class="card">
    <p><strong>Projeto:</strong> ${report.projectName}</p>
    <p><strong>URL:</strong> ${metadata.url || 'N/A'}</p>
    <p><strong>Nicho:</strong> ${metadata.niche || 'N/A'}</p>
    <p><strong>Data:</strong> ${new Date(report.date).toLocaleDateString('pt-BR')}</p>
    <p><strong>Score Geral:</strong> <span class="score">${report.score}/100</span></p>
  </div>

  ${Object.keys(heuristic).length > 0 ? `
  <div class="section">
    <h2>AnÃ¡lise HeurÃ­stica</h2>
    <div class="grid">
      ${heuristic.proposta ? `
      <div class="card">
        <h3>Proposta de Valor</h3>
        <div class="score-item">
          <span>Score:</span>
          <span class="score-value">${heuristic.proposta.score || 0}/100</span>
        </div>
        <p><strong>Veredito:</strong> ${heuristic.proposta.veredito || 'N/A'}</p>
        <p><strong>Insights:</strong> ${heuristic.proposta.insights || 'N/A'}</p>
      </div>` : ''}
      
      ${heuristic.clareza ? `
      <div class="card">
        <h3>Clareza da Oferta</h3>
        <div class="score-item">
          <span>Score:</span>
          <span class="score-value">${heuristic.clareza.score || 0}/100</span>
        </div>
        <p><strong>Veredito:</strong> ${heuristic.clareza.veredito || 'N/A'}</p>
        <p><strong>Insights:</strong> ${heuristic.clareza.insights || 'N/A'}</p>
      </div>` : ''}
      
      ${heuristic.jornada ? `
      <div class="card">
        <h3>Jornada do UsuÃ¡rio</h3>
        <div class="score-item">
          <span>Score:</span>
          <span class="score-value">${heuristic.jornada.score || 0}/100</span>
        </div>
        <p><strong>Veredito:</strong> ${heuristic.jornada.veredito || 'N/A'}</p>
        <p><strong>Insights:</strong> ${heuristic.jornada.insights || 'N/A'}</p>
      </div>` : ''}
      
      ${heuristic.seo ? `
      <div class="card">
        <h3>OtimizaÃ§Ã£o SEO</h3>
        <div class="score-item">
          <span>Score:</span>
          <span class="score-value">${heuristic.seo.score || 0}/100</span>
        </div>
        <p><strong>Veredito:</strong> ${heuristic.seo.veredito || 'N/A'}</p>
        <p><strong>Insights:</strong> ${heuristic.seo.insights || 'N/A'}</p>
      </div>` : ''}
    </div>
  </div>` : ''}

  ${ai.executive_summary ? `
  <div class="section">
    <h2>AnÃ¡lise por IA</h2>
    <div class="card">
      <h3>Resumo Executivo</h3>
      <p>${ai.executive_summary}</p>
    </div>
    
    ${ai.strengths && ai.strengths.length > 0 ? `
    <div class="card">
      <h3>Pontos Fortes</h3>
      <ul>${ai.strengths.map((s: string) => `<li>${s}</li>`).join('')}</ul>
    </div>` : ''}
    
    ${ai.weaknesses && ai.weaknesses.length > 0 ? `
    <div class="card">
      <h3>Pontos a Melhorar</h3>
      <ul>${ai.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}</ul>
    </div>` : ''}
    
    ${ai.recommendations ? `
    <div class="card">
      <h3>RecomendaÃ§Ãµes EstratÃ©gicas</h3>
      <p>${ai.recommendations}</p>
    </div>` : ''}
  </div>` : ''}

  ${report.category === "Insight EstratÃ©gico" ? `
  <div class="section">
    <h2>Insight EstratÃ©gico</h2>
    <div class="card">
      <span class="badge badge-${metadata.type}">${metadata.type}</span>
      <h3>${report.title.replace('Insight - ', '')}</h3>
      <p><strong>DescriÃ§Ã£o:</strong> ${metadata.description || 'N/A'}</p>
      <p><strong>AÃ§Ã£o Recomendada:</strong> ${metadata.action || 'N/A'}</p>
    </div>
  </div>` : ''}

  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`;
      } else if (report.type === "campaign_analysis") {
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Performance - ${report.campaignName}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    h2{font-size:16px;color:#374151;margin-top:24px;margin-bottom:12px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .score{font-size:24px;font-weight:700;color:#059669}
    .metric{display:flex;justify-content:space-between;margin-bottom:8px}
    .metric-value{font-weight:600}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
    .metadata{background:#f3f4f6;padding:8px;border-radius:4px;font-family:monospace;font-size:10px}
  </style>
</head>
<body>
  <h1>AnÃ¡lise de Performance</h1>
  <div class="card">
    <p><strong>Campanha:</strong> ${report.campaignName}</p>
    <p><strong>Canal:</strong> ${report.channel}</p>
    <p><strong>Projeto:</strong> ${report.projectName}</p>
    <p><strong>Data:</strong> ${new Date(report.date).toLocaleDateString('pt-BR')}</p>
    <p><strong>Score de Performance:</strong> <span class="score">${report.score}/100</span></p>
  </div>

  ${report.metadata && Object.keys(report.metadata).length > 0 ? `
  <div class="card">
    <h2>MÃ©tricas Detalhadas</h2>
    <div class="metadata">${JSON.stringify(report.metadata, null, 2)}</div>
  </div>` : ''}

  <div class="card">
    <h2>Insights de Performance</h2>
    <p>AnÃ¡lise de performance gerada pela plataforma com base nos dados do canal ${report.channel}.</p>
    <p>Score de ${report.score}/100 indica ${report.score >= 80 ? 'performance excelente' : report.score >= 60 ? 'performance boa' : 'performance precisa melhorar'}.</p>
  </div>

  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`;
      } else if (report.type === "benchmark") {
        const metadata = report.metadata || {};
        
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Benchmark - ${metadata.competitor_name || 'Concorrente'}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    h2{font-size:16px;color:#374151;margin-top:24px;margin-bottom:12px}
    h3{font-size:14px;color:#4b5563;margin-top:20px;margin-bottom:8px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .score{font-size:24px;font-weight:700;color:#7c3aed}
    .score-item{display:flex;justify-content:space-between;margin-bottom:4px}
    .score-value{font-weight:600}
    .comparison{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
  </style>
</head>
<body>
  <h1>Benchmark Competitivo</h1>
  <div class="card">
    <p><strong>Concorrente:</strong> ${metadata.competitor_name || 'N/A'}</p>
    <p><strong>URL:</strong> ${metadata.competitor_url || 'N/A'}</p>
    <p><strong>Nicho:</strong> ${metadata.competitor_niche || 'N/A'}</p>
    <p><strong>Projeto:</strong> ${report.projectName}</p>
    <p><strong>Data:</strong> ${new Date(report.date).toLocaleDateString('pt-BR')}</p>
    <p><strong>Score do Concorrente:</strong> <span class="score">${report.score}/100</span></p>
  </div>

  <div class="comparison">
    <div class="card">
      <h3>Score do Concorrente</h3>
      <div class="score-item">
        <span>Overall:</span>
        <span class="score-value">${metadata.overall_score || 0}/100</span>
      </div>
      <div class="score-item">
        <span>Proposta de Valor:</span>
        <span class="score-value">${metadata.value_proposition_score || 0}/100</span>
      </div>
      <div class="score-item">
        <span>Clareza:</span>
        <span class="score-value">${metadata.offer_clarity_score || 0}/100</span>
      </div>
      <div class="score-item">
        <span>Jornada:</span>
        <span class="score-value">${metadata.user_journey_score || 0}/100</span>
      </div>
    </div>
  </div>

  ${metadata.strengths && metadata.strengths.length > 0 ? `
  <div class="card">
    <h3>Pontos Fortes do Concorrente</h3>
    <ul>${metadata.strengths.map((s: string) => `<li>${s}</li>`).join('')}</ul>
  </div>` : ''}

  ${metadata.weaknesses && metadata.weaknesses.length > 0 ? `
  <div class="card">
    <h3>Pontos Fracos do Concorrente</h3>
    <ul>${metadata.weaknesses.map((w: string) => `<li>${w}</li>`).join('')}</ul>
  </div>` : ''}

  ${metadata.strategic_insights ? `
  <div class="card">
    <h3>Insights EstratÃ©gicos</h3>
    <p>${metadata.strategic_insights}</p>
  </div>` : ''}

  ${metadata.recommendations ? `
  <div class="card">
    <h3>RecomendaÃ§Ãµes</h3>
    <p>${metadata.recommendations}</p>
  </div>` : ''}

  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`;
      } else {
        // GenÃ©rico para outros tipos
        htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${report.title}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .score{font-size:24px;font-weight:700;color:#059669}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
    .metadata{background:#f3f4f6;padding:8px;border-radius:4px;font-family:monospace;font-size:10px}
  </style>
</head>
<body>
  <h1>${report.title}</h1>
  <div class="card">
    <p><strong>Tipo:</strong> ${report.type}</p>
    <p><strong>Categoria:</strong> ${report.category}</p>
    <p><strong>Projeto:</strong> ${report.projectName}</p>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
    <p><strong>Score:</strong> <span class="score">${report.score}/100</span></p>
  </div>
  
  ${report.metadata ? `
  <div class="card">
    <h2>Metadados</h2>
    <div class="metadata">${JSON.stringify(report.metadata, null, 2)}</div>
  </div>` : ''}
  
  <div class="footer">Intentia Strategy Hub &bull; ${new Date().toLocaleDateString('pt-BR')}</div>
</body>
</html>`;
      }

      // Fazer download do HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Download concluÃ­do!");
    } catch (error) {
      console.error("Erro ao fazer download:", error);
      toast.error("Erro ao fazer download");
    }
  };

  const handleToggleFavorite = async (reportId: string) => {
    try {
      // Encontrar o relatÃ³rio atual
      const currentReport = reports.find(r => r.id === reportId);
      if (!currentReport) {
        console.error('RelatÃ³rio nÃ£o encontrado:', reportId);
        toast.error("RelatÃ³rio nÃ£o encontrado");
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
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
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
        <SEO title="RelatÃ³rios" description="Central de relatÃ³rios e anÃ¡lises" />
        <DashboardLayout>
          <FeatureGate featureKey="reports" withLayout={false} pageTitle="RelatÃ³rios">
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

  return (
    <>
      <SEO title="RelatÃ³rios" description="Central de relatÃ³rios e anÃ¡lises" />
      <DashboardLayout>
        <FeatureGate featureKey="reports" withLayout={false} pageTitle="RelatÃ³rios">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">RelatÃ³rios</h1>
                <p className="text-muted-foreground">
                  Central de relatÃ³rios e anÃ¡lises geradas pela plataforma
                </p>
              </div>
              <Button className="gap-2" onClick={loadReports}>
                <Download className="h-4 w-4" />
                Gerar RelatÃ³rio Consolidado
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de RelatÃ³rios</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.length}</div>
                  <p className="text-xs text-muted-foreground">Gerados este mÃªs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.filter(r => r.isFavorite).length}
                  </div>
                  <p className="text-xs text-muted-foreground">RelatÃ³rios marcados</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AnÃ¡lises de IA</CardTitle>
                  <Lightbulb className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.filter(r => r.type === "project_analysis" || r.type === "campaign_analysis").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Com inteligÃªncia artificial</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Score MÃ©dio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.score, 0) / reports.length) : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Qualidade geral</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar relatÃ³rios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-[180px]">
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
                      <SelectTrigger className="w-[180px]">
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
                      <SelectTrigger className="w-[150px]">
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
                    <h3 className="text-lg font-semibold mb-2">Nenhum relatÃ³rio encontrado</h3>
                    <p className="text-muted-foreground text-center">
                      Tente ajustar os filtros ou criar novas anÃ¡lises para gerar relatÃ³rios.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredProjects.map((project) => {
                  const isExpanded = expandedProjects.has(project.projectId);
                  const reportCount = project.reports.length;
                  const favoriteCount = project.reports.filter(r => r.isFavorite).length;
                  const avgScore = Math.round(project.reports.reduce((acc, r) => acc + r.score, 0) / reportCount);

                  return (
                    <div key={project.projectId} className="space-y-3">
                      {/* Project Header */}
                      <Card>
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
                                  {reportCount} relatÃ³rio{reportCount !== 1 ? "s" : ""}
                                  {favoriteCount > 0 && ` Â· ${favoriteCount} favorito${favoriteCount !== 1 ? "s" : ""}`}
                                  <span className="text-xs text-muted-foreground"> Â· Score mÃ©dio: {avgScore}/100</span>
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
                          {project.reports.map((report) => (
                            <Card key={report.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-2 rounded-lg border ${getTypeColor(report.type)}`}>
                                        {getTypeIcon(report.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground leading-tight">
                                          {report.title}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <Badge variant="secondary" className="text-xs">
                                            {report.category}
                                          </Badge>
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
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                                        {report.score}
                                      </div>
                                      <p className="text-xs text-muted-foreground">Score</p>
                                    </div>
                                    <div className="flex items-center gap-1">
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
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(report)}
                                        className="p-2"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
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





