import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Shield,
  Target,
  TrendingUp,
  Play,
  Sparkles,
  Eye,
  Lightbulb,
  Search,
  Zap,
} from "lucide-react";

const swotSections = [
  { label: "Forças", desc: "Vantagens competitivas do concorrente identificadas automaticamente", color: "border-green-500/30 bg-green-500/5 text-green-600" },
  { label: "Fraquezas", desc: "Pontos fracos e vulnerabilidades que você pode explorar", color: "border-red-500/30 bg-red-500/5 text-red-600" },
  { label: "Oportunidades", desc: "Gaps de mercado e diferenciação que você pode aproveitar", color: "border-blue-500/30 bg-blue-500/5 text-blue-600" },
  { label: "Ameaças", desc: "Riscos competitivos que exigem atenção e estratégia", color: "border-amber-500/30 bg-amber-500/5 text-amber-600" },
];

const features = [
  { icon: Shield, title: "Análise SWOT Automática", desc: "Forças, fraquezas, oportunidades e ameaças geradas automaticamente ao criar um benchmark." },
  { icon: BarChart3, title: "Scores Comparativos", desc: "Scores individuais para cada dimensão SWOT, permitindo comparação quantitativa entre concorrentes." },
  { icon: Search, title: "Gap Analysis", desc: "Identifica diferenças entre seu posicionamento e o do concorrente em cada dimensão avaliada." },
  { icon: Sparkles, title: "Enriquecimento por IA", desc: "Análise aprofundada com Gemini ou Claude: vantagens detalhadas, gaps estratégicos e plano de ação." },
  { icon: Eye, title: "Dialog de Detalhes", desc: "Visualize todas as informações em um dialog expansível com opção de fullscreen." },
  { icon: Lightbulb, title: "Tags e Categorização", desc: "Organize benchmarks com tags coloridas para facilitar a navegação e comparação." },
];

const benefits = [
  "Compare-se com múltiplos concorrentes por projeto",
  "SWOT gerado automaticamente sem esforço manual",
  "Scores quantitativos para decisões objetivas",
  "Gap analysis visual entre você e cada concorrente",
  "Enriquecimento por IA com plano de ação prático",
  "Exportação de resultados em múltiplos formatos",
  "Histórico de benchmarks para acompanhar evolução",
  "Integrado com análise heurística e scores por canal",
];

export default function FeatureBenchmark() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Benchmark Competitivo com IA"
        path="/benchmark-competitivo"
        description="Compare seu posicionamento com concorrentes via análise SWOT automática, gap analysis e enriquecimento por IA."
        keywords="benchmark competitivo, análise SWOT, gap analysis, concorrentes, marketing B2B, inteligência artificial"
        jsonLd={buildBreadcrumb([{ name: "Benchmark Competitivo", path: "/benchmark-competitivo" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium mb-6">
            <BarChart3 className="h-4 w-4" />
            Benchmark Competitivo
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Saiba exatamente onde você
            <br />
            <span className="text-gradient bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              está vs a concorrência
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Compare seu posicionamento digital com concorrentes
            <br className="hidden sm:block" />
            através de análise SWOT automática, gap analysis detalhado
            <br className="hidden sm:block" />
            e enriquecimento por inteligência artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Comparar Agora
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">4</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Dimensões SWOT</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">Auto</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Geração SWOT</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">IA</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Enriquecimento</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-green-600">∞</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Concorrentes</p>
            </div>
          </div>
        </div>
      </section>

      {/* SWOT */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Análise SWOT Automática
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada benchmark gera automaticamente uma análise SWOT completa com scores comparativos.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {swotSections.map((section, i) => (
              <div key={i} className={`rounded-2xl border ${section.color} p-6 text-center`}>
                <h3 className="text-lg font-bold mb-2">{section.label}</h3>
                <p className="text-sm text-muted-foreground">{section.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Funcionalidades do Benchmark
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-green-500/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits + Screenshot */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-medium mb-4">
                <Zap className="h-3.5 w-3.5" />
                Vantagem Competitiva
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Decisões baseadas em dados reais
              </h2>
              <p className="text-muted-foreground mb-6">
                Pare de adivinhar onde você está em relação à concorrência. Use dados concretos para tomar decisões estratégicas.
              </p>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
              <img src="/benchmark.png" alt="Benchmark Competitivo" className="w-full h-auto" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border border-green-500/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Conheça sua posição competitiva
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Compare-se com concorrentes, identifique gaps e crie estratégias baseadas em dados reais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
                Criar Conta Gratuita
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
                Ver Planos e Preços
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
