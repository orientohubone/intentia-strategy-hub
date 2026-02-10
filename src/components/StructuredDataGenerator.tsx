import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wand2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Code2,
  Globe,
  Twitter,
  Sparkles,
  FileCode,
  Info,
} from "lucide-react";
import type { StructuredDataResult, MetaAnalysis } from "@/lib/urlAnalyzer";
import type { CompetitorStructuredData } from "@/components/StructuredDataViewer";

// =====================================================
// TYPES
// =====================================================

interface GapItem {
  type: "jsonld" | "og" | "twitter" | "microdata";
  label: string;
  detail: string;
  competitorsUsing: string[];
  priority: "high" | "medium" | "low";
}

interface GeneratedSnippet {
  id: string;
  label: string;
  description: string;
  type: "jsonld" | "og" | "twitter";
  code: string;
  icon: typeof Code2;
  color: string;
}

interface StructuredDataGeneratorProps {
  projectStructuredData?: StructuredDataResult | null;
  projectMeta?: MetaAnalysis | null;
  projectUrl?: string;
  projectName?: string;
  projectNiche?: string;
  competitors?: CompetitorStructuredData[];
}

// =====================================================
// SCHEMA.ORG TYPE LABELS
// =====================================================

const SCHEMA_TYPE_LABELS: Record<string, string> = {
  Organization: "Organização / Empresa",
  WebSite: "Site com busca interna",
  WebPage: "Página Web",
  LocalBusiness: "Negócio Local",
  Product: "Produto",
  Service: "Serviço",
  FAQPage: "Página de FAQ",
  BreadcrumbList: "Breadcrumbs (navegação)",
  Article: "Artigo / Blog Post",
  HowTo: "Tutorial / Como Fazer",
  VideoObject: "Vídeo",
  ImageObject: "Imagem",
  Review: "Avaliação",
  AggregateRating: "Avaliações Agregadas",
  Offer: "Oferta / Preço",
  ContactPoint: "Ponto de Contato",
  SoftwareApplication: "Aplicação / Software",
  ItemList: "Lista de Itens",
  Person: "Pessoa",
  Event: "Evento",
  Course: "Curso",
  CreativeWork: "Trabalho Criativo",
};

// =====================================================
// OG TAG LABELS
// =====================================================

const OG_TAG_LABELS: Record<string, string> = {
  "og:title": "Título para compartilhamento",
  "og:description": "Descrição para compartilhamento",
  "og:image": "Imagem de preview (1200×630px)",
  "og:url": "URL canônica",
  "og:type": "Tipo de conteúdo (website, article, product)",
  "og:site_name": "Nome do site",
  "og:locale": "Idioma (pt_BR)",
  "og:image:width": "Largura da imagem OG",
  "og:image:height": "Altura da imagem OG",
  "og:image:alt": "Texto alternativo da imagem OG",
};

const TWITTER_TAG_LABELS: Record<string, string> = {
  "twitter:card": "Tipo do card (summary_large_image)",
  "twitter:title": "Título no Twitter/X",
  "twitter:description": "Descrição no Twitter/X",
  "twitter:image": "Imagem do card",
  "twitter:site": "Handle do site (@empresa)",
  "twitter:creator": "Handle do autor",
};

// =====================================================
// ESSENTIAL OG & TWITTER TAGS
// =====================================================

const ESSENTIAL_OG_TAGS = ["og:title", "og:description", "og:image", "og:url", "og:type", "og:site_name", "og:locale"];
const ESSENTIAL_TWITTER_TAGS = ["twitter:card", "twitter:title", "twitter:description", "twitter:image"];

// =====================================================
// GAP ANALYSIS
// =====================================================

