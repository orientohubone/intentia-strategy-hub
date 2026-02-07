# Intentia Strategy Hub - Contexto Completo do Projeto

## Visão Geral

**Nome do Projeto:** Intentia Strategy Hub  
**Tipo:** Aplicação Web React + TypeScript  
**Framework:** Vite + React + TypeScript  
**UI Framework:** shadcn/ui + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Auth + Edge Functions)  
**Propósito:** Plataforma de análise estratégica para marketing B2B  
**Versão:** 2.5.0

## Status Atual: ✅ v2.5.0 (Dados Estruturados + Progress Tracker)

### Funcionalidades Implementadas

#### 1. Autenticação e Navegação ✅
- **Login/Signup** redesenhado com split layout (form + gradient panel)
- **Header dropdown** com navegação SPA e hover sensitivo
- **Botão "Voltar"** consistente com backdrop blur, scroll-aware (esconde ao scrollar para baixo)
- **Dashboard sidebar** com navegação interna, active state e dados reais do tenant
- **ProtectedRoute** wrapper para rotas autenticadas
- **DashboardLayout** wrapper compartilhado para todas as páginas protegidas

#### 2. Dashboard Principal ✅
- **Dados reais** do Supabase (sem mocks)
- **Cards de projetos** com scores e status
- **Insights estratégicos** por projeto (link "Ver todos" → /insights)
- **Scores por canal** (Google, Meta, LinkedIn, TikTok)
- **Estatísticas dinâmicas** (audiences, benchmarks, insights semanais, projetos mensais)
- **Nome do usuário** do Supabase user_metadata
- **Welcome Section** com card gradient-primary + ScoreRing

#### 3. CRUD Completo de Projetos + Análise por IA ✅
- **Criar/Editar/Excluir** projetos
- **Validações** de formulário (nome, nicho, URL)
- **URLs de concorrentes** (competitor_urls array)
- **Análise heurística de URL** automática (Edge Function fetch HTML → scores + insights)
- **Análise por IA sob demanda** — seletor de modelo acoplado ao botão
- **Modelos suportados:** Gemini (2.0 Flash, 3 Flash, 3 Pro) e Claude (Sonnet 4, 3.7, Haiku 3.5, 3, Opus 3)
- **Animação lab-bubble** durante processamento da IA
- **Resultados IA:** resumo executivo, prontidão para investimento (score 0-100), SWOT, recomendações por canal, recomendações estratégicas, posição competitiva
- **Exportação de análise IA:** JSON, Markdown, HTML, PDF
- **Channel scores** por projeto (Google, Meta, LinkedIn, TikTok)
- **Confirmação** ao excluir (AlertDialog)
- **Toast feedback** para todas as operações
- **Notificação** após conclusão da análise IA (com guard anti-duplicação)

#### 4. Insights Estratégicos ✅
- **Agrupados por projeto** em cards visuais com ícones por tipo
- **Dialog de detalhes** com toggle fullscreen (Maximize2/Minimize2)
- **Filtros por tipo** (alerta/oportunidade/melhoria)
- **Busca** por título/descrição
- **Stats cards** com contadores por tipo
- **Badges** coloridos para tipo e projeto
- **Data de criação** em cada card

#### 5. Público-Alvo ✅
- **CRUD completo** de públicos-alvo
- **Vinculação com projetos** (opcional)
- **Cards visuais** com badges (indústria, porte, local)
- **Keywords** como tags
- **Busca** por nome/descrição
- **Formulário** com validações

#### 6. Benchmark Competitivo + Enriquecimento por IA ✅
- **Geração automática** a partir de competitor_urls do projeto
- **Análise SWOT** (Strengths, Weaknesses, Opportunities, Threats)
- **Scores detalhados** (proposta, clareza, jornada, geral) e gap analysis
- **Enriquecimento por IA** — seletor de modelo + botão com animação lab-bubble
- **Resultados IA do benchmark:** resumo executivo, nível de ameaça (0-100), vantagens/desvantagens competitivas, gaps estratégicos, posicionamento de mercado, oportunidades de diferenciação, avaliação de ameaças, plano de ação
- **Exportação benchmark IA:** JSON, Markdown, HTML, PDF
- **BenchmarkDetailDialog** com toggle fullscreen + seção IA integrada
- **Cards visuais** com tags coloridas e indicadores
- **Limpeza automática** de benchmarks antigos na reanálise
- **Filtros** por projeto e busca avançada

