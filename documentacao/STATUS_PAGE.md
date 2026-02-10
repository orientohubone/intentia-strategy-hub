# Intentia Strategy Hub — Documentação da Página de Status

**Rota:** `/status`  
**Arquivo:** `src/pages/Status.tsx`  
**Última atualização:** 10 de Fevereiro de 2026  
**Versão:** 1.0.0

---

## 1. Visão Geral

A página de Status é uma página pública que exibe em tempo real a operabilidade de todos os serviços da plataforma Intentia. Seu objetivo é transmitir **transparência**, **confiança** e **proximidade** com os usuários, mostrando:

- Status atual de cada serviço
- Histórico de uptime dos últimos 90 dias
- Incidentes recentes com timeline de atualizações
- Manutenções programadas
- Métricas de confiabilidade (uptime %, latência, MTTR)

---

## 2. Arquitetura da Página

### 2.1 Seções

| # | Seção | Descrição |
|---|-------|-----------|
| 1 | **Hero — Status Geral** | Banner dinâmico com status agregado de todos os serviços |
| 2 | **Barra de Uptime (90 dias)** | Gráfico de barras com tooltip por dia (%, status) |
| 3 | **Status dos Serviços** | Lista agrupada por categoria com ícone de status por serviço |
| 4 | **Incidentes Recentes** | Cards expansíveis com timeline de atualizações |
| 5 | **Manutenções Programadas** | Avisos de manutenção futura com datas e serviços afetados |
| 6 | **Métricas de Confiabilidade** | 4 cards: Uptime %, Tempo de Resposta, Incidentes/mês, MTTR |
| 7 | **Legenda de Status** | Explicação visual dos 5 estados possíveis |
| 8 | **CTA de Transparência** | Call-to-action com links para cadastro e segurança |

### 2.2 Layout

- **Mobile-first** com breakpoints `sm:`, `md:`, `lg:`
- Segue o padrão das páginas públicas: `Header` + `BackToHomeButton` + conteúdo + `Footer` + `BackToTop`
- `ForceLightMode` aplicado via rota no `App.tsx`
- SEO completo com `<SEO>` component + BreadcrumbList JSON-LD

---

## 3. Estados de Serviço

| Status | Label | Cor | Ícone | Descrição |
|--------|-------|-----|-------|-----------|
| `operational` | Operacional | Verde (emerald) | `CheckCircle2` | Serviço funcionando normalmente |
| `degraded` | Desempenho Degradado | Amarelo (amber) | `AlertTriangle` | Serviço lento ou com performance reduzida |
| `partial_outage` | Interrupção Parcial | Laranja (orange) | `AlertTriangle` | Parte do serviço indisponível |
| `major_outage` | Interrupção Total | Vermelho (red) | `XCircle` | Serviço completamente indisponível |
| `maintenance` | Em Manutenção | Azul (blue) | `RefreshCw` | Manutenção programada em andamento |

### Status Geral (agregado)

O status geral é calculado automaticamente pela função `getOverallStatus()`:

1. Se **qualquer** serviço está em `major_outage` → Status geral = `major_outage`
2. Se **qualquer** serviço está em `partial_outage` → Status geral = `partial_outage`
3. Se **qualquer** serviço está em `degraded` → Status geral = `degraded`
4. Se **qualquer** serviço está em `maintenance` → Status geral = `maintenance`
5. Caso contrário → Status geral = `operational`

---

## 4. Serviços Monitorados

| Serviço | Categoria | Ícone | Descrição |
|---------|-----------|-------|-----------|
| Plataforma Web | Core | `Globe` | Interface principal, dashboard e navegação |
| Autenticação | Core | `Shield` | Login, cadastro, recuperação de senha e sessões |
| Banco de Dados | Core | `Database` | Armazenamento de projetos, insights, benchmarks |
| API & Edge Functions | Core | `Server` | Endpoints de análise, exportação e processamento |
| Análise Heurística de URL | Análise | `Zap` | Diagnóstico automático de páginas web |
| Análise por IA | Análise | `Brain` | Análise via Google Gemini e Anthropic Claude |
| Benchmark Competitivo | Análise | `BarChart3` | Comparação com concorrentes, SWOT, gap analysis |
| Notificações | Comunicação | `Bell` | Sistema de notificações em tempo real |
| CDN & Assets | Infraestrutura | `Wifi` | Entrega de arquivos estáticos e recursos |

