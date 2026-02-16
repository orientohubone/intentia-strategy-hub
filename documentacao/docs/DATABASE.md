# Database & Schema — Intentia Strategy Hub

## Tabelas Implementadas

| Tabela | Descrição |
|---|---|
| `tenant_settings` | Configurações do tenant (empresa, plano, limites, max_projects, max_audiences) |
| `projects` | Projetos com URL, nicho, competitor_urls, score, status, html_snapshot, structured_data |
| `project_channel_scores` | Scores por canal (google/meta/linkedin/tiktok) |
| `insights` | Insights estratégicos (warning/opportunity/improvement) + campos IA |
| `audiences` | Públicos-alvo com keywords e vinculação a projetos |
| `benchmarks` | Análises competitivas com SWOT, scores, ai_analysis, structured_data, html_snapshot |
| `notifications` | Sistema de notificações |
| `user_api_keys` | API keys de IA por usuário (google_gemini/anthropic_claude) |
| `tactical_plans` | Planos táticos por projeto (scores, status) |
| `tactical_channel_plans` | Planos por canal (campanha, funil, lances, estrutura, métricas) |
| `copy_frameworks` | Frameworks de copy por canal e tipo |
| `segmentation_plans` | Segmentação público × canal × mensagem |
| `testing_plans` | Planos de teste com hipóteses e critérios |
| `campaigns` | Campanhas com status, canal, budget, datas |
| `campaign_metrics` | Métricas por campanha (impressões, cliques, conversões, etc.) |
| `budget_allocations` | Alocações de budget por canal/mês |
| `ad_integrations` | Integrações OAuth (tokens, account info, sync config) |
| `integration_sync_logs` | Histórico de sincronização |
| `support_tickets` | Tickets de suporte |
| `support_ticket_messages` | Mensagens de tickets |
| `audit_log` | Log de auditoria automático (INSERT/UPDATE/DELETE em 13+ tabelas) |
| `user_data_backups` | Snapshots JSON de dados do usuário (manual/auto/pre_delete) |
| `rate_limits` | Controle de rate limiting por ação e usuário |
| `admin_users` | Usuários admin (CNPJ, password_hash, role) |
| `feature_flags` | 29 features com status (active/disabled/development/maintenance/deprecated) |
| `plan_features` | Mapeamento feature × plano com is_enabled, usage_limit, limit_period |
| `admin_audit_log` | Log de ações administrativas |
| `user_feature_overrides` | Override de features por usuário |

## Supabase Types (Frontend)
- Todas as tabelas acima adicionadas a `src/integrations/supabase/types.ts`
- Views: `v_project_summary`, `v_dashboard_stats`, `v_benchmark_summary`, `v_benchmark_stats`, `v_campaign_summary`, `v_operational_stats`, `v_campaign_metrics_summary`, `v_budget_summary`, `v_budget_project_pacing`, `v_campaign_calendar`, `v_campaign_timeline`, `v_integration_summary`

## Storage Buckets
- `avatars` — Fotos de perfil (isolado por user_id)

---

## Features de Segurança

- **RLS** por user_id em todas as 20+ tabelas
- **Triggers** para updated_at automático
- **Audit triggers** em 13+ tabelas (mascarando campos sensíveis)
- **Índices** para performance
- **Views** com security_invoker
- **Constraint** unique(user_id, provider) em user_api_keys
- **Foreign keys** com cascade delete
- **Trigger anti-escalação** de plano (prevent_plan_escalation)
- **Trigger anti-reset** de contadores (prevent_analyses_counter_reset)
- **Soft delete** em projects, audiences, benchmarks, tactical_plans, campaigns
- **Rate limiting** por plano (Starter: 10/hr, Pro: 50/hr, Enterprise: 200/hr)
- **Limites de projetos** por plano (Starter: 5, Pro/Enterprise: ilimitado) — coluna `max_projects` dinâmica
- **Limites de análises** por plano (Starter: 5/mês)
- **Backup automático** antes de exclusão de projetos
- **Cleanup automático:** audit logs (90d), backups (90d), soft-deleted (30d), rate limits (7d)

---

## SQL Scripts

| Script | Descrição |
|---|---|
| `schema.sql` | Schema completo (tabelas principais) |
| `admin_schema.sql` | Schema admin panel (admin_users, feature_flags, plan_features) |
| `security_hardening.sql` | Correções de RLS, views, anti-escalação |
| `audit_log.sql` | Tabela audit_log + triggers em 13 tabelas |
| `user_backup.sql` | Tabela user_data_backups + funções de snapshot |
| `guardrails.sql` | Soft delete, rate limiting, limites por plano |
| `add_max_projects_column.sql` | Migration: max_projects em tenant_settings + trigger dinâmico |
| `add_max_audiences_column.sql` | Migration: max_audiences em tenant_settings |
| `update_starter_plan.sql` | Atualização de limites do plano Starter |
| `ad_integrations.sql` | Tabelas de integrações OAuth + sync logs |
| `campaign_calendar.sql` | Views de calendário e timeline |
| `budget_management.sql` | Views de budget + funções de sync |
| `EXECUTION_ORDER.md` | Guia de execução dos SQLs + cron jobs |

---

## Edge Functions

| Função | Descrição |
|---|---|
| `analyze-url` | Análise heurística (fetch HTML → scores + insights) |
| `ai-analyze` | Proxy para Claude API (CORS) |
| `export-user-data` | Backup/export de dados do usuário |
| `admin-api` | API do admin panel (bypassa RLS via service_role) |
| `oauth-connect` | Início do fluxo OAuth (gera URL de autorização) |
| `oauth-callback` | Retorno do OAuth (troca code por tokens) |
| `integration-sync` | Sincronização de dados com APIs de marketing |
