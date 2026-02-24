# Manual de Integração — Meta Ads (Facebook & Instagram)

## Visão Geral

A integração com o Meta Ads permite importar campanhas, conjuntos de anúncios e métricas de performance do Facebook Ads e Instagram Ads diretamente para o Intentia Strategy Hub. Os dados alimentam os módulos de Operações, Budget, Benchmark e Insights.

### Dados Importados

- Campanhas (nome, status, orçamento diário/vitalício, datas)
- Impressões, cliques, alcance
- Conversões (purchases, leads, registrations)
- Custo e receita (spend, purchase value)
- CTR, CPC, CPA, ROAS

---

## Pré-requisitos

1. Conta no Meta Business Suite com acesso a uma conta de anúncios
2. App registrado no Meta for Developers
3. Permissões de Marketing API configuradas

---

## Passo 1 — Criar App no Meta for Developers

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Clique **My Apps** → **Create App**
3. Tipo de app: **Business**
4. Preencha:
   - **App name:** Intentia Strategy Hub
   - **App contact email:** seu email
   - **Business portfolio:** selecione seu Business Manager (ou crie um)
5. Clique **Create App**

---

## Passo 2 — Adicionar Produto Marketing API

1. No dashboard do app, vá em **Add Products**
2. Encontre **Marketing API** e clique **Set Up**
3. Isso habilita o acesso à API de anúncios

---

## Passo 3 — Configurar OAuth

1. No menu lateral do app: **App Settings → Basic**
2. Copie o **App ID** (este é o Client ID) e o **App Secret** (Client Secret)
3. Em **App Domains**, adicione seu domínio (ex: `intentia.com.br`)
4. Vá em **Facebook Login → Settings**
5. Em **Valid OAuth Redirect URIs**, adicione:
   ```
   https://ccmubburnrrxmkhydxoz.supabase.co/functions/v1/oauth-callback
   ```
6. Clique **Save Changes**

---

## Passo 4 — Configurar Permissões

1. Vá em **App Review → Permissions and Features**
2. Solicite as seguintes permissões:

| Permissão | Descrição | Necessário para |
|-----------|-----------|-----------------|
| `ads_read` | Leitura de dados de anúncios | Importar campanhas e métricas |
| `ads_management` | Gerenciamento de anúncios | Acesso completo à conta |
| `read_insights` | Leitura de insights | Métricas de performance |

> **Nota:** Em modo Development, você pode testar com seu próprio usuário. Para produção, as permissões precisam ser aprovadas pelo Meta App Review.

---

## Passo 5 — Configurar Secrets no Supabase

No Supabase Dashboard → **Settings → Edge Functions → Secrets**, adicione:

| Secret | Valor |
|--------|-------|
| `META_ADS_CLIENT_ID` | App ID do passo 3 |
| `META_ADS_CLIENT_SECRET` | App Secret do passo 3 |
| `APP_URL` | URL do seu app (ex: `https://intentia.com.br`) |

---

## Passo 6 — Testar a Integração

1. Acesse o Intentia Strategy Hub → **Integrações**
2. Clique no card **Meta Ads**
3. Clique **Conectar Meta Ads**
4. Autorize o acesso na tela do Facebook
5. Selecione a conta de anúncios que deseja conectar
6. Você será redirecionado de volta com status "Conectado"
7. Clique **Sincronizar Agora** para importar dados

---

## Fluxo Técnico

```
Usuário clica "Conectar"
  → Frontend redireciona para oauth-connect Edge Function
  → Edge Function redireciona para Facebook OAuth Dialog (v19.0)
  → Usuário autoriza e seleciona conta de anúncios
  → Facebook redireciona para oauth-callback Edge Function
  → Edge Function troca code por access_token
  → Busca info do usuário via Graph API (/me)
  → Salva token em ad_integrations (isolado por user_id)
  → Redireciona para /oauth/callback no frontend
```

---

## Sincronização de Dados

### Endpoints Utilizados

| Endpoint | Dados |
|----------|-------|
| `GET /act_{account_id}/campaigns` | Lista de campanhas com status e orçamento |
| `GET /{campaign_id}/insights` | Métricas de performance (últimos 30 dias) |

### Campos Importados

