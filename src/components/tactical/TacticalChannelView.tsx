import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Crosshair,
  Layers,
  FileText,
  Users,
  FlaskConical,
  AlertTriangle,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { CHANNELS, FUNNEL_STAGES, COPY_FRAMEWORK_TYPES, QUALITY_SCORE_FACTORS, getScoreColor, getScoreLabel } from "@/lib/tacticalTypes";
import type { ChannelKey } from "@/lib/tacticalTypes";

interface ChannelScore {
  channel: ChannelKey;
  score: number;
  objective: string | null;
  funnel_role: string | null;
  is_recommended: boolean;
  risks: string[] | null;
}

interface ProjectAudience {
  id: string;
  name: string;
  description: string;
  industry: string | null;
  company_size: string | null;
  location: string | null;
  keywords: string[];
}

interface Props {
  channel: ChannelKey;
  tacticalPlanId: string;
  channelScore: ChannelScore | null;
  projectId: string;
  projectAudiences?: ProjectAudience[];
  onScoreUpdate?: () => void;
}

interface ChannelPlanData {
  id?: string;
  campaign_type: string;
  funnel_stage: string;
  funnel_role: string;
  bidding_strategy: string;
  campaign_structure: Record<string, string>;
  ad_group_structure: Array<{ name: string; intent: string }>;
  extensions_plan: string[];
  quality_score_factors: Record<string, string>;
  segmentation: Record<string, string>;
  key_metrics: Array<{ metric: string; target: string }>;
  tactical_score: number;
  coherence_score: number;
  clarity_score: number;
  segmentation_score: number;
  alerts: Array<{ type: string; title: string; description: string }>;
}

interface CopyFramework {
  id?: string;
  framework_type: string;
  framework_name: string;
  structure: Record<string, string>;
  notes: string;
}

interface TestPlan {
  id?: string;
  test_name: string;
  hypothesis: string;
  what_to_test: string;
  success_criteria: string;
  priority: string;
  status: string;
}

interface SegmentationEntry {
  id?: string;
  audience_id?: string | null;
  audience_name: string;
  targeting_criteria: Record<string, string>;
  message_angle: string;
  priority: string;
  notes: string;
}

const defaultChannelPlan: ChannelPlanData = {
  campaign_type: "",
  funnel_stage: "",
  funnel_role: "",
  bidding_strategy: "",
  campaign_structure: {},
  ad_group_structure: [],
  extensions_plan: [],
  quality_score_factors: {},
  segmentation: {},
  key_metrics: [],
  tactical_score: 0,
  coherence_score: 0,
  clarity_score: 0,
  segmentation_score: 0,
  alerts: [],
};

