---
title: TIA & FloatingChat — Documentação Completa
summary: Arquitetura, full context, histórico multi-conversa, design system, edge function e fluxo conversacional
updated: 2026-02-21
version: 3.0
---

## Visão Geral

A **Tia** é a assistente virtual da plataforma **Intentia**. Ela opera em três modos dentro do FloatingChat:

1. **Assistente Guiada** — navegação passo a passo pelo onboarding e funcionalidades da plataforma.
2. **Falar com a Tia** — chat conversacional com linguagem natural, contexto completo da plataforma e respostas em markdown.
3. **Chat ao Vivo** — suporte humano em tempo real (Pro+).

A Tia está disponível em **todos os planos** (Starter, Professional, Enterprise). Usuários Pro+ também têm acesso ao Chat ao Vivo.

---

## Arquitetura

```
┌─────────────────────┐     ┌──────────────────────────┐
│   FloatingChat.tsx   │────▶│  supabase.functions.invoke│
│   (Frontend React)   │     │  ("assistant-ia")         │
└─────────────────────┘     └──────────┬───────────────┘
         ▲                             │
         │                             ▼
         │                  ┌──────────────────────┐
         │                  │  Edge Function        │
         │                  │  assistant-ia/index.ts│
         │                  └──────────┬───────────┘
         │                             │
         │         ┌───────────────────┼───────────────────┐
         │         ▼                   ▼                   ▼
         │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │  │ Supabase DB  │  │ user_api_    │  │ Gemini API   │
         │  │ (22 queries  │  │ keys         │  │ (LLM)        │
         │  │  paralelas)  │  │              │  │              │
         │  └──────────────┘  └──────────────┘  └──────────────┘
         │                             │
         └─────────────────────────────┘
                   answer (markdown)
```

---

## Frontend — FloatingChat.tsx

### Design System

#### Aba Acoplada (Top Tab)
- Elemento centralizado no topo do dialog, **acima** do header gradiente.
- Fundo `#0b0d11` com `border-radius: 12px 12px 0 0`.
- Contém o logo `tia-branco-ponto-laranja.svg` + indicador "Online" (ponto verde pulsante).
- **Curvas de acoplamento** nas extremidades inferiores usando `radial-gradient` invertido:
  - Orelha esquerda: `radial-gradient(circle at 0% 0%, transparent 12px, #0b0d11 12px)`
  - Orelha direita: `radial-gradient(circle at 100% 0%, transparent 12px, #0b0d11 12px)`
- A altura da aba (`TAB_HEIGHT = 28px`) é incluída no cálculo de posicionamento do painel.

#### Header Gradiente
- `bg-gradient-to-r from-primary to-orange-500` com texto branco.
- Título dinâmico conforme o modo ativo.

#### Toggle de Modo (3 abas)
- **Guiada** — texto "Guiada", fundo branco quando ativo.
- **Tia** — logo `tia-branco-ponto-laranja.svg` (h-3), fundo `#0b0d11` quando ativo.
- **Chat ao Vivo** — ícone Activity + texto, fundo branco quando ativo.
- Container: `rounded-full border border-white/30 bg-white/10`.

#### Botão Flutuante
- Arrastável via mouse events (drag & drop).
- `h-14 w-14 rounded-full bg-primary shadow-lg`.
- Badge de mensagens não lidas (Pro+).
- Alterna ícone: `MessageCircle` (fechado) / `ChevronDown` (aberto).

### Posicionamento Dinâmico do Dialog

O painel se posiciona automaticamente baseado na posição do botão:

- **Eixo Y**: abre acima ou abaixo do botão conforme espaço disponível.
- **Eixo X**: alinhamento dinâmico baseado na metade da tela:
  - Botão na **metade esquerda** → borda esquerda do dialog alinha com borda esquerda do botão.
  - Botão na **metade direita** → borda direita do dialog alinha com borda direita do botão.
- **Clamp**: o painel nunca sai da viewport (`VIEWPORT_PADDING = 8px`).
- **TAB_HEIGHT**: os 28px da aba são incluídos no cálculo de espaço disponível e posição.

