import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// =====================================================
// TYPES
// =====================================================

export type ServiceStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

export interface PlatformService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  status: ServiceStatus;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlatformIncident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  affected_services: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface PlatformIncidentUpdate {
  id: string;
  incident_id: string;
  status: string;
  message: string;
  created_at: string;
}

export interface PlatformMaintenance {
  id: string;
  title: string;
  description: string | null;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  affected_services: string[];
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface UptimeDay {
  date: string;
  status: ServiceStatus;
  uptime: number;
}

export interface LatencyDataPoint {
  date: string;
  [serviceId: string]: number | string; // date is string, service IDs map to response_time_ms
}

export interface IncidentWithUpdates extends PlatformIncident {
  updates: PlatformIncidentUpdate[];
}

// =====================================================
// HOOK
// =====================================================

export function useStatusData() {
  const [services, setServices] = useState<PlatformService[]>([]);
  const [incidents, setIncidents] = useState<IncidentWithUpdates[]>([]);
  const [maintenances, setMaintenances] = useState<PlatformMaintenance[]>([]);
  const [uptimeData, setUptimeData] = useState<UptimeDay[]>([]);
  const [latencyData, setLatencyData] = useState<LatencyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("platform_services")
      .select("*")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data || []) as PlatformService[];
  }, []);

  const loadIncidents = useCallback(async () => {
    // Load recent incidents (last 30 days, or last 10)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: incidentsData, error: incError } = await (supabase as any)
      .from("platform_incidents")
      .select("*")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(10);

    if (incError) throw incError;

    if (!incidentsData || incidentsData.length === 0) return [];

    // Load updates for all incidents
    const incidentIds = incidentsData.map((i: any) => i.id);
    const { data: updatesData, error: updError } = await (supabase as any)
      .from("platform_incident_updates")
      .select("*")
      .in("incident_id", incidentIds)
      .order("created_at", { ascending: false });

    if (updError) throw updError;

    // Merge updates into incidents
    const updatesMap: Record<string, PlatformIncidentUpdate[]> = {};
    for (const u of (updatesData || [])) {
      if (!updatesMap[u.incident_id]) updatesMap[u.incident_id] = [];
      updatesMap[u.incident_id].push(u);
    }

    return incidentsData.map((inc: any) => ({
      ...inc,
      updates: updatesMap[inc.id] || [],
    })) as IncidentWithUpdates[];
  }, []);

  const loadMaintenances = useCallback(async () => {
    // Load upcoming and recent maintenances
    const { data, error } = await (supabase as any)
      .from("platform_maintenances")
      .select("*")
      .in("status", ["scheduled", "in_progress"])
      .order("scheduled_start", { ascending: true });

    if (error) throw error;
    return (data || []) as PlatformMaintenance[];
  }, []);

  const loadUptime = useCallback(async () => {
    // Load last 90 days of uptime data (aggregated across all services)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data, error } = await (supabase as any)
      .from("platform_uptime_daily")
      .select("date, status, uptime_percentage")
      .gte("date", ninetyDaysAgo.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      // Generate fallback data if no uptime records exist yet
      return generateFallbackUptime();
    }

    // Aggregate by date (average uptime across services, worst status)
    const byDate: Record<string, { statuses: ServiceStatus[]; uptimes: number[] }> = {};
    for (const row of data) {
      if (!byDate[row.date]) byDate[row.date] = { statuses: [], uptimes: [] };
      byDate[row.date].statuses.push(row.status as ServiceStatus);
      byDate[row.date].uptimes.push(Number(row.uptime_percentage));
    }

    const days: UptimeDay[] = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      if (byDate[dateStr]) {
        const entry = byDate[dateStr];
        const avgUptime = entry.uptimes.reduce((a, b) => a + b, 0) / entry.uptimes.length;
        const worstStatus = getWorstStatus(entry.statuses);
        days.push({ date: dateStr, status: worstStatus, uptime: avgUptime });
      } else {
        // No data for this day — assume operational
        days.push({ date: dateStr, status: "operational", uptime: 100 });
      }
    }

    return days;
  }, []);

  const loadLatency = useCallback(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await (supabase as any)
      .from("platform_uptime_daily")
      .select("service_id, date, response_time_ms")
      .gte("date", thirtyDaysAgo.toISOString().split("T")[0])
      .not("response_time_ms", "is", null)
      .order("date", { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Group by date, each date has service_id -> response_time_ms
    const byDate: Record<string, Record<string, number>> = {};
    for (const row of data) {
      if (!byDate[row.date]) byDate[row.date] = {};
      byDate[row.date][row.service_id] = row.response_time_ms;
    }

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, services]) => ({ date, ...services })) as LatencyDataPoint[];
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [svcs, incs, maints, upt, lat] = await Promise.all([
        loadServices(),
        loadIncidents(),
        loadMaintenances(),
        loadUptime(),
        loadLatency(),
      ]);
      setServices(svcs);
      setIncidents(incs);
      setMaintenances(maints);
      setUptimeData(upt);
      setLatencyData(lat);
    } catch (err: any) {
      console.error("[useStatusData] Error loading data:", err);
      setError(err.message || "Erro ao carregar dados de status.");
    } finally {
      setLoading(false);
    }
  }, [loadServices, loadIncidents, loadMaintenances, loadUptime, loadLatency]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    services,
    incidents,
    maintenances,
    uptimeData,
    latencyData,
    loading,
    error,
    refresh: loadAll,
  };
}

// =====================================================
// HELPERS
// =====================================================

function getWorstStatus(statuses: ServiceStatus[]): ServiceStatus {
  if (statuses.includes("major_outage")) return "major_outage";
  if (statuses.includes("partial_outage")) return "partial_outage";
  if (statuses.includes("degraded")) return "degraded";
  if (statuses.includes("maintenance")) return "maintenance";
  return "operational";
}

function generateFallbackUptime(): UptimeDay[] {
  const days: UptimeDay[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split("T")[0],
      status: "operational",
      uptime: 100,
    });
  }
  return days;
}

export function getOverallStatus(services: PlatformService[]): ServiceStatus {
  if (services.some((s) => s.status === "major_outage")) return "major_outage";
  if (services.some((s) => s.status === "partial_outage")) return "partial_outage";
  if (services.some((s) => s.status === "degraded")) return "degraded";
  if (services.some((s) => s.status === "maintenance")) return "maintenance";
  return "operational";
}
