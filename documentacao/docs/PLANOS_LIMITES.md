# Planos & Limites — Intentia Strategy Hub

## Planos

### Starter (Grátis)
- 5 projetos ativos
- 5 públicos-alvo
- 5 análises heurísticas/mês
- 5 benchmarks SWOT/mês
- 1 plano tático/mês
- 2 campanhas/mês
- 4 backups/mês
- Diagnóstico heurístico de URL (6 dimensões)
- Score por canal (Google, Meta, LinkedIn, TikTok)
- Insights estratégicos + alertas
- Dark/Light mode
- Notificações em tempo real
- Suporte por chamados (sem chat — apenas Professional+)
- Exportação limitada (3 CSV/mês, 2 resultados IA/mês)

### Professional (R$ 147/mês)
- Projetos e públicos ilimitados
- Análises heurísticas e por IA ilimitadas
- Benchmark SWOT ilimitado
- Plano Tático + Playbook ilimitados
- Operações e campanhas ilimitadas
- Exportação PDF e CSV ilimitada
- Integrações de IA (Gemini + Claude)
- Suporte prioritário (chat habilitado)
- Backups ilimitados

### Enterprise (Personalizado)
- Tudo do Professional
- API access completo
- Múltiplos usuários por conta
- SLA dedicado com suporte 24/7
- Consultoria estratégica mensal
- Integrações customizadas

---

## Limites Técnicos

### Coluna `max_projects` em `tenant_settings`
- **Default:** 5 (Starter)
- **-1** = ilimitado (Professional/Enterprise)
- Trigger SQL `enforce_project_limit` usa este campo dinamicamente
- Editável pelo Admin Panel por usuário

### Coluna `max_audiences` em `tenant_settings`
- **Default:** 5 (Starter)
- **-1** = ilimitado
- Editável pelo Admin Panel

### Coluna `monthly_analyses_limit` em `tenant_settings`
- **Default:** 5 (Starter)
- **-1** = ilimitado
- Incrementado automaticamente pelo trigger `enforce_analysis_limit`

### Rate Limiting
- Starter: 10 ações/hora
- Professional: 50 ações/hora
- Enterprise: 200 ações/hora

---

## Dashboard de Uso (Settings)

Na página Settings → Card de Plano, o usuário vê 7 métricas centralizadas:

| Métrica | Tipo | Limite Starter |
|---|---|---|
| Projetos ativos | Total | 5 |
| Públicos-alvo | Total | 5 |
| Análises heurísticas | Mensal | 5 |
| Benchmarks SWOT | Mensal | 5 |
| Planos táticos | Mensal | 1 |
| Campanhas | Mensal | 2 |
| Backups | Mensal | 4 |

- **Barras de progresso** com cores dinâmicas:
  - Verde: uso normal
  - Amarelo: ≥80% do limite
  - Vermelho: limite atingido
- Nota: "Limites mensais são resetados no dia 1 de cada mês. Projetos e públicos são totais."

---

## Admin Panel — Limites por Usuário

Na aba Clientes do Admin Panel, cada usuário tem:

### Limites do Tenant (azul)
- Análises usadas este mês (input editável)
- Limite mensal de análises (-1 = ∞)
- Máx. públicos-alvo (-1 = ∞)
- Máx. projetos ativos (-1 = ∞)

### Limites do Plano (verde)
- Cada feature habilitada com usage_limit + limit_period editáveis

### Botões de Ação Rápida
- **Zerar análises** — reseta analyses_used para 0
- **Tudo ilimitado** — seta monthly_analyses_limit, max_audiences, max_projects para -1
- **Padrão Starter** — seta monthly_analyses_limit=5, max_audiences=5, max_projects=5

---

## Checkout

### Checkout Público (`/assinar`)
- Self-service para visitantes do site
- Dados da conta + pagamento (cartão/PIX/boleto)
- Simula pagamento → cria conta → tenant_settings com plan: professional

### Checkout Interno (`/checkout`)
- Upgrade para usuários autenticados (Starter → Professional)
- Pagamento → atualiza tenant_settings.plan

---

## SQL Migrations Relacionadas

| Script | Descrição |
|---|---|
| `add_max_projects_column.sql` | Coluna max_projects + trigger dinâmico |
| `add_max_audiences_column.sql` | Coluna max_audiences |
| `update_starter_plan.sql` | Atualização de limites do Starter |
| `guardrails.sql` | Enforce de limites (projetos, análises, rate limiting) |
