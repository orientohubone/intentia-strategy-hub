// Tactical Templates — Pre-filled tactical plans validated by niche

import type { ChannelKey } from "./tacticalTypes";

export interface TemplateChannelPlan {
  channel: ChannelKey;
  campaign_type: string;
  funnel_stage: string;
  funnel_role: string;
  bidding_strategy: string;
  ad_group_structure: Array<{ name: string; intent: string }>;
  extensions_plan: string[];
  quality_score_factors: Record<string, string>;
  key_metrics: Array<{ metric: string; target: string }>;
}

export interface TemplateCopyFramework {
  channel: ChannelKey;
  framework_type: string;
  framework_name: string;
  structure: Record<string, string>;
  notes: string;
}

export interface TemplateSegmentation {
  channel: ChannelKey;
  audience_name: string;
  targeting_criteria: Record<string, string>;
  message_angle: string;
  priority: string;
  notes: string;
}

export interface TemplateTestPlan {
  channel: ChannelKey;
  test_name: string;
  hypothesis: string;
  what_to_test: string;
  success_criteria: string;
  priority: string;
}

export interface TacticalTemplate {
  id: string;
  name: string;
  niche: string;
  description: string;
  tags: string[];
  icon: string;
  color: string;
  bgColor: string;
  channels: TemplateChannelPlan[];
  copyFrameworks: TemplateCopyFramework[];
  segmentations: TemplateSegmentation[];
  testPlans: TemplateTestPlan[];
}