#### 7. Configurações ✅
- **Perfil do usuário** com avatar upload, nome, empresa, bio
- **Integrações de IA** — API keys por usuário:
  - Google Gemini (3 Flash Preview, 2.5 Flash, 2.5 Pro Preview, 2.0 Flash)
  - Anthropic Claude (Sonnet 4, Sonnet 3.7, Haiku 3.5, Haiku 3, Opus 3)
  - Validação de key contra API real
  - Seleção de modelo preferido
  - Badge de status (Ativa/Não configurada)
  - Máscara de key com toggle de visibilidade
  - Proteção contra autofill de senha (autoComplete="new-password", data-1p-ignore, data-lpignore)
- **Notificações** (email, relatórios semanais)
- **Preferências** (idioma, fuso horário, auto-save)
- **Gerenciamento de conta** (senha, exportação, logout, exclusão)
- **Card de Plano detalhado** com features do plano atual, "Disponível no Professional" (Starter), barra de uso, CTA de upgrade contextual

#### 19. Alertas Estratégicos ✅
- **Página dedicada** `/alertas` consolidando todos os alertas do sistema
- **4 categorias:** Investimento Prematuro (score < 50), Canal Não Recomendado, Riscos por Canal, Alertas da Análise Heurística
- **Filtros** por projeto e tipo de alerta
- **Cards expandíveis** com detalhes, riscos e links para Projetos/Plano Tático
- **Box informativo** "Como interpretar os alertas"
- **Empty state** quando não há alertas
- **Sidebar** com ícone ShieldAlert

#### 20. Cases com Screenshots do Sistema ✅
- **Imagens reais** do sistema substituem ilustrações genéricas nos 6 cases
- **Estilo showcase** com border-beam animado (mesmo da Landing)
- **Hover zoom** (scale 105%) com overlay "Clique para ampliar"
- **Lightbox fullscreen** ao clicar — fecha com ESC, clique ou botão X
- **Mapeamento:** Diagnostico-url.png, benchmark.png, analise-ia.png, score-canal.png, alertas-estrategicos.png, insights-acionaveis.png

#### 21. Planos e Checkout ✅
- **Planos detalhados** refletindo todas as funcionalidades implementadas:
  - **Starter (Grátis):** 3 projetos, diagnóstico heurístico, score por canal, insights, alertas, 1 público-alvo
  - **Professional (R$97/mês):** Projetos ilimitados, IA (Gemini+Claude), benchmark SWOT, plano tático, exportação, notificações
  - **Enterprise (Personalizado):** Tudo do Pro + API access, multi-usuários, SLA 24/7, consultoria, white-label
- **Checkout público** (`/assinar`) — self-service para visitantes do site:
  - Dados da conta (nome, email, senha, empresa)
  - Pagamento (cartão com formatação, PIX, boleto)
  - Simula pagamento → cria conta → tenant_settings com plan: professional
  - Tela de processamento + tela de sucesso
  - Tratamento de email já registrado
- **Checkout interno** (`/checkout`) — upgrade para usuários autenticados (Starter→Professional):
  - Pagamento (cartão/PIX/boleto)
  - Atualiza tenant_settings.plan
  - Tela de sucesso com features desbloqueadas
- **FAQ atualizado** com perguntas sobre IA e Plano Tático

#### 22. URLs Traduzidas para Português ✅
- `/contact` → `/contato`, `/pricing` → `/precos`, `/about` → `/sobre`
- `/privacy-policy` → `/politica-de-privacidade`, `/terms-of-service` → `/termos-de-servico`
- `/cookie-policy` → `/politica-de-cookies`
- `#features` → `#funcionalidades`, `#how-it-works` → `#como-funciona`, `#pricing` → `#precos`
- Atualizados em: Header, HeaderDebug, Footer, LandingNav, Landing, About, App.tsx

#### 23. ProtectedRoute com Redirect ✅
- **ProtectedRoute** preserva URL destino como `?redirect=` ao redirecionar para `/auth`
- **Auth.tsx** lê `?redirect=` e redireciona após login (fallback: `/dashboard`)

