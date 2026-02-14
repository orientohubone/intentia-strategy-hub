---
auto_execution_mode: 2
description: Workflow para implementar novas funcionalidades no Admin Panel
---

# Admin Panel — Arquitetura e Workflow de Implementação

## Arquitetura Fundamental

O Admin Panel usa autenticação **separada** do Supabase Auth (CNPJ + password com SHA-256).
Isso significa que o admin **NÃO tem JWT do Supabase Auth** — portanto, qualquer query direta
via `supabase.from("tabela")` será bloqueada pelo RLS.

### Regra de Ouro
> **NUNCA use `supabase` client direto no Admin Panel para acessar dados.**
> **SEMPRE use a Edge Function `admin-api` via `adminApi.ts`.**

### Fluxo de Dados

```
Frontend (AdminPanel.tsx / componentes de tab)
  → adminApi.ts (fetch com x-admin-token + apikey)
    → Edge Function admin-api/index.ts (valida admin_id, usa service_role)
      → Supabase DB (bypassa RLS)
```

### Arquivos-Chave

| Arquivo | Função |
|---------|--------|
| `supabase/functions/admin-api/index.ts` | Edge Function — todas as actions do admin (service_role) |
| `src/lib/adminApi.ts` | Funções frontend que chamam a Edge Function |
| `src/lib/adminAuth.ts` | Login/logout, validação/formatação CNPJ, sessão |
| `src/hooks/useAdminAuth.ts` | Hook de sessão admin (state + logout) |
| `src/components/AdminProtectedRoute.tsx` | Route guard para /admin |
| `src/pages/AdminLogin.tsx` | Tela de login admin (dark theme, CNPJ mask) |
| `src/pages/AdminPanel.tsx` | Página principal — header, stats, 6 tabs |
| `src/components/AdminStatusTab.tsx` | Tab Status Page (serviços, incidentes, manutenções) |
| `src/components/AdminArchitectureTab.tsx` | Tab Arquitetura (diagrama visual do sistema) |
| `src/components/SupportDashboard.tsx` | Tab Atendimentos (tickets, mensagens, chat) |

### Autenticação Admin

- Login via CNPJ + password → SHA-256 hash → Edge Function `admin_login`
- Sessão em `localStorage` (`intentia_admin_session`) com 4h de expiração
- Token enviado via header `x-admin-token` em todas as requests
- `admin_id` enviado no body para validação do admin ativo
- Rate limiting: 5 tentativas falhas → 15min bloqueio (via SQL functions)
- Roles: `founder`, `admin`, `support`

### Rotas

| Rota | Componente | Proteção |
|------|-----------|----------|
| `/admin/login` | `AdminLogin.tsx` | Pública (dark theme) |
| `/admin` | `AdminPanel.tsx` | `AdminProtectedRoute` |

---

## As 6 Tabs do Admin Panel

### Tab 1: Feature Flags (`features`)
**Componente:** Inline em `AdminPanel.tsx` (linhas 541-699)
**Função:** Gerenciar o status global de cada funcionalidade do sistema.

**Funcionalidades:**
- Lista todas as features agrupadas por categoria (10 categorias)
- Cada feature mostra: nome, descrição, status dot, pills S/P/E (plano), seletor de status
- 5 estados: `active`, `disabled`, `development`, `maintenance`, `deprecated`
- Mensagem de status para features em manutenção/desenvolvimento/deprecated
- Expandir/colapsar categorias
- Filtros: busca, categoria, status
- Toggle rápido de plano (S/P/E pills) direto na lista

**Actions usadas:**
- `adminListFeatures()` → `list_features`
- `adminUpdateFeatureStatus(featureKey, status)` → `update_feature_status`
- `adminUpdateFeatureMessage(featureKey, message)` → `update_feature_message`
- `adminTogglePlanFeature(featureKey, plan, isEnabled)` → `toggle_plan_feature`

**Categorias registradas:**
`analysis`, `ai`, `benchmark`, `tactical`, `general`, `export`, `social`, `admin`, `integrations`, `seo_performance`

---

### Tab 2: Controle de Planos (`plans`)
**Componente:** Inline em `AdminPanel.tsx` (linhas 704-911)
**Função:** Gerenciar quais features estão habilitadas em cada plano e seus limites.

