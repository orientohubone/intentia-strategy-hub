# Roadmap — Etapa Operacional (v3.0)

## Visão Geral

A **Etapa Operacional** transforma o plano tático em execução real, conectando a plataforma Intentia com as APIs de marketing e fornecendo métricas de performance em tempo real.

**Pré-requisito:** Etapa Estratégica (v2.3.0) ✅ completa — análise heurística, análise por IA, benchmark competitivo, plano tático por canal com templates e playbook gamificado.

**Objetivo:** Permitir que o usuário execute, monitore e otimize campanhas de marketing digital diretamente a partir do plano tático gerado pela plataforma.

---

## Fase 1 — Fundação Operacional
> *Estrutura de dados e UI base para campanhas*
> **Estimativa:** 2-3 semanas

| # | Feature | Descrição | Prioridade | Status |
|---|---------|-----------|------------|--------|
| 1.1 | **Schema de Campanhas** | Tabelas `campaigns`, `campaign_metrics`, `budget_allocations` com RLS, triggers e indexes | Alta | ⬜ |
| 1.2 | **CRUD de Campanhas** | Criar/editar/arquivar campanhas vinculadas a projetos e canais táticos | Alta | ⬜ |
| 1.3 | **Dashboard Operacional** | Página `/operations` com visão consolidada de campanhas ativas, métricas e alertas | Alta | ⬜ |
| 1.4 | **Status de Campanha** | Fluxo: Rascunho → Ativa → Pausada → Concluída, com badges visuais e transições | Alta | ⬜ |
| 1.5 | **Vínculo Tático → Operacional** | Cada campanha referencia o `tactical_channel_plan` de origem, herdando objetivos e KPIs | Alta | ⬜ |
| 1.6 | **Sidebar e Navegação** | Adicionar item "Operações" na DashboardSidebar com ícone e active state | Alta | ⬜ |

### Entregáveis
- Página `/operations` funcional com lista de campanhas
- Formulário de criação com seletor de projeto + canal + vínculo tático
- Cards de campanha com status, canal, datas e indicadores visuais
- Mobile-first (seguindo padrão v2.3.0)

---

## Fase 2 — Métricas e Performance
> *Tracking de KPIs e visualização de resultados*
> **Estimativa:** 2 semanas

| # | Feature | Descrição | Prioridade | Status |
|---|---------|-----------|------------|--------|
| 2.1 | **Input Manual de Métricas** | Formulário para registrar CPC, CTR, CPL, ROAS, impressões, cliques, conversões por período | Alta | ⬜ |
| 2.2 | **Cards de Performance** | Visualização por campanha e por canal com sparklines, tendências e deltas | Alta | ⬜ |
| 2.3 | **Comparativo Tático vs Real** | Comparar metas do plano tático com resultados reais (gap analysis operacional) | Média | ⬜ |
| 2.4 | **Alertas de Performance** | Notificações automáticas quando métricas saem do range esperado (CPC alto, CTR baixo, etc.) | Média | ⬜ |
| 2.5 | **Histórico de Métricas** | Timeline de evolução dos KPIs com gráficos de linha/barra | Média | ⬜ |

### Entregáveis
- Formulário de input de métricas por campanha (diário/semanal)
- Dashboard com cards de KPIs: CPC, CTR, CPL, ROAS, Conversões
- Seção "Tático vs Real" mostrando gaps entre planejado e executado
- Notificações de anomalia integradas ao sistema existente

### Métricas por Canal

**Google Ads:**
- Impressões, Cliques, CTR, CPC, Conversões, CPA, ROAS
- Índice de Qualidade, Posição Média, Search Impression Share

**Meta Ads (Facebook/Instagram):**
- Alcance, Impressões, Cliques, CTR, CPC, CPM
- Conversões, CPA, ROAS, Frequência

**LinkedIn Ads:**
- Impressões, Cliques, CTR, CPC, CPM
- Leads, CPL, Engagement Rate

