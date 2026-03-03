import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { IcpEnrichmentDialog } from "@/components/IcpEnrichmentDialog";
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Globe,
  Building,
  Search,
  Sparkles,
  Loader2,
  ArrowRight,
  Calendar,
  Tag,
  BarChart3,
} from "lucide-react";
import { getUserActiveKeys } from "@/lib/aiAnalyzer";
import { getModelsForProvider } from "@/lib/aiModels";
import { runIcpEnrichment, type IcpEnrichmentResult } from "@/lib/icpEnricher";
import { notifyIcpEnriched } from "@/lib/notificationService";

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
  icp_enrichment?: IcpEnrichmentResult;
  icp_enriched_at?: string;
};

const sizeConfig: Record<string, { label: string; color: string }> = {
  startup: { label: "Startup", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  small: { label: "Pequena", color: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  medium: { label: "Média", color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
  large: { label: "Grande", color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  enterprise: { label: "Enterprise", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
};

// ── Global Cache ────────────────────────────────────────────────
const CACHE_TTL = 1000 * 60 * 2;
const icpCache = new Map<string, { audiences: Audience[]; aiModels: any[]; hasKeys: boolean; timestamp: number }>();

export default function RefinarIcp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects } = useTenantData();
  const { isFeatureAvailable } = useFeatureFlags();

  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("all");
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [selectedEnrichmentAudience, setSelectedEnrichmentAudience] = useState<Audience | null>(null);
  const [enrichmentDialogOpen, setEnrichmentDialogOpen] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState("google_gemini::gemini-2.0-flash-exp");
  const [availableAiModels, setAvailableAiModels] = useState<any[]>([]);
  const [hasAiKeys, setHasAiKeys] = useState(false);

  const canAiAnalysis = isFeatureAvailable("ai_analysis");

  useEffect(() => {
    if (!user) {
      navigate("/audiences");
      return;
    }

    const cached = icpCache.get(user.id);
    if (cached) {
      setAudiences(cached.audiences);
      setAvailableAiModels(cached.aiModels);
      setHasAiKeys(cached.hasKeys);
      setLoading(false);

      if (Date.now() - cached.timestamp >= CACHE_TTL) {
        void loadAll({ silent: true });
      }
      return;
    }

    void loadAll();
  }, [user]);

  const loadAll = async (options?: { silent?: boolean }) => {
    if (!user) return;
    const cached = icpCache.get(user.id);
    if (!options?.silent && !cached) setLoading(true);

    try {
      const audienceRes = await supabase
        .from("audiences")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // ai_api_keys may not exist yet — handle gracefully
      let aiKeys: any[] = [];
      try {
        const aiRes = await supabase
          .from("ai_api_keys")
          .select("provider, model")
          .eq("user_id", user.id)
          .eq("is_active", true);
        if (!aiRes.error) aiKeys = aiRes.data || [];
      } catch { /* table may not exist */ }

      if (audienceRes.error) throw audienceRes.error;

      // Deduplicate audiences by name — keep enriched or most recent
      const rawAudiences = audienceRes.data || [];
      const nameMap = new Map<string, Audience>();
      for (const a of rawAudiences) {
        const key = a.name.trim().toLowerCase();
        const existing = nameMap.get(key);
        if (!existing) {
          nameMap.set(key, a);
        } else {
          // Prefer the enriched version, or the most recent one
          const existingIsEnriched = !!existing.icp_enrichment;
          const newIsEnriched = !!a.icp_enrichment;
          if (newIsEnriched && !existingIsEnriched) {
            nameMap.set(key, a);
          } else if (!existingIsEnriched && !newIsEnriched) {
            // Keep the most recent
            if (new Date(a.created_at) > new Date(existing.created_at)) {
              nameMap.set(key, a);
            }
          }
        }
      }
      const dedupedAudiences = Array.from(nameMap.values());

      const nextHasKeys = aiKeys.length > 0;
      const nextModels = aiKeys.map((key: any) => ({
        provider: key.provider,
        model: key.model,
        label: getModelsForProvider(key.provider).find((m: any) => m.model === key.model)?.label || `${key.provider}::${key.model}`,
      }));

      setAudiences(dedupedAudiences);
      setHasAiKeys(nextHasKeys);
      setAvailableAiModels(nextModels);

      if (nextModels.length > 0 && !nextModels.find((m: any) => `${m.provider}::${m.model}` === selectedAiModel)) {
        setSelectedAiModel(`${nextModels[0].provider}::${nextModels[0].model}`);
      }

      icpCache.set(user.id, {
        audiences: dedupedAudiences,
        aiModels: nextModels,
        hasKeys: nextHasKeys,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      console.error("Error loading data:", error?.message || "Unknown error");
      if (!cached) toast.error("Erro ao carregar públicos");
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  const handleEnrichIcp = async (audience: Audience) => {
    if (!user || !canAiAnalysis) return;

    setEnrichingId(audience.id);
    try {
      const [provider, model] = selectedAiModel.split("::");
      const result = await runIcpEnrichment(
        user.id,
        audience.id,
        {
          name: audience.name,
          description: audience.description,
          industry: audience.industry || "",
          companySize: audience.company_size || "",
          location: audience.location || "",
          keywords: audience.keywords || [],
        },
        provider as "google_gemini" | "anthropic_claude",
        model
      );

      toast.success("ICP refinado com sucesso!");
      if (user) notifyIcpEnriched(user.id, audience.name);

      // Update local state + cache
      const updated = audiences.map((a) =>
        a.id === audience.id
          ? { ...a, icp_enrichment: result, icp_enriched_at: new Date().toISOString() }
          : a
      );
      setAudiences(updated);

      const cached = icpCache.get(user.id);
      if (cached) {
        icpCache.set(user.id, { ...cached, audiences: updated, timestamp: Date.now() });
      }
    } catch (err: any) {
      console.error("Erro ao refinar ICP:", err?.message || "Unknown error");
      toast.error(err?.message || "Erro ao refinar ICP com IA");
    } finally {
      setEnrichingId(null);
    }
  };

  const filteredAudiences = useMemo(() => {
    return audiences.filter((audience) => {
      const matchesSearch =
        audience.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProject = selectedProject === "all" || audience.project_id === selectedProject;
      const matchesSize = selectedSize === "all" || audience.company_size === selectedSize;

      return matchesSearch && matchesProject && matchesSize;
    });
  }, [audiences, searchTerm, selectedProject, selectedSize]);

  const handleViewEnrichment = (audience: Audience) => {
    setSelectedEnrichmentAudience(audience);
    setEnrichmentDialogOpen(true);
  };

  // Stats
  const totalAudiences = audiences.length;
  const enrichedCount = useMemo(() => audiences.filter((a) => a.icp_enrichment).length, [audiences]);
  const avgScore = useMemo(() => {
    const enriched = audiences.filter((a) => a.icp_enrichment);
    if (enriched.length === 0) return 0;
    // Use recommendations count as a proxy score
    return Math.round(enriched.reduce((sum, a) => sum + (a.icp_enrichment?.recommendations?.length || 0), 0) / enriched.length);
  }, [audiences]);

  return (
    <FeatureGate featureKey="projects" withLayout={false}>
      <DashboardLayout>
        <SEO title="Refinar ICP | Intentia" />

        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Refinar ICP</h1>
                <p className="text-sm text-muted-foreground">Análise inteligente de perfil de cliente ideal</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/audiences")}>
              Ver Públicos
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Públicos</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{totalAudiences}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg shrink-0">
                  <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Refinados</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{enrichedCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Recomendações</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{avgScore}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg shrink-0">
                  <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Pendentes</p>
                  <p className="text-lg sm:text-xl font-bold text-foreground">{totalAudiences - enrichedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar públicos por nome, descrição ou keyword..."
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-4 sm:p-5 space-y-3 animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-36 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-6 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="flex gap-1.5">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                    <div className="h-5 w-20 bg-muted rounded-full" />
                    <div className="h-5 w-14 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredAudiences.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {audiences.length === 0 ? "Nenhum público encontrado" : "Nenhum público corresponde aos filtros"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {audiences.length === 0
                  ? "Crie públicos-alvo para começar a refinar seus ICPs com análise inteligente."
                  : "Tente ajustar os filtros ou termos de busca."}
              </p>
              {audiences.length === 0 && (
                <Button className="mt-4" onClick={() => navigate("/audiences")}>
                  Criar Primeiro Público
                </Button>
              )}
            </div>
          )}

          {/* Audiences Grid */}
          {!loading && filteredAudiences.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {filteredAudiences.map((audience) => {
                const isEnriched = !!audience.icp_enrichment;
                const isEnriching = enrichingId === audience.id;
                const sizeInfo = audience.company_size ? sizeConfig[audience.company_size] : null;

                return (
                  <div
                    key={audience.id}
                    className={`group rounded-xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg ${isEnriched ? "border-green-500/30 hover:border-green-500/50" : "border-border hover:border-primary/50"
                      }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 sm:p-5 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isEnriched ? "bg-green-500/10" : "bg-primary/10"
                            }`}>
                            {isEnriched ? (
                              <Brain className="h-5 w-5 text-green-500" />
                            ) : (
                              <Target className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">{audience.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{audience.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {sizeInfo && (
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sizeInfo.color}`}>
                              {sizeInfo.label}
                            </Badge>
                          )}
                          {isEnriched && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">
                              <Brain className="h-2.5 w-2.5 mr-0.5" />
                              Refinado
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {audience.industry && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span>{audience.industry}</span>
                          </div>
                        )}
                        {audience.location && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{audience.location}</span>
                          </div>
                        )}
                        {audience.project_name && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {audience.project_name}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Keywords */}
                    {audience.keywords.length > 0 && (
                      <div className="px-4 sm:px-5 pb-3">
                        <div className="flex flex-wrap gap-1">
                          {audience.keywords.slice(0, 4).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/30 border-border/50">
                              <Tag className="h-2 w-2 mr-0.5 opacity-50" />
                              {keyword}
                            </Badge>
                          ))}
                          {audience.keywords.length > 4 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/30 border-border/50 text-muted-foreground">
                              +{audience.keywords.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enrichment Preview */}
                    {isEnriched && audience.icp_enrichment && (
                      <div className="px-4 sm:px-5 pb-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "Setor", value: audience.icp_enrichment.idealProfile.industry || "—", color: "text-primary" },
                            { label: "Porte", value: audience.icp_enrichment.idealProfile.companySize || "—", color: "text-foreground" },
                            { label: "Budget", value: audience.icp_enrichment.idealProfile.budgetRange || "—", color: "text-foreground" },
                            { label: "Local", value: audience.icp_enrichment.idealProfile.location || "—", color: "text-foreground" },
                          ].map((item) => (
                            <div key={item.label} className="bg-muted/30 rounded-lg p-2 text-center border border-border/30">
                              <p className={`text-xs sm:text-sm font-bold ${item.color} truncate`}>{item.value}</p>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-border/50 bg-muted/20">
                      <div className="flex items-center gap-2">
                        {!isEnriched && hasAiKeys && canAiAnalysis && (
                          <Select
                            value={selectedAiModel}
                            onValueChange={setSelectedAiModel}
                            disabled={isEnriching}
                          >
                            <SelectTrigger className="h-7 w-[110px] text-[10px] border-border/50">
                              <SelectValue placeholder="Modelo IA" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAiModels.map((m: any) => (
                                <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`} className="text-xs">
                                  {m.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {audience.icp_enriched_at && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>
                              {new Date(audience.icp_enriched_at).toLocaleDateString("pt-BR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isEnriched ? "outline" : "default"}
                        className="h-7 text-[11px] gap-1"
                        disabled={isEnriching || (!hasAiKeys && !isEnriched)}
                        onClick={() => {
                          if (isEnriched) {
                            handleViewEnrichment(audience);
                          } else {
                            handleEnrichIcp(audience);
                          }
                        }}
                      >
                        {isEnriching ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Refinando...
                          </>
                        ) : isEnriched ? (
                          <>
                            Visualizar
                            <ArrowRight className="h-3 w-3" />
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            Refinar ICP
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ICP Enrichment Dialog */}
          <IcpEnrichmentDialog
            audienceName={selectedEnrichmentAudience?.name || ""}
            enrichment={selectedEnrichmentAudience?.icp_enrichment || null}
            open={enrichmentDialogOpen}
            onOpenChange={setEnrichmentDialogOpen}
          />
        </div>
      </DashboardLayout>
    </FeatureGate>
  );
}