```typescript
const buttonCenterX = buttonPosition.x + BUTTON_SIZE / 2;
const isButtonOnRight = buttonCenterX > viewportSize.width / 2;
const alignedLeft = isButtonOnRight
  ? buttonPosition.x + BUTTON_SIZE - panelWidth   // borda direita alinhada
  : buttonPosition.x;                              // borda esquerda alinhada
```

### Histórico Multi-Conversa

Sistema completo de gerenciamento de múltiplas conversas persistidas em localStorage.

#### Tipos
```typescript
type TiaConversation = {
  id: string;        // conv_{timestamp}_{random}
  title: string;     // derivado da primeira mensagem do usuário
  messages: TiaMessage[];
  createdAt: string;
  updatedAt: string;
};
```

#### Chaves localStorage
| Chave | Conteúdo |
|---|---|
| `intentia_tia_conversations` | Array de `TiaConversation` |
| `intentia_tia_active_conv` | ID da conversa ativa |
| `intentia_tia_mode` | Modo ativo: `guided` / `ask` / `live` |

#### Funcionalidades
- **Nova Conversa** (botão `+` no header): arquiva a conversa atual e inicia uma nova.
- **Histórico** (botão `History` no header): abre lista visual de todas as conversas.
- **Retomar Conversa**: clicar em uma conversa do histórico a torna ativa.
- **Excluir Conversa**: botão de lixeira (hover) em cada item do histórico.
- **Indicador Contextual**: acima do input, mostra título da conversa ativa + total de conversas. Clicável para abrir o histórico.
- **Migração automática**: converte o formato antigo (`intentia_tia_history`) para o novo multi-conversa.
- **Criação lazy**: nova conversa é criada no localStorage apenas quando a primeira mensagem é enviada.

#### UI do Histórico
- Botão "Voltar" + contador de conversas.
- Card "Nova conversa" com borda dashed e ícone `+`.
- Lista de conversas com:
  - Ícone circular (primary quando ativa, muted quando inativa).
  - Título truncado + time ago (agora, 5min, 2h, 3d).
  - Preview da última mensagem.
  - Contador de mensagens do usuário.
  - Botão excluir (opacity-0 → hover:opacity-100).

#### Tooltips
- Botões de Histórico e Nova Conversa possuem tooltips com `border-primary`.

### Componentes Auxiliares

#### TiaAskSection.tsx
- Renderização markdown via `react-markdown` com estilização Tailwind prose.
- Chat bubbles: usuário à direita (bg-primary), Tia à esquerda com borda sutil.
- Typing indicator: 3 dots animados.
- Auto-scroll via `useRef` + `scrollIntoView`.

#### TiaGuidedSection.tsx
- Navegação por 5 steps do onboarding.
- Artigos e FAQs contextuais por step.
- Links para páginas relevantes.

#### types.ts
- `AssistantStep`, `StepHelp`, `TiaMessage`, `TiaConversation`.

---

## Backend — Edge Function `assistant-ia`

### Full Context Architecture (v3.0)

A edge function busca **TODOS os dados da plataforma** em **22 queries paralelas** para construir um contexto completo e estruturado.

#### Queries de Contagem (10 — head-only)
| Tabela | Filtro |
|---|---|
| `projects` | `user_id` |
| `insights` | `user_id` |
| `benchmarks` | `user_id` |
| `audiences` | `user_id` |
| `campaigns` | `user_id` + `is_deleted = false` |
| `project_channel_scores` | `user_id` |
| `notifications` | `user_id` |
| `user_api_keys` | `user_id` |
| `tactical_plans` | `user_id` |
| `support_tickets` | `user_id` |

#### Queries de Dados Completos (12)
| Tabela/View | Colunas | Limite |
|---|---|---|
| `projects` | id, name, url, niche, status, score, updated_at | 20 |
| `insights` | id, type, title, description, project_id | 20 |
| `v_benchmark_summary` | id, competitor_name, competitor_url, overall_score, score_gap, project_id, project_name | 15 |
| `audiences` | id, name, description, industry, company_size, location, keywords, project_id | 15 |
| `campaigns` | id, name, channel, status, budget_total, budget_spent, start_date, end_date | 15 |
| `project_channel_scores` | project_id, channel, score, objective, is_recommended, risks | todos |
| `notifications` | id, title, created_at | 10 |
| `user_api_keys` | provider, api_key_encrypted, preferred_model, is_active | todos |
| `v_campaign_metrics_summary` | campaign_id, campaign_name, channel, total_cost, total_impressions, total_clicks, total_conversions, total_leads, total_revenue, avg_ctr, avg_cpc, avg_cpa, calc_roas | todos |
| `budget_allocations` | project_id, channel, month, year, planned_budget, actual_spent | todos |
| `tactical_plans` | id, name, status, project_id | 10 |
| `support_tickets` | id, subject, status, priority, created_at | 10 |

