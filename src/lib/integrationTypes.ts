// =============================================================================
// Intentia Strategy Hub — Tipos para Integrações com APIs de Marketing
// =============================================================================

export type AdProvider = "google_ads" | "meta_ads" | "linkedin_ads" | "tiktok_ads";

export type IntegrationStatus = "connected" | "disconnected" | "error" | "expired" | "syncing";

export type SyncFrequency = "hourly" | "daily" | "weekly" | "manual";

export type SyncStatus = "pending" | "running" | "completed" | "failed" | "partial";

export type SyncType = "full" | "incremental" | "manual";

export interface ProjectMapping {
  project_id: string;
  project_name: string;
  ad_account_id?: string;
  ad_account_name?: string;
  campaign_ids?: string[];
  enabled: boolean;
}

export interface AdIntegration {
  id: string;
  user_id: string;
  provider: AdProvider;
  status: IntegrationStatus;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  account_id: string | null;
  account_name: string | null;
  account_currency: string;
  sync_enabled: boolean;
  sync_frequency: SyncFrequency;
  last_sync_at: string | null;
  next_sync_at: string | null;
  project_mappings: ProjectMapping[];
  scopes: string[];
  metadata: Record<string, unknown>;
  error_message: string | null;
  error_count: number;
  created_at: string;
  updated_at: string;
}

