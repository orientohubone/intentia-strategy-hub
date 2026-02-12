import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Megaphone,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  GitCompareArrows,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

const statusFlow = [
  { label: "Rascunho", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
  { label: "Ativa", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { label: "Pausada", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { label: "Concluída", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { label: "Arquivada", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
];

const features = [
  { icon: Megaphone, title: "CRUD de Campanhas", desc: "Crie, edite e gerencie campanhas por projeto e canal com nome, objetivo, budget, datas e status." },
  { icon: BarChart3, title: "Métricas de Performance", desc: "Registre impressões, cliques, conversões, custo, receita e métricas específicas por canal (Quality Score, Alcance, CPL)." },
  { icon: TrendingUp, title: "KPIs Automáticos", desc: "Cards de KPIs calculados automaticamente: CTR, CPC, CPA, ROAS e métricas Google B2B (CAC, LTV, ROI)." },
  { icon: Sparkles, title: "Análise por IA", desc: "Análise de performance com Gemini ou Claude: saúde geral, KPIs vs benchmark, funil, riscos e plano de ação." },
  { icon: GitCompareArrows, title: "Tático vs Real", desc: "Cruzamento automático do plano tático com métricas reais: aderência estrutural + gap de métricas por canal." },
  { icon: AlertTriangle, title: "Alertas Automáticos", desc: "11 regras de alerta: budget estourado, CTR baixo, CPC alto, sem conversões, ROAS negativo e mais." },
];

const channels = [
  { name: "Google Ads", letter: "G", color: "bg-blue-500/10 border-blue-500/20", metrics: "19 métricas (funil B2B completo)" },
  { name: "Meta Ads", letter: "M", color: "bg-indigo-500/10 border-indigo-500/20", metrics: "Alcance, Frequência + comuns" },
  { name: "LinkedIn Ads", letter: "L", color: "bg-sky-500/10 border-sky-500/20", metrics: "Leads, CPL, Engagement Rate" },
  { name: "TikTok Ads", letter: "T", color: "bg-pink-500/10 border-pink-500/20", metrics: "Video Views, VTR + comuns" },
];

const benefits = [
  "Campanhas agrupadas por projeto com expand/collapse",
  "Fluxo de status visual: Rascunho → Ativa → Pausada → Concluída → Arquivada",
  "Métricas por período com funil B2B completo para Google",
  "KPIs calculados automaticamente sem planilhas",
  "Análise de performance por IA com plano de ação",
  "Comparativo tático vs real com score de aderência",
  "11 regras de alerta automático por severidade",
  "Cards de campanhas recentes no Dashboard",
];

export default function FeatureGestaoCampanhas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Gestão de Campanhas e Métricas"
        path="/gestao-campanhas"
        description="Crie e monitore campanhas reais por canal com métricas de performance, KPIs automáticos, análise por IA e comparativo tático vs real."
        keywords="gestão campanhas, métricas performance, KPIs marketing, Google Ads, Meta Ads, LinkedIn Ads, análise IA"
        jsonLd={buildBreadcrumb([{ name: "Gestão de Campanhas", path: "/gestao-campanhas" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm font-medium mb-6">
            <Megaphone className="h-4 w-4" />
            Operações
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Gerencie campanhas
            <br />
            com{" "}
            <span className="text-gradient bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
              inteligência de dados
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Crie campanhas reais, registre métricas por período,
            <br className="hidden sm:block" />
            acompanhe KPIs automáticos e receba análises de performance
            <br className="hidden sm:block" />
            por IA — tudo conectado ao plano tático.
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

      {/* Status Flow */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-wider font-medium">Fluxo de Status</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {statusFlow.map((status, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge className={`${status.color} border text-xs`}>{status.label}</Badge>
                {i < statusFlow.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground hidden sm:block" />}
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
              Tudo em um só lugar
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Da criação da campanha à análise de performance por IA — sem sair da plataforma.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-orange-500/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 Channels */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Métricas Específicas por Canal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada canal tem métricas dedicadas além das comuns (impressões, cliques, conversões, custo, receita, ROAS).
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {channels.map((ch, i) => (
              <div key={i} className={`rounded-2xl border ${ch.color} p-6 flex items-start gap-4`}>
                <div className={`h-12 w-12 rounded-xl ${ch.color} flex items-center justify-center shrink-0`}>
                  <span className="text-lg font-bold">{ch.letter}</span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{ch.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{ch.metrics}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-xs font-medium mb-4">
                <Zap className="h-3.5 w-3.5" />
                Operações Inteligentes
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Dados conectados, decisões melhores
              </h2>
              <p className="text-muted-foreground mb-6">
                Campanhas conectadas ao plano tático, métricas alimentando alertas automáticos e IA analisando performance.
              </p>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border overflow-hidden shadow-lg">
              <img src="/gestao-campanhas.png" alt="Gestão de Campanhas e Métricas" className="w-full h-auto" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border border-orange-500/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Gerencie suas campanhas com inteligência
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Crie campanhas, registre métricas e receba análises de performance por IA.
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
