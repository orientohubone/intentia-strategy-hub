import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
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
} from "lucide-react";

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [faqShowAll, setFaqShowAll] = useState(false);

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
          title: "Importação de Públicos-Alvo",
          content: "O Plano Tático consome automaticamente os públicos-alvo vinculados ao projeto. Na seção de Segmentação de cada canal, uma barra 'Importar do Projeto' exibe os públicos cadastrados com botões de importação rápida. Ao importar, o segmento é criado com nome, critérios de targeting (indústria, porte, localização, keywords) e descrição pré-preenchidos. A seção de segmentação abre automaticamente quando há públicos disponíveis.",
          difficulty: "Intermediário",
        },
        {
          title: "Públicos-Alvo na Visão Geral",
          content: "Na aba 'Visão Geral' do plano tático, um card dedicado exibe todos os públicos-alvo vinculados ao projeto com nome, descrição, indústria, porte, localização e keywords. Se nenhum público estiver vinculado, um info box orienta a cadastrar na seção Públicos-Alvo. O header do projeto também mostra um badge com a contagem de públicos.",
          difficulty: "Iniciante",
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
      id: "structured-data",
      title: "Dados Estruturados & Snapshot",
      description: "JSON-LD, Open Graph, Twitter Card, Microdata e HTML Snapshot",
      icon: <Database className="h-5 w-5" />,
      color: "text-teal-600",
      articles: [
        {
          title: "O que são dados estruturados",
          content: "Dados estruturados são informações embutidas no HTML que ajudam mecanismos de busca e redes sociais a entender o conteúdo da página. A Intentia extrai automaticamente 4 tipos: JSON-LD (schema.org), Open Graph (Facebook/LinkedIn), Twitter Card e Microdata.",
          difficulty: "Iniciante",
        },
        {
          title: "Visualizador unificado com abas",
          content: "Após a análise, o visualizador de dados estruturados mostra abas para cada site analisado: seu site principal (ícone de prédio) e cada concorrente (ícone de espadas). Clique nas abas para alternar entre os dados de cada site. Cada aba mostra JSON-LD, OG, Twitter Card, Microdata e HTML Snapshot.",
          difficulty: "Iniciante",
        },
        {
          title: "JSON-LD e Open Graph",
          content: "JSON-LD é o formato preferido pelo Google para dados estruturados (ex: Organization, Product, Article). Open Graph são meta tags usadas pelo Facebook e LinkedIn para gerar previews ao compartilhar links. A Intentia extrai ambos e mostra em seções expansíveis com preview de imagens OG.",
          difficulty: "Intermediário",
        },
        {
          title: "HTML Snapshot",
          content: "O HTML Snapshot é uma versão limpa do HTML da página (sem scripts, styles e SVGs). Útil para referência rápida do conteúdo sem precisar acessar o site. Você pode copiar o HTML com um clique e expandir/colapsar a visualização.",
          difficulty: "Iniciante",
        },
        {
          title: "Comparando dados estruturados com concorrentes",
          content: "Ao adicionar URLs de concorrentes ao projeto, a Intentia extrai os dados estruturados de cada um. Use as abas no visualizador para comparar: quem tem JSON-LD mais completo, quais OG tags estão presentes, e como cada site se apresenta para mecanismos de busca e redes sociais.",
          difficulty: "Intermediário",
        },
      ]
    },
    {
      id: "structured-data-generator",
      title: "Gerador de Dados Estruturados",
      description: "Gere snippets prontos baseados na concorrência",
      icon: <Wand2 className="h-5 w-5" />,
      color: "text-orange-600",
      articles: [
        {
          title: "O que é o Gerador de Dados Estruturados",
          content: "O Gerador analisa automaticamente os dados estruturados dos seus concorrentes (JSON-LD, Open Graph, Twitter Card) e compara com os do seu site. Ele identifica gaps — o que a concorrência tem e você não — e gera snippets de código prontos para copiar e colar no <head> do seu HTML.",
          difficulty: "Iniciante",
        },
        {
          title: "Gap Analysis automático",
          content: "O sistema compara JSON-LD types (Organization, WebSite, FAQPage, Product, etc.), tags Open Graph essenciais (og:title, og:image, og:description) e Twitter Card tags entre seu site e cada concorrente. Gaps são classificados como Crítico (2+ concorrentes usam), Moderado ou Baixo, com indicação de quais concorrentes possuem cada item.",
          difficulty: "Intermediário",
        },
        {
          title: "Snippets gerados automaticamente",
          content: "Para cada gap identificado, o gerador cria código pronto: JSON-LD com <script type='application/ld+json'> para Organization, WebSite, WebPage, FAQPage, BreadcrumbList, SoftwareApplication, Product e Article. Meta tags Open Graph e Twitter Card também são geradas. Todos os snippets vêm pré-preenchidos com dados do seu projeto (nome, URL, descrição, imagem).",
          difficulty: "Intermediário",
        },
        {
          title: "Como usar os snippets gerados",
          content: "Clique em qualquer snippet para expandir e ver o código completo. Use o botão de copiar (📋) para copiar individual, ou 'Copiar Todos' para copiar todos de uma vez. Cole os JSON-LD dentro de tags <script> no <head> do seu HTML. Meta tags OG e Twitter vão diretamente no <head>. Personalize os valores placeholder antes de publicar.",
          difficulty: "Iniciante",
        },
        {
          title: "Quando o gerador aparece",
          content: "O Gerador de Dados Estruturados aparece automaticamente nos resultados da análise de cada projeto, logo abaixo do Visualizador de Dados Estruturados. Ele só é exibido quando há pelo menos um concorrente com dados estruturados e quando existem gaps identificados entre seu site e a concorrência.",
          difficulty: "Iniciante",
        },
        {
          title: "Tipos de Schema suportados",
          content: "O gerador reconhece e gera templates para: Organization (empresa), WebSite (site com busca), WebPage (página), FAQPage (perguntas frequentes), BreadcrumbList (navegação), SoftwareApplication (software/SaaS), Product/Service (produto ou serviço) e Article (artigo/blog). Cada template segue as especificações do schema.org.",
          difficulty: "Intermediário",
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
        {
          title: "Consumo pelo Plano Tático",
          content: "Públicos-alvo vinculados a um projeto são consumidos automaticamente pelo Plano Tático. Na seção de Segmentação de cada canal, os públicos aparecem como botões de importação rápida, pré-preenchendo nome, critérios de targeting e descrição. Isso garante que a segmentação tática esteja alinhada com os públicos definidos na camada estratégica.",
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
    {
      id: "operations",
      title: "Operações e Campanhas",
      description: "Gestão de campanhas, métricas de performance e análise por IA",
      icon: <Megaphone className="h-5 w-5" />,
      color: "text-orange-600",
      articles: [
        {
          title: "Criando e gerenciando campanhas",
          content: "Vá em Operações → Nova Campanha. Selecione o projeto, canal (Google, Meta, LinkedIn, TikTok), defina nome, objetivo, budget total e datas. As campanhas são agrupadas por projeto e possuem fluxo de status: Rascunho → Ativa → Pausada → Concluída → Arquivada.",
          difficulty: "Iniciante",
        },
        {
          title: "Registrando métricas de performance",
          content: "Expanda uma campanha e clique em 'Registrar Métricas'. Insira dados por período: impressões, cliques, conversões, custo, receita e métricas específicas por canal (ex: Quality Score para Google, Alcance para Meta). Para Google Ads, o funil B2B completo está disponível: sessões, leads, MQL, SQL, CAC, LTV e ROI.",
          difficulty: "Intermediário",
        },
        {
          title: "Cards de KPIs por campanha",
          content: "Ao expandir uma campanha com métricas registradas, cards de KPIs são exibidos automaticamente: Impressões, Cliques (CTR), Conversões (CPA), Custo (CPC), Receita (ROAS) e métricas específicas do canal. Para Google Ads B2B, cards adicionais mostram Sessões, Leads/Mês, Taxa SQL, CAC, LTV e ROI Acumulado.",
          difficulty: "Intermediário",
        },
        {
          title: "Análise de Performance por IA",
          content: "Quando uma campanha tem métricas registradas, o botão de IA (✨) aparece ao lado do seletor de modelo. A análise retorna: saúde geral (score 0-100 + tendência), KPIs vs benchmark do mercado, análise de funil com gargalos, eficiência de budget, forças e fraquezas, riscos com mitigação, plano de ação priorizado e projeções para 30 e 90 dias.",
          difficulty: "Avançado",
        },
        {
          title: "Dialog de análise de performance",
          content: "Clique em 'Ver Análise' para abrir o dialog completo com todas as seções da análise por IA. O dialog possui scroll completo, header fixo com informações do canal e modelo usado, e botão de fullscreen. Cada seção é colapsável para facilitar a navegação.",
          difficulty: "Iniciante",
        },
        {
          title: "Campanhas no Dashboard",
          content: "O Dashboard exibe um card de 'Campanhas Recentes' no painel lateral com as últimas campanhas criadas. Cada item mostra nome, projeto vinculado, badges de canal e status, e barra de pacing de budget (verde < 70%, amarelo 70-90%, vermelho > 90%). Use 'Ver todas' para ir à página de Operações.",
          difficulty: "Iniciante",
        },
        {
          title: "Comparativo Tático vs Real",
          content: "Ao expandir um grupo de projeto em Operações, o sistema cruza automaticamente o plano tático (tactical_channel_plans) com as métricas reais das campanhas. Para cada canal, é calculada a aderência estrutural (tipo de campanha, estágio de funil, estratégia de lances) e o gap de métricas (planejado vs real com desvio %). O score de aderência combina 30% estrutura + 70% métricas, com status visual: no alvo, acima, abaixo ou crítico.",
          difficulty: "Intermediário",
        },
        {
          title: "Alertas automáticos de performance",
          content: "O sistema avalia automaticamente 11 regras de performance para cada campanha ativa ou pausada: budget estourado (≥100%) ou quase esgotado (≥90%), CTR abaixo do mínimo por canal, CPC e CPA acima dos benchmarks, ROAS negativo ou baixo, sem conversões apesar de cliques, CAC:LTV desfavorável, ROI negativo, budget subutilizado e campanhas sem métricas registradas. Os alertas são classificados por severidade (crítico, atenção, info) e categoria (budget, eficiência, conversão, qualidade, pacing, tendência). Filtros permitem focar nos alertas mais relevantes.",
          difficulty: "Intermediário",
        },
        {
          title: "Gestão de Budget por canal",
          content: "Dentro de cada grupo de projeto expandido, o componente de Gestão de Budget permite alocar budget mensal por canal (Google, Meta, LinkedIn, TikTok). Defina o canal, mês, ano e valor planejado. O sistema calcula automaticamente o pacing (% gasto vs planejado), exibe barras de progresso coloridas por status (saudável, atenção, perigo, estourado) e projeta o gasto até o final do mês com base no ritmo diário atual.",
          difficulty: "Intermediário",
        },
        {
          title: "Sincronização de gastos reais",
          content: "O botão 'Sincronizar' no componente de Budget atualiza automaticamente os gastos reais com base nas métricas registradas nas campanhas. Para Google Ads, o sistema usa o maior valor entre 'Custo Total' e 'Custo Google Ads' para evitar duplicidade. A sincronização também atualiza os cards de Budget Total e Investido no topo da página de Operações, garantindo que todos os dados reflitam os gastos reais.",
          difficulty: "Intermediário",
        },
        {
          title: "Pacing e projeções de budget",
          content: "O pacing compara o gasto atual com o esperado para o dia do mês. Um marcador visual indica onde o gasto deveria estar. Se a projeção de gasto ultrapassa o budget planejado, um alerta é exibido com o valor projetado. Meses anteriores ficam em cards colapsáveis com opção de exclusão individual. Cada canal mostra sua própria barra de pacing com cores: verde (saudável, <80%), amarelo (atenção, 80-95%), vermelho (perigo, 95-100%) e vermelho escuro (estourado, >100%).",
          difficulty: "Intermediário",
        },
        {
          title: "Calendário de Campanhas",
          content: "Dentro de cada grupo de projeto expandido, o Calendário de Campanhas exibe uma grade mensal estilo Google Calendar. Campanhas com datas definidas (início e fim) aparecem como barras horizontais coloridas por canal: Google (azul), Meta (índigo), LinkedIn (sky), TikTok (pink). Navegue entre meses, clique em uma campanha para ver detalhes (duração, budget pacing, cliques, conversões). Campanhas que encerram nos próximos 7 dias recebem um indicador de alerta.",
          difficulty: "Iniciante",
        },
        {
          title: "Timeline visual (Gantt)",
          content: "Alterne para a vista Timeline para ver suas campanhas em formato Gantt horizontal. O eixo X mostra 8 semanas visíveis com headers de mês e semana. Cada campanha aparece como uma barra colorida por canal, com opacidade variando por status (rascunho=40%, pausada=60%, ativa=85%). Uma linha vertical marca o dia de hoje. Passe o mouse sobre qualquer barra para ver tooltip com canal, status, datas, budget e métricas. Navegue por período (±2 semanas) ou clique em 'Hoje' para centralizar.",
          difficulty: "Iniciante",
        },
        {
          title: "Filtros do calendário",
          content: "O componente de calendário oferece filtros por canal (Google, Meta, LinkedIn, TikTok) e por status (Rascunho, Ativa, Pausada, Concluída). Use os seletores no topo para focar nas campanhas relevantes. Os filtros funcionam tanto na vista Calendário quanto na Timeline. A legenda na parte inferior mostra os canais ativos com contadores.",
          difficulty: "Iniciante",
        },
      ]
    },
    {
      id: "integrations",
      title: "Integrações com APIs de Marketing",
      description: "Conecte Google Ads, Meta Ads, LinkedIn Ads e TikTok Ads via OAuth",
      icon: <Plug className="h-5 w-5" />,
      color: "text-cyan-600",
      articles: [
        {
          title: "O que são as Integrações",
          content: "As Integrações permitem conectar suas contas de anúncios (Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads) diretamente ao Intentia Strategy Hub via OAuth 2.0. Após conectar, você pode sincronizar campanhas e métricas automaticamente, alimentando os módulos de Operações, Budget e Insights com dados reais.",
          difficulty: "Iniciante",
        },
        {
          title: "Como conectar uma conta",
          content: "Vá em Integrações e clique no botão 'Conectar' no card do provider desejado. Você será redirecionado para a página de autorização do provider (Google, Meta, LinkedIn ou TikTok). Autorize o acesso à sua conta de anúncios e você será redirecionado de volta ao Intentia com status 'Conectado'. Todo o fluxo usa OAuth 2.0 — nós nunca vemos sua senha.",
          difficulty: "Iniciante",
        },
        {
          title: "Segurança do fluxo OAuth",
          content: "O fluxo OAuth é seguro por design: (1) Cada conexão gera um parâmetro 'state' único com expiração de 10 minutos para prevenir ataques CSRF. (2) Os tokens de acesso são isolados por usuário via Row Level Security — nenhum outro usuário pode acessá-los. (3) A Intentia usa credenciais OAuth próprias (padrão SaaS) — cada cliente autoriza sua própria conta de anúncios.",
          difficulty: "Intermediário",
        },
        {
          title: "Sincronizando dados",
          content: "Após conectar, clique em 'Sincronizar Agora' no card ou no dialog de detalhes do provider. O sistema busca suas campanhas e métricas (impressões, cliques, conversões, custo, receita) dos últimos 30 dias via API oficial do provider. Os dados são inseridos em campaign_metrics com source 'api', alimentando KPIs, alertas de performance e gestão de budget automaticamente.",
          difficulty: "Intermediário",
        },
        {
          title: "Frequência de sincronização",
          content: "Você pode configurar a frequência de sync no dialog de detalhes: a cada hora, 6h, 12h, diária ou semanal. Além disso, pode clicar em 'Sincronizar Agora' a qualquer momento para uma sincronização manual imediata. O histórico de syncs mostra status, duração e quantidade de registros importados.",
          difficulty: "Intermediário",
        },
        {
          title: "Tokens e renovação automática",
          content: "Cada provider tem uma validade diferente para tokens: Google (1 hora, com refresh automático), Meta (60 dias), LinkedIn (60 dias com refresh de 365 dias), TikTok (24 horas com refresh de 365 dias). O sistema verifica a expiração antes de cada sync e renova automaticamente quando possível. Se a renovação falhar, a integração é marcada como 'Expirada' e você precisa reconectar.",
          difficulty: "Intermediário",
        },
        {
          title: "Desconectando uma integração",
          content: "No card do provider ou no dialog de detalhes, clique em 'Desconectar'. Uma confirmação será exibida. Ao desconectar, os tokens são removidos e a sincronização é interrompida. Os dados já importados (campaign_metrics) permanecem no sistema. Você pode reconectar a qualquer momento.",
          difficulty: "Iniciante",
        },
        {
          title: "Histórico de sincronizações",
          content: "No dialog de detalhes de cada provider, a seção 'Histórico de Syncs' mostra as últimas 20 sincronizações com: status (concluído, parcial, falhou), tipo (manual/automático), duração, registros importados/criados/atualizados/falhos e período. Útil para monitorar a saúde da integração.",
          difficulty: "Intermediário",
        },
        {
          title: "Providers suportados",
          content: "4 providers disponíveis: Google Ads (API v16 com developer token), Meta Ads (Graph API v19.0 para Facebook e Instagram), LinkedIn Ads (REST API v202401 para campanhas B2B) e TikTok Ads (Business API v1.3). Cada provider tem configuração específica — consulte os manuais de integração na documentação para detalhes.",
          difficulty: "Intermediário",
        },
        {
          title: "Dados importados por provider",
          content: "Google Ads: campanhas, budget (micros), impressões, cliques, conversões, custo, receita. Meta Ads: campanhas, budget diário/vitalício, impressões, cliques, purchases, spend, purchase value. LinkedIn Ads: campanhas, budget total/diário, impressões, cliques, conversões externas, custo em moeda local. TikTok Ads: campanhas, budget, impressões, cliques, conversões, spend.",
          difficulty: "Avançado",
        },
      ]
    },
    {
      id: "security",
      title: "Segurança & Backup de Dados",
      description: "Proteção de dados, backups, auditoria e guardrails",
      icon: <HardDrive className="h-5 w-5" />,
      color: "text-red-600",
      articles: [
        {
          title: "Isolamento de dados (RLS)",
          content: "Todos os seus dados são isolados por conta usando Row Level Security (RLS) do PostgreSQL. Isso significa que nenhum outro usuário pode acessar, visualizar ou modificar seus dados — nem mesmo por acidente. Cada tabela do sistema tem políticas de segurança que verificam o user_id em todas as operações.",
          difficulty: "Iniciante",
        },
        {
          title: "Criando backups manuais",
          content: "Vá em Configurações → Backup & Segurança de Dados → Criar Backup. O sistema gera um snapshot completo de todos os seus dados (projetos, insights, benchmarks, públicos-alvo, planos táticos, etc.) e armazena no servidor. Você pode baixar o backup em JSON a qualquer momento.",
          difficulty: "Iniciante",
        },
        {
          title: "Backups automáticos",
          content: "O sistema cria backups automáticos antes de exclusões importantes, como deletar um projeto. Isso garante que você sempre tenha uma cópia dos dados antes de qualquer operação destrutiva. Backups automáticos são retidos por 90 dias.",
          difficulty: "Iniciante",
        },
        {
          title: "Exportar todos os dados",
          content: "Em Configurações → Backup & Segurança de Dados → Exportar Dados, você pode baixar um arquivo JSON completo com todos os seus dados de todas as 12 tabelas do sistema. O arquivo inclui contagem de registros e exclui dados sensíveis como API keys e HTML snapshots grandes.",
          difficulty: "Iniciante",
        },
        {
          title: "Log de auditoria",
          content: "Todas as operações no banco de dados (criar, editar, excluir) são registradas automaticamente em um log de auditoria. O log captura os dados antes e depois de cada alteração, permitindo rastreabilidade completa. Campos sensíveis como API keys são removidos dos logs.",
          difficulty: "Intermediário",
        },
        {
          title: "Soft delete e recuperação",
          content: "Projetos, públicos-alvo, benchmarks e planos táticos não são excluídos permanentemente. Eles ficam em estado de 'lixeira' por 30 dias antes da exclusão definitiva, permitindo recuperação em caso de exclusão acidental.",
          difficulty: "Intermediário",
        },
        {
          title: "Rate limiting e limites por plano",
          content: "O sistema implementa limites de requisições por hora para prevenir abuso. Cada plano tem seus próprios limites: Starter (10 projetos/hora, 5 projetos ativos, 5 análises/mês), Professional (50/hora, ilimitado) e Enterprise (200/hora, ilimitado).",
          difficulty: "Intermediário",
        },
        {
          title: "Proteção de API keys",
          content: "Suas chaves de API de IA (Gemini/Claude) são armazenadas com isolamento por usuário. Elas nunca aparecem em logs de auditoria, backups ou exportações — são sempre mascaradas automaticamente para sua segurança.",
          difficulty: "Intermediário",
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
      answer: "Starter (gratuito): 5 análises de URL por mês, score básico por canal. Professional (R$ 147/mês): análises ilimitadas, IA, benchmark com IA, relatórios PDF/CSV, insights e alertas. Enterprise (personalizado): tudo do Professional + API access, SLA dedicado, consultoria estratégica e treinamento."
    },
    {
      question: "Posso usar a plataforma no modo escuro?",
      answer: "Sim! Alterne entre tema claro e escuro pelo ícone de sol/lua no header do dashboard. O tema é salvo automaticamente. As páginas públicas (landing, preços, etc.) sempre usam tema claro para consistência da marca."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim. Implementamos múltiplas camadas de segurança: Row Level Security (RLS) em todas as 16+ tabelas, audit log automático em 13+ tabelas, backups automáticos antes de exclusões, soft delete com recuperação em 30 dias, rate limiting por plano, proteção contra escalação de privilégios e mascaramento de dados sensíveis. API keys são isoladas por usuário e nunca expostas em logs ou exportações. Saiba mais na página de Segurança."
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
      question: "Como os públicos-alvo se conectam ao plano tático?",
      answer: "Públicos-alvo vinculados a um projeto são automaticamente disponibilizados no Plano Tático. Na seção de Segmentação de cada canal, botões de importação rápida permitem adicionar públicos com um clique, pré-preenchendo nome, critérios de targeting (indústria, porte, localização, keywords) e descrição. Isso garante alinhamento entre a estratégia de audiência e a execução tática."
    },
    {
      question: "O que é o Playbook Gamificado?",
      answer: "O Playbook é gerado ao clicar em 'Rodar Plano' na visão geral do plano tático. Ele analisa todos os canais configurados e gera diretivas de execução priorizadas com KPIs, ações específicas e nível de prioridade. É uma forma gamificada de transformar o plano tático em ações concretas."
    },
    {
      question: "O que são os dados estruturados extraídos pela análise?",
      answer: "A Intentia extrai automaticamente 4 tipos de dados estruturados de cada URL analisada: JSON-LD (schema.org, usado pelo Google), Open Graph (meta tags para Facebook/LinkedIn), Twitter Card (meta tags para Twitter/X) e Microdata. Esses dados mostram como a página se apresenta para mecanismos de busca e redes sociais."
    },
    {
      question: "Posso comparar dados estruturados com concorrentes?",
      answer: "Sim! Ao adicionar URLs de concorrentes ao projeto, a Intentia extrai os dados estruturados de cada um. No visualizador unificado, use as abas para alternar entre seu site e cada concorrente, comparando JSON-LD, Open Graph, Twitter Card e Microdata lado a lado."
    },
    {
      question: "O que é o Gerador de Dados Estruturados?",
      answer: "É uma ferramenta exclusiva que analisa os dados estruturados dos seus concorrentes e gera snippets de código prontos para você copiar e colar no seu site. Ele identifica gaps (o que a concorrência tem e você não), classifica por criticidade e gera JSON-LD, Open Graph e Twitter Card pré-preenchidos com dados do seu projeto."
    },
    {
      question: "Preciso saber programar para usar o Gerador de Dados Estruturados?",
      answer: "Não! Os snippets são gerados prontos para uso. Basta copiar o código e colar no <head> do seu HTML (ou pedir ao seu desenvolvedor). JSON-LD vai dentro de tags <script>, e meta tags OG/Twitter vão diretamente no <head>. O gerador pré-preenche os valores com dados do seu projeto — você só precisa personalizar os placeholders."
    },
    {
      question: "Como funciona a análise de performance por IA?",
      answer: "Quando uma campanha tem métricas registradas, o botão de IA aparece. Selecione o modelo (Gemini ou Claude) e clique para executar. A IA analisa todos os KPIs, compara com benchmarks do mercado, identifica gargalos no funil, avalia eficiência de budget, lista forças/fraquezas, riscos com mitigação, gera um plano de ação priorizado e faz projeções para 30 e 90 dias. Os resultados ficam salvos na campanha."
    },
    {
      question: "O que aparece no card de campanhas do Dashboard?",
      answer: "O Dashboard mostra as campanhas mais recentes com nome, projeto vinculado, badges coloridos de canal (Google/Meta/LinkedIn/TikTok) e status (Rascunho/Ativa/Pausada/Concluída/Arquivada), além de uma barra de pacing de budget. Você pode expandir para ver mais campanhas ou clicar em 'Ver todas' para ir à página de Operações."
    },
    {
      question: "O que é o Comparativo Tático vs Real?",
      answer: "É um gap analysis automático que cruza o plano tático de cada canal com as métricas reais das campanhas. O sistema verifica aderência estrutural (tipo de campanha, estágio de funil, estratégia de lances) e gap de métricas (planejado vs real com desvio percentual). O score de aderência combina 30% estrutura + 70% métricas, com status visual por canal."
    },
    {
      question: "Como funciona o Calendário de Campanhas?",
      answer: "O Calendário de Campanhas oferece duas vistas: Calendário (grade mensal com barras coloridas por canal) e Timeline (Gantt horizontal com 8 semanas visíveis). Ambas mostram campanhas com datas definidas, com cores por canal e opacidade por status. Clique em uma campanha no calendário para ver detalhes como duração, budget pacing e métricas. Na timeline, passe o mouse para tooltips ricos. Campanhas que encerram em 7 dias recebem alerta visual. Filtros por canal e status estão disponíveis em ambas as vistas."
    },
    {
      question: "Como funcionam os alertas automáticos de performance?",
      answer: "O sistema avalia 11 regras automaticamente para cada campanha ativa ou pausada. Exemplos: budget estourado ou quase esgotado, CTR abaixo do mínimo por canal, CPC/CPA acima dos benchmarks, ROAS negativo, sem conversões, CAC:LTV desfavorável e ROI negativo. Os alertas aparecem dentro de cada grupo de projeto em Operações, com filtros por severidade (crítico, atenção, info) e categoria (budget, eficiência, conversão, qualidade, pacing, tendência)."
    },
    {
      question: "Como conecto minha conta do Google Ads, Meta Ads ou LinkedIn Ads?",
      answer: "Vá em Integrações e clique em 'Conectar' no card do provider desejado. Você será redirecionado para a página de autorização do provider, onde autoriza o acesso à sua conta de anúncios. Após autorizar, você volta automaticamente ao Intentia com status 'Conectado'. O fluxo usa OAuth 2.0 — nós nunca vemos sua senha. Cada usuário conecta sua própria conta."
    },
    {
      question: "Os dados das minhas contas de anúncios ficam seguros?",
      answer: "Sim. Os tokens de acesso são isolados por usuário via Row Level Security (RLS) — nenhum outro usuário pode acessá-los. O fluxo OAuth usa parâmetro 'state' com expiração de 10 minutos para prevenir ataques. Tokens expirados são renovados automaticamente. Se a renovação falhar, a integração é marcada como 'Expirada' e você precisa reconectar."
    },
    {
      question: "O que acontece quando sincronizo dados de anúncios?",
      answer: "A sincronização busca suas campanhas e métricas (impressões, cliques, conversões, custo, receita) dos últimos 30 dias via API oficial do provider. Os dados são inseridos automaticamente no módulo de Operações, alimentando KPIs, alertas de performance, gestão de budget e comparativo tático vs real. Você pode sincronizar manualmente ou configurar frequência automática."
    },
    {
      question: "Preciso configurar algo no Google/Meta/LinkedIn/TikTok?",
      answer: "A configuração dos providers é feita pela equipe Intentia (credenciais OAuth do app). Você como usuário só precisa clicar em 'Conectar' e autorizar sua conta de anúncios. Não é necessário criar apps ou configurar APIs — tudo já está pronto. Basta ter uma conta ativa no provider desejado."
    },
    {
      question: "Posso cancelar meu plano a qualquer momento?",
      answer: "Sim! Todos os planos são flexíveis, sem compromisso de longo prazo. Você pode fazer upgrade, downgrade ou cancelar quando quiser. As alterações são refletidas na próxima cobrança."
    },
    {
      question: "Como faço backup dos meus dados?",
      answer: "Vá em Configurações → Backup & Segurança de Dados. Você pode criar backups manuais (snapshot completo no servidor) ou exportar todos os dados em JSON para download local. Backups automáticos também são criados antes de exclusões importantes como deletar projetos."
    },
    {
      question: "O que acontece se eu excluir um projeto por acidente?",
      answer: "Projetos excluídos ficam em estado de 'soft delete' por 30 dias antes da exclusão permanente. Além disso, um backup automático é criado antes da exclusão. Você pode recuperar seus dados através dos backups salvos em Configurações."
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

            {/* Help Categories */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Guia por Funcionalidade</h2>
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

              {/* Expanded category articles */}
              {expandedCategory && (() => {
                const category = filteredCategories.find(c => c.id === expandedCategory);
                if (!category) return null;
                return (
                  <Card className="mt-3 sm:mt-4">
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
                    </CardContent>
                  </Card>
                );
              })()}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Perguntas Frequentes</h2>
              <Card>
                <CardContent className="p-0">
                  {(faqShowAll ? filteredFaq : filteredFaq.slice(0, 5)).map((item, index) => (
                    <div key={index} className="border-b last:border-b-0">
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
                  {filteredFaq.length > 5 && (
                    <button
                      onClick={() => { setFaqShowAll(!faqShowAll); if (faqShowAll) setExpandedFaq(null); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/40 border-t"
                    >
                      {faqShowAll ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Mostrar menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Ver mais {filteredFaq.length - 5} perguntas
                        </>
                      )}
                    </button>
                  )}
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
