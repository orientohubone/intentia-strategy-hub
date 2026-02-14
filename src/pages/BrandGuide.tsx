import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Image, ArrowRight, FileText, Download } from "lucide-react";
import { Link } from "react-router-dom";

const primaryHSL = "hsl(16, 100%, 55%)";
const primaryHex = "#FF6B2B";

const colorPalette = [
  { name: "Primary", hsl: "16 100% 55%", hex: "#FF6B2B", css: "--primary", usage: "Cor principal da marca. Botões, links, destaques e elementos de ação." },
  { name: "Primary Light", hsl: "16 100% 97%", hex: "#FFF5F0", css: "--accent", usage: "Backgrounds sutis, hover states, cards de destaque." },
  { name: "Primary Dark", hsl: "16 100% 45%", hex: "#CC4400", css: "--accent-foreground", usage: "Texto sobre fundos claros, ícones ativos." },
  { name: "Foreground", hsl: "220 20% 10%", hex: "#151A23", css: "--foreground", usage: "Texto principal, títulos e headings." },
  { name: "Muted", hsl: "220 10% 46%", hex: "#6B7280", css: "--muted-foreground", usage: "Texto secundário, descrições, labels." },
  { name: "Background", hsl: "0 0% 99%", hex: "#FCFCFC", css: "--background", usage: "Fundo geral da aplicação no modo claro." },
  { name: "Card", hsl: "0 0% 100%", hex: "#FFFFFF", css: "--card", usage: "Fundo de cards, modais e popovers." },
  { name: "Border", hsl: "220 13% 91%", hex: "#E5E7EB", css: "--border", usage: "Bordas de cards, inputs, separadores." },
];

const semanticColors = [
  { name: "Success", hsl: "142 76% 36%", hex: "#22C55E", usage: "Scores altos, confirmações, status positivo." },
  { name: "Warning", hsl: "38 92% 50%", hex: "#F59E0B", usage: "Alertas moderados, scores médios." },
  { name: "Destructive", hsl: "0 84% 60%", hex: "#EF4444", usage: "Erros, exclusões, scores críticos." },
  { name: "Info", hsl: "199 89% 48%", hex: "#0EA5E9", usage: "Informações, dicas, notificações neutras." },
];

const channelColors = [
  { name: "Google", hsl: "217 89% 61%", hex: "#4285F4", usage: "Google Ads" },
  { name: "Meta", hsl: "220 100% 50%", hex: "#0066FF", usage: "Meta Ads" },
  { name: "LinkedIn", hsl: "199 89% 40%", hex: "#0A66C2", usage: "LinkedIn Ads" },
  { name: "TikTok", hsl: "0 0% 10%", hex: "#1A1A1A", usage: "TikTok Ads" },
];

const typographyScale = [
  { name: "Display", size: "36px / 2.25rem", weight: "800 (Extra Bold)", lineHeight: "1.1", tracking: "-0.025em", tag: "h1", usage: "Hero sections, landing page" },
  { name: "Heading 1", size: "30px / 1.875rem", weight: "700 (Bold)", lineHeight: "1.2", tracking: "-0.025em", tag: "h1", usage: "Títulos de página" },
  { name: "Heading 2", size: "24px / 1.5rem", weight: "600 (Semibold)", lineHeight: "1.3", tracking: "-0.02em", tag: "h2", usage: "Seções principais" },
  { name: "Heading 3", size: "20px / 1.25rem", weight: "600 (Semibold)", lineHeight: "1.4", tracking: "-0.01em", tag: "h3", usage: "Subseções, cards" },
  { name: "Body Large", size: "18px / 1.125rem", weight: "400 (Regular)", lineHeight: "1.6", tracking: "0", tag: "p", usage: "Texto de destaque, leads" },
  { name: "Body", size: "16px / 1rem", weight: "400 (Regular)", lineHeight: "1.6", tracking: "0", tag: "p", usage: "Texto padrão do corpo" },
  { name: "Body Small", size: "14px / 0.875rem", weight: "400 (Regular)", lineHeight: "1.5", tracking: "0", tag: "p", usage: "Descrições, labels, metadata" },
  { name: "Caption", size: "12px / 0.75rem", weight: "500 (Medium)", lineHeight: "1.4", tracking: "0.01em", tag: "span", usage: "Badges, tags, timestamps" },
];

const spacingScale = [
  { name: "4px", token: "1", usage: "Gaps mínimos entre ícones e texto" },
  { name: "8px", token: "2", usage: "Padding interno de badges e tags" },
  { name: "12px", token: "3", usage: "Gap entre elementos inline" },
  { name: "16px", token: "4", usage: "Padding de cards, gap de grids" },
  { name: "24px", token: "6", usage: "Espaçamento entre seções internas" },
  { name: "32px", token: "8", usage: "Margem entre blocos de conteúdo" },
  { name: "48px", token: "12", usage: "Espaçamento entre seções de página" },
  { name: "64px", token: "16", usage: "Padding vertical de seções hero" },
];

