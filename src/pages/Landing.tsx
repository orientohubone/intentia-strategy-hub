import { useState, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
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

const features = [
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
  },
  {
    icon: Rocket,
    title: "Playbook de Execução Gamificado",
    description: "Gere diretivas de execução priorizadas com KPIs e ações específicas por canal. Transforme o plano tático em um playbook visual e acionável.",
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
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border mb-6 animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Plataforma de Estratégia de Mídia para B2B
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Descubra <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">onde investir</span> em mídia paga antes de gastar
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Diagnóstico heurístico + inteligência artificial + benchmark competitivo + playbook de execução. 
              Avalie a prontidão do seu negócio B2B para Google, Meta, LinkedIn e TikTok Ads antes de investir.
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
            {features.map((feature, i) => (
              <div key={i} className="card-elevated p-6 group">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
                Inteligência Artificial
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Sua própria IA, seus próprios insights
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Conecte sua API key do Google Gemini ou Anthropic Claude e desbloqueie análises semânticas profundas — 
                sem custo adicional da plataforma. Você paga apenas o que consumir direto na API.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Análise de Projetos", desc: "Resumo executivo, prontidão para investimento, SWOT, recomendações por canal e posição competitiva." },
                  { title: "Enriquecimento de Benchmark", desc: "Vantagens e desvantagens competitivas, gaps estratégicos, oportunidades de diferenciação e plano de ação." },
                  { title: "Exportação completa", desc: "Exporte resultados da IA em JSON, Markdown, HTML estilizado ou PDF — para projetos e benchmarks." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="card-elevated p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Google Gemini</p>
                    <p className="text-xs text-muted-foreground">Gemini 3 Flash Preview · 2.5 Flash · 2.5 Pro Preview · 2.0 Flash</p>
                  </div>
                </div>
              </div>
              <div className="card-elevated p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Anthropic Claude</p>
                    <p className="text-xs text-muted-foreground">Claude Sonnet 4 · Sonnet 3.7 · Haiku 3.5 · Opus 3</p>
                  </div>
                </div>
              </div>
              <div className="card-elevated p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Suas chaves, seu controle</p>
                    <p className="text-xs text-muted-foreground">API keys armazenadas com segurança por usuário</p>
                  </div>
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
              <p className="text-sm text-muted-foreground mb-4">Perfeito para testar sua estratégia</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>✓ 5 análises de URL por mês</li>
                <li>✓ Score básico por canal</li>
                <li>✓ Relatório simples</li>
                <li>✓ Suporte por email</li>
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
              <p className="text-sm mb-4 opacity-90">Para empresas que levam marketing a sério</p>
              <ul className="space-y-3 text-sm mb-6">
                <li>✓ Análises ilimitadas de URLs</li>
                <li>✓ Análise por IA (Gemini & Claude)</li>
                <li>✓ Benchmark competitivo com IA</li>
                <li>✓ Relatórios PDF e exportação CSV</li>
                <li>✓ Insights e alertas estratégicos</li>
              </ul>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/precos')}>
                Ver Detalhes
              </Button>
            </div>

            {/* Enterprise */}
            <div className="bg-card rounded-xl border border-border p-6 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-foreground mb-4">Personalizado</div>
              <p className="text-sm text-muted-foreground mb-4">Solução sob medida para grandes empresas</p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6">
                <li>✓ Tudo do Professional</li>
                <li>✓ API access completo</li>
                <li>✓ SLA dedicado</li>
                <li>✓ Consultoria estratégica</li>
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
