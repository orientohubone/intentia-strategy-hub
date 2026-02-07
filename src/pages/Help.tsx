import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  FileText,
  Users,
  Zap,
  Shield,
  Settings,
  TrendingUp,
  Target,
  Sparkles,
  BarChart3,
  Lightbulb,
  Download,
  Moon,
  Bell,
  Key,
  Globe,
  Crosshair,
  BookOpen,
} from "lucide-react";

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const helpCategories = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      description: "Como começar a usar a plataforma Intentia",
      icon: <Zap className="h-5 w-5" />,
      color: "text-blue-600",
      articles: [
        {
          title: "Criando sua conta",
          content: "Acesse a página de Sign Up, preencha nome completo, email e senha. Após o cadastro, você será redirecionado ao Dashboard principal.",
          difficulty: "Iniciante",
        },
        {
          title: "Criando seu primeiro projeto",
          content: "Vá em Projetos → Novo Projeto. Insira o nome do projeto, nicho de mercado (ex: SaaS, Consultoria, Tecnologia), a URL principal do seu negócio e, opcionalmente, URLs de concorrentes para benchmark automático.",
          difficulty: "Iniciante",
        },
        {
          title: "Entendendo o Dashboard",
          content: "O Dashboard exibe seus projetos recentes, métricas gerais (total de projetos, insights, benchmarks, públicos), insights estratégicos compactos (clique para expandir cada um) e scores por canal com seletor de projeto. Tudo com dados reais da sua conta.",
          difficulty: "Iniciante",
        },
        {
          title: "Configurando seu perfil",
          content: "Em Configurações, atualize seu nome, email, empresa, cargo e foto de perfil. Você também pode alternar entre tema claro e escuro pelo ícone no header.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "url-analysis",
      title: "Diagnóstico de URL",
      description: "Análise heurística automática da sua URL",
      icon: <Target className="h-5 w-5" />,
      color: "text-orange-600",
      articles: [
        {
          title: "Como funciona a análise heurística",
          content: "Ao analisar uma URL, o sistema faz fetch do HTML da página e avalia automaticamente 6 dimensões: Proposta de Valor, Clareza da Oferta, Jornada do Usuário, SEO, Conversão e Qualidade de Conteúdo. Cada dimensão recebe um score de 0 a 100.",
          difficulty: "Iniciante",
        },
        {
          title: "Interpretando os 6 scores",
          content: "Proposta de Valor: avalia se o benefício principal está claro. Clareza: verifica se a oferta é compreensível. Jornada: analisa CTAs e fluxo de navegação. SEO: verifica meta tags, headings e estrutura. Conversão: avalia formulários e elementos de conversão. Conteúdo: analisa qualidade e quantidade de texto.",
          difficulty: "Intermediário",
        },
        {
          title: "Score Estratégico geral",
          content: "O Score Estratégico é a média ponderada dos 6 scores individuais. Ele indica a prontidão geral da sua URL para receber tráfego pago. Scores acima de 70 indicam boa prontidão; abaixo de 50 sugerem ajustes antes de investir em mídia.",
          difficulty: "Intermediário",
        },
        {
          title: "Insights automáticos gerados",
          content: "Após a análise heurística, o sistema gera automaticamente insights categorizados como: Alertas (riscos e problemas), Oportunidades (potenciais de melhoria) e Melhorias (ações sugeridas). Cada insight inclui título, descrição e ação recomendada.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "ai-analysis",
      title: "Análise por Inteligência Artificial",
      description: "Enriqueça seus diagnósticos com Gemini ou Claude",
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-purple-600",
      articles: [
        {
          title: "Configurando suas API keys",
          content: "Vá em Configurações → Integrações de IA. Insira sua API key do Google Gemini e/ou Anthropic Claude. O sistema valida a chave em tempo real contra a API oficial. Selecione seu modelo preferido para cada provider.",
          difficulty: "Intermediário",
        },
        {
          title: "Modelos disponíveis",
          content: "Google Gemini: Gemini 3 Flash Preview, Gemini 2.5 Flash, Gemini 2.5 Pro Preview, Gemini 2.0 Flash. Anthropic Claude: Claude Sonnet 4, Claude Sonnet 3.7, Claude Haiku 3.5, Claude Haiku 3, Claude Opus 3. Escolha o modelo no seletor ao lado do botão de análise IA.",
          difficulty: "Intermediário",
        },
        {
          title: "Erros de modelo não suportado",
          content: "Se sua API key não tem acesso a um modelo específico, o sistema exibe uma mensagem clara indicando qual modelo falhou e orienta você a trocar o modelo em Configurações → Integrações de IA. Nem todas as API keys têm acesso a todos os modelos — depende do seu plano no Google ou Anthropic.",
          difficulty: "Intermediário",
        },
        {
          title: "Executando análise por IA em projetos",
          content: "Na página de Projetos, após a análise heurística, clique no botão com ícone de IA (✨). Selecione o modelo desejado no dropdown. A análise retorna: resumo executivo, score de prontidão para investimento, análise SWOT, recomendações por canal e posição competitiva.",
          difficulty: "Intermediário",
        },
        {
          title: "Resultados da análise IA",
          content: "Os resultados incluem: Resumo Executivo (visão geral do negócio), Score de Prontidão (0-100 com justificativa), SWOT (forças, fraquezas, oportunidades, ameaças), Recomendações por Canal (Google, Meta, LinkedIn, TikTok) e Posição Competitiva. Tudo salvo automaticamente no projeto.",
          difficulty: "Intermediário",
        },
        {
          title: "Custos da análise por IA",
          content: "A Intentia não cobra pela funcionalidade de IA. Você usa sua própria API key e paga diretamente ao Google ou Anthropic pelo consumo. Cada análise consome poucos tokens, resultando em custo mínimo (centavos por análise).",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "benchmark",
      title: "Benchmark Competitivo",
      description: "Compare seu posicionamento com concorrentes",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-green-600",
      articles: [
        {
          title: "Criando um benchmark",
          content: "Vá em Benchmark → Novo Benchmark. Selecione o projeto, insira a URL do concorrente, nome e tags. O sistema gera automaticamente uma análise SWOT com scores comparativos.",
          difficulty: "Iniciante",
        },
        {
          title: "Análise SWOT automática",
          content: "Cada benchmark inclui: Forças (vantagens do concorrente), Fraquezas (pontos fracos), Oportunidades (gaps que você pode explorar) e Ameaças (riscos competitivos). Scores individuais para cada dimensão.",
          difficulty: "Intermediário",
        },
        {
          title: "Gap Analysis",
          content: "O gap analysis identifica as diferenças entre seu posicionamento e o do concorrente em cada dimensão avaliada, destacando onde você está à frente e onde precisa melhorar.",
          difficulty: "Intermediário",
        },
        {
          title: "Enriquecimento de benchmark por IA",
          content: "Clique no botão de IA em qualquer benchmark para obter análise aprofundada: vantagens e desvantagens competitivas detalhadas, gaps estratégicos, oportunidades de diferenciação e um plano de ação prático.",
          difficulty: "Avançado",
        },
        {
          title: "Dialog de detalhes e fullscreen",
          content: "Clique em qualquer card de benchmark para abrir o dialog de detalhes com todas as informações. Use o botão de fullscreen para expandir e visualizar melhor os dados.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "channels",
      title: "Score por Canal de Mídia",
      description: "Avaliação de adequação para Google, Meta, LinkedIn e TikTok",
      icon: <Globe className="h-5 w-5" />,
      color: "text-sky-600",
      articles: [
        {
          title: "Os 4 canais avaliados",
          content: "A plataforma avalia a adequação do seu negócio para: Google Ads (busca e display), Meta Ads (Facebook e Instagram), LinkedIn Ads (B2B profissional) e TikTok Ads (conteúdo e awareness). Cada canal recebe um score de 0 a 100.",
          difficulty: "Iniciante",
        },
        {
          title: "Objetivos recomendados por canal",
          content: "Para cada canal, o sistema sugere os melhores objetivos de campanha: geração de leads, awareness, tráfego, conversão, etc. Baseado no perfil do seu negócio e na análise da URL.",
          difficulty: "Intermediário",
        },
        {
          title: "Riscos identificados",
          content: "Cada canal também lista riscos potenciais: custo por lead alto, audiência inadequada, concorrência elevada, etc. Use essas informações para decidir onde investir primeiro.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "insights",
      title: "Insights Estratégicos",
      description: "Alertas, oportunidades e melhorias agrupados por projeto",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-yellow-600",
      articles: [
        {
          title: "Tipos de insights",
          content: "Existem 3 tipos: Alertas (⚠️ riscos e problemas que precisam de atenção imediata), Oportunidades (💡 potenciais de crescimento e diferenciação) e Melhorias (🔧 ações práticas para otimizar resultados).",
          difficulty: "Iniciante",
        },
        {
          title: "Agrupamento por projeto",
          content: "Na página de Insights, todos os insights são agrupados por projeto para facilitar a visualização. Cada grupo mostra o nome do projeto, quantidade de insights e cards individuais.",
          difficulty: "Iniciante",
        },
        {
          title: "Dialog de detalhes",
          content: "Clique em qualquer insight para abrir o dialog de detalhes com informações completas, incluindo descrição expandida e ação recomendada. Use o botão fullscreen para melhor visualização.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "tactical",
      title: "Plano Tático por Canal",
      description: "Estruture campanhas de mídia paga com templates validados por nicho",
      icon: <Crosshair className="h-5 w-5" />,
      color: "text-rose-600",
      articles: [
        {
          title: "O que é o Plano Tático",
          content: "O Plano Tático transforma decisões estratégicas em estruturas de campanha executáveis para cada canal de mídia (Google, Meta, LinkedIn, TikTok). Ele define tipo de campanha, papel no funil, estratégia de lances, estrutura de grupos e métricas-chave — sem criar anúncios finais.",
          difficulty: "Iniciante",
        },
        {
          title: "Usando templates por nicho",
          content: "Ao criar um plano tático, escolha entre 6 templates validados pelo mercado: SaaS B2B, Consultoria & Serviços, E-commerce & Indústria, Educação Corporativa, Fintech e Saúde Corporativa. Cada template preenche automaticamente os 4 canais com dados de campanha, copy frameworks, segmentação e testes.",
          difficulty: "Iniciante",
        },
        {
          title: "Frameworks de Copy",
          content: "Crie frameworks de argumentação por canal: Dor → Solução → Prova → CTA, Comparação, Autoridade ou Personalizado. Cada framework define a estrutura da mensagem sem gerar textos finais de anúncios — preparando a base para a execução.",
          difficulty: "Intermediário",
        },
        {
          title: "Segmentação e Testes",
          content: "Defina segmentação ideal por canal (público × mensagem × prioridade) e crie planos de teste com hipóteses, o que testar primeiro e critérios de sucesso. Tudo organizado por canal para facilitar a execução.",
          difficulty: "Intermediário",
        },
        {
          title: "Score Tático e Alertas",
          content: "Cada canal recebe um score tático que mede: coerência com a estratégia, clareza da estrutura e qualidade da segmentação. Alertas visuais aparecem quando o plano tático não respeita as recomendações da camada estratégica.",
          difficulty: "Intermediário",
        },
        {
          title: "Aplicar template em plano existente",
          content: "Na aba 'Templates' dentro do plano tático, você pode aplicar ou trocar o template a qualquer momento. Os dados existentes serão substituídos pelos dados do template selecionado. Ideal para testar diferentes abordagens por nicho.",
          difficulty: "Intermediário",
        },
        {
          title: "Playbook Gamificado",
          content: "Clique no botão 'Rodar Plano' na aba de visão geral para gerar um playbook de execução gamificado. O sistema analisa todos os canais e gera diretivas priorizadas com KPIs, nível de prioridade e ações específicas. Visualize na aba 'Playbook' com cards coloridos por prioridade.",
          difficulty: "Intermediário",
        },
        {
          title: "Scores táticos automáticos",
          content: "Os scores táticos (coerência, clareza, segmentação) são computados automaticamente ao carregar o plano — não apenas ao salvar. Isso significa que ao aplicar um template, os badges e indicadores já refletem os dados imediatamente.",
          difficulty: "Intermediário",
        },
        {
          title: "Google Ads — Funcionalidades exclusivas",
          content: "Para Google Ads, o plano tático inclui funcionalidades exclusivas: seleção de extensões recomendadas (Sitelinks, Frases de Destaque, Preço, etc.) e estratégia para os 3 fatores de Índice de Qualidade (relevância do anúncio, landing page, CTR esperado).",
          difficulty: "Avançado",
        },
      ]
    },
    {
      id: "audiences",
      title: "Públicos-Alvo",
      description: "Defina e gerencie suas audiências B2B",
      icon: <Users className="h-5 w-5" />,
      color: "text-indigo-600",
      articles: [
        {
          title: "Criando um público-alvo",
          content: "Vá em Públicos-Alvo → Novo Público. Defina nome, descrição, indústria, porte da empresa, localização e keywords relevantes. Vincule o público a um ou mais projetos.",
          difficulty: "Iniciante",
        },
        {
          title: "Vinculação com projetos",
          content: "Cada público-alvo pode ser vinculado a projetos específicos. Isso permite refinar a estratégia de cada projeto com base nas características da audiência definida.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "exports",
      title: "Exportação e Relatórios",
      description: "PDF, CSV, JSON, Markdown e HTML",
      icon: <Download className="h-5 w-5" />,
      color: "text-emerald-600",
      articles: [
        {
          title: "Relatório PDF consolidado",
          content: "Na página de Projetos, clique no botão de PDF para gerar um relatório completo do projeto incluindo: dados gerais, scores heurísticos, análise IA (se disponível), insights e scores por canal. Formatado profissionalmente para apresentação.",
          difficulty: "Iniciante",
        },
        {
          title: "Exportação por seção em PDF",
          content: "Além do relatório consolidado, você pode exportar seções individuais em PDF: apenas a análise heurística, apenas os resultados de IA, apenas os benchmarks, etc.",
          difficulty: "Intermediário",
        },
        {
          title: "Exportação CSV",
          content: "Exporte dados tabulares em CSV para análise externa: projetos, insights, benchmarks, públicos-alvo e scores por canal. Ideal para importar em planilhas ou ferramentas de BI.",
          difficulty: "Iniciante",
        },
        {
          title: "Exportação de análise IA",
          content: "Os resultados da análise por IA podem ser exportados em 4 formatos: JSON (dados estruturados), Markdown (texto formatado), HTML estilizado (para compartilhar) e PDF (para apresentação). Disponível tanto para projetos quanto para benchmarks.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "settings",
      title: "Configurações e Personalização",
      description: "Perfil, tema, API keys e preferências",
      icon: <Settings className="h-5 w-5" />,
      color: "text-gray-600",
      articles: [
        {
          title: "Integrações de IA",
          content: "Em Configurações → Integrações de IA, configure suas API keys do Google Gemini e Anthropic Claude. Cada provider mostra: status (Ativa/Não configurada), modelo preferido, última validação e opções de editar/excluir.",
          difficulty: "Intermediário",
        },
        {
          title: "Tema claro e escuro",
          content: "Alterne entre tema claro e escuro pelo ícone de sol/lua no header do dashboard. O tema é salvo automaticamente. Páginas públicas (landing, pricing, etc.) sempre usam tema claro.",
          difficulty: "Iniciante",
        },
        {
          title: "Foto de perfil",
          content: "Em Configurações, clique na foto de perfil para fazer upload de uma nova imagem. A foto é armazenada no Supabase Storage e exibida no header e sidebar.",
          difficulty: "Iniciante",
        },
        {
          title: "Notificações",
          content: "O sino no header mostra notificações em tempo real: análises concluídas, novos insights gerados, etc. Clique para ver o dropdown com todas as notificações. Notificações não lidas aparecem com indicador.",
          difficulty: "Iniciante",
        },
      ]
    },
  ];

  const faqItems = [
    {
      question: "Como funciona a análise heurística de URL?",
      answer: "Ao inserir uma URL, o sistema faz fetch do HTML da página e analisa automaticamente 6 dimensões: Proposta de Valor, Clareza, Jornada do Usuário, SEO, Conversão e Conteúdo. Cada dimensão recebe um score de 0 a 100, e o Score Estratégico geral é a média ponderada. Insights são gerados automaticamente com alertas, oportunidades e melhorias."
    },
    {
      question: "Preciso pagar para usar a análise por IA?",
      answer: "A funcionalidade de IA é gratuita na plataforma. Você configura sua própria API key do Google Gemini ou Anthropic Claude em Configurações → Integrações de IA, e paga diretamente ao provider pelo consumo de tokens. Cada análise custa centavos."
    },
    {
      question: "Quais modelos de IA são suportados?",
      answer: "Google Gemini: Gemini 3 Flash Preview, Gemini 2.5 Flash, Gemini 2.5 Pro Preview e Gemini 2.0 Flash. Anthropic Claude: Claude Sonnet 4, Claude Sonnet 3.7, Claude Haiku 3.5, Claude Haiku 3 e Claude Opus 3. Você escolhe o modelo no seletor antes de cada análise."
    },
    {
      question: "Como funciona o benchmark competitivo?",
      answer: "Você adiciona URLs de concorrentes e o sistema gera uma análise SWOT automática com scores comparativos, gap analysis e tags. Opcionalmente, enriqueça com IA para obter vantagens/desvantagens detalhadas, gaps estratégicos e plano de ação."
    },
    {
      question: "Quais formatos de exportação estão disponíveis?",
      answer: "Relatórios PDF consolidados por projeto, exportação por seção em PDF, dados tabulares em CSV (projetos, insights, benchmarks, audiences, channels), e resultados de IA em JSON, Markdown, HTML estilizado ou PDF."
    },
    {
      question: "Quais planos estão disponíveis?",
      answer: "Starter (gratuito): 5 análises de URL por mês, score básico por canal. Professional (R$ 97/mês): análises ilimitadas, IA, benchmark com IA, relatórios PDF/CSV, insights e alertas. Enterprise (personalizado): tudo do Professional + API access, SLA dedicado, consultoria estratégica e treinamento."
    },
    {
      question: "Posso usar a plataforma no modo escuro?",
      answer: "Sim! Alterne entre tema claro e escuro pelo ícone de sol/lua no header do dashboard. O tema é salvo automaticamente. As páginas públicas (landing, preços, etc.) sempre usam tema claro para consistência da marca."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim. Utilizamos Supabase com PostgreSQL e Row Level Security (RLS) — cada usuário só acessa seus próprios dados. API keys são armazenadas de forma segura por usuário. A autenticação é gerenciada pelo Supabase Auth."
    },
    {
      question: "Como recebo notificações?",
      answer: "Notificações são enviadas em tempo real via Supabase Subscriptions. Você recebe alertas quando análises são concluídas, novos insights são gerados ou quando há atualizações importantes. Acesse pelo ícone de sino no header."
    },
    {
      question: "O que é o Plano Tático e como funciona?",
      answer: "O Plano Tático é a camada que transforma decisões estratégicas em estruturas de campanha executáveis. Para cada canal (Google, Meta, LinkedIn, TikTok), você define tipo de campanha, funil, lances, grupos de anúncios, frameworks de copy, segmentação e plano de testes. Use templates pré-preenchidos por nicho B2B para começar rapidamente."
    },
    {
      question: "Quais templates táticos estão disponíveis?",
      answer: "6 templates validados por nicho: SaaS B2B, Consultoria & Serviços, E-commerce & Indústria B2B, Educação Corporativa, Fintech & Financeiro e Saúde Corporativa. Cada template inclui dados pré-preenchidos para os 4 canais, frameworks de copy, segmentação e planos de teste."
    },
    {
      question: "O que é o Playbook Gamificado?",
      answer: "O Playbook é gerado ao clicar em 'Rodar Plano' na visão geral do plano tático. Ele analisa todos os canais configurados e gera diretivas de execução priorizadas com KPIs, ações específicas e nível de prioridade. É uma forma gamificada de transformar o plano tático em ações concretas."
    },
    {
      question: "Posso cancelar meu plano a qualquer momento?",
      answer: "Sim! Todos os planos são flexíveis, sem compromisso de longo prazo. Você pode fazer upgrade, downgrade ou cancelar quando quiser. As alterações são refletidas na próxima cobrança."
    },
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

  const filteredFaq = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Iniciante": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Intermediário": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Avançado": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <DashboardLayout>
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Centro de Ajuda</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Guia completo da plataforma Intentia — funcionalidades, fluxos e dúvidas frequentes
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar funcionalidade ou dúvida..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-foreground">6</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Scores por URL</p>
              </div>
              <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-foreground">9</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Modelos de IA</p>
              </div>
              <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500 mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-foreground">4</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Canais de Mídia</p>
              </div>
              <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
                <Crosshair className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500 mx-auto mb-1.5 sm:mb-2" />
                <p className="text-xl sm:text-2xl font-bold text-foreground">6</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Templates Táticos</p>
              </div>
            </div>

            {/* Help Categories */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Guia por Funcionalidade</h2>
              <div className="space-y-2 sm:space-y-3">
                {filteredCategories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors py-3 sm:py-4 px-3 sm:px-6"
                      onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className={`shrink-0 ${category.color}`}>
                            {category.icon}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="text-sm sm:text-base truncate">{category.title}</CardTitle>
                            <CardDescription className="text-[10px] sm:text-xs line-clamp-1">{category.description}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs hidden sm:inline-flex">
                            {category.articles.length} artigos
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] sm:hidden">
                            {category.articles.length}
                          </Badge>
                          <ChevronRight 
                            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground transition-transform ${
                              expandedCategory === category.id ? "rotate-90" : ""
                            }`} 
                          />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {expandedCategory === category.id && (
                      <CardContent className="space-y-2 sm:space-y-3 pt-0 px-3 sm:px-6">
                        {category.articles.map((article, index) => (
                          <div key={index} className="p-2.5 sm:p-3 rounded-lg border bg-muted/20">
                            <div className="flex items-start sm:items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                              <h4 className="font-medium text-xs sm:text-sm text-foreground">{article.title}</h4>
                              <Badge variant="secondary" className={`text-[10px] sm:text-xs ${getDifficultyColor(article.difficulty)}`}>
                                {article.difficulty}
                              </Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{article.content}</p>
                          </div>
                        ))}
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Perguntas Frequentes</h2>
              <Card>
                <CardContent className="p-0">
                  {filteredFaq.map((item, index) => (
                    <div key={index} className={index < filteredFaq.length - 1 ? "border-b" : ""}>
                      <button
                        className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-muted/50 transition-colors gap-3"
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      >
                        <span className="font-medium text-xs sm:text-sm text-foreground">{item.question}</span>
                        <ChevronDown 
                          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 transition-transform ${
                            expandedFaq === index ? "rotate-180" : ""
                          }`} 
                        />
                      </button>
                      {expandedFaq === index && (
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Contact Support */}
            <Card>
              <CardHeader className="px-3 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Precisa de mais ajuda?
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Entre em contato com nossa equipe
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm">Email</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">intentia@orientohub.com.br</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Respondemos em até 24h úteis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-xs sm:text-sm">Telefone</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">+55 (14) 99861-8547</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Seg a Sex, 9h às 18h</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4 text-center">
                  Uma solução do ecossistema <a href="https://orientohub.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">orientohub.com.br</a>
                </p>
              </CardContent>
            </Card>
          </div>
    </DashboardLayout>
  );
}
