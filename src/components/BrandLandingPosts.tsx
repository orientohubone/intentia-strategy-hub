import { useRef, useEffect, useState, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── SHARED HELPERS ───

function drawWhiteLogo(ctx: CanvasRenderingContext2D, x: number, y: number, fontSize: number) {
  ctx.font = `800 ${fontSize}px Inter, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = "intentia";
  const dot = ".";
  const tw = ctx.measureText(text).width;
  const dw = ctx.measureText(dot).width;
  const total = tw + dw;
  const sx = x - total / 2;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, sx + tw / 2, y);
  ctx.fillStyle = "#FF6B2B";
  ctx.fillText(dot, sx + tw + dw / 2, y);
}

function drawBars(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "#FF6B2B");
  g.addColorStop(1, "#FF8F5E");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);
}

function drawFooterUrl(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("intentia.com.br", W / 2, H - 40);
}

function drawSectionBadge(ctx: CanvasRenderingContext2D, W: number, y: number, text: string) {
  ctx.font = "500 15px Inter, system-ui, sans-serif";
  const bw = ctx.measureText(text).width + 28;
  ctx.beginPath();
  ctx.roundRect((W - bw) / 2, y, bw, 30, 15);
  ctx.fillStyle = "rgba(255,107,43,0.15)";
  ctx.fill();
  ctx.fillStyle = "#FF6B2B";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, y + 15);
}

function drawDivider(ctx: CanvasRenderingContext2D, W: number, y: number) {
  ctx.strokeStyle = "rgba(255,107,43,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, y);
  ctx.lineTo(W / 2 + 40, y);
  ctx.stroke();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((w) => {
    const test = line + (line ? " " : "") + w;
    if (ctx.measureText(test).width > maxW) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// ─── CANVAS VECTOR ICONS (inspired by Lucide) ───

type IconDrawFn = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) => void;

const iconTarget: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.12; ctx.lineCap = "round";
  // Outer circle
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2); ctx.stroke();
  // Middle circle
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.28, 0, Math.PI * 2); ctx.stroke();
  // Center dot
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.08, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
};

const iconSparkles: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.fillStyle = color;
  const drawStar = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.3, y - r * 0.3);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x + r * 0.3, y + r * 0.3);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * 0.3, y + r * 0.3);
    ctx.lineTo(x - r, y);
    ctx.lineTo(x - r * 0.3, y - r * 0.3);
    ctx.closePath(); ctx.fill();
  };
  drawStar(cx - s * 0.15, cy - s * 0.1, s * 0.28);
  drawStar(cx + s * 0.25, cy + s * 0.2, s * 0.18);
  drawStar(cx + s * 0.3, cy - s * 0.3, s * 0.12);
};

const iconBarChart: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.fillStyle = color;
  const bw = s * 0.18, gap = s * 0.08;
  const bars = [0.5, 0.8, 0.35, 0.65];
  const totalW = bars.length * bw + (bars.length - 1) * gap;
  const startX = cx - totalW / 2;
  const baseY = cy + s * 0.4;
  bars.forEach((h, i) => {
    const x = startX + i * (bw + gap);
    const barH = s * 0.8 * h;
    ctx.beginPath();
    ctx.roundRect(x, baseY - barH, bw, barH, s * 0.04);
    ctx.fill();
  });
};

const iconLightbulb: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.lineCap = "round"; ctx.lineJoin = "round";
  // Bulb
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.1, s * 0.28, Math.PI * 1.15, Math.PI * 1.85);
  ctx.lineTo(cx + s * 0.12, cy + s * 0.18);
  ctx.lineTo(cx - s * 0.12, cy + s * 0.18);
  ctx.closePath(); ctx.stroke();
  // Base lines
  ctx.beginPath(); ctx.moveTo(cx - s * 0.1, cy + s * 0.28); ctx.lineTo(cx + s * 0.1, cy + s * 0.28); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - s * 0.08, cy + s * 0.36); ctx.lineTo(cx + s * 0.08, cy + s * 0.36); ctx.stroke();
};

const iconShield: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.42);
  ctx.lineTo(cx + s * 0.35, cy - s * 0.25);
  ctx.lineTo(cx + s * 0.35, cy + s * 0.05);
  ctx.quadraticCurveTo(cx + s * 0.3, cy + s * 0.35, cx, cy + s * 0.45);
  ctx.quadraticCurveTo(cx - s * 0.3, cy + s * 0.35, cx - s * 0.35, cy + s * 0.05);
  ctx.lineTo(cx - s * 0.35, cy - s * 0.25);
  ctx.closePath(); ctx.stroke();
  // Check inside
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.12, cy);
  ctx.lineTo(cx - s * 0.02, cy + s * 0.12);
  ctx.lineTo(cx + s * 0.15, cy - s * 0.1);
  ctx.stroke();
};

const iconCrosshair: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.lineCap = "round";
  // Circle
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.32, 0, Math.PI * 2); ctx.stroke();
  // Cross lines
  ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.45); ctx.lineTo(cx, cy - s * 0.32); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, cy + s * 0.32); ctx.lineTo(cx, cy + s * 0.45); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - s * 0.45, cy); ctx.lineTo(cx - s * 0.32, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + s * 0.32, cy); ctx.lineTo(cx + s * 0.45, cy); ctx.stroke();
};

const iconRocket: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.lineCap = "round"; ctx.lineJoin = "round";
  // Body
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.05, cy - s * 0.42);
  ctx.quadraticCurveTo(cx + s * 0.3, cy - s * 0.15, cx + s * 0.18, cy + s * 0.2);
  ctx.lineTo(cx - s * 0.18, cy + s * 0.2);
  ctx.quadraticCurveTo(cx - s * 0.3, cy - s * 0.15, cx - s * 0.05, cy - s * 0.42);
  ctx.closePath(); ctx.stroke();
  // Window
  ctx.beginPath(); ctx.arc(cx, cy - s * 0.1, s * 0.1, 0, Math.PI * 2); ctx.stroke();
  // Flames
  ctx.beginPath(); ctx.moveTo(cx - s * 0.1, cy + s * 0.2); ctx.lineTo(cx, cy + s * 0.4); ctx.lineTo(cx + s * 0.1, cy + s * 0.2); ctx.stroke();
};

const iconDatabase: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.lineCap = "round";
  const rx = s * 0.35, ry = s * 0.12;
  // Top ellipse
  ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.25, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  // Sides
  ctx.beginPath(); ctx.moveTo(cx - rx, cy - s * 0.25); ctx.lineTo(cx - rx, cy + s * 0.25); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx + rx, cy - s * 0.25); ctx.lineTo(cx + rx, cy + s * 0.25); ctx.stroke();
  // Bottom ellipse
  ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.25, rx, ry, 0, 0, Math.PI); ctx.stroke();
  // Middle line
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); ctx.stroke();
};

const iconFileText: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.lineCap = "round"; ctx.lineJoin = "round";
  // Page outline
  const l = cx - s * 0.28, r = cx + s * 0.28, t = cy - s * 0.4, b = cy + s * 0.4;
  const fold = s * 0.18;
  ctx.beginPath();
  ctx.moveTo(l, t); ctx.lineTo(r - fold, t); ctx.lineTo(r, t + fold); ctx.lineTo(r, b);
  ctx.lineTo(l, b); ctx.closePath(); ctx.stroke();
  // Fold
  ctx.beginPath(); ctx.moveTo(r - fold, t); ctx.lineTo(r - fold, t + fold); ctx.lineTo(r, t + fold); ctx.stroke();
  // Text lines
  ctx.beginPath(); ctx.moveTo(cx - s * 0.15, cy - s * 0.08); ctx.lineTo(cx + s * 0.15, cy - s * 0.08); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - s * 0.15, cy + s * 0.08); ctx.lineTo(cx + s * 0.15, cy + s * 0.08); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - s * 0.15, cy + s * 0.24); ctx.lineTo(cx + s * 0.05, cy + s * 0.24); ctx.stroke();
};

const iconBrain: IconDrawFn = (ctx, cx, cy, s, color) => {
  ctx.strokeStyle = color; ctx.lineWidth = s * 0.1; ctx.lineCap = "round"; ctx.lineJoin = "round";
  // Left hemisphere
  ctx.beginPath();
  ctx.arc(cx - s * 0.12, cy - s * 0.15, s * 0.22, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
  // Right hemisphere
  ctx.beginPath();
  ctx.arc(cx + s * 0.12, cy - s * 0.15, s * 0.22, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
  // Lower left
  ctx.beginPath();
  ctx.arc(cx - s * 0.15, cy + s * 0.12, s * 0.18, Math.PI * 1.5, Math.PI * 0.5);
  ctx.stroke();
  // Lower right
  ctx.beginPath();
  ctx.arc(cx + s * 0.15, cy + s * 0.12, s * 0.18, Math.PI * 0.5, Math.PI * 1.5, true);
  ctx.stroke();
  // Center line
  ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.35); ctx.lineTo(cx, cy + s * 0.3); ctx.stroke();
};

// Map icon keys to draw functions
const ICON_MAP: Record<string, IconDrawFn> = {
  target: iconTarget,
  sparkles: iconSparkles,
  barchart: iconBarChart,
  lightbulb: iconLightbulb,
  shield: iconShield,
  crosshair: iconCrosshair,
  rocket: iconRocket,
  database: iconDatabase,
  filetext: iconFileText,
  brain: iconBrain,
};

function drawIcon(ctx: CanvasRenderingContext2D, key: string, cx: number, cy: number, size: number, color: string) {
  const fn = ICON_MAP[key];
  if (fn) {
    ctx.save();
    fn(ctx, cx, cy, size, color);
    ctx.restore();
  }
}

// ─── POST DEFINITIONS ───

const POSTS = [
  { id: "hero", title: "Hero — Proposta de Valor", filename: "intentia-landing-hero-1080x1350.jpg" },
  { id: "features-1", title: "Funcionalidades (1/3)", filename: "intentia-landing-features1-1080x1350.jpg" },
  { id: "features-2", title: "Funcionalidades (2/3)", filename: "intentia-landing-features2-1080x1350.jpg" },
  { id: "features-3", title: "Funcionalidades (3/3)", filename: "intentia-landing-features3-1080x1350.jpg" },
  { id: "how-it-works", title: "Como Funciona — 7 Passos", filename: "intentia-landing-como-funciona-1080x1350.jpg" },
  { id: "ai", title: "Inteligência Artificial", filename: "intentia-landing-ia-1080x1350.jpg" },
  { id: "benefits", title: "Benefícios + Números", filename: "intentia-landing-beneficios-1080x1350.jpg" },
  { id: "personas", title: "Para Quem É a Intentia", filename: "intentia-landing-personas-1080x1350.jpg" },
  { id: "cta", title: "CTA — Chamada Final", filename: "intentia-landing-cta-1080x1350.jpg" },
];

const W = 1080, H = 1350;
const PAD = 70;

// ─── DRAW FUNCTIONS ───

function drawHero(canvas: HTMLCanvasElement): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(); return; }
    canvas.width = W; canvas.height = H;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/dashboard-intentia.png";

    const draw = (imgLoaded: boolean) => {
      ctx.fillStyle = "#151A23";
      ctx.fillRect(0, 0, W, H);
      drawBars(ctx, W, H);

      drawWhiteLogo(ctx, W / 2, 80, 52);

      drawSectionBadge(ctx, W, 120, "Plataforma de Estratégia de Mídia para B2B");

      // Headline
      ctx.font = "700 44px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("Descubra onde investir", W / 2, 210);
      ctx.fillStyle = "#FF6B2B";
      ctx.fillText("em mídia paga", W / 2, 262);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("antes de gastar", W / 2, 314);

      // Subtitle
      ctx.font = "400 22px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      const subLines = wrapText(ctx, "Diagnóstico heurístico + IA + benchmark competitivo + playbook de execução. Avalie a prontidão do seu negócio B2B para Google, Meta, LinkedIn e TikTok Ads.", W - PAD * 2);
      subLines.forEach((l, i) => ctx.fillText(l, W / 2, 375 + i * 32));

      // Dashboard showcase
      const showcaseY = 375 + subLines.length * 32 + 30;
      const imgW = W - PAD * 2;
      const showcaseH = 380;

      if (imgLoaded) {
        ctx.save();
        ctx.shadowColor = "rgba(255,107,43,0.2)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 6;
        ctx.beginPath();
        ctx.roundRect(PAD, showcaseY, imgW, showcaseH, 14);
        ctx.clip();
        const srcH = img.height * (showcaseH / ((img.height / img.width) * imgW));
        ctx.drawImage(img, 0, 0, img.width, srcH, PAD, showcaseY, imgW, showcaseH);
        ctx.restore();
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(PAD, showcaseY, imgW, showcaseH, 14);
        ctx.stroke();
      }

      // CTA pill
      const ctaY = showcaseY + showcaseH + 50;
      const ctaW = 340, ctaH = 56;
      ctx.beginPath();
      ctx.roundRect((W - ctaW) / 2, ctaY, ctaW, ctaH, 28);
      const ctaGrad = ctx.createLinearGradient((W - ctaW) / 2, ctaY, (W + ctaW) / 2, ctaY);
      ctaGrad.addColorStop(0, "#FF6B2B");
      ctaGrad.addColorStop(1, "#FF8F5E");
      ctx.fillStyle = ctaGrad;
      ctx.fill();
      ctx.font = "600 20px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Veja o Poder da Intentia →", W / 2, ctaY + ctaH / 2);

      drawFooterUrl(ctx, W, H);
      resolve();
    };

    img.onload = () => draw(true);
    img.onerror = () => draw(false);
  });
}

function drawFeatures(canvas: HTMLCanvasElement, page: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W; canvas.height = H;

  const allFeatures = [
    { icon: "target", color: "#FF6B2B", title: "Diagnóstico Heurístico de URL", desc: "Análise automática de proposta de valor, clareza, jornada, SEO, conversão e conteúdo — tudo em segundos." },
    { icon: "sparkles", color: "#8B5CF6", title: "Análise por IA (Gemini & Claude)", desc: "Enriqueça diagnósticos com IA. Use sua API key para insights aprofundados." },
    { icon: "barchart", color: "#3B82F6", title: "Benchmark Competitivo com IA", desc: "Compare posicionamento com concorrentes via SWOT, gap analysis e enriquecimento por IA." },
    { icon: "lightbulb", color: "#22C55E", title: "Score por Canal de Mídia", desc: "Scores individuais para Google, Meta, LinkedIn e TikTok Ads com objetivos e riscos." },
    { icon: "shield", color: "#F59E0B", title: "Alertas e Insights Estratégicos", desc: "Insights automáticos agrupados por projeto: alertas, oportunidades e melhorias." },
    { icon: "crosshair", color: "#0EA5E9", title: "Plano Tático por Canal", desc: "Estruture campanhas para Google, Meta, LinkedIn e TikTok com templates validados por nicho B2B." },
    { icon: "rocket", color: "#F43F5E", title: "Playbook de Execução Gamificado", desc: "Diretivas de execução priorizadas com KPIs e ações específicas por canal." },
    { icon: "database", color: "#14B8A6", title: "Dados Estruturados & Comparação", desc: "Extração automática de JSON-LD, Open Graph, Twitter Card e Microdata com comparação." },
    { icon: "filetext", color: "#6366F1", title: "Relatórios PDF e Exportação CSV", desc: "Relatórios consolidados em PDF, exportação por seção e dados em CSV." },
  ];

  const feats = allFeatures.slice(page * 3, page * 3 + 3);

  ctx.fillStyle = "#151A23";
  ctx.fillRect(0, 0, W, H);
  drawBars(ctx, W, H);
  drawWhiteLogo(ctx, W / 2, 70, 44);
  drawSectionBadge(ctx, W, 105, "Funcionalidades");

  // Section title
  ctx.font = "700 36px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Tudo que você precisa para", W / 2, 185);
  ctx.fillStyle = "#FF6B2B";
  ctx.fillText("decidir com inteligência", W / 2, 230);

  // Page indicator
  ctx.font = "500 16px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText(`${page + 1} / 3`, W / 2, 270);

  // Feature cards
  const cardStartY = 310;
  const cardH = 280;
  const cardGap = 30;

  feats.forEach((feat, i) => {
    const y = cardStartY + i * (cardH + cardGap);

    // Card bg
    ctx.beginPath();
    ctx.roundRect(PAD, y, W - PAD * 2, cardH, 20);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left accent
    ctx.beginPath();
    ctx.roundRect(PAD, y, 5, cardH, [20, 0, 0, 20]);
    ctx.fillStyle = feat.color;
    ctx.fill();

    // Icon circle
    ctx.beginPath();
    ctx.arc(PAD + 55, y + 55, 28, 0, Math.PI * 2);
    ctx.fillStyle = feat.color + "18";
    ctx.fill();
    drawIcon(ctx, feat.icon, PAD + 55, y + 55, 42, feat.color);

    // Title
    ctx.font = "600 24px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(feat.title, PAD + 100, y + 55);

    // Description wrapped
    ctx.font = "400 19px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    const descLines = wrapText(ctx, feat.desc, W - PAD * 2 - 60);
    descLines.forEach((l, li) => {
      ctx.fillText(l, PAD + 30, y + 110 + li * 30);
    });
  });

  drawFooterUrl(ctx, W, H);
}

function drawHowItWorks(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W; canvas.height = H;

  ctx.fillStyle = "#151A23";
  ctx.fillRect(0, 0, W, H);
  drawBars(ctx, W, H);
  drawWhiteLogo(ctx, W / 2, 70, 44);
  drawSectionBadge(ctx, W, 105, "Como Funciona");

  ctx.font = "700 36px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Da URL ao relatório estratégico", W / 2, 185);
  ctx.fillStyle = "#FF6B2B";
  ctx.fillText("em 7 passos", W / 2, 230);

  const steps = [
    { n: "01", title: "Crie seu projeto", desc: "URL do negócio + nicho + concorrentes" },
    { n: "02", title: "Análise heurística automática", desc: "Scores de proposta de valor, clareza, SEO, conversão" },
    { n: "03", title: "Enriqueça com IA", desc: "Gemini ou Claude para resumo executivo e SWOT" },
    { n: "04", title: "Compare com concorrentes", desc: "Benchmarks com SWOT e gap analysis" },
    { n: "05", title: "Mapeie públicos-alvo", desc: "Audiências com indústria, porte e keywords" },
    { n: "06", title: "Monte o plano tático", desc: "Campanhas por canal com templates por nicho" },
    { n: "07", title: "Exporte e apresente", desc: "Relatórios PDF, CSV e insights compartilháveis" },
  ];

  const startY = 280;
  const stepH = 120;
  const gap = 16;

  steps.forEach((step, i) => {
    const y = startY + i * (stepH + gap);

    // Connector line
    if (i < steps.length - 1) {
      ctx.strokeStyle = "rgba(255,107,43,0.15)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD + 30, y + stepH);
      ctx.lineTo(PAD + 30, y + stepH + gap);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Card bg
    ctx.beginPath();
    ctx.roundRect(PAD, y, W - PAD * 2, stepH, 16);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fill();

    // Step number
    ctx.font = "800 36px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,107,43,0.2)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(step.n, PAD + 30, y + stepH / 2);

    // Title
    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(step.title, PAD + 70, y + stepH / 2 - 14);

    // Desc
    ctx.font = "400 17px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(step.desc, PAD + 70, y + stepH / 2 + 16);
  });

  drawFooterUrl(ctx, W, H);
}

function drawAI(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W; canvas.height = H;

  ctx.fillStyle = "#151A23";
  ctx.fillRect(0, 0, W, H);
  drawBars(ctx, W, H);
  drawWhiteLogo(ctx, W / 2, 70, 44);
  drawSectionBadge(ctx, W, 105, "Inteligência Artificial");

  ctx.font = "700 38px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Sua própria IA,", W / 2, 190);
  ctx.fillStyle = "#FF6B2B";
  ctx.fillText("seus próprios insights", W / 2, 238);

  // Subtitle
  ctx.font = "400 21px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  const subLines = wrapText(ctx, "Conecte sua API key do Google Gemini ou Anthropic Claude e desbloqueie análises semânticas profundas — sem custo adicional da plataforma.", W - PAD * 2);
  subLines.forEach((l, i) => ctx.fillText(l, W / 2, 290 + i * 30));

  // AI Provider cards
  const cardY = 290 + subLines.length * 30 + 30;
  const providers = [
    { name: "Google Gemini", models: "Gemini 3 Flash · 2.5 Flash · 2.5 Pro · 2.0 Flash", color: "#4285F4" },
    { name: "Anthropic Claude", models: "Sonnet 4 · Sonnet 3.7 · Haiku 3.5 · Opus 3", color: "#FF6B2B" },
  ];

  providers.forEach((p, i) => {
    const y = cardY + i * 110;
    ctx.beginPath();
    ctx.roundRect(PAD, y, W - PAD * 2, 90, 16);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Color dot
    ctx.beginPath();
    ctx.arc(PAD + 40, y + 45, 18, 0, Math.PI * 2);
    ctx.fillStyle = p.color + "25";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(PAD + 40, y + 45, 8, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(p.name, PAD + 75, y + 35);

    ctx.font = "400 16px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(p.models, PAD + 75, y + 60);
  });

  // Features
  const featY = cardY + 250;
  const aiFeats = [
    { title: "Análise de Projetos", desc: "Resumo executivo, prontidão, SWOT, recomendações por canal" },
    { title: "Enriquecimento de Benchmark", desc: "Vantagens competitivas, gaps, oportunidades, plano de ação" },
    { title: "Exportação completa", desc: "JSON, Markdown, HTML estilizado ou PDF" },
  ];

  aiFeats.forEach((f, i) => {
    const y = featY + i * 90;

    // Check circle
    ctx.beginPath();
    ctx.arc(PAD + 20, y + 20, 14, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,107,43,0.15)";
    ctx.fill();
    ctx.font = "600 16px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FF6B2B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✓", PAD + 20, y + 20);

    ctx.font = "600 20px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.fillText(f.title, PAD + 50, y + 15);

    ctx.font = "400 17px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(f.desc, PAD + 50, y + 45);
  });

  // Security badge
  const secY = featY + 290;
  ctx.beginPath();
  ctx.roundRect(PAD, secY, W - PAD * 2, 60, 12);
  ctx.fillStyle = "rgba(34,197,94,0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(34,197,94,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = "500 18px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#22C55E";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("🔒  Suas chaves, seu controle — armazenadas com segurança", W / 2, secY + 30);

  drawFooterUrl(ctx, W, H);
}

function drawBenefits(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W; canvas.height = H;

  // Orange gradient background
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#FF6B2B");
  bg.addColorStop(1, "#E85D1F");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle pattern overlay
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);

  // Logo white
  drawWhiteLogo(ctx, W / 2, 80, 52);

  // Title
  ctx.font = "700 42px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Estratégia antes", W / 2, 160);
  ctx.fillText("da mídia", W / 2, 210);

  // Subtitle
  ctx.font = "400 21px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  const subLines = wrapText(ctx, "A maioria das empresas B2B investe em mídia paga sem validar se estão prontas. Com Intentia, combine análise heurística, IA e benchmark para decisões fundamentadas.", W - PAD * 2);
  subLines.forEach((l, i) => ctx.fillText(l, W / 2, 270 + i * 30));

  // Benefits list
  const benefits = [
    "Evite desperdício de budget em canais inadequados",
    "Decisões baseadas em dados e IA, não intuição",
    "Identifique o momento certo de investir",
    "Alinhe estratégia antes de criar campanhas",
    "Compare posicionamento com concorrentes",
    "Templates táticos validados por nicho",
    "Relatórios profissionais para o cliente",
    "Playbooks de execução gamificados",
  ];

  const listY = 270 + subLines.length * 30 + 30;
  benefits.forEach((b, i) => {
    const y = listY + i * 46;
    ctx.font = "500 20px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("✓", PAD + 10, y);
    ctx.fillText(b, PAD + 40, y);
  });

  // Stats grid
  const statsY = listY + benefits.length * 46 + 30;
  const stats = [
    { value: "6", label: "Scores por URL" },
    { value: "4", label: "Canais de mídia" },
    { value: "8+", label: "Modelos de IA" },
    { value: "5", label: "Formatos de export" },
  ];

  const statW = (W - PAD * 2 - 20) / 2;
  const statH = 90;

  stats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = PAD + col * (statW + 20);
    const y = statsY + row * (statH + 16);

    ctx.beginPath();
    ctx.roundRect(x, y, statW, statH, 14);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();

    ctx.font = "800 36px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(s.value, x + statW / 2, y + 35);

    ctx.font = "400 16px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillText(s.label, x + statW / 2, y + 65);
  });

  // Footer URL on orange
  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("intentia.com.br", W / 2, H - 40);
}

function drawPersonas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W; canvas.height = H;

  ctx.fillStyle = "#151A23";
  ctx.fillRect(0, 0, W, H);
  drawBars(ctx, W, H);
  drawWhiteLogo(ctx, W / 2, 70, 44);
  drawSectionBadge(ctx, W, 105, "Para Quem É");

  ctx.font = "700 38px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Feita para quem decide", W / 2, 185);
  ctx.fillStyle = "#FF6B2B";
  ctx.fillText("antes de investir", W / 2, 233);

  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "center";
  ctx.fillText("Se você trabalha com marketing B2B, a Intentia é pra você.", W / 2, 278);

  const personas = [
    {
      role: "Gestor de Marketing B2B",
      pain: "Precisa validar se o site está pronto antes de investir em mídia paga",
      color: "#FF6B2B",
      icon: "target",
    },
    {
      role: "Analista de Estratégia Digital",
      pain: "Precisa comparar posicionamento com concorrentes de forma objetiva",
      color: "#3B82F6",
      icon: "barchart",
    },
    {
      role: "Diretor de Marketing",
      pain: "Quer análises de nível consultoria para embasar decisões estratégicas",
      color: "#8B5CF6",
      icon: "brain",
    },
    {
      role: "Gestor de Tráfego Pago",
      pain: "Precisa decidir em qual canal investir primeiro com dados concretos",
      color: "#22C55E",
      icon: "lightbulb",
    },
    {
      role: "CEO / Fundador",
      pain: "Está pressionado para investir em ads mas não sabe se é o momento certo",
      color: "#F59E0B",
      icon: "shield",
    },
    {
      role: "Especialista em SEO / Growth",
      pain: "Precisa auditar dados estruturados e comparar com concorrentes",
      color: "#14B8A6",
      icon: "database",
    },
  ];

  const cardW = W - PAD * 2;
  const cardH = 140;
  const gap = 18;
  const startY = 320;

  personas.forEach((p, i) => {
    const y = startY + i * (cardH + gap);

    // Card bg
    ctx.beginPath();
    ctx.roundRect(PAD, y, cardW, cardH, 18);
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left accent bar
    ctx.beginPath();
    ctx.roundRect(PAD, y, 5, cardH, [18, 0, 0, 18]);
    ctx.fillStyle = p.color;
    ctx.fill();

    // Icon circle
    ctx.beginPath();
    ctx.arc(PAD + 50, y + 50, 24, 0, Math.PI * 2);
    ctx.fillStyle = p.color + "18";
    ctx.fill();
    drawIcon(ctx, p.icon, PAD + 50, y + 50, 36, p.color);

    // Role
    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(p.role, PAD + 90, y + 45);

    // Pain point
    ctx.font = "400 17px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    const painLines = wrapText(ctx, p.pain, cardW - 110);
    painLines.forEach((l, li) => {
      ctx.fillText(l, PAD + 90, y + 80 + li * 24);
    });
  });

  drawFooterUrl(ctx, W, H);
}

function drawCTA(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W; canvas.height = H;

  ctx.fillStyle = "#151A23";
  ctx.fillRect(0, 0, W, H);
  drawBars(ctx, W, H);

  // Large centered logo
  drawWhiteLogo(ctx, W / 2, H / 2 - 200, 80);

  drawDivider(ctx, W, H / 2 - 120);

  // Headline
  ctx.font = "700 42px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Pronto para investir", W / 2, H / 2 - 60);
  ctx.fillStyle = "#FF6B2B";
  ctx.fillText("com inteligência?", W / 2, H / 2 - 8);

  // Subtitle
  ctx.font = "400 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  const subLines = wrapText(ctx, "Crie seu primeiro projeto, analise sua URL e descubra em segundos quais canais de mídia são ideais para seu negócio B2B.", W - PAD * 2);
  subLines.forEach((l, i) => ctx.fillText(l, W / 2, H / 2 + 60 + i * 32));

  // CTA button
  const ctaY = H / 2 + 60 + subLines.length * 32 + 40;
  const ctaW = 360, ctaH = 60;
  ctx.beginPath();
  ctx.roundRect((W - ctaW) / 2, ctaY, ctaW, ctaH, 30);
  const ctaGrad = ctx.createLinearGradient((W - ctaW) / 2, ctaY, (W + ctaW) / 2, ctaY);
  ctaGrad.addColorStop(0, "#FF6B2B");
  ctaGrad.addColorStop(1, "#FF8F5E");
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Veja o Poder da Intentia →", W / 2, ctaY + ctaH / 2);

  // Secondary
  const secY = ctaY + ctaH + 20;
  const secW = 200, secH = 48;
  ctx.beginPath();
  ctx.roundRect((W - secW) / 2, secY, secW, secH, 24);
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = "500 18px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("Saiba Mais", W / 2, secY + secH / 2);

  drawFooterUrl(ctx, W, H);
}

// ─── CAPTIONS ───

const CAPTIONS: string[] = [
  // 0 - Hero
  `🎯 Descubra onde investir em mídia paga — antes de gastar.

A Intentia analisa sua presença digital e mostra exatamente o que precisa ser ajustado antes de investir em tráfego pago.

✅ Diagnóstico completo de URL
✅ Scores por canal (Google, Meta, LinkedIn, TikTok)
✅ Insights estratégicos com IA
✅ Benchmark competitivo

Estratégia antes da mídia. Sempre.

🔗 intentia.com.br

#MarketingB2B #EstratégiaDigital #MídiaPaga #Intentia #TráfegoPago`,

  // 1 - Funcionalidades 1/3
  `⚡ Funcionalidades da Intentia (1/3)

🎯 Diagnóstico Heurístico de URL
Análise automática de proposta de valor, clareza, jornada, SEO, conversão e conteúdo — tudo em segundos.

✨ Análise por IA (Gemini & Claude)
Enriqueça diagnósticos com IA. Use sua API key para insights aprofundados.

📊 Benchmark Competitivo com IA
Compare posicionamento com concorrentes via SWOT, gap analysis e enriquecimento por IA.

➡️ Deslize para ver mais funcionalidades

#Intentia #MarketingB2B #DiagnósticoDigital #Benchmark`,

  // 2 - Funcionalidades 2/3
  `⚡ Funcionalidades da Intentia (2/3)

💡 Score por Canal de Mídia
Scores individuais para Google, Meta, LinkedIn e TikTok Ads com objetivos e riscos.

🛡️ Alertas e Insights Estratégicos
Insights automáticos agrupados por projeto: alertas, oportunidades e melhorias.

🎯 Plano Tático por Canal
Estruture campanhas para Google, Meta, LinkedIn e TikTok com templates validados por nicho B2B.

➡️ Deslize para ver mais funcionalidades

#ScorePorCanal #AlertasEstratégicos #PlanoTático #Intentia`,

  // 3 - Funcionalidades 3/3
  `⚡ Funcionalidades da Intentia (3/3)

🚀 Playbook de Execução Gamificado
Diretivas de execução priorizadas com KPIs e ações específicas por canal.

🗄️ Dados Estruturados & Comparação
Extração automática de JSON-LD, Open Graph, Twitter Card e Microdata com comparação.

📄 Relatórios PDF e Exportação CSV
Relatórios consolidados em PDF, exportação por seção e dados em CSV.

Tudo que você precisa para decidir com inteligência. 🧠

#Playbook #DadosEstruturados #Relatórios #Intentia #MarketingB2B`,

  // 4 - Como Funciona
  `🔄 Como funciona a Intentia — 7 passos

1️⃣ Cadastre a URL do projeto
2️⃣ Diagnóstico heurístico automático
3️⃣ Adicione concorrentes para benchmark
4️⃣ Ative análise por IA (Gemini ou Claude)
5️⃣ Receba scores por canal de mídia
6️⃣ Visualize insights e alertas estratégicos
7️⃣ Exporte relatórios em PDF e CSV

Da URL ao relatório completo — sem achismo.

🔗 intentia.com.br

#ComoFunciona #MarketingB2B #Intentia #EstratégiaDigital`,

  // 5 - Inteligência Artificial
  `🤖 Inteligência Artificial na Intentia

Use sua própria API key para análises de nível consultoria:

🔵 Google Gemini — Flash, Pro e Preview
🟣 Anthropic Claude — Sonnet, Haiku e Opus

O que a IA faz por você:
✅ Análise semântica profunda
✅ Recomendações por canal
✅ Comparação inteligente com concorrentes
✅ Insights que humanos levariam horas para gerar

🔒 Suas chaves ficam seguras — nunca armazenamos em texto puro.

#IA #InteligênciaArtificial #Gemini #Claude #Intentia #MarketingB2B`,

  // 6 - Benefícios + Números
  `📈 Por que escolher a Intentia?

✅ Economize budget evitando investimentos prematuros
✅ Decisões baseadas em dados, não em achismo
✅ Análise de nível consultoria em minutos
✅ Benchmark competitivo automatizado
✅ Alertas antes de desperdiçar verba
✅ Insights acionáveis por projeto
✅ Compatível com Google, Meta, LinkedIn e TikTok
✅ Relatórios prontos para apresentar

📊 6 scores por dimensão
📱 4 canais avaliados
🤖 8+ modelos de IA
📄 5 formatos de export

#Benefícios #MarketingB2B #Intentia #ROI #EstratégiaDigital`,

  // 7 - Para Quem É
  `👥 Para quem é a Intentia?

Se você trabalha com marketing B2B, a Intentia é pra você:

🎯 Gestor de Marketing B2B
Valide se o site está pronto antes de investir em mídia.

📊 Analista de Estratégia Digital
Compare posicionamento com concorrentes de forma objetiva.

🧠 Diretor de Marketing
Análises de nível consultoria para embasar decisões.

💡 Gestor de Tráfego Pago
Decida em qual canal investir primeiro com dados concretos.

🛡️ CEO / Fundador
Saiba se é o momento certo de investir em ads.

🗄️ Especialista em SEO / Growth
Audite dados estruturados e compare com concorrentes.

#ParaQuemÉ #MarketingB2B #Intentia #Personas`,

  // 8 - CTA
  `🚀 Estratégia antes da mídia.

A Intentia é a plataforma que analisa, compara e recomenda — antes de você investir um centavo em mídia paga.

✅ Diagnóstico de URL
✅ Benchmark com concorrentes
✅ Scores por canal
✅ Análise com IA
✅ Alertas estratégicos
✅ Plano tático
✅ Relatórios exportáveis

Veja o poder da Intentia. 💡

🔗 intentia.com.br

#Intentia #MarketingB2B #EstratégiaDigital #MídiaPaga #TráfegoPago`,
];

// ─── COMPONENT ───

export function BrandLandingPosts() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>(new Array(POSTS.length).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(async () => {
      const refs = canvasRefs.current;
      if (refs[0]) await drawHero(refs[0]);
      if (refs[1]) drawFeatures(refs[1], 0);
      if (refs[2]) drawFeatures(refs[2], 1);
      if (refs[3]) drawFeatures(refs[3], 2);
      if (refs[4]) drawHowItWorks(refs[4]);
      if (refs[5]) drawAI(refs[5]);
      if (refs[6]) drawBenefits(refs[6]);
      if (refs[7]) drawPersonas(refs[7]);
      if (refs[8]) drawCTA(refs[8]);
      setReady(true);
    });
  }, []);

  const handleDownload = useCallback((index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = POSTS[index].filename;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, []);

  const handleDownloadCaption = useCallback((index: number) => {
    const caption = CAPTIONS[index];
    if (!caption) return;
    const blob = new Blob([caption], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.download = POSTS[index].filename.replace(".jpg", "-legenda.txt");
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  const prev = () => setCurrentIndex((i) => (i === 0 ? POSTS.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === POSTS.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Posts da Landing Page</h3>
      <p className="text-xs text-muted-foreground">
        {POSTS.length} posts — 1080 × 1350px cada. Conteúdo completo da landing page adaptado para redes sociais.
      </p>

      {/* Carousel */}
      <div className="relative">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-full" onClick={prev} aria-label="Item anterior">
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {currentIndex + 1} / {POSTS.length}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {POSTS[currentIndex].title}
                </span>
              </div>

              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                {POSTS.map((p, i) => (
                  <canvas
                    key={p.id}
                    ref={(el) => { canvasRefs.current[i] = el; }}
                    className="w-full h-auto"
                    style={{
                      aspectRatio: "1080 / 1350",
                      display: i === currentIndex ? "block" : "none",
                    }}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownload(currentIndex)}
                    disabled={!ready}
                  >
                    <Download className="h-4 w-4" />
                    Baixar JPG
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownloadCaption(currentIndex)}
                  >
                    <FileText className="h-4 w-4" />
                    Baixar Legenda
                  </Button>
                </div>

                <div className="flex gap-1.5">
                  {POSTS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === currentIndex
                          ? "w-6 bg-primary"
                          : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-full" onClick={next} aria-label="Próximo item">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Download all */}
      <div className="pt-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!ready}
          onClick={() => {
            POSTS.forEach((_, i) => {
              setTimeout(() => handleDownload(i), i * 300);
            });
          }}
        >
          <Download className="h-4 w-4" />
          Baixar Todos JPG ({POSTS.length} posts)
        </Button>
      </div>
    </div>
  );
}
