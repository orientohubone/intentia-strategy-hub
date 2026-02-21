// Edge Function: assistant-ia
// Tia — assistente conversacional da Intentia com linguagem natural,
// contexto COMPLETO de toda a plataforma, histórico de conversa e markdown.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

// @ts-ignore deno runtime provides Deno
declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*, authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

type Message = { role: "user" | "assistant" | "system"; content: string };

type TenantContext = {
  tenantId: string;
  plan?: string;
  email?: string;
};

type RequestPayload = {
  messages: Message[];
  tenantContext: TenantContext;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(n: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

function fmtNum(n: number): string {
  return n.toLocaleString("pt-BR");
}

function safe(v: any, fallback = "n/d"): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

// ---------------------------------------------------------------------------
// Build system prompt — structured by platform section
// ---------------------------------------------------------------------------

function buildSystemPrompt(d: Record<string, any>): string {
  // --- Section builders ---
  const sections: string[] = [];

  // 1. Identity & rules
  sections.push([
    "Você é a **Tia**, assistente virtual da plataforma **Intentia**.",
    "Seu papel é ajudar o usuário a entender TODOS os seus dados, tomar decisões de marketing e navegar pela plataforma.",
    "",
    "## Personalidade e tom",
    "- Fale sempre em **português brasileiro**, de forma **amigável, direta e profissional**.",
    "- Use linguagem natural como se fosse uma colega de trabalho experiente em marketing digital B2B.",
    "- Seja concisa: respostas curtas e objetivas. Aprofunde apenas quando o usuário pedir.",
    "- **NUNCA** trunce ou corte dados no meio. Se for listar métricas, liste todas completamente.",
    "- Quando o usuário pedir para 'atualizar' ou 'mostrar novamente', apresente um resumo completo.",
    "- Nunca invente dados. Se não souber, diga que não tem essa informação.",
    "- Quando cumprimentada, responda de forma calorosa e breve, e ofereça ajuda.",
    "",
    "## Formatação",
    "- Use **markdown**: negrito, listas, títulos quando apropriado.",
    "- Números monetários em formato brasileiro (R$ 1.234,56).",
    "- Bullet points (`-`) para listas. Parágrafos curtos.",
    "- Nunca repita o contexto inteiro. Use apenas o relevante para a pergunta.",
    "- Sempre termine respostas de forma completa.",
    "",
    "## Regras de conversa",
    "- Mantenha contexto da conversa anterior.",
    "- Não repita saudações. Cumprimente apenas na primeira interação.",
    "- Fora do escopo → responda educadamente que seu foco é a Intentia.",
    "- Nunca exponha IDs internos, tokens ou dados sensíveis.",
  ].join("\n"));

  // 2. User & Account
  sections.push([
    "",
    "## 1. CONTA DO USUÁRIO",
    `- **Nome:** ${d.userName}`,
    `- **Email:** ${d.email}`,
    `- **Plano:** ${d.plan}`,
    `- **Empresa:** ${safe(d.companyName, "não informada")}`,
  ].join("\n"));

  // 3. Projects
  const projectLines = (d.projects ?? []).map((p: any) =>
    `  - **${p.name}** — URL: ${safe(p.url)} | nicho: ${safe(p.niche)} | status: ${safe(p.status)} | score: ${safe(p.score)}`
  );
  sections.push([
    "",
    `## 2. PROJETOS (${d.projectsCount ?? 0} total)`,
    projectLines.length ? projectLines.join("\n") : "  - Nenhum projeto cadastrado.",
  ].join("\n"));

  // 4. Channel Scores (per project)
  const csLines: string[] = [];
  const csByProject: Record<string, any[]> = {};
  (d.channelScores ?? []).forEach((cs: any) => {
    const pid = cs.project_id;
    if (!csByProject[pid]) csByProject[pid] = [];
    csByProject[pid].push(cs);
  });
  for (const [pid, scores] of Object.entries(csByProject)) {
    const proj = (d.projects ?? []).find((p: any) => p.id === pid);
    const pName = proj?.name ?? pid;
    csLines.push(`  **${pName}:**`);
    scores.forEach((cs: any) => {
      csLines.push(`    - ${cs.channel}: score ${cs.score}${cs.objective ? `, objetivo: ${cs.objective}` : ""}${cs.is_recommended ? " ✓ recomendado" : ""}${cs.risks?.length ? `, riscos: ${cs.risks.join(", ")}` : ""}`);
    });
  }
  sections.push([
    "",
    `## 3. SCORES POR CANAL (${d.channelScoresCount ?? 0} total)`,
    csLines.length ? csLines.join("\n") : "  - Sem scores de canal.",
  ].join("\n"));

  // 5. Insights
  const insightLines = (d.insights ?? []).map((i: any) =>
    `  - [${i.type}] **${i.title}** — ${(i.description ?? "").substring(0, 80)}${i.project_name ? ` (projeto: ${i.project_name})` : ""}`
  );
  sections.push([
    "",
    `## 4. INSIGHTS ESTRATÉGICOS (${d.insightsCount ?? 0} total)`,
    insightLines.length ? insightLines.join("\n") : "  - Sem insights.",
  ].join("\n"));

  // 6. Benchmarks
  const benchLines = (d.benchmarks ?? []).map((b: any) =>
    `  - **${b.competitor_name}** (${safe(b.competitor_url)}) — score: ${safe(b.overall_score)}, gap: ${safe(b.score_gap)}${b.project_name ? `, projeto: ${b.project_name}` : ""}`
  );
  sections.push([
    "",
    `## 5. BENCHMARKS COMPETITIVOS (${d.benchmarksCount ?? 0} total)`,
    benchLines.length ? benchLines.join("\n") : "  - Sem benchmarks.",
  ].join("\n"));

  // 7. Audiences
  const audLines = (d.audiences ?? []).map((a: any) =>
    `  - **${a.name}** — ${safe(a.description, "sem descrição")}${a.industry ? ` | indústria: ${a.industry}` : ""}${a.company_size ? ` | porte: ${a.company_size}` : ""}${a.location ? ` | local: ${a.location}` : ""}${a.keywords?.length ? ` | keywords: ${a.keywords.join(", ")}` : ""}${a.project_name ? ` (projeto: ${a.project_name})` : ""}`
  );
  sections.push([
    "",
    `## 6. PÚBLICOS-ALVO (${d.audiencesCount ?? 0} total)`,
    audLines.length ? audLines.join("\n") : "  - Sem públicos-alvo.",
  ].join("\n"));

  // 8. Campaigns + Metrics (Operations)
  const campLines = (d.campaigns ?? []).map((c: any) => {
    const m = d.metricsByCampaign?.[c.id];
    const cost = m?.total_cost ?? 0;
    const pacing = c.budget_total > 0 ? ((cost / c.budget_total) * 100).toFixed(1) : "0";
    const roasStr = m?.calc_roas ? ` | ROAS: ${m.calc_roas}x` : "";
    const impressions = m?.total_impressions ? ` | imp: ${fmtNum(m.total_impressions)}` : "";
    const clicks = m?.total_clicks ? ` | cliques: ${fmtNum(m.total_clicks)}` : "";
    const convs = m?.total_conversions ? ` | conv: ${m.total_conversions}` : "";
    const leads = m?.total_leads ? ` | leads: ${m.total_leads}` : "";
    const rev = m?.total_revenue ? ` | receita: ${fmt(m.total_revenue)}` : "";
    return `  - **${c.name}** (${safe(c.channel)}) — status: ${c.status} | budget: ${fmt(c.budget_total ?? 0)} | gasto: ${fmt(cost)} | pacing: ${pacing}%${roasStr}${impressions}${clicks}${convs}${leads}${rev}`;
  });

  const channelBreakdown = Object.entries(d.spendByChannel ?? {}).map(([ch, data]: [string, any]) =>
    `  - **${ch}:** budget ${fmt(data.budget)}, gasto ${fmt(data.cost)}, pacing ${data.budget > 0 ? ((data.cost / data.budget) * 100).toFixed(1) : "0"}%`
  );

  sections.push([
    "",
    `## 7. OPERAÇÕES — CAMPANHAS (${d.campaignsCount ?? 0} total)`,
    "",
    "### Métricas consolidadas (fonte: campaign_metrics — mesma do LiveDashboard)",
    `- **Budget total:** ${fmt(d.totalBudget ?? 0)} | **Gasto real (mídia):** ${fmt(d.totalMediaCost ?? 0)}`,
    `- **Receita:** ${fmt(d.totalRevenue ?? 0)} | **ROAS:** ${(d.totalRoas ?? 0).toFixed(2)}x`,
    `- **Conversões:** ${d.totalConversions ?? 0} | **CAC:** ${fmt(d.totalCac ?? 0)}`,
    `- **Impressões:** ${fmtNum(d.totalImpressions ?? 0)} | **Cliques:** ${fmtNum(d.totalClicks ?? 0)} | **Leads:** ${d.totalLeads ?? 0}`,
    "",
    "### Por canal",
    channelBreakdown.length ? channelBreakdown.join("\n") : "  - Sem dados por canal.",
    "",
    "### Campanhas detalhadas",
    campLines.length ? campLines.join("\n") : "  - Nenhuma campanha.",
  ].join("\n"));

  // 9. Budget Management
  sections.push([
    "",
    "## 8. GESTÃO DE BUDGET",
    d.budgetPlanned > 0
      ? [
          `- **Mês atual:** planejado ${fmt(d.budgetPlanned)}, gasto ${fmt(d.budgetActual)}, pacing ${(d.budgetPacing ?? 0).toFixed(1)}%`,
          ...(d.budgetByChannel ?? []).map((bc: any) =>
            `  - ${bc.channel}: planejado ${fmt(bc.planned)}, gasto ${fmt(bc.actual)}`
          ),
        ].join("\n")
      : "- Sem alocação de budget definida para o mês atual.",
  ].join("\n"));

  // 10. Tactical Plans
  const tacLines = (d.tacticalPlans ?? []).map((tp: any) =>
    `  - **${tp.name}** — status: ${safe(tp.status)} | canais: ${safe(tp.channels_count, "0")}${tp.project_name ? ` | projeto: ${tp.project_name}` : ""}`
  );
  sections.push([
    "",
    `## 9. PLANOS TÁTICOS (${d.tacticalPlansCount ?? 0} total)`,
    tacLines.length ? tacLines.join("\n") : "  - Sem planos táticos.",
  ].join("\n"));

  // 11. Notifications
  const notifLines = (d.notifications ?? []).map((n: any) =>
    `  - ${n.title}${n.created_at ? ` (${new Date(n.created_at).toLocaleDateString("pt-BR")})` : ""}`
  );
  sections.push([
    "",
    `## 10. NOTIFICAÇÕES (${d.notificationsCount ?? 0} total)`,
    notifLines.length ? notifLines.join("\n") : "  - Sem notificações.",
  ].join("\n"));

  // 12. Support Tickets
  const ticketLines = (d.supportTickets ?? []).map((t: any) =>
    `  - **${t.subject}** — status: ${safe(t.status)} | prioridade: ${safe(t.priority)}${t.created_at ? ` | ${new Date(t.created_at).toLocaleDateString("pt-BR")}` : ""}`
  );
  sections.push([
    "",
    `## 11. SUPORTE (${d.supportTicketsCount ?? 0} tickets)`,
    ticketLines.length ? ticketLines.join("\n") : "  - Sem tickets de suporte.",
  ].join("\n"));

  // 13. AI Keys & Integrations
  const keyLines = (d.userKeys ?? []).map((k: any) =>
    `  - **${k.provider}** — modelo: ${safe(k.preferred_model)} | ativa: ${k.is_active ? "sim" : "não"}`
  );
  sections.push([
    "",
    `## 12. INTEGRAÇÕES DE IA (${d.apiKeysCount ?? 0} chaves)`,
    keyLines.length ? keyLines.join("\n") : "  - Nenhuma chave de IA configurada.",
  ].join("\n"));

  // 14. Platform navigation guide
  sections.push([
    "",
    "## 13. NAVEGAÇÃO DA PLATAFORMA",
    "Você pode orientar o usuário sobre qualquer seção:",
    "- **/dashboard** — Visão geral: projetos, insights recentes, campanhas, scores por canal",
    "- **/projects** — CRUD de projetos, análise heurística de URL, análise por IA, dados estruturados, scores por canal",
    "- **/insights** — Insights estratégicos agrupados por projeto (warning/opportunity/improvement), enriquecimento por IA",
    "- **/benchmark** — Benchmark competitivo: SWOT, gap analysis, scores, enriquecimento por IA",
    "- **/audiences** — Públicos-alvo B2B com ICP, indústria, porte, keywords, enriquecimento por IA",
    "- **/operations** — Gestão de campanhas: CRUD, métricas, performance alerts, plano tático vs real",
    "- **/operations/live-dashboard** — LiveDashboard: métricas em tempo real, ROAS, CAC, LTV, pacing por canal",
    "- **/tactical** — Planos táticos: templates, playbooks, canais, cronograma",
    "- **/alertas** — Alertas estratégicos sobre investimentos e riscos",
    "- **/settings** — Perfil, empresa, API keys (Gemini/Claude), backups, exportação de dados",
    "- **/integracoes** — Integrações com Google Ads, Meta Ads, LinkedIn Ads",
    "- **/seo-geo** — Análise SEO geolocalizada",
    "- **/seo-monitoring** — Monitoramento SEO contínuo",
    "- **/reports** — Relatórios automatizados",
    "- **/support** — Tickets de suporte",
    "- **/help** — Central de ajuda, FAQs, artigos",
    "- **/apps** — App Store de integrações",
  ].join("\n"));

  return sections.join("\n");
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { messages, tenantContext } = (await req.json()) as RequestPayload;

    if (!tenantContext?.tenantId) {
      return new Response(JSON.stringify({ error: "tenantId é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Auth
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser?.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tenant
    const { data: tenant } = await supabaseAdmin
      .from('tenant_settings')
      .select('id, user_id, plan, company_name')
      .eq('id', tenantContext.tenantId)
      .eq('user_id', authUser.user.id)
      .maybeSingle();

    const resolvedTenant = tenant ?? {
      id: tenantContext.tenantId || authUser.user.id,
      user_id: authUser.user.id,
      plan: tenantContext.plan ?? 'starter',
    };

    const userId = authUser.user.id;
    const userName = authUser.user.user_metadata?.full_name
      || authUser.user.user_metadata?.name
      || authUser.user.email?.split("@")[0]
      || "usuário";

    // -----------------------------------------------------------------------
    // Fetch ALL platform data in parallel
    // -----------------------------------------------------------------------
    const q = supabaseAdmin; // shorthand

    const [
      // Counts (head-only)
      projectCountRes, insightsCountRes, benchmarksCountRes, audiencesCountRes,
      campaignsCountRes, channelScoresCountRes, notificationsCountRes, apiKeysCountRes,
      tacticalCountRes, supportCountRes,
      // Full data (limited for prompt size)
      projectsRes, insightsRes, benchmarksRes, audiencesRes,
      campaignsRes, channelScoresRes, notificationsRes, userKeysRes,
      metricsRes, budgetAllocationsRes, tacticalPlansRes, supportTicketsRes,
    ] = await Promise.all([
      // --- Counts ---
      q.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('insights').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('benchmarks').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('audiences').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('campaigns').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_deleted', false),
      q.from('project_channel_scores').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('user_api_keys').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('tactical_plans').select('id', { count: 'exact', head: true }).eq('user_id', userId),
      q.from('support_tickets').select('id', { count: 'exact', head: true }).eq('user_id', userId),

      // --- Full data ---
      q.from('projects').select('id, name, url, niche, status, score, updated_at').eq('user_id', userId).order('updated_at', { ascending: false }).limit(20),
      q.from('insights').select('id, type, title, description, project_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      q.from('v_benchmark_summary').select('id, competitor_name, competitor_url, overall_score, score_gap, project_id, project_name').eq('user_id', userId).order('created_at', { ascending: false }).limit(15),
      q.from('audiences').select('id, name, description, industry, company_size, location, keywords, project_id').eq('user_id', userId).order('created_at', { ascending: false }).limit(15),
      q.from('campaigns').select('id, name, channel, status, budget_total, budget_spent, start_date, end_date').eq('user_id', userId).eq('is_deleted', false).order('updated_at', { ascending: false }).limit(15),
      q.from('project_channel_scores').select('project_id, channel, score, objective, is_recommended, risks').eq('user_id', userId),
      q.from('notifications').select('id, title, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      q.from('user_api_keys').select('provider, api_key_encrypted, preferred_model, is_active').eq('user_id', userId),
      // Same source as LiveDashboard
      q.from('v_campaign_metrics_summary').select('campaign_id, campaign_name, channel, total_cost, total_impressions, total_clicks, total_conversions, total_leads, total_revenue, avg_ctr, avg_cpc, avg_cpa, calc_roas').eq('user_id', userId),
      q.from('budget_allocations').select('project_id, channel, month, year, planned_budget, actual_spent').eq('user_id', userId),
      q.from('tactical_plans').select('id, name, status, project_id').eq('user_id', userId).order('updated_at', { ascending: false }).limit(10),
      q.from('support_tickets').select('id, subject, status, priority, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    ]);

    // --- Extract data ---
    const projects: any[] = projectsRes.data ?? [];
    const insights: any[] = insightsRes.data ?? [];
    const benchmarks: any[] = benchmarksRes.data ?? [];
    const audiences: any[] = audiencesRes.data ?? [];
    const campaigns: any[] = campaignsRes.data ?? [];
    const channelScores: any[] = channelScoresRes.data ?? [];
    const notifications: any[] = notificationsRes.data ?? [];
    const userKeys: any[] = userKeysRes.data ?? [];
    const metricsData: any[] = metricsRes.data ?? [];
    const budgetAllocations: any[] = budgetAllocationsRes.data ?? [];
    const tacticalPlans: any[] = tacticalPlansRes.data ?? [];
    const supportTickets: any[] = supportTicketsRes.data ?? [];

    const projectsCount = projectCountRes.count ?? 0;
    const insightsCount = insightsCountRes.count ?? 0;
    const benchmarksCount = benchmarksCountRes.count ?? 0;
    const audiencesCount = audiencesCountRes.count ?? 0;
    const campaignsCount = campaignsCountRes.count ?? 0;
    const channelScoresCount = channelScoresCountRes.count ?? 0;
    const notificationsCount = notificationsCountRes.count ?? 0;
    const apiKeysCount = apiKeysCountRes.count ?? 0;
    const tacticalPlansCount = tacticalCountRes.count ?? 0;
    const supportTicketsCount = supportCountRes.count ?? 0;

    // --- Enrich with project names ---
    const projectMap: Record<string, string> = {};
    projects.forEach((p: any) => { projectMap[p.id] = p.name; });

    insights.forEach((i: any) => { i.project_name = projectMap[i.project_id] ?? null; });
    audiences.forEach((a: any) => { a.project_name = projectMap[a.project_id] ?? null; });
    tacticalPlans.forEach((tp: any) => { tp.project_name = projectMap[tp.project_id] ?? null; });

    // --- Metrics map (same as LiveDashboard) ---
    const metricsByCampaign: Record<string, any> = {};
    metricsData.forEach((m: any) => { metricsByCampaign[m.campaign_id] = m; });

    // --- Compute totals (same logic as LiveDashboard) ---
    let totalBudget = 0, totalMediaCost = 0, totalRevenue = 0;
    let totalConversions = 0, totalImpressions = 0, totalClicks = 0, totalLeads = 0;
    const spendByChannel: Record<string, { budget: number; cost: number }> = {};

    campaigns.forEach((c: any) => {
      const m = metricsByCampaign[c.id];
      const budget = c.budget_total ?? 0;
      const cost = m?.total_cost ?? 0;
      totalBudget += budget;
      totalMediaCost += cost;
      totalRevenue += m?.total_revenue ?? 0;
      totalConversions += m?.total_conversions ?? 0;
      totalImpressions += m?.total_impressions ?? 0;
      totalClicks += m?.total_clicks ?? 0;
      totalLeads += m?.total_leads ?? 0;
      const ch = c.channel ?? 'other';
      if (!spendByChannel[ch]) spendByChannel[ch] = { budget: 0, cost: 0 };
      spendByChannel[ch].budget += budget;
      spendByChannel[ch].cost += cost;
    });

    const totalRoas = totalMediaCost > 0 ? totalRevenue / totalMediaCost : 0;
    const totalCac = totalConversions > 0 ? totalMediaCost / totalConversions : 0;

    // --- Budget allocations (current month) ---
    const now = new Date();
    const curMonth = now.getMonth() + 1;
    const curYear = now.getFullYear();
    const curAllocations = budgetAllocations.filter((a: any) => a.month === curMonth && a.year === curYear);
    const budgetPlanned = curAllocations.reduce((s: number, a: any) => s + (a.planned_budget ?? 0), 0);
    const budgetActual = curAllocations.reduce((s: number, a: any) => s + (a.actual_spent ?? 0), 0);
    const budgetPacing = budgetPlanned > 0 ? (budgetActual / budgetPlanned) * 100 : 0;

    // Budget by channel (current month)
    const budgetByChannelMap: Record<string, { planned: number; actual: number }> = {};
    curAllocations.forEach((a: any) => {
      const ch = a.channel ?? 'other';
      if (!budgetByChannelMap[ch]) budgetByChannelMap[ch] = { planned: 0, actual: 0 };
      budgetByChannelMap[ch].planned += a.planned_budget ?? 0;
      budgetByChannelMap[ch].actual += a.actual_spent ?? 0;
    });
    const budgetByChannel = Object.entries(budgetByChannelMap).map(([channel, data]) => ({ channel, ...data }));

    // -----------------------------------------------------------------------
    // Build system prompt with ALL data
    // -----------------------------------------------------------------------
    const plan = tenantContext.plan ?? resolvedTenant.plan ?? "starter";
    const email = tenantContext.email ?? authUser.user.email ?? "";

    const systemPrompt = buildSystemPrompt({
      userName, email, plan,
      companyName: resolvedTenant.company_name,
      // Counts
      projectsCount, insightsCount, benchmarksCount, audiencesCount,
      campaignsCount, channelScoresCount, notificationsCount, apiKeysCount,
      tacticalPlansCount, supportTicketsCount,
      // Full data
      projects, insights, benchmarks, audiences, campaigns,
      channelScores, notifications, userKeys, tacticalPlans, supportTickets,
      // Computed metrics
      metricsByCampaign, spendByChannel,
      totalBudget, totalMediaCost, totalRevenue, totalConversions,
      totalImpressions, totalClicks, totalLeads, totalRoas, totalCac,
      budgetPlanned, budgetActual, budgetPacing, budgetByChannel,
    });

    // -----------------------------------------------------------------------
    // LLM call or fallback
    // -----------------------------------------------------------------------
    const userQuestion = messages.slice().reverse().find((m) => m.role === "user")?.content ?? "";
    const geminiKey = userKeys.find((k: any) => k.provider === 'google_gemini')?.api_key_encrypted;
    const model = userKeys.find((k: any) => k.provider === 'google_gemini')?.preferred_model || 'gemini-2.0-flash';

    let llmAnswer: string | null = null;

    if (geminiKey && userQuestion.trim()) {
      try {
        const contents: any[] = [];
        contents.push({
          role: "user",
          parts: [{ text: `[INSTRUÇÃO DO SISTEMA — NÃO REPITA ISSO AO USUÁRIO]\n\n${systemPrompt}` }],
        });
        contents.push({
          role: "model",
          parts: [{ text: "Entendido. Tenho o contexto completo da plataforma. Como posso ajudar?" }],
        });

        for (const msg of messages) {
          if (msg.role === "user") {
            contents.push({ role: "user", parts: [{ text: msg.content }] });
          } else if (msg.role === "assistant") {
            contents.push({ role: "model", parts: [{ text: msg.content }] });
          }
        }

        const llmResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents,
              generationConfig: { temperature: 0.7, topP: 0.9, maxOutputTokens: 2048 },
              safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              ],
            }),
          },
        );

        if (llmResp.ok) {
          const llmJson = await llmResp.json();
          llmAnswer = llmJson?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
        }
      } catch (_err) {
        llmAnswer = null;
      }
    }

    // Fallback: the system prompt itself is rich enough to serve as context
    const answer = llmAnswer || `Olá, **${userName}**! 👋\n\nAqui está o panorama completo da sua conta:\n\n` +
      `### Visão Geral\n` +
      `- **Plano:** ${plan}\n` +
      `- **Projetos:** ${projectsCount} | **Campanhas:** ${campaignsCount} | **Insights:** ${insightsCount}\n` +
      `- **Benchmarks:** ${benchmarksCount} | **Públicos-alvo:** ${audiencesCount} | **Planos táticos:** ${tacticalPlansCount}\n\n` +
      `### Performance\n` +
      `- **Budget total:** ${fmt(totalBudget)} | **Gasto real:** ${fmt(totalMediaCost)}\n` +
      `- **Receita:** ${fmt(totalRevenue)} | **ROAS:** ${totalRoas.toFixed(2)}x\n` +
      `- **Conversões:** ${totalConversions} | **CAC:** ${fmt(totalCac)}\n` +
      `- **Impressões:** ${fmtNum(totalImpressions)} | **Cliques:** ${fmtNum(totalClicks)} | **Leads:** ${totalLeads}\n` +
      (budgetPlanned > 0 ? `\n### Budget Mês Atual\n- Planejado: ${fmt(budgetPlanned)} | Gasto: ${fmt(budgetActual)} | Pacing: ${budgetPacing.toFixed(1)}%\n` : '') +
      (campaigns.length ? `\n### Campanhas\n${campaigns.slice(0, 5).map((c: any) => {
        const m = metricsByCampaign[c.id];
        return `- **${c.name}** (${c.channel}) — ${c.status}, budget: ${fmt(c.budget_total ?? 0)}, gasto: ${fmt(m?.total_cost ?? 0)}`;
      }).join('\n')}\n` : '') +
      (projects.length ? `\n### Projetos\n${projects.slice(0, 5).map((p: any) => `- **${p.name}** — ${safe(p.url)} | score: ${safe(p.score)}`).join('\n')}\n` : '') +
      `\nPergunte sobre qualquer seção para mais detalhes!`;

    const response = {
      user: { id: authUser.user.id, email },
      tenant: resolvedTenant,
      plan,
      messages,
      answer,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
