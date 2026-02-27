import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Home,
  LayoutDashboard,
  FolderOpen,
  Target,
  BarChart3,
  ChevronLeft,
  ChevronDown,
  Users,
  Lightbulb,
  Crosshair,
  ShieldAlert,
  Megaphone,
  Plug,
  Sparkles,
  Globe,
  Activity,
  FileText,
  LogOut,
  Settings,
  HelpCircle,
  MessageCircle,
  X,
  Brain,
  PenSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;           // opcional para grupos
  children?: NavItem[];    // subitems (cria grupo)
  active?: boolean;
  featureKey?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Estratégico",
    items: [
      { icon: Home, label: "Início", href: "/home" },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
      {
        icon: FolderOpen,
        label: "Projetos",
        children: [
          { icon: FolderOpen, label: "Visão Geral", href: "/projects" },
          { icon: FileText, label: "Análise Heurística", href: "/heuristic-analysis" },
        ],
      },
      {
        icon: Target,
        label: "Públicos-Alvo",
        children: [
          { icon: Target, label: "Visão Geral", href: "/audiences" },
          { icon: Brain, label: "Refinar ICP", href: "/dashboard/audiences/refinar-icp" },
          { icon: PenSquare, label: "Plano de Comunicação", href: "/dashboard/audiences/plano-comunicacao" },
        ],
      },
      { icon: BarChart3, label: "Benchmark", href: "/benchmark" },
      { icon: Lightbulb, label: "Insights", href: "/insights" },
      { icon: FileText, label: "Relatórios", href: "/reports" },
      {
        icon: Globe,
        label: "SEO",
        children: [
          { icon: Globe, label: "SEO & Performance", href: "/seo-geo", featureKey: "seo_analysis" },
          { icon: Activity, label: "Monitoramento SEO", href: "/seo-monitoring", featureKey: "performance_monitoring" },
        ],
      },
    ],
  },
  {
    title: "Tático",
    items: [
      { icon: Crosshair, label: "Plano Tático", href: "/tactical" },
      { icon: ShieldAlert, label: "Alertas", href: "/alertas" },
    ],
  },
  {
    title: "Operacional",
    items: [
      { icon: Megaphone, label: "Operações", href: "/operations" },
      { icon: Plug, label: "Integrações", href: "/integracoes" },
      { icon: Sparkles, label: "Loja de Apps", href: "/apps" },
    ],
  },
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: "Configurações", href: "/settings" },
  { icon: HelpCircle, label: "Ajuda", href: "/help" },
  { icon: MessageCircle, label: "Suporte", href: "/support" },
  { icon: LogOut, label: "Sair", href: "/logout" },
];

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

type SidebarWorkspaceCache = {
  tenantName: string;
  projectCount: number;
  fetchedAt: number;
};

const WORKSPACE_CACHE_TTL_MS = 2 * 60 * 1000;
const workspaceCache = new Map<string, SidebarWorkspaceCache>();

