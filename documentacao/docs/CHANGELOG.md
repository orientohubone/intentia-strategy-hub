# Changelog — Intentia Strategy Hub

---

## v4.0.0 (16/02/2026) — Limites & Uso Centralizado + Notificações

### 🔔 Sistema de Notificações Centralizado
- **notificationService.ts** — serviço centralizado com funções dedicadas por ação
- **Integrado em:** Projects, TacticalPlan, Audiences, Operations (campaigns, budget), Settings (API keys, backup), Support
- **Suporte restrito** — chat bloqueado para Starter, apenas Professional+ pode responder tickets

### 📊 Limites & Uso Centralizado
- **Bug fix:** limite de projetos Starter corrigido de 3→5 (trigger SQL + frontend)
- **Coluna `max_projects`** em `tenant_settings` (default 5, -1=ilimitado) + trigger dinâmico
- **Dashboard de Uso (Settings):** 7 métricas centralizadas com barras de progresso e cores por nível
- **Admin Panel:** campo "Máx. projetos ativos" nos limites do usuário + botões atualizados
- **Contador duplo (Projects):** exibe projetos ativos + análises lado a lado
- **Backup Starter:** 1→4/mês + mensagem de uso consciente
- **SQL migration:** `add_max_projects_column.sql`

### Arquivos Modificados
- `src/lib/notificationService.ts` (novo)
- `src/pages/Projects.tsx`, `TacticalPlan.tsx`, `Audiences.tsx`, `Settings.tsx`, `Support.tsx`
- `src/pages/Operations/hooks/useCampaigns.ts`, `Operations/components/BudgetManagement.tsx`
- `src/hooks/useTenantData.ts` — fix limite de projetos
- `src/pages/AdminPanel.tsx` — campo max_projects + botões
- `src/pages/Pricing.tsx` — backup 4/mês
- `supabase/guardrails.sql` — trigger 3→5
- `supabase/add_max_projects_column.sql` (novo)
- `supabase/admin_schema.sql`, `update_starter_plan.sql` — backup 1→4

---

## v3.9.0 (14/02/2026) — SEO & Performance + Admin Panel v2.8.0

### 📈 SEO & Performance Analysis
- Análise SEO completa com PageSpeed Insights
- Core Web Vitals monitoring (LCP, FID, CLS)
- Dados estruturados (JSON-LD, Open Graph, Twitter Card)
- Monitoramento de performance em tempo real
- Análise de performance por IA para campanhas
- Nova categoria no Admin Panel: "SEO & Performance"
- Features: seo_analysis, performance_monitoring, ai_performance_analysis

### 🛠️ Admin Panel v2.8.0
- Nova categoria "Integrações" com controle de features
- Nova categoria "SEO & Performance" para gestão visual
- 29 features totais em 9 categorias
- Interface otimizada para seletor de status

### 🎨 Landing Page e Pricing
- Landing page atualizada com novas features
- Página de preços com nova categoria "SEO & Performance"
- Status "Em breve" para integrações

---

## v3.8.0 — Integrações com APIs de Marketing (OAuth Real)

- Schema SQL: `ad_integrations`, `integration_sync_logs`, `v_integration_summary`
- OAuth Config: `integrationOAuth.ts` com 4 providers
- Edge Functions: `oauth-connect`, `oauth-callback`, `integration-sync`
- Página `/integracoes` com grid 2x2, fluxo OAuth, sync manual, disconnect
- Página `/oauth/callback` com retry loop para restaurar sessão
- Documentação: 4 manuais completos em `documentacao/integracoes/`

---

## v3.7.0 — Calendário de Campanhas

- Views: `v_campaign_calendar`, `v_campaign_timeline`
- CampaignCalendar.tsx: grid mensal estilo Google Calendar
- CampaignTimeline.tsx: vista Gantt horizontal (8 semanas)
- CampaignCalendarManager.tsx: toggle Calendário/Timeline + filtros

---

## v3.6.0 — Gestão de Budget

- Views: `v_budget_summary`, `v_budget_project_pacing`
- Funções SQL: `sync_budget_actual_spent()`, `sync_all_budgets()`
- BudgetManagement.tsx: alocação, pacing, breakdown por canal, sync

---

## v3.5.0 — Alertas Automáticos de Performance

- Engine de regras com 11 alertas automáticos
- Thresholds por canal (CTR, CPC, CPA)
- PerformanceAlerts.tsx: cards com filtros por severidade/categoria

---

## v3.4.0 — Comparativo Tático vs Real

- TacticalVsRealComparison: gap analysis operacional
- Score de aderência (30% estrutura + 70% métricas)
- METRIC_KEY_MAP: 25+ labels → campos reais

---

## v3.3.0 — Análise de Performance por IA + Dashboard

- Análise por IA por campanha (saúde, KPIs, funil, budget, riscos, projeções)
- CampaignPerformanceAiDialog com fullscreen
- Dashboard: card de campanhas recentes + projetos com expand/collapse

---

## v3.2.0 — Métricas e Performance

- Métricas por canal (13 novos campos)
- CampaignMetricsForm + CampaignPerformanceCards
- v3.2.1: 16 campos Google B2B (funil completo: sessões → CAC → LTV → ROI)

---

## v3.1.0 — Fundação Operacional

- Schema: campaigns, campaign_metrics, budget_allocations
- Página `/operations` com CRUD, filtros, agrupamento por projeto
- Fluxo de status: draft→active→paused→completed→archived

---

## v2.8.0 — Admin Panel + Feature Flags

- Painel Administrativo com login separado (CNPJ + SHA-256)
- Feature Flags: 25 features em 8 categorias
- Controle de Planos: habilitar/desabilitar features por plano
- Gestão de Clientes: lista de usuários, alteração de plano, overrides
- useFeatureFlags hook para frontend

---

## v2.6.0 — Security Hardening

- RLS fixes, views com security_invoker, anti-escalação
- Audit log automático em 13+ tabelas
- Sistema de backup (manual + automático + export JSON)
- Guardrails: soft delete, rate limiting, limites por plano
- Página pública de Segurança (`/seguranca`)

---

## v2.3.0 — Mobile-First

- DashboardLayout wrapper compartilhado
- Todas as páginas protegidas responsivas
- Sidebar overlay mobile, header hamburger
- ShowcaseSlider touch, NotificationsDropdown responsivo

---

## v2.0.0 — Plano Tático + Alertas + Checkout

- Plano Tático por canal com 6 templates B2B
- Playbook gamificado
- Alertas Estratégicos consolidados
- Checkout público + interno
- URLs traduzidas para português

---

## v1.0.0 — MVP

- Autenticação (login/signup split layout)
- Dashboard com dados reais
- CRUD de projetos + análise heurística
- Análise por IA (Gemini + Claude)
- Insights, Benchmark, Público-Alvo
- Exportação (JSON, MD, HTML, PDF, CSV)
- Dark mode, notificações, centro de ajuda