**Funcionalidades:**
- 3 cards colapsáveis (Starter, Professional, Enterprise)
- Cada card mostra: stats (ativas/bloqueadas/usuários), features agrupadas por categoria
- Switch on/off por feature por plano
- Limite de uso editável (número + período: mensal/diário/total)
- Expandir/colapsar categorias dentro de cada plano

**Actions usadas:**
- `adminListPlanFeatures()` → `list_plan_features`
- `adminTogglePlanFeature(featureKey, plan, isEnabled)` → `toggle_plan_feature`
- `adminUpdatePlanLimit(featureKey, plan, limit, period)` → `update_plan_limit`

---

### Tab 3: Clientes (`users`)
**Componente:** Inline em `AdminPanel.tsx` (linhas 928-1294)
**Função:** Gerenciar usuários, planos, limites e overrides de features.

**Funcionalidades:**
- Lista de todos os tenants (empresa, nome, email, plano, badge)
- Expandir usuário para ver detalhes:
  - **Dados:** nome, email, data cadastro, análises usadas
  - **Alterar plano:** botões Starter/Professional/Enterprise
  - **Limites & Uso:** análises usadas, limite mensal, máx. públicos-alvo (editáveis inline)
  - **Ações rápidas:** zerar análises, tudo ilimitado, padrão Starter
  - **Controle de Features:** grid com switch por feature, override individual
  - **Overrides:** badge purple quando ativo, botão "override ✕" para remover
- Filtros: busca (empresa/nome/email), plano

**Actions usadas:**
- `adminListUsers()` → `list_users`
- `adminUpdateUserPlan(userId, newPlan, adminCnpj)` → `update_user_plan`
- `adminUpdateUserLimits(userId, field, value)` → `update_user_limits`
- `adminListOverrides()` → `list_overrides`
- `adminUpsertOverride(userId, featureKey, isEnabled, reason)` → `upsert_override`
- `adminDeleteOverride(userId, featureKey)` → `delete_override`

---

### Tab 4: Status Page (`status`)
**Componente:** `src/components/AdminStatusTab.tsx`
**Função:** Gerenciar a página de status pública da plataforma.

**Funcionalidades:**
- **Serviços:** CRUD de serviços da plataforma (nome, descrição, categoria, ícone, status, visibilidade, ordem)
  - Status: `operational`, `degraded`, `partial_outage`, `major_outage`, `maintenance`
- **Incidentes:** CRUD de incidentes (título, status, severidade, serviços afetados)
  - Status: `investigating`, `identified`, `monitoring`, `resolved`
  - Severidade: `minor`, `major`, `critical`
  - Updates de incidente: timeline de atualizações com status e mensagem
- **Manutenções:** CRUD de manutenções programadas (título, descrição, serviços afetados, datas)
  - Status: `scheduled`, `in_progress`, `completed`

**Actions usadas:**
- `adminListServices()` → `list_services`
- `adminCreateService(service)` → `create_service`
- `adminUpdateService(id, updates)` → `update_service`
- `adminDeleteService(id)` → `delete_service`
- `adminListIncidents()` → `list_incidents`
- `adminCreateIncident(incident)` → `create_incident`
- `adminUpdateIncident(id, updates)` → `update_incident`
- `adminDeleteIncident(id)` → `delete_incident`
- `adminListIncidentUpdates(incidentId)` → `list_incident_updates`
- `adminAddIncidentUpdate(incidentId, status, message)` → `add_incident_update`
- `adminListMaintenances()` → `list_maintenances`
- `adminCreateMaintenance(maintenance)` → `create_maintenance`
- `adminUpdateMaintenance(id, updates)` → `update_maintenance`
- `adminDeleteMaintenance(id)` → `delete_maintenance`

**Tabelas Supabase:**
`platform_services`, `platform_incidents`, `platform_incident_updates`, `platform_maintenances`

---

### Tab 5: Arquitetura (`architecture`)
**Componente:** `src/components/AdminArchitectureTab.tsx`
**Função:** Diagrama visual interativo da arquitetura do sistema.

**Funcionalidades:**
- Visualização do stack tecnológico completo
- Diagrama de fluxo: Frontend → Supabase → DB
- Mapa de features por categoria com ícones
- Mapa de planos com features habilitadas
- Diagrama de segurança (RLS, Auth, service_role)
- Zoom in/out, expand/collapse seções
- Não faz chamadas à API — é puramente visual/estático

