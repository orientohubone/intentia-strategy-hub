import { LandingNav } from "@/components/LandingNav";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { 
  Target, 
  BarChart3, 
  Lightbulb, 
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
  Users,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Diagnóstico de URL",
    description: "Analise automaticamente proposta de valor, clareza da oferta e jornada do usuário.",
  },
  {
    icon: BarChart3,
    title: "Benchmark Estratégico",
    description: "Compare seu posicionamento com concorrentes e identifique gaps de mercado.",
  },
  {
    icon: Lightbulb,
    title: "Score por Canal",
    description: "Saiba se Google, Meta, LinkedIn ou TikTok são adequados para seu negócio.",
  },
  {
    icon: Shield,
    title: "Alertas Estratégicos",
    description: "Receba avisos quando o investimento em mídia for prematuro ou arriscado.",
  },
];

const steps = [
  { number: "01", title: "Crie seu projeto", description: "Insira a URL e defina o nicho do seu negócio B2B." },
  { number: "02", title: "Defina públicos", description: "Mapeie dores, nível de consciência e decisores." },
  { number: "03", title: "Analise concorrentes", description: "Compare posicionamento e identifique oportunidades." },
  { number: "04", title: "Receba o Score", description: "Veja a prontidão estratégica de cada canal de mídia." },
];

const benefits = [
  "Evite desperdício de budget em canais inadequados",
  "Tome decisões baseadas em dados, não intuição",
  "Identifique o momento certo de investir",
  "Alinhe estratégia antes de criar campanhas",
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero Section */}
      <section className="pt-24 pb-16 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-border mb-6 animate-fade-in">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">
                Plataforma de Estratégia de Mídia para B2B
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
              Descubra <span className="text-gradient">onde investir</span> em mídia paga antes de gastar
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Avalie a prontidão estratégica do seu negócio para Google, Meta, LinkedIn e TikTok Ads. 
              Decisão inteligente antes da execução.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl">
                Começar Análise Grátis
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Ver Demonstração
              </Button>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 relative animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden max-w-5xl mx-auto">
              <div className="p-6 border-b border-border flex items-center gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <div className="flex-1 h-8 bg-muted rounded-lg" />
              </div>
              <div className="p-8 grid grid-cols-4 gap-6">
                <div className="col-span-4 flex items-center justify-between p-6 bg-muted/50 rounded-xl">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">SaaS CRM Pro</h3>
                    <p className="text-sm text-muted-foreground">Análise estratégica completa</p>
                  </div>
                  <ScoreRing score={72} size="lg" label="Score Estratégico" />
                </div>
                {["Google Ads", "Meta Ads", "LinkedIn Ads", "TikTok Ads"].map((channel, i) => (
                  <div key={channel} className="p-4 bg-muted/30 rounded-lg text-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">{channel}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{[78, 65, 82, 45][i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Decisão estratégica, não operacional
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Intentia é a camada de inteligência que vem antes de qualquer campanha de mídia paga.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card-elevated p-6 text-center group">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
              Como Funciona
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Da URL à decisão estratégica em <span className="text-primary">4 passos</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-border -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10">
                  <span className="text-5xl font-bold text-primary/20">{step.number}</span>
                  <h3 className="font-semibold text-foreground mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Pare de desperdiçar budget em canais errados
              </h2>
              <p className="text-lg opacity-90 mb-8">
                A maioria das empresas B2B investe em mídia paga sem validar se estão prontas estrategicamente. 
                Com Intentia, você toma decisões inteligentes.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">40%</p>
                <p className="text-sm opacity-80">Redução de desperdício</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">3x</p>
                <p className="text-sm opacity-80">Melhor alocação</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">500+</p>
                <p className="text-sm opacity-80">Empresas B2B</p>
              </div>
              <div className="bg-primary-foreground/10 rounded-xl p-6 text-center">
                <Lightbulb className="h-8 w-8 mx-auto mb-3" />
                <p className="text-3xl font-bold">24h</p>
                <p className="text-sm opacity-80">Análise completa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Pronto para decidir com inteligência?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece sua análise estratégica gratuita e descubra os melhores canais para seu negócio B2B.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              Começar Análise Grátis
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/50 border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">I</span>
              </div>
              <span className="font-bold text-foreground">Intentia</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Intentia. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Termos</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacidade</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
