import { useRef, useEffect, useState, useCallback } from "react";
import { Download, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const CASES = [
  {
    id: "all",
    title: "Todos os Cases",
    subtitle: "Visão geral de todas as funcionalidades",
    filename: "intentia-cases-todos-1080x1350.png",
    items: [
      { label: "Diagnóstico de URL", desc: "Avalie a prontidão do site antes de investir", color: "#FF6B2B" },
      { label: "Benchmark Competitivo", desc: "Compare posicionamento com concorrentes", color: "#3B82F6" },
      { label: "Análise com IA", desc: "Insights aprofundados com Gemini ou Claude", color: "#8B5CF6" },
      { label: "Score por Canal", desc: "Google, Meta, LinkedIn e TikTok avaliados", color: "#22C55E" },
      { label: "Alertas Estratégicos", desc: "Proteção contra investimento prematuro", color: "#F59E0B" },
      { label: "Insights por Projeto", desc: "Ações organizadas por prioridade", color: "#F43F5E" },
      { label: "Dados Estruturados", desc: "JSON-LD, OG, Twitter Card auditados", color: "#14B8A6" },
    ],
  },
  {
    id: "case-1",
    title: "Diagnóstico de URL",
    subtitle: "Antes de investir em mídia, avalie se o site está pronto.",
    filename: "intentia-case-diagnostico-1080x1350.png",
    image: "/Diagnostico-url.png",
    persona: "Gestor de Marketing B2B",
    color: "#FF6B2B",
    steps: [
      "Cadastre a URL do projeto",
      "Análise heurística automática",
      "Scores de 0 a 100 por dimensão",
      "Identifique pontos críticos",
    ],
    outcome: "Evite desperdício de budget em páginas que não convertem.",
  },
  {
    id: "case-2",
    title: "Benchmark Competitivo",
    subtitle: "Compare seu posicionamento digital com concorrentes.",
    filename: "intentia-case-benchmark-1080x1350.png",
    image: "/benchmark.png",
    persona: "Analista de Estratégia Digital",
    color: "#3B82F6",
    steps: [
      "Adicione URLs de concorrentes",
      "Análise SWOT comparativa",
      "Identifique gaps e oportunidades",
      "Scores lado a lado",
    ],
    outcome: "Decisões baseadas em dados reais, não em percepção.",
  },
  {
    id: "case-3",
    title: "Análise com IA",
    subtitle: "Insights estratégicos de nível consultoria em minutos.",
    filename: "intentia-case-ia-1080x1350.png",
    image: "/analise-ia.png",
    persona: "Diretor de Marketing",
    color: "#8B5CF6",
    steps: [
      "Configure sua API key",
      "Solicite análise por IA",
      "Receba insights aprofundados",
      "Recomendações por canal",
    ],
    outcome: "Análise profunda com inteligência artificial sob demanda.",
  },
  {
    id: "case-4",
    title: "Score por Canal",
    subtitle: "Saiba em qual canal investir primeiro.",
    filename: "intentia-case-score-canal-1080x1350.png",
    image: "/score-canal.png",
    persona: "Gestor de Tráfego Pago",
    color: "#22C55E",
    steps: [
      "Avaliação por canal automática",
      "Scores com objetivos e riscos",
      "Alertas de investimento prematuro",
      "Priorização por potencial de retorno",
    ],
    outcome: "Alocação de budget orientada por dados, canal por canal.",
  },
  {
    id: "case-5",
    title: "Alertas Estratégicos",
    subtitle: "Proteção contra desperdício de budget.",
    filename: "intentia-case-alertas-1080x1350.png",
    image: "/alertas-estrategicos.png",
    persona: "CEO / Fundador",
    color: "#F59E0B",
    steps: [
      "Análise de maturidade digital",
      "Detecção automática de riscos",
      "Alertas visuais com explicações",
      "Ações corretivas sugeridas",
    ],
    outcome: "Nunca mais invista em mídia no momento errado.",
  },
  {
    id: "case-6",
    title: "Insights por Projeto",
    subtitle: "Visão consolidada do que fazer em cada projeto.",
    filename: "intentia-case-insights-1080x1350.png",
    image: "/insights-acionaveis.png",
    persona: "Equipe de Marketing",
    color: "#F43F5E",
    steps: [
      "Insights gerados automaticamente",
      "Agrupados por projeto",
      "Classificados por prioridade",
      "Visualização detalhada em dialog",
    ],
    outcome: "Ações claras e organizadas para cada projeto.",
  },
  {
    id: "case-7",
    title: "Dados Estruturados",
    subtitle: "Auditoria completa de JSON-LD, OG e Twitter Card.",
    filename: "intentia-case-dados-estruturados-1080x1350.png",
    image: "/dados-estruturados.png",
    persona: "Especialista em SEO / Growth",
    color: "#14B8A6",
    steps: [
      "Extração automática de structured data",
      "Comparação com concorrentes",
      "Visualizador unificado por abas",
      "Identifique gaps de visibilidade",
    ],
    outcome: "Comparação competitiva de dados estruturados em uma tela.",
  },
];

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

function drawBar(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const barGrad = ctx.createLinearGradient(0, 0, W, 0);
  barGrad.addColorStop(0, "#FF6B2B");
  barGrad.addColorStop(1, "#FF8F5E");
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);
}

