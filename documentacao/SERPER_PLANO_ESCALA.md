# Plano de Escala — Serper.dev (SERP Ranking)

## Visão Geral

O módulo **SEO & Performance** usa a API do [Serper.dev](https://serper.dev) para consultar rankings orgânicos do Google em tempo real. Cada busca por termo consome **1 crédito**.

### Configuração Atual
- **Rotação de keys**: suporta até 2 API keys (`SERPER_API_KEY`, `SERPER_API_KEY_2`)
- **Round-robin**: termos são distribuídos alternadamente entre as keys
- **Limite por análise**: até 10 termos por execução
- **Resultados**: 10 resultados orgânicos por termo

---

## Consumo por Análise

| Termos por análise | Créditos consumidos | Com 2 keys (por key) |
|---|---|---|
| 1 termo | 1 crédito | ~0-1 cada |
| 3 termos | 3 créditos | ~1-2 cada |
| 5 termos | 5 créditos | ~2-3 cada |
| 10 termos (máx) | 10 créditos | 5 cada |

**Média estimada**: ~5 termos por análise = **5 créditos/análise**

---

## Projeção de Consumo por Número de Usuários Ativos

> **Premissa**: cada usuário ativo roda em média **2 análises SERP por semana** com **5 termos cada** = **10 créditos/semana/usuário** = **~40 créditos/mês/usuário**

### Cenário Conservador (2 análises/semana, 5 termos)

| Usuários ativos | Créditos/mês | Créditos/6 meses | Plano recomendado | Custo/mês |
|---|---|---|---|---|
| **10** | 400 | 2.400 | Free (2 keys) | $0 |
| **30** | 1.200 | 7.200 | Free (3 keys) ou 50k | $0 ~ $8/mês |
| **50** | 2.000 | 12.000 | 50k ($50) | ~$8/mês |
| **100** | 4.000 | 24.000 | 50k ($50) | ~$8/mês |
| **200** | 8.000 | 48.000 | 50k ($50) | ~$8/mês |
| **500** | 20.000 | 120.000 | 500k ($375) | ~$62/mês |
| **1.000** | 40.000 | 240.000 | 500k ($375) | ~$62/mês |
| **2.000** | 80.000 | 480.000 | 500k ($375) | ~$62/mês |
| **5.000** | 200.000 | 1.200.000 | 2.5M ($1.250) | ~$208/mês |

### Cenário Intensivo (5 análises/semana, 8 termos)

> **Premissa**: 5 análises/semana × 8 termos = **40 créditos/semana/usuário** = **~160 créditos/mês/usuário**

| Usuários ativos | Créditos/mês | Créditos/6 meses | Plano recomendado | Custo/mês |
|---|---|---|---|---|
| **10** | 1.600 | 9.600 | Free (4 keys) ou 50k | $0 ~ $8/mês |
| **30** | 4.800 | 28.800 | 50k ($50) | ~$8/mês |
| **50** | 8.000 | 48.000 | 50k ($50) | ~$8/mês |
| **100** | 16.000 | 96.000 | 500k ($375) | ~$62/mês |
| **200** | 32.000 | 192.000 | 500k ($375) | ~$62/mês |
| **500** | 80.000 | 480.000 | 500k ($375) | ~$62/mês |
| **1.000** | 160.000 | 960.000 | 2.5M ($1.250) | ~$208/mês |
| **2.000** | 320.000 | 1.920.000 | 2.5M ($1.250) | ~$208/mês |
| **5.000** | 800.000 | 4.800.000 | 12.5M ($3.750) | ~$625/mês |

---

## Planos Serper.dev

| Plano | Créditos | Preço | Custo/1k queries | Validade | Rate limit |
|---|---|---|---|---|---|
| **Free** | 2.500/key | $0 | $0 | — | — |
| **50k** | 50.000 | $50 | $1.00 | 6 meses | 50 req/s |
| **500k** | 500.000 | $375 | $0.75 | 6 meses | 100 req/s |
| **2.5M** | 2.500.000 | $1.250 | $0.50 | 6 meses | 200 req/s |
| **12.5M** | 12.500.000 | $3.750 | $0.30 | 6 meses | 300 req/s |

> Modelo **top-up** (pré-pago), sem assinatura mensal. Créditos válidos por 6 meses.

---

## Estratégia de Escala por Fase

### Fase 1 — MVP / Early Adopters (até 50 usuários)
- **Keys**: 2 contas free = 5.000 créditos grátis
- **Custo**: $0
- **Duração estimada**: ~2-4 meses com uso moderado
- **Ação**: criar 2ª conta Serper.dev, configurar `SERPER_API_KEY_2`

### Fase 2 — Crescimento (50-200 usuários)
- **Plano**: 50k créditos ($50)
- **Custo**: ~$8/mês amortizado
- **Duração estimada**: ~6 meses
- **Ação**: comprar pacote 50k, manter rotação de keys

### Fase 3 — Escala (200-1.000 usuários)
- **Plano**: 500k créditos ($375)
- **Custo**: ~$62/mês amortizado
- **Duração estimada**: ~6 meses
- **Ação**: upgrade para 500k, monitorar consumo mensal

### Fase 4 — Enterprise (1.000-5.000 usuários)
- **Plano**: 2.5M créditos ($1.250)
- **Custo**: ~$208/mês amortizado
- **Ação**: upgrade para 2.5M, implementar cache de resultados

### Fase 5 — Alto Volume (5.000+ usuários)
- **Plano**: 12.5M créditos ($3.750)
- **Custo**: ~$625/mês amortizado
- **Ação**: upgrade para 12.5M, considerar cache agressivo

---

## Otimizações para Reduzir Consumo

### Implementadas
- [x] Rotação de keys (round-robin entre 2 keys)
- [x] Limite de 10 termos por análise
- [x] Histórico com auto-restore (evita re-análises desnecessárias)

### Futuras (quando necessário)
- [ ] **Cache de resultados**: armazenar resultados SERP por 24h no Supabase, evitar buscas repetidas para o mesmo termo
- [ ] **Rate limiting por plano**: Starter = 2 análises SERP/dia, Professional = 10/dia, Enterprise = ilimitado
- [ ] **Deduplicação de termos**: se 2 usuários buscam o mesmo termo no mesmo dia, reutilizar resultado
- [ ] **Agendamento off-peak**: análises em lote durante horários de menor uso
- [ ] **Monitoramento de consumo**: dashboard admin com créditos restantes e projeção de esgotamento

---

## Custo por Usuário (para precificação)

| Cenário | Créditos/mês/usuário | Custo/mês/usuário (plano 500k) |
|---|---|---|
| Leve (1 análise/sem, 3 termos) | ~12 | $0.009 |
| Moderado (2 análises/sem, 5 termos) | ~40 | $0.030 |
| Intensivo (5 análises/sem, 8 termos) | ~160 | $0.120 |
| Pesado (diário, 10 termos) | ~300 | $0.225 |

> **Conclusão**: mesmo no cenário mais intensivo, o custo SERP por usuário é **< $0.25/mês** — margem excelente para qualquer plano acima de R$10/mês.

---

## Variáveis de Ambiente

```
SERPER_API_KEY=key_da_conta_1
SERPER_API_KEY_2=key_da_conta_2
```

Configurar em: Supabase Dashboard → Edge Functions → Secrets

---

*Documento criado em: Fevereiro 2026*
*Última atualização: v4.x*
