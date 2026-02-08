import { useRef, useEffect, useState, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── VALUE DEFINITIONS ───

interface ValuePost {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: "chart" | "target" | "sparkles" | "eye" | "rocket";
  bgColor: string;
  textColor: string;
  accentColor: string;
  filename: string;
}

const VALUES: ValuePost[] = [
  {
    id: "dados",
    title: "Dados antes\nde intuição",
    subtitle: "Nossos Valores — 01/05",
    description: "Decisões baseadas em evidências.\nScores objetivos, benchmark real\ne métricas que importam.",
    icon: "chart",
    bgColor: "#151A23",
    textColor: "#FFFFFF",
    accentColor: "#FF6B2B",
    filename: "intentia-valor-dados-1080x1350.jpg",
  },
  {
    id: "estrategia",
    title: "Estratégia antes\nda mídia",
    subtitle: "Nossos Valores — 02/05",
    description: "Diagnóstico precede investimento.\nEntenda sua prontidão digital\nantes de gastar em ads.",
    icon: "target",
    bgColor: "#CC4400",
    textColor: "#FFFFFF",
    accentColor: "#FFFFFF",
    filename: "intentia-valor-estrategia-1080x1350.jpg",
  },
  {
    id: "ia",
    title: "IA como\naliada",
    subtitle: "Nossos Valores — 03/05",
    description: "Tecnologia potencializa,\nnão substitui o estrategista.\nGemini e Claude ao seu lado.",
    icon: "sparkles",
    bgColor: "#FFF5F0",
    textColor: "#151A23",
    accentColor: "#FF6B2B",
    filename: "intentia-valor-ia-1080x1350.jpg",
  },
  {
    id: "transparencia",
    title: "Transparência\ntotal",
    subtitle: "Nossos Valores — 04/05",
    description: "Scores objetivos, sem caixa-preta.\nVocê entende cada número,\ncada recomendação.",
    icon: "eye",
    bgColor: "#151A23",
    textColor: "#FFFFFF",
    accentColor: "#FF6B2B",
    filename: "intentia-valor-transparencia-1080x1350.jpg",
  },
  {
    id: "inovacao",
    title: "Inovação\ncontínua",
    subtitle: "Nossos Valores — 05/05",
    description: "Evolução constante da plataforma.\nNovas features, novos modelos,\nnovos insights — sempre.",
    icon: "rocket",
    bgColor: "#CC4400",
    textColor: "#FFFFFF",
    accentColor: "#FFFFFF",
    filename: "intentia-valor-inovacao-1080x1350.jpg",
  },
];

const CAPTIONS: string[] = [
  `📊 Dados antes de intuição.

Na Intentia, cada decisão é fundamentada em evidências — não em achismo.

Scores objetivos por canal, benchmark real contra concorrentes e métricas que realmente importam para o seu investimento em mídia.

Porque investir com inteligência começa com dados confiáveis.

#Intentia #IntentiaHub #MarketingB2B #DadosReais #EstratégiaDigital #MídiaPaga`,

  `🎯 Estratégia antes da mídia.

Antes de investir um centavo em ads, você precisa saber se está pronto.

Na Intentia, o diagnóstico vem primeiro. Avaliamos a prontidão digital do seu site, identificamos gaps e só então recomendamos onde investir.

Porque gastar sem estratégia é desperdiçar budget.

#Intentia #IntentiaHub #EstratégiaAntesDaMídia #MarketingB2B #DiagnósticoDigital #GoogleAds #LinkedInAds`,

  `🤖 IA como aliada.

Inteligência Artificial não substitui o estrategista — ela potencializa.

Na Intentia, Gemini e Claude trabalham ao seu lado para gerar insights de nível consultoria em minutos. Você decide, a IA ilumina o caminho.

#Intentia #IntentiaHub #IAMarketing #InteligênciaArtificial #Gemini #Claude #MarketingB2B #B2B`,

  `👁️ Transparência total.

Sem caixa-preta. Sem métricas confusas. Sem promessas vazias.

Na Intentia, cada score tem explicação. Cada recomendação tem fundamento. Você entende exatamente por que investir (ou não) em cada canal.

Clareza é o nosso compromisso.

#Intentia #IntentiaHub #Transparência #MarketingB2B #ScorePorCanal #MídiaPaga #DadosAbertos`,

  `🚀 Inovação contínua.

A Intentia nunca para de evoluir.

Novos modelos de IA, novas métricas, novas funcionalidades — tudo para que sua estratégia de mídia esteja sempre à frente.

Porque o mercado muda, e sua plataforma precisa acompanhar.

#Intentia #IntentiaHub #Inovação #SaaS #MarketingB2B #TechB2B #GrowthB2B #EmBreve`,
];

// ─── CANVAS ICON DRAWERS ───

function drawIconChart(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  ctx.fillStyle = color;
  const bw = s * 0.16, gap = s * 0.1;
  const heights = [0.4, 0.7, 0.5, 0.9, 0.6];
  const totalW = heights.length * bw + (heights.length - 1) * gap;
  const startX = cx - totalW / 2;
  const baseY = cy + s * 0.4;
  heights.forEach((h, i) => {
    const x = startX + i * (bw + gap);
    const barH = s * h;
    ctx.beginPath();
    ctx.roundRect(x, baseY - barH, bw, barH, bw * 0.3);
    ctx.fill();
  });
}

function drawIconTarget(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.08;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.42, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.26, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
}

function drawIconSparkles(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
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
  drawStar(cx - s * 0.18, cy - s * 0.08, s * 0.32);
  drawStar(cx + s * 0.28, cy + s * 0.18, s * 0.22);
  drawStar(cx + s * 0.32, cy - s * 0.28, s * 0.14);
}

function drawIconEye(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.08;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Eye shape
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.45, cy);
  ctx.quadraticCurveTo(cx - s * 0.15, cy - s * 0.3, cx, cy - s * 0.3);
  ctx.quadraticCurveTo(cx + s * 0.15, cy - s * 0.3, cx + s * 0.45, cy);
  ctx.quadraticCurveTo(cx + s * 0.15, cy + s * 0.3, cx, cy + s * 0.3);
  ctx.quadraticCurveTo(cx - s * 0.15, cy + s * 0.3, cx - s * 0.45, cy);
  ctx.stroke();
  // Iris
  ctx.beginPath(); ctx.arc(cx, cy, s * 0.15, 0, Math.PI * 2);
  ctx.fillStyle = color; ctx.fill();
  // Pupil highlight
  ctx.beginPath(); ctx.arc(cx - s * 0.04, cy - s * 0.05, s * 0.045, 0, Math.PI * 2);
  ctx.fillStyle = ctx.strokeStyle === "#FFFFFF" ? "#CC4400" : "#FFF5F0";
  ctx.fill();
}

