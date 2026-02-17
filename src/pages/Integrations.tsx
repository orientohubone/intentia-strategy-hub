import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { FeatureGate } from "@/components/FeatureGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Plug,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Wifi,
  WifiOff,
  Settings2,
  History,
  Trash2,
  Info,
  Zap,
  ArrowRight,
  Lock,
} from "lucide-react";
import {
  type AdProvider,
  type AdIntegration,
  type IntegrationStatus,
  type SyncFrequency,
  type IntegrationSyncLog,
  PROVIDER_CONFIGS,
  INTEGRATION_STATUS_CONFIG,
  SYNC_FREQUENCY_CONFIG,
  SYNC_STATUS_CONFIG,
  formatSyncDuration,
  formatLastSync,
} from "@/lib/integrationTypes";
import { getOAuthConnectUrl } from "@/lib/integrationOAuth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vofizgftwxgyosjrwcqy.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const PROVIDER_ORDER: AdProvider[] = ["google_ads", "meta_ads", "linkedin_ads", "tiktok_ads"];

// --- SVG Icons reais dos providers ---
function GoogleAdsIcon({ className }: { className?: string }) {
  return (
    <img src="/google-ads.svg" alt="Google Ads" className={className} />
  );
}

function MetaAdsIcon({ className }: { className?: string }) {
  return (
    <img src="/meta-ads.svg" alt="Meta Ads" className={className} />
  );
}

function LinkedInAdsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0A66C2"/>
    </svg>
  );
}

function TikTokAdsIcon({ className }: { className?: string }) {
  return (
    <img src="/tiktok-ads.svg" alt="TikTok Ads" className={`${className} dark:brightness-0 dark:invert`} />
  );
}

function ProviderSvgIcon({ provider, className }: { provider: AdProvider; className?: string }) {
  switch (provider) {
    case "google_ads": return <GoogleAdsIcon className={className} />;
    case "meta_ads": return <MetaAdsIcon className={className} />;
    case "linkedin_ads": return <LinkedInAdsIcon className={className} />;
    case "tiktok_ads": return <TikTokAdsIcon className={className} />;
  }
}

