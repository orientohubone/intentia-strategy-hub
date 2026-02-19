# Intentia Strategy Hub — Documentação SEO/GEO

**Domínio:** https://intentia.com.br  
**Última atualização:** 10 de Fevereiro de 2026  
**Idioma:** pt-BR

---

## Referencia de Monitoramento Live

Para arquitetura, schema, jobs/scheduler/webhook e operacao do monitoramento SEO live, consulte:

- `documentacao/SEO_MONITORAMENTO_LIVE.md`

---

## 1. Arquitetura SEO

### 1.1 Componente Central: `src/components/SEO.tsx`

Componente reutilizável baseado em `react-helmet-async` que gerencia todas as meta tags dinamicamente por página.

**Props:**

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `title` | `string?` | `"Intentia — Estratégia antes da mídia"` | Título da página (formatado como `{title} \| Intentia`) |
| `description` | `string?` | Descrição padrão da plataforma | Meta description |
| `path` | `string?` | `"/"` | Caminho para canonical URL e OG URL |
| `image` | `string?` | `/dashboard-intentia.png` | Imagem para OG e Twitter Card |
| `noindex` | `boolean?` | `false` | Se `true`, adiciona `<meta name="robots" content="noindex, nofollow" />` |
| `keywords` | `string?` | — | Meta keywords (separadas por vírgula) |
| `jsonLd` | `Record \| Record[]` | — | Dados estruturados JSON-LD (objeto único ou array) |

**Funções exportadas:**

- `SEO(props)` — Componente principal
- `buildBreadcrumb(items)` — Helper para gerar BreadcrumbList JSON-LD
- `SITE_URL` — `"https://intentia.com.br"`
- `SITE_NAME` — `"Intentia"`

**Uso típico:**

```tsx
import { SEO, buildBreadcrumb } from "@/components/SEO";

<SEO
  title="Preços"
  path="/precos"
  description="Planos Starter, Professional e Enterprise..."
  keywords="preços, planos, marketing B2B"
  jsonLd={[
    buildBreadcrumb([{ name: "Preços", path: "/precos" }]),
    { "@context": "https://schema.org", "@type": "FAQPage", ... }
  ]}
/>
```

### 1.2 HelmetProvider

O `HelmetProvider` do `react-helmet-async` envolve toda a aplicação em `src/App.tsx`, permitindo que cada página injete suas próprias meta tags no `<head>`.

### 1.3 Fallback Estático: `index.html`

O `index.html` contém meta tags estáticas como fallback para crawlers que não executam JavaScript:

- `<html lang="pt-BR">`
- Title e description padrão
- Open Graph completo (title, description, type, url, image, locale, site_name)
- Twitter Card completo (card, title, description, image)

Quando o React hidrata, o `react-helmet-async` sobrescreve essas tags com os valores específicos de cada página.

---

## 2. Meta Tags por Página

### 2.1 Páginas Públicas (indexáveis)

| Página | Path | Title | Keywords | JSON-LD | Breadcrumb |
|--------|------|-------|----------|---------|------------|
| Landing | `/` | (default) | marketing B2B, análise estratégica, mídia paga... | Organization + WebSite + SoftwareApplication | — |
| Preços | `/precos` | Preços | preços intentia, planos marketing B2B... | FAQPage (5 perguntas) | ✅ |
| Sobre | `/sobre` | Sobre | sobre intentia, marketing B2B... | — | ✅ |
| Cases | `/cases` | Cases de Uso | cases intentia, marketing B2B cases... | — | ✅ |
| Blog | `/blog` | Blog | blog marketing B2B, artigos mídia paga... | — | ✅ |
| Contato | `/contato` | Contato | contato intentia, suporte marketing B2B... | — | ✅ |
| Segurança | `/seguranca` | Segurança | segurança dados, proteção dados marketing... | — | ✅ |
| Privacidade | `/politica-de-privacidade` | Política de Privacidade | — | — | — |
| Termos | `/termos-de-servico` | Termos de Serviço | — | — | — |
| Cookies | `/politica-de-cookies` | Política de Cookies | — | — | — |

