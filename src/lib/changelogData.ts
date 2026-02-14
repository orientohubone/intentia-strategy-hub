import {
  Rocket,
  Smartphone,
  Brain,
  BarChart3,
  Shield,
  Megaphone,
  Plug,
  Home,
  type LucideIcon,
} from "lucide-react";

export interface ChangelogSlide {
  type: "context" | "build" | "result";
  title: string;
  content: string;
  highlights?: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  slides: ChangelogSlide[];
  tags: string[];
}

export const changelogEntries: ChangelogEntry[] = [
  {
    version: "4.2.0",
    date: "14 Fev 2026",
    title: "Home & Sidebar Refinada",
    tagline: "Nova tela de início + sidebar com UX premium",
    icon: Home,
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    tags: ["UX", "Navigation", "Home"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "O Dashboard acumulava muitas responsabilidades: onboarding, boas-vindas, métricas, projetos e insights. O usuário não tinha um ponto de partida claro ao entrar na plataforma.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "Separamos a experiência em duas telas distintas. A nova Home concentra onboarding, boas-vindas e ações rápidas. O Dashboard ficou focado no operacional.",
        highlights: [
          "Nova página Home com welcome banner, onboarding e quick actions",
          "Dashboard simplificado e focado em métricas operacionais",
          "Sidebar com scrollbar slim laranja quase imperceptível",
          "Bottom nav icon-only com tooltips e efeito de elevação",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Experiência de primeiro acesso muito mais clara. O usuário sabe exatamente o que fazer ao entrar. A sidebar ganhou mais espaço vertical e uma interação premium com tooltips e elevação nos ícones.",
      },
    ],
  },
  {
    version: "4.0.0",
    date: "13 Fev 2026",
    title: "Integrações com Ads",
    tagline: "OAuth com Google, Meta, LinkedIn e TikTok Ads",
    icon: Plug,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    tags: ["Integrações", "OAuth", "Ads"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "Empresas B2B gerenciam campanhas em múltiplas plataformas sem uma visão unificada. Dados ficam fragmentados entre Google Ads, Meta, LinkedIn e TikTok.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "Sistema completo de OAuth para conectar contas de anúncios. Edge Functions para autenticação, callback e sincronização de dados.",
        highlights: [
          "OAuth flow para 4 plataformas de ads",
          "Edge Functions: oauth-connect, oauth-callback, integration-sync",
          "Sincronização automática de campanhas e métricas",
          "Página de integrações com status em tempo real",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Visão unificada de todas as campanhas em um só lugar. Dados sincronizados automaticamente. Base para relatórios cross-platform e otimização de budget.",
      },
    ],
  },
  {
    version: "3.5.0",
    date: "12 Fev 2026",
    title: "Campanhas & Operacional",
    tagline: "CRUD de campanhas, métricas e gestão de budget",
    icon: Megaphone,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    tags: ["Campanhas", "Budget", "Métricas"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "A plataforma era puramente estratégica. Faltava a camada operacional para gerenciar campanhas, acompanhar métricas e controlar orçamentos.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "Módulo completo de gestão operacional com campanhas, métricas de performance e controle de budget por projeto.",
        highlights: [
          "CRUD completo de campanhas com status e objetivos",
          "Dashboard operacional com métricas em tempo real",
          "Gestão de budget por projeto e canal",
          "Histórico de performance com gráficos",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Estratégia e operação no mesmo lugar. O usuário planeja com dados estratégicos e executa com controle operacional completo.",
      },
    ],
  },
  {
    version: "3.0.0",
    date: "10 Fev 2026",
    title: "Admin Panel & Feature Flags",
    tagline: "Painel administrativo com controle granular de features",
    icon: Shield,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    tags: ["Admin", "Feature Flags", "Planos"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "Sem controle centralizado sobre features e planos. Não havia como habilitar/desabilitar funcionalidades por plano ou por usuário de forma dinâmica.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "Admin Panel completo com autenticação separada (CNPJ), feature flags, controle por plano e gestão de usuários.",
        highlights: [
          "25 feature flags com 5 estados possíveis",
          "Controle por plano: Starter, Professional, Enterprise",
          "Overrides por usuário individual",
          "Audit log de ações administrativas",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Controle total sobre o que cada usuário pode acessar. Deploy de features sem código. Monetização granular por plano.",
      },
    ],
  },
  {
    version: "2.5.0",
    date: "8 Fev 2026",
    title: "Benchmark & IA",
    tagline: "Análise competitiva com SWOT e enriquecimento por IA",
    icon: BarChart3,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    tags: ["Benchmark", "IA", "SWOT"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "Empresas investem em mídia sem saber como estão posicionadas frente aos concorrentes. Análise competitiva era manual e demorada.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "Sistema de benchmark automatizado com análise SWOT, gap analysis e enriquecimento por IA usando API keys do próprio usuário.",
        highlights: [
          "Benchmark competitivo com scores comparativos",
          "Análise SWOT automática por concorrente",
          "Gap analysis com recomendações",
          "Integração com Gemini e Claude para insights profundos",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Visão clara do posicionamento competitivo. Decisões de investimento baseadas em dados reais, não achismo. IA como copiloto estratégico.",
      },
    ],
  },
  {
    version: "2.3.0",
    date: "7 Fev 2026",
    title: "Mobile-First",
    tagline: "Toda a plataforma responsiva e otimizada para mobile",
    icon: Smartphone,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    tags: ["Mobile", "Responsivo", "UX"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "A plataforma foi construída desktop-first. A experiência mobile era quebrada — sidebar sobreposta, botões cortados, tabelas ilegíveis.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "Refatoração completa mobile-first de todas as 8 páginas protegidas, sidebar, header e componentes compartilhados.",
        highlights: [
          "DashboardLayout compartilhado com sidebar overlay mobile",
          "Header com hamburger menu e busca adaptativa",
          "Todas as páginas com breakpoints Tailwind (sm, md, lg)",
          "Notificações full-width mobile, BackToHome scroll-aware",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Experiência consistente em qualquer dispositivo. Estrategistas podem consultar dados e tomar decisões direto do celular.",
      },
    ],
  },
  {
    version: "2.0.0",
    date: "5 Fev 2026",
    title: "Análise de IA",
    tagline: "Diagnóstico heurístico + análise profunda por IA",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    tags: ["IA", "Diagnóstico", "URL"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "Avaliar a prontidão de um site para mídia paga era subjetivo. Não existia uma forma automatizada de diagnosticar proposta de valor, SEO, conversão e jornada.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "Pipeline de análise em duas camadas: heurística automática (fetch HTML + regex) e análise profunda por IA com API keys do usuário.",
        highlights: [
          "Edge Function analyze-url com fetch e parsing de HTML",
          "6 dimensões de score: proposta de valor, clareza, jornada, SEO, conversão, conteúdo",
          "Geração automática de insights estratégicos",
          "Integração com Gemini e Claude para análise aprofundada",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Diagnóstico objetivo em segundos. Empresas sabem exatamente onde investir antes de gastar um centavo em mídia. Score de prontidão como norte estratégico.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "1 Fev 2026",
    title: "Lançamento",
    tagline: "O início da Intentia Strategy Hub",
    icon: Rocket,
    color: "text-primary",
    bgColor: "bg-primary/10",
    tags: ["Launch", "MVP", "Fundação"],
    slides: [
      {
        type: "context",
        title: "O Problema",
        content: "Empresas B2B investem em mídia paga sem estratégia. Não existe diagnóstico prévio, não existe benchmark, não existe score de prontidão. O resultado: dinheiro desperdiçado.",
      },
      {
        type: "build",
        title: "O que Construímos",
        content: "MVP da Intentia com projetos, diagnóstico de URL, insights estratégicos, scores por canal e dashboard centralizado.",
        highlights: [
          "CRUD de projetos com análise de URL",
          "Score de prontidão por canal (Google, Meta, LinkedIn, TikTok)",
          "Insights estratégicos automáticos",
          "Dashboard com métricas e alertas",
        ],
      },
      {
        type: "result",
        title: "O Resultado",
        content: "Nasceu a plataforma que transforma achismo em estratégia. O conceito de 'estratégia antes da mídia' materializado em produto. Quase 8 anos de experiência B2B condensados em uma ferramenta.",
      },
    ],
  },
];
