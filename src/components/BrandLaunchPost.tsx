import { useRef, useEffect, useState, useCallback } from "react";
import { Download, FileText } from "lucide-react";
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

// ─── CANVAS VECTOR ICONS ───

function drawRocketIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // ── Outer glow ──
  ctx.save();
  const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.7);
  glowGrad.addColorStop(0, "rgba(255,107,43,0.12)");
  glowGrad.addColorStop(1, "rgba(255,107,43,0)");
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, s * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Flames (behind body) ──
  // Outer flame (orange-red)
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.14, cy + s * 0.22);
  ctx.quadraticCurveTo(cx - s * 0.1, cy + s * 0.42, cx - s * 0.04, cy + s * 0.52);
  ctx.quadraticCurveTo(cx, cy + s * 0.44, cx + s * 0.04, cy + s * 0.52);
  ctx.quadraticCurveTo(cx + s * 0.1, cy + s * 0.42, cx + s * 0.14, cy + s * 0.22);
  const flameGrad = ctx.createLinearGradient(cx, cy + s * 0.2, cx, cy + s * 0.55);
  flameGrad.addColorStop(0, "#FF6B2B");
  flameGrad.addColorStop(0.6, "#FF4500");
  flameGrad.addColorStop(1, "rgba(255,69,0,0.2)");
  ctx.fillStyle = flameGrad;
  ctx.fill();

  // Inner flame (yellow-white)
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.08, cy + s * 0.22);
  ctx.quadraticCurveTo(cx - s * 0.04, cy + s * 0.34, cx, cy + s * 0.4);
  ctx.quadraticCurveTo(cx + s * 0.04, cy + s * 0.34, cx + s * 0.08, cy + s * 0.22);
  const innerFlame = ctx.createLinearGradient(cx, cy + s * 0.2, cx, cy + s * 0.42);
  innerFlame.addColorStop(0, "#FFDD57");
  innerFlame.addColorStop(0.5, "#FFB347");
  innerFlame.addColorStop(1, "rgba(255,179,71,0.1)");
  ctx.fillStyle = innerFlame;
  ctx.fill();

  // ── Left fin ──
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.18, cy + s * 0.05);
  ctx.quadraticCurveTo(cx - s * 0.38, cy + s * 0.2, cx - s * 0.32, cy + s * 0.35);
  ctx.lineTo(cx - s * 0.18, cy + s * 0.22);
  ctx.closePath();
  ctx.fillStyle = "#FF6B2B";
  ctx.fill();
  ctx.strokeStyle = "#CC4400";
  ctx.lineWidth = s * 0.02;
  ctx.stroke();

  // ── Right fin ──
  ctx.beginPath();
  ctx.moveTo(cx + s * 0.18, cy + s * 0.05);
  ctx.quadraticCurveTo(cx + s * 0.38, cy + s * 0.2, cx + s * 0.32, cy + s * 0.35);
  ctx.lineTo(cx + s * 0.18, cy + s * 0.22);
  ctx.closePath();
  ctx.fillStyle = "#FF6B2B";
  ctx.fill();
  ctx.strokeStyle = "#CC4400";
  ctx.lineWidth = s * 0.02;
  ctx.stroke();

  // ── Rocket body (filled white with subtle gradient) ──
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.48);
  ctx.bezierCurveTo(cx + s * 0.06, cy - s * 0.44, cx + s * 0.22, cy - s * 0.2, cx + s * 0.2, cy + s * 0.12);
  ctx.lineTo(cx + s * 0.16, cy + s * 0.22);
  ctx.lineTo(cx - s * 0.16, cy + s * 0.22);
  ctx.lineTo(cx - s * 0.2, cy + s * 0.12);
  ctx.bezierCurveTo(cx - s * 0.22, cy - s * 0.2, cx - s * 0.06, cy - s * 0.44, cx, cy - s * 0.48);
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(cx - s * 0.2, cy, cx + s * 0.2, cy);
  bodyGrad.addColorStop(0, "#E8E8E8");
  bodyGrad.addColorStop(0.3, "#FFFFFF");
  bodyGrad.addColorStop(0.7, "#FFFFFF");
  bodyGrad.addColorStop(1, "#D4D4D4");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Body outline
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = s * 0.02;
  ctx.stroke();

  // ── Nose cone accent (orange tip) ──
  ctx.beginPath();
  ctx.moveTo(cx, cy - s * 0.48);
  ctx.bezierCurveTo(cx + s * 0.04, cy - s * 0.42, cx + s * 0.1, cy - s * 0.34, cx + s * 0.12, cy - s * 0.28);
  ctx.lineTo(cx - s * 0.12, cy - s * 0.28);
  ctx.bezierCurveTo(cx - s * 0.1, cy - s * 0.34, cx - s * 0.04, cy - s * 0.42, cx, cy - s * 0.48);
  ctx.closePath();
  const noseGrad = ctx.createLinearGradient(cx, cy - s * 0.48, cx, cy - s * 0.28);
  noseGrad.addColorStop(0, "#FF8F5E");
  noseGrad.addColorStop(1, "#FF6B2B");
  ctx.fillStyle = noseGrad;
  ctx.fill();

  // ── Window (porthole) ──
  ctx.beginPath();
  ctx.arc(cx, cy - s * 0.08, s * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = "#1A2332";
  ctx.fill();
  ctx.strokeStyle = "#B0B0B0";
  ctx.lineWidth = s * 0.025;
  ctx.stroke();

  // Window highlight
  ctx.beginPath();
  ctx.arc(cx - s * 0.025, cy - s * 0.105, s * 0.03, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fill();

  // ── Body stripe (orange band) ──
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.19, cy + s * 0.08);
  ctx.lineTo(cx + s * 0.19, cy + s * 0.08);
  ctx.lineTo(cx + s * 0.18, cy + s * 0.13);
  ctx.lineTo(cx - s * 0.18, cy + s * 0.13);
  ctx.closePath();
  ctx.fillStyle = "#FF6B2B";
  ctx.fill();

  // ── Exhaust nozzle ──
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.12, cy + s * 0.22);
  ctx.lineTo(cx - s * 0.1, cy + s * 0.26);
  ctx.lineTo(cx + s * 0.1, cy + s * 0.26);
  ctx.lineTo(cx + s * 0.12, cy + s * 0.22);
  ctx.closePath();
  ctx.fillStyle = "#999";
  ctx.fill();

  ctx.restore();
}

