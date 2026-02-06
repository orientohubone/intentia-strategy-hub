import { supabase } from "@/integrations/supabase/client";
import type { AiAnalysisResult, BenchmarkAiResult } from "./aiAnalyzer";
import type { UrlAnalysis } from "./urlAnalyzer";

// =====================================================
// TYPES
// =====================================================

interface ProjectReport {
  project: {
    id: string;
    name: string;
    niche: string;
    url: string;
    score: number;
    status: string;
    created_at: string;
    competitor_urls: string[];
  };
  heuristic?: UrlAnalysis;
  ai?: AiAnalysisResult;
  channelScores: { channel: string; score: number; objective?: string; is_recommended?: boolean; risks?: string[] }[];
  insights: { type: string; title: string; description: string; action?: string }[];
  benchmarks: {
    competitor_name: string;
    competitor_url: string;
    overall_score: number;
    score_gap: number;
    strengths: string[];
    weaknesses: string[];
    ai_analysis?: BenchmarkAiResult;
  }[];
}

// =====================================================
// HELPERS
// =====================================================

function formatDate(iso?: string): string {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
}

function scoreColor(v: number): string {
  return v >= 70 ? "#22c55e" : v >= 50 ? "#eab308" : "#ef4444";
}

function priorityLabel(p: string): string {
  return { high: "Alta", medium: "Média", low: "Baixa" }[p] || p;
}

function verdictLabel(v: string): string {
  return { recommended: "Recomendado", caution: "Cautela", not_recommended: "Não recomendado" }[v] || v;
}

function readinessLabel(l: string): string {
  return { high: "Alto", medium: "Médio", low: "Baixo" }[l] || l;
}

const channelNames: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  linkedin: "LinkedIn Ads",
  tiktok: "TikTok Ads",
};

// =====================================================
// FETCH PROJECT DATA
// =====================================================

export async function fetchProjectReport(projectId: string, userId: string): Promise<ProjectReport> {
  const [projectRes, channelsRes, insightsRes, benchmarksRes] = await Promise.all([
    (supabase as any).from("projects").select("*").eq("id", projectId).eq("user_id", userId).single(),
    (supabase as any).from("project_channel_scores").select("channel, score, objective, is_recommended, risks").eq("project_id", projectId),
    (supabase as any).from("insights").select("type, title, description, action").eq("project_id", projectId),
    (supabase as any).from("benchmarks").select("competitor_name, competitor_url, overall_score, strengths, weaknesses, ai_analysis").eq("project_id", projectId),
  ]);

  const project = projectRes.data;
  const projectScore = project?.score || 0;

  return {
    project: {
      id: project?.id || projectId,
      name: project?.name || "Projeto",
      niche: project?.niche || "",
      url: project?.url || "",
      score: projectScore,
      status: project?.status || "pending",
      created_at: project?.created_at || "",
      competitor_urls: project?.competitor_urls || [],
    },
    heuristic: project?.heuristic_analysis as UrlAnalysis | undefined,
    ai: project?.ai_analysis as AiAnalysisResult | undefined,
    channelScores: (channelsRes.data || []).map((c: any) => ({
      channel: c.channel,
      score: c.score,
      objective: c.objective,
      is_recommended: c.is_recommended,
      risks: c.risks,
    })),
    insights: (insightsRes.data || []).map((i: any) => ({
      type: i.type,
      title: i.title,
      description: i.description,
      action: i.action,
    })),
    benchmarks: (benchmarksRes.data || []).map((b: any) => ({
      competitor_name: b.competitor_name,
      competitor_url: b.competitor_url,
      overall_score: b.overall_score,
      score_gap: b.overall_score - projectScore,
      strengths: b.strengths || [],
      weaknesses: b.weaknesses || [],
      ai_analysis: b.ai_analysis as BenchmarkAiResult | undefined,
    })),
  };
}

// =====================================================
// CONSOLIDATED PDF REPORT
// =====================================================