**Actions usadas:** Nenhuma (componente estático)

---

### Tab 6: Atendimentos (`support`)
**Componente:** `src/components/SupportDashboard.tsx`
**Função:** Gerenciar chamados de suporte dos clientes.

**Funcionalidades:**
- Lista de tickets com dados enriquecidos (nome, email, empresa, avatar do cliente)
- Filtros: status, prioridade, categoria, busca
- Selecionar ticket → ver detalhes + mensagens
- Enviar mensagem como admin (atualiza first_response_at automaticamente)
- Alterar status do ticket (aberto → em_andamento → resolvido etc.)
- Chat dialog (SupportChatDialog) para conversa em tempo real
- Contagem de mensagens e última mensagem por ticket
- SLA status: on_track, due_soon, overdue, resolved

**Actions usadas:**
- `adminListSupportTickets()` → `list_support_tickets`
- `adminListSupportMessages(ticketId)` → `list_support_messages`
- `adminSendSupportMessage(ticketId, message)` → `send_support_message`
- `adminUpdateTicketStatus(ticketId, status)` → `update_ticket_status`
- `adminAssignTicket(ticketId, assignedTo)` → `assign_ticket`

**Tabelas Supabase:**
`support_tickets`, `support_ticket_messages`, `support_categories`

---

## Header e Stats Globais

O header do AdminPanel mostra:
- Logo + badge de role (Founder/Admin/Support)
- Botão Atualizar (recarrega todos os dados)
- ThemeToggle (dark/light)
- Botão Sair (logout)

Stats cards (4):
- Features Ativas (X ativas / Y desativadas / Z em dev)
- Clientes (total / starter / pro / enterprise)
- Total Features (N features / M categorias)
- Planos (3: Starter · Professional · Enterprise)

---

## Checklist para Implementar Nova Feature no Admin

### 1. Adicionar Action na Edge Function

Arquivo: `supabase/functions/admin-api/index.ts`

```typescript
if (action === "minha_nova_action") {
  const { data, error } = await supabase
    .from("minha_tabela")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return jsonResponse({ error: error.message }, 500);
  await auditLog(supabase, adminId, "minha_nova_action", "minha_tabela", "all", {});
  return jsonResponse({ data });
}
```

**Regras:**
- A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` → bypassa RLS
- Pode acessar `auth.users` via `supabase.auth.admin.getUserById()`
- Sempre retorne `jsonResponse({ data })` ou `jsonResponse({ error }, status)`
- Adicione `auditLog()` para ações de escrita (insert/update/delete)
- Coloque a action ANTES do `return jsonResponse({ error: "Unknown action" })` no final

### 2. Adicionar Função Frontend em adminApi.ts

Arquivo: `src/lib/adminApi.ts`

```typescript
export async function adminMinhaNovaAction(param1: string) {
  return callAdminApi("minha_nova_action", { param1 });
}
```

### 3. Usar no Componente Admin

Se for uma tab nova, criar componente em `src/components/Admin[NomeTab].tsx`.
Se for extensão de tab existente, editar o componente correspondente.

```typescript
import { adminMinhaNovaAction } from "@/lib/adminApi";

const loadData = async () => {
  const result = await adminMinhaNovaAction("valor");
  if (result.error) {
    toast.error(result.error);
    return;
  }
  setData(result.data);
};
```

### 4. Se for Tab Nova — Registrar no AdminPanel.tsx

```typescript
// 1. Importar componente
import MinhaNovaTab from "@/components/AdminMinhaNovaTab";

// 2. Adicionar ao type do activeTab (linha 164)
const [activeTab, setActiveTab] = useState<"features" | "plans" | "users" | "status" | "architecture" | "support" | "minha_tab">("features");

// 3. Adicionar botão na barra de tabs (linha 453-473)
{ key: "minha_tab" as const, label: "Minha Tab", icon: MeuIcone },

