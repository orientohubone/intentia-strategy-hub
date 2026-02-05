import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { ChannelCard } from "@/components/ChannelCard";
import { InsightCard } from "@/components/InsightCard";
import { StatsCard } from "@/components/StatsCard";
import { ScoreRing } from "@/components/ScoreRing";
import { FolderOpen, Target, BarChart3, Zap } from "lucide-react";

const mockProjects = [
  {
    name: "SaaS CRM Pro",
    niche: "CRM para PMEs",
    url: "https://saascrmpro.com.br",
    score: 72,
    status: "completo" as const,
    lastUpdate: "Há 2 dias",
    channelScores: { google: 78, meta: 65, linkedin: 82, tiktok: 45 },
  },
  {
    name: "ERP Connect",
    niche: "ERP Industrial",
    url: "https://erpconnect.io",
    score: 58,
    status: "em_analise" as const,
    lastUpdate: "Há 5 horas",
    channelScores: { google: 62, meta: 48, linkedin: 71, tiktok: 32 },
  },
  {
    name: "FinTech Solutions",
    niche: "Gestão Financeira",
    url: "https://fintechsolutions.com",
    score: 45,
    status: "pendente" as const,
    lastUpdate: "Há 1 semana",
    channelScores: { google: 52, meta: 38, linkedin: 55, tiktok: 28 },
  },
];

const mockInsights = [
  {
    type: "warning" as const,
    title: "Investimento prematuro em TikTok Ads",
    description: "Seu público-alvo B2B tem baixa aderência à plataforma. Considere priorizar LinkedIn primeiro.",
    action: "Ver análise completa",
  },
  {
    type: "opportunity" as const,
    title: "LinkedIn Ads tem alto potencial",
    description: "Seu perfil de cliente ideal está 82% alinhado com a audiência do LinkedIn.",
    action: "Criar estratégia",
  },
  {
    type: "improvement" as const,
    title: "Melhore sua proposta de valor",
    description: "A clareza da oferta na landing page pode ser otimizada para aumentar conversões.",
    action: "Ver diagnóstico",
  },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Olá, João 👋
                </h1>
                <p className="text-muted-foreground">
                  Confira a visão estratégica dos seus projetos de mídia.
                </p>
              </div>
              <div className="flex items-center gap-4 p-4 card-elevated">
                <ScoreRing score={65} size="md" label="Score Médio" />
                <div className="pl-4 border-l border-border">
                  <p className="text-sm text-muted-foreground">Prontidão Geral</p>
                  <p className="text-lg font-semibold text-foreground">Moderada</p>
                  <p className="text-xs text-muted-foreground">3 projetos ativos</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Projetos Ativos"
                value={3}
                change={50}
                changeLabel="vs. mês anterior"
                icon={<FolderOpen className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Públicos Mapeados"
                value={8}
                change={25}
                changeLabel="novos este mês"
                icon={<Target className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Benchmarks"
                value={12}
                change={0}
                changeLabel="sem alteração"
                icon={<BarChart3 className="h-5 w-5 text-primary" />}
              />
              <StatsCard
                title="Insights Gerados"
                value={24}
                change={15}
                changeLabel="esta semana"
                icon={<Zap className="h-5 w-5 text-primary" />}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Projects Section */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Projetos Recentes</h2>
                  <a href="/projects" className="text-sm text-primary hover:underline">
                    Ver todos
                  </a>
                </div>
                <div className="space-y-4">
                  {mockProjects.map((project, i) => (
                    <ProjectCard key={i} {...project} />
                  ))}
                </div>
              </div>

              {/* Insights Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Insights Estratégicos</h2>
                  <a href="/insights" className="text-sm text-primary hover:underline">
                    Ver todos
                  </a>
                </div>
                <div className="space-y-3">
                  {mockInsights.map((insight, i) => (
                    <InsightCard key={i} {...insight} />
                  ))}
                </div>
              </div>
            </div>

            {/* Channel Strategy Overview */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Visão por Canal - SaaS CRM Pro</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ChannelCard
                  channel="google"
                  score={78}
                  objective="Captura de demanda ativa"
                  funnelRole="Fundo de funil"
                  risks={["CPC Alto"]}
                />
                <ChannelCard
                  channel="meta"
                  score={65}
                  objective="Awareness e remarketing"
                  funnelRole="Topo de funil"
                  risks={["Público amplo"]}
                />
                <ChannelCard
                  channel="linkedin"
                  score={82}
                  objective="Alcançar decisores B2B"
                  funnelRole="Meio de funil"
                />
                <ChannelCard
                  channel="tiktok"
                  score={45}
                  objective="Não recomendado"
                  funnelRole="N/A"
                  risks={["Baixa aderência B2B", "Público jovem"]}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