export function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(navSections.map((s) => [s.title, true]))
  );
  const [projectCount, setProjectCount] = useState(0);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuth();
  const { isFeatureAvailable } = useFeatureFlags();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      setProjectCount(0);
      setTenantName(null);
      setLoading(false);
      return;
    }

    const cached = workspaceCache.get(userId);
    if (cached) {
      setTenantName(cached.tenantName);
      setProjectCount(cached.projectCount);
      setLoading(false);

      if (Date.now() - cached.fetchedAt >= WORKSPACE_CACHE_TTL_MS) {
        void loadWorkspaceData(userId, { silent: true });
      }
      return;
    }

    void loadWorkspaceData(userId);
  }, [userId]);

  const loadWorkspaceData = async (
    targetUserId: string = userId ?? "",
    options?: { silent?: boolean }
  ) => {
    if (!targetUserId) return;
    const cached = workspaceCache.get(targetUserId);
    const hasWorkspaceData = !!cached || tenantName !== null;

    if (!hasWorkspaceData && !options?.silent) {
      setLoading(true);
    }
    try {
      // Load tenant settings
      const { data: tenant } = await (supabase as any)
        .from("tenant_settings")
        .select("company_name")
        .eq("user_id", targetUserId)
        .single();

      const nextTenantName = tenant?.company_name || "Minha Empresa";
      setTenantName(nextTenantName);

      // Load project count
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", targetUserId);

      const nextProjectCount = count || 0;
      setProjectCount(nextProjectCount);
      workspaceCache.set(targetUserId, {
        tenantName: nextTenantName,
        projectCount: nextProjectCount,
        fetchedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error loading workspace data:", error);
      setTenantName((prev) => prev ?? cached?.tenantName ?? "Minha Empresa");
      setProjectCount((prev) => prev || cached?.projectCount || 0);
    } finally {
      if (!hasWorkspaceData) {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Redirecionar para login será feito automaticamente pelo useAuth
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <TooltipProvider>
      <>
        {/* Mobile backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onMobileClose}
          />
        )}
        <aside className={cn(
          "bg-sidebar border-r border-sidebar-border h-screen flex flex-col transition-all duration-300",
          // Mobile: fixed overlay, hidden by default
          "fixed inset-y-0 left-0 z-50 lg:relative lg:z-30",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-16" : "w-64"
        )}>
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-sidebar-border relative">
            {!collapsed && (
              <span className="text-lg font-extrabold tracking-tight text-sidebar-foreground">
                intentia<span className="text-primary">.</span>
              </span>
            )}
            {collapsed && (
              <div className="mx-auto cursor-pointer"
                onClick={() => setCollapsed(false)}
                title="Abrir Menu - Intentia Strategy Hub">
                <span className="text-lg font-extrabold tracking-tight text-sidebar-foreground">
                  i<span className="text-primary">.</span>
                </span>
              </div>
            )}
            {/* Close button on mobile, collapse on desktop */}
            {!collapsed && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 lg:hidden"
                  onClick={onMobileClose}
                  aria-label="Fechar menu"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hidden lg:flex"
                  onClick={() => setCollapsed(true)}
                  aria-label="Recolher menu"
                >
                  <ChevronLeft className="h-4 w-4 transition-transform" />
                </Button>
              </>
            )}
          </div>

          {/* Workspace */}
          {!collapsed && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {loading ? (
                      <span className="animate-pulse bg-muted h-4 w-24 rounded inline-block"></span>
                    ) : (
                      tenantName || "Carregando..."
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {loading ? (
                      <span className="animate-pulse bg-muted h-3 w-16 rounded inline-block"></span>
                    ) : (
                      `${projectCount} projeto${projectCount !== 1 ? 's' : ''}`
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden sidebar-scroll">
            {navSections.map((section) => {
              const isOpen = expandedSections[section.title] ?? true;
              return (
                <div key={section.title} className="mb-1">
                  {!collapsed ? (
                    <button
                      onClick={() => setExpandedSections((prev) => ({ ...prev, [section.title]: !prev[section.title] }))}
                      className="w-full flex items-center justify-between px-3 pt-3 pb-1 group/section"
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest">
                        {section.title}
                      </span>
                      <ChevronDown className={cn(
                        "h-3 w-3 text-muted-foreground/50 transition-transform duration-200",
                        !isOpen && "-rotate-90"
                      )} />
                    </button>
                  ) : (
                    <div className="mx-auto my-2 w-6 border-t border-sidebar-border" />
                  )}
                  {(collapsed || isOpen) && (
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        // ── GRUPO com children (ex: SEO) ──────────────────
                        if (item.children) {
                          const visibleChildren = item.children.filter(
                            (c) => !c.featureKey || isFeatureAvailable(c.featureKey)
                          );
                          if (visibleChildren.length === 0) return null;

                          const isGroupActive = visibleChildren.some((c) => c.href && location.pathname === c.href);

                          if (collapsed) {
                            // Flyout via HoverCard
                            return (
                              <HoverCard key={item.label} openDelay={100} closeDelay={150}>
                                <HoverCardTrigger asChild>
                                  <button
                                    className={cn(
                                      "flex w-full items-center justify-center px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                      isGroupActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:-translate-y-0.5"
                                    )}
                                  >
                                    <item.icon className="h-5 w-5 flex-shrink-0" />
                                  </button>
                                </HoverCardTrigger>
                                <HoverCardContent
                                  side="right"
                                  align="start"
                                  className="w-44 p-1.5 border-primary/40"
                                >
                                  <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest px-2 pb-1">
                                    {item.label}
                                  </p>
                                  {visibleChildren.map((child) => (
                                    <Link
                                      key={child.href}
                                      to={child.href!}
                                      onClick={onMobileClose}
                                      className={cn(
                                        "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                                        location.pathname === child.href
                                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                      )}
                                    >
                                      <child.icon className="h-4 w-4 flex-shrink-0" />
                                      {child.label}
                                    </Link>
                                  ))}
                                </HoverCardContent>
                              </HoverCard>
                            );
                          }

                          // Expandido: subseção colapsável
                          const [groupOpen, setGroupOpen] = [expandedSections[`grp_${item.label}`] ?? true,
                          (v: boolean) => setExpandedSections((p) => ({ ...p, [`grp_${item.label}`]: v }))];
                          return (
                            <div key={item.label}>
                              <button
                                onClick={() => setGroupOpen(!groupOpen)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50"
                              >
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isGroupActive && "text-primary")} />
                                <span className="flex-1 text-left">{item.label}</span>
                                <ChevronDown className={cn(
                                  "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                                  !groupOpen && "-rotate-90"
                                )} />
                              </button>
                              {groupOpen && (
                                <div className="ml-3 pl-3 border-l border-primary/30 space-y-0.5 mt-0.5">
                                  {visibleChildren.map((child) => (
                                    <Link
                                      key={child.href}
                                      to={child.href!}
                                      onClick={onMobileClose}
                                      className={cn(
                                        "flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                        location.pathname === child.href
                                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                                      )}
                                    >
                                      <child.icon className="h-4 w-4 flex-shrink-0" />
                                      {child.label}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // ── ITEM NORMAL ───────────────────────────────────
                        if (item.featureKey && !isFeatureAvailable(item.featureKey)) return null;
                        const isActive = item.href ? location.pathname === item.href : false;
                        const linkEl = (
                          <Link
                            key={item.href}
                            to={item.href!}
                            onClick={onMobileClose}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                              isActive
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                              collapsed && "justify-center px-2 hover:-translate-y-0.5 hover:shadow-md"
                            )}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                          </Link>
                        );
                        if (collapsed) {
                          return (
                            <Tooltip key={item.href} delayDuration={100}>
                              <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                              <TooltipContent side="right" className="text-xs font-medium border-primary/40">
                                {item.label}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }
                        return linkEl;
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Bottom Nav with Tooltip */}
          <div className={cn(
            "flex items-center justify-center gap-1 p-2 border-t border-sidebar-border",
            collapsed ? "flex-col" : "flex-row"
          )}>
            {bottomNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              const isLogout = item.href === "/logout";
              const iconEl = isLogout ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all duration-200",
                    "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:-translate-y-0.5 hover:shadow-md"
                  )}
                  onClick={handleLogout}
                  aria-label="Sair"
                >
                  <item.icon className="h-4.5 w-4.5" />
                </Button>
              ) : (
                <Link
                  to={item.href}
                  onClick={onMobileClose}
                  className={cn(
                    "flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                  aria-label={item.label}
                >
                  <item.icon className="h-4.5 w-4.5" />
                </Link>
              );
              return (
                <Tooltip key={item.href} delayDuration={100}>
                  <TooltipTrigger asChild>{iconEl}</TooltipTrigger>
                  <TooltipContent side={collapsed ? "right" : "top"} className="text-xs font-medium border-primary/40">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </aside>
      </>
    </TooltipProvider>
  );
}
