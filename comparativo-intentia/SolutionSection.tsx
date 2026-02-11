import AnimatedSection from "./AnimatedSection";
import { Brain, Target, Settings, ArrowDown } from "lucide-react";

const layers = [
  {
    icon: Brain,
    
    title: "Camada Estratégica",
    subtitle: "Direção",
    description:
      "Interpreta sinais de mercado, performance e objetivo de negócio. Responde: Estamos indo na direção certa? Onde existe risco? O que precisa mudar agora?",
  },
  {
    icon: Target,
    
    title: "Camada Tática",
    subtitle: "Orquestração",
    description:
      "Transforma direção em ação: prioriza iniciativas, redistribui recursos, ajusta canais, foco e esforço. Estratégia vira plano ativo.",
  },
  {
    icon: Settings,
    
    title: "Camada Operacional",
    subtitle: "Execução",
    description:
      "Execução automática ou semi-automática, com ajustes contínuos, aprendendo a cada ciclo. A interface só aparece quando há exceção.",
  },
];

const SolutionSection = () => {
  return (
    <section id="solucao" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">A solução</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            A Intentia <span className="text-gradient">muda o modelo</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Plataforma de decisão contínua que conecta estratégia, tática e execução em um único fluxo — em tempo real.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto space-y-6">
          {layers.map((layer, i) => (
            <div key={layer.title}>
              <AnimatedSection delay={i * 0.15}>
                <div className="bg-card rounded-2xl p-8 border border-border/60 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <layer.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                        {layer.title} <span className="text-muted-foreground font-normal">— {layer.subtitle}</span>
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{layer.description}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              {i < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="text-primary/30" size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