function drawAllCasesPost(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 1080, H = 1350;
  canvas.width = W;
  canvas.height = H;

  ctx.fillStyle = "#151A23";
  ctx.fillRect(0, 0, W, H);
  drawBar(ctx, W, H);

  drawWhiteLogo(ctx, W / 2, 80, 56);

  ctx.font = "500 24px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "center";
  ctx.fillText("Estratégia antes da mídia.", W / 2, 125);

  // Divider
  ctx.strokeStyle = "rgba(255,107,43,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 50, 160);
  ctx.lineTo(W / 2 + 50, 160);
  ctx.stroke();

  // Title
  ctx.font = "700 36px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("O que a Intentia faz por você", W / 2, 210);

  // Cases list
  const items = CASES[0].items!;
  const startY = 280;
  const cardH = 120;
  const gap = 16;
  const padX = 70;

  items.forEach((item, i) => {
    const y = startY + i * (cardH + gap);

    // Card background
    ctx.beginPath();
    ctx.roundRect(padX, y, W - padX * 2, cardH, 16);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Color accent
    ctx.beginPath();
    ctx.roundRect(padX, y, 5, cardH, [16, 0, 0, 16]);
    ctx.fillStyle = item.color;
    ctx.fill();

    // Number badge
    ctx.beginPath();
    ctx.arc(padX + 50, y + cardH / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = item.color + "20";
    ctx.fill();
    ctx.font = "700 18px Inter, system-ui, sans-serif";
    ctx.fillStyle = item.color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${i + 1}`, padX + 50, y + cardH / 2);

    // Label
    ctx.font = "600 22px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, padX + 85, y + cardH / 2 - 14);

    // Description
    ctx.font = "400 17px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(item.desc, padX + 85, y + cardH / 2 + 16);
  });

  // Bottom URL
  ctx.font = "400 20px Inter, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("intentia.com.br", W / 2, H - 40);
}

function drawCasePost(canvas: HTMLCanvasElement, caseData: typeof CASES[1]): Promise<void> {
  return new Promise((resolve) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) { resolve(); return; }
    const W = 1080, H = 1350;
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = caseData.image!;

    const draw = (imgLoaded: boolean) => {
      ctx.fillStyle = "#151A23";
      ctx.fillRect(0, 0, W, H);
      drawBar(ctx, W, H);

      // Logo small
      drawWhiteLogo(ctx, W / 2, 60, 40);

      // Persona badge
      ctx.font = "500 16px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const badgeText = `Para: ${caseData.persona}`;
      const badgeW = ctx.measureText(badgeText).width + 32;
      ctx.beginPath();
      ctx.roundRect((W - badgeW) / 2, 90, badgeW, 32, 16);
      ctx.fillStyle = caseData.color + "20";
      ctx.fill();
      ctx.fillStyle = caseData.color!;
      ctx.fillText(badgeText, W / 2, 106);

      // Title
      ctx.font = "700 38px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(caseData.title, W / 2, 175);

      // Subtitle
      ctx.font = "400 22px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.textAlign = "center";
      // Word wrap subtitle
      const words = caseData.subtitle.split(" ");
      let line = "";
      const subLines: string[] = [];
      words.forEach((word) => {
        const test = line + (line ? " " : "") + word;
        if (ctx.measureText(test).width > W - 160) {
          subLines.push(line);
          line = word;
        } else {
          line = test;
        }
      });
      if (line) subLines.push(line);
      subLines.forEach((l, i) => {
        ctx.fillText(l, W / 2, 220 + i * 30);
      });

      // Showcase image
      const showcaseY = 270;
      const pad = 70;
      const imgW = W - pad * 2;
      const showcaseH = 380;

      if (imgLoaded) {
        ctx.save();
        ctx.shadowColor = caseData.color + "40";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 6;
        ctx.beginPath();
        ctx.roundRect(pad, showcaseY, imgW, showcaseH, 14);
        ctx.clip();
        const srcH = (img.width > 0) ? img.height * (showcaseH / ((img.height / img.width) * imgW)) : img.height;
        ctx.drawImage(img, 0, 0, img.width, srcH, pad, showcaseY, imgW, showcaseH);
        ctx.restore();

        // Border
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pad, showcaseY, imgW, showcaseH, 14);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(pad, showcaseY, imgW, showcaseH, 14);
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.fill();
      }

      // "Como funciona" section
      const stepsY = showcaseY + showcaseH + 50;

      ctx.font = "600 20px Inter, system-ui, sans-serif";
      ctx.fillStyle = caseData.color!;
      ctx.textAlign = "center";
      ctx.fillText("Como funciona", W / 2, stepsY);

      // Steps
      const stepStartY = stepsY + 40;
      caseData.steps!.forEach((step, i) => {
        const y = stepStartY + i * 52;

        // Step number circle
        ctx.beginPath();
        ctx.arc(pad + 20, y + 2, 16, 0, Math.PI * 2);
        ctx.fillStyle = caseData.color + "20";
        ctx.fill();
        ctx.font = "700 14px Inter, system-ui, sans-serif";
        ctx.fillStyle = caseData.color!;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${i + 1}`, pad + 20, y + 2);

        // Step text
        ctx.font = "400 20px Inter, system-ui, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.textAlign = "left";
        ctx.fillText(step, pad + 50, y + 2);
      });

      // Outcome
      const outcomeY = stepStartY + caseData.steps!.length * 52 + 30;
      ctx.beginPath();
      ctx.roundRect(pad, outcomeY, imgW, 60, 12);
      ctx.fillStyle = caseData.color + "12";
      ctx.fill();
      ctx.strokeStyle = caseData.color + "30";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "500 18px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Word wrap outcome
      const oWords = caseData.outcome!.split(" ");
      let oLine = "";
      const oLines: string[] = [];
      oWords.forEach((word) => {
        const test = oLine + (oLine ? " " : "") + word;
        if (ctx.measureText(test).width > imgW - 40) {
          oLines.push(oLine);
          oLine = word;
        } else {
          oLine = test;
        }
      });
      if (oLine) oLines.push(oLine);
      if (oLines.length === 1) {
        ctx.fillText(oLines[0], W / 2, outcomeY + 30);
      } else {
        oLines.forEach((l, i) => {
          ctx.fillText(l, W / 2, outcomeY + 22 + i * 22);
        });
      }

      // Bottom URL
      ctx.font = "400 20px Inter, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("intentia.com.br", W / 2, H - 40);

      resolve();
    };

    img.onload = () => draw(true);
    img.onerror = () => draw(false);
  });
}