#### 8. Centro de Ajuda ✅
- **Base de conhecimento** categorizada
- **Busca inteligente** de artigos e tutoriais
- **FAQ** com perguntas frequentes
- **Canais de suporte** (email, chat, base)

#### 9. Dark Mode ✅
- **ThemeProvider** (next-themes) integrado no App.tsx
- **ThemeToggle** com ícones Sun/Moon no DashboardHeader
- **ForceLightMode** wrapper para páginas públicas
- **Isolamento completo:** dark mode no sistema não afeta site público
- **Notificações** com cores adaptáveis (opacity-based)

#### 10. Análise Heurística de URLs ✅
- **Edge Function** `analyze-url` (fetch HTML → regex/contagem)
- **Scores automáticos:** proposta de valor, clareza, jornada, SEO, conversão, conteúdo
- **Channel scores:** Google, Meta, LinkedIn, TikTok com objetivos e riscos
- **Insights gerados:** warnings, opportunities, improvements
- **Benchmarks automáticos:** SWOT + gap analysis para concorrentes
- **Extração de dados estruturados:** JSON-LD, Open Graph, Twitter Card, Microdata
- **HTML Snapshot:** versão limpa do HTML (sem scripts/styles/SVG) para referência
- **Progress Tracker:** indicador visual step-by-step durante análise (heurística + concorrentes)

#### 24. Dados Estruturados & Snapshot ✅
- **Visualizador unificado** com abas: site principal + cada concorrente
- **Extração automática** de JSON-LD, Open Graph, Twitter Card e Microdata
- **HTML Snapshot** limpo (scripts/styles removidos) com copy e preview
- **Abas por site:** ícone Building2 (principal) + Swords (concorrentes)
- **Fallback inteligente:** sintetiza OG tags do meta quando Edge Function não retorna dados
- **Dados de concorrentes** salvos na tabela `benchmarks` (structured_data, html_snapshot)
- **Badges resumo:** contagem de JSON-LD, OG tags, Twitter, Microdata e tamanho HTML
- **Seções expansíveis:** cada tipo de dado em accordion com copy individual

#### 25. Progress Tracker de Análise ✅
- **AnalysisProgressTracker** — componente visual step-by-step
- **Etapas:** Conectando → Baixando HTML → Analisando proposta → Scores → Insights → Concorrentes
- **Progresso de concorrentes:** barra individual por concorrente
- **Animações:** check marks, spinner, barra de progresso
- **Integrado** em handleProjectSubmit e handleReanalyze

#### 11. Análise por IA (Projetos) ✅
- **aiAnalyzer.ts** — motor de análise IA com `runAiAnalysis()`
- **Chamada direta** para Gemini API e via Edge Function proxy (`ai-analyze`) para Claude
- **Seletor de modelo** acoplado ao botão de análise (formato `provider::model`)
- **Botão compacto** (size="icon") com ícone Sparkles e animação lab-bubble
- **Resultados salvos** em `projects.ai_analysis` (jsonb) e `projects.ai_completed_at`
- **Guard anti-duplicação** de notificações via `useRef`

#### 12. Enriquecimento de Benchmark por IA ✅
- **runBenchmarkAiAnalysis()** em aiAnalyzer.ts com prompt específico para análise competitiva
- **BenchmarkAiResult** — tipo com: executiveSummary, competitiveAdvantages/Disadvantages, strategicGaps, marketPositioning, differentiationOpportunities, threatAssessment, actionPlan, overallVerdict
- **UI integrada** no BenchmarkDetailDialog com seletor de modelo + botão + animação
- **Resultados salvos** em `benchmarks.ai_analysis` (jsonb)

#### 13. Exportação de Análises ✅
- **exportAnalysis.ts** — funções de exportação para projetos e benchmarks
- **Formatos:** JSON, Markdown, HTML (estilizado), PDF (via print window)
- **Projetos:** `exportAsJson`, `exportAsMarkdown`, `exportAsHtml`, `exportAsPdf`
- **Benchmarks:** `exportBenchmarkAsJson`, `exportBenchmarkAsMarkdown`, `exportBenchmarkAsHtml`, `exportBenchmarkAsPdf`