function drawStarBurst(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  ctx.save();
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
    ctx.closePath();
    ctx.fill();
  };
  drawStar(cx - s * 0.15, cy - s * 0.1, s * 0.28);
  drawStar(cx + s * 0.25, cy + s * 0.2, s * 0.18);
  drawStar(cx + s * 0.3, cy - s * 0.3, s * 0.12);
  ctx.restore();
}

// ─── DRAW LAUNCH POST ───

function drawLaunchPost(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;

  // ── Background: dark with subtle gradient ──
  ctx.fillStyle = "#151A23";
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow top-center
  const glow1 = ctx.createRadialGradient(W / 2, 300, 0, W / 2, 300, 500);
  glow1.addColorStop(0, "rgba(255,107,43,0.08)");
  glow1.addColorStop(1, "rgba(255,107,43,0)");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow bottom
  const glow2 = ctx.createRadialGradient(W / 2, H - 300, 0, W / 2, H - 300, 400);
  glow2.addColorStop(0, "rgba(255,107,43,0.05)");
  glow2.addColorStop(1, "rgba(255,107,43,0)");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  // Top & bottom accent bars
  drawBars(ctx, W, H);

  // ── Decorative floating particles ──
  ctx.globalAlpha = 0.08;
  const particles = [
    { x: 120, y: 200, r: 4 }, { x: 950, y: 150, r: 3 }, { x: 80, y: 600, r: 5 },
    { x: 980, y: 500, r: 3 }, { x: 200, y: 900, r: 4 }, { x: 900, y: 850, r: 5 },
    { x: 150, y: 1100, r: 3 }, { x: 920, y: 1050, r: 4 }, { x: 500, y: 180, r: 3 },
    { x: 600, y: 1200, r: 3 },
  ];
  particles.forEach(({ x, y, r }) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B2B";
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── "EM BREVE" badge at top ──
  const badgeY = 100;
  ctx.font = "600 18px Inter, system-ui, sans-serif";
  const badgeText = "EM BREVE";
  const badgeW = ctx.measureText(badgeText).width + 48;
  const badgeH = 40;
  ctx.beginPath();
  ctx.roundRect((W - badgeW) / 2, badgeY, badgeW, badgeH, 20);
  ctx.fillStyle = "rgba(255,107,43,0.15)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,107,43,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = "#FF6B2B";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(badgeText, W / 2, badgeY + badgeH / 2);

  // ── Rocket icon ──
  drawRocketIcon(ctx, W / 2, 240, 100);

  // ── Logo ──
  drawWhiteLogo(ctx, W / 2, 360, 80);

  // ── Tagline ──
  ctx.font = "500 26px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Estratégia antes da mídia.", W / 2, 420);

  // ── Divider ──
  ctx.strokeStyle = "rgba(255,107,43,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 50, 475);
  ctx.lineTo(W / 2 + 50, 475);
  ctx.stroke();

  // ── Main headline ──
  ctx.font = "700 42px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Algo grande está", W / 2, 540);
  ctx.fillText("chegando.", W / 2, 592);

  // ── Description ──
  ctx.font = "400 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "center";
  const descLines = [
    "A plataforma que vai transformar",
    "como empresas B2B investem",
    "em mídia digital.",
  ];
  descLines.forEach((line, i) => {
    ctx.fillText(line, W / 2, 660 + i * 34);
  });

  // ── Feature cards (3 cards) ──
  const features = [
    { icon: "diagnóstico", label: "Diagnóstico Inteligente", desc: "Análise heurística + IA antes de investir" },
    { icon: "benchmark", label: "Benchmark Competitivo", desc: "SWOT automatizado contra concorrentes" },
    { icon: "scores", label: "Scores por Canal", desc: "Google, Meta, LinkedIn e TikTok avaliados" },
  ];

  const cardW = 280, cardH = 130, cardGap = 24;
  const totalCardsW = features.length * cardW + (features.length - 1) * cardGap;
  const cardsStartX = (W - totalCardsW) / 2;
  const cardsY = 790;

  features.forEach((feat, i) => {
    const cx = cardsStartX + i * (cardW + cardGap);

    // Card background
    ctx.beginPath();
    ctx.roundRect(cx, cardsY, cardW, cardH, 14);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Small colored dot
    ctx.beginPath();
    ctx.arc(cx + 24, cardsY + 30, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#FF6B2B";
    ctx.fill();

    // Label
    ctx.font = "600 17px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(feat.label, cx + 40, cardsY + 30);

    // Description
    ctx.font = "400 14px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.textAlign = "left";

    // Wrap desc text
    const words = feat.desc.split(" ");
    const lines: string[] = [];
    let line = "";
    words.forEach((w) => {
      const test = line + (line ? " " : "") + w;
      if (ctx.measureText(test).width > cardW - 48) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.forEach((l, li) => {
      ctx.fillText(l, cx + 24, cardsY + 62 + li * 22);
    });
  });

  // ── Sparkles decoration ──
  drawStarBurst(ctx, 140, 560, 50, "rgba(255,107,43,0.15)");
  drawStarBurst(ctx, 940, 580, 40, "rgba(255,107,43,0.12)");

  // ── "Cadastre-se para acesso antecipado" CTA ──
  const ctaY = 980;
  const ctaW = 480, ctaH = 56;
  const ctaGrad = ctx.createLinearGradient((W - ctaW) / 2, ctaY, (W + ctaW) / 2, ctaY);
  ctaGrad.addColorStop(0, "#FF6B2B");
  ctaGrad.addColorStop(1, "#FF8F5E");
  ctx.beginPath();
  ctx.roundRect((W - ctaW) / 2, ctaY, ctaW, ctaH, 28);
  ctx.fillStyle = ctaGrad;
  ctx.fill();

  // CTA shadow
  ctx.save();
  ctx.shadowColor = "rgba(255,107,43,0.35)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.roundRect((W - ctaW) / 2, ctaY, ctaW, ctaH, 28);
  ctx.fillStyle = ctaGrad;
  ctx.fill();
  ctx.restore();

  ctx.font = "600 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Siga nossas redes sociais", W / 2, ctaY + ctaH / 2);

  // ── Bottom info pills ──
  const pillY = 1080;
  const pillData = ["Grátis para começar", "IA integrada", "100% B2B"];
  const pillW = 200, pillH = 38, pillGap = 20;
  const totalPillsW = pillData.length * pillW + (pillData.length - 1) * pillGap;
  let px = (W - totalPillsW) / 2;

  pillData.forEach((label) => {
    ctx.beginPath();
    ctx.roundRect(px, pillY, pillW, pillH, 19);
    ctx.fillStyle = "rgba(255,107,43,0.1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,107,43,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = "500 15px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FF6B2B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, px + pillW / 2, pillY + pillH / 2);
    px += pillW + pillGap;
  });

  // ── Countdown-style text ──
  ctx.font = "400 18px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Lançamento em breve — fique atento.", W / 2, 1165);

  // ── Footer URL ──
  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("intentia.com.br", W / 2, H - 50);
}

