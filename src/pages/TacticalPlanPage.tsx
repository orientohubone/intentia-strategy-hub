import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Crosshair,
  ArrowRight,
  CheckCircle2,
  Layers,
  FileText,
  Users,
  FlaskConical,
  BarChart3,
  Rocket,
  BookOpen,
  Target,
  Zap,
  Play,
  Trophy,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const channelFeatures = [
  {
    channel: "Google Ads",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    letter: "G",
    features: [
      "Campanhas de Busca, Display, Performance Max e Discovery",
      "Extensões recomendadas (Sitelinks, Frases, Preço, Chamada)",
      "Fatores de Índice de Qualidade (relevância, landing page, CTR)",
      "Estratégias de lances: CPA, ROAS, Maximizar Conversões",
    ],
  },
  {
    channel: "Meta Ads",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/20",
    letter: "M",
    features: [
      "Campanhas de Conversão, Leads, Awareness e Tráfego",
      "Segmentação por interesses, lookalike e remarketing",
      "Frameworks de copy para Feed, Stories e Reels",
      "Estratégias de lances: Menor Custo, Bid Cap, ROAS",
    ],
  },
  {
    channel: "LinkedIn Ads",
    color: "from-sky-500 to-sky-600",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/20",
    letter: "L",
    features: [
      "Campanhas de Lead Gen, Awareness e Website Visits",
      "Segmentação por cargo, empresa, indústria e senioridade",
      "Sponsored Content, Message Ads e Document Ads",
      "Ideal para B2B com ciclos de venda longos",
    ],
  },
  {
    channel: "TikTok Ads",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/20",
    letter: "T",
    features: [
      "Campanhas de Awareness, Tráfego e Conversão",
      "Formatos nativos: In-Feed, TopView, Branded Effects",
      "Segmentação por interesses, comportamento e lookalike",
      "Ideal para awareness e top-of-funnel B2B",
    ],
  },
];

const tacticalSections = [
  {
    icon: Crosshair,
    title: "Tipo de Campanha e Funil",
    description: "Defina o tipo de campanha, etapa do funil (awareness, consideration, conversion, retention), papel no funil e estratégia de lances para cada canal.",
  },
  {
    icon: Layers,
    title: "Estrutura de Grupos de Anúncios",
    description: "Organize grupos de anúncios por intenção ou público-alvo. Cada grupo define nome e intenção para segmentar a campanha de forma granular.",
  },
  {
    icon: FileText,
    title: "Frameworks de Copy",
    description: "Estruture a argumentação com frameworks validados: Dor → Solução → Prova → CTA, Comparação, Autoridade ou Personalizado. Sem gerar textos finais — apenas a estrutura estratégica.",
  },
  {
    icon: Users,
    title: "Segmentação com Públicos-Alvo",
    description: "Importe públicos-alvo vinculados ao projeto com um clique. Critérios de targeting (indústria, porte, localização, keywords) são pré-preenchidos automaticamente.",
  },
  {
    icon: FlaskConical,
    title: "Plano de Testes A/B",
    description: "Crie hipóteses, defina o que testar, critérios de sucesso e prioridade. Organize testes por canal para validar cada decisão tática antes de escalar.",
  },
  {
    icon: BarChart3,
    title: "Métricas-Chave e KPIs",
    description: "Defina métricas e metas por canal: CPA, CTR, ROAS, CPL e mais. Cada métrica tem um target específico para monitorar a performance.",
  },
];

const templates = [
  { name: "SaaS B2B", emoji: "💻", tags: ["Busca", "LinkedIn", "Leads"] },
  { name: "Consultoria & Serviços", emoji: "🏢", tags: ["Autoridade", "Lead Gen", "Conteúdo"] },
  { name: "E-commerce & Indústria B2B", emoji: "🏭", tags: ["Performance", "Catálogo", "ROAS"] },
  { name: "Educação Corporativa", emoji: "🎓", tags: ["Awareness", "Webinar", "Nurturing"] },
  { name: "Fintech & Financeiro", emoji: "💰", tags: ["Confiança", "Compliance", "Conversão"] },
  { name: "Saúde Corporativa", emoji: "🏥", tags: ["Credibilidade", "B2B2C", "Regulação"] },
];

const flowSteps = [
  { step: "1", label: "Crie o Projeto", desc: "URL + nicho + concorrentes", icon: Target },
  { step: "2", label: "Análise Estratégica", desc: "Scores por canal", icon: BarChart3 },
  { step: "3", label: "Defina Públicos", desc: "Audiências vinculadas", icon: Users },
  { step: "4", label: "Monte o Plano", desc: "Template ou do zero", icon: Crosshair },
  { step: "5", label: "Rode o Playbook", desc: "Diretivas priorizadas", icon: Rocket },
];