function drawIconRocket(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Flames
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.12, cy + s * 0.2);
  ctx.quadraticCurveTo(cx - s * 0.08, cy + s * 0.38, cx, cy + s * 0.45);
  ctx.quadraticCurveTo(cx + s * 0.08, cy + s * 0.38, cx + s * 0.12, cy + s * 0.2);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.4;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Body
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.42);
  ctx.bezierCurveTo(cx + s * 0.05, cy - s * 0.38, cx + s * 0.18, cy - s * 0.15, cx + s * 0.16, cy + s * 0.1);
  ctx.lineTo(cx + s * 0.13, cy + s * 0.2);
  ctx.lineTo(cx - s * 0.13, cy + s * 0.2);
  ctx.lineTo(cx - s * 0.16, cy + s * 0.1);
  ctx.bezierCurveTo(cx - s * 0.18, cy - s * 0.15, cx - s * 0.05, cy - s * 0.38, cx, cy - s * 0.42);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.07;
  ctx.stroke();

  // Window
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.1, s * 0.07, 0, Math.PI * 2);
  ctx.stroke();

  // Fins
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.16, cy + s * 0.05);
  ctx.lineTo(cx - s * 0.3, cy + s * 0.28);
  ctx.lineTo(cx - s * 0.13, cy + s * 0.2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.16, cy + s * 0.05);
  ctx.lineTo(cx + s * 0.3, cy + s * 0.28);
  ctx.lineTo(cx + s * 0.13, cy + s * 0.2);
  ctx.stroke();

  ctx.restore();
}

const ICON_DRAWERS: Record<ValuePost["icon"], (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) => void> = {
  chart: drawIconChart,
  target: drawIconTarget,
  sparkles: drawIconSparkles,
  eye: drawIconEye,
  rocket: drawIconRocket,
};

// ─── DRAW VALUE POST ───

