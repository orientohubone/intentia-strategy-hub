# Edge Functions — Documentação Técnica

## Visão Geral

O Intentia Strategy Hub utiliza **Supabase Edge Functions** (Deno runtime) para executar lógica server-side que não pode rodar no browser. São duas Edge Functions:

| Função | Nome no Supabase | Propósito |
|--------|------------------|-----------|
| `analyze-url` | `rapid-action` | Análise heurística de URLs via fetch + regex |
| `ai-analyze` | `ai-analyze` | Proxy para APIs de IA (Gemini e Claude) |

> **Nota:** O código-fonte está em `supabase/functions/analyze-url/index.ts` e `supabase/functions/ai-analyze/index.ts`, mas o deploy no Supabase usa o nome `rapid-action` para a primeira.

---

## 1. Edge Function: `analyze-url` (deploy: `rapid-action`)

### O que faz

Recebe uma URL, faz **fetch do HTML** da página e executa uma **análise heurística completa** usando regex e contagem de padrões — sem IA, sem dependências externas. Também retorna o **HTML limpo** (snapshot) e os **dados estruturados** extraídos (JSON-LD, Microdata, Open Graph, Twitter Card).

### Fluxo de Execução

```
Frontend (Projects.tsx)
  → urlAnalyzer.ts → supabase.functions.invoke("rapid-action", { body: { url } })
    → Edge Function recebe a URL
      → fetch(url) com User-Agent "IntentiaBot/1.0"
        → Timeout de 15 segundos (AbortController)
        → Segue redirects automaticamente
      → HTML recebido
        → analyzeHTML(html, url)
          → Extração de meta tags (title, description, OG, canonical, favicon, language)
          → Extração de conteúdo (H1-H3, CTAs, forms, imagens, links, vídeo, prova social)
          → Análise técnica (HTTPS, viewport, charset, structured data, analytics, pixels)
          → Cálculo de scores (6 dimensões)
          → Cálculo de channel scores (4 canais)
          → Geração de insights (até 15)
          → Extração de dados estruturados (JSON-LD, Microdata, OG, Twitter Card)
          → Limpeza do HTML (remove scripts, styles, SVGs, comments, max 500KB)
      → Retorna JSON com análise completa + HTML snapshot + structured data
```

### Request

```json
POST /functions/v1/rapid-action
Content-Type: application/json
Authorization: Bearer <supabase_anon_key>

{
  "url": "https://exemplo.com.br"
}
```

### Response (sucesso)

```json
{
  "meta": {
    "title": "Título da Página",
    "description": "Meta description...",
    "ogTitle": "OG Title",
    "ogDescription": "OG Description",
    "ogImage": "https://...",
    "canonical": "https://...",
    "favicon": "/favicon.ico",
    "language": "pt-BR",
    "hasRobotsMeta": true
  },
  "content": {
    "h1": ["Título Principal"],
    "h2": ["Subtítulo 1", "Subtítulo 2"],
    "h3": ["..."],
    "headingHierarchyValid": true,
    "ctaCount": 5,
    "ctaTexts": ["Começar Grátis", "Agendar Demo"],
    "formCount": 2,
    "imageCount": 12,
    "imagesWithAlt": 8,
    "wordCount": 1500,
    "paragraphCount": 20,
    "linkCount": 35,
    "externalLinkCount": 5,
    "hasVideo": true,
    "hasSocialProof": true,
    "hasTestimonials": true,
    "hasPricing": true,
    "hasFAQ": true
  },
  "technical": {
    "hasHttps": true,
    "hasViewport": true,
    "hasCharset": true,
    "hasStructuredData": false,
    "loadTimeEstimate": "Rápido",
    "hasAnalytics": true,
    "hasPixel": true
  },
  "scores": {
    "valueProposition": 75,
    "offerClarity": 80,
    "userJourney": 65,
    "seoReadiness": 70,
    "conversionOptimization": 60,
    "contentQuality": 72
  },
  "channelScores": [
    {
      "channel": "google",
      "score": 72,
      "objective": "Captura de demanda ativa via busca",
      "funnel_role": "Fundo de funil — intenção de compra",
      "is_recommended": true,
      "risks": ["Sem Google Analytics para tracking de conversões"]
    }
  ],
  "insights": [
    {
      "type": "warning",
      "title": "Site sem HTTPS",
      "description": "Seu site não usa HTTPS...",
      "action": "Instale um certificado SSL/TLS"
    }
  ],
  "overallScore": 72,
  "htmlSnapshot": "<!DOCTYPE html><html lang=\"pt-BR\"><head><meta charset=\"UTF-8\">...(HTML limpo, sem scripts/styles/SVGs)...</html>",
  "structuredData": {
    "jsonLd": [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Empresa Exemplo",
        "url": "https://exemplo.com.br",
        "logo": "https://exemplo.com.br/logo.png",
        "sameAs": ["https://linkedin.com/company/exemplo"]
      },
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Plataforma SaaS",
        "offers": { "@type": "Offer", "price": "97", "priceCurrency": "BRL" }
      }
    ],
    "microdata": [
      {
        "type": "https://schema.org/LocalBusiness",
        "properties": { "name": "Empresa Exemplo", "telephone": "+55..." }
      }
    ],
    "openGraph": {
      "og:title": "Empresa Exemplo - Solução B2B",
      "og:description": "Plataforma líder em...",
      "og:image": "https://exemplo.com.br/og.png",
      "og:type": "website",
      "og:url": "https://exemplo.com.br",
      "og:locale": "pt_BR"
    },
    "twitterCard": {
      "twitter:card": "summary_large_image",
      "twitter:site": "@exemplo",
      "twitter:title": "Empresa Exemplo"
    }
  }
}
```