### 2.2 Páginas com `noindex`

| Página | Path | Motivo |
|--------|------|--------|
| Auth | `/auth` | Login/Signup — sem valor para indexação |
| Subscribe | `/assinar` | Checkout público — sem valor para indexação |
| NotFound | `/*` | Página 404 |
| Dashboard | `/dashboard` | Protegida (autenticação) |
| Projetos | `/projects` | Protegida |
| Insights | `/insights` | Protegida |
| Públicos-Alvo | `/audiences` | Protegida |
| Benchmark | `/benchmark` | Protegida |
| Configurações | `/settings` | Protegida |
| Ajuda | `/help` | Protegida |
| Plano Tático | `/tactical-plan` | Protegida |
| Alertas | `/alerts` | Protegida |
| Checkout | `/checkout` | Protegida |

---

## 3. Dados Estruturados (JSON-LD)

### 3.1 Landing Page (`/`)

Três schemas injetados como array:

**Organization:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Intentia",
  "url": "https://intentia.com.br",
  "logo": "https://intentia.com.br/favicon.svg",
  "description": "Plataforma de inteligência estratégica para marketing B2B."
}
```

**WebSite:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Intentia",
  "url": "https://intentia.com.br",
  "inLanguage": "pt-BR",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://intentia.com.br/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**SoftwareApplication:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Intentia Strategy Hub",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": [
    { "@type": "Offer", "name": "Starter", "price": "0", "priceCurrency": "BRL" },
    { "@type": "Offer", "name": "Professional", "price": "97", "priceCurrency": "BRL" }
  ],
  "featureList": "Diagnóstico heurístico de URL, Análise por IA, Benchmark SWOT, Scores por canal, Insights estratégicos, Alertas, Plano tático, Playbook, Exportação PDF/CSV, Públicos-alvo"
}
```

### 3.2 Pricing (`/precos`)

**FAQPage** com 5 perguntas frequentes:
1. Posso mudar de plano a qualquer momento?
2. O plano grátis tem limite de tempo?
3. Preciso de API key para usar a análise por IA?
4. O que é o Plano Tático?
5. Qual forma de pagamento aceitam?

### 3.3 BreadcrumbList

Gerado via `buildBreadcrumb()` nas páginas: Sobre, Cases, Blog, Contato, Preços, Segurança.

Formato: `Home → {Página}`

---

## 4. Arquivos Estáticos

### 4.1 `public/sitemap.xml`

13 URLs públicas com prioridade e frequência de atualização:

| URL | Prioridade | Frequência |
|-----|-----------|------------|
| `/` | 1.0 | weekly |
| `/precos` | 0.9 | monthly |
| `/cases` | 0.8 | monthly |
| `/assinar` | 0.8 | monthly |
| `/sobre` | 0.7 | monthly |
| `/blog` | 0.7 | weekly |
| `/contato` | 0.6 | monthly |
| `/auth` | 0.5 | monthly |
| `/seguranca` | 0.5 | monthly |
| `/brand` | 0.4 | monthly |
| `/politica-de-privacidade` | 0.3 | yearly |
| `/termos-de-servico` | 0.3 | yearly |
| `/politica-de-cookies` | 0.3 | yearly |

### 4.2 `public/robots.txt`

```
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://intentia.com.br/sitemap.xml
```

### 4.3 `public/llms.txt` (GEO)

Arquivo de texto estruturado para LLMs e motores de busca generativos. Contém:

- Descrição da plataforma
- Lista de funcionalidades
- Canais de mídia analisados
- Planos e preços
- Stack tecnológico
- Links principais

---

## 5. Open Graph & Twitter Card

Todas as páginas públicas emitem:

**Open Graph:**
- `og:title` — Título formatado (`{page} | Intentia`)
- `og:description` — Descrição específica da página
- `og:url` — URL canônica
- `og:image` — `/dashboard-intentia.png` (ou custom)
- `og:type` — `website`
- `og:site_name` — `Intentia`
- `og:locale` — `pt_BR`

