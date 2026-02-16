# Integrações OAuth — Intentia Strategy Hub

## Providers Suportados

| Provider | Status | API Version |
|---|---|---|
| Google Ads | Em desenvolvimento | v16 |
| Meta Ads | Em desenvolvimento | Graph API v19.0 |
| LinkedIn Ads | Em desenvolvimento | REST API v202401 |
| TikTok Ads | Em desenvolvimento | Business API v1.3 |

---

## Fluxo OAuth Completo

```
1. Usuário clica "Conectar" no card do provider
2. Frontend faz POST para oauth-connect Edge Function (com Authorization header)
3. Edge Function valida sessão, gera state (user_id+provider+ts em base64), retorna JSON com URL
4. Frontend redireciona para OAuth do provider
5. Usuário autoriza acesso à conta de anúncios
6. Provider redireciona para oauth-callback Edge Function (GET com code+state)
7. Edge Function decodifica state, troca code por tokens, busca account info
8. Upsert em ad_integrations com tokens isolados por user_id (RLS)
9. Redireciona para /oauth/callback no frontend com params de sucesso/erro
10. OAuthCallback.tsx mostra status, espera sessão restaurar, redireciona para /integracoes
```

## Sincronização de Dados

```
1. Usuário clica "Sincronizar" no card ou dialog
2. Frontend faz POST para integration-sync Edge Function
3. Edge Function verifica token expirado → auto-refresh se necessário
4. Busca campanhas via API do provider
5. Para cada campanha, busca métricas (últimos 30 dias)
6. Insere em campaign_metrics com source: 'api'
7. Cria sync log com contadores (fetched/created/updated/failed)
8. Atualiza last_sync_at na integração
```

---

## Edge Functions

### `oauth-connect`
- Recebe provider via body (POST) + token via Authorization header
- Valida sessão, lê client_id do env, gera state (base64 JSON)
- Retorna JSON com URL de autorização
- JWT verification desabilitado (necessário para fluxo OAuth)

### `oauth-callback`
- Recebe redirect do provider (GET com code+state)
- Decodifica state, valida idade (max 10min)
- Troca code por tokens (formato especial para TikTok: JSON ao invés de form-encoded)
- Busca account info via API do provider
- Upsert em ad_integrations
- Redireciona para /oauth/callback no frontend

### `integration-sync`
- Recebe provider + integration_id via POST com Authorization header
- Verifica token expirado → auto-refresh via refresh_token
- Busca campanhas + métricas via API do provider
- Insere em campaign_metrics com source:'api'
- Cria sync log com contadores

---

## Schema SQL (`ad_integrations.sql`)

### Tabelas
- **`ad_integrations`** — provider, status, OAuth tokens, account info, sync config, project_mappings (JSONB), scopes, error tracking
- **`integration_sync_logs`** — sync history com status, duração, records fetched/created/updated/failed, período, erros

### View
- **`v_integration_summary`** — join ad_integrations + sync logs agregados

### Constraints
- RLS por user_id em ambas as tabelas
- unique(user_id, provider)
- Trigger updated_at, indexes

---

## Frontend

### Página Integrações (`/integracoes`)
- Grid 2x2 de cards (Google, Meta, LinkedIn, TikTok)
- Ícones SVG reais dos providers
- Status badge, account info, last sync, frequência
- Fluxo: fetch oauth-connect → recebe URL → redirect
- Sync manual, disconnect/delete com AlertDialog
- Dialog de detalhes com histórico de syncs

### OAuthCallback (`/oauth/callback`)
- Rota pública (sem ProtectedRoute)
- Mostra status (success/error/processing)
- Espera sessão restaurar do localStorage (retry loop 10×500ms)
- Redireciona para /integracoes

### Config (`integrationOAuth.ts`)
- OAuthProviderConfig por provider (authUrl, tokenUrl, scopes, clientIdEnvKey)
- generateOAuthState(), getOAuthConnectUrl(), getOAuthCallbackUrl()

---

## Segurança OAuth

- **Tokens isolados** por user_id via RLS
- **State parameter** com user_id + provider + timestamp, validado com expiração de 10 min
- **Client credentials compartilhadas** — 1 app OAuth da Intentia por provider (padrão SaaS)
- **Auto-refresh** de tokens — integration-sync verifica expiração e renova
- **Fallback expired** — se refresh falhar, marca integração como "expired"

---

## Env Vars (Supabase Secrets)

```
APP_URL — URL do frontend para redirect
GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN
META_ADS_CLIENT_ID, META_ADS_CLIENT_SECRET
LINKEDIN_ADS_CLIENT_ID, LINKEDIN_ADS_CLIENT_SECRET
TIKTOK_ADS_CLIENT_ID, TIKTOK_ADS_CLIENT_SECRET
```

### Callback URL (mesma para todos)
```
https://vofizgftwxgyosjrwcqy.supabase.co/functions/v1/oauth-callback
```
