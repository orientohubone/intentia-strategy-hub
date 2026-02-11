import AnimatedSection from "./AnimatedSection";
import { Building2, BarChart3, Users, Rocket } from "lucide-react";

const audiences = [
  { icon: Building2, label: "Empresas B2B em crescimento" },
  { icon: BarChart3, label: "Times de marketing, RevOps e liderança" },
  { icon: Rocket, label: "Negócios que precisam decidir rápido" },
  { icon: Users, label: "Organizações que querem execução conectada à estratégia" },
];

const AudienceSection = () => {
  return (
    <section id="para-quem" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Para quem</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            A Intentia é feita para <span className="text-gradient">quem executa</span>
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
  );
};

export default AudienceSection;
