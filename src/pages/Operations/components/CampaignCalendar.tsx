import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle, DollarSign, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  type CalendarCampaign,
  type CampaignChannel,
  CHANNEL_BAR_COLORS,
  CHANNEL_SOLID_COLORS,
  CHANNEL_LABELS,
  CAMPAIGN_STATUS_LABELS,
  STATUS_DOT_COLORS,
  WEEKDAY_LABELS,
  MONTH_LABELS,
  getCalendarGrid,
  isDateInRange,
  isRangeStart,
  isRangeEnd,
  isSameDay,
  formatCurrency,
} from "@/lib/operationalTypes";

interface CampaignCalendarProps {
  campaigns: CalendarCampaign[];
  filterChannel?: string;
  filterStatus?: string;
}

export default function CampaignCalendar({ campaigns, filterChannel = "all", filterStatus = "all" }: CampaignCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedCampaign, setSelectedCampaign] = useState<CalendarCampaign | null>(null);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (filterChannel !== "all" && c.channel !== filterChannel) return false;
      if (filterStatus !== "all" && c.status !== filterStatus) return false;
      return true;
    });
  }, [campaigns, filterChannel, filterStatus]);

  const grid = useMemo(() => getCalendarGrid(year, month), [year, month]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const getCampaignsForDate = (date: Date): CalendarCampaign[] => {
    return filtered.filter((c) => isDateInRange(date, c.start_date, c.end_date));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="h-8 flex items-center px-4 rounded-md bg-primary/10 ml-1 sm:ml-2">
            <h4 className="text-sm font-bold text-primary capitalize tracking-wide">
              {MONTH_LABELS[month + 1]} <span className="text-primary/70">{year}</span>
            </h4>
          </div>
        </div>
        <Button variant="default" size="sm" className="h-8 text-xs font-semibold shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground transition-colors" onClick={goToday}>
          Hoje
        </Button>
      </div>

      <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/40">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[11px] font-bold text-muted-foreground py-2 border-r border-border last:border-r-0 uppercase tracking-widest">
              {d.substring(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 bg-muted/20">
          {grid.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="bg-muted/10 min-h-[90px] sm:min-h-[110px] border-r border-b border-border" />;
            }

            const isToday = isSameDay(date, today);
            const dayCampaigns = getCampaignsForDate(date);

            return (
              <div
                key={date.toISOString()}
                className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 relative border-r border-b border-border transition-colors hover:bg-muted/30 group ${isToday ? "bg-primary/5 shadow-[inset_0_0_0_1px_rgba(var(--primary),0.3)] z-10" : "bg-card"
                  }`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${isToday ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground group-hover:text-foreground"
                    }`}>
                    {date.getDate()}
                  </span>
                </div>

                <div className="space-y-1 overflow-hidden">
                  {dayCampaigns.slice(0, 3).map((c) => {
                    const colors = CHANNEL_BAR_COLORS[c.channel];
                    const isStart = isRangeStart(date, c.start_date);
                    const isEnd = isRangeEnd(date, c.end_date);

                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCampaign(selectedCampaign?.id === c.id ? null : c)}
                        className={`w-full text-left text-[9px] sm:text-[10px] font-medium leading-tight px-1.5 py-0.5 border-l-[3px] truncate cursor-pointer transition-all hover:brightness-95 ${colors.bg} ${colors.border} ${colors.text} ${isStart ? "rounded-l-md" : ""
                          } ${isEnd ? "rounded-r-md" : ""} ${selectedCampaign?.id === c.id ? "ring-1 ring-primary shadow-sm scale-[1.02]" : "hover:scale-[1.01]"
                          }`}
                        title={`${c.campaign_name} (${CHANNEL_LABELS[c.channel]})`}
                      >
                        {isStart ? c.campaign_name : "\u00A0"}
                      </button>
                    );
                  })}
                  {dayCampaigns.length > 3 && (
                    <div className="text-[9px] font-medium text-muted-foreground pl-1.5 py-0.5 border-l-2 border-transparent">
                      +{dayCampaigns.length - 3} mais
                    </div>
                  )}
                </div>

                {/* Ending soon indicator */}
                {dayCampaigns.some((c) => c.ending_soon && isRangeEnd(date, c.end_date)) && !isToday && (
                  <div className="absolute top-1.5 right-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500/80 animate-pulse" />
                  </div>
                )}
                {dayCampaigns.some((c) => c.ending_soon && isRangeEnd(date, c.end_date)) && isToday && (
                  <div className="absolute top-1 right-8">
                    <AlertTriangle className="h-3 w-3 text-amber-500 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {(["google", "meta", "linkedin", "tiktok"] as CampaignChannel[]).map((ch) => {
          const count = filtered.filter((c) => c.channel === ch).length;
          if (count === 0) return null;
          return (
            <div key={ch} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-sm ${CHANNEL_SOLID_COLORS[ch]}`} />
              <span className="text-[10px] text-muted-foreground">{CHANNEL_LABELS[ch]} ({count})</span>
            </div>
          );
        })}
      </div>

      {/* Selected campaign detail */}
      {selectedCampaign && (
        <div className="rounded-xl border border-primary/30 bg-card p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h5 className="font-semibold text-sm text-foreground truncate">{selectedCampaign.campaign_name}</h5>
                <Badge variant="outline" className={`text-[10px] ${CHANNEL_BAR_COLORS[selectedCampaign.channel].text}`}>
                  {CHANNEL_LABELS[selectedCampaign.channel]}
                </Badge>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[selectedCampaign.status]}`} />
                  <span className="text-[10px] text-muted-foreground">{CAMPAIGN_STATUS_LABELS[selectedCampaign.status]}</span>
                </div>
              </div>
              {selectedCampaign.objective && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{selectedCampaign.objective}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-[10px] shrink-0 text-muted-foreground hover:bg-muted" onClick={() => setSelectedCampaign(null)}>
              Fechar
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {selectedCampaign.duration_days ? `${selectedCampaign.duration_days}d` : "—"}
                {selectedCampaign.days_remaining != null && selectedCampaign.days_remaining >= 0 && (
                  <span className="text-foreground font-medium"> ({selectedCampaign.days_remaining}d restantes)</span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <DollarSign className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {formatCurrency(selectedCampaign.budget_spent)} / {formatCurrency(selectedCampaign.budget_total)}
                <span className="font-medium text-foreground ml-1">({selectedCampaign.budget_pacing}%)</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {selectedCampaign.total_clicks.toLocaleString("pt-BR")} cliques
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">
                {selectedCampaign.total_conversions.toLocaleString("pt-BR")} conversões
              </span>
            </div>
          </div>

          {selectedCampaign.ending_soon && (
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                Esta campanha encerra em {selectedCampaign.days_remaining} dia{selectedCampaign.days_remaining !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Nenhuma campanha com datas definidas neste projeto.</p>
          <p className="text-xs text-muted-foreground mt-1">Defina datas de início e fim nas campanhas para visualizá-las no calendário.</p>
        </div>
      )}
    </div>
  );
}
