import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Target,
  ArrowRight,
  CheckCircle2,
  Search,
  FileText,
  Zap,
  BarChart3,
  Shield,
  Lightbulb,
  TrendingUp,
  Play,
  Eye,
  Globe,
  Code2,
} from "lucide-react";

const scores = [
  { label: "Proposta de Valor", desc: "O benefício principal está claro e visível?", icon: Target },
  { label: "Clareza da Oferta", desc: "A oferta é compreensível em poucos segundos?", icon: Eye },
  { label: "Jornada do Usuário", desc: "CTAs e fluxo de navegação estão bem definidos?", icon: ArrowRight },
  { label: "SEO", desc: "Meta tags, headings e estrutura estão otimizados?", icon: Search },
  { label: "Conversão", desc: "Formulários e elementos de conversão presentes?", icon: TrendingUp },
  { label: "Qualidade de Conteúdo", desc: "Texto relevante, quantidade e profundidade adequados?", icon: FileText },
];

const flowSteps = [
  { step: "1", label: "Insira a URL", desc: "URL do seu negócio B2B", icon: Globe },
  { step: "2", label: "Fetch Automático", desc: "HTML analisado em segundos", icon: Zap },
  { step: "3", label: "6 Scores Gerados", desc: "0 a 100 por dimensão", icon: BarChart3 },
  { step: "4", label: "Insights Criados", desc: "Alertas + oportunidades", icon: Lightbulb },
];

const benefits = [
  "Análise 100% automática — sem configuração manual",
  "Resultados em segundos, não em dias",
  "6 dimensões estratégicas avaliadas simultaneamente",
  "Insights acionáveis gerados automaticamente",
  "Score Estratégico geral com média ponderada",
  "Base para análise por IA e benchmark competitivo",
  "Identifica problemas antes de investir em mídia",
  "Funciona com qualquer URL pública",
];

export default function FeatureDiagnostico() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Diagnóstico Heurístico de URL"
        path="/diagnostico-url"
        description="Análise automática de proposta de valor, clareza, jornada do usuário, SEO, conversão e conteúdo. 6 scores estratégicos em segundos."
        keywords="diagnóstico URL, análise heurística, score estratégico, proposta de valor, SEO, conversão, marketing B2B"
        jsonLd={buildBreadcrumb([{ name: "Diagnóstico de URL", path: "/diagnostico-url" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Target className="h-4 w-4" />
            Análise Heurística
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Diagnóstico completo
            <br />
            da sua{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              URL em segundos
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Insira a URL do seu negócio B2B e receba automaticamente
            <br className="hidden sm:block" />
            6 scores estratégicos, insights acionáveis e um diagnóstico
            <br className="hidden sm:block" />
            completo de prontidão para mídia paga.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Analisar Minha URL
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
              <div className="text-2xl sm:text-3xl font-bold text-primary">6</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Dimensões Avaliadas</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">&lt;10s</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Tempo de Análise</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">0-100</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Score por Dimensão</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">Auto</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Insights Gerados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Da URL ao diagnóstico completo em 4 passos automáticos.
            </p>
          </div>
          <div className="max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            {flowSteps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative inline-flex flex-col items-center">
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 Scores */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              6 Dimensões Estratégicas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada dimensão recebe um score de 0 a 100. O Score Estratégico geral é a média ponderada.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scores.map((score, index) => {
              const Icon = score.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{score.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{score.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Screenshot */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                <Code2 className="h-3.5 w-3.5" />
                Análise Profunda
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Insights automáticos e acionáveis
              </h2>
              <p className="text-muted-foreground mb-6">
                Após a análise, o sistema gera automaticamente insights categorizados em alertas, oportunidades e melhorias — cada um com ação recomendada.
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
                src="/Diagnostico-url.png"
                alt="Diagnóstico Heurístico de URL"
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
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent border border-primary/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Descubra a prontidão da sua URL
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Pare de investir em mídia sem saber se sua página está preparada.
              Analise sua URL em segundos e receba um diagnóstico completo.
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
