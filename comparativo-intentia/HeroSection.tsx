import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target, Settings, Zap } from "lucide-react";
import { motion } from "framer-motion";

const layers = [
  { icon: Brain, label: "Estratégica", sub: "Direção" },
  { icon: Target, label: "Tática", sub: "Orquestração" },
  { icon: Settings, label: "Operacional", sub: "Execução" },
];

const finalCard = { icon: Zap, label: "Intentia em ação", sub: "Resultado" };

const cardDelay = (i: number) => 1.0 + i * 1.2;
const lineDelay = (i: number) => 1.4 + i * 1.2;

const CardItem = ({ item, delay, isFinal = false }: { item: typeof layers[0]; delay: number; isFinal?: boolean }) => (
  <motion.div
    initial={{ opacity: 0.15, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className={`relative flex flex-col items-center gap-3 px-8 py-6 rounded-2xl border min-w-[180px] ${
      isFinal
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-card border-border/60"
    }`}
  >
    <motion.div
      initial={{ boxShadow: "0 0 0 0 transparent" }}
      animate={
        isFinal
          ? { boxShadow: "0 0 24px 6px hsl(24 95% 53% / 0.55)" }
          : { boxShadow: "0 0 14px 3px hsl(24 95% 53% / 0.3)" }
      }
      transition={{ duration: 0.5, delay: delay + 0.3 }}
      className={`w-14 h-14 rounded-xl flex items-center justify-center ${
        isFinal ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"
      }`}
    >
      <item.icon size={28} className={isFinal ? "text-primary-foreground" : ""} />
    </motion.div>
    <div className="text-center">
      <p className={`font-display font-semibold ${isFinal ? "" : "text-foreground"}`}>{item.label}</p>
      <p className={`text-sm ${isFinal ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{item.sub}</p>
    </div>
    {/* Border glow on activation */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        boxShadow: isFinal
          ? "inset 0 0 0 2px hsl(24 95% 53% / 0.7), 0 0 20px 4px hsl(24 95% 53% / 0.35)"
          : "inset 0 0 0 1.5px hsl(24 95% 53% / 0.4)",
      }}
    />
  </motion.div>
);

const EnergyLine = ({ delay, vertical = false }: { delay: number; vertical?: boolean }) => (
  <div className={`flex items-center justify-center ${vertical ? "py-1" : "px-1"}`}>
    <div
      className={`overflow-hidden ${vertical ? "w-[3px] h-14" : "h-[3px] w-20 hidden md:block"}`}
      style={{ borderRadius: 4 }}
    >
      <motion.div
        initial={vertical ? { scaleY: 0 } : { scaleX: 0 }}
        animate={vertical ? { scaleY: 1 } : { scaleX: 1 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className="w-full h-full rounded-full"
        style={{
          transformOrigin: vertical ? "top" : "left",
          background: "hsl(24 95% 53% / 0.7)",
          boxShadow: "0 0 8px hsl(24 95% 53% / 0.5)",
        }}
      />
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-6">
              A nova forma de pensar estratégia
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-foreground">Estratégia que </span>
              <span className="text-gradient">decide.</span>
              <br />
              <span className="text-foreground">Execução que </span>
              <span className="text-gradient">acontece.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              O problema não é falta de dados. É a distância entre análise, decisão e execução.
              A Intentia nasce para resolver esse gap.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Button size="lg" asChild className="text-base px-8 py-6 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <a href="#solucao">
                Saiba por que a Intentia é diferente
                <ArrowRight className="ml-2" size={18} />
              </a>
            </Button>
          </motion.div>

          {/* Energized Flow */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {/* Desktop: horizontal */}
            <div className="hidden md:flex items-center justify-center">
              {layers.map((item, i) => (
                <div key={item.label} className="flex items-center">
                  <CardItem item={item} delay={cardDelay(i)} />
                  <EnergyLine delay={lineDelay(i)} />
                </div>
              ))}
              <CardItem item={finalCard} delay={cardDelay(3)} isFinal />
            </div>

            {/* Mobile: vertical */}
            <div className="flex md:hidden flex-col items-center">
              {layers.map((item, i) => (
                <div key={item.label} className="flex flex-col items-center">
                  <CardItem item={item} delay={cardDelay(i)} />
                  <EnergyLine delay={lineDelay(i)} vertical />
                </div>
              ))}
              <CardItem item={finalCard} delay={cardDelay(3)} isFinal />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
