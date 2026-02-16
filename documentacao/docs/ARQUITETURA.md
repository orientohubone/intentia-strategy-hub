# Arquitetura — Intentia Strategy Hub

## Stack Tecnológico

### Frontend
- React 18.3.1 + TypeScript
- Vite 5.4.19 (bundler + dev server)
- React Router DOM v6 (SPA navigation)
- TanStack Query (cache de dados)
- React Hook Form + Zod (formulários)
- shadcn/ui + Radix UI (componentes acessíveis)
- Tailwind CSS 3.4.17 (estilização)
- Lucide React (ícones)
- Sonner (toast notifications)
- next-themes (dark mode)

### Backend/Database
- Supabase (PostgreSQL + Auth + Real-time + Edge Functions)
- Row Level Security (RLS) por user_id em todas as 16+ tabelas
- Triggers para updated_at automático
- Audit log automático em 13+ tabelas
- Views com security_invoker para dashboard queries
- Edge Functions: analyze-url, ai-analyze, export-user-data, admin-api, oauth-connect, oauth-callback, integration-sync
- Storage bucket (avatars) com isolamento por user_id
- Rate limiting por plano
- Soft delete com retenção de 30 dias

### Desenvolvimento
- ESLint + TypeScript ESLint
- Vitest para testes (12 testes passando)
- Git version control
- PostCSS + Autoprefixer

---

## Estrutura de Arquivos

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
│   │   ├── StructuredDataViewer.tsx # Viewer unificado com abas
│   │   └── *.tsx
│   ├── pages/             # Páginas principais
│   │   ├── Index.tsx      # Home/Landing
│   │   ├── Dashboard.tsx  # Dashboard principal
│   │   ├── Projects.tsx   # CRUD de projetos + análise URL
│   │   ├── Insights.tsx   # Insights agrupados por projeto
│   │   ├── Audiences.tsx  # CRUD de públicos-alvo
│   │   ├── Benchmark.tsx  # Benchmark competitivo
│   │   ├── Settings.tsx   # Configurações + API keys + Backup
│   │   ├── Auth.tsx       # Login/Signup (split layout)
│   │   ├── Help.tsx       # Centro de ajuda
│   │   ├── TacticalPlan.tsx # Plano tático por canal
│   │   ├── Alerts.tsx     # Alertas estratégicos consolidados
│   │   ├── Operations/    # Operações (campanhas, métricas, budget, calendário)
│   │   ├── Integrations.tsx # Integrações OAuth
│   │   ├── Support.tsx    # Suporte por chamados
│   │   ├── AdminPanel.tsx # Painel administrativo
│   │   ├── Checkout.tsx   # Checkout interno (upgrade)
│   │   ├── Subscribe.tsx  # Checkout público (assinatura)
│   │   ├── Security.tsx   # Página pública de segurança
│   │   └── NotFound.tsx   # Página 404
│   ├── integrations/      # Integrações externas
│   │   └── supabase/      # Cliente Supabase
│   ├── hooks/             # Hooks personalizados
│   │   ├── useAuth.ts     # Autenticação
│   │   ├── useTenantData.ts # Dados do tenant
│   │   ├── useNotifications.ts # Notificações
│   │   ├── useFeatureFlags.ts  # Feature flags por plano
│   │   └── useAdminAuth.ts    # Auth admin separada
│   ├── lib/               # Utilitários
│   │   ├── utils.ts
│   │   ├── urlAnalyzer.ts # Análise heurística + salvar resultados
│   │   ├── aiAnalyzer.ts  # Análise por IA (projetos + benchmarks + insights)
│   │   ├── notificationService.ts # Serviço centralizado de notificações
│   │   ├── adminApi.ts    # API do admin panel (Edge Function)
│   │   ├── adminAuth.ts   # Auth admin (CNPJ + SHA-256)
│   │   ├── exportAnalysis.ts # Exportação JSON/MD/HTML/PDF
│   │   ├── reportGenerator.ts # Relatórios PDF consolidados
│   │   └── exportCsv.ts   # Exportação CSV
│   ├── test/              # Testes (12 testes)
│   ├── App.tsx            # App principal com rotas
│   └── main.tsx           # Entry point
├── supabase/              # Config Supabase
│   ├── schema.sql         # Schema completo
│   ├── guardrails.sql     # Soft delete, rate limiting, limites
│   ├── add_max_projects_column.sql # Migration: max_projects
│   ├── admin_schema.sql   # Schema admin panel
│   ├── security_hardening.sql
│   ├── audit_log.sql
│   ├── user_backup.sql
│   ├── EXECUTION_ORDER.md
│   └── functions/
│       ├── analyze-url/   # Análise heurística
│       ├── ai-analyze/    # Proxy Claude API
│       ├── admin-api/     # API admin panel
│       ├── export-user-data/ # Backup/export
│       ├── oauth-connect/ # OAuth inicio
│       ├── oauth-callback/ # OAuth retorno
│       └── integration-sync/ # Sync de dados
├── documentacao/          # Documentação
│   ├── docs/              # Documentação refatorada (este diretório)
│   ├── ADMIN_PANEL.md
│   ├── integracoes/       # Manuais por provider
│   └── *.md               # Outros docs
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Rotas da Aplicação