### Erros possíveis

| Status | Causa |
|--------|-------|
| 400 | URL não fornecida ou inválida |
| 422 | Erro ao acessar a URL (timeout, HTTP error, DNS) |
| 500 | Erro interno na análise |

### Como funciona o Parser HTML

O parser é **lightweight e sem dependências** — usa apenas regex nativo do Deno/JavaScript:

- **`extractTag(html, tag)`** — Extrai conteúdo de tags HTML (H1, H2, H3)
- **`extractMetaContent(html, name)`** — Extrai `content` de meta tags por `name` ou `property`
- **`extractTitle(html)`** — Extrai o `<title>`
- **`countPattern(html, regex)`** — Conta ocorrências de um padrão
- **`extractCTAs(html)`** — Identifica CTAs em `<button>`, `<a>` com keywords de ação, e `<input type="submit">`
- **`checkSocialProof/Testimonials/Pricing/FAQ(html)`** — Detecta presença de seções por keywords

### Extração de Dados Estruturados

Além da análise heurística, a Edge Function extrai **4 tipos de dados estruturados**:

| Tipo | Fonte | Função |
|------|-------|--------|
| **JSON-LD** | `<script type="application/ld+json">` | `extractJsonLd()` — Parse JSON, suporta `@graph` arrays |
| **Microdata** | `itemscope` + `itemprop` | `extractMicrodata()` — Extrai tipo e propriedades (max 20 items) |
| **Open Graph** | `<meta property="og:*">` | `extractOpenGraph()` — Todas as tags `og:` |
| **Twitter Card** | `<meta name="twitter:*">` | `extractTwitterCard()` — Todas as tags `twitter:` |

**Dados úteis extraídos:**
- **JSON-LD:** Organization (nome, logo, redes sociais), Product (nome, preço, moeda), LocalBusiness (endereço, telefone), WebSite, BreadcrumbList, FAQPage, Review/AggregateRating
- **Open Graph:** título, descrição, imagem, tipo, locale — essencial para benchmark de presença social
- **Twitter Card:** tipo de card, site, creator — indica maturidade de social media

### HTML Snapshot (cópia limpa)

O HTML retornado é **limpo** para reduzir tamanho e manter apenas conteúdo relevante:

1. Remove `<script>` (inline e externo)
2. Remove `<style>` (inline e externo)
3. Remove comentários HTML (`<!-- -->`)
4. Remove blocos `<svg>` (geralmente grandes e irrelevantes)
5. Remove `<noscript>`
6. Colapsa whitespace múltiplo
7. **Trunca em 500KB** se necessário

**Uso:** Permite comparar a estrutura HTML do site do projeto com concorrentes, identificar padrões de layout, e alimentar análises de IA com contexto real.

### Persistência no Banco

Os novos dados são salvos na tabela `projects`:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `html_snapshot` | `text` | HTML limpo (max 500KB) |
| `structured_data` | `jsonb` | `{ jsonLd, microdata, openGraph, twitterCard }` |
| `html_snapshot_at` | `timestamptz` | Quando o snapshot foi capturado |

