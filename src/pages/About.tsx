import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Target, Award, TrendingUp, Rocket, ExternalLink } from "lucide-react";

const milestones = [
  { year: "2017", title: "Primeiros Passos", description: "Início da jornada em marketing digital B2B, identificando gaps estratégicos no mercado" },
  { year: "2019", title: "Validação", description: "Anos de experiência consolidam a visão: empresas investem em mídia sem estratégia" },
  { year: "2022", title: "Conceito", description: "Nasce o conceito da Intentia dentro do ecossistema Orientohub, unindo dados e IA" },
  { year: "2025", title: "Materialização", description: "Quase 8 anos de experiência se materializam na plataforma — conceitos consolidados em produto" }
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
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
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Números que Falam por Si</h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center bg-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
              <div className="text-4xl font-bold text-primary mb-2">+5M</div>
              <p className="text-muted-foreground">Alcance Gerado</p>
            </div>
            <div className="text-center bg-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
              <div className="text-4xl font-bold text-primary mb-2">+R$1M</div>
              <p className="text-muted-foreground">Receita Gerada</p>
            </div>
            <div className="text-center bg-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
              <div className="text-4xl font-bold text-primary mb-2">+50</div>
              <p className="text-muted-foreground">Marcas Impactadas</p>
            </div>
            <div className="text-center bg-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
              <div className="text-4xl font-bold text-primary mb-2">+R$100K</div>
              <p className="text-muted-foreground">em Ads Investidos</p>
            </div>
            <div className="text-center bg-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
              <div className="text-4xl font-bold text-primary mb-2">SaaS</div>
              <p className="text-muted-foreground">Especialista em</p>
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
          <div className="grid md:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div key={index} className="text-center bg-primary/10 backdrop-blur-sm rounded-2xl border border-primary/20 p-6">
                <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                <h3 className="font-semibold text-foreground mb-2">{milestone.title}</h3>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Origem — Ecossistema Orientohub */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Nossa Origem</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Nascemos pelo ecossistema{" "}
                <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Orientohub</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                A Intentia nasceu dentro do ecossistema Orientohub — um hub de inovação dedicado a construir o futuro das startups e empresas de tecnologia. Somos fruto de uma visão que conecta estratégia, dados e inteligência artificial para transformar negócios B2B.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Fundada por <strong className="text-foreground">Fernando Ramalho</strong>, a Intentia carrega o DNA de inovação e empreendedorismo do Orientohub, aplicando tecnologia de ponta para resolver um dos maiores desafios do marketing digital: investir com inteligência.
              </p>
              <a
                href="https://orientohub.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                Conheça o Orientohub
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
              <div className="text-center">
                <img
                  src="/fernando.jpeg"
                  alt="Fernando Ramalho"
                  className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-primary"
                />
                <h3 className="text-xl font-bold text-foreground">Fernando Ramalho</h3>
                <p className="text-primary text-sm font-medium">Fundador</p>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Visão</h4>
                  <p className="text-sm text-muted-foreground">Democratizar o acesso a estratégias de marketing baseadas em dados e IA para empresas B2B de todos os portes.</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Ecossistema</h4>
                  <p className="text-sm text-muted-foreground">A Intentia faz parte do Orientohub, um hub para quem constrói o futuro das startups — conectando ferramentas, conhecimento e comunidade.</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground">Missão</h4>
                  <p className="text-sm text-muted-foreground">Eliminar investimentos prematuros em mídia digital, garantindo que cada real investido tenha o máximo retorno possível.</p>
                </div>
              </div>
            </div>
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
            Descubra como a Intentia pode transformar suas decisões de mídia com inteligência e estratégia.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Começar Agora
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      
      {/* Back to Top Button */}
      <BackToTop />
      {/* Back to Home Button */}
      <BackToHomeButton />
    </div>
  );
}
