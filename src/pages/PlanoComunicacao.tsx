import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EditorialDialog } from "@/components/audience/EditorialDialog";
import { 
  PenSquare, 
  FileText, 
  Target, 
  Users, 
  Globe, 
  MessageSquare, 
  TrendingUp,
  ArrowRight,
  Search,
  Filter,
  Settings,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
  Brain,
  Calendar,
  Download,
  Save,
  RefreshCw
} from "lucide-react";
import { getUserActiveKeys } from "@/lib/aiAnalyzer";
import { getModelsForProvider } from "@/lib/aiModels";
import { generateEditorialLine, generateProjectEditorialPlan, type EditorialLine, type ProjectContext } from "@/lib/icpEnricher";

type Audience = {
  id: string;
  name: string;
  description: string;
  industry?: string;
  company_size?: string;
  location?: string;
  keywords: string[];
  project_id?: string;
  project_name?: string;
  project_url?: string;
  project_niche?: string;
  created_at: string;
  icp_enrichment?: any;
  icp_enriched_at?: string;
};

type SavedPlan = {
  id: string;
  title: string;
  lines: EditorialLine[];
  created_at: string;
  project_id?: string | null;
  version?: number | null;
};

const sizeConfig = {
  startup: { label: "Startup", color: "bg-blue-100 text-blue-800" },
  small: { label: "Pequena", color: "bg-green-100 text-green-800" },
  medium: { label: "Média", color: "bg-yellow-100 text-yellow-800" },
  large: { label: "Grande", color: "bg-orange-100 text-orange-800" },
  enterprise: { label: "Enterprise", color: "bg-purple-100 text-purple-800" },
};

