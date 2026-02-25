import type { EditorialLine } from "./icpEnricher";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 80) || "editorial";
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

function buildHtml(title: string, lines: EditorialLine[]): string {
  const blocks = lines
    .map((line, idx) => {
      const audience = line.audienceName ? `<span class="pill">${line.audienceName}</span>` : "";
      return `
        <div class="card">
          <div class="card-header">
            <span class="pill">Bloco ${idx + 1}</span>
            ${audience}
          </div>
          <div class="field"><span class="label">Headline</span><p>${line.headline || "–"}</p></div>
          <div class="field"><span class="label">Reforço</span><p>${line.message || "–"}</p></div>
          <div class="field"><span class="label">CTA</span><p>${line.cta || "–"}</p></div>
          <div class="field"><span class="label">Legenda</span><p>${line.caption || "–"}</p></div>
        </div>
      `;
    })
    .join("\n");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Plano de Comunicação — ${title}</title>
  <style>
    body { font-family: 'Inter', system-ui, -apple-system, sans-serif; margin: 24px; color: #0f172a; background: #f8fafc; }
    h1 { font-size: 20px; margin-bottom: 4px; }
    p { margin: 4px 0; line-height: 1.4; }
    .pill { display: inline-flex; align-items: center; gap: 6px; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; border-radius: 999px; padding: 4px 8px; font-size: 11px; }
    .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05); }
    .card-header { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
    .field { margin-top: 8px; }
    .label { display: inline-block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 2px; }
  </style>
</head>
<body>
  <h1>Plano de Comunicação — ${title}</h1>
  <p style="color:#475569; margin-bottom: 12px;">Gerado em ${new Date().toLocaleString("pt-BR")}</p>
  ${blocks}
</body>
</html>`;
}

export function exportEditorialToHtml(title: string, lines: EditorialLine[]) {
  const html = buildHtml(title, lines);
  downloadFile(html, `plano_${sanitizeFilename(title)}.html`, "text/html");
}

export function exportEditorialToPdf(title: string, lines: EditorialLine[]) {
  const html = buildHtml(title, lines);
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
