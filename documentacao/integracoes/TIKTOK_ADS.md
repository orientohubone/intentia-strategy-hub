# Manual de Integração — TikTok Ads

## Visão Geral

A integração com o TikTok Ads permite importar campanhas, métricas de performance e dados de investimento do TikTok Ads Manager diretamente para o Intentia Strategy Hub. Ideal para marcas que utilizam TikTok como canal de awareness, engajamento e conversão.

### Dados Importados

- Campanhas (nome, status, orçamento)
- Impressões, cliques
- Conversões
- Custo (spend)
- CTR, CPC, CPA

---

## Pré-requisitos

1. Conta TikTok for Business com acesso ao Ads Manager
2. App registrado no TikTok for Developers (Business Center)
3. Advertiser ID da conta de anúncios

---

## Passo 1 — Criar App no TikTok for Developers

1. Acesse [business-api.tiktok.com/portal/docs](https://business-api.tiktok.com/portal/docs)
2. Clique em **My Apps** → **Create an App**
3. Preencha:
   - **App name:** Intentia Strategy Hub
   - **Description:** Plataforma de análise estratégica para marketing B2B
   - **App icon:** logo do Intentia
4. Clique **Submit**

---

## Passo 2 — Configurar Permissões

1. No app criado, vá em **Manage App**
2. Na seção **Scopes**, solicite:

| Escopo | Descrição | Necessário para |
|--------|-----------|-----------------|
| `ad.read` | Leitura de dados de anúncios | Importar campanhas |
| `campaign.read` | Leitura de campanhas | Listar campanhas e status |
| `report.read` | Leitura de relatórios | Métricas de performance |

3. Clique **Save**

---

## Passo 3 — Configurar OAuth

1. Na configuração do app, vá em **Authorization**
2. Em **Redirect URI**, adicione:
   ```
   https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/oauth-callback
   ```
3. Copie o **App ID** (Client ID) e **App Secret** (Client Secret)

> **Nota:** O App ID e App Secret ficam visíveis na página principal do app em **My Apps**.

---

## Passo 4 — Obter Advertiser ID

1. Acesse [ads.tiktok.com](https://ads.tiktok.com)
2. No canto superior direito, clique no nome da conta
3. O **Advertiser ID** aparece abaixo do nome (número de ~13 dígitos)
4. Ou vá em **Account Settings** para ver todos os IDs

> O Advertiser ID é necessário para as chamadas de API. Ele é capturado automaticamente durante o fluxo OAuth quando o usuário autoriza a conta.

---

## Passo 5 — Configurar Secrets no Supabase

No Supabase Dashboard → **Settings → Edge Functions → Secrets**, adicione:

| Secret | Valor |
|--------|-------|
| `TIKTOK_ADS_CLIENT_ID` | App ID do passo 3 |
| `TIKTOK_ADS_CLIENT_SECRET` | App Secret do passo 3 |
| `APP_URL` | URL do seu app (ex: `https://intentia.com.br`) |

---

## Passo 6 — Testar a Integração

1. Acesse o Intentia Strategy Hub → **Integrações**
2. Clique no card **TikTok Ads**
3. Clique **Conectar TikTok Ads**
4. Autorize o acesso na tela do TikTok
5. Selecione a conta de anúncios (advertiser)
6. Você será redirecionado de volta com status "Conectado"
7. Clique **Sincronizar Agora** para importar dados

---

## Fluxo Técnico

```
Usuário clica "Conectar"
  → Frontend redireciona para oauth-connect Edge Function
  → Edge Function redireciona para TikTok Business OAuth
  → Usuário autoriza e seleciona advertiser
  → TikTok redireciona para oauth-callback Edge Function
  → Edge Function troca auth_code por access_token (formato JSON, não form-encoded)
  → Salva token em ad_integrations (isolado por user_id)
  → Redireciona para /oauth/callback no frontend
```

### Particularidade do TikTok OAuth

O TikTok usa um formato diferente dos outros providers para troca de tokens:

```json
// Request (JSON, não form-encoded)
{
  "app_id": "CLIENT_ID",
  "secret": "CLIENT_SECRET",
  "auth_code": "CODE"
}

// Response (dados dentro de .data)
{
  "data": {
    "access_token": "...",
    "advertiser_id": "...",
    "advertiser_name": "..."
  }
}
```

O `oauth-callback` já trata essa diferença automaticamente.

---

## Sincronização de Dados

### Endpoints Utilizados

| Endpoint | Dados | Versão |
|----------|-------|--------|
| `GET /campaign/get/` | Lista de campanhas | v1.3 |
| `GET /report/integrated/get/` | Métricas de performance | v1.3 |

### Headers Obrigatórios

```
Access-Token: {access_token}
Content-Type: application/json
```

> **Nota:** O TikTok usa `Access-Token` no header (não `Authorization: Bearer`).

### Campos Importados

```
campaign/get: campaign_id, campaign_name, operation_status, budget
report/integrated/get: spend, impressions, clicks, conversion
```

### Métricas do Report

| Métrica | Descrição |
|---------|-----------|
| `spend` | Valor gasto |
| `impressions` | Impressões |
| `clicks` | Cliques |
| `conversion` | Conversões totais |
| `total_complete_payment_rate` | Taxa de pagamento completo |

### Particularidades

- **Valores monetários:** TikTok retorna valores diretos (não em centavos)
- **Receita:** TikTok não retorna receita diretamente — campo `revenue` fica como 0
- **Datas:** Campanhas do TikTok não têm datas de início/fim expostas na API de listagem
- **Paginação:** Máximo 100 campanhas por request (`page_size=100`)

### Refresh de Token

- Tokens do TikTok expiram em **24 horas**
- Refresh tokens expiram em **365 dias**
- O sistema tenta refresh automático quando o token expira
- Se o refresh falhar, marca como "expired"

---

## Escopos Utilizados

| Escopo | Permissão |
|--------|-----------|
| `ad.read` | Leitura de dados de anúncios |
| `campaign.read` | Leitura de campanhas |
| `report.read` | Leitura de relatórios e métricas |

---

## Modos do App

### Sandbox Mode
- Para desenvolvimento e testes
- Dados fictícios retornados pela API
- Sem limite de chamadas

### Production Mode
- Requer aprovação do TikTok
- Dados reais das contas de anúncios
- Rate limits aplicados

### Como solicitar Production Mode

1. No app, clique **Apply for Production**
2. Preencha:
   - Descrição do uso
   - Screenshots do fluxo
   - Política de privacidade
3. Aguarde aprovação (geralmente 3-7 dias úteis)

---

## Limites da API

| Recurso | Limite |
|---------|--------|
| Chamadas por segundo | 10 |
| Chamadas por minuto | 600 |
| Chamadas por dia | 864.000 |
| Campanhas por request | 100 (paginado) |

---

## Solução de Problemas

### "App not found or not authorized"
- Verifique se o App ID está correto nos Supabase Secrets
- Verifique se o app está ativo no TikTok for Developers

### "Invalid auth code"
- O auth_code já foi usado ou expirou (validade de 1 hora)
- Tente conectar novamente

### "Advertiser not authorized"
- O usuário não autorizou a conta de anúncios correta
- Desconecte e reconecte selecionando o advertiser correto

### "Access token expired"
- Token expirou (validade de 24 horas)
- O sistema tenta refresh automático
- Se falhar, reconecte a integração

### "Rate limit exceeded"
- Muitas chamadas em pouco tempo
- Aguarde 1 minuto e tente novamente
- Considere aumentar o intervalo de sync

### Sem dados de campanha
- Verifique se a conta tem campanhas criadas no TikTok Ads Manager
- Verifique se o advertiser_id está correto

---

## Links Úteis

- [TikTok for Developers](https://business-api.tiktok.com/portal/docs)
- [Marketing API Docs](https://business-api.tiktok.com/portal/docs?id=1738855176671234)
- [TikTok Ads Manager](https://ads.tiktok.com)
- [OAuth Authorization](https://business-api.tiktok.com/portal/docs?id=1738373164380162)
- [Campaign API](https://business-api.tiktok.com/portal/docs?id=1739315828649986)
- [Reporting API](https://business-api.tiktok.com/portal/docs?id=1738864915188737)
- [Rate Limits](https://business-api.tiktok.com/portal/docs?id=1738363674529793)