### Categorias

- **Core** — Serviços fundamentais da plataforma
- **Análise** — Funcionalidades de diagnóstico e inteligência
- **Comunicação** — Notificações e alertas
- **Infraestrutura** — CDN, storage e rede

---

## 5. Sistema de Incidentes

### 5.1 Status de Incidente

| Status | Label | Cor | Descrição |
|--------|-------|-----|-----------|
| `investigating` | Investigando | Vermelho | Equipe investigando a causa |
| `identified` | Identificado | Amarelo | Causa identificada, correção em andamento |
| `monitoring` | Monitorando | Azul | Correção aplicada, monitorando estabilidade |
| `resolved` | Resolvido | Verde | Incidente totalmente resolvido |

### 5.2 Severidade

| Severidade | Label | Cor | Descrição |
|------------|-------|-----|-----------|
| `minor` | Menor | Amarelo | Impacto limitado, poucos usuários afetados |
| `major` | Maior | Laranja | Impacto significativo, funcionalidade degradada |
| `critical` | Crítico | Vermelho | Impacto total, serviço indisponível |

### 5.3 Timeline de Atualizações

Cada incidente possui uma timeline de atualizações com:
- **Timestamp** — Data/hora da atualização
- **Status** — Estado do incidente naquele momento
- **Mensagem** — Descrição detalhada do que foi feito

A timeline é exibida em ordem cronológica reversa (mais recente primeiro) e pode ser expandida/colapsada pelo usuário.

---

## 6. Barra de Uptime

### 6.1 Visualização

- **90 barras** representando os últimos 90 dias
- Cada barra tem cor baseada no status daquele dia
- Tooltip no hover mostra: data, status e % de uptime
- Cores: verde (operacional), amarelo (degradado), azul (manutenção), laranja (parcial), vermelho (total)

### 6.2 Cálculo de Uptime

- Uptime geral = média aritmética dos 90 dias
- Exibido com 3 casas decimais (ex: 99.982%)

---

## 7. Métricas de Confiabilidade

| Métrica | Descrição | Formato |
|---------|-----------|---------|
| **Uptime (90 dias)** | Disponibilidade média no período | `XX.XXX%` |
| **Tempo de Resposta** | Latência média da API | `<XXXms` |
| **Incidentes (30 dias)** | Quantidade de incidentes no último mês | Número inteiro |
| **MTTR** | Mean Time To Resolution — tempo médio de resolução | `~XhYYm` |

---

## 8. Schema SQL

### 8.1 Arquivo: `supabase/status_page_schema.sql`

### 8.2 Tabelas

#### `platform_services`
Serviços monitorados da plataforma.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único |
| `name` | TEXT | Nome do serviço |
| `description` | TEXT | Descrição do serviço |
| `category` | TEXT | Categoria (Core, Análise, etc.) |
| `icon` | TEXT | Nome do ícone Lucide |
| `status` | TEXT | Status atual (operational, degraded, etc.) |
| `sort_order` | INTEGER | Ordem de exibição |
| `is_visible` | BOOLEAN | Se o serviço aparece na página |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Última atualização (trigger automático) |

#### `platform_incidents`
Incidentes registrados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único |
| `title` | TEXT | Título do incidente |
| `status` | TEXT | Status atual (investigating, identified, monitoring, resolved) |
| `severity` | TEXT | Severidade (minor, major, critical) |
| `affected_services` | UUID[] | Array de IDs dos serviços afetados |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Última atualização (trigger automático) |
| `resolved_at` | TIMESTAMPTZ | Data de resolução (trigger automático quando status = resolved) |

