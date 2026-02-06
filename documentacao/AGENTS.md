# Intentia Strategy Hub - Contexto Completo do Projeto

## Visão Geral

**Nome do Projeto:** Intentia Strategy Hub  
**Tipo:** Aplicação Web React + TypeScript  
**Framework:** Vite + React + TypeScript  
**UI Framework:** shadcn/ui + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Auth + Edge Functions)  
**Propósito:** Plataforma de análise estratégica para marketing B2B  
**Versão:** 1.6.0

## Status Atual: ✅ v1.6.0 (Análise Heurística + Integrações de IA)

### Funcionalidades Implementadas

#### 1. Autenticação e Navegação ✅
- **Login/Signup** redesenhado com split layout (form + gradient panel)
- **Header dropdown** com navegação SPA e hover sensitivo
- **Botão "Voltar"** consistente com backdrop blur
- **Dashboard sidebar** com navegação interna, active state e dados reais do tenant
- **ProtectedRoute** wrapper para rotas autenticadas

#### 2. Dashboard Principal ✅
- **Dados reais** do Supabase (sem mocks)
- **Cards de projetos** com scores e status
- **Insights estratégicos** por projeto (link "Ver todos" → /insights)
- **Scores por canal** (Google, Meta, LinkedIn, TikTok)
- **Estatísticas dinâmicas** (audiences, benchmarks, insights semanais, projetos mensais)
- **Nome do usuário** do Supabase user_metadata
- **Welcome Section** com card gradient-primary + ScoreRing

#### 3. CRUD Completo de Projetos ✅
- **Criar/Editar/Excluir** projetos
- **Validações** de formulário (nome, nicho, URL)
- **URLs de concorrentes** (competitor_urls array)
- **Análise heurística de URL** automática (Edge Function fetch HTML → scores + insights)
- **Channel scores** por projeto (Google, Meta, LinkedIn, TikTok)
- **Confirmação** ao excluir (AlertDialog)
- **Toast feedback** para todas as operações

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

#### 6. Benchmark Competitivo ✅
- **Geração automática** a partir de competitor_urls do projeto
- **Análise SWOT** (Strengths, Weaknesses, Opportunities, Threats)
- **Scores detalhados** (proposta, clareza, jornada, geral) e gap analysis
- **BenchmarkDetailDialog** com toggle fullscreen
- **Cards visuais** com tags coloridas e indicadores
- **Limpeza automática** de benchmarks antigos na reanálise
- **Filtros** por projeto e busca avançada

#### 7. Configurações ✅
- **Perfil do usuário** com avatar upload, nome, empresa, bio
- **Integrações de IA** — API keys por usuário:
  - Google Gemini (2.0 Flash, 3 Flash Preview, 3 Pro Preview)
  - Anthropic Claude (Sonnet 4, Sonnet 3.7, Haiku 3.5, Haiku 3, Opus 3)
  - Validação de key contra API real
  - Seleção de modelo preferido
  - Badge de status (Ativa/Não configurada)
  - Máscara de key com toggle de visibilidade
- **Notificações** (email, relatórios semanais)
- **Preferências** (idioma, fuso horário, auto-save)
- **Gerenciamento de conta** (senha, exportação, logout, exclusão)
- **Plano atual** com uso de análises

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

#### 11. Páginas Institucionais ✅
- **Preços** com planos Starter/Professional/Enterprise
- **Sobre, Cases, Blog, Carreiras, Contato**
- **Políticas:** Privacidade, Termos, Cookies
- **Página 404** personalizada

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
- Edge Functions (analyze-url)
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
│   │   ├── Dashboard*.tsx # Componentes do dashboard
│   │   ├── Landing*.tsx   # Componentes da landing page
│   │   ├── BenchmarkCard.tsx
│   │   ├── BenchmarkDetailDialog.tsx
│   │   ├── InsightCard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ForceLightMode.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── AvatarUpload.tsx
│   │   ├── NotificationsDropdown.tsx
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
│   │   └── NotFound.tsx   # Página 404
│   ├── integrations/      # Integrações externas
│   │   └── supabase/      # Cliente Supabase
│   ├── hooks/             # Hooks personalizados
│   │   ├── useAuth.ts     # Autenticação
│   │   ├── useTenantData.ts # Dados do tenant
│   │   └── useNotifications.ts # Notificações
│   ├── lib/               # Utilitários
│   │   ├── utils.ts
│   │   └── urlAnalyzer.ts # Análise heurística + salvar resultados
│   ├── test/              # Testes
│   ├── App.tsx            # App principal com rotas
│   └── main.tsx           # Entry point
├── supabase/              # Config Supabase
│   ├── schema.sql         # Schema completo (todas as tabelas)
│   ├── audiences_schema.sql
│   ├── add_project_to_audiences.sql
│   └── functions/
│       └── analyze-url/   # Edge Function de análise heurística
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
- `projects` — Projetos com URL, nicho, competitor_urls, score, status
- `project_channel_scores` — Scores por canal (google/meta/linkedin/tiktok)
- `insights` — Insights estratégicos (warning/opportunity/improvement)
- `audiences` — Públicos-alvo com keywords e vinculação a projetos
- `benchmarks` — Análises competitivas com SWOT e scores
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
- **DashboardHeader:** Header com navegação, perfil, notificações e ThemeToggle
- **DashboardSidebar:** Sidebar com menu SPA, active state e dados reais do tenant
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
- **BackToHomeButton:** Botão voltar consistente com backdrop blur

