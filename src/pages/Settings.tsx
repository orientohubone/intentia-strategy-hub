import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
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

const PLAN_FEATURES: Record<string, { label: string; price: string; features: string[]; color: string; icon: typeof Crown }> = {
  starter: {
    label: "Starter",
    price: "Grátis",
    color: "border-border",
    icon: Zap,
    features: [
      "5 projetos ativos",
      "Diagnóstico heurístico de URL (6 dimensões)",
      "Score por canal: Google, Meta, LinkedIn, TikTok",
      "Insights automáticos por projeto",
      "Alertas de investimento prematuro",
      "Benchmark competitivo SWOT (5/mês)",
      "5 públicos-alvo por projeto",
    ],
  },
  professional: {
    label: "Professional",
    price: "R$ 97/mês",
    color: "border-primary",
    icon: Crown,
    features: [
      "Projetos ilimitados",
      "Diagnóstico heurístico de URL (6 dimensões)",
      "Análise por IA — Gemini e Claude",
      "Score por canal com riscos e recomendações",
      "Benchmark competitivo com SWOT e gap analysis",
      "Plano Tático por canal",
      "Alertas estratégicos consolidados",
      "Públicos-alvo ilimitados com keywords",
      "Exportação PDF e CSV",
      "Notificações em tempo real",
    ],
  },
  enterprise: {
    label: "Enterprise",
    price: "Personalizado",
    color: "border-amber-500",
    icon: Crown,
    features: [
      "Tudo do Professional",
      "API access completo",
      "Múltiplos usuários por conta",
      "SLA dedicado com suporte 24/7",
      "Consultoria estratégica mensal",
      "Integrações customizadas",
    ],
  },
};

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Sync formData when user object becomes available or changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        fullName: (user.user_metadata?.full_name as string) || prev.fullName,
        bio: (user.user_metadata?.bio as string) || prev.bio,
        avatarUrl: (user.user_metadata?.avatar_url as string) || prev.avatarUrl,
      }));
      loadTenantSettings();
      loadApiKeys();
      loadBackups();
    }
  }, [user]);

  const loadTenantSettings = async () => {
    if (!user) return;
    try {
      setTenantLoading(true);
      const { data: tenant } = await supabase
        .from("tenant_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (tenant) {
        setTenantSettings(tenant);
        setFormData(prev => ({
          ...prev,
          companyName: tenant.company_name || "",
        }));
      }
    } catch (error) {
      console.error("Error loading tenant settings:", error);
    } finally {
      setTenantLoading(false);
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
      if (!user) return;

      const { data, error } = await supabase
        .from("user_api_keys")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error loading API keys:", error);
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
      }
    } catch (error) {
      console.error("Error loading API keys:", error);
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
      if (!user) return;
      const { data, error } = await supabase
        .from("user_data_backups")
        .select("id, backup_type, record_counts, size_bytes, notes, created_at, expires_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) setBackups(data);
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
    if (!confirm("Tem certeza que deseja excluir este backup?")) return;
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

            {/* Preferences Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Preferências
                </CardTitle>
                <CardDescription>
                  Personalize sua experiência na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">America/Sao_Paulo</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoSave">Auto Salvamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Salve automaticamente seu trabalho
                    </p>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={formData.autoSave}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSave: checked }))}
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Backup & Segurança de Dados
                </CardTitle>
                <CardDescription>
                  Crie backups dos seus dados, exporte e gerencie a segurança da sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Info box */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">Seus dados estão protegidos</p>
                      <p className="text-xs text-muted-foreground">
                        Todos os dados são isolados por conta com Row Level Security (RLS). 
                        Backups automáticos são criados antes de exclusões importantes. 
                        Você pode criar backups manuais a qualquer momento.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                    className="justify-start h-auto py-3"
                  >
                    {creatingBackup ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Database className="h-4 w-4 mr-2" />
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium">Criar Backup</div>
                      <div className="text-[10px] text-muted-foreground">Snapshot completo no servidor</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleExportData}
                    disabled={exportingData}
                    className="justify-start h-auto py-3"
                  >
                    {exportingData ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileJson className="h-4 w-4 mr-2" />
                    )}
                    <div className="text-left">
                      <div className="text-sm font-medium">Exportar Dados</div>
                      <div className="text-[10px] text-muted-foreground">Download JSON completo</div>
                    </div>
                  </Button>
                </div>

                <Separator />

                {/* Backup list */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">Backups Salvos</h4>
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
                            className="rounded-lg border border-border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                backup.backup_type === "auto"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-primary/10 text-primary"
                              }`}>
                                {backup.backup_type === "auto" ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <HardDrive className="h-4 w-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-foreground truncate">
                                    {backup.backup_type === "auto" ? "Backup Automático" : "Backup Manual"}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] shrink-0">
                                    {totalRecords} registros
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                                  <span>{createdDate.toLocaleDateString("pt-BR")} às {createdDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                  <span>·</span>
                                  <span>{sizeKB} KB</span>
                                  {expiresDate && (
                                    <>
                                      <span>·</span>
                                      <span>Expira {expiresDate.toLocaleDateString("pt-BR")}</span>
                                    </>
                                  )}
                                </div>
                                {backup.notes && (
                                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{backup.notes}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1.5 shrink-0 self-end sm:self-center">
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
                                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleDeleteBackup(backup.id)}
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
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Plano e Assinatura
                    </CardTitle>
                    <CardDescription>
                      Gerencie seu plano e veja os recursos disponíveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* Current Plan Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                          isStarter ? "bg-muted text-muted-foreground" : isProfessional ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"
                        }`}>
                          <PlanIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground text-lg">{planInfo.label}</h3>
                            <Badge variant={isStarter ? "secondary" : "default"} className={isProfessional ? "bg-primary" : isEnterprise ? "bg-amber-500" : ""}>
                              Ativo
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{planInfo.price}</p>
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
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground">{feature}</span>
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
                              "Análise por IA (Gemini & Claude)",
                              "Benchmark ilimitado + Gap Analysis",
                              "Plano Tático por canal",
                              "Exportação PDF e CSV",
                              "Notificações em tempo real",
                              "Projetos e públicos ilimitados",
                            ].map((feature) => (
                              <div key={feature} className="flex items-center gap-2 opacity-60">
                                <div className="h-4 w-4 border-2 border-border rounded-full flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="hero"
                            className="w-full mt-4"
                            onClick={() => navigate("/checkout?plan=professional")}
                          >
                            <Crown className="h-4 w-4 mr-2" />
                            Fazer Upgrade — R$ 97/mês
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Usage Stats */}
                    {tenantSettings && (
                      <div className="rounded-lg bg-muted/30 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Análises este mês</span>
                          <span className="font-semibold text-foreground">
                            {tenantSettings.analyses_used || 0} / {tenantSettings.monthly_analyses_limit || (isStarter ? 5 : "∞")}
                          </span>
                        </div>
                        {isStarter && (
                          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.min(100, ((tenantSettings.analyses_used || 0) / (tenantSettings.monthly_analyses_limit || 5)) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
    </DashboardLayout>
  );
}