// ═══════════════════════════════════════════════════════════
// TEMPLATE 1: SaaS B2B
// ═══════════════════════════════════════════════════════════
const saasB2B: TacticalTemplate = {
  id: "saas-b2b",
  name: "SaaS B2B",
  niche: "Software as a Service",
  description: "Plano tático validado para empresas SaaS B2B com foco em geração de leads qualificados, trials e demos. Estrutura otimizada para ciclo de venda consultivo.",
  tags: ["SaaS", "B2B", "Leads", "Trial", "Demo"],
  icon: "💻",
  color: "text-blue-600",
  bgColor: "bg-blue-500/10",
  channels: [
    {
      channel: "google",
      campaign_type: "Search",
      funnel_stage: "conversion",
      funnel_role: "Captura de leads com alta intenção de compra",
      bidding_strategy: "CPA Alvo",
      ad_group_structure: [
        { name: "Branded", intent: "Buscas pela marca e produto" },
        { name: "Solução Direta", intent: "Buscas por tipo de software (ex: CRM, ERP, automação)" },
        { name: "Problema/Dor", intent: "Buscas por problemas que o software resolve" },
        { name: "Concorrentes", intent: "Buscas por alternativas e comparações" },
        { name: "Integrações", intent: "Buscas por integrações específicas (ex: integração Slack)" },
      ],
      extensions_plan: ["Sitelinks", "Frases de Destaque", "Snippets Estruturados", "Extensão de Preço"],
      quality_score_factors: {
        ad_relevance: "Headlines dinâmicos com keyword insertion. Cada grupo com anúncios específicos para a intenção.",
        landing_page: "Landing page dedicada por grupo com proposta de valor clara, formulário acima da dobra e prova social.",
        expected_ctr: "Usar números e dados concretos nos headlines. CTAs diretos: 'Teste Grátis', 'Agende Demo'.",
      },
      key_metrics: [
        { metric: "CPA (Custo por Lead)", target: "< R$150" },
        { metric: "Taxa de Conversão LP", target: "> 8%" },
        { metric: "CTR", target: "> 4%" },
        { metric: "Quality Score Médio", target: "> 7" },
        { metric: "MQL para SQL", target: "> 25%" },
      ],
    },
    {
      channel: "meta",
      campaign_type: "Leads",
      funnel_stage: "consideration",
      funnel_role: "Nutrição e geração de demanda com conteúdo educativo",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Lookalike Clientes", intent: "Público semelhante aos melhores clientes" },
        { name: "Retargeting Site", intent: "Visitantes do site que não converteram" },
        { name: "Interesse Tecnologia", intent: "Decisores interessados em tecnologia e gestão" },
        { name: "Engajamento Conteúdo", intent: "Quem interagiu com posts e vídeos" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL (Custo por Lead)", target: "< R$80" },
        { metric: "CTR", target: "> 1.5%" },
        { metric: "Frequência", target: "< 3x por semana" },
        { metric: "Taxa de Conversão", target: "> 12%" },
      ],
    },
    {
      channel: "linkedin",
      campaign_type: "Sponsored Content",
      funnel_stage: "consideration",
      funnel_role: "Alcançar decisores C-level e gerar leads qualificados",
      bidding_strategy: "Entrega Máxima",
      ad_group_structure: [
        { name: "C-Level / Diretores", intent: "Decisores finais: CEO, CTO, CFO, COO" },
        { name: "Gerentes de Área", intent: "Gerentes de TI, Marketing, Operações" },
        { name: "Empresas por Tamanho", intent: "Empresas 50-500 funcionários (mid-market)" },
        { name: "Retargeting LinkedIn", intent: "Quem interagiu com a Company Page" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$200" },
        { metric: "CTR", target: "> 0.8%" },
        { metric: "Taxa de Conversão", target: "> 5%" },
        { metric: "Engagement Rate", target: "> 2%" },
      ],
    },
    {
      channel: "tiktok",
      campaign_type: "Spark Ads",
      funnel_stage: "awareness",
      funnel_role: "Awareness e educação de mercado com conteúdo nativo",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Educativo / How-to", intent: "Conteúdo mostrando como resolver problemas do dia a dia" },
        { name: "Behind the Scenes", intent: "Bastidores da empresa e cultura tech" },
        { name: "Depoimentos Clientes", intent: "Clientes reais contando resultados" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPV (Custo por View)", target: "< R$0.05" },
        { metric: "Taxa de Retenção 6s", target: "> 50%" },
        { metric: "Engagement Rate", target: "> 5%" },
        { metric: "Seguidores Novos", target: "> 100/semana" },
      ],
    },
  ],
  copyFrameworks: [
    {
      channel: "google",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "Processos manuais que consomem horas da equipe. Planilhas que geram erros e retrabalho.",
        "Solução / Benefício": "Automatize com [Produto]. Reduza tempo operacional em até 70%.",
        "Prova / Evidência": "Usado por X empresas. Nota 4.8 no G2. Case: empresa Y reduziu 60% do tempo.",
        "CTA / Chamada para Ação": "Teste grátis por 14 dias. Sem cartão de crédito.",
      },
      notes: "Adaptar dor conforme o grupo de anúncios (problema específico vs. solução genérica).",
    },
    {
      channel: "google",
      framework_type: "comparison",
      framework_name: "Comparação",
      structure: {
        "Cenário Atual (Sem)": "Equipe gastando 20h/semana em tarefas repetitivas. Dados espalhados em planilhas.",
        "Cenário Ideal (Com)": "Tudo automatizado em um só lugar. Relatórios em tempo real. Equipe focada no estratégico.",
        "Diferencial": "Implementação em 48h. Suporte dedicado. Integrações nativas com as ferramentas que você já usa.",
        "CTA": "Veja a diferença na prática — agende uma demo personalizada.",
      },
      notes: "Ideal para grupos de concorrentes e comparação.",
    },
    {
      channel: "meta",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "Sua equipe ainda perde tempo com processos manuais?",
        "Solução / Benefício": "Descubra como automatizar [processo] e liberar sua equipe para o que importa.",
        "Prova / Evidência": "Veja como a empresa X economizou 30h/mês com nossa solução.",
        "CTA / Chamada para Ação": "Baixe o guia gratuito / Assista ao webinar / Teste grátis.",
      },
      notes: "Tom mais educativo e menos direto que Google. Foco em conteúdo de valor.",
    },
    {
      channel: "linkedin",
      framework_type: "authority",
      framework_name: "Autoridade",
      structure: {
        "Credencial / Dado": "Pesquisa com 500 líderes B2B mostra que 73% planejam automatizar processos em 2026.",
        "Expertise Demonstrada": "Ajudamos empresas como [Cliente] a implementar automação em menos de 30 dias.",
        "Resultado Comprovado": "Resultado médio: 40% de redução em custos operacionais no primeiro trimestre.",
        "CTA": "Descubra o potencial de automação da sua empresa — assessment gratuito.",
      },
      notes: "LinkedIn exige tom mais profissional e baseado em dados. Evitar linguagem casual.",
    },
    {
      channel: "tiktok",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "POV: você gastou 3 horas fazendo um relatório que poderia levar 3 minutos.",
        "Solução / Benefício": "Com [Produto] isso é automático. Sério.",
        "Prova / Evidência": "Mostra a tela do produto funcionando em tempo real (screen recording).",
        "CTA / Chamada para Ação": "Link na bio para testar grátis.",
      },
      notes: "Tom nativo do TikTok: informal, direto, visual. Primeiros 3 segundos são cruciais.",
    },
  ],
  segmentations: [
    {
      channel: "google",
      audience_name: "Decisores com Intenção Alta",
      targeting_criteria: { tipo: "Keywords de intenção", match: "Exact + Phrase", negativos: "grátis, curso, o que é" },
      message_angle: "Solução direta para o problema. ROI claro. CTA para trial/demo.",
      priority: "high",
      notes: "Priorizar keywords com CPC alto mas alta taxa de conversão.",
    },
    {
      channel: "meta",
      audience_name: "Lookalike de Clientes Pagantes",
      targeting_criteria: { tipo: "Lookalike 1-3%", base: "Lista de clientes com LTV > R$5k", exclusão: "Clientes atuais" },
      message_angle: "Educação + prova social. Mostrar resultados de empresas similares.",
      priority: "high",
      notes: "Testar Lookalike 1% vs 3% para encontrar o sweet spot.",
    },
    {
      channel: "linkedin",
      audience_name: "C-Level em Empresas Mid-Market",
      targeting_criteria: { cargo: "CEO, CTO, VP, Diretor", empresa: "50-500 funcionários", setor: "Tecnologia, Serviços, Indústria" },
      message_angle: "Visão estratégica. Dados de mercado. ROI e redução de custos.",
      priority: "high",
      notes: "LinkedIn é o canal mais caro mas com maior qualidade de lead B2B.",
    },
    {
      channel: "tiktok",
      audience_name: "Profissionais Tech 25-40 anos",
      targeting_criteria: { idade: "25-40", interesses: "Tecnologia, Startups, Produtividade", comportamento: "Engajamento com conteúdo business" },
      message_angle: "Conteúdo nativo, informal, mostrando o produto em ação.",
      priority: "medium",
      notes: "TikTok para SaaS funciona melhor como awareness e branding.",
    },
  ],
  testPlans: [
    {
      channel: "google",
      test_name: "Headlines: Benefício vs. Dor",
      hypothesis: "Headlines focados em dor (ex: 'Cansado de planilhas?') terão CTR 20% maior que headlines de benefício (ex: 'Automatize seus processos').",
      what_to_test: "2 variações de RSA com headlines focados em dor vs. benefício",
      success_criteria: "CTR > 4% com significância estatística (95%) em 2 semanas",
      priority: "high",
    },
    {
      channel: "google",
      test_name: "Landing Page: Formulário Curto vs. Longo",
      hypothesis: "Formulário com 3 campos (nome, email, empresa) terá taxa de conversão 30% maior que formulário com 6 campos.",
      what_to_test: "LP com formulário curto vs. LP com formulário completo",
      success_criteria: "Taxa de conversão > 8% no formulário curto sem queda na qualidade do lead",
      priority: "high",
    },
    {
      channel: "meta",
      test_name: "Formato: Carrossel vs. Vídeo Curto",
      hypothesis: "Vídeo de 15s com depoimento terá CPL 25% menor que carrossel de benefícios.",
      what_to_test: "Carrossel 5 cards vs. Vídeo 15s com depoimento de cliente",
      success_criteria: "CPL < R$80 e taxa de conversão > 12%",
      priority: "medium",
    },
    {
      channel: "linkedin",
      test_name: "Conteúdo: Dado de Mercado vs. Case Study",
      hypothesis: "Posts com dados de pesquisa terão engagement 40% maior que case studies entre C-levels.",
      what_to_test: "Sponsored Content com infográfico de dados vs. case study em formato documento",
      success_criteria: "Engagement rate > 2% e CPL < R$200",
      priority: "medium",
    },
    {
      channel: "tiktok",
      test_name: "Hook: Pergunta vs. Afirmação Chocante",
      hypothesis: "Vídeos que começam com pergunta retêm 30% mais nos primeiros 6 segundos.",
      what_to_test: "Hook 'Você sabia que...?' vs. 'Sua empresa perde R$50k/mês com isso'",
      success_criteria: "Taxa de retenção 6s > 50% e engagement > 5%",
      priority: "low",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// TEMPLATE 2: Consultoria e Serviços Profissionais
// ═══════════════════════════════════════════════════════════
const consultoria: TacticalTemplate = {
  id: "consultoria-servicos",
  name: "Consultoria & Serviços",
  niche: "Consultoria e Serviços Profissionais",
  description: "Plano tático para consultorias, agências e prestadores de serviço B2B. Foco em autoridade, geração de reuniões e posicionamento como especialista.",
  tags: ["Consultoria", "Serviços", "B2B", "Autoridade", "Reuniões"],
  icon: "🎯",
  color: "text-purple-600",
  bgColor: "bg-purple-500/10",
  channels: [
    {
      channel: "google",
      campaign_type: "Search",
      funnel_stage: "conversion",
      funnel_role: "Captura de leads com intenção de contratar consultoria",
      bidding_strategy: "Maximizar Conversões",
      ad_group_structure: [
        { name: "Serviço Específico", intent: "Buscas pelo tipo de consultoria (ex: consultoria de marketing, consultoria financeira)" },
        { name: "Problema Empresarial", intent: "Buscas por problemas (ex: como reduzir custos, como escalar vendas)" },
        { name: "Consultoria + Segmento", intent: "Buscas por consultoria para nicho específico (ex: consultoria para startups)" },
        { name: "Branded", intent: "Buscas pela marca da consultoria" },
      ],
      extensions_plan: ["Sitelinks", "Frases de Destaque", "Extensão de Chamada", "Extensão de Local"],
      quality_score_factors: {
        ad_relevance: "Mencionar o tipo específico de consultoria no headline. Usar credenciais e anos de experiência.",
        landing_page: "Página com cases reais, metodologia clara, formulário para diagnóstico gratuito.",
        expected_ctr: "Usar números concretos: 'X anos de experiência', 'Y clientes atendidos'. CTA: 'Diagnóstico Gratuito'.",
      },
      key_metrics: [
        { metric: "CPA (Custo por Reunião)", target: "< R$300" },
        { metric: "Taxa de Conversão LP", target: "> 5%" },
        { metric: "CTR", target: "> 3.5%" },
        { metric: "Reunião para Proposta", target: "> 40%" },
      ],
    },
    {
      channel: "meta",
      campaign_type: "Leads",
      funnel_stage: "consideration",
      funnel_role: "Posicionamento como autoridade e geração de leads via conteúdo",
      bidding_strategy: "Custo por Resultado Alvo",
      ad_group_structure: [
        { name: "Conteúdo Educativo", intent: "Webinars, e-books, guias sobre o tema de expertise" },
        { name: "Cases e Resultados", intent: "Depoimentos e resultados de clientes reais" },
        { name: "Retargeting", intent: "Visitantes do site e engajados com conteúdo" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$120" },
        { metric: "CTR", target: "> 1.2%" },
        { metric: "Lead para Reunião", target: "> 15%" },
        { metric: "Custo por Reunião", target: "< R$500" },
      ],
    },
    {
      channel: "linkedin",
      campaign_type: "Sponsored Content",
      funnel_stage: "consideration",
      funnel_role: "Canal principal para alcançar decisores e construir autoridade",
      bidding_strategy: "Entrega Máxima",
      ad_group_structure: [
        { name: "Decisores por Cargo", intent: "CEOs, Diretores, VPs do segmento-alvo" },
        { name: "Empresas por Tamanho", intent: "Empresas do porte ideal para a consultoria" },
        { name: "Thought Leadership", intent: "Conteúdo de liderança de pensamento para brand awareness" },
        { name: "Retargeting", intent: "Quem visitou o site ou interagiu com a Company Page" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$250" },
        { metric: "Engagement Rate", target: "> 2.5%" },
        { metric: "Lead para Reunião", target: "> 20%" },
        { metric: "Impressões em Decisores", target: "> 10k/mês" },
      ],
    },
    {
      channel: "tiktok",
      campaign_type: "Spark Ads",
      funnel_stage: "awareness",
      funnel_role: "Humanizar a marca e mostrar expertise de forma acessível",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Dicas Rápidas", intent: "Tips de 30-60s sobre o tema de expertise" },
        { name: "Erros Comuns", intent: "Erros que empresas cometem e como evitar" },
        { name: "Bastidores", intent: "Dia a dia da consultoria, reuniões, workshops" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPV", target: "< R$0.03" },
        { metric: "Taxa de Retenção 6s", target: "> 45%" },
        { metric: "Seguidores", target: "> 50/semana" },
        { metric: "Compartilhamentos", target: "> 2% dos views" },
      ],
    },
  ],
  copyFrameworks: [
    {
      channel: "google",
      framework_type: "authority",
      framework_name: "Autoridade",
      structure: {
        "Credencial / Dado": "X anos de experiência. Y projetos entregues. Especialistas certificados.",
        "Expertise Demonstrada": "Metodologia própria testada em mais de Z empresas do seu segmento.",
        "Resultado Comprovado": "Clientes aumentam receita em média 35% nos primeiros 6 meses.",
        "CTA": "Agende seu diagnóstico gratuito — vagas limitadas este mês.",
      },
      notes: "Consultoria vende confiança. Sempre incluir credenciais e resultados mensuráveis.",
    },
    {
      channel: "linkedin",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "78% das empresas B2B não conseguem escalar vendas de forma previsível.",
        "Solução / Benefício": "Nossa metodologia de [especialidade] cria um sistema replicável de crescimento.",
        "Prova / Evidência": "Case: [Cliente] saiu de R$500k para R$2M em receita recorrente em 12 meses.",
        "CTA / Chamada para Ação": "Baixe nosso framework gratuito / Agende uma conversa estratégica.",
      },
      notes: "LinkedIn é o canal #1 para consultoria B2B. Investir em conteúdo de alta qualidade.",
    },
    {
      channel: "meta",
      framework_type: "comparison",
      framework_name: "Comparação",
      structure: {
        "Cenário Atual (Sem)": "Tentando resolver sozinho. Gastando meses em tentativa e erro. Resultados inconsistentes.",
        "Cenário Ideal (Com)": "Metodologia testada. Resultados em semanas. Equipe alinhada e processos claros.",
        "Diferencial": "Não vendemos horas — entregamos resultados. Modelo de parceria com skin in the game.",
        "CTA": "Descubra se sua empresa está pronta para escalar — assessment gratuito.",
      },
      notes: "Foco em conteúdo educativo que demonstre expertise sem ser vendedor.",
    },
  ],
  segmentations: [
    {
      channel: "google",
      audience_name: "Empresários Buscando Consultoria",
      targeting_criteria: { tipo: "Keywords de intenção", match: "Phrase + Exact", negativos: "vagas, emprego, curso, grátis" },
      message_angle: "Solução especializada. Resultados comprovados. Diagnóstico gratuito.",
      priority: "high",
      notes: "Foco em keywords de alta intenção comercial.",
    },
    {
      channel: "linkedin",
      audience_name: "C-Level e Diretores",
      targeting_criteria: { cargo: "CEO, Diretor, VP, Sócio", empresa: "20-500 funcionários", setor: "Alinhado com expertise da consultoria" },
      message_angle: "Visão estratégica, dados de mercado, cases de empresas similares.",
      priority: "high",
      notes: "Segmentação mais restrita = maior custo mas melhor qualidade.",
    },
    {
      channel: "meta",
      audience_name: "Retargeting + Lookalike",
      targeting_criteria: { tipo: "Lookalike 1-2% de leads qualificados", exclusão: "Clientes atuais", retargeting: "Visitantes últimos 30 dias" },
      message_angle: "Conteúdo de valor: webinars, guias, frameworks gratuitos.",
      priority: "medium",
      notes: "Meta funciona melhor para consultoria no topo e meio de funil.",
    },
  ],
  testPlans: [
    {
      channel: "google",
      test_name: "CTA: Diagnóstico Gratuito vs. Agende Reunião",
      hypothesis: "Oferta de 'Diagnóstico Gratuito' terá taxa de conversão 25% maior que 'Agende uma Reunião'.",
      what_to_test: "Dois conjuntos de anúncios com CTAs diferentes apontando para a mesma LP",
      success_criteria: "Taxa de conversão > 5% com CPA < R$300",
      priority: "high",
    },
    {
      channel: "linkedin",
      test_name: "Formato: Documento PDF vs. Post com Imagem",
      hypothesis: "Document Ads com framework/checklist terão 50% mais leads que posts com imagem estática.",
      what_to_test: "Document Ad (PDF 5 páginas) vs. Single Image Ad com mesmo conteúdo resumido",
      success_criteria: "CPL < R$250 e engagement > 2.5%",
      priority: "high",
    },
    {
      channel: "meta",
      test_name: "Público: Lookalike 1% vs. 3%",
      hypothesis: "Lookalike 1% terá CPL 20% menor mas volume 60% menor que Lookalike 3%.",
      what_to_test: "Mesma campanha e criativos para Lookalike 1% vs. 3%",
      success_criteria: "Encontrar o melhor equilíbrio CPL vs. volume para escalar",
      priority: "medium",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// TEMPLATE 3: E-commerce B2B / Indústria
// ═══════════════════════════════════════════════════════════
const ecommerceIndustria: TacticalTemplate = {
  id: "ecommerce-industria",
  name: "E-commerce & Indústria B2B",
  niche: "E-commerce B2B e Indústria",
  description: "Plano tático para empresas industriais e e-commerces B2B. Foco em catálogo de produtos, orçamentos e vendas recorrentes com ticket médio alto.",
  tags: ["Indústria", "E-commerce", "B2B", "Catálogo", "Orçamento"],
  icon: "🏭",
  color: "text-amber-600",
  bgColor: "bg-amber-500/10",
  channels: [
    {
      channel: "google",
      campaign_type: "Performance Max",
      funnel_stage: "conversion",
      funnel_role: "Captura de demanda existente e geração de orçamentos",
      bidding_strategy: "ROAS Alvo",
      ad_group_structure: [
        { name: "Produtos Específicos", intent: "Buscas por nome/código de produto" },
        { name: "Categoria de Produto", intent: "Buscas por categoria (ex: equipamentos industriais, insumos)" },
        { name: "Aplicação / Uso", intent: "Buscas por aplicação (ex: soldagem, usinagem, embalagem)" },
        { name: "Compra por Volume", intent: "Buscas com intenção de compra em quantidade (atacado, distribuidor)" },
        { name: "Peças e Reposição", intent: "Buscas por peças de reposição e manutenção" },
      ],
      extensions_plan: ["Sitelinks", "Frases de Destaque", "Extensão de Preço", "Extensão de Promoção", "Extensão de Chamada"],
      quality_score_factors: {
        ad_relevance: "Incluir código/modelo do produto no headline quando possível. Mencionar condições B2B (faturamento, volume).",
        landing_page: "Página de produto com ficha técnica, preço sob consulta, formulário de orçamento e chat.",
        expected_ctr: "Destacar diferenciais: 'Entrega em 48h', 'Faturamento 30/60/90', 'Estoque Pronta Entrega'.",
      },
      key_metrics: [
        { metric: "ROAS", target: "> 5x" },
        { metric: "CPA (Custo por Orçamento)", target: "< R$80" },
        { metric: "Taxa de Conversão", target: "> 3%" },
        { metric: "Ticket Médio", target: "> R$2.000" },
        { metric: "Orçamento para Venda", target: "> 20%" },
      ],
    },
    {
      channel: "meta",
      campaign_type: "Vendas",
      funnel_stage: "consideration",
      funnel_role: "Remarketing de catálogo e promoções para base existente",
      bidding_strategy: "ROAS Mínimo",
      ad_group_structure: [
        { name: "Catálogo Dinâmico", intent: "Retargeting com produtos visualizados no site" },
        { name: "Promoções B2B", intent: "Ofertas especiais para compras em volume" },
        { name: "Novos Produtos", intent: "Lançamentos e novidades do catálogo" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "ROAS", target: "> 4x" },
        { metric: "CPA", target: "< R$100" },
        { metric: "CTR Catálogo", target: "> 2%" },
        { metric: "Frequência", target: "< 4x por semana" },
      ],
    },
    {
      channel: "linkedin",
      campaign_type: "Sponsored Content",
      funnel_stage: "awareness",
      funnel_role: "Posicionamento institucional e alcance de compradores industriais",
      bidding_strategy: "Entrega Máxima",
      ad_group_structure: [
        { name: "Compradores / Procurement", intent: "Profissionais de compras e supply chain" },
        { name: "Engenheiros / Técnicos", intent: "Especificadores técnicos que influenciam a compra" },
        { name: "Diretores Industriais", intent: "Decisores de investimento em equipamentos" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$180" },
        { metric: "Engagement Rate", target: "> 1.5%" },
        { metric: "Impressões Qualificadas", target: "> 15k/mês" },
      ],
    },
    {
      channel: "tiktok",
      campaign_type: "In-Feed Ads",
      funnel_stage: "awareness",
      funnel_role: "Demonstração de produtos e processos industriais",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Produto em Ação", intent: "Vídeos de produtos funcionando na prática" },
        { name: "Processo Produtivo", intent: "Bastidores da fábrica e processos" },
        { name: "Antes e Depois", intent: "Resultados visuais do uso dos produtos" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPV", target: "< R$0.04" },
        { metric: "Taxa de Retenção 6s", target: "> 55%" },
        { metric: "Compartilhamentos", target: "> 3% dos views" },
      ],
    },
  ],
  copyFrameworks: [
    {
      channel: "google",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "Fornecedor atrasando entregas? Qualidade inconsistente? Preços sem transparência?",
        "Solução / Benefício": "Catálogo completo com estoque pronta entrega. Faturamento facilitado. Suporte técnico incluso.",
        "Prova / Evidência": "X anos no mercado. Y clientes industriais. Certificações ISO. Entrega em 48h.",
        "CTA / Chamada para Ação": "Solicite orçamento sem compromisso. Condições especiais para volume.",
      },
      notes: "B2B industrial valoriza confiabilidade, prazo e condições comerciais.",
    },
    {
      channel: "meta",
      framework_type: "comparison",
      framework_name: "Comparação",
      structure: {
        "Cenário Atual (Sem)": "Cotando com 5 fornecedores. Esperando dias por resposta. Qualidade variável.",
        "Cenário Ideal (Com)": "Um fornecedor confiável. Orçamento em minutos. Qualidade garantida. Entrega no prazo.",
        "Diferencial": "Plataforma de compra online B2B. Histórico de pedidos. Recompra simplificada.",
        "CTA": "Cadastre-se e receba condições exclusivas para o primeiro pedido.",
      },
      notes: "Foco em conveniência e economia de tempo do comprador.",
    },
  ],
  segmentations: [
    {
      channel: "google",
      audience_name: "Compradores com Intenção Imediata",
      targeting_criteria: { tipo: "Keywords produto + comprar/orçamento/preço", match: "Exact + Phrase", negativos: "usado, grátis, como fazer" },
      message_angle: "Estoque disponível. Entrega rápida. Condições B2B.",
      priority: "high",
      notes: "Maior ROI. Priorizar budget aqui.",
    },
    {
      channel: "meta",
      audience_name: "Retargeting de Catálogo",
      targeting_criteria: { tipo: "Dynamic Product Ads", janela: "Últimos 14 dias", exclusão: "Compradores últimos 30 dias" },
      message_angle: "Produto que você viu está disponível. Condições especiais.",
      priority: "high",
      notes: "DPA é o formato mais eficiente para e-commerce B2B no Meta.",
    },
    {
      channel: "linkedin",
      audience_name: "Profissionais de Compras",
      targeting_criteria: { cargo: "Comprador, Procurement, Supply Chain, Gerente de Compras", setor: "Indústria, Manufatura, Construção" },
      message_angle: "Conteúdo técnico, cases de fornecimento, catálogo digital.",
      priority: "medium",
      notes: "LinkedIn para indústria funciona bem com conteúdo técnico e institucional.",
    },
  ],
  testPlans: [
    {
      channel: "google",
      test_name: "PMax vs. Search para Produtos de Alto Ticket",
      hypothesis: "Performance Max terá ROAS 15% maior que Search puro para produtos acima de R$5k.",
      what_to_test: "Campanha PMax com feed de produtos vs. Search com keywords específicas",
      success_criteria: "ROAS > 5x com volume mínimo de 50 conversões/mês",
      priority: "high",
    },
    {
      channel: "meta",
      test_name: "DPA: Janela 7 dias vs. 14 dias",
      hypothesis: "Retargeting de 7 dias terá taxa de conversão 40% maior mas volume 50% menor.",
      what_to_test: "Mesmo catálogo com janelas de retargeting diferentes",
      success_criteria: "Encontrar melhor equilíbrio ROAS vs. volume",
      priority: "medium",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// TEMPLATE 4: Educação Corporativa / EdTech B2B
// ═══════════════════════════════════════════════════════════
const educacaoCorporativa: TacticalTemplate = {
  id: "educacao-corporativa",
  name: "Educação Corporativa",
  niche: "EdTech e Treinamento B2B",
  description: "Plano tático para plataformas de educação corporativa, treinamentos B2B e EdTechs. Foco em demonstrações, pilotos gratuitos e vendas para RH/T&D.",
  tags: ["EdTech", "Treinamento", "RH", "T&D", "Educação"],
  icon: "🎓",
  color: "text-green-600",
  bgColor: "bg-green-500/10",
  channels: [
    {
      channel: "google",
      campaign_type: "Search",
      funnel_stage: "conversion",
      funnel_role: "Captura de empresas buscando soluções de treinamento",
      bidding_strategy: "CPA Alvo",
      ad_group_structure: [
        { name: "Plataforma LMS", intent: "Buscas por plataforma de treinamento, LMS, EAD corporativo" },
        { name: "Treinamento por Tema", intent: "Buscas por treinamento de liderança, vendas, compliance, etc." },
        { name: "Problema de RH", intent: "Buscas por turnover, engajamento, onboarding" },
        { name: "Concorrentes", intent: "Buscas por alternativas a plataformas conhecidas" },
      ],
      extensions_plan: ["Sitelinks", "Frases de Destaque", "Snippets Estruturados", "Extensão de Chamada"],
      quality_score_factors: {
        ad_relevance: "Mencionar o tipo de treinamento e o público-alvo (ex: 'Treinamento de Liderança para Gestores').",
        landing_page: "LP com demo interativa, cases de empresas conhecidas, ROI do treinamento.",
        expected_ctr: "Usar dados: 'Reduza turnover em 40%'. CTAs: 'Teste Grátis 30 Dias', 'Veja Demo'.",
      },
      key_metrics: [
        { metric: "CPA (Custo por Demo)", target: "< R$200" },
        { metric: "Taxa de Conversão LP", target: "> 6%" },
        { metric: "CTR", target: "> 3.5%" },
        { metric: "Demo para Piloto", target: "> 30%" },
      ],
    },
    {
      channel: "meta",
      campaign_type: "Leads",
      funnel_stage: "consideration",
      funnel_role: "Geração de leads com conteúdo educativo e webinars",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Webinars e Eventos", intent: "Promoção de webinars sobre tendências de T&D" },
        { name: "E-books e Pesquisas", intent: "Materiais ricos sobre educação corporativa" },
        { name: "Retargeting", intent: "Visitantes do site e participantes de webinars" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$60" },
        { metric: "CTR", target: "> 1.5%" },
        { metric: "Lead para MQL", target: "> 20%" },
        { metric: "Custo por Webinar Lead", target: "< R$30" },
      ],
    },
    {
      channel: "linkedin",
      campaign_type: "Sponsored Content",
      funnel_stage: "consideration",
      funnel_role: "Alcançar decisores de RH e T&D com conteúdo de autoridade",
      bidding_strategy: "Entrega Máxima",
      ad_group_structure: [
        { name: "RH e T&D", intent: "Diretores e gerentes de RH, T&D, People" },
        { name: "C-Level", intent: "CEOs e diretores que aprovam investimento em treinamento" },
        { name: "Empresas por Tamanho", intent: "Empresas 100+ funcionários (escala para treinamento)" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$180" },
        { metric: "Engagement Rate", target: "> 2%" },
        { metric: "Lead para Demo", target: "> 15%" },
      ],
    },
    {
      channel: "tiktok",
      campaign_type: "Spark Ads",
      funnel_stage: "awareness",
      funnel_role: "Conteúdo educativo viral sobre desenvolvimento profissional",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Dicas de Carreira", intent: "Conteúdo sobre soft skills, liderança, produtividade" },
        { name: "Tendências de RH", intent: "Novidades e tendências em gestão de pessoas" },
        { name: "Bastidores", intent: "Como funciona a plataforma, depoimentos de alunos" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPV", target: "< R$0.03" },
        { metric: "Taxa de Retenção 6s", target: "> 50%" },
        { metric: "Salvamentos", target: "> 3% dos views" },
      ],
    },
  ],
  copyFrameworks: [
    {
      channel: "google",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "Turnover alto? Equipe desmotivada? Onboarding lento e ineficiente?",
        "Solução / Benefício": "Plataforma de treinamento que engaja. Conteúdo personalizado. Métricas em tempo real.",
        "Prova / Evidência": "Empresas como [X] reduziram turnover em 35% e aceleraram onboarding em 60%.",
        "CTA / Chamada para Ação": "Teste grátis por 30 dias. Sem compromisso.",
      },
      notes: "RH compra resultados: retenção, engajamento, produtividade. Sempre quantificar.",
    },
    {
      channel: "linkedin",
      framework_type: "authority",
      framework_name: "Autoridade",
      structure: {
        "Credencial / Dado": "Pesquisa LinkedIn Learning: empresas que investem em T&D têm 24% mais retenção.",
        "Expertise Demonstrada": "Nossa plataforma treinou X mil profissionais em Y empresas nos últimos 12 meses.",
        "Resultado Comprovado": "NPS médio de 87. Taxa de conclusão de cursos: 78% (vs. 15% do mercado).",
        "CTA": "Descubra como transformar o T&D da sua empresa — agende uma demo.",
      },
      notes: "LinkedIn é o canal natural para educação corporativa. Investir em conteúdo de dados.",
    },
  ],
  segmentations: [
    {
      channel: "google",
      audience_name: "Empresas Buscando LMS/Treinamento",
      targeting_criteria: { tipo: "Keywords de intenção", match: "Phrase + Exact", negativos: "grátis, individual, curso online pessoal" },
      message_angle: "Solução corporativa. ROI comprovado. Teste gratuito.",
      priority: "high",
      notes: "Separar keywords B2B de B2C (educação corporativa vs. curso pessoal).",
    },
    {
      channel: "linkedin",
      audience_name: "Líderes de RH e T&D",
      targeting_criteria: { cargo: "CHRO, Diretor RH, Gerente T&D, Head of People", empresa: "100+ funcionários", função: "Human Resources, Training" },
      message_angle: "Dados de mercado, tendências, ROI de treinamento.",
      priority: "high",
      notes: "Decisores de T&D são muito ativos no LinkedIn.",
    },
  ],
  testPlans: [
    {
      channel: "google",
      test_name: "LP: Demo Interativa vs. Vídeo Demo",
      hypothesis: "Demo interativa (sandbox) terá taxa de conversão 35% maior que vídeo de demonstração.",
      what_to_test: "LP com acesso a sandbox vs. LP com vídeo de 3 minutos",
      success_criteria: "Taxa de conversão > 6% e tempo na página > 3 minutos",
      priority: "high",
    },
    {
      channel: "linkedin",
      test_name: "Conteúdo: Pesquisa Original vs. Curadoria",
      hypothesis: "Posts com dados de pesquisa própria terão 60% mais engagement que curadoria de terceiros.",
      what_to_test: "Post com infográfico de pesquisa própria vs. post comentando pesquisa do mercado",
      success_criteria: "Engagement rate > 2.5% e CPL < R$180",
      priority: "medium",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// TEMPLATE 5: Fintech / Serviços Financeiros B2B
// ═══════════════════════════════════════════════════════════
const fintechB2B: TacticalTemplate = {
  id: "fintech-b2b",
  name: "Fintech & Financeiro B2B",
  niche: "Fintech e Serviços Financeiros",
  description: "Plano tático para fintechs e empresas de serviços financeiros B2B. Foco em confiança, compliance, segurança e geração de leads qualificados com alto ticket.",
  tags: ["Fintech", "Financeiro", "B2B", "Compliance", "Segurança"],
  icon: "💰",
  color: "text-emerald-600",
  bgColor: "bg-emerald-500/10",
  channels: [
    {
      channel: "google",
      campaign_type: "Search",
      funnel_stage: "conversion",
      funnel_role: "Captura de empresas buscando soluções financeiras",
      bidding_strategy: "CPA Alvo",
      ad_group_structure: [
        { name: "Solução Financeira", intent: "Buscas por tipo de solução (ex: antecipação de recebíveis, conta PJ, gateway)" },
        { name: "Problema Financeiro", intent: "Buscas por problemas (ex: fluxo de caixa, inadimplência, conciliação)" },
        { name: "Comparação", intent: "Buscas comparando soluções financeiras" },
        { name: "Regulatório", intent: "Buscas por compliance, LGPD, Bacen" },
      ],
      extensions_plan: ["Sitelinks", "Frases de Destaque", "Snippets Estruturados", "Extensão de Chamada"],
      quality_score_factors: {
        ad_relevance: "Mencionar segurança, regulamentação e benefícios financeiros concretos.",
        landing_page: "LP com selos de segurança, certificações, cases com números reais de economia.",
        expected_ctr: "Usar dados financeiros: 'Economize até 40% em taxas'. Selos de confiança no anúncio.",
      },
      key_metrics: [
        { metric: "CPA", target: "< R$250" },
        { metric: "Taxa de Conversão", target: "> 4%" },
        { metric: "CTR", target: "> 3%" },
        { metric: "Lead para Oportunidade", target: "> 20%" },
      ],
    },
    {
      channel: "meta",
      campaign_type: "Leads",
      funnel_stage: "consideration",
      funnel_role: "Educação financeira e geração de leads via conteúdo",
      bidding_strategy: "Custo por Resultado Alvo",
      ad_group_structure: [
        { name: "Conteúdo Educativo", intent: "Guias sobre gestão financeira, compliance, tendências" },
        { name: "Calculadoras e Tools", intent: "Ferramentas gratuitas de simulação e cálculo" },
        { name: "Retargeting", intent: "Visitantes do site e leads não convertidos" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$100" },
        { metric: "CTR", target: "> 1.2%" },
        { metric: "Lead para MQL", target: "> 18%" },
      ],
    },
    {
      channel: "linkedin",
      campaign_type: "Sponsored Content",
      funnel_stage: "consideration",
      funnel_role: "Alcançar CFOs e diretores financeiros com conteúdo de autoridade",
      bidding_strategy: "Entrega Máxima",
      ad_group_structure: [
        { name: "CFOs e Diretores Financeiros", intent: "Decisores de investimento em soluções financeiras" },
        { name: "Controllers e Tesouraria", intent: "Influenciadores técnicos na decisão" },
        { name: "Empresas por Faturamento", intent: "Empresas com faturamento alinhado ao ICP" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$220" },
        { metric: "Engagement Rate", target: "> 1.8%" },
        { metric: "Lead para Reunião", target: "> 15%" },
      ],
    },
    {
      channel: "tiktok",
      campaign_type: "Spark Ads",
      funnel_stage: "awareness",
      funnel_role: "Desmistificar finanças empresariais com conteúdo acessível",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Dicas Financeiras", intent: "Tips rápidos sobre gestão financeira para empresas" },
        { name: "Mitos Financeiros", intent: "Desmistificar crenças sobre finanças empresariais" },
        { name: "Números e Dados", intent: "Dados surpreendentes sobre finanças B2B" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPV", target: "< R$0.04" },
        { metric: "Taxa de Retenção 6s", target: "> 45%" },
        { metric: "Salvamentos", target: "> 4% dos views" },
      ],
    },
  ],
  copyFrameworks: [
    {
      channel: "google",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "Taxas abusivas? Fluxo de caixa imprevisível? Conciliação manual consumindo horas?",
        "Solução / Benefício": "Plataforma financeira completa. Taxas transparentes. Automação total.",
        "Prova / Evidência": "X mil empresas confiam. Regulamentado pelo Bacen. Economia média de 40% em taxas.",
        "CTA / Chamada para Ação": "Simule gratuitamente. Sem compromisso.",
      },
      notes: "Fintech B2B precisa transmitir segurança e confiança acima de tudo.",
    },
    {
      channel: "linkedin",
      framework_type: "authority",
      framework_name: "Autoridade",
      structure: {
        "Credencial / Dado": "Regulamentado pelo Bacen. Certificação PCI-DSS. SOC 2 Type II.",
        "Expertise Demonstrada": "Processamos R$X bilhões/ano para Y mil empresas com 99.99% de uptime.",
        "Resultado Comprovado": "Clientes economizam em média 40% em taxas e 20h/mês em conciliação.",
        "CTA": "Fale com um especialista — análise financeira gratuita da sua operação.",
      },
      notes: "CFOs querem dados, segurança e ROI comprovado. Evitar promessas vagas.",
    },
  ],
  segmentations: [
    {
      channel: "google",
      audience_name: "Empresas Buscando Soluções Financeiras",
      targeting_criteria: { tipo: "Keywords de intenção comercial", match: "Exact + Phrase", negativos: "pessoal, pessoa física, grátis" },
      message_angle: "Segurança, economia, automação. Simulação gratuita.",
      priority: "high",
      notes: "Separar B2B de B2C nas keywords é crítico para fintech.",
    },
    {
      channel: "linkedin",
      audience_name: "CFOs e Diretores Financeiros",
      targeting_criteria: { cargo: "CFO, Diretor Financeiro, Controller, VP Finance", empresa: "50+ funcionários", setor: "Todos (exceto financeiro)" },
      message_angle: "ROI, compliance, eficiência operacional.",
      priority: "high",
      notes: "LinkedIn é o melhor canal para alcançar decisores financeiros.",
    },
  ],
  testPlans: [
    {
      channel: "google",
      test_name: "LP: Simulador vs. Formulário Tradicional",
      hypothesis: "LP com simulador financeiro interativo terá conversão 40% maior que formulário padrão.",
      what_to_test: "LP com calculadora/simulador vs. LP com formulário de contato",
      success_criteria: "Taxa de conversão > 4% e qualidade do lead mantida",
      priority: "high",
    },
    {
      channel: "linkedin",
      test_name: "Formato: Infográfico Financeiro vs. Artigo Longo",
      hypothesis: "Infográfico com dados financeiros terá 50% mais cliques que artigo longo.",
      what_to_test: "Single Image com infográfico vs. Article/Newsletter",
      success_criteria: "CTR > 1% e CPL < R$220",
      priority: "medium",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// TEMPLATE 6: Saúde e Bem-estar Corporativo
// ═══════════════════════════════════════════════════════════
const saudeCorporativa: TacticalTemplate = {
  id: "saude-corporativa",
  name: "Saúde Corporativa",
  niche: "Saúde e Bem-estar Corporativo",
  description: "Plano tático para empresas de saúde ocupacional, bem-estar corporativo e benefícios. Foco em RH, redução de absenteísmo e programas de qualidade de vida.",
  tags: ["Saúde", "Bem-estar", "RH", "Benefícios", "Corporativo"],
  icon: "🏥",
  color: "text-rose-600",
  bgColor: "bg-rose-500/10",
  channels: [
    {
      channel: "google",
      campaign_type: "Search",
      funnel_stage: "conversion",
      funnel_role: "Captura de empresas buscando soluções de saúde corporativa",
      bidding_strategy: "Maximizar Conversões",
      ad_group_structure: [
        { name: "Saúde Ocupacional", intent: "Buscas por medicina do trabalho, PCMSO, ASO" },
        { name: "Bem-estar Corporativo", intent: "Buscas por programas de qualidade de vida, ginástica laboral" },
        { name: "Benefícios Saúde", intent: "Buscas por plano de saúde empresarial, telemedicina corporativa" },
        { name: "Problema de RH", intent: "Buscas por absenteísmo, burnout, saúde mental no trabalho" },
      ],
      extensions_plan: ["Sitelinks", "Frases de Destaque", "Extensão de Chamada", "Extensão de Local"],
      quality_score_factors: {
        ad_relevance: "Mencionar conformidade com NRs e legislação. Destacar impacto em produtividade.",
        landing_page: "LP com dados de ROI em saúde, cases de redução de absenteísmo, formulário simples.",
        expected_ctr: "Dados concretos: 'Reduza absenteísmo em 30%'. CTA: 'Diagnóstico Gratuito'.",
      },
      key_metrics: [
        { metric: "CPA", target: "< R$180" },
        { metric: "Taxa de Conversão", target: "> 5%" },
        { metric: "CTR", target: "> 3%" },
        { metric: "Lead para Proposta", target: "> 25%" },
      ],
    },
    {
      channel: "meta",
      campaign_type: "Leads",
      funnel_stage: "consideration",
      funnel_role: "Conteúdo sobre saúde corporativa e geração de leads",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Conteúdo Saúde Mental", intent: "Artigos e vídeos sobre saúde mental no trabalho" },
        { name: "Pesquisas e Dados", intent: "Dados sobre absenteísmo, produtividade e saúde" },
        { name: "Retargeting", intent: "Visitantes do site e engajados" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$70" },
        { metric: "CTR", target: "> 1.3%" },
        { metric: "Lead para MQL", target: "> 15%" },
      ],
    },
    {
      channel: "linkedin",
      campaign_type: "Sponsored Content",
      funnel_stage: "consideration",
      funnel_role: "Alcançar RH e decisores com conteúdo sobre saúde corporativa",
      bidding_strategy: "Entrega Máxima",
      ad_group_structure: [
        { name: "RH e People", intent: "Diretores e gerentes de RH, People, Benefícios" },
        { name: "Segurança do Trabalho", intent: "Profissionais de SESMT e segurança" },
        { name: "C-Level", intent: "CEOs de empresas 100+ funcionários" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPL", target: "< R$160" },
        { metric: "Engagement Rate", target: "> 2%" },
        { metric: "Lead para Reunião", target: "> 18%" },
      ],
    },
    {
      channel: "tiktok",
      campaign_type: "Spark Ads",
      funnel_stage: "awareness",
      funnel_role: "Conteúdo educativo sobre saúde no trabalho",
      bidding_strategy: "Menor Custo",
      ad_group_structure: [
        { name: "Dicas de Saúde", intent: "Tips de ergonomia, pausas, saúde mental" },
        { name: "Dados Surpreendentes", intent: "Estatísticas sobre saúde no trabalho" },
      ],
      extensions_plan: [],
      quality_score_factors: {},
      key_metrics: [
        { metric: "CPV", target: "< R$0.03" },
        { metric: "Salvamentos", target: "> 5% dos views" },
      ],
    },
  ],
  copyFrameworks: [
    {
      channel: "google",
      framework_type: "pain_solution_proof_cta",
      framework_name: "Dor → Solução → Prova → CTA",
      structure: {
        "Dor / Problema": "Absenteísmo alto? Custos com saúde crescendo? Equipe desmotivada e estressada?",
        "Solução / Benefício": "Programa completo de saúde corporativa. Redução comprovada de custos e afastamentos.",
        "Prova / Evidência": "Empresas parceiras reduziram absenteísmo em 30% e custos com saúde em 25%.",
        "CTA / Chamada para Ação": "Diagnóstico gratuito da saúde da sua empresa.",
      },
      notes: "Saúde corporativa vende ROI: menos absenteísmo = mais produtividade = menos custos.",
    },
    {
      channel: "linkedin",
      framework_type: "authority",
      framework_name: "Autoridade",
      structure: {
        "Credencial / Dado": "OMS: para cada R$1 investido em saúde mental, retorno de R$4 em produtividade.",
        "Expertise Demonstrada": "Atendemos X empresas com programas personalizados de saúde corporativa.",
        "Resultado Comprovado": "Redução média de 30% no absenteísmo e 40% nos afastamentos por saúde mental.",
        "CTA": "Agende uma conversa com nosso especialista em saúde corporativa.",
      },
      notes: "Usar dados da OMS e pesquisas reconhecidas para construir autoridade.",
    },
  ],
  segmentations: [
    {
      channel: "google",
      audience_name: "Empresas Buscando Saúde Ocupacional",
      targeting_criteria: { tipo: "Keywords de serviço", match: "Phrase + Exact", negativos: "individual, pessoal, grátis" },
      message_angle: "Conformidade legal + redução de custos + bem-estar.",
      priority: "high",
      notes: "Muitas buscas são por obrigação legal (NRs). Aproveitar essa demanda.",
    },
    {
      channel: "linkedin",
      audience_name: "Líderes de RH em Empresas 100+",
      targeting_criteria: { cargo: "CHRO, Diretor RH, Gerente de Benefícios, Head of People", empresa: "100+ funcionários" },
      message_angle: "ROI em saúde, tendências, cases de sucesso.",
      priority: "high",
      notes: "RH é o principal decisor. Mas CFO aprova o budget — considerar conteúdo para ambos.",
    },
  ],
  testPlans: [
    {
      channel: "google",
      test_name: "Abordagem: Compliance vs. ROI",
      hypothesis: "Anúncios focados em ROI (redução de custos) terão CTR 25% maior que focados em compliance (NRs).",
      what_to_test: "Headlines de compliance ('Adeque-se às NRs') vs. ROI ('Reduza custos com saúde em 25%')",
      success_criteria: "CTR > 3% e taxa de conversão mantida",
      priority: "high",
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// EXPORT ALL TEMPLATES
// ═══════════════════════════════════════════════════════════
export const TACTICAL_TEMPLATES: TacticalTemplate[] = [
  saasB2B,
  consultoria,
  ecommerceIndustria,
  educacaoCorporativa,
  fintechB2B,
  saudeCorporativa,
];

export function getTemplateById(id: string): TacticalTemplate | undefined {
  return TACTICAL_TEMPLATES.find((t) => t.id === id);
}
