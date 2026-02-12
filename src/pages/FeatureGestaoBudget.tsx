import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Play,
  TrendingUp,
  Zap,
  AlertTriangle,
  RefreshCw,
  Calendar,
  Target,
  PieChart,
} from "lucide-react";

const pacingStatuses = [
  { label: "Saudável", desc: "< 80% do budget gasto", color: "border-green-500/30 bg-green-500/5 text-green-600" },
  { label: "Atenção", desc: "80-95% do budget gasto", color: "border-amber-500/30 bg-amber-500/5 text-amber-600" },
  { label: "Perigo", desc: "95-100% do budget gasto", color: "border-red-500/30 bg-red-500/5 text-red-600" },
  { label: "Estourado", desc: "> 100% do budget gasto", color: "border-red-500/30 bg-red-500/10 text-red-700" },
];

const features = [
  { icon: DollarSign, title: "Alocação por Canal", desc: "Defina budget mensal por canal (Google, Meta, LinkedIn, TikTok) com formulário de upsert inteligente." },
  { icon: BarChart3, title: "Barras de Pacing", desc: "Visualize o progresso de gasto vs planejado com barras coloridas por status e marcador de pacing esperado." },
  { icon: TrendingUp, title: "Projeções de Gasto", desc: "Projeção automática de gasto até o final do mês baseada no ritmo diário atual. Alerta se ultrapassar o budget." },
  { icon: RefreshCw, title: "Sincronização Real", desc: "Botão 'Sincronizar' atualiza gastos com métricas reais das campanhas usando GREATEST(cost, google_ads_cost)." },
  { icon: Calendar, title: "Histórico Mensal", desc: "Cards de meses anteriores colapsáveis com breakdown por canal e opção de exclusão individual." },
  { icon: AlertTriangle, title: "Alertas de Estouro", desc: "Alertas visuais quando a projeção de gasto ultrapassa o budget planejado para o mês." },
];

const benefits = [
  "Budget alocado por canal e projeto — visão granular",
  "Pacing visual com cores por status de gasto",
  "Projeção de gasto baseada no ritmo diário real",
  "Sincronização com métricas reais das campanhas",
  "Marcador de pacing esperado para o dia do mês",
  "Alertas automáticos de estouro de budget",
  "Histórico mensal com breakdown por canal",
  "Integrado com cards de Budget Total e Investido",
];

export default function FeatureGestaoBudget() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Gestão de Budget com Pacing"
        path="/gestao-budget"
        description="Aloque budget mensal por canal e projeto. Acompanhe pacing em tempo real, projeções de gasto e alertas automáticos de estouro."
        keywords="gestão budget, pacing budget, projeção gasto, alocação budget, marketing B2B, controle financeiro campanhas"
        jsonLd={buildBreadcrumb([{ name: "Gestão de Budget", path: "/gestao-budget" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <DollarSign className="h-4 w-4" />
            Gestão de Budget
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Controle total do seu
            <br />
            <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              investimento em mídia
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Aloque budget mensal por canal e projeto,
            <br className="hidden sm:block" />
            acompanhe pacing em tempo real, receba projeções de gasto
            <br className="hidden sm:block" />
            e alertas automáticos antes de estourar o budget.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Controlar Budget
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Pacing Statuses */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-wider font-medium">Status de Pacing</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {pacingStatuses.map((status, i) => (
              <div key={i} className={`rounded-xl border ${status.color} p-3 text-center`}>
                <p className="text-sm font-bold">{status.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{status.desc}</p>
              </div>
            ))}
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
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para manter o controle financeiro das suas campanhas.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                <Zap className="h-3.5 w-3.5" />
                Controle Financeiro
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Nunca mais estoure o budget
              </h2>
              <p className="text-muted-foreground mb-6">
                Acompanhe em tempo real quanto já foi gasto, quanto falta e se o ritmo atual vai estourar o planejado.
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
            <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Fluxo de Budget</p>
                  <p className="text-xs text-muted-foreground">Alocação → Pacing → Projeção → Alerta</p>
                </div>
              </div>
              {[
                { step: "1", text: "Aloque budget por canal e mês", icon: DollarSign },
                { step: "2", text: "Registre métricas nas campanhas", icon: BarChart3 },
                { step: "3", text: "Clique em Sincronizar", icon: RefreshCw },
                { step: "4", text: "Acompanhe pacing e projeções", icon: TrendingUp },
                { step: "5", text: "Receba alertas de estouro", icon: AlertTriangle },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground">{item.text}</p>
                    <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent border border-primary/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Controle seu investimento em mídia
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Aloque budget, acompanhe pacing e receba alertas antes de estourar o planejado.
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