export interface IntegrationSyncLog {
  id: string;
  user_id: string;
  integration_id: string;
  provider: AdProvider;
  status: SyncStatus;
  sync_type: SyncType;
  started_at: string;
  completed_at: string | null;
  duration_ms: number | null;
  records_fetched: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  period_start: string | null;
  period_end: string | null;
  error_message: string | null;
  error_details: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface IntegrationSummary extends AdIntegration {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  total_records_fetched: number;
  last_sync_status: SyncStatus | null;
  last_sync_duration_ms: number | null;
}

// --- Configurações por Provider ---

export interface ProviderConfig {
  key: AdProvider;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  docsUrl: string;
  scopes: string[];
  features: string[];
  setupSteps: string[];
}

export const PROVIDER_CONFIGS: Record<AdProvider, ProviderConfig> = {
  google_ads: {
    key: "google_ads",
    name: "Google Ads",
    shortName: "Google",
    description: "Conecte sua conta Google Ads para importar campanhas, métricas de performance, keywords e dados de conversão automaticamente.",
    icon: "google",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800",
    gradientFrom: "from-blue-500",
    gradientTo: "to-blue-600",
    docsUrl: "https://developers.google.com/google-ads/api/docs/start",
    scopes: ["ads.readonly", "campaigns.readonly", "reports.readonly"],
    features: [
      "Importação de campanhas e grupos de anúncios",
      "Métricas de performance (impressões, cliques, conversões)",
      "Dados de keywords e Quality Score",
      "Relatórios de custo e ROAS",
      "Dados de Search Impression Share",
    ],
    setupSteps: [
      "Acesse o Google Ads Manager",
      "Gere um Developer Token na conta MCC",
      "Configure as credenciais OAuth 2.0",
      "Autorize o acesso à conta desejada",
    ],
  },
  meta_ads: {
    key: "meta_ads",
    name: "Meta Ads",
    shortName: "Meta",
    description: "Integre com Facebook e Instagram Ads para sincronizar campanhas, alcance, frequência e métricas de engajamento.",
    icon: "meta",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
    borderColor: "border-indigo-200 dark:border-indigo-800",
    gradientFrom: "from-indigo-500",
    gradientTo: "to-purple-600",
    docsUrl: "https://developers.facebook.com/docs/marketing-apis",
    scopes: ["ads_read", "ads_management", "read_insights"],
    features: [
      "Importação de campanhas Facebook e Instagram",
      "Métricas de alcance e frequência",
      "Dados de engajamento e conversão",
      "Relatórios de custo por resultado",
      "Segmentação de audiência",
    ],
    setupSteps: [
      "Acesse o Meta Business Suite",
      "Crie um App no Meta for Developers",
      "Configure as permissões de Marketing API",
      "Autorize o acesso ao Ad Account",
    ],
  },
  linkedin_ads: {
    key: "linkedin_ads",
    name: "LinkedIn Ads",
    shortName: "LinkedIn",
    description: "Conecte o LinkedIn Campaign Manager para importar campanhas B2B, leads, CPL e métricas de engagement profissional.",
    icon: "linkedin",
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/40",
    borderColor: "border-sky-200 dark:border-sky-800",
    gradientFrom: "from-sky-500",
    gradientTo: "to-sky-600",
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/",
    scopes: ["r_ads", "r_ads_reporting", "r_organization_social"],
    features: [
      "Importação de campanhas Sponsored Content e InMail",
      "Métricas de leads e CPL",
      "Dados de engagement rate",
      "Relatórios de performance B2B",
      "Dados de audiência profissional",
    ],
    setupSteps: [
      "Acesse o LinkedIn Campaign Manager",
      "Crie um App no LinkedIn Developers",
      "Solicite acesso ao Marketing API",
      "Autorize o acesso à conta de anúncios",
    ],
  },
  tiktok_ads: {
    key: "tiktok_ads",
    name: "TikTok Ads",
    shortName: "TikTok",
    description: "Integre com o TikTok Ads Manager para sincronizar campanhas de vídeo, views, VTR e métricas de engajamento.",
    icon: "tiktok",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/40",
    borderColor: "border-pink-200 dark:border-pink-800",
    gradientFrom: "from-pink-500",
    gradientTo: "to-rose-600",
    docsUrl: "https://business-api.tiktok.com/portal/docs",
    scopes: ["ad.read", "campaign.read", "report.read"],
    features: [
      "Importação de campanhas de vídeo",
      "Métricas de video views e VTR",
      "Dados de engajamento e conversão",
      "Relatórios de custo por view",
      "Dados de audiência e alcance",
    ],
    setupSteps: [
      "Acesse o TikTok Business Center",
      "Crie um App no TikTok for Developers",
      "Configure as permissões de Marketing API",
      "Autorize o acesso ao Ad Account",
    ],
  },
};

export const INTEGRATION_STATUS_CONFIG: Record<IntegrationStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}> = {
  connected: {
    label: "Conectado",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/40",
    borderColor: "border-green-200 dark:border-green-800",
    dotColor: "bg-green-500",
  },
  disconnected: {
    label: "Desconectado",
    color: "text-gray-500 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800/40",
    borderColor: "border-gray-200 dark:border-gray-700",
    dotColor: "bg-gray-400",
  },
  error: {
    label: "Erro",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/40",
    borderColor: "border-red-200 dark:border-red-800",
    dotColor: "bg-red-500",
  },
  expired: {
    label: "Expirado",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800",
    dotColor: "bg-amber-500",
  },
  syncing: {
    label: "Sincronizando",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800",
    dotColor: "bg-blue-500 animate-pulse",
  },
};

export const SYNC_FREQUENCY_CONFIG: Record<SyncFrequency, { label: string; description: string }> = {
  hourly: { label: "A cada hora", description: "Sincroniza dados a cada 60 minutos" },
  daily: { label: "Diário", description: "Sincroniza dados uma vez por dia" },
  weekly: { label: "Semanal", description: "Sincroniza dados uma vez por semana" },
  manual: { label: "Manual", description: "Sincroniza apenas quando solicitado" },
};

export const SYNC_STATUS_CONFIG: Record<SyncStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pendente", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-800" },
  running: { label: "Executando", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900" },
  completed: { label: "Concluído", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900" },
  failed: { label: "Falhou", color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900" },
  partial: { label: "Parcial", color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-900" },
};

export function formatSyncDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

export function formatLastSync(dateStr: string | null): string {
  if (!dateStr) return "Nunca sincronizado";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora mesmo";
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  if (diffDays < 7) return `Há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}
