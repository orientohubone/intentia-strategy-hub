// Edge Function: assistant-ia
// Objetivo: receber mensagens da Tia com tenantContext, validar RLS via token do usuário
// e retornar payload pronto para chamar provedor de IA (a chamada externa ainda não está incluída).

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

serve(async (req) => {
  // CORS preflight
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

    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser?.user) {
      return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar tenant do usuário (fallback para id do usuário caso não exista tenantSettings registrado)
    const { data: tenant, error: tenantError } = await supabaseAdmin
      .from('tenant_settings')
      .select('id, user_id, plan')
      .eq('id', tenantContext.tenantId)
      .eq('user_id', authUser.user.id)
      .maybeSingle();

    const resolvedTenant = tenant ?? {
      id: tenantContext.tenantId || authUser.user.id,
      user_id: authUser.user.id,
      plan: tenantContext.plan ?? 'starter',
    };

    if (tenantError && !tenant) {
      // fallback already handled; no log
    }

    // Aqui você pode chamar o provedor de IA com mensagens + contexto.
    // Devolvemos um payload pronto para o front ou para a chamada externa.
    const userQuestion = messages.slice().reverse().find((m) => m.role === "user")?.content ?? "";

    // Contagens básicas do tenant
    const lcQuestion = userQuestion.toLowerCase();
    const projectCountPromise = supabaseAdmin
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id);
    const insightsCountPromise = supabaseAdmin
      .from('insights')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id);
    const benchmarksCountPromise = supabaseAdmin
      .from('benchmarks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id);
    const audiencesCountPromise = supabaseAdmin
      .from('audiences')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id);
    const campaignsCountPromise = supabaseAdmin
      .from('campaigns')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id)
      .eq('is_deleted', false);
    const channelScoresCountPromise = supabaseAdmin
      .from('project_channel_scores')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id);
    const notificationsCountPromise = supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id);
    const apiKeysCountPromise = supabaseAdmin
      .from('user_api_keys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authUser.user.id);

    const [
      projectCountRes,
      insightsCountRes,
      benchmarksCountRes,
      audiencesCountRes,
      channelScoresCountRes,
      notificationsCountRes,
      apiKeysCountRes,
      campaignsCountRes,
    ] = await Promise.all([
      projectCountPromise,
      insightsCountPromise,
      benchmarksCountPromise,
      audiencesCountPromise,
      channelScoresCountPromise,
      notificationsCountPromise,
      apiKeysCountPromise,
      campaignsCountPromise,
    ]);

    const { data: spendGoogleRows } = await supabaseAdmin
      .from('v_campaign_summary')
      .select('total_cost')
      .eq('user_id', authUser.user.id)
      .eq('channel', 'google');

    const { data: spendAllRows } = await supabaseAdmin
      .from('v_campaign_summary')
      .select('total_cost')
      .eq('user_id', authUser.user.id);

    const { data: userKeys } = await supabaseAdmin
      .from('user_api_keys')
      .select('provider, api_key_encrypted, preferred_model, is_active')
      .eq('user_id', authUser.user.id)
      .eq('is_active', true);

    const { data: latestNotifications } = await supabaseAdmin
      .from('notifications')
      .select('id, title, created_at')
      .eq('user_id', authUser.user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: latestInsights } = await supabaseAdmin
      .from('insights')
      .select('id, title, project_id, created_at')
      .eq('user_id', authUser.user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: projectDetail } = await supabaseAdmin
      .from('projects')
      .select('id, name, url, status, score, updated_at')
      .eq('user_id', authUser.user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const projectsCount = projectCountRes.count ?? 0;
    const insightsCount = insightsCountRes.count ?? 0;
    const benchmarksCount = benchmarksCountRes.count ?? 0;
    const audiencesCount = audiencesCountRes.count ?? 0;
    const campaignsCount = campaignsCountRes.count ?? 0;
    const channelScoresCount = channelScoresCountRes.count ?? 0;
    const notificationsCount = notificationsCountRes.count ?? 0;
    const apiKeysCount = apiKeysCountRes.count ?? 0;
    const totalSpentGoogle = (spendGoogleRows ?? []).reduce(
      (acc: number, row: { total_cost?: number }) => acc + (row.total_cost ?? 0),
      0,
    );
    const totalSpentAll = (spendAllRows ?? []).reduce(
      (acc: number, row: { total_cost?: number }) => acc + (row.total_cost ?? 0),
      0,
    );

    const contextSummary =
      `Contexto do tenant ${resolvedTenant.id} (plano ${tenantContext.plan ?? resolvedTenant.plan}). ` +
      `Projetos: ${projectsCount}, Insights: ${insightsCount}, Benchmarks: ${benchmarksCount}, Públicos: ${audiencesCount}, ` +
      `Campanhas: ${campaignsCount}, Canais (scores): ${channelScoresCount}, Notificações: ${notificationsCount}, API keys: ${apiKeysCount}.`;

    const answerPieces: string[] = [];

    // Intro contextual
    if (userQuestion.trim()) {
      answerPieces.push(`Considerei sua pergunta: “${userQuestion}”.`);
    } else {
      answerPieces.push(`Aqui está um resumo rápido do seu tenant.`);
    }

    // Visão geral sempre presente
    answerPieces.push(contextSummary);

    // Gastos
    if (lcQuestion.includes("gastei") || lcQuestion.includes("gasto") || lcQuestion.includes("custo")) {
      if (lcQuestion.includes("google")) {
        answerPieces.push(`Gasto em Google até agora: R$ ${totalSpentGoogle.toFixed(2)}.`);
      } else {
        answerPieces.push(`Gasto total em campanhas (todos os canais): R$ ${totalSpentAll.toFixed(2)}.`);
      }
    }

    // Campanhas e canais
    answerPieces.push(`Campanhas cadastradas/ativas: ${campaignsCount}.`);
    answerPieces.push(`Canais com score registrados: ${channelScoresCount}.`);

    // Insights e análises
    const latestInsightTitles = (latestInsights ?? []).map((i: { title?: string }) => i.title).filter(Boolean);
    if (latestInsightTitles.length) {
      answerPieces.push(`Últimas análises/insights: ${latestInsightTitles.join(' | ')}.`);
    }
    answerPieces.push(`Total de insights: ${insightsCount}.`);

    // Notificações / alertas
    const latestNotifTitles = (latestNotifications ?? []).map((n: { title?: string }) => n.title).filter(Boolean);
    if (latestNotifTitles.length) {
      answerPieces.push(`Alertas/Notificações recentes: ${latestNotifTitles.join(' | ')}.`);
    }
    answerPieces.push(`Total de notificações: ${notificationsCount}.`);

    // Projetos, públicos, benchmarks
    answerPieces.push(`Projetos: ${projectsCount}.`);
    answerPieces.push(`Públicos: ${audiencesCount}.`);
    answerPieces.push(`Benchmarks: ${benchmarksCount}.`);

    // Plano
    answerPieces.push(`Plano atual: ${tenantContext.plan ?? resolvedTenant.plan}.`);

    // API keys
    answerPieces.push(`Chaves de IA configuradas: ${apiKeysCount}.`);

    // Detalhe de projeto (opcional)
    if (projectDetail) {
      const scoreText = typeof projectDetail.score === 'number' ? `Score: ${projectDetail.score}. ` : '';
      answerPieces.push(`Projeto mais recente: ${projectDetail.name ?? 'sem nome'} (${projectDetail.url ?? 'sem URL'}). Status: ${projectDetail.status ?? 'sem status'}. ${scoreText}`);
    }

    const fallbackAnswer = answerPieces.join(' ');

    // Chamada opcional a LLM (Gemini) com a key do usuário
    let llmAnswer: string | null = null;
    const geminiKey = userKeys?.find((k) => k.provider === 'google_gemini')?.api_key_encrypted;
    const model = (userKeys?.find((k) => k.provider === 'google_gemini')?.preferred_model) || 'gemini-1.5-flash';

    if (geminiKey && userQuestion.trim()) {
      try {
        const prompt = [
          'Você é a Tia, assistente da Intentia. Use apenas dados deste tenant.',
          `Pergunta: ${userQuestion}`,
          'Contexto numérico:',
          `Projetos: ${projectsCount}, Insights: ${insightsCount}, Benchmarks: ${benchmarksCount}, Públicos: ${audiencesCount}, Campanhas: ${campaignsCount}, Canais: ${channelScoresCount}, Notificações: ${notificationsCount}, API keys: ${apiKeysCount}.`,
          projectDetail
            ? `Projeto mais recente: ${projectDetail.name ?? 'sem nome'} (${projectDetail.url ?? 'sem URL'}), status ${projectDetail.status ?? 'sem status'}, score ${typeof projectDetail.score === 'number' ? projectDetail.score : 'n/d'}.`
            : 'Nenhum projeto recente encontrado.',
          latestInsightTitles?.length
            ? `Últimas análises: ${latestInsightTitles.join(' | ')}.`
            : 'Sem análises recentes.',
          latestNotifTitles?.length
            ? `Últimas notificações: ${latestNotifTitles.join(' | ')}.`
            : 'Sem notificações recentes.',
          'Responda de forma direta, em português, sem pedir mais contexto, sem inventar dados.',
        ].join('\n');

        const llmResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: prompt },
                  ],
                },
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

    const answer = llmAnswer || fallbackAnswer;

    const response = {
      user: { id: authUser.user.id, email: tenantContext.email ?? authUser.user.email },
      tenant: resolvedTenant,
      plan: tenantContext.plan ?? resolvedTenant.plan,
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