#### `platform_incident_updates`
Timeline de atualizações de cada incidente.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único |
| `incident_id` | UUID (FK) | Referência ao incidente |
| `status` | TEXT | Status naquele momento |
| `message` | TEXT | Mensagem da atualização |
| `created_at` | TIMESTAMPTZ | Data da atualização |

#### `platform_maintenances`
Manutenções programadas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único |
| `title` | TEXT | Título da manutenção |
| `description` | TEXT | Descrição detalhada |
| `status` | TEXT | Status (scheduled, in_progress, completed, cancelled) |
| `affected_services` | UUID[] | Array de IDs dos serviços afetados |
| `scheduled_start` | TIMESTAMPTZ | Início programado |
| `scheduled_end` | TIMESTAMPTZ | Fim programado |
| `actual_start` | TIMESTAMPTZ | Início real |
| `actual_end` | TIMESTAMPTZ | Fim real |
| `created_at` | TIMESTAMPTZ | Data de criação |
| `updated_at` | TIMESTAMPTZ | Última atualização (trigger automático) |

#### `platform_uptime_daily`
Métricas diárias de uptime por serviço.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID (PK) | Identificador único |
| `service_id` | UUID (FK) | Referência ao serviço |
| `date` | DATE | Data da métrica |
| `status` | TEXT | Status predominante do dia |
| `uptime_percentage` | NUMERIC(6,3) | % de uptime (ex: 99.950) |
| `response_time_ms` | INTEGER | Tempo de resposta médio em ms |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Constraint:** `UNIQUE(service_id, date)` — uma entrada por serviço por dia.

### 8.3 Segurança (RLS)

- **Leitura pública:** Todas as 5 tabelas permitem `SELECT` para qualquer pessoa (incluindo anônimos)
- **Escrita restrita:** Nenhuma política de `INSERT/UPDATE/DELETE` para `authenticated` — apenas `service_role` pode modificar
- Isso garante que apenas o admin (via painel ou Edge Functions) pode alterar status e criar incidentes

### 8.4 Triggers

| Trigger | Tabela | Ação |
|---------|--------|------|
| `trg_platform_services_updated` | `platform_services` | Auto-update `updated_at` |
| `trg_platform_incidents_updated` | `platform_incidents` | Auto-update `updated_at` |
| `trg_platform_maintenances_updated` | `platform_maintenances` | Auto-update `updated_at` |
| `trg_incident_resolved` | `platform_incidents` | Auto-set `resolved_at` quando status muda para `resolved` |

### 8.5 Índices

| Índice | Tabela | Coluna(s) |
|--------|--------|-----------|
| `idx_incidents_status` | `platform_incidents` | `status` |
| `idx_incidents_created` | `platform_incidents` | `created_at DESC` |
| `idx_incident_updates_incident` | `platform_incident_updates` | `incident_id` |
| `idx_maintenances_status` | `platform_maintenances` | `status` |
| `idx_maintenances_scheduled` | `platform_maintenances` | `scheduled_start` |
| `idx_uptime_daily_service_date` | `platform_uptime_daily` | `service_id, date DESC` |

### 8.6 Seed Data

9 serviços iniciais inseridos automaticamente (ver seção 4).

---

## 9. SEO

| Propriedade | Valor |
|-------------|-------|
| **Title** | `Status da Plataforma \| Intentia` |
| **Path** | `/status` |
| **Description** | Acompanhe em tempo real o status de todos os serviços da Intentia. Transparência total sobre operabilidade, incidentes e manutenções programadas. |
| **Keywords** | status plataforma, uptime, incidentes, disponibilidade, SLA |
| **JSON-LD** | BreadcrumbList: Home → Status |
| **Sitemap** | Incluído com `changefreq: daily`, `priority: 0.6` |

---

## 10. Navegação

### Links para `/status`

| Local | Tipo |
|-------|------|
| **Header** | Menu dropdown "Empresa" → "Status" |
| **Footer** | Seção "Empresa" → "Status" |
| **Footer** | Links legais (bottom bar) → "Status" |
| **Sitemap** | `sitemap.xml` → `/status` |

---

## 11. Componentes Internos

### `UptimeBar`
Componente que renderiza a barra de uptime de 90 dias.

