import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MapPin, Clock, DollarSign, Users, Zap, Target } from "lucide-react";

const openPositions = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    department: "Engenharia",
    location: "São Paulo, SP (Híbrido)",
    type: "Full-time",
    level: "Sênior",
    description: "Estamos buscando um desenvolvedor frontend experiente para ajudar a construir a próxima geração de nossa plataforma de análise estratégica.",
    requirements: [
      "5+ anos de experiência com React/TypeScript",
      "Experiência com Next.js ou Vite",
      "Conhecimento em design systems e component libraries",
      "Forte experiência em performance e otimização"
    ],
    benefits: ["PLR", "Seguro saúde", "Flexibilidade de horário", "Orçamento para educação"]
  },
  {
    id: 2,
    title: "Product Marketing Manager",
    department: "Marketing",
    location: "Remoto",
    type: "Full-time",
    level: "Pleno",
    description: "Buscamos um profissional de marketing de produto para desenvolver estratégias de posicionamento e comunicação para nossos produtos B2B.",
    requirements: [
      "3+ anos de experiência em marketing de produtos B2B",
      "Experiência com SaaS é um diferencial",
      "Forte habilidade de escrita e comunicação",
      "Experiência com análise de mercado e competitividade"
    ],
    benefits: ["PLR", "Seguro saúde", "Home office", "Auxílio home office"]
  },
  {
    id: 3,
    title: "Data Scientist",
    department: "Dados",
    location: "São Paulo, SP (Híbrido)",
    type: "Full-time",
    level: "Sênior",
    description: "Procuramos um cientista de dados para desenvolver algoritmos de análise de mercado e previsão de performance de campanhas.",
    requirements: [
      "4+ anos de experiência em data science",
      "Forte conhecimento em Python e machine learning",
      "Experiência com análise de dados de marketing",
      "Capacidade de comunicar insights complexos"
    ],
    benefits: ["PLR", "Seguro saúde premium", "Flexibilidade", "Bolsa de estudos"]
  },
  {
    id: 4,
    title: "Customer Success Manager",
    department: "Sucesso do Cliente",
    location: "Remoto",
    type: "Full-time",
    level: "Pleno",
    description: "Buscamos um gestor de sucesso do cliente para garantir que nossos clientes obtenham o máximo de valor da plataforma Intentia.",
    requirements: [
      "2+ anos de experiência em customer success",
      "Experiência com SaaS B2B é essencial",
      "Forte habilidade de comunicação e negociação",
      "Capacidade de analisar dados e identificar tendências"
    ],
    benefits: ["PLR", "Seguro saúde", "Home office", "Auxílio home office"]
  }
];

const benefits = [
  {
    icon: DollarSign,
    title: "Remuneração Competitiva",
    description: "Salários acima do mercado e PLR atrativa"
  },
  {
    icon: Users,
    title: "Cultura Colaborativa",
    description: "Ambiente diverso e inclusivo com crescimento mútuo"
  },
  {
    icon: Zap,
    title: "Desenvolvimento Contínuo",
    description: "Orçamento para cursos, conferências e certificações"
  },
  {
    icon: Target,
    title: "Impacto Real",
    description: "Trabalhe em projetos que transformam negócios B2B"
  }
];

export default function Careers() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Carreiras na <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Intentia</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Junte-se a nós na missão de revolucionar o marketing B2B. Buscamos pessoas apaixonadas por dados, tecnologia e transformação digital.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              Ver Vagas Abertas
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="xl">
              Conheça Nossa Cultura
            </Button>
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Por que trabalhar na Intentia?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-12">Vagas Abertas</h2>
          <div className="space-y-6">
            {openPositions.map((position) => (
              <div key={position.id} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-foreground mb-2">{position.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{position.department}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{position.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{position.type}</span>
                        </div>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                          {position.level}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{position.description}</p>
                    <div className="mb-4">
                      <h4 className="font-semibold text-foreground mb-2">Requisitos:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {position.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Benefícios:</h4>
                      <div className="flex flex-wrap gap-2">
                        {position.benefits.map((benefit, index) => (
                          <span key={index} className="px-3 py-1 bg-muted rounded-full text-xs">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="lg:w-48">
                    <Button variant="hero" className="w-full">
                      Candidatar-se
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {openPositions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No momento não temos vagas abertas, mas estamos sempre em busca de talentos excepcionais.
              </p>
              <Button variant="outline">
                Enviar Currículo Espontâneo
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Nossa Cultura</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Na Intentia, acreditamos que pessoas extraordinárias constroem produtos extraordinários. 
                Nossa cultura é baseada em quatro pilares fundamentais:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-1">Obsessão por Dados</h4>
                  <p className="text-sm text-muted-foreground">Tomas decisões baseadas em evidências, não em opiniões</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-1">Crescimento Contínuo</h4>
                  <p className="text-sm text-muted-foreground">Aprendemos todos os dias e compartilhamos conhecimento</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-1">Propriedade e Responsabilidade</h4>
                  <p className="text-sm text-muted-foreground">Cada um é dono do seu trabalho e dos resultados</p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-foreground mb-1">Foco no Cliente</h4>
                  <p className="text-sm text-muted-foreground">O sucesso do cliente é o nosso sucesso</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Nossos Valores em Ação</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Transparência Radical</h4>
                    <p className="text-sm text-muted-foreground">Compartilhamos métricas, desafios e sucessos abertamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Diversidade e Inclusão</h4>
                    <p className="text-sm text-muted-foreground">Diferentes perspectivas criam soluções melhores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Bem-estar Integral</h4>
                    <p className="text-sm text-muted-foreground">Equilíbrio entre vida profissional e pessoal é prioridade</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold mb-1">Inovação Ousada</h4>
                    <p className="text-sm text-muted-foreground">Experimentamos, falhamos rápido e aprendemos sempre</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Pronto para fazer parte da transformação B2B?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Se você é apaixonado por dados, tecnologia e quer impactar o mercado B2B, queremos conhecer você.
          </p>
          <Button variant="hero" size="xl">
            Enviar Currículo
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