#### 14. Relatórios PDF Gerais ✅
- **reportGenerator.ts** — gerador de relatórios consolidados e por seção
- **Relatório consolidado do projeto** (heurística + IA + benchmarks + insights + channels) via `fetchProjectReport` + `generateConsolidatedReport`
- **Botão "Relatório PDF"** em cada projeto completo (Projects.tsx)
- **Exportar PDF por seção:** Dashboard (`exportDashboardPdf`), Insights (`exportInsightsPdf`), Benchmarks (`exportBenchmarksPdf`)

#### 15. Exportação CSV ✅
- **exportCsv.ts** — funções de exportação CSV com BOM UTF-8 e separador `;`
- **Projetos:** `exportProjectsCsv` (Dashboard)
- **Insights:** `exportInsightsCsv` (Insights)
- **Benchmarks:** `exportBenchmarksCsv` (Benchmark)
- **Públicos-alvo:** `exportAudiencesCsv` (Audiences)
- **Channel Scores:** `exportChannelScoresCsv`

#### 16. Testes Automatizados ✅
- **Vitest + jsdom** configurado com setup.ts
- **6 testes exportCsv** — BOM, headers, escaping, labels, arrays, channel names
- **5 testes exportAnalysis** — JSON, Markdown, heuristic-only, benchmark JSON/MD
- **12 testes passando** (100%)

#### 17. Páginas Institucionais ✅
- **Preços** com planos detalhados (Starter/Professional/Enterprise) refletindo features reais
- **Sobre, Cases (com screenshots + lightbox), Blog, Contato**
- **Políticas:** Privacidade, Termos, Cookies
- **Página 404** personalizada
- **Assinar** (`/assinar`) — checkout público self-service

#### 18. Mobile-First Responsiveness ✅
- **DashboardLayout** wrapper compartilhado (sidebar + header + main com padding responsivo)
- **DashboardSidebar** responsiva: overlay mobile com backdrop, translate-x animation, auto-close ao navegar
- **DashboardHeader** responsiva: hamburger mobile, search hidden, botões compactos
- **Todas as 8 páginas protegidas** migradas para DashboardLayout
- **Dashboard grids** mobile-first: stats 2col, headings responsive, channel stack
- **Audiences** mobile-first: header empilha, cards padding/gap responsive, badges flex-wrap
- **Benchmark** mobile-first: header empilha, stats cards responsive, export buttons icon-only
- **Insights** mobile-first: badges responsive, cards sm:grid-cols-2, touch feedback
- **Settings** mobile-first: AI provider cards responsive, plan card empilha
- **Help** mobile-first: categories responsive, FAQ responsive, contact cards responsive
- **Auth** padding mobile ajustado
- **Landing** Header já responsiva, ShowcaseSlider com touch-action:none para drag mobile
- **NotificationsDropdown** fixed full-width no mobile, absolute no desktop
- **BackToHomeButton** scroll-aware: esconde ao scrollar para baixo, reaparece ao subir
- **Breakpoints Tailwind:** base = mobile, sm:, md:, lg: para telas maiores

### Stack Tecnológico Completo

**Frontend:**
- React 18.3.1 com TypeScript
- Vite 5.4.19 (bundler e dev server)
- React Router DOM v6 (SPA navigation)
- TanStack Query (cache de dados)
- React Hook Form + Zod (formulários)
- shadcn/ui + Radix UI (componentes acessíveis)
- Tailwind CSS 3.4.17 (estilização)
- Lucide React (ícones)
- Sonner (toast notifications)
- next-themes (dark mode)

**Backend/Database:**
- Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- Row Level Security (RLS) por user_id em todas as tabelas
- Triggers para updated_at automático
- Views para dashboard queries
- Edge Functions (analyze-url, ai-analyze)
- Storage bucket (avatars)

**Desenvolvimento:**
- ESLint + TypeScript ESLint
- Vitest para testes
- Git version control

### Estrutura de Arquivos