// 4. Renderizar componente (após as outras tabs)
{activeTab === "minha_tab" && <MinhaNovaTab />}
```

### 5. Deploy da Edge Function

```bash
supabase functions deploy admin-api
```

### 6. Atualizar este Workflow

Adicionar a nova tab na seção "As 6 Tabs do Admin Panel" acima.

---

## Actions Completas na Edge Function

### Auth (sem token)
- `admin_login` — Login com CNPJ + hash
- `check_login_attempts` — Verificar bloqueio

### Feature Flags
- `list_features` — Lista todas as features com status e categoria
- `update_feature_status` — Altera status (active/disabled/development/maintenance/deprecated)
- `update_feature_message` — Define mensagem de status

### Plan Features
- `list_plan_features` — Lista mapeamento feature × plano
- `toggle_plan_feature` — Habilita/desabilita feature em um plano
- `update_plan_limit` — Define limite de uso e período

### Users / Tenant
- `list_users` — Lista todos os tenants (user_id, company, plan, email, limites)
- `update_user_plan` — Altera plano do usuário (via RPC admin_change_user_plan)
- `update_user_limits` — Altera campo específico do tenant (analyses_used, monthly_analyses_limit, max_audiences)

### User Feature Overrides
- `list_overrides` — Lista todos os overrides ativos
- `upsert_override` — Cria/atualiza override para usuário+feature
- `delete_override` — Remove override (volta ao padrão do plano)

### Services (Status Page)
- `list_services` — Lista serviços da plataforma
- `create_service` — Cria serviço
- `update_service` — Atualiza serviço
- `delete_service` — Remove serviço

### Incidents
- `list_incidents` — Lista incidentes (últimos 20)
- `create_incident` — Cria incidente + update inicial
- `update_incident` — Atualiza incidente
- `delete_incident` — Remove incidente + updates
- `list_incident_updates` — Lista updates de um incidente
- `add_incident_update` — Adiciona update + atualiza status do incidente

### Maintenances
- `list_maintenances` — Lista manutenções (últimas 20)
- `create_maintenance` — Cria manutenção
- `update_maintenance` — Atualiza manutenção
- `delete_maintenance` — Remove manutenção

### Support Tickets
- `list_support_tickets` — Lista tickets enriquecidos (email, nome, empresa, avatar, categoria, contagem de mensagens, SLA)
- `list_support_messages` — Lista mensagens de um ticket
- `send_support_message` — Envia mensagem como admin (atualiza first_response_at e status)
- `update_ticket_status` — Atualiza status (marca resolved_at se resolvido)
- `assign_ticket` — Atribui ticket a um admin

---

## Erros Comuns e Soluções

### "permission denied for table users"
**Causa:** RLS policy, view ou FK faz `SELECT` em `auth.users`.
**Solução:** 
- Nunca crie policies com `EXISTS (SELECT 1 FROM auth.users ...)`
- Nunca crie views que fazem JOIN com `auth.users` acessíveis por `authenticated`
- Nunca crie FKs de tabelas `public.*` para `auth.users`
- Use a Edge Function com `service_role` para acessar dados de `auth.users`

### "Sessão admin expirada"
**Causa:** Token expirou (4h) ou localStorage limpo.
**Solução:** Redirecionar para `/admin/login`.

### Admin não vê dados que o cliente criou
**Causa:** O admin não tem JWT do Supabase Auth, então RLS bloqueia.
**Solução:** Migrar a query para usar `adminApi` → Edge Function com `service_role`.

### "Unknown action: xxx"
**Causa:** Action não registrada na Edge Function ou deploy não feito.
**Solução:** Verificar se a action existe em `admin-api/index.ts` e fazer deploy.

---

## RLS — Regras Importantes

1. **Nunca** crie policies que fazem `SELECT` em `auth.users` — causa "permission denied"
2. **Nunca** crie FKs de tabelas `public.*` para `auth.users` — causa o mesmo erro
3. Views que acessam `auth.users` devem ser `SECURITY DEFINER` e acessíveis apenas por `service_role`
4. O admin panel acessa tudo via Edge Function (`service_role`) — não precisa de policies especiais
5. Policies de tabelas de suporte devem usar apenas `auth.uid() = user_id` para o cliente
6. Tabelas admin (`admin_users`, `admin_audit_log`, `user_feature_overrides`) são write-only via `service_role`
7. Tabelas públicas (`feature_flags`, `plan_features`) são readable por `authenticated` (para o hook `useFeatureFlags`)