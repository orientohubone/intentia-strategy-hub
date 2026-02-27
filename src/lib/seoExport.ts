import type { PageSpeedResult } from "./pagespeedApi";
import type { SerpResponse } from "./seoSerpApi";
import type { SeoIntelligenceResponse } from "./seoIntelligenceApi";

// =====================================================
// SEO Analysis Export Utilities (PDF, HTML, JSON)
// =====================================================

export interface SeoAnalysisExportData {
  projectName: string;
  projectUrl: string;
  strategy: "mobile" | "desktop";
  analyzedAt: string;
  pagespeed: PageSpeedResult | null;
  serp: SerpResponse | null;
  intelligence: SeoIntelligenceResponse | null;
}

// ─── JSON Export ───

export function exportAsJson(data: SeoAnalysisExportData): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `seo-analysis-${slugify(data.projectName)}-${dateSlug()}.json`, "application/json");
}

// ─── HTML Export ───

export function exportAsHtml(data: SeoAnalysisExportData): void {
  const html = buildHtmlReport(data);
  downloadFile(html, `seo-analysis-${slugify(data.projectName)}-${dateSlug()}.html`, "text/html");
}

// ─── PDF Export (via print) ───

export function exportAsPdf(data: SeoAnalysisExportData): void {
  const html = buildHtmlReport(data);
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Permita pop-ups para exportar em PDF.");
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  // Wait for content to render then trigger print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

// ─── HTML Report Builder ───

export function buildHtmlReport(data: SeoAnalysisExportData): string {
  const ps = data.pagespeed;
  const serp = data.serp;
  const intel = data.intelligence;
  const date = new Date(data.analyzedAt).toLocaleString("pt-BR");

  const scoreColor = (s: number) => s >= 90 ? "#22c55e" : s >= 50 ? "#eab308" : "#ef4444";
  const scoreLabel = (s: number) => s >= 90 ? "Bom" : s >= 50 ? "Precisa melhorar" : "Ruim";

  let sections = "";

  // ─── Scores Overview ───
  if (ps) {
    sections += `
    <div class="section">
      <h2>Visão Geral dos Scores</h2>
      <div class="scores-grid">
        ${[
          { label: "Performance", score: ps.performanceScore },
          { label: "SEO", score: ps.seoScore },
          { label: "Acessibilidade", score: ps.accessibilityScore },
          { label: "Boas Práticas", score: ps.bestPracticesScore },
        ].map(s => `
          <div class="score-card">
            <div class="score-value" style="color: ${scoreColor(s.score)}">${s.score}</div>
            <div class="score-label">${s.label}</div>
            <div class="score-status" style="color: ${scoreColor(s.score)}">${scoreLabel(s.score)}</div>
          </div>
        `).join("")}
      </div>
    </div>`;
  }

  // ─── Core Web Vitals ───
  if (ps) {
    const vitals = [
      { label: "LCP", value: ps.coreWebVitals.lcp.value, desc: "Largest Contentful Paint" },
      { label: "INP", value: ps.coreWebVitals.inp.value, desc: "Interaction to Next Paint" },
      { label: "CLS", value: ps.coreWebVitals.cls.value, desc: "Cumulative Layout Shift" },
      { label: "FCP", value: ps.coreWebVitals.fcp.value, desc: "First Contentful Paint" },
      { label: "TTFB", value: ps.coreWebVitals.ttfb.value, desc: "Time to First Byte" },
    ];
    sections += `
    <div class="section">
      <h2>Core Web Vitals</h2>
      <table>
        <thead><tr><th>Métrica</th><th>Valor</th><th>Descrição</th></tr></thead>
        <tbody>
          ${vitals.map(v => `<tr><td><strong>${v.label}</strong></td><td>${escapeHtml(String(v.value))}</td><td>${v.desc}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  }

  // ─── SEO Audits ───
  if (ps && ps.seoAudits.length > 0) {
    const failed = ps.seoAudits.filter(a => a.score !== null && a.score < 0.9);
    const passed = ps.seoAudits.filter(a => a.score !== null && a.score >= 0.9);
    sections += `
    <div class="section">
      <h2>Auditoria SEO (${passed.length}/${ps.seoAudits.filter(a => a.score !== null).length} aprovadas)</h2>
      ${failed.length > 0 ? `
        <h3 style="color: #ef4444">⚠ Itens que precisam de atenção (${failed.length})</h3>
        <ul>${failed.map(a => `<li><strong>${escapeHtml(a.title)}</strong>${a.description ? ` — ${escapeHtml(a.description)}` : ""}</li>`).join("")}</ul>
      ` : ""}
      ${passed.length > 0 ? `
        <h3 style="color: #22c55e">✓ Aprovados (${passed.length})</h3>
        <ul>${passed.map(a => `<li><strong>${escapeHtml(a.title)}</strong></li>`).join("")}</ul>
      ` : ""}
    </div>`;
  }

  // ─── Accessibility ───
  if (ps && ps.accessibilityAudits.length > 0) {
    sections += `
    <div class="section">
      <h2>Acessibilidade (Score: ${ps.accessibilityScore}/100)</h2>
      <ul>${ps.accessibilityAudits.map(a => `<li><strong>${escapeHtml(a.title)}</strong>${a.description ? ` — ${escapeHtml(a.description)}` : ""}</li>`).join("")}</ul>
    </div>`;
  }

  // ─── Opportunities ───
  if (ps && ps.opportunities.length > 0) {
    sections += `
    <div class="section">
      <h2>Oportunidades de Melhoria (${ps.opportunities.length})</h2>
      <ul>${ps.opportunities.map(a => `<li><strong>${escapeHtml(a.title)}</strong>${a.displayValue ? ` — ${escapeHtml(a.displayValue)}` : ""}${a.description ? `<br><small>${escapeHtml(a.description)}</small>` : ""}</li>`).join("")}</ul>
    </div>`;
  }

  // ─── SERP Ranking ───
  if (serp && serp.results.length > 0) {
    sections += `
    <div class="section">
      <h2>Ranking Google</h2>
      <p>Domínio: <strong>${escapeHtml(serp.targetDomain || "—")}</strong> | Posição: <strong>${serp.targetPosition ? `#${serp.targetPosition}` : "Fora do top 20"}</strong></p>
      <table>
        <thead><tr><th>#</th><th>Título</th><th>Domínio</th></tr></thead>
        <tbody>
          ${serp.results.slice(0, 10).map(r => `<tr style="${r.isTarget ? "background: #fff7ed; font-weight: 600;" : ""}"><td>${r.position}</td><td>${escapeHtml(r.title)}</td><td>${escapeHtml(r.domain)}</td></tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  }

  // ─── Backlinks ───
  if (intel?.backlinks) {
    const bl = intel.backlinks;
    sections += `
    <div class="section">
      <h2>Backlinks & Autoridade</h2>
      <div class="stats-row">
        <div class="stat"><div class="stat-value">${bl.externalLinkCount}</div><div class="stat-label">Links externos</div></div>
        <div class="stat"><div class="stat-value">${bl.uniqueReferringDomains.length}</div><div class="stat-label">Domínios únicos</div></div>
        <div class="stat"><div class="stat-value">${bl.dofollowCount}</div><div class="stat-label">Dofollow</div></div>
        <div class="stat"><div class="stat-value">${bl.nofollowCount}</div><div class="stat-label">Nofollow</div></div>
      </div>
      <p>Sinais: ${[
        bl.authoritySignals.hasHttps ? "✓ HTTPS" : "✗ HTTPS",
        bl.authoritySignals.hasRobotsTxt ? "✓ robots.txt" : "✗ robots.txt",
        bl.authoritySignals.hasSitemap ? "✓ Sitemap" : "✗ Sitemap",
        `Structured Data (${bl.authoritySignals.structuredDataCount})`,
      ].join(" | ")}</p>
    </div>`;
  }

  // ─── Competitors ───
  if (intel?.competitors && intel.competitors.length > 0) {
    sections += `
    <div class="section">
      <h2>Monitoramento de Concorrentes</h2>
      <table>
        <thead><tr><th>Domínio</th><th>H1/Palavras</th><th>Links ext.</th><th>CTAs</th><th>Imagens</th><th>Sinais</th></tr></thead>
        <tbody>
          ${intel.competitors.map(c => `<tr>
            <td><strong>${escapeHtml(c.domain)}</strong><br><small>${c.reachable ? (escapeHtml(c.title || "Sem título")) : "Inacessível"}</small></td>
            <td>${c.h1Count} / ${c.wordCount.toLocaleString()}</td>
            <td>${c.externalLinkCount}</td>
            <td>${c.ctaCount}</td>
            <td>${c.imageCount}</td>
            <td>${[c.hasHttps ? "HTTPS" : "", c.hasStructuredData ? "Schema" : "", c.hasSitemap ? "Sitemap" : ""].filter(Boolean).join(", ") || "—"}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
  }

  // ─── LLM Visibility ───
  if (intel?.llmResults && intel.llmResults.length > 0) {
    sections += `
    <div class="section">
      <h2>Visibilidade em LLMs</h2>
      ${intel.llmResults.map(llm => `
        <div class="llm-card">
          <p><strong>${llm.provider === "google_gemini" ? "Gemini" : "Claude"} — ${llm.model}</strong>
          | ${llm.mentioned ? '<span style="color: #22c55e">✓ Mencionado</span>' : '<span style="color: #ef4444">✗ Não mencionado</span>'}</p>
          ${llm.mentionContext ? `<blockquote>...${escapeHtml(llm.mentionContext)}...</blockquote>` : ""}
          ${llm.competitorsMentioned.length > 0 ? `<p><small>Concorrentes mencionados: ${llm.competitorsMentioned.map(c => escapeHtml(c)).join(", ")}</small></p>` : ""}
        </div>
      `).join("")}
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório SEO — ${escapeHtml(data.projectName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6; padding: 40px; max-width: 900px; margin: 0 auto; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 18px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #f97316; color: #1a1a1a; }
    h3 { font-size: 14px; margin: 12px 0 8px; }
    .header { margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #e5e5e5; }
    .header p { color: #666; font-size: 13px; }
    .section { margin-bottom: 32px; }
    .scores-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 16px 0; }
    .score-card { text-align: center; padding: 16px; border: 1px solid #e5e5e5; border-radius: 12px; }
    .score-value { font-size: 32px; font-weight: 700; }
    .score-label { font-size: 12px; color: #666; margin-top: 4px; }
    .score-status { font-size: 11px; font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f9f9f9; font-weight: 600; font-size: 11px; text-transform: uppercase; color: #666; }
    ul { padding-left: 20px; margin: 8px 0; }
    li { margin-bottom: 6px; font-size: 13px; }
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 12px 0; }
    .stat { text-align: center; padding: 12px; border: 1px solid #e5e5e5; border-radius: 8px; }
    .stat-value { font-size: 24px; font-weight: 700; }
    .stat-label { font-size: 11px; color: #666; }
    .llm-card { padding: 12px; border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 12px; }
    blockquote { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 8px 12px; margin: 8px 0; font-size: 12px; border-radius: 4px; }
    small { color: #666; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; text-align: center; color: #999; font-size: 11px; }
    @media print { body { padding: 20px; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Relatório SEO & Performance</h1>
    <p><strong>Projeto:</strong> ${escapeHtml(data.projectName)} | <strong>URL:</strong> ${escapeHtml(data.projectUrl)}</p>
    <p><strong>Dispositivo:</strong> ${data.strategy === "mobile" ? "Mobile" : "Desktop"} | <strong>Data:</strong> ${date}</p>
  </div>
  ${sections}
  <div class="footer">
    <p>Gerado por Intentia Strategy Hub — ${date}</p>
  </div>
</body>
</html>`;
}

// ─── Helpers ───

function escapeHtml(unsafe: string | null | undefined): string {
  if (unsafe == null) return "";
  const str = String(unsafe);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function dateSlug(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
