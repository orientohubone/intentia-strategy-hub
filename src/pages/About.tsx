import { Footer } from "@/components/Footer";
import { LandingNav } from "@/components/LandingNav";
import { BackToTop } from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const teamMembers = [
  {
    name: "João Silva",
    role: "CEO & Founder",
    description: "10+ anos em marketing digital e estratégia B2B",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Maria Santos",
    role: "CTO",
    description: "Especialista em IA e análise de dados",
    image: "https://images.unsplash.com/photo-1494790108755-2616b332c1ca?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Pedro Costa",
    role: "Head of Product",
    description: "Focado em UX e produtos escaláveis",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ana Oliveira",
    role: "Marketing Director",
    description: "Especialista em growth marketing B2B",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  }
];

const milestones = [
  { year: "2021", title: "Fundação", description: "Intentia nasce com a missão de revolucionar o marketing B2B" },
  { year: "2022", title: "Primeiro Cliente", description: "100+ empresas utilizando nossa plataforma" },
  { year: "2023", title: "Expansão", description: "Lançamento de novos recursos e análise avançada" },
  { year: "2024", title: "Liderança", description: "Reconhecida como líder em estratégia de mídia B2B" }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Sobre a <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Intentia</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Estamos em uma missão para ajudar empresas B2B a tomar decisões mais inteligentes sobre investimentos em marketing digital através de dados e estratégia.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/pricing')}>
            Conheça Nossos Planos
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Empresas B2B</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">40%</div>
              <p className="text-muted-foreground">Redução de desperdício</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">3x</div>
              <p className="text-muted-foreground">ROI médio</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24h</div>
              <p className="text-muted-foreground">Análise completa</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Nossa Missão</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Transformamos dados brutos em insights acionáveis para empresas B2B. Acreditamos que cada investimento em marketing deve ser baseado em estratégia, não em intuição.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Nossa plataforma combina análise avançada, benchmark competitivo e inteligência artificial para fornecer recomendações precisas sobre os melhores canais de mídia para cada negócio.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold">Precisão</div>
                    <div className="text-sm text-muted-foreground">Análise baseada em dados</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold">Crescimento</div>
                    <div className="text-sm text-muted-foreground">Resultados comprovados</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-semibold">Excelência</div>
                    <div className="text-sm text-muted-foreground">Qualidade garantida</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Nossos Valores</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Dados em Primeiro Lugar</h4>
                  <p className="text-sm text-muted-foreground">Decisões baseadas em evidências, não em achismo</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Transparência Total</h4>
                  <p className="text-sm text-muted-foreground">Métricas claras e resultados honestos</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Foco no Cliente</h4>
                  <p className="text-sm text-muted-foreground">Sucesso do nosso cliente é o nosso sucesso</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold">Inovação Constante</h4>
                  <p className="text-sm text-muted-foreground">Sempre evoluindo e melhorando</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Nossa Jornada</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                <h3 className="font-semibold text-foreground mb-2">{milestone.title}</h3>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Nossa Equipe</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para transformar sua estratégia de marketing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se às 500+ empresas que já confiam na Intentia para tomar decisões mais inteligentes.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Começar Agora
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
      
      <BackToTop />
    </div>
  );
}