const CAPTIONS: string[] = [
  // 0 - Todos os Cases
  `🚀 Conheça os 7 cases de uso da Intentia

A plataforma que analisa sua presença digital antes de investir em mídia paga.

✅ Diagnóstico de URL — avalie a prontidão do site
✅ Benchmark Competitivo — compare com concorrentes
✅ Análise com IA — insights de nível consultoria
✅ Score por Canal — Google, Meta, LinkedIn e TikTok
✅ Alertas Estratégicos — proteção contra desperdício
✅ Insights por Projeto — ações organizadas
✅ Dados Estruturados — JSON-LD, OG e Twitter Card

Estratégia antes da mídia. 🎯

#MarketingB2B #EstratégiaDigital #MídiaPaga #Intentia #MarketingEstratégico`,

  // 1 - Diagnóstico de URL
  `🎯 Case: Diagnóstico de URL

Antes de investir em mídia, avalie se o site está pronto.

Como funciona:
1️⃣ Cadastre a URL do projeto
2️⃣ Análise heurística automática
3️⃣ Scores de 0 a 100 por dimensão
4️⃣ Identifique pontos críticos

💡 Resultado: Evite desperdício de budget em páginas que não convertem.

Para: Gestor de Marketing B2B

#DiagnósticoDigital #MarketingB2B #AnáliseDeSite #Intentia`,

  // 2 - Benchmark Competitivo
  `📊 Case: Benchmark Competitivo

Compare seu posicionamento digital com concorrentes.

Como funciona:
1️⃣ Adicione URLs de concorrentes
2️⃣ Análise SWOT comparativa
3️⃣ Identifique gaps e oportunidades
4️⃣ Scores lado a lado

💡 Resultado: Decisões baseadas em dados reais, não em percepção.

Para: Analista de Estratégia Digital

#Benchmark #AnáliseCompetitiva #SWOT #Intentia #MarketingB2B`,

  // 3 - Análise com IA
  `🧠 Case: Análise com IA

Insights estratégicos de nível consultoria em minutos.

Como funciona:
1️⃣ Configure sua API key
2️⃣ Solicite análise por IA
3️⃣ Receba insights aprofundados
4️⃣ Recomendações por canal

💡 Resultado: Análise profunda com inteligência artificial sob demanda.

Para: Diretor de Marketing

#InteligênciaArtificial #IA #MarketingDigital #Intentia #Gemini #Claude`,

  // 4 - Score por Canal
  `💡 Case: Score por Canal

Saiba em qual canal investir primeiro.

Como funciona:
1️⃣ Avaliação por canal automática
2️⃣ Scores com objetivos e riscos
3️⃣ Alertas de investimento prematuro
4️⃣ Priorização por potencial de retorno

💡 Resultado: Alocação de budget orientada por dados, canal por canal.

Para: Gestor de Tráfego Pago

#TráfegoPago #GoogleAds #MetaAds #LinkedIn #TikTok #Intentia`,

  // 5 - Alertas Estratégicos
  `🛡️ Case: Alertas Estratégicos

Proteção contra desperdício de budget.

Como funciona:
1️⃣ Análise de maturidade digital
2️⃣ Detecção automática de riscos
3️⃣ Alertas visuais com explicações
4️⃣ Ações corretivas sugeridas

💡 Resultado: Nunca mais invista em mídia no momento errado.

Para: CEO / Fundador

#AlertasEstratégicos #ProteçãoDeBudget #MarketingB2B #Intentia`,

  // 6 - Insights por Projeto
  `📋 Case: Insights por Projeto

Visão consolidada do que fazer em cada projeto.

Como funciona:
1️⃣ Insights gerados automaticamente
2️⃣ Agrupados por projeto
3️⃣ Classificados por prioridade
4️⃣ Visualização detalhada em dialog

💡 Resultado: Ações claras e organizadas para cada projeto.

Para: Equipe de Marketing

#Insights #GestãoDeProjetos #MarketingEstratégico #Intentia`,

  // 7 - Dados Estruturados
  `🗄️ Case: Dados Estruturados

Auditoria completa de JSON-LD, OG e Twitter Card.

Como funciona:
1️⃣ Extração automática de structured data
2️⃣ Comparação com concorrentes
3️⃣ Visualizador unificado por abas
4️⃣ Identifique gaps de visibilidade

💡 Resultado: Comparação competitiva de dados estruturados em uma tela.

Para: Especialista em SEO / Growth

#SEO #DadosEstruturados #SchemaMarkup #OpenGraph #Intentia`,
];

