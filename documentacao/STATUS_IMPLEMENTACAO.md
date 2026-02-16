# Status de Implementação - Intentia Strategy Hub

**Versão:** 4.0.0  
**Data:** 16/02/2026  
**Status:** Limites & Uso Centralizado + Notificações

> ⚠️ **Este arquivo foi refatorado.** A documentação completa está em `docs/`.

## � Documentação Refatorada

| Arquivo | Conteúdo | ~Linhas |
|---|---|---|
| [docs/README.md](./docs/README.md) | Índice geral + regras de desenvolvimento | ~40 |
| [docs/ARQUITETURA.md](./docs/ARQUITETURA.md) | Stack, estrutura de arquivos, rotas, componentes, fluxos | ~220 |
| [docs/FUNCIONALIDADES.md](./docs/FUNCIONALIDADES.md) | Todas as features implementadas por categoria | ~180 |
| [docs/DATABASE.md](./docs/DATABASE.md) | Schema SQL, tabelas, RLS, triggers, segurança, Edge Functions | ~110 |
| [docs/PLANOS_LIMITES.md](./docs/PLANOS_LIMITES.md) | Planos, limites, checkout, dashboard de uso, admin | ~130 |
| [docs/OPERACIONAL.md](./docs/OPERACIONAL.md) | Etapa operacional: campanhas, métricas, budget, calendário | ~120 |
| [docs/INTEGRACOES_OAUTH.md](./docs/INTEGRACOES_OAUTH.md) | OAuth flow, sync, Edge Functions, env vars | ~130 |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Histórico de versões e entregáveis por release | ~180 |

## 📋 Resumo da v4.0.0

### Notificações Centralizadas
- `notificationService.ts` — serviço centralizado com funções por ação
- Integrado em: Projects, TacticalPlan, Audiences, Operations, Settings, Support
- Suporte restrito: chat bloqueado para Starter

### Limites & Uso
- Bug fix: limite de projetos Starter 3→5 (trigger SQL + frontend)
- Coluna `max_projects` em tenant_settings + trigger dinâmico
- Dashboard de Uso: 7 métricas com barras de progresso (verde/amarelo/vermelho)
- Admin Panel: campo "Máx. projetos ativos" + botões atualizados
- Contador duplo em Projects: projetos + análises
- Backup Starter: 1→4/mês + mensagem uso consciente

### SQL Pendente
- Rodar `supabase/add_max_projects_column.sql`
- Rodar `UPDATE plan_features SET usage_limit = 4 WHERE feature_key = 'backup_system' AND plan = 'starter';`

---

## 📋 Roadmap

### Próximos Passos
- [ ] Relatórios de performance automatizados
- [ ] Multi-tenancy avançado (equipes, permissões, workspaces)
- [ ] Advanced analytics e dashboards customizáveis
- [ ] Integração com CRMs (HubSpot, Salesforce)
- [ ] Automação de workflows
- [ ] White-label para agências
