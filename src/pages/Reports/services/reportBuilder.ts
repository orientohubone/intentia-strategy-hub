import { Report } from "../types";

export const buildConsolidatedReport = (sourceReports: Report[]): Report => {
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
