import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  ArrowRight,
  Search,
  FolderOpen,
  Maximize2,
  Minimize2,
  Calendar,
  Zap,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { exportInsightsPdf } from "@/lib/reportGenerator";
import { exportInsightsCsv } from "@/lib/exportCsv";

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
  warning: {
    label: "Alerta",
    icon: AlertTriangle,
    cardBg: "bg-warning/5 dark:bg-warning/10",
    borderColor: "border-l-warning",
    badgeColor: "bg-warning/10 text-warning border-warning/30",
    iconColor: "text-warning",
  },
  opportunity: {
    label: "Oportunidade",
    icon: TrendingUp,
    cardBg: "bg-success/5 dark:bg-success/10",
    borderColor: "border-l-success",
    badgeColor: "bg-success/10 text-success border-success/30",
    iconColor: "text-success",
  },
  improvement: {
    label: "Melhoria",
    icon: Lightbulb,
    cardBg: "bg-info/5 dark:bg-info/10",
    borderColor: "border-l-info",
    badgeColor: "bg-info/10 text-info border-info/30",
    iconColor: "text-info",
  },
};

type ProjectGroup = {
  projectId: string;
  projectName: string;
  insights: Insight[];
  warnings: number;
  opportunities: number;
  improvements: number;
};

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (user) fetchInsights();
  }, [user]);

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

  const groupedByProject = useMemo(() => {
    const groups: Record<string, ProjectGroup> = {};
    filteredInsights.forEach((insight) => {
      const pid = insight.project_id;
      if (!groups[pid]) {
        groups[pid] = {
          projectId: pid,
          projectName: insight.project_name || "Projeto",
          insights: [],
          warnings: 0,
          opportunities: 0,
          improvements: 0,
        };
      }
      groups[pid].insights.push(insight);
      if (insight.type === "warning") groups[pid].warnings++;
      else if (insight.type === "opportunity") groups[pid].opportunities++;
      else groups[pid].improvements++;
    });
    return Object.values(groups);
  }, [filteredInsights]);

  const stats = useMemo(() => ({
    total: filteredInsights.length,
    warnings: filteredInsights.filter((i) => i.type === "warning").length,
    opportunities: filteredInsights.filter((i) => i.type === "opportunity").length,
    improvements: filteredInsights.filter((i) => i.type === "improvement").length,
  }), [filteredInsights]);

  const handleOpenInsight = (insight: Insight) => {
    setSelectedInsight(insight);
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Insights Estratégicos</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">Insights gerados automaticamente a partir da análise dos seus projetos.</p>
              </div>
              {filteredInsights.length > 0 && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => exportInsightsPdf({
                      insights: filteredInsights.map(i => ({ type: i.type, title: i.title, description: i.description, action: i.action || undefined, project_name: i.project_name, created_at: i.created_at })),
                      counts: { warnings: stats.warnings, opportunities: stats.opportunities, improvements: stats.improvements },
                    })}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => exportInsightsCsv(filteredInsights.map(i => ({ type: i.type, title: i.title, description: i.description, action: i.action || undefined, project_name: i.project_name, created_at: i.created_at })))}
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">CSV</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Total</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-warning" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Alertas</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-warning">{stats.warnings}</p>
              </div>
              <div className="rounded-lg border border-success/20 bg-success/5 p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Oportunidades</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-success">{stats.opportunities}</p>
              </div>
              <div className="rounded-lg border border-info/20 bg-info/5 p-3 sm:p-4">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                  <Lightbulb className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-info" />
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">Melhorias</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-info">{stats.improvements}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1 md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
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

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}

            {/* Empty */}
            {!loading && filteredInsights.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">Nenhum insight encontrado</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Insights são gerados automaticamente quando você analisa a URL de um projeto. Crie um projeto e execute a análise para ver os insights aqui.
                </p>
              </div>
            )}

            {/* Grouped by project */}
            {!loading && groupedByProject.map((group) => (
              <div key={group.projectId} className="space-y-3">
                {/* Project header */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-foreground truncate">{group.projectName}</h2>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{group.insights.length} insights</span>
                      {group.warnings > 0 && (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-warning/10 text-warning border-warning/30">
                          {group.warnings} alertas
                        </Badge>
                      )}
                      {group.opportunities > 0 && (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-success/10 text-success border-success/30">
                          {group.opportunities} oport.
                        </Badge>
                      )}
                      {group.improvements > 0 && (
                        <Badge variant="outline" className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 bg-info/10 text-info border-info/30">
                          {group.improvements} melhorias
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Insight cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                  {group.insights.map((insight) => {
                    const config = typeConfig[insight.type];
                    const Icon = config.icon;
                    return (
                      <div
                        key={insight.id}
                        onClick={() => handleOpenInsight(insight)}
                        className={cn(
                          "rounded-lg border-l-4 border border-border p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.99] sm:hover:scale-[1.01]",
                          config.cardBg,
                          config.borderColor
                        )}
                      >
                        <div className="flex items-start gap-2 sm:gap-2.5">
                          <div className={cn("mt-0.5 flex-shrink-0", config.iconColor)}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Badge variant="outline" className={cn("text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0 mb-1 sm:mb-1.5", config.badgeColor)}>
                              {config.label}
                            </Badge>
                            <h4 className="font-medium text-foreground text-xs sm:text-sm leading-snug line-clamp-2">{insight.title}</h4>
                            <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{insight.description}</p>
                            {insight.action && (
                              <p className="text-[11px] sm:text-xs text-primary font-medium mt-1.5 leading-snug line-clamp-1">
                                <ArrowRight className="h-2.5 w-2.5 sm:h-3 sm:w-3 inline mr-0.5 sm:mr-1" />
                                {insight.action}
                              </p>
                            )}
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1.5 sm:mt-2 flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              {new Date(insight.created_at).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

      {/* Insight Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) setFullscreen(false); setDialogOpen(v); }}>
        <DialogContent className={cn(
          "overflow-y-auto p-0 transition-all duration-200",
          fullscreen
            ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none"
            : "max-w-lg max-h-[90vh]"
        )}>
          {selectedInsight && (() => {
            const config = typeConfig[selectedInsight.type];
            const Icon = config.icon;
            return (
              <>
                {/* Dialog Header */}
                <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
                  <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 flex-shrink-0"
                        onClick={() => setFullscreen((f) => !f)}
                        title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                      >
                        {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                      <DialogTitle className="text-lg">Detalhe do Insight</DialogTitle>
                    </div>
                  </DialogHeader>
                </div>

                {/* Dialog Body */}
                <div className="px-6 py-5 space-y-5">
                  {/* Type + Project */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={cn("text-xs", config.badgeColor)}>
                      <Icon className="h-3.5 w-3.5 mr-1" />
                      {config.label}
                    </Badge>
                    {selectedInsight.project_name && (
                      <Badge variant="secondary" className="text-xs">{selectedInsight.project_name}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedInsight.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  {/* Title */}
                  <div className={cn("rounded-lg border-l-4 p-4", config.cardBg, config.borderColor)}>
                    <div className="flex items-start gap-3">
                      <div className={cn("mt-0.5", config.iconColor)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground text-base leading-snug">{selectedInsight.title}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedInsight.description}</p>
                  </div>

                  {/* Action */}
                  {selectedInsight.action && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <h4 className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        Ação Recomendada
                      </h4>
                      <p className="text-sm text-primary font-medium">{selectedInsight.action}</p>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
