import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FAQCard } from "@/components/FAQCard";
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Database,
  HardDrive,
  Wand2,
  Megaphone,
  CalendarDays,
  Plug,
  Gauge,
  Search as SearchIcon,
  DollarSign,
} from "lucide-react";

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const [faqShowAll, setFaqShowAll] = useState(false);
  const [faqFilter, setFaqFilter] = useState<string>("todos");
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  const helpCategories = [
    {
      id: "getting-started",
      title: "Primeiros Passos",
      description: "Como começar a usar a plataforma",
      icon: <Zap className="h-5 w-5" />,
      color: "text-blue-600",
      articles: [
        {
          title: "Criando sua conta",
          content: "Acesse Sign Up, preencha nome, email e senha. Você será redirecionado ao Dashboard.",
          difficulty: "Iniciante",
        },
        {
          title: "Primeiro projeto",
          content: "Projetos → Novo Projeto. Insira nome, nicho, URL e URLs de concorrentes.",
          difficulty: "Iniciante",
        },
        {
          title: "Dashboard",
          content: "Visualize projetos, métricas, insights e scores por canal com dados reais.",
          difficulty: "Iniciante",
        },
        {
          title: "Configurações de perfil",
          content: "Atualize nome, email, empresa, cargo e foto. Alterne tema claro/escuro.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "url-analysis",
      title: "Diagnóstico de URL",
      description: "Análise heurística automática",
      icon: <Target className="h-5 w-5" />,
      color: "text-orange-600",
      articles: [
        {
          title: "Como funciona",
          content: "Fetch do HTML + análise de 6 dimensões: Proposta, Clareza, Jornada, SEO, Conversão, Conteúdo.",
          difficulty: "Iniciante",
        },
        {
          title: "Interpretando scores",
          content: "Cada dimensão recebe score 0-100. Acima de 70 = bom, abaixo de 50 = precisa ajustar.",
          difficulty: "Intermediário",
        },
        {
          title: "Score Estratégico",
          content: "Média ponderada dos 6 scores. Indica prontidão para tráfego pago.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "ai-analysis",
      title: "Análise por IA",
      description: "Insights aprofundados com IA",
      icon: <Sparkles className="h-5 w-5" />,
      color: "text-purple-600",
      articles: [
        {
          title: "Configurando API keys",
          content: "Configurações → Integrações de IA. Adicione keys do Gemini ou Claude. Validação em tempo real.",
          difficulty: "Intermediário",
        },
        {
          title: "Executando análise",
          content: "Selecione modelo, clique em IA. Gera resumo, SWOT, recomendações e plano de ação.",
          difficulty: "Iniciante",
        },
        {
          title: "Modelos disponíveis",
          content: "Gemini: 2.0 Flash, 3 Flash/Pro. Claude: Sonnet 4, 3.7, Haiku 3.5/3, Opus 3.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "benchmark",
      title: "Benchmark Competitivo",
      description: "Compare-se com concorrentes",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-green-600",
      articles: [
        {
          title: "Criando benchmark",
          content: "Benchmark → Novo Benchmark. Selecione projeto, insira URL do concorrente, nome e tags.",
          difficulty: "Iniciante",
        },
        {
          title: "Análise SWOT",
          content: "Geração automática: Forças, Fraquezas, Oportunidades, Ameaças com scores comparativos.",
          difficulty: "Intermediário",
        },
        {
          title: "Gap Analysis",
          content: "Identifica diferenças entre seu posicionamento e do concorrente em cada dimensão.",
          difficulty: "Intermediário",
        },
        {
          title: "Enriquecimento por IA",
          content: "Análise aprofundada: vantagens, gaps estratégicos e plano de ação prático.",
          difficulty: "Avançado",
        },
      ]
    },
    {
      id: "channels",
      title: "Scores por Canal",
      description: "Prontidão para cada canal",
      icon: <Globe className="h-5 w-5" />,
      color: "text-sky-600",
      articles: [
        {
          title: "4 canais avaliados",
          content: "Google Ads (busca), Meta Ads (social), LinkedIn Ads (B2B), TikTok Ads (conteúdo).",
          difficulty: "Iniciante",
        },
        {
          title: "Objetivos por canal",
          content: "Sugestões de objetivos: leads, awareness, tráfego, conversão. Baseado no seu negócio.",
          difficulty: "Intermediário",
        },
        {
          title: "Riscos identificados",
          content: "Custo alto, audiência inadequada, concorrência elevada. Ajuda a decidir onde investir.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "insights",
      title: "Insights Estratégicos",
      description: "Alertas e oportunidades",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "text-yellow-600",
      articles: [
        {
          title: "3 tipos de insights",
          content: "Alertas (⚠️ riscos urgentes), Oportunidades (💡 crescimento), Melhorias (🔧 otimizações).",
          difficulty: "Iniciante",
        },
        {
          title: "Agrupamento por projeto",
          content: "Agrupados por projeto com cards individuais. Badges de tipo e descrição expandida.",
          difficulty: "Iniciante",
        },
        {
          title: "Dialog de detalhes",
          content: "Clique para expandir informações. Botão fullscreen para melhor visualização.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "tactical",
      title: "Plano Tático",
      description: "Estruturas de campanha",
      icon: <Crosshair className="h-5 w-5" />,
      color: "text-rose-600",
      articles: [
        {
          title: "O que é",
          content: "Transforma estratégia em estruturas executáveis por canal (tipo, funil, lances).",
          difficulty: "Iniciante",
        },
        {
          title: "Templates",
          content: "6 templates: SaaS, Consultoria, E-commerce, Educação, Fintech, Saúde. Pré-preenchidos.",
          difficulty: "Iniciante",
        },
        {
          title: "Frameworks de Copy",
          content: "Estruturas: Dor→Solução→Prova→CTA, Comparação, Autoridade, Personalizado.",
          difficulty: "Intermediário",
        },
        {
          title: "Segmentação",
          content: "Defina público × mensagem × prioridade. Importe públicos-alvo do projeto.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "structured-data",
      title: "Dados Estruturados",
      description: "JSON-LD, Open Graph, Twitter",
      icon: <Database className="h-5 w-5" />,
      color: "text-teal-600",
      articles: [
        {
          title: "O que são",
          content: "Dados embutidos no HTML que ajudam buscadores e redes sociais a entender o conteúdo.",
          difficulty: "Iniciante",
        },
        {
          title: "4 tipos extraídos",
          content: "JSON-LD (schema.org), Open Graph (Facebook/LinkedIn), Twitter Card, Microdata.",
          difficulty: "Iniciante",
        },
        {
          title: "Visualizador com abas",
          content: "Abas para cada site: seu site + concorrentes. Compare dados lado a lado.",
          difficulty: "Iniciante",
        },
        {
          title: "Gerador de snippets",
          content: "Gera código pronto para copiar baseado nos dados dos concorrentes.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "structured-data-generator",
      title: "Gerador de Dados",
      description: "Snippets prontos baseados na concorrência",
      icon: <Wand2 className="h-5 w-5" />,
      color: "text-orange-600",
      articles: [
        {
          title: "O que é",
          content: "Analisa dados estruturados dos concorrentes e gera snippets prontos para copiar.",
          difficulty: "Iniciante",
        },
        {
          title: "Gap Analysis",
          content: "Compara JSON-LD, OG, Twitter Card. Classifica gaps como Crítico, Moderado ou Baixo.",
          difficulty: "Intermediário",
        },
        {
          title: "Snippets gerados",
          content: "JSON-LD, meta tags OG e Twitter Card. Pré-preenchidos com dados do seu projeto.",
          difficulty: "Intermediário",
        },
        {
          title: "Como usar",
          content: "Clique para expandir código. Copie individual ou 'Copiar Todos'. Cole no <head>.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "audiences",
      title: "Públicos-Alvo",
      description: "Audiências B2B",
      icon: <Users className="h-5 w-5" />,
      color: "text-indigo-600",
      articles: [
        {
          title: "Criando públicos",
          content: "Públicos-Alvo → Novo Público. Defina nome, indústria, porte, localização, keywords.",
          difficulty: "Iniciante",
        },
        {
          title: "Vinculação com projetos",
          content: "Vincule a projetos específicos. Refina estratégia baseada na audiência definida.",
          difficulty: "Intermediário",
        },
        {
          title: "Consumo pelo Plano Tático",
          content: "Importação rápida para segmentação. Pré-preenchido com dados do público.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "seo-performance",
      title: "SEO & Performance",
      description: "Análise técnica e monitoramento",
      icon: <Gauge className="h-5 w-5" />,
      color: "text-cyan-600",
      articles: [
        {
          title: "Análise SEO",
          content: "Meta tags, headings, dados estruturados, velocidade e otimização para buscadores.",
          difficulty: "Iniciante",
        },
        {
          title: "PageSpeed Insights",
          content: "Core Web Vitals (LCP, FID, CLS), tempo de carregamento. Compare com concorrentes.",
          difficulty: "Intermediário",
        },
        {
          title: "Monitoramento",
          content: "Dashboard com KPIs, alertas automáticos e análise por IA de padrões.",
          difficulty: "Avançado",
        },
      ]
    },
    {
      id: "integrations",
      title: "Integrações",
      description: "Conecte contas de anúncios",
      icon: <Plug className="h-5 w-5" />,
      color: "text-blue-600",
      articles: [
        {
          title: "Visão geral",
          content: "Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads. Sincronização automática via OAuth 2.0.",
          difficulty: "Iniciante",
        },
        {
          title: "Status atual",
          content: "Em desenvolvimento. Visualize status na página de Integrações. Receba notificações.",
          difficulty: "Iniciante",
        },
        {
          title: "Sincronização futura",
          content: "Campanhas, métricas, segmentação, histórico. Frequência configurável.",
          difficulty: "Intermediário",
        },
        {
          title: "Configuração OAuth",
          content: "Redirecionamento seguro → autorização → retorno. Sem armazenar senhas.",
          difficulty: "Avançado",
        },
      ]
    },
    {
      id: "exports",
      title: "Exportação",
      description: "PDF, CSV, JSON, HTML",
      icon: <Download className="h-5 w-5" />,
      color: "text-emerald-600",
      articles: [
        {
          title: "Relatório PDF",
          content: "Projetos → PDF. Relatório completo com scores, análises e insights. Formato profissional.",
          difficulty: "Iniciante",
        },
        {
          title: "Exportação CSV",
          content: "Dados tabulares: projetos, insights, benchmarks, públicos. Ideal para planilhas.",
          difficulty: "Iniciante",
        },
        {
          title: "Análises IA",
          content: "Exporte em 4 formatos: JSON, Markdown, HTML, PDF. Disponível para projetos/benchmarks.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "settings",
      title: "Configurações",
      description: "Perfil, tema e API keys",
      icon: <Settings className="h-5 w-5" />,
      color: "text-gray-600",
      articles: [
        {
          title: "API keys de IA",
          content: "Configurações → Integrações de IA. Configure Gemini/Claude. Status e validação.",
          difficulty: "Intermediário",
        },
        {
          title: "Tema",
          content: "Alterne claro/escuro pelo ícone no header. Salvo automaticamente. Páginas públicas sempre claras.",
          difficulty: "Iniciante",
        },
        {
          title: "Foto de perfil",
          content: "Upload de imagem. Supabase Storage. Exibida no header e sidebar.",
          difficulty: "Iniciante",
        },
        {
          title: "Notificações",
          content: "Sino no header mostra alertas em tempo real. Dropdown com todas as notificações.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "operations",
      title: "Operações",
      description: "Gestão de campanhas",
      icon: <Megaphone className="h-5 w-5" />,
      color: "text-orange-600",
      articles: [
        {
          title: "Criando campanhas",
          content: "Operações → Nova Campanha. Projeto, canal, nome, objetivo, budget, datas. Status: Rascunho → Ativa → Pausada → Concluída → Arquivada.",
          difficulty: "Iniciante",
        },
        {
          title: "Registrando métricas",
          content: "Expanda campanha → Registrar Métricas. Impressões, cliques, conversões, custo, receita. Funil B2B completo para Google.",
          difficulty: "Intermediário",
        },
        {
          title: "KPIs automáticos",
          content: "Cards com CTR, CPA, CPC, ROAS. Para Google Ads: Sessões, Leads/Mês, Taxa SQL, CAC, LTV, ROI.",
          difficulty: "Intermediário",
        },
        {
          title: "Análise por IA",
          content: "Com métricas, use IA para saúde geral, KPIs vs benchmark, análise de funil, plano de ação.",
          difficulty: "Avançado",
        },
      ]
    },
    {
      id: "budget",
      title: "Gestão de Budget",
      description: "Alocação e pacing",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-emerald-600",
      articles: [
        {
          title: "Alocando budget",
          content: "Dentro do projeto, defina canal, mês, ano e valor. Pacing calculado automaticamente.",
          difficulty: "Iniciante",
        },
        {
          title: "Monitorando pacing",
          content: "Cores: verde (<80%), amarelo (80-95%), vermelho (>95%). Projeções automáticas.",
          difficulty: "Intermediário",
        },
        {
          title: "Sincronização",
          content: "Sincroniza gastos reais com base nas métricas registradas das campanhas.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "calendar",
      title: "Calendário",
      description: "Visualização de campanhas",
      icon: <CalendarDays className="h-5 w-5" />,
      color: "text-indigo-600",
      articles: [
        {
          title: "Vista Calendário",
          content: "Grade mensal com barras coloridas por canal. Alerta para encerramento em 7 dias.",
          difficulty: "Iniciante",
        },
        {
          title: "Vista Timeline",
          content: "Gantt horizontal com 8 semanas. Barras por canal com opacidade por status.",
          difficulty: "Iniciante",
        },
        {
          title: "Filtros",
          content: "Filtre por canal e status. Ambas as vistas suportam os mesmos filtros.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "security",
      title: "Segurança & Backup",
      description: "Proteção de dados",
      icon: <HardDrive className="h-5 w-5" />,
      color: "text-red-600",
      articles: [
        {
          title: "Isolamento (RLS)",
          content: "Dados isolados por conta. Ninguém acessa seus dados. Políticas de segurança.",
          difficulty: "Iniciante",
        },
        {
          title: "Backups",
          content: "Automáticos antes de exclusões. 90 dias de retenção. Manuais disponíveis.",
          difficulty: "Iniciante",
        },
        {
          title: "Log de auditoria",
          content: "Todas as operações registradas. Dados antes/depois. API keys mascaradas.",
          difficulty: "Intermediário",
        },
      ]
    },
  ];

  const faqItems = [
    {
      question: "Como funciona a análise heurística de URL?",
      answer: "Ao inserir uma URL, o sistema faz fetch do HTML da página e analisa automaticamente 6 dimensões: Proposta de Valor, Clareza, Jornada do Usuário, SEO, Conversão e Conteúdo. Cada dimensão recebe um score de 0 a 100, e o Score Estratégico geral é a média ponderada. Insights são gerados automaticamente com alertas, oportunidades e melhorias.",
      category: "analise",
      difficulty: "iniciante",
      icon: <Target className="h-4 w-4" />,
      color: "text-orange-600"
    },
    {
      question: "Preciso pagar para usar a análise por IA?",
      answer: "A funcionalidade de IA é gratuita na plataforma. Você configura sua própria API key do Google Gemini ou Anthropic Claude em Configurações → Integrações de IA, e paga diretamente ao provider pelo consumo de tokens. Cada análise custa centavos.",
      category: "ia",
      difficulty: "iniciante",
      icon: <Sparkles className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      question: "Quais modelos de IA são suportados?",
      answer: "Google Gemini: Gemini 3 Flash Preview, Gemini 2.5 Flash, Gemini 2.5 Pro Preview e Gemini 2.0 Flash. Anthropic Claude: Claude Sonnet 4, Claude Sonnet 3.7, Claude Haiku 3.5, Claude Haiku 3 e Claude Opus 3. Você escolhe o modelo no seletor antes de cada análise.",
      category: "ia",
      difficulty: "intermediario",
      icon: <Sparkles className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      question: "Como funciona o benchmark competitivo?",
      answer: "Você adiciona URLs de concorrentes e o sistema gera uma análise SWOT automática com scores comparativos, gap analysis e tags. Opcionalmente, enriqueça com IA para obter vantagens/desvantagens detalhadas, gaps estratégicos e plano de ação.",
      category: "benchmark",
      difficulty: "intermediario",
      icon: <BarChart3 className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      question: "Quais formatos de exportação estão disponíveis?",
      answer: "Relatórios PDF consolidados por projeto, exportação por seção em PDF, dados tabulares em CSV (projetos, insights, benchmarks, audiences, channels), e resultados de IA em JSON, Markdown, HTML estilizado ou PDF.",
      category: "exports",
      difficulty: "iniciante",
      icon: <Download className="h-4 w-4" />,
      color: "text-emerald-600"
    },
    {
      question: "Quais planos estão disponíveis?",
      answer: "Starter (gratuito): 5 análises de URL por mês, score básico por canal. Professional (R$ 147/mês): análises ilimitadas, IA, benchmark com IA, relatórios PDF/CSV, insights e alertas. Enterprise (personalizado): tudo do Professional + API access, SLA dedicado, consultoria estratégica e treinamento.",
      category: "planos",
      difficulty: "iniciante",
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      question: "Posso usar a plataforma no modo escuro?",
      answer: "Sim! Alterne entre tema claro e escuro pelo ícone de sol/lua no header do dashboard. O tema é salvo automaticamente. As páginas públicas (landing, preços, etc.) sempre usam tema claro para consistência da marca.",
      category: "configuracoes",
      difficulty: "iniciante",
      icon: <Moon className="h-4 w-4" />,
      color: "text-gray-600"
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim. Implementamos múltiplas camadas de segurança: Row Level Security (RLS) em todas as 16+ tabelas, audit log automático em 13+ tabelas, backups automáticos antes de exclusões, soft delete com recuperação em 30 dias, rate limiting por plano, proteção contra escalação de privilégios e mascaramento de dados sensíveis. API keys são isoladas por usuário e nunca expostas em logs ou exportações. Saiba mais na página de Segurança.",
      category: "seguranca",
      difficulty: "intermediario",
      icon: <Shield className="h-4 w-4" />,
      color: "text-red-600"
    },
    {
      question: "Como recebo notificações?",
      answer: "Notificações são enviadas em tempo real via Supabase Subscriptions. Você recebe alertas quando análises são concluídas, novos insights são gerados ou quando há atualizações importantes. Acesse pelo ícone de sino no header.",
      category: "configuracoes",
      difficulty: "iniciante",
      icon: <Bell className="h-4 w-4" />,
      color: "text-gray-600"
    },
    {
      question: "O que é o Plano Tático e como funciona?",
      answer: "O Plano Tático é a camada que transforma decisões estratégicas em estruturas de campanha executáveis. Para cada canal (Google, Meta, LinkedIn, TikTok), você define tipo de campanha, funil, lances, grupos de anúncios, frameworks de copy, segmentação e plano de testes. Use templates pré-preenchidos por nicho B2B para começar rapidamente.",
      category: "tatico",
      difficulty: "intermediario",
      icon: <Crosshair className="h-4 w-4" />,
      color: "text-rose-600"
    },
    {
      question: "Quais templates táticos estão disponíveis?",
      answer: "6 templates validados por nicho: SaaS B2B, Consultoria & Serviços, E-commerce & Indústria B2B, Educação Corporativa, Fintech & Financeiro e Saúde Corporativa. Cada template inclui dados pré-preenchidos para os 4 canais, frameworks de copy, segmentação e planos de teste.",
      category: "tatico",
      difficulty: "iniciante",
      icon: <Crosshair className="h-4 w-4" />,
      color: "text-rose-600"
    },
    {
      question: "Como os públicos-alvo se conectam ao plano tático?",
      answer: "Públicos-alvo vinculados a um projeto são automaticamente disponibilizados no Plano Tático. Na seção de Segmentação de cada canal, botões de importação rápida permitem adicionar públicos com um clique, pré-preenchendo nome, critérios de targeting (indústria, porte, localização, keywords) e descrição. Isso garante alinhamento entre a estratégia de audiência e a execução tática.",
      category: "tatico",
      difficulty: "intermediario",
      icon: <Users className="h-4 w-4" />,
      color: "text-indigo-600"
    },
    {
      question: "O que é o Playbook Gamificado?",
      answer: "O Playbook é gerado ao clicar em 'Rodar Plano' na visão geral do plano tático. Ele analisa todos os canais configurados e gera diretivas de execução priorizadas com KPIs, ações específicas e nível de prioridade. É uma forma gamificada de transformar o plano tático em ações concretas.",
      category: "tatico",
      difficulty: "avancado",
      icon: <BookOpen className="h-4 w-4" />,
      color: "text-rose-600"
    },
    {
      question: "O que são os dados estruturados extraídos pela análise?",
      answer: "A Intentia extrai automaticamente 4 tipos de dados estruturados de cada URL analisada: JSON-LD (schema.org, usado pelo Google), Open Graph (meta tags para Facebook/LinkedIn), Twitter Card (meta tags para Twitter/X) e Microdata. Esses dados mostram como a página se apresenta para mecanismos de busca e redes sociais.",
      category: "dados",
      difficulty: "intermediario",
      icon: <Database className="h-4 w-4" />,
      color: "text-teal-600"
    },
    {
      question: "Posso comparar dados estruturados com concorrentes?",
      answer: "Sim! Ao adicionar URLs de concorrentes ao projeto, a Intentia extrai os dados estruturados de cada um. No visualizador unificado, use as abas para alternar entre seu site e cada concorrente, comparando JSON-LD, Open Graph, Twitter Card e Microdata lado a lado.",
      category: "dados",
      difficulty: "iniciante",
      icon: <Database className="h-4 w-4" />,
      color: "text-teal-600"
    },
    {
      question: "O que é o Gerador de Dados Estruturados?",
      answer: "É uma ferramenta exclusiva que analisa os dados estruturados dos seus concorrentes e gera snippets de código prontos para você copiar e colar no seu site. Ele identifica gaps (o que a concorrência tem e você não), classifica por criticidade e gera JSON-LD, Open Graph e Twitter Card pré-preenchidos com dados do seu projeto.",
      category: "dados",
      difficulty: "intermediario",
      icon: <Wand2 className="h-4 w-4" />,
      color: "text-orange-600"
    },
    {
      question: "Preciso saber programar para usar o Gerador de Dados Estruturados?",
      answer: "Não! Os snippets são gerados prontos para uso. Basta copiar o código e colar no <head> do seu HTML (ou pedir ao seu desenvolvedor). JSON-LD vai dentro de tags <script>, e meta tags OG/Twitter vão diretamente no <head>. O gerador pré-preenche os valores com dados do seu projeto — você só precisa personalizar os placeholders.",
      category: "dados",
      difficulty: "iniciante",
      icon: <Wand2 className="h-4 w-4" />,
      color: "text-orange-600"
    },
    {
      question: "Como funciona a análise de performance por IA?",
      answer: "Quando uma campanha tem métricas registradas, o botão de IA aparece. Selecione o modelo (Gemini ou Claude) e clique para executar. A IA analisa todos os KPIs, compara com benchmarks do mercado, identifica gargalos no funil, avalia eficiência de budget, lista forças/fraquezas, riscos com mitigação, gera um plano de ação priorizado e faz projeções para 30 e 90 dias. Os resultados ficam salvos na campanha.",
      category: "operacoes",
      difficulty: "avancado",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "text-cyan-600"
    },
    {
      question: "O que aparece no card de campanhas do Dashboard?",
      answer: "O Dashboard mostra as campanhas mais recentes com nome, projeto vinculado, badges coloridos de canal (Google/Meta/LinkedIn/TikTok) e status (Rascunho/Ativa/Pausada/Concluída/Arquivada), além de uma barra de pacing de budget. Você pode expandir para ver mais campanhas ou clicar em 'Ver todas' para ir à página de Operações.",
      category: "operacoes",
      difficulty: "iniciante",
      icon: <Megaphone className="h-4 w-4" />,
      color: "text-orange-600"
    },
    {
      question: "O que é o Comparativo Tático vs Real?",
      answer: "É um gap analysis automático que cruza o plano tático de cada canal com as métricas reais das campanhas. O sistema verifica aderência estrutural (tipo de campanha, estágio de funil, estratégia de lances) e gap de métricas (planejado vs real com desvio percentual). O score de aderência combina 30% estrutura + 70% métricas, com status visual por canal.",
      category: "operacoes",
      difficulty: "intermediario",
      icon: <Gauge className="h-4 w-4" />,
      color: "text-cyan-600"
    },
    {
      question: "Como funciona o Calendário de Campanhas?",
      answer: "O Calendário de Campanhas oferece duas vistas: Calendário (grade mensal com barras coloridas por canal) e Timeline (Gantt horizontal com 8 semanas visíveis). Ambas mostram campanhas com datas definidas, com cores por canal e opacidade por status. Clique em uma campanha no calendário para ver detalhes como duração, budget pacing e métricas. Na timeline, passe o mouse para tooltips ricos. Campanhas que encerram em 7 dias recebem alerta visual. Filtros por canal e status estão disponíveis em ambas as vistas.",
      category: "operacoes",
      difficulty: "intermediario",
      icon: <CalendarDays className="h-4 w-4" />,
      color: "text-indigo-600"
    },
    {
      question: "Como funcionam os alertas automáticos de performance?",
      answer: "O sistema avalia 11 regras automaticamente para cada campanha ativa ou pausada. Exemplos: budget estourado ou quase esgotado, CTR abaixo do mínimo por canal, CPC/CPA acima dos benchmarks, ROAS negativo, sem conversões, CAC:LTV desfavorável e ROI negativo. Os alertas aparecem dentro de cada grupo de projeto em Operações, com filtros por severidade (crítico, atenção, info) e categoria (budget, eficiência, conversão, qualidade, pacing, tendência).",
      category: "operacoes",
      difficulty: "intermediario",
      icon: <Zap className="h-4 w-4" />,
      color: "text-orange-600"
    },
    {
      question: "Como conecto minha conta do Google Ads, Meta Ads ou LinkedIn Ads?",
      answer: "Vá em Integrações e clique em 'Conectar' no card do provider desejado. Você será redirecionado para a página de autorização do provider, onde autoriza o acesso à sua conta de anúncios. Após autorizar, você volta automaticamente ao Intentia com status 'Conectado'. O fluxo usa OAuth 2.0 — nós nunca vemos sua senha. Cada usuário conecta sua própria conta.",
      category: "integracoes",
      difficulty: "iniciante",
      icon: <Plug className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      question: "Os dados das minhas contas de anúncios ficam seguros?",
      answer: "Sim. Os tokens de acesso são isolados por usuário via Row Level Security (RLS) — nenhum outro usuário pode acessá-los. O fluxo OAuth usa parâmetro 'state' com expiração de 10 minutos para prevenir ataques. Tokens expirados são renovados automaticamente. Se a renovação falhar, a integração é marcada como 'Expirada' e você precisa reconectar.",
      category: "integracoes",
      difficulty: "intermediario",
      icon: <Shield className="h-4 w-4" />,
      color: "text-red-600"
    },
    {
      question: "O que acontece quando sincronizo dados de anúncios?",
      answer: "A sincronização busca suas campanhas e métricas (impressões, cliques, conversões, custo, receita) dos últimos 30 dias via API oficial do provider. Os dados são inseridos automaticamente no módulo de Operações, alimentando KPIs, alertas de performance, gestão de budget e comparativo tático vs real. Você pode sincronizar manualmente ou configurar frequência automática.",
      category: "integracoes",
      difficulty: "intermediario",
      icon: <Globe className="h-4 w-4" />,
      color: "text-sky-600"
    },
    {
      question: "Preciso configurar algo no Google/Meta/LinkedIn/TikTok?",
      answer: "A configuração dos providers é feita pela equipe Intentia (credenciais OAuth do app). Você como usuário só precisa clicar em 'Conectar' e autorizar sua conta de anúncios. Não é necessário criar apps ou configurar APIs — tudo já está pronto. Basta ter uma conta ativa no provider desejado.",
      category: "integracoes",
      difficulty: "iniciante",
      icon: <Settings className="h-4 w-4" />,
      color: "text-gray-600"
    },
    {
      question: "Posso cancelar meu plano a qualquer momento?",
      answer: "Sim! Todos os planos são flexíveis, sem compromisso de longo prazo. Você pode fazer upgrade, downgrade ou cancelar quando quiser. As alterações são refletidas na próxima cobrança.",
      category: "planos",
      difficulty: "iniciante",
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      question: "Como faço backup dos meus dados?",
      answer: "Vá em Configurações → Backup & Segurança de Dados. Você pode criar backups manuais (snapshot completo no servidor) ou exportar todos os dados em JSON para download local. Backups automáticos também são criados antes de exclusões importantes como deletar projetos.",
      category: "seguranca",
      difficulty: "intermediario",
      icon: <HardDrive className="h-4 w-4" />,
      color: "text-red-600"
    },
    {
      question: "O que acontece se eu excluir um projeto por acidente?",
      answer: "Projetos excluídos ficam em estado de 'soft delete' por 30 dias antes da exclusão permanente. Além disso, um backup automático é criado antes da exclusão. Você pode recuperar seus dados através dos backups salvos em Configurações.",
      category: "seguranca",
      difficulty: "iniciante",
      icon: <HardDrive className="h-4 w-4" />,
      color: "text-red-600"
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

  const filteredFaq = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = faqFilter === "todos" || item.category === faqFilter;
    return matchesSearch && matchesFilter;
  });

  const faqCategories = [
    { id: "todos", label: "Todos", icon: <HelpCircle className="h-4 w-4" />, color: "text-gray-600" },
    { id: "analise", label: "Análise", icon: <Target className="h-4 w-4" />, color: "text-orange-600" },
    { id: "ia", label: "IA", icon: <Sparkles className="h-4 w-4" />, color: "text-purple-600" },
    { id: "benchmark", label: "Benchmark", icon: <BarChart3 className="h-4 w-4" />, color: "text-green-600" },
    { id: "exports", label: "Exportação", icon: <Download className="h-4 w-4" />, color: "text-emerald-600" },
    { id: "planos", label: "Planos", icon: <DollarSign className="h-4 w-4" />, color: "text-blue-600" },
    { id: "configuracoes", label: "Configurações", icon: <Settings className="h-4 w-4" />, color: "text-gray-600" },
    { id: "seguranca", label: "Segurança", icon: <Shield className="h-4 w-4" />, color: "text-red-600" },
    { id: "tatico", label: "Tático", icon: <Crosshair className="h-4 w-4" />, color: "text-rose-600" },
    { id: "dados", label: "Dados", icon: <Database className="h-4 w-4" />, color: "text-teal-600" },
    { id: "operacoes", label: "Operações", icon: <Megaphone className="h-4 w-4" />, color: "text-orange-600" },
    { id: "integracoes", label: "Integrações", icon: <Plug className="h-4 w-4" />, color: "text-blue-600" },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "intermediario": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "avancado": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "iniciante": return "Iniciante";
      case "intermediario": return "Intermediário";
      case "avancado": return "Avançado";
      default: return difficulty;
    }
  };

  return (
    <DashboardLayout>
      <SEO title="Ajuda" noindex />
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

            {/* Expanded category articles */}
              {expandedCategory && (() => {
                const category = filteredCategories.find(c => c.id === expandedCategory);
                if (!category) return null;
                return (
                  <Card className="mb-4">
                    <CardHeader className="py-3 sm:py-4 px-3 sm:px-6">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`shrink-0 ${category.color}`}>
                          {category.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm sm:text-base">{category.title}</CardTitle>
                          <CardDescription className="text-[10px] sm:text-xs">{category.articles.length} artigos</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-3 sm:px-6 space-y-3">
                      {expandedArticle !== null && category.articles[expandedArticle] && (
                        <div className="p-3 sm:p-4 rounded-xl border border-primary/20 bg-primary/5">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-xs sm:text-sm text-foreground">{category.articles[expandedArticle].title}</h4>
                            <Badge variant="secondary" className={`text-[9px] sm:text-[10px] shrink-0 ${getDifficultyColor(category.articles[expandedArticle].difficulty)}`}>
                              {category.articles[expandedArticle].difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{category.articles[expandedArticle].content}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {category.articles.map((article, index) => (
                          <button
                            key={index}
                            onClick={() => setExpandedArticle(expandedArticle === index ? null : index)}
                            className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all ${
                              expandedArticle === index
                                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                                : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/20"
                            }`}
                          >
                            <h4 className="font-medium text-[11px] sm:text-xs text-foreground leading-snug mb-1.5">{article.title}</h4>
                            <Badge variant="secondary" className={`text-[9px] sm:text-[10px] ${getDifficultyColor(article.difficulty)}`}>
                              {article.difficulty}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

            {/* Help Categories */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Guia por Funcionalidade</h2>
                <button
                  onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {categoriesExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Recolher</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Expandir</span>
                    </>
                  )}
                </button>
              </div>
              {categoriesExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {filteredCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => { setExpandedArticle(null); setExpandedCategory(expandedCategory === category.id ? null : category.id); }}
                      className={`text-left p-3 sm:p-4 rounded-xl border transition-all ${
                        expandedCategory === category.id
                          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                          : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/20"
                      }`}
                    >
                      <div className={`mb-2 ${category.color}`}>
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug mb-0.5">{category.title}</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2">{category.description}</p>
                      <Badge variant="secondary" className="text-[9px] sm:text-[10px]">
                        {category.articles.length} artigos
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Perguntas Frequentes</h2>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {faqCategories.slice(0, 6).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setFaqFilter(category.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                        faqFilter === category.id
                          ? "bg-primary text-primary-foreground ring-1 ring-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <span className={faqFilter === category.id ? "text-current" : category.color}>
                        {category.icon}
                      </span>
                      <span>{category.label}</span>
                    </button>
                  ))}
                  <div className="relative">
                    <button
                      onClick={() => {
                        const dropdown = document.getElementById('faq-more-categories');
                        dropdown?.classList.toggle('hidden');
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
                    >
                      <ChevronDown className="h-3 w-3" />
                      <span>Mais</span>
                    </button>
                    <div id="faq-more-categories" className="hidden absolute right-0 top-full mt-1 w-40 bg-popover border rounded-lg shadow-lg z-10 p-1">
                      {faqCategories.slice(6).map((category) => (
                        <button
                          key={category.id}
                          onClick={() => { setFaqFilter(category.id); document.getElementById('faq-more-categories')?.classList.add('hidden'); }}
                          className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition-colors"
                        >
                          <span className={category.color}>{category.icon}</span>
                          <span>{category.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {(faqShowAll ? filteredFaq : filteredFaq.slice(0, 6)).map((item, index) => (
                  <FAQCard
                    key={`faq-${item.question}-${index}`}
                    item={item}
                    getDifficultyColor={getDifficultyColor}
                    getDifficultyLabel={getDifficultyLabel}
                    faqCategories={faqCategories}
                  />
                ))}
              </div>

              {/* Show More Button */}
              {filteredFaq.length > 6 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setFaqShowAll(!faqShowAll)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all border border-border/50 hover:border-border"
                  >
                    {faqShowAll ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        <span>Mostrar menos</span>
                        <span className="text-muted-foreground">({filteredFaq.length - 6})</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        <span>Ver mais perguntas</span>
                        <span className="text-muted-foreground">({filteredFaq.length - 6})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Empty State */}
              {filteredFaq.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-sm sm:text-base font-medium text-foreground mb-1 sm:mb-2">Nenhuma pergunta encontrada</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                    Tente ajustar os filtros ou buscar por outros termos para encontrar o que você procura.
                  </p>
                </div>
              )}
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