#### Theme Components
- **ThemeToggle:** Botão Sun/Moon para alternar dark/light
- **ForceLightMode:** Wrapper que força light mode em páginas públicas

#### Auth Components
- **Auth.tsx:** Tela de login/signup com split layout (form + gradient panel usando design system)

#### Notification Components
- **NotificationsDropdown:** Dropdown com notificações real-time
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
/                    # Landing page (light mode forçado)
/auth                # Login/Signup (split layout)
/pricing             # Página de preços
/about               # Sobre
/cases               # Cases
/blog                # Blog
/careers             # Carreiras
/contact             # Contato
/privacy-policy      # Política de privacidade
/terms-of-service    # Termos de serviço
/cookie-policy       # Política de cookies
/dashboard           # Dashboard principal (protegido)
/projects            # CRUD de projetos (protegido)
/insights            # Insights agrupados por projeto (protegido)
/audiences           # CRUD de públicos-alvo (protegido)
/benchmark           # Benchmark competitivo (protegido)
/settings            # Configurações + API keys (protegido)
/help                # Centro de ajuda (protegido)
/*                   # Página 404
```

### Fluxo do Usuário

1. **Acesso Inicial:** Landing page com apresentação do produto
2. **Cadastro/Login:** Tela redesenhada com split layout (form + gradient)
3. **Dashboard:** Visualização de projetos, métricas e insights recentes
4. **Criação de Projeto:** Nome, nicho, URL + URLs de concorrentes
5. **Análise Heurística:** Automática ao analisar URL (fetch HTML → scores + insights)
6. **Configurar API Keys:** Settings → Integrações de IA (Gemini/Claude)
7. **Análise por IA:** Sob demanda após heurística (planejado)
8. **Benchmark:** Comparação com concorrentes via análise SWOT
9. **Insights:** Visualização agrupada por projeto com dialog + fullscreen

### Fluxo de Análise (Arquitetura)

```
1. Análise Heurística (automática)
   URL → Edge Function (fetch HTML) → regex/contagem → scores + insights → salva no DB
   
2. Notificação (após heurística)
   Análise concluída → notifica usuário → libera análise por IA

3. Análise por IA (sob demanda, planejado)
   Dados heurísticos + HTML → API key do usuário → Gemini/Claude → insights aprofundados
```

### Integrações de IA

**API Keys por Usuário** — Cada usuário configura suas próprias chaves em Settings → Integrações de IA.

**Google Gemini:** Gemini 2.0 Flash, 3 Flash Preview, 3 Pro Preview  
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
- [x] Edge Function analyze-url

### � Em Progresso
- [ ] Guardar análise heurística no gerenciar do projeto + notificação
- [ ] Análise por IA sob demanda usando API key do usuário

### 📋 Próximos Passos
- [ ] Geração de relatórios PDF
- [ ] Exportação de dados CSV/Excel
- [ ] Testes automatizados
- [ ] Integração com APIs de marketing

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

O **Intentia Strategy Hub** está na **versão 1.6.0** com funcionalidades avançadas implementadas:

1. **Autenticação** redesenhada com split layout e design system
2. **Dashboard** com dados reais, Welcome Section e ScoreRing
3. **Análise heurística de URLs** automática via Edge Function
4. **Insights agrupados por projeto** com cards visuais, dialog e fullscreen
5. **Benchmark competitivo** com SWOT, gap analysis e dialog fullscreen
6. **Integrações de IA** — API keys por usuário (Gemini + Claude) com validação
7. **CRUD completo** para projetos, públicos-alvo e benchmarks
8. **Dark mode** isolado (sistema vs site público)
9. **Notificações** real-time com cores adaptáveis
10. **Schema SQL** completo com RLS + user_api_keys
11. **Design system** consistente com variáveis CSS

Próximos passos: análise por IA sob demanda, relatórios PDF e exportação de dados.
