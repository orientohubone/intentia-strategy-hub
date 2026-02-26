import {
  Users,
  ShieldCheck,
  Database,
  Lock,
  CheckCircle2
} from "lucide-react";
import { FlowBox, FlowNode, ArrowConnector } from "./shared";

export function SecuritySection() {
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

        <div className="bg-muted border border-border rounded-xl p-3">
          <p className="text-[10px] font-semibold text-foreground/80 mb-2">Tabelas com RLS ativo:</p>
          <div className="flex flex-wrap gap-1.5">
            {["tenant_settings", "projects", "insights", "project_channel_scores", "benchmarks", "audiences", "notifications", "user_api_keys", "campaigns", "campaign_metrics", "budget_allocations", "ad_integrations", "integration_sync_logs", "support_tickets", "support_ticket_messages"].map((t) => (
              <code key={t} className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 rounded px-2 py-0.5 font-mono">{t}</code>
            ))}
          </div>
        </div>
      </FlowBox>

      {/* Security Audit */}
      <FlowBox title="Auditoria de Seguranca" borderColor="border-amber-500/20" bgColor="bg-amber-500/5" badge="Aplicada">
        <div className="space-y-3">
          <div className="bg-muted border border-border rounded-xl p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-green-400">Auditoria completa realizada e correcoes aplicadas</p>
                <p className="text-[10px] text-muted-foreground">30+ policies vulneraveis removidas. Edge Functions protegidas com auth checks. URL do Supabase ocultada via proxy.</p>
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
                  <p className="text-[9px] text-muted-foreground mt-0.5">{v.desc}</p>
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
            <div key={layer.layer} className={`bg-muted/20 border ${layer.border} rounded-xl p-4`}>
              <p className={`text-xs font-semibold ${layer.color} mb-2`}>{layer.layer}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {layer.items.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle2 className={`h-3 w-3 ${layer.color} flex-shrink-0 mt-0.5`} />
                    <span className="text-[10px] text-muted-foreground">{item}</span>
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
