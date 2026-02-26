import {
  Database,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FlowBox, InfoTip } from "./shared";

export function DatabaseSection() {
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
                <div className={`bg-muted/30 border ${table.border} rounded-xl p-3 cursor-help`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : "bg-muted-foreground/60"}`} />
                        <code className="text-[9px] text-muted-foreground font-mono">{col}</code>
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
                <div key={table.name} className={`bg-muted/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : col.includes("UK") ? "bg-green-400" : "bg-muted-foreground/60"}`} />
                        <code className="text-[9px] text-muted-foreground font-mono">{col}</code>
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
                <div key={table.name} className={`bg-muted/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : "bg-muted-foreground/60"}`} />
                        <code className="text-[9px] text-muted-foreground font-mono">{col}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support tables */}
          <div>
            <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider mb-2">Tabelas Suporte (v4.x)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  name: "support_tickets",
                  desc: "Chamados de suporte dos clientes",
                  cols: ["id (PK)", "user_id (FK)", "ticket_number", "subject", "category", "priority", "status", "sla_deadline", "first_response_at", "resolved_at"],
                  color: "text-rose-400",
                  border: "border-rose-500/20",
                },
                {
                  name: "support_ticket_messages",
                  desc: "Mensagens de cada chamado",
                  cols: ["id (PK)", "ticket_id (FK)", "sender_id", "sender_type", "message", "created_at"],
                  color: "text-pink-400",
                  border: "border-pink-500/20",
                },
                {
                  name: "support_categories",
                  desc: "Categorias de chamados",
                  cols: ["id (PK)", "name", "description", "icon", "sort_order"],
                  color: "text-fuchsia-400",
                  border: "border-fuchsia-500/20",
                },
              ].map((table) => (
                <div key={table.name} className={`bg-muted/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : "bg-muted-foreground/60"}`} />
                        <code className="text-[9px] text-muted-foreground font-mono">{col}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration tables */}
          <div>
            <p className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-2">Tabelas Integracoes (v3.8)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                {
                  name: "ad_integrations",
                  desc: "Conexoes OAuth com plataformas de ads",
                  cols: ["id (PK)", "user_id (FK)", "provider (UK)", "status", "access_token", "refresh_token", "account_id", "account_name", "scopes", "project_mappings (JSONB)"],
                  color: "text-indigo-400",
                  border: "border-indigo-500/20",
                },
                {
                  name: "integration_sync_logs",
                  desc: "Historico de sincronizacoes",
                  cols: ["id (PK)", "integration_id (FK)", "user_id (FK)", "status", "duration_ms", "records_fetched", "records_created", "records_failed", "period", "errors (JSONB)"],
                  color: "text-violet-400",
                  border: "border-violet-500/20",
                },
              ].map((table) => (
                <div key={table.name} className={`bg-muted/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : col.includes("UK") ? "bg-green-400" : "bg-muted-foreground/60"}`} />
                        <code className="text-[9px] text-muted-foreground font-mono">{col}</code>
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
                <div key={table.name} className={`bg-muted/30 border ${table.border} rounded-xl p-3`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Database className={`h-3.5 w-3.5 ${table.color}`} />
                    <code className={`text-[11px] font-mono font-semibold ${table.color}`}>{table.name}</code>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">{table.desc}</p>
                  <div className="space-y-0.5">
                    {table.cols.map((col) => (
                      <div key={col} className="flex items-center gap-1.5">
                        <div className={`w-1 h-1 rounded-full ${col.includes("PK") ? "bg-amber-400" : col.includes("FK") ? "bg-cyan-400" : "bg-muted-foreground/60"}`} />
                        <code className="text-[9px] text-muted-foreground font-mono">{col}</code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[9px] text-muted-foreground">Primary Key</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="text-[9px] text-muted-foreground">Foreign Key</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-[9px] text-muted-foreground">Unique Key</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-muted-foreground/60" />
              <span className="text-[9px] text-muted-foreground">Column</span>
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
            { from: "tenant_settings", rel: "1:N", to: "support_tickets", desc: "Um usuario abre muitos chamados" },
            { from: "support_tickets", rel: "1:N", to: "support_ticket_messages", desc: "Um chamado tem muitas mensagens" },
            { from: "tenant_settings", rel: "1:N", to: "ad_integrations", desc: "Um usuario tem integracoes de ads" },
            { from: "ad_integrations", rel: "1:N", to: "integration_sync_logs", desc: "Uma integracao tem logs de sync" },
          ].map((rel) => (
            <div key={`${rel.from}-${rel.to}`} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-emerald-400 font-mono">{rel.from}</code>
              <Badge className="text-[9px] bg-muted text-muted-foreground border-border font-mono">{rel.rel}</Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground/70" />
              <code className="text-[10px] text-emerald-400 font-mono">{rel.to}</code>
              <span className="text-[9px] text-muted-foreground/70 ml-auto hidden sm:inline">{rel.desc}</span>
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
            <div key={fn.name} className="bg-muted border border-border rounded-xl p-3">
              <code className="text-[10px] text-emerald-400 font-mono font-semibold">{fn.name}()</code>
              <p className="text-[9px] text-muted-foreground mt-1">{fn.desc}</p>
              <p className="text-[9px] text-muted-foreground/70 mt-0.5">Params: {fn.params}</p>
            </div>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}
