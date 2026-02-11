import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const CTASection = () => {
  return (
    <section id="cta" className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        <AnimatedSection className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Estratégia deixa de ser um evento.
            <br />
            <span className="text-gradient">Passa a ser um sistema vivo.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Veja como a Intentia opera estratégia, tática e execução no seu negócio.
          </p>
          <Button
            size="lg"
            className="text-base px-10 py-7 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          >
            Começar agora
            <ArrowRight className="ml-2" size={18} />
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTASection;
