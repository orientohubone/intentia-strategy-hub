import AnimatedSection from "./AnimatedSection";
import { MonitorOff, MousePointerClick, Zap } from "lucide-react";

const ZeroUISection = () => {
  const features = [
    { icon: MonitorOff, label: "Menos dashboards" },
    { icon: MousePointerClick, label: "Menos decisões manuais" },
    { icon: Zap, label: "Menos fricção operacional" },
  ];

  return (
    <section className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <AnimatedSection>
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-4">Interface por intenção</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Zero UI: quando a <span className="text-gradient">intenção</span> substitui o clique
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              A Intentia foi desenhada para operar por intenção, não por comando.
              A IA observa, interpreta e age. O usuário confirma quando necessário.
            </p>
            <div className="space-y-4">
              {features.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="text-primary" size={20} />
                  </div>
                  <span className="font-medium text-foreground">{f.label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="relative">
              <div className="rounded-2xl bg-card border border-border/60 p-8 shadow-lg">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
                  <div className="w-3 h-3 rounded-full bg-green-400/60" />
                </div>
                <div className="space-y-4">
                  <div className="h-3 bg-secondary rounded-full w-3/4" />
                  <div className="h-3 bg-secondary rounded-full w-1/2" />
                  <div className="h-3 bg-secondary rounded-full w-5/6" />
                  <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Zap className="text-primary-foreground" size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Ação executada automaticamente</p>
                        <p className="text-xs text-muted-foreground">Redistribuição de budget concluída</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-3 bg-secondary rounded-full w-2/3" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default ZeroUISection;