**Migration:** `supabase/add_html_snapshot_structured_data.sql`

### Algoritmo de Scoring (6 dimensões)

Cada dimensão começa com um **score base** e ganha pontos por critérios detectados:

| Dimensão | Peso no Score Geral | O que avalia |
|----------|---------------------|--------------|
| **Proposta de Valor** | 25% | Title, description, H1, OG tags, prova social |
| **Clareza da Oferta** | 20% | Hierarquia de headings, CTAs, pricing, FAQ, word count |
| **Jornada do Usuário** | 20% | CTAs, forms, vídeo, prova social, testimonials |
| **SEO Readiness** | 15% | HTTPS, viewport, meta tags, canonical, structured data, alt text |
| **Conversão** | 10% | CTAs, forms, prova social, analytics, pixels |
| **Qualidade do Conteúdo** | 10% | Word count, parágrafos, headings, imagens, vídeo |

**Score Geral** = soma ponderada das 6 dimensões (0-100).

### Algoritmo de Channel Scores (4 canais)

Cada canal tem uma **fórmula ponderada diferente** das 6 dimensões:

| Canal | Fórmula (pesos) | Threshold recomendado |
|-------|-----------------|----------------------|
| **Google Ads** | SEO 30% + Clareza 25% + Conversão 25% + Jornada 20% | ≥ 50 |
| **Meta Ads** | Proposta 30% + Conteúdo 25% + Conversão 25% + Jornada 20% | ≥ 50 |
| **LinkedIn Ads** | Proposta 35% + Clareza 25% + Conteúdo 25% + Conversão 15% | ≥ 50 |
| **TikTok Ads** | Conteúdo 30% + Proposta 25% + Jornada 25% + Conversão 20% | ≥ 40 |

Cada canal também gera **riscos específicos** baseados em elementos ausentes (ex: sem OG Image para Meta, sem vídeo para TikTok).

### Geração de Insights

Insights são gerados automaticamente em 3 categorias:

- **⚠️ Warning** — Problemas críticos (sem HTTPS, sem H1, sem CTAs, sem mobile)
- **💡 Opportunity** — Oportunidades de melhoria (vídeo, prova social, FAQ, structured data)
- **🔧 Improvement** — Otimizações (proposta de valor fraca, clareza baixa, alt text)

Também gera insights de canal: melhor canal recomendado e canais a evitar (score < 40).

Máximo: **15 insights** por análise.

---

## 2. Edge Function: `ai-analyze`

### O que faz

Funciona como **proxy server-side** para chamadas às APIs de IA. Necessário porque:
- A **API da Anthropic (Claude)** não permite chamadas diretas do browser (CORS)
- Centraliza o tratamento de erros e formatação

### Fluxo de Execução

```
Frontend (Projects.tsx ou Benchmark.tsx)
  → aiAnalyzer.ts → supabase.functions.invoke("ai-analyze", { body: { provider, apiKey, model, prompt } })
    → Edge Function
      → Se provider === "anthropic":
          → POST https://api.anthropic.com/v1/messages
          → Headers: x-api-key, anthropic-version
          → Retorna content[0].text
      → Se provider === "google_gemini":
          → POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
          → Query param: key={apiKey}
          → Retorna candidates[0].content.parts[0].text
    → Retorna { text: "..." }
```

### Request

```json
POST /functions/v1/ai-analyze
Content-Type: application/json
Authorization: Bearer <supabase_anon_key>

{
  "provider": "anthropic",
  "apiKey": "sk-ant-...",
  "model": "claude-sonnet-4-20250514",
  "prompt": "Analise o seguinte site..."
}
```

### Response (sucesso)

```json
{
  "text": "{ \"summary\": \"...\", \"investmentReadiness\": 75, ... }"
}
```

### Providers suportados

| Provider | Modelos | Chamada |
|----------|---------|---------|
| `anthropic` | claude-sonnet-4, claude-3-7-sonnet, claude-3-5-haiku, claude-3-haiku, claude-3-opus | API REST direta |
| `google_gemini` | gemini-3-flash-preview, gemini-2.5-flash, gemini-2.5-pro-preview, gemini-2.0-flash | API REST direta |

### Parâmetros de geração

- **Temperature:** 0.4 (balanceado entre criatividade e consistência)
- **Max tokens:** 4096
- **Gemini:** `responseMimeType: "application/json"` para forçar output JSON