function analyzeGaps(
  projectSd: StructuredDataResult | null | undefined,
  competitors: CompetitorStructuredData[]
): GapItem[] {
  const gaps: GapItem[] = [];
  const competitorsWithData = competitors.filter((c) => c.structuredData);

  if (competitorsWithData.length === 0) return gaps;

  // 1. JSON-LD type gaps
  const projectJsonLdTypes = new Set(
    (projectSd?.jsonLd || []).map((item) => {
      const t = item["@type"];
      return Array.isArray(t) ? t[0] : t;
    }).filter(Boolean)
  );

  const competitorTypeMap: Record<string, string[]> = {};
  for (const comp of competitorsWithData) {
    for (const item of comp.structuredData!.jsonLd || []) {
      const t = item["@type"];
      const typeName = Array.isArray(t) ? t[0] : t;
      if (!typeName) continue;
      if (!competitorTypeMap[typeName]) competitorTypeMap[typeName] = [];
      if (!competitorTypeMap[typeName].includes(comp.name)) {
        competitorTypeMap[typeName].push(comp.name);
      }
    }
  }

  for (const [typeName, comps] of Object.entries(competitorTypeMap)) {
    if (!projectJsonLdTypes.has(typeName)) {
      const priority = comps.length >= 2 ? "high" : comps.length >= 1 ? "medium" : "low";
      gaps.push({
        type: "jsonld",
        label: `JSON-LD: ${SCHEMA_TYPE_LABELS[typeName] || typeName}`,
        detail: `${comps.length} concorrente(s) usam Schema ${typeName}. Seu site não tem.`,
        competitorsUsing: comps,
        priority,
      });
    }
  }

  // 2. OG tag gaps
  const projectOgKeys = new Set(Object.keys(projectSd?.openGraph || {}));
  const competitorOgMap: Record<string, string[]> = {};
  for (const comp of competitorsWithData) {
    for (const key of Object.keys(comp.structuredData!.openGraph || {})) {
      if (!competitorOgMap[key]) competitorOgMap[key] = [];
      if (!competitorOgMap[key].includes(comp.name)) {
        competitorOgMap[key].push(comp.name);
      }
    }
  }

  for (const tag of ESSENTIAL_OG_TAGS) {
    if (!projectOgKeys.has(tag) && competitorOgMap[tag]) {
      gaps.push({
        type: "og",
        label: `Open Graph: ${OG_TAG_LABELS[tag] || tag}`,
        detail: `Tag ${tag} ausente. ${competitorOgMap[tag].length} concorrente(s) usam.`,
        competitorsUsing: competitorOgMap[tag],
        priority: ["og:title", "og:description", "og:image"].includes(tag) ? "high" : "medium",
      });
    }
  }

  // 3. Twitter Card gaps
  const projectTcKeys = new Set(Object.keys(projectSd?.twitterCard || {}));
  const competitorTcMap: Record<string, string[]> = {};
  for (const comp of competitorsWithData) {
    for (const key of Object.keys(comp.structuredData!.twitterCard || {})) {
      if (!competitorTcMap[key]) competitorTcMap[key] = [];
      if (!competitorTcMap[key].includes(comp.name)) {
        competitorTcMap[key].push(comp.name);
      }
    }
  }

  for (const tag of ESSENTIAL_TWITTER_TAGS) {
    if (!projectTcKeys.has(tag) && competitorTcMap[tag]) {
      gaps.push({
        type: "twitter",
        label: `Twitter Card: ${TWITTER_TAG_LABELS[tag] || tag}`,
        detail: `Tag ${tag} ausente. ${competitorTcMap[tag].length} concorrente(s) usam.`,
        competitorsUsing: competitorTcMap[tag],
        priority: "medium",
      });
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return gaps;
}

// =====================================================
// SNIPPET GENERATORS
// =====================================================

function generateSnippets(
  projectSd: StructuredDataResult | null | undefined,
  projectMeta: MetaAnalysis | null | undefined,
  projectUrl: string | undefined,
  projectName: string | undefined,
  projectNiche: string | undefined,
  competitors: CompetitorStructuredData[]
): GeneratedSnippet[] {
  const snippets: GeneratedSnippet[] = [];
  const competitorsWithData = competitors.filter((c) => c.structuredData);
  const projectJsonLdTypes = new Set(
    (projectSd?.jsonLd || []).map((item) => {
      const t = item["@type"];
      return Array.isArray(t) ? t[0] : t;
    }).filter(Boolean)
  );
  const projectOgKeys = new Set(Object.keys(projectSd?.openGraph || {}));
  const projectTcKeys = new Set(Object.keys(projectSd?.twitterCard || {}));

  // Gather competitor JSON-LD types
  const competitorTypes = new Set<string>();
  for (const comp of competitorsWithData) {
    for (const item of comp.structuredData!.jsonLd || []) {
      const t = item["@type"];
      const typeName = Array.isArray(t) ? t[0] : t;
      if (typeName) competitorTypes.add(typeName);
    }
  }

  const title = projectMeta?.title || projectMeta?.ogTitle || projectName || "Seu Site";
  const description = projectMeta?.description || projectMeta?.ogDescription || `${projectName || "Empresa"} — ${projectNiche || "soluções digitais"}`;
  const url = projectUrl || "https://seusite.com.br";
  const image = projectMeta?.ogImage || `${url}/og-image.jpg`;
  const lang = projectMeta?.language || "pt-BR";

  // 1. Organization JSON-LD (if competitors have it and project doesn't)
  if (!projectJsonLdTypes.has("Organization") && (competitorTypes.has("Organization") || competitorTypes.has("LocalBusiness"))) {
    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: projectName || "Nome da Empresa",
      url: url,
      logo: `${url}/logo.png`,
      description: description,
      sameAs: [
        "https://www.linkedin.com/company/sua-empresa",
        "https://www.instagram.com/sua-empresa",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer service",
        availableLanguage: ["Portuguese"],
      },
    };
    snippets.push({
      id: "org",
      label: "Organization",
      description: "Identifica sua empresa para o Google. Aparece no Knowledge Panel e resultados de busca.",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(org, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 2. WebSite JSON-LD (if competitors have it)
  if (!projectJsonLdTypes.has("WebSite") && competitorTypes.has("WebSite")) {
    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: projectName || "Nome do Site",
      url: url,
      description: description,
      inLanguage: lang,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${url}/busca?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };
    snippets.push({
      id: "website",
      label: "WebSite",
      description: "Habilita a caixa de busca do site nos resultados do Google (Sitelinks Search Box).",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(website, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 3. WebPage JSON-LD
  if (!projectJsonLdTypes.has("WebPage") && competitorTypes.has("WebPage")) {
    const webpage = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: url,
      description: description,
      inLanguage: lang,
      isPartOf: {
        "@type": "WebSite",
        name: projectName || "Nome do Site",
        url: url,
      },
    };
    snippets.push({
      id: "webpage",
      label: "WebPage",
      description: "Descreve a página atual para mecanismos de busca com contexto semântico.",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(webpage, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 4. FAQPage JSON-LD
  if (!projectJsonLdTypes.has("FAQPage") && competitorTypes.has("FAQPage")) {
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Qual o principal benefício do seu produto/serviço?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Descreva aqui o principal benefício que seu produto ou serviço oferece aos clientes.",
          },
        },
        {
          "@type": "Question",
          name: "Como funciona o processo de contratação?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Explique o passo a passo do processo de contratação ou aquisição.",
          },
        },
        {
          "@type": "Question",
          name: "Quais são os planos e preços disponíveis?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Detalhe os planos, preços e condições de pagamento disponíveis.",
          },
        },
      ],
    };
    snippets.push({
      id: "faq",
      label: "FAQPage",
      description: "Gera rich snippets de FAQ nos resultados do Google, ocupando mais espaço visual.",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(faq, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 5. BreadcrumbList JSON-LD
  if (!projectJsonLdTypes.has("BreadcrumbList") && competitorTypes.has("BreadcrumbList")) {
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Página Atual",
          item: `${url}/pagina-atual`,
        },
      ],
    };
    snippets.push({
      id: "breadcrumb",
      label: "BreadcrumbList",
      description: "Mostra a hierarquia de navegação nos resultados do Google (Home > Seção > Página).",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(breadcrumb, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 6. SoftwareApplication JSON-LD
  if (!projectJsonLdTypes.has("SoftwareApplication") && competitorTypes.has("SoftwareApplication")) {
    const app = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: projectName || "Nome do Software",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: url,
      description: description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BRL",
        availability: "https://schema.org/InStock",
      },
    };
    snippets.push({
      id: "software",
      label: "SoftwareApplication",
      description: "Identifica seu produto como software/SaaS para rich snippets de aplicações.",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(app, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 7. Product / Service JSON-LD
  if (!projectJsonLdTypes.has("Product") && !projectJsonLdTypes.has("Service") &&
      (competitorTypes.has("Product") || competitorTypes.has("Service"))) {
    const product = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: projectName || "Nome do Produto",
      description: description,
      url: url,
      image: image,
      brand: {
        "@type": "Brand",
        name: projectName || "Sua Marca",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "0",
        availability: "https://schema.org/InStock",
        url: url,
      },
    };
    snippets.push({
      id: "product",
      label: "Product / Service",
      description: "Habilita rich snippets de produto com preço, disponibilidade e avaliações.",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(product, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 8. Article JSON-LD
  if (!projectJsonLdTypes.has("Article") && competitorTypes.has("Article")) {
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: description,
      url: url,
      image: image,
      author: {
        "@type": "Organization",
        name: projectName || "Sua Empresa",
      },
      publisher: {
        "@type": "Organization",
        name: projectName || "Sua Empresa",
        logo: {
          "@type": "ImageObject",
          url: `${url}/logo.png`,
        },
      },
      datePublished: new Date().toISOString().split("T")[0],
      dateModified: new Date().toISOString().split("T")[0],
    };
    snippets.push({
      id: "article",
      label: "Article",
      description: "Estrutura artigos e blog posts para rich snippets com autor, data e imagem.",
      type: "jsonld",
      code: `<script type="application/ld+json">\n${JSON.stringify(article, null, 2)}\n</script>`,
      icon: Code2,
      color: "amber",
    });
  }

  // 9. Open Graph tags (if missing essential ones)
  const missingOg = ESSENTIAL_OG_TAGS.filter((tag) => !projectOgKeys.has(tag));
  if (missingOg.length > 0) {
    const ogValues: Record<string, string> = {
      "og:title": title,
      "og:description": description.length > 200 ? description.substring(0, 197) + "..." : description,
      "og:image": image,
      "og:url": url,
      "og:type": "website",
      "og:site_name": projectName || "Seu Site",
      "og:locale": lang.replace("-", "_"),
    };
    const ogTags = missingOg
      .map((tag) => `<meta property="${tag}" content="${ogValues[tag] || ""}" />`)
      .join("\n");
    const allOgTags = [
      ...missingOg.map((tag) => `<meta property="${tag}" content="${ogValues[tag] || ""}" />`),
      `<meta property="og:image:width" content="1200" />`,
      `<meta property="og:image:height" content="630" />`,
      `<meta property="og:image:alt" content="${title}" />`,
    ].join("\n");

    snippets.push({
      id: "og",
      label: `Open Graph (${missingOg.length} tags)`,
      description: "Tags essenciais para preview ao compartilhar no Facebook, LinkedIn e WhatsApp.",
      type: "og",
      code: `<!-- Open Graph Meta Tags -->\n${allOgTags}`,
      icon: Globe,
      color: "blue",
    });
  }

  // 10. Twitter Card tags (if missing)
  const missingTc = ESSENTIAL_TWITTER_TAGS.filter((tag) => !projectTcKeys.has(tag));
  if (missingTc.length > 0) {
    const tcValues: Record<string, string> = {
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description.length > 200 ? description.substring(0, 197) + "..." : description,
      "twitter:image": image,
    };
    const tcTags = missingTc
      .map((tag) => `<meta name="${tag}" content="${tcValues[tag] || ""}" />`)
      .join("\n");

    snippets.push({
      id: "twitter",
      label: `Twitter Card (${missingTc.length} tags)`,
      description: "Tags para preview ao compartilhar no Twitter/X com imagem grande.",
      type: "twitter",
      code: `<!-- Twitter Card Meta Tags -->\n${tcTags}`,
      icon: Twitter,
      color: "sky",
    });
  }

  return snippets;
}

// =====================================================
// COMPONENT
// =====================================================

export function StructuredDataGenerator({
  projectStructuredData,
  projectMeta,
  projectUrl,
  projectName,
  projectNiche,
  competitors = [],
}: StructuredDataGeneratorProps) {
  const [expanded, setExpanded] = useState(false);
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const competitorsWithData = competitors.filter((c) => c.structuredData);

  const gaps = useMemo(
    () => analyzeGaps(projectStructuredData, competitors),
    [projectStructuredData, competitors]
  );

  const snippets = useMemo(
    () => generateSnippets(projectStructuredData, projectMeta, projectUrl, projectName, projectNiche, competitors),
    [projectStructuredData, projectMeta, projectUrl, projectName, projectNiche, competitors]
  );

  // Nothing to generate if no competitors with data or no gaps
  if (competitorsWithData.length === 0 || (gaps.length === 0 && snippets.length === 0)) return null;

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyAll = async () => {
    const allCode = snippets.map((s) => `${s.code}\n`).join("\n");
    await navigator.clipboard.writeText(allCode);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const highGaps = gaps.filter((g) => g.priority === "high").length;
  const mediumGaps = gaps.filter((g) => g.priority === "medium").length;

  return (
    <div className="border border-primary/30 rounded-xl p-4 sm:p-6 space-y-4 bg-gradient-to-br from-primary/[0.03] to-transparent">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Gerador de Dados Estruturados
              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
              </Badge>
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {highGaps > 0 && (
                <span className="text-amber-600 font-medium">{highGaps} gaps críticos</span>
              )}
              {highGaps > 0 && mediumGaps > 0 && " · "}
              {mediumGaps > 0 && (
                <span>{mediumGaps} gaps moderados</span>
              )}
              {(highGaps > 0 || mediumGaps > 0) && " · "}
              Baseado em {competitorsWithData.length} concorrente(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && (
            <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
              Clique para expandir
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-5 pt-2">
          {/* Gap Analysis Summary */}
          {gaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h4 className="text-xs font-semibold text-foreground">Gap Analysis — O que falta no seu site</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gaps.map((gap, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 space-y-1.5 ${
                      gap.priority === "high"
                        ? "border-amber-500/30 bg-amber-500/5"
                        : gap.priority === "medium"
                        ? "border-blue-500/20 bg-blue-500/5"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-foreground leading-tight">{gap.label}</p>
                      <Badge
                        className={`text-[9px] flex-shrink-0 ${
                          gap.priority === "high"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : gap.priority === "medium"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {gap.priority === "high" ? "Crítico" : gap.priority === "medium" ? "Moderado" : "Baixo"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{gap.detail}</p>
                    <div className="flex flex-wrap gap-1">
                      {gap.competitorsUsing.map((name) => (
                        <span key={name} className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Snippets */}
          {snippets.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h4 className="text-xs font-semibold text-foreground">Snippets Gerados — Copie e cole no seu site</h4>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-[11px] gap-1.5"
                  onClick={handleCopyAll}
                >
                  {copiedAll ? (
                    <>
                      <Check className="h-3 w-3 text-green-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar Todos
                    </>
                  )}
                </Button>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Os snippets são gerados com base nos dados estruturados dos seus concorrentes e nas informações do seu projeto.
                  <strong className="text-foreground"> Personalize os valores</strong> antes de adicionar ao <code className="text-[10px] bg-muted px-1 rounded">&lt;head&gt;</code> do seu site.
                  JSON-LD vai dentro de <code className="text-[10px] bg-muted px-1 rounded">&lt;script&gt;</code>, meta tags diretamente no <code className="text-[10px] bg-muted px-1 rounded">&lt;head&gt;</code>.
                </p>
              </div>

              <div className="space-y-2">
                {snippets.map((snippet) => {
                  const Icon = snippet.icon;
                  const isExpanded = expandedSnippet === snippet.id;
                  return (
                    <div
                      key={snippet.id}
                      className="border border-border/50 rounded-lg overflow-hidden"
                    >
                      <button
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                        onClick={() => setExpandedSnippet(isExpanded ? null : snippet.id)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`h-4 w-4 flex-shrink-0 ${
                            snippet.color === "amber" ? "text-amber-500" :
                            snippet.color === "blue" ? "text-blue-500" :
                            snippet.color === "sky" ? "text-sky-500" : "text-primary"
                          }`} />
                          <span className="text-sm font-medium text-foreground truncate">{snippet.label}</span>
                          <Badge
                            className={`text-[9px] flex-shrink-0 ${
                              snippet.type === "jsonld" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                              snippet.type === "og" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                              "bg-sky-500/10 text-sky-600 border-sky-500/20"
                            }`}
                          >
                            {snippet.type === "jsonld" ? "JSON-LD" : snippet.type === "og" ? "Meta Tag" : "Twitter"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(snippet.code, snippet.id);
                            }}
                          >
                            {copied === snippet.id ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border/50 space-y-2">
                          <p className="px-3 pt-2 text-[11px] text-muted-foreground">{snippet.description}</p>
                          <pre className="px-3 pb-3 text-[11px] font-mono text-foreground/80 bg-muted/30 overflow-x-auto max-h-[400px] overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
                            {snippet.code}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* What you already have */}
          {projectStructuredData && (
            (() => {
              const existingTypes = (projectStructuredData.jsonLd || []).map((item) => {
                const t = item["@type"];
                return Array.isArray(t) ? t[0] : t;
              }).filter(Boolean);
              const existingOg = Object.keys(projectStructuredData.openGraph || {});
              const existingTc = Object.keys(projectStructuredData.twitterCard || {});
              const hasExisting = existingTypes.length > 0 || existingOg.length > 0 || existingTc.length > 0;

              if (!hasExisting) return null;

              return (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <h4 className="text-xs font-semibold text-foreground">Já presente no seu site</h4>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {existingTypes.map((type) => (
                      <Badge key={type} className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                        ✓ {SCHEMA_TYPE_LABELS[type] || type}
                      </Badge>
                    ))}
                    {existingOg.length > 0 && (
                      <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                        ✓ Open Graph ({existingOg.length} tags)
                      </Badge>
                    )}
                    {existingTc.length > 0 && (
                      <Badge className="text-[10px] bg-green-500/10 text-green-600 border-green-500/20">
                        ✓ Twitter Card ({existingTc.length} tags)
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })()
          )}
        </div>
      )}
    </div>
  );
}
