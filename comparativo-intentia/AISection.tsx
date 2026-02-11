import AnimatedSection from "./AnimatedSection";
import { BrainCircuit } from "lucide-react";

const AISection = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4">
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
              <h2 className="font-display text-3xl md:text-4xl font-bold text-background mb-4">
                IA embarcada como sistema nervoso
              </h2>
              <p className="text-background/70 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
                Na Intentia, a IA não é um chat nem uma feature. Ela é camada de interpretação, motor de decisão e sistema nervoso da plataforma.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {["Sempre ativa", "Sempre aprendendo", "Sempre conectando"].map((item) => (
                  <span
                    key={item}
                    className="px-5 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default AISection;
