# Manual de Integração — Google Ads

## Visão Geral

A integração com o Google Ads permite importar automaticamente campanhas, métricas de performance e dados de investimento diretamente para o Intentia Strategy Hub. Os dados alimentam os módulos de Operações, Budget, Benchmark e Insights.

### Dados Importados

- Campanhas (nome, status, orçamento, datas)
- Impressões, cliques, conversões
- Custo (CPC, CPA, CPM)
- Receita e ROAS
- CTR e taxa de conversão

---

## Pré-requisitos

1. Conta Google com acesso a uma conta Google Ads
2. Projeto no Google Cloud Console
3. Google Ads API habilitada
4. Credenciais OAuth 2.0 configuradas
5. Developer Token do Google Ads

---

## Passo 1 — Criar Projeto no Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Clique em **Select a project** → **New Project**
3. Nome: `Intentia Strategy Hub` (ou outro de sua preferência)
4. Clique **Create**

---

## Passo 2 — Habilitar a Google Ads API

1. No menu lateral: **APIs & Services → Library**
2. Busque por **"Google Ads API"**
3. Clique no resultado e depois em **Enable**

---

## Passo 3 — Configurar Tela de Consentimento OAuth

1. Vá em **APIs & Services → OAuth consent screen**
2. User type: **External** → **Create**
3. Preencha:
   - **App name:** Intentia Strategy Hub
   - **User support email:** seu email
   - **Developer contact email:** seu email
4. Clique **Save and Continue**
5. Em **Scopes**, clique **Add or Remove Scopes**
   - Adicione: `https://www.googleapis.com/auth/adwords`
   - Clique **Update** → **Save and Continue**
6. Em **Test users**, adicione os emails que vão testar
7. Clique **Save and Continue** → **Back to Dashboard**

> **Nota:** Enquanto o app estiver em modo "Testing", apenas os test users conseguem autorizar. Para produção, publique o app e passe pela verificação do Google.

---

## Passo 4 — Criar Credenciais OAuth 2.0

1. Vá em **APIs & Services → Credentials**
2. Clique **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Nome: `Intentia OAuth`
5. Em **Authorized redirect URIs**, adicione:
   ```
   https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/oauth-callback
   ```
6. Clique **Create**
7. Copie o **Client ID** e **Client Secret**

---

## Passo 5 — Obter Developer Token

1. Acesse [ads.google.com/aw/apicenter](https://ads.google.com/aw/apicenter)
2. Se não tiver acesso, crie uma conta de gerenciamento (MCC) em [ads.google.com/home/tools/manager-accounts](https://ads.google.com/home/tools/manager-accounts/)
3. No API Center, copie o **Developer Token**

> **Nota:** O token começa com status "Test Account" (limite de 15.000 operações/dia). Para produção, solicite aprovação preenchendo o formulário de acesso.

### Níveis de acesso do Developer Token

| Nível | Limite | Uso |
|-------|--------|-----|
| Test Account | 15.000 ops/dia | Desenvolvimento e testes |
| Basic Access | 15.000 ops/dia | Produção com volume baixo |
| Standard Access | Ilimitado | Produção geral |

---

## Passo 6 — Configurar Secrets no Supabase

No Supabase Dashboard → **Settings → Edge Functions → Secrets**, adicione:

| Secret | Valor |
|--------|-------|
| `GOOGLE_ADS_CLIENT_ID` | Client ID do passo 4 |
| `GOOGLE_ADS_CLIENT_SECRET` | Client Secret do passo 4 |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Developer Token do passo 5 |
| `APP_URL` | URL do seu app (ex: `https://intentia.com.br`) |

---

## Passo 7 — Testar a Integração

1. Acesse o Intentia Strategy Hub → **Integrações**
2. Clique no card **Google Ads**
3. Clique **Conectar Google Ads**
4. Autorize o acesso na tela do Google
5. Você será redirecionado de volta com status "Conectado"
6. Clique **Sincronizar Agora** para importar dados

---

## Fluxo Técnico

```
Usuário clica "Conectar"
  → Frontend redireciona para oauth-connect Edge Function
  → Edge Function valida sessão e redireciona para Google OAuth
  → Usuário autoriza no Google
  → Google redireciona para oauth-callback Edge Function
  → Edge Function troca code por tokens (access_token + refresh_token)
  → Busca info da conta Google
  → Salva tokens em ad_integrations (isolado por user_id)
  → Redireciona para /oauth/callback no frontend
  → Frontend mostra sucesso e redireciona para /integracoes
```

---

## Sincronização de Dados

### Manual
- Clique **Sincronizar Agora** no card ou dialog de detalhes
- Chama a Edge Function `integration-sync`
- Busca campanhas via Google Ads API v16
- Para cada campanha, busca métricas (últimos 30 dias)
- Insere em `campaign_metrics` com `source: 'api'`

### Automática
- Configurável por frequência: a cada hora, 6h, 12h, diária ou semanal
- Executada via cron job (a ser configurado)

### Refresh de Token
- O `access_token` do Google expira em 1 hora
- O `integration-sync` verifica expiração antes de cada sync
- Se expirado, usa o `refresh_token` para obter novo token automaticamente
- Se o refresh falhar, marca integração como "expired"

---

## Escopos Utilizados

| Escopo | Permissão |
|--------|-----------|
| `https://www.googleapis.com/auth/adwords` | Leitura e gerenciamento de campanhas Google Ads |

---

## Solução de Problemas

### "OAuth not configured for google_ads"
- Verifique se `GOOGLE_ADS_CLIENT_ID` está nos Supabase Secrets

### "Token expired. Please reconnect."
- O refresh token falhou — clique em Desconectar e reconecte

### "redirect_uri_mismatch"
- A callback URL no Google Cloud Console não confere
- Deve ser exatamente: `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/oauth-callback`

### "access_denied"
- O usuário não está na lista de test users (modo Testing)
- Ou o app não foi publicado para produção

### "Campaigns API returned 403"
- Developer Token pode estar em modo Test e a conta não é de teste
- Ou a API do Google Ads não está habilitada no projeto

---

## Links Úteis

- [Google Cloud Console](https://console.cloud.google.com)
- [Google Ads API Center](https://ads.google.com/aw/apicenter)
- [Google Ads API Docs](https://developers.google.com/google-ads/api/docs/start)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Ads API Scopes](https://developers.google.com/google-ads/api/docs/oauth/overview)
