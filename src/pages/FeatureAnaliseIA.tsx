import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Brain,
  Shield,
  Target,
  BarChart3,
  Lightbulb,
  TrendingUp,
  Play,
  Key,
  Zap,
  Globe,
  FileText,
} from "lucide-react";

const aiCapabilities = [
  { icon: FileText, title: "Resumo Executivo", desc: "Visão geral do negócio, posicionamento e mercado-alvo identificados pela IA." },
  { icon: Target, title: "Score de Prontidão", desc: "Score 0-100 com justificativa detalhada sobre a prontidão para investimento em mídia." },
  { icon: Shield, title: "Análise SWOT", desc: "Forças, fraquezas, oportunidades e ameaças identificadas automaticamente." },
  { icon: BarChart3, title: "Recomendações por Canal", desc: "Sugestões específicas para Google, Meta, LinkedIn e TikTok baseadas no perfil do negócio." },
  { icon: TrendingUp, title: "Posição Competitiva", desc: "Avaliação do posicionamento frente ao mercado e concorrentes." },
  { icon: Lightbulb, title: "Plano de Ação", desc: "Ações priorizadas por impacto para melhorar a prontidão estratégica." },
];

const models = [
  {
    provider: "Google Gemini",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    models: ["Gemini 3 Flash Preview", "Gemini 2.5 Flash", "Gemini 2.5 Pro Preview", "Gemini 2.0 Flash"],
  },
  {
    provider: "Anthropic Claude",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    models: ["Claude Sonnet 4", "Claude Sonnet 3.7", "Claude Haiku 3.5", "Claude Haiku 3", "Claude Opus 3"],
  },
];

const benefits = [
  "Use sua própria API key — sem custos extras na plataforma",
  "Escolha entre múltiplos modelos de IA por provider",
  "Validação de API key em tempo real contra a API oficial",
  "Análise semântica profunda do conteúdo da página",
  "Resultados salvos automaticamente no projeto",
  "Exportação em JSON, Markdown, HTML e PDF",
  "Centavos por análise — custo mínimo direto ao provider",
  "Funciona para projetos e benchmarks",
];

export default function FeatureAnaliseIA() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Análise por Inteligência Artificial"
        path="/analise-ia"
        description="Enriqueça diagnósticos com Google Gemini e Anthropic Claude. Resumo executivo, SWOT, score de prontidão e recomendações por canal."
        keywords="análise IA, inteligência artificial, Google Gemini, Anthropic Claude, análise estratégica, SWOT automático, marketing B2B"
        jsonLd={buildBreadcrumb([{ name: "Análise por IA", path: "/analise-ia" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Inteligência Artificial
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Insights profundos
            <br />
            com{" "}
            <span className="text-gradient bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
              Gemini & Claude
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Vá além da análise heurística.
            <br className="hidden sm:block" />
            Use inteligência artificial para obter resumo executivo,
            <br className="hidden sm:block" />
            análise SWOT, score de prontidão e recomendações por canal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Começar com IA
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
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">2</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Providers de IA</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">9</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Modelos Disponíveis</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">6</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Seções de Análise</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">4</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Formatos de Export</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O que a IA analisa
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A análise por IA vai além dos padrões heurísticos, compreendendo contexto, mercado e posicionamento.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiCapabilities.map((cap, index) => {
              const Icon = cap.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-purple-500/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{cap.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Models */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Modelos Suportados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o modelo ideal para sua necessidade. Configure sua API key em Configurações.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {models.map((provider, index) => (
              <div key={index} className={`rounded-2xl border ${provider.borderColor} p-6 sm:p-8`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center`}>
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{provider.provider}</h3>
                    <p className="text-xs text-muted-foreground">{provider.models.length} modelos disponíveis</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {provider.models.map((model, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground">{model}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + Screenshot */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 text-xs font-medium mb-4">
                <Key className="h-3.5 w-3.5" />
                Sua API Key, Seu Controle
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Sem custos ocultos
              </h2>
              <p className="text-muted-foreground mb-6">
                Você usa sua própria API key e paga diretamente ao Google ou Anthropic. Cada análise custa centavos.
              </p>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
              <img
                src="/analise-ia.png"
                alt="Análise por Inteligência Artificial"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Disponível com sua API key
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Potencialize seus diagnósticos com IA
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Configure sua API key em segundos e comece a obter insights que só a inteligência artificial pode oferecer.
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
