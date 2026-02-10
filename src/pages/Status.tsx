import { Header } from "@/components/Header";
import { SEO, buildBreadcrumb } from "@/components/SEO";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { BackToHomeButton } from "@/components/BackToHomeButton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Server,
  Database,
  Shield,
  Zap,
  Globe,
  Brain,
  BarChart3,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Bell,
  Wifi,
  RefreshCw,
  Info,
  Loader2,
  Wrench,
  Calendar,
  Rss,
  Mail,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useStatusData, getOverallStatus } from "@/hooks/useStatusData";
import type { ServiceStatus, UptimeDay, IncidentWithUpdates, PlatformMaintenance, LatencyDataPoint } from "@/hooks/useStatusData";

const statusConfig: Record<ServiceStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ElementType }> = {
  operational: {
    label: "Operacional",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    icon: CheckCircle2,
  },
  degraded: {
    label: "Desempenho Degradado",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    icon: AlertTriangle,
  },
  partial_outage: {
    label: "Interrupção Parcial",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    icon: AlertTriangle,
  },
  major_outage: {
    label: "Interrupção Total",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    icon: XCircle,
  },
  maintenance: {
    label: "Em Manutenção",
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    icon: RefreshCw,
  },
};

const incidentStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  investigating: { label: "Investigando", color: "text-red-600", bgColor: "bg-red-500/10" },
  identified: { label: "Identificado", color: "text-amber-600", bgColor: "bg-amber-500/10" },
  monitoring: { label: "Monitorando", color: "text-blue-600", bgColor: "bg-blue-500/10" },
  resolved: { label: "Resolvido", color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
};

const severityConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  minor: { label: "Menor", color: "text-amber-600", bgColor: "bg-amber-500/10" },
  major: { label: "Maior", color: "text-orange-600", bgColor: "bg-orange-500/10" },
  critical: { label: "Crítico", color: "text-red-600", bgColor: "bg-red-500/10" },
};

const maintenanceStatusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: "Agendada", color: "text-blue-600", bgColor: "bg-blue-500/10" },
  in_progress: { label: "Em Andamento", color: "text-amber-600", bgColor: "bg-amber-500/10" },
  completed: { label: "Concluída", color: "text-emerald-600", bgColor: "bg-emerald-500/10" },
  cancelled: { label: "Cancelada", color: "text-gray-500", bgColor: "bg-gray-500/10" },
};

// Icon mapping: database icon string → Lucide component
const iconMap: Record<string, React.ElementType> = {
  Globe: Globe,
  Shield: Shield,
  Database: Database,
  Server: Server,
  Zap: Zap,
  Brain: Brain,
  BarChart3: BarChart3,
  Bell: Bell,
  Wifi: Wifi,
  Activity: Activity,
  Clock: Clock,
  Wrench: Wrench,
};