**TikTok Ads:**
- Impressões, Cliques, CTR, CPC, CPM
- Video Views, VTR, Conversões, CPA

---

## Fase 3 — Gestão de Budget
> *Controle financeiro por canal e projeto*
> **Estimativa:** 1 semana

| # | Feature | Descrição | Prioridade | Status |
|---|---------|-----------|------------|--------|
| 3.1 | **Alocação de Budget** | Definir budget mensal por canal e projeto com distribuição percentual | Alta | ⬜ |
| 3.2 | **Pacing de Gasto** | Barra de progresso de gasto vs budget planejado (diário e mensal) | Média | ⬜ |
| 3.3 | **Projeções** | Estimativa de resultado final do mês baseada no ritmo atual de gasto | Média | ⬜ |
| 3.4 | **Alertas de Budget** | Notificação quando gasto atinge 80% e 100% do budget | Média | ⬜ |

### Entregáveis
- Card de budget por projeto com breakdown por canal
- Barra de pacing visual (verde/amarelo/vermelho)
- Projeção de fim de mês com base no ritmo atual
- Alertas integrados ao sistema de notificações

---

## Fase 4 — Calendário e Timeline
> *Visão temporal das campanhas*
> **Estimativa:** 1 semana

| # | Feature | Descrição | Prioridade | Status |
|---|---------|-----------|------------|--------|
| 4.1 | **Calendário de Campanhas** | Visualização mensal/semanal com campanhas por canal | Média | ⬜ |
| 4.2 | **Timeline Visual** | Gantt simplificado mostrando duração e sobreposição de campanhas | Baixa | ⬜ |
| 4.3 | **Datas e Marcos** | Data de início, fim, milestones e checkpoints por campanha | Média | ⬜ |

### Entregáveis
- Componente de calendário com campanhas coloridas por canal
- Timeline horizontal com drag para ajustar datas
- Indicadores de marcos e checkpoints

---

## Fase 5 — Integração com APIs de Marketing
> *Conexão direta com plataformas de ads*
> **Estimativa:** 3-4 semanas

| # | Feature | Descrição | Prioridade | Status |
|---|---------|-----------|------------|--------|
| 5.1 | **Google Ads API** | OAuth2 + leitura de campanhas, métricas e budget em tempo real | Alta | ⬜ |
| 5.2 | **Meta Ads API** | OAuth2 + leitura de campanhas do Facebook/Instagram Ads | Alta | ⬜ |
| 5.3 | **LinkedIn Ads API** | OAuth2 + leitura de campanhas do LinkedIn Campaign Manager | Média | ⬜ |
| 5.4 | **TikTok Ads API** | OAuth2 + leitura de campanhas do TikTok Ads Manager | Baixa | ⬜ |
| 5.5 | **Sync Automático** | Edge Function com cron para atualizar métricas periodicamente | Média | ⬜ |
| 5.6 | **Push de Campanhas** | Criar campanhas diretamente nas plataformas a partir do plano tático | Baixa | ⬜ |

### Requisitos Técnicos
- **OAuth2 Flow:** Cada usuário conecta suas contas de ads (tokens armazenados com criptografia)
- **Edge Functions:** Proxy para chamadas às APIs (CORS + rate limiting)
- **Tabela `ad_platform_connections`:** user_id, platform, access_token, refresh_token, account_id, expires_at
- **Sync:** Cron job (Supabase pg_cron ou Edge Function scheduled) a cada 6h

### Fluxo de Integração
```
1. Usuário clica "Conectar Google Ads" em Settings
2. OAuth2 redirect → Google → callback com authorization code
3. Edge Function troca code por access_token + refresh_token
4. Tokens salvos em ad_platform_connections (criptografados)
5. Sync automático puxa campanhas e métricas
6. Dados exibidos no Dashboard Operacional
```

---

## Fase 6 — Relatórios Operacionais
> *Reports automatizados de performance*
> **Estimativa:** 1-2 semanas