```
intentia-strategy-hub/
├── public/                 # Assets estáticos
├── src/
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes shadcn/ui
│   │   ├── DashboardLayout.tsx  # Layout wrapper (sidebar + header + main)
│   │   ├── DashboardSidebar.tsx # Sidebar responsiva (overlay mobile)
│   │   ├── DashboardHeader.tsx  # Header responsiva (hamburger mobile)
│   │   ├── BenchmarkCard.tsx
│   │   ├── BenchmarkDetailDialog.tsx
│   │   ├── InsightCard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ForceLightMode.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── AvatarUpload.tsx
│   │   ├── BackToHomeButton.tsx # Botão voltar scroll-aware
│   │   ├── NotificationsDropdown.tsx # Dropdown responsivo
│   │   ├── AnalysisProgressTracker.tsx # Progress tracker step-by-step
│   │   ├── StructuredDataViewer.tsx # Viewer unificado com abas (principal + concorrentes)
│   │   └── *.tsx          # Outros componentes
│   ├── pages/             # Páginas principais
│   │   ├── Index.tsx      # Home/Landing
│   │   ├── Dashboard.tsx  # Dashboard principal
│   │   ├── Projects.tsx   # CRUD de projetos + análise URL
│   │   ├── Insights.tsx   # Insights agrupados por projeto
│   │   ├── Audiences.tsx  # CRUD de públicos-alvo
│   │   ├── Benchmark.tsx  # Benchmark competitivo
│   │   ├── Settings.tsx   # Configurações + API keys de IA
│   │   ├── Auth.tsx       # Login/Signup (split layout)
│   │   ├── Help.tsx       # Centro de ajuda
│   │   ├── TacticalPlan.tsx # Plano tático por canal
│   │   ├── Alerts.tsx     # Alertas estratégicos consolidados
│   │   ├── Checkout.tsx   # Checkout interno (upgrade autenticado)
│   │   ├── Subscribe.tsx  # Checkout público (assinatura self-service)
│   │   └── NotFound.tsx   # Página 404
│   ├── integrations/      # Integrações externas
│   │   └── supabase/      # Cliente Supabase
│   ├── hooks/             # Hooks personalizados
│   │   ├── useAuth.ts     # Autenticação
│   │   ├── useTenantData.ts # Dados do tenant
│   │   └── useNotifications.ts # Notificações
│   ├── lib/               # Utilitários
│   │   ├── utils.ts
│   │   ├── urlAnalyzer.ts # Análise heurística + salvar resultados
│   │   ├── aiAnalyzer.ts  # Análise por IA (projetos + benchmarks)
│   │   ├── exportAnalysis.ts # Exportação JSON/MD/HTML/PDF
│   │   ├── reportGenerator.ts # Relatórios PDF consolidados e por seção
│   │   └── exportCsv.ts   # Exportação CSV (projetos, insights, benchmarks, audiences)
│   ├── test/              # Testes (12 testes: exportCsv + exportAnalysis)
│   ├── App.tsx            # App principal com rotas
│   └── main.tsx           # Entry point
├── supabase/              # Config Supabase
│   ├── schema.sql         # Schema completo (todas as tabelas)
│   ├── audiences_schema.sql
│   ├── add_project_to_audiences.sql
│   ├── benchmark_ai_analysis.sql  # Migration: ai_analysis em benchmarks
│   ├── add_html_snapshot_structured_data.sql  # Migration: html_snapshot + structured_data em projects
│   ├── add_benchmarks_structured_data.sql     # Migration: structured_data + html_snapshot em benchmarks
│   └── functions/
│       ├── analyze-url/   # Edge Function de análise heurística
│       │   └── index.ts
│       └── ai-analyze/    # Edge Function proxy para Claude API
│           └── index.ts
├── documentacao/          # Documentação do projeto
│   ├── AGENTS.md          # Este arquivo
│   └── STATUS_IMPLEMENTACAO.md
├── package.json           # Dependências
├── vite.config.ts         # Config Vite
├── tailwind.config.ts     # Config Tailwind
└── tsconfig.json          # Config TypeScript
```

### Schema SQL Completo

**Tabelas:**
- `tenant_settings` — Configurações do tenant (empresa, plano, limites)
- `projects` — Projetos com URL, nicho, competitor_urls, score, status, html_snapshot (text), structured_data (jsonb)
- `project_channel_scores` — Scores por canal (google/meta/linkedin/tiktok)
- `insights` — Insights estratégicos (warning/opportunity/improvement)
- `audiences` — Públicos-alvo com keywords e vinculação a projetos
- `benchmarks` — Análises competitivas com SWOT, scores, ai_analysis (jsonb), structured_data (jsonb), html_snapshot (text)
- `notifications` — Sistema de notificações
- `user_api_keys` — API keys de IA por usuário (google_gemini/anthropic_claude)

**Storage Buckets:**
- `avatars` — Fotos de perfil dos usuários