function getIconComponent(iconName: string): React.ElementType {
  return iconMap[iconName] || Server;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function UptimeBar({ data }: { data: UptimeDay[] }) {
  return (
    <div className="flex gap-[2px] items-end h-8">
      {data.map((day, i) => {
        const config = statusConfig[day.status];
        const barColor =
          day.status === "operational"
            ? "bg-emerald-500"
            : day.status === "degraded"
            ? "bg-amber-500"
            : day.status === "maintenance"
            ? "bg-blue-500"
            : day.status === "partial_outage"
            ? "bg-orange-500"
            : "bg-red-500";

        return (
          <div
            key={i}
            className={`flex-1 rounded-sm ${barColor} hover:opacity-80 transition-opacity cursor-default group relative`}
            style={{ minWidth: "2px", height: "100%" }}
            title={`${formatDate(day.date)} — ${config.label} (${day.uptime.toFixed(2)}%)`}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
              <div className="bg-foreground text-background text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                <div className="font-medium">{formatDate(day.date)}</div>
                <div className={day.status === "operational" ? "text-emerald-300" : "text-amber-300"}>
                  {config.label} — {day.uptime.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IncidentCard({ incident }: { incident: IncidentWithUpdates }) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = incidentStatusConfig[incident.status];
  const severityCfg = severityConfig[incident.severity];

  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 hover:border-primary/20 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityCfg.bgColor} ${severityCfg.color}`}>
              {severityCfg.label}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm sm:text-base">{incident.title}</h3>
        </div>
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDateTime(incident.created_at)}
        </div>
      </div>

      {/* Latest update */}
      <div className="text-sm text-muted-foreground mb-3">
        {incident.updates[0]?.message}
      </div>

      {/* Expand/collapse timeline */}
      {incident.updates.length > 1 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? "Ocultar histórico" : `Ver histórico completo (${incident.updates.length} atualizações)`}
          </button>

          {expanded && (
            <div className="mt-4 space-y-4 border-l-2 border-border pl-4 ml-1">
              {incident.updates.map((update, i) => {
                const updateStatusCfg = incidentStatusConfig[update.status] || incidentStatusConfig.investigating;
                return (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background bg-border" />
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${updateStatusCfg.color}`}>
                        {updateStatusCfg.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(update.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80">{update.message}</p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MaintenanceCard({ maintenance }: { maintenance: PlatformMaintenance }) {
  const statusCfg = maintenanceStatusConfig[maintenance.status] || maintenanceStatusConfig.scheduled;

  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-6 hover:border-primary/20 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm sm:text-base">{maintenance.title}</h3>
          {maintenance.description && (
            <p className="text-sm text-muted-foreground mt-1">{maintenance.description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Início: {formatDateTime(maintenance.scheduled_start)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>Fim: {formatDateTime(maintenance.scheduled_end)}</span>
        </div>
      </div>
    </div>
  );
}

export default function Status() {
  const navigate = useNavigate();
  const { services, incidents, maintenances, uptimeData, latencyData, loading, error } = useStatusData();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
  const rssUrl = supabaseUrl ? `${supabaseUrl}/functions/v1/status-rss` : "";

  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!subscribeEmail.trim() || !subscribeEmail.includes("@")) {
      toast.error("Informe um email válido.");
      return;
    }
    setSubscribing(true);
    try {
      const { error } = await (supabase as any)
        .from("platform_status_subscribers")
        .upsert({ email: subscribeEmail.trim().toLowerCase(), is_active: true }, { onConflict: "email" });
      if (error) throw error;
      toast.success("Inscrito com sucesso! Você receberá alertas de status por email.");
      setSubscribeEmail("");
    } catch (err: any) {
      console.error("[subscribe] Error:", err);
      toast.error("Erro ao se inscrever. Tente novamente.");
    } finally {
      setSubscribing(false);
    }
  };

  const overallStatus = getOverallStatus(services);
  const overallConfig = statusConfig[overallStatus];
  const OverallIcon = overallConfig.icon;

  const categories = [...new Set(services.map((s) => s.category))];

  // Calculate metrics from real data
  const overallUptime = uptimeData.length > 0
    ? (uptimeData.reduce((sum, d) => sum + d.uptime, 0) / uptimeData.length).toFixed(3)
    : "100.000";

  const incidentCount30d = incidents.length;
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved" && i.resolved_at && i.created_at);
  const avgMttr = resolvedIncidents.length > 0
    ? resolvedIncidents.reduce((sum, i) => {
        const created = new Date(i.created_at).getTime();
        const resolved = new Date(i.resolved_at!).getTime();
        return sum + (resolved - created);
      }, 0) / resolvedIncidents.length
    : 0;
  const mttrHours = Math.floor(avgMttr / (1000 * 60 * 60));
  const mttrMinutes = Math.floor((avgMttr % (1000 * 60 * 60)) / (1000 * 60));
  const mttrLabel = avgMttr > 0 ? `~${mttrHours}h${mttrMinutes.toString().padStart(2, "0")}m` : "—";
  const incidentDescription = incidentCount30d === 0
    ? "Nenhum incidente"
    : resolvedIncidents.length === incidentCount30d
    ? "Todos resolvidos"
    : `${resolvedIncidents.length} resolvidos`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Status da Plataforma"
        path="/status"
        description="Acompanhe em tempo real o status de todos os serviços da Intentia. Transparência total sobre operabilidade, incidentes e manutenções programadas."
        keywords="status plataforma, uptime, incidentes, disponibilidade, SLA"
        jsonLd={buildBreadcrumb([{ name: "Status", path: "/status" }])}
      />
      <Header />
      <BackToHomeButton />

      {/* Hero — Overall Status */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Activity className="h-4 w-4" />
            Status da Plataforma
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Transparência em{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              tempo real
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Acompanhe a operabilidade de todos os serviços da Intentia. Nosso compromisso é manter
            você informado sobre qualquer evento que possa afetar sua experiência.
          </p>

          {/* Overall Status Banner */}
          <div
            className={`inline-flex items-center gap-3 px-6 py-4 rounded-2xl border ${overallConfig.borderColor} ${overallConfig.bgColor} shadow-sm`}
          >
            <OverallIcon className={`h-6 w-6 ${overallConfig.color}`} />
            <span className={`text-lg sm:text-xl font-bold ${overallConfig.color}`}>
              {overallStatus === "operational"
                ? "Todos os sistemas operacionais"
                : overallStatus === "degraded"
                ? "Desempenho degradado em alguns serviços"
                : overallStatus === "maintenance"
                ? "Manutenção programada em andamento"
                : "Alguns serviços com interrupção"}
            </span>
          </div>
        </div>
      </section>

      {/* Uptime Bar */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <h2 className="text-sm font-semibold text-foreground">Uptime dos últimos 90 dias</h2>
              <span className="text-sm font-bold text-emerald-600">{loading ? "..." : `${overallUptime}%`} de disponibilidade</span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <UptimeBar data={uptimeData} />
            )}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>90 dias atrás</span>
              <span>Hoje</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Status dos Serviços
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Monitoramento contínuo de cada componente da plataforma.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl border border-border bg-background p-8 sm:p-12 text-center">
              <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground text-lg mb-2">Nenhum serviço cadastrado</h3>
              <p className="text-sm text-muted-foreground">Os serviços serão exibidos aqui quando configurados.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryServices = services.filter((s) => s.category === category);
                return (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                      {category}
                    </h3>
                    <div className="rounded-2xl border border-border bg-background divide-y divide-border overflow-hidden">
                      {categoryServices.map((service) => {
                        const config = statusConfig[service.status];
                        const Icon = getIconComponent(service.icon);
                        const StatusIcon = config.icon;
                        return (
                          <div
                            key={service.id}
                            className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 hover:bg-muted/30 transition-colors"
                          >
                            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground text-sm sm:text-base truncate">
                                {service.name}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                {service.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <StatusIcon className={`h-4 w-4 ${config.color}`} />
                              <span className={`text-xs sm:text-sm font-medium ${config.color} hidden sm:inline`}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Incidents */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Incidentes Recentes
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Histórico de eventos e atualizações sobre a estabilidade da plataforma.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-8 sm:p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground text-lg mb-2">Nenhum incidente recente</h3>
              <p className="text-sm text-muted-foreground">
                Todos os serviços estão operando normalmente. Nenhum incidente registrado nos últimos 30 dias.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Scheduled Maintenance */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Manutenções Programadas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Fique por dentro das manutenções planejadas para melhoria contínua da plataforma.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : maintenances.length > 0 ? (
            <div className="space-y-4">
              {maintenances.map((m) => (
                <MaintenanceCard key={m.id} maintenance={m} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-8 sm:p-12 text-center">
              <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma manutenção programada</h3>
              <p className="text-sm text-muted-foreground">
                Não há manutenções agendadas no momento. Quando houver, você será notificado com antecedência.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Metrics & SLA */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Métricas de Confiabilidade
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossos compromissos de disponibilidade e performance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: "Uptime (90 dias)",
                value: loading ? "..." : `${overallUptime}%`,
                description: "Disponibilidade média",
                color: "text-emerald-600",
                bgColor: "bg-emerald-500/10",
                borderColor: "border-emerald-500/20",
              },
              {
                label: "Tempo de Resposta",
                value: "<200ms",
                description: "Latência média da API",
                color: "text-blue-600",
                bgColor: "bg-blue-500/10",
                borderColor: "border-blue-500/20",
              },
              {
                label: "Incidentes (30 dias)",
                value: loading ? "..." : String(incidentCount30d),
                description: loading ? "..." : incidentDescription,
                color: "text-amber-600",
                bgColor: "bg-amber-500/10",
                borderColor: "border-amber-500/20",
              },
              {
                label: "MTTR",
                value: loading ? "..." : mttrLabel,
                description: "Tempo médio de resolução",
                color: "text-purple-600",
                bgColor: "bg-purple-500/10",
                borderColor: "border-purple-500/20",
              },
            ].map((metric, i) => (
              <div
                key={i}
                className={`rounded-2xl border ${metric.borderColor} ${metric.bgColor} p-5 sm:p-6 text-center`}
              >
                <div className={`text-2xl sm:text-3xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                <div className="font-medium text-foreground text-sm mb-0.5">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latency Chart */}
      {!loading && latencyData.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Latência por Serviço
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tempo de resposta médio dos serviços nos últimos 30 dias.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val: string) => {
                      const d = new Date(val + "T00:00:00");
                      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                    }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(val: number) => `${val}ms`}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    labelFormatter={(val: string) => {
                      const d = new Date(val + "T00:00:00");
                      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
                    }}
                    formatter={(value: number, name: string) => {
                      const svc = services.find((s) => s.id === name);
                      return [`${value}ms`, svc?.name || name];
                    }}
                  />
                  {services.map((svc, idx) => {
                    const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#6366f1"];
                    return (
                      <Line
                        key={svc.id}
                        type="monotone"
                        dataKey={svc.id}
                        name={svc.id}
                        stroke={colors[idx % colors.length]}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {services.map((svc, idx) => {
                  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#6366f1"];
                  return (
                    <div key={svc.id} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                      <span className="text-xs text-muted-foreground">{svc.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Legend */}
      <section className="py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground">Legenda de Status</h3>
              </div>
              {rssUrl && (
                <a
                  href={rssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                  title="RSS Feed de Incidentes"
                >
                  <Rss className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">RSS Feed</span>
                </a>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {Object.entries(statusConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${config.color} shrink-0`} />
                    <span className="text-xs sm:text-sm text-foreground/80">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe to Alerts */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Receba alertas por email</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Inscreva-se para receber notificações quando houver incidentes ou manutenções programadas.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  className="flex-1 sm:w-64 h-10 px-4 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className="h-10 px-5"
                >
                  {subscribing ? "..." : "Inscrever"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary/10 via-orange-500/5 to-transparent border border-primary/20 p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Compromisso com transparência
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Sua confiança é nossa prioridade
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Mantemos esta página atualizada para que você sempre saiba o estado da plataforma.
              Em caso de incidentes, publicamos atualizações em tempo real até a resolução completa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" onClick={() => navigate("/auth")}>
                Começar Grátis
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/seguranca")}>
                Ver Segurança
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </div>
  );
}
