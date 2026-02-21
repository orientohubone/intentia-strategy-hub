import React from "react";
import {
  Search,
  HelpCircle,
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
  DollarSign,
  MessageCircle,
  Activity,
  ArrowRight,
  Inbox,
  CheckCheck,
} from "lucide-react";
import type { HelpCategory, FAQItem, FAQCategoryFilter } from "./helpTypes";

// =====================================================
// HELP CATEGORIES (Guia por Funcionalidade)
// =====================================================

export const helpCategories: HelpCategory[] = [
  {
    id: "getting-started",
    title: "Primeiros Passos",
    description: "Como começar a usar a plataforma",
    icon: <Zap className="h-5 w-5" />,
    color: "text-blue-600",
    videoId: "",
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
    ],
  },
  {
    id: "url-analysis",
    title: "Diagnóstico de URL",
    description: "Análise heurística automática",
    icon: <Target className="h-5 w-5" />,
    color: "text-orange-600",
    videoId: "",
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
    ],
  },
  {
    id: "ai-analysis",
    title: "Análise por IA",
    description: "Insights aprofundados com IA",
    icon: <Sparkles className="h-5 w-5" />,
    color: "text-purple-600",
    videoId: "",
    articles: [
      {
        title: "Configurando API keys",
        content: "Configurações → Integrações de IA. Adicione keys do Gemini ou Claude. Validação em tempo real.",
        difficulty: "Intermediário",
      },
      {
        title: "Executando análise",
        content: "Selecione modelo, clique em 'Analisar com IA'. Card interativo aparece com progresso e sugestões (café, água, e-mails). Gera resumo, SWOT, recomendações e plano de ação.",
        difficulty: "Iniciante",
      },
    ],
  },
  {
    id: "benchmark",
    title: "Benchmark Competitivo",
    description: "Compare-se com concorrentes",
    icon: <BarChart3 className="h-5 w-5" />,
    color: "text-green-600",
    videoId: "",
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
    ],
  },
  {
    id: "channels",
    title: "Scores por Canal",
    description: "Prontidão para cada canal",
    icon: <Globe className="h-5 w-5" />,
    color: "text-sky-600",
    videoId: "",
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
    ],
  },
  {
    id: "insights",
    title: "Insights Estratégicos",
    description: "Alertas e oportunidades",
    icon: <Lightbulb className="h-5 w-5" />,
    color: "text-yellow-600",
    videoId: "",
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
    ],
  },
  {
    id: "tactical",
    title: "Plano Tático",
    description: "Estruturas de campanha",
    icon: <Crosshair className="h-5 w-5" />,
    color: "text-rose-600",
    videoId: "",
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
    ],
  },
  {
    id: "structured-data",
    title: "Dados Estruturados",
    description: "JSON-LD, Open Graph, Twitter",
    icon: <Database className="h-5 w-5" />,
    color: "text-teal-600",
    videoId: "",
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
    ],
  },
  {
    id: "structured-data-generator",
    title: "Gerador de Dados",
    description: "Snippets prontos baseados na concorrência",
    icon: <Wand2 className="h-5 w-5" />,
    color: "text-orange-600",
    videoId: "",
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
    ],
  },
  {
    id: "audiences",
    title: "Públicos-Alvo",
    description: "Audiências B2B",
    icon: <Users className="h-5 w-5" />,
    color: "text-indigo-600",
    videoId: "",
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
    ],
  },
  {
    id: "seo-performance",
    title: "SEO & Performance",
    description: "Core Web Vitals, SERP, backlinks e visibilidade IA",
    icon: <Gauge className="h-5 w-5" />,
    color: "text-cyan-600",
    videoId: "",
    articles: [
      {
        title: "Fluxo de análise",
        content: "Selecione um projeto → a última análise salva é restaurada automaticamente. Clique 'Analisar' para rodar uma nova. Resultados incluem PageSpeed, SERP, backlinks, concorrentes e visibilidade em LLMs.",
        difficulty: "Iniciante",
      },
      {
        title: "PageSpeed Insights",
        content: "Core Web Vitals (LCP, FID, CLS), scores de Performance, SEO, Acessibilidade e Boas Práticas. Dados reais do Google. Mobile e Desktop.",
        difficulty: "Intermediário",
      },
      {
        title: "Ranking Google (SERP)",
        content: "Busca até 10 termos no Google via Serper.dev. Mostra posição, título, domínio e snippet. Identifica automaticamente se seu site aparece nos resultados.",
        difficulty: "Intermediário",
      },
      {
        title: "Inteligência SEO",
        content: "Backlinks e autoridade de domínio, monitoramento de concorrentes e visibilidade em LLMs (Gemini/Claude). Requer API keys configuradas para LLMs.",
        difficulty: "Avançado",
      },
      {
        title: "Histórico e auto-restore",
        content: "Análises são salvas por projeto. Ao selecionar um projeto, a última análise é restaurada automaticamente. Histórico com até 10 análises anteriores, restauração com um clique.",
        difficulty: "Iniciante",
      },
      {
        title: "Exportação",
        content: "Exporte resultados em PDF, HTML ou JSON. Inclui PageSpeed, SERP e inteligência SEO.",
        difficulty: "Iniciante",
      },
      {
        title: "Monitoramento SEO inteligente",
        content: "A tela de monitoramento reúne timeline por data, filtros por dispositivo, mudanças detectadas por ciclo e snapshots de concorrentes.",
        difficulty: "Intermediário",
      },
      {
        title: "Monitoramento live (agendado)",
        content: "Ao ativar o modo live, o sistema cria ciclos automáticos por projeto e salva snapshots contínuos para análise histórica.",
        difficulty: "Avançado",
      },
    ],
  },
  {
    id: "integrations",
    title: "Integrações",
    description: "Conecte contas de anúncios",
    icon: <Plug className="h-5 w-5" />,
    color: "text-blue-600",
    videoId: "",
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
    ],
  },
  {
    id: "exports",
    title: "Exportação",
    description: "PDF, CSV, JSON, HTML",
    icon: <Download className="h-5 w-5" />,
    color: "text-emerald-600",
    videoId: "",
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
    ],
  },
  {
    id: "settings",
    title: "Configurações",
    description: "Perfil, tema e API keys",
    icon: <Settings className="h-5 w-5" />,
    color: "text-gray-600",
    videoId: "",
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
    ],
  },
  {
    id: "notifications",
    title: "Notificações",
    description: "Alertas e feedback em tempo real",
    icon: <Bell className="h-5 w-5" />,
    color: "text-purple-600",
    videoId: "",
    articles: [
      {
        title: "Sistema de notificações",
        content: "Sino no header mostra contador de notificações não lidas. Dropdown com lista completa.",
        difficulty: "Iniciante",
      },
      {
        title: "Notificações de análise",
        content: "Análises por IA geram notificações automáticas quando concluídas. Link direto para resultados.",
        difficulty: "Intermediário",
      },
      {
        title: "Cards interativos",
        content: "Durante análises longas, cards aparecem com sugestões (café, água, e-mails) e progresso em tempo real.",
        difficulty: "Intermediário",
      },
      {
        title: "Gerenciando notificações",
        content: "Marque como lida individualmente ou todas de uma vez. Exclua notificações desnecessárias.",
        difficulty: "Iniciante",
      },
    ],
  },
  {
    id: "operations",
    title: "Operações",
    description: "Gestão de campanhas",
    icon: <Megaphone className="h-5 w-5" />,
    color: "text-orange-600",
    videoId: "",
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
        content: "Com métricas registradas, clique em 'Análise por IA'. Card interativo aparece com progresso e sugestões. Gera saúde geral, KPIs vs benchmark, análise de funil e plano de ação.",
        difficulty: "Avançado",
      },
    ],
  },
  {
    id: "budget",
    title: "Gestão de Budget",
    description: "Alocação e pacing",
    icon: <DollarSign className="h-5 w-5" />,
    color: "text-emerald-600",
    videoId: "",
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
    ],
  },
  {
    id: "calendar",
    title: "Calendário",
    description: "Visualização de campanhas",
    icon: <CalendarDays className="h-5 w-5" />,
    color: "text-indigo-600",
    videoId: "",
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
    ],
  },
  {
    id: "security",
    title: "Segurança & Backup",
    description: "Proteção de dados",
    icon: <HardDrive className="h-5 w-5" />,
    color: "text-red-600",
    videoId: "",
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
    ],
  },
  {
    id: "support",
    title: "Central de Suporte",
    description: "Chamados, chat e acompanhamento",
    icon: <MessageCircle className="h-5 w-5" />,
    color: "text-violet-600",
    videoId: "",
    articles: [
      {
        title: "Abrindo um chamado",
        content: "Suporte → Novo Chamado. Selecione categoria, prioridade, assunto e descrição. Você recebe um número de protocolo imediato.",
        difficulty: "Iniciante",
      },
      {
        title: "Agrupamento por status",
        content: "Chamados são agrupados por status: Aberto, Em Análise, Em Andamento, Aguardando Cliente, Resolvido e Cancelado. Grupos ativos abrem automaticamente. Use os botões expandir/recolher para navegar.",
        difficulty: "Iniciante",
      },
      {
        title: "Respondendo e conversando",
        content: "Clique no ícone de mensagem para expandir o chamado. Responda diretamente ou abra a conversa completa (plano Professional+). Mensagens do suporte aparecem em tempo real.",
        difficulty: "Iniciante",
      },
      {
        title: "Status e SLA",
        content: "Cada chamado tem SLA de resposta. Status: Aberto → Em Análise → Em Andamento → Resolvido. Alertas visuais para prazos próximos ou atrasados.",
        difficulty: "Intermediário",
      },
      {
        title: "Contato direto",
        content: "Telefone: +55 (14) 99861-8547 (Seg-Sex, 9h-18h). Email: suporte@intentia.com.br (resposta em até 24h). Tempo médio de resposta: ~2 horas.",
        difficulty: "Iniciante",
      },
    ],
  },
];

