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
} from "lucide-react";

type ServiceStatus = "operational" | "degraded" | "partial_outage" | "major_outage" | "maintenance";

interface Service {
  name: string;
  description: string;
  status: ServiceStatus;
  icon: React.ElementType;
  category: string;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
  updates: {
    timestamp: string;
    status: string;
    message: string;
  }[];
}

interface UptimeDay {
  date: string;
  status: ServiceStatus;
  uptime: number;
}

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

// --- Static data (future: fetch from Supabase) ---

const services: Service[] = [
  {
    name: "Plataforma Web",
    description: "Interface principal da aplicação, dashboard e navegação",
    status: "operational",
    icon: Globe,
    category: "Core",
  },
  {
    name: "Autenticação",
    description: "Login, cadastro, recuperação de senha e sessões",
    status: "operational",
    icon: Shield,
    category: "Core",
  },
  {
    name: "Banco de Dados",
    description: "Armazenamento de projetos, insights, benchmarks e configurações",
    status: "operational",
    icon: Database,
    category: "Core",
  },
  {
    name: "API & Edge Functions",
    description: "Endpoints de análise, exportação e processamento",
    status: "operational",
    icon: Server,
    category: "Core",
  },
  {
    name: "Análise Heurística de URL",
    description: "Diagnóstico automático de páginas web com scores e insights",
    status: "operational",
    icon: Zap,
    category: "Análise",
  },
  {
    name: "Análise por IA",
    description: "Análise aprofundada via Google Gemini e Anthropic Claude",
    status: "operational",
    icon: Brain,
    category: "Análise",
  },
  {
    name: "Benchmark Competitivo",
    description: "Comparação com concorrentes, SWOT e gap analysis",
    status: "operational",
    icon: BarChart3,
    category: "Análise",
  },
  {
    name: "Notificações",
    description: "Sistema de notificações em tempo real",
    status: "operational",
    icon: Bell,
    category: "Comunicação",
  },
  {
    name: "CDN & Assets",
    description: "Entrega de arquivos estáticos, imagens e recursos",
    status: "operational",
    icon: Wifi,
    category: "Infraestrutura",
  },
];

const recentIncidents: Incident[] = [
  // Example resolved incident for demonstration
  {
    id: "inc-001",
    title: "Lentidão na análise heurística de URLs",
    status: "resolved",
    severity: "minor",
    createdAt: "2026-02-08T14:30:00Z",
    updatedAt: "2026-02-08T15:45:00Z",
    updates: [
      {
        timestamp: "2026-02-08T15:45:00Z",
        status: "resolved",
        message: "O problema foi resolvido. A análise heurística está operando normalmente. O tempo de resposta voltou ao normal.",
      },
      {
        timestamp: "2026-02-08T15:10:00Z",
        status: "monitoring",
        message: "A correção foi aplicada. Estamos monitorando os tempos de resposta para confirmar a estabilidade.",
      },
      {
        timestamp: "2026-02-08T14:50:00Z",
        status: "identified",
        message: "Identificamos um aumento temporário na latência do serviço de fetch externo. Aplicando otimização de cache.",
      },
      {
        timestamp: "2026-02-08T14:30:00Z",
        status: "investigating",
        message: "Recebemos relatos de lentidão na análise de URLs. Estamos investigando a causa.",
      },
    ],
  },
];

// Generate 90 days of uptime data
function generateUptimeData(): UptimeDay[] {
  const days: UptimeDay[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Simulate mostly operational with occasional minor issues
    let status: ServiceStatus = "operational";
    let uptime = 99.95 + Math.random() * 0.05;

    if (i === 62) {
      status = "degraded";
      uptime = 99.7;
    }
    if (i === 30) {
      status = "maintenance";
      uptime = 99.85;
    }

    days.push({ date: dateStr, status, uptime });
  }
  return days;
}

const uptimeData = generateUptimeData();
const overallUptime = (uptimeData.reduce((sum, d) => sum + d.uptime, 0) / uptimeData.length).toFixed(3);

function getOverallStatus(svcs: Service[]): ServiceStatus {
  if (svcs.some((s) => s.status === "major_outage")) return "major_outage";
  if (svcs.some((s) => s.status === "partial_outage")) return "partial_outage";
  if (svcs.some((s) => s.status === "degraded")) return "degraded";
  if (svcs.some((s) => s.status === "maintenance")) return "maintenance";
  return "operational";
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

function IncidentCard({ incident }: { incident: Incident }) {
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
          {formatDateTime(incident.createdAt)}
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
                        {formatDateTime(update.timestamp)}
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

export default function Status() {
  const navigate = useNavigate();
  const overallStatus = getOverallStatus(services);
  const overallConfig = statusConfig[overallStatus];
  const OverallIcon = overallConfig.icon;

  const categories = [...new Set(services.map((s) => s.category))];

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
              <span className="text-sm font-bold text-emerald-600">{overallUptime}% de disponibilidade</span>
            </div>
            <UptimeBar data={uptimeData} />
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
                      const Icon = service.icon;
                      const StatusIcon = config.icon;
                      return (
                        <div
                          key={service.name}
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

          {recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {recentIncidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-8 sm:p-12 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="font-semibold text-foreground text-lg mb-2">Nenhum incidente recente</h3>
              <p className="text-sm text-muted-foreground">
                Todos os serviços estão operando normalmente. Nenhum incidente registrado nos últimos 7 dias.
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

          <div className="rounded-2xl border border-border bg-background p-8 sm:p-12 text-center">
            <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-semibold text-foreground text-lg mb-2">Nenhuma manutenção programada</h3>
            <p className="text-sm text-muted-foreground">
              Não há manutenções agendadas no momento. Quando houver, você será notificado com antecedência.
            </p>
          </div>
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
                value: `${overallUptime}%`,
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
                value: "1",
                description: "Todos resolvidos",
                color: "text-amber-600",
                bgColor: "bg-amber-500/10",
                borderColor: "border-amber-500/20",
              },
              {
                label: "MTTR",
                value: "~1h15",
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

      {/* Legend */}
      <section className="py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-background p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Legenda de Status</h3>
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