| # | Feature | Descrição | Prioridade | Status |
|---|---------|-----------|------------|--------|
| 6.1 | **Relatório Semanal** | PDF/email automático com resumo de performance da semana | Média | ⬜ |
| 6.2 | **Relatório Mensal** | Consolidado com comparativo mês anterior e recomendações | Média | ⬜ |
| 6.3 | **A/B Testing Tracker** | Vincular testes táticos a resultados reais, calcular significância estatística | Baixa | ⬜ |
| 6.4 | **Exportação Operacional** | PDF e CSV de campanhas, métricas e budget | Média | ⬜ |

### Entregáveis
- Template de relatório semanal (PDF) com KPIs, tendências e alertas
- Template de relatório mensal com comparativo e recomendações IA
- Tracker de A/B tests com status (rodando/concluído/significativo)
- Exportação CSV/PDF integrada ao padrão existente

---

## Dependências entre Fases

```
Fase 1 (Fundação) ──────────────────────────────────────────►
    │
    ├── Fase 2 (Métricas) ──────────────────────────────────►
    │       │
    │       ├── Fase 3 (Budget) ────────────────────────────►
    │       │
    │       └── Fase 6 (Relatórios) ────────────────────────►
    │
    ├── Fase 4 (Calendário) ────────────────────────────────►
    │
    └── Fase 5 (APIs) ─────────────────────────────────────►
            │
            └── Substitui input manual da Fase 2
```

- **Fases 1-3** podem ser implementadas sem dependências externas (input manual)
- **Fase 4** depende apenas da Fase 1
- **Fase 5** é a mais complexa (OAuth2 + APIs de terceiros) e substitui o input manual
- **Fase 6** depende das Fases 1-2 para ter dados

---

## Schema SQL Previsto

### Tabelas Novas

```sql
-- Campanhas
campaigns (
  id, user_id, project_id, tactical_plan_id, tactical_channel_plan_id,
  name, channel, status, start_date, end_date,
  budget_total, budget_spent, objective, notes,
  created_at, updated_at
)

-- Métricas de campanha (por período)
campaign_metrics (
  id, campaign_id, user_id,
  period_start, period_end,
  impressions, clicks, ctr, cpc, cpm,
  conversions, cpa, roas, cost,
  custom_metrics (jsonb),
  created_at
)

-- Alocação de budget
budget_allocations (
  id, user_id, project_id, channel,
  month, year, planned_budget, actual_spent,
  created_at, updated_at
)

-- Conexões com plataformas de ads (Fase 5)
ad_platform_connections (
  id, user_id, platform,
  access_token_encrypted, refresh_token_encrypted,
  account_id, account_name,
  expires_at, last_synced_at,
  is_active, created_at, updated_at
)
```

---

## Estimativa Total

| Fase | Duração | Dependência |
|------|---------|-------------|
| Fase 1 — Fundação | 2-3 semanas | Nenhuma |
| Fase 2 — Métricas | 2 semanas | Fase 1 |
| Fase 3 — Budget | 1 semana | Fase 1-2 |
| Fase 4 — Calendário | 1 semana | Fase 1 |
| Fase 5 — APIs | 3-4 semanas | Fase 1 |
| Fase 6 — Relatórios | 1-2 semanas | Fase 1-2 |
| **Total** | **10-13 semanas** | — |

---

## Princípios de Desenvolvimento

1. **Mobile-first** — Toda UI segue o padrão Tailwind mobile-first (base = mobile, sm:, md:, lg:)
2. **DashboardLayout** — Todas as páginas operacionais usam o wrapper compartilhado
3. **Design System** — Cores, badges, cards e componentes consistentes com v2.3.0
4. **RLS** — Row Level Security em todas as tabelas novas
5. **Incremental** — Cada fase entrega valor independente
6. **Input manual primeiro** — APIs de terceiros são enhancement, não requisito

---

**Documento criado em:** 07/02/2026  
**Versão:** 1.0  
**Projeto:** Intentia Strategy Hub v3.0
