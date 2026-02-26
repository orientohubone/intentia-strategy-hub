import {
  Globe,
  Server,
  Target,
  Database,
  Lightbulb,
  BarChart3,
  Bell,
  Key,
  FileText,
  Sparkles,
  Users,
  Cloud,
  Eye,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { FlowBox, FlowNode, ArrowConnector } from "./shared";

export function DataFlowSection() {
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
                <p className="text-[9px] text-muted-foreground">{s.score}</p>
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
              <p className="text-[9px] text-muted-foreground">Flash 2.0 / 3 Preview / Pro</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
              <Sparkles className="h-5 w-5 text-amber-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-amber-400">Anthropic Claude</p>
              <p className="text-[9px] text-muted-foreground">Sonnet 4 / 3.7 / Haiku / Opus</p>
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
                <p className="text-[9px] text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>

          <ArrowConnector direction="down" label="Salva em audiences.icp_enrichment" />
          <FlowNode icon={Eye} label="4. IcpEnrichmentDialog" sublabel="Dialog com fullscreen, perfil, dores, gatilhos, keywords, recomendacoes" color="text-blue-300" bg="bg-blue-500/10" border="border-blue-500/20" />
        </div>
      </FlowBox>

      {/* Strategic Flow Map */}
      <FlowBox title="Fluxos do Modulo Estrategico" borderColor="border-indigo-500/20" bgColor="bg-indigo-500/5" badge="Estrategico" defaultOpen>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            {
              title: "Diagnostico de URL",
              steps: [
                "Projeto criado com URL + nicho",
                "Edge analyze-url roda heuristica",
                "Score + insights salvos no banco",
                "Dashboard e relatorios atualizados",
              ],
              icon: Globe,
              color: "text-blue-400",
              bg: "bg-blue-500/10",
              border: "border-blue-500/20",
            },
            {
              title: "Benchmark competitivo",
              steps: [
                "Concorrentes definidos por projeto",
                "Comparacao de sinais e posicionamento",
                "SWOT + gap analysis gerados",
                "Insights acionaveis para estrategia",
              ],
              icon: BarChart3,
              color: "text-green-400",
              bg: "bg-green-500/10",
              border: "border-green-500/20",
            },
            {
              title: "Plano tatico e alertas",
              steps: [
                "Plano tatico por canal e objetivo",
                "Execucao acompanhada no operacional",
                "Alertas estrategicos de risco/oportunidade",
                "Ajustes orientados por dados",
              ],
              icon: Target,
              color: "text-amber-400",
              bg: "bg-amber-500/10",
              border: "border-amber-500/20",
            },
            {
              title: "Monitoramento SEO inteligente",
              steps: [
                "Config live persistida por projeto",
                "Jobs disparados (manual/cron/webhook)",
                "Snapshot salvo com monitoringInsights",
                "Timeline agrupada por data com deltas",
              ],
              icon: Activity,
              color: "text-cyan-400",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
            },
          ].map((flow) => (
            <div key={flow.title} className={`${flow.bg} border ${flow.border} rounded-xl p-3`}>
              <div className="flex items-center gap-2 mb-2">
                <flow.icon className={`h-4 w-4 ${flow.color}`} />
                <p className={`text-[11px] font-semibold ${flow.color}`}>{flow.title}</p>
              </div>
              <div className="space-y-1.5">
                {flow.steps.map((step, idx) => (
                  <div key={`${flow.title}-${idx}`} className="flex items-start gap-2">
                    <span className="text-[9px] text-muted-foreground mt-0.5">{idx + 1}.</span>
                    <p className="text-[10px] text-foreground/85">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </FlowBox>

      {/* Strategic Implementations */}
      <FlowBox title="Implementacoes Estrategicas Entregues" borderColor="border-emerald-500/20" bgColor="bg-emerald-500/5" badge="Atualizado 19/02/2026">
        <div className="space-y-2">
          {[
            "Persistencia de configuracao live SEO no Supabase (configs por projeto/usuario).",
            "Orquestracao por fila com seo-monitor-orchestrator (dispatch_due, run_jobs, dispatch_and_run, webhook_enqueue).",
            "Timeline de monitoramento com agrupamento por data, expand/collapse e deltas de mudanca.",
            "Feature flag performance_monitoring com controle por plano e visibilidade no Admin.",
            "Nova pagina publica /monitoramento-seo-inteligente integrada ao site.",
            "Atualizacao da central de ajuda e matriz de precos com monitoramento SEO inteligente.",
          ].map((item) => (
            <div key={item} className="bg-card border border-border rounded-lg px-3 py-2 flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-foreground/85">{item}</p>
            </div>
          ))}
        </div>
      </FlowBox>
    </div>
  );
}
