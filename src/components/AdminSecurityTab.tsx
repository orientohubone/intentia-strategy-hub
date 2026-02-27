import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Terminal, Globe, MonitorSmartphone, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecurityEvent {
    id: string;
    event_type: string;
    ip_address: string;
    user_agent: string;
    url: string;
    details: any;
    created_at: string;
}

export default function AdminSecurityTab() {
    const [logs, setLogs] = useState<SecurityEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("security_events")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();

        // Auto-refresh subscription if needed
        const sub = supabase.channel('schema-db-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'security_events' }, payload => {
                setLogs(prev => [payload.new as SecurityEvent, ...prev].slice(0, 100));
            })
            .subscribe();

        return () => { supabase.removeChannel(sub); };
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <ShieldAlert className="text-red-500 h-6 w-6 shrink-0" />
                        <span className="line-clamp-2">Auditoria e Segurança em Tempo Real</span>
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Monitoramento de Honeypot e inspeções não autorizadas.</p>
                </div>
                <Button size="sm" variant="outline" onClick={fetchLogs} disabled={loading} className="gap-2 shrink-0 self-start sm:self-auto">
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Atualizar
                </Button>
            </div>

            <div className="bg-card border border-border shadow-md rounded-xl overflow-hidden">
                {logs.length === 0 && !loading ? (
                    <div className="text-center py-10">
                        <ShieldAlert className="h-10 w-10 text-green-500 mx-auto opacity-70 mb-3" />
                        <p className="text-muted-foreground text-sm font-medium">Nenhum evento de segurança registrado. Plataforma Segura.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {logs.map(log => (
                            <div key={log.id} className="p-4 hover:bg-muted/10 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Terminal className="text-red-500 h-4 w-4" />
                                            <span className="text-sm">{log.event_type}</span>
                                            <Badge variant="destructive" className="ml-2 text-[10px] uppercase font-bold tracking-wider">
                                                Possível Ameaça
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                                <span className="truncate" title={log.ip_address}>IP: {log.ip_address}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
                                                <Globe className="h-3.5 w-3.5 text-primary" />
                                                <span className="truncate" title={log.url}>{log.url}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
                                                <MonitorSmartphone className="h-3.5 w-3.5 text-primary" />
                                                <span className="truncate" title={log.user_agent}>{log.user_agent}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:items-end text-xs text-muted-foreground mt-3 sm:mt-0 sm:min-w-[120px] pt-3 sm:pt-0 border-t sm:border-0 border-border/40">
                                        {new Date(log.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                                        <span className="font-semibold">{new Date(log.created_at).toLocaleTimeString("pt-BR")}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