**Features:**
- Row Level Security (RLS) por user_id em todas as tabelas
- Triggers para updated_at automático
- Índices para performance
- Views para dashboard (v_project_summary, v_dashboard_stats)
- Constraint unique(user_id, provider) em user_api_keys
- Relacionamentos com foreign keys e cascade delete

### Componentes Principais

#### Dashboard Components
- **DashboardLayout:** Wrapper compartilhado que gerencia sidebar mobile state
- **DashboardHeader:** Header responsiva com hamburger mobile, perfil, notificações e ThemeToggle
- **DashboardSidebar:** Sidebar responsiva (fixed overlay mobile, static desktop, auto-close ao navegar)
- **ProjectCard:** Card de projeto com score e status
- **ChannelCard:** Card de scores por canal (Google, Meta, LinkedIn, TikTok)
- **InsightCard:** Card de insights com ícones por tipo (warning/opportunity/improvement)
- **StatsCard:** Card de estatísticas gerais
- **ScoreRing:** Visualização circular de scores

#### Benchmark Components
- **BenchmarkCard:** Card de benchmark com SWOT, scores e tags coloridas
- **BenchmarkDetailDialog:** Dialog de detalhes com toggle fullscreen

#### Landing Components
- **LandingNav:** Navegação da landing page com dropdown hover
- **ShowcaseSlider:** Comparador light/dark com touch-action:none para mobile
- **BackToHomeButton:** Botão voltar scroll-aware (esconde ao scrollar, reaparece ao subir)

#### Theme Components
- **ThemeToggle:** Botão Sun/Moon para alternar dark/light
- **ForceLightMode:** Wrapper que força light mode em páginas públicas

#### Auth Components
- **Auth.tsx:** Tela de login/signup com split layout (form + gradient panel usando design system)

#### Notification Components
- **NotificationsDropdown:** Dropdown responsivo (fixed full-width mobile, absolute desktop)
- **AvatarUpload:** Upload de foto de perfil com preview

#### UI Components (shadcn/ui)
- Sistema completo de componentes acessíveis (Dialog, AlertDialog, Badge, Select, etc.)
- Design system consistente com variáveis CSS (--primary, --gradient-primary)
- Acessibilidade WCAG 2.1 AA

### Estado e Dados

#### Estado Global
- **TanStack Query:** Cache e gerenciamento de dados assíncronos
- **React Hook Form:** Estado de formulários com validação Zod
- **Context API:** Tema e configurações globais

#### Dados Conectados (Supabase)
- **Autenticação:** Supabase Auth com user_metadata
- **Projetos:** CRUD completo com análise de URL e competitor_urls
- **Insights:** Gerados automaticamente pela análise, agrupados por projeto
- **Públicos-alvo:** CRUD com vinculação de projetos
- **Benchmarks:** Análise SWOT, scores, gap analysis
- **Channel Scores:** Scores por canal por projeto
- **Notificações:** Real-time via Supabase subscriptions
- **API Keys:** Chaves de IA por usuário (Gemini + Claude)

### Rotas da Aplicação

```typescript
// Páginas públicas
/                    # Landing page (light mode forçado)
/auth                # Login/Signup (split layout) — suporta ?redirect=
/assinar             # Checkout público self-service (Professional)
/precos              # Página de preços
/sobre               # Sobre
/cases               # Cases de uso (com screenshots + lightbox)
/blog                # Blog
/contato             # Contato
/politica-de-privacidade  # Política de privacidade
/termos-de-servico        # Termos de serviço
/politica-de-cookies      # Política de cookies
/brand               # Guia de marca

// Páginas protegidas (requer autenticação)
/dashboard           # Dashboard principal
/projects            # CRUD de projetos + análise
/insights            # Insights agrupados por projeto
/audiences           # CRUD de públicos-alvo
/benchmark           # Benchmark competitivo
/settings            # Configurações + API keys + plano
/help                # Centro de ajuda
/tactical            # Plano tático por canal
/alertas             # Alertas estratégicos consolidados
/checkout            # Checkout interno (upgrade autenticado)
/*                   # Página 404
```

### Fluxos do Usuário

#### Fluxo de Assinatura (visitante do site)
1. **Landing/Preços** → "Assinar Agora" → `/assinar`
2. **Checkout público:** preenche dados da conta + pagamento
3. **Pagamento confirmado** → conta criada com plano Professional
4. **Confirma email** → faz login → acesso completo

