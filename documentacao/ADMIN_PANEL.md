# Painel Administrativo — Intentia Strategy Hub

## 📊 Visão Geral

**Versão:** 3.0.0  
**Rota:** `/admin` (protegida) | `/admin/login` (login)  
**Acesso:** CNPJ + Senha (autenticação separada do Supabase Auth)  
**Sessão:** 4 horas com expiração automática  

O Painel Administrativo é uma área restrita ao founder/administrador da Intentia, com controle total sobre funcionalidades, planos e clientes da plataforma.

---

## 🔐 Autenticação

### Fluxo de Login

1. Acesse `/admin/login`
2. Informe o CNPJ (com máscara automática: `00.000.000/0000-00`)
3. Informe a senha
4. O sistema valida CNPJ + hash SHA-256 da senha contra a tabela `admin_users`
5. Sessão criada em `localStorage` com token e expiração de 4h

### Credenciais

| Campo | Valor |
|-------|-------|
| CNPJ | `64.999.***/0001-**` |
| Senha | `***********` |
| Role | `founder` |

### Segurança

- **Rate Limiting:** 5 tentativas erradas → bloqueio de 15 minutos
- **Sessão expira** automaticamente após 4 horas
- **Token único** gerado com `crypto.getRandomValues` (32 bytes)
- **Verificação periódica** da sessão a cada 60 segundos
- **Autenticação separada** do Supabase Auth — não interfere com sessões de clientes
- **Sem link público** — a rota `/admin/login` não é referenciada em nenhum lugar do site

---

## 🏗️ Arquitetura