export default function TacticalPlanPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Plano Tático por Canal"
        path="/plano-tatico"
        description="Transforme estratégia em ação: estruture campanhas para Google, Meta, LinkedIn e TikTok com templates validados por nicho B2B. Segmentação, copy frameworks, testes e playbook gamificado."
        keywords="plano tático marketing, campanha Google Ads, Meta Ads B2B, LinkedIn Ads, plano de mídia, template campanha, segmentação B2B"
        jsonLd={buildBreadcrumb([{ name: "Plano Tático", path: "/plano-tatico" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Crosshair className="h-4 w-4" />
            Camada Tática
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Da estratégia à{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              execução tática
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Estruture campanhas executáveis para Google, Meta, LinkedIn e TikTok com templates
            validados por nicho B2B, segmentação inteligente e playbook gamificado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
              Começar Grátis
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/precos")}>
              Ver Planos
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">4</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Canais de Mídia</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">6</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Templates por Nicho</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">7</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Seções por Canal</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
              <p className="text-xs sm:text-sm text-muted-foreground">Dados Conectados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Flow Steps */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Do Diagnóstico ao Playbook
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              O Plano Tático se alimenta de todas as camadas anteriores da plataforma para gerar estruturas de campanha coerentes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-5 sm:gap-4 items-center">
              {flowSteps.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="relative inline-flex flex-col items-center">
                      <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                        {item.step}
                      </div>
                    </div>
                    <h4 className="font-semibold text-foreground text-sm">{item.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6 Tactical Sections */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              O que você configura por canal
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada canal possui 7 seções editáveis que cobrem desde a definição da campanha até o plano de testes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tacticalSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-border bg-background p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{section.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 Channels */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              4 Canais de Mídia Suportados
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada canal tem configurações específicas adaptadas às suas particularidades e melhores práticas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {channelFeatures.map((ch, index) => (
              <div
                key={index}
                className={`rounded-2xl border ${ch.borderColor} p-6 sm:p-8 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`h-12 w-12 rounded-xl ${ch.bgColor} flex items-center justify-center shrink-0`}>
                    <span className="text-lg font-bold text-foreground">{ch.letter}</span>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{ch.channel}</h3>
                  </div>
                </div>
                <ul className="space-y-2 mt-4">
                  {ch.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Templates Validados por Nicho
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comece com dados pré-preenchidos para os 4 canais, frameworks de copy, segmentação e planos de teste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tmpl, index) => (
              <div
                key={index}
                className="rounded-2xl border border-border bg-background p-6 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                    {tmpl.emoji}
                  </div>
                  <h3 className="font-bold text-foreground">{tmpl.name}</h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {tmpl.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences Integration */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
                <Users className="h-3.5 w-3.5" />
                Integração Inteligente
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Públicos-Alvo conectados ao Plano Tático
              </h2>
              <p className="text-muted-foreground mb-6">
                Os públicos-alvo cadastrados e vinculados ao projeto são consumidos automaticamente pelo Plano Tático.
                Na segmentação de cada canal, importe audiências com um clique.
              </p>
              <ul className="space-y-3">
                {[
                  "Importação rápida com botões visuais por público",
                  "Critérios de targeting pré-preenchidos (indústria, porte, local, keywords)",
                  "Badge \"Vinculado\" para rastreabilidade",
                  "Card de públicos na Visão Geral do plano",
                  "Seção de segmentação abre automaticamente quando há públicos",
                  "Proteção contra duplicatas por canal",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-muted/30 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Fluxo de Dados</p>
                  <p className="text-xs text-muted-foreground">Públicos → Segmentação → Playbook</p>
                </div>
              </div>
              {[
                { step: "1", text: "Cadastre públicos-alvo em Públicos-Alvo", icon: Users },
                { step: "2", text: "Vincule ao projeto desejado", icon: Target },
                { step: "3", text: "Abra o Plano Tático do projeto", icon: Crosshair },
                { step: "4", text: "Importe na Segmentação de cada canal", icon: Layers },
                { step: "5", text: "Personalize ângulo e prioridade por canal", icon: Sparkles },
                { step: "6", text: "Rode o Playbook com dados completos", icon: Rocket },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-sm text-foreground">{item.text}</p>
                    <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{item.step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Playbook Section */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Playbook de Execução Gamificado
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Clique em "Rodar Plano" e transforme toda a configuração tática em diretivas de execução priorizadas.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-orange-500/5 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground">Como funciona o Playbook</h3>
                  <p className="text-sm text-muted-foreground">Gerado automaticamente a partir do plano tático</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Zap, label: "Crítico", desc: "Ações essenciais para setup", color: "border-red-500/30 bg-red-500/5 text-red-600" },
                  { icon: Target, label: "Alta", desc: "Estrutura e grupos de anúncios", color: "border-amber-500/30 bg-amber-500/5 text-amber-600" },
                  { icon: TrendingUp, label: "Média", desc: "Segmentação e testes", color: "border-blue-500/30 bg-blue-500/5 text-blue-600" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className={`rounded-xl border ${item.color} p-4 text-center`}>
                      <Icon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-bold">{item.label} Prioridade</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <ul className="space-y-2">
                {[
                  "Diretivas organizadas por canal e fase (Setup → Grupos → Copy → Segmentação → Testes)",
                  "KPIs e metas vinculados a cada diretiva",
                  "Score tático consolidado com breakdown por canal",
                  "Resumo visual com contagem de diretivas por prioridade",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Score Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Score Tático Inteligente
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cada canal recebe um score tático calculado automaticamente com base em 3 dimensões.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { label: "Coerência Estratégica", desc: "Alinhamento com scores e recomendações da camada estratégica", weight: "35%" },
              { label: "Clareza da Estrutura", desc: "Completude de campanha, grupos, lances, copy e métricas", weight: "40%" },
              { label: "Qualidade da Segmentação", desc: "Públicos definidos, ângulos de mensagem e prioridades", weight: "25%" },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-border bg-background p-6 text-center hover:border-primary/30 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-1">{item.label}</h3>
                <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
                <Badge className="bg-primary/10 text-primary border-primary/30">Peso: {item.weight}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent border border-primary/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Play className="h-4 w-4" />
              Disponível no plano Professional
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Transforme estratégia em execução
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Pare de criar campanhas no escuro. Use dados estratégicos, templates validados e públicos-alvo
              conectados para montar planos táticos que realmente funcionam.
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
