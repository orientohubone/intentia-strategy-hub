import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Target,
  TrendingUp,
  Play,
  AlertTriangle,
  Globe,
  BarChart3,
  Shield,
  Zap,
} from "lucide-react";

const channels = [
  {
    name: "Google Ads",
    letter: "G",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    desc: "Busca, Display, Performance Max. Ideal para captura de demanda existente e intenção de compra.",
    objectives: ["Geração de Leads", "Tráfego Qualificado", "Conversão Direta"],
  },
  {
    name: "Meta Ads",
    letter: "M",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    desc: "Facebook e Instagram. Excelente para awareness, remarketing e geração de demanda visual.",
    objectives: ["Awareness", "Remarketing", "Lead Generation"],
  },
  {
    name: "LinkedIn Ads",
    letter: "L",
    color: "from-sky-500 to-sky-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    desc: "O canal B2B por excelência. Segmentação por cargo, empresa, indústria e senioridade.",
    objectives: ["ABM", "Lead Gen B2B", "Thought Leadership"],
  },
  {
    name: "TikTok Ads",
    letter: "T",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    desc: "Conteúdo nativo e awareness. Crescente para B2B com formatos criativos e alto engajamento.",
    objectives: ["Brand Awareness", "Top-of-Funnel", "Conteúdo Educativo"],
  },
];

const scoreComponents = [
  { icon: Target, title: "Score 0-100", desc: "Cada canal recebe um score de adequação baseado no perfil do seu negócio e na análise da URL." },
  { icon: BarChart3, title: "Objetivos Recomendados", desc: "Sugestões de objetivos de campanha mais adequados para cada canal: leads, awareness, tráfego, conversão." },
  { icon: AlertTriangle, title: "Riscos Identificados", desc: "Riscos potenciais por canal: custo elevado, audiência inadequada, concorrência alta, sazonalidade." },
  { icon: Shield, title: "Nível de Recomendação", desc: "Indicação clara se o canal é recomendado, neutro ou não recomendado para o seu perfil." },
  { icon: TrendingUp, title: "Papel no Funil", desc: "Onde cada canal se encaixa no funil: awareness, consideração, conversão ou retenção." },
  { icon: Lightbulb, title: "Insights por Canal", desc: "Insights específicos sobre como aproveitar cada canal para maximizar resultados." },
];

const benefits = [
  "Evite investir em canais inadequados para seu negócio",
  "Scores objetivos baseados em dados, não intuição",
  "Riscos identificados antes de gastar o primeiro real",
  "Objetivos de campanha recomendados por canal",
  "Integrado com diagnóstico heurístico e benchmark",
  "Base para o plano tático por canal",
  "Visualização no Dashboard com seletor de projeto",
  "Atualizado automaticamente após cada análise",
];

export default function FeatureScoreCanal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Score por Canal de Mídia"
        path="/score-canal"
        description="Scores individuais para Google, Meta, LinkedIn e TikTok Ads com objetivos recomendados, riscos e nível de recomendação."
        keywords="score canal mídia, Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, marketing B2B, adequação canal"
        jsonLd={buildBreadcrumb([{ name: "Score por Canal", path: "/score-canal" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-sm font-medium mb-6">
            <Lightbulb className="h-4 w-4" />
            Score por Canal
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Qual canal de mídia é
            <br />
            <span className="text-gradient bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
              ideal para o seu negócio?
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Descubra quais canais de mídia paga são mais adequados
            <br className="hidden sm:block" />
            para o seu negócio B2B com scores objetivos,
            <br className="hidden sm:block" />
            riscos identificados e objetivos recomendados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Ver Meus Scores
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* 4 Channels */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              4 Canais Avaliados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada canal é avaliado individualmente com base no perfil do seu negócio e na análise da sua URL.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {channels.map((ch, index) => (
              <div key={index} className={`rounded-2xl border ${ch.borderColor} p-6 sm:p-8 hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${ch.color} flex items-center justify-center shrink-0`}>
                    <span className="text-lg font-bold text-white">{ch.letter}</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{ch.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{ch.desc}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {ch.objectives.map((obj, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{obj}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Score Components */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O que cada score inclui
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {scoreComponents.map((comp, index) => {
              const Icon = comp.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-sky-500/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-sky-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{comp.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{comp.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-xs font-medium mb-4">
                <Zap className="h-3.5 w-3.5" />
                Decisão Inteligente
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Invista no canal certo
              </h2>
              <p className="text-muted-foreground mb-6">
                Cada real investido no canal errado é um real desperdiçado. Use scores objetivos para direcionar seu budget.
              </p>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
              <img src="/score-canal.png" alt="Score por Canal de Mídia" className="w-full h-auto" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent border border-sky-500/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Descubra seus canais ideais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Crie seu projeto, analise sua URL e receba scores por canal em segundos.
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
