# Changelog - Intentia Strategy Hub

---

## v4.2.0 (19/02/2026) - Monitoramento SEO Inteligente + Governanca por Plano

### Monitoramento SEO inteligente (live)
- Nova rota protegida `/seo-monitoring` com monitoramento continuo por projeto.
- Configuracao live persistida no Supabase (nao depende de localStorage).
- Timeline melhorada com agrupamento por data, leitura de deltas e contexto de mudancas.
- Enriquecimento do snapshot com `monitoringInsights` (SEO, performance, ranking e concorrencia).

### Orquestracao e dados
- Nova Edge Function `seo-monitor-orchestrator`.
- Suporte a acoes: `dispatch_due`, `run_jobs`, `dispatch_and_run`, `webhook_enqueue`.
- Integracao de ciclo com `pagespeed`, `seo-serp` e `seo-intelligence`.
- Novo schema SQL `seo_live_monitoring_schema.sql`:
  - `seo_live_monitoring_configs`
  - `seo_monitoring_jobs`
  - RLS/policies/indexes/triggers + realtime publication
- Nova migration `add_seo_monitoring_feature_flag.sql`.

### Site, precos e ajuda
- Nova pagina publica `/monitoramento-seo-inteligente`.
- Pagina de precos atualizada com posicionamento do monitoramento SEO inteligente.
- Central de ajuda atualizada com artigos e FAQ de monitoramento live.

### Admin e feature flags
- Feature flag `performance_monitoring` integrada ao painel admin.
- Controle por plano + visibilidade de status global da feature.
- Gating aplicado em menu e rotas do monitoramento.

---

## v4.1.0 (18/02/2026) - Cards Interativos de IA + Notificacoes Otimizadas

- Cards de progresso de IA para projetos e operacoes.
- Deduplificacao de notificacoes + sincronizacao automatica de contadores.
- Melhorias de UX para analises longas.
- Central de ajuda atualizada para fluxos de analise com IA.

---

## v4.0.0 (16/02/2026) - Limites, Uso Centralizado e Notificacoes

- Ajustes de limites por plano (incluindo maximo de projetos).
- Dashboard de uso consolidado em configuracoes.
- Melhorias no admin para gestao de limites e planos.
- Servico de notificacao centralizado.

---

## v3.9.0 e anteriores

- SEO & Performance inicial, Admin Panel com feature flags, Integracoes OAuth, modulo Operacional, Plano Tatico, Alertas e MVP base.
- Para historico detalhado completo anterior, consultar tags/releases do repositorio e documentos de versoes internas.
