import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ScoreRing";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "Como o LinkedIn Ads se tornou o canal principal para B2B em 2024",
    excerpt: "Descubra por que empresas B2B estão migrando seus investimentos do Facebook para LinkedIn e como aproveitar essa tendência.",
    author: "Maria Santos",
    date: "15 de Janeiro, 2024",
    readTime: "8 min",
    category: "LinkedIn Ads",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    featured: true
  },
  {
    id: 2,
    title: "Guia completo: Quando investir (ou não) em TikTok para B2B",
    excerpt: "Análise detalhada sobre os cenários onde TikTok faz sentido para empresas B2B e como evitar desperdício de budget.",
    author: "João Silva",
    date: "10 de Janeiro, 2024",
    readTime: "12 min",
    category: "TikTok Ads",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop"
  },
  {
    id: 3,
    title: "Métricas que realmente importam: KPIs para marketing B2B",
    excerpt: "Além do CPL e CPA: descubra as métricas que realmente indicam sucesso em campanhas B2B e como otimizá-las.",
    author: "Pedro Costa",
    date: "5 de Janeiro, 2024",
    readTime: "10 min",
    category: "Métricas",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
  },
  {
    id: 4,
    title: "O futuro do Google Ads com a IA: O que esperar em 2024",
    excerpt: "Como as novas funcionalidades de IA do Google estão mudando o jogo para anunciantes B2B e como se preparar.",
    author: "Ana Oliveira",
    date: "28 de Dezembro, 2023",
    readTime: "15 min",
    category: "Google Ads",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
  },
  {
    id: 5,
    title: "Case Study: Como SaaS B2B reduziu CAC em 60% com análise estratégica",
    excerpt: "Estudo de caso real mostrando como análise de dados transformou completamente a estratégia de aquisição.",
    author: "Maria Santos",
    date: "20 de Dezembro, 2023",
    readTime: "20 min",
    category: "Case Study",
    image: "https://images.unsplash.com/photo-1563986768494-8dee8a316271?w=600&h=400&fit=crop"
  },
  {
    id: 6,
    title: "Construindo uma máquina de leads B2B: Do topo até o fundo do funil",
    excerpt: "Guia passo a passo para criar um sistema de geração de leads B2B escalável e previsível.",
    author: "João Silva",
    date: "15 de Dezembro, 2023",
    readTime: "25 min",
    category: "Leads",
    image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop"
  }
];

const categories = ["Todos", "LinkedIn Ads", "TikTok Ads", "Google Ads", "Métricas", "Case Study", "Leads"];

export default function Blog() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      {/* Hero Section */}

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Blog <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">Intentia</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Insights, estratégias e cases de sucesso para transformar seu marketing B2B. Aprenda com especialistas e líderes do mercado.
          </p>
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Começar Agora
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-card rounded-2xl border border-border overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 lg:p-12">
                <div className="mb-4">
                  <span className="text-sm text-primary font-medium">Destaque</span>
                  <h2 className="text-3xl font-bold text-foreground mt-2 mb-4">
                    {blogPosts[0].title}
                  </h2>
                </div>
                <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{blogPosts[0].readTime}</span>
                  </div>
                </div>
                <Button variant="outline">
                  Ler Artigo Completo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              <div className="relative">
                <img 
                  src={blogPosts[0].image} 
                  alt={blogPosts[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "Todos" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post) => (
              <article key={post.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <span className="text-xs text-primary font-medium uppercase tracking-wide">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full">
                    Ler Mais
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Receba os melhores insights B2B direto no seu email
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Conteúdo exclusivo, cases de sucesso e estratégias testadas toda semana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1 px-4 py-3 rounded-lg border border-border bg-background"
            />
            <Button variant="hero" className="w-full sm:w-auto">
              Inscrever-se
            </Button>
          </div>
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