function drawValuePost(canvas: HTMLCanvasElement, value: ValuePost) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;

  const { bgColor, textColor, accentColor } = value;
  const isDark = bgColor === "#151A23" || bgColor === "#CC4400";

  // ── Background ──
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  // Subtle texture overlay
  if (isDark) {
    const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.6);
    glow.addColorStop(0, bgColor === "#CC4400" ? "rgba(255,255,255,0.06)" : "rgba(255,107,43,0.06)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Light bg: subtle warm gradient
    const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.7);
    glow.addColorStop(0, "rgba(255,107,43,0.05)");
    glow.addColorStop(1, "rgba(255,107,43,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  // ── Top accent bar ──
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, accentColor);
  barGrad.addColorStop(1, accentColor === "#FFFFFF" ? "rgba(255,255,255,0.6)" : "#FF8F5E");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, 6);

  // ── Logo top-left ──
  ctx.font = "800 36px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const logoText = "intentia";
  const logoDot = ".";
  const logoTw = ctx.measureText(logoText).width;
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.25)" : "rgba(21,26,35,0.2)";
  ctx.fillText(logoText, 72, 72);
  ctx.fillStyle = accentColor === "#FFFFFF" ? "rgba(255,255,255,0.5)" : "rgba(255,107,43,0.5)";
  ctx.fillText(logoDot, 72 + logoTw, 72);

  // ── Subtitle badge ──
  const badgeY = 140;
  ctx.font = "600 16px Inter, system-ui, sans-serif";
  const badgeText = value.subtitle.toUpperCase();
  const badgeW = ctx.measureText(badgeText).width + 40;
  ctx.beginPath();
  ctx.roundRect(72, badgeY, badgeW, 36, 18);
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(21,26,35,0.06)";
  ctx.fill();
  ctx.fillStyle = accentColor;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, 72 + 20, badgeY + 18);

  // ── Icon (centered, large) ──
  const iconY = 340;
  // Icon circle background
  ctx.beginPath();
  ctx.arc(W / 2, iconY, 110, 0, Math.PI * 2);
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,107,43,0.08)";
  ctx.fill();
  // Outer ring
  ctx.beginPath();
  ctx.arc(W / 2, iconY, 110, 0, Math.PI * 2);
  ctx.strokeStyle = accentColor === "#FFFFFF" ? "rgba(255,255,255,0.15)" : "rgba(255,107,43,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ICON_DRAWERS[value.icon](ctx, W / 2, iconY, 80, accentColor);

  // ── Title (large, bold) ──
  ctx.font = "800 72px Inter, system-ui, sans-serif";
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const titleLines = value.title.split("\n");
  const titleStartY = 540;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, titleStartY + i * 88);
  });

  // ── Divider ──
  const divY = titleStartY + titleLines.length * 88 + 30;
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 40, divY);
  ctx.lineTo(W / 2 + 40, divY);
  ctx.stroke();

  // ── Description ──
  ctx.font = "400 26px Inter, system-ui, sans-serif";
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.6)" : "rgba(21,26,35,0.55)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const descLines = value.description.split("\n");
  const descStartY = divY + 55;
  descLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, descStartY + i * 38);
  });

  // ── Decorative dots ──
  const dotPositions = [
    { x: 100, y: 250 }, { x: 980, y: 280 }, { x: 130, y: 900 },
    { x: 950, y: 870 }, { x: 90, y: 1100 }, { x: 990, y: 1080 },
  ];
  dotPositions.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,107,43,0.1)";
    ctx.fill();
  });

  // ── Bottom: mission statement ──
  const missionY = H - 200;
  ctx.beginPath();
  ctx.roundRect(72, missionY, W - 144, 80, 16);
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.04)" : "rgba(21,26,35,0.03)";
  ctx.fill();
  ctx.font = "500 18px Inter, system-ui, sans-serif";
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.4)" : "rgba(21,26,35,0.35)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Estratégia de mídia B2B com inteligência.", W / 2, missionY + 40);

  // ── Footer URL ──
  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = isDark ? "rgba(255,255,255,0.25)" : "rgba(21,26,35,0.2)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("intentia.com.br", W / 2, H - 60);

  // ── Bottom accent bar ──
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, H - 6, W, 6);
}

// ─── COMPONENT ───

export function BrandValuesPosts() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>(new Array(VALUES.length).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      VALUES.forEach((value, i) => {
        const canvas = canvasRefs.current[i];
        if (canvas) drawValuePost(canvas, value);
      });
      setReady(true);
    });
  }, []);

  const handleDownload = useCallback((index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = VALUES[index].filename;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, []);

  const handleDownloadCaption = useCallback((index: number) => {
    const caption = CAPTIONS[index];
    if (!caption) return;
    const blob = new Blob([caption], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.download = VALUES[index].filename.replace(".jpg", "-legenda.txt");
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  const prev = () => setCurrentIndex((i) => (i === 0 ? VALUES.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === VALUES.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Posts de Proposta de Valor</h3>
      <p className="text-xs text-muted-foreground">
        {VALUES.length} posts — 1080 × 1350px cada. Um post para cada valor da marca com cores alternadas.
      </p>

      {/* Carousel */}
      <div className="relative">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-full" onClick={prev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {currentIndex + 1} / {VALUES.length}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {VALUES[currentIndex].title.replace("\n", " ")}
                </span>
              </div>

              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                {VALUES.map((v, i) => (
                  <canvas
                    key={v.id}
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
                  {VALUES.map((_, i) => (
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

          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-full" onClick={next}>
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
            VALUES.forEach((_, i) => {
              setTimeout(() => handleDownload(i), i * 300);
            });
          }}
        >
          <Download className="h-4 w-4" />
          Baixar Todos ({VALUES.length} posts)
        </Button>
      </div>
    </div>
  );
}
