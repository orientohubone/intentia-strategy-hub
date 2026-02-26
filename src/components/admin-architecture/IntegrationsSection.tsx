import {
  Plug,
  Cloud,
  Monitor,
  AlertTriangle,
  Lock,
  RefreshCw,
  Key,
  Globe,
  BarChart3,
  Database,
  FileText,
  CheckCircle2,
  Eye,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FlowBox, FlowNode, ArrowConnector, InfoTip } from "./shared";

export function IntegrationsSection() {
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
          <div className="bg-muted border border-border rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-400">JWT Verification Desabilitado</p>
                <p className="text-[10px] text-muted-foreground">oauth-connect e oauth-callback tem JWT verification desabilitado no Supabase Dashboard. Necessario porque o browser redireciona sem headers. Auth e feita internamente via token no body/header.</p>
              </div>
            </div>
          </div>
          <div className="bg-muted border border-border rounded-xl p-3">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-green-400">State Parameter</p>
                <p className="text-[10px] text-muted-foreground">Base64 JSON com user_id + provider + timestamp. Validado com expiracao de 10 minutos para prevenir CSRF. Decodificado no oauth-callback.</p>
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
        <div className="bg-muted border border-border rounded-xl p-3 mt-4">
          <p className="text-[10px] font-semibold text-foreground/80 mb-2">Validade de Tokens por Provider:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { provider: "Google", access: "1 hora", refresh: "Permanente", color: "text-blue-400" },
              { provider: "Meta", access: "60 dias", refresh: "N/A (long-lived)", color: "text-indigo-400" },
              { provider: "LinkedIn", access: "60 dias", refresh: "365 dias", color: "text-sky-400" },
              { provider: "TikTok", access: "24 horas", refresh: "365 dias", color: "text-pink-400" },
            ].map((t) => (
              <div key={t.provider} className="bg-muted/60 rounded-lg px-2.5 py-2">
                <p className={`text-[10px] font-medium ${t.color}`}>{t.provider}</p>
                <p className="text-[9px] text-muted-foreground">Access: {t.access}</p>
                <p className="text-[9px] text-muted-foreground">Refresh: {t.refresh}</p>
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
                <Badge className="text-[8px] bg-muted text-muted-foreground border-border ml-auto">
                  {fn.name === "oauth-callback" ? "JWT OFF" : "JWT"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3">{fn.desc}</p>
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-muted/60 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-muted-foreground/70 uppercase">Trigger</p>
                  <p className="text-[10px] text-muted-foreground">{fn.trigger}</p>
                </div>
                <div className="bg-muted/60 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-muted-foreground/70 uppercase">Input</p>
                  <p className="text-[10px] text-muted-foreground">{fn.input}</p>
                </div>
                <div className="bg-muted/60 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-muted-foreground/70 uppercase">Output</p>
                  <p className="text-[10px] text-muted-foreground">{fn.output}</p>
                </div>
                <div className="bg-muted/60 rounded-lg px-2.5 py-1.5">
                  <p className="text-[9px] text-muted-foreground/70 uppercase">Auth</p>
                  <p className="text-[10px] text-muted-foreground">{fn.auth}</p>
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

        <div className="bg-muted border border-border rounded-xl p-3 mt-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium text-amber-400">Developer Token</p>
              <p className="text-[10px] text-muted-foreground">Requer GOOGLE_ADS_DEVELOPER_TOKEN aprovado para contas de producao. Token de teste so funciona com contas de teste do Google Ads. Solicitar aprovacao no Google Ads API Center.</p>
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
            <div key={item.title} className="flex items-start gap-3 bg-muted border border-border rounded-xl p-3">
              <item.icon className={`h-4 w-4 ${item.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-[10px] font-medium ${item.color}`}>{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
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

        {/* View */}
        <div className="mt-3">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Eye className={`h-4 w-4 text-cyan-400`} />
              <code className="text-xs font-mono font-semibold text-cyan-400">v_integration_summary</code>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">Join ad_integrations + sync logs agregados (total_syncs, successful, failed, last_sync_status, avg_duration)</p>
            <div className="flex flex-wrap gap-1">
              {["provider", "status", "account_name", "last_sync_at", "total_syncs", "successful_syncs", "failed_syncs", "last_sync_status", "avg_duration_ms"].map((col) => (
                <code key={col} className="text-[8px] bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 font-mono">{col}</code>
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
            <div key={p.provider} className={`bg-muted/30 border ${p.border} rounded-xl p-3`}>
              <p className={`text-[11px] font-semibold ${p.color} mb-1.5`}>{p.provider}</p>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {p.vars.map((v) => (
                  <code key={v} className="text-[9px] bg-muted/60 text-muted-foreground rounded px-2 py-0.5 font-mono">{v}</code>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground">{p.note}</p>
            </div>
          ))}

          <div className="bg-muted border border-border rounded-xl p-3">
            <p className="text-[11px] font-semibold text-foreground/80 mb-1.5">Geral</p>
            <code className="text-[9px] bg-muted/60 text-muted-foreground rounded px-2 py-0.5 font-mono">APP_URL</code>
            <p className="text-[9px] text-muted-foreground mt-1">URL do frontend para redirect apos callback (ex: https://www.intentia.com.br)</p>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3">
            <p className="text-[11px] font-semibold text-cyan-400 mb-1">Callback URL (mesma para todos os providers)</p>
            <code className="text-[10px] text-cyan-300 font-mono">https://vofizgftwxgyosjrwcqy.supabase.co/functions/v1/oauth-callback</code>
          </div>
        </div>
      </FlowBox>

      {/* Frontend Components */}
      <FlowBox title="Componentes Frontend" borderColor="border-blue-500/20" bgColor="bg-blue-500/5" badge="5 componentes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "FeatureBlockedScreen.tsx", desc: "Telas de aviso dinâmicas (upgrade, development, maintenance, disabled) com mensagens personalizáveis", color: "text-amber-400" },
            { name: "Integrations.tsx", desc: "Pagina principal — grid 2x2 de cards, connect/disconnect/sync, dialog de detalhes, historico de syncs", path: "/integracoes", color: "text-cyan-400" },
            { name: "OAuthCallback.tsx", desc: "Pagina de callback — mostra status (success/error/processing), espera sessao restaurar, redireciona", path: "/oauth/callback (publica)", color: "text-green-400" },
            { name: "integrationOAuth.ts", desc: "Config OAuth por provider — authUrl, tokenUrl, scopes, helpers (generateState, getUrls)", path: "src/lib/", color: "text-purple-400" },
            { name: "integrationTypes.ts", desc: "Tipos — AdProvider, IntegrationStatus, SyncFrequency, PROVIDER_CONFIGS, helpers", path: "src/lib/", color: "text-amber-400" },
          ].map((c) => (
            <div key={c.name} className="bg-muted border border-border rounded-xl p-3">
              <code className={`text-[11px] font-mono font-semibold ${c.color}`}>{c.name}</code>
              <p className="text-[9px] text-muted-foreground mt-1">{c.desc}</p>
              <code className="text-[8px] text-muted-foreground/70 font-mono mt-1 block">{c.path}</code>
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
            <div key={stat.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm">
              <stat.icon className={`h-5 w-5 ${stat.color} flex-shrink-0`} />
              <div>
                <p className="text-lg font-bold text-foreground">{stat.n}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}