**Props:**
- `data: UptimeDay[]` — Array de 90 objetos com `date`, `status`, `uptime`

**Comportamento:**
- Cada dia é uma barra colorida proporcional
- Tooltip no hover com data, status e % de uptime
- Responsivo (barras se adaptam ao container)

### `IncidentCard`
Componente que renderiza um card de incidente com timeline expansível.

**Props:**
- `incident: Incident` — Objeto do incidente com `updates[]`

**Comportamento:**
- Mostra badges de status e severidade
- Exibe a atualização mais recente por padrão
- Botão "Ver histórico completo" expande a timeline
- Timeline com dots e linha vertical conectando atualizações

---

## 12. Tipos TypeScript

```typescript
type ServiceStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

interface Service {
  name: string;
  description: string;
  status: ServiceStatus;
  icon: React.ElementType;
  category: string;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
  updates: {
    timestamp: string;
    status: string;
    message: string;
  }[];
}

interface UptimeDay {
  date: string;
  status: ServiceStatus;
  uptime: number;
}
```

---

## 13. Arquivos Envolvidos

```
src/
├── pages/
│   └── Status.tsx                    # Página de status completa
├── components/
│   ├── Header.tsx                    # Link "Status" no menu Empresa
│   ├── Footer.tsx                    # Links "Status" na seção Empresa e bottom bar
│   ├── SEO.tsx                       # Componente SEO usado na página
│   ├── BackToHomeButton.tsx          # Botão voltar
│   └── BackToTop.tsx                 # Botão scroll to top
├── App.tsx                           # Rota /status com ForceLightMode

supabase/
└── status_page_schema.sql            # Schema SQL (5 tabelas, triggers, RLS, seed)

public/
└── sitemap.xml                       # URL /status adicionada

documentacao/
└── STATUS_PAGE.md                    # Este documento
```

---

## 14. Execução do Schema

Para ativar o sistema de status no banco de dados:

