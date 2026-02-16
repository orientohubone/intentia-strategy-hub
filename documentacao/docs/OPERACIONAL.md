# Etapa Operacional — Intentia Strategy Hub

## Fase 1: Fundação (v3.1)

- **Schema:** tabelas `campaigns`, `campaign_metrics`, `budget_allocations` com RLS, triggers, indexes e audit
- **Views:** `v_campaign_summary` (join com projetos + métricas + pacing), `v_operational_stats` (contadores + budget)
- **Tipos:** `operationalTypes.ts` com interfaces, labels, cores e fluxo de status (draft→active→paused→completed→archived)
- **Página Operações** (`/operations`): CRUD completo, stats cards, filtros (status/canal/projeto/busca), agrupamento por projeto
- **Cards de Campanha:** badges de status e canal, objetivo, budget com pacing bar, datas, transições de status
- **Soft Delete:** campanhas via `is_deleted` (recuperáveis em 30 dias)

## Fase 2: Métricas e Performance (v3.2)

- **Métricas por canal:** reach, frequency, video_views, vtr, leads, cpl, quality_score, avg_position, search_impression_share, engagement_rate, revenue, notes, source
- **View** `v_campaign_metrics_summary`: agregação de KPIs (totais, médias, ROAS calculado)
- **CampaignMetricsForm:** input manual com métricas gerais + específicas por canal
- **CampaignPerformanceCards:** KPI cards (Impressões, Cliques/CTR, Conversões/CPA, Custo/CPC, Receita/ROAS)
- **Métricas por Canal:**
  - Google: Quality Score, Posição Média, Impression Share
  - Meta: Alcance, Frequência
  - LinkedIn: Leads, CPL, Engagement Rate
  - TikTok: Video Views, VTR

### Fase 2b: Métricas Google B2B Expandidas (v3.2.1)

- **16 novos campos:** sessions, first_visits, leads_month, mql_rate, sql_rate, clients_web, revenue_web, avg_ticket, google_ads_cost, cac_month, cost_per_conversion, ltv, cac_ltv_ratio, cac_ltv_benchmark, roi_accumulated, roi_period_months
- **KPIs Google:** Sessões, Leads/Mês, Taxa MQL/SQL, Clientes Web, Ticket Médio, CAC, LTV, CAC:LTV, ROI Acumulado

## Fase 3: Análise de Performance por IA + Dashboard (v3.3)

- **Análise por IA:** botão Sparkles por campanha, seletor de modelo, análise completa (saúde, KPIs vs benchmark, funil, budget, forças/fraquezas, riscos, plano de ação, projeções 30d/90d)
- **CampaignPerformanceAiDialog:** dialog com scroll, header sticky, fullscreen, seções colapsáveis
- **Dashboard:** card de campanhas recentes (até 6, badges, pacing bar) + projetos recentes com expand/collapse

## Fase 4: Comparativo Tático vs Real (v3.4)

- **TacticalVsRealComparison:** cruza plano tático com métricas reais para gap analysis operacional
- **Gap Analysis por Canal:** aderência estrutural (30%) + gap de métricas (70%) = score de aderência
- **Helpers:** GapStatus, MetricGap, METRIC_KEY_MAP (25+ labels → campos reais)
- **Visualização:** AdherenceRing, StructureMatchItem, MetricGapRow, ChannelGapCard

## Fase 5: Alertas Automáticos de Performance (v3.5)

- **Engine de regras:** avalia métricas contra thresholds por canal
- **11 Regras de Alerta:**
  - Budget: estourado (≥100%), quase esgotado (≥90%), subutilizado (<50% pacing)
  - Eficiência: CTR baixo, CPC elevado, CPA elevado
  - Conversão: sem conversões, ROAS negativo (<1x) e baixo (<2x)
  - Qualidade: CAC:LTV desfavorável, ROI negativo
  - Pacing: sem métricas (ativa >7 dias), alto investimento sem resultados (>R$500)
- **Thresholds por Canal:** CTR mín (Google 1.5%, Meta 0.8%, LinkedIn 0.4%, TikTok 0.5%), CPC máx, CPA máx
- **Componente PerformanceAlerts.tsx:** cards com ícones, badges, filtros por severidade/categoria

## Fase 6: Gestão de Budget (v3.6)

- **Views:** `v_budget_summary` (resumo por canal/mês com pacing), `v_budget_project_pacing` (consolidado por projeto)
- **Funções SQL:** `sync_budget_actual_spent()`, `sync_all_budgets()`
- **BudgetManagement.tsx:**
  - Formulário de alocação (canal, mês, ano, valor) com upsert
  - Card do mês atual com barra de pacing, projeção de gasto, alerta de estouro
  - Breakdown por canal com barras individuais
  - Meses anteriores colapsáveis com exclusão
  - Botão "Sincronizar" (RPC sync_all_budgets)

## Fase 7: Calendário de Campanhas (v3.7)

- **Views:** `v_campaign_calendar` (dados por campanha com duração, budget pacing, ending_soon), `v_campaign_timeline` (agrupamento por projeto)
- **CampaignCalendar.tsx:** grid mensal estilo Google Calendar
  - Barras coloridas por canal, navegação mês, indicador "hoje", tooltip, click para detalhes
  - Badge "encerra em breve" (7 dias), legenda de canais
- **CampaignTimeline.tsx:** vista Gantt horizontal
  - Eixo X = semanas (8 visíveis), barras por canal com opacidade por status
  - Linha vertical "hoje", tooltip rico, navegação por período
- **CampaignCalendarManager.tsx:** toggle Calendário/Timeline, filtros por canal/status

---

## Admin Panel — Operações

- Rota `/operations` nas rotas protegidas
- Componentes: CampaignMetricsForm, CampaignPerformanceCards, PerformanceAlerts, BudgetManagement, CampaignCalendarManager, TacticalVsRealComparison
- Tabelas: campaigns, campaign_metrics, budget_allocations
- Views operacionais no Supabase Types
