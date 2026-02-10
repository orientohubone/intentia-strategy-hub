import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  ShieldAlert,
  TrendingDown,
  Ban,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Types
interface Project {
  id: string;
  name: string;
  score: number | null;
  url: string | null;
  niche: string | null;
}

interface InsightAlert {
  id: string;
  project_id: string;
  project_name: string;
  type: "warning";
  title: string;
  description: string;
  action?: string | null;
  created_at: string;
}

interface ChannelRisk {
  project_id: string;
  project_name: string;
  channel: string;
  score: number;
  is_recommended: boolean;
  risks: string[];
  objective?: string | null;
}

type AlertCategory = "all" | "premature" | "not_recommended" | "risks" | "warnings";

const channelNames: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  linkedin: "LinkedIn Ads",
  tiktok: "TikTok Ads",
};

const channelColors: Record<string, string> = {
  google: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  meta: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  linkedin: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  tiktok: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20",
};

export default function Alerts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [insightAlerts, setInsightAlerts] = useState<InsightAlert[]>([]);
  const [channelRisks, setChannelRisks] = useState<ChannelRisk[]>([]);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<AlertCategory>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const allSectionKeys = ["premature", "not_recommended", "risks", "warnings"];

  useEffect(() => {
    if (user) loadAlerts();
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Load projects
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name, score, url, niche")
        .eq("user_id", user.id)
        .order("name");

      const projectsList = (projectData || []) as Project[];
      setProjects(projectsList);

      const projectMap = new Map(projectsList.map((p) => [p.id, p.name]));

      // Load warning insights
      const { data: insightData } = await (supabase as any)
        .from("insights")
        .select("id, project_id, type, title, description, action, created_at")
        .eq("user_id", user.id)
        .eq("type", "warning")
        .order("created_at", { ascending: false });

      const alerts: InsightAlert[] = (insightData || []).map((i: any) => ({
        ...i,
        project_name: projectMap.get(i.project_id) || "Projeto desconhecido",
      }));
      setInsightAlerts(alerts);

      // Load channel scores with risks
      const { data: channelData } = await (supabase as any)
        .from("project_channel_scores")
        .select("project_id, channel, score, is_recommended, risks, objective")
        .eq("user_id", user.id);

      const risks: ChannelRisk[] = (channelData || [])
        .filter((c: any) => !c.is_recommended || c.score < 50 || (c.risks && c.risks.length > 0))
        .map((c: any) => ({
          ...c,
          risks: c.risks || [],
          project_name: projectMap.get(c.project_id) || "Projeto desconhecido",
        }));
      setChannelRisks(risks);
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Computed: premature investment alerts (score < 50)
  const prematureAlerts = channelRisks.filter((c) => c.score < 50);

  // Computed: not recommended channels
  const notRecommended = channelRisks.filter((c) => !c.is_recommended);

  // Computed: channels with specific risks
  const withRisks = channelRisks.filter((c) => c.risks.length > 0);

  // Filter logic
  const filteredInsights = insightAlerts.filter(
    (a) => filterProject === "all" || a.project_id === filterProject
  );

  const filteredPremature = prematureAlerts.filter(
    (a) => filterProject === "all" || a.project_id === filterProject
  );

  const filteredNotRecommended = notRecommended.filter(
    (a) => filterProject === "all" || a.project_id === filterProject
  );

  const filteredWithRisks = withRisks.filter(
    (a) => filterProject === "all" || a.project_id === filterProject
  );

  // Stats
  const totalAlerts =
    (filterCategory === "all" || filterCategory === "warnings" ? filteredInsights.length : 0) +
    (filterCategory === "all" || filterCategory === "premature" ? filteredPremature.length : 0) +
    (filterCategory === "all" || filterCategory === "not_recommended" ? filteredNotRecommended.length : 0) +
    (filterCategory === "all" || filterCategory === "risks" ? filteredWithRisks.length : 0);

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <FeatureGate featureKey="strategic_alerts" withLayout={false} pageTitle="Alertas Estratégicos">
    <DashboardLayout>
      <SEO title="Alertas" noindex />
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              Alertas Estratégicos
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Avisos sobre investimentos prematuros, canais não recomendados e riscos identificados em seus projetos.
            </p>
          </div>
          {totalAlerts > 0 && (
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                title="Expandir todas as categorias"
                onClick={() => setExpandedSections(new Set(allSectionKeys))}
              >
                <ChevronsUpDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                title="Recolher todas as categorias"
                onClick={() => setExpandedSections(new Set())}
              >
                <ChevronsDownUp className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
              <SelectValue placeholder="Filtrar por projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os projetos</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as AlertCategory)}>
            <SelectTrigger className="w-full sm:w-[220px] h-9 text-sm">
              <SelectValue placeholder="Tipo de alerta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="premature">Investimento Prematuro</SelectItem>
              <SelectItem value="not_recommended">Canal Não Recomendado</SelectItem>
              <SelectItem value="risks">Riscos por Canal</SelectItem>
              <SelectItem value="warnings">Alertas da Análise</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/5">
              {totalAlerts} alerta{totalAlerts !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <Card
            className={`cursor-pointer transition-colors ${filterCategory === "premature" ? "ring-2 ring-red-500/50" : ""}`}
            onClick={() => setFilterCategory(filterCategory === "premature" ? "all" : "premature")}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <TrendingDown className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-red-500">{prematureAlerts.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Investimento Prematuro</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${filterCategory === "not_recommended" ? "ring-2 ring-amber-500/50" : ""}`}
            onClick={() => setFilterCategory(filterCategory === "not_recommended" ? "all" : "not_recommended")}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <Ban className="h-5 w-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-amber-500">{notRecommended.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Não Recomendados</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${filterCategory === "risks" ? "ring-2 ring-orange-500/50" : ""}`}
            onClick={() => setFilterCategory(filterCategory === "risks" ? "all" : "risks")}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-orange-500">{withRisks.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Riscos Identificados</p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-colors ${filterCategory === "warnings" ? "ring-2 ring-yellow-500/50" : ""}`}
            onClick={() => setFilterCategory(filterCategory === "warnings" ? "all" : "warnings")}
          >
            <CardContent className="p-3 sm:p-4 text-center">
              <Info className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-xl sm:text-2xl font-bold text-yellow-500">{insightAlerts.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Alertas da Análise</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        )}

        {/* Empty State */}
        {!loading && totalAlerts === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ShieldAlert className="h-12 w-12 text-green-500 mx-auto mb-4 opacity-60" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum alerta encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                {projects.length === 0
                  ? "Crie seu primeiro projeto e execute uma análise para receber alertas estratégicos."
                  : "Seus projetos não possuem alertas no momento. Isso é um bom sinal!"}
              </p>
              {projects.length === 0 && (
                <Button variant="hero" size="sm" onClick={() => navigate("/projects")}>
                  Criar Projeto
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Premature Investment Alerts */}
        {!loading && (filterCategory === "all" || filterCategory === "premature") && filteredPremature.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("premature")}
              className="flex items-center gap-2 w-full text-left group"
            >
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${!expandedSections.has("premature") ? "-rotate-90" : ""}`} />
              <TrendingDown className="h-4 w-4 text-red-500" />
              <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">Investimento Prematuro</h2>
              <Badge variant="outline" className="text-red-500 border-red-500/30 text-[10px]">
                {filteredPremature.length}
              </Badge>
            </button>
            {expandedSections.has("premature") && (
            <>
            <p className="text-xs text-muted-foreground -mt-1 ml-[22px]">
              Canais com score abaixo de 50 indicam que seu site ainda não está preparado para receber tráfego pago nesse canal. Investir agora pode resultar em desperdício de budget.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {filteredPremature.map((item) => {
                const key = `premature-${item.project_id}-${item.channel}`;
                const expanded = expandedCards.has(key);
                const scoreColor = item.score < 30 ? "text-red-600" : "text-orange-500";
                return (
                  <Card key={key} className="border-red-500/20 bg-red-500/[0.02]">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={channelColors[item.channel] + " text-[10px] sm:text-xs"}>
                              {channelNames[item.channel]}
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate">{item.project_name}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-2xl font-bold ${scoreColor}`}>{item.score}</span>
                            <span className="text-xs text-muted-foreground">/100</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Score abaixo de 50 — investimento neste canal pode ser prematuro.
                            {item.score < 30 && " Score crítico: considere melhorias significativas antes de investir."}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => toggleExpand(key)}
                        >
                          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                      {expanded && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          {item.objective && (
                            <p className="text-xs"><span className="font-medium text-foreground">Objetivo:</span> <span className="text-muted-foreground">{item.objective}</span></p>
                          )}
                          {item.risks.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-foreground mb-1">Riscos:</p>
                              <ul className="space-y-1">
                                {item.risks.map((risk, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-red-400 mt-0.5 shrink-0">•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] sm:text-xs gap-1"
                              onClick={() => navigate("/projects")}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver Projeto
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </>
            )}
          </div>
        )}

        {/* Not Recommended Channels */}
        {!loading && (filterCategory === "all" || filterCategory === "not_recommended") && filteredNotRecommended.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("not_recommended")}
              className="flex items-center gap-2 w-full text-left group"
            >
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${!expandedSections.has("not_recommended") ? "-rotate-90" : ""}`} />
              <Ban className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">Canais Não Recomendados</h2>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">
                {filteredNotRecommended.length}
              </Badge>
            </button>
            {expandedSections.has("not_recommended") && (
            <>
            <p className="text-xs text-muted-foreground -mt-1 ml-[22px]">
              A análise estratégica identificou que estes canais não são adequados para o projeto no momento. Investir neles pode não trazer retorno.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {filteredNotRecommended.map((item) => {
                const key = `notrec-${item.project_id}-${item.channel}`;
                const expanded = expandedCards.has(key);
                return (
                  <Card key={key} className="border-amber-500/20 bg-amber-500/[0.02]">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={channelColors[item.channel] + " text-[10px] sm:text-xs"}>
                              {channelNames[item.channel]}
                            </Badge>
                            <Badge variant="outline" className="text-red-500 border-red-500/30 text-[10px]">
                              ✗ Não recomendado
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 truncate">
                            Projeto: <span className="font-medium text-foreground">{item.project_name}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Score: <span className="font-medium">{item.score}/100</span> — este canal não é indicado para o perfil do projeto.
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => toggleExpand(key)}
                        >
                          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                      {expanded && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          {item.objective && (
                            <p className="text-xs"><span className="font-medium text-foreground">Objetivo:</span> <span className="text-muted-foreground">{item.objective}</span></p>
                          )}
                          {item.risks.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-foreground mb-1">Riscos:</p>
                              <ul className="space-y-1">
                                {item.risks.map((risk, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-amber-400 mt-0.5 shrink-0">•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[10px] sm:text-xs gap-1"
                              onClick={() => navigate("/tactical")}
                            >
                              <ExternalLink className="h-3 w-3" />
                              Ver Plano Tático
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </>
            )}
          </div>
        )}

        {/* Channel Risks */}
        {!loading && (filterCategory === "all" || filterCategory === "risks") && filteredWithRisks.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("risks")}
              className="flex items-center gap-2 w-full text-left group"
            >
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${!expandedSections.has("risks") ? "-rotate-90" : ""}`} />
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">Riscos por Canal</h2>
              <Badge variant="outline" className="text-orange-500 border-orange-500/30 text-[10px]">
                {filteredWithRisks.length}
              </Badge>
            </button>
            {expandedSections.has("risks") && (
            <>
            <p className="text-xs text-muted-foreground -mt-1 ml-[22px]">
              Riscos específicos identificados pela análise para cada canal. Considere mitigá-los antes de investir.
            </p>
            <div className="space-y-2">
              {filteredWithRisks.map((item) => {
                const key = `risk-${item.project_id}-${item.channel}`;
                return (
                  <Card key={key} className="border-orange-500/20 bg-orange-500/[0.02]">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge className={channelColors[item.channel] + " text-[10px] sm:text-xs"}>
                          {channelNames[item.channel]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.project_name}</span>
                        <span className="text-xs font-medium ml-auto">Score: {item.score}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {item.risks.map((risk, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                            <AlertTriangle className="h-3 w-3 text-orange-400 mt-0.5 shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </>
            )}
          </div>
        )}

        {/* Warning Insights */}
        {!loading && (filterCategory === "all" || filterCategory === "warnings") && filteredInsights.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("warnings")}
              className="flex items-center gap-2 w-full text-left group"
            >
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${!expandedSections.has("warnings") ? "-rotate-90" : ""}`} />
              <Info className="h-4 w-4 text-yellow-500" />
              <h2 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors">Alertas da Análise Heurística</h2>
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 text-[10px]">
                {filteredInsights.length}
              </Badge>
            </button>
            {expandedSections.has("warnings") && (
            <>
            <p className="text-xs text-muted-foreground -mt-1 ml-[22px]">
              Problemas identificados automaticamente pela análise da URL do projeto. Resolva-os para melhorar seus scores.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {filteredInsights.map((insight) => {
                const key = `insight-${insight.id}`;
                const expanded = expandedCards.has(key);
                return (
                  <Card key={key} className="border-yellow-500/20 bg-yellow-500/[0.02]">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1 truncate">{insight.project_name}</p>
                          <p className="text-sm font-medium text-foreground">{insight.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{insight.description}</p>
                        </div>
                        {insight.action && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => toggleExpand(key)}
                          >
                            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </div>
                      {expanded && insight.action && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs">
                            <span className="font-medium text-foreground">Ação recomendada:</span>{" "}
                            <span className="text-muted-foreground">{insight.action}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            </>
            )}
          </div>
        )}

        {/* Info Box */}
        {!loading && totalAlerts > 0 && (
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">Como interpretar os alertas</h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li><span className="font-medium text-red-500">Investimento Prematuro</span> — O score do canal está abaixo de 50. Seu site precisa de melhorias antes de investir nesse canal.</li>
                    <li><span className="font-medium text-amber-500">Canal Não Recomendado</span> — A análise estratégica indica que esse canal não é adequado para o perfil do seu projeto.</li>
                    <li><span className="font-medium text-orange-500">Riscos por Canal</span> — Riscos específicos que podem impactar o retorno do investimento nesse canal.</li>
                    <li><span className="font-medium text-yellow-500">Alertas da Análise</span> — Problemas na URL do projeto que afetam a prontidão para receber tráfego pago.</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    <strong>Dica:</strong> Resolva os alertas de investimento prematuro e canais não recomendados antes de criar campanhas. 
                    Use o <button className="text-primary hover:underline font-medium" onClick={() => navigate("/tactical")}>Plano Tático</button> para estruturar campanhas apenas nos canais recomendados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
    </FeatureGate>
  );
}
