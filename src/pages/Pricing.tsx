import { useState } from "react";
import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, X, Minus, ChevronDown, ChevronUp, Sparkles, Shield, Zap } from "lucide-react";

/* ─── Plan data (synthesized) ─── */
const plans = [
  {
    key: "starter",
    name: "Starter",
    badge: null,
    icon: <Zap className="h-5 w-5" />,
    priceLabel: "Grátis",
    subtitle: "Para sempre",
    description: "Valide sua estratégia antes de investir",
    highlights: [
      "5 projetos ativos",
      "Diagnóstico heurístico (6 dimensões)",
      "Score por canal de mídia",
      "Insights automáticos",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    key: "professional",
    name: "Professional",
    badge: "Mais Popular",
    icon: <Sparkles className="h-5 w-5" />,
    price: 97,
    priceLabel: null,
    subtitle: null,
    description: "Estratégia de mídia com IA e benchmark",
    highlights: [
      "Projetos ilimitados",
      "Análise por IA (Gemini + Claude)",
      "Benchmark competitivo com SWOT",
      "Plano Tático por canal",
    ],
    cta: "Assinar Agora",
    popular: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    badge: null,
    icon: <Shield className="h-5 w-5" />,
    priceLabel: "Sob medida",
    subtitle: "Fale conosco",
    description: "Para operações de marketing complexas",
    highlights: [
      "Tudo do Professional",
      "API access + integrações",
      "Múltiplos usuários",
      "Consultoria estratégica",
    ],
    cta: "Falar com Consultor",
    popular: false,
  },
];

/* ─── Feature comparison table ─── */
type FeatureValue = boolean | string;

interface FeatureCategory {
  category: string;
  features: {
    name: string;
    starter: FeatureValue;
    professional: FeatureValue;
    enterprise: FeatureValue;
  }[];
}

const featureComparison: FeatureCategory[] = [
  {
    category: "Diagnóstico e Análise",
    features: [
      { name: "Diagnóstico heurístico de URL", starter: true, professional: true, enterprise: true },
      { name: "Dimensões analisadas", starter: "6", professional: "6", enterprise: "6" },
      { name: "Score por canal (Google, Meta, LinkedIn, TikTok)", starter: true, professional: true, enterprise: true },
      { name: "Insights automáticos por projeto", starter: true, professional: true, enterprise: true },
      { name: "Alertas de investimento prematuro", starter: true, professional: true, enterprise: true },
      { name: "Análise por IA (Gemini / Claude)", starter: false, professional: true, enterprise: true },
      { name: "Riscos e recomendações por canal", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    category: "Estratégia e Planejamento",
    features: [
      { name: "Benchmark competitivo (SWOT)", starter: "5", professional: "Ilimitados", enterprise: "Ilimitados" },
      { name: "Gap analysis", starter: false, professional: true, enterprise: true },
      { name: "Plano Tático por canal", starter: false, professional: true, enterprise: true },
      { name: "Copy frameworks e segmentação", starter: false, professional: true, enterprise: true },
      { name: "Alertas estratégicos consolidados", starter: false, professional: true, enterprise: true },
      { name: "Consultoria estratégica mensal", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: "Projetos e Públicos",
    features: [
      { name: "Projetos ativos", starter: "5", professional: "Ilimitados", enterprise: "Ilimitados" },
      { name: "Públicos-alvo por projeto", starter: "5", professional: "Ilimitados", enterprise: "Ilimitados" },
      { name: "Keywords por público", starter: true, professional: true, enterprise: true },
      { name: "URLs de concorrentes", starter: true, professional: true, enterprise: true },
    ],
  },
  {
    category: "Exportação e Integrações",
    features: [
      { name: "Exportação PDF", starter: false, professional: true, enterprise: true },
      { name: "Exportação CSV", starter: false, professional: true, enterprise: true },
      { name: "API access", starter: false, professional: false, enterprise: true },
      { name: "Integrações customizadas", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: "Plataforma e Suporte",
    features: [
      { name: "Dark / Light mode", starter: true, professional: true, enterprise: true },
      { name: "Notificações em tempo real", starter: false, professional: true, enterprise: true },
      { name: "Múltiplos usuários por conta", starter: false, professional: false, enterprise: true },
      { name: "Onboarding e treinamento", starter: false, professional: false, enterprise: true },
      { name: "Suporte", starter: "Email", professional: "Prioritário", enterprise: "24/7 dedicado" },
      { name: "SLA dedicado", starter: false, professional: false, enterprise: true },
    ],
  },
];

/* ─── Helper to render cell value ─── */
function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="h-5 w-5 text-primary mx-auto" />;
  if (value === false) return <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />;
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

export default function Pricing() {
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(featureComparison.map((c) => [c.category, true]))
  );

  const toggleCategory = (cat: string) =>
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleCta = (key: string) => {
    if (key === "enterprise") navigate("/contato");
    else if (key === "professional") navigate("/assinar");
    else navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Preços"
        path="/precos"
        description="Planos Starter (grátis), Professional (R$97/mês) e Enterprise para análise estratégica de marketing B2B com IA, benchmark e plano tático."
        keywords="preços intentia, planos marketing B2B, análise estratégica preço, ferramenta mídia paga"
        jsonLd={[
          buildBreadcrumb([{ name: "Preços", path: "/precos" }]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Posso mudar de plano a qualquer momento?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As alterações são refletidas na próxima cobrança.",
                },
              },
              {
                "@type": "Question",
                name: "O plano grátis tem limite de tempo?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Não. O plano Starter é gratuito para sempre, com até 5 projetos ativos. Ideal para validar a plataforma antes de investir.",
                },
              },
              {
                "@type": "Question",
                name: "Preciso de API key para usar a análise por IA?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Sim. No plano Professional, você configura sua própria API key do Google Gemini ou Anthropic Claude nas configurações. Assim, você tem controle total sobre custos e modelos.",
                },
              },
              {
                "@type": "Question",
                name: "O que é o Plano Tático?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "É um módulo exclusivo do Professional que permite estruturar campanhas canal por canal — tipo de campanha, etapa do funil, lances, extensões, copy frameworks, segmentação e testes A/B.",
                },
              },
              {
                "@type": "Question",
                name: "Qual forma de pagamento aceitam?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Aceitamos cartão de crédito, boleto bancário e PIX para planos Professional. Enterprise tem condições especiais.",
                },
              },
            ],
          },
        ]}
      />
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Escolha seu plano de{" "}
            <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              estratégia
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Comece grátis e evolua conforme sua necessidade. Sem surpresas.
          </p>
        </div>
      </section>

      {/* ─── Pricing Cards (synthesized) ─── */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border transition-all duration-300 ${
                  plan.popular
                    ? "border-primary shadow-2xl shadow-primary/10 md:scale-105 bg-card"
                    : "border-border bg-card hover:border-primary/30 hover:shadow-lg"
                } p-7`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg ${plan.popular ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {plan.icon}
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>

                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.priceLabel || `R$ ${plan.price}`}
                    </span>
                    {!plan.priceLabel && (
                      <span className="text-muted-foreground text-sm">/mês</span>
                    )}
                  </div>
                  {plan.priceLabel && plan.subtitle && (
                    <span className="text-sm text-muted-foreground">{plan.subtitle}</span>
                  )}
                  <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>
                </div>

                {/* Highlights */}
                <div className="space-y-3 mb-7 flex-1">
                  {plan.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{h}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  className="w-full"
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  onClick={() => handleCta(plan.key)}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Comparison Table ─── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Compare todos os recursos
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Veja em detalhes o que cada plano oferece para tomar a melhor decisão.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-0 border-b border-border bg-muted/50">
              <div className="p-4 lg:p-5">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Recurso
                </span>
              </div>
              {plans.map((plan) => (
                <div key={plan.key} className="p-4 lg:p-5 text-center">
                  <span className={`text-sm font-bold ${plan.popular ? "text-primary" : "text-foreground"}`}>
                    {plan.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Categories */}
            {featureComparison.map((cat) => (
              <div key={cat.category}>
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className="w-full grid grid-cols-4 gap-0 border-b border-border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <div className="col-span-4 p-4 lg:px-5 flex items-center gap-2">
                    {expandedCategories[cat.category] ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-semibold text-foreground">{cat.category}</span>
                  </div>
                </button>

                {/* Feature rows */}
                {expandedCategories[cat.category] &&
                  cat.features.map((feature, idx) => (
                    <div
                      key={feature.name}
                      className={`grid grid-cols-4 gap-0 border-b border-border/50 ${
                        idx % 2 === 0 ? "" : "bg-muted/10"
                      } hover:bg-muted/20 transition-colors`}
                    >
                      <div className="p-3.5 lg:px-5 flex items-center">
                        <span className="text-sm text-foreground">{feature.name}</span>
                      </div>
                      <div className="p-3.5 flex items-center justify-center">
                        <FeatureCell value={feature.starter} />
                      </div>
                      <div className="p-3.5 flex items-center justify-center">
                        <FeatureCell value={feature.professional} />
                      </div>
                      <div className="p-3.5 flex items-center justify-center">
                        <FeatureCell value={feature.enterprise} />
                      </div>
                    </div>
                  ))}
              </div>
            ))}

            {/* Table footer CTAs */}
            <div className="grid grid-cols-4 gap-0 bg-muted/30">
              <div className="p-5" />
              {plans.map((plan) => (
                <div key={plan.key} className="p-4 lg:p-5 flex justify-center">
                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    size="sm"
                    onClick={() => handleCta(plan.key)}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Posso mudar de plano a qualquer momento?",
                a: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento. As alterações são refletidas na próxima cobrança.",
              },
              {
                q: "O plano grátis tem limite de tempo?",
                a: "Não. O plano Starter é gratuito para sempre, com até 5 projetos ativos. Ideal para validar a plataforma antes de investir.",
              },
              {
                q: "Preciso de API key para usar a análise por IA?",
                a: "Sim. No plano Professional, você configura sua própria API key do Google Gemini ou Anthropic Claude nas configurações. Controle total sobre custos e modelos.",
              },
              {
                q: "O que é o Plano Tático?",
                a: "Módulo exclusivo do Professional para estruturar campanhas canal por canal — tipo de campanha, etapa do funil, lances, copy frameworks, segmentação e testes A/B.",
              },
              {
                q: "Qual forma de pagamento aceitam?",
                a: "Cartão de crédito, boleto bancário e PIX para planos Professional. Enterprise tem condições especiais.",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group bg-card rounded-xl border border-border overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-muted/30 transition-colors">
                  <span className="font-semibold text-foreground pr-4">{faq.q}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 pt-0">
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para tomar decisões mais inteligentes?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece grátis e veja como a Intentia pode transformar sua estratégia de mídia paga.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate("/auth")}>
            Começar Análise Grátis
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Back to Top Button */}
      <BackToTop />
      {/* Back to Home Button */}
      <BackToHomeButton />
    </div>
  );
}
