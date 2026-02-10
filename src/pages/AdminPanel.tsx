import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Shield,
  LogOut,
  Search,
  Users,
  ToggleLeft,
  Settings2,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  XCircle,
  Archive,
  Eye,
  Building2,
  Crown,
  Zap,
  Star,
  Filter,
  LayoutDashboard,
  Target,
  Sparkles,
  BarChart3,
  Crosshair,
  Download,
  Share2,
  Layers,
  ShieldCheck,
  FolderOpen,
  Lightbulb,
  ShieldAlert,
  Settings,
  Palette,
  Activity,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminStatusTab from "@/components/AdminStatusTab";

// =====================================================
// TYPES
// =====================================================

interface FeatureFlag {
  id: string;
  feature_key: string;
  feature_name: string;
  description: string | null;
  category: string;
  status: "active" | "disabled" | "development" | "maintenance" | "deprecated";
  status_message: string | null;
  icon: string | null;
  sort_order: number;
  updated_at: string;
}

interface PlanFeature {
  id: string;
  feature_key: string;
  plan: string;
  is_enabled: boolean;
  usage_limit: number | null;
  limit_period: string | null;
}

interface TenantUser {
  user_id: string;
  company_name: string | null;
  plan: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  analyses_used: number;
  monthly_analyses_limit: number;
}

// =====================================================
// CONSTANTS
// =====================================================

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle2; bg: string }> = {
  active: { label: "Ativo", color: "text-green-600", icon: CheckCircle2, bg: "bg-green-500/10 border-green-500/20" },
  disabled: { label: "Desativado", color: "text-red-600", icon: XCircle, bg: "bg-red-500/10 border-red-500/20" },
  development: { label: "Em Desenvolvimento", color: "text-blue-600", icon: Wrench, bg: "bg-blue-500/10 border-blue-500/20" },
  maintenance: { label: "Manutenção", color: "text-amber-600", icon: Clock, bg: "bg-amber-500/10 border-amber-500/20" },
  deprecated: { label: "Descontinuado", color: "text-gray-500", icon: Archive, bg: "bg-gray-500/10 border-gray-500/20" },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: typeof Target; color: string; bg: string }> = {
  analysis: { label: "Projetos", icon: FolderOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
  ai: { label: "Inteligência Artificial", icon: Sparkles, color: "text-purple-500", bg: "bg-purple-500/10" },
  benchmark: { label: "Benchmark", icon: BarChart3, color: "text-green-500", bg: "bg-green-500/10" },
  tactical: { label: "Plano Tático", icon: Crosshair, color: "text-rose-500", bg: "bg-rose-500/10" },
  general: { label: "Insights & Alertas", icon: Lightbulb, color: "text-amber-500", bg: "bg-amber-500/10" },
  export: { label: "Exportação", icon: Download, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  social: { label: "Marca & Social", icon: Palette, color: "text-pink-500", bg: "bg-pink-500/10" },
  admin: { label: "Configurações", icon: Settings, color: "text-sky-500", bg: "bg-sky-500/10" },
};

// Keep a simple label map for backwards compat
const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_CONFIG).map(([k, v]) => [k, v.label])
);

const PLAN_CONFIG: Record<string, { label: string; icon: typeof Zap; color: string }> = {
  starter: { label: "Starter", icon: Zap, color: "text-blue-600" },
  professional: { label: "Professional", icon: Star, color: "text-primary" },
  enterprise: { label: "Enterprise", icon: Crown, color: "text-purple-600" },
};

// =====================================================
// COMPONENT
// =====================================================

