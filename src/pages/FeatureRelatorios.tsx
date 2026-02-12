import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  ArrowRight,
  CheckCircle2,
  Play,
  Download,
  Zap,
  BarChart3,
  Table,
  Code2,
  Presentation,
} from "lucide-react";

const formats = [
  { label: "PDF", desc: "Relatórios consolidados formatados profissionalmente para apresentação a clientes e stakeholders.", color: "border-red-500/30 bg-red-500/5 text-red-600", icon: Presentation },
  { label: "CSV", desc: "Dados tabulares para análise externa em planilhas, ferramentas de BI ou importação em outros sistemas.", color: "border-green-500/30 bg-green-500/5 text-green-600", icon: Table },
  { label: "JSON", desc: "Dados estruturados completos para integrações, automações ou processamento programático.", color: "border-blue-500/30 bg-blue-500/5 text-blue-600", icon: Code2 },
  { label: "Markdown / HTML", desc: "Texto formatado para compartilhar via email, documentação ou publicação em plataformas web.", color: "border-purple-500/30 bg-purple-500/5 text-purple-600", icon: FileText },
];

const exportableData = [
  { title: "Relatório PDF Consolidado", desc: "Dados gerais, scores heurísticos, análise IA, insights e scores por canal — tudo em um PDF profissional." },
  { title: "Exportação por Seção", desc: "Exporte apenas a análise heurística, resultados de IA, benchmarks ou scores por canal individualmente." },
  { title: "Análise IA em 4 Formatos", desc: "Resultados da análise por IA exportáveis em JSON, Markdown, HTML estilizado e PDF." },
  { title: "Dados CSV Completos", desc: "Projetos, insights, benchmarks, públicos-alvo e scores por canal em formato tabular." },
  { title: "Backup Completo", desc: "Exportação JSON de todas as 12 tabelas do sistema para backup ou migração." },
  { title: "Benchmarks e SWOT", desc: "Análises competitivas com SWOT, scores e gap analysis exportáveis para apresentação." },
];

const benefits = [
  "Relatórios PDF profissionais prontos para apresentar",
  "Exportação CSV para análise em planilhas e BI",
  "4 formatos de exportação para análise IA",
  "Backup completo de todos os dados em JSON",
  "Exportação por seção para flexibilidade",
  "Dados estruturados para integrações",
  "Sem limite de exportações",
  "Dados sempre atualizados em tempo real",
];

export default function FeatureRelatorios() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Relatórios PDF e Exportação CSV"
        path="/relatorios"
        description="Relatórios consolidados por projeto em PDF, exportação por seção e dados em CSV para análise externa. Tudo pronto para apresentar."
        keywords="relatórios PDF, exportação CSV, relatório marketing, exportar dados, backup dados, análise externa"
        jsonLd={buildBreadcrumb([{ name: "Relatórios e Exportação", path: "/relatorios" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <FileText className="h-4 w-4" />
            Relatórios e Exportação
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Apresente resultados
            <br />
            com{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              profissionalismo
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Gere relatórios PDF consolidados,
            <br className="hidden sm:block" />
            exporte dados em CSV para análise externa
            <br className="hidden sm:block" />
            e compartilhe resultados de IA em múltiplos formatos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Começar Agora
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* 4 Formats */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              4 Formatos de Exportação
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Escolha o formato ideal para cada necessidade: apresentação, análise, integração ou documentação.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {formats.map((fmt, i) => {
              const Icon = fmt.icon;
              return (
                <div key={i} className={`rounded-2xl border ${fmt.color} p-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="h-6 w-6" />
                    <h3 className="text-lg font-bold">{fmt.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{fmt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Exportable Data */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O que você pode exportar
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {exportableData.map((item, index) => (
              <div key={index} className="rounded-2xl border border-border bg-background p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                <Zap className="h-3.5 w-3.5" />
                Profissionalismo
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Dados prontos para apresentar
              </h2>
              <p className="text-muted-foreground mb-6">
                Impressione clientes e stakeholders com relatórios profissionais gerados em segundos.
              </p>
              <ul className="space-y-3">
                {benefits.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Exemplo de Relatório PDF</p>
                  <p className="text-xs text-muted-foreground">Consolidado por projeto</p>
                </div>
              </div>
              {[
                "Dados gerais do projeto (nome, URL, nicho)",
                "6 scores heurísticos com gráfico",
                "Análise IA: resumo executivo + SWOT",
                "Insights: alertas, oportunidades, melhorias",
                "Scores por canal com recomendações",
                "Benchmarks com gap analysis",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent border border-primary/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Comece agora
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Gere relatórios profissionais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Crie seu projeto, analise sua URL e exporte resultados em PDF, CSV, JSON ou Markdown.
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
