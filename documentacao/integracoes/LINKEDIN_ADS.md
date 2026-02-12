# Manual de Integração — LinkedIn Ads

## Visão Geral

A integração com o LinkedIn Ads permite importar campanhas, métricas de performance e dados de investimento do LinkedIn Campaign Manager diretamente para o Intentia Strategy Hub. Ideal para empresas B2B que utilizam LinkedIn como canal principal de geração de leads.

### Dados Importados

- Campanhas (nome, status, orçamento total/diário, datas)
- Impressões, cliques
- Conversões (external website conversions)
- Custo em moeda local
- CTR, CPC, CPA

---

## Pré-requisitos

1. Conta LinkedIn com acesso a uma conta de anúncios (Campaign Manager)
2. LinkedIn Page associada à conta de anúncios
3. App registrado no LinkedIn Developer Portal

---

## Passo 1 — Criar App no LinkedIn Developer Portal

1. Acesse [linkedin.com/developers](https://www.linkedin.com/developers/)
2. Clique **Create App**
3. Preencha:
   - **App name:** Intentia Strategy Hub
   - **LinkedIn Page:** selecione a página da sua empresa
   - **Privacy policy URL:** URL da sua política de privacidade
   - **App logo:** logo do Intentia (300x300px)
4. Marque o checkbox de termos
5. Clique **Create App**

---

## Passo 2 — Solicitar Produtos (APIs)

1. No app criado, vá na aba **Products**
2. Solicite acesso aos seguintes produtos:

| Produto | Descrição | Status |
|---------|-----------|--------|
| **Advertising API** | Acesso a campanhas e métricas | Requer aprovação |
| **Community Management API** | Dados da organização | Auto-aprovado |

> **Nota:** O acesso à Advertising API requer aprovação do LinkedIn. O processo pode levar de 1 a 2 semanas. Enquanto aguarda, você pode desenvolver e testar com dados limitados.

### Como solicitar Advertising API

1. Na aba **Products**, clique **Request Access** em "Advertising API"
2. Preencha o formulário:
   - **Use case:** "Importação de métricas de campanhas para plataforma de análise estratégica B2B"
   - **Company website:** URL do seu site
   - **Expected API call volume:** Low (< 100k/day)
3. Aguarde aprovação por email

---

## Passo 3 — Configurar OAuth 2.0

1. Vá na aba **Auth**
2. Copie o **Client ID** e **Client Secret**
3. Em **Authorized redirect URLs for your app**, adicione:
   ```
   https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/oauth-callback
   ```
4. Clique **Update**

### Escopos OAuth

Na mesma aba **Auth**, verifique se os seguintes escopos estão disponíveis:

| Escopo | Descrição |
|--------|-----------|
| `r_ads` | Leitura de dados de anúncios |
| `r_ads_reporting` | Leitura de relatórios de anúncios |
| `r_organization_social` | Leitura de dados da organização |

> Os escopos ficam disponíveis após a aprovação dos produtos no passo 2.

---

## Passo 4 — Configurar Secrets no Supabase

No Supabase Dashboard → **Settings → Edge Functions → Secrets**, adicione:

| Secret | Valor |
|--------|-------|
| `LINKEDIN_ADS_CLIENT_ID` | Client ID do passo 3 |
| `LINKEDIN_ADS_CLIENT_SECRET` | Client Secret do passo 3 |
| `APP_URL` | URL do seu app (ex: `https://intentia.com.br`) |

---

## Passo 5 — Testar a Integração

1. Acesse o Intentia Strategy Hub → **Integrações**
2. Clique no card **LinkedIn Ads**
3. Clique **Conectar LinkedIn Ads**
4. Autorize o acesso na tela do LinkedIn
5. Você será redirecionado de volta com status "Conectado"
6. Clique **Sincronizar Agora** para importar dados

---

## Fluxo Técnico

```
Usuário clica "Conectar"
  → Frontend redireciona para oauth-connect Edge Function
  → Edge Function redireciona para LinkedIn OAuth 2.0
  → Usuário autoriza acesso
  → LinkedIn redireciona para oauth-callback Edge Function
  → Edge Function troca code por access_token
  → Busca info do perfil via /v2/me
  → Salva token em ad_integrations (isolado por user_id)
  → Redireciona para /oauth/callback no frontend
```

---

## Sincronização de Dados

### Endpoints Utilizados

| Endpoint | Dados | Versão |
|----------|-------|--------|
| `GET /rest/adCampaigns` | Lista de campanhas | v202401 |
| `GET /rest/adAnalytics` | Métricas de performance | v202401 |

### Headers Obrigatórios

```
Authorization: Bearer {access_token}
LinkedIn-Version: 202401
X-Restli-Protocol-Version: 2.0.0
```

### Campos Importados

```
adCampaigns: id, name, status, totalBudget, dailyBudget, runSchedule
adAnalytics: impressions, clicks, externalWebsiteConversions, costInLocalCurrency
```

### Particularidades

- **Valores monetários:** LinkedIn retorna em centavos — o sync divide por 100
- **URNs:** IDs são no formato `urn:li:sponsoredCampaign:{id}` — o sync extrai o ID numérico
- **Receita:** LinkedIn não retorna receita diretamente — campo `revenue` fica como 0
- **Período:** Analytics são buscados com `timeGranularity=ALL` para o período completo

### Refresh de Token

- Tokens do LinkedIn expiram em **60 dias**
- Refresh tokens expiram em **365 dias**
- O sistema tenta refresh automático quando o token expira
- Se o refresh falhar, marca como "expired" e o usuário precisa reconectar

---

## Escopos Utilizados

| Escopo | Permissão |
|--------|-----------|
| `r_ads` | Leitura de campanhas e dados de anúncios |
| `r_ads_reporting` | Leitura de relatórios e métricas |
| `r_organization_social` | Leitura de dados da organização |

---

## Limites da API

| Recurso | Limite |
|---------|--------|
| Chamadas por dia | 100.000 (padrão) |
| Chamadas por minuto | 100 |
| Campanhas por request | 100 (paginado) |

---

## Solução de Problemas

### "Application is not authorized to access this API"
- A Advertising API ainda não foi aprovada
- Verifique o status em **Products** no Developer Portal

### "Invalid redirect_uri"
- A callback URL não confere com a registrada
- Deve ser exatamente: `https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/oauth-callback`

### "The token used in the request has expired"
- Token expirou (validade de 60 dias)
- Desconecte e reconecte a integração

### "Not enough permissions to access"
- Os escopos `r_ads` ou `r_ads_reporting` não estão disponíveis
- Verifique se o produto Advertising API foi aprovado

### "Resource not found"
- A conta de anúncios pode não ter campanhas
- Ou o ID da conta está incorreto

### Sem dados de conversão
- LinkedIn não retorna conversões se o Insight Tag não estiver instalado no site
- Configure o LinkedIn Insight Tag no site do cliente

---

## Links Úteis

- [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
- [Advertising API Docs](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads/)
- [Campaign Manager](https://www.linkedin.com/campaignmanager/)
- [OAuth 2.0 Guide](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [Ad Analytics API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/ads-reporting/ads-reporting)
- [Rate Limits](https://learn.microsoft.com/en-us/linkedin/shared/api-guide/concepts/rate-limits)
