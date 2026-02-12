import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wrench,
  Play,
  Zap,
  Eye,
  FolderOpen,
  Bell,
} from "lucide-react";

const insightTypes = [
  { icon: AlertTriangle, label: "Alertas", desc: "Riscos e problemas que precisam de atenção imediata antes de investir em mídia.", color: "border-red-500/30 bg-red-500/5 text-red-600" },
  { icon: Lightbulb, label: "Oportunidades", desc: "Potenciais de crescimento e diferenciação que você pode explorar no mercado.", color: "border-amber-500/30 bg-amber-500/5 text-amber-600" },
  { icon: Wrench, label: "Melhorias", desc: "Ações práticas e sugeridas para otimizar resultados e aumentar a prontidão.", color: "border-blue-500/30 bg-blue-500/5 text-blue-600" },
];

const features = [
  { icon: FolderOpen, title: "Agrupados por Projeto", desc: "Insights organizados por projeto para facilitar a navegação. Cada grupo mostra nome, quantidade e cards individuais." },
  { icon: Eye, title: "Dialog de Detalhes", desc: "Clique em qualquer insight para abrir detalhes completos com descrição expandida e ação recomendada." },
  { icon: Bell, title: "Alertas Estratégicos", desc: "Avisos sobre investimentos prematuros ou arriscados em mídia baseados na análise da URL." },
  { icon: Zap, title: "Geração Automática", desc: "Insights gerados automaticamente após cada análise heurística — sem esforço manual." },
  { icon: Shield, title: "Ações Recomendadas", desc: "Cada insight inclui uma ação prática e específica para resolver o problema ou aproveitar a oportunidade." },
  { icon: Lightbulb, title: "Fullscreen", desc: "Visualize insights em tela cheia para melhor leitura e apresentação ao time." },
];

const benefits = [
  "Insights gerados automaticamente após cada análise",
  "3 categorias claras: alertas, oportunidades e melhorias",
  "Agrupamento visual por projeto",
  "Ações recomendadas para cada insight",
  "Dialog de detalhes com fullscreen",
  "Alertas estratégicos sobre investimentos arriscados",
  "Integrado com diagnóstico heurístico e IA",
  "Histórico completo de insights por projeto",
];

export default function FeatureInsights() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Alertas e Insights Estratégicos"
        path="/alertas-insights"
        description="Insights automáticos agrupados por projeto: alertas de risco, oportunidades de mercado e melhorias sugeridas com ações práticas."
        keywords="insights estratégicos, alertas marketing, oportunidades mercado, melhorias sugeridas, marketing B2B"
        jsonLd={buildBreadcrumb([{ name: "Alertas e Insights", path: "/alertas-insights" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-medium mb-6">
            <Shield className="h-4 w-4" />
            Insights Estratégicos
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Alertas e oportunidades
            <br />
            <span className="text-gradient bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
              antes de investir
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Receba automaticamente alertas de risco,
            <br className="hidden sm:block" />
            oportunidades de mercado e melhorias sugeridas
            <br className="hidden sm:block" />
            com ações práticas — tudo agrupado por projeto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Ver Meus Insights
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* 3 Types */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              3 Tipos de Insights
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada insight é categorizado para facilitar a priorização e tomada de decisão.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {insightTypes.map((type, i) => {
              const Icon = type.icon;
              return (
                <div key={i} className={`rounded-2xl border ${type.color} p-6 text-center`}>
                  <Icon className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Funcionalidades
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-amber-500/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-amber-600" />
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
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Decisões informadas, riscos minimizados
              </h2>
              <p className="text-muted-foreground mb-6">
                Não invista em mídia sem antes entender os riscos e oportunidades do seu posicionamento digital.
              </p>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
              <img src="/alertas-estrategicos.png" alt="Alertas e Insights Estratégicos" className="w-full h-auto" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Receba insights antes de investir
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Crie seu projeto, analise sua URL e receba automaticamente alertas, oportunidades e melhorias.
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