#### Enriquecimento
- `projectMap`: mapeia `project_id` → `project_name` para enriquecer insights, audiences e tactical_plans.
- `metricsByCampaign`: mapeia `campaign_id` → métricas para cálculos de performance.
- Totais agregados: `totalBudget`, `totalMediaCost`, `totalRevenue`, `totalConversions`, `totalImpressions`, `totalClicks`, `totalLeads`, `totalRoas`, `totalCac`.
- `spendByChannel`: gasto por canal (budget + cost).
- Budget do mês atual: `budgetPlanned`, `budgetActual`, `budgetPacing`, `budgetByChannel`.

### System Prompt Estruturado (13 seções)

O `buildSystemPrompt()` gera um prompt organizado por seção da plataforma:

| # | Seção | Conteúdo |
|---|---|---|
| 0 | Identidade & Regras | Personalidade, tom, formatação, regras de conversa |
| 1 | Conta do Usuário | Nome, email, plano, empresa |
| 2 | Projetos | Lista com nome, URL, nicho, status, score |
| 3 | Scores por Canal | Agrupados por projeto: canal, score, objetivo, riscos |
| 4 | Insights Estratégicos | Tipo, título, descrição, projeto |
| 5 | Benchmarks Competitivos | Concorrente, URL, score, gap, projeto |
| 6 | Públicos-alvo | Nome, indústria, porte, localização, keywords, projeto |
| 7 | Operações / Campanhas | Métricas consolidadas + detalhadas por campanha + por canal |
| 8 | Gestão de Budget | Mês atual com pacing + breakdown por canal |
| 9 | Planos Táticos | Nome, status, projeto |
| 10 | Notificações | Título, data |
| 11 | Suporte | Tickets com subject, status, prioridade |
| 12 | Integrações de IA | Provider, modelo, status |
| 13 | Navegação da Plataforma | Guia completo de todas as 18 rotas protegidas |

#### Helpers de Formatação
```typescript
const fmt = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtNum = (v: number) => v.toLocaleString("pt-BR");
const safe = (v: any, fallback = "—") => (v != null && v !== "" ? String(v) : fallback);
```

### Chamada ao LLM (Gemini)
- API key do usuário (`user_api_keys` provider `google_gemini`).
- Modelo preferido ou fallback `gemini-2.0-flash`.
- `generationConfig`: temperature 0.7, topP 0.9, **maxOutputTokens 2048**.
- Safety settings: `BLOCK_NONE` em todas as categorias.
- Multi-turn: system prompt como primeiro par user/model + histórico completo.

### Fallback (sem API key)
Panorama completo da conta com:
- Visão geral: plano, contagens de projetos/campanhas/insights/benchmarks/públicos/planos táticos.
- Performance: budget total, gasto real, receita, ROAS, conversões, CAC, impressões, cliques, leads.
- Budget mês atual: planejado, gasto, pacing.
- Top 5 campanhas com métricas.
- Top 5 projetos com score.

---

## Fluxo de Resposta

```
1. Usuário digita mensagem no TiaAskSection
2. FloatingChat.sendTiaMessage():
   a. Adiciona msg ao histórico da conversa ativa
   b. Se não há conversa ativa, cria uma nova (lazy)
   c. Persiste em localStorage
3. Chama supabase.functions.invoke("assistant-ia") com:
   - messages: histórico completo da conversa ativa
   - tenantContext: { tenantId, plan, email }
4. Edge function:
   a. Valida auth (getUser + refresh)
   b. Busca tenant_settings
   c. Faz 22 queries paralelas para dados completos
   d. Enriquece dados (projectMap, metricsByCampaign, totais)
   e. Monta system prompt com 13 seções estruturadas
   f. Se tem Gemini key → envia multi-turn ao LLM
   g. Se não → gera fallback com panorama completo
   h. Retorna { answer, user, tenant, plan }
5. FloatingChat recebe answer e adiciona como mensagem assistant
6. Conversa é persistida em localStorage automaticamente
7. TiaAskSection renderiza com ReactMarkdown (prose styling)
```

