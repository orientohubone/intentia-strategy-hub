export interface Report {
  id: string;
  title: string;
  type: string;
  category: string;
  projectName: string;
  projectId: string;
  date: string;
  isFavorite: boolean;
  format: string;
  score: number;
  metadata?: Record<string, unknown>;
  campaignName?: string;
  channel?: string;
}

export interface ProjectReports {
  projectName: string;
  projectId: string;
  reports: Report[];
}

export type ReportsCacheState = {
  reports: Report[];
  fetchedAt: number;
};

export const REPORT_TYPES = [
  { value: "all", label: "Todos os Tipos" },
  { value: "project_analysis", label: "Análise de Projeto" },
  { value: "campaign_analysis", label: "Performance" },
  { value: "benchmark", label: "Benchmark" },
  { value: "consolidated", label: "Consolidado" },
];

export const CATEGORIES = [
  { value: "all", label: "Todas as Categorias" },
  { value: "Análise de Projeto", label: "Análise de Projeto" },
  { value: "Performance", label: "Performance" },
  { value: "Benchmark", label: "Benchmark" },
  { value: "Consolidado", label: "Consolidado" },
];

export const SORT_OPTIONS = [
  { value: "date_desc", label: "Mais Recentes" },
  { value: "date_asc", label: "Mais Antigos" },
  { value: "name_asc", label: "Nome (A-Z)" },
  { value: "name_desc", label: "Nome (Z-A)" },
  { value: "score_desc", label: "Maior Score" },
  { value: "score_asc", label: "Menor Score" },
];

export const TYPE_CATEGORY_FALLBACK: Record<string, string> = {
  project_analysis: "Análise de Projeto",
  campaign_analysis: "Performance",
  benchmark: "Benchmark Competitivo",
  consolidated: "Consolidado",
};