### Arquivos Frontend

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/adminAuth.ts` | Validação de CNPJ, formatação, login/logout, gestão de sessão |
| `src/hooks/useAdminAuth.ts` | Hook React para estado da sessão admin |
| `src/hooks/useFeatureFlags.ts` | Hook para verificar disponibilidade de features por plano |
| `src/components/AdminProtectedRoute.tsx` | Guard de rota — redireciona para `/admin/login` se não autenticado |
| `src/pages/AdminLogin.tsx` | Tela de login (dark theme) |
| `src/pages/AdminPanel.tsx` | Painel principal com 5 abas (Features, Planos, Clientes, Status, Arquitetura) |

### Arquivos SQL

| Arquivo | Descrição |
|---------|-----------|
| `supabase/admin_schema.sql` | Schema completo: tabelas, triggers, seed data, RPC functions |
| `supabase/admin_rls_fix.sql` | Policies RLS para acesso `anon` (admin não usa Supabase Auth) |
| `supabase/admin_tenant_fix.sql` | Adiciona colunas `full_name` e `email` em `tenant_settings` |
| `supabase/auto_tenant_creation.sql` | Trigger automático para criar `tenant_settings` em novos signups |

### Rotas

| Rota | Componente | Proteção |
|------|-----------|----------|
| `/admin/login` | `AdminLogin` | Pública (redireciona para `/admin` se já autenticado) |
| `/admin` | `AdminPanel` | `AdminProtectedRoute` (redireciona para `/admin/login` se não autenticado) |

---

## 📋 Tabelas do Banco de Dados

### `admin_users`

Armazena os administradores da plataforma.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `cnpj` | TEXT | CNPJ único (somente dígitos) |
| `password_hash` | TEXT | Hash SHA-256 da senha |
| `name` | TEXT | Nome do admin |
| `role` | TEXT | `founder` / `admin` / `support` |
| `is_active` | BOOLEAN | Se a conta está ativa |
| `login_attempts` | INTEGER | Tentativas de login consecutivas |
| `locked_until` | TIMESTAMPTZ | Bloqueio até (após 5 tentativas) |
| `last_login_at` | TIMESTAMPTZ | Último login |

### `feature_flags`

Controle global de funcionalidades do sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `feature_key` | TEXT | Identificador único (ex: `url_heuristic_analysis`) |
| `feature_name` | TEXT | Nome legível (ex: "Diagnóstico Heurístico de URL") |
| `description` | TEXT | Descrição da funcionalidade |
| `category` | TEXT | Categoria (ver abaixo) |
| `status` | TEXT | Status atual (ver abaixo) |
| `status_message` | TEXT | Mensagem customizada (para manutenção/desenvolvimento) |
| `sort_order` | INTEGER | Ordem de exibição |

### `plan_features`

Mapeamento de features por plano.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `feature_key` | TEXT | FK → `feature_flags.feature_key` |
| `plan` | TEXT | `starter` / `professional` / `enterprise` |
| `is_enabled` | BOOLEAN | Se a feature está habilitada neste plano |
| `usage_limit` | INTEGER | Limite de uso (NULL = ilimitado) |
| `limit_period` | TEXT | Período do limite: `daily` / `weekly` / `monthly` / `unlimited` |

### `admin_audit_log`

Registro de ações administrativas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `admin_id` | UUID | FK → `admin_users.id` |
| `action` | TEXT | Ação realizada (ex: `change_plan`) |
| `target_table` | TEXT | Tabela afetada |
| `target_id` | TEXT | ID do registro afetado |
| `details` | JSONB | Detalhes da ação (ex: `{old_plan, new_plan}`) |

### `user_feature_overrides`

Override de features por usuário específico.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | PK |
| `user_id` | UUID | ID do usuário |
| `feature_key` | TEXT | FK → `feature_flags.feature_key` |
| `is_enabled` | BOOLEAN | Override: habilitado ou desabilitado |
| `reason` | TEXT | Motivo do override |
| `admin_id` | UUID | FK → `admin_users.id` (quem fez) |

---

## 🎛️ Painel — Aba Feature Flags

### Status de Features

| Status | Cor | Descrição |
|--------|-----|-----------|
| **Ativo** | 🟢 Verde | Funcionando normalmente |
| **Desativado** | 🔴 Vermelho | Não aparece para ninguém |
| **Em Desenvolvimento** | 🔵 Azul | Aparece com badge "Em breve" |
| **Manutenção** | 🟡 Âmbar | Aparece com aviso de manutenção |
| **Descontinuado** | ⚫ Cinza | Aparece com aviso de remoção |

### Categorias

| Categoria | Ícone | Cor | Features |
|-----------|-------|-----|----------|
| **Análise** | Target | Laranja | Heurística, Dados Estruturados, HTML Snapshot, Progress Tracker |
| **Inteligência Artificial** | Sparkles | Roxo | Análise IA, Benchmark IA, API Keys |
| **Benchmark** | BarChart3 | Verde | SWOT, Gap Analysis |
| **Tático** | Crosshair | Rosa | Plano Tático, Templates, Playbook |
| **Exportação** | Download | Esmeralda | PDF, CSV, Resultados IA |
| **Social / Marca** | Share2 | Pink | Brand Guide, Brand Posts |
| **Geral** | Layers | Sky | Scores, Insights, Alertas, Públicos, Notificações, Dark Mode, Backup |
| **Administração** | ShieldCheck | Vermelho | (reservado para futuras features admin) |

### 25 Features Registradas

| # | Feature Key | Nome | Categoria |
|---|------------|------|-----------|
| 1 | `url_heuristic_analysis` | Diagnóstico Heurístico de URL | Análise |
| 2 | `structured_data_viewer` | Visualizador de Dados Estruturados | Análise |
| 3 | `structured_data_generator` | Gerador de Dados Estruturados | Análise |
| 4 | `html_snapshot` | HTML Snapshot | Análise |
| 5 | `progress_tracker` | Progress Tracker | Análise |
| 6 | `ai_project_analysis` | Análise por IA de Projetos | IA |
| 7 | `ai_benchmark_enrichment` | Enriquecimento de Benchmark por IA | IA |
| 8 | `ai_api_keys` | Configuração de API Keys | IA |
| 9 | `benchmark_swot` | Benchmark Competitivo SWOT | Benchmark |
| 10 | `benchmark_gap_analysis` | Gap Analysis Competitivo | Benchmark |
| 11 | `tactical_plan` | Plano Tático por Canal | Tático |
| 12 | `tactical_templates` | Templates Táticos por Nicho | Tático |
| 13 | `tactical_playbook` | Playbook Gamificado | Tático |
| 14 | `export_pdf` | Relatórios PDF | Exportação |
| 15 | `export_csv` | Exportação CSV | Exportação |
| 16 | `export_ai_results` | Exportação de Resultados IA | Exportação |
| 17 | `brand_guide` | Brand Guide | Social |
| 18 | `brand_posts` | Posts de Marca | Social |
| 19 | `channel_scores` | Score por Canal de Mídia | Geral |
| 20 | `strategic_insights` | Insights Estratégicos | Geral |
| 21 | `strategic_alerts` | Alertas Estratégicos | Geral |
| 22 | `audiences` | Públicos-Alvo | Geral |
| 23 | `notifications` | Notificações | Geral |
| 24 | `dark_mode` | Tema Escuro | Geral |
| 25 | `backup_system` | Backup & Segurança | Geral |

### Funcionalidades da Aba

- **Cards agrupados por categoria** com ícone, cor e contador de features ativas
- **Expandir/Colapsar** categorias individualmente ou todas de uma vez
- **Alterar status** de qualquer feature via dropdown
- **Mensagem de status** editável (para manutenção/desenvolvimento/descontinuado)
- **Pills de plano** (S/P/E) clicáveis para toggle rápido de acesso por plano
- **Filtros** por categoria, status e busca por nome/key
- **Feature key** visível em monospace para referência técnica

---

## 💳 Painel — Aba Controle de Planos

### Planos

| Plano | Preço | Features Habilitadas |
|-------|-------|---------------------|
| **Starter** | Grátis | Heurística (5/mês), Dados Estruturados (viewer), Benchmark SWOT (5/mês), Scores, Insights, Alertas, Públicos (5), Notificações, Dark Mode |
| **Professional** | R$97/mês | Tudo do Starter + IA, Benchmark ilimitado, Tático, Exportação, Brand, Backup, ilimitado |
| **Enterprise** | Sob consulta | Tudo do Professional + API, multi-user, SLA dedicado |

### Funcionalidades da Aba

- **Visão por plano** — card para cada plano com lista de todas as features agrupadas por categoria
- **Switch** para habilitar/desabilitar cada feature no plano
- **Input de limite editável** — campo numérico inline para definir `usage_limit` (vazio = sem limite, -1 = ilimitado)
- **Select de período** — dropdown inline para `limit_period` (Mensal, Diário, Total, Sem período)
- **Badge de status** da feature (ativo, desativado, etc.)
- **Contador** de features habilitadas vs total
- **Categorias colapsáveis** dentro de cada plano
- **Expandir/Colapsar** todos os planos e categorias

---

## 👥 Painel — Aba Clientes

### Dados Exibidos

| Campo | Origem |
|-------|--------|
| Nome | `tenant_settings.full_name` (preenchido via trigger ou signup) |
| Email | `tenant_settings.email` |
| Empresa | `tenant_settings.company_name` |
| Plano | `tenant_settings.plan` |
| Cadastro | `tenant_settings.created_at` |
| Análises | `tenant_settings.analyses_used` / `monthly_analyses_limit` |

### Funcionalidades da Aba

- **Lista expandível** — clique no cliente para ver detalhes
- **Alterar plano** do cliente via botões (Starter/Professional/Enterprise)
- **Alteração segura** — usa RPC `admin_change_user_plan()` que bypassa o trigger `prevent_plan_escalation`
- **Limites & Uso unificados** — seção única com:
  - 🔵 **Limites do tenant** (destacados em azul): análises usadas, limite mensal de análises, máx. públicos-alvo — editáveis por usuário
  - 🟢 **Limites por feature do plano** (em verde): input de `usage_limit` + select de `limit_period` para cada feature habilitada — alterações afetam todos os usuários do plano
  - **Legenda de cores** explicando a diferença entre limites do usuário e do plano
  - **Ações rápidas** no header: Zerar análises, Tudo ilimitado, Padrão Starter
- **Controle de features por cliente** — switches individuais para override de features (usando `user_feature_overrides`)
- **Busca** por empresa, nome ou email
- **Filtro** por plano
- **Audit log** — toda alteração de plano é registrada em `admin_audit_log`

### Novos Clientes Aparecem Automaticamente

| Fluxo | Mecanismo |
|-------|-----------|
| **Auth.tsx (Starter)** | `signUp` → trigger `on_auth_user_created` cria `tenant_settings` + Auth.tsx faz `upsert` como fallback |
| **Subscribe.tsx (Professional)** | `signUp` → trigger cria com starter → Subscribe.tsx sobrescreve com `plan: professional` |
| **Qualquer fluxo futuro** | Trigger `on_auth_user_created` garante que o registro existe |

---

## 🔧 RPC Functions

### `admin_change_user_plan(p_admin_cnpj, p_target_user_id, p_new_plan)`

Altera o plano de um usuário de forma segura.

- **SECURITY DEFINER** — bypassa o trigger `prevent_plan_escalation`
- Verifica que o admin existe e está ativo
- Valida o plano (starter/professional/enterprise)
- Atualiza `plan` e `monthly_analyses_limit` (starter=5, pro/enterprise=-1)
- Registra a ação no `admin_audit_log`

### `check_admin_login_attempts(p_cnpj)`

Verifica se o admin pode tentar login (não está bloqueado).

### `increment_admin_login_attempts(p_cnpj)`

Incrementa tentativas. Bloqueia por 15 min após 5 tentativas.

### `reset_admin_login_attempts(p_cnpj)`

Reseta tentativas e registra `last_login_at` após login bem-sucedido.

### `handle_new_user()` (Trigger)

Cria `tenant_settings` automaticamente quando um novo usuário é criado no `auth.users`.

---

## 🛡️ RLS Policies

### Leitura (SELECT)

| Tabela | `authenticated` | `anon` |
|--------|----------------|--------|
| `feature_flags` | ✅ | ✅ |
| `plan_features` | ✅ | ✅ |
| `tenant_settings` | ✅ (todas) | ✅ (todas) |
| `admin_users` | ✅ | ✅ |

### Escrita (UPDATE/INSERT)

| Tabela | `authenticated` | `anon` |
|--------|----------------|--------|
| `feature_flags` | ✅ UPDATE | ✅ UPDATE |
| `plan_features` | ✅ UPDATE | ✅ UPDATE |
| `tenant_settings` | Via RPC | Via RPC |
| `admin_audit_log` | ✅ INSERT | ✅ INSERT |

> **Nota:** Em produção, as policies de escrita devem ser restritas a `service_role` e as operações admin devem passar por Edge Functions.

---

## 📦 Ordem de Execução dos SQLs

Para configurar o painel admin do zero:

```
1. admin_schema.sql        → Tabelas, triggers, seed data (25 features + 3 planos)
2. admin_rls_fix.sql       → Policies anon para leitura/escrita
3. admin_tenant_fix.sql    → Colunas full_name/email em tenant_settings
4. auto_tenant_creation.sql → Trigger automático + backfill de usuários existentes
```

---

## 🔮 Próximos Passos

### ✅ Prioridade Alta — Sincronização & Gestão (Concluído)

- [x] **Sincronizar Feature Flags com o sistema do usuário** — O componente `FeatureGate` (`src/components/FeatureGate.tsx`) foi criado e integrado em todas as páginas protegidas (Projects, Insights, Benchmark, Audiences, Alerts, TacticalPlan). Quando o admin altera o status de uma feature (manutenção, desativado, em desenvolvimento, descontinuado), o usuário vê uma tela de bloqueio com ícone, badge e mensagem correspondente ao status.

- [x] **Sincronizar Controle de Planos com o sistema** — O hook `useFeatureFlags` (`src/hooks/useFeatureFlags.ts`) consulta `feature_flags`, `plan_features` e `user_feature_overrides` para verificar o acesso real do usuário. A prioridade de verificação é: status global → override por usuário → acesso do plano. Features bloqueadas pelo plano exibem tela de upgrade.

- [x] **Adicionar controle de features por cliente na aba Clientes** — Na aba "Clientes" do admin, cada cliente expandido agora mostra switches individuais para cada feature. O admin pode habilitar/desabilitar features independente do plano (usando `user_feature_overrides`). Overrides são indicados com badge roxo e podem ser removidos para voltar ao padrão do plano.

### Arquivos Criados/Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/components/FeatureGate.tsx` | **Novo** — Componente wrapper que verifica feature flags e exibe fallback visual |
| `src/hooks/useFeatureFlags.ts` | **Atualizado** — Adicionado suporte a `user_feature_overrides` com prioridade: global → override → plano |
| `src/pages/AdminPanel.tsx` | **Atualizado** — Carrega overrides, funções toggle/remove, UI interativa na aba Clientes |
| `src/pages/Projects.tsx` | **Atualizado** — Integrado `FeatureGate` com key `url_heuristic_analysis` |
| `src/pages/Insights.tsx` | **Atualizado** — Integrado `FeatureGate` com key `strategic_insights` |
| `src/pages/Benchmark.tsx` | **Atualizado** — Integrado `FeatureGate` com key `benchmark_swot` |
| `src/pages/Audiences.tsx` | **Atualizado** — Integrado `FeatureGate` com key `audiences` |
| `src/pages/Alerts.tsx` | **Atualizado** — Integrado `FeatureGate` com key `strategic_alerts` |
| `src/pages/TacticalPlan.tsx` | **Atualizado** — Integrado `FeatureGate` com key `tactical_plan` |

### Mapeamento Feature Key → Página

| Feature Key | Página |
|-------------|--------|
| `url_heuristic_analysis` | `/projects` |
| `strategic_insights` | `/insights` |
| `benchmark_swot` | `/benchmark` |
| `audiences` | `/audiences` |
| `strategic_alerts` | `/alertas` |
| `tactical_plan` | `/tactical` |

### 🟡 Melhorias Futuras

- [ ] Migrar policies de escrita para `service_role` + Edge Functions
- [ ] Adicionar aba de Audit Log no painel (visualizar ações realizadas)
- [ ] Dashboard de métricas no admin (signups, análises, conversões)
- [ ] Notificações admin (novo signup, upgrade de plano, etc.)
- [x] Gestão de planos com limites editáveis por feature/plano (v3.0.0)