export default function AdminPanel() {
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  // State
  const [activeTab, setActiveTab] = useState<"features" | "plans" | "users" | "status">("features");
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [planFeatures, setPlanFeatures] = useState<PlanFeature[]>([]);
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const expandAllCategories = () => setCollapsedCategories(new Set());
  const collapseAllCategories = () => setCollapsedCategories(new Set(Object.keys(CATEGORY_CONFIG)));

  // =====================================================
  // DATA LOADING
  // =====================================================

  const loadFeatures = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("feature_flags")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && data) setFeatures(data);
  }, []);

  const loadPlanFeatures = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("plan_features")
      .select("*");

    if (!error && data) setPlanFeatures(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("tenant_settings")
      .select("user_id, company_name, plan, full_name, email, created_at, analyses_used, monthly_analyses_limit")
      .order("created_at", { ascending: false });

    if (!error && data) setUsers(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadFeatures(), loadPlanFeatures(), loadUsers()]);
    setLoading(false);
  }, [loadFeatures, loadPlanFeatures, loadUsers]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const updateFeatureStatus = async (featureKey: string, newStatus: string) => {
    setSaving(featureKey);
    const { error } = await (supabase as any)
      .from("feature_flags")
      .update({ status: newStatus })
      .eq("feature_key", featureKey);

    if (error) {
      toast.error("Erro ao atualizar status da feature.");
    } else {
      toast.success(`Feature "${featureKey}" atualizada para ${STATUS_CONFIG[newStatus]?.label || newStatus}.`);
      await loadFeatures();
    }
    setSaving(null);
  };

  const updateFeatureStatusMessage = async (featureKey: string, message: string) => {
    const { error } = await (supabase as any)
      .from("feature_flags")
      .update({ status_message: message || null })
      .eq("feature_key", featureKey);

    if (!error) {
      await loadFeatures();
    }
  };

  const togglePlanFeature = async (featureKey: string, plan: string, currentEnabled: boolean) => {
    setSaving(`${featureKey}-${plan}`);
    const { error } = await (supabase as any)
      .from("plan_features")
      .update({ is_enabled: !currentEnabled })
      .eq("feature_key", featureKey)
      .eq("plan", plan);

    if (error) {
      toast.error("Erro ao atualizar permissão do plano.");
    } else {
      toast.success(`${featureKey} ${!currentEnabled ? "habilitado" : "desabilitado"} no plano ${plan}.`);
      await loadPlanFeatures();
    }
    setSaving(null);
  };

  const updatePlanLimit = async (featureKey: string, plan: string, limit: number | null, period: string | null) => {
    const { error } = await (supabase as any)
      .from("plan_features")
      .update({ usage_limit: limit, limit_period: period })
      .eq("feature_key", featureKey)
      .eq("plan", plan);

    if (!error) {
      await loadPlanFeatures();
      toast.success("Limite atualizado.");
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    if (!admin) return;
    setSaving(userId);
    
    // Use RPC function that runs as SECURITY DEFINER to bypass prevent_plan_escalation trigger
    const { error } = await (supabase as any).rpc("admin_change_user_plan", {
      p_admin_cnpj: admin.cnpj,
      p_target_user_id: userId,
      p_new_plan: newPlan,
    });

    if (error) {
      toast.error("Erro ao atualizar plano do usuário.");
      console.error("[admin] Plan change error:", error);
    } else {
      toast.success(`Plano atualizado para ${PLAN_CONFIG[newPlan]?.label || newPlan}.`);
      await loadUsers();
    }
    setSaving(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // =====================================================
  // FILTERS
  // =====================================================

  const filteredFeatures = features.filter((f) => {
    if (searchTerm && !f.feature_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !f.feature_key.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (searchTerm && !(u.company_name || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(u.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(u.email || "").toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (planFilter !== "all" && u.plan !== planFilter) return false;
    return true;
  });

  const getPlanFeature = (featureKey: string, plan: string) =>
    planFeatures.find((pf) => pf.feature_key === featureKey && pf.plan === plan);

  // =====================================================
  // STATS
  // =====================================================

  const activeFeatures = features.filter((f) => f.status === "active").length;
  const disabledFeatures = features.filter((f) => f.status === "disabled").length;
  const devFeatures = features.filter((f) => f.status === "development").length;
  const totalUsers = users.length;
  const starterUsers = users.filter((u) => u.plan === "starter").length;
  const proUsers = users.filter((u) => u.plan === "professional").length;
  const enterpriseUsers = users.filter((u) => u.plan === "enterprise").length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-white">
                intentia<span className="text-primary">.</span> <span className="text-slate-400 font-normal">admin</span>
              </span>
              {admin && (
                <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20 hidden sm:inline-flex">
                  {admin.role === "founder" ? "Founder" : admin.role}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white h-8 gap-1.5"
                onClick={loadAll}
                disabled={loading}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline text-xs">Atualizar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-red-400 h-8 gap-1.5"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <ToggleLeft className="h-4 w-4 text-green-500" />
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Features Ativas</span>
            </div>
            <p className="text-2xl font-bold text-white">{activeFeatures}</p>
            <p className="text-[11px] text-slate-600">{disabledFeatures} desativadas · {devFeatures} em dev</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Clientes</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalUsers}</p>
            <p className="text-[11px] text-slate-600">{starterUsers} starter · {proUsers} pro · {enterpriseUsers} enterprise</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Total Features</span>
            </div>
            <p className="text-2xl font-bold text-white">{features.length}</p>
            <p className="text-[11px] text-slate-600">{Object.keys(CATEGORY_LABELS).length} categorias</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="h-4 w-4 text-purple-500" />
              <span className="text-[11px] text-slate-500 uppercase tracking-wider">Planos</span>
            </div>
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-[11px] text-slate-600">Starter · Professional · Enterprise</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1">
          {[
            { key: "features" as const, label: "Feature Flags", icon: ToggleLeft },
            { key: "plans" as const, label: "Controle de Planos", icon: Settings2 },
            { key: "users" as const, label: "Clientes", icon: Users },
            { key: "status" as const, label: "Status Page", icon: Activity },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearchTerm(""); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-primary text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder={activeTab === "users" ? "Buscar por empresa, nome ou email..." : "Buscar feature..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-600"
            />
          </div>
          {activeTab === "features" && (
            <>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-44 bg-slate-900/60 border-slate-800 text-white">
                  <Filter className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44 bg-slate-900/60 border-slate-800 text-white">
                  <Filter className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          {activeTab === "users" && (
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-44 bg-slate-900/60 border-slate-800 text-white">
                <Filter className="h-3.5 w-3.5 mr-2 text-slate-500" />
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Planos</SelectItem>
                {Object.entries(PLAN_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-700 border-t-primary" />
          </div>
        ) : (
          <>
            {/* =====================================================
                TAB: FEATURE FLAGS
                ===================================================== */}
            {activeTab === "features" && (
              <div className="space-y-1">
                {filteredFeatures.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <ToggleLeft className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma feature encontrada.</p>
                  </div>
                ) : (
                  (() => {
                    const grouped: Record<string, FeatureFlag[]> = {};
                    for (const f of filteredFeatures) {
                      if (!grouped[f.category]) grouped[f.category] = [];
                      grouped[f.category].push(f);
                    }
                    const categoryOrder = Object.keys(CATEGORY_CONFIG);
                    const sortedCategories = Object.keys(grouped).sort(
                      (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
                    );

                    return (
                      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Expand/Collapse bar */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
                          <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">Funcionalidades do Sistema</p>
                          <div className="flex items-center gap-2">
                            <button onClick={expandAllCategories} className="text-[11px] text-slate-500 hover:text-white transition-colors">Expandir</button>
                            <span className="text-slate-700 text-[10px]">|</span>
                            <button onClick={collapseAllCategories} className="text-[11px] text-slate-500 hover:text-white transition-colors">Colapsar</button>
                          </div>
                        </div>

                        {sortedCategories.map((cat, catIdx) => {
                          const catCfg = CATEGORY_CONFIG[cat];
                          const CatIcon = catCfg?.icon || Layers;
                          const catFeatures = grouped[cat];
                          const activeCount = catFeatures.filter((f) => f.status === "active").length;
                          const isCollapsed = collapsedCategories.has(cat);
                          const isLast = catIdx === sortedCategories.length - 1;

                          return (
                            <div key={cat} className={!isLast ? "border-b border-slate-800/50" : ""}>
                              {/* Category row — sidebar style */}
                              <button
                                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-slate-800/30 transition-colors group"
                                onClick={() => toggleCategory(cat)}
                              >
                                <div className={`w-8 h-8 rounded-lg ${catCfg?.bg || 'bg-slate-800'} flex items-center justify-center flex-shrink-0`}>
                                  <CatIcon className={`h-4 w-4 ${catCfg?.color || 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1 min-w-0 text-left">
                                  <span className="text-[13px] font-medium text-slate-200 group-hover:text-white transition-colors">{catCfg?.label || cat}</span>
                                </div>
                                <span className="text-[11px] text-slate-600 mr-2">{activeCount}/{catFeatures.length}</span>
                                <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} />
                              </button>

                              {/* Feature items — vertical list */}
                              {!isCollapsed && (
                                <div className="pb-2">
                                  {catFeatures.map((feature) => {
                                    const statusCfg = STATUS_CONFIG[feature.status];
                                    const StatusIcon = statusCfg.icon;
                                    return (
                                      <div
                                        key={feature.id}
                                        className={`mx-3 mb-1 rounded-lg transition-colors ${
                                          feature.status === "active" ? "hover:bg-slate-800/40" :
                                          feature.status === "disabled" ? "opacity-50" : "hover:bg-slate-800/20"
                                        }`}
                                      >
                                        <div className="flex items-center gap-3 px-3 py-2.5 pl-[52px]">
                                          {/* Status dot */}
                                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                            feature.status === "active" ? "bg-green-500" :
                                            feature.status === "disabled" ? "bg-red-500" :
                                            feature.status === "development" ? "bg-blue-500" :
                                            feature.status === "maintenance" ? "bg-amber-500" :
                                            "bg-gray-500"
                                          }`} />

                                          {/* Feature name + description */}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-300">{feature.feature_name}</p>
                                            {feature.description && (
                                              <p className="text-[10px] text-slate-600 truncate">{feature.description}</p>
                                            )}
                                          </div>

                                          {/* Plan pills */}
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            {(["starter", "professional", "enterprise"] as const).map((plan) => {
                                              const pf = getPlanFeature(feature.feature_key, plan);
                                              const isEnabled = pf?.is_enabled ?? false;
                                              const isSaving = saving === `${feature.feature_key}-${plan}`;
                                              return (
                                                <button
                                                  key={plan}
                                                  onClick={(e) => { e.stopPropagation(); togglePlanFeature(feature.feature_key, plan, isEnabled); }}
                                                  disabled={isSaving}
                                                  title={`${PLAN_CONFIG[plan].label}: ${isEnabled ? "Habilitado" : "Desabilitado"}`}
                                                  className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold transition-all ${
                                                    isEnabled
                                                      ? "bg-green-500/15 text-green-400 hover:bg-green-500/25"
                                                      : "bg-slate-800/60 text-slate-600 hover:bg-slate-700/60"
                                                  }`}
                                                >
                                                  {plan === "starter" ? "S" : plan === "professional" ? "P" : "E"}
                                                </button>
                                              );
                                            })}
                                          </div>

                                          {/* Status selector */}
                                          <Select
                                            value={feature.status}
                                            onValueChange={(val) => updateFeatureStatus(feature.feature_key, val)}
                                          >
                                            <SelectTrigger className="w-[130px] h-7 text-[10px] bg-slate-800/40 border-slate-700/50 text-slate-400 flex-shrink-0">
                                              <StatusIcon className={`h-3 w-3 mr-1 ${statusCfg.color}`} />
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                                <SelectItem key={key} value={key}>
                                                  <span className="flex items-center gap-1.5">
                                                    <cfg.icon className={`h-3 w-3 ${cfg.color}`} />
                                                    {cfg.label}
                                                  </span>
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Status message (inline, below the row) */}
                                        {(feature.status === "maintenance" || feature.status === "development" || feature.status === "deprecated") && (
                                          <div className="px-3 pb-2 pl-[68px]">
                                            <Input
                                              placeholder="Mensagem de status..."
                                              defaultValue={feature.status_message || ""}
                                              onBlur={(e) => updateFeatureStatusMessage(feature.feature_key, e.target.value)}
                                              className="h-7 text-[10px] bg-slate-800/30 border-slate-700/50 text-white placeholder:text-slate-600"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                )}
              </div>
            )}

            {/* =====================================================
                TAB: PLAN CONTROL
                ===================================================== */}
            {activeTab === "plans" && (
              <div className="space-y-4">
                {/* Expand/Collapse all */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setCollapsedCategories((prev) => {
                        const next = new Set(prev);
                        ["plan-starter", "plan-professional", "plan-enterprise"].forEach((k) => next.delete(k));
                        Object.keys(CATEGORY_CONFIG).forEach((cat) => {
                          ["starter", "professional", "enterprise"].forEach((p) => next.delete(`plan-${p}-${cat}`));
                        });
                        return next;
                      });
                    }}
                    className="text-[11px] text-slate-500 hover:text-white transition-colors"
                  >
                    Expandir todas
                  </button>
                  <span className="text-slate-700 text-[10px]">|</span>
                  <button
                    onClick={() => {
                      setCollapsedCategories((prev) => {
                        const next = new Set(prev);
                        ["plan-starter", "plan-professional", "plan-enterprise"].forEach((k) => next.add(k));
                        return next;
                      });
                    }}
                    className="text-[11px] text-slate-500 hover:text-white transition-colors"
                  >
                    Colapsar todas
                  </button>
                </div>
                {(["starter", "professional", "enterprise"] as const).map((plan) => {
                  const planCfg = PLAN_CONFIG[plan];
                  const PlanIcon = planCfg.icon;
                  const planPfs = planFeatures.filter((pf) => pf.plan === plan);
                  const enabledCount = planPfs.filter((pf) => pf.is_enabled).length;
                  const userCount = users.filter((u) => u.plan === plan).length;
                  const isPlanCollapsed = collapsedCategories.has(`plan-${plan}`);

                  // Group features by category for this plan
                  const grouped: Record<string, FeatureFlag[]> = {};
                  for (const f of features) {
                    if (!grouped[f.category]) grouped[f.category] = [];
                    grouped[f.category].push(f);
                  }
                  const categoryOrder = Object.keys(CATEGORY_CONFIG);
                  const sortedCats = Object.keys(grouped).sort(
                    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
                  );

                  return (
                    <div key={plan} className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                      {/* Plan header — clickable to collapse */}
                      <button
                        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/20 transition-colors group"
                        onClick={() => toggleCategory(`plan-${plan}`)}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          plan === "starter" ? "bg-blue-500/10" :
                          plan === "professional" ? "bg-primary/10" :
                          "bg-purple-500/10"
                        }`}>
                          <PlanIcon className={`h-5 w-5 ${planCfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">{planCfg.label}</h3>
                          <p className="text-[11px] text-slate-500">
                            {enabledCount}/{features.length} features · {userCount} {userCount === 1 ? "usuário" : "usuários"}
                          </p>
                        </div>
                        {/* Quick stats */}
                        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">{enabledCount}</p>
                            <p className="text-[9px] text-slate-600 uppercase">Ativas</p>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">{features.length - enabledCount}</p>
                            <p className="text-[9px] text-slate-600 uppercase">Bloqueadas</p>
                          </div>
                          <div className="w-px h-8 bg-slate-800" />
                          <div className="text-center">
                            <p className="text-lg font-bold text-white">{userCount}</p>
                            <p className="text-[9px] text-slate-600 uppercase">Usuários</p>
                          </div>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${isPlanCollapsed ? '-rotate-90' : ''}`} />
                      </button>

                      {/* Plan content — collapsible, grouped by category */}
                      {!isPlanCollapsed && (
                        <div className="border-t border-slate-800">
                          {sortedCats.map((cat, catIdx) => {
                            const catCfg = CATEGORY_CONFIG[cat];
                            const CatIcon = catCfg?.icon || Layers;
                            const catFeatures = grouped[cat];
                            const catEnabled = catFeatures.filter((f) => {
                              const pf = getPlanFeature(f.feature_key, plan);
                              return pf?.is_enabled;
                            }).length;
                            const isCatCollapsed = collapsedCategories.has(`plan-${plan}-${cat}`);
                            const isLastCat = catIdx === sortedCats.length - 1;

                            return (
                              <div key={cat} className={!isLastCat ? "border-b border-slate-800/30" : ""}>
                                {/* Category sub-header */}
                                <button
                                  className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-slate-800/20 transition-colors group"
                                  onClick={() => toggleCategory(`plan-${plan}-${cat}`)}
                                >
                                  <CatIcon className={`h-3.5 w-3.5 ${catCfg?.color || 'text-slate-500'} ml-5`} />
                                  <span className="text-[12px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors flex-1 text-left">
                                    {catCfg?.label || cat}
                                  </span>
                                  <span className="text-[10px] text-slate-600 mr-1">{catEnabled}/{catFeatures.length}</span>
                                  <ChevronDown className={`h-3.5 w-3.5 text-slate-700 transition-transform duration-200 ${isCatCollapsed ? '-rotate-90' : ''}`} />
                                </button>

                                {/* Feature rows */}
                                {!isCatCollapsed && (
                                  <div className="pb-1">
                                    {catFeatures.map((feature) => {
                                      const pf = getPlanFeature(feature.feature_key, plan);
                                      const isEnabled = pf?.is_enabled ?? false;
                                      const isSaving = saving === `${feature.feature_key}-${plan}`;

                                      return (
                                        <div
                                          key={feature.feature_key}
                                          className="flex items-center gap-3 px-5 py-2 ml-10 mr-3 rounded-lg hover:bg-slate-800/30 transition-colors"
                                        >
                                          <Switch
                                            checked={isEnabled}
                                            onCheckedChange={() => togglePlanFeature(feature.feature_key, plan, isEnabled)}
                                            disabled={isSaving}
                                            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500/60 flex-shrink-0 scale-90"
                                          />
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-medium ${isEnabled ? "text-slate-200" : "text-slate-500"}`}>
                                              {feature.feature_name}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            {pf?.usage_limit && (
                                              <Badge className="text-[9px] bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                {pf.usage_limit}/{pf.limit_period}
                                              </Badge>
                                            )}
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                              feature.status === "active" ? "bg-green-500" :
                                              feature.status === "disabled" ? "bg-red-500" :
                                              feature.status === "development" ? "bg-blue-500" :
                                              feature.status === "maintenance" ? "bg-amber-500" :
                                              "bg-gray-500"
                                            }`} />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* =====================================================
                TAB: USERS
                ===================================================== */}
            {activeTab === "status" && (
              <AdminStatusTab />
            )}

            {activeTab === "users" && (
              <div className="space-y-2">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum cliente encontrado.</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => {
                    const planCfg = PLAN_CONFIG[user.plan] || PLAN_CONFIG.starter;
                    const PlanIcon = planCfg.icon;
                    const isExpanded = expandedUser === user.user_id;

                    return (
                      <div
                        key={user.user_id}
                        className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
                      >
                        <button
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors"
                          onClick={() => setExpandedUser(isExpanded ? null : user.user_id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              user.plan === "starter" ? "bg-blue-500/10" :
                              user.plan === "professional" ? "bg-primary/10" :
                              "bg-purple-500/10"
                            }`}>
                              <Building2 className={`h-5 w-5 ${planCfg.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {user.company_name || user.full_name || "Sem nome"}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{user.email || user.user_id}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge className={`text-[10px] border ${
                              user.plan === "starter" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                              user.plan === "professional" ? "bg-primary/10 text-primary border-primary/20" :
                              "bg-purple-500/10 text-purple-500 border-purple-500/20"
                            }`}>
                              <PlanIcon className="h-3 w-3 mr-1" />
                              {planCfg.label}
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-slate-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-slate-800 p-4 space-y-4">
                            {/* User details */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Nome</p>
                                <p className="text-xs text-white">{user.full_name || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Email</p>
                                <p className="text-xs text-white truncate">{user.email || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Cadastro</p>
                                <p className="text-xs text-white">
                                  {new Date(user.created_at).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-600 uppercase tracking-wider">Análises</p>
                                <p className="text-xs text-white">
                                  {user.analyses_used}/{user.monthly_analyses_limit === -1 ? "∞" : user.monthly_analyses_limit}
                                </p>
                              </div>
                            </div>

                            {/* Plan control */}
                            <div className="flex items-center gap-3 pt-2 border-t border-slate-800/50">
                              <span className="text-[11px] text-slate-500">Alterar plano:</span>
                              {(["starter", "professional", "enterprise"] as const).map((plan) => {
                                const cfg = PLAN_CONFIG[plan];
                                const isActive = user.plan === plan;
                                const isSaving2 = saving === user.user_id;
                                return (
                                  <Button
                                    key={plan}
                                    size="sm"
                                    variant={isActive ? "default" : "outline"}
                                    className={`h-7 text-[11px] gap-1.5 ${
                                      isActive
                                        ? "bg-primary hover:bg-primary/90"
                                        : "border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                                    }`}
                                    disabled={isActive || isSaving2}
                                    onClick={() => updateUserPlan(user.user_id, plan)}
                                  >
                                    <cfg.icon className="h-3 w-3" />
                                    {cfg.label}
                                  </Button>
                                );
                              })}
                            </div>

                            {/* Feature overrides for this user */}
                            <div className="pt-2 border-t border-slate-800/50">
                              <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-2">
                                Features do plano {PLAN_CONFIG[user.plan]?.label}
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                {features.map((feature) => {
                                  const pf = getPlanFeature(feature.feature_key, user.plan);
                                  const isEnabled = pf?.is_enabled ?? false;
                                  const isFeatureActive = feature.status === "active";
                                  const available = isEnabled && isFeatureActive;
                                  return (
                                    <div
                                      key={feature.feature_key}
                                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] ${
                                        available
                                          ? "text-green-500 bg-green-500/5"
                                          : "text-slate-600 bg-slate-800/30"
                                      }`}
                                    >
                                      {available ? (
                                        <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                                      ) : (
                                        <XCircle className="h-3 w-3 flex-shrink-0" />
                                      )}
                                      <span className="truncate">{feature.feature_name}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
