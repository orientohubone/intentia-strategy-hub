import {
  Globe,
  ArrowRight,
  Lock,
  Shield,
  Monitor,
  ToggleLeft,
  Eye,
  Crown,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FlowBox, FlowNode, ArrowConnector } from "./shared";

export function FrontendSection() {
  return (
    <div className="space-y-6">
      {/* Route Map */}
      <FlowBox title="Mapa de Rotas" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" badge="React Router v6" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Public Routes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-3.5 w-3.5 text-green-400" />
              <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">Rotas Publicas</span>
              <Badge className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20">ForceLightMode</Badge>
            </div>
            {[
              { path: "/", page: "Landing", desc: "Pagina inicial" },
              { path: "/auth", page: "Auth", desc: "Login / Signup" },
              { path: "/precos", page: "Pricing", desc: "Planos e precos" },
              { path: "/assinar", page: "Subscribe", desc: "Assinatura Professional" },
              { path: "/sobre", page: "About", desc: "Sobre a Intentia" },
              { path: "/status", page: "Status", desc: "Status da plataforma" },
              { path: "/brand", page: "BrandGuide", desc: "Guia de marca" },
              { path: "/brand/posts", page: "BrandPosts", desc: "Posts de marca" },
              { path: "/seguranca", page: "Security", desc: "Seguranca" },
              { path: "/comparar", page: "Comparar", desc: "Comparar planos" },
              { path: "/plano-tatico", page: "TacticalPlanPage", desc: "Plano tatico (publico)" },
              { path: "/diagnostico-url", page: "FeatureDiagnostico", desc: "Feature: Diagnostico" },
              { path: "/analise-ia", page: "FeatureAnaliseIA", desc: "Feature: Analise IA" },
              { path: "/benchmark-competitivo", page: "FeatureBenchmark", desc: "Feature: Benchmark" },
              { path: "/gestao-campanhas", page: "FeatureGestaoCampanhas", desc: "Feature: Campanhas" },
              { path: "/gestao-budget", page: "FeatureGestaoBudget", desc: "Feature: Budget" },
              { path: "/score-canal", page: "FeatureScoreCanal", desc: "Feature: Score Canal" },
              { path: "/alertas-insights", page: "FeatureInsights", desc: "Feature: Insights" },
              { path: "/dados-estruturados", page: "FeatureDadosEstruturados", desc: "Feature: Dados Estruturados" },
              { path: "/relatorios", page: "FeatureRelatorios", desc: "Feature: Relatorios" },
              { path: "/monitoramento-seo-inteligente", page: "FeatureSeoMonitoring", desc: "Feature: Monitoramento SEO" },
              { path: "/oauth/callback", page: "OAuthCallback", desc: "Retorno OAuth" },
            ].map((route) => (
              <div key={route.path} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                <code className="text-[10px] text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">{route.path}</code>
                <ArrowRight className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
                <span className="text-[11px] text-foreground/80">{route.page}</span>
                <span className="text-[9px] text-muted-foreground/70 ml-auto">{route.desc}</span>
              </div>
            ))}
          </div>

          {/* Protected Routes */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Rotas Protegidas</span>
              <Badge className="text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/20">ProtectedRoute</Badge>
            </div>
            {[
              { path: "/dashboard", page: "Dashboard", desc: "Painel principal" },
              { path: "/projects", page: "Projects", desc: "CRUD + Analise URL" },
              { path: "/insights", page: "Insights", desc: "Insights por projeto" },
              { path: "/benchmark", page: "Benchmark", desc: "SWOT + Gap Analysis" },
              { path: "/tactical", page: "TacticalPlan", desc: "Plano tatico" },
              { path: "/alertas", page: "Alerts", desc: "Alertas estrategicos" },
              { path: "/audiences", page: "Audiences", desc: "Publicos-alvo" },
              { path: "/operations", page: "Operations", desc: "Campanhas + Metricas" },
              { path: "/settings", page: "Settings", desc: "Config + API Keys" },
              { path: "/integracoes", page: "Integrations", desc: "OAuth + Sync APIs" },
              { path: "/seo-geo", page: "SeoGeo", desc: "SEO & Performance" },
              { path: "/seo-monitoring", page: "SeoMonitoring", desc: "Monitoramento SEO Inteligente" },
              { path: "/support", page: "Support", desc: "Suporte ao cliente" },
              { path: "/checkout", page: "Checkout", desc: "Pagamento" },
              { path: "/help", page: "Help", desc: "Centro de ajuda" },
            ].map((route) => (
              <div key={route.path} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                <code className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">{route.path}</code>
                <ArrowRight className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
                <span className="text-[11px] text-foreground/80">{route.page}</span>
                <span className="text-[9px] text-muted-foreground/70 ml-auto">{route.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Routes */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-3.5 w-3.5 text-red-400" />
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Rotas Admin</span>
            <Badge className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20">AdminProtectedRoute</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded">/admin/login</code>
              <ArrowRight className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
              <span className="text-[11px] text-foreground/80">AdminLogin</span>
              <span className="text-[9px] text-muted-foreground/70 ml-auto">CNPJ + Senha</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded">/admin</code>
              <ArrowRight className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
              <span className="text-[11px] text-foreground/80">AdminPanel</span>
              <span className="text-[9px] text-muted-foreground/70 ml-auto">Painel completo</span>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Component Hierarchy */}
      <FlowBox title="Hierarquia de Componentes" badge="50+ componentes">
        <div className="space-y-4">
          {/* App wrapper */}
          <div className="bg-muted border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-foreground">App.tsx</span>
              <span className="text-[9px] text-muted-foreground">— Root Component</span>
            </div>
            <div className="ml-4 space-y-2">
              {[
                { name: "ThemeProvider", desc: "Dark/Light mode", color: "text-purple-400" },
                { name: "QueryClientProvider", desc: "TanStack Query cache", color: "text-red-400" },
                { name: "BrowserRouter", desc: "React Router SPA", color: "text-pink-400" },
                { name: "TooltipProvider", desc: "Radix tooltips", color: "text-muted-foreground" },
              ].map((wrapper) => (
                <div key={wrapper.name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                  <code className={`text-[10px] font-mono ${wrapper.color}`}>{wrapper.name}</code>
                  <span className="text-[9px] text-muted-foreground/70">{wrapper.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Layout components */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">Layout Publico</p>
              <div className="space-y-1.5">
                {["Header", "LandingNav", "Footer", "ForceLightMode", "BackToHomeButton"].map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                    <code className="text-[10px] text-muted-foreground font-mono">{c}</code>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-2">Layout Dashboard</p>
              <div className="space-y-1.5">
                {["DashboardHeader", "DashboardSidebar", "DashboardLayout", "ThemeToggle", "NotificationsDropdown"].map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                    <code className="text-[10px] text-muted-foreground font-mono">{c}</code>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-2">Componentes de Dados</p>
              <div className="space-y-1.5">
                {[
                  "ProjectCard",
                  "InsightCard",
                  "BenchmarkCard",
                  "ChannelCard",
                  "ScoreRing",
                  "StatsCard",
                  "CampaignMetricsForm",
                  "CampaignMetricsList",
                  "CampaignPerformanceCards",
                  "CampaignPerformanceAiDialog",
                  "TacticalVsRealComparison",
                  "PerformanceAlerts",
                  "BudgetManagement",
                  "CampaignCalendarManager",
                  "CampaignCalendar",
                  "CampaignTimeline",
                  "BenchmarkDetailDialog",
                  "IcpEnrichmentDialog",
                  "CompetitorLogo",
                ].map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-green-500/50" />
                    <code className="text-[10px] text-muted-foreground font-mono">{c}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hooks */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-2">Custom Hooks</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { name: "useAuth", desc: "Sessao Supabase" },
                { name: "useTenantData", desc: "Dados do tenant" },
                { name: "useFeatureFlags", desc: "Feature gating" },
                { name: "useNotifications", desc: "Notificacoes RT" },
                { name: "useAdminAuth", desc: "Sessao admin" },
                { name: "useStatusData", desc: "Status page" },
                { name: "useMobile", desc: "Responsividade" },
                { name: "useToast", desc: "Notificacoes UI" },
              ].map((hook) => (
                <div key={hook.name} className="bg-muted/30 rounded-lg px-2.5 py-2">
                  <code className="text-[10px] text-purple-300 font-mono">{hook.name}</code>
                  <p className="text-[9px] text-muted-foreground/70">{hook.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Feature Blocked Screens */}
      <FlowBox title="Telas de Aviso — FeatureBlockedScreen" badge="v3.1.0" borderColor="border-amber-500/20" bgColor="bg-amber-500/5">
        <div className="space-y-4">
          {/* Component Overview */}
          <div className="bg-muted border border-border rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-foreground">FeatureBlockedScreen.tsx</span>
              <span className="text-[9px] text-muted-foreground">— Telas dinâmicas de bloqueio</span>
            </div>
            <p className="text-[10px] text-muted-foreground/80 mb-3">
              Componente que renderiza telas de aviso específicas para cada status de feature, com mensagens personalizáveis via Admin Panel.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { status: "plan_blocked", icon: Crown, label: "Upgrade", color: "text-amber-400", desc: "Plano bloqueado" },
                { status: "development", icon: Zap, label: "Development", color: "text-blue-400", desc: "Em desenvolvimento" },
                { status: "maintenance", icon: Lock, label: "Maintenance", color: "text-red-400", desc: "Em manutenção" },
                { status: "disabled", icon: Lock, label: "Disabled", color: "text-gray-400", desc: "Desativado" },
              ].map((screen) => (
                <div key={screen.status} className="bg-muted/30 rounded-lg p-2 text-center">
                  <screen.icon className={`h-4 w-4 ${screen.color} mx-auto mb-1`} />
                  <p className="text-[9px] font-medium text-foreground">{screen.label}</p>
                  <p className="text-[8px] text-muted-foreground">{screen.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Flow */}
          <FlowBox title="Fluxo de Exibição" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" defaultOpen>
            <div className="flex flex-col items-center gap-0">
              <FlowNode icon={Monitor} label="Usuario acessa pagina" sublabel="Ex: /integracoes, /projects" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
              <ArrowConnector direction="down" label="FeatureGate verifica" />

              <FlowNode icon={ToggleLeft} label="useFeatureFlags()" sublabel="Verifica disponibilidade" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
              <ArrowConnector direction="down" label="check.available = false" />

              <FlowNode icon={Eye} label="FeatureBlockedScreen" sublabel="Renderiza tela adequada" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
              <ArrowConnector direction="down" label="check.status" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                <div className="flex flex-col items-center gap-1">
                  <Badge className="text-[8px] bg-amber-500/10 text-amber-400 border-amber-500/20">plan_blocked</Badge>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                    <Crown className="h-3 w-3 text-amber-400 mx-auto mb-1" />
                    <p className="text-[8px] font-medium">Upgrade</p>
                    <p className="text-[7px] text-muted-foreground">Professional+</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Badge className="text-[8px] bg-blue-500/10 text-blue-400 border-blue-500/20">development</Badge>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                    <Zap className="h-3 w-3 text-blue-400 mx-auto mb-1" />
                    <p className="text-[8px] font-medium">Em Breve</p>
                    <p className="text-[7px] text-muted-foreground">Developing</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Badge className="text-[8px] bg-red-500/10 text-red-400 border-red-500/20">maintenance</Badge>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 text-center">
                    <Lock className="h-3 w-3 text-red-400 mx-auto mb-1" />
                    <p className="text-[8px] font-medium">Manutenção</p>
                    <p className="text-[7px] text-muted-foreground">Indisponível</p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Badge className="text-[8px] bg-gray-500/10 text-gray-400 border-gray-500/20">disabled</Badge>
                  <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-2 text-center">
                    <Lock className="h-3 w-3 text-gray-400 mx-auto mb-1" />
                    <p className="text-[8px] font-medium">Desativado</p>
                    <p className="text-[7px] text-muted-foreground">Bloqueado</p>
                  </div>
                </div>
              </div>
            </div>
          </FlowBox>

          {/* Message Customization */}
          <div className="bg-muted border border-border rounded-xl p-3">
            <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-2">Mensagens Personalizáveis</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <code className="text-[10px] text-green-300 font-mono">feature_flags.status_message</code>
                <span className="text-[9px] text-muted-foreground/70">— Mensagem customizada no Admin Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <code className="text-[10px] text-blue-300 font-mono">check.message</code>
                <span className="text-[9px] text-muted-foreground/70">— Mensagem exibida ao usuário</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <code className="text-[10px] text-purple-300 font-mono">Admin Panel → Feature Flags</code>
                <span className="text-[9px] text-muted-foreground/70">— Controle total das mensagens</span>
              </div>
            </div>
          </div>
        </div>
      </FlowBox>
    </div>
  );
}
