import { useRef, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandCasesPosts } from "@/components/BrandCasesPosts";
import { BrandLandingPosts } from "@/components/BrandLandingPosts";
import { BrandLaunchPost } from "@/components/BrandLaunchPost";
import { BrandValuesPosts } from "@/components/BrandValuesPosts";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

// ─── DRAW FUNCTIONS (Profile + Brand Post) ───

function drawProfileCard(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const S = 1080;
  canvas.width = S;
  canvas.height = S;

  ctx.fillStyle = "#FFF5F0";
  ctx.fillRect(0, 0, S, S);

  const barGrad = ctx.createLinearGradient(0, 0, S, 0);
  barGrad.addColorStop(0, "#FF6B2B");
  barGrad.addColorStop(1, "#FF8F5E");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, S, 6);
  ctx.fillRect(0, S - 6, S, 6);

  ctx.font = "800 120px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const text = "intentia";
  const dot = ".";
  const tw = ctx.measureText(text).width;
  const dw = ctx.measureText(dot).width;
  const total = tw + dw;
  const sx = S / 2 - total / 2;
  ctx.fillStyle = "#151A23";
  ctx.fillText(text, sx + tw / 2, S / 2 - 20);
  ctx.fillStyle = "#FF6B2B";
  ctx.fillText(dot, sx + tw + dw / 2, S / 2 - 20);

  ctx.font = "500 32px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#6B7280";
  ctx.fillText("Estratégia antes da mídia.", S / 2, S / 2 + 60);
}

function drawBrandPostCard(canvas: HTMLCanvasElement): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(); return; }
    const W = 1080, H = 1350;
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/dashboard-intentia.png";

    img.onload = () => {
      ctx.fillStyle = "#151A23";
      ctx.fillRect(0, 0, W, H);

      const barGrad = ctx.createLinearGradient(0, 0, W, 0);
      barGrad.addColorStop(0, "#FF6B2B");
      barGrad.addColorStop(1, "#FF8F5E");
      ctx.fillStyle = barGrad;
      ctx.fillRect(0, 0, W, 8);

      ctx.font = "800 72px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = "intentia";
      const dot = ".";
      const tw = ctx.measureText(text).width;
      const dw = ctx.measureText(dot).width;
      const total = tw + dw;
      const logoY = 100;
      const sx = W / 2 - total / 2;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(text, sx + tw / 2, logoY);
      ctx.fillStyle = "#FF6B2B";
      ctx.fillText(dot, sx + tw + dw / 2, logoY);

      ctx.font = "500 28px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.textAlign = "center";
      ctx.fillText("Estratégia antes da mídia.", W / 2, logoY + 60);

      const showcaseY = logoY + 110;
      const pad = 60;
      const imgW = W - pad * 2;
      const imgH = (img.height / img.width) * imgW;
      const showcaseH = Math.min(imgH, 480);

      ctx.save();
      ctx.shadowColor = "rgba(255,107,43,0.25)";
      ctx.shadowBlur = 40;
      ctx.shadowOffsetY = 8;
      ctx.beginPath();
      ctx.roundRect(pad, showcaseY, imgW, showcaseH, 16);
      ctx.clip();
      ctx.drawImage(img, 0, 0, img.width, img.height * (showcaseH / imgH), pad, showcaseY, imgW, showcaseH);
      ctx.restore();

      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(pad, showcaseY, imgW, showcaseH, 16);
      ctx.stroke();

      const contentY = showcaseY + showcaseH + 60;

      ctx.strokeStyle = "rgba(255,107,43,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 60, contentY);
      ctx.lineTo(W / 2 + 60, contentY);
      ctx.stroke();

      ctx.font = "400 24px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const lines = [
        "Plataforma de análise estratégica",
        "para marketing B2B.",
        "",
        "Diagnóstico de URL · Benchmark · Scores",
        "Insights · Dados Estruturados · IA",
      ];
      lines.forEach((line, i) => {
        ctx.fillText(line, W / 2, contentY + 50 + i * 38);
      });

      const pillY = contentY + 260;
      const pills = ["Análise Heurística", "Benchmark SWOT", "Score por Canal", "Insights com IA"];
      const pillW = 220, pillH = 42, pillGap = 16;
      const row1 = pills.slice(0, 2);
      const row2 = pills.slice(2, 4);
      const row1W = row1.length * pillW + (row1.length - 1) * pillGap;
      const row2W = row2.length * pillW + (row2.length - 1) * pillGap;

      [{ items: row1, totalW: row1W, y: pillY }, { items: row2, totalW: row2W, y: pillY + pillH + pillGap }].forEach(({ items, totalW: tw2, y }) => {
        let px = (W - tw2) / 2;
        items.forEach((label) => {
          ctx.beginPath();
          ctx.roundRect(px, y, pillW, pillH, 21);
          ctx.fillStyle = "rgba(255,107,43,0.12)";
          ctx.fill();
          ctx.strokeStyle = "rgba(255,107,43,0.3)";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.font = "500 17px Inter, system-ui, sans-serif";
          ctx.fillStyle = "#FF6B2B";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, px + pillW / 2, y + pillH / 2);
          px += pillW + pillGap;
        });
      });

      ctx.font = "400 22px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("intentia.com.br", W / 2, H - 60);

      ctx.fillStyle = barGrad;
      ctx.fillRect(0, H - 8, W, 8);

      resolve();
    };

    img.onerror = () => {
      ctx.fillStyle = "#151A23";
      ctx.fillRect(0, 0, W, H);
      ctx.font = "500 28px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Imagem não encontrada", W / 2, H / 2);
      resolve();
    };
  });
}