#### Fluxo de Upgrade (usuário autenticado Starter)
1. **Settings** → Card de plano → "Fazer Upgrade" → `/checkout?plan=professional`
2. **Checkout interno:** escolhe pagamento → confirma
3. **Plano atualizado** → features desbloqueadas

#### Fluxo de Análise
1. **Criação de Projeto:** Nome, nicho, URL + URLs de concorrentes
2. **Análise Heurística:** Automática ao analisar URL (fetch HTML → scores + insights + dados estruturados + HTML snapshot)
3. **Progress Tracker:** Indicador visual step-by-step durante toda a análise
4. **Dados Estruturados:** Visualizador unificado com abas (principal + concorrentes)
5. **Configurar API Keys:** Settings → Integrações de IA (Gemini/Claude)
6. **Análise por IA:** Sob demanda — selecionar modelo → clicar ✨ → resultados detalhados
7. **Exportar Análise:** JSON, MD, HTML ou PDF
8. **Benchmark:** Comparação com concorrentes via análise SWOT + dados estruturados
9. **Enriquecer Benchmark com IA:** Selecionar modelo → análise competitiva aprofundada
10. **Alertas:** Visualização consolidada de riscos e investimentos prematuros
11. **Insights:** Visualização agrupada por projeto com dialog + fullscreen

### Fluxo de Análise (Arquitetura)

```
1. Análise Heurística (automática)
   URL → Edge Function (fetch HTML) → regex/contagem → scores + insights + dados estruturados + HTML snapshot → salva no DB
   
2. Notificação (após heurística)
   Análise concluída → notifica usuário → libera análise por IA

3. Análise por IA de Projeto (sob demanda) ✅
   Seletor modelo → runAiAnalysis() → Gemini (direto) ou Claude (Edge Function proxy)
   → parse JSON → salva em projects.ai_analysis → notificação

4. Enriquecimento de Benchmark por IA (sob demanda) ✅
   Seletor modelo → runBenchmarkAiAnalysis() → prompt competitivo
   → parse JSON → salva em benchmarks.ai_analysis → notificação

5. Exportação ✅
   Resultados IA → exportAnalysis.ts → JSON / Markdown / HTML / PDF
```

### Integrações de IA

**API Keys por Usuário** — Cada usuário configura suas próprias chaves em Settings → Integrações de IA.

**Google Gemini:** Gemini 3 Flash Preview, 2.5 Flash, 2.5 Pro Preview, 2.0 Flash  
**Anthropic Claude:** Claude Sonnet 4, Sonnet 3.7, Haiku 3.5, Haiku 3, Opus 3

**Funcionalidades:**
- Validação de API key contra a API real
- Seleção de modelo preferido
- Badge de status (Ativa/Não configurada)
- Máscara de key com toggle de visibilidade
- Última validação registrada

### Variáveis de Ambiente

```env
VITE_SUPABASE_PROJECT_ID="ccmubburnrrxmkhydxoz"
VITE_SUPABASE_ANON_KEY="[CHAVE_PÚBLICA]"
VITE_SUPABASE_URL="https://ccmubburnrrxmkhydxoz.supabase.co"
```

### Scripts Disponíveis

```json
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build modo desenvolvimento
npm run lint         # Linting do código
npm run preview      # Preview do build
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
```

## Status de Implementação

### ✅ Completo e Funcional
- [x] Autenticação completa (login/signup redesenhado)
- [x] Dashboard com dados reais e Welcome Section
- [x] CRUD projetos com análise heurística de URL
- [x] Análise por IA sob demanda com seletor de modelo (Gemini + Claude)
- [x] Resultados IA de projetos (resumo, prontidão, SWOT, canais, recomendações)
- [x] Enriquecimento de benchmark por IA (análise competitiva aprofundada)
- [x] Exportação de análises IA: JSON, Markdown, HTML, PDF
- [x] Exportação de benchmark IA: JSON, Markdown, HTML, PDF
- [x] Relatórios PDF consolidados por projeto e por seção
- [x] Exportação CSV de projetos, insights, benchmarks, audiences e channels
- [x] 12 testes automatizados passando (exportCsv + exportAnalysis)
- [x] Insights agrupados por projeto com dialog + fullscreen
- [x] Público-alvo (CRUD + vinculação)
- [x] Benchmark competitivo com SWOT, dialog fullscreen e tags coloridas
- [x] Configurações com integrações de IA (Gemini + Claude)
- [x] Centro de Ajuda
- [x] Upload de foto de perfil
- [x] Sistema de notificações real-time
- [x] Dark mode (apenas sistema, isolado do site público)
- [x] Página de preços com CTAs corretos
- [x] Animações hero sem flicker
- [x] Navegação SPA completa
- [x] UI consistente e acessível (design system)
- [x] Schema SQL completo + RLS + user_api_keys
- [x] Edge Functions: analyze-url, ai-analyze
- [x] Animação lab-bubble para feedback visual durante IA
- [x] Guard anti-duplicação de notificações (useRef)

