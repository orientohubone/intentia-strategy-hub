import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Target, 
  BarChart3, 
  ChevronLeft, 
  Users, 
  Lightbulb, 
  LogOut, 
  Settings, 
  HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "Projetos", href: "/projects" },
  { icon: Target, label: "Públicos-Alvo", href: "/audiences" },
  { icon: BarChart3, label: "Benchmark", href: "/benchmark" },
  { icon: Lightbulb, label: "Insights", href: "/insights" },
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: "Configurações", href: "/settings" },
  { icon: HelpCircle, label: "Ajuda", href: "/help" },
  { icon: LogOut, label: "Sair", href: "/logout" },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    loadWorkspaceData();
  }, [user]);

  const loadWorkspaceData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load tenant settings
      const { data: tenant } = await (supabase as any)
        .from("tenant_settings")
        .select("company_name")
        .eq("user_id", user.id)
        .single();

      if (tenant && tenant?.company_name) {
        setTenantName(tenant.company_name);
      } else {
        setTenantName("Minha Empresa");
      }

      // Load project count
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setProjectCount(count || 0);
    } catch (error) {
      console.error("Error loading workspace data:", error);
      setTenantName("Minha Empresa");
    } finally {
      setLoading(false);
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
    <aside className={cn(
      "bg-sidebar border-r border-sidebar-border h-screen flex flex-col transition-all duration-300",
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
        {!collapsed && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setCollapsed(true)}
          >
            <ChevronLeft className="h-4 w-4 transition-transform" />
          </Button>
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
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Menu Principal
            </p>
          )}
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-2 border-t border-sidebar-border">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.href;
          const isLogout = item.href === "/logout";
          
          return (
            <div key={item.href}>
              {isLogout ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={handleLogout}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Button>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