export default function PlanoComunicacao() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, tenantSettings } = useTenantData();
  const { isFeatureAvailable } = useFeatureFlags();

  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [editorialLoadingId, setEditorialLoadingId] = useState<string | null>(null);
  const [editorialDialogOpen, setEditorialDialogOpen] = useState(false);
  const [editorialContent, setEditorialContent] = useState<EditorialLine[] | null>(null);
  const [projectEditorialContent, setProjectEditorialContent] = useState<EditorialLine[] | null>(null);
  const [editorialContext, setEditorialContext] = useState<{ title: string; audienceId: string; projectId?: string } | null>(null);
  const [selectedAiModel, setSelectedAiModel] = useState("google_gemini::gemini-2.0-flash-exp");
  const [availableAiModels, setAvailableAiModels] = useState<any[]>([]);
  const [hasAiKeys, setHasAiKeys] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loadingSavedPlan, setLoadingSavedPlan] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);

  const canAiAnalysis = isFeatureAvailable("ai_analysis");

  useEffect(() => {
    if (!user) {
      navigate("/audiences");
      return;
    }
    loadAudiences();
    loadAiConfig();
  }, [user]);

  const loadAudiences = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("audiences")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAudiences(data || []);
    } catch (error: any) {
      console.error("Error loading audiences:", error);
      toast.error("Erro ao carregar públicos");
    } finally {
      setLoading(false);
    }
  };

  const loadAiConfig = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from("ai_api_keys")
        .select("provider, model")
        .eq("user_id", user.id)
        .eq("is_active", true);

      const keys = data || [];
      setHasAiKeys(keys.length > 0);

      const models = keys.map((key: any) => ({
        provider: key.provider,
        model: key.model,
        label: getModelsForProvider(key.provider).find(m => m.model === key.model)?.label || `${key.provider}::${key.model}`
      }));
      setAvailableAiModels(models);

      if (models.length > 0 && !models.find(m => `${m.provider}::${m.model}` === selectedAiModel)) {
        setSelectedAiModel(`${models[0].provider}::${models[0].model}`);
      }
    } catch (error: any) {
      console.error("Error loading AI config:", error);
    }
  };

  const fetchSavedPlans = async (audienceId: string) => {
    if (!user) return;
    setLoadingSavedPlan(true);
    try {
      const { data, error } = await (supabase as any)
        .from("communication_plans")
        .select("title, lines, project_id, created_at, id, version")
        .eq("audience_id", audienceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedPlans(data || []);
    } catch (err: any) {
      console.error("Erro ao carregar planos salvos:", err);
      toast.error("Erro ao carregar planos salvos");
    } finally {
      setLoadingSavedPlan(false);
    }
  };

  const handleGenerateEditorial = async (audience: Audience) => {
    if (!user || !canAiAnalysis) return;
    
    setEditorialLoadingId(audience.id);
    try {
      const lines = await generateEditorialLine(audience, selectedAiModel);
      setEditorialContent(lines);
      setProjectEditorialContent(null);
      setEditorialContext({ title: `Plano — ${audience.name}`, audienceId: audience.id, projectId: audience.project_id });
      fetchSavedPlans(audience.id);
      setEditorialDialogOpen(true);
    } catch (err: any) {
      console.error("Erro ao gerar linha editorial:", err);
      toast.error(err?.message || "Erro ao gerar linha editorial");
    } finally {
      setEditorialLoadingId(null);
    }
  };

  const handleOpenSavedFromCard = async (audience: Audience) => {
    setEditorialContent(null);
    setProjectEditorialContent(null);
    setEditorialContext({ title: `Planos salvos — ${audience.name}`, audienceId: audience.id, projectId: audience.project_id });
    await fetchSavedPlans(audience.id);
    setEditorialDialogOpen(true);
  };

  const handleSaveEditorialPlan = async (title: string, lines: EditorialLine[]) => {
    if (!user || !editorialContext) return;
    setSavingPlan(true);
    try {
      const { data: existingPlans } = await (supabase as any)
        .from("communication_plans")
        .select("id, version")
        .eq("audience_id", editorialContext.audienceId)
        .order("version", { ascending: false })
        .limit(1);

      const nextVersion = (existingPlans?.[0]?.version || 0) + 1;

      const { error } = await (supabase as any).rpc("save_communication_plan", {
        p_audience_id: editorialContext.audienceId,
        p_title: title,
        p_lines: lines,
        p_project_id: editorialContext.projectId,
        p_version: nextVersion
      });

      if (error) throw error;
      toast.success("Plano de comunicação salvo com sucesso.");
      await fetchSavedPlans(editorialContext.audienceId);
    } catch (err: any) {
      console.error("Erro ao salvar plano:", err);
      toast.error(err?.message || "Erro ao salvar plano");
    } finally {
      setSavingPlan(false);
    }
  };

  const handleLoadSavedPlan = async () => {
    if (!user) return;
    const ctx = editorialContext;
    if (!ctx?.audienceId) {
      toast.error("Nenhum público associado para carregar plano.");
      return;
    }
    setLoadingSavedPlan(true);
    try {
      const { data, error } = await (supabase as any)
        .from("communication_plans")
        .select("title, lines, project_id")
        .eq("audience_id", ctx.audienceId)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      const plan = data?.[0];
      if (plan) {
        setEditorialContent(plan.lines);
        setProjectEditorialContent(null);
        setEditorialDialogOpen(true);
      } else {
        toast.info("Nenhum plano salvo encontrado.");
      }
    } catch (err: any) {
      console.error("Erro ao carregar plano salvo:", err);
      toast.error("Erro ao carregar plano salvo");
    } finally {
      setLoadingSavedPlan(false);
    }
  };

  const filteredAudiences = useMemo(() => {
    return audiences.filter((audience) => {
      const matchesSearch = audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           audience.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           audience.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesProject = selectedProject === "all" || audience.project_id === selectedProject;
      const matchesSize = selectedSize === "all" || audience.company_size === selectedSize;
      
      return matchesSearch && matchesProject && matchesSize;
    });
  }, [audiences, searchTerm, selectedProject, selectedSize]);

  return (
    <FeatureGate featureKey="projects" withLayout={false}>
      <DashboardLayout>
        <SEO title="Plano de Comunicação | Intentia" />
        
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PenSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Plano de Comunicação</h1>
                <p className="text-sm text-muted-foreground">Templates e estratégias de comunicação personalizadas</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/audiences")}>
              Ver Públicos
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar públicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os projetos</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedSize} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Tamanho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Object.entries(sizeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-lg bg-card p-4 space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                    <div className="h-8 w-20 bg-muted rounded" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-6 w-24 bg-muted rounded-full" />
                    <div className="h-6 w-24 bg-muted rounded-full" />
                    <div className="h-6 w-24 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAudiences.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <PenSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {audiences.length === 0 ? "Nenhum público encontrado" : "Nenhum público corresponde aos filtros"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {audiences.length === 0 
                    ? "Crie públicos-alvo para começar a gerar planos de comunicação personalizados."
                    : "Tente ajustar os filtros ou termos de busca."
                  }
                </p>
                {audiences.length === 0 && (
                  <Button className="mt-4" onClick={() => navigate("/audiences")}>
                    Criar Primeiro Público
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audiences Grid */}
          {!loading && filteredAudiences.length > 0 && (
            <div className="space-y-4">
              {filteredAudiences.map((audience) => (
                <Card key={audience.id} className="hover:shadow-md transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{audience.name}</CardTitle>
                          {audience.company_size && (
                            <Badge variant="outline" className={sizeConfig[audience.company_size as keyof typeof sizeConfig]?.color}>
                              {sizeConfig[audience.company_size as keyof typeof sizeConfig]?.label}
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{audience.description}</CardDescription>
                        {audience.project_name && (
                          <Badge variant="secondary" className="w-fit">
                            Projeto: {audience.project_name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {audience.icp_enrichment && (
                          <Badge variant="default" className="bg-green-500">
                            <Brain className="h-3 w-3 mr-1" />
                            ICP Pronto
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Keywords */}
                    {audience.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {audience.keywords.slice(0, 5).map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {audience.keywords.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{audience.keywords.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Communication Plan Section */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PenSquare className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Plano de Comunicação</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasAiKeys && canAiAnalysis && (
                            <Select
                              value={selectedAiModel}
                              onValueChange={setSelectedAiModel}
                              disabled={editorialLoadingId === audience.id}
                            >
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                <SelectValue placeholder="Modelo IA" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableAiModels.map((m) => (
                                  <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`} className="text-xs">
                                    {m.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        <Button
                          size="sm"
                          className="h-8 text-xs w-full"
                          variant="default"
                          onClick={() => handleGenerateEditorial(audience)}
                          disabled={!audience.icp_enrichment || editorialLoadingId === audience.id || !hasAiKeys}
                        >
                          {editorialLoadingId === audience.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          Gerar Plano
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs w-full"
                          variant="outline"
                          onClick={() => handleOpenSavedFromCard(audience)}
                          disabled={editorialLoadingId === audience.id}
                        >
                          Planos Salvos
                        </Button>
                      </div>

                      {!audience.icp_enrichment && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-700">
                            <Brain className="h-3 w-3 inline mr-1" />
                            Refine o ICP primeiro para gerar planos mais precisos
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Editorial Dialog */}
          <EditorialDialog
            title={editorialContext?.title || "Plano de Comunicação"}
            lines={projectEditorialContent || editorialContent || []}
            open={editorialDialogOpen}
            onOpenChange={setEditorialDialogOpen}
            onSave={handleSaveEditorialPlan}
            saving={savingPlan}
            onLoadSaved={handleLoadSavedPlan}
            savedPlans={savedPlans}
            loadingSaved={loadingSavedPlan}
          />
        </div>
      </DashboardLayout>
    </FeatureGate>
  );
}