1. Acesse o **SQL Editor** do Supabase
2. Execute o conteúdo de `supabase/status_page_schema.sql`
3. Verifique que as 5 tabelas foram criadas:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_name LIKE 'platform_%';
   ```
4. Verifique os 9 serviços seed:
   ```sql
   SELECT name, category, status FROM platform_services ORDER BY sort_order;
   ```

---

## 15. Roadmap — Status Final

> **Todos os itens do roadmap foram implementados e deployados.**

| Item | Prioridade | Status | Deploy |
|------|-----------|--------|--------|
| Conectar página aos dados reais do Supabase | P1 | ✅ Implementado | Frontend |
| Adicionar tab "Status" no Admin Panel | P1 | ✅ Implementado | Frontend |
| Coleta automática de uptime diário | P2 | ✅ Implementado | ✅ Edge Function deployada |
| Notificação por email em incidentes críticos | P2 | ✅ Implementado | ✅ Edge Function deployada |
| RSS feed de incidentes | P3 | ✅ Implementado | ✅ Edge Function deployada |
| Gráfico de latência por serviço (30 dias) | P3 | ✅ Implementado | Frontend |
| Integração com monitoramento externo | P3 | ✅ Implementado | ✅ Edge Function deployada |
| Subscription para alertas por email | P3 | ✅ Implementado | Frontend + SQL |

---

## 16. Detalhes da Implementação

### P1: Dados Reais do Supabase
- **Hook:** `src/hooks/useStatusData.ts` — busca serviços, incidentes, manutenções, uptime e latência do Supabase
- **Status.tsx** refatorado para usar dados reais em vez de dados estáticos
- Métricas (uptime, MTTR, incidentes) calculadas dinamicamente
- Loading states e fallback para quando não há dados
- Mapeamento de ícones: string do banco → componente Lucide

### P1: Tab Status no Admin Panel
- **Componente:** `src/components/AdminStatusTab.tsx`
- 3 sub-abas: Serviços, Incidentes, Manutenções
- CRUD completo de serviços (criar, editar, excluir, alterar status)
- CRUD de incidentes com timeline de atualizações
- CRUD de manutenções programadas com controle de status
- Seleção de serviços afetados em incidentes e manutenções
- Stats resumidos no topo (operacionais, ativos, agendadas)

### P2: Coleta Automática de Uptime
- **Edge Function:** `supabase/functions/collect-uptime/index.ts`
- Lê status atual de cada serviço e incidentes/manutenções do dia
- Calcula uptime % baseado na severidade dos incidentes
- Upsert em `platform_uptime_daily` (UNIQUE por service_id + date)
- Chamada via cron diário (ver seção 19)

### P2: Notificação por Email
- **Edge Function:** `supabase/functions/notify-incident/index.ts`
- Notifica apenas incidentes critical/major
- Suporta Resend API como provedor de email
- Fallback: registra no `admin_audit_log` se email não configurado
- Template HTML responsivo com detalhes do incidente

### P3: RSS Feed
- **Edge Function:** `supabase/functions/status-rss/index.ts`
- Gera RSS 2.0 XML com incidentes dos últimos 90 dias
- Inclui últimas atualizações de cada incidente
- Cache de 5 minutos (`Cache-Control: max-age=300`)
- Link RSS exibido automaticamente na seção "Legenda de Status" da página `/status`

### P3: Gráfico de Latência
- Seção "Latência por Serviço" na página de Status (entre Métricas e Legenda)
- Usa Recharts (LineChart) com dados de `platform_uptime_daily.response_time_ms`
- Uma linha por serviço com cores distintas
- Tooltip com nome do serviço e valor em ms
- Legenda visual com cores correspondentes
- Só aparece quando há dados de latência disponíveis (preenchidos via `status-webhook`)

### P3: Integração com Monitoramento Externo
- **Edge Function:** `supabase/functions/status-webhook/index.ts`
- Aceita payloads de UptimeRobot, Checkly e formato genérico
- Autenticação via header `x-webhook-secret`
- Atualiza status do serviço e registra `response_time_ms`
- Match de serviço por nome (case-insensitive, partial match)

### P3: Subscription por Email
- **Schema:** `supabase/status_subscribers_schema.sql` — tabela `platform_status_subscribers`
- Formulário de inscrição na página de Status (seção "Receba alertas por email")
- Upsert por email (evita duplicatas)
- Campos: email, is_verified, verification_token, unsubscribe_token, is_active
- RLS: INSERT público, SELECT/UPDATE público (para verificação/cancelamento)

---

## 17. Edge Functions — URLs e Configuração

### URLs das Edge Functions (Produção)

| Função | URL | Acesso |
|--------|-----|--------|
| `collect-uptime` | `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/collect-uptime` | Cron/interno |
| `notify-incident` | `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/notify-incident` | Webhook DB/interno |
| `status-rss` | `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/status-rss` | Público (RSS) |
| `status-webhook` | `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/status-webhook` | Externo (UptimeRobot, Checkly) |

### Secrets Configurados (Settings → Edge Functions → Secrets)

| Secret | Usado por | Descrição |
|--------|-----------|-----------|
| `WEBHOOK_SECRET` | `status-webhook` | Token de autenticação para webhooks externos |
| `SMTP_HOST` | `notify-incident` | `resend` para Resend API, ou hostname SMTP |
| `SMTP_USER` | `notify-incident` | Usuário SMTP |
| `SMTP_PASS` | `notify-incident` | Senha SMTP ou API key do Resend |
| `NOTIFICATION_FROM_EMAIL` | `notify-incident` | Email remetente (ex: `status@intentia.com.br`) |
| `NOTIFICATION_TO_EMAILS` | `notify-incident` | Emails destinatários separados por vírgula |

> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` já estão disponíveis automaticamente — não precisam ser configurados.

### Verificação de JWT

Todas as 4 Edge Functions foram deployadas com **JWT verification desabilitada**:
- `collect-uptime` — chamada via cron externo
- `notify-incident` — chamada via webhook do banco de dados
- `status-rss` — acesso público (RSS feed)
- `status-webhook` — usa autenticação própria via header `x-webhook-secret`

---

## 18. Cron (collect-uptime) — Configurado

