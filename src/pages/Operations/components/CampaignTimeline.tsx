import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  type CalendarCampaign,
  type CampaignChannel,
  CHANNEL_SOLID_COLORS,
  CHANNEL_LABELS,
  CAMPAIGN_STATUS_LABELS,
  STATUS_DOT_COLORS,
  MONTH_LABELS,
  formatCurrency,
} from "@/lib/operationalTypes";

interface CampaignTimelineProps {
  campaigns: CalendarCampaign[];
  filterChannel?: string;
  filterStatus?: string;
}

const WEEKS_VISIBLE = 8;
const DAY_WIDTH = 18;
const ROW_HEIGHT = 28;
const ROW_GAP = 4;

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function diffDays(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export default function CampaignTimeline({ campaigns, filterChannel = "all", filterStatus = "all" }: CampaignTimelineProps) {
  const now = new Date();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [viewStart, setViewStart] = useState(() => {
    const ws = getWeekStart(now);
    ws.setDate(ws.getDate() - 7);
    return ws;
  });

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (!c.start_date) return false;
      if (filterChannel !== "all" && c.channel !== filterChannel) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      return true;
    });
  }, [campaigns, filterChannel, filterStatus]);

  const totalDays = WEEKS_VISIBLE * 7;
  const viewEnd = addDays(viewStart, totalDays);

  const visibleCampaigns = useMemo(() => {
    return filtered.filter((c) => {
      const start = new Date(c.start_date! + "T00:00:00");
      const end = c.end_date ? new Date(c.end_date + "T00:00:00") : addDays(start, 30);
      return start <= viewEnd && end >= viewStart;
    }).sort((a, b) => {
      const aStart = new Date(a.start_date! + "T00:00:00").getTime();
      const bStart = new Date(b.start_date! + "T00:00:00").getTime();
      if (aStart !== bStart) return aStart - bStart;
      return a.channel.localeCompare(b.channel);
    });
  }, [filtered, viewStart, viewEnd]);

  const prevWeeks = () => setViewStart(addDays(viewStart, -14));
  const nextWeeks = () => setViewStart(addDays(viewStart, 14));
  const goToday = () => {
    const ws = getWeekStart(now);
    ws.setDate(ws.getDate() - 7);
    setViewStart(ws);
  };

  // Generate week labels
  const weekLabels = useMemo(() => {
    const labels: { date: Date; label: string; isCurrentWeek: boolean }[] = [];
    for (let w = 0; w < WEEKS_VISIBLE; w++) {
      const weekDate = addDays(viewStart, w * 7);
      const isCurrentWeek = diffDays(now, weekDate) >= 0 && diffDays(now, weekDate) < 7;
      labels.push({
        date: weekDate,
        label: `${weekDate.getDate()}/${weekDate.getMonth() + 1}`,
        isCurrentWeek,
      });
    }
    return labels;
  }, [viewStart, now]);

  // Today line position
  const todayOffset = diffDays(now, viewStart);
  const showTodayLine = todayOffset >= 0 && todayOffset < totalDays;

  // Month header
  const monthHeaders = useMemo(() => {
    const headers: { label: string; startCol: number; span: number }[] = [];
    let currentMonth = -1;
    let currentStart = 0;

    for (let d = 0; d < totalDays; d++) {
      const date = addDays(viewStart, d);
      const m = date.getMonth();
      if (m !== currentMonth) {
        if (currentMonth !== -1) {
          headers.push({ label: `${MONTH_LABELS[currentMonth + 1]} ${addDays(viewStart, currentStart).getFullYear()}`, startCol: currentStart, span: d - currentStart });
        }
        currentMonth = m;
        currentStart = d;
      }
    }
    headers.push({ label: `${MONTH_LABELS[currentMonth + 1]} ${addDays(viewStart, currentStart).getFullYear()}`, startCol: currentStart, span: totalDays - currentStart });
    return headers;
  }, [viewStart, totalDays]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevWeeks}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-[120px] text-center">
            {formatShortDate(viewStart.toISOString().split("T")[0])} — {formatShortDate(addDays(viewStart, totalDays - 1).toISOString().split("T")[0])}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextWeeks}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={goToday}>
          Hoje
        </Button>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto rounded-lg border border-border" ref={scrollRef}>
        <div style={{ minWidth: totalDays * DAY_WIDTH + 160 }}>
          {/* Month headers */}
          <div className="flex border-b border-border bg-muted/30">
            <div className="w-[160px] shrink-0" />
            <div className="flex-1 flex relative">
              {monthHeaders.map((mh, i) => (
                <div
                  key={i}
                  className="text-[10px] font-semibold text-foreground/70 px-1 py-1 border-l border-border/50 first:border-l-0"
                  style={{ width: mh.span * DAY_WIDTH }}
                >
                  {mh.label}
                </div>
              ))}
            </div>
          </div>

          {/* Week headers */}
          <div className="flex border-b border-border bg-muted/20">
            <div className="w-[160px] shrink-0 text-[10px] text-muted-foreground px-2 py-1 font-medium">
              Campanha
            </div>
            <div className="flex-1 flex relative">
              {weekLabels.map((wl, i) => (
                <div
                  key={i}
                  className={`text-[10px] text-center py-1 border-l border-border/30 first:border-l-0 ${
                    wl.isCurrentWeek ? "bg-primary/5 font-semibold text-primary" : "text-muted-foreground"
                  }`}
                  style={{ width: 7 * DAY_WIDTH }}
                >
                  {wl.label}
                </div>
              ))}
            </div>
          </div>

          {/* Campaign rows */}
          {visibleCampaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">Nenhuma campanha com datas neste período.</p>
            </div>
          ) : (
            <div className="relative">
              {visibleCampaigns.map((c) => {
                const start = new Date(c.start_date! + "T00:00:00");
                const end = c.end_date ? new Date(c.end_date + "T00:00:00") : addDays(start, 30);

                const barStartDay = Math.max(0, diffDays(start, viewStart));
                const barEndDay = Math.min(totalDays, diffDays(end, viewStart) + 1);
                const barWidth = Math.max(1, barEndDay - barStartDay);

                const clippedLeft = diffDays(start, viewStart) < 0;
                const clippedRight = diffDays(end, viewStart) >= totalDays;

                return (
                  <div key={c.id} className="flex items-center border-b border-border/30 hover:bg-muted/20 transition-colors">
                    {/* Label */}
                    <div className="w-[160px] shrink-0 px-2 py-1 flex items-center gap-1.5 min-h-[36px]">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT_COLORS[c.status]}`} />
                      <span className="text-[11px] font-medium text-foreground truncate" title={c.campaign_name}>
                        {c.campaign_name}
                      </span>
                    </div>

                    {/* Bar area */}
                    <div className="flex-1 relative" style={{ height: ROW_HEIGHT + ROW_GAP }}>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`absolute top-1 h-[${ROW_HEIGHT - 4}px] rounded-md cursor-pointer transition-all hover:brightness-110 ${CHANNEL_SOLID_COLORS[c.channel]} ${
                                clippedLeft ? "rounded-l-none" : ""
                              } ${clippedRight ? "rounded-r-none" : ""}`}
                              style={{
                                left: barStartDay * DAY_WIDTH,
                                width: barWidth * DAY_WIDTH,
                                height: ROW_HEIGHT - 4,
                                opacity: c.status === "draft" ? 0.4 : c.status === "paused" ? 0.6 : 0.85,
                              }}
                            >
                              <span className="text-[9px] text-white font-medium px-1.5 truncate block leading-[24px]">
                                {barWidth * DAY_WIDTH > 60 ? c.campaign_name : ""}
                              </span>

                              {c.ending_soon && (
                                <AlertTriangle className="absolute -top-1 -right-1 h-3 w-3 text-amber-400 drop-shadow" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[260px]">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-sm ${CHANNEL_SOLID_COLORS[c.channel]}`} />
                                <span className="font-semibold text-xs">{c.campaign_name}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground space-y-0.5">
                                <p>{CHANNEL_LABELS[c.channel]} &middot; {CAMPAIGN_STATUS_LABELS[c.status]}</p>
                                <p>{c.start_date ? formatShortDate(c.start_date) : "?"} → {c.end_date ? formatShortDate(c.end_date) : "?"}</p>
                                {c.duration_days && <p>{c.duration_days} dias{c.days_remaining != null && c.days_remaining >= 0 ? ` (${c.days_remaining}d restantes)` : ""}</p>}
                                {c.budget_total > 0 && (
                                  <p>Budget: {formatCurrency(c.budget_spent)} / {formatCurrency(c.budget_total)} ({c.budget_pacing}%)</p>
                                )}
                                {c.total_clicks > 0 && <p>{c.total_clicks.toLocaleString("pt-BR")} cliques &middot; {c.total_conversions.toLocaleString("pt-BR")} conversões</p>}
                              </div>
                              {c.ending_soon && (
                                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span className="text-[10px] font-medium">Encerra em {c.days_remaining}d</span>
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                );
              })}

              {/* Today line */}
              {showTodayLine && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none"
                  style={{ left: 160 + todayOffset * DAY_WIDTH }}
                >
                  <div className="absolute -top-0.5 -left-1 w-2 h-2 rounded-full bg-primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          {(["google", "meta", "linkedin", "tiktok"] as CampaignChannel[]).map((ch) => {
            const count = filtered.filter((c) => c.channel === ch).length;
            if (count === 0) return null;
            return (
              <div key={ch} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${CHANNEL_SOLID_COLORS[ch]}`} />
                <span className="text-[10px] text-muted-foreground">{CHANNEL_LABELS[ch]}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {(["active", "paused", "draft"] as const).map((st) => (
            <div key={st} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[st]}`} />
              <span className="text-[10px] text-muted-foreground">{CAMPAIGN_STATUS_LABELS[st]}</span>
            </div>
          ))}
        </div>
        {filtered.some((c) => c.ending_soon) && (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
            <span className="text-[10px] text-muted-foreground">Encerra em breve</span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Nenhuma campanha com datas definidas neste projeto.</p>
          <p className="text-xs text-muted-foreground mt-1">Defina datas de início e fim nas campanhas para visualizá-las na timeline.</p>
        </div>
      )}
    </div>
  );
}