### 📋 Próximos Passos
- [ ] Integração com APIs de marketing
- [ ] Multi-tenancy avançado
- [ ] Advanced analytics e dashboards customizáveis

## Considerações Técnicas

- **Performance:** Vite oferece fast refresh e builds otimizados
- **Escalabilidade:** Arquitetura modular com Supabase + API keys por usuário (custo zero para plataforma)
- **Manutenibilidade:** TypeScript e componentes reutilizáveis
- **Acessibilidade:** Componentes Radix UI com suporte ARIA (WCAG 2.1 AA)
- **Segurança:** RLS policies isolando dados por usuário, API keys armazenadas por tenant
- **Design System:** Variáveis CSS consistentes (--primary: hsl(16 100% 55%), --gradient-primary, etc.)

## Deploy

O projeto está configurado para deploy via:
- **Vercel** (configuração vercel.json presente)
- **Netlify** (build estático)
- **Qualquer plataforma** compatível com React/Vite

## Resumo

O **Intentia Strategy Hub** está na **versão 2.5.0** — dados estruturados + progress tracker:

1. **Autenticação** redesenhada com split layout, redirect após login
2. **Dashboard** com dados reais, Welcome Section e ScoreRing
3. **Análise heurística de URLs** automática via Edge Function
4. **Análise por IA de projetos** sob demanda com seletor de modelo (Gemini/Claude)
5. **Enriquecimento de benchmark por IA** com análise competitiva aprofundada
6. **Exportação completa** de análises IA em JSON, Markdown, HTML e PDF
7. **Relatórios PDF consolidados** por projeto e por seção
8. **Exportação CSV** de projetos, insights, benchmarks, audiences e channels
9. **12 testes automatizados** passando (exportCsv + exportAnalysis)
10. **Insights agrupados por projeto** com cards visuais, dialog e fullscreen
11. **Benchmark competitivo** com SWOT, gap analysis, dialog fullscreen e IA
12. **Integrações de IA** — API keys por usuário (Gemini + Claude) com validação
13. **CRUD completo** para projetos, públicos-alvo e benchmarks
14. **Dark mode** isolado (sistema vs site público)
15. **Notificações** real-time com cores adaptáveis
16. **Mobile-first** — todas as páginas e componentes responsivos
17. **Plano Tático** por canal com templates validados por nicho B2B + playbook gamificado
18. **Alertas Estratégicos** — página dedicada com 4 categorias, filtros e cards expandíveis
19. **Cases com screenshots** do sistema + hover zoom + lightbox fullscreen
20. **Planos detalhados** refletindo todas as features (Starter/Professional/Enterprise)
21. **Checkout público** (`/assinar`) — self-service para visitantes (pagamento → criação de conta)
22. **Checkout interno** (`/checkout`) — upgrade para usuários autenticados
23. **URLs traduzidas** para português (rotas públicas e âncoras)
24. **ProtectedRoute com redirect** — preserva destino após login
25. **Dados Estruturados** — extração e visualização unificada (JSON-LD, OG, Twitter Card, Microdata) com abas por site
26. **HTML Snapshot** — versão limpa do HTML para referência, com copy e preview
27. **Progress Tracker** — indicador visual step-by-step durante análise heurística e de concorrentes
28. **Dados de concorrentes** — structured_data e html_snapshot salvos nos benchmarks

Próximos passos: **Etapa Operacional** (execução de campanhas, integração com APIs de marketing, multi-tenancy avançado).