function StatusIndicator({ status }: { status: IntegrationStatus }) {
  const config = INTEGRATION_STATUS_CONFIG[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${config.dotColor}`} />
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}

export default function Integrations() {
  const { user } = useAuth();
  const { isFeatureAvailable } = useFeatureFlags();
  const [integrations, setIntegrations] = useState<AdIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<AdProvider | null>(null);
  const [syncingProvider, setSyncingProvider] = useState<AdProvider | null>(null);
  const [detailProvider, setDetailProvider] = useState<AdProvider | null>(null);
  const [logsDialog, setLogsDialog] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [dialogLogs, setDialogLogs] = useState<IntegrationSyncLog[]>([]);

  useEffect(() => {
    if (user) loadIntegrations();
  }, [user]);

  const loadIntegrations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("ad_integrations")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (err) {
      console.error("Error loading integrations:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIntegration = (provider: AdProvider): AdIntegration | undefined => {
    return integrations.find((i) => i.provider === provider);
  };

  const handleConnect = async (provider: AdProvider) => {
    if (!user) return;
    setConnectingProvider(provider);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Sessão expirada. Faça login novamente.");
        setConnectingProvider(null);
        return;
      }

      // Call oauth-connect Edge Function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/oauth-connect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Erro na Edge Function (${response.status})`);
      }

      if (!data?.url) {
        throw new Error(data?.error || "URL de autorização não retornada");
      }

      // Redirect to provider's OAuth page
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Error connecting:", err);
      toast.error(`Erro ao conectar ${PROVIDER_CONFIGS[provider].name}: ${err.message}`);
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: AdProvider) => {
    const integration = getIntegration(provider);
    if (!integration) return;

    try {
      const { error } = await (supabase as any)
        .from("ad_integrations")
        .update({
          status: "disconnected",
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          sync_enabled: false,
          account_id: null,
          account_name: null,
          error_message: null,
          error_count: 0,
        })
        .eq("id", integration.id);

      if (error) throw error;
      toast.success(`${PROVIDER_CONFIGS[provider].name} desconectado.`);
      setDetailProvider(null);
      await loadIntegrations();
    } catch (err: any) {
      toast.error(`Erro ao desconectar: ${err.message}`);
    }
  };

  const handleSync = async (provider: AdProvider) => {
    const integration = getIntegration(provider);
    if (!integration || integration.status !== "connected") return;

    setSyncingProvider(provider);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/integration-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          provider,
          integration_id: integration.id,
        }),
      });

      let result: any;
      try {
        result = await response.json();
      } catch {
        throw new Error(`Erro do servidor (${response.status})`);
      }

      if (!response.ok) {
        const errMsg = typeof result?.error === "string" ? result.error : "Falha na sincronização";
        throw new Error(errMsg.length > 150 ? errMsg.substring(0, 150) + "..." : errMsg);
      }

      const msg = `Sincronização concluída: ${result.records_fetched || 0} registros importados`;
      toast.success(msg);
      await loadIntegrations();
    } catch (err: any) {
      const cleanMsg = (err.message || "Erro desconhecido").substring(0, 150);
      toast.error(`Erro na sincronização: ${cleanMsg}`);
    } finally {
      setSyncingProvider(null);
    }
  };

  const handleUpdateFrequency = async (provider: AdProvider, frequency: SyncFrequency) => {
    const integration = getIntegration(provider);
    if (!integration) return;

    try {
      const { error } = await (supabase as any)
        .from("ad_integrations")
        .update({ sync_frequency: frequency })
        .eq("id", integration.id);

      if (error) throw error;
      toast.success("Frequência de sincronização atualizada.");
      await loadIntegrations();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  const handleDeleteIntegration = async (provider: AdProvider) => {
    const integration = getIntegration(provider);
    if (!integration) return;

    try {
      const { error } = await (supabase as any)
        .from("ad_integrations")
        .delete()
        .eq("id", integration.id);

      if (error) throw error;
      toast.success(`Integração ${PROVIDER_CONFIGS[provider].name} removida.`);
      setDetailProvider(null);
      await loadIntegrations();
    } catch (err: any) {
      toast.error(`Erro ao remover: ${err.message}`);
    }
  };

  const loadSyncLogs = async (integrationId: string) => {
    setLogsLoading(true);
    setLogsDialog(integrationId);
    try {
      const { data, error } = await (supabase as any)
        .from("integration_sync_logs")
        .select("*")
        .eq("integration_id", integrationId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setDialogLogs(data || []);
    } catch (err) {
      console.error("Error loading sync logs:", err);
      setDialogLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const connectedCount = integrations.filter((i) => i.status === "connected").length;
  const detailConfig = detailProvider ? PROVIDER_CONFIGS[detailProvider] : null;
  const detailIntegration = detailProvider ? getIntegration(detailProvider) : null;
  const detailIsConnected = detailIntegration?.status === "connected";

  return (
    <FeatureGate featureKey="meta_ads_integration" withLayout={false} pageTitle="Integrações">
      <DashboardLayout>
        <SEO title="Integrações" path="/integracoes" noindex />

        <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plug className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Integrações</h1>
              <p className="text-sm text-muted-foreground">
                Conecte suas contas de mídia para importar dados automaticamente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5">
              <Wifi className="h-3 w-3" />
              {connectedCount} conectada{connectedCount !== 1 ? "s" : ""}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={loadIntegrations}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl border border-primary/20 bg-primary/5">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-medium mb-1">Conecte suas contas de anúncios</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Vincule suas contas de mídia para importar campanhas, métricas e dados de performance automaticamente.
              Seus tokens são armazenados de forma segura e isolados por conta.
            </p>
          </div>
        </div>

        {/* Provider Cards — Grid 2x2 */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROVIDER_ORDER.map((provider) => {
              const config = PROVIDER_CONFIGS[provider];
              const integration = getIntegration(provider);
              const isConnected = integration?.status === "connected";
              const isError = integration?.status === "error";
              const isExpired = integration?.status === "expired";
              const isSyncing = syncingProvider === provider;
              const isConnecting = connectingProvider === provider;

              return (
                <div
                  key={provider}
                  className={`group relative rounded-2xl border-2 p-5 sm:p-6 transition-all duration-200 ${
                    isConnected
                      ? "border-green-300 dark:border-green-800 bg-gradient-to-br from-green-50/30 to-background dark:from-green-950/10 dark:to-background"
                      : isError || isExpired
                      ? "border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50/30 to-background dark:from-red-950/10 dark:to-background"
                      : "border-border hover:border-primary/40 bg-gradient-to-br from-muted/30 to-background hover:shadow-md"
                  }`}
                >
                  {/* Top row: Icon + Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white dark:bg-gray-900 border border-border/50 shadow-sm flex items-center justify-center p-2.5 sm:p-3">
                      <ProviderSvgIcon provider={provider} className="w-full h-full" />
                    </div>
                    <StatusIndicator status={integration?.status || "disconnected"} />
                  </div>

                  {/* Name + Description */}
                  <h3 className="font-semibold text-base sm:text-lg mb-1">{config.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem]">
                    {config.description}
                  </p>

                  {/* Connected state */}
                  {isConnected && integration && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <div className="text-xs min-w-0">
                          <p className="font-medium text-green-700 dark:text-green-300 truncate">
                            {integration.account_name || integration.account_id || "Conta conectada"}
                          </p>
                          {integration.last_sync_at && (
                            <p className="text-green-600 dark:text-green-400">
                              Última sync: {formatLastSync(integration.last_sync_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 text-xs h-8"
                          onClick={() => handleSync(provider)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          {isSyncing ? "Sincronizando..." : "Sincronizar"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5 text-xs h-8"
                          onClick={() => {
                            if (integration?.id) loadSyncLogs(integration.id);
                          }}
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-8 w-8 p-0">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Desconectar {config.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Isso removerá o acesso à conta de anúncios. Dados já importados serão mantidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDisconnect(provider)}
                              >
                                Desconectar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  )}

                  {/* Error / Expired state */}
                  {(isError || isExpired) && integration && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <div className="text-xs">
                          <p className="font-medium text-red-700 dark:text-red-300">
                            {isExpired ? "Token expirado" : "Erro na conexão"}
                          </p>
                          <p className="text-red-600 dark:text-red-400 line-clamp-1">
                            {integration.error_message || "Reconecte para restaurar o acesso."}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 text-xs h-8"
                        onClick={() => handleConnect(provider)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                        Reconectar
                      </Button>
                    </div>
                  )}

                  {/* Disconnected state — Connect button */}
                  {!isConnected && !isError && !isExpired && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 mb-4 h-9"
                      onClick={() => handleConnect(provider)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4" />
                      )}
                      {isConnecting ? "Conectando..." : "Conectar"}
                    </Button>
                  )}

                  {/* Features preview */}
                  <div className="flex flex-wrap gap-1">
                    {config.features.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                        {f.length > 30 ? f.slice(0, 28) + "..." : f}
                      </span>
                    ))}
                    {config.features.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                        +{config.features.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How it works section */}
        <div className="rounded-2xl border bg-card p-4 sm:p-6">
          <h2 className="font-semibold text-base sm:text-lg mb-4 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
            Como configurar
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "1", title: "Conectar", desc: "Clique no card da plataforma desejada e autorize o acesso via OAuth." },
              { step: "2", title: "Configurar", desc: "Defina a frequência de sincronização e mapeie contas aos projetos." },
              { step: "3", title: "Sincronizar", desc: "Os dados são importados automaticamente conforme a frequência definida." },
              { step: "4", title: "Analisar", desc: "Métricas alimentam Operações, Budget, Alertas e Benchmark automaticamente." },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{item.step}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail / Config Dialog */}
      <Dialog open={!!detailProvider} onOpenChange={(open) => !open && setDetailProvider(null)}>
        {detailProvider && (() => {
          const config = PROVIDER_CONFIGS[detailProvider];
          const integration = getIntegration(detailProvider);
          return (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ProviderSvgIcon provider={detailProvider} className="h-5 w-5" />
                  {config.name}
                </DialogTitle>
                <DialogDescription>
                  Detalhes e configuração da integração
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {integration && (
                  <>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <StatusIndicator status={integration.status} />
                      </div>
                      {integration.account_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Conta</span>
                          <span className="font-medium truncate ml-4">{integration.account_name}</span>
                        </div>
                      )}
                      {integration.account_id && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID</span>
                          <span className="font-mono text-xs">{integration.account_id}</span>
                        </div>
                      )}
                      {integration.last_sync_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Última sync</span>
                          <span>{formatLastSync(integration.last_sync_at)}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setDetailProvider(null)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          );
        })()}
      </Dialog>

      {/* Sync Logs Dialog */}
      <Dialog open={!!logsDialog} onOpenChange={() => setLogsDialog(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Sincronização
            </DialogTitle>
            <DialogDescription>
              Últimas 20 sincronizações realizadas
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {logsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : dialogLogs.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Nenhum registro de sincronização encontrado.
              </div>
            ) : (
              dialogLogs.map((log) => {
                const statusCfg = SYNC_STATUS_CONFIG[log.status];
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                  >
                    <div className="mt-0.5">
                      {log.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : log.status === "failed" ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs ${statusCfg.bgColor} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.sync_type === "manual" ? "Manual" : log.sync_type === "full" ? "Completo" : "Incremental"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatSyncDuration(log.duration_ms)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{log.records_fetched} registros</span>
                        {log.records_created > 0 && <span>+{log.records_created} novos</span>}
                        {log.records_updated > 0 && <span>{log.records_updated} atualizados</span>}
                      </div>
                      {log.error_message && (
                        <p className="text-xs text-red-500 mt-1 line-clamp-2">{log.error_message}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLogsDialog(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </DashboardLayout>
    </FeatureGate>
  );
}
