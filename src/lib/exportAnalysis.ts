import type { AiAnalysisResult, BenchmarkAiResult, PerformanceAiResult } from "./aiAnalyzer";
import type { UrlAnalysis } from "./urlAnalyzer";

interface ExportData {
  projectName: string;
  projectUrl: string;
  projectNiche: string;
  heuristic?: UrlAnalysis;
  ai?: AiAnalysisResult;
}

// =====================================================
// HELPERS
// =====================================================

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 50);
}

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

function verdictLabel(v: string): string {
  const map: Record<string, string> = {
    recommended: "Recomendado",
    caution: "Cautela",
    not_recommended: "Não recomendado",
  };
  return map[v] || v;
}

function priorityLabel(p: string): string {
  const map: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };
  return map[p] || p;
}

function readinessLabel(l: string): string {
  const map: Record<string, string> = { high: "Alto", medium: "Médio", low: "Baixo" };
  return map[l] || l;
}

// =====================================================
// JSON EXPORT
// =====================================================

export function exportAsJson(data: ExportData) {
  const json = JSON.stringify(
    {
      projeto: {
        nome: data.projectName,
        url: data.projectUrl,
        nicho: data.projectNiche,
      },
      analise_heuristica: data.heuristic || null,
      analise_ia: data.ai || null,
      exportado_em: new Date().toISOString(),
    },
    null,
    2
  );
  downloadFile(json, `analise_${sanitizeFilename(data.projectName)}.json`, "application/json");
}

// =====================================================
// MARKDOWN EXPORT
// =====================================================

export function exportAsMarkdown(data: ExportData) {
  const lines: string[] = [];
  const { projectName, projectUrl, projectNiche, heuristic, ai } = data;

  lines.push(`# Análise Estratégica — ${projectName}`);
  lines.push("");
  lines.push(`- **URL:** ${projectUrl}`);
  lines.push(`- **Nicho:** ${projectNiche}`);
  lines.push(`- **Exportado em:** ${formatDate(new Date().toISOString())}`);
  lines.push("");

  // Heuristic
  if (heuristic) {
    lines.push("---");
    lines.push("");
    lines.push("## Análise Heurística");
    lines.push("");
    lines.push(`**Score Geral:** ${heuristic.overallScore}/100`);
    lines.push("");
    lines.push("### Scores por Dimensão");
    lines.push("");
    lines.push(`| Dimensão | Score |`);
    lines.push(`|----------|-------|`);
    lines.push(`| Proposta de Valor | ${heuristic.scores.valueProposition} |`);
    lines.push(`| Clareza da Oferta | ${heuristic.scores.offerClarity} |`);
    lines.push(`| Jornada do Usuário | ${heuristic.scores.userJourney} |`);
    lines.push(`| SEO | ${heuristic.scores.seoReadiness} |`);
    lines.push(`| Conversão | ${heuristic.scores.conversionOptimization} |`);
    lines.push(`| Conteúdo | ${heuristic.scores.contentQuality} |`);
    lines.push("");

    lines.push("### Técnico");
    lines.push("");
    lines.push(`- HTTPS: ${heuristic.technical.hasHttps ? "Sim" : "Não"}`);
    lines.push(`- Mobile (viewport): ${heuristic.technical.hasViewport ? "Sim" : "Não"}`);
    lines.push(`- Analytics: ${heuristic.technical.hasAnalytics ? "Sim" : "Não"}`);
    lines.push(`- Pixel: ${heuristic.technical.hasPixel ? "Sim" : "Não"}`);
    lines.push(`- Schema/Structured Data: ${heuristic.technical.hasStructuredData ? "Sim" : "Não"}`);
    lines.push("");

    lines.push("### Conteúdo");
    lines.push("");
    lines.push(`- Palavras: ${heuristic.content.wordCount}`);
    lines.push(`- CTAs: ${heuristic.content.ctaCount}`);
    lines.push(`- Formulários: ${heuristic.content.formCount}`);
    lines.push(`- Imagens: ${heuristic.content.imageCount} (${heuristic.content.imagesWithAlt} com alt)`);
    lines.push(`- Vídeo: ${heuristic.content.hasVideo ? "Sim" : "Não"}`);
    lines.push(`- Prova social: ${heuristic.content.hasSocialProof ? "Sim" : "Não"}`);
    lines.push(`- FAQ: ${heuristic.content.hasFAQ ? "Sim" : "Não"}`);
    lines.push("");

    if (heuristic.insights.length > 0) {
      lines.push("### Insights Heurísticos");
      lines.push("");
      for (const ins of heuristic.insights) {
        const icon = ins.type === "warning" ? "⚠️" : ins.type === "opportunity" ? "💡" : "🔧";
        lines.push(`- ${icon} **${ins.title}** — ${ins.description}`);
        if (ins.action) lines.push(`  - Ação: ${ins.action}`);
      }
      lines.push("");
    }
  }

  // AI
  if (ai) {
    lines.push("---");
    lines.push("");
    lines.push("## Análise por IA");
    lines.push("");
    lines.push(`- **Modelo:** ${ai.provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude"} (${ai.model})`);
    lines.push(`- **Analisado em:** ${formatDate(ai.analyzedAt)}`);
    lines.push("");

    lines.push("### Resumo Executivo");
    lines.push("");
    lines.push(ai.summary);
    lines.push("");

    lines.push("### Prontidão para Investimento");
    lines.push("");
    lines.push(`- **Score:** ${ai.investmentReadiness.score}/100`);
    lines.push(`- **Nível:** ${readinessLabel(ai.investmentReadiness.level)}`);
    lines.push(`- **Justificativa:** ${ai.investmentReadiness.justification}`);
    lines.push("");

    lines.push("### Pontos Fortes");
    lines.push("");
    for (const s of ai.strengths) lines.push(`- ✅ ${s}`);
    lines.push("");

    lines.push("### Fraquezas");
    lines.push("");
    for (const w of ai.weaknesses) lines.push(`- ❌ ${w}`);
    lines.push("");

    lines.push("### Oportunidades");
    lines.push("");
    for (const o of ai.opportunities) lines.push(`- 💡 ${o}`);
    lines.push("");

    lines.push("### Recomendações por Canal");
    lines.push("");
    lines.push(`| Canal | Veredicto | Budget | Justificativa |`);
    lines.push(`|-------|-----------|--------|---------------|`);
    for (const ch of ai.channelRecommendations) {
      lines.push(`| ${ch.channel} | ${verdictLabel(ch.verdict)} | ${ch.suggestedBudgetAllocation} | ${ch.reasoning} |`);
    }
    lines.push("");

    lines.push("### Recomendações Estratégicas");
    lines.push("");
    for (const rec of ai.recommendations) {
      lines.push(`#### ${rec.title}`);
      lines.push(`- **Prioridade:** ${priorityLabel(rec.priority)}`);
      lines.push(`- **Categoria:** ${rec.category}`);
      lines.push(`- **Descrição:** ${rec.description}`);
      lines.push(`- **Impacto esperado:** ${rec.expectedImpact}`);
      lines.push("");
    }

    if (ai.competitivePosition) {
      lines.push("### Posição Competitiva");
      lines.push("");
      lines.push(ai.competitivePosition);
      lines.push("");
    }
  }

  const md = lines.join("\n");
  downloadFile(md, `analise_${sanitizeFilename(projectName)}.md`, "text/markdown");
}

