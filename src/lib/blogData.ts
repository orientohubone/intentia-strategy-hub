import {
  Target,
  Sparkles,
  BarChart3,
  Lightbulb,
  Shield,
  Megaphone,
  DollarSign,
  Users,
  Search,
  TrendingUp,
  Crosshair,
} from "lucide-react";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  categoryColor: string;
  icon: React.ElementType;
  gradient: string;
  featured?: boolean;
  cta?: { label: string; href: string };
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "como-avaliar-prontidao-midia-paga-b2b",
    title: "Como avaliar se seu negócio B2B está pronto para mídia paga",
    excerpt:
      "Antes de investir em Google Ads ou LinkedIn Ads, sua empresa precisa passar por um diagnóstico estratégico. Descubra os 6 pilares que determinam se você está pronto — e como evitar desperdício de budget.",
    author: "Intentia",
    date: "12 de Fevereiro, 2026",
    readTime: "7 min",
    category: "Estratégia",
    categoryColor: "bg-blue-500/10 text-blue-600",
    icon: Target,
    gradient: "from-blue-600 to-cyan-500",
    featured: true,
    cta: { label: "Faça o diagnóstico gratuito", href: "/auth" },
    content: `## O erro mais comum em marketing B2B

A maioria das empresas B2B começa a investir em mídia paga antes de validar se o seu posicionamento digital está preparado para converter. O resultado? Budget desperdiçado, CPL alto e frustração com "marketing digital que não funciona".

A verdade é que **mídia paga amplifica o que já existe**. Se sua proposta de valor não está clara, se a jornada do usuário é confusa ou se o conteúdo não gera confiança — nenhum investimento em ads vai resolver.

## Os 6 pilares da prontidão estratégica

Na Intentia, desenvolvemos um framework de diagnóstico heurístico que avalia 6 dimensões críticas:

### 1. Proposta de Valor
Sua landing page comunica claramente o que você faz, para quem e por que é diferente? Em B2B, o visitante precisa entender isso em menos de 5 segundos.

### 2. Clareza da Oferta
O próximo passo está óbvio? Existe um CTA claro? O visitante sabe exatamente o que vai acontecer ao clicar?

### 3. Jornada do Usuário
A navegação faz sentido? O conteúdo guia o visitante do problema à solução? Existe prova social no momento certo?

### 4. SEO Técnico
Dados estruturados, meta tags, velocidade de carregamento — tudo isso impacta diretamente o Quality Score do Google Ads e o custo por clique.

### 5. Conversão
Formulários otimizados, micro-conversões, remarketing preparado. Sem isso, você paga pelo clique mas perde a conversão.

### 6. Qualidade de Conteúdo
Conteúdo relevante, atualizado e alinhado com as dores do ICP. Conteúdo fraco = bounce rate alto = budget desperdiçado.

## Como usar esse framework

A Intentia automatiza essa análise. Basta inserir a URL do seu negócio e em segundos você recebe scores de 0 a 100 para cada dimensão, com insights acionáveis e alertas de risco.

**O diagnóstico heurístico é gratuito** e disponível para todos os planos. É o primeiro passo antes de qualquer investimento em mídia.

## Quando NÃO investir em mídia paga

Se seu score geral está abaixo de 50, investir em mídia paga é prematuro. A Intentia gera alertas automáticos de investimento prematuro exatamente para evitar esse cenário.

Corrija primeiro os pilares com score baixo. Depois, com a base sólida, cada real investido em mídia terá retorno muito maior.`,
  },
  {
    slug: "benchmark-competitivo-swot-b2b",
    title: "Benchmark competitivo: como usar análise SWOT para superar concorrentes em B2B",
    excerpt:
      "Entenda como comparar seu posicionamento digital com concorrentes usando análise SWOT automatizada, gap analysis e enriquecimento por IA para encontrar vantagens competitivas reais.",
    author: "Intentia",
    date: "8 de Fevereiro, 2026",
    readTime: "9 min",
    category: "Benchmark",
    categoryColor: "bg-emerald-500/10 text-emerald-600",
    icon: BarChart3,
    gradient: "from-emerald-600 to-teal-500",
    cta: { label: "Compare com concorrentes", href: "/auth" },
    content: `## Por que benchmark importa em B2B

Em mercados B2B, a decisão de compra é racional e comparativa. Seu prospect está avaliando 3 a 5 fornecedores simultaneamente. Se você não sabe como se posiciona em relação aos concorrentes, está competindo no escuro.

## O que é análise SWOT automatizada

A análise SWOT tradicional é subjetiva e demorada. Na Intentia, automatizamos o processo:

1. **Você insere a URL do concorrente** junto ao seu projeto
2. **O sistema analisa ambos os sites** usando o mesmo framework de 6 dimensões
3. **Gera automaticamente** Forças, Fraquezas, Oportunidades e Ameaças
4. **Enriquece com IA** (Gemini ou Claude) para insights mais profundos

### Forças (Strengths)
Onde você é melhor que o concorrente? Proposta de valor mais clara? Melhor SEO? Mais provas sociais?

### Fraquezas (Weaknesses)
Onde o concorrente te supera? Conteúdo mais rico? Jornada mais fluida? CTA mais convincente?

### Oportunidades (Opportunities)
Gaps que nenhum dos dois explora. Keywords sem competição, nichos mal atendidos, formatos de conteúdo ausentes.

### Ameaças (Threats)
Movimentos do concorrente que podem impactar seu market share. Novos features, reposicionamento, investimento agressivo em ads.

## Gap Analysis: o diferencial

Além do SWOT, a Intentia gera um **gap analysis** detalhado — uma comparação dimensão por dimensão mostrando exatamente onde estão as maiores diferenças e o que priorizar.

## Como usar na prática

1. Crie um projeto com sua URL
2. Adicione URLs de concorrentes
3. Execute a análise
4. Use o SWOT para definir prioridades
5. Monte o plano tático baseado nos gaps identificados

O benchmark não é um exercício acadêmico — é a base para decisões de investimento em mídia mais inteligentes.`,
  },
  {
    slug: "ia-gemini-claude-marketing-b2b",
    title: "Gemini vs Claude: qual IA usar para análise de marketing B2B?",
    excerpt:
      "Comparativo prático entre Google Gemini e Anthropic Claude para análise estratégica de marketing. Descubra quando usar cada um e como configurar na Intentia.",
    author: "Intentia",
    date: "5 de Fevereiro, 2026",
    readTime: "8 min",
    category: "Inteligência Artificial",
    categoryColor: "bg-purple-500/10 text-purple-600",
    icon: Sparkles,
    gradient: "from-purple-600 to-pink-500",
    cta: { label: "Configure sua API key", href: "/auth" },
    content: `## IA como copiloto estratégico

A análise heurística da Intentia já entrega scores e insights automaticamente. Mas quando você adiciona IA ao processo, o nível de profundidade muda completamente.

Na Intentia, você configura sua própria API key — sem custos adicionais da plataforma. Você paga apenas o uso direto da API.

## Google Gemini

### Pontos fortes
- **Velocidade**: Gemini Flash é extremamente rápido para análises em lote
- **Contexto amplo**: Janela de contexto grande, ideal para analisar páginas inteiras
- **Custo**: Flash é significativamente mais barato por token
- **Integração Google**: Entende bem o ecossistema de ads e SEO

### Modelos disponíveis na Intentia
- Gemini 2.5 Flash — melhor custo-benefício
- Gemini 2.5 Pro Preview — mais profundo
- Gemini 2.0 Flash — estável e rápido

### Melhor para
Análises em volume, diagnósticos rápidos, enriquecimento de ICP, análise de SEO.

## Anthropic Claude

### Pontos fortes
- **Raciocínio**: Claude é superior em análise estratégica e raciocínio complexo
- **Nuance**: Melhor em captar sutilezas de posicionamento e tom de comunicação
- **Estrutura**: Gera outputs mais bem organizados e acionáveis
- **Segurança**: Menos propenso a alucinações em análises factuais

### Modelos disponíveis na Intentia
- Claude Sonnet 4 — melhor equilíbrio
- Claude Sonnet 3.7 — rápido e capaz
- Claude Haiku 3.5 — econômico para tarefas simples
- Claude Opus 3 — máxima qualidade

### Melhor para
Análise SWOT profunda, resumo executivo, recomendações estratégicas, benchmark competitivo.

## Recomendação prática

| Tarefa | Recomendação |
|--------|-------------|
| Diagnóstico rápido de URL | Gemini Flash |
| Análise SWOT de benchmark | Claude Sonnet |
| Enriquecimento de ICP | Gemini Flash |
| Resumo executivo para cliente | Claude Sonnet |
| Análise de performance | Gemini Flash |

## Como configurar

1. Acesse **Configurações → Integrações de IA**
2. Insira sua API key (Google AI Studio ou Anthropic Console)
3. Selecione o modelo preferido
4. A plataforma valida a key automaticamente

Você pode ter ambas configuradas e usar cada uma para o que faz melhor.`,
  },
  {
    slug: "score-canal-google-meta-linkedin-tiktok",
    title: "Score por canal: como saber onde investir entre Google, Meta, LinkedIn e TikTok",
    excerpt:
      "Cada canal de mídia tem um perfil ideal. Descubra como a Intentia calcula scores individuais para cada plataforma e como usar isso para alocar budget de forma inteligente.",
    author: "Intentia",
    date: "1 de Fevereiro, 2026",
    readTime: "10 min",
    category: "Canais de Mídia",
    categoryColor: "bg-orange-500/10 text-orange-600",
    icon: Lightbulb,
    gradient: "from-orange-600 to-amber-500",
    cta: { label: "Descubra seus scores", href: "/auth" },
    content: `## O problema da alocação de budget

"Onde devo investir meu budget de mídia?" — essa é a pergunta mais frequente em marketing B2B. E a resposta quase sempre é "depende".

Depende do seu nicho, do seu ICP, da maturidade do seu conteúdo, da sua presença digital e de dezenas de outros fatores. A Intentia transforma esse "depende" em dados concretos.

## Como funciona o Score por Canal

Após a análise heurística do seu site, a Intentia calcula um score de 0 a 100 para cada canal:

### Google Ads (Search + Display)
Avalia: SEO técnico, dados estruturados, qualidade de conteúdo, relevância de keywords, velocidade do site. Sites com bom SEO tendem a ter Quality Scores mais altos e CPCs mais baixos.

### Meta Ads (Facebook + Instagram)
Avalia: Apelo visual, prova social, storytelling, jornada de conversão, remarketing. B2B com conteúdo visual forte e cases de sucesso se beneficia mais.

### LinkedIn Ads
Avalia: Posicionamento B2B, clareza de ICP, conteúdo profissional, autoridade no nicho. O canal mais caro por clique, mas com a melhor qualificação para B2B.

### TikTok Ads
Avalia: Potencial de conteúdo educativo, nicho com audiência jovem, capacidade de produção de vídeo. Nem todo B2B se beneficia — e a Intentia te avisa quando não faz sentido.

## Objetivos recomendados por canal

Cada canal recebe não apenas um score, mas também:
- **Objetivo recomendado** (awareness, consideração, conversão)
- **Papel no funil** (topo, meio, fundo)
- **Riscos identificados** (budget mínimo, sazonalidade, competição)
- **Nível de recomendação** (recomendado, com ressalvas, não recomendado)

## Alertas de investimento prematuro

Se o score de um canal está abaixo de 40, a Intentia gera um **alerta de investimento prematuro**. Isso significa que investir nesse canal agora provavelmente resultará em desperdício.

O alerta vem com recomendações específicas do que melhorar antes de investir.

## Na prática

Use os scores para:
1. **Priorizar canais** — comece pelo score mais alto
2. **Alocar budget** — proporcionalmente aos scores
3. **Definir timeline** — canais com score baixo entram depois de melhorias
4. **Justificar decisões** — dados concretos para apresentar ao board`,
  },
  {
    slug: "gestao-campanhas-kpis-performance",
    title: "35+ KPIs que importam: como monitorar campanhas B2B sem se perder em métricas",
    excerpt:
      "CPL, CPA, ROAS, CTR, CPC... são dezenas de métricas disponíveis. Aprenda quais realmente importam para B2B e como a Intentia organiza tudo em um dashboard operacional.",
    author: "Intentia",
    date: "28 de Janeiro, 2026",
    readTime: "11 min",
    category: "Operações",
    categoryColor: "bg-red-500/10 text-red-600",
    icon: Megaphone,
    gradient: "from-red-600 to-rose-500",
    cta: { label: "Gerencie suas campanhas", href: "/auth" },
    content: `## O paradoxo das métricas

Mais dados nem sempre significam melhores decisões. O problema em marketing B2B é que cada plataforma oferece dezenas de métricas, e sem um framework claro, você acaba monitorando tudo sem entender nada.

## Hierarquia de métricas B2B

### Nível 1: Métricas de Negócio (as que o CEO quer ver)
- **CAC** (Custo de Aquisição de Cliente)
- **LTV** (Lifetime Value)
- **ROAS** (Return on Ad Spend)
- **Pipeline gerado** (valor em R$)
- **Ciclo de vendas** (dias)

### Nível 2: Métricas de Marketing (as que o CMO monitora)
- **MQLs** (Marketing Qualified Leads)
- **SQLs** (Sales Qualified Leads)
- **Taxa de conversão MQL → SQL**
- **CPL** (Custo por Lead)
- **CPA** (Custo por Aquisição)

### Nível 3: Métricas de Canal (as que o gestor de mídia otimiza)
- **CTR** (Click-Through Rate)
- **CPC** (Custo por Clique)
- **CPM** (Custo por Mil Impressões)
- **Quality Score / Relevance Score**
- **Impression Share**
- **Frequency**

### Nível 4: Métricas de Criativo (as que o designer precisa)
- **Hook rate** (primeiros 3 segundos em vídeo)
- **Engagement rate**
- **Thumb-stop ratio**
- **Completion rate**

## Como a Intentia organiza isso

O módulo de Operações da Intentia permite:

1. **Criar campanhas por canal** com todas as métricas relevantes
2. **Dashboard operacional** com KPIs automáticos por campanha
3. **Análise por IA** que identifica padrões e anomalias
4. **Alertas automáticos** (11 regras) para budget, eficiência e qualidade
5. **Comparativo tático vs real** — o que foi planejado vs o que está acontecendo

## Budget pacing em tempo real

Um dos maiores problemas em gestão de campanhas é o controle de budget. A Intentia calcula o pacing em tempo real:

- **Quanto foi gasto** vs quanto deveria ter sido gasto
- **Projeção de gasto** até o final do período
- **Alertas de estouro** antes que aconteça

## Calendário e Timeline

Visualize todas as campanhas em:
- **Calendário mensal** — visão macro de todas as campanhas ativas
- **Timeline Gantt** — sobreposições, gaps e dependências

Isso evita o problema clássico de campanhas competindo entre si pelo mesmo público.`,
  },
  {
    slug: "icp-enriquecimento-ia-publico-alvo-b2b",
    title: "Como refinar seu ICP com IA e dados públicos para campanhas B2B mais precisas",
    excerpt:
      "Públicos-alvo genéricos geram leads genéricos. Aprenda a usar IA combinada com dados do SEBRAE e IBGE para criar ICPs detalhados com decisores, dores e keywords otimizadas.",
    author: "Intentia",
    date: "24 de Janeiro, 2026",
    readTime: "8 min",
    category: "Públicos-Alvo",
    categoryColor: "bg-indigo-500/10 text-indigo-600",
    icon: Users,
    gradient: "from-indigo-600 to-violet-500",
    cta: { label: "Mapeie seus públicos", href: "/auth" },
    content: `## O problema do ICP genérico

"Empresas de tecnologia com 50-200 funcionários" — isso não é um ICP, é uma categoria demográfica. Um ICP real precisa responder:

- **Quem decide?** (cargo, senioridade, departamento)
- **O que dói?** (problemas específicos do dia a dia)
- **O que gatilha a busca?** (eventos que iniciam o processo de compra)
- **Como pesquisam?** (keywords, canais, formatos)
- **O que convence?** (provas, cases, ROI)

## Enriquecimento com IA na Intentia

O módulo de Públicos-Alvo permite:

### 1. Definição básica
Comece com indústria, tamanho, região e keywords iniciais.

### 2. Enriquecimento por IA
A IA (Gemini ou Claude) analisa seu projeto, nicho e concorrentes para gerar:

- **Perfil ideal detalhado** — não apenas demográfico, mas comportamental
- **Decisores-chave** — cargos específicos com poder de compra
- **Dores mapeadas** — problemas reais que seu produto resolve
- **Gatilhos de compra** — eventos que iniciam a busca por solução
- **Keywords otimizadas** — termos de busca reais, não genéricos

### 3. Dados de fontes públicas
A IA cruza com dados do SEBRAE, IBGE e outras fontes para validar:
- Tamanho real do mercado
- Concentração geográfica
- Sazonalidade do setor
- Tendências de crescimento

## Da teoria à campanha

Um ICP bem definido impacta diretamente:

| Elemento | ICP genérico | ICP enriquecido |
|----------|-------------|-----------------|
| Segmentação LinkedIn | Indústria + cargo | Indústria + cargo + skills + grupos + interesses |
| Keywords Google | "software gestão" | "software gestão estoque indústria alimentícia" |
| Copy do anúncio | "Gerencie melhor" | "Reduza 40% do tempo em inventário" |
| Landing page | Genérica | Específica por persona |

## Vinculação com projetos

Na Intentia, cada público-alvo pode ser vinculado a um ou mais projetos. Isso permite:
- Análise cruzada entre ICP e scores do site
- Recomendações de canal baseadas no perfil do público
- Plano tático personalizado por audiência`,
  },
  {
    slug: "plano-tatico-canal-midia-b2b",
    title: "Plano Tático por canal: como transformar estratégia em campanhas reais",
    excerpt:
      "Ter um diagnóstico é o primeiro passo. O segundo é transformar insights em ação. Descubra como estruturar campanhas para Google, Meta, LinkedIn e TikTok com templates validados.",
    author: "Intentia",
    date: "20 de Janeiro, 2026",
    readTime: "9 min",
    category: "Planejamento",
    categoryColor: "bg-cyan-500/10 text-cyan-600",
    icon: Crosshair,
    gradient: "from-cyan-600 to-blue-500",
    cta: { label: "Monte seu plano tático", href: "/auth" },
    content: `## A ponte entre estratégia e execução

O maior gap em marketing B2B não é falta de dados — é a distância entre "sabemos o que fazer" e "estamos fazendo". O Plano Tático da Intentia fecha esse gap.

## O que é um Plano Tático

Para cada canal recomendado (baseado nos scores), a Intentia gera uma estrutura de campanha com:

### Estrutura de campanha
- **Tipo de campanha** (Search, Display, Video, Lead Gen, etc.)
- **Objetivo** (awareness, consideração, conversão)
- **Etapa do funil** (topo, meio, fundo)

### Segmentação
- **Audiências** baseadas no ICP enriquecido
- **Keywords** (para Search) ou interesses (para Social)
- **Exclusões** recomendadas

### Criativos
- **Copy frameworks** validados por nicho B2B
- **Formatos recomendados** (texto, imagem, vídeo, carrossel)
- **Variações para teste A/B**

### Métricas e lances
- **KPIs primários e secundários**
- **Estratégia de lance** recomendada
- **Budget sugerido** baseado no mercado

## Templates por nicho

A Intentia oferece templates pré-preenchidos para nichos B2B comuns:
- SaaS / Software
- Consultoria
- Indústria / Manufatura
- Serviços profissionais
- Tecnologia / TI

Cada template já vem com copy, segmentação e métricas ajustadas para o nicho.

## Playbook de Execução

O Plano Tático se transforma em um **Playbook gamificado** — uma lista priorizada de ações com:
- Prioridade (alta, média, baixa)
- KPIs esperados
- Ações específicas por canal
- Checklist de implementação

## Do plano à campanha real

Com o módulo de Operações, você pode criar campanhas reais baseadas no plano tático e acompanhar o **comparativo tático vs real** — o que foi planejado vs o que está acontecendo de fato.`,
  },
  {
    slug: "seo-pagespeed-dados-estruturados-b2b",
    title: "SEO técnico para B2B: como dados estruturados e PageSpeed impactam seus ads",
    excerpt:
      "SEO não é só para orgânico. Descubra como dados estruturados, Core Web Vitals e velocidade do site impactam diretamente o custo e a performance dos seus anúncios pagos.",
    author: "Intentia",
    date: "15 de Janeiro, 2026",
    readTime: "7 min",
    category: "SEO & Performance",
    categoryColor: "bg-green-500/10 text-green-600",
    icon: Search,
    gradient: "from-green-600 to-emerald-500",
    cta: { label: "Analise seu SEO", href: "/auth" },
    content: `## SEO e mídia paga: a conexão ignorada

A maioria dos profissionais de marketing trata SEO e mídia paga como disciplinas separadas. Isso é um erro caro.

O Google usa a qualidade do seu site para calcular o **Quality Score** dos seus anúncios. Um Quality Score alto significa:
- **CPC mais baixo** (você paga menos por clique)
- **Posição melhor** (aparece acima dos concorrentes)
- **Mais impressões** (maior alcance com o mesmo budget)

## O que a Intentia analisa

### PageSpeed Insights
- **LCP** (Largest Contentful Paint) — velocidade de carregamento
- **FID** (First Input Delay) — interatividade
- **CLS** (Cumulative Layout Shift) — estabilidade visual
- **Score mobile e desktop** separados

### Dados Estruturados
- **JSON-LD** — schema.org markup
- **Open Graph** — como aparece no Facebook/LinkedIn
- **Twitter Card** — como aparece no Twitter/X
- **Microdata** — marcação inline

### Comparação com concorrentes
A Intentia permite comparar seus dados estruturados com os dos concorrentes em abas unificadas. Isso revela oportunidades de rich snippets que seus concorrentes já exploram.

## Impacto prático nos ads

| Problema SEO | Impacto em Ads |
|-------------|---------------|
| Site lento (LCP > 4s) | Quality Score baixo, CPC +30-50% |
| Sem dados estruturados | Sem rich snippets, CTR menor |
| Mobile não otimizado | Perda de 60%+ do tráfego mobile |
| Sem meta descriptions | Anúncios com preview ruim |
| Conteúdo thin | Bounce rate alto, conversão baixa |

## Recomendações práticas

1. **Otimize LCP** — comprima imagens, use lazy loading, minimize CSS/JS
2. **Adicione JSON-LD** — pelo menos Organization, Product/Service e FAQ
3. **Teste mobile** — 70%+ do tráfego B2B vem de mobile (sim, mesmo B2B)
4. **Monitore Core Web Vitals** — o Google atualiza os thresholds regularmente

A Intentia gera todas essas recomendações automaticamente após a análise.`,
  },
  {
    slug: "alertas-performance-campanhas-b2b",
    title: "11 regras de alerta que salvam seu budget: monitoramento inteligente de campanhas",
    excerpt:
      "Campanhas B2B precisam de monitoramento constante. Conheça as 11 regras automáticas da Intentia que detectam problemas antes que virem prejuízo.",
    author: "Intentia",
    date: "10 de Janeiro, 2026",
    readTime: "6 min",
    category: "Performance",
    categoryColor: "bg-amber-500/10 text-amber-600",
    icon: Shield,
    gradient: "from-amber-600 to-orange-500",
    cta: { label: "Ative alertas automáticos", href: "/auth" },
    content: `## Por que alertas automáticos

Gerenciar campanhas B2B manualmente é insustentável. Com múltiplos canais, dezenas de campanhas e centenas de métricas, problemas passam despercebidos até que o budget já foi desperdiçado.

## As 11 regras de alerta da Intentia

### Alertas Críticos (ação imediata)
1. **Budget estourado** — gasto ultrapassou o orçamento definido
2. **CPA acima do limite** — custo por aquisição excedeu o teto
3. **Conversão zerada** — campanha ativa sem conversões por 48h+
4. **CTR colapsou** — queda de CTR > 50% vs média

### Alertas de Atenção (investigar)
5. **Pacing acelerado** — budget sendo consumido mais rápido que o planejado
6. **Frequency alta** — mesma pessoa vendo o anúncio muitas vezes
7. **Quality Score caiu** — indicador de problemas na landing page
8. **CPL subindo** — tendência de aumento no custo por lead

### Alertas Informativos (acompanhar)
9. **Campanha finalizando** — menos de 3 dias para o fim
10. **Budget subutilizado** — menos de 60% do budget consumido com 80%+ do período
11. **Performance acima da média** — oportunidade de escalar

## Como funciona

Os alertas são calculados automaticamente com base nas métricas que você registra em cada campanha. Não precisa configurar nada — as regras já vêm ativas.

Cada alerta inclui:
- **Severidade** (crítico, atenção, informativo)
- **Campanha afetada**
- **Métrica que disparou o alerta**
- **Valor atual vs threshold**
- **Recomendação de ação**

## Análise por IA

Além dos alertas baseados em regras, a Intentia oferece **análise de performance por IA** que identifica padrões mais sutis:
- Correlações entre métricas
- Anomalias sazonais
- Oportunidades de otimização
- Previsões de tendência

## O resultado

Empresas que usam monitoramento automatizado reduzem desperdício de budget em 20-40% e identificam oportunidades de escala 3x mais rápido.`,
  },
  {
    slug: "budget-pacing-alocacao-midia-b2b",
    title: "Gestão de budget: como alocar e monitorar investimento em mídia B2B",
    excerpt:
      "Budget mal distribuído é o erro mais caro em mídia paga. Aprenda a alocar por canal, monitorar pacing em tempo real e evitar estouros com a Intentia.",
    author: "Intentia",
    date: "5 de Janeiro, 2026",
    readTime: "8 min",
    category: "Budget",
    categoryColor: "bg-teal-500/10 text-teal-600",
    icon: DollarSign,
    gradient: "from-teal-600 to-cyan-500",
    cta: { label: "Gerencie seu budget", href: "/auth" },
    content: `## O custo do budget mal alocado

Em B2B, budgets de mídia são tipicamente menores e mais escrutinados que em B2C. Cada real precisa ser justificado. E o erro mais comum é alocar budget de forma uniforme entre canais, ignorando os scores de prontidão.

## Framework de alocação

### Baseado em scores
A Intentia calcula scores por canal. Use-os como base:

| Canal | Score | Alocação sugerida |
|-------|-------|-------------------|
| Google Ads | 85 | 40% |
| LinkedIn Ads | 72 | 30% |
| Meta Ads | 55 | 20% |
| TikTok Ads | 30 | 10% (teste) |

### Regra 70-20-10
- **70%** nos canais com score > 70 (comprovados)
- **20%** nos canais com score 50-70 (potencial)
- **10%** em testes (novos canais ou formatos)

## Pacing: o controle em tempo real

Pacing é a relação entre quanto você gastou e quanto deveria ter gasto até agora.

- **Pacing 100%** = no ritmo perfeito
- **Pacing > 110%** = gastando rápido demais (alerta)
- **Pacing < 60%** = subinvestindo (oportunidade perdida)

A Intentia calcula o pacing automaticamente para cada campanha e projeto, com projeções de gasto até o final do período.

## Alertas de budget

O sistema gera alertas automáticos para:
- **Estouro iminente** — projeção indica que vai ultrapassar o budget
- **Subinvestimento** — budget disponível não está sendo utilizado
- **Pacing irregular** — picos e vales que indicam problemas de configuração

## Visão consolidada

No Dashboard da Intentia, você vê:
- Budget total alocado vs gasto por projeto
- Pacing por canal com barras visuais
- Projeção de gasto até o final do mês
- Comparativo mês a mês

## Dica prática

Revise a alocação de budget mensalmente. Os scores mudam conforme você melhora seu site e conteúdo. Um canal que não era recomendado há 2 meses pode ter se tornado viável após otimizações.`,
  },
];

export const blogCategories = [
  "Todos",
  ...Array.from(new Set(blogPosts.map((p) => p.category))),
];
