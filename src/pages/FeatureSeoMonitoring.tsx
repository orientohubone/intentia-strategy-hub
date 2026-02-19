import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { BrowserMockup } from "@/components/BrowserMockup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Radar,
  Clock,
  Globe,
  TrendingUp,
  Camera,
  Bell,
} from "lucide-react";

const coreItems = [
  {
    icon: Radar,
    title: "Monitoramento contínuo",
    desc: "Roda ciclos automáticos por projeto com estratégia mobile/desktop e intervalo configurável.",
  },
  {
    icon: TrendingUp,
    title: "Detecção de mudanças",
    desc: "Compara snapshots e destaca deltas de SEO, performance, ranking e sinais competitivos.",
  },
  {
    icon: Camera,
    title: "Snapshots de concorrentes",
    desc: "Captura visual por ciclo para acompanhar mudanças de layout, oferta e presença digital.",
  },
  {
    icon: Bell,
    title: "Timeline inteligente",
    desc: "Histórico agrupado por data, com filtros, expand/collapse e leitura rápida de mudanças.",
  },
];

const outcomes = [
  "Identificar quedas de posicionamento antes de impactar receita",
  "Acompanhar movimentos de concorrentes em tempo quase real",
  "Priorizar ajustes com base em evidência (deltas e contexto)",
  "Manter histórico auditável de cada ciclo de monitoramento",
];

export default function FeatureSeoMonitoring() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Monitoramento SEO Inteligente"
        path="/monitoramento-seo-inteligente"
        description="Monitoramento SEO inteligente com timeline viva, snapshots de concorrentes, deltas de ranking e sinais de mudança."
        keywords="monitoramento seo, seo inteligente, monitoramento concorrentes, ranking serp, snapshots concorrentes"
        jsonLd={buildBreadcrumb([{ name: "Monitoramento SEO Inteligente", path: "/monitoramento-seo-inteligente" }])}
      />
      <Header />
      <BackToHomeButton />

      <section className="pt-32 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
            <Activity className="h-3.5 w-3.5 mr-1.5" />
            SEO Monitoring
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Monitoramento SEO
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              inteligente e contínuo
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Deixe de operar no escuro: acompanhe variações de SEO e concorrência por ciclo,
            com histórico legível e sinais acionáveis para tomada de decisão.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Começar Agora
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-10 sm:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5 text-center">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">Preview do produto</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">Tela real do Monitoramento SEO</h2>
          </div>
          <BrowserMockup className="max-w-4xl mx-auto">
            <img
              src="/monitoramento-seo-inteligente.png"
              alt="Tela de monitoramento SEO inteligente com timeline, progresso live e snapshots de concorrentes"
              className="w-full h-auto max-h-[460px] object-cover object-top block"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.endsWith("/dashboard-intentia.png")) {
                  target.src = "/dashboard-intentia.png";
                }
              }}
            />
          </BrowserMockup>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {coreItems.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                O que você ganha na prática
              </h2>
              <p className="text-muted-foreground mb-6">
                Uma operação de SEO mais previsível, orientada por sinais reais e contexto histórico.
              </p>
              <div className="space-y-3">
                {outcomes.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span className="text-sm text-foreground/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-orange-500/5 p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Ciclo de monitoramento</span>
              </div>
              <div className="space-y-3">
                {[
                  "1. Enfileira job por projeto",
                  "2. Processa PageSpeed + SERP + Inteligência",
                  "3. Compara com snapshot anterior",
                  "4. Atualiza timeline e snapshots",
                ].map((step) => (
                  <div key={step} className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground/90">
                    {step}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                Suporte a execução manual, agendada e webhook.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Pronto para monitorar SEO de forma estratégica?
          </h2>
          <p className="text-muted-foreground mb-8">
            Ative o monitoramento inteligente e transforme snapshots em decisões.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Criar Conta
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Comparar Planos
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
