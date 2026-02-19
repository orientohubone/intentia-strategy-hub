# SEO Monitoramento Live - Documentacao Tecnica

**Status:** Implementado (MVP evolutivo)  
**Escopo:** Persistencia de configuracao no Supabase + base de jobs/scheduler/webhook + realtime para timeline

## 1. Objetivo

Esta implementacao evolui o monitoramento SEO para:

1. Persistir configuracoes de monitoramento por usuario/projeto no banco (nao mais localStorage).
2. Permitir execucao por fila de jobs (manual, agendada e webhook).
3. Atualizar a tela de monitoramento em tempo quase real via Supabase Realtime.

## 2. Componentes Implementados

## 2.1 Frontend

- `src/pages/SeoGeo.tsx`
  - Toggle `Monitoramento Live` (ativar/desativar).
  - Seletor de intervalo (2/5/10/15 min).
  - Persistencia de config via Supabase.
  - Auto-save de analise no historico quando live esta ativo.

- `src/pages/SeoMonitoring.tsx`
  - Tela independente de monitoramento.
  - Execucao manual (`Rodar Agora`) via enfileiramento de job.
  - Polling local (MVP) para disparo de ciclo live.
  - Assinatura realtime de `seo_analysis_history` para atualizar timeline.

- `src/lib/seoLiveMonitoring.ts`
  - Camada de leitura/escrita da config live no Supabase:
    - `getSeoLiveMonitoringConfig(...)`
    - `setSeoLiveMonitoringConfig(...)`

- Navegacao
  - Rota protegida: `/seo-monitoring` em `src/App.tsx`.
  - Item de menu: `Monitoramento SEO` em `src/components/DashboardSidebar.tsx`.

## 2.2 Backend (Supabase SQL)

Arquivo: `supabase/sql/01_schema/seo_live_monitoring_schema.sql`

Tabelas:

1. `public.seo_live_monitoring_configs`
   - Chave unica por `(user_id, project_id)`.
   - Campos principais:
     - `enabled`
     - `interval_seconds`
     - `strategy` (`mobile|desktop`)
     - `next_run_at`, `last_run_at`
     - `last_status`, `last_error`
     - `webhook_token` (reservado para evolucao)

2. `public.seo_monitoring_jobs`
   - Fila de execucao por job.
   - Campos principais:
     - `trigger_source` (`manual|scheduled|webhook`)
     - `status` (`queued|running|completed|failed|cancelled`)
     - `payload`, `result_summary`, `error_message`
     - `run_started_at`, `run_finished_at`

Seguranca:

- RLS habilitado nas duas tabelas.
- Policies `select/insert/update/delete` por `auth.uid() = user_id`.
- Triggers `updated_at` usando `public.set_updated_at()`.

Realtime:

- Publicacao `supabase_realtime` com:
  - `seo_analysis_history`
  - `seo_live_monitoring_configs`
  - `seo_monitoring_jobs`

## 2.3 Backend (Edge Function Orquestradora)

Arquivo: `supabase/functions/seo-monitor-orchestrator/index.ts`

Acao suportadas (`action`):

1. `dispatch_due`
   - Busca configs ativas vencidas (`next_run_at <= now`).
   - Enfileira jobs `scheduled`.

2. `run_jobs`
   - Processa jobs `queued`.
   - Para cada job:
     - Carrega projeto + concorrentes + chaves IA.
     - Executa `pagespeed`, `seo-serp`, `seo-intelligence`.
     - Salva snapshot em `seo_analysis_history`.
     - Atualiza `seo_monitoring_jobs` e `seo_live_monitoring_configs`.

3. `dispatch_and_run`
   - Executa `dispatch_due` e depois `run_jobs` no mesmo request.

4. `webhook_enqueue`
   - Enfileira jobs a partir de webhook externo (por `projectId` ou `projectUrl`).

Autenticacao:

- JWT valido **ou** `x-cron-secret` (`INTERNAL_CRON_SECRET`) **ou** `x-webhook-secret` (`SEO_MONITOR_WEBHOOK_SECRET`).

