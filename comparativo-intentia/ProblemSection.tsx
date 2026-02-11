import AnimatedSection from "./AnimatedSection";
import { UserX, FileWarning } from "lucide-react";

const ProblemSection = () => {
  return (
    <section id="problema" className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">O problema</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            O modelo tradicional <span className="text-gradient">não funciona</span>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <AnimatedSection delay={0.1}>
            <div className="bg-card rounded-2xl p-8 border border-border/60 shadow-sm h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <UserX className="text-primary" size={24} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Estratégia humana não escala
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                  Têm tempo limitado
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                  Dependem de reuniões e contexto manual
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                  Tomam decisões baseadas em recortes temporais
                </li>
              </ul>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-card rounded-2xl p-8 border border-border/60 shadow-sm h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <FileWarning className="text-primary" size={24} />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Consultorias param no diagnóstico
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                  Operam em ciclos longos
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                  Produzem materiais estáticos
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                  Não acompanham a execução diária
                </li>
              </ul>
            </div>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.3} className="text-center">
          <p className="font-display text-xl md:text-2xl font-semibold text-foreground">
            "Boas análises, más decisões <span className="text-primary">no tempo errado.</span>"
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ProblemSection;
