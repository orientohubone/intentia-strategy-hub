import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { ComparisonTable } from "@/components/ComparisonTable";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Target,
  Settings,
  Zap,
  UserX,
  FileWarning,
  ArrowDown,
  BrainCircuit,
  Building2,
  BarChart3,
  Users,
  Rocket,
  MonitorOff,
  MousePointerClick,
  Compass,
  Layers,
  Radio,
  Sparkles,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

/* ─── Hero: Energized Flow ─── */

const heroLayers = [
  { icon: Brain, label: "Estratégica", sub: "Direção" },
  { icon: Target, label: "Tática", sub: "Orquestração" },
  { icon: Settings, label: "Operacional", sub: "Execução" },
];
const heroFinal = { icon: Zap, label: "Intentia em ação", sub: "Resultado" };

const cardDelay = (i: number) => 1.0 + i * 1.2;
const lineDelay = (i: number) => 1.4 + i * 1.2;

function CardItem({ item, delay, isFinal = false }: { item: { icon: React.ElementType; label: string; sub: string }; delay: number; isFinal?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0.15, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
      className={`relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border min-w-[180px] ${
        isFinal ? "bg-foreground text-background border-foreground" : "bg-card border-border/60"
      }`}
    >
      {isFinal ? (
        <span className="text-2xl font-extrabold tracking-tight text-background">intentia<span className="text-primary">.</span></span>
      ) : (
        <motion.div
          initial={{ boxShadow: "0 0 0 0 transparent" }}
          animate={{ boxShadow: "0 0 14px 3px hsl(24 95% 53% / 0.3)" }}
          transition={{ duration: 0.5, delay: delay + 0.3 }}
          className="w-14 h-14 rounded-xl flex items-center justify-center bg-primary/10 text-primary"
        >
          <item.icon size={28} />
        </motion.div>
      )}
      <div className="text-center">
        <p className={`${isFinal ? "text-xs font-medium text-background" : "font-semibold text-foreground"}`}>{item.label}</p>
        <p className={`text-sm ${isFinal ? "text-background/70" : "text-muted-foreground"}`}>{item.sub}</p>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay }}
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          boxShadow: isFinal
            ? "inset 0 0 0 2px hsl(0 0% 20% / 0.7), 0 0 20px 4px hsl(0 0% 0% / 0.2)"
            : "inset 0 0 0 1.5px hsl(24 95% 53% / 0.4)",
        }}
      />
    </motion.div>
  );
}