```
campaigns: id, name, status, daily_budget, lifetime_budget, start_time, stop_time
insights: impressions, clicks, actions, spend, action_values
```

### Parsing de Conversões

O Meta retorna conversões no array `actions` com `action_type`. O sync busca:
- `purchase` → conversões
- `action_values` com `purchase` → receita

### Refresh de Token

- Tokens do Meta têm validade de **60 dias** (long-lived)
- Não há refresh automático — quando expirar, o usuário precisa reconectar
- O sistema marca a integração como "expired" automaticamente

---

## Escopos Utilizados

| Escopo | Permissão |
|--------|-----------|
| `ads_read` | Leitura de campanhas e dados de anúncios |
| `ads_management` | Gerenciamento de campanhas |
| `read_insights` | Leitura de métricas e relatórios |

---

## Modos do App

### Development Mode
- Apenas administradores e test users podem usar
- Sem limite de chamadas para teste
- Ideal para desenvolvimento e validação

### Live Mode
- Requer App Review aprovado pelo Meta
- Disponível para todos os usuários
- Necessário para produção

### Como publicar para Live Mode

1. **App Review → Permissions**: solicite `ads_read`, `ads_management`, `read_insights`
2. **App Review → Requests**: submeta com:
   - Descrição de uso (ex: "Importação de métricas de campanhas para análise estratégica")
   - Screencast demonstrando o fluxo
   - Política de privacidade (URL)
3. Aguarde aprovação (geralmente 1-5 dias úteis)

---

## Solução de Problemas

### "Can't load URL: The domain of this URL isn't included in the app's domains"
- Adicione seu domínio em **App Settings → Basic → App Domains**
- Verifique se a redirect URI está em **Facebook Login → Settings**

### "Error validating access token: Session has expired"
- Token expirou (validade de 60 dias)
- Desconecte e reconecte a integração

### "Unsupported get request. Object with ID does not exist"
- A conta de anúncios pode ter sido removida ou o acesso revogado
- Reconecte com a conta correta

### "(#100) Missing permissions"
- As permissões `ads_read` ou `read_insights` não foram aprovadas
- Em Development Mode, verifique se o usuário é admin/tester do app

### "Application request limit reached"
- Rate limit da Graph API atingido
- Aguarde alguns minutos e tente novamente
- Considere aumentar a frequência de sync

---

## Links Úteis

- [Meta for Developers](https://developers.facebook.com)
- [Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [App Review Guide](https://developers.facebook.com/docs/app-review)
- [Rate Limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting)
- [Permissions Reference](https://developers.facebook.com/docs/permissions/reference)

---

## Resposta para App Review (Acesso padrão ao gerenciamento de anúncios / ads_read ou ads_management)

**Como usamos a permissão/recurso**
- O app conecta contas de anúncios Meta de um usuário (anunciantes/autônomos/PMEs) para importar métricas de campanhas, conjuntos de anúncios e anúncios.
- Usamos `ads_read` (ou `ads_management`, caso exigido) estritamente para leitura de dados de performance e insights agregados, nunca para criar/editar campanhas pelo app.
- As leituras alimentam dashboards e planos táticos dentro da plataforma Intentia: consolidação de custos, impressões, cliques, CTR, CPA/ROAS e aprendizado de criativos.
- Os dados são usados para gerar recomendações agregadas (sem PII) e orientar decisões de investimento entre canais (Google/Meta/LinkedIn/TikTok), evitando gastos ineficientes.

**Valor para a pessoa usuário**
- Visualiza, em um só lugar, o desempenho das campanhas Meta junto com outros canais, com alertas de oportunidades/risco.
- Recebe plano de comunicação e recomendações táticas baseados em resultados reais (dados agregados), otimizando ROI e tempo.
- Reduz esforço manual de exportar/conciliar relatórios de múltiplas contas/canais.

**Por que é necessário**
- Sem `ads_read`/`ads_management`, o app não consegue importar métricas de campanhas/ads e não entrega análises cruzadas nem alertas.
- A permissão é essencial para calcular KPIs (CTR, CPC, CPA, ROAS) e gerar recomendações de budget e criativos.
- Todo uso é de leitura e para análises agregadas/anônimas; não reidentificamos dados nem compartilhamos PII.