// =====================================================
// FAQ ITEMS
// =====================================================

export const faqItems: FAQItem[] = [
  {
    question: "Como funciona a análise heurística de URL?",
    answer: "Fetch do HTML e análise automática de 6 dimensões com score 0-100 + insights gerados na hora.",
    category: "analise",
    difficulty: "iniciante",
    icon: <Target className="h-4 w-4" />,
    color: "text-orange-600",
  },
  {
    question: "Preciso pagar para usar a análise por IA?",
    answer: "Plataforma grátis; você usa sua API key (Gemini/Claude) e paga consumo direto ao provedor.",
    category: "ia",
    difficulty: "iniciante",
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-purple-600",
  },
  {
    question: "Quais modelos de IA são suportados?",
    answer: "Gemini (2.0/2.5/3 Flash/Pro) e Claude (Sonnet, Haiku, Opus). Selecione antes de rodar a IA.",
    category: "ia",
    difficulty: "intermediario",
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-purple-600",
  },
  {
    question: "Como funciona o benchmark competitivo?",
    answer: "Adicione concorrentes e receba SWOT + scores comparativos; IA opcional enriquece gaps e plano de ação.",
    category: "benchmark",
    difficulty: "intermediario",
    icon: <BarChart3 className="h-4 w-4" />,
    color: "text-green-600",
  },
  {
    question: "Quais formatos de exportação estão disponíveis?",
    answer: "PDF, CSV e JSON/Markdown/HTML das análises e dados tabulares por projeto ou seção.",
    category: "exports",
    difficulty: "iniciante",
    icon: <Download className="h-4 w-4" />,
    color: "text-emerald-600",
  },
  {
    question: "Quais planos estão disponíveis?",
    answer: "Starter — grátis | Professional — R$147/mês | Enterprise — personalizado",
    category: "planos",
    difficulty: "iniciante",
    icon: <DollarSign className="h-4 w-4" />,
    color: "text-blue-600",
  },
  {
    question: "Posso usar a plataforma no modo escuro?",
    answer: "Sim. Clique no ícone sol/lua no header. Páginas públicas ficam sempre claras.",
    category: "configuracoes",
    difficulty: "iniciante",
    icon: <Moon className="h-4 w-4" />,
    color: "text-gray-600",
  },
  {
    question: "Meus dados estão seguros?",
    answer: "RLS em todas as tabelas, audit log, backups, soft delete, rate limiting e keys isoladas por usuário.",
    category: "seguranca",
    difficulty: "intermediario",
    icon: <Shield className="h-4 w-4" />,
    color: "text-red-600",
  },
  {
    question: "Como recebo notificações?",
    answer: "Fluxo: evento/aviso → push em tempo real → sino → dropdown → marcar como lida.",
    answerInline: (
      <>
        <Zap className="h-4 w-4 text-primary" />
        <span>Evento/Análise</span>
        <ArrowRight className="h-4 w-4 text-primary" />
        <Activity className="h-4 w-4 text-primary" />
        <span>Push em tempo real</span>
        <ArrowRight className="h-4 w-4 text-primary" />
        <Bell className="h-4 w-4 text-primary" />
        <span>Sino</span>
        <ArrowRight className="h-4 w-4 text-primary" />
        <Inbox className="h-4 w-4 text-primary" />
        <span>Dropdown</span>
        <ArrowRight className="h-4 w-4 text-primary" />
        <CheckCheck className="h-4 w-4 text-primary" />
        <span>Marcar como lida</span>
      </>
    ),
    category: "configuracoes",
    difficulty: "iniciante",
    icon: <Bell className="h-4 w-4" />,
    color: "text-gray-600",
  },
  {
    question: "O que são os cards interativos durante análises?",
    answer: "Quando você inicia uma análise por IA (em projetos ou campanhas), um card interativo aparece com progresso em tempo real e sugestões produtivas (pegar um café, beber água, verificar e-mails). O card mostra o estágio atual da análise e sugestões que mudam a cada 4 segundos.",
    category: "configuracoes",
    difficulty: "iniciante",
    icon: <Sparkles className="h-4 w-4" />,
    color: "text-purple-600",
  },
  {
    question: "Por que o contador de notificações às vezes mostra números altos?",
    answer: "O contador pode acumular temporariamente devido a múltiplos eventos em tempo real, mas se sincroniza automaticamente a cada 5 segundos com o valor correto. Isso garante que você sempre veja o número exato de notificações não lidas.",
    category: "configuracoes",
    difficulty: "intermediario",
    icon: <Bell className="h-4 w-4" />,
    color: "text-gray-600",
  },
  {
    question: "O que é o Plano Tático e como funciona?",
    answer: "Plano Tático converte estratégia em campanhas por canal (tipo, funil, lances, copy, segmentação, testes) com templates B2B.",
    category: "tatico",
    difficulty: "intermediario",
    icon: <Crosshair className="h-4 w-4" />,
    color: "text-rose-600",
  },
  {
    question: "Quais templates táticos estão disponíveis?",
    answer: "6 templates B2B (SaaS, Consultoria, E-commerce/Indústria, Educação, Fintech, Saúde) pré-preenchidos por canal.",
    category: "tatico",
    difficulty: "iniciante",
    icon: <Crosshair className="h-4 w-4" />,
    color: "text-rose-600",
  },
  {
    question: "Como os públicos-alvo se conectam ao plano tático?",
    answer: "Públicos vinculados ao projeto aparecem no Plano Tático; importe com 1 clique e já traz targeting preenchido.",
    category: "tatico",
    difficulty: "intermediario",
    icon: <Users className="h-4 w-4" />,
    color: "text-indigo-600",
  },
  {
    question: "O que é o Playbook Gamificado?",
    answer: "O Playbook é gerado ao clicar em 'Rodar Plano' na visão geral do plano tático. Ele analisa todos os canais configurados e gera diretivas de execução priorizadas com KPIs, ações específicas e nível de prioridade. É uma forma gamificada de transformar o plano tático em ações concretas.",
    category: "tatico",
    difficulty: "avancado",
    icon: <BookOpen className="h-4 w-4" />,
    color: "text-rose-600",
  },
  {
    question: "O que são os dados estruturados extraídos pela análise?",
    answer: "A Intentia extrai automaticamente 4 tipos de dados estruturados de cada URL analisada: JSON-LD (schema.org, usado pelo Google), Open Graph (meta tags para Facebook/LinkedIn), Twitter Card (meta tags para Twitter/X) e Microdata. Esses dados mostram como a página se apresenta para mecanismos de busca e redes sociais.",
    category: "dados",
    difficulty: "intermediario",
    icon: <Database className="h-4 w-4" />,
    color: "text-teal-600",
  },
  {
    question: "Posso comparar dados estruturados com concorrentes?",
    answer: "Sim! Ao adicionar URLs de concorrentes ao projeto, a Intentia extrai os dados estruturados de cada um. No visualizador unificado, use as abas para alternar entre seu site e cada concorrente, comparando JSON-LD, Open Graph, Twitter Card e Microdata lado a lado.",
    category: "dados",
    difficulty: "iniciante",
    icon: <Database className="h-4 w-4" />,
    color: "text-teal-600",
  },
  {
    question: "O que é o Gerador de Dados Estruturados?",
    answer: "É uma ferramenta exclusiva que analisa os dados estruturados dos seus concorrentes e gera snippets de código prontos para você copiar e colar no seu site. Ele identifica gaps (o que a concorrência tem e você não), classifica por criticidade e gera JSON-LD, Open Graph e Twitter Card pré-preenchidos com dados do seu projeto.",
    category: "dados",
    difficulty: "intermediario",
    icon: <Wand2 className="h-4 w-4" />,
    color: "text-orange-600",
  },
  {
    question: "Preciso saber programar para usar o Gerador de Dados Estruturados?",
    answer: "Não! Os snippets são gerados prontos para uso. Basta copiar o código e colar no <head> do seu HTML (ou pedir ao seu desenvolvedor). JSON-LD vai dentro de tags <script>, e meta tags OG/Twitter vão diretamente no <head>. O gerador pré-preenche os valores com dados do seu projeto — você só precisa personalizar os placeholders.",
    category: "dados",
    difficulty: "iniciante",
    icon: <Wand2 className="h-4 w-4" />,
    color: "text-orange-600",
  },
  {
    question: "Como funciona a análise de performance por IA?",
    answer: "Quando uma campanha tem métricas registradas, o botão de IA aparece. Selecione o modelo (Gemini ou Claude) e clique para executar. A IA analisa todos os KPIs, compara com benchmarks do mercado, identifica gargalos no funil, avalia eficiência de budget, lista forças/fraquezas, riscos com mitigação, gera um plano de ação priorizado e faz projeções para 30 e 90 dias. Os resultados ficam salvos na campanha.",
    category: "operacoes",
    difficulty: "avancado",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-cyan-600",
  },
  {
    question: "O que aparece no card de campanhas do Dashboard?",
    answer: "O Dashboard mostra as campanhas mais recentes com nome, projeto vinculado, badges coloridos de canal (Google/Meta/LinkedIn/TikTok) e status (Rascunho/Ativa/Pausada/Concluída/Arquivada), além de uma barra de pacing de budget. Você pode expandir para ver mais campanhas ou clicar em 'Ver todas' para ir à página de Operações.",
    category: "operacoes",
    difficulty: "iniciante",
    icon: <Megaphone className="h-4 w-4" />,
    color: "text-orange-600",
  },
  {
    question: "O que é o Comparativo Tático vs Real?",
    answer: "É um gap analysis automático que cruza o plano tático de cada canal com as métricas reais das campanhas. O sistema verifica aderência estrutural (tipo de campanha, estágio de funil, estratégia de lances) e gap de métricas (planejado vs real com desvio percentual). O score de aderência combina 30% estrutura + 70% métricas, com status visual por canal.",
    category: "operacoes",
    difficulty: "intermediario",
    icon: <Gauge className="h-4 w-4" />,
    color: "text-cyan-600",
  },
  {
    question: "Como funciona o Calendário de Campanhas?",
    answer: "O Calendário de Campanhas oferece duas vistas: Calendário (grade mensal com barras coloridas por canal) e Timeline (Gantt horizontal com 8 semanas visíveis). Ambas mostram campanhas com datas definidas, com cores por canal e opacidade por status. Clique em uma campanha no calendário para ver detalhes como duração, budget pacing e métricas. Na timeline, passe o mouse para tooltips ricos. Campanhas que encerram em 7 dias recebem alerta visual. Filtros por canal e status estão disponíveis em ambas as vistas.",
    category: "operacoes",
    difficulty: "intermediario",
    icon: <CalendarDays className="h-4 w-4" />,
    color: "text-indigo-600",
  },
  {
    question: "Como funcionam os alertas automáticos de performance?",
    answer: "O sistema avalia 11 regras automaticamente para cada campanha ativa ou pausada. Exemplos: budget estourado ou quase esgotado, CTR abaixo do mínimo por canal, CPC/CPA acima dos benchmarks, ROAS negativo, sem conversões, CAC:LTV desfavorável e ROI negativo. Os alertas aparecem dentro de cada grupo de projeto em Operações, com filtros por severidade (crítico, atenção, info) e categoria (budget, eficiência, conversão, qualidade, pacing, tendência).",
    category: "operacoes",
    difficulty: "intermediario",
    icon: <Zap className="h-4 w-4" />,
    color: "text-orange-600",
  },
  {
    question: "Como conecto minha conta do Google Ads, Meta Ads ou LinkedIn Ads?",
    answer: "Vá em Integrações e clique em 'Conectar' no card do provider desejado. Você será redirecionado para a página de autorização do provider, onde autoriza o acesso à sua conta de anúncios. Após autorizar, você volta automaticamente ao Intentia com status 'Conectado'. O fluxo usa OAuth 2.0 — nós nunca vemos sua senha. Cada usuário conecta sua própria conta.",
    category: "integracoes",
    difficulty: "iniciante",
    icon: <Plug className="h-4 w-4" />,
    color: "text-blue-600",
  },
  {
    question: "Os dados das minhas contas de anúncios ficam seguros?",
    answer: "Sim. Os tokens de acesso são isolados por usuário via Row Level Security (RLS) — nenhum outro usuário pode acessá-los. O fluxo OAuth usa parâmetro 'state' com expiração de 10 minutos para prevenir ataques. Tokens expirados são renovados automaticamente. Se a renovação falhar, a integração é marcada como 'Expirada' e você precisa reconectar.",
    category: "integracoes",
    difficulty: "intermediario",
    icon: <Shield className="h-4 w-4" />,
    color: "text-red-600",
  },
  {
    question: "O que acontece quando sincronizo dados de anúncios?",
    answer: "A sincronização busca suas campanhas e métricas (impressões, cliques, conversões, custo, receita) dos últimos 30 dias via API oficial do provider. Os dados são inseridos automaticamente no módulo de Operações, alimentando KPIs, alertas de performance, gestão de budget e comparativo tático vs real. Você pode sincronizar manualmente ou configurar frequência automática.",
    category: "integracoes",
    difficulty: "intermediario",
    icon: <Globe className="h-4 w-4" />,
    color: "text-sky-600",
  },
  {
    question: "Preciso configurar algo no Google/Meta/LinkedIn/TikTok?",
    answer: "A configuração dos providers é feita pela equipe Intentia (credenciais OAuth do app). Você como usuário só precisa clicar em 'Conectar' e autorizar sua conta de anúncios. Não é necessário criar apps ou configurar APIs — tudo já está pronto. Basta ter uma conta ativa no provider desejado.",
    category: "integracoes",
    difficulty: "iniciante",
    icon: <Settings className="h-4 w-4" />,
    color: "text-gray-600",
  },
  {
    question: "Posso cancelar meu plano a qualquer momento?",
    answer: "Sim! Todos os planos são flexíveis, sem compromisso de longo prazo. Você pode fazer upgrade, downgrade ou cancelar quando quiser. As alterações são refletidas na próxima cobrança.",
    category: "planos",
    difficulty: "iniciante",
    icon: <DollarSign className="h-4 w-4" />,
    color: "text-blue-600",
  },
  {
    question: "Como funciona o histórico de análises SEO?",
    answer: "Cada análise SEO pode ser salva clicando em 'Salvar análise'. Ao selecionar um projeto, a última análise salva é restaurada automaticamente — você vê os resultados imediatamente sem precisar rodar uma nova análise. O histórico guarda até 10 análises por projeto, com scores, estratégia (mobile/desktop) e data. Você pode restaurar qualquer análise anterior com um clique.",
    category: "analise",
    difficulty: "iniciante",
    icon: <Gauge className="h-4 w-4" />,
    color: "text-cyan-600",
  },
  {
    question: "Como funciona o Monitoramento SEO Inteligente (live)?",
    answer: "No módulo de Monitoramento SEO, você pode rodar ciclos manuais ou ativar o live por projeto. Cada ciclo cria um snapshot com SEO, performance, posição de SERP, sinais de mudança e snapshots de concorrentes. A timeline é agrupada por data e permite expandir/recolher grupos, filtrar por dispositivo e exibir apenas ciclos com mudanças relevantes.",
    category: "analise",
    difficulty: "intermediario",
    icon: <Activity className="h-4 w-4" />,
    color: "text-cyan-600",
  },
  {
    question: "Como funciona o Ranking Google (SERP)?",
    answer: "Na aba Inteligência do SEO & Performance, insira até 10 termos separados por vírgula. O sistema consulta o Google via Serper.dev e retorna os 10 primeiros resultados orgânicos para cada termo, incluindo posição, título, domínio e snippet. Se o domínio do seu projeto aparecer nos resultados, ele é destacado automaticamente com a posição encontrada.",
    category: "analise",
    difficulty: "intermediario",
    icon: <Gauge className="h-4 w-4" />,
    color: "text-cyan-600",
  },
  {
    question: "Como funciona o agrupamento de chamados?",
    answer: "Os chamados são agrupados automaticamente por status: Aberto, Em Análise, Em Andamento, Aguardando Cliente, Resolvido e Cancelado. Grupos com chamados ativos abrem automaticamente ao carregar a página. Chamados resolvidos e cancelados ficam recolhidos para não poluir a visualização. Use os botões de expandir/recolher todos no topo da lista.",
    category: "suporte",
    difficulty: "iniciante",
    icon: <MessageCircle className="h-4 w-4" />,
    color: "text-violet-600",
  },
  {
    question: "Como acompanho a resposta do suporte?",
    answer: "Ao abrir um chamado, você recebe um número de protocolo. Na Central de Suporte, clique no ícone de mensagem do chamado para expandir e ver as últimas mensagens. Respostas do suporte aparecem em tempo real. No plano Professional ou Enterprise, você pode abrir a conversa completa em um dialog dedicado.",
    category: "suporte",
    difficulty: "iniciante",
    icon: <MessageCircle className="h-4 w-4" />,
    color: "text-violet-600",
  },
  {
    question: "Como faço backup dos meus dados?",
    answer: "Vá em Configurações → Backup & Segurança de Dados. Você pode criar backups manuais (snapshot completo no servidor) ou exportar todos os dados em JSON para download local. Backups automáticos também são criados antes de exclusões importantes como deletar projetos.",
    category: "seguranca",
    difficulty: "intermediario",
    icon: <HardDrive className="h-4 w-4" />,
    color: "text-red-600",
  },
  {
    question: "O que acontece se eu excluir um projeto por acidente?",
    answer: "Projetos excluídos ficam em estado de 'soft delete' por 30 dias antes da exclusão permanente. Além disso, um backup automático é criado antes da exclusão. Você pode recuperar seus dados através dos backups salvos em Configurações.",
    category: "seguranca",
    difficulty: "iniciante",
    icon: <HardDrive className="h-4 w-4" />,
    color: "text-red-600",
  },
];

// =====================================================
// FAQ CATEGORY FILTERS
// =====================================================

export const faqCategoryFilters: FAQCategoryFilter[] = [
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
  { id: "suporte", label: "Suporte", icon: <MessageCircle className="h-4 w-4" />, color: "text-violet-600" },
];
