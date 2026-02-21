---
title: TIA & FloatingChat Refatoração e Integração
summary: Histórico das mudanças na Tia (FloatingChat), edge function assistant-ia e desafios enfrentados
updated: 2026-02-21
---

## Visão Geral
- Refatoramos o FloatingChat em camadas: botão/upgrade, Tia guiada, Tia conversacional.
- Criamos/ajustamos a edge function `assistant-ia` para respostas contextualizadas por tenant, com RLS e contagens reais.
- Integramos fallback/LLM com chave do usuário (Gemini) e mantivemos resumo contextual quando LLM indisponível.
- Melhoramos UX: saudação única, tags de contexto, modo guided vs ask, responsividade e remoção de scroll duplo.

## Principais Mudanças Frontend
- **FloatingChat.tsx**
  - Toggle de modo (assistente guiada vs "Pergunte para a Tia").
  - Auth/tenant context seguro: usa user + tenantSettings, exige session/refresh em 401.
  - Chamada `assistant-ia` via `supabase.functions.invoke` com fallback para fetch; inclui bearer do usuário.
  - Saudação única personalizada, evita respostas duplicadas em cumprimentos.
  - Tags de contexto (tenant/plan/email) ajustadas e opcionais.
  - Polimento responsivo e fluxo bate-volta (mensagem do usuário → resposta da Tia).
- **TiaAskSection.tsx**
  - Mensagens sem cartão externo; rolagem só no dialog pai; layout mais limpo.
- **TiaGuidedSection.tsx**
  - Usa predictedStep (título/tipo) para navegação e lint fixes em imports.

## Principais Mudanças Backend (Edge `assistant-ia`)
- Validação de auth: `supabase.auth.getUser()` com token do usuário; RLS garantido.
- Tenant seguro: busca em `tenant_settings` pelo `tenantContext.tenantId` + `user_id`; fallback ao userId.
- Contagens por tenant (todas com filtro `user_id`):
  - projects, insights, benchmarks, audiences, project_channel_scores (canais), notifications, user_api_keys.
  - campaigns (ativos/não deletados via `campaigns`), gastos por canal e total via `v_campaign_summary`.
- Intents dinâmicas em estilo LLM: monta resumo contextual + recortes (gastos, campanhas, canais, insights recentes, notificações recentes, projeto mais recente, plano, API keys).
- LLM opcional (Gemini) usando `user_api_keys` (provider `google_gemini`, modelo preferido ou `gemini-1.5-flash`); fallback para resposta local se indisponível.
- CORS ampliado: métodos POST/OPTIONS, credenciais permitidas.

## Fluxo de Resposta da Tia
1) Front monta mensagens e chama `assistant-ia` com tenantContext.
2) Edge valida user (RLS) e monta contexto numérico + textos recentes (insights/notificações/projeto).
3) Se houver chave Gemini ativa do usuário, gera resposta LLM; senão usa resumo contextual.
4) Front exibe resposta sem repetir saudação e sem restringir a poucos intent types.

## Desafios Enfrentados
- **Auth token**: corrigido `authUser` undefined; tokens renovados em 401.
- **CORS/Invoke**: trocamos fetch por `supabase.functions.invoke` com fallback.
- **Contexto limitado**: antes só projetos/benchmarks/públicos; ampliamos para campanhas, gastos, notificações, API keys, plano, projeto recente.
- **UX**: saudação repetitiva removida; scroll duplo removido; caixa de chat aberta apenas no dialog principal.
- **SMTP reset**: recuperação de senha falhava com SMTP custom (MailerSend trial). Desativar SMTP no Supabase voltou a funcionar; necessidade futura de sender habilitado ou outro provedor.

## Pendências / Próximos Passos
- (Opcional) Adicionar suporte a Claude (anthropic_claude) lendo `user_api_keys` e escolhendo modelo do usuário.
- (Opcional) Expor mais detalhes de campanhas (status, pacing) e alertas estratégicos via edge.
- (Ops) Se reativar SMTP: usar provedor com remetente autorizado (`no-reply@intentia.com.br`) e testar envio no painel Supabase.

## Arquivos Envolvidos
- `src/components/FloatingChat.tsx`
- `src/components/floating-chat/TiaAskSection.tsx`
- `src/components/floating-chat/TiaGuidedSection.tsx`
- `supabase/functions/assistant-ia/index.ts`
- (Auth reset) `src/pages/Auth.tsx`
