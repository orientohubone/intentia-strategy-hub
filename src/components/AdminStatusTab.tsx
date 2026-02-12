import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Globe,
  Shield,
  Database,
  Server,
  Zap,
  Brain,
  BarChart3,
  Bell,
  Wifi,
  Wrench,
  Activity,
  Calendar,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminListServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
  adminListIncidents,
  adminCreateIncident,
  adminUpdateIncident,
  adminDeleteIncident,
  adminListIncidentUpdates,
  adminAddIncidentUpdate,
  adminListMaintenances,
  adminCreateMaintenance,
  adminUpdateMaintenance,
  adminDeleteMaintenance,
} from "@/lib/adminApi";

// =====================================================
// TYPES
// =====================================================

interface PlatformService {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  status: string;
  sort_order: number;
  is_visible: boolean;
  updated_at: string;
}

interface PlatformIncident {
  id: string;
  title: string;
  status: string;
  severity: string;
  affected_services: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

interface PlatformIncidentUpdate {
  id: string;
  incident_id: string;
  status: string;
  message: string;
  created_at: string;
}

interface PlatformMaintenance {
  id: string;
  title: string;
  description: string | null;
  status: string;
  affected_services: string[];
  scheduled_start: string;
  scheduled_end: string;
  actual_start: string | null;
  actual_end: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// CONSTANTS
// =====================================================

const SERVICE_STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  operational: { label: "Operacional", color: "text-green-500", dot: "bg-green-500" },
  degraded: { label: "Degradado", color: "text-amber-500", dot: "bg-amber-500" },
  partial_outage: { label: "Parcial", color: "text-orange-500", dot: "bg-orange-500" },
  major_outage: { label: "Interrupção", color: "text-red-500", dot: "bg-red-500" },
  maintenance: { label: "Manutenção", color: "text-blue-500", dot: "bg-blue-500" },
};

const INCIDENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  investigating: { label: "Investigando", color: "text-red-500" },
  identified: { label: "Identificado", color: "text-amber-500" },
  monitoring: { label: "Monitorando", color: "text-blue-500" },
  resolved: { label: "Resolvido", color: "text-green-500" },
};

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  minor: { label: "Menor", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  major: { label: "Maior", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
  critical: { label: "Crítico", color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
};

const MAINTENANCE_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  scheduled: { label: "Agendada", color: "text-blue-500" },
  in_progress: { label: "Em Andamento", color: "text-amber-500" },
  completed: { label: "Concluída", color: "text-green-500" },
  cancelled: { label: "Cancelada", color: "text-gray-500" },
};

const ICON_OPTIONS = [
  { value: "Globe", label: "Globe" },
  { value: "Shield", label: "Shield" },
  { value: "Database", label: "Database" },
  { value: "Server", label: "Server" },
  { value: "Zap", label: "Zap" },
  { value: "Brain", label: "Brain" },
  { value: "BarChart3", label: "BarChart3" },
  { value: "Bell", label: "Bell" },
  { value: "Wifi", label: "Wifi" },
  { value: "Activity", label: "Activity" },
  { value: "Wrench", label: "Wrench" },
];

const iconMap: Record<string, React.ElementType> = {
  Globe, Shield, Database, Server, Zap, Brain, BarChart3, Bell, Wifi, Activity, Clock, Wrench,
};

// =====================================================
// COMPONENT
// =====================================================

export default function AdminStatusTab() {
  // Sub-tabs
  const [subTab, setSubTab] = useState<"services" | "incidents" | "maintenances" | "guide">("services");

  // Data
  const [services, setServices] = useState<PlatformService[]>([]);
  const [incidents, setIncidents] = useState<PlatformIncident[]>([]);
  const [incidentUpdates, setIncidentUpdates] = useState<PlatformIncidentUpdate[]>([]);
  const [maintenances, setMaintenances] = useState<PlatformMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Editing state
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editServiceData, setEditServiceData] = useState<Partial<PlatformService>>({});
  const [showNewService, setShowNewService] = useState(false);
  const [newService, setNewService] = useState({ name: "", description: "", category: "Core", icon: "Server", status: "operational", sort_order: 10 });

  const [showNewIncident, setShowNewIncident] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: "", status: "investigating", severity: "minor", affected_services: [] as string[] });
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [newUpdateMessage, setNewUpdateMessage] = useState("");
  const [newUpdateStatus, setNewUpdateStatus] = useState("investigating");

  const [showNewMaintenance, setShowNewMaintenance] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    title: "", description: "", status: "scheduled", affected_services: [] as string[],
    scheduled_start: "", scheduled_end: "",
  });

  // =====================================================
  // DATA LOADING
  // =====================================================

  const loadServices = useCallback(async () => {
    const result = await adminListServices();
    if (result.data) setServices(result.data);
  }, []);

  const loadIncidents = useCallback(async () => {
    const result = await adminListIncidents();
    if (result.data) setIncidents(result.data);
  }, []);

  const loadIncidentUpdates = useCallback(async (incidentId: string) => {
    const result = await adminListIncidentUpdates(incidentId);
    if (result.data) setIncidentUpdates(result.data);
  }, []);

  const loadMaintenances = useCallback(async () => {
    const result = await adminListMaintenances();
    if (result.data) setMaintenances(result.data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadServices(), loadIncidents(), loadMaintenances()]);
    } catch (err) {
      console.error('[AdminStatusTab] loadAll error:', err);
    } finally {
      setLoading(false);
    }
  }, [loadServices, loadIncidents, loadMaintenances]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // =====================================================
  // SERVICE ACTIONS
  // =====================================================

  const updateServiceStatus = async (id: string, newStatus: string) => {
    setSaving(id);
    const result = await adminUpdateService(id, { status: newStatus });
    if (result.error) { toast.error(result.error); }
    else { toast.success("Status do serviço atualizado."); await loadServices(); }
    setSaving(null);
  };

  const saveServiceEdit = async (id: string) => {
    setSaving(id);
    const result = await adminUpdateService(id, editServiceData);
    if (result.error) { toast.error(result.error); }
    else { toast.success("Serviço atualizado."); setEditingService(null); await loadServices(); }
    setSaving(null);
  };

  const createService = async () => {
    if (!newService.name.trim()) { toast.error("Nome é obrigatório."); return; }
    setSaving("new-service");
    const result = await adminCreateService(newService);
    if (result.error) { toast.error(result.error); }
    else {
      toast.success("Serviço criado.");
      setShowNewService(false);
      setNewService({ name: "", description: "", category: "Core", icon: "Server", status: "operational", sort_order: 10 });
      await loadServices();
    }
    setSaving(null);
  };

  const deleteService = async (id: string) => {
    setSaving(id);
    const result = await adminDeleteService(id);
    if (result.error) { toast.error(result.error); }
    else { toast.success("Serviço excluído."); await loadServices(); }
    setSaving(null);
  };

  // =====================================================
  // INCIDENT ACTIONS
  // =====================================================

  const createIncident = async () => {
    if (!newIncident.title.trim()) { toast.error("Título é obrigatório."); return; }
    setSaving("new-incident");
    const result = await adminCreateIncident(newIncident);
    if (result.error) { toast.error(result.error); }
    else {
      toast.success("Incidente criado.");
      setShowNewIncident(false);
      setNewIncident({ title: "", status: "investigating", severity: "minor", affected_services: [] });
      await loadIncidents();
    }
    setSaving(null);
  };

  const updateIncidentStatus = async (id: string, newStatus: string) => {
    setSaving(id);
    const result = await adminUpdateIncident(id, { status: newStatus });
    if (result.error) { toast.error(result.error); }
    else { toast.success("Incidente atualizado."); await loadIncidents(); }
    setSaving(null);
  };

  const addIncidentUpdate = async (incidentId: string) => {
    if (!newUpdateMessage.trim()) { toast.error("Mensagem é obrigatória."); return; }
    setSaving(`update-${incidentId}`);
    const result = await adminAddIncidentUpdate(incidentId, newUpdateStatus, newUpdateMessage);
    if (result.error) { toast.error(result.error); }
    else {
      toast.success("Atualização adicionada.");
      setNewUpdateMessage("");
      await loadIncidentUpdates(incidentId);
      await loadIncidents();
    }
    setSaving(null);
  };

  const deleteIncident = async (id: string) => {
    setSaving(id);
    const result = await adminDeleteIncident(id);
    if (result.error) { toast.error(result.error); }
    else { toast.success("Incidente excluído."); await loadIncidents(); }
    setSaving(null);
  };

  // =====================================================
  // MAINTENANCE ACTIONS
  // =====================================================

  const createMaintenance = async () => {
    if (!newMaintenance.title.trim() || !newMaintenance.scheduled_start || !newMaintenance.scheduled_end) {
      toast.error("Título, início e fim são obrigatórios."); return;
    }
    setSaving("new-maintenance");
    const result = await adminCreateMaintenance(newMaintenance);
    if (result.error) { toast.error(result.error); }
    else {
      toast.success("Manutenção criada.");
      setShowNewMaintenance(false);
      setNewMaintenance({ title: "", description: "", status: "scheduled", affected_services: [], scheduled_start: "", scheduled_end: "" });
      await loadMaintenances();
    }
    setSaving(null);
  };

  const updateMaintenanceStatus = async (id: string, newStatus: string) => {
    setSaving(id);
    const updateData: any = { status: newStatus };
    if (newStatus === "in_progress") updateData.actual_start = new Date().toISOString();
    if (newStatus === "completed") updateData.actual_end = new Date().toISOString();
    const result = await adminUpdateMaintenance(id, updateData);
    if (result.error) { toast.error(result.error); }
    else { toast.success("Manutenção atualizada."); await loadMaintenances(); }
    setSaving(null);
  };

  const deleteMaintenance = async (id: string) => {
    setSaving(id);
    const result = await adminDeleteMaintenance(id);
    if (result.error) { toast.error(result.error); }
    else { toast.success("Manutenção excluída."); await loadMaintenances(); }
    setSaving(null);
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const getServiceName = (id: string) => services.find((s) => s.id === id)?.name || id;

  const toggleAffectedService = (serviceId: string, current: string[], setter: (val: string[]) => void) => {
    if (current.includes(serviceId)) {
      setter(current.filter((s) => s !== serviceId));
    } else {
      setter([...current, serviceId]);
    }
  };

  // Stats
  const operationalCount = services.filter((s) => s.status === "operational").length;
  const activeIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const scheduledMaintenances = maintenances.filter((m) => m.status === "scheduled" || m.status === "in_progress").length;

  // =====================================================
  // RENDER
  // =====================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card/60 border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${operationalCount === services.length ? "bg-green-500" : "bg-amber-500"}`} />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Serviços</span>
          </div>
          <p className="text-lg font-bold text-foreground">{operationalCount}/{services.length}</p>
          <p className="text-[10px] text-muted-foreground/70">operacionais</p>
        </div>
        <div className="bg-card/60 border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${activeIncidents > 0 ? "bg-red-500" : "bg-green-500"}`} />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Incidentes</span>
          </div>
          <p className="text-lg font-bold text-foreground">{activeIncidents}</p>
          <p className="text-[10px] text-muted-foreground/70">ativos</p>
        </div>
        <div className="bg-card/60 border border-border rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${scheduledMaintenances > 0 ? "bg-blue-500" : "bg-green-500"}`} />
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Manutenções</span>
          </div>
          <p className="text-lg font-bold text-foreground">{scheduledMaintenances}</p>
          <p className="text-[10px] text-muted-foreground/70">agendadas</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-0.5">
        {[
          { key: "services" as const, label: "Serviços", count: services.length },
          { key: "incidents" as const, label: "Incidentes", count: incidents.length },
          { key: "maintenances" as const, label: "Manutenções", count: maintenances.length },
          { key: "guide" as const, label: "Guia", count: null },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              subTab === tab.key
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {tab.label} {tab.count !== null && <span className="text-muted-foreground/70 ml-1">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* =====================================================
          SUB-TAB: SERVICES
          ===================================================== */}
      {subTab === "services" && (
        <div className="space-y-2">
          {/* Add service button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-7 text-[11px] gap-1.5 bg-primary hover:bg-primary/90"
              onClick={() => setShowNewService(!showNewService)}
            >
              <Plus className="h-3 w-3" />
              Novo Serviço
            </Button>
          </div>

          {/* New service form */}
          {showNewService && (
            <div className="bg-card/80 border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">Novo Serviço</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Nome do serviço"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="h-8 text-xs bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70"
                />
                <Input
                  placeholder="Descrição"
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="h-8 text-xs bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70"
                />
                <Input
                  placeholder="Categoria (ex: Core, Análise)"
                  value={newService.category}
                  onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                  className="h-8 text-xs bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70"
                />
                <Select value={newService.icon} onValueChange={(v) => setNewService({ ...newService, icon: v })}>
                  <SelectTrigger className="h-8 text-xs bg-muted/60 border-border text-foreground">
                    <SelectValue placeholder="Ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Ordem"
                  value={newService.sort_order}
                  onChange={(e) => setNewService({ ...newService, sort_order: parseInt(e.target.value) || 0 })}
                  className="h-8 text-xs bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-[11px]" onClick={createService} disabled={saving === "new-service"}>
                  <Save className="h-3 w-3 mr-1" /> Criar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px] text-muted-foreground" onClick={() => setShowNewService(false)}>
                  <X className="h-3 w-3 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Services list */}
          <div className="bg-card/60 border border-border rounded-2xl overflow-hidden">
            {services.map((service, idx) => {
              const statusCfg = SERVICE_STATUS_CONFIG[service.status] || SERVICE_STATUS_CONFIG.operational;
              const IconComp = iconMap[service.icon] || Server;
              const isEditing = editingService === service.id;

              return (
                <div key={service.id} className={`${idx > 0 ? "border-t border-border/50" : ""}`}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors">
                    {/* Icon */}
                    <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                      <IconComp className="h-4 w-4 text-foreground/80" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Input
                            value={editServiceData.name || ""}
                            onChange={(e) => setEditServiceData({ ...editServiceData, name: e.target.value })}
                            className="h-7 text-xs bg-muted/60 border-border text-foreground"
                          />
                          <Input
                            value={editServiceData.description || ""}
                            onChange={(e) => setEditServiceData({ ...editServiceData, description: e.target.value })}
                            className="h-7 text-xs bg-muted/60 border-border text-foreground"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-foreground/90">{service.name}</p>
                          <p className="text-[10px] text-muted-foreground/70 truncate">{service.description}</p>
                        </>
                      )}
                    </div>

                    {/* Category */}
                    <Badge className="text-[9px] bg-muted/60 text-muted-foreground border-border hidden sm:inline-flex">
                      {service.category}
                    </Badge>

                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusCfg.dot}`} />

                    {/* Status selector */}
                    <Select
                      value={service.status}
                      onValueChange={(val) => updateServiceStatus(service.id, val)}
                    >
                      <SelectTrigger className="w-[120px] h-7 text-[10px] bg-muted/40 border-border/50 text-muted-foreground flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SERVICE_STATUS_CONFIG).map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            <span className={cfg.color}>{cfg.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isEditing ? (
                        <>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-green-500 hover:text-green-400" onClick={() => saveServiceEdit(service.id)}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground/80" onClick={() => setEditingService(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground/70 hover:text-foreground/80"
                            onClick={() => { setEditingService(service.id); setEditServiceData({ name: service.name, description: service.description || "", category: service.category, icon: service.icon }); }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground/70 hover:text-red-400" onClick={() => deleteService(service.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
          SUB-TAB: INCIDENTS
          ===================================================== */}
      {subTab === "incidents" && (
        <div className="space-y-2">
          {/* Add incident button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-7 text-[11px] gap-1.5 bg-red-600 hover:bg-red-700"
              onClick={() => setShowNewIncident(!showNewIncident)}
            >
              <Plus className="h-3 w-3" />
              Novo Incidente
            </Button>
          </div>

          {/* New incident form */}
          {showNewIncident && (
            <div className="bg-card/80 border border-red-500/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">Novo Incidente</p>
              <Input
                placeholder="Título do incidente"
                value={newIncident.title}
                onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                className="h-8 text-xs bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70"
              />
              <div className="grid grid-cols-2 gap-3">
                <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({ ...newIncident, severity: v })}>
                  <SelectTrigger className="h-8 text-xs bg-muted/60 border-border text-foreground">
                    <SelectValue placeholder="Severidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}><span className={cfg.color}>{cfg.label}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={newIncident.status} onValueChange={(v) => setNewIncident({ ...newIncident, status: v })}>
                  <SelectTrigger className="h-8 text-xs bg-muted/60 border-border text-foreground">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(INCIDENT_STATUS_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}><span className={cfg.color}>{cfg.label}</span></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Affected services */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Serviços Afetados</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => {
                    const selected = newIncident.affected_services.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleAffectedService(s.id, newIncident.affected_services, (val) => setNewIncident({ ...newIncident, affected_services: val }))}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          selected ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-muted/60 text-muted-foreground border border-border/50 hover:text-foreground/80"
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-[11px] bg-red-600 hover:bg-red-700" onClick={createIncident} disabled={saving === "new-incident"}>
                  <AlertTriangle className="h-3 w-3 mr-1" /> Criar Incidente
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px] text-muted-foreground" onClick={() => setShowNewIncident(false)}>
                  <X className="h-3 w-3 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Incidents list */}
          {incidents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhum incidente registrado.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {incidents.map((incident) => {
                const statusCfg = INCIDENT_STATUS_CONFIG[incident.status] || INCIDENT_STATUS_CONFIG.investigating;
                const severityCfg = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.minor;
                const isExpanded = expandedIncident === incident.id;

                return (
                  <div key={incident.id} className="bg-card/60 border border-border rounded-xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
                      onClick={() => {
                        if (isExpanded) { setExpandedIncident(null); }
                        else { setExpandedIncident(incident.id); loadIncidentUpdates(incident.id); }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <AlertTriangle className={`h-4 w-4 flex-shrink-0 ${severityCfg.color}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{incident.title}</p>
                          <p className="text-[10px] text-muted-foreground/70">
                            {formatDateTime(incident.created_at)}
                            {incident.affected_services.length > 0 && (
                              <> · {incident.affected_services.map(getServiceName).join(", ")}</>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={`text-[9px] border ${severityCfg.bg}`}>
                          {severityCfg.label}
                        </Badge>
                        <Badge className={`text-[9px] ${statusCfg.color} bg-muted/60 border-border`}>
                          {statusCfg.label}
                        </Badge>
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/70" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border p-4 space-y-4">
                        {/* Status control */}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Status:</span>
                          {Object.entries(INCIDENT_STATUS_CONFIG).map(([key, cfg]) => (
                            <Button
                              key={key}
                              size="sm"
                              variant={incident.status === key ? "default" : "outline"}
                              className={`h-6 text-[10px] ${
                                incident.status === key
                                  ? "bg-primary hover:bg-primary/90"
                                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                              }`}
                              disabled={incident.status === key || saving === incident.id}
                              onClick={() => updateIncidentStatus(incident.id, key)}
                            >
                              {cfg.label}
                            </Button>
                          ))}
                          <div className="ml-auto">
                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-red-500 hover:text-red-400" onClick={() => deleteIncident(incident.id)}>
                              <Trash2 className="h-3 w-3 mr-1" /> Excluir
                            </Button>
                          </div>
                        </div>

                        {/* Add update */}
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Nova Atualização
                          </p>
                          <div className="flex gap-2">
                            <Select value={newUpdateStatus} onValueChange={setNewUpdateStatus}>
                              <SelectTrigger className="w-[120px] h-7 text-[10px] bg-muted/60 border-border text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(INCIDENT_STATUS_CONFIG).map(([key, cfg]) => (
                                  <SelectItem key={key} value={key}><span className={cfg.color}>{cfg.label}</span></SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Mensagem da atualização..."
                              value={newUpdateMessage}
                              onChange={(e) => setNewUpdateMessage(e.target.value)}
                              className="h-7 text-[10px] bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70 flex-1"
                            />
                            <Button
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => addIncidentUpdate(incident.id)}
                              disabled={saving === `update-${incident.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Timeline */}
                        {incidentUpdates.length > 0 && (
                          <div className="space-y-2 border-l-2 border-border pl-3 ml-1">
                            {incidentUpdates.map((update) => {
                              const uCfg = INCIDENT_STATUS_CONFIG[update.status] || INCIDENT_STATUS_CONFIG.investigating;
                              return (
                                <div key={update.id} className="relative">
                                  <div className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-muted border border-border" />
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[10px] font-medium ${uCfg.color}`}>{uCfg.label}</span>
                                    <span className="text-[10px] text-muted-foreground/70">{formatDateTime(update.created_at)}</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground">{update.message}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          SUB-TAB: MAINTENANCES
          ===================================================== */}
      {subTab === "maintenances" && (
        <div className="space-y-2">
          {/* Add maintenance button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-7 text-[11px] gap-1.5 bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowNewMaintenance(!showNewMaintenance)}
            >
              <Plus className="h-3 w-3" />
              Nova Manutenção
            </Button>
          </div>

          {/* New maintenance form */}
          {showNewMaintenance && (
            <div className="bg-card/80 border border-blue-500/20 rounded-xl p-4 space-y-3">
              <p className="text-xs font-medium text-foreground">Nova Manutenção Programada</p>
              <Input
                placeholder="Título da manutenção"
                value={newMaintenance.title}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, title: e.target.value })}
                className="h-8 text-xs bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70"
              />
              <Textarea
                placeholder="Descrição (opcional)"
                value={newMaintenance.description}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                className="text-xs bg-muted/60 border-border text-foreground placeholder:text-muted-foreground/70 min-h-[60px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Início Programado</p>
                  <Input
                    type="datetime-local"
                    value={newMaintenance.scheduled_start}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduled_start: e.target.value })}
                    className="h-8 text-xs bg-muted/60 border-border text-foreground"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Fim Programado</p>
                  <Input
                    type="datetime-local"
                    value={newMaintenance.scheduled_end}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduled_end: e.target.value })}
                    className="h-8 text-xs bg-muted/60 border-border text-foreground"
                  />
                </div>
              </div>
              {/* Affected services */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Serviços Afetados</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((s) => {
                    const selected = newMaintenance.affected_services.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleAffectedService(s.id, newMaintenance.affected_services, (val) => setNewMaintenance({ ...newMaintenance, affected_services: val }))}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                          selected ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-muted/60 text-muted-foreground border border-border/50 hover:text-foreground/80"
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700" onClick={createMaintenance} disabled={saving === "new-maintenance"}>
                  <Calendar className="h-3 w-3 mr-1" /> Agendar
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-[11px] text-muted-foreground" onClick={() => setShowNewMaintenance(false)}>
                  <X className="h-3 w-3 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Maintenances list */}
          {maintenances.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma manutenção registrada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {maintenances.map((m) => {
                const statusCfg = MAINTENANCE_STATUS_CONFIG[m.status] || MAINTENANCE_STATUS_CONFIG.scheduled;

                return (
                  <div key={m.id} className="bg-card/60 border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-[9px] ${statusCfg.color} bg-muted/60 border-border`}>
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-foreground">{m.title}</p>
                        {m.description && <p className="text-[10px] text-muted-foreground mt-0.5">{m.description}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground/70 hover:text-red-400 flex-shrink-0" onClick={() => deleteMaintenance(m.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDateTime(m.scheduled_start)}</span>
                      <span>→</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDateTime(m.scheduled_end)}</span>
                      {m.affected_services.length > 0 && (
                        <span className="text-muted-foreground/70">· {m.affected_services.map(getServiceName).join(", ")}</span>
                      )}
                    </div>

                    {/* Status control */}
                    <div className="flex items-center gap-2">
                      {Object.entries(MAINTENANCE_STATUS_CONFIG).map(([key, cfg]) => (
                        <Button
                          key={key}
                          size="sm"
                          variant={m.status === key ? "default" : "outline"}
                          className={`h-6 text-[10px] ${
                            m.status === key
                              ? "bg-primary hover:bg-primary/90"
                              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                          disabled={m.status === key || saving === m.id}
                          onClick={() => updateMaintenanceStatus(m.id, key)}
                        >
                          {cfg.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          SUB-TAB: GUIDE
          ===================================================== */}
      {subTab === "guide" && (
        <div className="space-y-4">
          {/* Intro */}
          <div className="bg-gradient-to-r from-primary/10 to-orange-500/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Guia de Gerenciamento da Status Page</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Este guia explica como gerenciar a página de status da plataforma. Todas as alterações feitas aqui refletem imediatamente na página pública <code className="text-primary">/status</code>.
            </p>
          </div>

          {/* Section: Services */}
          <div className="bg-card/60 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-green-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Gerenciando Serviços</h4>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">1.</span>
                <p>Na aba <strong className="text-foreground/80">Serviços</strong>, clique em <strong className="text-foreground/80">+ Novo Serviço</strong> para adicionar um serviço que será exibido na página de status.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">2.</span>
                <p>Preencha <strong className="text-foreground/80">nome</strong>, <strong className="text-foreground/80">categoria</strong> (Core, Integrações, Analytics, etc.), <strong className="text-foreground/80">ícone</strong> e <strong className="text-foreground/80">ordem de exibição</strong>.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">3.</span>
                <p>Para alterar o status de um serviço, clique nos botões de status ao lado dele. Os status disponíveis são:</p>
              </div>
              <div className="ml-5 grid grid-cols-2 gap-1.5">
                {Object.entries(SERVICE_STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={cfg.color}>{cfg.label}</span>
                    <span className="text-muted-foreground/70">— {key}</span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 mt-1">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">O status geral da página é determinado automaticamente pelo pior status entre todos os serviços visíveis.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Incidents */}
          <div className="bg-card/60 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Gerenciando Incidentes</h4>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong className="text-foreground/80">Quando criar um incidente:</strong> Sempre que houver um problema real que afete usuários (lentidão, erros, indisponibilidade).</p>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">1.</span>
                <p>Na aba <strong className="text-foreground/80">Incidentes</strong>, clique em <strong className="text-foreground/80">+ Novo Incidente</strong>.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">2.</span>
                <p>Defina o <strong className="text-foreground/80">título</strong> (ex: "Lentidão na API de Análise"), a <strong className="text-foreground/80">severidade</strong> e selecione os <strong className="text-foreground/80">serviços afetados</strong>.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">3.</span>
                <p>Adicione <strong className="text-foreground/80">atualizações na timeline</strong> conforme o problema evolui. Clique no incidente para expandir e usar o campo de atualização.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">4.</span>
                <p>Quando resolvido, mude o status para <strong className="text-green-400">Resolvido</strong>. O horário de resolução é registrado automaticamente.</p>
              </div>

              <p className="text-muted-foreground mt-2 font-medium">Severidades:</p>
              <div className="ml-2 space-y-1">
                {Object.entries(SEVERITY_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Badge className={`text-[9px] border ${cfg.bg} ${cfg.color}`}>{cfg.label}</Badge>
                    <span className="text-muted-foreground/70">
                      {key === "minor" && "— Impacto limitado, poucos usuários afetados"}
                      {key === "major" && "— Impacto significativo, funcionalidade comprometida"}
                      {key === "critical" && "— Serviço totalmente indisponível"}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-muted-foreground mt-2 font-medium">Fluxo recomendado de status:</p>
              <div className="flex items-center gap-1 flex-wrap ml-2">
                <Badge className="text-[9px] border border-red-500/20 bg-red-500/10 text-red-500">Investigando</Badge>
                <span className="text-muted-foreground/70">→</span>
                <Badge className="text-[9px] border border-amber-500/20 bg-amber-500/10 text-amber-500">Identificado</Badge>
                <span className="text-muted-foreground/70">→</span>
                <Badge className="text-[9px] border border-blue-500/20 bg-blue-500/10 text-blue-500">Monitorando</Badge>
                <span className="text-muted-foreground/70">→</span>
                <Badge className="text-[9px] border border-green-500/20 bg-green-500/10 text-green-500">Resolvido</Badge>
              </div>

              <div className="bg-muted/50 rounded-lg p-2.5 mt-1">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">Incidentes <strong className="text-muted-foreground">critical</strong> e <strong className="text-muted-foreground">major</strong> disparam notificação por email automaticamente (se configurado).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Maintenances */}
          <div className="bg-card/60 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Gerenciando Manutenções</h4>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p><strong className="text-foreground/80">Quando agendar:</strong> Sempre que houver uma janela de manutenção planejada que possa afetar a disponibilidade.</p>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">1.</span>
                <p>Na aba <strong className="text-foreground/80">Manutenções</strong>, clique em <strong className="text-foreground/80">+ Nova Manutenção</strong>.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">2.</span>
                <p>Defina <strong className="text-foreground/80">título</strong>, <strong className="text-foreground/80">descrição</strong>, <strong className="text-foreground/80">data/hora de início e fim</strong>, e selecione os <strong className="text-foreground/80">serviços afetados</strong>.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-primary font-bold shrink-0">3.</span>
                <p>Altere o status conforme a manutenção progride:</p>
              </div>
              <div className="flex items-center gap-1 flex-wrap ml-5">
                <Badge className="text-[9px] border border-blue-500/20 bg-blue-500/10 text-blue-500">Agendada</Badge>
                <span className="text-muted-foreground/70">→</span>
                <Badge className="text-[9px] border border-amber-500/20 bg-amber-500/10 text-amber-500">Em Andamento</Badge>
                <span className="text-muted-foreground/70">→</span>
                <Badge className="text-[9px] border border-green-500/20 bg-green-500/10 text-green-500">Concluída</Badge>
              </div>
              <div className="bg-muted/50 rounded-lg p-2.5 mt-1">
                <div className="flex items-start gap-1.5">
                  <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">Manutenções agendadas e em andamento aparecem automaticamente na seção "Manutenções Programadas" da página <code className="text-primary">/status</code>.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: How it works */}
          <div className="bg-card/60 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Como Funciona o Sistema</h4>
            </div>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="space-y-1.5">
                <p className="text-foreground/80 font-medium">Fluxo de um incidente:</p>
                <div className="bg-muted/50 rounded-lg p-3 space-y-1 font-mono text-[10px] text-muted-foreground">
                  <p>1. Problema detectado (manual ou via monitoramento externo)</p>
                  <p>2. Admin cria incidente aqui → página /status atualiza</p>
                  <p>3. Email enviado para admins (se critical/major)</p>
                  <p>4. Admin adiciona atualizações na timeline</p>
                  <p>5. Admin resolve o incidente → status volta ao normal</p>
                  <p>6. collect-uptime roda no fim do dia → registra uptime reduzido</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-foreground/80 font-medium">Automações ativas:</p>
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p><strong className="text-foreground/80">collect-uptime</strong> — Roda 1x/dia via cron. Calcula e registra o uptime de cada serviço baseado no status e incidentes do dia.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p><strong className="text-foreground/80">notify-incident</strong> — Envia email quando incidente critical/major é criado. Sem email configurado, registra no audit log.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p><strong className="text-foreground/80">status-rss</strong> — Feed RSS público com incidentes dos últimos 90 dias. Link aparece na página /status.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p><strong className="text-foreground/80">status-webhook</strong> — Recebe dados de UptimeRobot/Checkly e atualiza status + latência dos serviços.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Quick Reference */}
          <div className="bg-card/60 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-cyan-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Links Rápidos</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-muted-foreground">Página de Status (pública)</span>
                <a href="/status" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  /status <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-muted-foreground">RSS Feed</span>
                <span className="text-muted-foreground font-mono text-[10px]">/api/status-rss</span>
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-muted-foreground">Webhook (monitoramento externo)</span>
                <span className="text-muted-foreground font-mono text-[10px]">/api/status-webhook</span>
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-muted-foreground">Coleta de Uptime (cron)</span>
                <span className="text-muted-foreground font-mono text-[10px]">/api/collect-uptime (interno)</span>
              </div>
            </div>
          </div>

          {/* Section: Best Practices */}
          <div className="bg-card/60 border border-border rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Boas Práticas</h4>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <p>Crie incidentes <strong className="text-foreground/80">rapidamente</strong> — transparência gera confiança. Melhor informar cedo do que tarde.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <p>Adicione <strong className="text-foreground/80">atualizações frequentes</strong> na timeline — mesmo que seja "Ainda investigando". Silêncio gera ansiedade.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <p>Use <strong className="text-foreground/80">severidade correta</strong> — não marque tudo como "Crítico". Reserve para indisponibilidade total.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <p>Agende manutenções com <strong className="text-foreground/80">antecedência</strong> — idealmente 48h antes, para que os usuários se preparem.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <p>Após resolver, escreva um <strong className="text-foreground/80">post-mortem breve</strong> na última atualização do incidente explicando causa e ação corretiva.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
