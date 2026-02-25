import type { IcpEnrichmentResult } from "./icpEnricher";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 80) || "icp";
}

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

function buildHtml(audienceName: string, enrichment: IcpEnrichmentResult): string {
  const e = enrichment;
  const decisionMakers = e.idealProfile.decisionMakers.map((d) => `<li>${d}</li>`).join("\n");
  const painPoints = e.idealProfile.painPoints.map((p) => `<li>${p}</li>`).join("\n");
  const triggers = e.idealProfile.buyingTriggers.map((t) => `<li>${t}</li>`).join("\n");
  const keywords = e.suggestedKeywords.map((k) => `<span class="tag">${k}</span>`).join("\n");
  const recommendations = e.recommendations.map((r) => `<li>${r}</li>`).join("\n");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>ICP - ${audienceName}</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 24px; color: #0f172a; background: #f8fafc; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    h2 { font-size: 16px; margin: 16px 0 8px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px; box-shadow: 0 6px 24px rgba(15, 23, 42, 0.06); }
    .pill { display: inline-flex; align-items: center; gap: 6px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 999px; padding: 6px 10px; font-size: 12px; color: #334155; }
    .tag { display: inline-block; background: #e0f2fe; color: #0369a1; border-radius: 999px; padding: 4px 8px; margin: 2px; font-size: 11px; }
    ul { padding-left: 18px; margin: 6px 0 0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
  </style>
</head>
<body>
  <h1>ICP Refinado — ${audienceName}</h1>
  <p class="pill">Modelo: ${e.model} • Provider: ${e.provider}</p>

  <div class="card">
    <h2>Descrição Refinada</h2>
    <p>${e.refinedDescription}</p>
  </div>

  <div class="grid">
    <div class="card">
      <h2>Segmento</h2>
      <p>${e.idealProfile.industry || "–"}</p>
    </div>
    <div class="card">
      <h2>Porte</h2>
      <p>${e.idealProfile.companySize || "–"}</p>
    </div>
    <div class="card">
      <h2>Localização</h2>
      <p>${e.idealProfile.location || "–"}</p>
    </div>
    <div class="card">
      <h2>Faixa de Investimento</h2>
      <p>${e.idealProfile.budgetRange || "–"}</p>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h2>Decisores</h2>
      <ul>${decisionMakers}</ul>
    </div>
    <div class="card">
      <h2>Dores</h2>
      <ul>${painPoints}</ul>
    </div>
    <div class="card">
      <h2>Gatilhos de Compra</h2>
      <ul>${triggers}</ul>
    </div>
  </div>

  <div class="card">
    <h2>Keywords</h2>
    <div>${keywords || "–"}</div>
  </div>

  <div class="card">
    <h2>Recomendações</h2>
    <ul>${recommendations}</ul>
  </div>
</body>
</html>`;
}

export function exportIcpToHtml(audienceName: string, enrichment: IcpEnrichmentResult) {
  const html = buildHtml(audienceName, enrichment);
  downloadFile(html, `icp_${sanitizeFilename(audienceName)}.html`, "text/html");
}

export async function exportIcpToPdf(audienceName: string, enrichment: IcpEnrichmentResult) {
  const html = buildHtml(audienceName, enrichment);
  // Usa iframe escondido para evitar bloqueio de popup e telas em branco
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.srcdoc = html;

  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      iframe.onload = null;
      iframe.onerror = null;
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };

    iframe.onload = () => {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) {
        cleanup();
        reject(new Error("Janela do PDF não pôde ser aberta."));
        return;
      }
      // Pequeno delay para garantir renderização antes do print
      setTimeout(() => {
        try {
          iframeWindow.focus();
          iframeWindow.print();
          cleanup();
          resolve();
        } catch (err) {
          cleanup();
          reject(err as any);
        }
      }, 150);
    };

    iframe.onerror = () => {
      cleanup();
      reject(new Error("Falha ao carregar conteúdo do PDF."));
    };

    document.body.appendChild(iframe);
  });
}
