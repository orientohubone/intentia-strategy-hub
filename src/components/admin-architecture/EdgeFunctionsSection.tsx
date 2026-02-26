import {
  Cloud,
  Lock,
  AlertTriangle,
  Monitor,
  Server,
  ShieldCheck,
  Globe,
  Database,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FlowBox, FlowNode, ArrowConnector } from "./shared";

export function EdgeFunctionsSection() {
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
              name: "seo-monitor-orchestrator",
              desc: "Orquestra monitoramento SEO live: dispatch de jobs, execução de ciclos e atualização de timeline",
              trigger: "Manual, scheduler (cron) ou webhook",
              input: "action + project context",
              output: "Jobs processados + snapshot em seo_analysis_history",
              auth: "JWT ou INTERNAL_CRON_SECRET",
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
            },
            {
              name: "seo-intelligence",
              desc: "Coleta sinais de concorrência, backlinks, visibilidade LLM e snapshots para monitoramento inteligente",
              trigger: "Invocado pelo SEO Geo e pelo orchestrator",
              input: "url + competitorUrls + aiKeys",
              output: "intelligence_data (concorrentes + monitoring insights)",
              auth: "JWT / service role",
              color: "text-sky-400",
              bg: "bg-sky-500/10",
              border: "border-sky-500/20",
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
              desc: "API administrativa — 32+ actions: features, planos, usuarios, status page, suporte",
              trigger: "Invocado pelo AdminPanel",
              input: "action + params (JSON)",
              output: "Dados administrativos",
              auth: "Admin session token",
              color: "text-red-400",
              bg: "bg-red-500/10",
              border: "border-red-500/20",
            },
            {
              name: "oauth-connect",
              desc: "Gera URL OAuth para conectar contas de ads (Google, Meta, LinkedIn, TikTok)",
              trigger: "Invocado pelo frontend (Integrations)",
              input: "provider + redirect_uri",
              output: "URL de autorizacao OAuth",
              auth: "JWT Bearer token",
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              name: "oauth-callback",
              desc: "Recebe callback OAuth, troca code por tokens, salva integracao",
              trigger: "Redirect do provider OAuth",
              input: "code + state (query params)",
              output: "Redirect para /oauth/callback",
              auth: "State token (10min max)",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              name: "integration-sync",
              desc: "Sincroniza campanhas e metricas das plataformas de ads conectadas",
              trigger: "Sob demanda ou scheduled",
              input: "integration_id + period",
              output: "Sync log com resultados",
              auth: "JWT Bearer token",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
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

      {/* Claude Proxy Architecture */}
      <FlowBox title="Arquitetura Claude Proxy" badge="CORS Bypass">
        <div className="space-y-4">
          <div className="bg-muted border border-border rounded-xl p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-amber-400">Por que um proxy?</p>
                <p className="text-[10px] text-muted-foreground">A API da Anthropic (Claude) bloqueia chamadas diretas do browser via CORS. Gemini permite chamadas diretas. Claude precisa de proxy server-side.</p>
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
            <div key={r.source} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
              <code className="text-[10px] text-cyan-400 font-mono bg-cyan-500/10 px-1.5 py-0.5 rounded">{r.source}</code>
              <ArrowRight className="h-3 w-3 text-muted-foreground/70 flex-shrink-0" />
              <span className="text-[11px] text-foreground/80">{r.dest}</span>
              <span className="text-[9px] text-muted-foreground/70 ml-auto hidden sm:inline">{r.desc}</span>
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
