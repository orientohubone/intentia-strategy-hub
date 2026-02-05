import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    description: "Perfeito para testar sua estratégia",
    features: [
      "1 análise de URL por mês",
      "Score básico por canal",
      "Relatório simples",
      "Suporte por email"
    ],
    notIncluded: [
      "Análise competitiva",
      "Alertas em tempo real",
      "API access"
    ],
    cta: "Começar Grátis",
    popular: false
  },
  {
    name: "Professional",
    price: "R$ 97/mês",
    description: "Para empresas que levam marketing a sério",
    features: [
      "Análises ilimitadas de URLs",
      "Score avançado por canal",
      "Benchmark competitivo",
      "Alertas estratégicos em tempo real",
      "Relatórios detalhados",
      "Suporte prioritário",
      "Exportação de dados"
    ],
    notIncluded: [
      "API access",
      "White label"
    ],
    cta: "Assinar Agora",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Personalizado",
    description: "Solução sob medida para grandes empresas",
    features: [
      "Tudo do Professional",
      "API access completo",
      "White label",
      "SLA dedicado",
      "Consultoria estratégica",
      "Integrações customizadas",
      "Treinamento da equipe"
    ],
    notIncluded: [],
    cta: "Falar com Consultor",
    popular: false
  }
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Escolha seu plano de <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">estratégia</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Planos flexíveis para empresas de todos os tamanhos. Comece grátis e evolua conforme sua necessidade.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border ${
                  plan.popular 
                    ? 'border-primary shadow-2xl scale-105' 
                    : 'border-border bg-card'
                } p-8`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.price !== "Grátis" && plan.price !== "Personalizado" && (
                      <span className="text-muted-foreground">/mês</span>
                    )}
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 opacity-50">
                      <div className="h-5 w-5 border-2 border-border rounded-full flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? "hero" : "outline"}
                  onClick={() => plan.name === "Enterprise" ? navigate('/#contact') : navigate('/auth')}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                Posso mudar de plano a qualquer momento?
              </h3>
              <p className="text-muted-foreground">
                Sim! Você pode upgrade ou downgrade seu plano a qualquer momento. As alterações serão refletidas na próxima cobrança.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                O plano grátis tem limite de tempo?
              </h3>
              <p className="text-muted-foreground">
                Não. O plano Starter é gratuito para sempre, perfeito para conhecer a plataforma e testar análises básicas.
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="font-semibold text-foreground mb-2">
                Qual forma de pagamento aceitam?
              </h3>
              <p className="text-muted-foreground">
                Aceitamos cartão de crédito, boleto bancário e PIX para planos Professional. Enterprise tem condições especiais.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para tomar decisões mais inteligentes?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece grátis e veja como a Intentia pode transformar sua estratégia de mídia paga.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Começar Análise Grátis
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>
      <Footer />
      <BackToTop />
    </div>
  );
}
