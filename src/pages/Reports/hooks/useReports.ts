import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Report, ReportsCacheState, TYPE_CATEGORY_FALLBACK } from "../types";
import { toNumber } from "../utils/formatters";

const CACHE_TTL_MS = 2 * 60 * 1000;
const reportsCache = new Map<string, ReportsCacheState>();

export const useReports = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);

  const loadReports = useCallback(async (options?: { silent?: boolean }) => {
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
//       console.log("Relatórios carregados:", finalReports.length);
      return finalReports;
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error?.message || "Unknown error");
      toast.error("Erro ao carregar relatórios");
      return [] as Report[];
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  }, [userId]);

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
  }, [userId, loadReports]);

  return { reports, loading, loadReports, setReports };
};
