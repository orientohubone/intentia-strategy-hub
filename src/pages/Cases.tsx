import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Search,
  BarChart3,
  Brain,
  Layers,
  AlertTriangle,
  Zap,
  Globe,
  Target,
  LineChart,
  ShieldCheck,
  Database,
} from "lucide-react";

const useCases = [
  {
    id: 1,
    icon: Search,
    color: "from-primary to-orange-500",
    iconBg: "bg-primary/10 text-primary",
    image: "/Diagnostico-url.png",
    title: "Diagnóstico de URL antes de investir",
    persona: "Gestor de Marketing B2B",
    scenario: "Antes de alocar budget em mídia paga, o gestor precisa entender se o site da empresa está preparado para receber tráfego qualificado.",
    howItWorks: [
      "Cadastra a URL principal do projeto na plataforma",
      "A análise heurística avalia proposta de valor, clareza, SEO, conversão e conteúdo",
      "Recebe scores objetivos de 0 a 100 em cada dimensão",
      "Identifica pontos críticos a corrigir antes de investir em ads",
    ],
    outcome: "Evita desperdício de budget em tráfego pago para páginas que não convertem.",
  },
  {
    id: 2,
    icon: BarChart3,
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10 text-blue-600",
    image: "/benchmark.png",
    title: "Benchmark competitivo automatizado",
    persona: "Analista de Estratégia Digital",
    scenario: "O analista precisa comparar o posicionamento digital da empresa com os principais concorrentes do nicho.",
    howItWorks: [
      "Adiciona URLs de concorrentes ao projeto",
      "A plataforma gera análise SWOT comparativa",
      "Identifica gaps de posicionamento e oportunidades",
      "Visualiza scores lado a lado com concorrentes",
    ],
    outcome: "Decisões de posicionamento baseadas em dados reais, não em percepção.",
  },
  {
    id: 3,
    icon: Brain,
    color: "from-purple-500 to-violet-500",
    iconBg: "bg-purple-500/10 text-purple-600",
    image: "/analise-ia.png",
    title: "Análise aprofundada com IA",
    persona: "Diretor de Marketing",
    scenario: "Após o diagnóstico heurístico, o diretor quer uma análise mais profunda usando inteligência artificial para embasar decisões estratégicas.",
    howItWorks: [
      "Configura sua API key (Gemini ou Claude) nas configurações",
      "Solicita análise por IA sobre os dados heurísticos coletados",
      "Recebe insights aprofundados sobre prontidão para investimento",
      "Obtém recomendações específicas por canal de mídia",
    ],
    outcome: "Insights estratégicos de nível consultoria, gerados em minutos.",
  },
  {
    id: 4,
    icon: Layers,
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-500/10 text-green-600",
    image: "/score-canal.png",
    title: "Score por canal de mídia",
    persona: "Gestor de Tráfego Pago",
    scenario: "O gestor precisa decidir em qual canal investir primeiro: Google, Meta, LinkedIn ou TikTok.",
    howItWorks: [
      "A plataforma avalia a compatibilidade do projeto com cada canal",
      "Gera scores individuais com objetivos e riscos por canal",
      "Identifica alertas estratégicos sobre investimentos prematuros",
      "Prioriza canais com maior potencial de retorno",
    ],
    outcome: "Alocação de budget orientada por dados, canal por canal.",
  },
  {
    id: 5,
    icon: AlertTriangle,
    color: "from-amber-500 to-yellow-500",
    iconBg: "bg-amber-500/10 text-amber-600",
    image: "/alertas-estrategicos.png",
    title: "Alertas de investimento prematuro",
    persona: "CEO / Fundador",
    scenario: "O fundador está pressionado para investir em ads, mas não sabe se a empresa está realmente pronta.",
    howItWorks: [
      "O sistema analisa a maturidade digital do projeto",
      "Detecta automaticamente riscos de investimento prematuro",
      "Gera alertas visuais com explicações claras",
      "Sugere ações corretivas antes de alocar budget",
    ],
    outcome: "Proteção contra desperdício de budget em momentos inadequados.",
  },
  {
    id: 6,
    icon: Zap,
    color: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-500/10 text-rose-600",
    image: "/insights-acionaveis.png",
    title: "Insights estratégicos por projeto",
    persona: "Equipe de Marketing",
    scenario: "A equipe precisa de uma visão consolidada dos insights gerados para cada projeto, organizados por prioridade.",
    howItWorks: [
      "Insights são gerados automaticamente após cada análise",
      "Agrupados por projeto em cards visuais intuitivos",
      "Classificados por tipo: alerta, oportunidade ou melhoria",
      "Acessíveis em dialog com visualização detalhada",
    ],
    outcome: "Visão clara e acionável do que fazer em cada projeto.",
  },
  {
    id: 7,
    icon: Database,
    color: "from-teal-500 to-cyan-500",
    iconBg: "bg-teal-500/10 text-teal-600",
    image: "/dados-estruturados.png",
    title: "Análise de dados estruturados vs concorrentes",
    persona: "Especialista em SEO / Growth",
    scenario: "O especialista precisa auditar os dados estruturados (JSON-LD, Open Graph, Twitter Card) do site e comparar com concorrentes para identificar gaps de visibilidade.",
    howItWorks: [
      "A análise heurística extrai automaticamente JSON-LD, Open Graph, Twitter Card e Microdata",
      "Os mesmos dados são extraídos de cada URL de concorrente cadastrada",
      "O visualizador unificado mostra abas: seu site + cada concorrente",
      "Compare quem tem schema.org mais completo, quais OG tags estão presentes e como cada site se apresenta",
    ],
    outcome: "Auditoria completa de dados estruturados com comparação competitiva em uma única tela.",
  },
];

