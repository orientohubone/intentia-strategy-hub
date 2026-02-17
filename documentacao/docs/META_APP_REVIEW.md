# Meta App Review — Instruções para Análise

> Documento preparado para o processo de revisão do app Meta (Facebook Developer Platform).  
> Última atualização: 17 de Fevereiro de 2026

---

## 1. Onde encontrar o app (URL)

**URL de produção:**
```
https://intentia.com.br
```

O app é uma aplicação web (SPA) acessível via navegador em qualquer dispositivo. Não é um app nativo mobile — funciona em desktop e mobile via browser.

**URLs relevantes:**
| Página | URL |
|---|---|
| Landing page | https://intentia.com.br |
| Login / Cadastro | https://intentia.com.br/auth |
| Integrações (onde o Meta Ads é conectado) | https://intentia.com.br/integracoes |
| Política de Privacidade | https://intentia.com.br/politica-de-privacidade |
| Termos de Serviço | https://intentia.com.br/termos-de-servico |
| Instrução de Exclusão de Dados | https://intentia.com.br/exclusao-de-dados |

---

## 2. Instruções de acesso e teste passo a passo

### Passo 1 — Criar conta ou usar credenciais de teste

Acesse `https://intentia.com.br/auth` e crie uma conta gratuita, ou use as credenciais de teste abaixo:

**Credenciais de teste (conta Starter gratuita):**
```
Email: meta-review@orientohub.com.br
Senha: MetaReview2026!
```

> Estas credenciais permanecerão ativas por pelo menos 1 ano após o envio (até Fevereiro de 2027).

### Passo 2 — Acessar o Dashboard

Após o login, você será redirecionado para o **Dashboard** principal. O menu lateral esquerdo contém todas as seções do app.

### Passo 3 — Navegar até Integrações

1. No menu lateral, clique em **"Integrações"** (seção "Integrações" no sidebar)
2. Você verá 4 cards de integrações: **Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads**
3. Clique no botão **"Conectar"** no card do **Meta Ads**

### Passo 4 — Fluxo de conexão OAuth com Meta

1. Ao clicar em "Conectar", o app redireciona para a tela de autorização do Facebook/Meta
2. O usuário autoriza o acesso à conta de anúncios
3. Após autorização, o Meta redireciona de volta para o app
4. O app exibe uma tela de confirmação e redireciona para a página de Integrações
5. O card do Meta Ads agora mostra o status "Conectado" com informações da conta

### Passo 5 — Funcionalidades após conexão

Após conectar o Meta Ads, o usuário pode:
- **Ver informações da conta** conectada (ID, nome da conta)
- **Sincronizar dados** de campanhas e métricas (impressões, cliques, gastos)
- **Desconectar** a integração a qualquer momento
- **Ver histórico** de sincronizações com status e contadores

---

## 3. Confirmação de uso das APIs da Meta

### APIs e permissões utilizadas

O app **Intentia Strategy Hub** utiliza a **Meta Marketing API** (Graph API v19.0) para importar dados de campanhas de anúncios dos usuários. 

**NÃO utilizamos Facebook Login para autenticação de usuários.** A autenticação do app é feita via Supabase Auth (email + senha). O OAuth do Meta é usado **exclusivamente** para conectar contas de anúncios do Meta Ads.

### Permissões OAuth solicitadas

| Permissão | Finalidade |
|---|---|
| `ads_read` | Leitura de campanhas, ad sets e anúncios da conta do Meta Ads |
| `ads_management` | Gerenciamento e organização de campanhas dentro da plataforma |
| `read_insights` | Leitura de métricas de performance (impressões, cliques, gastos, conversões) |

### O que fazemos com os dados

1. **Importamos campanhas** — Nome, status, objetivo, orçamento, datas
2. **Importamos métricas** — Impressões, cliques, CTR, CPC, gastos, conversões (últimos 30 dias)
3. **Exibimos dashboards** — O usuário visualiza a performance das campanhas dentro da plataforma Intentia
4. **Análise estratégica** — Os dados são usados para gerar insights e recomendações de otimização

### O que NÃO fazemos

- **NÃO** acessamos dados pessoais de usuários do Facebook/Instagram
- **NÃO** publicamos conteúdo em nome do usuário
- **NÃO** acessamos mensagens, amigos, fotos ou qualquer dado social
- **NÃO** compartilhamos dados com terceiros
- **NÃO** usamos Facebook Login para autenticação

### Fluxo técnico resumido

```
1. Usuário clica "Conectar" no card Meta Ads
2. App redireciona para Facebook OAuth (dialog/oauth)
3. Usuário autoriza permissões (ads_read, ads_management, read_insights)
4. Facebook redireciona para nosso callback com authorization code
5. Backend troca code por access_token via Graph API
6. Backend busca informações da conta de anúncios (ID, nome)
7. Tokens são armazenados de forma segura (criptografados, isolados por usuário via RLS)
8. Usuário pode sincronizar campanhas e métricas sob demanda
```

