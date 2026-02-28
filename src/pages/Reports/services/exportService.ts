import { toast } from "sonner";
import { Report } from "../types";
import {
  toText,
  toStringArray,
  toNumber,
  escapeHtml,
  sanitizeFilename,
} from "../utils/formatters";
import { normalizeAiAnalysis } from "../utils/helpers";

export const downloadReport = async (report: Report, format: "pdf" | "json" | "html" = "html") => {
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
      const heuristicScores = (heuristic?.scores || {}) as Record<string, unknown>;
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
      ].filter((item) => item.data) as any[];

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
      const metadata = (report.metadata || {}) as Record<string, unknown>;
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
    console.error("Erro ao fazer download:", error?.message || "Unknown error");
    const message = error instanceof Error ? error.message : "Falha ao gerar arquivo";
    toast.error(`Erro ao fazer download: ${message}`);
  }
};
