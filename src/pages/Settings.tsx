import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
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
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
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

  useEffect(() => {
    loadUserData();
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
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">
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
                <div className="flex items-center gap-4">
                  <AvatarUpload 
                    currentAvatar={formData.avatarUrl}
                    fullName={formData.fullName}
                    onAvatarChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                    size="lg"
                  />
                  <div>
                    <h3 className="font-semibold">{formData.fullName || "Usuário"}</h3>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                    <Badge variant="secondary" className="mt-1">
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
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
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
            {tenantSettings && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Plano Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold capitalize">{tenantSettings.plan}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tenantSettings.analyses_used} de {tenantSettings.monthly_analyses_limit} análises usadas este mês
                      </p>
                    </div>
                    <Button variant="outline">
                      Fazer Upgrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
