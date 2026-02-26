import {
  Monitor,
  Cloud,
  Database,
  Globe,
  Palette,
  Smartphone,
  Server,
  Sparkles,
  Lock,
  Archive,
  ArrowRight,
  FileText,
  Layers,
  GitBranch,
  ToggleLeft,
  Crown,
} from "lucide-react";
import { FlowBox, FlowNode, InfoTip } from "./shared";

export function OverviewSection() {
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
          <div className="flex items-center gap-2 bg-muted/60 rounded-full px-4 py-1.5">
            <Monitor className="h-3 w-3 text-blue-400" />
            <div className="flex items-center gap-1">
              <div className="h-px w-3 bg-blue-400/40" />
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className="h-px w-3 bg-purple-400/40" />
            </div>
            <Cloud className="h-3 w-3 text-purple-400" />
            <div className="flex items-center gap-1">
              <div className="h-px w-3 bg-purple-400/40" />
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <div className="h-px w-3 bg-emerald-400/40" />
            </div>
            <Database className="h-3 w-3 text-emerald-400" />
          </div>
        </div>
      </FlowBox>

      {/* Tech Stack */}
      <FlowBox title="Stack Tecnologico" badge="v4.x">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "React 18.3", sub: "UI Framework", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", tip: "Biblioteca para construcao de interfaces reativas com componentes reutilizaveis e Virtual DOM" },
            { label: "TypeScript", sub: "Type Safety", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", tip: "Superset do JavaScript que adiciona tipagem estatica, prevenindo erros em tempo de compilacao" },
            { label: "Vite 5.4", sub: "Build Tool", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", tip: "Bundler ultrarapido com Hot Module Replacement (HMR) instantaneo e builds otimizados para producao" },
            { label: "Tailwind 3.4", sub: "Styling", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", tip: "Framework CSS utility-first que permite estilizar diretamente no HTML com classes atomicas" },
            { label: "Supabase", sub: "BaaS", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", tip: "Backend-as-a-Service open source: PostgreSQL, Auth, Storage, Edge Functions e Real-time" },
            { label: "TanStack Query", sub: "Data Fetching", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", tip: "Gerenciamento de estado assincrono com cache automatico, revalidacao e deduplicacao de requests" },
            { label: "React Router v6", sub: "Routing", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", tip: "Navegacao SPA com rotas declarativas, nested routes, loaders e protecao de rotas" },
            { label: "shadcn/ui", sub: "Components", color: "text-foreground/80", bg: "bg-muted", border: "border-border", tip: "Componentes acessiveis baseados em Radix UI, copiaveis e customizaveis com Tailwind" },
          ].map((tech) => (
            <InfoTip key={tech.label} tip={tech.tip}>
              <div className={`${tech.bg} border ${tech.border} rounded-xl p-3 text-center cursor-help`}>
                <p className={`text-xs font-bold ${tech.color}`}>{tech.label}</p>
                <p className="text-[10px] text-muted-foreground">{tech.sub}</p>
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
          { n: "15", label: "Edge Functions", icon: Cloud, color: "text-cyan-400" },
          { n: "25+", label: "Tabelas SQL", icon: Database, color: "text-emerald-400" },
          { n: "32+", label: "Feature Flags", icon: ToggleLeft, color: "text-amber-400" },
          { n: "15", label: "Libs", icon: Crown, color: "text-primary" },
          { n: "45+", label: "Arquivos SQL", icon: FileText, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm">
            <stat.icon className={`h-5 w-5 ${stat.color} flex-shrink-0`} />
            <div>
              <p className="text-lg font-bold text-foreground">{stat.n}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
