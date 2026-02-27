import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShieldAlert, Terminal, Globe, MonitorSmartphone,
    MapPin, RefreshCw, Eye, AlertTriangle, Filter, ChevronDown, ChevronUp, Activity
} from "lucide-react";

interface SecurityEvent {
    id: string;
    event_type: string;
    ip_address: string;
    user_agent: string;
    url: string;
    details: any;
    created_at: string;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
    DEVTOOLS_INSPECTED: { label: "DevTools Aberto", color: "bg-red-500/15 text-red-400 border-red-500/30" },
    DEVTOOLS_OPENED: { label: "DevTools Detectado", color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
    CONSOLE_WARNING_GENERATED: { label: "Aviso Exibido", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    MANUAL: { label: "Teste Interno", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
};

const getEventMeta = (type: string) => {
    if (EVENT_LABELS[type]) return EVENT_LABELS[type];
    if (type.startsWith("MANUAL_")) return { label: "Teste Interno", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
    return { label: type, color: "bg-muted/30 text-muted-foreground border-border" };
};

const PAGE_SIZE = 10;

export default function AdminSecurityTab() {
    const [logs, setLogs] = useState<SecurityEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("security_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(500);

        if (!error && data) setLogs(data as SecurityEvent[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
        const sub = supabase.channel("security_events_realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "security_events" }, payload => {
                setLogs(prev => [payload.new as SecurityEvent, ...prev].slice(0, 500));
            })
            .subscribe();
        return () => { supabase.removeChannel(sub); };
    }, []);

    // Normaliza tipos p/ agrupar MANUAL_* em "MANUAL"
    const normalizeType = (type: string) => type.startsWith("MANUAL_") ? "MANUAL" : type;

    // Tipos únicos para filtros (normalizados)
    const eventTypes = useMemo(() => {
        const set = new Set(logs.map(l => normalizeType(l.event_type)));
        return ["ALL", ...Array.from(set)];
    }, [logs]);

    // IPs únicos
    const uniqueIPs = useMemo(() => new Set(logs.map(l => l.ip_address)).size, [logs]);

    // Contagem por tipo normalizado
    const countByType = useMemo(() => {
        const map: Record<string, number> = {};
        logs.forEach(l => {
            const key = normalizeType(l.event_type);
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    }, [logs]);

    // Logs filtrados (compara tipo normalizado)
    const filtered = useMemo(() =>
        filterType === "ALL" ? logs : logs.filter(l => normalizeType(l.event_type) === filterType),
        [logs, filterType]
    );

    // Paginação
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleFilter = (type: string) => {
        setFilterType(type);
        setPage(1);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <ShieldAlert className="text-red-500 h-6 w-6 shrink-0" />
                        Auditoria e Segurança em Tempo Real
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Honeypot ativo — monitorando inspeções não autorizadas.</p>
                </div>
                <Button size="sm" variant="outline" onClick={fetchLogs} disabled={loading} className="gap-2 shrink-0 self-start sm:self-auto">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
                </Button>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-card border border-border rounded-xl p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> Total de eventos</p>
                    <p className="text-2xl font-bold text-foreground">{logs.length}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5 text-red-400" /> DevTools abertos</p>
                    <p className="text-2xl font-bold text-red-400">
                        {(countByType["DEVTOOLS_INSPECTED"] || 0) + (countByType["DEVTOOLS_OPENED"] || 0)}
                    </p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-yellow-400" /> Avisos exibidos</p>
                    <p className="text-2xl font-bold text-yellow-400">{countByType["CONSOLE_WARNING_GENERATED"] || 0}</p>
                </div>
                <div className="bg-card border border-border rounded-xl p-3 space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-blue-400" /> IPs únicos</p>
                    <p className="text-2xl font-bold text-blue-400">{uniqueIPs}</p>
                </div>
            </div>

            {/* Filtros por tipo */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                {eventTypes.map(type => {
                    const meta = type === "ALL" ? null : getEventMeta(type);
                    const isActive = filterType === type;
                    return (
                        <button
                            key={type}
                            onClick={() => handleFilter(type)}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${isActive
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/30 text-muted-foreground border-border hover:border-primary/40"
                                }`}
                        >
                            {type === "ALL" ? `Todos (${logs.length})` : `${meta?.label ?? type} (${countByType[type] || 0})`}
                        </button>
                    );
                })}
            </div>

            {/* Lista paginada */}
            <div className="bg-card border border-border shadow-md rounded-xl overflow-hidden">
                {paginated.length === 0 && !loading ? (
                    <div className="text-center py-10">
                        <ShieldAlert className="h-10 w-10 text-green-500 mx-auto opacity-70 mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">Nenhum evento registrado.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {paginated.map(log => {
                            const meta = getEventMeta(log.event_type);
                            const isExpanded = expandedId === log.id;
                            return (
                                <div key={log.id} className="hover:bg-muted/10 transition-colors">
                                    {/* Linha principal clicável */}
                                    <button
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                    >
                                        <Terminal className="text-red-500 h-4 w-4 shrink-0" />
                                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${meta.color}`}>
                                            {meta.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate flex-1">{log.ip_address || "IP desconhecido"}</span>
                                        <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:block">
                                            {new Date(log.created_at).toLocaleString("pt-BR")}
                                        </span>
                                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                                    </button>

                                    {/* Detalhes expandidos */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
                                                <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                                <span className="break-all">IP: {log.ip_address || "—"}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
                                                <Globe className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                                <span className="break-all">{log.url || "—"}</span>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
                                                <MonitorSmartphone className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                                <span className="break-all">{log.user_agent || "—"}</span>
                                            </div>
                                            {log.details && Object.keys(log.details).length > 0 && (
                                                <div className="sm:col-span-3 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50 font-mono">
                                                    {JSON.stringify(log.details, null, 2)}
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

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Página {page} de {totalPages} · {filtered.length} eventos</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Anterior</Button>
                        <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
