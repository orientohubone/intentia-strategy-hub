# Intentia Strategy Hub — Documentação

**Versão:** 4.0.0  
**Data:** 16/02/2026  
**Status:** Limites & Uso Centralizado + Notificações

---

## Índice

| Arquivo | Conteúdo |
|---|---|
| [ARQUITETURA.md](./ARQUITETURA.md) | Stack tecnológico, estrutura de arquivos, rotas, fluxos, componentes, estado |
| [FUNCIONALIDADES.md](./FUNCIONALIDADES.md) | Todas as features implementadas por categoria |
| [DATABASE.md](./DATABASE.md) | Schema SQL, tabelas, RLS, triggers, segurança, scripts |
| [PLANOS_LIMITES.md](./PLANOS_LIMITES.md) | Planos (Starter/Professional/Enterprise), limites, checkout, uso centralizado |
| [OPERACIONAL.md](./OPERACIONAL.md) | Etapa operacional: campanhas, métricas, budget, calendário, alertas |
| [INTEGRACOES_OAUTH.md](./INTEGRACOES_OAUTH.md) | OAuth flow, sync de dados, Edge Functions, env vars |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de versões e entregáveis por release |

### Outros documentos (pasta pai `documentacao/`)

| Arquivo | Conteúdo |
|---|---|
| `ADMIN_PANEL.md` | Painel administrativo (auth, features, planos, clientes) |
| `ESCOPO_EMPRESARIAL.md` | Escopo empresarial do projeto |
| `ROADMAP_OPERACIONAL.md` | Roadmap operacional detalhado |
| `SEO_GEO.md` | SEO & Geolocalização |
| `STATUS_PAGE.md` | Página de status |
| `integracoes/` | Manuais por provider (Google, Meta, LinkedIn, TikTok) |

### Regras de Desenvolvimento

- **Mobile-first** — breakpoints Tailwind (base=mobile, sm:, md:, lg:)
- **Admin Panel** — NUNCA use `supabase` client direto, SEMPRE use `adminApi.ts` → Edge Function
- **RLS** — NUNCA crie policies com `EXISTS (SELECT 1 FROM auth.users ...)`
- **Notificações** — use `notificationService.ts` para todas as ações do usuário
