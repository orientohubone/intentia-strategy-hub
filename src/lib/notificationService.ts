import { supabase } from "@/integrations/supabase/client";

// =====================================================
// NOTIFICATION SERVICE — Centralizado
// =====================================================

interface NotificationPayload {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  action_url?: string;
  action_text?: string;
}

/**
 * Cria uma notificação para o usuário.
 * Deduplica por título + mensagem nas últimas 2 horas.
 */
export async function createNotification(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    // Dedup: evitar notificações duplicadas nas últimas 2h
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await (supabase as any)
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("title", payload.title)
      .eq("message", payload.message)
      .gte("created_at", twoHoursAgo)
      .limit(1);

    if (existing && existing.length > 0) return;

    await (supabase as any).from("notifications").insert({
      user_id: userId,
      ...payload,
      read: false,
    });
  } catch (error) {
    console.error("[notification-service] Error:", error);
  }
}

// =====================================================
// PROJETOS
// =====================================================

export function notifyProjectCreated(userId: string, projectName: string) {
  return createNotification(userId, {
    title: "Projeto Criado",
    message: `O projeto "${projectName}" foi criado com sucesso.`,
    type: "success",
    action_url: "/projects",
    action_text: "Ver Projeto",
  });
}

export function notifyProjectDeleted(userId: string, projectName: string) {
  return createNotification(userId, {
    title: "Projeto Excluído",
    message: `O projeto "${projectName}" foi removido.`,
    type: "info",
    action_url: "/projects",
    action_text: "Ver Projetos",
  });
}

// =====================================================
// CAMPANHAS (OPERAÇÕES)
// =====================================================

export function notifyCampaignCreated(userId: string, campaignName: string, channel: string) {
  return createNotification(userId, {
    title: "Campanha Criada",
    message: `Campanha "${campaignName}" (${channel}) criada com sucesso.`,
    type: "success",
    action_url: "/operations",
    action_text: "Ver Campanha",
  });
}

export function notifyCampaignStatusChanged(userId: string, campaignName: string, newStatus: string) {
  return createNotification(userId, {
    title: "Status de Campanha Alterado",
    message: `Campanha "${campaignName}" alterada para ${newStatus}.`,
    type: "info",
    action_url: "/operations",
    action_text: "Ver Campanha",
  });
}

export function notifyCampaignDeleted(userId: string, campaignName: string) {
  return createNotification(userId, {
    title: "Campanha Excluída",
    message: `A campanha "${campaignName}" foi removida.`,
    type: "info",
    action_url: "/operations",
    action_text: "Ver Operações",
  });
}

// =====================================================
// PLANO TÁTICO
// =====================================================

export function notifyTacticalPlanCreated(userId: string, projectName: string, fromTemplate?: boolean) {
  return createNotification(userId, {
    title: "Plano Tático Criado",
    message: fromTemplate
      ? `Plano tático para "${projectName}" criado a partir de template.`
      : `Plano tático para "${projectName}" criado com sucesso.`,
    type: "success",
    action_url: "/tactical",
    action_text: "Ver Plano",
  });
}

export function notifyPlaybookGenerated(userId: string, projectName: string) {
  return createNotification(userId, {
    title: "Playbook de Execução Gerado",
    message: `Diretrizes de execução para "${projectName}" foram geradas com sucesso.`,
    type: "success",
    action_url: "/tactical",
    action_text: "Ver Playbook",
  });
}

// =====================================================
// PÚBLICOS-ALVO
// =====================================================

export function notifyAudienceCreated(userId: string, audienceName: string) {
  return createNotification(userId, {
    title: "Público-Alvo Criado",
    message: `O público-alvo "${audienceName}" foi criado com sucesso.`,
    type: "success",
    action_url: "/audiences",
    action_text: "Ver Público",
  });
}

export function notifyIcpEnriched(userId: string, audienceName: string) {
  return createNotification(userId, {
    title: "ICP Refinado com IA",
    message: `O perfil de cliente ideal para "${audienceName}" foi enriquecido com IA.`,
    type: "success",
    action_url: "/audiences",
    action_text: "Ver Resultado",
  });
}

// =====================================================
// BENCHMARK
// =====================================================

export function notifyBenchmarkCreated(userId: string, competitorName: string) {
  return createNotification(userId, {
    title: "Benchmark Criado",
    message: `Análise competitiva de "${competitorName}" criada com sucesso.`,
    type: "success",
    action_url: "/benchmark",
    action_text: "Ver Benchmark",
  });
}

// =====================================================
// SUPORTE
// =====================================================

export function notifyTicketCreated(userId: string, ticketNumber: string, subject: string) {
  return createNotification(userId, {
    title: "Chamado de Suporte Aberto",
    message: `Chamado #${ticketNumber} "${subject}" registrado. Nossa equipe irá analisar em breve.`,
    type: "info",
    action_url: "/support",
    action_text: "Ver Chamado",
  });
}

export function notifyTicketResponse(userId: string, ticketNumber: string) {
  return createNotification(userId, {
    title: "Nova Resposta no Chamado",
    message: `O suporte respondeu ao chamado #${ticketNumber}. Confira a atualização.`,
    type: "info",
    action_url: "/support",
    action_text: "Ver Resposta",
  });
}

// =====================================================
// BUDGET
// =====================================================

export function notifyBudgetAllocated(userId: string, channel: string, projectName: string) {
  return createNotification(userId, {
    title: "Budget Alocado",
    message: `Budget para ${channel} no projeto "${projectName}" foi configurado.`,
    type: "success",
    action_url: "/operations",
    action_text: "Ver Budget",
  });
}

// =====================================================
// ANÁLISE POR IA
// =====================================================

export function notifyAiAnalysisCompleted(userId: string, projectName: string, projectId: string, readinessScore: number) {
  return createNotification(userId, {
    title: "Análise por IA Concluída",
    message: `Análise por IA de "${projectName}" concluída. Prontidão para investimento: ${readinessScore}/100.`,
    type: "success",
    action_url: `/projects#project-${projectId}`,
    action_text: "Ver Análise",
  });
}

export function notifyPerformanceAnalysisCompleted(userId: string, campaignName: string, healthScore: number) {
  return createNotification(userId, {
    title: "Análise de Performance Concluída",
    message: `Análise por IA da campanha "${campaignName}" concluída. Saúde: ${healthScore}/100.`,
    type: "success",
    action_url: "/operations",
    action_text: "Ver Análise",
  });
}

// =====================================================
// CONFIGURAÇÕES
// =====================================================

export function notifyApiKeyConfigured(userId: string, provider: string) {
  const providerLabel = provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude";
  return createNotification(userId, {
    title: "API Key Configurada",
    message: `Chave de API do ${providerLabel} configurada e validada com sucesso.`,
    type: "success",
    action_url: "/settings",
    action_text: "Ver Configurações",
  });
}

export function notifyBackupCreated(userId: string) {
  return createNotification(userId, {
    title: "Backup Realizado",
    message: "Backup dos seus dados foi criado com sucesso.",
    type: "success",
    action_url: "/settings",
    action_text: "Ver Backups",
  });
}