const capabilities = [
  { icon: Globe, label: "Análise Heurística", desc: "Diagnóstico automático de URLs" },
  { icon: Brain, label: "IA Integrada", desc: "Gemini e Claude como copiloto" },
  { icon: Target, label: "Score por Canal", desc: "Google, Meta, LinkedIn, TikTok" },
  { icon: LineChart, label: "Benchmark", desc: "Comparação com concorrentes" },
  { icon: AlertTriangle, label: "Alertas", desc: "Proteção contra desperdício" },
  { icon: ShieldCheck, label: "Dados Seguros", desc: "RLS + criptografia" },
  { icon: Database, label: "Dados Estruturados", desc: "JSON-LD, OG, Twitter Card" },
];

export default function Cases() {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [lightbox, closeLightbox]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Cases de Uso" path="/cases" description="Veja como a Intentia ajuda empresas B2B: diagnóstico de URL, benchmark competitivo, análise por IA, scores por canal, alertas estratégicos e insights acionáveis." keywords="cases intentia, marketing B2B cases, análise estratégica exemplos" jsonLd={buildBreadcrumb([{ name: "Cases", path: "/cases" }])} />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Cases de <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Uso</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Conheça os cenários reais em que a Intentia ajuda empresas B2B a tomar decisões
            estratégicas de mídia com inteligência e dados.
          </p>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8">
            Capacidades da Plataforma
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {capabilities.map((cap) => (
              <div key={cap.label} className="text-center p-4 rounded-xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all">
                <cap.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">{cap.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">Cenários de Uso</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Cada case representa um cenário real de uso da plataforma, com persona, fluxo e resultado esperado.
          </p>
          <div className="space-y-12">
            {useCases.map((uc, index) => (
              <div
                key={uc.id}
                className={`grid lg:grid-cols-5 gap-8 items-start ${
                  index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                }`}
              >
                {/* Visual Card — Screenshot Showcase */}
                <div className={`lg:col-span-2 ${index % 2 === 1 ? "lg:col-start-4" : ""}`}>
                  <div className="relative rounded-2xl">
                    <div className="border-beam rounded-2xl" />
                    <div
                      className="relative rounded-2xl border border-border shadow-xl overflow-hidden bg-card cursor-zoom-in group/img"
                      onClick={() => setLightbox({ src: uc.image, alt: uc.title })}
                    >
                      <img
                        src={uc.image}
                        alt={uc.title}
                        className="w-full h-auto block transition-transform duration-500 ease-out group-hover/img:scale-105"
                        draggable={false}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                        <span className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm">
                          Clique para ampliar
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <div className={`w-7 h-7 rounded-lg ${uc.iconBg} flex items-center justify-center`}>
                        <uc.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{uc.persona}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`lg:col-span-3 ${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  <div className="space-y-5">
                    <div>
                      <span className="text-xs text-primary font-semibold uppercase tracking-wider">Case {uc.id}</span>
                      <h3 className="text-2xl font-bold text-foreground mt-1">{uc.title}</h3>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1.5">Cenário</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{uc.scenario}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Como funciona</h4>
                      <div className="space-y-2">
                        {uc.howItWorks.map((step, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-primary font-semibold">Resultado:</span> {uc.outcome}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para usar a Intentia no seu negócio?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece com um diagnóstico gratuito e descubra onde investir com inteligência.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Começar Análise Grátis
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Lightbox Fullscreen */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-200"
          onClick={closeLightbox}
        >
          <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center">
            <img
              src={lightbox.src}
              alt={lightbox.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              draggable={false}
            />
            <button
              onClick={closeLightbox}
              className="absolute -top-2 -right-2 sm:top-2 sm:right-2 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Fechar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <p className="absolute -bottom-8 left-0 right-0 text-center text-xs text-white/60">
              {lightbox.alt} — Pressione ESC ou clique para fechar
            </p>
          </div>
        </div>
      )}

      <Footer />
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
