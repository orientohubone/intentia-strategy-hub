# Intentia Strategy Hub - Contexto Completo do Projeto

## Visão Geral

**Nome do Projeto:** Intentia Strategy Hub  
**Tipo:** Aplicação Web React + TypeScript  
**Framework:** Vite + React + TypeScript  
**UI Framework:** shadcn/ui + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Auth + Edge Functions)  
**Propósito:** Plataforma de análise estratégica para marketing B2B  
**Versão:** 1.6.0

## Descrição do Projeto

O Intentia Strategy Hub é uma plataforma SaaS que ajuda empresas B2B a avaliar sua prontidão estratégica para investimentos em marketing digital. A aplicação oferece diagnósticos automatizados de URLs (heurístico + IA), benchmarking competitivo, scores por canal de mídia e insights estratégicos agrupados por projeto.

### Funcionalidades Principais

- **Diagnóstico de URL:** Análise heurística automática (fetch HTML) com scores de proposta de valor, clareza, jornada, SEO, conversão e conteúdo
- **Análise por IA (planejado):** Análise aprofundada usando API keys do usuário (Google Gemini / Anthropic Claude)
- **Benchmark Estratégico:** Comparação com concorrentes, análise SWOT, gap analysis, dialog de detalhes com fullscreen
- **Score por Canal:** Avaliação de Google, Meta, LinkedIn e TikTok com scores, objetivos e riscos
- **Insights Estratégicos:** Agrupados por projeto em cards visuais, dialog de detalhes com fullscreen
- **Alertas Estratégicos:** Avisos sobre investimentos prematuros ou arriscados em mídia
- **Dashboard Central:** Visualização de projetos, insights e métricas com dados reais
- **Integrações de IA:** Configuração de API keys por usuário (Gemini + Claude) com validação e seleção de modelo

## Estrutura Técnica

### Stack Tecnológico

**Frontend:**
- React 18.3.1 com TypeScript
- Vite 5.4.19 como bundler
- React Router DOM v6 para navegação SPA
- TanStack Query para gerenciamento de estado assíncrono
- React Hook Form + Zod para formulários

**UI/UX:**
- Tailwind CSS 3.4.17 para estilização
- shadcn/ui components (Radix UI base)
- Lucide React para ícones
- Sonner para notificações toast
- next-themes para tema dark/light
- Design system com variáveis CSS (--primary: hsl(16 100% 55%), gradientes, sombras)

**Backend/Database:**
- Supabase como backend-as-a-service
- Autenticação integrada (signInWithPassword, signUp)
- Banco de dados PostgreSQL com RLS
- Edge Functions (analyze-url)
- Real-time subscriptions
- Storage (avatars bucket)