// =====================================================
// HTML EXPORT
// =====================================================

export function exportAsHtml(data: ExportData) {
  const { projectName, projectUrl, projectNiche, heuristic, ai } = data;

  const scoreBar = (value: number) => {
    const color = value >= 70 ? "#22c55e" : value >= 50 ? "#eab308" : "#ef4444";
    return `<div style="display:flex;align-items:center;gap:8px"><span style="font-weight:700;color:${color}">${value}</span><div style="flex:1;height:6px;background:#e5e7eb;border-radius:3px"><div style="height:100%;width:${value}%;background:${color};border-radius:3px"></div></div></div>`;
  };

  const verdictBadge = (v: string) => {
    const colors: Record<string, string> = {
      recommended: "background:#dcfce7;color:#166534",
      caution: "background:#fef9c3;color:#854d0e",
      not_recommended: "background:#fee2e2;color:#991b1b",
    };
    return `<span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;${colors[v] || ""}">${verdictLabel(v)}</span>`;
  };

  const priorityDot = (p: string) => {
    const colors: Record<string, string> = { high: "#ef4444", medium: "#eab308", low: "#3b82f6" };
    return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[p] || "#9ca3af"}"></span>`;
  };

  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Análise Estratégica — ${projectName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#fff;padding:40px;max-width:900px;margin:0 auto;line-height:1.6}
h1{font-size:24px;color:#ea580c;margin-bottom:4px}
h2{font-size:18px;color:#333;margin:32px 0 12px;padding-bottom:8px;border-bottom:2px solid #f97316}
h3{font-size:14px;color:#555;margin:20px 0 8px}
.meta{color:#666;font-size:13px;margin-bottom:24px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:8px 0}
.grid{display:grid;gap:12px}
.grid-2{grid-template-columns:1fr 1fr}
.grid-3{grid-template-columns:1fr 1fr 1fr}
.grid-6{grid-template-columns:repeat(6,1fr)}
.score-card{text-align:center;padding:12px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb}
.score-card .value{font-size:24px;font-weight:700}
.score-card .label{font-size:10px;color:#666;margin-top:4px}
table{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f3f4f6;font-weight:600;font-size:12px;text-transform:uppercase;color:#666}
.tag{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;background:#f3f4f6;margin:2px}
.summary{background:linear-gradient(135deg,#fff7ed,#fff);border-left:4px solid #f97316;padding:16px;border-radius:0 8px 8px 0;font-size:14px}
.swot{padding:12px;border-radius:8px;font-size:12px}
.swot.strength{background:#f0fdf4;border:1px solid #bbf7d0}
.swot.weakness{background:#fef2f2;border:1px solid #fecaca}
.swot.opportunity{background:#eff6ff;border:1px solid #bfdbfe}
.swot p{margin:4px 0}
.rec{padding:12px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:6px 0}
.rec .title{font-weight:600;font-size:13px}
.rec .desc{font-size:12px;color:#555;margin:4px 0}
.rec .impact{font-size:11px;color:#ea580c;font-weight:500}
.readiness{text-align:center;padding:20px}
.readiness .score{font-size:48px;font-weight:800}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#999;text-align:center}
@media print{body{padding:20px}h2{break-before:auto}}
@media(max-width:600px){.grid-2,.grid-3,.grid-6{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>Análise Estratégica</h1>
<p class="meta"><strong>${projectName}</strong> &bull; ${projectUrl} &bull; Nicho: ${projectNiche}</p>
`;

  // Heuristic
  if (heuristic) {
    html += `<h2>Análise Heurística</h2>`;
    html += `<div class="grid grid-6" style="margin:12px 0">`;
    const dims = [
      { label: "Proposta de Valor", value: heuristic.scores.valueProposition },
      { label: "Clareza", value: heuristic.scores.offerClarity },
      { label: "Jornada", value: heuristic.scores.userJourney },
      { label: "SEO", value: heuristic.scores.seoReadiness },
      { label: "Conversão", value: heuristic.scores.conversionOptimization },
      { label: "Conteúdo", value: heuristic.scores.contentQuality },
    ];
    for (const d of dims) {
      const color = d.value >= 70 ? "#22c55e" : d.value >= 50 ? "#eab308" : "#ef4444";
      html += `<div class="score-card"><div class="value" style="color:${color}">${d.value}</div><div class="label">${d.label}</div></div>`;
    }
    html += `</div>`;

    html += `<div class="grid grid-2">`;
    html += `<div class="card"><h3>Técnico</h3>`;
    const techs = [
      ["HTTPS", heuristic.technical.hasHttps],
      ["Mobile", heuristic.technical.hasViewport],
      ["Analytics", heuristic.technical.hasAnalytics],
      ["Pixel", heuristic.technical.hasPixel],
      ["Schema", heuristic.technical.hasStructuredData],
    ];
    for (const [label, val] of techs) {
      html += `<p style="font-size:12px">${val ? "✅" : "❌"} ${label}</p>`;
    }
    html += `</div>`;
    html += `<div class="card"><h3>Conteúdo</h3>`;
    html += `<p style="font-size:12px">${heuristic.content.wordCount} palavras &bull; ${heuristic.content.ctaCount} CTAs &bull; ${heuristic.content.formCount} formulários</p>`;
    html += `<p style="font-size:12px">${heuristic.content.imageCount} imagens &bull; ${heuristic.content.hasVideo ? "✅ Vídeo" : "❌ Vídeo"} &bull; ${heuristic.content.hasSocialProof ? "✅ Prova social" : "❌ Prova social"}</p>`;
    html += `</div></div>`;

    if (heuristic.insights.length > 0) {
      html += `<h3>Insights</h3>`;
      for (const ins of heuristic.insights) {
        const icon = ins.type === "warning" ? "⚠️" : ins.type === "opportunity" ? "💡" : "🔧";
        html += `<div class="rec"><span class="title">${icon} ${ins.title}</span><p class="desc">${ins.description}</p>${ins.action ? `<p class="impact">Ação: ${ins.action}</p>` : ""}</div>`;
      }
    }
  }

  // AI
  if (ai) {
    html += `<h2>Análise por IA</h2>`;
    html += `<p class="meta">${ai.provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude"} (${ai.model}) &bull; ${formatDate(ai.analyzedAt)}</p>`;

    html += `<div class="summary">${ai.summary}</div>`;

    // Investment readiness
    const readColor = ai.investmentReadiness.score >= 70 ? "#22c55e" : ai.investmentReadiness.score >= 50 ? "#eab308" : "#ef4444";
    html += `<div class="grid grid-2" style="margin:16px 0">`;
    html += `<div class="readiness card"><div class="score" style="color:${readColor}">${ai.investmentReadiness.score}</div><p style="font-size:12px;color:#666">Prontidão para Investimento — ${readinessLabel(ai.investmentReadiness.level)}</p></div>`;
    html += `<div class="card" style="display:flex;align-items:center"><p style="font-size:13px">${ai.investmentReadiness.justification}</p></div>`;
    html += `</div>`;

    // SWOT
    html += `<div class="grid grid-3">`;
    html += `<div class="swot strength"><h3 style="color:#166534">Pontos Fortes</h3>`;
    for (const s of ai.strengths) html += `<p>✅ ${s}</p>`;
    html += `</div>`;
    html += `<div class="swot weakness"><h3 style="color:#991b1b">Fraquezas</h3>`;
    for (const w of ai.weaknesses) html += `<p>❌ ${w}</p>`;
    html += `</div>`;
    html += `<div class="swot opportunity"><h3 style="color:#1e40af">Oportunidades</h3>`;
    for (const o of ai.opportunities) html += `<p>💡 ${o}</p>`;
    html += `</div></div>`;

    // Channel recommendations
    html += `<h3>Recomendações por Canal</h3>`;
    html += `<table><thead><tr><th>Canal</th><th>Veredicto</th><th>Budget</th><th>Justificativa</th></tr></thead><tbody>`;
    for (const ch of ai.channelRecommendations) {
      html += `<tr><td><strong>${ch.channel}</strong></td><td>${verdictBadge(ch.verdict)}</td><td>${ch.suggestedBudgetAllocation}</td><td>${ch.reasoning}</td></tr>`;
    }
    html += `</tbody></table>`;

    // Recommendations
    html += `<h3>Recomendações Estratégicas</h3>`;
    for (const rec of ai.recommendations) {
      html += `<div class="rec"><div style="display:flex;align-items:center;gap:6px">${priorityDot(rec.priority)} <span class="title">${rec.title}</span> <span class="tag">${rec.category}</span></div><p class="desc">${rec.description}</p><p class="impact">Impacto: ${rec.expectedImpact}</p></div>`;
    }

    // Competitive position
    if (ai.competitivePosition) {
      html += `<h3>Posição Competitiva</h3>`;
      html += `<div class="card"><p style="font-size:13px">${ai.competitivePosition}</p></div>`;
    }
  }

  html += `<div class="footer">Gerado por Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div>`;
  html += `</body></html>`;

  downloadFile(html, `analise_${sanitizeFilename(projectName)}.html`, "text/html");
}

// =====================================================
// PDF EXPORT (via HTML print)
// =====================================================

export function exportAsPdf(data: ExportData) {
  const { projectName, projectUrl, projectNiche, heuristic, ai } = data;

  // Generate HTML and open in new window for print
  const tempDiv = document.createElement("div");
  exportAsHtmlContent(data, tempDiv);

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Fallback: download as HTML
    exportAsHtml(data);
    return;
  }

  const scoreBar = (value: number) => {
    const color = value >= 70 ? "#22c55e" : value >= 50 ? "#eab308" : "#ef4444";
    return `<span style="font-weight:700;color:${color}">${value}/100</span>`;
  };

  printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Análise — ${projectName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;padding:30px;max-width:800px;margin:0 auto;line-height:1.5;font-size:12px}
h1{font-size:20px;color:#ea580c;margin-bottom:4px}
h2{font-size:15px;color:#333;margin:24px 0 8px;padding-bottom:6px;border-bottom:2px solid #f97316}
h3{font-size:12px;color:#555;margin:14px 0 6px}
.meta{color:#666;font-size:11px;margin-bottom:16px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:6px 0}
.grid{display:grid;gap:8px}
.grid-2{grid-template-columns:1fr 1fr}
.grid-3{grid-template-columns:1fr 1fr 1fr}
.grid-6{grid-template-columns:repeat(6,1fr)}
.score-card{text-align:center;padding:8px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb}
.score-card .value{font-size:18px;font-weight:700}
.score-card .label{font-size:9px;color:#666}
table{width:100%;border-collapse:collapse;font-size:11px;margin:6px 0}
th,td{padding:6px 8px;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f3f4f6;font-weight:600;font-size:10px;text-transform:uppercase;color:#666}
.summary{background:#fff7ed;border-left:3px solid #f97316;padding:12px;font-size:12px;margin:8px 0}
.swot{padding:10px;border-radius:6px;font-size:11px}
.swot.s{background:#f0fdf4;border:1px solid #bbf7d0}
.swot.w{background:#fef2f2;border:1px solid #fecaca}
.swot.o{background:#eff6ff;border:1px solid #bfdbfe}
.rec{padding:8px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;margin:4px 0;font-size:11px}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#999;text-align:center}
@media print{body{padding:15px}}
</style>
</head>
<body>
<h1>Análise Estratégica</h1>
<p class="meta"><strong>${projectName}</strong> &bull; ${projectUrl} &bull; ${projectNiche}</p>
`);

  if (heuristic) {
    printWindow.document.write(`<h2>Análise Heurística — Score: ${scoreBar(heuristic.overallScore)}</h2>`);
    printWindow.document.write(`<div class="grid grid-6">`);
    const dims = [
      { l: "Proposta de Valor", v: heuristic.scores.valueProposition },
      { l: "Clareza", v: heuristic.scores.offerClarity },
      { l: "Jornada", v: heuristic.scores.userJourney },
      { l: "SEO", v: heuristic.scores.seoReadiness },
      { l: "Conversão", v: heuristic.scores.conversionOptimization },
      { l: "Conteúdo", v: heuristic.scores.contentQuality },
    ];
    for (const d of dims) {
      const c = d.v >= 70 ? "#22c55e" : d.v >= 50 ? "#eab308" : "#ef4444";
      printWindow.document.write(`<div class="score-card"><div class="value" style="color:${c}">${d.v}</div><div class="label">${d.l}</div></div>`);
    }
    printWindow.document.write(`</div>`);
  }

  if (ai) {
    printWindow.document.write(`<h2>Análise por IA</h2>`);
    printWindow.document.write(`<p class="meta">${ai.provider === "google_gemini" ? "Gemini" : "Claude"} (${ai.model}) &bull; ${formatDate(ai.analyzedAt)}</p>`);
    printWindow.document.write(`<div class="summary">${ai.summary}</div>`);

    const rc = ai.investmentReadiness.score >= 70 ? "#22c55e" : ai.investmentReadiness.score >= 50 ? "#eab308" : "#ef4444";
    printWindow.document.write(`<div class="card" style="text-align:center;margin:12px 0"><div style="font-size:36px;font-weight:800;color:${rc}">${ai.investmentReadiness.score}</div><p style="font-size:11px;color:#666">Prontidão — ${readinessLabel(ai.investmentReadiness.level)}</p><p style="font-size:11px;margin-top:6px">${ai.investmentReadiness.justification}</p></div>`);

    printWindow.document.write(`<div class="grid grid-3">`);
    printWindow.document.write(`<div class="swot s"><h3 style="color:#166534">Fortes</h3>${ai.strengths.map(s => `<p>✅ ${s}</p>`).join("")}</div>`);
    printWindow.document.write(`<div class="swot w"><h3 style="color:#991b1b">Fraquezas</h3>${ai.weaknesses.map(w => `<p>❌ ${w}</p>`).join("")}</div>`);
    printWindow.document.write(`<div class="swot o"><h3 style="color:#1e40af">Oportunidades</h3>${ai.opportunities.map(o => `<p>💡 ${o}</p>`).join("")}</div>`);
    printWindow.document.write(`</div>`);

    printWindow.document.write(`<h3>Canais</h3><table><thead><tr><th>Canal</th><th>Veredicto</th><th>Budget</th><th>Justificativa</th></tr></thead><tbody>`);
    for (const ch of ai.channelRecommendations) {
      printWindow.document.write(`<tr><td><strong>${ch.channel}</strong></td><td>${verdictLabel(ch.verdict)}</td><td>${ch.suggestedBudgetAllocation}</td><td>${ch.reasoning}</td></tr>`);
    }
    printWindow.document.write(`</tbody></table>`);

    printWindow.document.write(`<h3>Recomendações</h3>`);
    for (const rec of ai.recommendations) {
      printWindow.document.write(`<div class="rec"><strong>${rec.title}</strong> <span style="color:#666">(${rec.category} — ${priorityLabel(rec.priority)})</span><p style="margin:4px 0;color:#555">${rec.description}</p><p style="color:#ea580c;font-size:10px">Impacto: ${rec.expectedImpact}</p></div>`);
    }

    if (ai.competitivePosition) {
      printWindow.document.write(`<h3>Posição Competitiva</h3><div class="card">${ai.competitivePosition}</div>`);
    }
  }

  printWindow.document.write(`<div class="footer">Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div></body></html>`);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

function exportAsHtmlContent(_data: ExportData, _container: HTMLElement) {
  // Helper used internally, actual content generated inline
}

// =====================================================
// BENCHMARK EXPORT TYPES
// =====================================================

interface BenchmarkExportData {
  competitorName: string;
  competitorUrl: string;
  competitorNiche: string;
  projectName: string;
  overallScore: number;
  scoreGap: number;
  ai: BenchmarkAiResult;
}

function severityLabel(s: string): string {
  const map: Record<string, string> = { high: "Alta", medium: "Média", low: "Baixa" };
  return map[s] || s;
}

// =====================================================
// BENCHMARK: JSON EXPORT
// =====================================================

export function exportBenchmarkAsJson(data: BenchmarkExportData) {
  const json = JSON.stringify(
    {
      benchmark: {
        concorrente: data.competitorName,
        url: data.competitorUrl,
        nicho: data.competitorNiche,
        projeto: data.projectName,
        score: data.overallScore,
        gap: data.scoreGap,
      },
      analise_ia: data.ai,
      exportado_em: new Date().toISOString(),
    },
    null,
    2
  );
  downloadFile(json, `benchmark_ia_${sanitizeFilename(data.competitorName)}.json`, "application/json");
}

// =====================================================
// BENCHMARK: MARKDOWN EXPORT
// =====================================================

export function exportBenchmarkAsMarkdown(data: BenchmarkExportData) {
  const { competitorName, competitorUrl, competitorNiche, projectName, overallScore, scoreGap, ai } = data;
  const lines: string[] = [];

  lines.push(`# Benchmark IA — ${competitorName} vs ${projectName}`);
  lines.push("");
  lines.push(`- **Concorrente:** ${competitorName} (${competitorUrl})`);
  lines.push(`- **Nicho:** ${competitorNiche}`);
  lines.push(`- **Score:** ${overallScore}/100 | Gap: ${scoreGap > 0 ? "+" : ""}${scoreGap}`);
  lines.push(`- **Modelo:** ${ai.provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude"} (${ai.model})`);
  lines.push(`- **Analisado em:** ${formatDate(ai.analyzedAt)}`);
  lines.push("");

  lines.push("---");
  lines.push("");
  lines.push("## Resumo Executivo");
  lines.push("");
  lines.push(ai.executiveSummary);
  lines.push("");

  lines.push("## Nível de Ameaça");
  lines.push("");
  lines.push(`**${ai.overallVerdict.competitorThreatLevel}/100** — ${ai.overallVerdict.summary}`);
  lines.push("");

  lines.push("## Vantagens Competitivas do Concorrente");
  lines.push("");
  for (const item of ai.competitiveAdvantages) lines.push(`- ✅ ${item}`);
  lines.push("");

  lines.push("## Desvantagens Competitivas do Concorrente");
  lines.push("");
  for (const item of ai.competitiveDisadvantages) lines.push(`- ❌ ${item}`);
  lines.push("");

  lines.push("## Gaps Estratégicos");
  lines.push("");
  lines.push("| Área | Gap | Recomendação |");
  lines.push("|------|-----|-------------|");
  for (const g of ai.strategicGaps) {
    lines.push(`| ${g.area} | ${g.gap} | ${g.recommendation} |`);
  }
  lines.push("");

  lines.push("## Posicionamento de Mercado");
  lines.push("");
  lines.push(ai.marketPositioning);
  lines.push("");

  lines.push("## Oportunidades de Diferenciação");
  lines.push("");
  for (const item of ai.differentiationOpportunities) lines.push(`- 💡 ${item}`);
  lines.push("");

  lines.push("## Avaliação de Ameaças");
  lines.push("");
  lines.push("| Ameaça | Severidade | Mitigação |");
  lines.push("|--------|-----------|-----------|");
  for (const t of ai.threatAssessment) {
    lines.push(`| ${t.threat} | ${severityLabel(t.severity)} | ${t.mitigation} |`);
  }
  lines.push("");

  lines.push("## Plano de Ação");
  lines.push("");
  for (const a of ai.actionPlan) {
    lines.push(`### ${a.action}`);
    lines.push(`- **Prioridade:** ${priorityLabel(a.priority)}`);
    lines.push(`- **Resultado esperado:** ${a.expectedOutcome}`);
    lines.push(`- **Prazo:** ${a.timeframe}`);
    lines.push("");
  }

  const md = lines.join("\n");
  downloadFile(md, `benchmark_ia_${sanitizeFilename(competitorName)}.md`, "text/markdown");
}

// =====================================================
// BENCHMARK: HTML EXPORT
// =====================================================

export function exportBenchmarkAsHtml(data: BenchmarkExportData) {
  const { competitorName, competitorUrl, competitorNiche, projectName, overallScore, scoreGap, ai } = data;

  const severityBadge = (s: string) => {
    const colors: Record<string, string> = {
      high: "background:#fee2e2;color:#991b1b",
      medium: "background:#fef9c3;color:#854d0e",
      low: "background:#dbeafe;color:#1e40af",
    };
    return `<span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;${colors[s] || ""}">${severityLabel(s)}</span>`;
  };

  const priorityDot = (p: string) => {
    const colors: Record<string, string> = { high: "#ef4444", medium: "#eab308", low: "#3b82f6" };
    return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${colors[p] || "#9ca3af"}"></span>`;
  };

  const threatColor = ai.overallVerdict.competitorThreatLevel >= 70 ? "#ef4444" : ai.overallVerdict.competitorThreatLevel >= 40 ? "#eab308" : "#22c55e";

  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Benchmark IA — ${competitorName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#fff;padding:40px;max-width:900px;margin:0 auto;line-height:1.6}
h1{font-size:24px;color:#ea580c;margin-bottom:4px}
h2{font-size:18px;color:#333;margin:32px 0 12px;padding-bottom:8px;border-bottom:2px solid #f97316}
h3{font-size:14px;color:#555;margin:20px 0 8px}
.meta{color:#666;font-size:13px;margin-bottom:24px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin:8px 0}
.grid{display:grid;gap:12px}
.grid-2{grid-template-columns:1fr 1fr}
.grid-3{grid-template-columns:1fr 1fr 1fr}
.summary{background:linear-gradient(135deg,#fff7ed,#fff);border-left:4px solid #f97316;padding:16px;border-radius:0 8px 8px 0;font-size:14px}
table{width:100%;border-collapse:collapse;font-size:13px;margin:8px 0}
th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f3f4f6;font-weight:600;font-size:12px;text-transform:uppercase;color:#666}
.tag{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;background:#f3f4f6;margin:2px}
.swot{padding:12px;border-radius:8px;font-size:12px}
.swot.adv{background:#f0fdf4;border:1px solid #bbf7d0}
.swot.dis{background:#fef2f2;border:1px solid #fecaca}
.swot p{margin:4px 0}
.rec{padding:12px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;margin:6px 0}
.rec .title{font-weight:600;font-size:13px}
.rec .desc{font-size:12px;color:#555;margin:4px 0}
.threat-score{text-align:center;padding:20px}
.threat-score .value{font-size:48px;font-weight:800}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:11px;color:#999;text-align:center}
@media print{body{padding:20px}h2{break-before:auto}}
@media(max-width:600px){.grid-2,.grid-3{grid-template-columns:1fr}}
</style>
</head>
<body>
<h1>Benchmark IA — ${competitorName}</h1>
<p class="meta"><strong>${competitorName}</strong> vs <strong>${projectName}</strong> &bull; ${competitorUrl} &bull; Nicho: ${competitorNiche} &bull; Score: ${overallScore} &bull; Gap: ${scoreGap > 0 ? "+" : ""}${scoreGap}</p>
<p class="meta">${ai.provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude"} (${ai.model}) &bull; ${formatDate(ai.analyzedAt)}</p>
`;

  // Executive Summary
  html += `<div class="summary">${ai.executiveSummary}</div>`;

  // Threat Level
  html += `<div class="grid grid-3" style="margin:16px 0">`;
  html += `<div class="threat-score card"><div class="value" style="color:${threatColor}">${ai.overallVerdict.competitorThreatLevel}</div><p style="font-size:12px;color:#666">Nível de Ameaça /100</p></div>`;
  html += `<div class="card" style="grid-column:span 2;display:flex;align-items:center"><p style="font-size:13px">${ai.overallVerdict.summary}</p></div>`;
  html += `</div>`;

  // Advantages vs Disadvantages
  html += `<h2>Análise Competitiva</h2>`;
  html += `<div class="grid grid-2">`;
  html += `<div class="swot adv"><h3 style="color:#166534">Vantagens do Concorrente</h3>`;
  for (const item of ai.competitiveAdvantages) html += `<p>✅ ${item}</p>`;
  html += `</div>`;
  html += `<div class="swot dis"><h3 style="color:#991b1b">Desvantagens do Concorrente</h3>`;
  for (const item of ai.competitiveDisadvantages) html += `<p>❌ ${item}</p>`;
  html += `</div></div>`;

  // Strategic Gaps
  html += `<h2>Gaps Estratégicos</h2>`;
  html += `<table><thead><tr><th>Área</th><th>Gap</th><th>Recomendação</th></tr></thead><tbody>`;
  for (const g of ai.strategicGaps) {
    html += `<tr><td><strong>${g.area}</strong></td><td>${g.gap}</td><td style="color:#ea580c">${g.recommendation}</td></tr>`;
  }
  html += `</tbody></table>`;

  // Market Positioning
  html += `<h2>Posicionamento de Mercado</h2>`;
  html += `<div class="card"><p style="font-size:13px">${ai.marketPositioning}</p></div>`;

  // Differentiation Opportunities
  html += `<h2>Oportunidades de Diferenciação</h2>`;
  html += `<div class="card">`;
  for (const item of ai.differentiationOpportunities) html += `<p style="font-size:12px;margin:4px 0">💡 ${item}</p>`;
  html += `</div>`;

  // Threat Assessment
  html += `<h2>Avaliação de Ameaças</h2>`;
  html += `<table><thead><tr><th>Ameaça</th><th>Severidade</th><th>Mitigação</th></tr></thead><tbody>`;
  for (const t of ai.threatAssessment) {
    html += `<tr><td>${t.threat}</td><td>${severityBadge(t.severity)}</td><td>${t.mitigation}</td></tr>`;
  }
  html += `</tbody></table>`;

  // Action Plan
  html += `<h2>Plano de Ação</h2>`;
  for (const a of ai.actionPlan) {
    html += `<div class="rec"><div style="display:flex;align-items:center;gap:6px">${priorityDot(a.priority)} <span class="title">${a.action}</span> <span class="tag">${a.timeframe}</span></div><p class="desc">${a.expectedOutcome}</p></div>`;
  }

  html += `<div class="footer">Gerado por Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div>`;
  html += `</body></html>`;

  downloadFile(html, `benchmark_ia_${sanitizeFilename(competitorName)}.html`, "text/html");
}

// =====================================================
// BENCHMARK: PDF EXPORT (via print)
// =====================================================

export function exportBenchmarkAsPdf(data: BenchmarkExportData) {
  const { competitorName, competitorUrl, competitorNiche, projectName, overallScore, scoreGap, ai } = data;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    exportBenchmarkAsHtml(data);
    return;
  }

  const threatColor = ai.overallVerdict.competitorThreatLevel >= 70 ? "#ef4444" : ai.overallVerdict.competitorThreatLevel >= 40 ? "#eab308" : "#22c55e";

  printWindow.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Benchmark IA — ${competitorName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;padding:30px;max-width:800px;margin:0 auto;line-height:1.5;font-size:12px}
h1{font-size:20px;color:#ea580c;margin-bottom:4px}
h2{font-size:15px;color:#333;margin:24px 0 8px;padding-bottom:6px;border-bottom:2px solid #f97316}
h3{font-size:12px;color:#555;margin:14px 0 6px}
.meta{color:#666;font-size:11px;margin-bottom:16px}
.card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:6px 0}
.grid{display:grid;gap:8px}
.grid-2{grid-template-columns:1fr 1fr}
.grid-3{grid-template-columns:1fr 1fr 1fr}
.summary{background:#fff7ed;border-left:3px solid #f97316;padding:12px;font-size:12px;margin:8px 0}
table{width:100%;border-collapse:collapse;font-size:11px;margin:6px 0}
th,td{padding:6px 8px;text-align:left;border-bottom:1px solid #e5e7eb}
th{background:#f3f4f6;font-weight:600;font-size:10px;text-transform:uppercase;color:#666}
.swot{padding:10px;border-radius:6px;font-size:11px}
.swot.adv{background:#f0fdf4;border:1px solid #bbf7d0}
.swot.dis{background:#fef2f2;border:1px solid #fecaca}
.swot p{margin:3px 0}
.rec{padding:8px;background:#f9fafb;border-radius:6px;border:1px solid #e5e7eb;margin:4px 0;font-size:11px}
.tag{display:inline-block;padding:2px 6px;border-radius:10px;font-size:10px;background:#f3f4f6;margin-left:4px}
.footer{margin-top:30px;padding-top:12px;border-top:1px solid #e5e7eb;font-size:9px;color:#999;text-align:center}
@media print{body{padding:15px}}
</style>
</head>
<body>
<h1>Benchmark IA — ${competitorName}</h1>
<p class="meta"><strong>${competitorName}</strong> vs <strong>${projectName}</strong> &bull; ${competitorUrl} &bull; ${competitorNiche} &bull; Score: ${overallScore} &bull; Gap: ${scoreGap > 0 ? "+" : ""}${scoreGap}</p>
<p class="meta">${ai.provider === "google_gemini" ? "Gemini" : "Claude"} (${ai.model}) &bull; ${formatDate(ai.analyzedAt)}</p>
`);

  printWindow.document.write(`<div class="summary">${ai.executiveSummary}</div>`);

  printWindow.document.write(`<div class="grid grid-3" style="margin:12px 0">`);
  printWindow.document.write(`<div class="card" style="text-align:center"><div style="font-size:36px;font-weight:800;color:${threatColor}">${ai.overallVerdict.competitorThreatLevel}</div><p style="font-size:10px;color:#666">Nível de Ameaça /100</p></div>`);
  printWindow.document.write(`<div class="card" style="grid-column:span 2;display:flex;align-items:center"><p style="font-size:11px">${ai.overallVerdict.summary}</p></div>`);
  printWindow.document.write(`</div>`);

  printWindow.document.write(`<h2>Análise Competitiva</h2>`);
  printWindow.document.write(`<div class="grid grid-2">`);
  printWindow.document.write(`<div class="swot adv"><h3 style="color:#166534">Vantagens</h3>${ai.competitiveAdvantages.map(i => `<p>✅ ${i}</p>`).join("")}</div>`);
  printWindow.document.write(`<div class="swot dis"><h3 style="color:#991b1b">Desvantagens</h3>${ai.competitiveDisadvantages.map(i => `<p>❌ ${i}</p>`).join("")}</div>`);
  printWindow.document.write(`</div>`);

  printWindow.document.write(`<h2>Gaps Estratégicos</h2>`);
  printWindow.document.write(`<table><thead><tr><th>Área</th><th>Gap</th><th>Recomendação</th></tr></thead><tbody>`);
  for (const g of ai.strategicGaps) {
    printWindow.document.write(`<tr><td><strong>${g.area}</strong></td><td>${g.gap}</td><td style="color:#ea580c">${g.recommendation}</td></tr>`);
  }
  printWindow.document.write(`</tbody></table>`);

  printWindow.document.write(`<h2>Posicionamento</h2><div class="card">${ai.marketPositioning}</div>`);

  printWindow.document.write(`<h2>Diferenciação</h2><div class="card">${ai.differentiationOpportunities.map(i => `<p>💡 ${i}</p>`).join("")}</div>`);

  printWindow.document.write(`<h2>Ameaças</h2><table><thead><tr><th>Ameaça</th><th>Severidade</th><th>Mitigação</th></tr></thead><tbody>`);
  for (const t of ai.threatAssessment) {
    printWindow.document.write(`<tr><td>${t.threat}</td><td>${severityLabel(t.severity)}</td><td>${t.mitigation}</td></tr>`);
  }
  printWindow.document.write(`</tbody></table>`);

  printWindow.document.write(`<h2>Plano de Ação</h2>`);
  for (const a of ai.actionPlan) {
    printWindow.document.write(`<div class="rec"><strong>${a.action}</strong><span class="tag">${a.timeframe}</span> <span class="tag">${priorityLabel(a.priority)}</span><p style="margin:4px 0;color:#555">${a.expectedOutcome}</p></div>`);
  }

  printWindow.document.write(`<div class="footer">Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div></body></html>`);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// =====================================================
// PERFORMANCE ANALYSIS EXPORT
// =====================================================

export function exportPerformanceAnalysisAsPdf(
  campaignName: string,
  channel: string,
  analysis: PerformanceAiResult
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita popups para exportar em PDF');
    return;
  }

  const healthColor = (score: number) => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#d97706';
    if (score >= 40) return '#ea580c';
    return '#dc2626';
  };

  const healthLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Crítico';
  };

  const verdictLabel = (verdict: string) => {
    const map: Record<string, string> = {
      below: 'Abaixo',
      on_track: 'No Target',
      above: 'Acima'
    };
    return map[verdict] || verdict;
  };

  const priorityLabel = (priority: string) => {
    const map: Record<string, string> = {
      immediate: 'Alta',
      short_term: 'Média',
      medium_term: 'Baixa'
    };
    return map[priority] || priority;
  };

  printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Análise de Performance - ${campaignName}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;line-height:1.4;color:#333;max-width:800px;margin:0 auto;padding:20px}
    h1{font-size:20px;color:#1f2937;border-bottom:2px solid #e5e7eb;padding-bottom:8px;margin-bottom:16px}
    h2{font-size:16px;color:#374151;margin-top:24px;margin-bottom:12px}
    h3{font-size:14px;color:#4b5563;margin-top:20px;margin-bottom:8px}
    .meta{font-size:10px;color:#6b7280;background:#f9fafb;padding:8px;border-radius:4px;margin-bottom:16px}
    .card{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;margin-bottom:12px}
    .grid{display:grid;gap:12px}
    .grid-2{grid-template-columns:1fr 1fr}
    .grid-3{grid-template-columns:1fr 1fr 1fr}
    .grid-4{grid-template-columns:1fr 1fr 1fr 1fr}
    .kpi{text-align:center;padding:8px;border-radius:6px}
    .kpi-value{font-size:24px;font-weight:700}
    .kpi-label{font-size:9px;color:#6b7280;text-transform:uppercase}
    .recommendation{background:#fef3c7;border-left:3px solid #f59e0b;padding:8px;margin-bottom:8px}
    .alert{background:#fef2f2;border-left:3px solid #ef4444;padding:8px;margin-bottom:8px}
    .success{background:#f0fdf4;border-left:3px solid #22c55e;padding:8px;margin-bottom:8px}
    table{width:100%;border-collapse:collapse;margin-bottom:16px}
    th,td{padding:8px;text-align:left;border-bottom:1px solid #e5e7eb;font-size:10px}
    th{background:#f9fafb;font-weight:600}
    .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:9px;color:#6b7280;text-align:center}
    @media print{body{padding:15px}
  </style>
</head>
<body>
<h1>Análise de Performance — ${campaignName}</h1>
<p class="meta"><strong>${campaignName}</strong> &bull; ${channel} &bull; Saúde Geral: ${analysis.overallHealth.score}/100 &bull; ${formatDate(analysis.analyzedAt)}</p>
`);

  // Health Score Overview
  printWindow.document.write(`
<div class="card">
  <div class="grid grid-4">
    <div class="kpi" style="background:${healthColor(analysis.overallHealth.score)}20">
      <div class="kpi-value" style="color:${healthColor(analysis.overallHealth.score)}">${analysis.overallHealth.score}</div>
      <div class="kpi-label">Saúde Geral</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">${Object.keys(analysis.kpiAnalysis).length}</div>
      <div class="kpi-label">KPIs Analisados</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">${analysis.funnelAnalysis.length}</div>
      <div class="kpi-label">Estágios Funil</div>
    </div>
    <div class="kpi">
      <div class="kpi-value">${analysis.actionPlan.length}</div>
      <div class="kpi-label">Ações Recomendadas</div>
    </div>
  </div>
</div>
`);

  // Executive Summary
  printWindow.document.write(`<h2>Resumo Executivo</h2>`);
  printWindow.document.write(`<div class="card">${analysis.executiveSummary}</div>`);

  // KPI Analysis
  printWindow.document.write(`<h2>Análise de KPIs</h2>`);
  printWindow.document.write(`<div class="grid grid-2">`);
  for (const kpi of analysis.kpiAnalysis) {
    const status = kpi.verdict === 'above' ? 'success' : kpi.verdict === 'below' ? 'alert' : 'card';
    printWindow.document.write(`
      <div class="${status}">
        <h3>${kpi.metric}</h3>
        <p><strong>Valor:</strong> ${kpi.currentValue}</p>
        <p><strong>Benchmark:</strong> ${kpi.benchmark}</p>
        <p><strong>Status:</strong> ${verdictLabel(kpi.verdict)}</p>
        <p>${kpi.insight}</p>
      </div>
    `);
  }
  printWindow.document.write(`</div>`);

  // Funnel Analysis
  printWindow.document.write(`<h2>Análise de Funil</h2>`);
  printWindow.document.write(`<table><thead><tr><th>Estágio</th><th>Performance</th><th>Gargalo?</th><th>Recomendação</th></tr></thead><tbody>`);
  for (const stage of analysis.funnelAnalysis) {
    printWindow.document.write(`
      <tr>
        <td><strong>${stage.stage}</strong></td>
        <td>${stage.performance}</td>
        <td>${stage.bottleneck ? 'Sim' : 'Não'}</td>
        <td>${stage.recommendation}</td>
      </tr>
    `);
  }
  printWindow.document.write(`</tbody></table>`);

  // Action Plan
  printWindow.document.write(`<h2>Plano de Ação</h2>`);
  for (const action of analysis.actionPlan) {
    const priorityColor = action.priority === 'immediate' ? '#dc2626' : action.priority === 'short_term' ? '#d97706' : '#059669';
    printWindow.document.write(`
      <div class="recommendation">
        <strong>${action.action}</strong>
        <span style="color:${priorityColor};font-size:9px;text-transform:uppercase">${priorityLabel(action.priority)}</span>
        <span style="color:#6b7280;font-size:9px">Esforço: ${action.effort === 'high' ? 'Alto' : action.effort === 'medium' ? 'Médio' : 'Baixo'}</span>
        <p style="margin:4px 0;color:#555">${action.expectedImpact}</p>
      </div>
    `);
  }

  printWindow.document.write(`<div class="footer">Intentia Strategy Hub &bull; ${formatDate(new Date().toISOString())}</div></body></html>`);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
  }, 500);
}