export function generateConsolidatedReport(report: ProjectReport) {
  const { project, heuristic, ai, channelScores, insights, benchmarks } = report;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const w = (html: string) => printWindow.document.write(html);

  w(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório — ${project.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;padding:30px;max-width:900px;margin:0 auto;line-height:1.5;font-size:12px}
h1{font-size:22px;color:#ea580c;margin-bottom:4px}
h2{font-size:16px;color:#333;margin:28px 0 10px;padding-bottom:6px;border-bottom:2px solid #f97316}
h3{font-size:13px;color:#555;margin:16px 0 6px}
.meta{color:#666;font-size:11px;margin-bottom:20px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin:8px 0}
.grid{display:grid;gap:10px}
.grid-2{grid-template-columns:1fr 1fr}
.grid-3{grid-template-columns:1fr 1fr 1fr}
.grid-4{grid-template-columns:1fr 1fr 1fr 1fr}
.grid-6{grid-template-columns:repeat(6,1fr)}
.score-card{text-align:center;padding:10px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb}
.score-card .value{font-size:22px;font-weight:700}
.score-card .label{font-size:9px;color:#666;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:11px;margin:8px 0}
th,td{padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f3f4f6;font-weight:600;font-size:10px;text-transform:uppercase;color:#666}
.summary{background:linear-gradient(135deg,#fff7ed,#fff);border-left:4px solid #f97316;padding:14px;border-radius:0 8px 8px 0;font-size:12px;margin:10px 0}
.tag{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;background:#f3f4f6;margin:2px}
.tag-warn{background:#fef3c7;color:#92400e}
.tag-opp{background:#dbeafe;color:#1e40af}
.tag-imp{background:#d1fae5;color:#065f46}
.swot{padding:10px;border-radius:8px;font-size:11px}
.swot.s{background:#f0fdf4;border:1px solid #bbf7d0}
.swot.w{background:#fef2f2;border:1px solid #fecaca}
.swot.o{background:#eff6ff;border:1px solid #bfdbfe}
.rec{padding:10px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:5px 0;font-size:11px}
.readiness{text-align:center;padding:16px}
.readiness .score{font-size:40px;font-weight:800}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#999;text-align:center}
.page-break{page-break-before:always}
.badge{display:inline-block;padding:2px 6px;border-radius:10px;font-size:9px;font-weight:600}
@media print{body{padding:15px}h2{break-before:auto}.page-break{break-before:page}}
@media(max-width:600px){.grid-2,.grid-3,.grid-4,.grid-6{grid-template-columns:1fr}}
</style>
</head>
<body>
`);

  // ===== COVER =====
  w(`<h1>Relatório Estratégico Completo</h1>`);
  w(`<p class="meta"><strong>${project.name}</strong> &bull; ${project.url} &bull; Nicho: ${project.niche} &bull; Score: ${project.score}/100</p>`);
  w(`<p class="meta">Gerado em ${formatDate(new Date().toISOString())}</p>`);

  // ===== HEURISTIC SECTION =====
  if (heuristic) {
    w(`<h2>1. Análise Heurística</h2>`);
    w(`<p class="meta">Score Geral: <strong style="color:${scoreColor(heuristic.overallScore)}">${heuristic.overallScore}/100</strong></p>`);

    w(`<div class="grid grid-6">`);
    const dims = [
      { l: "Proposta de Valor", v: heuristic.scores.valueProposition },
      { l: "Clareza", v: heuristic.scores.offerClarity },
      { l: "Jornada", v: heuristic.scores.userJourney },
      { l: "SEO", v: heuristic.scores.seoReadiness },
      { l: "Conversão", v: heuristic.scores.conversionOptimization },
      { l: "Conteúdo", v: heuristic.scores.contentQuality },
    ];
    for (const d of dims) {
      w(`<div class="score-card"><div class="value" style="color:${scoreColor(d.v)}">${d.v}</div><div class="label">${d.l}</div></div>`);
    }
    w(`</div>`);

    w(`<div class="grid grid-2" style="margin-top:10px">`);
    w(`<div class="card"><h3>Técnico</h3>`);
    const techs = [
      ["HTTPS", heuristic.technical.hasHttps],
      ["Mobile", heuristic.technical.hasViewport],
      ["Analytics", heuristic.technical.hasAnalytics],
      ["Pixel", heuristic.technical.hasPixel],
      ["Schema", heuristic.technical.hasStructuredData],
    ];
    for (const [label, val] of techs) {
      w(`<p style="font-size:11px">${val ? "✅" : "❌"} ${label}</p>`);
    }
    w(`</div>`);
    w(`<div class="card"><h3>Conteúdo</h3>`);
    w(`<p style="font-size:11px">${heuristic.content.wordCount} palavras &bull; ${heuristic.content.ctaCount} CTAs &bull; ${heuristic.content.formCount} formulários</p>`);
    w(`<p style="font-size:11px">${heuristic.content.imageCount} imagens &bull; ${heuristic.content.hasVideo ? "✅ Vídeo" : "❌ Vídeo"} &bull; ${heuristic.content.hasSocialProof ? "✅ Prova social" : "❌ Prova social"}</p>`);
    w(`</div></div>`);
  }

  // ===== CHANNEL SCORES =====
  if (channelScores.length > 0) {
    w(`<h2>2. Scores por Canal</h2>`);
    w(`<div class="grid grid-4">`);
    for (const ch of channelScores) {
      const name = channelNames[ch.channel] || ch.channel;
      w(`<div class="score-card">
        <div class="value" style="color:${scoreColor(ch.score)}">${ch.score}</div>
        <div class="label">${name}</div>
        <p style="font-size:9px;color:#666;margin-top:4px">${ch.is_recommended ? "✅ Recomendado" : "⚠️ Cautela"}</p>
        ${ch.objective ? `<p style="font-size:9px;color:#888">${ch.objective}</p>` : ""}
      </div>`);
    }
    w(`</div>`);
  }

  // ===== INSIGHTS =====
  if (insights.length > 0) {
    w(`<h2>3. Insights Estratégicos</h2>`);
    const typeLabels: Record<string, { label: string; cls: string; icon: string }> = {
      warning: { label: "Alerta", cls: "tag-warn", icon: "⚠️" },
      opportunity: { label: "Oportunidade", cls: "tag-opp", icon: "💡" },
      improvement: { label: "Melhoria", cls: "tag-imp", icon: "🔧" },
    };
    for (const ins of insights) {
      const cfg = typeLabels[ins.type] || typeLabels.improvement;
      w(`<div class="rec">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span>${cfg.icon}</span>
          <strong style="font-size:12px">${ins.title}</strong>
          <span class="tag ${cfg.cls}">${cfg.label}</span>
        </div>
        <p style="color:#555">${ins.description}</p>
        ${ins.action ? `<p style="color:#ea580c;font-size:10px;margin-top:4px">Ação: ${ins.action}</p>` : ""}
      </div>`);
    }
  }

  // ===== AI ANALYSIS =====
  if (ai) {
    w(`<h2 class="page-break">4. Análise por IA</h2>`);
    w(`<p class="meta">${ai.provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude"} (${ai.model}) &bull; ${formatDate(ai.analyzedAt)}</p>`);

    w(`<div class="summary">${ai.summary}</div>`);

    // Investment readiness
    const rc = scoreColor(ai.investmentReadiness.score);
    w(`<div class="grid grid-2" style="margin:12px 0">
      <div class="readiness card"><div class="score" style="color:${rc}">${ai.investmentReadiness.score}</div><p style="font-size:11px;color:#666">Prontidão — ${readinessLabel(ai.investmentReadiness.level)}</p></div>
      <div class="card" style="display:flex;align-items:center"><p style="font-size:12px">${ai.investmentReadiness.justification}</p></div>
    </div>`);

    // SWOT
    w(`<div class="grid grid-3">`);
    w(`<div class="swot s"><h3 style="color:#166534">Fortes</h3>${ai.strengths.map(s => `<p>✅ ${s}</p>`).join("")}</div>`);
    w(`<div class="swot w"><h3 style="color:#991b1b">Fraquezas</h3>${ai.weaknesses.map(s => `<p>❌ ${s}</p>`).join("")}</div>`);
    w(`<div class="swot o"><h3 style="color:#1e40af">Oportunidades</h3>${ai.opportunities.map(s => `<p>💡 ${s}</p>`).join("")}</div>`);
    w(`</div>`);

    // Channel recommendations
    w(`<h3>Recomendações por Canal</h3>`);
    w(`<table><thead><tr><th>Canal</th><th>Veredicto</th><th>Budget</th><th>Justificativa</th></tr></thead><tbody>`);
    for (const ch of ai.channelRecommendations) {
      w(`<tr><td><strong>${ch.channel}</strong></td><td>${verdictLabel(ch.verdict)}</td><td>${ch.suggestedBudgetAllocation}</td><td>${ch.reasoning}</td></tr>`);
    }
    w(`</tbody></table>`);

    // Strategic recommendations
    w(`<h3>Recomendações Estratégicas</h3>`);
    for (const rec of ai.recommendations) {
      w(`<div class="rec">
        <div style="display:flex;align-items:center;gap:6px">
          <strong>${rec.title}</strong>
          <span class="tag">${rec.category}</span>
          <span class="badge" style="background:${rec.priority === "high" ? "#fee2e2" : rec.priority === "medium" ? "#fef9c3" : "#dbeafe"};color:${rec.priority === "high" ? "#991b1b" : rec.priority === "medium" ? "#854d0e" : "#1e40af"}">${priorityLabel(rec.priority)}</span>
        </div>
        <p style="color:#555;margin:4px 0">${rec.description}</p>
        <p style="color:#ea580c;font-size:10px">Impacto: ${rec.expectedImpact}</p>
      </div>`);
    }

    if (ai.competitivePosition) {
      w(`<h3>Posição Competitiva</h3><div class="card"><p style="font-size:12px">${ai.competitivePosition}</p></div>`);
    }
  }

  // ===== BENCHMARKS =====
  if (benchmarks.length > 0) {
    w(`<h2 class="page-break">5. Benchmark Competitivo</h2>`);
    w(`<p class="meta">${benchmarks.length} concorrente(s) analisado(s)</p>`);

    for (const b of benchmarks) {
      const gapColor = b.score_gap > 0 ? "#ef4444" : "#22c55e";
      const gapLabel = b.score_gap > 0 ? `+${b.score_gap} (à frente)` : `${b.score_gap} (atrás)`;

      w(`<div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div>
            <strong style="font-size:13px">${b.competitor_name}</strong>
            <span style="font-size:10px;color:#666;margin-left:8px">${b.competitor_url}</span>
          </div>
          <div style="text-align:right">
            <span style="font-size:18px;font-weight:700;color:${scoreColor(b.overall_score)}">${b.overall_score}</span>
            <span style="font-size:10px;color:${gapColor};display:block">${gapLabel}</span>
          </div>
        </div>`);

      if (b.strengths.length > 0 || b.weaknesses.length > 0) {
        w(`<div class="grid grid-2">`);
        if (b.strengths.length > 0) {
          w(`<div><p style="font-size:10px;font-weight:600;color:#166534">Forças</p>${b.strengths.slice(0, 3).map(s => `<p style="font-size:10px">✅ ${s}</p>`).join("")}</div>`);
        }
        if (b.weaknesses.length > 0) {
          w(`<div><p style="font-size:10px;font-weight:600;color:#991b1b">Fraquezas</p>${b.weaknesses.slice(0, 3).map(s => `<p style="font-size:10px">❌ ${s}</p>`).join("")}</div>`);
        }
        w(`</div>`);
      }

      // Benchmark AI summary
      if (b.ai_analysis) {
        const bai = b.ai_analysis;
        w(`<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb">
          <p style="font-size:10px;font-weight:600;color:#ea580c">Análise IA</p>
          <p style="font-size:11px;margin:4px 0">${bai.executiveSummary}</p>
          <p style="font-size:10px;color:#666">Nível de ameaça: <strong style="color:${bai.overallVerdict.competitorThreatLevel >= 70 ? "#ef4444" : bai.overallVerdict.competitorThreatLevel >= 40 ? "#eab308" : "#22c55e"}">${bai.overallVerdict.competitorThreatLevel}/100</strong></p>
        </div>`);
      }

      w(`</div>`);
    }
  }

  // ===== FOOTER =====
  w(`<div class="footer">
    <p>Relatório gerado por <strong>Intentia Strategy Hub</strong> &bull; ${formatDate(new Date().toISOString())}</p>
    <p>${project.name} &bull; ${project.url} &bull; ${project.niche}</p>
  </div>`);

  w(`</body></html>`);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 600);
}

// =====================================================
// SECTION EXPORT: DASHBOARD
// =====================================================

interface DashboardExportData {
  userName: string;
  companyName: string;
  projects: { name: string; score: number; status: string; niche: string; url: string }[];
  totalProjects: number;
  completedProjects: number;
  averageScore: number;
  channelScores: { channel: string; score: number }[];
  recentInsights: { type: string; title: string; description: string }[];
  audiencesCount: number;
  benchmarksCount: number;
}

export function exportDashboardPdf(data: DashboardExportData) {
  const pw = window.open("", "_blank");
  if (!pw) return;
  const w = (h: string) => pw.document.write(h);

  w(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Dashboard — ${data.companyName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;padding:30px;max-width:900px;margin:0 auto;line-height:1.5;font-size:12px}
h1{font-size:20px;color:#ea580c;margin-bottom:4px}
h2{font-size:15px;color:#333;margin:24px 0 8px;padding-bottom:6px;border-bottom:2px solid #f97316}
.meta{color:#666;font-size:11px;margin-bottom:16px}
.grid{display:grid;gap:8px}
.grid-2{grid-template-columns:1fr 1fr}
.grid-4{grid-template-columns:1fr 1fr 1fr 1fr}
.stat{text-align:center;padding:12px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb}
.stat .value{font-size:24px;font-weight:700;color:#ea580c}
.stat .label{font-size:10px;color:#666}
table{width:100%;border-collapse:collapse;font-size:11px;margin:8px 0}
th,td{padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f3f4f6;font-weight:600;font-size:10px;text-transform:uppercase;color:#666}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#999;text-align:center}
@media print{body{padding:15px}}
</style></head><body>`);

  w(`<h1>Dashboard — ${data.companyName}</h1>`);
  w(`<p class="meta">${data.userName} &bull; ${formatDate(new Date().toISOString())}</p>`);

  w(`<div class="grid grid-4">`);
  w(`<div class="stat"><div class="value">${data.totalProjects}</div><div class="label">Projetos</div></div>`);
  w(`<div class="stat"><div class="value">${data.completedProjects}</div><div class="label">Concluídos</div></div>`);
  w(`<div class="stat"><div class="value">${Math.round(data.averageScore)}</div><div class="label">Score Médio</div></div>`);
  w(`<div class="stat"><div class="value">${data.audiencesCount}</div><div class="label">Públicos</div></div>`);
  w(`</div>`);

  if (data.projects.length > 0) {
    w(`<h2>Projetos</h2>`);
    w(`<table><thead><tr><th>Nome</th><th>Nicho</th><th>Score</th><th>Status</th></tr></thead><tbody>`);
    for (const p of data.projects) {
      w(`<tr><td><strong>${p.name}</strong></td><td>${p.niche}</td><td style="color:${scoreColor(p.score)};font-weight:700">${p.score}</td><td>${p.status}</td></tr>`);
    }
    w(`</tbody></table>`);
  }

  if (data.recentInsights.length > 0) {
    w(`<h2>Insights Recentes</h2>`);
    for (const ins of data.recentInsights.slice(0, 10)) {
      const icon = ins.type === "warning" ? "⚠️" : ins.type === "opportunity" ? "💡" : "🔧";
      w(`<p style="margin:4px 0">${icon} <strong>${ins.title}</strong> — ${ins.description}</p>`);
    }
  }

  w(`<div class="footer">Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div></body></html>`);
  pw.document.close();
  setTimeout(() => pw.print(), 500);
}

// =====================================================
// SECTION EXPORT: INSIGHTS
// =====================================================

interface InsightsExportData {
  insights: { type: string; title: string; description: string; action?: string; project_name?: string; created_at?: string }[];
  counts: { warnings: number; opportunities: number; improvements: number };
}

export function exportInsightsPdf(data: InsightsExportData) {
  const pw = window.open("", "_blank");
  if (!pw) return;
  const w = (h: string) => pw.document.write(h);

  w(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Insights Estratégicos</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;padding:30px;max-width:900px;margin:0 auto;line-height:1.5;font-size:12px}
h1{font-size:20px;color:#ea580c;margin-bottom:4px}
h2{font-size:15px;color:#333;margin:24px 0 8px;padding-bottom:6px;border-bottom:2px solid #f97316}
.meta{color:#666;font-size:11px;margin-bottom:16px}
.grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
.stat{text-align:center;padding:12px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb}
.stat .value{font-size:24px;font-weight:700}
.stat .label{font-size:10px;color:#666}
.rec{padding:10px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:5px 0;font-size:11px}
.tag{display:inline-block;padding:2px 6px;border-radius:10px;font-size:9px;font-weight:600;margin-left:6px}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#999;text-align:center}
@media print{body{padding:15px}}
</style></head><body>`);

  w(`<h1>Insights Estratégicos</h1>`);
  w(`<p class="meta">${data.insights.length} insights &bull; ${formatDate(new Date().toISOString())}</p>`);

  w(`<div class="grid-3">`);
  w(`<div class="stat"><div class="value" style="color:#eab308">${data.counts.warnings}</div><div class="label">Alertas</div></div>`);
  w(`<div class="stat"><div class="value" style="color:#3b82f6">${data.counts.opportunities}</div><div class="label">Oportunidades</div></div>`);
  w(`<div class="stat"><div class="value" style="color:#22c55e">${data.counts.improvements}</div><div class="label">Melhorias</div></div>`);
  w(`</div>`);

  const typeIcons: Record<string, string> = { warning: "⚠️", opportunity: "💡", improvement: "🔧" };
  const typeColors: Record<string, string> = { warning: "background:#fef3c7;color:#92400e", opportunity: "background:#dbeafe;color:#1e40af", improvement: "background:#d1fae5;color:#065f46" };
  const typeLabels: Record<string, string> = { warning: "Alerta", opportunity: "Oportunidade", improvement: "Melhoria" };

  for (const ins of data.insights) {
    w(`<div class="rec">
      <div style="display:flex;align-items:center;gap:4px">
        <span>${typeIcons[ins.type] || "🔧"}</span>
        <strong>${ins.title}</strong>
        <span class="tag" style="${typeColors[ins.type] || ""}">${typeLabels[ins.type] || ins.type}</span>
        ${ins.project_name ? `<span style="font-size:9px;color:#888;margin-left:auto">${ins.project_name}</span>` : ""}
      </div>
      <p style="color:#555;margin:4px 0">${ins.description}</p>
      ${ins.action ? `<p style="color:#ea580c;font-size:10px">Ação: ${ins.action}</p>` : ""}
    </div>`);
  }

  w(`<div class="footer">Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div></body></html>`);
  pw.document.close();
  setTimeout(() => pw.print(), 500);
}

// =====================================================
// SECTION EXPORT: BENCHMARKS
// =====================================================

interface BenchmarksExportData {
  benchmarks: {
    competitor_name: string;
    competitor_url: string;
    competitor_niche: string;
    overall_score: number;
    score_gap: number;
    strengths: string[];
    weaknesses: string[];
    project_name: string;
  }[];
  totalBenchmarks: number;
  averageScore: number;
}

export function exportBenchmarksPdf(data: BenchmarksExportData) {
  const pw = window.open("", "_blank");
  if (!pw) return;
  const w = (h: string) => pw.document.write(h);

  w(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Benchmarks Competitivos</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;padding:30px;max-width:900px;margin:0 auto;line-height:1.5;font-size:12px}
h1{font-size:20px;color:#ea580c;margin-bottom:4px}
h2{font-size:15px;color:#333;margin:24px 0 8px;padding-bottom:6px;border-bottom:2px solid #f97316}
.meta{color:#666;font-size:11px;margin-bottom:16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:14px;margin:8px 0}
table{width:100%;border-collapse:collapse;font-size:11px;margin:8px 0}
th,td{padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f3f4f6;font-weight:600;font-size:10px;text-transform:uppercase;color:#666}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#999;text-align:center}
@media print{body{padding:15px}}
</style></head><body>`);

  w(`<h1>Benchmarks Competitivos</h1>`);
  w(`<p class="meta">${data.totalBenchmarks} concorrentes &bull; Score médio: ${Math.round(data.averageScore)} &bull; ${formatDate(new Date().toISOString())}</p>`);

  w(`<table><thead><tr><th>Concorrente</th><th>Projeto</th><th>Score</th><th>Gap</th><th>Forças</th><th>Fraquezas</th></tr></thead><tbody>`);
  for (const b of data.benchmarks) {
    const gapColor = b.score_gap > 0 ? "#ef4444" : "#22c55e";
    w(`<tr>
      <td><strong>${b.competitor_name}</strong><br><span style="font-size:9px;color:#888">${b.competitor_url}</span></td>
      <td>${b.project_name}</td>
      <td style="font-weight:700;color:${scoreColor(b.overall_score)}">${b.overall_score}</td>
      <td style="color:${gapColor}">${b.score_gap > 0 ? "+" : ""}${b.score_gap}</td>
      <td style="font-size:10px">${b.strengths.slice(0, 2).join("; ") || "—"}</td>
      <td style="font-size:10px">${b.weaknesses.slice(0, 2).join("; ") || "—"}</td>
    </tr>`);
  }
  w(`</tbody></table>`);

  w(`<div class="footer">Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div></body></html>`);
  pw.document.close();
  setTimeout(() => pw.print(), 500);
}