export function BrandCasesPosts() {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>(new Array(CASES.length).fill(null));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(async () => {
      const allCanvas = canvasRefs.current[0];
      if (allCanvas) drawAllCasesPost(allCanvas);

      for (let i = 1; i < CASES.length; i++) {
        const canvas = canvasRefs.current[i];
        if (canvas) await drawCasePost(canvas, CASES[i]);
      }
      setReady(true);
    });
  }, []);

  const handleDownload = useCallback((index: number) => {
    const canvas = canvasRefs.current[index];
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = CASES[index].filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleDownloadCaption = useCallback((index: number) => {
    const caption = CAPTIONS[index];
    if (!caption) return;
    const blob = new Blob([caption], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.download = CASES[index].filename.replace(".png", "-legenda.txt");
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }, []);

  const prev = () => setCurrentIndex((i) => (i === 0 ? CASES.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === CASES.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Posts de Cases de Uso</h3>
      <p className="text-xs text-muted-foreground">
        {CASES.length} posts — 1080 × 1350px cada. Navegue pelo carrossel e baixe individualmente.
      </p>

      {/* Carousel */}
      <div className="relative">
        {/* Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-full" onClick={prev}>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 overflow-hidden">
            <div className="max-w-md mx-auto">
              {/* Counter */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">
                  {currentIndex + 1} / {CASES.length}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {CASES[currentIndex].title}
                </span>
              </div>

              {/* Canvas display */}
              <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
                {CASES.map((c, i) => (
                  <canvas
                    key={c.id}
                    ref={(el) => { canvasRefs.current[i] = el; }}
                    className="w-full h-auto"
                    style={{
                      aspectRatio: "1080 / 1350",
                      display: i === currentIndex ? "block" : "none",
                    }}
                  />
                ))}
              </div>

              {/* Download button */}
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
                    Baixar PNG
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

                {/* Dots */}
                <div className="flex gap-1.5">
                  {CASES.map((_, i) => (
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
            CASES.forEach((_, i) => {
              setTimeout(() => handleDownload(i), i * 300);
            });
          }}
        >
          <Download className="h-4 w-4" />
          Baixar Todos ({CASES.length} posts)
        </Button>
      </div>
    </div>
  );
}