A função `collect-uptime` roda **automaticamente 1x por dia** via pg_cron do Supabase.

**Configuração ativa:**
- **Horário:** 23:55 UTC (20:55 Brasília)
- **Frequência:** Diária
- **Método:** pg_cron + pg_net (extensões habilitadas no Supabase)
- **Job name:** `collect-uptime-daily`

**SQL utilizado:**
```sql
SELECT cron.schedule(
  'collect-uptime-daily',
  '55 23 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/collect-uptime',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

**Comandos úteis:**
```sql
-- Ver jobs ativos
SELECT * FROM cron.job;

-- Ver execuções recentes
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Pausar o job
SELECT cron.unschedule('collect-uptime-daily');
```

---

## 19. Integração com Monitoramento Externo

### RSS Feed (Público)

O link RSS é exibido automaticamente na página `/status`, na seção "Legenda de Status".

**URL pública:**
```
https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/status-rss
```

Pode ser usado em leitores RSS, agregadores ou divulgado em documentação externa.

### UptimeRobot

1. Acesse **My Settings → Alert Contacts**
2. Clique **Add Alert Contact**
3. Tipo: **Webhook**
4. URL: `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/status-webhook`
5. Em **Custom HTTP Headers**, adicione:
   ```
   x-webhook-secret: <valor_definido_no_secret_WEBHOOK_SECRET>
   ```
6. Salve e vincule aos monitors desejados

**Payload recebido do UptimeRobot:**
```json
{
  "monitorFriendlyName": "API Principal",
  "alertType": 1,
  "responsetime": "145"
}
```

### Checkly

1. Acesse **Alerts → Alert Channels**
2. Clique **Add Channel → Webhook**
3. URL: `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/status-webhook`
4. Headers:
   ```
   x-webhook-secret: <valor_definido_no_secret_WEBHOOK_SECRET>
   ```
5. Salve e vincule aos checks desejados

**Payload recebido do Checkly:**
```json
{
  "check_name": "API Principal",
  "response_time": 145.2,
  "has_errors": false
}
```

### Formato Genérico (qualquer ferramenta)

Qualquer ferramenta de monitoramento pode enviar um POST com:

```bash
curl -X POST \
  https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/status-webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: <seu_token>" \
  -d '{
    "service_name": "API Principal",
    "status": "operational",
    "response_time_ms": 145
  }'
```

**Status aceitos:** `operational`, `degraded`, `partial_outage`, `major_outage`, `maintenance`

> **Nota:** O match de serviço é feito por nome (case-insensitive, partial match). O `service_name` enviado deve conter parte do nome cadastrado em `platform_services`.

---

## 20. Arquivos do Sistema de Status

```
src/
├── hooks/
│   └── useStatusData.ts              # Hook para dados reais do Supabase (serviços, incidentes, uptime, latência)
├── components/
│   └── AdminStatusTab.tsx            # Tab "Status Page" no Admin Panel (CRUD completo)
├── pages/
│   └── Status.tsx                    # Página pública /status (refatorada para dados reais)

supabase/
├── status_page_schema.sql            # Schema base (tabelas, triggers, índices, RLS read)
├── status_rls_fix.sql                # Policies de escrita para admin (INSERT/UPDATE/DELETE)
├── status_subscribers_schema.sql     # Tabela de subscribers para alertas por email
├── functions/
│   ├── collect-uptime/index.ts       # Edge Function: coleta diária de uptime
│   ├── notify-incident/index.ts      # Edge Function: notificação de incidentes críticos
│   ├── status-rss/index.ts           # Edge Function: RSS feed público
│   └── status-webhook/index.ts       # Edge Function: webhook para monitoramento externo
```

## 21. SQLs Executados (Ordem)

```
1. status_page_schema.sql             → Tabelas base (platform_services, platform_incidents, etc.)
2. status_rls_fix.sql                 → Policies de escrita para anon/authenticated
3. status_subscribers_schema.sql      → Tabela platform_status_subscribers
```

> Todos os SQLs e Edge Functions já foram executados/deployados no Supabase.
