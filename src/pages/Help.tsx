import { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Book, 
  Video, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileText,
  Users,
  Zap,
  Shield,
  Settings,
  TrendingUp
} from "lucide-react";

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const helpCategories = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      description: "Aprenda a usar o Intentia Strategy Hub",
      icon: <Zap className="h-5 w-5" />,
      color: "text-blue-600",
      articles: [
        {
          title: "Como criar seu primeiro projeto",
          content: "Comece analisando sua estratégia de marketing digital em poucos passos.",
          difficulty: "Iniciante",
          readTime: "3 min"
        },
        {
          title: "Entendendo os scores de canal",
          content: "Saiba como interpretamos a adequação de cada canal de mídia para seu negócio.",
          difficulty: "Iniciante",
          readTime: "5 min"
        },
        {
          title: "Configurando seu perfil",
          content: "Personalize sua experiência e configure suas preferências.",
          difficulty: "Iniciante",
          readTime: "2 min"
        }
      ]
    },
    {
      id: "features",
      title: "Funcionalidades",
      description: "Explore todas as ferramentas disponíveis",
      icon: <Settings className="h-5 w-5" />,
      color: "text-green-600",
      articles: [
        {
          title: "Análise de Projetos",
          content: "Como criar e gerenciar seus projetos de análise estratégica.",
          difficulty: "Intermediário",
          readTime: "7 min"
        },
        {
          title: "Benchmark Competitivo",
          content: "Compare-se com concorrentes e identifique oportunidades.",
          difficulty: "Intermediário",
          readTime: "10 min"
        },
        {
          title: "Gestão de Insights",
          content: "Organize e aja sobre seus insights estratégicos.",
          difficulty: "Intermediário",
          readTime: "5 min"
        },
        {
          title: "Públicos-Alvo",
          content: "Defina e gerencie seus diferentes públicos-alvo.",
          difficulty: "Iniciante",
          readTime: "4 min"
        }
      ]
    },
    {
      id: "strategy",
      title: "Estratégia",
      description: "Melhores práticas de marketing digital",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-purple-600",
      articles: [
        {
          title: "Como definir sua proposta de valor",
          content: "Fundamentos para uma comunicação eficaz com seu público.",
          difficulty: "Avançado",
          readTime: "12 min"
        },
        {
          title: "Mapeando a jornada do cliente",
          content: "Entenda os pontos de contato e otimize a experiência.",
          difficulty: "Avançado",
          readTime: "15 min"
        },
        {
          title: "Escolhendo os canais certos",
          content: "Critérios para selecionar as melhores plataformas de mídia.",
          difficulty: "Intermediário",
          readTime: "8 min"
        }
      ]
    },
    {
      id: "technical",
      title: "Suporte Técnico",
      description: "Resolução de problemas e dúvidas técnicas",
      icon: <Shield className="h-5 w-5" />,
      color: "text-red-600",
      articles: [
        {
          title: "Problemas de login?",
          content: "Soluções para os problemas mais comuns de autenticação.",
          difficulty: "Iniciante",
          readTime: "3 min"
        },
        {
          title: "Como exportar seus dados",
          content: "Faça backup das suas análises e insights.",
          difficulty: "Iniciante",
          readTime: "4 min"
        },
        {
          title: "Integrações com outras ferramentas",
          content: "Conecte o Intentia com seu ecossistema de marketing.",
          difficulty: "Avançado",
          readTime: "10 min"
        }
      ]
    }
  ];

  const quickActions = [
    {
      title: "Video Tutoriais",
      description: "Aprenda de forma visual com nossos vídeos",
      icon: <Video className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600",
      action: "Assistir"
    },
    {
      title: "Webinars Ao Vivo",
      description: "Participe de sessões ao vivo com especialistas",
      icon: <Users className="h-8 w-8" />,
      color: "bg-green-100 text-green-600",
      action: "Participar"
    },
    {
      title: "Chat de Suporte",
      description: "Fale com nossa equipe em tempo real",
      icon: <MessageCircle className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-600",
      action: "Conversar"
    },
    {
      title: "Documentação API",
      description: "Para desenvolvedores que querem integrar",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-orange-100 text-orange-600",
      action: "Explorar"
    }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    category.articles.length > 0 || 
    category.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Iniciante": return "bg-green-100 text-green-800";
      case "Intermediário": return "bg-yellow-100 text-yellow-800";
      case "Avançado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Centro de Ajuda</h1>
              <p className="text-muted-foreground">
                Encontre respostas, tutoriais e suporte para usar ao máximo o Intentia Strategy Hub
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos, tutoriais ou tópicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`w-16 h-16 rounded-full ${action.color} flex items-center justify-center mx-auto mb-3`}>
                      {action.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      {action.action}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Help Categories */}
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <Card key={category.id}>
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={category.color}>
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{category.title}</CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                      <ChevronRight 
                        className={`h-5 w-5 transition-transform ${
                          expandedCategory === category.id ? "rotate-90" : ""
                        }`} 
                      />
                    </div>
                  </CardHeader>
                  
                  {expandedCategory === category.id && (
                    <CardContent className="space-y-3">
                      {category.articles.map((article, index) => (
                        <div key={index} className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{article.title}</h4>
                              <Badge variant="secondary" className={getDifficultyColor(article.difficulty)}>
                                {article.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{article.content}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-4">
                            <span>{article.readTime}</span>
                            <ExternalLink className="h-3 w-3" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Ainda precisa de ajuda?
                </CardTitle>
                <CardDescription>
                  Nossa equipe de suporte está pronta para ajudar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground mb-2">suporte@intentia.com</p>
                    <Button variant="outline" size="sm">Enviar Email</Button>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-semibold mb-1">Chat ao Vivo</h3>
                    <p className="text-sm text-muted-foreground mb-2">Seg-Sex, 9h-18h</p>
                    <Button variant="outline" size="sm">Iniciar Chat</Button>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <HelpCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-semibold mb-1">Base de Conhecimento</h3>
                    <p className="text-sm text-muted-foreground mb-2">Artigos detalhados</p>
                    <Button variant="outline" size="sm">Explorar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Perguntas Frequentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-b pb-3">
                    <h4 className="font-medium mb-1">Como funciona a análise de projetos?</h4>
                    <p className="text-sm text-muted-foreground">
                      Nossa IA analisa sua URL, proposta de valor e jornada do usuário para gerar insights estratégicos 
                      e scores de adequação para diferentes canais de marketing.
                    </p>
                  </div>
                  
                  <div className="border-b pb-3">
                    <h4 className="font-medium mb-1">Quais planos estão disponíveis?</h4>
                    <p className="text-sm text-muted-foreground">
                      Oferecemos planos Starter (1 análise/mês), Professional (10 análises/mês) e 
                      Enterprise (análises ilimitadas). Todos incluem acesso total às funcionalidades.
                    </p>
                  </div>
                  
                  <div className="border-b pb-3">
                    <h4 className="font-medium mb-1">Posso exportar meus dados?</h4>
                    <p className="text-sm text-muted-foreground">
                      Sim! Você pode exportar todos os seus projetos, insights e benchmarks a qualquer momento 
                      através das configurações da conta.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-1">Como o benchmark competitivo funciona?</h4>
                    <p className="text-sm text-muted-foreground">
                      Você adiciona concorrentes e nossa plataforma analisa seus pontos fortes e fracos, 
                      permitindo identificar gaps e oportunidades no mercado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