### Erros possíveis

| Status | Causa |
|--------|-------|
| 400 | Campos obrigatórios ausentes ou provider não suportado |
| 401/403 | API key inválida ou sem permissão para o modelo |
| 404 | Modelo não encontrado (key não suporta o modelo) |
| 500 | Resposta vazia da API ou erro interno |

---

## 3. Como o Frontend Consome

### Análise Heurística (`urlAnalyzer.ts`)

```typescript
// 1. Chama a Edge Function
const { data, error } = await supabase.functions.invoke("rapid-action", {
  body: { url },
});

// 2. Salva scores no projeto
await supabase.from("projects").update({
  score: data.overallScore,
  status: "completed",
}).eq("id", projectId);

// 3. Salva channel scores
for (const cs of data.channelScores) {
  await supabase.from("project_channel_scores").upsert({
    project_id: projectId,
    user_id: userId,
    channel: cs.channel,
    score: cs.score,
    objective: cs.objective,
    funnel_role: cs.funnel_role,
    is_recommended: cs.is_recommended,
    risks: cs.risks,
  });
}

// 4. Salva insights
for (const insight of data.insights) {
  await supabase.from("insights").insert({
    project_id: projectId,
    user_id: userId,
    type: insight.type,
    title: insight.title,
    description: insight.description,
    action: insight.action,
  });
}

// 5. Gera benchmarks para concorrentes (se houver competitor_urls)
```

### Análise por IA (`aiAnalyzer.ts`)

```typescript
// 1. Busca API key do usuário
const { data: keys } = await supabase
  .from("user_api_keys")
  .select("*")
  .eq("user_id", userId);

// 2. Monta prompt com dados da análise heurística
const prompt = buildAnalysisPrompt(projectData, heuristicResults);

// 3. Chama Edge Function (Claude) ou API direta (Gemini)
// Claude → via Edge Function (CORS)
const { data } = await supabase.functions.invoke("ai-analyze", {
  body: { provider: "anthropic", apiKey, model, prompt },
});

// Gemini → chamada direta do browser (sem CORS issues)
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
  { method: "POST", body: JSON.stringify({ contents, generationConfig }) }
);

// 4. Parse JSON do resultado
const aiResult = JSON.parse(data.text);

// 5. Salva em projects.ai_analysis (jsonb)
await supabase.from("projects").update({
  ai_analysis: aiResult,
  ai_completed_at: new Date().toISOString(),
}).eq("id", projectId);
```

---

## 4. Deploy e Configuração

### Projeto Supabase

- **Project ID:** `vofizgftwxgyosjrwcqy`
- **URL:** `https://vofizgftwxgyosjrwcqy.supabase.co`

### Deploy de Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref vofizgftwxgyosjrwcqy

# Deploy da função de análise heurística (nome no Supabase: rapid-action)
supabase functions deploy rapid-action --project-ref vofizgftwxgyosjrwcqy

# Deploy da função de IA
supabase functions deploy ai-analyze --project-ref vofizgftwxgyosjrwcqy
```

### CORS

Ambas as funções incluem headers CORS permissivos para permitir chamadas do frontend:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

### Invocação pelo Frontend

O Supabase JS client já gerencia autenticação automaticamente:

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke("rapid-action", {
  body: { url: "https://exemplo.com" },
});
```

---

## 5. Limitações e Considerações

### Análise Heurística
- **Não executa JavaScript** — sites SPA (React, Angular) podem retornar HTML vazio
- **Timeout de 15s** — sites lentos podem falhar
- **Regex-based** — não é um parser HTML completo, pode perder edge cases
- **Sem cache** — cada análise faz um novo fetch
- **Rate limiting** — depende do plano Supabase (500K invocações/mês no Pro)

### Proxy de IA
- **API keys do usuário** — a plataforma não armazena nem usa keys próprias
- **Custo por token** — cada análise consome tokens da API key do usuário
- **Limite de 4096 tokens** de output — análises muito longas podem ser truncadas
- **Temperature 0.4** — balanceado para consistência com alguma variação

### Segurança
- **API keys** trafegam via HTTPS (Supabase Edge Functions usam TLS)
- **Keys não são logadas** — a Edge Function não persiste as keys
- **CORS aberto** — necessário para o frontend, mas a autenticação Supabase protege o acesso