// ─── CAPTION ───

const LAUNCH_CAPTION = `🚀 Algo grande está chegando.

A Intentia é a plataforma que vai transformar como empresas B2B investem em mídia digital.

Chega de investir às cegas. Chega de desperdiçar budget em canais errados.

Com a Intentia, você terá:
🎯 Diagnóstico inteligente do seu site antes de investir
📊 Benchmark competitivo automatizado com análise SWOT
📈 Scores por canal — Google, Meta, LinkedIn e TikTok
🤖 Inteligência Artificial para insights estratégicos

Tudo isso em uma única plataforma, pensada exclusivamente para o mercado B2B.

✅ Grátis para começar
✅ IA integrada (Gemini + Claude)
✅ 100% focada em B2B

Siga nossas redes sociais e fique por dentro 👇
🔗 intentia.com.br

#Intentia #IntentiaHub #MarketingB2B #MídiaPaga #EstratégiaDigital #IAMarketing #B2B #LaunchingSoon #EmBreve #GrowthB2B`;

// ─── COMPONENT ───

export function BrandLaunchPost() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (canvasRef.current) {
        drawLaunchPost(canvasRef.current);
        setReady(true);
      }
    });
  }, []);

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "intentia-lancamento-em-breve-1080x1350.jpg";
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, []);

  const handleDownloadCaption = useCallback(() => {
    const blob = new Blob([LAUNCH_CAPTION], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.download = "intentia-lancamento-em-breve-legenda.txt";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Post de Lançamento — Em Breve</h3>
      <p className="text-xs text-muted-foreground">
        1080 × 1350px — Post de anúncio de lançamento para feed do Instagram, LinkedIn e redes sociais.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ aspectRatio: "1080 / 1350" }}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownload}
            disabled={!ready}
          >
            <Download className="h-4 w-4" />
            Baixar JPG — 1080×1350
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleDownloadCaption}
          >
            <FileText className="h-4 w-4" />
            Baixar Legenda
          </Button>
        </div>
      </div>
    </div>
  );
}
