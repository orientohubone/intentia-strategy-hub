import {
  Users,
  ToggleLeft,
  Eye,
  Crown,
  CheckCircle2,
  XCircle,
  FolderOpen,
  Sparkles,
  BarChart3,
  Crosshair,
  Download,
  Share2,
  Lightbulb,
  Settings,
  Plug,
  Gauge
} from "lucide-react";
import { FlowBox, FlowNode, ArrowConnector, InfoTip } from "./shared";

export function FeatureFlagsSection() {
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
              { status: "deprecated", label: "Descontinuado", color: "text-muted-foreground", bg: "bg-muted", border: "border-border", action: "Remocao" },
            ].map((s) => (
              <div key={s.status} className={`${s.bg} border ${s.border} rounded-lg px-2 py-2 text-center`}>
                <p className={`text-[10px] font-medium ${s.color}`}>{s.label}</p>
                <p className="text-[9px] text-muted-foreground">{s.action}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Se ativo..." />

          <FlowNode icon={Eye} label="2. Override por Usuario?" sublabel="user_feature_overrides" color="text-purple-300" bg="bg-purple-500/10" border="border-purple-500/20" />
          <ArrowConnector direction="down" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-purple-400 font-medium">Override = true</p>
              <p className="text-[9px] text-muted-foreground">Acesso liberado (ignora plano)</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Override = false</p>
              <p className="text-[9px] text-muted-foreground">Acesso bloqueado (ignora plano)</p>
            </div>
            <div className="bg-muted/60 border border-border/50 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-foreground/80 font-medium">Sem override</p>
              <p className="text-[9px] text-muted-foreground">Verifica plano do usuario</p>
            </div>
          </div>

          <ArrowConnector direction="down" label="Se sem override..." />

          <FlowNode icon={Crown} label="3. Permissao do Plano" sublabel="plan_features.is_enabled" color="text-primary" bg="bg-primary/10" border="border-primary/20" />
          <ArrowConnector direction="down" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 text-center">
              <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <p className="text-[10px] text-green-400 font-medium">Habilitado no plano</p>
              <p className="text-[9px] text-muted-foreground">Acesso concedido</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
              <p className="text-[10px] text-red-400 font-medium">Nao habilitado</p>
              <p className="text-[9px] text-muted-foreground">Tela de upgrade exibida</p>
            </div>
          </div>
        </div>
      </FlowBox>

      {/* Priority chain */}
      <FlowBox title="Cadeia de Prioridade">
        <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
            <p className="text-xs font-bold text-amber-400">1o</p>
            <p className="text-[10px] text-muted-foreground">Status Global</p>
            <code className="text-[9px] text-muted-foreground font-mono">feature_flags</code>
          </div>
          <ArrowConnector direction="right" />
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 text-center">
            <p className="text-xs font-bold text-purple-400">2o</p>
            <p className="text-[10px] text-muted-foreground">Override Usuario</p>
            <code className="text-[9px] text-muted-foreground font-mono">user_feature_overrides</code>
          </div>
          <ArrowConnector direction="right" />
          <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-center">
            <p className="text-xs font-bold text-primary">3o</p>
            <p className="text-[10px] text-muted-foreground">Permissao Plano</p>
            <code className="text-[9px] text-muted-foreground font-mono">plan_features</code>
          </div>
        </div>
      </FlowBox>

      {/* Categories */}
      <FlowBox title="Categorias de Features" badge="32+ features">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { label: "Projetos", icon: FolderOpen, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20", count: 5, tip: "Criacao de projetos, analise de URL, scores por canal, dados estruturados e progress tracker" },
            { label: "Inteligencia Artificial", icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", count: 5, tip: "Analise por IA (Gemini/Claude), enriquecimento de benchmark/insights, analise de performance e API keys" },
            { label: "Benchmark", icon: BarChart3, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", count: 2, tip: "Comparacao SWOT com concorrentes, gap analysis e scores comparados" },
            { label: "Plano Tatico", icon: Crosshair, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", count: 4, tip: "Templates de campanhas, playbook gamificado, operacoes e gestao de campanhas" },
            { label: "Exportacao", icon: Download, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", count: 3, tip: "Exportar relatorios em PDF, dados em CSV e resultados de IA" },
            { label: "Marca & Social", icon: Share2, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", count: 2, tip: "Brand Guide com identidade visual e posts para redes sociais" },
            { label: "Insights & Alertas", icon: Lightbulb, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", count: 6, tip: "Scores por canal, insights estrategicos, alertas, publicos-alvo, notificacoes e dark mode" },
            { label: "Configuracoes", icon: Settings, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20", count: 2, tip: "Backup de dados e chat de suporte" },
            { label: "Integracoes", icon: Plug, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", count: 5, tip: "Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads e integracoes de marketing" },
            { label: "SEO & Performance", icon: Gauge, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", count: 5, tip: "SEO Analysis, Performance Monitoring, AI Performance Analysis, SEO Geolocalizacao e Monitoramento SEO Inteligente" },
          ].map((cat) => (
            <InfoTip key={cat.label} tip={cat.tip}>
              <div className={`${cat.bg} border ${cat.border} rounded-xl p-3 text-center cursor-help`}>
                <cat.icon className={`h-5 w-5 ${cat.color} mx-auto mb-1.5`} />
                <p className={`text-[10px] font-medium ${cat.color}`}>{cat.label}</p>
                <p className="text-[9px] text-muted-foreground">{cat.count} features</p>
              </div>
            </InfoTip>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}
