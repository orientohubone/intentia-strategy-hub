# Arquitetura - Intentia Strategy Hub

## Stack

### Frontend
- React + TypeScript + Vite
- React Router (SPA)
- TanStack Query
- shadcn/ui + Tailwind

### Backend
- Supabase (Postgres, Auth, Realtime, Edge Functions)
- RLS por `user_id`
- Edge Functions para analise, orquestracao e admin

## Dominios principais

- Estrategia: projetos, benchmark, insights, audiencias, relatorios.
- Operacional: campanhas, metricas, budget, calendario, alertas.
- SEO & Performance: pagespeed, SERP, inteligencia SEO, monitoramento live.
- Governanca: feature flags, planos, overrides por cliente, painel admin.

## Rotas

### Publicas
- `/`
- `/auth`
- `/precos`
- `/monitoramento-seo-inteligente` (landing da feature)

### Protegidas
- `/dashboard`
- `/projects`
- `/seo-geo`
- `/seo-monitoring` (monitoramento SEO live)
- `/operations`
- `/settings`
- `/admin`

## Feature Flags

- Fonte de verdade: tabelas de flags/planos no Supabase.
- Hook de consumo no frontend: `useFeatureFlags`.
- Gating aplicado em:
  - rotas (via `FeatureGate`)
  - menu lateral (itens ocultos por feature indisponivel)
- Flags relevantes:
  - `seo_analysis`
  - `performance_monitoring`

## SEO Monitoring - arquitetura funcional

### Persistencia
- `seo_live_monitoring_configs`
  - configuracao por usuario/projeto
  - intervalo, estrategia, status do ultimo ciclo
- `seo_monitoring_jobs`
  - fila de execucao
  - origem (`manual`, `scheduled`, `webhook`)
  - status (`queued`, `running`, `completed`, `failed`)

### Orquestracao
- Edge Function: `seo-monitor-orchestrator`
  - `dispatch_due`
  - `run_jobs`
  - `dispatch_and_run`
  - `webhook_enqueue`
- Autorizacao:
  - JWT valido, ou
  - `x-cron-secret`, ou
  - `x-webhook-secret`

### Pipeline por ciclo
1. Seleciona job em fila.
2. Carrega projeto, concorrentes e chaves de IA.
3. Invoca:
   - `pagespeed`
   - `seo-serp`
   - `seo-intelligence`
4. Gera `monitoringInsights` comparando com snapshot anterior.
5. Persiste snapshot em `seo_analysis_history`.
6. Atualiza job/config (`completed`/`failed`, `next_run_at`, etc).

### Atualizacao de UI
- Timeline abastecida por `seo_analysis_history`.
- Realtime habilitado nas tabelas do monitoramento.
- Interface com agrupamento por data + estados expansivel/colapsado.

## Edge Functions principais

- `pagespeed`
- `seo-serp`
- `seo-intelligence`
- `seo-monitor-orchestrator`
- `admin-api`

## Governanca admin

- Painel admin exibe e controla feature flags por plano.
- Feature `performance_monitoring` com visibilidade:
  - status global
  - status por plano
  - override por cliente

## SQL de referencia

- Schema live monitoring:
  - `supabase/sql/01_schema/seo_live_monitoring_schema.sql`
- Migration de flag:
  - `supabase/sql/04_migrations/add_seo_monitoring_feature_flag.sql`
