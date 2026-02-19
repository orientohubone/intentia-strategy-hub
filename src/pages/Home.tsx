import { useCallback, useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { OnboardingChecklist } from "@/components/OnboardingChecklist";
import { ScoreRing } from "@/components/ScoreRing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Target,
  BarChart3,
  Zap,
  Lightbulb,
  Crosshair,
  Megaphone,
  Plug,
  Globe,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Clock,
  Bell,
  GripVertical,
} from "lucide-react";
import { useTenantData } from "@/hooks/useTenantData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type QuickAction = {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
};

const quickActions: QuickAction[] = [
  {
    icon: FolderOpen,
    label: "Novo Projeto",
    description: "Crie um projeto e analise uma URL",
    href: "/projects",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    label: "Benchmark",
    description: "Compare com concorrentes",
    href: "/benchmark",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: Target,
    label: "Públicos-Alvo",
    description: "Mapeie e refine seu ICP",
    href: "/audiences",
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Crosshair,
    label: "Plano Tático",
    description: "Estruture campanhas por canal",
    href: "/tactical",
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: Megaphone,
    label: "Operações",
    description: "Gerencie campanhas e budget",
    href: "/operations",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Globe,
    label: "SEO & Performance",
    description: "Analise SEO e PageSpeed",
    href: "/seo-geo",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Plug,
    label: "Integrações",
    description: "Conecte contas de mídia",
    href: "/integracoes",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Lightbulb,
    label: "Insights",
    description: "Veja alertas e oportunidades",
    href: "/insights",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
];

type RecentActivity = {
  id: string;
  type: "project" | "insight" | "campaign" | "benchmark";
  title: string;
  description: string;
  time: string;
};

type HomeStatsCache = {
  audiencesCount: number;
  benchmarksCount: number;
  totalInsightsCount: number;
  hasAiKey: boolean;
  notificationsCount: number;
};

const HOME_CACHE_TTL = 1000 * 60 * 2;
const homeStatsCache = new Map<string, { data: HomeStatsCache; timestamp: number }>();
const homeStatsInFlight = new Map<string, Promise<HomeStatsCache>>();
const homeActivityCache = new Map<string, { data: RecentActivity[]; timestamp: number }>();
const homeActivityInFlight = new Map<string, Promise<RecentActivity[]>>();
const HOME_BLOCKS_STORAGE_KEY_PREFIX = "home:block-order";
const HOME_BLOCKS_DEFAULT_ORDER = ["checklist", "quick", "activity"] as const;
type HomeBlockId = typeof HOME_BLOCKS_DEFAULT_ORDER[number];

const isValidHomeBlockOrder = (order: unknown): order is HomeBlockId[] => {
  if (!Array.isArray(order)) return false;
  if (order.length !== HOME_BLOCKS_DEFAULT_ORDER.length) return false;
  const asSet = new Set(order);
  return HOME_BLOCKS_DEFAULT_ORDER.every((id) => asSet.has(id));
};

export default function Home() {
  const { user } = useAuth();
  const userId = user?.id;
  const { projects, loading } = useTenantData();
  const navigate = useNavigate();

  const [statsLoading, setStatsLoading] = useState(true);
  const [audiencesCount, setAudiencesCount] = useState(0);
  const [benchmarksCount, setBenchmarksCount] = useState(0);
  const [totalInsightsCount, setTotalInsightsCount] = useState(0);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [activityLoading, setActivityLoading] = useState(true);
  const [homeBlocksOrder, setHomeBlocksOrder] = useState<HomeBlockId[]>([
    ...HOME_BLOCKS_DEFAULT_ORDER,
  ]);
  const [homeBlocksLoaded, setHomeBlocksLoaded] = useState(false);
  const [draggingBlockId, setDraggingBlockId] = useState<HomeBlockId | null>(null);
  const [isDraggingBlock, setIsDraggingBlock] = useState(false);
  const blockDragStartPos = useRef({ x: 0, y: 0 });
  const blockDragMovedRef = useRef(false);

  const fullName = (user?.user_metadata?.full_name as string | undefined) || user?.email || "Usuário";
  const hasAvatar = !!(user?.user_metadata?.avatar_url);
  const isNextStepsLoading = loading || statsLoading;
  const homeBlocksStorageKey = `${HOME_BLOCKS_STORAGE_KEY_PREFIX}:${userId || "guest"}`;

  const averageScore = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.score, 0) / projects.length)
    : 0;

  const moveBlock = useCallback((sourceId: HomeBlockId, targetId: HomeBlockId) => {
    if (sourceId === targetId) return;
    setHomeBlocksOrder((prev) => {
      const sourceIndex = prev.indexOf(sourceId);
      const targetIndex = prev.indexOf(targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const next = [...prev];
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, sourceId);
      return next;
    });
  }, []);

  const handleBlockMouseDown = (e: React.MouseEvent, blockId: HomeBlockId) => {
    setDraggingBlockId(blockId);
    setIsDraggingBlock(true);
    blockDragMovedRef.current = false;
    blockDragStartPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBlockMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingBlock || !draggingBlockId) return;
      const deltaX = e.clientX - blockDragStartPos.current.x;
      const deltaY = e.clientY - blockDragStartPos.current.y;
      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        blockDragMovedRef.current = true;
      }
    },
    [isDraggingBlock, draggingBlockId]
  );

  const handleBlockMouseUp = useCallback(() => {
    setIsDraggingBlock(false);
    setDraggingBlockId(null);
    blockDragMovedRef.current = false;
  }, []);

  const handleBlockHover = useCallback(
    (targetId: HomeBlockId) => {
      if (!isDraggingBlock || !draggingBlockId || !blockDragMovedRef.current) return;
      if (draggingBlockId === targetId) return;
      moveBlock(draggingBlockId, targetId);
    },
    [isDraggingBlock, draggingBlockId, moveBlock]
  );

  useEffect(() => {
    if (!userId) {
      setStatsLoading(false);
      setActivityLoading(false);
      return;
    }

    const applyStats = (data: HomeStatsCache) => {
      setAudiencesCount(data.audiencesCount);
      setBenchmarksCount(data.benchmarksCount);
      setTotalInsightsCount(data.totalInsightsCount);
      setHasAiKey(data.hasAiKey);
      setNotificationsCount(data.notificationsCount);
    };

    const loadStats = async () => {
      if (homeStatsInFlight.has(userId)) return homeStatsInFlight.get(userId)!;

      const loadPromise = (async () => {
        const [audiences, benchmarks, insights, aiKeys, notifications] = await Promise.all([
          supabase.from("audiences").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("benchmarks").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("insights").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("user_api_keys").select("*", { count: "exact", head: true }).eq("user_id", userId),
          supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("read", false),
        ]);

        const next: HomeStatsCache = {
          audiencesCount: audiences.count || 0,
          benchmarksCount: benchmarks.count || 0,
          totalInsightsCount: insights.count || 0,
          hasAiKey: (aiKeys.count || 0) > 0,
          notificationsCount: notifications.count || 0,
        };
        homeStatsCache.set(userId, { data: next, timestamp: Date.now() });
        return next;
      })();

      homeStatsInFlight.set(userId, loadPromise);
      try {
        return await loadPromise;
      } finally {
        homeStatsInFlight.delete(userId);
      }
    };

    const loadRecentActivity = async () => {
      if (homeActivityInFlight.has(userId)) return homeActivityInFlight.get(userId)!;

      const loadPromise = (async () => {
        const activities: RecentActivity[] = [];

        const { data: recentProjects } = await supabase
          .from("projects")
          .select("id, name, status, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(3);

        (recentProjects || []).forEach((p: { id: string; name: string; status: string; updated_at: string }) => {
          activities.push({
            id: `project-${p.id}`,
            type: "project",
            title: p.name,
            description: p.status === "completed" ? "Análise concluída" : p.status === "analyzing" ? "Em análise" : "Pendente",
            time: formatRelativeTime(p.updated_at),
          });
        });

        const { data: recentInsights } = await supabase
          .from("insights")
          .select("id, title, type, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(3);

        (recentInsights || []).forEach((i: { id: string; title: string; type: "warning" | "opportunity" | "improvement"; created_at: string }) => {
          activities.push({
            id: `insight-${i.id}`,
            type: "insight",
            title: i.title,
            description: i.type === "warning" ? "Alerta" : i.type === "opportunity" ? "Oportunidade" : "Melhoria",
            time: formatRelativeTime(i.created_at),
          });
        });

        const next = activities.slice(0, 5);
        homeActivityCache.set(userId, { data: next, timestamp: Date.now() });
        return next;
      })();

      homeActivityInFlight.set(userId, loadPromise);
      try {
        return await loadPromise;
      } finally {
        homeActivityInFlight.delete(userId);
      }
    };

    const cachedStats = homeStatsCache.get(userId);
    const hasFreshStats = !!cachedStats && Date.now() - cachedStats.timestamp < HOME_CACHE_TTL;
    if (hasFreshStats) {
      applyStats(cachedStats.data);
      setStatsLoading(false);
    } else {
      setStatsLoading(true);
    }

    const cachedActivity = homeActivityCache.get(userId);
    const hasFreshActivity = !!cachedActivity && Date.now() - cachedActivity.timestamp < HOME_CACHE_TTL;
    if (hasFreshActivity) {
      setRecentActivity(cachedActivity.data);
      setActivityLoading(false);
    } else {
      setActivityLoading(true);
    }

    let active = true;

    loadStats()
      .then((data) => {
        if (!active) return;
        applyStats(data);
      })
      .catch((err) => {
        console.error("Error fetching home stats:", err);
      })
      .finally(() => {
        if (!active) return;
        setStatsLoading(false);
      });

    loadRecentActivity()
      .then((data) => {
        if (!active) return;
        setRecentActivity(data);
      })
      .catch((err) => {
        console.error("Error fetching recent activity:", err);
      })
      .finally(() => {
        if (!active) return;
        setActivityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(homeBlocksStorageKey);
    if (!stored) {
      setHomeBlocksOrder([...HOME_BLOCKS_DEFAULT_ORDER]);
      setHomeBlocksLoaded(true);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (isValidHomeBlockOrder(parsed)) {
        setHomeBlocksOrder(parsed);
        setHomeBlocksLoaded(true);
        return;
      }
    } catch {
      // no-op
    }
    setHomeBlocksOrder([...HOME_BLOCKS_DEFAULT_ORDER]);
    setHomeBlocksLoaded(true);
  }, [homeBlocksStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!homeBlocksLoaded) return;
    window.localStorage.setItem(homeBlocksStorageKey, JSON.stringify(homeBlocksOrder));
  }, [homeBlocksOrder, homeBlocksStorageKey, homeBlocksLoaded]);

  useEffect(() => {
    if (!isDraggingBlock) return;

    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleBlockMouseMove);
    document.addEventListener("mouseup", handleBlockMouseUp);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.removeEventListener("mousemove", handleBlockMouseMove);
      document.removeEventListener("mouseup", handleBlockMouseUp);
    };
  }, [isDraggingBlock, handleBlockMouseMove, handleBlockMouseUp]);

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min atrás`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "ontem";
    if (days < 7) return `${days} dias atrás`;
    return new Date(iso).toLocaleDateString("pt-BR");
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "project": return FolderOpen;
      case "insight": return Lightbulb;
      case "campaign": return Megaphone;
      case "benchmark": return BarChart3;
    }
  };

  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "project": return "text-blue-500 bg-blue-500/10";
      case "insight": return "text-amber-500 bg-amber-500/10";
      case "campaign": return "text-red-500 bg-red-500/10";
      case "benchmark": return "text-emerald-500 bg-emerald-500/10";
    }
  };

  const blockLabels: Record<HomeBlockId, string> = {
    checklist: "Checklist",
    quick: "Resumo e Atalhos",
    activity: "Atividade e Próximos Passos",
  };

  const getBlockOrder = (blockId: HomeBlockId) => {
    const idx = homeBlocksOrder.indexOf(blockId);
    return idx === -1 ? HOME_BLOCKS_DEFAULT_ORDER.indexOf(blockId) : idx;
  };

  return (
    <DashboardLayout>
      <SEO title="Início" noindex />
      <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">

        {/* Welcome Section */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-6">
          <div className="flex-1 relative overflow-hidden rounded-2xl gradient-primary p-5 sm:p-8 shadow-lg">
            <div className="absolute inset-0">
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-black/10 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h1 className="text-xl sm:text-2xl font-bold text-primary-foreground">
                Olá, {fullName}
              </h1>
              <p className="text-sm sm:text-base text-primary-foreground/80 mt-1">
                Sua central de inteligência estratégica para decisões de marketing mais assertivas.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 card-elevated shrink-0">
            <ScoreRing score={averageScore} size="md" label="Score Médio" />
            <div className="pl-4 border-l border-border">
              <p className="text-sm text-muted-foreground">Prontidão Geral</p>
              <p className="text-lg font-semibold text-foreground">
                {averageScore >= 70 ? "Alta" : averageScore >= 50 ? "Moderada" : "Baixa"}
              </p>
              <p className="text-xs text-muted-foreground">{projects.length} projetos ativos</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
        {/* Onboarding Checklist */}
        <section
          className={cn(
            "space-y-2 rounded-xl transition-colors",
            isDraggingBlock && draggingBlockId === "checklist" && "opacity-80 ring-2 ring-primary/30"
          )}
          style={{ order: getBlockOrder("checklist") }}
          onMouseEnter={() => handleBlockHover("checklist")}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onMouseDown={(e) => handleBlockMouseDown(e, "checklist")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-grab active:cursor-grabbing"
              aria-label={`Reorganizar bloco ${blockLabels.checklist}`}
            >
              <GripVertical className="h-3.5 w-3.5" />
              {blockLabels.checklist}
            </button>
          </div>
          {(loading || statsLoading) ? (
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex-shrink-0 w-[140px] sm:w-[160px] rounded-xl border border-border p-3 sm:p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-muted mb-3" />
                  <div className="h-3 w-20 bg-muted rounded mb-2" />
                  <div className="h-2 w-full bg-muted rounded mb-1" />
                  <div className="h-2 w-2/3 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : (
            <OnboardingChecklist
              data={{
                projectsCount: projects.length,
                hasAnalysis: projects.some((p) => p.status === "completed"),
                hasAiKey,
                benchmarksCount,
                audiencesCount,
                hasAvatar,
              }}
            />
          )}
        </section>

        {/* Quick Stats + Quick Actions */}
        <section
          className={cn(
            "space-y-2 rounded-xl transition-colors",
            isDraggingBlock && draggingBlockId === "quick" && "opacity-80 ring-2 ring-primary/30"
          )}
          style={{ order: getBlockOrder("quick") }}
          onMouseEnter={() => handleBlockHover("quick")}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onMouseDown={(e) => handleBlockMouseDown(e, "quick")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-grab active:cursor-grabbing"
              aria-label={`Reorganizar bloco ${blockLabels.quick}`}
            >
              <GripVertical className="h-3.5 w-3.5" />
              {blockLabels.quick}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

          {/* Quick Stats */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Resumo</h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                { label: "Projetos", value: projects.length, icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Públicos", value: audiencesCount, icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
                { label: "Benchmarks", value: benchmarksCount, icon: BarChart3, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                { label: "Insights", value: totalInsightsCount, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
                  <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-4.5 w-4.5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">
                      {statsLoading ? <span className="inline-block w-6 h-5 bg-muted rounded animate-pulse" /> : stat.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Acesso Rápido</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {quickActions.map((action) => (
                <button
                  key={action.href}
                  onClick={() => navigate(action.href)}
                  className="flex flex-col items-start p-3.5 rounded-xl border border-border bg-card hover:bg-muted/40 hover:border-primary/20 transition-all group text-left"
                >
                  <div className={`w-9 h-9 rounded-lg ${action.bgColor} flex items-center justify-center mb-2.5`}>
                    <action.icon className={`h-4.5 w-4.5 ${action.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {action.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
          </div>
        </section>

        {/* Recent Activity + Tips */}
        <section
          className={cn(
            "space-y-2 rounded-xl transition-colors",
            isDraggingBlock && draggingBlockId === "activity" && "opacity-80 ring-2 ring-primary/30"
          )}
          style={{ order: getBlockOrder("activity") }}
          onMouseEnter={() => handleBlockHover("activity")}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onMouseDown={(e) => handleBlockMouseDown(e, "activity")}
              className="inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/40 cursor-grab active:cursor-grabbing"
              aria-label={`Reorganizar bloco ${blockLabels.activity}`}
            >
              <GripVertical className="h-3.5 w-3.5" />
              {blockLabels.activity}
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">

          {/* Recent Activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Atividade Recente</h2>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                Ver Dashboard
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="rounded-xl border border-border bg-card divide-y divide-border">
              {activityLoading && (
                <div className="divide-y divide-border">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="px-4 py-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted" />
                        <div className="flex-1">
                          <div className="h-3 w-32 bg-muted rounded mb-1.5" />
                          <div className="h-2 w-20 bg-muted rounded" />
                        </div>
                        <div className="h-2 w-12 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!activityLoading && recentActivity.length === 0 && (
                <div className="flex flex-col items-center text-center py-8 px-4">
                  <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-medium text-foreground mb-1">Nenhuma atividade ainda</p>
                  <p className="text-[11px] text-muted-foreground">Crie seu primeiro projeto para começar.</p>
                </div>
              )}
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                const [iconColor, bgColor] = colorClass.split(" ");
                return (
                  <div key={activity.id} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-4 w-4 ${iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{activity.title}</p>
                        <p className="text-[10px] text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{activity.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips & Next Steps */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Próximos Passos</h2>
            <div className="space-y-2.5">
              {!isNextStepsLoading && projects.length === 0 && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => navigate("/projects")}
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Crie seu primeiro projeto</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Insira a URL do seu negócio B2B e receba um diagnóstico completo em segundos.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              )}
              {!isNextStepsLoading && projects.length > 0 && !projects.some((p) => p.status === "completed") && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => navigate("/projects")}
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Analise a URL do seu projeto</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Você tem projetos pendentes. Execute a análise para receber scores e insights.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              )}
              {!isNextStepsLoading && projects.some((p) => p.status === "completed") && !hasAiKey && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/30 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => navigate("/settings")}
                >
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <Sparkles className="h-4.5 w-4.5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Configure IA para análises profundas</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Adicione sua API key do Gemini ou Claude para desbloquear análises por IA.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              )}
              {!isNextStepsLoading && benchmarksCount === 0 && projects.some((p) => p.status === "completed") && (
                <div
                  className="flex items-start gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30 cursor-pointer hover:shadow-sm transition-shadow"
                  onClick={() => navigate("/benchmark")}
                >
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Compare com concorrentes</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Execute um benchmark SWOT para descobrir vantagens e gaps competitivos.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              )}
              {/* Always show dashboard link */}
              <div
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card cursor-pointer hover:bg-muted/40 hover:shadow-sm transition-all"
                onClick={() => navigate("/dashboard")}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Acessar Dashboard Completo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Projetos, campanhas, insights, canais e exportações em um painel operacional.
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              </div>
            </div>
          </div>
          </div>
        </section>
        </div>
      </div>
    </DashboardLayout>
  );
}