---

## Desafios Enfrentados e Soluções

| Problema | Solução |
|---|---|
| Auth token undefined | Session refresh automático + retry em 401 |
| CORS/fetch errors | Migração para `supabase.functions.invoke` |
| Contexto limitado (só 3 tabelas) | **Full context: 22 queries paralelas, 13 seções no prompt** |
| Saudação repetitiva a cada mensagem | Removida lógica de greeting; LLM gerencia tom |
| Respostas sem formatação | System prompt com regras markdown + `react-markdown` |
| LLM sem contexto de conversa | Histórico completo enviado como multi-turn |
| Respostas genéricas/robóticas | System prompt com personalidade e dados reais |
| Scroll duplo no chat | Removido; auto-scroll via ref |
| Perda de conversa ao fechar dialog | **Histórico multi-conversa em localStorage** |
| Tia dizia "Intentia Strategy Hub" | **Removido "Strategy Hub" do system prompt** |
| Dialog desalinhado do botão | **Alinhamento dinâmico esquerda/direita** |
| Respostas truncadas | **maxOutputTokens aumentado para 2048** |
| Métricas inconsistentes com LiveDashboard | **Mesma lógica de agregação (metricsByCampaign)** |

---

## Pendências / Próximos Passos

- [ ] **Deploy**: Executar `supabase login` + `supabase functions deploy assistant-ia --no-verify-jwt`.
- [ ] **Claude**: Suporte a Anthropic Claude como alternativa ao Gemini.
- [ ] **Streaming**: SSE para respostas longas.
- [ ] **Memória persistente**: Salvar histórico no banco (além do localStorage).
- [ ] **SMTP**: Reativar com provedor autorizado.

---

## Arquivos Envolvidos

| Arquivo | Responsabilidade |
|---|---|
| `src/components/FloatingChat.tsx` | Componente principal: botão arrastável, painel, modos, histórico multi-conversa, aba acoplada, posicionamento dinâmico |
| `src/components/floating-chat/TiaAskSection.tsx` | UI do chat conversacional com markdown rendering |
| `src/components/floating-chat/TiaGuidedSection.tsx` | UI da assistente guiada (steps/onboarding) |
| `src/components/floating-chat/TiaSuggestionList.tsx` | Lista de sugestões contextuais |
| `src/components/floating-chat/types.ts` | Types: AssistantStep, StepHelp, TiaMessage, TiaConversation |
| `supabase/functions/assistant-ia/index.ts` | Edge function: auth, 22 queries, system prompt 13 seções, LLM, fallback |
| `public/tia-branco-ponto-laranja.svg` | Logo da Tia (branco com ponto laranja) usado na aba e toggle |

---

## Changelog

### v3.0 (2026-02-21)
- **Full Context Architecture**: edge function reescrita com 22 queries paralelas e system prompt em 13 seções.
- **Histórico Multi-Conversa**: nova conversa, lista visual, retomar, excluir, indicador contextual.
- **Aba Acoplada**: elemento `#0b0d11` com logo Tia + curvas de acoplamento (radial-gradient).
- **Toggle com Logo**: botão "Tia" no seletor usa logo SVG + fundo `#0b0d11`.
- **Alinhamento Dinâmico**: dialog alinha borda esquerda ou direita conforme posição do botão.
- **Remoção "Strategy Hub"**: Tia se apresenta como assistente da "Intentia".
- **maxOutputTokens**: aumentado para 2048.
- **Tooltips**: borda laranja (`border-primary`) nos botões de histórico e nova conversa.

### v2.0 (2026-02-20)
- System prompt rico com dados do tenant.
- Multi-turn conversacional com Gemini.
- Fallback inteligente sem API key.
- Markdown rendering com react-markdown.
- Persistência de conversa em localStorage.

### v1.0 (2026-02-19)
- FloatingChat com botão arrastável.
- Assistente guiada (5 steps).
- Chat ao vivo (Pro+).
- Integração básica com edge function.
