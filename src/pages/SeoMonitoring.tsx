import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getScoreColor } from "@/lib/pagespeedApi";
import { getSeoLiveMonitoringConfig, setSeoLiveMonitoringConfig } from "@/lib/seoLiveMonitoring";
import { SeoMonitoringRunCard } from "@/components/SeoMonitoringRunCard";
import { Activity, ArrowLeft, ChevronDown, Clock, RefreshCw, Radar, Search, Smartphone, Monitor } from "lucide-react";

export default function SeoMonitoring() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [runStage, setRunStage] = useState<"queueing" | "processing" | "refreshing" | "done">("queueing");
  const [timelineStrategyFilter, setTimelineStrategyFilter] = useState<"all" | "mobile" | "desktop">("all");
  const [timelineOnlyChanges, setTimelineOnlyChanges] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState<Record<string, boolean>>({});
  const [timelineGroupsExpanded, setTimelineGroupsExpanded] = useState<Record<string, boolean>>({});
  const [timelineVisibleCount, setTimelineVisibleCount] = useState(20);

  const [liveEnabled, setLiveEnabled] = useState(false);
  const [liveIntervalSec, setLiveIntervalSec] = useState(300);
  const timelineStateStorageKey = user?.id && selectedProjectId
    ? `seo-monitoring:timeline-state:v1:${user.id}:${selectedProjectId}`
    : "";

  const loadHistory = async (projectId: string) => {
    if (!user?.id || !projectId) return;
    const { data } = await (supabase as any)
      .from("seo_analysis_history")
      .select("id, analyzed_at, strategy, performance_score, seo_score, accessibility_score, best_practices_score, intelligence_data, serp_data")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("analyzed_at", { ascending: false })
      .limit(30);
    setHistoryItems(data || []);
  };

  useEffect(() => {
    if (!user?.id) return;
    void (async () => {
      const { data } = await (supabase as any)
        .from("projects")
        .select("id, name, url, niche, competitor_urls")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setProjects(data || []);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !selectedProjectId) return;
    void (async () => {
      const config = await getSeoLiveMonitoringConfig(user.id, selectedProjectId);
      setLiveEnabled(config.enabled);
      setLiveIntervalSec(config.intervalSec);
      if (config.strategy) setStrategy(config.strategy);
      await loadHistory(selectedProjectId);
    })();
  }, [user?.id, selectedProjectId]);

  useEffect(() => {
    if (!timelineStateStorageKey) return;
    try {
      const raw = window.localStorage.getItem(timelineStateStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.strategyFilter === "all" || parsed?.strategyFilter === "mobile" || parsed?.strategyFilter === "desktop") {
        setTimelineStrategyFilter(parsed.strategyFilter);
      }
      if (typeof parsed?.onlyChanges === "boolean") {
        setTimelineOnlyChanges(parsed.onlyChanges);
      }
      if (Number.isFinite(Number(parsed?.visibleCount))) {
        setTimelineVisibleCount(Math.max(20, Number(parsed.visibleCount)));
      }
      if (parsed?.groupsExpanded && typeof parsed.groupsExpanded === "object") {
        setTimelineGroupsExpanded(parsed.groupsExpanded);
      }
    } catch {
      // ignore invalid persisted state
    }
  }, [timelineStateStorageKey]);

  useEffect(() => {
    setTimelineExpanded({});
  }, [selectedProjectId, timelineStrategyFilter, timelineOnlyChanges]);

  const saveLiveConfig = (enabled: boolean, intervalSec: number) => {
    void setSeoLiveMonitoringConfig(user?.id, selectedProjectId, { enabled, intervalSec, strategy });
  };

  const runMonitoringNow = async () => {
    if (!user?.id || !selectedProjectId || running) return;
    setRunning(true);
    setRunStage("queueing");
    let finishedSuccessfully = false;
    try {
      await (supabase as any)
        .from("seo_monitoring_jobs")
        .insert({
          project_id: selectedProjectId,
          user_id: user.id,
          status: "queued",
          trigger_source: "manual",
          payload: { strategy },
        });
      setRunStage("processing");

      let orchestratorError: string | null = null;

      // Prefer SDK invocation (same auth/session handling as the rest of the app)
      const invokeResult = await (supabase as any).functions.invoke("seo-monitor-orchestrator", {
        body: { action: "run_jobs", limit: 5 },
      });

      if (invokeResult?.error) {
        orchestratorError =
          invokeResult.error?.message ||
          invokeResult.error?.context?.error ||
          "Falha ao invocar orquestrador";
      }

      // Fallback to direct HTTP invoke for edge cases where SDK invocation fails.
      if (orchestratorError) {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        if (!token) throw new Error("Sessao expirada. Faca login novamente.");

        const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "");
        if (!supabaseUrl) throw new Error("VITE_SUPABASE_URL nao configurada.");

        const response = await fetch(`${supabaseUrl}/functions/v1/seo-monitor-orchestrator`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ action: "run_jobs", limit: 5 }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          if (response.status === 546) {
            throw new Error(
              errorData?.error ||
              "Erro 546 no monitoramento. A funcao Edge pode estar indisponivel temporariamente; tente novamente em alguns minutos.",
            );
          }
          throw new Error(errorData?.error || `Erro ao executar monitoramento (${response.status})`);
        }
      }

      setRunStage("refreshing");
      await loadHistory(selectedProjectId);
      setRunStage("done");
      finishedSuccessfully = true;
      window.setTimeout(() => setRunning(false), 900);
      return;
    } finally {
      if (!finishedSuccessfully) setRunning(false);
    }
  };

  useEffect(() => {
    if (!liveEnabled || !selectedProjectId) return;
    const id = window.setInterval(() => {
      void runMonitoringNow();
    }, liveIntervalSec * 1000);
    return () => window.clearInterval(id);
  }, [liveEnabled, liveIntervalSec, selectedProjectId, strategy]);

  useEffect(() => {
    if (!user?.id || !selectedProjectId) return;
    void setSeoLiveMonitoringConfig(user.id, selectedProjectId, {
      enabled: liveEnabled,
      intervalSec: liveIntervalSec,
      strategy,
    });
  }, [user?.id, selectedProjectId, liveEnabled, liveIntervalSec, strategy]);

  useEffect(() => {
    if (!user?.id || !selectedProjectId) return;

    const channel = supabase
      .channel(`seo-monitor-history:${selectedProjectId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "seo_analysis_history",
          filter: `project_id=eq.${selectedProjectId}`,
        },
        () => {
          void loadHistory(selectedProjectId);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user?.id, selectedProjectId]);

  const lastItem = historyItems[0];
  const timelineFilteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      if (timelineStrategyFilter !== "all" && item.strategy !== timelineStrategyFilter) return false;
      if (timelineOnlyChanges) {
        const changes = Array.isArray(item?.intelligence_data?.monitoringInsights?.changes)
          ? item.intelligence_data.monitoringInsights.changes
          : [];
        if (changes.length === 0) return false;
      }
      return true;
    });
  }, [historyItems, timelineOnlyChanges, timelineStrategyFilter]);

  const timelineVisibleItems = useMemo(
    () => timelineFilteredItems.slice(0, timelineVisibleCount),
    [timelineFilteredItems, timelineVisibleCount],
  );

  const timelineGroupedItems = useMemo(() => {
    const groups = new Map<string, any[]>();
    for (const item of timelineVisibleItems) {
      const dayKey = new Date(item.analyzed_at).toLocaleDateString("pt-BR");
      const existing = groups.get(dayKey) || [];
      existing.push(item);
      groups.set(dayKey, existing);
    }
    return Array.from(groups.entries()).map(([day, items]) => ({ day, items }));
  }, [timelineVisibleItems]);

  const timelineHasMore = timelineFilteredItems.length > timelineVisibleCount;

  const toggleTimelineItem = (id: string) => {
    setTimelineExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setTimelineGroupsExpanded((prev) => {
      const next: Record<string, boolean> = {};
      timelineGroupedItems.forEach((group, index) => {
        next[group.day] = prev[group.day] ?? false;
      });
      return next;
    });
  }, [timelineGroupedItems]);

  const toggleTimelineGroup = (day: string) => {
    setTimelineGroupsExpanded((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  const setAllTimelineGroups = (expanded: boolean) => {
    const next: Record<string, boolean> = {};
    timelineGroupedItems.forEach((group) => {
      next[group.day] = expanded;
    });
    setTimelineGroupsExpanded(next);
  };

  useEffect(() => {
    if (!timelineStateStorageKey) return;
    try {
      window.localStorage.setItem(
        timelineStateStorageKey,
        JSON.stringify({
          strategyFilter: timelineStrategyFilter,
          onlyChanges: timelineOnlyChanges,
          visibleCount: timelineVisibleCount,
          groupsExpanded: timelineGroupsExpanded,
        }),
      );
    } catch {
      // ignore storage write errors
    }
  }, [
    timelineStateStorageKey,
    timelineStrategyFilter,
    timelineOnlyChanges,
    timelineVisibleCount,
    timelineGroupsExpanded,
  ]);

  const recentSeoAvg = historyItems.length
    ? Math.round(
      historyItems
        .slice(0, 10)
        .map((h) => Number(h.seo_score) || 0)
        .reduce((a, b) => a + b, 0) / Math.min(10, historyItems.length)
    )
    : null;
  const competitorsInLatest = Array.isArray(lastItem?.intelligence_data?.competitors)
    ? lastItem.intelligence_data.competitors.length
    : 0;
  const changesInLatest = Array.isArray(lastItem?.intelligence_data?.monitoringInsights?.changes)
    ? lastItem.intelligence_data.monitoringInsights.changes.length
    : 0;

  return (
    <DashboardLayout>
      <SEO title="Monitoramento SEO Live" path="/seo-monitoring" />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Monitoramento Inteligente SEO
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoramento contínuo de performance, visibilidade e concorrência com snapshots no histórico.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/seo-geo")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar ao SEO
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="flex-1 min-w-0 lg:min-w-[320px]">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Projeto</label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.filter((p: any) => p.url).map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Dispositivo</label>
                <div className="flex gap-1 bg-muted rounded-lg p-1">
                  <Button size="sm" variant={strategy === "mobile" ? "default" : "ghost"} className="gap-1.5 h-8" onClick={() => setStrategy("mobile")}>
                    <Smartphone className="h-3.5 w-3.5" />
                    Mobile
                  </Button>
                  <Button size="sm" variant={strategy === "desktop" ? "default" : "ghost"} className="gap-1.5 h-8" onClick={() => setStrategy("desktop")}>
                    <Monitor className="h-3.5 w-3.5" />
                    Desktop
                  </Button>
                </div>
              </div>

              <div className="min-w-[250px] lg:min-w-[280px]">
                <label className="text-sm font-medium text-foreground mb-1.5 block">Monitoramento Live</label>
                <div className="flex items-center gap-2">
                  <div className="h-8 px-3 rounded-md border border-border bg-background flex items-center gap-2">
                    <Switch
                      checked={liveEnabled}
                      disabled={!selectedProjectId}
                      onCheckedChange={(checked) => {
                        setLiveEnabled(checked);
                        saveLiveConfig(checked, liveIntervalSec);
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {liveEnabled ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                  <Select
                    value={String(liveIntervalSec)}
                    disabled={!selectedProjectId}
                    onValueChange={(value) => {
                      const next = Number(value);
                      setLiveIntervalSec(next);
                      saveLiveConfig(liveEnabled, next);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue placeholder="Intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="120">2 min</SelectItem>
                      <SelectItem value="300">5 min</SelectItem>
                      <SelectItem value="600">10 min</SelectItem>
                      <SelectItem value="900">15 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="gap-2 shrink-0 whitespace-nowrap" disabled={!selectedProjectId || running} onClick={runMonitoringNow}>
                {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {running ? "Monitorando..." : "Rodar Agora"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {running && (
          <SeoMonitoringRunCard
            projectName={projects.find((p: any) => p.id === selectedProjectId)?.name || "Projeto selecionado"}
            stage={runStage}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Snapshots</CardDescription>
              <CardTitle className="text-2xl">{historyItems.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Média SEO (10 últimos)</CardDescription>
              <CardTitle className={`text-2xl ${recentSeoAvg != null ? getScoreColor(recentSeoAvg) : ""}`}>{recentSeoAvg ?? "-"}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Mudanças detectadas</CardDescription>
              <CardTitle className="text-2xl">{changesInLatest}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Concorrentes (último)</CardDescription>
              <CardTitle className="text-2xl">{competitorsInLatest}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-primary" />
              Timeline de Monitoramento
            </CardTitle>
            <CardDescription>
              Histórico contínuo alimentado pelo live monitoring e por execuções manuais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 mb-4">
              <div className="text-xs text-muted-foreground">
                Exibindo {timelineVisibleItems.length} de {timelineFilteredItems.length} snapshots
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={timelineStrategyFilter}
                  onValueChange={(value: "all" | "mobile" | "desktop") => setTimelineStrategyFilter(value)}
                >
                  <SelectTrigger className="h-8 w-full sm:w-[130px]">
                    <SelectValue placeholder="Dispositivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-8 w-full sm:w-auto px-2 rounded-md border border-border bg-muted/30 flex items-center gap-2">
                  <Switch checked={timelineOnlyChanges} onCheckedChange={setTimelineOnlyChanges} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">So mudancas</span>
                </div>
                <Button variant="outline" size="sm" className="h-8 px-2 w-full sm:w-auto" onClick={() => setAllTimelineGroups(true)}>
                  Expandir tudo
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-2 w-full sm:w-auto" onClick={() => setAllTimelineGroups(false)}>
                  Recolher tudo
                </Button>
              </div>
            </div>

            {timelineFilteredItems.length === 0 ? (
              <div className="text-sm text-muted-foreground py-6">
                Nenhum snapshot encontrado para os filtros atuais.
              </div>
            ) : (
              <div className="space-y-5">
                {timelineGroupedItems.map((group) => (
                  <div key={group.day}>
                    <button
                      type="button"
                      onClick={() => toggleTimelineGroup(group.day)}
                      className="w-full flex items-center justify-between gap-2 mb-2 px-2 py-1.5 rounded-md bg-muted/20 border border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      <p className="text-sm font-semibold text-foreground tracking-wide min-w-0 truncate">{group.day}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline">{group.items.length} registros</Badge>
                        <ChevronDown
                          className={`h-4 w-4 text-muted-foreground transition-transform ${timelineGroupsExpanded[group.day] ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {timelineGroupsExpanded[group.day] && <div className="space-y-2">
                      {group.items.map((item) => {
                        const expanded = !!timelineExpanded[item.id];
                        const changes = Array.isArray(item?.intelligence_data?.monitoringInsights?.changes)
                          ? item.intelligence_data.monitoringInsights.changes
                          : [];
                        const hasChanges = changes.length > 0;
                        const serpPosition = typeof item?.serp_data?.targetPosition === "number" ? item.serp_data.targetPosition : null;

                        return (
                          <div key={item.id} className="rounded-lg border border-border bg-card/70">
                            <button
                              type="button"
                              onClick={() => toggleTimelineItem(item.id)}
                              className="w-full px-3 py-3 text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-muted/20 transition-colors"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground break-words">
                                  {new Date(item.analyzed_at).toLocaleString("pt-BR")}
                                </p>
                                <div className="flex items-center flex-wrap gap-2 mt-1 text-xs">
                                  <Badge variant="outline">{item.strategy}</Badge>
                                  <span className={getScoreColor(Number(item.seo_score) || 0)}>SEO: {item.seo_score ?? "-"}</span>
                                  <span className={getScoreColor(Number(item.performance_score) || 0)}>Perf: {item.performance_score ?? "-"}</span>
                                  {serpPosition != null && <Badge variant="outline">Posicao: {serpPosition}</Badge>}
                                  {hasChanges && <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30">{changes.length} mudancas</Badge>}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                                <Radar className="h-3.5 w-3.5" />
                                {Array.isArray(item.intelligence_data?.competitors)
                                  ? `${item.intelligence_data.competitors.length} concorrentes`
                                  : "Sem concorrencia"}
                                <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                              </div>
                            </button>
                            {expanded && (
                              <div className="px-3 pb-3 border-t border-border/70 pt-2">
                                {hasChanges ? (
                                  <div className="space-y-1">
                                    {changes.slice(0, 8).map((change: string, idx: number) => (
                                      <p key={`${item.id}-change-${idx}`} className="text-xs text-amber-600 dark:text-amber-400">
                                        {change}
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground">Nenhuma mudanca relevante detectada neste ciclo.</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>}
                  </div>
                ))}

                {timelineHasMore && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => setTimelineVisibleCount((prev) => prev + 20)}>
                      Mostrar mais 20
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {Array.isArray(lastItem?.intelligence_data?.competitors) &&
          lastItem.intelligence_data.competitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Snapshots de Concorrentes (último ciclo)</CardTitle>
                <CardDescription>Captura visual rápida para acompanhar mudanças de layout e oferta.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {lastItem.intelligence_data.competitors.slice(0, 6).map((comp: any, index: number) => {
                    const visualSrc = comp.previewImageUrl || comp.screenshotUrl || "";
                    const cardKey = comp.domain || comp.url || `competitor-${index}`;
                    return (
                      <a
                        key={cardKey}
                        href={comp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border overflow-hidden bg-muted/20 hover:border-primary/40 transition-colors"
                      >
                        {visualSrc ? (
                          <img
                            src={visualSrc}
                            alt={comp.domain}
                            className="w-full h-28 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              const next = e.currentTarget.nextElementSibling as HTMLElement | null;
                              if (next) next.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-28 bg-gradient-to-br from-muted to-muted/60 items-center justify-center hidden"
                          style={{ display: visualSrc ? "none" : "flex" }}
                        >
                          <span className="text-2xl font-bold text-muted-foreground">
                            {(comp.domain || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium text-foreground truncate">{comp.domain}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{comp.title || "Sem título"}</p>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </DashboardLayout>
  );
}

