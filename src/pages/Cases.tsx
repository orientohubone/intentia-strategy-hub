import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Target, Users, Award } from "lucide-react";

const caseStudies = [
  {
    id: 1,
    company: "SaaS CRM Pro",
    industry: "Software B2B",
    challenge: "Investimento alto em TikTok Ads com baixo retorno",
    solution: "Análise estratégica identificou incompatibilidade de público-alvo",
    results: {
      reduction: "65%",
      roi: "3.2x",
      time: "2 semanas"
    },
    testimonial: "A Intentia nos salvou de continuar queimando dinheiro em canais inadequados. Hoje nosso ROI triplicou.",
    author: "João Santos, CEO",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
  },
  {
    id: 2,
    company: "ERP Connect",
    industry: "Tecnologia Industrial",
    challenge: "Dificuldade em escalar campanhas de Google Ads",
    solution: "Benchmark competitivo revelou gaps de posicionamento",
    results: {
      reduction: "45%",
      roi: "2.8x",
      time: "1 mês"
    },
    testimonial: "Finalmente entendemos onde estávamos errando. A análise da Intentia foi reveladora.",
    author: "Maria Costa, CMO",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    company: "FinTech Solutions",
    industry: "Serviços Financeiros",
    challenge: "Leads de baixa qualidade em Meta Ads",
    solution: "Score por canal identificou LinkedIn como ideal",
    results: {
      reduction: "55%",
      roi: "4.1x",
      time: "3 semanas"
    },
    testimonial: "Migrar para LinkedIn foi a melhor decisão. Leads mais qualificados e ciclo de venda menor.",
    author: "Pedro Oliveira, Head de Marketing",
    image: "https://images.unsplash.com/photo-1563986768494-8dee8a316271?w=600&h=400&fit=crop"
  }
];

const stats = [
  { icon: TrendingUp, label: "ROI Médio", value: "3.2x" },
  { icon: Target, label: "Redução de Desperdício", value: "52%" },
  { icon: Users, label: "Clientes Satisfeitos", value: "500+" },
  { icon: Award, label: "Projetos Concluídos", value: "1000+" }
];

export default function Cases() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Cases de <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Sucesso</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Veja como empresas B2B como a sua transformaram suas estratégias de marketing e alcançaram resultados extraordinários.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Histórias de Transformação</h2>
          <div className="space-y-16">
            {caseStudies.map((caseStudy, index) => (
              <div key={caseStudy.id} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <img 
                      src={caseStudy.image} 
                      alt={caseStudy.company}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="mb-4">
                    <span className="text-sm text-primary font-medium">{caseStudy.industry}</span>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{caseStudy.company}</h3>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">O Desafio</h4>
                      <p className="text-muted-foreground">{caseStudy.challenge}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">A Solução</h4>
                      <p className="text-muted-foreground">{caseStudy.solution}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{caseStudy.results.reduction}</div>
                        <p className="text-xs text-muted-foreground">Redução de Custo</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{caseStudy.results.roi}</div>
                        <p className="text-xs text-muted-foreground">ROI Aumentado</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{caseStudy.results.time}</div>
                        <p className="text-xs text-muted-foreground">Tempo de Resultado</p>
                      </div>
                    </div>
                    
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm italic text-foreground mb-2">"{caseStudy.testimonial}"</p>
                      <p className="text-xs text-muted-foreground">— {caseStudy.author}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para escrever seu próprio case de sucesso?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se às empresas que já transformaram seus resultados com a Intentia.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Começar Sua Transformação
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      <Footer />
      
      <BackToTop />
      <BackToHomeButton />
    </div>
  );
}
