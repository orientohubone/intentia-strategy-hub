import {
  Globe,
  Lock,
  Users,
  Database,
  Key,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Zap,
  Star,
  Crown,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FlowBox, FlowNode, ArrowConnector } from "./shared";

export function AuthSection() {
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
          <div className="bg-muted border border-border rounded-xl p-3 mt-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-400">Autenticacao Separada</p>
                <p className="text-[10px] text-muted-foreground">Admin usa localStorage + SHA-256 (tabela admin_users). Nao interfere com Supabase Auth dos clientes. Sessoes sao completamente independentes.</p>
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
            <p className="text-[10px] text-muted-foreground mt-1">ForceLightMode wrapper</p>
            <p className="text-[9px] text-muted-foreground/70 mt-0.5">Sem autenticacao</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
            <Lock className="h-5 w-5 text-amber-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-amber-400">Protegidas</p>
            <p className="text-[10px] text-muted-foreground mt-1">ProtectedRoute + FeatureGate</p>
            <p className="text-[9px] text-muted-foreground/70 mt-0.5">Supabase Auth + Feature Flags</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
            <Shield className="h-5 w-5 text-red-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-red-400">Admin</p>
            <p className="text-[10px] text-muted-foreground mt-1">AdminProtectedRoute</p>
            <p className="text-[9px] text-muted-foreground/70 mt-0.5">CNPJ + localStorage session</p>
          </div>
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
              <p className="text-[10px] text-muted-foreground mb-3">{p.price}</p>
              <div className="space-y-1.5 text-left">
                {p.limits.map((l) => (
                  <div key={l} className="flex items-center gap-1.5">
                    <CheckCircle2 className={`h-3 w-3 ${p.color} flex-shrink-0`} />
                    <span className="text-[10px] text-muted-foreground">{l}</span>
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
