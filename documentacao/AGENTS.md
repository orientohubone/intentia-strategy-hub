# Intentia Strategy Hub - Contexto do Projeto

**Nome:** Intentia Strategy Hub  
**Stack:** React 18 + TypeScript + Vite + shadcn/ui + Tailwind CSS + Supabase  
**Propósito:** Plataforma de análise estratégica para marketing B2B  
**Versão:** 4.0.0

> ⚠️ **Este arquivo foi refatorado.** A documentação completa está em `docs/`.

## 📁 Documentação

| Arquivo | Conteúdo |
|---|---|
| [docs/README.md](./docs/README.md) | Índice geral + regras de desenvolvimento |
| [docs/ARQUITETURA.md](./docs/ARQUITETURA.md) | Stack, estrutura de arquivos, rotas, componentes, fluxos, variáveis de ambiente |
| [docs/FUNCIONALIDADES.md](./docs/FUNCIONALIDADES.md) | Todas as features implementadas por categoria |
| [docs/DATABASE.md](./docs/DATABASE.md) | Schema SQL, tabelas, RLS, triggers, segurança, Edge Functions |
| [docs/PLANOS_LIMITES.md](./docs/PLANOS_LIMITES.md) | Planos, limites, checkout, dashboard de uso, admin |
| [docs/OPERACIONAL.md](./docs/OPERACIONAL.md) | Etapa operacional: campanhas, métricas, budget, calendário |
| [docs/INTEGRACOES_OAUTH.md](./docs/INTEGRACOES_OAUTH.md) | OAuth flow, sync, Edge Functions, env vars |
| [docs/CHANGELOG.md](./docs/CHANGELOG.md) | Histórico de versões e entregáveis |

### Outros docs na pasta `documentacao/`
- `ADMIN_PANEL.md` — Painel administrativo
- `ESCOPO_EMPRESARIAL.md` — Escopo empresarial
- `ROADMAP_OPERACIONAL.md` — Roadmap operacional
- `SEO_GEO.md` — SEO & Geolocalização
- `STATUS_PAGE.md` — Página de status
- `integracoes/` — Manuais por provider (Google, Meta, LinkedIn, TikTok)

---

## Regras Críticas

- **Mobile-first** — breakpoints Tailwind (base=mobile, sm:, md:, lg:)
- **Admin Panel** — NUNCA use `supabase` client direto, SEMPRE use `adminApi.ts` → Edge Function `admin-api`
- **RLS** — NUNCA crie policies com `EXISTS (SELECT 1 FROM auth.users ...)`
- **Notificações** — use `notificationService.ts` para todas as ações do usuário
- **Supabase URL** — `https://vofizgftwxgyosjrwcqy.supabase.co`
