import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { 
  Target, 
  BarChart3, 
  Lightbulb, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
  Sparkles,
  FileText,
  Brain,
  GripVertical,
  Crosshair,
  Rocket,
  Database,
  Globe,
  Wand2,
  Code2,
  AlertTriangle,
  Copy,
  TrendingUp,
  Search,
  ShieldAlert,
  GitCompareArrows,
  FlaskConical,
  CircleDot,
  Layers,
  Lock,
} from "lucide-react";

function ShowcaseSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className="mt-16 relative animate-scale-in" style={{ animationDelay: "0.3s" }}>
      <div
        ref={containerRef}
        className="relative rounded-2xl max-w-5xl mx-auto select-none cursor-col-resize"
        style={{ touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="border-beam rounded-2xl" />
        <div className="relative rounded-2xl border border-border shadow-xl overflow-hidden">
        {/* Light mode — full width base */}
        <img
          src="/intentia-light1.png"
          alt="Intentia Dashboard - Light Mode"
          className="w-full h-auto block pointer-events-none"
          draggable={false}
        />
        {/* Dark mode — clipped from left */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src="/intentia-dark1.png"
            alt="Intentia Dashboard - Dark Mode"
            className="w-full h-auto block pointer-events-none"
            draggable={false}
          />
        </div>
        {/* Orange divider line with grip */}
        <div
          className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
          style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-1 h-full bg-primary" />
          <div className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary shadow-lg flex items-center justify-center">
            <GripVertical className="h-5 w-5 text-white" />
          </div>
        </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4 opacity-60">
        Arraste para comparar Light e Dark mode
      </p>
    </div>
  );
}

const features: { icon: React.ElementType; title: string; description: string; link?: string }[] = [
  {
    icon: Target,
    title: "Diagnóstico Heurístico de URL",
    description: "Análise automática de proposta de valor, clareza da oferta, jornada do usuário, SEO, conversão e qualidade de conteúdo — tudo em segundos.",
  },
  {
    icon: Sparkles,
    title: "Análise por IA (Gemini & Claude)",
    description: "Enriqueça seus diagnósticos com inteligência artificial. Use sua própria API key do Google Gemini ou Anthropic Claude para insights aprofundados.",
  },
  {
    icon: BarChart3,
    title: "Benchmark Competitivo com IA",
    description: "Compare seu posicionamento com concorrentes via análise SWOT, gap analysis e enriquecimento por IA com vantagens, ameaças e plano de ação.",
  },
  {
    icon: Lightbulb,
    title: "Score por Canal de Mídia",
    description: "Scores individuais para Google, Meta, LinkedIn e TikTok Ads com objetivos recomendados, riscos identificados e nível de recomendação.",
  },
  {
    icon: Shield,
    title: "Alertas e Insights Estratégicos",
    description: "Insights automáticos agrupados por projeto: alertas de risco, oportunidades de mercado e melhorias sugeridas com ações práticas.",
  },
  {
    icon: Crosshair,
    title: "Plano Tático por Canal",
    description: "Transforme estratégia em ação: estruture campanhas para Google, Meta, LinkedIn e TikTok com templates validados por nicho B2B.",
    link: "/plano-tatico",
  },
  {
    icon: Rocket,
    title: "Playbook de Execução Gamificado",
    description: "Gere diretivas de execução priorizadas com KPIs e ações específicas por canal. Transforme o plano tático em um playbook visual e acionável.",
    link: "/plano-tatico",
  },
  {
    icon: Database,
    title: "Dados Estruturados & Comparação",
    description: "Extração automática de JSON-LD, Open Graph, Twitter Card e Microdata. Compare dados estruturados do seu site com concorrentes em abas unificadas.",
  },
  {
    icon: FileText,
    title: "Relatórios PDF e Exportação CSV",
    description: "Relatórios consolidados por projeto em PDF, exportação por seção e dados em CSV para análise externa. Tudo pronto para apresentar ao cliente.",
  },
];

const steps = [
  { number: "01", title: "Crie seu projeto", description: "Insira a URL do seu negócio B2B, defina o nicho e adicione URLs de concorrentes." },
  { number: "02", title: "Análise heurística automática", description: "Em segundos, receba scores de proposta de valor, clareza, jornada, SEO, conversão e conteúdo." },
  { number: "03", title: "Enriqueça com IA", description: "Ative a análise por Gemini ou Claude para obter resumo executivo, SWOT, prontidão e recomendações por canal." },
  { number: "04", title: "Compare com concorrentes", description: "Benchmarks automáticos com SWOT, gap analysis e enriquecimento por IA para cada concorrente." },
  { number: "05", title: "Mapeie públicos-alvo", description: "Defina audiências com indústria, porte, localização e keywords para refinar sua estratégia." },
  { number: "06", title: "Monte o plano tático", description: "Estruture campanhas por canal com templates pré-preenchidos por nicho: copy, segmentação, testes e métricas." },
  { number: "07", title: "Exporte e apresente", description: "Gere relatórios PDF consolidados, exporte dados em CSV e compartilhe insights com seu time." },
];

const benefits = [
  "Evite desperdício de budget em canais inadequados",
  "Tome decisões baseadas em dados e IA, não intuição",
  "Identifique o momento certo de investir em cada canal",
  "Alinhe estratégia antes de criar campanhas",
  "Compare seu posicionamento com concorrentes em tempo real",
  "Estruture campanhas com templates táticos validados por nicho",
  "Gere relatórios profissionais para apresentar ao cliente",
  "Transforme planos táticos em playbooks de execução gamificados",
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        path="/"
        description="Do diagnóstico à execução: analise a prontidão do seu negócio B2B, enriqueça insights com IA, compare-se com concorrentes e monte planos táticos por canal."
        keywords="marketing B2B, análise estratégica, mídia paga, benchmark competitivo, Google Ads, Meta Ads, LinkedIn Ads, plano tático, inteligência artificial"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Intentia",
            url: "https://intentia.com.br",
            logo: "https://intentia.com.br/favicon.svg",
            description: "Plataforma de inteligência estratégica para marketing B2B.",
            sameAs: [],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Intentia",
            url: "https://intentia.com.br",
            description: "Do diagnóstico à execução: estratégia completa para mídia B2B.",
            inLanguage: "pt-BR",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://intentia.com.br/blog?q={search_term_string}",
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Intentia Strategy Hub",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://intentia.com.br",
            description: "Plataforma SaaS de inteligência estratégica para marketing B2B. Análise heurística de URLs, enriquecimento com IA (Gemini/Claude), benchmark competitivo com SWOT, scores por canal (Google, Meta, LinkedIn, TikTok), plano tático por canal e playbook de execução.",
            offers: [
              {
                "@type": "Offer",
                name: "Starter",
                price: "0",
                priceCurrency: "BRL",
                description: "3 projetos, diagnóstico heurístico, scores por canal, insights e alertas estratégicos.",
              },
              {
                "@type": "Offer",
                name: "Professional",
                price: "97",
                priceCurrency: "BRL",
                billingIncrement: "P1M",
                description: "Projetos ilimitados, análise por IA, benchmark SWOT, plano tático, exportação e notificações.",
              },
            ],
            featureList: "Diagnóstico heurístico de URL, Análise por IA (Gemini/Claude), Benchmark competitivo SWOT, Scores por canal, Insights estratégicos, Alertas de investimento, Plano tático por canal, Playbook de execução, Exportação PDF/CSV, Públicos-alvo",
          },
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border mb-6 animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Inteligência Estratégica para Marketing B2B
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Do diagnóstico à execução: <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">estratégia completa</span> para mídia B2B
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Analise a prontidão do seu negócio, enriqueça insights com IA, compare-se com concorrentes e monte planos táticos por canal — tudo em uma plataforma.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
                Começar Análise Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="xl" onClick={() => navigate('/precos')}>
                Ver Preços
              </Button>
            </div>
          </div>

          {/* Dashboard Showcase — Comparison Slider */}
          <ShowcaseSlider />
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Funcionalidades
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa para decidir com inteligência
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Da análise heurística à inteligência artificial, do benchmark competitivo ao relatório final — uma plataforma completa para estratégia de mídia B2B.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const content = (
                <>
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  {feature.link && (
                    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-3 group-hover:gap-2 transition-all">
                      Saiba mais <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </>
              );
              return feature.link ? (
                <div
                  key={i}
                  className="card-elevated p-6 group cursor-pointer"
                  onClick={() => { navigate(feature.link!); window.scrollTo(0, 0); }}
                >
                  {content}
                </div>
              ) : (
                <div key={i} className="card-elevated p-6 group">
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Como Funciona
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Da URL ao relatório estratégico em <span className="text-primary">7 passos</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um fluxo completo que combina análise automática, inteligência artificial e benchmark competitivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="relative z-10">
                  <span className="text-5xl font-bold text-primary/20">{step.number}</span>
                  <h3 className="font-semibold text-foreground mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Inteligência Artificial
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Enriquecimento por IA em <span className="text-primary">3 camadas</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Conecte sua API key do Google Gemini ou Anthropic Claude e enriqueça automaticamente seus projetos, benchmarks e insights — 
              sem custo adicional da plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

            {/* Card 1: Projetos — simula painel de análise */}
            <Card className="overflow-hidden border-border/60 hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">Enriquecimento de Projetos</p>
                      <p className="text-xs text-muted-foreground">Análise semântica profunda</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">IA</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A IA analisa o HTML capturado e gera um diagnóstico executivo completo do projeto.
                </p>
                <Separator />
                <div className="space-y-2.5">
                  {[
                    { icon: FileText, label: "Resumo executivo", detail: "Síntese estratégica" },
                    { icon: TrendingUp, label: "Score de prontidão", detail: "0–100 por critério" },
                    { icon: Target, label: "Análise SWOT", detail: "Forças e fraquezas" },
                    { icon: Layers, label: "Recomendações por canal", detail: "Google · Meta · LinkedIn · TikTok" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                      <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Profundidade da análise</span>
                    <span className="font-medium text-primary">Avançada</span>
                  </div>
                  <Progress value={85} className="h-1.5" />
                </div>
              </CardFooter>
            </Card>

            {/* Card 2: Benchmarks — simula painel comparativo */}
            <Card className="overflow-hidden border-border/60 hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <GitCompareArrows className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">Enriquecimento de Benchmarks</p>
                      <p className="text-xs text-muted-foreground">Inteligência competitiva</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-500">IA</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cada concorrente é analisado pela IA com vantagens, gaps e plano de ação prioritizado.
                </p>
                <Separator />
                <div className="space-y-2.5">
                  {[
                    { icon: Shield, label: "Vantagens competitivas", detail: "O que você faz melhor" },
                    { icon: Search, label: "Gaps estratégicos", detail: "Onde estão as lacunas" },
                    { icon: Lightbulb, label: "Oportunidades", detail: "Diferenciação de mercado" },
                    { icon: Crosshair, label: "Plano de ação", detail: "Priorizado por impacto" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                      <item.icon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Cobertura competitiva</span>
                    <span className="font-medium text-blue-500">Completa</span>
                  </div>
                  <Progress value={92} className="h-1.5 [&>div]:bg-blue-500" />
                </div>
              </CardFooter>
            </Card>

            {/* Card 3: Insights — simula painel de alertas */}
            <Card className="overflow-hidden border-border/60 hover:border-emerald-500/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">Enriquecimento de Insights</p>
                      <p className="text-xs text-muted-foreground">Dados brutos → ações</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">IA</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A IA transforma métricas em insights acionáveis com alertas, oportunidades e melhorias por projeto.
                </p>
                <Separator />
                <div className="space-y-2.5">
                  {[
                    { icon: ShieldAlert, label: "Alertas de risco", detail: "Priorizados por severidade" },
                    { icon: TrendingUp, label: "Oportunidades de mercado", detail: "Identificadas por padrão" },
                    { icon: CircleDot, label: "Melhorias estratégicas", detail: "Ações com impacto mensurável" },
                    { icon: Rocket, label: "Próximos passos", detail: "Roadmap por projeto" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                      <item.icon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground">{item.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Acionabilidade</span>
                    <span className="font-medium text-emerald-500">Alta</span>
                  </div>
                  <Progress value={78} className="h-1.5 [&>div]:bg-emerald-500" />
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* AI Providers row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">Google Gemini</p>
                  <p className="text-[10px] text-muted-foreground truncate">3 Flash · 2.5 Flash · 2.5 Pro · 2.0 Flash</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">Anthropic Claude</p>
                  <p className="text-[10px] text-muted-foreground truncate">Sonnet 4 · Sonnet 3.7 · Haiku 3.5 · Opus 3</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-tight">Suas chaves, seu controle</p>
                  <p className="text-[10px] text-muted-foreground truncate">API keys criptografadas por usuário</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Structured Data Generator Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
                Exclusivo
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Gerador de <span className="text-primary">Dados Estruturados</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Não basta saber o que a concorrência tem — você precisa ter também. 
                O gerador analisa os dados estruturados dos seus concorrentes e cria snippets prontos para copiar e colar no seu site.
              </p>
              <div className="space-y-4">
                {[
                  { icon: AlertTriangle, title: "Gap Analysis Automático", desc: "Identifica JSON-LD, Open Graph e Twitter Card que seus concorrentes têm e você não. Prioriza por criticidade." },
                  { icon: Code2, title: "Snippets Prontos para Usar", desc: "Gera código JSON-LD (Organization, WebSite, FAQ, Product) e meta tags OG/Twitter pré-preenchidos com dados do seu projeto." },
                  { icon: Copy, title: "Copie e Cole no Seu Site", desc: "Cada snippet vem pronto para o <head> do seu HTML. Copie individual ou todos de uma vez com um clique." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <item.icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {/* Visual card simulating the generator */}
              <div className="card-elevated p-6 space-y-4 border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wand2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Gerador de Dados Estruturados</p>
                    <p className="text-xs text-muted-foreground">3 gaps críticos · 2 moderados · Baseado em 4 concorrentes</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-foreground">Organization</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">JSON-LD</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">Crítico</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-medium text-foreground">FAQPage</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600">JSON-LD</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-medium">Crítico</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-foreground">Open Graph (5 tags)</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600">Meta Tag</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-medium">Moderado</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary to-orange-400" />
                  </div>
                  <span className="text-[10px] text-muted-foreground">8 snippets gerados</span>
                </div>
              </div>
              <div className="card-elevated p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold text-foreground">Já presente no seu site</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">✓ WebSite</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">✓ Open Graph (3 tags)</span>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-600 border border-green-500/20">✓ Twitter Card</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Estratégia antes da mídia
              </h2>
              <p className="text-lg opacity-90 mb-8">
                A maioria das empresas B2B investe em mídia paga sem validar se estão prontas estrategicamente. 
                Com Intentia, você combina análise heurística, inteligência artificial e benchmark competitivo 
                para tomar decisões fundamentadas.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">6</p>
                <p className="text-sm opacity-80">Scores por URL</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <BarChart3 className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">4</p>
                <p className="text-sm opacity-80">Canais de mídia</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <Sparkles className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">8+</p>
                <p className="text-sm opacity-80">Modelos de IA</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">5</p>
                <p className="text-sm opacity-80">Formatos de export</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section id="precos" className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Planos para todos os estágios
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comece grátis e evolua conforme sua necessidade de análise estratégica
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Starter</h3>
              <div className="text-3xl font-bold text-foreground mb-4">Grátis</div>
              <p className="text-sm text-muted-foreground mb-4">Ideal para validar sua estratégia</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>✓ 3 projetos ativos</li>
                <li>✓ Diagnóstico heurístico de URL</li>
                <li>✓ Score por canal (4 canais)</li>
                <li>✓ Insights e alertas automáticos</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/auth')}>
                Começar Grátis
              </Button>
            </div>

            {/* Professional */}
            <div className="bg-primary text-primary-foreground rounded-xl border-2 border-primary p-6 text-center relative scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-background text-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Mais Popular
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-4">R$97<span className="text-lg font-normal">/mês</span></div>
              <p className="text-sm mb-4 opacity-90">Estratégia de mídia completa</p>
              <ul className="space-y-3 text-sm mb-6">
                <li>✓ Projetos ilimitados</li>
                <li>✓ Análise por IA (Gemini & Claude)</li>
                <li>✓ Benchmark competitivo + SWOT</li>
                <li>✓ Plano Tático por canal</li>
                <li>✓ Exportação PDF e CSV</li>
              </ul>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/precos')}>
                Ver Detalhes
              </Button>
            </div>

            {/* Enterprise */}
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-foreground mb-4">Personalizado</div>
              <p className="text-sm text-muted-foreground mb-4">Operações de marketing complexas</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>✓ Tudo do Professional</li>
                <li>✓ Múltiplos usuários + API access</li>
                <li>✓ SLA dedicado 24/7</li>
                <li>✓ Consultoria estratégica mensal</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => navigate('/precos')}>
                Falar com Vendas
              </Button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Todos os planos incluem suporte por email
            </p>
            <Button variant="ghost" onClick={() => navigate('/precos')}>
              Ver todos os recursos e detalhes
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Pronto para investir com inteligência?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Crie seu primeiro projeto, analise sua URL e descubra em segundos quais canais de mídia são ideais para seu negócio B2B.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
              Começar Análise Grátis
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => navigate('/precos')}>
              Ver Preços
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Back to Top Button */}
      <BackToTop />
      {/* Back to Home Button */}
      <BackToHomeButton />
    </div>
  );
}
