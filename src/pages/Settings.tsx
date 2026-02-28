import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { notifyApiKeyConfigured, notifyBackupCreated } from "@/lib/notificationService";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Building, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Database,
  CreditCard,
  Download,
  Trash2,
  LogOut,
  Save,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Sparkles,
  Loader2,
  Crown,
  ArrowRight,
  Zap,
  HardDrive,
  Clock,
  FileJson,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ApiKeyProvider = "google_gemini" | "anthropic_claude";

interface ApiKeyEntry {
  id?: string;
  provider: ApiKeyProvider;
  api_key_encrypted: string;
  preferred_model: string;
  is_active: boolean;
  last_validated_at: string | null;
}

import { GEMINI_MODELS, CLAUDE_MODELS } from "@/lib/aiModels";

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
}

type PlanFeature = { name: string; limit?: string };
const PLAN_FEATURES: Record<string, { label: string; price: string; features: PlanFeature[]; color: string; icon: typeof Crown }> = {
  starter: {
    label: "Starter",
    price: "Grátis",
    color: "border-border",
    icon: Zap,
    features: [
      { name: "Projetos ativos", limit: "5" },
      { name: "Diagnóstico heurístico de URL", limit: "6 dimensões" },
      { name: "Score por canal", limit: "4 canais" },
      { name: "Análise por IA", limit: "5/mês" },
      { name: "Benchmark SWOT", limit: "5/mês" },
      { name: "Gap Analysis", limit: "3/mês" },
      { name: "Plano Tático + Templates", limit: "1/mês" },
      { name: "Operações e campanhas", limit: "2/mês" },
      { name: "Exportação PDF e CSV", limit: "3/mês" },
      { name: "Públicos-alvo", limit: "5/projeto" },
    ],
  },
  professional: {
    label: "Professional",
    price: "R$ 147/mês",
    color: "border-primary",
    icon: Crown,
    features: [
      { name: "Projetos ativos", limit: "Ilimitado" },
      { name: "Análises por IA", limit: "Ilimitado" },
      { name: "Benchmark + Gap Analysis", limit: "Ilimitado" },
      { name: "Plano Tático + Playbook", limit: "Ilimitado" },
      { name: "Operações e campanhas", limit: "Ilimitado" },
      { name: "Exportação PDF e CSV", limit: "Ilimitado" },
      { name: "Públicos-alvo + keywords", limit: "Ilimitado" },
      { name: "Alertas estratégicos" },
      { name: "Notificações em tempo real" },
      { name: "Suporte prioritário" },
    ],
  },
  enterprise: {
    label: "Enterprise",
    price: "Personalizado",
    color: "border-amber-500",
    icon: Crown,
    features: [
      { name: "Tudo do Professional" },
      { name: "API access completo" },
      { name: "Múltiplos usuários" },
      { name: "SLA dedicado 24/7" },
      { name: "Consultoria estratégica" },
      { name: "Integrações customizadas" },
    ],
  },
};

