# Manuais de Integração — Intentia Strategy Hub

Documentação completa para configurar cada integração com plataformas de anúncios.

## Providers Disponíveis

| Provider | Manual | Developer Console |
|----------|--------|-------------------|
| Google Ads | [GOOGLE_ADS.md](./GOOGLE_ADS.md) | [console.cloud.google.com](https://console.cloud.google.com) |
| Meta Ads | [META_ADS.md](./META_ADS.md) | [developers.facebook.com](https://developers.facebook.com) |
| LinkedIn Ads | [LINKEDIN_ADS.md](./LINKEDIN_ADS.md) | [linkedin.com/developers](https://www.linkedin.com/developers/) |
| TikTok Ads | [TIKTOK_ADS.md](./TIKTOK_ADS.md) | [business-api.tiktok.com](https://business-api.tiktok.com/portal/docs) |

## Configuração Geral

### 1. Supabase Secrets (obrigatório para todos)

```
APP_URL = https://seu-dominio.com.br
```

### 2. Callback URL (mesma para todos os providers)

```
https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/oauth-callback
```

Registre esta URL no developer console de cada provider que ativar.

### 3. Edge Functions

| Function | Descrição |
|----------|-----------|
| `oauth-connect` | Inicia o fluxo OAuth (redirect para provider) |
| `oauth-callback` | Recebe callback, troca code por tokens, salva no DB |
| `integration-sync` | Sincroniza campanhas e métricas via API do provider |

### 4. Tabelas SQL

Executar `supabase/ad_integrations.sql` no SQL Editor do Supabase antes de usar.

## Arquitetura

```
Usuário → Conectar → oauth-connect → Provider OAuth → oauth-callback → DB → Frontend
Usuário → Sincronizar → integration-sync → Provider API → campaign_metrics → DB
```

- Tokens isolados por `user_id` com RLS
- Refresh automático de tokens expirados
- Sync logs com status, duração e contadores