**Desenvolvimento:**
- ESLint + TypeScript ESLint
- Vitest para testes
- PostCSS + Autoprefixer
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
│   │   ├── Settings.tsx   # Configurações + API keys
│   │   ├── Auth.tsx       # Login/Signup redesenhado
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
│   │   └── urlAnalyzer.ts # Análise heurística de URLs
│   ├── test/              # Testes
│   ├── App.tsx            # App principal com rotas
│   └── main.tsx           # Entry point
├── supabase/              # Config Supabase
│   ├── schema.sql         # Schema completo (todas as tabelas)
│   ├── audiences_schema.sql
│   ├── add_project_to_audiences.sql
│   └── functions/
│       └── analyze-url/   # Edge Function de análise
│           └── index.ts
├── documentacao/          # Documentação do projeto
│   ├── AGENTS.md
│   └── STATUS_IMPLEMENTACAO.md
├── package.json           # Dependências
├── vite.config.ts         # Config Vite
├── tailwind.config.ts     # Config Tailwind
└── tsconfig.json          # Config TypeScript
```

## Componentes Principais

### Dashboard Components
- **DashboardHeader:** Header com navegação, perfil, notificações e ThemeToggle
- **DashboardSidebar:** Sidebar com menu SPA, active state e dados reais do tenant
- **ProjectCard:** Card de projeto com score e status
- **ChannelCard:** Card de scores por canal (Google, Meta, LinkedIn, TikTok)
- **InsightCard:** Card de insights com ícones por tipo (warning/opportunity/improvement)
- **StatsCard:** Card de estatísticas gerais
- **ScoreRing:** Visualização circular de scores

### Benchmark Components
- **BenchmarkCard:** Card de benchmark com SWOT, scores e tags coloridas
- **BenchmarkDetailDialog:** Dialog de detalhes com toggle fullscreen

### Landing Components
- **LandingNav:** Navegação da landing page com dropdown hover
- **BackToHomeButton:** Botão voltar consistente com backdrop blur

### Theme Components
- **ThemeToggle:** Botão Sun/Moon para alternar dark/light
- **ForceLightMode:** Wrapper que força light mode em páginas públicas

### Auth Components
- **Auth.tsx:** Tela de login/signup com split layout (form + gradient panel)

### Notification Components
- **NotificationsDropdown:** Dropdown com notificações real-time
- **AvatarUpload:** Upload de foto de perfil com preview

### UI Components (shadcn/ui)
- Sistema completo de componentes acessíveis (Dialog, AlertDialog, Badge, etc.)
- Design system consistente com variáveis CSS
- Acessibilidade WCAG 2.1 AA

## Estado e Dados

### Estado Global
- **TanStack Query:** Cache e gerenciamento de dados assíncronos
- **React Hook Form:** Estado de formulários com validação Zod
- **Context API:** Tema e configurações globais

### Dados Conectados (Supabase)
- **Autenticação:** Supabase Auth com user_metadata
- **Projetos:** CRUD completo com análise de URL e competitor_urls
- **Insights:** Gerados automaticamente pela análise, agrupados por projeto
- **Públicos-alvo:** CRUD com vinculação de projetos
- **Benchmarks:** Análise SWOT, scores, gap analysis
- **Channel Scores:** Scores por canal por projeto
- **Notificações:** Real-time via Supabase subscriptions
- **API Keys:** Chaves de IA por usuário (Gemini + Claude)

### Supabase Integration
- **Project ID:** ccmubburnrrxmkhydxoz
- **URL:** https://ccmubburnrrxmkhydxoz.supabase.co
- **Autenticação:** Configurada com localStorage
- **Edge Functions:** analyze-url (análise heurística de HTML)

## Schema SQL

### Tabelas
- `tenant_settings` — Configurações do tenant (empresa, plano, limites)
- `projects` — Projetos com URL, nicho, competitor_urls, score, status
- `project_channel_scores` — Scores por canal (google/meta/linkedin/tiktok)
- `insights` — Insights estratégicos (warning/opportunity/improvement)
- `audiences` — Públicos-alvo com keywords e vinculação a projetos
- `benchmarks` — Análises competitivas com SWOT e scores
- `notifications` — Sistema de notificações
- `user_api_keys` — API keys de IA por usuário (google_gemini/anthropic_claude)

### Features do Database
- Row Level Security (RLS) por user_id em todas as tabelas
- Triggers para updated_at automático
- Índices para performance
- Views para dashboard (v_project_summary, v_dashboard_stats)
- Constraint unique(user_id, provider) em user_api_keys
- Storage bucket 'avatars' para fotos de perfil

## Rotas da Aplicação

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

## Fluxo do Usuário

1. **Acesso Inicial:** Landing page com apresentação do produto
2. **Cadastro/Login:** Tela redesenhada com split layout (form + gradient)
3. **Dashboard:** Visualização de projetos, métricas e insights recentes
4. **Criação de Projeto:** Nome, nicho, URL + URLs de concorrentes
5. **Análise Heurística:** Automática ao analisar URL (fetch HTML → scores + insights)
6. **Configurar API Keys:** Settings → Integrações de IA (Gemini/Claude)
7. **Análise por IA:** Sob demanda após heurística (planejado)
8. **Benchmark:** Comparação com concorrentes via análise SWOT
9. **Insights:** Visualização agrupada por projeto com dialog + fullscreen

## Fluxo de Análise (Arquitetura)

```
1. Análise Heurística (automática)
   URL → Edge Function (fetch HTML) → regex/contagem → scores + insights → salva no DB
   
2. Notificação (após heurística)
   Análise concluída → notifica usuário → libera análise por IA

3. Análise por IA (sob demanda, planejado)
   Dados heurísticos + HTML → API key do usuário → Gemini/Claude → insights aprofundados
```

## Integrações de IA

### API Keys por Usuário
Cada usuário configura suas próprias chaves em Settings → Integrações de IA.

**Google Gemini:**
- Gemini 2.0 Flash
- Gemini 3 Flash Preview
- Gemini 3 Pro Preview

**Anthropic Claude:**
- Claude Sonnet 4
- Claude Sonnet 3.7
- Claude Haiku 3.5
- Claude Haiku 3
- Claude Opus 3

### Funcionalidades
- Validação de API key contra a API real
- Seleção de modelo preferido
- Badge de status (Ativa/Não configurada)
- Máscara de key com toggle de visibilidade
- Última validação registrada

## Variáveis de Ambiente

```env
VITE_SUPABASE_PROJECT_ID="ccmubburnrrxmkhydxoz"
VITE_SUPABASE_ANON_KEY="[CHAVE_PÚBLICA]"
VITE_SUPABASE_URL="https://ccmubburnrrxmkhydxoz.supabase.co"
```

## Scripts Disponíveis

```json
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build modo desenvolvimento
npm run lint         # Linting do código
npm run preview      # Preview do build
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
```

## Próximos Passos de Desenvolvimento

### Em Progresso
- Guardar análise heurística no gerenciar do projeto + notificação
- Análise por IA sob demanda usando API key do usuário

### Planejado
- Geração de relatórios PDF
- Exportação de dados CSV/Excel
- Testes automatizados
- Integração com APIs de marketing

## Considerações Técnicas

- **Performance:** Vite oferece fast refresh e builds otimizados
- **Escalabilidade:** Arquitetura modular com Supabase + API keys por usuário
- **Manutenibilidade:** TypeScript e componentes reutilizáveis
- **Acessibilidade:** Componentes Radix UI com suporte ARIA (WCAG 2.1 AA)
- **Segurança:** RLS policies isolando dados por usuário, API keys armazenadas por tenant
- **Design System:** Variáveis CSS consistentes (--primary, --gradient-primary, etc.)

## Deploy

O projeto está configurado para deploy via:
- **Vercel** (configuração vercel.json presente)
- **Netlify** (build estático)
- **Qualquer plataforma** compatível com React/Vite
