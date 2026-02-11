import AnimatedSection from "./AnimatedSection";
import { Button } from "@/components/ui/button";
import { Check, X, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Estrategista",
    price: "~R$7.000",
    period: "/mês",
    highlight: false,
    features: [
      { label: "Modelo", value: "Horas humanas", good: false },
      { label: "Foco", value: "Consultivo", good: true },
      { label: "Velocidade", value: "Semanas", good: false },
      { label: "Escalabilidade", value: "Limitada", good: false },
      { label: "Execução", value: "Manual", good: false },
    ],
  },
  {
    name: "Intentia",
    price: "R$127",
    period: "/mês",
    highlight: true,
    features: [
      { label: "Modelo", value: "IA contínua", good: true },
      { label: "Foco", value: "Decisão + Execução", good: true },
      { label: "Velocidade", value: "Tempo real", good: true },
      { label: "Escalabilidade", value: "Ilimitada", good: true },
      { label: "Execução", value: "Automática", good: true },
    ],
  },
  {
    name: "Consultoria",
    price: "~R$10.000",
    period: "/mês",
    highlight: false,
    features: [
      { label: "Modelo", value: "Projetos pontuais", good: false },
      { label: "Foco", value: "Diagnóstico", good: true },
      { label: "Velocidade", value: "Meses", good: false },
      { label: "Escalabilidade", value: "Nenhuma", good: false },
      { label: "Execução", value: "Nenhuma", good: false },
    ],
  },
];

const PricingSection = () => {
  return (
    <section id="preco" className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Comparativo</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Por que custa menos de <span className="text-gradient">R$5 por dia?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Porque a Intentia não vende horas humanas. Ela entrega capacidade estratégica escalável.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {plans.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={i * 0.1}>
              <div
                className={`rounded-2xl p-8 h-full flex flex-col ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-105 border-2 border-primary relative"
                    : "bg-card border border-border/60 shadow-sm"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-semibold px-4 py-1 rounded-full">
                    Recomendado
                  </span>
                )}
                <div className="mb-6">
                  <p className={`text-sm font-medium mb-2 ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {plan.features.map((f) => (
                    <div key={f.label} className="flex items-start gap-3">
                      {f.good ? (
                        <Check size={18} className={`mt-0.5 shrink-0 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                      ) : (
                        <X size={18} className={`mt-0.5 shrink-0 ${plan.highlight ? "text-primary-foreground/40" : "text-muted-foreground/50"}`} />
                      )}
                      <div>
                        <p className={`text-xs ${plan.highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {f.label}
                        </p>
                        <p className={`text-sm font-medium ${plan.highlight ? "" : "text-foreground"}`}>
                          {f.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {plan.highlight && (
                  <Button
                    variant="secondary"
                    className="mt-8 w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
                    asChild
                  >
                    <a href="#cta">
                      Começar agora <ArrowRight size={16} className="ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.4} className="text-center">
          <p className="font-display text-lg md:text-xl font-semibold text-foreground">
            Consultorias analisam. Estrategistas orientam.{" "}
            <span className="text-primary">A Intentia decide e executa continuamente.</span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default PricingSection;