---

## 4. Credenciais de teste e acesso

### Conta de teste da plataforma

```
URL:   https://intentia.com.br/auth
Email: meta-review@orientohub.com.br
Senha: MetaReview2026!
Plano: Starter (gratuito — acesso completo às integrações)
```

> **Não é necessário pagamento.** O plano Starter (gratuito) já inclui acesso à funcionalidade de integrações com Meta Ads. Todas as funcionalidades relevantes para esta revisão estão disponíveis sem assinatura.

### Usuário de teste do Facebook

Se necessário, podemos criar um **usuário de teste do Facebook** vinculado ao app para que os analistas possam testar o fluxo OAuth sem usar uma conta pessoal. Caso seja necessário, entre em contato e forneceremos as credenciais do usuário de teste.

### Códigos de acesso / pagamento

**Não aplicável.** O app é uma aplicação web gratuita (plano Starter) acessível via navegador. Não requer:
- Download em loja de apps
- Pagamento ou assinatura para acessar a funcionalidade de integrações
- Códigos de presente ou vouchers

---

## 5. Restrições geográficas

**Não há restrições geográficas.** O app é acessível globalmente, sem geo-blocking ou geo-fencing. Qualquer analista em qualquer localização pode acessar:

- A URL de produção: `https://intentia.com.br`
- O fluxo de login e cadastro
- A página de integrações e o fluxo OAuth com Meta
- Todas as funcionalidades da plataforma

O app está hospedado em infraestrutura global (Netlify + Supabase) com CDN distribuído mundialmente.

---

## 6. URLs de conformidade

| Documento | URL |
|---|---|
| Política de Privacidade | https://intentia.com.br/politica-de-privacidade |
| Termos de Serviço | https://intentia.com.br/termos-de-servico |
| Política de Cookies | https://intentia.com.br/politica-de-cookies |
| Instrução de Exclusão de Dados | https://intentia.com.br/exclusao-de-dados |
| Data Deletion Callback (endpoint) | https://vofizgftwxgyosjrwcqy.supabase.co/functions/v1/data-deletion-callback |

---

## 7. Informações do app

| Campo | Valor |
|---|---|
| Nome do App | Intentia Strategy Hub |
| Tipo | Aplicação Web (SPA — Single Page Application) |
| Framework | React + TypeScript + Vite |
| Backend | Supabase (PostgreSQL + Edge Functions) |
| Hospedagem | Netlify (frontend) + Supabase (backend) |
| Empresa | Oriento Hub — CNPJ: [inserir CNPJ] |
| Contato | intentia@orientohub.com.br |
| Telefone | +55 (14) 99861-8547 |
| Endereço | Rua Eduardo Paulo de Souza, 296 — Pompeia, SP 17584-284, Brasil |

---

## 8. Resumo para o formulário de revisão

### "Onde podemos encontrar este app?"
```
https://intentia.com.br
```

### "Forneça instruções sobre como acessar o app"
```
1. Acesse https://intentia.com.br/auth
2. Faça login com: meta-review@orientohub.com.br / MetaReview2026!
3. No menu lateral, clique em "Integrações"
4. No card "Meta Ads", clique em "Conectar"
5. Autorize o acesso na tela do Facebook
6. Após autorização, você será redirecionado de volta ao app
7. O card mostrará status "Conectado" com dados da conta

O app utiliza a Meta Marketing API (Graph API v19.0) para importar dados de campanhas de anúncios. NÃO utilizamos Facebook Login para autenticação — usamos OAuth exclusivamente para conectar contas de anúncios do Meta Ads. As permissões solicitadas são: ads_read, ads_management e read_insights.
```

### "Credenciais de teste"
```
Email: meta-review@orientohub.com.br
Senha: MetaReview2026!

Não é necessário pagamento. O plano Starter (gratuito) inclui acesso completo às integrações. Estas credenciais permanecerão ativas por pelo menos 1 ano.
```

### "Restrições geográficas"
```
Não há restrições geográficas. O app é acessível globalmente via navegador em qualquer dispositivo. Não há geo-blocking ou geo-fencing.
```

---

## 9. Checklist pré-submissão

- [ ] Conta de teste criada no Supabase Auth (meta-review@orientohub.com.br)
- [ ] Tenant settings criado para a conta de teste
- [ ] Página de exclusão de dados publicada (/exclusao-de-dados)
- [ ] Data Deletion Callback deployado (data-deletion-callback Edge Function)
- [ ] Política de Privacidade atualizada com menção ao Meta
- [ ] URLs de conformidade configuradas no Meta Developer Console
- [ ] App em modo "Live" no Meta Developer Console
- [ ] Permissões solicitadas: ads_read, ads_management, read_insights