// ─── PAGE COMPONENT ───

export default function BrandPosts() {
  const profileCanvasRef = useRef<HTMLCanvasElement>(null);
  const brandPostCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (profileCanvasRef.current) drawProfileCard(profileCanvasRef.current);
      if (brandPostCanvasRef.current) drawBrandPostCard(brandPostCanvasRef.current);
    });
  }, []);

  const handleDownload = useCallback((canvasRef: React.RefObject<HTMLCanvasElement | null>, filename: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BackToHomeButton />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <Link
            to="/brand"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao Brand Guide
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Posts para Download
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Todos os posts da marca prontos para uso nas redes sociais. Exportados em <strong className="text-foreground">JPG 95%</strong> para máxima qualidade no Instagram.
          </p>
        </div>

        {/* ─── Perfil + Brand Post ─── */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Perfil & Marca</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Profile */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Foto de Perfil</h3>
                <p className="text-xs text-muted-foreground">1080 × 1080px — Logo versão principal, fundo claro</p>
              </div>
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                <canvas
                  ref={profileCanvasRef}
                  className="w-full h-auto"
                  style={{ aspectRatio: "1 / 1" }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleDownload(profileCanvasRef, "intentia-perfil-1080x1080.jpg")}
              >
                <Download className="h-4 w-4" />
                Baixar JPG — 1080×1080
              </Button>
            </div>

            {/* Brand Post */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Primeiro Post — Marca</h3>
                <p className="text-xs text-muted-foreground">1080 × 1350px — Apresentação da marca para feed</p>
              </div>
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                <canvas
                  ref={brandPostCanvasRef}
                  className="w-full h-auto"
                  style={{ aspectRatio: "1080 / 1350" }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleDownload(brandPostCanvasRef, "intentia-brand-post-1080x1350.jpg")}
              >
                <Download className="h-4 w-4" />
                Baixar JPG — 1080×1350
              </Button>
            </div>
          </div>
        </section>

        {/* ─── Cases ─── */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Cases de Uso</h2>
          <BrandCasesPosts />
        </section>

        {/* ─── Landing ─── */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Landing Page</h2>
          <BrandLandingPosts />
        </section>

        {/* ─── Lançamento ─── */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Lançamento</h2>
          <BrandLaunchPost />
        </section>

        {/* ─── Valores ─── */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Proposta de Valor</h2>
          <BrandValuesPosts />
        </section>
      </div>

      <Footer />
      <BackToTop />
    </div>
  );
}