export function TacticalChannelView({ channel, tacticalPlanId, channelScore, projectId, projectAudiences = [], onScoreUpdate }: Props) {
  const { user } = useAuth();
  const config = CHANNELS[channel];

  const [plan, setPlan] = useState<ChannelPlanData>(defaultChannelPlan);
  const [copyFrameworks, setCopyFrameworks] = useState<CopyFramework[]>([]);
  const [testPlans, setTestPlans] = useState<TestPlan[]>([]);
  const [segmentations, setSegmentations] = useState<SegmentationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    campaign: true,
    structure: false,
    copy: false,
    segmentation: false,
    metrics: false,
    tests: false,
    score: false,
  });

  useEffect(() => {
    loadChannelData();
  }, [channel, tacticalPlanId, user]);

  useEffect(() => {
    if (projectAudiences.length > 0 && !loading) {
      setExpandedSections((prev) => ({ ...prev, segmentation: true }));
    }
  }, [projectAudiences, loading]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadChannelData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Load channel plan
      const { data: channelPlan, error: cpError } = await (supabase as any)
        .from("tactical_channel_plans")
        .select("*")
        .eq("tactical_plan_id", tacticalPlanId)
        .eq("channel", channel)
        .eq("user_id", user.id)
        .maybeSingle();

      if (cpError) console.error("Error loading channel plan:", cpError);

      if (channelPlan) {
        setPlan({
          id: channelPlan.id,
          campaign_type: channelPlan.campaign_type || "",
          funnel_stage: channelPlan.funnel_stage || "",
          funnel_role: channelPlan.funnel_role || "",
          bidding_strategy: channelPlan.bidding_strategy || "",
          campaign_structure: channelPlan.campaign_structure || {},
          ad_group_structure: channelPlan.ad_group_structure || [],
          extensions_plan: channelPlan.extensions_plan || [],
          quality_score_factors: channelPlan.quality_score_factors || {},
          segmentation: channelPlan.segmentation || {},
          key_metrics: channelPlan.key_metrics || [],
          tactical_score: channelPlan.tactical_score || 0,
          coherence_score: channelPlan.coherence_score || 0,
          clarity_score: channelPlan.clarity_score || 0,
          segmentation_score: channelPlan.segmentation_score || 0,
          alerts: channelPlan.alerts || [],
        });
      } else {
        setPlan(defaultChannelPlan);
      }

      // Load copy frameworks
      const { data: frameworks } = await (supabase as any)
        .from("copy_frameworks")
        .select("*")
        .eq("tactical_plan_id", tacticalPlanId)
        .eq("channel", channel)
        .eq("user_id", user.id);
      setCopyFrameworks(
        (frameworks || []).map((f: any) => ({
          id: f.id,
          framework_type: f.framework_type,
          framework_name: f.framework_name,
          structure: f.structure || {},
          notes: f.notes || "",
        }))
      );

      // Load test plans
      const { data: tests } = await (supabase as any)
        .from("testing_plans")
        .select("*")
        .eq("tactical_plan_id", tacticalPlanId)
        .eq("channel", channel)
        .eq("user_id", user.id);
      setTestPlans(
        (tests || []).map((t: any) => ({
          id: t.id,
          test_name: t.test_name,
          hypothesis: t.hypothesis,
          what_to_test: t.what_to_test,
          success_criteria: t.success_criteria,
          priority: t.priority || "medium",
          status: t.status || "planned",
        }))
      );

      // Load segmentation plans
      const { data: segs } = await (supabase as any)
        .from("segmentation_plans")
        .select("*")
        .eq("tactical_plan_id", tacticalPlanId)
        .eq("channel", channel)
        .eq("user_id", user.id);
      setSegmentations(
        (segs || []).map((s: any) => ({
          id: s.id,
          audience_id: s.audience_id || null,
          audience_name: s.audience_name,
          targeting_criteria: s.targeting_criteria || {},
          message_angle: s.message_angle || "",
          priority: s.priority || "medium",
          notes: s.notes || "",
        }))
      );
    } catch (err) {
      console.error("Error loading channel data:", err);
    } finally {
      setLoading(false);
    }
  };

  const computeTacticalScore = () => {
    let coherence = 0;
    let clarity = 0;
    let segScore = 0;

    // Coherence: does the plan align with strategic data?
    if (plan.campaign_type) coherence += 25;
    if (plan.funnel_stage) coherence += 25;
    if (plan.funnel_role) coherence += 25;
    if (channelScore && channelScore.is_recommended) coherence += 25;
    else if (channelScore && !channelScore.is_recommended && plan.campaign_type) coherence += 10;

    // Clarity: is the structure well-defined?
    if (plan.campaign_type) clarity += 15;
    if (plan.bidding_strategy) clarity += 15;
    if (plan.ad_group_structure.length > 0) clarity += 20;
    if (plan.key_metrics.length > 0) clarity += 15;
    if (copyFrameworks.length > 0) clarity += 15;
    if (testPlans.length > 0) clarity += 10;
    if (channel === "google" && plan.extensions_plan.length > 0) clarity += 10;
    else if (channel !== "google") clarity += 10;

    // Segmentation quality
    if (segmentations.length > 0) segScore += 40;
    if (segmentations.length >= 2) segScore += 20;
    const hasAngles = segmentations.every((s) => s.message_angle.trim() !== "");
    if (hasAngles && segmentations.length > 0) segScore += 20;
    const hasPriorities = segmentations.every((s) => s.priority);
    if (hasPriorities && segmentations.length > 0) segScore += 20;

    coherence = Math.min(100, coherence);
    clarity = Math.min(100, clarity);
    segScore = Math.min(100, segScore);
    const tactical = Math.round((coherence * 0.35) + (clarity * 0.4) + (segScore * 0.25));

    return { tactical_score: tactical, coherence_score: coherence, clarity_score: clarity, segmentation_score: segScore };
  };

  const saveChannelPlan = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Compute scores before saving
      const scores = computeTacticalScore();
      const updatedPlan = { ...plan, ...scores };
      setPlan(updatedPlan);

      const payload = {
        tactical_plan_id: tacticalPlanId,
        user_id: user.id,
        channel,
        campaign_type: updatedPlan.campaign_type || null,
        funnel_stage: updatedPlan.funnel_stage || null,
        funnel_role: updatedPlan.funnel_role || null,
        bidding_strategy: updatedPlan.bidding_strategy || null,
        campaign_structure: updatedPlan.campaign_structure,
        ad_group_structure: updatedPlan.ad_group_structure,
        extensions_plan: updatedPlan.extensions_plan,
        quality_score_factors: updatedPlan.quality_score_factors,
        segmentation: updatedPlan.segmentation,
        key_metrics: updatedPlan.key_metrics,
        tactical_score: updatedPlan.tactical_score,
        coherence_score: updatedPlan.coherence_score,
        clarity_score: updatedPlan.clarity_score,
        segmentation_score: updatedPlan.segmentation_score,
        alerts: updatedPlan.alerts,
      };

      if (updatedPlan.id) {
        const { error } = await (supabase as any)
          .from("tactical_channel_plans")
          .update(payload)
          .eq("id", updatedPlan.id);
        if (error) throw error;
      } else {
        const { data, error } = await (supabase as any)
          .from("tactical_channel_plans")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setPlan((prev) => ({ ...prev, id: data.id }));
      }

      // Save copy frameworks (delete + re-insert for simplicity)
      await (supabase as any).from("copy_frameworks").delete()
        .eq("tactical_plan_id", tacticalPlanId)
        .eq("channel", channel)
        .eq("user_id", user.id);
      for (const fw of copyFrameworks) {
        await (supabase as any).from("copy_frameworks").insert({
          tactical_plan_id: tacticalPlanId,
          user_id: user.id,
          channel,
          framework_type: fw.framework_type,
          framework_name: fw.framework_name,
          structure: fw.structure,
          notes: fw.notes,
        });
      }

      // Save segmentation plans
      await (supabase as any).from("segmentation_plans").delete()
        .eq("tactical_plan_id", tacticalPlanId)
        .eq("channel", channel)
        .eq("user_id", user.id);
      for (const seg of segmentations) {
        await (supabase as any).from("segmentation_plans").insert({
          tactical_plan_id: tacticalPlanId,
          user_id: user.id,
          channel,
          audience_id: seg.audience_id || null,
          audience_name: seg.audience_name,
          targeting_criteria: seg.targeting_criteria,
          message_angle: seg.message_angle,
          priority: seg.priority,
          notes: seg.notes,
        });
      }

      // Save test plans
      await (supabase as any).from("testing_plans").delete()
        .eq("tactical_plan_id", tacticalPlanId)
        .eq("channel", channel)
        .eq("user_id", user.id);
      for (const test of testPlans) {
        await (supabase as any).from("testing_plans").insert({
          tactical_plan_id: tacticalPlanId,
          user_id: user.id,
          channel,
          test_name: test.test_name,
          hypothesis: test.hypothesis,
          what_to_test: test.what_to_test,
          success_criteria: test.success_criteria,
          priority: test.priority,
          status: test.status,
        });
      }

      // Update parent scores
      onScoreUpdate?.();

      toast.success(`Plano tático ${config.fullLabel} salvo!`);
    } catch (err) {
      console.error("Error saving channel plan:", err);
      toast.error("Erro ao salvar plano tático");
    } finally {
      setSaving(false);
    }
  };

  // Alerts generation
  const generateAlerts = () => {
    const newAlerts: ChannelPlanData["alerts"] = [];

    if (channelScore && !channelScore.is_recommended) {
      newAlerts.push({
        type: "warning",
        title: "Canal não recomendado",
        description: `A análise estratégica indica que ${config.fullLabel} não é recomendado para este projeto (score: ${channelScore.score}).`,
      });
    }

    if (channelScore && channelScore.score < 40 && plan.campaign_type) {
      newAlerts.push({
        type: "warning",
        title: "Score estratégico baixo",
        description: `O score estratégico de ${channelScore.score} sugere que o investimento neste canal pode ser prematuro.`,
      });
    }

    if (plan.campaign_type && !plan.funnel_stage) {
      newAlerts.push({
        type: "info",
        title: "Etapa do funil não definida",
        description: "Defina a etapa do funil para alinhar a campanha com a jornada do cliente.",
      });
    }

    if (plan.campaign_type && plan.ad_group_structure.length === 0) {
      newAlerts.push({
        type: "info",
        title: "Estrutura de grupos não definida",
        description: "Adicione grupos de anúncios para organizar a campanha por intenção ou público.",
      });
    }

    setPlan((prev) => ({ ...prev, alerts: newAlerts }));
  };

  useEffect(() => {
    if (!loading) generateAlerts();
  }, [plan.campaign_type, plan.funnel_stage, plan.ad_group_structure.length, channelScore, loading]);

  // Add helpers
  const addAdGroup = () => {
    setPlan((prev) => ({
      ...prev,
      ad_group_structure: [...prev.ad_group_structure, { name: "", intent: "" }],
    }));
  };

  const removeAdGroup = (index: number) => {
    setPlan((prev) => ({
      ...prev,
      ad_group_structure: prev.ad_group_structure.filter((_, i) => i !== index),
    }));
  };

  const addMetric = () => {
    setPlan((prev) => ({
      ...prev,
      key_metrics: [...prev.key_metrics, { metric: "", target: "" }],
    }));
  };

  const removeMetric = (index: number) => {
    setPlan((prev) => ({
      ...prev,
      key_metrics: prev.key_metrics.filter((_, i) => i !== index),
    }));
  };

  const addTestPlan = () => {
    setTestPlans((prev) => [
      ...prev,
      { test_name: "", hypothesis: "", what_to_test: "", success_criteria: "", priority: "medium", status: "planned" },
    ]);
  };

  const removeTestPlan = (index: number) => {
    setTestPlans((prev) => prev.filter((_, i) => i !== index));
  };

  const addSegmentation = () => {
    setSegmentations((prev) => [
      ...prev,
      { audience_id: null, audience_name: "", targeting_criteria: {}, message_angle: "", priority: "medium", notes: "" },
    ]);
  };

  const importAudience = (audience: ProjectAudience) => {
    const alreadyImported = segmentations.some((s) => s.audience_id === audience.id);
    if (alreadyImported) {
      toast.info(`"${audience.name}" já está adicionado neste canal.`);
      return;
    }
    const criteria: Record<string, string> = {};
    if (audience.industry) criteria.industry = audience.industry;
    if (audience.company_size) criteria.company_size = audience.company_size;
    if (audience.location) criteria.location = audience.location;
    if (audience.keywords?.length > 0) criteria.keywords = audience.keywords.join(", ");
    setSegmentations((prev) => [
      ...prev,
      {
        audience_id: audience.id,
        audience_name: audience.name,
        targeting_criteria: criteria,
        message_angle: "",
        priority: "medium",
        notes: audience.description || "",
      },
    ]);
    toast.success(`Público "${audience.name}" importado!`);
  };

  const removeSegmentation = (index: number) => {
    setSegmentations((prev) => prev.filter((_, i) => i !== index));
  };

  const addCopyFramework = (type: string) => {
    const fwType = COPY_FRAMEWORK_TYPES.find((f) => f.value === type);
    if (!fwType) return;
    const structure: Record<string, string> = {};
    fwType.steps.forEach((step) => {
      structure[step] = "";
    });
    setCopyFrameworks((prev) => [
      ...prev,
      { framework_type: type, framework_name: fwType.label, structure, notes: "" },
    ]);
  };

  const removeCopyFramework = (index: number) => {
    setCopyFrameworks((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const SectionHeader = ({
    sectionKey,
    icon: Icon,
    title,
    subtitle,
    count,
  }: {
    sectionKey: string;
    icon: React.ElementType;
    title: string;
    subtitle: string;
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            {title}
            {count !== undefined && count > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{count}</Badge>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronUp className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Channel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <span className={`text-lg font-bold ${config.color}`}>{config.label.charAt(0)}</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{config.fullLabel}</h2>
            {channelScore && (
              <p className="text-xs text-muted-foreground">
                Score estratégico: <span className={`font-semibold ${getScoreColor(channelScore.score)}`}>{channelScore.score}</span>
                {channelScore.objective && ` · ${channelScore.objective}`}
              </p>
            )}
          </div>
        </div>
        <Button onClick={saveChannelPlan} disabled={saving} size="sm">
          <Save className="h-4 w-4 mr-1.5" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {/* Alerts */}
      {plan.alerts.length > 0 && (
        <div className="space-y-2">
          {plan.alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                alert.type === "warning"
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-blue-500/30 bg-blue-500/5"
              }`}
            >
              <AlertTriangle
                className={`h-4 w-4 mt-0.5 shrink-0 ${
                  alert.type === "warning" ? "text-amber-500" : "text-blue-500"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── 1. CAMPANHA ─── */}
      <SectionHeader
        sectionKey="campaign"
        icon={Crosshair}
        title="Tipo de Campanha e Funil"
        subtitle="Defina o tipo de campanha e o papel no funil"
      />
      {expandedSections.campaign && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Tipo de Campanha</label>
              <select
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={plan.campaign_type}
                onChange={(e) => setPlan((prev) => ({ ...prev, campaign_type: e.target.value }))}
              >
                <option value="">Selecionar...</option>
                {config.campaignTypes.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Etapa do Funil</label>
              <select
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={plan.funnel_stage}
                onChange={(e) => setPlan((prev) => ({ ...prev, funnel_stage: e.target.value }))}
              >
                <option value="">Selecionar...</option>
                {FUNNEL_STAGES.map((fs) => (
                  <option key={fs.value} value={fs.value}>{fs.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Papel no Funil</label>
              <input
                type="text"
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Ex: Captura de leads qualificados"
                value={plan.funnel_role}
                onChange={(e) => setPlan((prev) => ({ ...prev, funnel_role: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Estratégia de Lances</label>
              <select
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={plan.bidding_strategy}
                onChange={(e) => setPlan((prev) => ({ ...prev, bidding_strategy: e.target.value }))}
              >
                <option value="">Selecionar...</option>
                {config.biddingStrategies.map((bs) => (
                  <option key={bs} value={bs}>{bs}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Extensions (Google only) */}
          {channel === "google" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-medium text-foreground">Extensões Recomendadas</label>
              <div className="flex flex-wrap gap-2">
                {config.extensions.map((ext) => {
                  const isSelected = plan.extensions_plan.includes(ext);
                  return (
                    <button
                      key={ext}
                      onClick={() => {
                        setPlan((prev) => ({
                          ...prev,
                          extensions_plan: isSelected
                            ? prev.extensions_plan.filter((e) => e !== ext)
                            : [...prev.extensions_plan, ext],
                        }));
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {ext}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quality Score Factors (Google only) */}
          {channel === "google" && (
            <div className="space-y-3 pt-2 border-t border-border">
              <label className="text-xs font-medium text-foreground">Fatores de Índice de Qualidade</label>
              {QUALITY_SCORE_FACTORS.map((factor) => (
                <div key={factor.key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground">{factor.label}</p>
                    <p className="text-[10px] text-muted-foreground">— {factor.description}</p>
                  </div>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Descreva a estratégia para este fator..."
                    value={(plan.quality_score_factors as Record<string, string>)[factor.key] || ""}
                    onChange={(e) =>
                      setPlan((prev) => ({
                        ...prev,
                        quality_score_factors: { ...prev.quality_score_factors, [factor.key]: e.target.value },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 2. ESTRUTURA ─── */}
      <SectionHeader
        sectionKey="structure"
        icon={Layers}
        title="Estrutura de Grupos"
        subtitle="Organize grupos de anúncios por intenção ou público"
        count={plan.ad_group_structure.length}
      />
      {expandedSections.structure && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          {plan.ad_group_structure.map((group, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-1">
                {i + 1}
              </span>
              <div className="flex-1 grid sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  className="h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Nome do grupo"
                  value={group.name}
                  onChange={(e) => {
                    const updated = [...plan.ad_group_structure];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setPlan((prev) => ({ ...prev, ad_group_structure: updated }));
                  }}
                />
                <input
                  type="text"
                  className="h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Intenção / público-alvo"
                  value={group.intent}
                  onChange={(e) => {
                    const updated = [...plan.ad_group_structure];
                    updated[i] = { ...updated[i], intent: e.target.value };
                    setPlan((prev) => ({ ...prev, ad_group_structure: updated }));
                  }}
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeAdGroup(i)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addAdGroup}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Adicionar Grupo
          </Button>
        </div>
      )}

      {/* ─── 3. COPY FRAMEWORKS ─── */}
      <SectionHeader
        sectionKey="copy"
        icon={FileText}
        title="Frameworks de Copy"
        subtitle="Estruturas de argumentação por canal (sem textos finais)"
        count={copyFrameworks.length}
      />
      {expandedSections.copy && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          {copyFrameworks.map((fw, i) => {
            const fwType = COPY_FRAMEWORK_TYPES.find((f) => f.value === fw.framework_type);
            return (
              <div key={i} className="border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{fw.framework_name}</p>
                    {fwType && <p className="text-xs text-muted-foreground">{fwType.description}</p>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCopyFramework(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.keys(fw.structure).map((step) => (
                    <div key={step} className="space-y-1">
                      <label className="text-[10px] font-medium text-primary uppercase tracking-wider">{step}</label>
                      <input
                        type="text"
                        className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder={`Diretriz para "${step}"...`}
                        value={fw.structure[step] || ""}
                        onChange={(e) => {
                          const updated = [...copyFrameworks];
                          updated[i] = {
                            ...updated[i],
                            structure: { ...updated[i].structure, [step]: e.target.value },
                          };
                          setCopyFrameworks(updated);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Notas adicionais..."
                  value={fw.notes}
                  onChange={(e) => {
                    const updated = [...copyFrameworks];
                    updated[i] = { ...updated[i], notes: e.target.value };
                    setCopyFrameworks(updated);
                  }}
                />
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            {COPY_FRAMEWORK_TYPES.map((fwt) => (
              <Button key={fwt.value} variant="outline" size="sm" onClick={() => addCopyFramework(fwt.value)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {fwt.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* ─── 4. SEGMENTAÇÃO ─── */}
      <SectionHeader
        sectionKey="segmentation"
        icon={Users}
        title="Segmentação"
        subtitle="Público × canal × mensagem"
        count={segmentations.length}
      />
      {expandedSections.segmentation && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          {/* Import from project audiences */}
          {projectAudiences.length > 0 && (
            <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 space-y-2">
              <p className="text-[10px] font-medium text-primary uppercase tracking-wider">Importar do Projeto</p>
              <div className="flex flex-wrap gap-2">
                {projectAudiences.map((aud) => {
                  const alreadyUsed = segmentations.some((s) => s.audience_id === aud.id);
                  return (
                    <button
                      key={aud.id}
                      onClick={() => importAudience(aud)}
                      disabled={alreadyUsed}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        alreadyUsed
                          ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : "border-primary/30 bg-card text-foreground hover:border-primary hover:bg-primary/10"
                      }`}
                    >
                      <Users className="h-3 w-3" />
                      {aud.name}
                      {alreadyUsed && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {projectAudiences.length === 0 && segmentations.length === 0 && (
            <div className="flex items-start gap-2 p-3 rounded-lg border border-blue-500/30 bg-blue-500/5">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Nenhum público-alvo vinculado a este projeto. Cadastre públicos na seção <strong>Públicos-Alvo</strong> e vincule ao projeto para importá-los aqui automaticamente.
              </p>
            </div>
          )}
          {segmentations.map((seg, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">Segmento {i + 1}</Badge>
                  {seg.audience_id && (
                    <Badge className="text-[10px] bg-primary/10 text-primary border-primary/30">Vinculado</Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSegmentation(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-foreground">Público</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Nome do público-alvo"
                    value={seg.audience_name}
                    onChange={(e) => {
                      const updated = [...segmentations];
                      updated[i] = { ...updated[i], audience_name: e.target.value };
                      setSegmentations(updated);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-foreground">Ângulo da Mensagem</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Foco em ROI e economia"
                    value={seg.message_angle}
                    onChange={(e) => {
                      const updated = [...segmentations];
                      updated[i] = { ...updated[i], message_angle: e.target.value };
                      setSegmentations(updated);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-foreground">Prioridade</label>
                  <select
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={seg.priority}
                    onChange={(e) => {
                      const updated = [...segmentations];
                      updated[i] = { ...updated[i], priority: e.target.value };
                      setSegmentations(updated);
                    }}
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-foreground">Notas</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Observações..."
                    value={seg.notes}
                    onChange={(e) => {
                      const updated = [...segmentations];
                      updated[i] = { ...updated[i], notes: e.target.value };
                      setSegmentations(updated);
                    }}
                  />
                </div>
              </div>
              {/* Targeting criteria badges (from imported audience) */}
              {Object.keys(seg.targeting_criteria).length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                  {Object.entries(seg.targeting_criteria).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      industry: "Indústria",
                      company_size: "Porte",
                      location: "Local",
                      keywords: "Keywords",
                    };
                    return (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {labels[key] || key}: {value}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSegmentation}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Adicionar Segmento
          </Button>
        </div>
      )}

      {/* ─── 5. MÉTRICAS ─── */}
      <SectionHeader
        sectionKey="metrics"
        icon={Crosshair}
        title="Métricas-Chave"
        subtitle="KPIs e metas por canal"
        count={plan.key_metrics.length}
      />
      {expandedSections.metrics && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          {plan.key_metrics.map((metric, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 grid sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  className="h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Métrica (ex: CPA, CTR, ROAS)"
                  value={metric.metric}
                  onChange={(e) => {
                    const updated = [...plan.key_metrics];
                    updated[i] = { ...updated[i], metric: e.target.value };
                    setPlan((prev) => ({ ...prev, key_metrics: updated }));
                  }}
                />
                <input
                  type="text"
                  className="h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Meta (ex: < R$50, > 3%)"
                  value={metric.target}
                  onChange={(e) => {
                    const updated = [...plan.key_metrics];
                    updated[i] = { ...updated[i], target: e.target.value };
                    setPlan((prev) => ({ ...prev, key_metrics: updated }));
                  }}
                />
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeMetric(i)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMetric}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Adicionar Métrica
          </Button>
        </div>
      )}

      {/* ─── 6. TESTES ─── */}
      <SectionHeader
        sectionKey="tests"
        icon={FlaskConical}
        title="Plano de Testes"
        subtitle="Hipóteses, o que testar e critérios de sucesso"
        count={testPlans.length}
      />
      {expandedSections.tests && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          {testPlans.map((test, i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px]">Teste {i + 1}</Badge>
                <div className="flex items-center gap-2">
                  <select
                    className="h-7 rounded border border-border bg-background px-2 text-[10px] focus:outline-none"
                    value={test.priority}
                    onChange={(e) => {
                      const updated = [...testPlans];
                      updated[i] = { ...updated[i], priority: e.target.value };
                      setTestPlans(updated);
                    }}
                  >
                    <option value="high">Alta</option>
                    <option value="medium">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeTestPlan(i)}>
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-foreground">Nome do Teste</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Teste de headline"
                    value={test.test_name}
                    onChange={(e) => {
                      const updated = [...testPlans];
                      updated[i] = { ...updated[i], test_name: e.target.value };
                      setTestPlans(updated);
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-foreground">O que Testar</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: Headline A vs B"
                    value={test.what_to_test}
                    onChange={(e) => {
                      const updated = [...testPlans];
                      updated[i] = { ...updated[i], what_to_test: e.target.value };
                      setTestPlans(updated);
                    }}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-medium text-foreground">Hipótese</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Se mudarmos X, esperamos que Y aumente em Z%"
                    value={test.hypothesis}
                    onChange={(e) => {
                      const updated = [...testPlans];
                      updated[i] = { ...updated[i], hypothesis: e.target.value };
                      setTestPlans(updated);
                    }}
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-medium text-foreground">Critério de Sucesso</label>
                  <input
                    type="text"
                    className="w-full h-8 rounded-lg border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ex: CTR > 3% com significância estatística"
                    value={test.success_criteria}
                    onChange={(e) => {
                      const updated = [...testPlans];
                      updated[i] = { ...updated[i], success_criteria: e.target.value };
                      setTestPlans(updated);
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addTestPlan}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Adicionar Teste
          </Button>
        </div>
      )}

      {/* ─── 7. SCORE TÁTICO ─── */}
      <SectionHeader
        sectionKey="score"
        icon={Crosshair}
        title="Score Tático"
        subtitle="Avaliação de coerência, clareza e segmentação"
      />
      {expandedSections.score && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Coerência</p>
              <p className={`text-2xl font-bold ${getScoreColor(plan.coherence_score)}`}>
                {plan.coherence_score || "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">com a estratégia</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Clareza</p>
              <p className={`text-2xl font-bold ${getScoreColor(plan.clarity_score)}`}>
                {plan.clarity_score || "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">da estrutura</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Segmentação</p>
              <p className={`text-2xl font-bold ${getScoreColor(plan.segmentation_score)}`}>
                {plan.segmentation_score || "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">qualidade</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground mb-1">Score Tático do Canal</p>
            <p className={`text-4xl font-bold ${getScoreColor(plan.tactical_score)}`}>
              {plan.tactical_score || "—"}
            </p>
            {plan.tactical_score > 0 && (
              <p className={`text-sm font-medium ${getScoreColor(plan.tactical_score)}`}>
                {getScoreLabel(plan.tactical_score)}
              </p>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-3">
            Os scores são calculados automaticamente conforme o plano é preenchido e validado pela IA.
          </p>
        </div>
      )}
    </div>
  );
}
