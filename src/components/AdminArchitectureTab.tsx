import { useState } from "react";
import {
  Globe,
  Shield,
  Database,
  Server,
  Users,
  Lock,
  Key,
  Layers,
  ArrowRight,
  ArrowDown,
  GitBranch,
  Cloud,
  Monitor,
  Smartphone,
  ChevronDown,
  Eye,
  Sparkles,
  BarChart3,
  FileText,
  Bell,
  Palette,
  Settings,
  Crosshair,
  FolderOpen,
  Download,
  ShieldCheck,
  Zap,
  Star,
  Crown,
  ToggleLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Wrench,
  Clock,
  Archive,
  Target,
  Lightbulb,
  Share2,
  Megaphone,
  Receipt,
  UserCheck,
  Calculator,
  DollarSign,
  TrendingUp,
  Expand,
  Minimize2,
  ZoomIn,
  ZoomOut,
  CalendarDays,
  GanttChart,
  Plug,
  Wifi,
  RefreshCw,
  Link2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function InfoTip({ children, tip }: { children: React.ReactNode; tip?: string }) {
  if (!tip) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-relaxed">
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// =====================================================
// TYPES
// =====================================================

type Section =
  | "overview"
  | "auth"
  | "data"
  | "features"
  | "edge"
  | "database"
  | "frontend"
  | "security"
  | "operations"
  | "integrations";

interface SectionConfig {
  key: Section;
  label: string;
  icon: typeof Globe;
  color: string;
  bg: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const SECTIONS: SectionConfig[] = [
  { key: "overview", label: "Visao Geral", icon: Layers, color: "text-primary", bg: "bg-primary/10" },
  { key: "frontend", label: "Frontend", icon: Monitor, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "auth", label: "Autenticacao", icon: Lock, color: "text-green-400", bg: "bg-green-500/10" },
  { key: "data", label: "Fluxo de Dados", icon: GitBranch, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "features", label: "Feature Flags", icon: ToggleLeft, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "edge", label: "Edge Functions", icon: Cloud, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "database", label: "Banco de Dados", icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "security", label: "Seguranca", icon: ShieldCheck, color: "text-red-400", bg: "bg-red-500/10" },
  { key: "operations", label: "Operacoes", icon: Megaphone, color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "integrations", label: "Integracoes", icon: Plug, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];

// =====================================================
// FLOW NODE COMPONENT
// =====================================================

function FlowNode({
  icon: Icon,
  label,
  sublabel,
  color = "text-slate-300",
  bg = "bg-slate-800/60",
  border = "border-slate-700/50",
  size = "normal",
  pulse = false,
  tooltip,
}: {
  icon: typeof Globe;
  label: string;
  sublabel?: string;
  color?: string;
  bg?: string;
  border?: string;
  size?: "small" | "normal" | "large";
  pulse?: boolean;
  tooltip?: string;
}) {
  const sizeClasses = {
    small: "px-3 py-2",
    normal: "px-4 py-3",
    large: "px-5 py-4",
  };
  const iconSize = {
    small: "h-3.5 w-3.5",
    normal: "h-4 w-4",
    large: "h-5 w-5",
  };

  const node = (
    <div
      className={`${bg} border ${border} rounded-xl ${sizeClasses[size]} flex items-center gap-3 relative ${
        pulse ? "animate-pulse" : ""
      } ${tooltip ? "cursor-help" : ""}`}
    >
      <Icon className={`${iconSize[size]} ${color} flex-shrink-0`} />
      <div className="min-w-0">
        <p className={`text-xs font-medium ${color}`}>{label}</p>
        {sublabel && <p className="text-[10px] text-slate-500 truncate">{sublabel}</p>}
      </div>
    </div>
  );

  return <InfoTip tip={tooltip}>{node}</InfoTip>;
}

// =====================================================
// CONNECTOR COMPONENTS
// =====================================================

function ArrowConnector({ direction = "right", label }: { direction?: "right" | "down"; label?: string }) {
  if (direction === "down") {
    return (
      <div className="flex flex-col items-center gap-0.5 py-1">
        <div className="w-px h-4 bg-gradient-to-b from-slate-600 to-slate-500" />
        {label && <span className="text-[9px] text-slate-500 px-2">{label}</span>}
        <ArrowDown className="h-3 w-3 text-slate-500" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 px-1">
      <div className="h-px w-4 bg-gradient-to-r from-slate-600 to-slate-500" />
      {label && <span className="text-[9px] text-slate-500 whitespace-nowrap">{label}</span>}
      <ArrowRight className="h-3 w-3 text-slate-500" />
    </div>
  );
}

function DottedLine({ direction = "down" }: { direction?: "right" | "down" }) {
  if (direction === "down") {
    return <div className="w-px h-6 border-l border-dashed border-slate-700 mx-auto" />;
  }
  return <div className="h-px w-6 border-t border-dashed border-slate-700 my-auto" />;
}

// =====================================================
// FLOW BOX COMPONENT
// =====================================================

function FlowBox({
  title,
  titleColor = "text-slate-300",
  borderColor = "border-slate-700/50",
  bgColor = "bg-slate-900/40",
  children,
  badge,
  defaultOpen = false,
}: {
  title: string;
  titleColor?: string;
  borderColor?: string;
  bgColor?: string;
  children: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const content = (
    <div className="space-y-3" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: `${10000 / zoom}%` }}>
      {children}
    </div>
  );

  return (
    <>
      <div className={`${bgColor} border ${borderColor} rounded-2xl overflow-hidden`}>
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${titleColor} truncate`}>{title}</p>
            {badge && (
              <Badge className="text-[9px] bg-slate-800 text-slate-400 border-slate-700 flex-shrink-0">{badge}</Badge>
            )}
          </button>
          {isOpen && (
            <button
              onClick={() => { setIsFullscreen(true); setZoom(100); }}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
              title="Expandir em tela cheia"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {isOpen && (
          <div className="px-4 pb-4 space-y-3">
            {children}
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none p-0 overflow-hidden border-0 bg-slate-950">
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold uppercase tracking-wider ${titleColor}`}>{title}</p>
              {badge && (
                <Badge className="text-[10px] bg-slate-800 text-slate-400 border-slate-700">{badge}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Diminuir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-slate-500 font-mono w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                disabled={zoom >= 200}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Aumentar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-slate-800 mx-1" />
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
                title="Fechar tela cheia"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="overflow-auto flex-1 p-6" style={{ height: "calc(100vh - 52px)" }}>
            {content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// =====================================================
// SECTION: OVERVIEW
// =====================================================

function OverviewSection() {
  return (
    <div className="space-y-6">
      {/* High-level architecture */}
      <FlowBox title="Arquitetura de Alto Nivel" borderColor="border-primary/20" bgColor="bg-primary/5" defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Client Layer */}
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Camada Cliente</span>
            </div>
            <div className="space-y-2">
              <FlowNode icon={Globe} label="React SPA" sublabel="Vite + TypeScript" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" tooltip="Single Page Application: toda a interface roda no navegador sem recarregar a pagina" />
              <FlowNode icon={Palette} label="shadcn/ui + Tailwind" sublabel="Design System" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" tooltip="Sistema de design com componentes pre-construidos e estilizacao utilitaria" />
              <FlowNode icon={Smartphone} label="Responsive" sublabel="Mobile-first" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" tooltip="Layout adaptavel: projetado primeiro para mobile, depois expandido para desktop" />
            </div>
          </div>

          {/* API Layer */}
          <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-purple-400" />
              <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Camada API</span>
            </div>
            <div className="space-y-2">
              <FlowNode icon={Server} label="Supabase Client" sublabel="REST + Realtime" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" size="small" tooltip="Cliente JavaScript que conecta o frontend ao banco de dados via API REST e WebSocket" />
              <FlowNode icon={Cloud} label="Edge Functions" sublabel="12 funcoes Deno" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" size="small" tooltip="Funcoes serverless executadas na borda (CDN), proximas ao usuario, com baixa latencia" />
              <FlowNode icon={Sparkles} label="AI APIs" sublabel="Gemini + Claude" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" size="small" tooltip="APIs de inteligencia artificial do Google (Gemini) e Anthropic (Claude) para analises avancadas" />
            </div>
          </div>

          {/* Data Layer */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Camada Dados</span>
            </div>
            <div className="space-y-2">
              <FlowNode icon={Database} label="PostgreSQL" sublabel="Supabase DB" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" tooltip="Banco de dados relacional robusto, open source, com suporte a JSON, triggers e views" />
              <FlowNode icon={Lock} label="Row Level Security" sublabel="Isolamento por user_id" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" tooltip="Politica de seguranca que filtra automaticamente os dados por usuario em cada query" />
              <FlowNode icon={Archive} label="Storage" sublabel="Avatars bucket" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" tooltip="Armazenamento de arquivos (fotos de perfil) com politicas de acesso por bucket" />
            </div>
          </div>
        </div>

        {/* Connection arrows between layers */}
        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex items-center gap-2 bg-slate-800/40 rounded-full px-4 py-1.5">
            <Monitor className="h-3 w-3 text-blue-400" />
            <div className="flex items-center gap-1">
              <div className="h-px w-3 bg-blue-400/40" />
              <ArrowRight className="h-3 w-3 text-slate-500" />
              <div className="h-px w-3 bg-purple-400/40" />
            </div>
            <Cloud className="h-3 w-3 text-purple-400" />
            <div className="flex items-center gap-1">
              <div className="h-px w-3 bg-purple-400/40" />
              <ArrowRight className="h-3 w-3 text-slate-500" />
              <div className="h-px w-3 bg-emerald-400/40" />
            </div>
            <Database className="h-3 w-3 text-emerald-400" />
          </div>
        </div>
      </FlowBox>

      {/* Tech Stack */}
      <FlowBox title="Stack Tecnologico" badge="v3.9.0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "React 18.3", sub: "UI Framework", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", tip: "Biblioteca para construcao de interfaces reativas com componentes reutilizaveis e Virtual DOM" },
            { label: "TypeScript", sub: "Type Safety", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", tip: "Superset do JavaScript que adiciona tipagem estatica, prevenindo erros em tempo de compilacao" },
            { label: "Vite 5.4", sub: "Build Tool", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", tip: "Bundler ultrarapido com Hot Module Replacement (HMR) instantaneo e builds otimizados para producao" },
            { label: "Tailwind 3.4", sub: "Styling", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", tip: "Framework CSS utility-first que permite estilizar diretamente no HTML com classes atomicas" },
            { label: "Supabase", sub: "BaaS", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", tip: "Backend-as-a-Service open source: PostgreSQL, Auth, Storage, Edge Functions e Real-time" },
            { label: "TanStack Query", sub: "Data Fetching", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", tip: "Gerenciamento de estado assincrono com cache automatico, revalidacao e deduplicacao de requests" },
            { label: "React Router v6", sub: "Routing", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", tip: "Navegacao SPA com rotas declarativas, nested routes, loaders e protecao de rotas" },
            { label: "shadcn/ui", sub: "Components", color: "text-slate-300", bg: "bg-slate-800/60", border: "border-slate-700/50", tip: "Componentes acessiveis baseados em Radix UI, copiaveis e customizaveis com Tailwind" },
          ].map((tech) => (
            <InfoTip key={tech.label} tip={tech.tip}>
              <div className={`${tech.bg} border ${tech.border} rounded-xl p-3 text-center cursor-help`}>
                <p className={`text-xs font-bold ${tech.color}`}>{tech.label}</p>
                <p className="text-[10px] text-slate-500">{tech.sub}</p>
              </div>
            </InfoTip>
          ))}
        </div>
      </FlowBox>

      {/* Numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { n: "35+", label: "Paginas", icon: FileText, color: "text-blue-400" },
          { n: "50+", label: "Componentes", icon: Layers, color: "text-purple-400" },
          { n: "8", label: "Hooks", icon: GitBranch, color: "text-green-400" },
          { n: "12", label: "Edge Functions", icon: Cloud, color: "text-cyan-400" },
          { n: "18+", label: "Tabelas SQL", icon: Database, color: "text-emerald-400" },
          { n: "25", label: "Feature Flags", icon: ToggleLeft, color: "text-amber-400" },
          { n: "15", label: "Libs", icon: Crown, color: "text-primary" },
          { n: "35+", label: "Arquivos SQL", icon: FileText, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
            <stat.icon className={`h-5 w-5 ${stat.color} flex-shrink-0`} />
            <div>
              <p className="text-lg font-bold text-white">{stat.n}</p>
              <p className="text-[10px] text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// SECTION: FRONTEND
// =====================================================

function FrontendSection() {
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
              { path: "/relatorios", page: "FeatureRelatorios", desc: "Feature: Relatorios" },
              { path: "/oauth/callback", page: "OAuthCallback", desc: "Retorno OAuth" },
            ].map((route) => (
              <div key={route.path} className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
                <code className="text-[10px] text-green-400 font-mono bg-green-500/10 px-1.5 py-0.5 rounded">{route.path}</code>
                <ArrowRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-300">{route.page}</span>
                <span className="text-[9px] text-slate-600 ml-auto">{route.desc}</span>
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
              { path: "/checkout", page: "Checkout", desc: "Pagamento" },
              { path: "/help", page: "Help", desc: "Centro de ajuda" },
            ].map((route) => (
              <div key={route.path} className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
                <code className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded">{route.path}</code>
                <ArrowRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
                <span className="text-[11px] text-slate-300">{route.page}</span>
                <span className="text-[9px] text-slate-600 ml-auto">{route.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Routes */}
        <div className="mt-4 pt-4 border-t border-slate-800/50">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-3.5 w-3.5 text-red-400" />
            <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Rotas Admin</span>
            <Badge className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20">AdminProtectedRoute</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded">/admin/login</code>
              <ArrowRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-300">AdminLogin</span>
              <span className="text-[9px] text-slate-600 ml-auto">CNPJ + Senha</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-red-400 font-mono bg-red-500/10 px-1.5 py-0.5 rounded">/admin</code>
              <ArrowRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-300">AdminPanel</span>
              <span className="text-[9px] text-slate-600 ml-auto">Painel completo</span>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Component Hierarchy */}
      <FlowBox title="Hierarquia de Componentes" badge="50+ componentes">
        <div className="space-y-4">
          {/* App wrapper */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs font-semibold text-white">App.tsx</span>
              <span className="text-[9px] text-slate-500">— Root Component</span>
            </div>
            <div className="ml-4 space-y-2">
              {[
                { name: "ThemeProvider", desc: "Dark/Light mode", color: "text-purple-400" },
                { name: "QueryClientProvider", desc: "TanStack Query cache", color: "text-red-400" },
                { name: "BrowserRouter", desc: "React Router SPA", color: "text-pink-400" },
                { name: "TooltipProvider", desc: "Radix tooltips", color: "text-slate-400" },
              ].map((wrapper) => (
                <div key={wrapper.name} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <code className={`text-[10px] font-mono ${wrapper.color}`}>{wrapper.name}</code>
                  <span className="text-[9px] text-slate-600">{wrapper.desc}</span>
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
                    <code className="text-[10px] text-slate-400 font-mono">{c}</code>
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
                    <code className="text-[10px] text-slate-400 font-mono">{c}</code>
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
                    <code className="text-[10px] text-slate-400 font-mono">{c}</code>
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
                <div key={hook.name} className="bg-slate-800/30 rounded-lg px-2.5 py-2">
                  <code className="text-[10px] text-purple-300 font-mono">{hook.name}</code>
                  <p className="text-[9px] text-slate-600">{hook.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: AUTH
// =====================================================

function AuthSection() {
  return (
    <div className="space-y-6">
      {/* User Auth Flow */}
      <FlowBox title="Fluxo de Autenticacao — Usuario" borderColor="border-green-500/20" bgColor="bg-green-500/5" defaultOpen>
        <div className="space-y-3">
          {/* Visual flow */}
          <div className="flex flex-col items-center gap-0">
            <FlowNode icon={Globe} label="Usuario acessa /auth" sublabel="Pagina de Login/Signup" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
            <ArrowConnector direction="down" label="Preenche formulario" />
            <FlowNode icon={Key} label="Supabase Auth" sublabel="signInWithPassword / signUp" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" />
            <ArrowConnector direction="down" label="Sucesso" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="flex flex-col items-center gap-0">
                <Badge className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20 mb-2">Login</Badge>
                <FlowNode icon={Users} label="Sessao criada" sublabel="JWT token + refresh" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={Monitor} label="Redireciona /dashboard" sublabel="ProtectedRoute permite acesso" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" />
              </div>
              <div className="flex flex-col items-center gap-0">
                <Badge className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 mb-2">Signup</Badge>
                <FlowNode icon={Database} label="Trigger: on_auth_user_created" sublabel="Cria tenant_settings automatico" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={Settings} label="Plano Starter" sublabel="5 analises/mes, 5 publicos" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
              </div>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Admin Auth Flow */}
      <FlowBox title="Fluxo de Autenticacao — Admin" borderColor="border-red-500/20" bgColor="bg-red-500/5">
        <div className="space-y-3">
          <div className="flex flex-col items-center gap-0">
            <FlowNode icon={Shield} label="Admin acessa /admin/login" sublabel="Rota nao referenciada publicamente" color="text-red-300" bg="bg-red-500/10" border="border-red-500/20" />
            <ArrowConnector direction="down" label="CNPJ + Senha" />
            <FlowNode icon={Key} label="Validacao Local" sublabel="SHA-256 hash + check_admin_login_attempts RPC" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
            <ArrowConnector direction="down" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="flex flex-col items-center gap-0">
                <Badge className="text-[9px] bg-green-500/10 text-green-400 border-green-500/20 mb-2">Sucesso</Badge>
                <FlowNode icon={CheckCircle2} label="Sessao localStorage" sublabel="Token 32 bytes + expira 4h" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={Shield} label="AdminProtectedRoute" sublabel="Verifica sessao a cada 60s" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
              </div>
              <div className="flex flex-col items-center gap-0">
                <Badge className="text-[9px] bg-red-500/10 text-red-400 border-red-500/20 mb-2">Falha</Badge>
                <FlowNode icon={AlertTriangle} label="increment_login_attempts" sublabel="Conta tentativas erradas" color="text-red-300" bg="bg-red-500/10" border="border-red-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={XCircle} label="Bloqueio 15 min" sublabel="Apos 5 tentativas consecutivas" color="text-red-300" bg="bg-red-500/10" border="border-red-500/20" size="small" />
              </div>
            </div>
          </div>

          {/* Key difference */}
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 mt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-400">Autenticacao Separada</p>
                <p className="text-[10px] text-slate-500">Admin usa localStorage + SHA-256 (tabela admin_users). Nao interfere com Supabase Auth dos clientes. Sessoes sao completamente independentes.</p>
              </div>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Route Protection */}
      <FlowBox title="Sistema de Protecao de Rotas">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-center">
            <Globe className="h-5 w-5 text-green-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-green-400">Publicas</p>
            <p className="text-[10px] text-slate-500 mt-1">ForceLightMode wrapper</p>
            <p className="text-[9px] text-slate-600 mt-0.5">Sem autenticacao</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
            <Lock className="h-5 w-5 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-amber-400">Protegidas</p>
            <p className="text-[10px] text-slate-500 mt-1">ProtectedRoute + FeatureGate</p>
            <p className="text-[9px] text-slate-600 mt-0.5">Supabase Auth + Feature Flags</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
            <Shield className="h-5 w-5 text-red-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-red-400">Admin</p>
            <p className="text-[10px] text-slate-500 mt-1">AdminProtectedRoute</p>
            <p className="text-[9px] text-slate-600 mt-0.5">CNPJ + localStorage session</p>
          </div>
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: DATA FLOW
// =====================================================

function DataFlowSection() {
  return (
    <div className="space-y-6">
      {/* URL Analysis Flow */}
      <FlowBox title="Fluxo de Analise de URL" borderColor="border-primary/20" bgColor="bg-primary/5" badge="Core Feature" defaultOpen>
        <div className="space-y-0 flex flex-col items-center">
          <FlowNode icon={Globe} label="1. Usuario cria projeto" sublabel="Nome + Nicho + URL + Concorrentes" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="Clica 'Analisar'" />
          <FlowNode icon={Server} label="2. Edge Function: analyze-url" sublabel="Fetch HTML da URL alvo" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="HTML recebido" />
          <FlowNode icon={Target} label="3. Analise Heuristica" sublabel="Regex + contagem de elementos" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
          <ArrowConnector direction="down" label="Scores calculados" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
            {[
              { label: "Proposta de Valor", score: "0-100" },
              { label: "Clareza", score: "0-100" },
              { label: "Jornada", score: "0-100" },
              { label: "SEO", score: "0-100" },
              { label: "Conversao", score: "0-100" },
              { label: "Conteudo", score: "0-100" },
            ].map((s) => (
              <div key={s.label} className="bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-primary font-medium">{s.label}</p>
                <p className="text-[9px] text-slate-500">{s.score}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Salva no DB" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <FlowNode icon={Database} label="projects" sublabel="Score geral + status" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" />
            <FlowNode icon={Lightbulb} label="insights" sublabel="Warnings + Oportunidades" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" size="small" />
            <FlowNode icon={BarChart3} label="channel_scores" sublabel="Google/Meta/LinkedIn/TikTok" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
          </div>

          <ArrowConnector direction="down" label="Notifica usuario" />
          <FlowNode icon={Bell} label="4. Notificacao" sublabel="Analise concluida — libera analise por IA" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
        </div>
      </FlowBox>

      {/* AI Analysis Flow */}
      <FlowBox title="Fluxo de Analise por IA" borderColor="border-purple-500/20" bgColor="bg-purple-500/5" badge="Sob Demanda">
        <div className="space-y-0 flex flex-col items-center">
          <FlowNode icon={Key} label="1. API Key configurada" sublabel="Settings > Integracoes de IA" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="Key validada" />
          <FlowNode icon={FileText} label="2. Dados heuristicos + HTML" sublabel="Resultado da analise anterior" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="Envia para IA" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-center">
              <Sparkles className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-blue-400">Google Gemini</p>
              <p className="text-[9px] text-slate-500">Flash 2.0 / 3 Preview / Pro</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
              <Sparkles className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-amber-400">Anthropic Claude</p>
              <p className="text-[9px] text-slate-500">Sonnet 4 / 3.7 / Haiku / Opus</p>
            </div>
          </div>

          <ArrowConnector direction="down" label="Insights aprofundados" />
          <FlowNode icon={Lightbulb} label="3. Insights enriquecidos" sublabel="Salvos em insights com source = 'ai'" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        </div>
      </FlowBox>

      {/* Benchmark Flow */}
      <FlowBox title="Fluxo de Benchmark Competitivo" borderColor="border-green-500/20" bgColor="bg-green-500/5">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Globe} label="URLs de concorrentes" sublabel="Definidos no projeto" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="Analisa cada URL" />
          <FlowNode icon={BarChart3} label="Comparacao de scores" sublabel="Projeto vs Concorrentes" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" />
          <ArrowConnector direction="down" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {["SWOT", "Gap Analysis", "Scores Comparados", "Recomendacoes"].map((item) => (
              <div key={item} className="bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-green-400 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </FlowBox>

      {/* ICP Enrichment Flow */}
      <FlowBox title="Fluxo de Enriquecimento de ICP" borderColor="border-pink-500/20" bgColor="bg-pink-500/5" badge="v3.9">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Users} label="1. Publico-alvo criado" sublabel="Nome + Industria + Porte + Keywords" color="text-pink-300" bg="bg-pink-500/10" border="border-pink-500/20" />
          <ArrowConnector direction="down" label="Clica 'Refinar ICP com IA'" />
          <FlowNode icon={Cloud} label="2. Edge Function: enrich-icp" sublabel="Fetch SEBRAE + IBGE (server-side)" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
          <ArrowConnector direction="down" label="Texto extraido" />
          <FlowNode icon={Sparkles} label="3. Prompt IA especializado" sublabel="Dados do publico + fontes publicas → Gemini/Claude" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="Resposta estruturada" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
            {[
              { label: "Descricao Refinada", sub: "Perfil ideal detalhado" },
              { label: "Decisores", sub: "Cargos-chave" },
              { label: "Dores + Gatilhos", sub: "Pain points + triggers" },
              { label: "Dados Demograficos", sub: "IBGE + mercado" },
              { label: "Keywords Sugeridas", sub: "Termos otimizados" },
              { label: "Recomendacoes", sub: "Acoes estrategicas" },
            ].map((item) => (
              <div key={item.label} className="bg-pink-500/10 border border-pink-500/20 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-pink-400 font-medium">{item.label}</p>
                <p className="text-[9px] text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Salva em audiences.icp_enrichment" />
          <FlowNode icon={Eye} label="4. IcpEnrichmentDialog" sublabel="Dialog com fullscreen, perfil, dores, gatilhos, keywords, recomendacoes" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: FEATURE FLAGS
// =====================================================

function FeatureFlagsSection() {
  return (
    <div className="space-y-6">
      {/* Decision Tree */}
      <FlowBox title="Arvore de Decisao — Acesso a Feature" borderColor="border-amber-500/20" bgColor="bg-amber-500/5" badge="useFeatureFlags" defaultOpen>
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Users} label="Usuario acessa pagina protegida" sublabel="Ex: /projects, /benchmark, /tactical" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="FeatureGate verifica" />

          <FlowNode icon={ToggleLeft} label="1. Status Global da Feature" sublabel="feature_flags.status" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
          <ArrowConnector direction="down" />

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 w-full">
            {[
              { status: "active", label: "Ativo", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", action: "Prossegue" },
              { status: "disabled", label: "Desativado", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", action: "Bloqueado" },
              { status: "development", label: "Em Dev", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", action: "Em breve" },
              { status: "maintenance", label: "Manutencao", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", action: "Aviso" },
              { status: "deprecated", label: "Descontinuado", color: "text-slate-400", bg: "bg-slate-800/60", border: "border-slate-700/50", action: "Remocao" },
            ].map((s) => (
              <div key={s.status} className={`${s.bg} border ${s.border} rounded-lg px-2 py-2 text-center`}>
                <p className={`text-[10px] font-medium ${s.color}`}>{s.label}</p>
                <p className="text-[9px] text-slate-500">{s.action}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Se ativo..." />

          <FlowNode icon={Eye} label="2. Override por Usuario?" sublabel="user_feature_overrides" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-purple-400 font-medium">Override = true</p>
              <p className="text-[9px] text-slate-500">Acesso liberado (ignora plano)</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Override = false</p>
              <p className="text-[9px] text-slate-500">Acesso bloqueado (ignora plano)</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-slate-300 font-medium">Sem override</p>
              <p className="text-[9px] text-slate-500">Verifica plano do usuario</p>
            </div>
          </div>

          <ArrowConnector direction="down" label="Se sem override..." />

          <FlowNode icon={Crown} label="3. Permissao do Plano" sublabel="plan_features.is_enabled" color="text-primary" bg="bg-primary/10" border="border-primary/20" />
          <ArrowConnector direction="down" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">
              <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <p className="text-[10px] text-green-400 font-medium">Habilitado no plano</p>
              <p className="text-[9px] text-slate-500">Acesso concedido</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
              <p className="text-[10px] text-red-400 font-medium">Nao habilitado</p>
              <p className="text-[9px] text-slate-500">Tela de upgrade exibida</p>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Priority chain */}
      <FlowBox title="Cadeia de Prioridade">
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
            <p className="text-xs font-bold text-amber-400">1o</p>
            <p className="text-[10px] text-slate-400">Status Global</p>
            <code className="text-[9px] text-slate-500 font-mono">feature_flags</code>
          </div>
          <ArrowConnector direction="right" />
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 text-center">
            <p className="text-xs font-bold text-purple-400">2o</p>
            <p className="text-[10px] text-slate-400">Override Usuario</p>
            <code className="text-[9px] text-slate-500 font-mono">user_feature_overrides</code>
          </div>
          <ArrowConnector direction="right" />
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-center">
            <p className="text-xs font-bold text-primary">3o</p>
            <p className="text-[10px] text-slate-400">Permissao Plano</p>
            <code className="text-[9px] text-slate-500 font-mono">plan_features</code>
          </div>
        </div>
      </FlowBox>

      {/* Categories */}
      <FlowBox title="Categorias de Features" badge="25 features">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Projetos", icon: FolderOpen, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", count: 5, tip: "Criacao de projetos, analise de URL, scores por canal, insights e competitor URLs" },
            { label: "Inteligencia Artificial", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", count: 3, tip: "Analise por IA (Gemini/Claude), enriquecimento de insights e analise de performance" },
            { label: "Benchmark", icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", count: 2, tip: "Comparacao SWOT com concorrentes, gap analysis e scores comparados" },
            { label: "Plano Tatico", icon: Crosshair, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", count: 3, tip: "Templates de campanhas, sugestoes de budget e cronograma por canal" },
            { label: "Exportacao", icon: Download, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", count: 3, tip: "Exportar relatorios em PDF, dados em JSON e backup completo da conta" },
            { label: "Marca & Social", icon: Share2, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", count: 2, tip: "Brand Guide com identidade visual, tom de voz e posts para redes sociais" },
            { label: "Insights & Alertas", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", count: 7, tip: "Insights estrategicos, alertas de investimento prematuro e recomendacoes por canal" },
            { label: "Configuracoes", icon: Settings, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", count: 2, tip: "Configuracoes da conta, API keys de IA, preferencias do usuario e enriquecimento de ICP" },
          ].map((cat) => (
            <InfoTip key={cat.label} tip={cat.tip}>
              <div className={`${cat.bg} border ${cat.border} rounded-xl p-3 text-center cursor-help`}>
                <cat.icon className={`h-5 w-5 ${cat.color} mx-auto mb-1.5`} />
                <p className={`text-[10px] font-medium ${cat.color}`}>{cat.label}</p>
                <p className="text-[9px] text-slate-500">{cat.count} features</p>
              </div>
            </InfoTip>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: EDGE FUNCTIONS
// =====================================================

function EdgeFunctionsSection() {
  return (
    <div className="space-y-6">
      <FlowBox title="Supabase Edge Functions" borderColor="border-cyan-500/20" bgColor="bg-cyan-500/5" badge="Deno Runtime" defaultOpen>
        <div className="space-y-3">
          {[
            {
              name: "analyze-url",
              desc: "Analise heuristica de URL — fetch HTML, regex, calcula scores",
              trigger: "Invocado pelo frontend",
              input: "URL do projeto",
              output: "Scores + Insights + Channel Scores",
              auth: "JWT Bearer token",
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
            },
            {
              name: "ai-analyze",
              desc: "Proxy para APIs de IA (Gemini/Claude) — contorna CORS",
              trigger: "Sob demanda (apos heuristica)",
              input: "Provider + API Key + Model + Prompt",
              output: "Texto gerado pela IA",
              auth: "JWT Bearer token",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
            },
            {
              name: "collect-uptime",
              desc: "Coleta metricas de uptime dos servicos da plataforma",
              trigger: "pg_cron / Scheduled",
              input: "Lista de servicos",
              output: "Status + latencia + uptime %",
              auth: "JWT ou INTERNAL_CRON_SECRET",
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              name: "export-user-data",
              desc: "Exporta todos os dados do usuario (LGPD compliance)",
              trigger: "Solicitacao do usuario",
              input: "user_id (do JWT)",
              output: "JSON com todos os dados",
              auth: "JWT Bearer token",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20",
            },
            {
              name: "notify-incident",
              desc: "Envia notificacoes sobre incidentes da plataforma",
              trigger: "Novo incidente / update",
              input: "Incident data + subscribers",
              output: "Email / webhook notifications",
              auth: "JWT ou INTERNAL_CRON_SECRET",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
            {
              name: "status-rss",
              desc: "Gera feed RSS do status — proxied via /api/status-rss",
              trigger: "GET request (publico)",
              input: "—",
              output: "RSS XML feed",
              auth: "Publico (somente leitura)",
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
            },
            {
              name: "status-webhook",
              desc: "Recebe webhooks de monitoramento — proxied via /api/status-webhook",
              trigger: "Webhook POST",
              input: "Payload do servico",
              output: "Atualiza status do servico",
              auth: "WEBHOOK_SECRET obrigatorio",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              name: "enrich-icp",
              desc: "Fetch de fontes publicas (SEBRAE, IBGE) para enriquecimento de ICP",
              trigger: "Invocado pelo frontend (Audiences)",
              input: "industry, location, companySize, keywords",
              output: "Texto extraido de fontes publicas",
              auth: "JWT Bearer token",
              color: "text-pink-400",
              bg: "bg-pink-500/10",
              border: "border-pink-500/20",
            },
            {
              name: "admin-api",
              desc: "API administrativa — CRUD de features, planos, usuarios, status page",
              trigger: "Invocado pelo AdminPanel",
              input: "action + params (JSON)",
              output: "Dados administrativos",
              auth: "Admin session token",
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
            },
          ].map((fn) => (
            <div key={fn.name} className={`${fn.bg} border ${fn.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Cloud className={`h-4 w-4 ${fn.color}`} />
                <code className={`text-xs font-mono font-semibold ${fn.color}`}>{fn.name}</code>
                <Badge className="text-[8px] bg-green-500/10 text-green-400 border-green-500/20 ml-auto">
                  <Lock className="h-2.5 w-2.5 mr-0.5" />{fn.auth.includes("Publico") ? "Publico" : "Auth"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">{fn.desc}</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Trigger</p>
                  <p className="text-[10px] text-slate-400">{fn.trigger}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Input</p>
                  <p className="text-[10px] text-slate-400">{fn.input}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Output</p>
                  <p className="text-[10px] text-slate-400">{fn.output}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Auth</p>
                  <p className="text-[10px] text-slate-400">{fn.auth}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Claude Proxy Architecture */}
      <FlowBox title="Arquitetura Claude Proxy" badge="CORS Bypass">
        <div className="space-y-4">
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-400">Por que um proxy?</p>
                <p className="text-[10px] text-slate-500">A API da Anthropic (Claude) bloqueia chamadas diretas do browser via CORS. Gemini permite chamadas diretas. Claude precisa de proxy server-side.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-2">Dev Local (npm run dev)</p>
              <div className="flex flex-col items-center gap-0">
                <FlowNode icon={Monitor} label="Browser" sublabel="POST /api/claude-proxy" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={Server} label="Vite Plugin Middleware" sublabel="claudeProxyPlugin() — Node.js" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={Sparkles} label="api.anthropic.com" sublabel="Server-side fetch (sem CORS)" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" size="small" />
              </div>
            </div>
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-2">Producao (Vercel)</p>
              <div className="flex flex-col items-center gap-0">
                <FlowNode icon={Monitor} label="Browser" sublabel="POST /api/claude-proxy" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={Cloud} label="Vercel Serverless Function" sublabel="api/claude-proxy.ts" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
                <ArrowConnector direction="down" />
                <FlowNode icon={Sparkles} label="api.anthropic.com" sublabel="Server-side fetch (sem CORS)" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" size="small" />
              </div>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Vercel Proxy Rewrites */}
      <FlowBox title="Vercel Proxy Rewrites" badge="vercel.json">
        <div className="space-y-2">
          {[
            { source: "/api/status-rss", dest: "Edge Function: status-rss", desc: "RSS feed publico — esconde URL do Supabase" },
            { source: "/api/status-webhook", dest: "Edge Function: status-webhook", desc: "Webhook de monitoramento externo" },
            { source: "/api/claude-proxy", dest: "Vercel Serverless Function", desc: "Proxy para API Anthropic (Claude)" },
          ].map((r) => (
            <div key={r.source} className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded">{r.source}</code>
              <ArrowRight className="h-3 w-3 text-slate-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-300">{r.dest}</span>
              <span className="text-[9px] text-slate-600 ml-auto hidden sm:inline">{r.desc}</span>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Edge Function Flow */}
      <FlowBox title="Fluxo de Execucao">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Monitor} label="Frontend (React)" sublabel="supabase.functions.invoke() + Authorization header" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="HTTPS POST + JWT" />
          <FlowNode icon={ShieldCheck} label="Auth Check" sublabel="Valida Bearer token ou secret" color="text-red-300" bg="bg-red-500/10" border="border-red-500/20" />
          <ArrowConnector direction="down" label="Autorizado" />
          <FlowNode icon={Cloud} label="Supabase Edge" sublabel="Deno runtime — isolate por request" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
          <ArrowConnector direction="down" label="Processa" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <FlowNode icon={Globe} label="Fetch externo" sublabel="URLs, APIs" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" size="small" />
            <FlowNode icon={Database} label="Query DB" sublabel="service_role client" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" />
            <FlowNode icon={Sparkles} label="AI APIs" sublabel="Gemini / Claude" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" size="small" />
          </div>
          <ArrowConnector direction="down" label="Response JSON" />
          <FlowNode icon={Monitor} label="Frontend atualiza UI" sublabel="TanStack Query invalidate + toast" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: DATABASE
// =====================================================

function DatabaseSection() {
  return (
    <div className="space-y-6">
      {/* Entity Relationship */}
      <FlowBox title="Modelo de Entidades" borderColor="border-emerald-500/20" bgColor="bg-emerald-500/5" badge="PostgreSQL" defaultOpen>
        <div className="space-y-4">
          {/* Core tables */}
          <div>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-2">Tabelas Core</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  name: "tenant_settings",
                  desc: "Configuracoes do usuario/empresa",
                  cols: ["user_id (PK)", "company_name", "plan", "full_name", "email", "analyses_used", "monthly_analyses_limit", "max_audiences"],
                  color: "text-blue-400",
                  border: "border-blue-500/20",
                  tip: "Tabela central do usuario: armazena plano, limites de uso e dados da empresa. Criada automaticamente no signup via trigger.",
                },
                {
                  name: "projects",
                  desc: "Projetos de analise",
                  cols: ["id (PK)", "user_id (FK)", "name", "niche", "url", "competitor_urls", "score", "status"],
                  color: "text-primary",
                  border: "border-primary/20",
                  tip: "Cada projeto representa uma URL a ser analisada. Contem score geral (0-100), nicho de mercado e URLs de concorrentes.",
                },
                {
                  name: "insights",
                  desc: "Insights estrategicos",
                  cols: ["id (PK)", "project_id (FK)", "user_id", "type", "title", "description", "source"],
                  color: "text-amber-400",
                  border: "border-amber-500/20",
                  tip: "Recomendacoes geradas pela analise heuristica ou IA. Tipos: warning (alerta), opportunity (oportunidade), improvement (melhoria).",
                },
                {
                  name: "project_channel_scores",
                  desc: "Scores por canal de midia",
                  cols: ["id (PK)", "project_id (FK)", "channel", "score", "objectives", "risks"],
                  color: "text-green-400",
                  border: "border-green-500/20",
                  tip: "Avaliacao de prontidao por canal (Google, Meta, LinkedIn, TikTok). Inclui objetivos recomendados e riscos identificados.",
                },
                {
                  name: "benchmarks",
                  desc: "Analise competitiva SWOT",
                  cols: ["id (PK)", "project_id (FK)", "competitor_url", "swot", "scores", "gap_analysis"],
                  color: "text-purple-400",
                  border: "border-purple-500/20",
                  tip: "Comparacao entre seu projeto e concorrentes. SWOT (Forcas, Fraquezas, Oportunidades, Ameacas) + gap analysis automatico.",
                },
                {
                  name: "audiences",
                  desc: "Publicos-alvo + ICP enriquecido",
                  cols: ["id (PK)", "user_id (FK)", "project_id (FK?)", "name", "industry", "size", "keywords", "icp_enrichment (JSONB)", "icp_enriched_at"],
                  color: "text-pink-400",
                  border: "border-pink-500/20",
                  tip: "Segmentos de publico-alvo com industria, porte e keywords. ICP pode ser enriquecido com IA via fontes publicas (SEBRAE/IBGE).",
                },
                {
                  name: "user_api_keys",
                  desc: "API keys de IA por usuario",
                  cols: ["id (PK)", "user_id (FK)", "provider (UK)", "api_key", "preferred_model", "is_active", "last_validated_at"],
                  color: "text-purple-400",
                  border: "border-purple-500/20",
                  tip: "Chaves de API de IA (Google Gemini / Anthropic Claude) configuradas por usuario. Constraint unique(user_id, provider).",
                },
              ].map((table) => (
                <InfoTip key={table.name} tip={table.tip}>
                <div className={`bg-slate-800/30 border ${table.border} rounded-xl p-3 cursor-help`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-slate-500 mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : "bg-slate-600"}`} />
                        <code className="text-[9px] text-slate-400 font-mono">{col}</code>
                      </div>
                    ))}
                  </div>
                </div>
                </InfoTip>
              ))}
            </div>
          </div>

          {/* Admin tables */}
          <div>
            <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-2">Tabelas Admin</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  name: "admin_users",
                  desc: "Administradores da plataforma",
                  cols: ["id (PK)", "cnpj", "password_hash", "role", "is_active", "login_attempts", "locked_until"],
                  color: "text-red-400",
                  border: "border-red-500/20",
                },
                {
                  name: "feature_flags",
                  desc: "Controle global de features",
                  cols: ["id (PK)", "feature_key (UK)", "feature_name", "category", "status", "status_message", "sort_order"],
                  color: "text-amber-400",
                  border: "border-amber-500/20",
                },
                {
                  name: "plan_features",
                  desc: "Features por plano",
                  cols: ["id (PK)", "feature_key (FK)", "plan", "is_enabled", "usage_limit", "limit_period"],
                  color: "text-green-400",
                  border: "border-green-500/20",
                },
                {
                  name: "user_feature_overrides",
                  desc: "Override de features por usuario",
                  cols: ["id (PK)", "user_id", "feature_key (FK)", "is_enabled", "reason", "admin_id (FK)"],
                  color: "text-purple-400",
                  border: "border-purple-500/20",
                },
                {
                  name: "admin_audit_log",
                  desc: "Log de acoes administrativas",
                  cols: ["id (PK)", "admin_id (FK)", "action", "target_table", "target_id", "details (JSONB)"],
                  color: "text-cyan-400",
                  border: "border-cyan-500/20",
                },
                {
                  name: "notifications",
                  desc: "Sistema de notificacoes",
                  cols: ["id (PK)", "user_id (FK)", "type", "title", "message", "read", "created_at"],
                  color: "text-blue-400",
                  border: "border-blue-500/20",
                },
              ].map((table) => (
                <div key={table.name} className={`bg-slate-800/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-slate-500 mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : col.includes("UK") ? "bg-green-400" : "bg-slate-600"}`} />
                        <code className="text-[9px] text-slate-400 font-mono">{col}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Page tables */}
          <div>
            <p className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider mb-2">Tabelas Status Page</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  name: "platform_services",
                  desc: "Servicos monitorados",
                  cols: ["id (PK)", "name", "description", "category", "status", "uptime_percentage", "sort_order"],
                  color: "text-cyan-400",
                  border: "border-cyan-500/20",
                },
                {
                  name: "platform_incidents",
                  desc: "Incidentes registrados",
                  cols: ["id (PK)", "title", "status", "severity", "affected_services", "resolved_at"],
                  color: "text-amber-400",
                  border: "border-amber-500/20",
                },
                {
                  name: "platform_maintenances",
                  desc: "Manutencoes agendadas",
                  cols: ["id (PK)", "title", "status", "scheduled_start", "scheduled_end", "affected_services"],
                  color: "text-blue-400",
                  border: "border-blue-500/20",
                },
              ].map((table) => (
                <div key={table.name} className={`bg-slate-800/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-slate-500 mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : "bg-slate-600"}`} />
                        <code className="text-[9px] text-slate-400 font-mono">{col}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational tables */}
          <div>
            <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider mb-2">Tabelas Operacionais (v3.x)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  name: "campaigns",
                  desc: "Campanhas de marketing por canal",
                  cols: ["id (PK)", "user_id (FK)", "project_id (FK)", "name", "channel", "status", "objective", "budget_total", "budget_spent", "start_date", "end_date", "is_deleted"],
                  color: "text-orange-400",
                  border: "border-orange-500/20",
                },
                {
                  name: "campaign_metrics",
                  desc: "Metricas por periodo (funil B2B completo)",
                  cols: ["id (PK)", "campaign_id (FK)", "user_id (FK)", "period_start", "period_end", "impressions", "clicks", "conversions", "cost", "revenue", "sessions", "leads_month", "mql_rate", "sql_rate", "clients_web", "google_ads_cost", "cac_month", "ltv", "cac_ltv_ratio", "roi_accumulated", "roi_period_months", "source"],
                  color: "text-amber-400",
                  border: "border-amber-500/20",
                },
                {
                  name: "budget_allocations",
                  desc: "Alocacao de budget por canal/mes",
                  cols: ["id (PK)", "user_id (FK)", "project_id (FK)", "channel", "month", "year", "planned_budget", "actual_spent"],
                  color: "text-green-400",
                  border: "border-green-500/20",
                },
              ].map((table) => (
                <div key={table.name} className={`bg-slate-800/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-slate-500 mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : "bg-slate-600"}`} />
                        <code className="text-[9px] text-slate-400 font-mono">{col}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pt-2 border-t border-slate-800/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[9px] text-slate-500">Primary Key</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[9px] text-slate-500">Foreign Key</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[9px] text-slate-500">Unique Key</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="text-[9px] text-slate-500">Column</span>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Relationships */}
      <FlowBox title="Relacionamentos Principais">
        <div className="space-y-2">
          {[
            { from: "tenant_settings", rel: "1:N", to: "projects", desc: "Um usuario tem muitos projetos" },
            { from: "projects", rel: "1:N", to: "insights", desc: "Um projeto gera muitos insights" },
            { from: "projects", rel: "1:N", to: "project_channel_scores", desc: "Um projeto tem scores por canal" },
            { from: "projects", rel: "1:N", to: "benchmarks", desc: "Um projeto tem muitos benchmarks" },
            { from: "tenant_settings", rel: "1:N", to: "audiences", desc: "Um usuario tem muitos publicos (com ICP enriquecido)" },
            { from: "tenant_settings", rel: "1:N", to: "user_api_keys", desc: "Um usuario tem API keys de IA" },
            { from: "feature_flags", rel: "1:N", to: "plan_features", desc: "Uma feature tem config por plano" },
            { from: "feature_flags", rel: "1:N", to: "user_feature_overrides", desc: "Uma feature pode ter overrides" },
            { from: "admin_users", rel: "1:N", to: "admin_audit_log", desc: "Um admin gera muitos logs" },
            { from: "projects", rel: "1:N", to: "campaigns", desc: "Um projeto tem muitas campanhas" },
            { from: "campaigns", rel: "1:N", to: "campaign_metrics", desc: "Uma campanha tem muitas metricas" },
            { from: "projects", rel: "1:N", to: "budget_allocations", desc: "Um projeto tem alocacoes de budget" },
          ].map((rel) => (
            <div key={`${rel.from}-${rel.to}`} className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-emerald-400 font-mono">{rel.from}</code>
              <Badge className="text-[9px] bg-slate-800 text-slate-400 border-slate-700 font-mono">{rel.rel}</Badge>
              <ArrowRight className="h-3 w-3 text-slate-600" />
              <code className="text-[10px] text-emerald-400 font-mono">{rel.to}</code>
              <span className="text-[9px] text-slate-600 ml-auto hidden sm:inline">{rel.desc}</span>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* RPC Functions */}
      <FlowBox title="RPC Functions" badge="SECURITY DEFINER">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "admin_change_user_plan", desc: "Altera plano do usuario (bypassa trigger)", params: "admin_cnpj, user_id, new_plan" },
            { name: "check_admin_login_attempts", desc: "Verifica se admin pode tentar login", params: "cnpj" },
            { name: "increment_admin_login_attempts", desc: "Incrementa tentativas (bloqueia apos 5)", params: "cnpj" },
            { name: "reset_admin_login_attempts", desc: "Reseta tentativas apos login ok", params: "cnpj" },
            { name: "handle_new_user", desc: "Trigger: cria tenant_settings no signup", params: "— (trigger)" },
            { name: "prevent_plan_escalation", desc: "Trigger: impede upgrade nao autorizado", params: "— (trigger)" },
          ].map((fn) => (
            <div key={fn.name} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
              <code className="text-[10px] text-emerald-400 font-mono font-semibold">{fn.name}()</code>
              <p className="text-[9px] text-slate-500 mt-1">{fn.desc}</p>
              <p className="text-[9px] text-slate-600 mt-0.5">Params: {fn.params}</p>
            </div>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: SECURITY
// =====================================================

function SecuritySection() {
  return (
    <div className="space-y-6">
      {/* RLS */}
      <FlowBox title="Row Level Security (RLS)" borderColor="border-red-500/20" bgColor="bg-red-500/5" badge="Isolamento por user_id" defaultOpen>
        <div className="flex flex-col items-center gap-0 mb-4">
          <FlowNode icon={Users} label="Usuario autenticado" sublabel="JWT com user_id" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="SELECT/INSERT/UPDATE" />
          <FlowNode icon={ShieldCheck} label="RLS Policy" sublabel="WHERE user_id = auth.uid()" color="text-red-300" bg="bg-red-500/10" border="border-red-500/20" />
          <ArrowConnector direction="down" label="Filtra automaticamente" />
          <FlowNode icon={Database} label="Apenas dados do usuario" sublabel="Isolamento completo entre tenants" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        </div>

        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
          <p className="text-[10px] font-semibold text-slate-300 mb-2">Tabelas com RLS ativo:</p>
          <div className="flex flex-wrap gap-1.5">
            {["tenant_settings", "projects", "insights", "project_channel_scores", "benchmarks", "audiences", "notifications", "user_api_keys", "campaigns", "campaign_metrics", "budget_allocations", "ad_integrations", "integration_sync_logs"].map((t) => (
              <code key={t} className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2 py-0.5 font-mono">{t}</code>
            ))}
          </div>
        </div>
      </FlowBox>

      {/* Security Audit */}
      <FlowBox title="Auditoria de Seguranca" borderColor="border-amber-500/20" bgColor="bg-amber-500/5" badge="Aplicada">
        <div className="space-y-3">
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-green-400">Auditoria completa realizada e correcoes aplicadas</p>
                <p className="text-[10px] text-slate-500">30+ policies vulneraveis removidas. Edge Functions protegidas com auth checks. URL do Supabase ocultada via proxy.</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-2">Vulnerabilidades Criticas Corrigidas</p>
            <div className="space-y-2">
              {[
                { vuln: "Status Page aberta", desc: "INSERT/UPDATE/DELETE para anon em platform_services, incidents, maintenances, uptime", fix: "Removidas policies de escrita. Apenas service_role pode modificar." },
                { vuln: "admin_users exposta", desc: "SELECT para anon — password_hash (SHA-256) publicamente legivel", fix: "SELECT bloqueado. Login admin via Edge Function com service_role." },
                { vuln: "user_feature_overrides aberta", desc: "CRUD completo para anon — qualquer pessoa podia habilitar features premium", fix: "Removidas policies anon/authenticated. Apenas service_role." },
              ].map((v) => (
                <div key={v.vuln} className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
                  <p className="text-[11px] font-medium text-red-400">{v.vuln}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">{v.desc}</p>
                  <p className="text-[9px] text-green-400 mt-1">Correcao: {v.fix}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mb-2">Vulnerabilidades Medias Corrigidas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { vuln: "feature_flags UPDATE aberto", fix: "Apenas service_role pode modificar" },
                { vuln: "plan_features UPDATE aberto", fix: "Apenas service_role pode modificar" },
                { vuln: "tenant_settings SELECT ALL", fix: "Restrito a auth.uid() = user_id" },
                { vuln: "status_subscribers emails expostos", fix: "SELECT restrito por email do JWT" },
                { vuln: "admin_audit_log INSERT aberto", fix: "Apenas service_role pode inserir" },
                { vuln: "status-webhook sem secret obrigatorio", fix: "WEBHOOK_SECRET agora obrigatorio" },
              ].map((v) => (
                <div key={v.vuln} className="bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-amber-400 font-medium">{v.vuln}</p>
                  <p className="text-[9px] text-green-400">{v.fix}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Security Layers */}
      <FlowBox title="Camadas de Seguranca">
        <div className="space-y-3">
          {[
            {
              layer: "1. Autenticacao",
              items: [
                "Supabase Auth (JWT) para usuarios",
                "SHA-256 + localStorage para admin",
                "Rate limiting: 5 tentativas → bloqueio 15min",
                "Sessao admin expira em 4 horas",
                "Edge Functions: JWT ou INTERNAL_CRON_SECRET",
              ],
              color: "text-green-400",
              border: "border-green-500/20",
            },
            {
              layer: "2. Autorizacao",
              items: [
                "RLS por user_id em todas as tabelas de dados",
                "Feature Flags com 3 niveis de verificacao",
                "Plan-based access control",
                "Overrides apenas via service_role (admin)",
                "Status Page: somente leitura para publico",
              ],
              color: "text-blue-400",
              border: "border-blue-500/20",
            },
            {
              layer: "3. Protecao de Rotas",
              items: [
                "ProtectedRoute: redireciona para /auth se nao logado",
                "AdminProtectedRoute: redireciona para /admin/login",
                "FeatureGate: bloqueia acesso a features desabilitadas",
                "Rota /admin/login nao referenciada publicamente",
              ],
              color: "text-amber-400",
              border: "border-amber-500/20",
            },
            {
              layer: "4. Dados",
              items: [
                "API keys encriptadas por usuario",
                "SECURITY DEFINER em RPCs criticas",
                "Trigger prevent_plan_escalation",
                "Audit log apenas via service_role",
                "Soft delete com deleted_at em tabelas core",
              ],
              color: "text-red-400",
              border: "border-red-500/20",
            },
            {
              layer: "5. Infraestrutura",
              items: [
                "HTTPS em todas as comunicacoes",
                "Supabase managed — backups automaticos",
                "Edge Functions isoladas por request + auth",
                "Storage com policies por bucket",
                "Vercel proxy: URL do Supabase ocultada",
                "WEBHOOK_SECRET obrigatorio para webhooks",
              ],
              color: "text-purple-400",
              border: "border-purple-500/20",
            },
          ].map((layer) => (
            <div key={layer.layer} className={`bg-slate-800/20 border ${layer.border} rounded-xl p-4`}>
              <p className={`text-xs font-semibold ${layer.color} mb-2`}>{layer.layer}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {layer.items.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className={`h-3 w-3 ${layer.color} flex-shrink-0 mt-0.5`} />
                    <span className="text-[10px] text-slate-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Planos */}
      <FlowBox title="Controle de Planos" badge="3 planos">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              plan: "Starter",
              icon: Zap,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
              price: "Gratis",
              limits: ["5 analises/mes", "5 publicos-alvo", "5 benchmarks/mes", "Heuristica apenas", "Sem exportacao"],
            },
            {
              plan: "Professional",
              icon: Star,
              color: "text-primary",
              bg: "bg-primary/10",
              border: "border-primary/20",
              price: "R$97/mes",
              limits: ["Analises ilimitadas", "Publicos ilimitados", "Benchmarks ilimitados", "IA + Benchmark + Tatico", "Exportacao completa"],
            },
            {
              plan: "Enterprise",
              icon: Crown,
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
              price: "Sob consulta",
              limits: ["Tudo do Professional", "API access", "Multi-user", "SLA dedicado"],
            },
          ].map((p) => (
            <div key={p.plan} className={`${p.bg} border ${p.border} rounded-xl p-4 text-center`}>
              <p.icon className={`h-6 w-6 ${p.color} mx-auto mb-2`} />
              <p className={`text-sm font-bold ${p.color}`}>{p.plan}</p>
              <p className="text-[10px] text-slate-500 mb-3">{p.price}</p>
              <div className="space-y-1.5 text-left">
                {p.limits.map((l) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3 w-3 ${p.color} flex-shrink-0`} />
                    <span className="text-[10px] text-slate-400">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: OPERATIONS
// =====================================================

function OperationsSection() {
  return (
    <div className="space-y-6">
      {/* Campaign Management Flow */}
      <FlowBox title="Fluxo de Gestao de Campanhas" borderColor="border-orange-500/20" bgColor="bg-orange-500/5" badge="v3.1" defaultOpen>
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={FolderOpen} label="1. Projeto existente" sublabel="Projeto com URL analisada" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="Cria campanha" />
          <FlowNode icon={Megaphone} label="2. Nova Campanha" sublabel="Nome + Canal + Objetivo + Budget" color="text-orange-300" bg="bg-orange-500/10" border="border-orange-500/20" />
          <ArrowConnector direction="down" label="Seleciona canal" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {[
              { label: "Google Ads", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Meta Ads", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
              { label: "LinkedIn Ads", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
              { label: "TikTok Ads", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
            ].map((ch) => (
              <div key={ch.label} className={`${ch.bg} border ${ch.border} rounded-lg px-2.5 py-2 text-center`}>
                <p className={`text-[10px] font-medium ${ch.color}`}>{ch.label}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Gerencia status" />

          <div className="grid grid-cols-5 gap-1.5 w-full">
            {[
              { label: "Rascunho", color: "text-slate-400", bg: "bg-slate-800/60", border: "border-slate-700/50" },
              { label: "Ativa", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              { label: "Pausada", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              { label: "Concluida", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Arquivada", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-lg px-2 py-1.5 text-center`}>
                <p className={`text-[9px] font-medium ${s.color}`}>{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 mt-2">
            {["Draft", "Active", "Paused", "Completed", "Archived"].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <code className="text-[8px] text-slate-500 font-mono">{s}</code>
                {i < 4 && <ArrowRight className="h-2.5 w-2.5 text-slate-600" />}
              </div>
            ))}
          </div>
        </div>
      </FlowBox>

      {/* Metrics CRUD Flow */}
      <FlowBox title="Fluxo de Metricas — CRUD Completo" borderColor="border-amber-500/20" bgColor="bg-amber-500/5" badge="v3.2">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Megaphone} label="1. Campanha ativa" sublabel="Clica no icone BarChart3" color="text-orange-300" bg="bg-orange-500/10" border="border-orange-500/20" />
          <ArrowConnector direction="down" label="Expande secao de metricas" />
          <FlowNode icon={BarChart3} label="2. CampaignPerformanceCards" sublabel="KPIs agregados (se houver dados)" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="Carrega registros individuais" />
          <FlowNode icon={Eye} label="3. CampaignMetricsList" sublabel="Lista registros por periodo — expandir, editar, excluir" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
          <ArrowConnector direction="down" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-green-400 font-medium">+ Registrar</p>
              <p className="text-[9px] text-slate-500">INSERT novo periodo</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-blue-400 font-medium">Editar</p>
              <p className="text-[9px] text-slate-500">UPDATE registro existente</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Excluir</p>
              <p className="text-[9px] text-slate-500">DELETE com confirmacao</p>
            </div>
          </div>

          <ArrowConnector direction="down" label="CampaignMetricsForm" />
          <FlowNode icon={FileText} label="4. Formulario de Metricas" sublabel="Periodo + Metricas gerais + Canal-especificas (modo criar ou editar)" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="Salva" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <FlowNode icon={Database} label="campaign_metrics" sublabel="INSERT ou UPDATE conforme modo" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" />
            <FlowNode icon={Eye} label="v_campaign_metrics_summary" sublabel="View recalcula KPIs automaticamente" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" size="small" />
          </div>
        </div>
      </FlowBox>

      {/* Google B2B Funnel */}
      <FlowBox title="Funil Google Ads — Metricas B2B" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" badge="19 metricas">
        <div className="space-y-4">
          {/* Common metrics */}
          <div>
            <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mb-2">Metricas Gerais (todos os canais)</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {["Impressoes", "Cliques", "CTR %", "CPC R$", "CPM R$", "Conversoes", "CPA R$", "Custo Total", "Receita", "ROAS x"].map((m) => (
                <div key={m} className="bg-slate-800/40 border border-slate-700/30 rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[9px] text-slate-400">{m}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Google funnel */}
          <div>
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider mb-2">Funil Google Ads (B2B)</p>
            <div className="flex flex-col items-center gap-0">
              <div className="grid grid-cols-2 gap-2 w-full">
                <FlowNode icon={Activity} label="Sessoes" sublabel="Trafego do site" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" />
                <FlowNode icon={Eye} label="Primeira Visita" sublabel="Novos visitantes" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" size="small" />
              </div>
              <ArrowConnector direction="down" label="Taxa MQL %" />
              <div className="grid grid-cols-2 gap-2 w-full">
                <FlowNode icon={Users} label="Leads do Mes" sublabel="Formularios + contatos" color="text-sky-300" bg="bg-sky-500/10" border="border-sky-500/20" size="small" />
                <FlowNode icon={Target} label="Taxa MQL → SQL" sublabel="Lead qualificado → cliente" color="text-violet-300" bg="bg-violet-500/10" border="border-violet-500/20" size="small" />
              </div>
              <ArrowConnector direction="down" label="Taxa SQL %" />
              <div className="grid grid-cols-2 gap-2 w-full">
                <FlowNode icon={UserCheck} label="Clientes Web" sublabel="Conversoes finais" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
                <FlowNode icon={Receipt} label="Receita Web + Ticket Medio" sublabel="Valor gerado" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" size="small" />
              </div>
              <ArrowConnector direction="down" label="Analise de custo" />
              <div className="grid grid-cols-3 gap-2 w-full">
                <FlowNode icon={DollarSign} label="Custo Google Ads" sublabel="Investimento total" color="text-red-300" bg="bg-red-500/10" border="border-red-500/20" size="small" />
                <FlowNode icon={Calculator} label="CAC/Mes" sublabel="Custo por aquisicao" color="text-orange-300" bg="bg-orange-500/10" border="border-orange-500/20" size="small" />
                <FlowNode icon={Target} label="Custo/Conversao" sublabel="Custo unitario" color="text-pink-300" bg="bg-pink-500/10" border="border-pink-500/20" size="small" />
              </div>
              <ArrowConnector direction="down" label="Retorno" />
              <div className="grid grid-cols-3 gap-2 w-full">
                <FlowNode icon={Calculator} label="LTV" sublabel="Lifetime Value" color="text-teal-300" bg="bg-teal-500/10" border="border-teal-500/20" size="small" />
                <FlowNode icon={BarChart3} label="CAC:LTV" sublabel="Benchmark 1:3" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" />
                <FlowNode icon={TrendingUp} label="ROI Acumulado" sublabel="% + periodo (meses)" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" size="small" />
              </div>
            </div>
          </div>

          {/* Channel-specific metrics */}
          <div>
            <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mb-2">Metricas Especificas por Canal</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-blue-400 mb-1.5">Google</p>
                <div className="space-y-1">
                  {["Quality Score", "Posicao Media", "Impression Share", "+ 16 metricas funil"].map((m) => (
                    <p key={m} className="text-[9px] text-slate-500">{m}</p>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-indigo-400 mb-1.5">Meta</p>
                <div className="space-y-1">
                  {["Alcance", "Frequencia"].map((m) => (
                    <p key={m} className="text-[9px] text-slate-500">{m}</p>
                  ))}
                </div>
              </div>
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-sky-400 mb-1.5">LinkedIn</p>
                <div className="space-y-1">
                  {["Leads", "CPL", "Engagement Rate"].map((m) => (
                    <p key={m} className="text-[9px] text-slate-500">{m}</p>
                  ))}
                </div>
              </div>
              <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-pink-400 mb-1.5">TikTok</p>
                <div className="space-y-1">
                  {["Video Views", "VTR"].map((m) => (
                    <p key={m} className="text-[9px] text-slate-500">{m}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Views */}
      <FlowBox title="Views Operacionais" badge="SQL Views">
        <div className="space-y-3">
          {[
            {
              name: "v_campaign_summary",
              desc: "Join campanhas + projetos + metricas agregadas + budget pacing",
              cols: "campaign_name, project_name, channel, status, budget_pacing, total_impressions, total_clicks, total_conversions, total_cost",
              color: "text-orange-400",
              bg: "bg-orange-500/10",
              border: "border-orange-500/20",
            },
            {
              name: "v_operational_stats",
              desc: "Contadores por status + budget total/gasto por usuario",
              cols: "total_campaigns, active, paused, completed, draft, total_budget, total_spent",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
            {
              name: "v_campaign_metrics_summary",
              desc: "Agregacao de KPIs por campanha — totais, medias, ROAS, CAC, LTV, ROI",
              cols: "total_impressions, total_clicks, total_sessions, total_leads_month, total_clients_web, avg_mql_rate, avg_sql_rate, calc_cac, avg_ltv, avg_cac_ltv_ratio, avg_roi_accumulated",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              name: "v_budget_summary",
              desc: "Resumo de budget por projeto/canal/mes com pacing e remaining",
              cols: "project_name, channel, month, year, planned_budget, actual_spent, pacing_percent, remaining",
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              name: "v_budget_project_pacing",
              desc: "Pacing consolidado por projeto com projecao de gasto baseada no ritmo diario",
              cols: "project_name, channels_allocated, total_planned, total_spent, total_remaining, overall_pacing, projected_spend, projected_pacing",
              color: "text-teal-400",
              bg: "bg-teal-500/10",
              border: "border-teal-500/20",
            },
            {
              name: "v_campaign_calendar",
              desc: "Dados por campanha com duracao, dias restantes, budget pacing, ending_soon e metricas agregadas",
              cols: "campaign_name, channel, status, start_date, end_date, duration_days, days_remaining, budget_pacing, ending_soon, total_clicks, total_conversions",
              color: "text-violet-400",
              bg: "bg-violet-500/10",
              border: "border-violet-500/20",
            },
            {
              name: "v_campaign_timeline",
              desc: "Agrupamento por projeto com datas efetivas e contagem de sobreposicoes por canal",
              cols: "campaign_name, channel, status, effective_start, effective_end, overlap_count",
              color: "text-pink-400",
              bg: "bg-pink-500/10",
              border: "border-pink-500/20",
            },
          ].map((view) => (
            <div key={view.name} className={`${view.bg} border ${view.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Eye className={`h-4 w-4 ${view.color}`} />
                <code className={`text-xs font-mono font-semibold ${view.color}`}>{view.name}</code>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{view.desc}</p>
              <div className="flex flex-wrap gap-1">
                {view.cols.split(", ").map((col) => (
                  <code key={col} className="text-[8px] bg-slate-800/40 text-slate-500 rounded px-1.5 py-0.5 font-mono">{col}</code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Performance AI Analysis Flow */}
      <FlowBox title="Fluxo de Analise de Performance por IA" borderColor="border-purple-500/20" bgColor="bg-purple-500/5" badge="v3.3">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Megaphone} label="1. Campanha com metricas" sublabel="campaign_metrics registradas" color="text-orange-300" bg="bg-orange-500/10" border="border-orange-500/20" />
          <ArrowConnector direction="down" label="Seleciona modelo IA" />
          <FlowNode icon={Sparkles} label="2. Analise por IA" sublabel="Gemini ou Claude via API key do usuario" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="Retorna analise completa" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {[
              { label: "Saude Geral", sub: "Score 0-100 + tendencia" },
              { label: "KPIs vs Benchmark", sub: "Comparacao com mercado" },
              { label: "Analise de Funil", sub: "Gargalos identificados" },
              { label: "Eficiencia Budget", sub: "Pacing + otimizacao" },
              { label: "Forcas/Fraquezas", sub: "Pontos fortes e fracos" },
              { label: "Riscos", sub: "Impacto + mitigacao" },
              { label: "Plano de Acao", sub: "Priorizado por impacto" },
              { label: "Projecoes", sub: "30 e 90 dias" },
            ].map((item) => (
              <div key={item.label} className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-purple-400 font-medium">{item.label}</p>
                <p className="text-[9px] text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Salva resultado" />
          <FlowNode icon={Eye} label="3. CampaignPerformanceAiDialog" sublabel="Dialog com scroll, header sticky, fullscreen, secoes colapsaveis" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
        </div>
      </FlowBox>

      {/* Tactical vs Real Comparison */}
      <FlowBox title="Comparativo Tatico vs Real — Gap Analysis" borderColor="border-teal-500/20" bgColor="bg-teal-500/5" badge="v3.4">
        <div className="flex flex-col items-center gap-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <FlowNode icon={Target} label="1. Plano Tatico" sublabel="tactical_channel_plans (tipo, funil, lances, metricas-alvo)" color="text-teal-300" bg="bg-teal-500/10" border="border-teal-500/20" />
            <FlowNode icon={BarChart3} label="2. Metricas Reais" sublabel="v_campaign_metrics_summary (CTR, CPC, CPA, ROAS...)" color="text-orange-300" bg="bg-orange-500/10" border="border-orange-500/20" />
          </div>
          <ArrowConnector direction="down" label="Cruzamento por canal" />
          <FlowNode icon={Calculator} label="3. Gap Analysis por Canal" sublabel="Aderencia estrutural (30%) + Gap de metricas (70%)" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="Calcula scores" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
            {[
              { label: "Tipo Campanha", sub: "Match tatico vs real" },
              { label: "Estagio Funil", sub: "Alinhamento estrategico" },
              { label: "Estrategia Lances", sub: "Bidding match" },
              { label: "Gap Metricas", sub: "Planejado vs Real (%)" },
              { label: "Score Aderencia", sub: "0-100 por canal" },
              { label: "Status", sub: "on_track / below / critical" },
            ].map((item) => (
              <div key={item.label} className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-teal-400 font-medium">{item.label}</p>
                <p className="text-[9px] text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" />
          <FlowNode icon={Eye} label="4. TacticalVsRealComparison" sublabel="AdherenceRing + StructureMatch + MetricGapRow + ChannelGapCard" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
        </div>
      </FlowBox>

      {/* Budget Management */}
      <FlowBox title="Gestao de Budget por Canal" borderColor="border-green-500/20" bgColor="bg-green-500/5" badge="v3.6">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={DollarSign} label="1. Alocacao de Budget" sublabel="budget_allocations: canal, mes, ano, valor planejado" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" />
          <ArrowConnector direction="down" label="Registra por canal/mes" />
          <FlowNode icon={TrendingUp} label="2. Pacing & Projecoes" sublabel="getBudgetPacingStatus() + computeBudgetProjection()" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
          <ArrowConnector direction="down" label="Calcula status" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-3">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-green-400 font-medium">Saudavel</p>
              <p className="text-[9px] text-slate-500">&lt;80% gasto</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-amber-400 font-medium">Atencao</p>
              <p className="text-[9px] text-slate-500">80-95% gasto</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Perigo</p>
              <p className="text-[9px] text-slate-500">95-100% gasto</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Estourado</p>
              <p className="text-[9px] text-slate-500">&gt;100% gasto</p>
            </div>
          </div>

          <FlowNode icon={Receipt} label="3. Sincronizacao" sublabel="sync_all_budgets() — GREATEST(cost, google_ads_cost) → budget_allocations + campaigns" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
          <ArrowConnector direction="down" />
          <FlowNode icon={Eye} label="4. BudgetManagement.tsx" sublabel="Formulario upsert, pacing bars por canal, projecao, historico colapsavel" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
        </div>
      </FlowBox>

      {/* Campaign Calendar & Timeline */}
      <FlowBox title="Calendario de Campanhas & Timeline" borderColor="border-violet-500/20" bgColor="bg-violet-500/5" badge="v3.7">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Database} label="1. Campanhas com datas" sublabel="start_date + end_date definidos" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <ArrowConnector direction="down" label="v_campaign_calendar" />
          <FlowNode icon={CalendarDays} label="2. Dados enriquecidos" sublabel="duracao, dias restantes, ending_soon, metricas" color="text-violet-300" bg="bg-violet-500/10" border="border-violet-500/20" />
          <ArrowConnector direction="down" label="Toggle de vista" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-3">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-violet-400" />
                <p className="text-[11px] font-semibold text-violet-400">Vista Calendario</p>
              </div>
              <div className="space-y-1">
                {["Grid mensal estilo Google Calendar", "Barras coloridas por canal", "Click para detalhes da campanha", "Indicador de hoje + ending soon", "Legenda com contadores"].map((f) => (
                  <p key={f} className="text-[9px] text-slate-500">{f}</p>
                ))}
              </div>
            </div>
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <GanttChart className="h-4 w-4 text-pink-400" />
                <p className="text-[11px] font-semibold text-pink-400">Vista Timeline (Gantt)</p>
              </div>
              <div className="space-y-1">
                {["Eixo X = 8 semanas visiveis", "Barras por canal com opacidade por status", "Linha vertical hoje", "Tooltips ricos com metricas", "Headers de mes e semana"].map((f) => (
                  <p key={f} className="text-[9px] text-slate-500">{f}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-3">
            {[
              { label: "Google", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Meta", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
              { label: "LinkedIn", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
              { label: "TikTok", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
            ].map((ch) => (
              <div key={ch.label} className={`${ch.bg} border ${ch.border} rounded-lg px-2.5 py-2 text-center`}>
                <p className={`text-[10px] font-medium ${ch.color}`}>{ch.label}</p>
                <p className="text-[9px] text-slate-500">Cor dedicada</p>
              </div>
            ))}
          </div>

          <FlowNode icon={Eye} label="3. CampaignCalendarManager.tsx" sublabel="Toggle Calendar/Timeline + filtros canal/status + Collapsible" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
        </div>
      </FlowBox>

      {/* Performance Alerts */}
      <FlowBox title="Alertas Automaticos de Performance" borderColor="border-red-500/20" bgColor="bg-red-500/5" badge="v3.5">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Megaphone} label="1. Campanhas ativas/pausadas" sublabel="Exclui arquivadas e concluidas" color="text-orange-300" bg="bg-orange-500/10" border="border-orange-500/20" />
          <ArrowConnector direction="down" label="Avalia 11 regras" />
          <FlowNode icon={AlertTriangle} label="2. Performance Alerts Engine" sublabel="evaluatePerformanceAlerts() — regras com thresholds por canal" color="text-red-300" bg="bg-red-500/10" border="border-red-500/20" />
          <ArrowConnector direction="down" label="Gera alertas" />

          <div className="grid grid-cols-3 gap-2 w-full mb-3">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Critico</p>
              <p className="text-[9px] text-slate-500">Budget 100%, ROAS &lt;1x, ROI neg.</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-amber-400 font-medium">Atencao</p>
              <p className="text-[9px] text-slate-500">CTR baixo, CPC/CPA alto</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-blue-400 font-medium">Info</p>
              <p className="text-[9px] text-slate-500">Pacing lento, sem metricas</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
            {[
              { label: "Budget", sub: "Estourado, quase esgotado" },
              { label: "Eficiencia", sub: "CTR baixo, CPC alto" },
              { label: "Conversao", sub: "Sem conv., CPA alto, ROAS" },
              { label: "Qualidade", sub: "CAC:LTV, ROI negativo" },
              { label: "Pacing", sub: "Budget subutilizado" },
              { label: "Tendencia", sub: "Sem metricas, alto gasto" },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/40 border border-slate-700/30 rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-slate-300 font-medium">{item.label}</p>
                <p className="text-[9px] text-slate-500">{item.sub}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" />
          <FlowNode icon={Bell} label="3. PerformanceAlerts.tsx" sublabel="Cards com filtros por severidade e categoria, collapse/expand" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
        </div>
      </FlowBox>

      {/* Dashboard Campaigns Card */}
      <FlowBox title="Dashboard — Card de Campanhas Recentes" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" badge="v3.3">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Database} label="1. Fetch campanhas recentes" sublabel="campaigns ORDER BY created_at DESC LIMIT 6" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <ArrowConnector direction="down" label="Renderiza no sidebar" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
            {[
              { label: "Nome + Projeto", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Badge Canal", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              { label: "Badge Status", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "Pacing Budget", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
              { label: "Expand/Collapse", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { label: "Link /operations", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} border ${item.border} rounded-lg px-2.5 py-2 text-center`}>
                <p className={`text-[10px] font-medium ${item.color}`}>{item.label}</p>
              </div>
            ))}
          </div>
          <ArrowConnector direction="down" />
          <FlowNode icon={FolderOpen} label="2. Projetos Recentes" sublabel="Limita a 2 por padrao + expand/collapse" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
        </div>
      </FlowBox>

      {/* Architecture Summary */}
      <FlowBox title="Arquitetura Operacional — Resumo">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { n: "3", label: "Tabelas SQL", icon: Database, color: "text-emerald-400" },
            { n: "7", label: "Views SQL", icon: Eye, color: "text-blue-400" },
            { n: "35+", label: "Campos Metricas", icon: BarChart3, color: "text-orange-400" },
            { n: "4", label: "Canais", icon: Megaphone, color: "text-pink-400" },
            { n: "11", label: "Regras de Alerta", icon: AlertTriangle, color: "text-red-400" },
            { n: "19", label: "Metricas Google", icon: Target, color: "text-blue-400" },
            { n: "11", label: "Componentes Op.", icon: Layers, color: "text-purple-400" },
            { n: "2", label: "Vistas Calendario", icon: CalendarDays, color: "text-violet-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color} flex-shrink-0`} />
              <div>
                <p className="text-lg font-bold text-white">{stat.n}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// SECTION: INTEGRATIONS
// =====================================================

function IntegrationsSection() {
  return (
    <div className="space-y-6">
      {/* OAuth Flow */}
      <FlowBox title="Fluxo OAuth 2.0 — Conexao com Providers" borderColor="border-cyan-500/20" bgColor="bg-cyan-500/5" badge="v3.8" defaultOpen>
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Plug} label="1. Usuario clica Conectar" sublabel="Integracoes.tsx → handleConnect(provider)" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" />
          <ArrowConnector direction="down" label="POST com Authorization header" />
          <FlowNode icon={Cloud} label="2. Edge Function: oauth-connect" sublabel="Valida sessao, gera state (base64: user_id+provider+ts), retorna URL" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="JSON { url }" />
          <FlowNode icon={Monitor} label="3. Frontend redireciona" sublabel="window.location.href = data.url" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="Usuario autoriza no provider" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
            {[
              { label: "Google Ads", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { label: "Meta Ads", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
              { label: "LinkedIn Ads", color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
              { label: "TikTok Ads", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
            ].map((ch) => (
              <div key={ch.label} className={`${ch.bg} border ${ch.border} rounded-lg px-2.5 py-2 text-center`}>
                <p className={`text-[10px] font-medium ${ch.color}`}>{ch.label}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Provider redireciona com code+state" />
          <FlowNode icon={Cloud} label="4. Edge Function: oauth-callback" sublabel="Decodifica state, valida 10min, troca code por tokens, busca account info" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" />
          <ArrowConnector direction="down" label="Upsert ad_integrations" />
          <FlowNode icon={Database} label="5. Salva tokens + account" sublabel="ad_integrations: access_token, refresh_token, account_id, account_name" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
          <ArrowConnector direction="down" label="Redireciona para frontend" />
          <FlowNode icon={Monitor} label="6. OAuthCallback.tsx" sublabel="Mostra status, espera sessao restaurar (10x500ms), redireciona /integracoes" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
        </div>

        {/* Key details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-400">JWT Verification Desabilitado</p>
                <p className="text-[10px] text-slate-500">oauth-connect e oauth-callback tem JWT verification desabilitado no Supabase Dashboard. Necessario porque o browser redireciona sem headers. Auth e feita internamente via token no body/header.</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-green-400">State Parameter</p>
                <p className="text-[10px] text-slate-500">Base64 JSON com user_id + provider + timestamp. Validado com expiracao de 10 minutos para prevenir CSRF. Decodificado no oauth-callback.</p>
              </div>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Sync Flow */}
      <FlowBox title="Fluxo de Sincronizacao de Dados" borderColor="border-green-500/20" bgColor="bg-green-500/5" badge="integration-sync">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={RefreshCw} label="1. Usuario clica Sincronizar" sublabel="handleSync(provider) → POST integration-sync" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" />
          <ArrowConnector direction="down" label="Authorization + apikey headers" />
          <FlowNode icon={Key} label="2. Verifica token expirado" sublabel="token_expires_at < now() → auto-refresh via refresh_token" color="text-amber-300" bg="bg-amber-500/10" border="border-amber-500/20" />
          <ArrowConnector direction="down" label="Token valido" />
          <FlowNode icon={Globe} label="3. Busca campanhas via API" sublabel="Google Ads API v16 / Meta Graph v19.0 / LinkedIn v202401 / TikTok v1.3" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="Para cada campanha" />
          <FlowNode icon={BarChart3} label="4. Busca metricas (30 dias)" sublabel="impressions, clicks, conversions, cost, revenue" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="Match por nome de campanha" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <FlowNode icon={Database} label="campaign_metrics" sublabel="INSERT com source: 'api'" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" size="small" />
            <FlowNode icon={FileText} label="integration_sync_logs" sublabel="status, duration, records fetched/created/failed" color="text-cyan-300" bg="bg-cyan-500/10" border="border-cyan-500/20" size="small" />
          </div>

          <ArrowConnector direction="down" label="Atualiza last_sync_at" />
          <FlowNode icon={CheckCircle2} label="5. Resultado" sublabel="Toast com contadores + reload integrations" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" />
        </div>

        {/* Token refresh detail */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 mt-4">
          <p className="text-[10px] font-semibold text-slate-300 mb-2">Validade de Tokens por Provider:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { provider: "Google", access: "1 hora", refresh: "Permanente", color: "text-blue-400" },
              { provider: "Meta", access: "60 dias", refresh: "N/A (long-lived)", color: "text-indigo-400" },
              { provider: "LinkedIn", access: "60 dias", refresh: "365 dias", color: "text-sky-400" },
              { provider: "TikTok", access: "24 horas", refresh: "365 dias", color: "text-pink-400" },
            ].map((t) => (
              <div key={t.provider} className="bg-slate-800/40 rounded-lg px-2.5 py-2">
                <p className={`text-[10px] font-medium ${t.color}`}>{t.provider}</p>
                <p className="text-[9px] text-slate-500">Access: {t.access}</p>
                <p className="text-[9px] text-slate-500">Refresh: {t.refresh}</p>
              </div>
            ))}
          </div>
        </div>
      </FlowBox>

      {/* Edge Functions */}
      <FlowBox title="Edge Functions — Integracoes" borderColor="border-purple-500/20" bgColor="bg-purple-500/5" badge="3 funcoes">
        <div className="space-y-3">
          {[
            {
              name: "oauth-connect",
              desc: "Inicia fluxo OAuth — gera state, constroi authorization URL, retorna JSON",
              trigger: "POST do frontend (handleConnect)",
              input: "provider (body) + JWT (Authorization header)",
              output: "JSON { url: 'https://accounts.google.com/...' }",
              auth: "JWT no header (verificacao interna)",
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
            },
            {
              name: "oauth-callback",
              desc: "Recebe redirect do provider, troca code por tokens, busca account info, upsert DB",
              trigger: "GET redirect do provider (browser)",
              input: "code + state (query params)",
              output: "Redirect para /oauth/callback?status=connected",
              auth: "State parameter (user_id + ts)",
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              name: "integration-sync",
              desc: "Sincroniza campanhas e metricas via API do provider, auto-refresh de tokens",
              trigger: "POST do frontend (handleSync)",
              input: "provider + integration_id + JWT",
              output: "JSON { records_fetched, records_created, records_failed }",
              auth: "JWT Bearer token",
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
          ].map((fn) => (
            <div key={fn.name} className={`${fn.bg} border ${fn.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Cloud className={`h-4 w-4 ${fn.color}`} />
                <code className={`text-xs font-mono font-semibold ${fn.color}`}>{fn.name}</code>
                <Badge className="text-[8px] bg-slate-800 text-slate-400 border-slate-700 ml-auto">
                  {fn.name === "oauth-callback" ? "JWT OFF" : "JWT"}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">{fn.desc}</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Trigger</p>
                  <p className="text-[10px] text-slate-400">{fn.trigger}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Input</p>
                  <p className="text-[10px] text-slate-400">{fn.input}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Output</p>
                  <p className="text-[10px] text-slate-400">{fn.output}</p>
                </div>
                <div className="bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-slate-600 uppercase">Auth</p>
                  <p className="text-[10px] text-slate-400">{fn.auth}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Google Ads — Account Discovery */}
      <FlowBox title="Google Ads — Descoberta de Customer ID" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" badge="listAccessibleCustomers">
        <div className="flex flex-col items-center gap-0">
          <FlowNode icon={Key} label="1. Token obtido via OAuth" sublabel="access_token do Google" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
          <ArrowConnector direction="down" label="GET com developer-token" />
          <FlowNode icon={Globe} label="2. listAccessibleCustomers" sublabel="googleads.googleapis.com/v16/customers:listAccessibleCustomers" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" label="resourceNames: ['customers/1234567890']" />
          <FlowNode icon={Users} label="3. Extrai Customer ID" sublabel="Primeiro customer da lista → account_id" color="text-green-300" bg="bg-green-500/10" border="border-green-500/20" />
          <ArrowConnector direction="down" label="GET customer details" />
          <FlowNode icon={Database} label="4. Salva em ad_integrations" sublabel="account_id + descriptiveName" color="text-emerald-300" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        </div>

        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 mt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-amber-400">Developer Token</p>
              <p className="text-[10px] text-slate-500">Requer GOOGLE_ADS_DEVELOPER_TOKEN aprovado para contas de producao. Token de teste so funciona com contas de teste do Google Ads. Solicitar aprovacao no Google Ads API Center.</p>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Security */}
      <FlowBox title="Seguranca OAuth" borderColor="border-red-500/20" bgColor="bg-red-500/5" badge="Isolamento">
        <div className="space-y-3">
          {[
            {
              title: "Tokens isolados por user_id",
              desc: "Cada tenant tem seus proprios tokens via RLS. Nenhum usuario pode acessar tokens de outro.",
              icon: Lock,
              color: "text-green-400",
            },
            {
              title: "State parameter anti-CSRF",
              desc: "Base64 JSON com user_id + provider + timestamp. Expira em 10 minutos. Validado no oauth-callback.",
              icon: ShieldCheck,
              color: "text-blue-400",
            },
            {
              title: "Client credentials compartilhadas (SaaS)",
              desc: "1 app OAuth da Intentia por provider. Cada cliente autoriza sua propria conta de anuncios.",
              icon: Key,
              color: "text-purple-400",
            },
            {
              title: "Auto-refresh de tokens",
              desc: "integration-sync verifica expiracao antes de cada sync. Renova automaticamente via refresh_token.",
              icon: RefreshCw,
              color: "text-amber-400",
            },
            {
              title: "Fallback para expired",
              desc: "Se refresh falhar, marca integracao como 'expired'. Usuario precisa reconectar.",
              icon: AlertTriangle,
              color: "text-red-400",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
              <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-[11px] font-medium ${item.color}`}>{item.title}</p>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Database Tables */}
      <FlowBox title="Tabelas de Integracoes" borderColor="border-emerald-500/20" bgColor="bg-emerald-500/5" badge="2 tabelas + 1 view">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              name: "ad_integrations",
              desc: "Conexoes OAuth por provider/usuario",
              cols: ["id (PK)", "user_id (FK)", "provider (UK)", "status", "access_token", "refresh_token", "token_expires_at", "account_id", "account_name", "account_currency", "sync_enabled", "sync_frequency", "last_sync_at", "project_mappings (JSONB)", "scopes", "error_message", "error_count"],
              color: "text-cyan-400",
              border: "border-cyan-500/20",
            },
            {
              name: "integration_sync_logs",
              desc: "Historico de sincronizacoes",
              cols: ["id (PK)", "user_id (FK)", "integration_id (FK)", "provider", "status", "sync_type", "started_at", "completed_at", "duration_ms", "records_fetched", "records_created", "records_updated", "records_failed", "period_start", "period_end", "error_message"],
              color: "text-green-400",
              border: "border-green-500/20",
            },
          ].map((table) => (
            <div key={table.name} className={`bg-slate-800/30 border ${table.border} rounded-xl p-3`}>
              <div className="flex items-center gap-2 mb-1.5">
                <Database className={`h-3.5 w-3.5 ${table.color}`} />
                <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
              </div>
              <p className="text-[9px] text-slate-500 mb-2">{table.desc}</p>
              <div className="space-y-0.5">
                {table.cols.map((col) => (
                  <div key={col} className="flex items-center gap-1.5">
                    <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : col.includes("UK") ? "bg-green-400" : "bg-slate-600"}`} />
                    <code className="text-[9px] text-slate-400 font-mono">{col}</code>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* View */}
        <div className="mt-3">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Eye className={`h-4 w-4 text-cyan-400`} />
              <code className="text-xs font-mono font-semibold text-cyan-400">v_integration_summary</code>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Join ad_integrations + sync logs agregados (total_syncs, successful, failed, last_sync_status, avg_duration)</p>
            <div className="flex flex-wrap gap-1">
              {["provider", "status", "account_name", "last_sync_at", "total_syncs", "successful_syncs", "failed_syncs", "last_sync_status", "avg_duration_ms"].map((col) => (
                <code key={col} className="text-[8px] bg-slate-800/40 text-slate-500 rounded px-1.5 py-0.5 font-mono">{col}</code>
              ))}
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Environment Variables */}
      <FlowBox title="Variaveis de Ambiente (Supabase Secrets)" borderColor="border-amber-500/20" bgColor="bg-amber-500/5" badge="10 secrets">
        <div className="space-y-3">
          {[
            {
              provider: "Google Ads",
              vars: ["GOOGLE_ADS_CLIENT_ID", "GOOGLE_ADS_CLIENT_SECRET", "GOOGLE_ADS_DEVELOPER_TOKEN"],
              color: "text-blue-400",
              border: "border-blue-500/20",
              note: "Developer Token requer aprovacao para producao",
            },
            {
              provider: "Meta Ads",
              vars: ["META_ADS_CLIENT_ID", "META_ADS_CLIENT_SECRET"],
              color: "text-indigo-400",
              border: "border-indigo-500/20",
              note: "Graph API v19.0 — Facebook + Instagram",
            },
            {
              provider: "LinkedIn Ads",
              vars: ["LINKEDIN_ADS_CLIENT_ID", "LINKEDIN_ADS_CLIENT_SECRET"],
              color: "text-sky-400",
              border: "border-sky-500/20",
              note: "REST API v202401 — campanhas B2B",
            },
            {
              provider: "TikTok Ads",
              vars: ["TIKTOK_ADS_CLIENT_ID", "TIKTOK_ADS_CLIENT_SECRET"],
              color: "text-pink-400",
              border: "border-pink-500/20",
              note: "Business API v1.3 — token exchange via JSON",
            },
          ].map((p) => (
            <div key={p.provider} className={`bg-slate-800/30 border ${p.border} rounded-xl p-3`}>
              <p className={`text-[11px] font-semibold ${p.color} mb-1.5`}>{p.provider}</p>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {p.vars.map((v) => (
                  <code key={v} className="text-[9px] bg-slate-800/60 text-slate-400 rounded px-2 py-0.5 font-mono">{v}</code>
                ))}
              </div>
              <p className="text-[9px] text-slate-500">{p.note}</p>
            </div>
          ))}

          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-slate-300 mb-1.5">Geral</p>
            <code className="text-[9px] bg-slate-800/60 text-slate-400 rounded px-2 py-0.5 font-mono">APP_URL</code>
            <p className="text-[9px] text-slate-500 mt-1">URL do frontend para redirect apos callback (ex: https://www.intentia.com.br)</p>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-cyan-400 mb-1">Callback URL (mesma para todos os providers)</p>
            <code className="text-[10px] text-cyan-300 font-mono">https://vofizgftwxgyosjrwcqy.supabase.co/functions/v1/oauth-callback</code>
          </div>
        </div>
      </FlowBox>

      {/* Frontend Components */}
      <FlowBox title="Componentes Frontend" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" badge="4 componentes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "Integrations.tsx", desc: "Pagina principal — grid 2x2 de cards, connect/disconnect/sync, dialog de detalhes, historico de syncs", path: "/integracoes", color: "text-cyan-400" },
            { name: "OAuthCallback.tsx", desc: "Pagina de callback — mostra status (success/error/processing), espera sessao restaurar, redireciona", path: "/oauth/callback (publica)", color: "text-green-400" },
            { name: "integrationOAuth.ts", desc: "Config OAuth por provider — authUrl, tokenUrl, scopes, helpers (generateState, getUrls)", path: "src/lib/", color: "text-purple-400" },
            { name: "integrationTypes.ts", desc: "Tipos — AdProvider, IntegrationStatus, SyncFrequency, PROVIDER_CONFIGS, helpers", path: "src/lib/", color: "text-amber-400" },
          ].map((c) => (
            <div key={c.name} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-3">
              <code className={`text-[11px] font-mono font-semibold ${c.color}`}>{c.name}</code>
              <p className="text-[9px] text-slate-500 mt-1">{c.desc}</p>
              <code className="text-[8px] text-slate-600 font-mono mt-1 block">{c.path}</code>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Architecture Summary */}
      <FlowBox title="Arquitetura Integracoes — Resumo">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { n: "4", label: "Providers", icon: Plug, color: "text-cyan-400" },
            { n: "3", label: "Edge Functions", icon: Cloud, color: "text-purple-400" },
            { n: "2", label: "Tabelas SQL", icon: Database, color: "text-emerald-400" },
            { n: "1", label: "View SQL", icon: Eye, color: "text-blue-400" },
            { n: "10", label: "Env Secrets", icon: Key, color: "text-amber-400" },
            { n: "4", label: "APIs Externas", icon: Globe, color: "text-green-400" },
            { n: "2", label: "Paginas", icon: Monitor, color: "text-blue-400" },
            { n: "2", label: "Libs", icon: FileText, color: "text-pink-400" },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color} flex-shrink-0`} />
              <div>
                <p className="text-lg font-bold text-white">{stat.n}</p>
                <p className="text-[10px] text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AdminArchitectureTab() {
  const [activeSection, setActiveSection] = useState<Section>("overview");

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.key;
          return (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                isActive
                  ? `${section.bg} border border-current/20 ${section.color}`
                  : "bg-slate-900/40 border border-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-800/40"
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? section.color : ""}`} />
              <span className="text-[11px] font-medium truncate">{section.label}</span>
            </button>
          );
        })}
      </div>

      {/* Section Content */}
      {activeSection === "overview" && <OverviewSection />}
      {activeSection === "frontend" && <FrontendSection />}
      {activeSection === "auth" && <AuthSection />}
      {activeSection === "data" && <DataFlowSection />}
      {activeSection === "features" && <FeatureFlagsSection />}
      {activeSection === "edge" && <EdgeFunctionsSection />}
      {activeSection === "database" && <DatabaseSection />}
      {activeSection === "security" && <SecuritySection />}
      {activeSection === "operations" && <OperationsSection />}
      {activeSection === "integrations" && <IntegrationsSection />}
    </div>
  );
}
