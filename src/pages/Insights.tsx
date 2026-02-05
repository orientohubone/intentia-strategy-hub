import { useEffect, useMemo, useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Insight = {
  id: string;
  project_id: string;
  project_name?: string;
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action?: string | null;
  created_at: string;
};

const typeConfig = {
  warning: { label: "Alerta", color: "bg-warning/10 text-warning border-warning/30" },
  opportunity: { label: "Oportunidade", color: "bg-success/10 text-success border-success/30" },
  improvement: { label: "Melhoria", color: "bg-info/10 text-info border-info/30" },
};

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("insights")
        .select(`
          *,
          projects!inner(name)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setInsights((data || []).map((item: any) => ({
        ...item,
        project_name: item.projects?.name,
      })));
    } catch (error) {
      console.error("Erro ao buscar insights:", error);
      toast.error("Erro ao carregar insights");
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = useMemo(() => {
    return insights.filter((insight) => {
      const matchesSearch = insight.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           insight.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || insight.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [insights, searchTerm, filterType]);

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Insights Estratégicos</h1>
                <p className="text-muted-foreground">Visualize insights estratégicos de todos os projetos.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Buscar insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-80"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="warning">Alertas</option>
                <option value="opportunity">Oportunidades</option>
                <option value="improvement">Melhorias</option>
              </select>
            </div>

            {loading && <p className="text-sm text-muted-foreground">Carregando insights...</p>}
            {!loading && filteredInsights.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum insight encontrado.</p>
            )}

            <div className="space-y-4">
              {filteredInsights.map((insight) => {
                const config = typeConfig[insight.type];
                return (
                  <div key={insight.id} className="border border-border rounded-lg bg-card p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          {insight.project_name && (
                            <Badge variant="secondary">{insight.project_name}</Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-foreground mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                        {insight.action && (
                          <p className="text-sm text-primary">{insight.action}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(insight.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