const SETTINGS_CACHE_TTL = 1000 * 60 * 2;
type SettingsPageCache = {
  tenantSettings: any | null;
  companyName: string;
  apiKeys: Record<ApiKeyProvider, ApiKeyEntry>;
  backups: any[];
  usageStats: Record<string, number>;
  timestamp: number;
};
const settingsPageCache = new Map<string, SettingsPageCache>();

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.id;
  const { isFeatureAvailable } = useFeatureFlags();
  const canAiKeys = isFeatureAvailable("ai_api_keys");
  const [loading, setLoading] = useState(false);
  const [tenantSettings, setTenantSettings] = useState<any>(null);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [formData, setFormData] = useState({
    companyName: "",
    email: user?.email || "",
    fullName: (user?.user_metadata?.full_name as string) || "",
    bio: (user?.user_metadata?.bio as string) || "",
    avatarUrl: (user?.user_metadata?.avatar_url as string) || "",
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    darkMode: false,
    compactView: false,
    autoSave: true,
  });

  // API Keys state
  const [apiKeys, setApiKeys] = useState<Record<ApiKeyProvider, ApiKeyEntry>>({
    google_gemini: {
      provider: "google_gemini",
      api_key_encrypted: "",
      preferred_model: "gemini-3-flash-preview",
      is_active: false,
      last_validated_at: null,
    },
    anthropic_claude: {
      provider: "anthropic_claude",
      api_key_encrypted: "",
      preferred_model: "claude-sonnet-4-20250514",
      is_active: false,
      last_validated_at: null,
    },
  });
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<ApiKeyProvider, string>>({
    google_gemini: "",
    anthropic_claude: "",
  });
  const [showApiKey, setShowApiKey] = useState<Record<ApiKeyProvider, boolean>>({
    google_gemini: false,
    anthropic_claude: false,
  });
  const [validatingKey, setValidatingKey] = useState<ApiKeyProvider | null>(null);
  const [savingKey, setSavingKey] = useState<ApiKeyProvider | null>(null);

  // Backup state
  const [backups, setBackups] = useState<any[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [deletingBackupId, setDeletingBackupId] = useState<string | null>(null);

  // Usage stats state
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  // Sync formData when user object becomes available or changes
  useEffect(() => {
    if (!userId || !user) return;

    setFormData(prev => ({
      ...prev,
      email: user.email || prev.email,
      fullName: (user.user_metadata?.full_name as string) || prev.fullName,
      bio: (user.user_metadata?.bio as string) || prev.bio,
      avatarUrl: (user.user_metadata?.avatar_url as string) || prev.avatarUrl,
      language: (user.user_metadata?.language as string) || prev.language,
      timezone: (user.user_metadata?.timezone as string) || prev.timezone,
    }));

    const cached = settingsPageCache.get(userId);
    const isFreshCache = !!cached && Date.now() - cached.timestamp < SETTINGS_CACHE_TTL;

    if (isFreshCache) {
      setTenantSettings(cached.tenantSettings);
      setApiKeys(cached.apiKeys);
      setBackups(cached.backups);
      setUsageStats(cached.usageStats);
      setFormData(prev => ({
        ...prev,
        companyName: cached.companyName || prev.companyName,
      }));
      setTenantLoading(false);
    }

    loadTenantSettings({ silent: isFreshCache });
    loadApiKeys();
    loadBackups();
    loadUsageStats();
  }, [userId, user]);

  const loadTenantSettings = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!userId) return;
    try {
      if (!silent) setTenantLoading(true);
      const { data: tenant } = await supabase
        .from("tenant_settings")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (tenant) {
        setTenantSettings(tenant);
        setFormData(prev => ({
          ...prev,
          companyName: tenant.company_name || "",
        }));
        const prevCache = settingsPageCache.get(userId);
        settingsPageCache.set(userId, {
          tenantSettings: tenant,
          companyName: tenant.company_name || "",
          apiKeys: prevCache?.apiKeys || apiKeys,
          backups: prevCache?.backups || backups,
          usageStats: prevCache?.usageStats || usageStats,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error loading tenant settings:", error?.message || "Unknown error");
    } finally {
      setTenantLoading(false);
    }
  };

  const loadUsageStats = async () => {
    if (!userId) return;
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [projects, audiences, benchmarks, campaigns, tacticalPlans, exports] = await Promise.all([
        (supabase as any).from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId),
        (supabase as any).from("audiences").select("id", { count: "exact", head: true }).eq("user_id", userId),
        (supabase as any).from("benchmarks").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", monthStart),
        (supabase as any).from("campaigns").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", monthStart),
        (supabase as any).from("tactical_plans").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", monthStart),
        (supabase as any).from("user_backups").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", monthStart),
      ]);

      const nextStats = {
        projects: projects.count ?? 0,
        audiences: audiences.count ?? 0,
        benchmarks: benchmarks.count ?? 0,
        campaigns: campaigns.count ?? 0,
        tactical_plans: tacticalPlans.count ?? 0,
        exports: exports.count ?? 0,
      };
      setUsageStats(nextStats);
      const prevCache = settingsPageCache.get(userId);
      settingsPageCache.set(userId, {
        tenantSettings: prevCache?.tenantSettings || tenantSettings,
        companyName: prevCache?.companyName || formData.companyName,
        apiKeys: prevCache?.apiKeys || apiKeys,
        backups: prevCache?.backups || backups,
        usageStats: nextStats,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error loading usage stats:", error?.message || "Unknown error");
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update user metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          bio: formData.bio,
          avatar_url: formData.avatarUrl,
          language: formData.language,
          timezone: formData.timezone,
        }
      });

      if (userError) throw userError;

      // Update tenant settings
      if (tenantSettings) {
        const { error: tenantError } = await supabase
          .from("tenant_settings")
          .update({
            company_name: formData.companyName,
          })
          .eq("user_id", user.id);

        if (tenantError) throw tenantError;
      }

      toast.success("Perfil atualizado com sucesso!");
      loadTenantSettings();
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      if (!userId) return;

      const { data, error } = await supabase
        .from("user_api_keys")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error loading API keys:", error?.message || "Unknown error");
        return;
      }

      if (data && data.length > 0) {
        const updated = { ...apiKeys };
        data.forEach((row: any) => {
          const provider = row.provider as ApiKeyProvider;
          updated[provider] = {
            id: row.id,
            provider,
            api_key_encrypted: row.api_key_encrypted,
            preferred_model: row.preferred_model || (provider === "google_gemini" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514"),
            is_active: row.is_active,
            last_validated_at: row.last_validated_at,
          };
        });
        setApiKeys(updated);
        const prevCache = settingsPageCache.get(userId);
        settingsPageCache.set(userId, {
          tenantSettings: prevCache?.tenantSettings || tenantSettings,
          companyName: prevCache?.companyName || formData.companyName,
          apiKeys: updated,
          backups: prevCache?.backups || backups,
          usageStats: prevCache?.usageStats || usageStats,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error("Error loading API keys:", error?.message || "Unknown error");
    }
  };

  const handleSaveApiKey = async (provider: ApiKeyProvider) => {
    const keyInput = apiKeyInputs[provider];
    if (!keyInput.trim()) {
      toast.error("Insira uma API key válida");
      return;
    }

    setSavingKey(provider);
    try {
      if (!user) throw new Error("Usuário não autenticado");

      const entry = apiKeys[provider];
      const payload = {
        user_id: user.id,
        provider,
        api_key_encrypted: keyInput.trim(),
        preferred_model: entry.preferred_model,
        is_active: true,
        last_validated_at: null,
      };

      let error;
      if (entry.id) {
        ({ error } = await supabase
          .from("user_api_keys")
          .update({
            api_key_encrypted: payload.api_key_encrypted,
            preferred_model: payload.preferred_model,
            is_active: true,
            last_validated_at: null,
          })
          .eq("id", entry.id));
      } else {
        ({ error } = await supabase
          .from("user_api_keys")
          .insert(payload));
      }

      if (error) throw error;

      toast.success(`API key ${provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude"} salva com sucesso!`);
      if (user) notifyApiKeyConfigured(user.id, provider);
      setApiKeyInputs((prev) => ({ ...prev, [provider]: "" }));
      setShowApiKey((prev) => ({ ...prev, [provider]: false }));
      await loadApiKeys();
    } catch (error: any) {
      toast.error("Erro ao salvar API key: " + error.message);
    } finally {
      setSavingKey(null);
    }
  };

  const handleDeleteApiKey = async (provider: ApiKeyProvider) => {
    const entry = apiKeys[provider];
    if (!entry.id) return;

    if (!confirm(`Tem certeza que deseja remover a API key de ${provider === "google_gemini" ? "Google Gemini" : "Anthropic Claude"}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("user_api_keys")
        .delete()
        .eq("id", entry.id);

      if (error) throw error;

      toast.success("API key removida com sucesso!");
      setApiKeys((prev) => ({
        ...prev,
        [provider]: {
          provider,
          api_key_encrypted: "",
          preferred_model: provider === "google_gemini" ? "gemini-2.0-flash" : "claude-sonnet-4-20250514",
          is_active: false,
          last_validated_at: null,
        },
      }));
    } catch (error: any) {
      toast.error("Erro ao remover API key: " + error.message);
    }
  };

  const handleValidateApiKey = async (provider: ApiKeyProvider) => {
    const entry = apiKeys[provider];
    const keyToValidate = apiKeyInputs[provider].trim() || entry.api_key_encrypted;
    if (!keyToValidate) {
      toast.error("Nenhuma API key para validar");
      return;
    }

    setValidatingKey(provider);
    try {
      let isValid = false;

      if (provider === "google_gemini") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${keyToValidate}`
        );
        isValid = res.ok;
      } else {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": keyToValidate,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 1,
            messages: [{ role: "user", content: "ping" }],
          }),
        });
        isValid = res.ok || res.status === 400;
      }

      if (isValid) {
        toast.success("API key válida!");
        if (entry.id) {
          await supabase
            .from("user_api_keys")
            .update({ last_validated_at: new Date().toISOString() })
            .eq("id", entry.id);
          await loadApiKeys();
        }
      } else {
        toast.error("API key inválida. Verifique e tente novamente.");
      }
    } catch (error: any) {
      toast.error("Erro ao validar: " + error.message);
    } finally {
      setValidatingKey(null);
    }
  };

  const handleModelChange = async (provider: ApiKeyProvider, model: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: { ...prev[provider], preferred_model: model },
    }));

    const entry = apiKeys[provider];
    if (entry.id) {
      try {
        await supabase
          .from("user_api_keys")
          .update({ preferred_model: model })
          .eq("id", entry.id);
        toast.success("Modelo preferido atualizado!");
      } catch (error: any) {
        toast.error("Erro ao atualizar modelo: " + error.message);
      }
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
      if (error) throw error;
      
      toast.success("Email de redefinição de senha enviado!");
    } catch (error: any) {
      toast.error("Erro ao enviar email: " + error.message);
    }
  };

  const loadBackups = async () => {
    try {
      setLoadingBackups(true);
      if (!userId) return;
      const { data, error } = await supabase
        .from("user_data_backups")
        .select("id, backup_type, record_counts, size_bytes, notes, created_at, expires_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) {
        setBackups(data);
        const prevCache = settingsPageCache.get(userId);
        settingsPageCache.set(userId, {
          tenantSettings: prevCache?.tenantSettings || tenantSettings,
          companyName: prevCache?.companyName || formData.companyName,
          apiKeys: prevCache?.apiKeys || apiKeys,
          backups: data,
          usageStats: prevCache?.usageStats || usageStats,
          timestamp: Date.now(),
        });
      }
    } catch {
      // silently fail
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!user) return;
    try {
      setCreatingBackup(true);
      const { data, error } = await supabase.rpc("create_user_backup", {
        _user_id: user.id,
        _backup_type: "manual",
        _notes: "Backup manual via Configurações",
      });
      if (error) throw error;
      toast.success("Backup criado com sucesso!");
      if (user) notifyBackupCreated(user.id);
      loadBackups();
    } catch (error: any) {
      toast.error("Erro ao criar backup: " + error.message);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = async (backupId: string, createdAt: string) => {
    try {
      const { data, error } = await supabase
        .from("user_data_backups")
        .select("backup_data")
        .eq("id", backupId)
        .single();
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data.backup_data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date(createdAt).toISOString().split("T")[0];
      a.href = url;
      a.download = `intentia-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Backup baixado!");
    } catch (error: any) {
      toast.error("Erro ao baixar backup: " + error.message);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      const { error } = await supabase
        .from("user_data_backups")
        .delete()
        .eq("id", backupId);
      if (error) throw error;
      toast.success("Backup excluído.");
      loadBackups();
    } catch (error: any) {
      toast.error("Erro ao excluir backup: " + error.message);
    } finally {
      setDeletingBackupId(null);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    try {
      setExportingData(true);
      const tables = [
        { key: "tenant_settings", table: "tenant_settings" },
        { key: "projects", table: "projects" },
        { key: "project_channel_scores", table: "project_channel_scores" },
        { key: "insights", table: "insights" },
        { key: "audiences", table: "audiences" },
        { key: "benchmarks", table: "benchmarks" },
        { key: "notifications", table: "notifications" },
        { key: "tactical_plans", table: "tactical_plans" },
        { key: "tactical_channel_plans", table: "tactical_channel_plans" },
        { key: "copy_frameworks", table: "copy_frameworks" },
        { key: "segmentation_plans", table: "segmentation_plans" },
        { key: "testing_plans", table: "testing_plans" },
      ];

      const exportData: Record<string, any> = {
        version: "2.5.0",
        exported_at: new Date().toISOString(),
        user: {
          email: user.email,
          full_name: user.user_metadata?.full_name,
          company_name: tenantSettings?.company_name,
        },
      };

      const counts: Record<string, number> = {};

      for (const t of tables) {
        const { data } = await supabase
          .from(t.table)
          .select("*")
          .eq("user_id", user.id);
        const rows = data || [];
        // Remove html_snapshot from projects (too large)
        if (t.key === "projects") {
          exportData[t.key] = rows.map((r: any) => {
            const { html_snapshot, ...rest } = r;
            return rest;
          });
        } else {
          exportData[t.key] = rows;
        }
        counts[t.key] = rows.length;
      }

      exportData.record_counts = counts;

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `intentia-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso! (" + Object.values(counts).reduce((a, b) => a + b, 0) + " registros)");
    } catch (error: any) {
      toast.error("Erro ao exportar dados: " + error.message);
    } finally {
      setExportingData(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos.")) {
      return;
    }

    try {
      // This would need to be implemented with proper server-side logic
      toast.info("Funcionalidade de exclusão de conta em desenvolvimento");
    } catch (error: any) {
      toast.error("Erro ao excluir conta: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <DashboardLayout>
      <SEO title="Configurações" noindex />
          <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie seu perfil, preferências e configurações da conta
              </p>
            </div>

            {/* Skeleton Loading */}
            {tenantLoading && !tenantSettings && (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
                {/* Profile Skeleton */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                    <Skeleton className="h-4 w-56 mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-20 w-full rounded-md" />
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences Skeleton */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    <Skeleton className="h-4 w-48 mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-5 w-9 rounded-full" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* AI Keys Skeleton */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                    <Skeleton className="h-4 w-64 mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-4 w-28" />
                          </div>
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-10 w-full rounded-md" />
                        <Skeleton className="h-8 w-24 rounded-md" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Backup Skeleton */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-4 w-52 mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-40" />
                          </div>
                          <Skeleton className="h-7 w-16 rounded-md" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Skeleton */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                    <Skeleton className="h-4 w-56 mt-1" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* All content — hidden while loading */}
            {(!tenantLoading || !!tenantSettings) && (<>
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Perfil do Usuário
                </CardTitle>
                <CardDescription>
                  Informações básicas da sua conta e perfil público
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <AvatarUpload 
                    currentAvatar={formData.avatarUrl}
                    fullName={formData.fullName}
                    onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{formData.fullName || "Usuário"}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{formData.email}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {tenantSettings?.plan || "Starter"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Empresa</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Fale um pouco sobre você e sua empresa..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button size="sm" className="sm:size-default" onClick={handleSaveProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-1 sm:mr-2" />
                    {loading ? "Salvando..." : "Salvar Perfil"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={formData.emailNotifications}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports">Relatórios Semanais</Label>
                    <p className="text-sm text-muted-foreground">
                      Resumo semanal das suas análises e insights
                    </p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={formData.weeklyReports}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* AI API Keys Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Integrações de IA
                </CardTitle>
                <CardDescription>
                  Configure suas API keys para análise avançada com inteligência artificial. Cada usuário utiliza suas próprias chaves.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!canAiKeys && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Lock className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Integrações de IA indisponíveis no seu plano</p>
                      <p className="text-xs text-muted-foreground">Faça upgrade para o plano Professional para configurar API keys e usar análise por IA.</p>
                    </div>
                    <Button size="sm" variant="outline" className="flex-shrink-0 ml-auto" onClick={() => navigate("/checkout")}>
                      Fazer Upgrade
                    </Button>
                  </div>
                )}
                <div className={!canAiKeys ? "opacity-40 pointer-events-none select-none" : ""}>
                {/* Google Gemini */}
                {(() => {
                  const provider: ApiKeyProvider = "google_gemini";
                  const entry = apiKeys[provider];
                  const hasKey = !!entry.api_key_encrypted && !!entry.id;
                  const models = GEMINI_MODELS;
                  return (
                    <div className="rounded-lg border border-border p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base">Google Gemini</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Gemini Flash, Pro e Preview</p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {hasKey ? (
                            <Badge className="bg-success/10 text-success border-success/30 text-[10px] sm:text-xs">
                              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px] sm:text-xs">
                              <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Não config.
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="gemini-key" className="text-xs">API Key</Label>
                          <div className="flex gap-1.5 sm:gap-2 mt-1">
                            <div className="relative flex-1 min-w-0">
                              <Input
                                id="gemini-key"
                                type={showApiKey[provider] ? "text" : "password"}
                                autoComplete="new-password"
                                data-1p-ignore
                                data-lpignore="true"
                                placeholder={hasKey ? "Nova key..." : "Cole sua API key"}
                                value={apiKeyInputs[provider]}
                                onChange={(e) => setApiKeyInputs((prev) => ({ ...prev, [provider]: e.target.value }))}
                                className="pr-9 font-mono text-[11px] sm:text-xs"
                              />
                              <button
                                type="button"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowApiKey((prev) => ({ ...prev, [provider]: !prev[provider] }))}
                              >
                                {showApiKey[provider] ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                              </button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 px-2 sm:px-3"
                              onClick={() => handleValidateApiKey(provider)}
                              disabled={validatingKey === provider}
                              title="Validar key"
                            >
                              {validatingKey === provider ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                            </Button>
                          </div>
                          {hasKey && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              Key salva: <span className="font-mono">{maskApiKey(entry.api_key_encrypted)}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs">Modelo Preferido</Label>
                          <Select
                            value={entry.preferred_model}
                            onValueChange={(v) => handleModelChange(provider, v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {models.map((m) => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {entry.last_validated_at && (
                          <p className="text-[11px] text-muted-foreground">
                            Última validação: {new Date(entry.last_validated_at).toLocaleString("pt-BR")}
                          </p>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                          {hasKey && (
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteApiKey(provider)}>
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              Remover
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleSaveApiKey(provider)}
                            disabled={savingKey === provider || !apiKeyInputs[provider].trim()}
                          >
                            {savingKey === provider ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />}
                            {hasKey ? "Atualizar" : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Anthropic Claude */}
                {(() => {
                  const provider: ApiKeyProvider = "anthropic_claude";
                  const entry = apiKeys[provider];
                  const hasKey = !!entry.api_key_encrypted && !!entry.id;
                  const models = CLAUDE_MODELS;
                  return (
                    <div className="rounded-lg border border-border p-3 sm:p-4 space-y-3 sm:space-y-4">
                      <div className="flex items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                            <Key className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base">Anthropic Claude</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Opus, Sonnet e Haiku</p>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {hasKey ? (
                            <Badge className="bg-success/10 text-success border-success/30 text-[10px] sm:text-xs">
                              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground text-[10px] sm:text-xs">
                              <XCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
                              Não config.
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="claude-key" className="text-xs">API Key</Label>
                          <div className="flex gap-1.5 sm:gap-2 mt-1">
                            <div className="relative flex-1 min-w-0">
                              <Input
                                id="claude-key"
                                type={showApiKey[provider] ? "text" : "password"}
                                autoComplete="new-password"
                                data-1p-ignore
                                data-lpignore="true"
                                placeholder={hasKey ? "Nova key..." : "Cole sua API key"}
                                value={apiKeyInputs[provider]}
                                onChange={(e) => setApiKeyInputs((prev) => ({ ...prev, [provider]: e.target.value }))}
                                className="pr-9 font-mono text-[11px] sm:text-xs"
                              />
                              <button
                                type="button"
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowApiKey((prev) => ({ ...prev, [provider]: !prev[provider] }))}
                              >
                                {showApiKey[provider] ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                              </button>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="shrink-0 px-2 sm:px-3"
                              onClick={() => handleValidateApiKey(provider)}
                              disabled={validatingKey === provider}
                              title="Validar key"
                            >
                              {validatingKey === provider ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                            </Button>
                          </div>
                          {hasKey && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-500" />
                              Key salva: <span className="font-mono">{maskApiKey(entry.api_key_encrypted)}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <Label className="text-xs">Modelo Preferido</Label>
                          <Select
                            value={entry.preferred_model}
                            onValueChange={(v) => handleModelChange(provider, v)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {models.map((m) => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {entry.last_validated_at && (
                          <p className="text-[11px] text-muted-foreground">
                            Última validação: {new Date(entry.last_validated_at).toLocaleString("pt-BR")}
                          </p>
                        )}

                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                          {hasKey && (
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteApiKey(provider)}>
                              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              Remover
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleSaveApiKey(provider)}
                            disabled={savingKey === provider || !apiKeyInputs[provider].trim()}
                          >
                            {savingKey === provider ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />}
                            {hasKey ? "Atualizar" : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                </div>

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Como funciona:</strong> A análise heurística (fetch do HTML) é executada automaticamente ao analisar uma URL. 
                    Após essa primeira análise, você pode executar uma análise aprofundada por IA que utiliza sua API key para gerar insights 
                    mais contextualizados e factuais. Suas chaves são armazenadas de forma segura e nunca compartilhadas.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Backup & Data Security */}
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <HardDrive className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  Backup & Segurança
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Crie backups, exporte dados e gerencie a segurança da conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-4 sm:px-6">
                {/* Info box */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex gap-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-medium text-foreground">Seus dados estão protegidos</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                        Dados isolados por conta com RLS. Backups automáticos antes de exclusões. Crie backups manuais antes de ações importantes.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="justify-start h-auto py-2.5 sm:py-3 px-3"
                  >
                    {creatingBackup ? (
                      <Loader2 className="h-4 w-4 mr-1.5 sm:mr-2 animate-spin flex-shrink-0" />
                    ) : (
                      <Database className="h-4 w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    )}
                    <div className="text-left min-w-0">
                      <div className="text-xs sm:text-sm font-medium truncate">Criar Backup</div>
                      <div className="text-[10px] text-muted-foreground hidden sm:block">Snapshot completo no servidor</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    disabled={exportingData}
                    className="justify-start h-auto py-2.5 sm:py-3 px-3"
                  >
                    {exportingData ? (
                      <Loader2 className="h-4 w-4 mr-1.5 sm:mr-2 animate-spin flex-shrink-0" />
                    ) : (
                      <FileJson className="h-4 w-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                    )}
                    <div className="text-left min-w-0">
                      <div className="text-xs sm:text-sm font-medium truncate">Exportar Dados</div>
                      <div className="text-[10px] text-muted-foreground hidden sm:block">Download JSON completo</div>
                    </div>
                  </Button>
                </div>

                <Separator />

                {/* Backup list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">Backups Salvos</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={loadBackups}
                      disabled={loadingBackups}
                      className="h-7 px-2 text-xs"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${loadingBackups ? "animate-spin" : ""}`} />
                      Atualizar
                    </Button>
                  </div>

                  {backups.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <HardDrive className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nenhum backup encontrado</p>
                      <p className="text-xs mt-1">Crie seu primeiro backup para proteger seus dados</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {backups.map((backup) => {
                        const totalRecords = backup.record_counts
                          ? Object.values(backup.record_counts as Record<string, number>).reduce((a: number, b: number) => a + b, 0)
                          : 0;
                        const sizeKB = backup.size_bytes ? (backup.size_bytes / 1024).toFixed(1) : "—";
                        const createdDate = new Date(backup.created_at);
                        const expiresDate = backup.expires_at ? new Date(backup.expires_at) : null;

                        return (
                          <div
                            key={backup.id}
                            className="rounded-lg border border-border p-2.5 sm:p-3 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                backup.backup_type === "auto"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-primary/10 text-primary"
                              }`}>
                                {backup.backup_type === "auto" ? (
                                  <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                ) : (
                                  <HardDrive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                  <span className="text-xs sm:text-sm font-medium text-foreground">
                                    {backup.backup_type === "auto" ? "Automático" : "Manual"}
                                  </span>
                                  <Badge variant="outline" className="text-[9px] sm:text-[10px] shrink-0 px-1.5 py-0">
                                    {totalRecords} reg.
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">{sizeKB} KB</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-1.5 text-[10px] text-muted-foreground mt-0.5">
                                  <span>{createdDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} {createdDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                  {expiresDate && (
                                    <span>· Exp. {expiresDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0 pl-9 sm:pl-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleDownloadBackup(backup.id, backup.created_at)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Baixar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                onClick={() => setDeletingBackupId(backup.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Gerenciamento da Conta
                </CardTitle>
                <CardDescription>
                  Opções de segurança e gerenciamento da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button variant="outline" onClick={handlePasswordReset} className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Redefinir Senha
                  </Button>
                  
                  <Button variant="outline" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair da Conta
                  </Button>
                </div>

                <Separator />

                <div className="pt-2">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount} 
                    className="w-full justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Conta
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta ação é permanente e não pode ser desfeita
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Plan Information */}
            {(() => {
              const currentPlan = tenantSettings?.plan || "starter";
              const planInfo = PLAN_FEATURES[currentPlan] || PLAN_FEATURES.starter;
              const PlanIcon = planInfo.icon;
              const isStarter = currentPlan === "starter";
              const isProfessional = currentPlan === "professional";
              const isEnterprise = currentPlan === "enterprise";

              return (
                <Card className={`${planInfo.color} border-2`}>
                  <CardHeader className="px-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      Plano e Assinatura
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Gerencie seu plano e veja os recursos disponíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5 px-4 sm:px-6">
                    {/* Current Plan Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isStarter ? "bg-muted text-muted-foreground" : isProfessional ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          <PlanIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground text-base sm:text-lg">{planInfo.label}</h3>
                            <Badge variant={isStarter ? "secondary" : "default"} className={`text-[10px] sm:text-xs ${isProfessional ? "bg-primary" : isEnterprise ? "bg-amber-500" : ""}`}>
                              Ativo
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{planInfo.price}</p>
                        </div>
                      </div>
                      {!isEnterprise && (
                        <Button
                          variant={isStarter ? "hero" : "outline"}
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => {
                            if (isStarter) {
                              navigate("/checkout?plan=professional");
                            } else {
                              navigate("/contato");
                            }
                          }}
                        >
                          {isStarter ? (
                            <>
                              <Crown className="h-4 w-4 mr-1.5" />
                              Upgrade para Professional
                            </>
                          ) : (
                            <>
                              Upgrade para Enterprise
                              <ArrowRight className="h-4 w-4 ml-1.5" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Features List */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Recursos do seu plano
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {planInfo.features.map((feature) => (
                          <div
                            key={feature.name}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-foreground truncate">{feature.name}</span>
                            </div>
                            {feature.limit && (
                              <span className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                feature.limit === "Ilimitado"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}>
                                {feature.limit}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* What you're missing (Starter only) */}
                    {isStarter && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Disponível no Professional
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {[
                              { name: "Projetos e públicos", limit: "Ilimitado" },
                              { name: "Análises por IA", limit: "Ilimitado" },
                              { name: "Plano Tático + Playbook", limit: "Ilimitado" },
                              { name: "Operações e campanhas", limit: "Ilimitado" },
                              { name: "Exportação PDF e CSV", limit: "Ilimitado" },
                              { name: "Suporte prioritário" },
                            ].map((feature) => (
                              <div
                                key={feature.name}
                                className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 px-3 py-2 opacity-60"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="h-3.5 w-3.5 border-2 border-border rounded-full flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-muted-foreground truncate">{feature.name}</span>
                                </div>
                                {feature.limit && (
                                  <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 bg-primary/5 text-primary/60">
                                    {feature.limit}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="hero"
                            className="w-full mt-4"
                            onClick={() => navigate("/checkout?plan=professional")}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Fazer Upgrade — R$ 147/mês
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Usage Dashboard */}
                    {tenantSettings && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Uso do plano {isStarter ? "(limites mensais)" : ""}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(() => {
                            const usageItems = [
                              { label: "Projetos ativos", used: usageStats.projects ?? 0, limit: isStarter ? 5 : null, monthly: false },
                              { label: "Públicos-alvo", used: usageStats.audiences ?? 0, limit: isStarter ? 5 : null, monthly: false },
                              { label: "Análises heurísticas", used: tenantSettings.analyses_used || 0, limit: isStarter ? (tenantSettings.monthly_analyses_limit || 5) : null, monthly: true },
                              { label: "Benchmarks SWOT", used: usageStats.benchmarks ?? 0, limit: isStarter ? 5 : null, monthly: true },
                              { label: "Planos táticos", used: usageStats.tactical_plans ?? 0, limit: isStarter ? 1 : null, monthly: true },
                              { label: "Campanhas", used: usageStats.campaigns ?? 0, limit: isStarter ? 2 : null, monthly: true },
                              { label: "Backups", used: usageStats.exports ?? 0, limit: isStarter ? 4 : null, monthly: true },
                            ];
                            return usageItems.map((item) => {
                              const pct = item.limit ? Math.min(100, (item.used / item.limit) * 100) : 0;
                              const isNearLimit = item.limit ? pct >= 80 : false;
                              const isAtLimit = item.limit ? item.used >= item.limit : false;
                              return (
                                <div key={item.label} className="rounded-lg bg-muted/30 p-2.5 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">{item.label}</span>
                                    <span className={`text-xs font-semibold ${isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-foreground"}`}>
                                      {item.used}{item.limit ? ` / ${item.limit}` : ""}{!item.limit ? " / ∞" : ""}{item.monthly ? "" : ""}
                                    </span>
                                  </div>
                                  {item.limit && (
                                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${isAtLimit ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-primary"}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            });
                          })()}
                        </div>
                        {isStarter && (
                          <p className="text-[11px] text-muted-foreground text-center">
                            Limites mensais são resetados no dia 1 de cada mês. Projetos e públicos são totais.
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
            </>)}
          </div>

      {/* Delete Backup Confirmation Dialog */}
      <AlertDialog open={!!deletingBackupId} onOpenChange={(open) => !open && setDeletingBackupId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir backup?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O backup será permanentemente removido do servidor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingBackupId && handleDeleteBackup(deletingBackupId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