## 3. Fluxos de Execucao

## 3.1 Fluxo A - Usuario ativa monitoramento live

1. Usuario ativa no SEO (`SeoGeo`) ou Monitoramento (`SeoMonitoring`).
2. Front chama `setSeoLiveMonitoringConfig(...)`.
3. Registro em `seo_live_monitoring_configs` recebe:
   - `enabled = true`
   - `interval_seconds`
   - `strategy`
   - `next_run_at = now + interval`

## 3.2 Fluxo B - Execucao manual

1. Usuario clica `Rodar Agora`.
2. Front insere job `queued` em `seo_monitoring_jobs` com `trigger_source = manual`.
3. Front invoca `seo-monitor-orchestrator` com `action = run_jobs`.
4. Worker processa job e grava snapshot em `seo_analysis_history`.
5. Realtime atualiza timeline.

## 3.3 Fluxo C - Execucao agendada (scheduler)

1. Scheduler chama function com `action = dispatch_and_run`.
2. Function enfileira configs vencidas.
3. Function processa fila.
4. Proximo ciclo e calculado por `interval_seconds`.

## 3.4 Fluxo D - Disparo por webhook

1. Ferramenta externa chama function com `action = webhook_enqueue`.
2. Function valida `x-webhook-secret`.
3. Jobs sao enfileirados para os projetos alvo.
4. Processamento pode ocorrer no mesmo ciclo por chamada posterior `run_jobs`.

## 4. Variaveis de Ambiente Necessarias

Na edge function `seo-monitor-orchestrator`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTERNAL_CRON_SECRET`
- `SEO_MONITOR_WEBHOOK_SECRET`

## 5. Deploy e Operacao

## 5.1 Aplicar schema

Executar:

```sql
-- arquivo:
-- supabase/sql/01_schema/seo_live_monitoring_schema.sql
```

## 5.2 Deploy da function

```bash
supabase functions deploy seo-monitor-orchestrator
```

## 5.3 Agendamento recomendado (exemplo)

Scheduler externo ou pg_cron chamando a cada 5 minutos:

- Endpoint: `/functions/v1/seo-monitor-orchestrator`
- Body:

```json
{
  "action": "dispatch_and_run",
  "limit": 20
}
```

- Header:
  - `x-cron-secret: <INTERNAL_CRON_SECRET>`

## 5.4 Exemplo webhook

```http
POST /functions/v1/seo-monitor-orchestrator
x-webhook-secret: <SEO_MONITOR_WEBHOOK_SECRET>
content-type: application/json
```

```json
{
  "action": "webhook_enqueue",
  "projectId": "uuid-do-projeto",
  "payload": {
    "source": "external-monitor",
    "reason": "content_change_detected"
  }
}
```

## 6. Observacoes Tecnicas

- O processamento em job reduz carga no browser e melhora previsibilidade.
- A tela agora pode refletir execucoes vindas de outros dispositivos/sessoes.
- O polling local na UI continua no MVP, mas a base de scheduler/webhook ja esta pronta.
- Proximo passo de maturidade: separar `dispatch` e `worker` em jobs assincromos com retry/backoff nativo.

## 7. Troubleshooting Rapido

1. Config nao salva:
   - Verificar se tabela `seo_live_monitoring_configs` existe.
   - Verificar RLS/policies e `user_id`.

2. Job nao processa:
   - Verificar deploy da function `seo-monitor-orchestrator`.
   - Verificar secret `INTERNAL_CRON_SECRET` e headers.
   - Ver logs da function.

3. Timeline nao atualiza em tempo real:
   - Verificar `ALTER PUBLICATION supabase_realtime ...`.
   - Verificar subscription no `SeoMonitoring.tsx`.

4. Snapshot sem dados:
   - Confirmar disponibilidade das functions `pagespeed`, `seo-serp`, `seo-intelligence`.
   - Validar URL do projeto e concorrentes.
