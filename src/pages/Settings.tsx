import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
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
      "3 projetos ativos",
      "Diagnóstico heurístico de URL (6 dimensões)",
      "Score por canal: Google, Meta, LinkedIn, TikTok",
      "Insights automáticos por projeto",
      "Alertas de investimento prematuro",
      "1 público-alvo por projeto",
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
      "Relatórios white-label",
    ],
  },
};

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [tenantSettings, setTenantSettings] = useState<any>(null);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    fullName: "",
    bio: "",
    avatarUrl: "",
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

  useEffect(() => {
    loadUserData();
    loadApiKeys();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Load tenant settings
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
            email: user.email || "",
            fullName: user.user_metadata?.full_name || "",
            bio: user.user_metadata?.bio || "",
            avatarUrl: user.user_metadata?.avatar_url || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
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
      loadUserData();
    } catch (error: any) {
      toast.error("Erro ao atualizar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
      const { data: { user } } = await supabase.auth.getUser();
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

  const handleExportData = async () => {
    try {
      // Export all user data
      const [projects, insights, audiences, benchmarks] = await Promise.all([
        supabase.from("projects").select("*").eq("user_id", user.id),
        supabase.from("insights").select("*").eq("user_id", user.id),
        supabase.from("audiences").select("*").eq("user_id", user.id),
        supabase.from("benchmarks").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        user: {
          email: user.email,
          full_name: user.user_metadata?.full_name,
          company_name: tenantSettings?.company_name,
        },
        projects: projects.data || [],
        insights: insights.data || [],
        audiences: audiences.data || [],
        benchmarks: benchmarks.data || [],
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `intentia-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Dados exportados com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao exportar dados: " + error.message);
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

                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Como funciona:</strong> A análise heurística (fetch do HTML) é executada automaticamente ao analisar uma URL. 
                    Após essa primeira análise, você pode executar uma análise aprofundada por IA que utiliza sua API key para gerar insights 
                    mais contextualizados e factuais. Suas chaves são armazenadas de forma segura e nunca compartilhadas.
                  </p>
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
                  
                  <Button variant="outline" onClick={handleExportData} className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Meus Dados
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
                              "Benchmark competitivo + SWOT",
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