function EnergyLine({ delay, vertical = false }: { delay: number; vertical?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${vertical ? "py-1" : "px-1"}`}>
      <div className={`overflow-hidden ${vertical ? "w-[3px] h-14" : "h-[3px] w-20 hidden md:block"}`} style={{ borderRadius: 4 }}>
        <motion.div
          initial={vertical ? { scaleY: 0 } : { scaleX: 0 }}
          animate={vertical ? { scaleY: 1 } : { scaleX: 1 }}
          transition={{ duration: 0.5, delay, ease: "easeOut" }}
          className="w-full h-full rounded-full"
          style={{ transformOrigin: vertical ? "top" : "left", background: "hsl(24 95% 53% / 0.7)", boxShadow: "0 0 8px hsl(24 95% 53% / 0.5)" }}
        />
      </div>
    </div>
  );
}

/* ─── Solution layers ─── */

const solutionLayers = [
  {
    icon: Brain,
    title: "Camada Estratégica",
    subtitle: "Direção",
    description: "Interpreta sinais de mercado, performance e objetivo de negócio. Responde: Estamos indo na direção certa? Onde existe risco? O que precisa mudar agora?",
  },
  {
    icon: Target,
    title: "Camada Tática",
    subtitle: "Orquestração",
    description: "Transforma direção em ação: prioriza iniciativas, redistribui recursos, ajusta canais, foco e esforço. Estratégia vira plano ativo.",
  },
  {
    icon: Settings,
    title: "Camada Operacional",
    subtitle: "Execução",
    description: "Execução automática ou semi-automática, com ajustes contínuos, aprendendo a cada ciclo. A interface só aparece quando há exceção.",
  },
];

/* ─── Audience ─── */

const audiences = [
  { icon: Building2, label: "Empresas B2B em crescimento" },
  { icon: BarChart3, label: "Times de marketing, RevOps e liderança" },
  { icon: Rocket, label: "Negócios que precisam decidir rápido" },
  { icon: Users, label: "Organizações que querem execução conectada à estratégia" },
];

/* ─── Zero UI features ─── */

const zeroUiFeatures = [
  { icon: MonitorOff, label: "Menos dashboards" },
  { icon: MousePointerClick, label: "Menos decisões manuais" },
  { icon: Zap, label: "Menos fricção operacional" },
];

/* ═══════════════════════════════════════════════════════════ */

export default function Comparar() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Comparar — Intentia vs Estrategistas vs Consultorias"
        path="/comparar"
        description="Veja por que a Intentia substitui estrategistas e consultorias tradicionais. IA contínua, decisão em tempo real e execução automática por R$147/mês."
        keywords="intentia comparativo, estrategista vs IA, consultoria marketing B2B, plataforma decisão estratégica, IA marketing"
        jsonLd={[buildBreadcrumb([{ name: "Comparar", path: "/comparar" }])]}
      />
      <Header />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <p className="text-sm font-medium text-primary uppercase tracking-widest mb-6">A nova forma de pensar estratégia</p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
                <span className="text-foreground">Estratégia que </span>
                <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">decide.</span>
                <br />
                <span className="text-foreground">Execução que </span>
                <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">acontece.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                O problema não é falta de dados. É a distância entre análise, decisão e execução. A Intentia nasce para resolver esse gap.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Button variant="hero" size="xl" onClick={() => { const el = document.getElementById("solucao"); el?.scrollIntoView({ behavior: "smooth" }); }}>
                Saiba por que a Intentia é diferente
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Energized Flow */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}>
              <div className="hidden md:flex items-center justify-center">
                {heroLayers.map((item, i) => (
                  <div key={item.label} className="flex items-center">
                    <CardItem item={item} delay={cardDelay(i)} />
                    <EnergyLine delay={lineDelay(i)} />
                  </div>
                ))}
                <CardItem item={heroFinal} delay={cardDelay(3)} isFinal />
              </div>
              <div className="flex md:hidden flex-col items-center">
                {heroLayers.map((item, i) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <CardItem item={item} delay={cardDelay(i)} />
                    <EnergyLine delay={lineDelay(i)} vertical />
                  </div>
                ))}
                <CardItem item={heroFinal} delay={cardDelay(3)} isFinal />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── O Problema ─── */}
      <section id="problema" className="py-20 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">O problema</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              O modelo tradicional <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">não funciona</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            <AnimatedSection delay={0.1}>
              <div className="bg-card rounded-2xl p-8 border border-border/60 shadow-sm h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <UserX className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Estratégia humana não escala</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />Têm tempo limitado</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />Dependem de reuniões e contexto manual</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />Tomam decisões baseadas em recortes temporais</li>
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-card rounded-2xl p-8 border border-border/60 shadow-sm h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <FileWarning className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Consultorias param no diagnóstico</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />Operam em ciclos longos</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />Produzem materiais estáticos</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />Não acompanham a execução diária</li>
                </ul>
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection delay={0.3} className="text-center">
            <p className="text-xl md:text-2xl font-semibold text-foreground">
              "Boas análises, más decisões <span className="text-primary">no tempo errado.</span>"
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── A Solução ─── */}
      <section id="solucao" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">A solução</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              A Intentia <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">muda o modelo</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Plataforma de decisão contínua que conecta estratégia, tática e execução em um único fluxo — em tempo real.
            </p>
          </AnimatedSection>

          <div className="max-w-3xl mx-auto space-y-6">
            {solutionLayers.map((layer, i) => (
              <div key={layer.title}>
                <AnimatedSection delay={i * 0.15}>
                  <div className="bg-card rounded-2xl p-8 border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <layer.icon size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {layer.title} <span className="text-muted-foreground font-normal">— {layer.subtitle}</span>
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">{layer.description}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
                {i < solutionLayers.length - 1 && (
                  <div className="flex justify-center py-2">
                    <ArrowDown className="text-primary/30" size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IA Embarcada ─── */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl bg-gradient-to-br from-foreground to-foreground/90 p-10 md:p-16 text-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-primary blur-3xl" />
              </div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-8">
                  <BrainCircuit className="text-primary-foreground" size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-background mb-4">IA embarcada como sistema nervoso</h2>
                <p className="text-background/70 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                  Na Intentia, a IA não é um chat nem uma feature. Ela é camada de interpretação, motor de decisão e sistema nervoso da plataforma.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  {["Sempre ativa", "Sempre aprendendo", "Sempre conectando"].map((item) => (
                    <span key={item} className="px-5 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Onde Estamos Hoje ─── */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Transparência</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Onde estamos <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">hoje</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A Intentia já opera com IA embarcada como motor de análise e decisão. Mas nossa visão vai além — e queremos ser honestos sobre o caminho.
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <AnimatedSection delay={0.1}>
              <div className="bg-card rounded-2xl p-8 border border-border/60 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">O que já funciona</h3>
                    <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Disponível agora</span>
                  </div>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />Diagnóstico heurístico automático de URLs</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />Análise profunda por IA (Gemini + Claude)</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />Benchmark competitivo com SWOT automático</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />Score de prontidão por canal de mídia</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />Insights e alertas estratégicos gerados por IA</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />Gestão operacional de campanhas e budget</li>
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="bg-card rounded-2xl p-8 border border-primary/20 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Compass className="text-primary" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Para onde vamos</h3>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Visão de futuro</span>
                  </div>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />IA que age proativamente sem esperar comando</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />Decisões automatizadas com confirmação do usuário</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />Interface que desaparece — só aparece quando necessário</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />Redistribuição de budget em tempo real</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />Execução autônoma de campanhas cross-platform</li>
                  <li className="flex items-start gap-3"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />Aprendizado contínuo por projeto e nicho</li>
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ─── O Futuro é Zero UI ─── */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles size={16} />
              Visão de futuro
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              O futuro da Intentia é{" "}
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Zero UI</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Zero UI não é ausência de interface — é a interface que só aparece quando importa. A IA observa, interpreta e age. O usuário confirma quando necessário. Essa é a direção que estamos construindo.
            </p>
          </AnimatedSection>

          {/* Roadmap visual */}
          <div className="max-w-3xl mx-auto">
            {[
              {
                phase: "Fase 1",
                title: "IA como Analista",
                description: "Diagnóstico automático, scores, insights e alertas gerados por IA. O usuário interpreta e decide.",
                status: "done" as const,
                icon: Brain,
              },
              {
                phase: "Fase 2",
                title: "IA como Conselheira",
                description: "Recomendações acionáveis, plano tático por canal, sugestões de budget e priorização automática de ações.",
                status: "current" as const,
                icon: Layers,
              },
              {
                phase: "Fase 3",
                title: "IA como Operadora",
                description: "Execução semi-automática de campanhas, redistribuição de budget em tempo real, otimizações contínuas com aprovação do usuário.",
                status: "future" as const,
                icon: Radio,
              },
              {
                phase: "Fase 4",
                title: "Zero UI — IA como Sistema Nervoso",
                description: "A interface desaparece. A IA opera por intenção: observa padrões, toma decisões, executa e reporta. O usuário só intervém por exceção.",
                status: "future" as const,
                icon: Sparkles,
              },
            ].map((item, i, arr) => (
              <div key={item.phase}>
                <AnimatedSection delay={i * 0.15}>
                  <div className={`flex gap-5 ${item.status === "current" ? "relative" : ""}`}>
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        item.status === "done"
                          ? "bg-emerald-500/10"
                          : item.status === "current"
                          ? "bg-primary/10 ring-2 ring-primary/30"
                          : "bg-muted"
                      }`}>
                        {item.status === "done" ? (
                          <CheckCircle2 className="text-emerald-500" size={22} />
                        ) : item.status === "current" ? (
                          <item.icon className="text-primary" size={22} />
                        ) : (
                          <item.icon className="text-muted-foreground/50" size={22} />
                        )}
                      </div>
                      {i < arr.length - 1 && (
                        <div className={`w-0.5 flex-1 my-2 ${
                          item.status === "done" ? "bg-emerald-500/30" : "bg-border"
                        }`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-8 ${item.status === "future" ? "opacity-60" : ""}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          item.status === "done"
                            ? "text-emerald-600 bg-emerald-500/10"
                            : item.status === "current"
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground bg-muted"
                        }`}>
                          {item.phase}
                        </span>
                        {item.status === "done" && (
                          <span className="text-xs text-emerald-500 font-medium">Concluída</span>
                        )}
                        {item.status === "current" && (
                          <span className="text-xs text-primary font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Em construção
                          </span>
                        )}
                        {item.status === "future" && (
                          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Clock size={12} />
                            Planejada
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            ))}
          </div>

          {/* Zero UI promise */}
          <AnimatedSection delay={0.6} className="mt-12">
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-3xl bg-gradient-to-br from-foreground to-foreground/90 p-10 md:p-14 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-primary blur-3xl" />
                  <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-primary blur-3xl" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-background mb-4">
                    Zero UI não é promessa vazia.
                    <br />
                    <span className="text-primary">É o norte que guia cada decisão de produto.</span>
                  </h3>
                  <p className="text-background/70 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                    Cada feature que construímos hoje é um passo em direção a uma plataforma que opera por intenção. Menos cliques, menos dashboards, menos fricção — mais decisão, mais execução, mais resultado.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    {zeroUiFeatures.map((f) => (
                      <span key={f.label} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                        <f.icon size={16} />
                        {f.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Para Quem ─── */}
      <section id="para-quem" className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Para quem</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              A Intentia é feita para <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">quem executa</span>
            </h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
            {audiences.map((a, i) => (
              <AnimatedSection key={a.label} delay={i * 0.1}>
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <a.icon className="text-primary" size={24} />
                  </div>
                  <p className="font-medium text-foreground">{a.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={0.5} className="text-center">
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Se sua empresa depende de relatórios para decidir, a Intentia não é um complemento.{" "}
              <span className="font-semibold text-foreground">É uma evolução.</span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── Tabela Comparativa ─── */}
      <ComparisonTable />

      {/* ─── CTA Final ─── */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Estratégia deixa de ser um evento.
              <br />
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Passa a ser um sistema vivo.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Veja como a Intentia opera estratégia, tática e execução no seu negócio.
            </p>
            <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
              Começar agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
