// =====================================================
// CSV EXPORT UTILITIES
// =====================================================

function escapeCsv(value: any): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes(";")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: string[][]): string {
  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const headerLine = headers.map(escapeCsv).join(";");
  const dataLines = rows.map((row) => row.map(escapeCsv).join(";"));
  return bom + [headerLine, ...dataLines].join("\n");
}

function downloadCsv(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR");
}

// =====================================================
// PROJECTS CSV
// =====================================================

interface ProjectCsvRow {
  name: string;
  niche: string;
  url: string;
  score: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export function exportProjectsCsv(projects: ProjectCsvRow[]) {
  const headers = ["Nome", "Nicho", "URL", "Score", "Status", "Criado em", "Atualizado em"];
  const rows = projects.map((p) => [
    p.name,
    p.niche,
    p.url,
    String(p.score),
    p.status,
    formatDate(p.created_at),
    formatDate(p.updated_at),
  ]);
  downloadCsv(buildCsv(headers, rows), "projetos.csv");
}

// =====================================================
// INSIGHTS CSV
// =====================================================

interface InsightCsvRow {
  type: string;
  title: string;
  description: string;
  action?: string | null;
  project_name?: string;
  created_at?: string;
}

const typeLabels: Record<string, string> = {
  warning: "Alerta",
  opportunity: "Oportunidade",
  improvement: "Melhoria",
};

export function exportInsightsCsv(insights: InsightCsvRow[]) {
  const headers = ["Tipo", "Título", "Descrição", "Ação Recomendada", "Projeto", "Data"];
  const rows = insights.map((i) => [
    typeLabels[i.type] || i.type,
    i.title,
    i.description,
    i.action || "",
    i.project_name || "",
    formatDate(i.created_at),
  ]);
  downloadCsv(buildCsv(headers, rows), "insights.csv");
}

// =====================================================
// BENCHMARKS CSV
// =====================================================

interface BenchmarkCsvRow {
  competitor_name: string;
  competitor_url: string;
  competitor_niche: string;
  overall_score: number;
  score_gap: number;
  value_proposition_score?: number;
  offer_clarity_score?: number;
  user_journey_score?: number;
  project_name: string;
  created_at?: string;
}

export function exportBenchmarksCsv(benchmarks: BenchmarkCsvRow[]) {
  const headers = [
    "Concorrente",
    "URL",
    "Nicho",
    "Score Geral",
    "Gap",
    "Proposta de Valor",
    "Clareza",
    "Jornada",
    "Projeto",
    "Data",
  ];
  const rows = benchmarks.map((b) => [
    b.competitor_name,
    b.competitor_url,
    b.competitor_niche,
    String(b.overall_score),
    String(b.score_gap),
    String(b.value_proposition_score ?? ""),
    String(b.offer_clarity_score ?? ""),
    String(b.user_journey_score ?? ""),
    b.project_name,
    formatDate(b.created_at),
  ]);
  downloadCsv(buildCsv(headers, rows), "benchmarks.csv");
}

// =====================================================
// CHANNEL SCORES CSV
// =====================================================

interface ChannelScoreCsvRow {
  project_name: string;
  channel: string;
  score: number;
  objective?: string | null;
  is_recommended?: boolean | null;
  risks?: string[] | null;
}

const channelNames: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  linkedin: "LinkedIn Ads",
  tiktok: "TikTok Ads",
};

export function exportChannelScoresCsv(scores: ChannelScoreCsvRow[]) {
  const headers = ["Projeto", "Canal", "Score", "Objetivo", "Recomendado", "Riscos"];
  const rows = scores.map((s) => [
    s.project_name,
    channelNames[s.channel] || s.channel,
    String(s.score),
    s.objective || "",
    s.is_recommended ? "Sim" : "Não",
    (s.risks || []).join(", "),
  ]);
  downloadCsv(buildCsv(headers, rows), "channel_scores.csv");
}

// =====================================================
// AUDIENCES CSV
// =====================================================

interface AudienceCsvRow {
  name: string;
  description?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  keywords?: string[];
  project_name?: string;
  created_at?: string;
}

export function exportAudiencesCsv(audiences: AudienceCsvRow[]) {
  const headers = ["Nome", "Descrição", "Indústria", "Porte", "Localização", "Keywords", "Projeto", "Data"];
  const rows = audiences.map((a) => [
    a.name,
    a.description || "",
    a.industry || "",
    a.company_size || "",
    a.location || "",
    (a.keywords || []).join(", "),
    a.project_name || "",
    formatDate(a.created_at),
  ]);
  downloadCsv(buildCsv(headers, rows), "publicos_alvo.csv");
}

// =====================================================
// DASHBOARD SUMMARY CSV
// =====================================================

interface DashboardCsvData {
  projects: ProjectCsvRow[];
  insights: InsightCsvRow[];
  channelScores: ChannelScoreCsvRow[];
}

export function exportDashboardCsv(data: DashboardCsvData) {
  // Export projects as the main dashboard CSV
  exportProjectsCsv(data.projects);
}
