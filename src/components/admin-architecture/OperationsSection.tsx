import {
  Megaphone,
  FolderOpen,
  ArrowRight,
  BarChart3,
  Eye,
  FileText,
  Database,
  Activity,
  Users,
  Target,
  UserCheck,
  Receipt,
  DollarSign,
  Calculator,
  TrendingUp,
  CalendarDays,
  GanttChart,
  AlertTriangle,
  Bell,
  Layers,
  Sparkles
} from "lucide-react";
import { FlowBox, FlowNode, ArrowConnector, InfoTip } from "./shared";

export function OperationsSection() {
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
              { label: "Rascunho", color: "text-muted-foreground", bg: "bg-muted/60", border: "border-border/50" },
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
                <code className="text-[8px] text-muted-foreground font-mono">{s}</code>
                {i < 4 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/70" />}
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
              <p className="text-[9px] text-muted-foreground">INSERT novo periodo</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-blue-400 font-medium">Editar</p>
              <p className="text-[9px] text-muted-foreground">UPDATE registro existente</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Excluir</p>
              <p className="text-[9px] text-muted-foreground">DELETE com confirmacao</p>
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
            <p className="text-[10px] text-foreground/80 font-semibold uppercase tracking-wider mb-2">Metricas Gerais (todos os canais)</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {["Impressoes", "Cliques", "CTR %", "CPC R$", "CPM R$", "Conversoes", "CPA R$", "Custo Total", "Receita", "ROAS x"].map((m) => (
                <div key={m} className="bg-muted/60 border border-border rounded-lg px-2 py-1.5 text-center">
                  <p className="text-[9px] text-muted-foreground">{m}</p>
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
            <p className="text-[10px] text-foreground/80 font-semibold uppercase tracking-wider mb-2">Metricas Especificas por Canal</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-blue-400 mb-1.5">Google</p>
                <div className="space-y-1">
                  {["Quality Score", "Posicao Media", "Impression Share", "+ 16 metricas funil"].map((m) => (
                    <p key={m} className="text-[9px] text-muted-foreground">{m}</p>
                  ))}
                </div>
              </div>
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-indigo-400 mb-1.5">Meta</p>
                <div className="space-y-1">
                  {["Alcance", "Frequencia"].map((m) => (
                    <p key={m} className="text-[9px] text-muted-foreground">{m}</p>
                  ))}
                </div>
              </div>
              <div className="bg-sky-500/5 border border-sky-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-sky-400 mb-1.5">LinkedIn</p>
                <div className="space-y-1">
                  {["Leads", "CPL", "Engagement Rate"].map((m) => (
                    <p key={m} className="text-[9px] text-muted-foreground">{m}</p>
                  ))}
                </div>
              </div>
              <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-pink-400 mb-1.5">TikTok</p>
                <div className="space-y-1">
                  {["Video Views", "VTR"].map((m) => (
                    <p key={m} className="text-[9px] text-muted-foreground">{m}</p>
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
              <p className="text-[11px] text-muted-foreground mb-2">{view.desc}</p>
              <div className="flex flex-wrap gap-1">
                {view.cols.split(", ").map((col) => (
                  <code key={col} className="text-[8px] bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 font-mono">{col}</code>
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
                <p className="text-[9px] text-muted-foreground">{item.sub}</p>
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
                <p className="text-[9px] text-muted-foreground">{item.sub}</p>
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
              <p className="text-[9px] text-muted-foreground">&lt;80% gasto</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-amber-400 font-medium">Atencao</p>
              <p className="text-[9px] text-muted-foreground">80-95% gasto</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Perigo</p>
              <p className="text-[9px] text-muted-foreground">95-100% gasto</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-red-400 font-medium">Estourado</p>
              <p className="text-[9px] text-muted-foreground">&gt;100% gasto</p>
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
                  <p key={f} className="text-[9px] text-muted-foreground">{f}</p>
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
                  <p key={f} className="text-[9px] text-muted-foreground">{f}</p>
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
                <p className="text-[9px] text-muted-foreground">Cor dedicada</p>
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
              <p className="text-[9px] text-muted-foreground">Budget 100%, ROAS &lt;1x, ROI neg.</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-amber-400 font-medium">Atencao</p>
              <p className="text-[9px] text-muted-foreground">CTR baixo, CPC/CPA alto</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-2 text-center">
              <p className="text-[10px] text-blue-400 font-medium">Info</p>
              <p className="text-[9px] text-muted-foreground">Pacing lento, sem metricas</p>
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
              <div key={item.label} className="bg-muted/60 border border-border rounded-lg px-2.5 py-2 text-center">
                <p className="text-[10px] text-foreground/80 font-medium">{item.label}</p>
                <p className="text-[9px] text-muted-foreground">{item.sub}</p>
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