**Twitter Card:**
- `twitter:card` — `summary_large_image`
- `twitter:title` — Título formatado
- `twitter:description` — Descrição da página
- `twitter:image` — Mesma imagem do OG

---

## 6. Checklist de Implementação

| Item | Status | Prioridade |
|------|--------|------------|
| `lang="pt-BR"` no `<html>` | ✅ | P0 |
| `sitemap.xml` com 13 URLs | ✅ | P0 |
| `robots.txt` com Sitemap | ✅ | P0 |
| `react-helmet-async` em 22 páginas | ✅ | P0 |
| Title/Description únicos por página | ✅ | P0 |
| Canonical URL por página | ✅ | P0 |
| JSON-LD Organization | ✅ | P0 |
| JSON-LD WebSite | ✅ | P0 |
| JSON-LD SoftwareApplication | ✅ | P0 |
| Open Graph completo | ✅ | P1 |
| Twitter Card completo | ✅ | P1 |
| JSON-LD FAQPage (Preços) | ✅ | P1 |
| `noindex` em páginas protegidas | ✅ | P1 |
| Keywords nas páginas principais | ✅ | P2 |
| `llms.txt` para GEO | ✅ | P2 |
| Alt text em imagens | ✅ | P2 |
| BreadcrumbList JSON-LD (6 páginas) | ✅ | P3 |

---

## 7. Arquivos Envolvidos

```
index.html                          # Fallback estático (lang, meta, OG, Twitter)
public/
├── sitemap.xml                     # Mapa do site (13 URLs)
├── robots.txt                      # Diretivas para crawlers
└── llms.txt                        # GEO — descrição para LLMs
src/
├── App.tsx                         # HelmetProvider wrapper
├── components/
│   └── SEO.tsx                     # Componente SEO + buildBreadcrumb()
└── pages/
    ├── Landing.tsx                 # SEO + JSON-LD (Org, WebSite, SoftwareApp)
    ├── Pricing.tsx                 # SEO + JSON-LD (FAQPage + Breadcrumb)
    ├── About.tsx                   # SEO + Breadcrumb
    ├── Cases.tsx                   # SEO + Breadcrumb
    ├── Blog.tsx                    # SEO + Breadcrumb
    ├── Contact.tsx                 # SEO + Breadcrumb
    ├── Security.tsx                # SEO + Breadcrumb
    ├── PrivacyPolicy.tsx           # SEO
    ├── TermsOfService.tsx          # SEO
    ├── CookiePolicy.tsx            # SEO
    ├── Auth.tsx                    # SEO (noindex)
    ├── Subscribe.tsx               # SEO (noindex)
    ├── NotFound.tsx                # SEO (noindex)
    ├── Dashboard.tsx               # SEO (noindex)
    ├── Projects.tsx                # SEO (noindex)
    ├── Insights.tsx                # SEO (noindex)
    ├── Audiences.tsx               # SEO (noindex)
    ├── Benchmark.tsx               # SEO (noindex)
    ├── Settings.tsx                # SEO (noindex)
    ├── Help.tsx                    # SEO (noindex)
    ├── TacticalPlan.tsx            # SEO (noindex)
    ├── Alerts.tsx                  # SEO (noindex)
    └── Checkout.tsx                # SEO (noindex)
```

---

## 8. Próximos Passos (Futuro)

- [ ] Adicionar `hreflang` se houver versão em inglês
- [ ] Gerar sitemap dinâmico se blog tiver posts reais
- [ ] Adicionar `Article` JSON-LD em posts individuais do blog
- [ ] Adicionar `LocalBusiness` JSON-LD se houver endereço físico
- [ ] Integrar Google Search Console e Bing Webmaster Tools
- [ ] Monitorar Core Web Vitals (LCP, FID, CLS)
- [ ] Adicionar `BreadcrumbList` nas páginas legais (Privacidade, Termos, Cookies)
- [ ] Criar `llms-full.txt` com conteúdo expandido para GEO avançado
