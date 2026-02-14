import { useRef, useEffect, useState, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { helpCategories } from "./helpData";

// ─── CONSTANTS ───

const W = 1280;
const H = 720;
const PAD = 60;
const ACCENT = "#FF6B2B";
const ACCENT_LIGHT = "#FF8F5E";
const BG = "#151A23";
const WHITE = "#FFFFFF";

// ─── LUCIDE SVG ICON RENDERER ───
// Renders Lucide icon SVG paths on canvas at any position/size/color.
// Paths from lucide.dev (viewBox 0 0 24 24, stroke-based).

// SVG path data from Lucide icons (official paths)
const LUCIDE_PATHS: Record<string, string[]> = {
  // Zap
  "getting-started": [
    "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  ],
  // Target
  "url-analysis": [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
    "M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12z",
    "M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  ],
  // Sparkles
  "ai-analysis": [
    "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",
    "M5 3v4",
    "M19 17v4",
    "M3 5h4",
    "M17 19h4",
  ],
  // BarChart3
  "benchmark": [
    "M3 3v18h18",
    "M18 17V9",
    "M13 17V5",
    "M8 17v-3",
  ],
  // Globe
  "channels": [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
    "M2 12h20",
    "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  ],
  // Lightbulb
  "insights": [
    "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5",
    "M9 18h6",
    "M10 22h4",
  ],
  // Crosshair
  "tactical": [
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z",
    "M22 12h-4",
    "M6 12H2",
    "M12 6V2",
    "M12 22v-4",
  ],
  // Database
  "structured-data": [
    "M12 2C6.5 2 2 4.2 2 7s4.5 5 10 5 10-2.2 10-5-4.5-5-10-5z",
    "M2 7v5c0 2.8 4.5 5 10 5s10-2.2 10-5V7",
    "M2 12v5c0 2.8 4.5 5 10 5s10-2.2 10-5v-5",
  ],
  // Wand2
  "structured-data-generator": [
    "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z",
    "m14 7 3 3",
    "M5 6v4",
    "M19 14v4",
    "M10 2v2",
    "M7 8H3",
    "M21 16h-4",
    "M11 3H9",
  ],
  // Users
  "audiences": [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
  // Gauge
  "seo-performance": [
    "m12 14 4-4",
    "M3.34 19a10 10 0 1 1 17.32 0",
  ],
  // Plug
  "integrations": [
    "M12 22v-5",
    "M9 8V2",
    "M15 8V2",
    "M18 8v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8Z",
  ],
  // Download
  "exports": [
    "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
    "M7 10l5 5 5-5",
    "M12 15V3",
  ],
  // Settings
  "settings": [
    "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  ],
  // Megaphone
  "operations": [
    "m3 11 18-5v12L3 13v-2z",
    "M11.6 16.8a3 3 0 1 1-5.8-1.6",
  ],
  // DollarSign
  "budget": [
    "M12 2v20",
    "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  ],
  // CalendarDays
  "calendar": [
    "M8 2v4",
    "M16 2v4",
    "M3 10h18",
    "M21 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z",
    "M8 14h.01",
    "M12 14h.01",
    "M16 14h.01",
    "M8 18h.01",
    "M12 18h.01",
    "M16 18h.01",
  ],
  // ShieldCheck
  "security": [
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
    "M9 12l2 2 4-4",
  ],
};

// Render a Lucide SVG icon on canvas using Path2D
function drawLucideIcon(
  ctx: CanvasRenderingContext2D,
  categoryId: string,
  cx: number,
  cy: number,
  size: number,
  color: string,
) {
  const paths = LUCIDE_PATHS[categoryId];
  if (!paths) return;

  const scale = size / 24;

  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "none";

  paths.forEach((d) => {
    const path = new Path2D(d);
    ctx.stroke(path);
  });

  ctx.restore();
}

// Category accent colors for variety
const CATEGORY_COLORS: Record<string, string> = {
  "getting-started": "#3B82F6",
  "url-analysis": "#FF6B2B",
  "ai-analysis": "#8B5CF6",
  "benchmark": "#22C55E",
  "channels": "#0EA5E9",
  "insights": "#EAB308",
  "tactical": "#F43F5E",
  "structured-data": "#14B8A6",
  "structured-data-generator": "#FF6B2B",
  "audiences": "#6366F1",
  "seo-performance": "#06B6D4",
  "integrations": "#3B82F6",
  "exports": "#10B981",
  "settings": "#6B7280",
  "operations": "#FF6B2B",
  "budget": "#10B981",
  "calendar": "#6366F1",
  "security": "#EF4444",
};

// ─── DRAW THUMBNAIL ───

function drawThumbnail(canvas: HTMLCanvasElement, categoryId: string, title: string, description: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = W;
  canvas.height = H;

  const catColor = CATEGORY_COLORS[categoryId] || ACCENT;

  // ── Background ──
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Subtle radial glow
  const glow = ctx.createRadialGradient(W * 0.35, H * 0.45, 0, W * 0.35, H * 0.45, W * 0.5);
  glow.addColorStop(0, catColor + "0A");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // ── Top & bottom accent bars ──
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, ACCENT);
  barGrad.addColorStop(1, ACCENT_LIGHT);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, 5);
  ctx.fillRect(0, H - 5, W, 5);

  // ── Logo top-left ──
  ctx.font = "800 28px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const logoText = "intentia";
  const logoDot = ".";
  const logoTw = ctx.measureText(logoText).width;
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fillText(logoText, PAD, 42);
  ctx.fillStyle = "rgba(255,107,43,0.4)";
  ctx.fillText(logoDot, PAD + logoTw, 42);

  // ── "TUTORIAL" badge top-right ──
  ctx.font = "600 14px Inter, system-ui, sans-serif";
  const badgeText = "TUTORIAL";
  const badgeW = ctx.measureText(badgeText).width + 28;
  ctx.beginPath();
  ctx.roundRect(W - PAD - badgeW, 28, badgeW, 28, 14);
  ctx.fillStyle = catColor + "25";
  ctx.fill();
  ctx.fillStyle = catColor;
  ctx.textAlign = "center";
  ctx.fillText(badgeText, W - PAD - badgeW / 2, 42);

  // ── Icon (large, left side) ──
  const iconCx = PAD + 120;
  const iconCy = H * 0.48;

  // Icon circle bg
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, 90, 0, Math.PI * 2);
  ctx.fillStyle = catColor + "12";
  ctx.fill();
  // Outer ring
  ctx.beginPath();
  ctx.arc(iconCx, iconCy, 90, 0, Math.PI * 2);
  ctx.strokeStyle = catColor + "30";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawLucideIcon(ctx, categoryId, iconCx, iconCy, 70, catColor);

  // ── Title (right side, large) ──
  const textX = iconCx + 160;
  const maxTextW = W - textX - PAD;

  ctx.font = "700 52px Inter, system-ui, sans-serif";
  ctx.fillStyle = WHITE;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  // Word wrap title
  const titleLines = wrapText(ctx, title, maxTextW);
  const titleStartY = H * 0.38 - (titleLines.length - 1) * 30;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, textX, titleStartY + i * 62);
  });

  // ── Divider ──
  const divY = titleStartY + titleLines.length * 62 + 5;
  ctx.strokeStyle = catColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(textX, divY);
  ctx.lineTo(textX + 60, divY);
  ctx.stroke();

  // ── Description ──
  ctx.font = "400 22px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const descLines = wrapText(ctx, description, maxTextW);
  descLines.forEach((line, i) => {
    ctx.fillText(line, textX, divY + 35 + i * 30);
  });

  // ── Decorative dots ──
  const dots = [
    { x: W - 80, y: 100 }, { x: W - 120, y: H - 100 },
    { x: 60, y: H - 80 }, { x: W - 60, y: H / 2 },
  ];
  dots.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();
  });

  // ── Footer URL ──
  ctx.font = "400 16px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText("intentia.com.br", W - PAD, H - 30);

  // ── Play button hint (bottom-left) ──
  ctx.beginPath();
  ctx.arc(PAD + 20, H - 30, 12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.moveTo(PAD + 16, H - 36);
  ctx.lineTo(PAD + 16, H - 24);
  ctx.lineTo(PAD + 27, H - 30);
  ctx.closePath();
  ctx.fill();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const test = line + (line ? " " : "") + word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// ─── COMPONENT ───

export function HelpThumbnails() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>(new Array(helpCategories.length).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      helpCategories.forEach((cat, i) => {
        const canvas = canvasRefs.current[i];
        if (canvas) drawThumbnail(canvas, cat.id, cat.title, cat.description);
      });
      setReady(true);
    });
  }, []);

  const handleDownload = useCallback((index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `intentia-thumbnail-${helpCategories[index].id}-1280x720.jpg`;
    link.href = canvas.toDataURL("image/jpeg", 0.95);
    link.click();
  }, []);

  const prev = () => setCurrentIndex((i) => (i === 0 ? helpCategories.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === helpCategories.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Thumbnails para YouTube</h3>
        <p className="text-xs text-muted-foreground">
          {helpCategories.length} thumbnails — 1280 × 720px cada. Uma para cada funcionalidade da Central de Ajuda.
        </p>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-full" onClick={prev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {currentIndex + 1} / {helpCategories.length}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {helpCategories[currentIndex].title}
                </span>
              </div>

              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                {helpCategories.map((_, i) => (
                  <canvas
                    key={helpCategories[i].id}
                    ref={(el) => { canvasRefs.current[i] = el; }}
                    className="w-full h-auto"
                    style={{
                      aspectRatio: "1280 / 720",
                      display: i === currentIndex ? "block" : "none",
                    }}
                  />
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
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

                <div className="flex gap-1">
                  {helpCategories.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentIndex
                          ? "w-5 bg-primary"
                          : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
            helpCategories.forEach((_, i) => {
              setTimeout(() => handleDownload(i), i * 300);
            });
          }}
        >
          <Download className="h-4 w-4" />
          Baixar Todas ({helpCategories.length} thumbnails)
        </Button>
      </div>
    </div>
  );
}