const downloadLogoAsSVG = () => {
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="24" fill="#151A23"/>
  <text x="15" y="75" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="20" fill="#FFFFFF">intentia</text>
  <text x="85" y="75" font-family="Inter, system-ui, sans-serif" font-weight="800" font-size="20" fill="#FF6B2B">.</text>
</svg>`;
  
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'intentia-logo-120.svg';
  a.click();
  URL.revokeObjectURL(url);
};

export default function BrandGuide() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(16,100%,97%)] via-[hsl(30,100%,98%)] to-white" />
        <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32">
          <div className="space-y-6">
            <p className="text-sm font-medium tracking-widest uppercase text-primary">Brand Guide</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.08]">
              intentia<span className="text-primary">.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Guia completo de identidade visual, design system e style guide da marca Intentia.
              Este documento serve como referência para manter consistência em todos os pontos de contato.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-24">

        {/* ─── 1. MARCA ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">1. A Marca</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Conceito</h3>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Intentia</strong> vem de <em>intenção</em> — o ponto de partida de toda decisão estratégica.
                A marca representa clareza de propósito, inteligência analítica e precisão na tomada de decisão para marketing B2B.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                O posicionamento é de uma plataforma que ajuda empresas a investir com inteligência,
                evitando desperdício de budget e identificando o momento certo de agir em cada canal de mídia digital.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Personalidade</h3>
              <div className="space-y-3">
                {[
                  { trait: "Estratégica", desc: "Decisões baseadas em dados, não intuição." },
                  { trait: "Precisa", desc: "Diagnósticos claros com scores objetivos." },
                  { trait: "Confiável", desc: "Transparência nos resultados e recomendações." },
                  { trait: "Moderna", desc: "Interface limpa, tecnologia de ponta com IA." },
                  { trait: "Acessível", desc: "Complexidade traduzida em linguagem clara." },
                ].map((item) => (
                  <div key={item.trait} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">{item.trait}</strong> — {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Tom de Voz</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Profissional, não corporativo", desc: "Linguagem direta e acessível, sem jargões desnecessários. Fala de igual para igual com decisores." },
                { title: "Confiante, não arrogante", desc: "Afirmações embasadas em dados. Mostra autoridade sem ser impositivo." },
                { title: "Claro, não simplista", desc: "Traduz complexidade estratégica em insights acionáveis sem perder profundidade." },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 2. LOGOTIPO ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">2. Logotipo</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="space-y-4">
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              O logotipo da Intentia é <strong className="text-foreground">tipográfico</strong>, composto exclusivamente pela
              palavra "intentia" em <strong className="text-foreground">Inter</strong> com peso Extra Bold (800).
              O ponto final em laranja funciona como assinatura visual e elemento de identidade.
            </p>
          </div>

          {/* Logo Variations */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Primary - Light BG */}
            <div className="rounded-xl border border-border bg-white p-10 flex flex-col items-center justify-center gap-4">
              <span className="text-4xl font-extrabold tracking-tight text-[#151A23]">
                intentia<span className="text-[#FF6B2B]">.</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium">Versão principal — fundo claro</span>
            </div>

            {/* Primary - Dark BG */}
            <div className="rounded-xl border border-border bg-[#151A23] p-10 flex flex-col items-center justify-center gap-4">
              <span className="text-4xl font-extrabold tracking-tight text-white">
                intentia<span className="text-[#FF6B2B]">.</span>
              </span>
              <span className="text-xs text-gray-400 font-medium">Versão principal — fundo escuro</span>
            </div>

            {/* Monochrome - Light */}
            <div className="rounded-xl border border-border bg-white p-10 flex flex-col items-center justify-center gap-4">
              <span className="text-4xl font-extrabold tracking-tight text-[#151A23]">
                intentia<span className="text-[#151A23]">.</span>
              </span>
              <span className="text-xs text-muted-foreground font-medium">Monocromática — fundo claro</span>
            </div>

            {/* Monochrome - Dark */}
            <div className="rounded-xl border border-border bg-[#151A23] p-10 flex flex-col items-center justify-center gap-4">
              <span className="text-4xl font-extrabold tracking-tight text-white">
                intentia<span className="text-white">.</span>
              </span>
              <span className="text-xs text-gray-400 font-medium">Monocromática — fundo escuro</span>
            </div>
          </div>

          {/* Logo Rules */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Regras de uso</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-green-200 bg-green-50 space-y-2">
                <p className="text-sm font-semibold text-green-800">Correto</p>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Sempre em caixa baixa (minúsculas)</li>
                  <li>• Manter o ponto laranja como assinatura</li>
                  <li>• Respeitar área de respiro mínima (1x altura do "i")</li>
                  <li>• Usar sobre fundos limpos e sem ruído</li>
                  <li>• Tamanho mínimo: 80px de largura em digital</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 space-y-2">
                <p className="text-sm font-semibold text-red-800">Incorreto</p>
                <ul className="text-xs text-red-700 space-y-1">
                  <li>• Não usar em caixa alta (INTENTIA)</li>
                  <li>• Não alterar a cor do ponto para outra que não a primária</li>
                  <li>• Não distorcer, rotacionar ou aplicar efeitos</li>
                  <li>• Não colocar sobre fundos com baixo contraste</li>
                  <li>• Não alterar a tipografia ou o espaçamento</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Favicon / Symbol */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Símbolo reduzido</h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              Para aplicações em tamanhos reduzidos (favicon, avatar, ícone de app), usar a inicial "i" com o ponto laranja.
            </p>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#151A23] flex items-center justify-center">
                <span className="text-2xl font-extrabold text-white">i<span className="text-[#FF6B2B]">.</span></span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#151A23] flex items-center justify-center">
                <span className="text-lg font-extrabold text-white">i<span className="text-[#FF6B2B]">.</span></span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#151A23] flex items-center justify-center">
                <span className="text-sm font-extrabold text-white">i<span className="text-[#FF6B2B]">.</span></span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. CORES ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">3. Paleta de Cores</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          {/* Primary Palette */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Cores principais</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {colorPalette.map((color) => (
                <div key={color.name} className="rounded-xl border border-border overflow-hidden">
                  <div className="h-20" style={{ backgroundColor: `hsl(${color.hsl})` }} />
                  <div className="p-3 bg-card space-y-1.5">
                    <p className="text-sm font-semibold text-foreground">{color.name}</p>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                      <p className="text-xs text-muted-foreground font-mono">hsl({color.hsl})</p>
                      <p className="text-xs text-muted-foreground font-mono">{color.css}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Semantic Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Cores semânticas</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {semanticColors.map((color) => (
                <div key={color.name} className="rounded-xl border border-border overflow-hidden">
                  <div className="h-16" style={{ backgroundColor: `hsl(${color.hsl})` }} />
                  <div className="p-3 bg-card space-y-1">
                    <p className="text-sm font-semibold text-foreground">{color.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{color.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channel Colors */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Cores de canais</h3>
            <div className="flex flex-wrap gap-4">
              {channelColors.map((color) => (
                <div key={color.name} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: `hsl(${color.hsl})` }} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{color.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{color.hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradients */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Gradientes</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-[hsl(16,100%,55%)] to-[hsl(25,100%,60%)]" />
                <div className="p-3 bg-card">
                  <p className="text-sm font-semibold text-foreground">Gradient Primary</p>
                  <p className="text-xs text-muted-foreground">Botões CTA, headers, badges de destaque</p>
                </div>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="h-24 bg-gradient-to-br from-[hsl(16,100%,97%)] via-[hsl(30,100%,98%)] to-white" />
                <div className="p-3 bg-card">
                  <p className="text-sm font-semibold text-foreground">Gradient Hero</p>
                  <p className="text-xs text-muted-foreground">Backgrounds de hero sections e landing</p>
                </div>
              </div>
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="h-24 bg-gradient-to-b from-white to-[hsl(220,14%,99%)]" />
                <div className="p-3 bg-card">
                  <p className="text-sm font-semibold text-foreground">Gradient Card</p>
                  <p className="text-xs text-muted-foreground">Fundo sutil de cards e containers</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. TIPOGRAFIA ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">4. Tipografia</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Typeface</p>
                  <p className="text-5xl font-extrabold tracking-tight text-foreground">Inter</p>
                </div>
                <div className="pb-1.5">
                  <p className="text-sm text-muted-foreground">
                    Família tipográfica única para toda a marca. Projetada para telas, com excelente legibilidade
                    em tamanhos pequenos e personalidade neutra e moderna.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 font-mono">
                    Google Fonts: fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800
                  </p>
                </div>
              </div>
            </div>

            {/* Weights */}
            <div className="p-6 rounded-xl border border-border bg-card space-y-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pesos disponíveis</p>
              <div className="space-y-3">
                {[
                  { weight: 300, label: "Light", sample: "Usado raramente, apenas para contraste sutil" },
                  { weight: 400, label: "Regular", sample: "Corpo de texto, descrições, parágrafos" },
                  { weight: 500, label: "Medium", sample: "Labels, captions, badges, metadata" },
                  { weight: 600, label: "Semibold", sample: "Headings h2–h4, nomes de seções, cards" },
                  { weight: 700, label: "Bold", sample: "Heading h1, títulos de página, destaques" },
                  { weight: 800, label: "Extra Bold", sample: "Logotipo, display text, hero sections" },
                ].map((item) => (
                  <div key={item.weight} className="flex items-baseline gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs text-muted-foreground font-mono w-8 shrink-0">{item.weight}</span>
                    <span className="text-lg text-foreground shrink-0 w-40" style={{ fontWeight: item.weight }}>
                      {item.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.sample}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Type Scale */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Escala tipográfica</h3>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {typographyScale.map((item) => (
                <div key={item.name} className="p-4 bg-card flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                  <div className="md:w-32 shrink-0">
                    <p className="text-xs text-primary font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">&lt;{item.tag}&gt;</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-foreground truncate"
                      style={{
                        fontSize: item.size.split(" / ")[0],
                        fontWeight: parseInt(item.weight),
                        lineHeight: item.lineHeight,
                        letterSpacing: item.tracking,
                      }}
                    >
                      Estratégia antes da mídia
                    </p>
                  </div>
                  <div className="md:w-56 shrink-0 space-y-0.5">
                    <p className="text-xs text-muted-foreground font-mono">{item.size} · {item.weight}</p>
                    <p className="text-xs text-muted-foreground">{item.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. ESPAÇAMENTO ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">5. Espaçamento</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground max-w-2xl">
              O sistema de espaçamento segue a escala de 4px do Tailwind CSS. Todos os espaçamentos são múltiplos de 4px
              para manter ritmo visual consistente.
            </p>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {spacingScale.map((item) => (
                <div key={item.name} className="p-4 bg-card flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-mono w-12 shrink-0">{item.name}</span>
                  <span className="text-xs text-muted-foreground font-mono w-16 shrink-0">space-{item.token}</span>
                  <div className="flex-1 flex items-center">
                    <div
                      className="h-3 bg-primary/20 border border-primary/30 rounded-sm"
                      style={{ width: item.name }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-56 shrink-0">{item.usage}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. BORDER RADIUS ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">6. Bordas e Sombras</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Border Radius</h3>
              <p className="text-sm text-muted-foreground">
                Base radius: <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">0.75rem (12px)</code>.
                Cantos arredondados suaves para uma aparência moderna e amigável.
              </p>
              <div className="flex items-end gap-4">
                {[
                  { label: "sm", radius: "calc(0.75rem - 4px)", size: "w-14 h-14" },
                  { label: "md", radius: "calc(0.75rem - 2px)", size: "w-16 h-16" },
                  { label: "lg", radius: "0.75rem", size: "w-20 h-20" },
                  { label: "xl", radius: "1rem", size: "w-24 h-24" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-2">
                    <div
                      className={`${item.size} border-2 border-primary/30 bg-primary/5`}
                      style={{ borderRadius: item.radius }}
                    />
                    <span className="text-xs text-muted-foreground font-mono">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Sombras</h3>
              <p className="text-sm text-muted-foreground">
                Sombras sutis para criar hierarquia visual sem peso excessivo.
              </p>
              <div className="space-y-4">
                {[
                  { label: "shadow-sm", shadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)", usage: "Inputs, badges" },
                  { label: "shadow-card", shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)", usage: "Cards padrão" },
                  { label: "shadow-md", shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)", usage: "Dropdowns, popovers" },
                  { label: "shadow-lg", shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)", usage: "Modais, dialogs" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div
                      className="w-16 h-10 bg-white rounded-lg border border-border/50"
                      style={{ boxShadow: item.shadow }}
                    />
                    <div>
                      <p className="text-xs text-foreground font-mono">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. COMPONENTES ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">7. Componentes UI</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <p className="text-sm text-muted-foreground max-w-2xl">
            O design system é construído sobre <strong className="text-foreground">shadcn/ui</strong> (Radix UI primitives) com
            Tailwind CSS. Todos os componentes seguem padrões de acessibilidade WCAG 2.1 AA.
          </p>

          {/* Buttons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Botões</h3>
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex flex-wrap items-center gap-3">
                <button className="inline-flex items-center justify-center rounded-lg bg-[#FF6B2B] text-white text-sm font-medium h-10 px-5 hover:opacity-90 transition-opacity">
                  Primary
                </button>
                <button className="inline-flex items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-[#151A23] text-sm font-medium h-10 px-5 hover:bg-gray-50 transition-colors">
                  Outline
                </button>
                <button className="inline-flex items-center justify-center rounded-lg bg-[#F3F4F6] text-[#151A23] text-sm font-medium h-10 px-5 hover:bg-gray-200 transition-colors">
                  Secondary
                </button>
                <button className="inline-flex items-center justify-center rounded-lg text-[#6B7280] text-sm font-medium h-10 px-5 hover:bg-gray-100 transition-colors">
                  Ghost
                </button>
                <button className="inline-flex items-center justify-center rounded-lg bg-[#EF4444] text-white text-sm font-medium h-10 px-5 hover:opacity-90 transition-opacity">
                  Destructive
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button className="inline-flex items-center justify-center rounded-lg bg-[#FF6B2B] text-white text-sm font-medium h-8 px-3 text-xs">
                  Small
                </button>
                <button className="inline-flex items-center justify-center rounded-lg bg-[#FF6B2B] text-white text-sm font-medium h-10 px-5">
                  Default
                </button>
                <button className="inline-flex items-center justify-center rounded-lg bg-[#FF6B2B] text-white text-sm font-medium h-12 px-8 text-base">
                  Large
                </button>
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Badges</h3>
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-[#FF6B2B] text-white text-xs font-medium px-3 py-1">Primary</span>
                <span className="inline-flex items-center rounded-full bg-[#F3F4F6] text-[#151A23] text-xs font-medium px-3 py-1">Secondary</span>
                <span className="inline-flex items-center rounded-full border border-[#E5E7EB] text-[#151A23] text-xs font-medium px-3 py-1">Outline</span>
                <span className="inline-flex items-center rounded-full bg-[#DCFCE7] text-[#166534] text-xs font-medium px-3 py-1">Success</span>
                <span className="inline-flex items-center rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-medium px-3 py-1">Warning</span>
                <span className="inline-flex items-center rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs font-medium px-3 py-1">Destructive</span>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Cards</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-2" style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
                <p className="text-sm font-semibold text-foreground">Card padrão</p>
                <p className="text-xs text-muted-foreground">Border + shadow-card. Usado em listas, grids e conteúdo geral.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-2 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer" style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)" }}>
                <p className="text-sm font-semibold text-foreground">Card elevado</p>
                <p className="text-xs text-muted-foreground">Com hover effect: shadow-lg + translateY(-2px). Para itens clicáveis.</p>
              </div>
              <div className="rounded-xl border-2 border-[#FF6B2B]/20 bg-[#FFF5F0] p-5 space-y-2">
                <p className="text-sm font-semibold text-foreground">Card destaque</p>
                <p className="text-xs text-muted-foreground">Border primary + bg accent. Para CTAs e destaques especiais.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. ICONOGRAFIA ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">8. Iconografia</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground max-w-2xl">
              Ícones da <strong className="text-foreground">Lucide React</strong> — conjunto consistente e moderno com 
              300+ ícones. Estilo: lineal, 2px stroke, cantos arredondados sutis.
            </p>
            <div className="p-6 rounded-xl border border-border bg-card">
              <p className="text-xs text-muted-foreground font-mono mb-4">
                npm install lucide-react
              </p>
              <div className="flex flex-wrap gap-3">
                {['Search', 'BarChart3', 'Target', 'TrendingUp', 'Users', 'Settings', 'FileText', 'Shield'].map((icon) => (
                  <div key={icon} className="w-12 h-12 rounded-lg border border-border bg-card flex items-center justify-center">
                    <span className="text-xs text-muted-foreground font-mono">{icon.slice(0, 2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── 9. GOOGLE BRAND ASSETS ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">9. Google Brand Assets</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground max-w-2xl">
              Arquivos oficiais para verificação e configuração de marca no ecossistema Google.
              Logotipo em formato quadrado 120×120px conforme exigência para Google Brand verification.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Logo 120x120 */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Logotipo 120×120px</h3>
                <p className="text-sm text-muted-foreground">
                  Formato exigido pelo Google para Brand verification. 
                  Quadrado, alta resolução, fundo transparente disponível.
                </p>
                
                <div className="flex items-center justify-center">
                  <div className="w-32 h-32 rounded-2xl bg-[#151A23] flex items-center justify-center p-2">
                    <span className="text-xl font-extrabold text-white leading-tight">intentia<span className="text-[#FF6B2B]">.</span></span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs">intentia-logo-120.svg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs">intentia-logo-generator.html</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={downloadLogoAsSVG}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B2B] text-white text-sm font-medium h-10 px-4 hover:opacity-90 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Logo 120×120px
                  </button>
                  <p className="text-xs text-muted-foreground text-center">
                    Download automático em SVG, qualidade original preservada
                  </p>
                </div>
              </div>

              {/* Verification Files */}
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Arquivos de Verificação</h3>
                <p className="text-sm text-muted-foreground">
                  Meta tags e arquivos para verificação de propriedade do site.
                </p>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-mono text-gray-700 mb-1">google839c5f19e40bb364.html</p>
                    <p className="text-xs text-gray-600">Arquivo de verificação Google Search Console</p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-mono text-gray-700 mb-1">Meta tag verification:</p>
                    <code className="text-xs text-gray-600 block mt-1">
                      &lt;meta name="google-site-verification" content="google839c5f19e40bb364.html" /&gt;
                    </code>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <p className="text-xs font-mono text-gray-700 mb-1">Meta property verification:</p>
                    <code className="text-xs text-gray-600 block mt-1">
                      &lt;meta property="google-site-verification" content="https://intentia.com.br/google839c5f19e40bb364.html" /&gt;
                    </code>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs text-green-800 font-medium">Status: Configurado</p>
                  <p className="text-xs text-green-700">Ambas as verificações estão ativas no index.html</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 10. DARK MODE ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">9. Dark Mode</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground max-w-2xl">
              O dark mode é disponível apenas no sistema (dashboard). Páginas públicas (landing, pricing, auth) são forçadas
              em light mode via <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">ForceLightMode</code>.
              A cor primária <strong className="text-foreground">permanece a mesma</strong> em ambos os modos.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-[#FCFCFC] p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B2B]" />
                    <span className="text-sm font-semibold text-[#151A23]">Light Mode</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded bg-[#FCFCFC] border border-[#E5E7EB]" title="Background" />
                    <div className="w-8 h-8 rounded bg-[#FFFFFF] border border-[#E5E7EB]" title="Card" />
                    <div className="w-8 h-8 rounded bg-[#151A23]" title="Foreground" />
                    <div className="w-8 h-8 rounded bg-[#6B7280]" title="Muted" />
                    <div className="w-8 h-8 rounded bg-[#FF6B2B]" title="Primary" />
                    <div className="w-8 h-8 rounded bg-[#E5E7EB]" title="Border" />
                  </div>
                  <p className="text-xs text-[#6B7280]">bg: #FCFCFC · card: #FFF · text: #151A23</p>
                </div>
              </div>
              <div className="rounded-xl border border-[hsl(220,14%,18%)] overflow-hidden">
                <div className="bg-[hsl(220,20%,8%)] p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#FF6B2B]" />
                    <span className="text-sm font-semibold text-[#F2F2F2]">Dark Mode</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded bg-[hsl(220,20%,8%)] border border-[hsl(220,14%,18%)]" title="Background" />
                    <div className="w-8 h-8 rounded bg-[hsl(220,20%,10%)] border border-[hsl(220,14%,18%)]" title="Card" />
                    <div className="w-8 h-8 rounded bg-[#F2F2F2]" title="Foreground" />
                    <div className="w-8 h-8 rounded bg-[hsl(220,10%,60%)]" title="Muted" />
                    <div className="w-8 h-8 rounded bg-[#FF6B2B]" title="Primary" />
                    <div className="w-8 h-8 rounded bg-[hsl(220,14%,18%)]" title="Border" />
                  </div>
                  <p className="text-xs text-[hsl(220,10%,60%)]">bg: hsl(220,20%,8%) · card: hsl(220,20%,10%) · text: #F2F2F2</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 10. ANIMAÇÕES ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">10. Movimento e Animações</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground max-w-2xl">
              Animações são sutis e funcionais — nunca decorativas. Servem para guiar atenção, dar feedback e criar transições suaves.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "fade-in", duration: "0.5s", easing: "ease-out", usage: "Entrada de elementos na viewport" },
                { name: "slide-up", duration: "0.6s", easing: "ease-out", usage: "Cards e seções aparecendo" },
                { name: "scale-in", duration: "0.4s", easing: "ease-out", usage: "Modais, dialogs, popovers" },
                { name: "lab-bubble", duration: "1.5s", easing: "ease-in-out", usage: "Feedback de IA processando" },
              ].map((item) => (
                <div key={item.name} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <p className="text-sm font-semibold text-foreground font-mono">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.duration} · {item.easing}</p>
                  <p className="text-xs text-muted-foreground">{item.usage}</p>
                </div>
              ))}
            </div>
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Princípio:</strong> Transições de hover usam <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">0.2s ease-in-out</code>.
                Cards elevados combinam <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">box-shadow</code> + <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">translateY(-2px)</code> no hover.
              </p>
            </div>
          </div>
        </section>

        {/* ─── 11. APLICAÇÕES ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">11. Aplicações da Marca</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { title: "Website e App", desc: "Logotipo tipográfico no header, favicon com símbolo reduzido 'i.', gradientes hero nas landing pages." },
              { title: "Documentos e PDFs", desc: "Header com logotipo + cor primária. Tipografia Inter. Relatórios usam a paleta completa para scores e gráficos." },
              { title: "Redes Sociais", desc: "Avatar com símbolo 'i.' em fundo escuro. Posts usam gradiente primary como background de destaque." },
              { title: "Email e Comunicação", desc: "Assinatura com logotipo tipográfico. Tom de voz profissional e direto. CTA em cor primária." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl border border-border bg-card space-y-2">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 12. BRANDBOOK — PERFIS DIGITAIS ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">12. Brandbook — Perfis Digitais</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Diretrizes para criação e manutenção dos perfis da Intentia em redes sociais e plataformas digitais.
            Todos os perfis devem seguir o mesmo padrão de identidade visual, tom de voz e posicionamento estratégico.
          </p>

          {/* Proposta de Valor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Proposta de Valor</h3>
            <div className="p-6 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-4">
              <p className="text-base font-semibold text-foreground leading-relaxed">
                "Ajudamos empresas B2B a investir em mídia digital com inteligência — combinando diagnóstico heurístico,
                inteligência artificial e benchmark competitivo para decisões estratégicas fundamentadas."
              </p>
              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                {[
                  { pillar: "Diagnóstico antes do investimento", desc: "Análise completa da prontidão digital antes de gastar em mídia paga." },
                  { pillar: "IA como aliada estratégica", desc: "Gemini e Claude para insights aprofundados, não como substituto do estrategista." },
                  { pillar: "Dados, não intuição", desc: "Scores objetivos por canal, benchmark com concorrentes e alertas de risco." },
                ].map((item) => (
                  <div key={item.pillar} className="space-y-1">
                    <p className="text-sm font-semibold text-primary">{item.pillar}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuração de Perfis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Configuração dos Perfis</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  platform: "LinkedIn",
                  color: "#0A66C2",
                  avatar: "Símbolo 'i.' em fundo escuro (#151A23)",
                  banner: "Gradiente primary com tagline + URL do site",
                  username: "@intentia ou /company/intentia",
                  type: "Company Page",
                },
                {
                  platform: "Instagram",
                  color: "#E4405F",
                  avatar: "Símbolo 'i.' em fundo escuro (#151A23)",
                  banner: "Destaques com ícones na cor primary",
                  username: "@intentia.hub",
                  type: "Perfil Profissional",
                },
                {
                  platform: "X (Twitter)",
                  color: "#1A1A1A",
                  avatar: "Símbolo 'i.' em fundo escuro (#151A23)",
                  banner: "Gradiente primary com proposta de valor curta",
                  username: "@intentia_hub",
                  type: "Perfil Corporativo",
                },
                {
                  platform: "YouTube",
                  color: "#FF0000",
                  avatar: "Símbolo 'i.' em fundo escuro (#151A23)",
                  banner: "Logo + tagline + visual do dashboard",
                  username: "@intentia",
                  type: "Canal da Marca",
                },
              ].map((item) => (
                <div key={item.platform} className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color }}>
                      <span className="text-xs font-extrabold text-white">i<span style={{ color: "#FF6B2B" }}>.</span></span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.platform}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <p><strong className="text-foreground">Avatar:</strong> {item.avatar}</p>
                    <p><strong className="text-foreground">Banner:</strong> {item.banner}</p>
                    <p><strong className="text-foreground">Handle:</strong> <span className="font-mono">{item.username}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Bio / Descrição</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              A bio deve ser adaptada ao limite de caracteres de cada plataforma, mas sempre manter os elementos essenciais:
              o que fazemos, para quem e o diferencial.
            </p>
            <div className="space-y-4">
              {[
                {
                  label: "Bio Completa (LinkedIn / YouTube)",
                  chars: "~300 caracteres",
                  text: "Plataforma de estratégia de mídia para B2B. Diagnóstico heurístico + IA (Gemini & Claude) + benchmark competitivo. Descubra onde investir em mídia paga antes de gastar. Fundada por @Fernando Ramalho | Ecossistema Orientohub.",
                },
                {
                  label: "Bio Média (Instagram)",
                  chars: "~150 caracteres",
                  text: "Estratégia de mídia B2B com IA 🎯\nDiagnóstico + Benchmark + Scores por canal\nSaiba onde investir antes de gastar\n🔗 intentia.com.br",
                },
                {
                  label: "Bio Curta (X / Twitter)",
                  chars: "~80 caracteres",
                  text: "Estratégia de mídia B2B com IA. Diagnóstico antes do investimento. 🎯",
                },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <span className="text-xs text-muted-foreground font-mono">{item.chars}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line bg-muted/50 p-3 rounded-lg font-mono text-xs">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">CTAs (Chamadas para Ação)</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              CTAs padronizados para manter consistência em todos os pontos de contato. Sempre orientados à ação e ao benefício.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { context: "CTA Principal", cta: "Começar Análise Grátis", usage: "Landing page, posts de conversão, bio links" },
                { context: "CTA Secundário", cta: "Descubra onde investir", usage: "Posts educativos, stories, carrosséis" },
                { context: "CTA de Autoridade", cta: "Veja o diagnóstico completo", usage: "Cases, demonstrações, webinars" },
                { context: "CTA de Urgência", cta: "Pare de desperdiçar budget", usage: "Ads, remarketing, email marketing" },
                { context: "CTA de Prova Social", cta: "+50 marcas já analisaram", usage: "Posts de prova social, landing page" },
                { context: "CTA de Conteúdo", cta: "Leia o guia completo", usage: "Blog posts, newsletters, threads" },
              ].map((item) => (
                <div key={item.context} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider">{item.context}</p>
                  <p className="text-sm font-bold text-foreground">"{item.cta}"</p>
                  <p className="text-xs text-muted-foreground">{item.usage}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Linha Editorial */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Linha Editorial — Tópicos Centrais</h3>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Todo conteúdo publicado deve orbitar estes pilares temáticos. Cada pilar tem subtópicos que podem ser explorados
              em diferentes formatos (posts, carrosséis, vídeos, artigos).
            </p>
            <div className="space-y-4">
              {[
                {
                  pillar: "Estratégia antes da Mídia",
                  emoji: "🎯",
                  color: "border-primary/30 bg-primary/5",
                  topics: [
                    "Por que análise estratégica vem antes do investimento em ads",
                    "Erros comuns de empresas B2B ao investir em mídia paga",
                    "Como avaliar se sua empresa está pronta para Google/Meta/LinkedIn Ads",
                    "O custo real de investir sem estratégia",
                    "Cases de diagnóstico: antes vs. depois",
                  ],
                },
                {
                  pillar: "Inteligência Artificial Aplicada",
                  emoji: "🤖",
                  color: "border-blue-200 bg-blue-50",
                  topics: [
                    "Como IA pode potencializar análises de marketing B2B",
                    "Gemini vs Claude: quando usar cada modelo",
                    "IA como copiloto estratégico, não substituto",
                    "Análise semântica de concorrentes com IA",
                    "O futuro da estratégia de mídia com IA generativa",
                  ],
                },
                {
                  pillar: "Benchmark e Competitividade",
                  emoji: "📊",
                  color: "border-green-200 bg-green-50",
                  topics: [
                    "Como fazer benchmark competitivo no B2B",
                    "Análise SWOT automatizada: o que muda na prática",
                    "Gap analysis: identificando oportunidades que seus concorrentes ignoram",
                    "Posicionamento digital: como se diferenciar no seu nicho",
                    "Métricas que importam vs. métricas de vaidade",
                  ],
                },
                {
                  pillar: "Canais de Mídia B2B",
                  emoji: "📢",
                  color: "border-orange-200 bg-orange-50",
                  topics: [
                    "Google Ads para B2B: quando faz sentido investir",
                    "LinkedIn Ads: o canal mais caro vale a pena?",
                    "Meta Ads no B2B: mitos e realidades",
                    "TikTok Ads B2B: tendência ou modismo?",
                    "Score por canal: como saber onde investir primeiro",
                  ],
                },
                {
                  pillar: "Produto e Plataforma",
                  emoji: "🚀",
                  color: "border-purple-200 bg-purple-50",
                  topics: [
                    "Novidades e atualizações da plataforma Intentia",
                    "Tutoriais e walkthroughs de funcionalidades",
                    "Bastidores do desenvolvimento (building in public)",
                    "Roadmap e próximos passos",
                    "Depoimentos e resultados de clientes",
                  ],
                },
              ].map((item) => (
                <div key={item.pillar} className={`p-5 rounded-xl border ${item.color} space-y-3`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-sm font-bold text-foreground">{item.pillar}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                    {item.topics.map((topic) => (
                      <div key={topic} className="flex gap-2">
                        <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">{topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formatos de Conteúdo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Formatos Recomendados</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { format: "Carrossel", platform: "LinkedIn / Instagram", frequency: "2-3x por semana", desc: "Conteúdo educativo com dados e insights visuais." },
                { format: "Post Texto", platform: "LinkedIn / X", frequency: "Diário", desc: "Reflexões, dicas rápidas, provocações estratégicas." },
                { format: "Vídeo Curto", platform: "Instagram / TikTok / YouTube Shorts", frequency: "1-2x por semana", desc: "Dicas de 30-60s, demos do produto, bastidores." },
                { format: "Artigo / Blog", platform: "LinkedIn / Blog", frequency: "Semanal", desc: "Conteúdo aprofundado, guias, análises de mercado." },
              ].map((item) => (
                <div key={item.format} className="p-4 rounded-xl border border-border bg-card space-y-2">
                  <p className="text-sm font-bold text-foreground">{item.format}</p>
                  <p className="text-xs text-primary font-medium">{item.platform}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  <p className="text-xs text-muted-foreground font-mono">Frequência: {item.frequency}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Hashtags Padrão</h3>
            <div className="p-5 rounded-xl border border-border bg-card space-y-3">
              <div className="space-y-2">
                <p className="text-xs text-primary font-semibold uppercase tracking-wider">Marca</p>
                <div className="flex flex-wrap gap-2">
                  {["#Intentia", "#IntentiaHub", "#EstratégiaComIA", "#MídiaB2B"].map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs font-medium px-3 py-1">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Temáticas</p>
                <div className="flex flex-wrap gap-2">
                  {["#MarketingB2B", "#MídiaPaga", "#GoogleAds", "#LinkedInAds", "#MetaAds", "#IAMarketing", "#BenchmarkCompetitivo", "#EstratégiaDigital", "#SaaS", "#GrowthB2B"].map((tag) => (
                    <span key={tag} className="inline-flex items-center rounded-full bg-muted text-muted-foreground text-xs font-medium px-3 py-1">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 13. APLICAÇÃO DE MARCA — POSTS PARA DOWNLOAD ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">13. Aplicação de Marca</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <Link
            to="/brand/posts"
            className="group block rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
          >
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Image className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Posts para Redes Sociais
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Todos os posts da marca prontos para download — Perfil, Marca, Cases de Uso, Landing Page, Lançamento e Proposta de Valor. Exportados em JPG 95% para máxima qualidade no Instagram.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">Perfil 1080×1080</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">8 Cases</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">9 Landing</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">Lançamento</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">5 Valores</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
            </div>
          </Link>
        </section>

        {/* ─── 14. DOCUMENTAÇÃO TÉCNICA ─── */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">14. Documentação Técnica</h2>
            <div className="w-12 h-0.5 bg-primary rounded-full" />
          </div>

          <Link
            to="/brand/google-ads-doc"
            className="group block rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 overflow-hidden"
          >
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-shrink-0 h-16 w-16 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Google Ads API — Design Documentation
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Documento formatado para aprovação do Developer Token do Google Ads API. Inclui business model, tool design, API services, mockups e informações de segurança. Pronto para salvar como PDF.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">OAuth 2.0</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">READ-ONLY</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">PDF-ready</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">Mockups</span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
            </div>
          </Link>
        </section>

        {/* ─── FOOTER ─── */}
        <section className="pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-2xl font-extrabold tracking-tight text-foreground">
                intentia<span className="text-primary">.</span>
              </span>
              <p className="text-xs text-muted-foreground mt-1">Brand Guide v1.0 — {new Date().getFullYear()}</p>
            </div>
            <p className="text-xs text-muted-foreground max-w-sm">
              Este guia é um documento vivo e deve ser atualizado conforme a marca evolui.
              Qualquer dúvida sobre aplicação, consulte a equipe de design.
            </p>
          </div>
        </section>

      </div>

      <Footer />
      <BackToTop />
    </div>
  );
}