### Páginas Públicas
| Rota | Descrição |
|---|---|
| `/` | Landing page (light mode forçado) |
| `/auth` | Login/Signup (split layout) — suporta `?redirect=` |
| `/assinar` | Checkout público self-service (Professional) |
| `/precos` | Página de preços |
| `/sobre` | Sobre |
| `/cases` | Cases de uso (screenshots + lightbox) |
| `/blog` | Blog |
| `/contato` | Contato |
| `/seguranca` | Segurança e proteção de dados |
| `/politica-de-privacidade` | Política de privacidade |
| `/termos-de-servico` | Termos de serviço |
| `/politica-de-cookies` | Política de cookies |
| `/brand` | Guia de marca |
| `/admin/login` | Login admin (CNPJ + senha) |

### Páginas Protegidas (requer autenticação)
| Rota | Descrição |
|---|---|
| `/dashboard` | Dashboard principal |
| `/projects` | CRUD de projetos + análise |
| `/insights` | Insights agrupados por projeto |
| `/audiences` | CRUD de públicos-alvo |
| `/benchmark` | Benchmark competitivo |
| `/settings` | Configurações + API keys + plano + backup |
| `/help` | Centro de ajuda |
| `/tactical` | Plano tático por canal |
| `/alertas` | Alertas estratégicos consolidados |
| `/operations` | Operações (campanhas, métricas, budget) |
| `/integracoes` | Integrações OAuth (Google/Meta/LinkedIn/TikTok) |
| `/support` | Suporte por chamados |
| `/checkout` | Checkout interno (upgrade) |
| `/admin` | Painel administrativo |

---

## Componentes Principais

### Dashboard
- **DashboardLayout** — wrapper compartilhado (sidebar + header + main)
- **DashboardHeader** — header responsiva (hamburger mobile, perfil, notificações, ThemeToggle)
- **DashboardSidebar** — sidebar responsiva (overlay mobile, auto-close)
- **ProjectCard, ChannelCard, InsightCard, StatsCard, ScoreRing**

### Análise
- **AnalysisProgressTracker** — indicador visual step-by-step
- **StructuredDataViewer** — viewer unificado com abas (principal + concorrentes)
- **BenchmarkCard / BenchmarkDetailDialog** — benchmark com SWOT + fullscreen

### Operações
- **CampaignCalendar** — grid mensal estilo Google Calendar
- **CampaignTimeline** — vista Gantt horizontal
- **BudgetManagement** — gestão de budget com pacing
- **PerformanceAlerts** — alertas automáticos de performance
- **TacticalVsRealComparison** — gap analysis operacional

### UI/UX
- **ThemeToggle** — Sun/Moon (dark/light)
- **ForceLightMode** — wrapper para páginas públicas
- **NotificationsDropdown** — responsivo (fixed mobile, absolute desktop)
- **BackToHomeButton** — scroll-aware

---

## Fluxos do Usuário

### Fluxo de Análise
```
1. Criar Projeto (nome, nicho, URL + concorrentes)
2. Análise Heurística automática (Edge Function → scores + insights + dados estruturados)
3. Progress Tracker visual step-by-step
4. Configurar API Keys (Settings → Gemini/Claude)
5. Análise por IA sob demanda (selecionar modelo → resultados detalhados)
6. Exportar (JSON, MD, HTML, PDF)
7. Benchmark com concorrentes (SWOT + gap analysis)
8. Enriquecer com IA
9. Alertas e Insights consolidados
```

### Fluxo de Assinatura
```
Landing/Preços → /assinar → Checkout → Conta criada (Professional) → Confirma email → Login
```

### Fluxo de Upgrade
```
Settings → Card de plano → "Fazer Upgrade" → /checkout → Plano atualizado
```

---

## Integrações de IA

**API Keys por Usuário** — cada usuário configura em Settings → Integrações de IA.

| Provider | Modelos |
|---|---|
| Google Gemini | 3 Flash Preview, 2.5 Flash, 2.5 Pro Preview, 2.0 Flash |
| Anthropic Claude | Sonnet 4, Sonnet 3.7, Haiku 3.5, Haiku 3, Opus 3 |

**Funcionalidades:** validação contra API real, seleção de modelo, badge de status, máscara de key, última validação.

---

## Variáveis de Ambiente

```env
VITE_SUPABASE_PROJECT_ID="vofizgftwxgyosjrwcqy"
VITE_SUPABASE_ANON_KEY="[CHAVE_PÚBLICA]"
VITE_SUPABASE_URL="https://vofizgftwxgyosjrwcqy.supabase.co"
```

## Scripts

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run build:dev    # Build modo desenvolvimento
npm run lint         # Linting do código
npm run preview      # Preview do build
npm run test         # Executar testes
npm run test:watch   # Testes em modo watch
```

## Deploy

Suportado em: **Vercel** (vercel.json), **Netlify**, qualquer plataforma React/Vite.
