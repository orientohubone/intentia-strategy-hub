import { useState, useEffect } from "react";
import { CalendarDays, GanttChart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import CampaignCalendar from "./CampaignCalendar";
import CampaignTimeline from "./CampaignTimeline";
import { supabase } from "@/integrations/supabase/client";
import {
  type CalendarCampaign,
  type CampaignChannel,
  type CampaignStatus,
  CHANNEL_LABELS,
  CAMPAIGN_STATUS_LABELS,
} from "@/lib/operationalTypes";

interface CampaignCalendarManagerProps {
  userId: string;
  projectId: string;
  projectName: string;
}

type ViewMode = "calendar" | "timeline";

export default function CampaignCalendarManager({ userId, projectId, projectName }: CampaignCalendarManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [campaigns, setCampaigns] = useState<CalendarCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const loadCalendarData = async () => {
    if (!userId || !projectId) return;
    setLoading(true);
    try {
      // Query from v_campaign_calendar view
      const { data, error } = await (supabase as any)
        .from("v_campaign_calendar")
        .select("*")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .order("start_date", { ascending: true, nullsFirst: false });

      if (error) throw error;
      setCampaigns((data || []) as CalendarCampaign[]);
    } catch (err) {
      console.error("Error loading calendar data:", err);
      // Fallback: load from campaigns table directly
      try {
        const { data, error } = await (supabase as any)
          .from("campaigns")
          .select("*, projects!inner(name)")
          .eq("user_id", userId)
          .eq("project_id", projectId)
          .eq("is_deleted", false)
          .order("start_date", { ascending: true, nullsFirst: false });

        if (error) throw error;

        const mapped: CalendarCampaign[] = (data || []).map((c: any) => ({
          id: c.id,
          user_id: c.user_id,
          project_id: c.project_id,
          project_name: c.projects?.name || projectName,
          campaign_name: c.name,
          channel: c.channel,
          status: c.status,
          objective: c.objective,
          budget_total: c.budget_total || 0,
          budget_spent: c.budget_spent || 0,
          start_date: c.start_date,
          end_date: c.end_date,
          duration_days: c.start_date && c.end_date
            ? Math.ceil((new Date(c.end_date + "T00:00:00").getTime() - new Date(c.start_date + "T00:00:00").getTime()) / 86400000) + 1
            : null,
          days_remaining: c.end_date && c.status !== "completed" && c.status !== "archived"
            ? Math.max(0, Math.ceil((new Date(c.end_date + "T00:00:00").getTime() - Date.now()) / 86400000))
            : null,
          days_elapsed: c.start_date
            ? Math.floor((Date.now() - new Date(c.start_date + "T00:00:00").getTime()) / 86400000)
            : null,
          budget_pacing: c.budget_total > 0 ? Math.round((c.budget_spent / c.budget_total) * 1000) / 10 : 0,
          ending_soon: c.end_date && c.status === "active"
            ? (new Date(c.end_date + "T00:00:00").getTime() - Date.now()) / 86400000 <= 7 && (new Date(c.end_date + "T00:00:00").getTime() - Date.now()) >= 0
            : false,
          total_impressions: 0,
          total_clicks: 0,
          total_conversions: 0,
          total_cost: 0,
          total_revenue: 0,
          metrics_entries: 0,
        }));

        setCampaigns(mapped);
      } catch (fallbackErr) {
        console.error("Fallback loading failed:", fallbackErr);
        setCampaigns([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadCalendarData();
  }, [isOpen, userId, projectId]);

  const campaignsWithDates = campaigns.filter((c) => c.start_date);
  const endingSoonCount = campaigns.filter((c) => c.ending_soon).length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center justify-between w-full text-left group">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Calendário de Campanhas</h4>
            {campaignsWithDates.length > 0 && !isOpen && (
              <span className="text-[10px] text-muted-foreground">
                ({campaignsWithDates.length} campanha{campaignsWithDates.length !== 1 ? "s" : ""})
              </span>
            )}
            {endingSoonCount > 0 && !isOpen && (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                {endingSoonCount} encerrando em breve
              </span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors ${
                    viewMode === "calendar"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Calendário</span>
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors ${
                    viewMode === "timeline"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <GanttChart className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Timeline</span>
                </button>
              </div>

              {/* Filters */}
              <Select value={filterChannel} onValueChange={setFilterChannel}>
                <SelectTrigger className="h-7 w-[120px] text-xs">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos canais</SelectItem>
                  {(["google", "meta", "linkedin", "tiktok"] as CampaignChannel[]).map((ch) => (
                    <SelectItem key={ch} value={ch}>{CHANNEL_LABELS[ch]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-7 w-[120px] text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos status</SelectItem>
                  {(["draft", "active", "paused", "completed"] as CampaignStatus[]).map((st) => (
                    <SelectItem key={st} value={st}>{CAMPAIGN_STATUS_LABELS[st]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* View */}
            {viewMode === "calendar" ? (
              <CampaignCalendar
                campaigns={campaigns}
                filterChannel={filterChannel}
                filterStatus={filterStatus}
              />
            ) : (
              <CampaignTimeline
                campaigns={campaigns}
                filterChannel={filterChannel}
                filterStatus={filterStatus}
              />
            )}
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
