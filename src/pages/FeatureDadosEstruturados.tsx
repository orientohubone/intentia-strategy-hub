import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Database,
  ArrowRight,
  CheckCircle2,
  Code2,
  Globe,
  Play,
  Search,
  Eye,
  Copy,
  Zap,
  FileText,
  Wand2,
} from "lucide-react";

const dataTypes = [
  { label: "JSON-LD", desc: "Formato preferido pelo Google para schema.org (Organization, Product, Article, FAQ)", color: "border-blue-500/30 bg-blue-500/5 text-blue-600" },
  { label: "Open Graph", desc: "Meta tags para Facebook e LinkedIn — previews ao compartilhar links", color: "border-indigo-500/30 bg-indigo-500/5 text-indigo-600" },
  { label: "Twitter Card", desc: "Meta tags para previews no Twitter/X com imagem e descrição", color: "border-sky-500/30 bg-sky-500/5 text-sky-600" },
  { label: "Microdata", desc: "Dados estruturados embutidos diretamente no HTML da página", color: "border-teal-500/30 bg-teal-500/5 text-teal-600" },
];

const features = [
  { icon: Eye, title: "Visualizador Unificado", desc: "Abas para cada site analisado: seu site principal e cada concorrente. Alterne entre dados com um clique." },
  { icon: Search, title: "Gap Analysis Automático", desc: "Compara JSON-LD types, OG tags e Twitter Cards entre seu site e concorrentes. Gaps classificados por severidade." },
  { icon: Wand2, title: "Gerador de Snippets", desc: "Gera código pronto para copiar: JSON-LD, meta tags OG e Twitter Card baseados nos gaps identificados." },
  { icon: Copy, title: "Copiar com Um Clique", desc: "Copie snippets individuais ou todos de uma vez. Cole diretamente no <head> do seu HTML." },
  { icon: Code2, title: "HTML Snapshot", desc: "Versão limpa do HTML da página sem scripts, styles e SVGs. Útil para referência rápida do conteúdo." },
  { icon: FileText, title: "8 Tipos de Schema", desc: "Organization, WebSite, WebPage, FAQPage, BreadcrumbList, SoftwareApplication, Product e Article." },
];

const benefits = [
  "Extração automática de 4 tipos de dados estruturados",
  "Comparação lado a lado com concorrentes em abas",
  "Gap analysis com severidade (Crítico, Moderado, Baixo)",
  "Snippets de código prontos para copiar e colar",
  "Preview de imagens Open Graph",
  "HTML Snapshot limpo para referência",
  "Identifica quais concorrentes têm dados que você não tem",
  "Integrado com análise heurística e benchmark",
];

export default function FeatureDadosEstruturados() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Dados Estruturados & Comparação"
        path="/dados-estruturados"
        description="Extração automática de JSON-LD, Open Graph, Twitter Card e Microdata. Compare dados estruturados com concorrentes e gere snippets prontos."
        keywords="dados estruturados, JSON-LD, Open Graph, Twitter Card, schema.org, SEO, comparação concorrentes"
        jsonLd={buildBreadcrumb([{ name: "Dados Estruturados", path: "/dados-estruturados" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-sm font-medium mb-6">
            <Database className="h-4 w-4" />
            Dados Estruturados
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Seus dados estruturados
            <br />
            vs{" "}
            <span className="text-gradient bg-gradient-to-r from-teal-500 to-emerald-600 bg-clip-text text-transparent">
              a concorrência
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Extraia automaticamente JSON-LD, Open Graph,
            <br className="hidden sm:block" />
            Twitter Card e Microdata do seu site e dos concorrentes.
            <br className="hidden sm:block" />
            Identifique gaps e gere snippets prontos para implementar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Analisar Dados
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* 4 Data Types */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              4 Tipos Extraídos Automaticamente
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {dataTypes.map((type, i) => (
              <div key={i} className={`rounded-2xl border ${type.color} p-6`}>
                <h3 className="text-lg font-bold mb-2">{type.label}</h3>
                <p className="text-sm text-muted-foreground">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Funcionalidades
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-teal-500/30 hover:shadow-md transition-all duration-300">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-xs font-medium mb-4">
                <Zap className="h-3.5 w-3.5" />
                SEO Competitivo
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Não fique atrás nos dados estruturados
              </h2>
              <p className="text-muted-foreground mb-6">
                Dados estruturados impactam diretamente como seu site aparece nos resultados de busca e nas redes sociais.
              </p>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Wand2 className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Fluxo do Gerador</p>
                  <p className="text-xs text-muted-foreground">Gap → Snippet → Implementação</p>
                </div>
              </div>
              {[
                { step: "1", text: "Analise sua URL e concorrentes" },
                { step: "2", text: "Sistema identifica gaps automaticamente" },
                { step: "3", text: "Snippets gerados com dados do seu projeto" },
                { step: "4", text: "Copie e cole no <head> do seu HTML" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                  <span className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0 text-xs font-bold text-teal-600">{item.step}</span>
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Melhore seus dados estruturados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Analise, compare e gere snippets prontos para implementar em minutos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
                Criar Conta Gratuita
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
                Ver Planos e Preços
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
