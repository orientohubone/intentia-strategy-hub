import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ScoreRing";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { notifyTacticalPlanCreated, notifyPlaybookGenerated } from "@/lib/notificationService";
import {
  Crosshair,
  Layers,
  FileText,
  Users,
  FlaskConical,
  BarChart3,
  AlertTriangle,
  ChevronRight,
  Plus,
  ArrowLeft,
  Info,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  BookOpen,
  Play,
  Rocket,
  Trophy,
  Zap,
  Target,
  Eye,
  FolderOpen,
  Monitor,
  Factory,
  GraduationCap,
  Landmark,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";
import { CHANNELS, CHANNEL_LIST, FUNNEL_STAGES, COPY_FRAMEWORK_TYPES, QUALITY_SCORE_FACTORS, getScoreColor, getScoreLabel } from "@/lib/tacticalTypes";
import type { ChannelKey, TacticalAlert } from "@/lib/tacticalTypes";
import { TACTICAL_TEMPLATES, getTemplateById } from "@/lib/tacticalTemplates";
import type { TacticalTemplate } from "@/lib/tacticalTemplates";
import { TacticalChannelView } from "@/components/tactical/TacticalChannelView";
import { TacticalOverview } from "@/components/tactical/TacticalOverview";

const TEMPLATE_ICON_MAP: Record<string, LucideIcon> = {
  Monitor,
  Crosshair,
  Factory,
  GraduationCap,
  Landmark,
  HeartPulse,
};

function TemplateIcon({ name, className }: { name: string; className?: string }) {
  const Icon = TEMPLATE_ICON_MAP[name];
  if (!Icon) return <Layers className={className} />;
  return <Icon className={className} />;
}

type TabKey = "overview" | "templates" | "playbook" | ChannelKey;

interface ChannelTacticalScore {
  channel: ChannelKey;
  tactical_score: number;
  coherence_score: number;
  clarity_score: number;
  segmentation_score: number;
}

interface PlaybookDirective {
  channel: ChannelKey;
  phase: string;
  title: string;
  actions: string[];
  priority: "critical" | "high" | "medium";
  kpis: string[];
}

interface ProjectOption {
  id: string;
  name: string;
  score: number;
  status: string;
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

interface TacticalPlanData {
  id: string;
  project_id: string;
  status: "draft" | "in_progress" | "completed";
  overall_tactical_score: number;
  strategic_coherence_score: number;
  structure_clarity_score: number;
  segmentation_quality_score: number;
  notes: string | null;
}

interface ChannelScore {
  channel: ChannelKey;
  score: number;
  objective: string | null;
  funnel_role: string | null;
  is_recommended: boolean;
  risks: string[] | null;
}

type TacticalProjectsCacheState = {
  projects: ProjectOption[];
  selectedProjectId: string | null;
  fetchedAt: number;
};

type TacticalProjectDataCacheState = {
  tacticalPlan: TacticalPlanData | null;
  channelScores: ChannelScore[];
  channelTacticalScores: ChannelTacticalScore[];
  projectAudiences: ProjectAudience[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 2 * 60 * 1000;
const tacticalProjectsCache = new Map<string, TacticalProjectsCacheState>();
const tacticalProjectDataCache = new Map<string, TacticalProjectDataCacheState>();

export default function TacticalPlan() {
  const { user } = useAuth();
  const userId = user?.id;
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [tacticalPlan, setTacticalPlan] = useState<TacticalPlanData | null>(null);
  const [channelScores, setChannelScores] = useState<ChannelScore[]>([]);
  const [channelTacticalScores, setChannelTacticalScores] = useState<ChannelTacticalScore[]>([]);
  const [projectAudiences, setProjectAudiences] = useState<ProjectAudience[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [playbook, setPlaybook] = useState<PlaybookDirective[]>([]);
  const [runningPlan, setRunningPlan] = useState(false);

  const getProjectCacheKey = (projectId: string) => `${userId}:${projectId}`;

  useEffect(() => {
    if (!userId) {
      setProjects([]);
      setSelectedProjectId(null);
      setLoading(false);
      return;
    }

    const cached = tacticalProjectsCache.get(userId);
    if (cached) {
      setProjects(cached.projects);
      setSelectedProjectId((prev) => prev || cached.selectedProjectId);
      setLoading(false);

      if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
        void loadProjects({ silent: true });
      }
      return;
    }

    void loadProjects();
  }, [userId]);

  useEffect(() => {
    if (!selectedProjectId || !userId) return;

    const key = getProjectCacheKey(selectedProjectId);
    const cached = tacticalProjectDataCache.get(key);

    if (cached) {
      setTacticalPlan(cached.tacticalPlan);
      setChannelScores(cached.channelScores);
      setChannelTacticalScores(cached.channelTacticalScores);
      setProjectAudiences(cached.projectAudiences);
      setLoadingPlan(false);

      if (Date.now() - cached.fetchedAt >= CACHE_TTL_MS) {
        void loadProjectData(selectedProjectId, { silent: true });
      }
      return;
    }

    void loadProjectData(selectedProjectId);
  }, [selectedProjectId, userId]);

  const loadProjects = async (options?: { silent?: boolean }) => {
    if (!userId) return;
    const cached = tacticalProjectsCache.get(userId);
    if (!options?.silent && !cached) setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, name, score, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const nextProjects = data || [];
      const nextSelectedProjectId = selectedProjectId || (nextProjects[0]?.id ?? null);

      setProjects(nextProjects);
      if (nextSelectedProjectId && !selectedProjectId) {
        setSelectedProjectId(nextSelectedProjectId);
      }

      tacticalProjectsCache.set(userId, {
        projects: nextProjects,
        selectedProjectId: nextSelectedProjectId,
        fetchedAt: Date.now(),
      });
    } catch (err) {
      console.error("Error loading projects:", err?.message || "Unknown error");
    } finally {
      if (!options?.silent || !cached) setLoading(false);
    }
  };

  const loadProjectAudiences = async (targetProjectId: string = selectedProjectId || "") => {
    if (!userId || !targetProjectId) {
      setProjectAudiences([]);
      return [];
    }
    try {
      const { data, error } = await (supabase as any)
        .from("audiences")
        .select("id, name, description, industry, company_size, location, keywords")
        .eq("user_id", userId)
        .eq("project_id", targetProjectId)
        .order("name");

      if (error) throw error;
      const next = data || [];
      setProjectAudiences(next);
      return next as ProjectAudience[];
    } catch (err) {
      console.error("Error loading project audiences:", err?.message || "Unknown error");
      setProjectAudiences([]);
      return [];
    }
  };

  const loadTacticalPlan = async (targetProjectId: string = selectedProjectId || "") => {
    if (!userId || !targetProjectId) {
      setTacticalPlan(null);
      return null;
    }
    try {
      const { data, error } = await (supabase as any)
        .from("tactical_plans")
        .select("*")
        .eq("project_id", targetProjectId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      const next = data || null;
      setTacticalPlan(next);
      return next as TacticalPlanData | null;
    } catch (err) {
      console.error("Error loading tactical plan:", err?.message || "Unknown error");
      setTacticalPlan(null);
      return null;
    }
  };

  const loadChannelScores = async (targetProjectId: string = selectedProjectId || ""): Promise<ChannelScore[]> => {
    if (!userId || !targetProjectId) return [];
    try {
      const { data, error } = await supabase
        .from("project_channel_scores")
        .select("channel, score, objective, funnel_role, is_recommended, risks")
        .eq("project_id", targetProjectId)
        .eq("user_id", userId);

      if (error) throw error;
      const scores = (data as ChannelScore[]) || [];
      setChannelScores(scores);
      return scores;
    } catch (err) {
      console.error("Error loading channel scores:", err?.message || "Unknown error");
      return [];
    }
  };

  const loadProjectData = async (targetProjectId: string, options?: { silent?: boolean }) => {
    if (!userId || !targetProjectId) return;
    const key = getProjectCacheKey(targetProjectId);
    const cached = tacticalProjectDataCache.get(key);
    if (!options?.silent && !cached) setLoadingPlan(true);

    try {
      const [plan, scores, audiences] = await Promise.all([
        loadTacticalPlan(targetProjectId),
        loadChannelScores(targetProjectId),
        loadProjectAudiences(targetProjectId),
      ]);

      const cachedTacticalScores = tacticalProjectDataCache.get(key)?.channelTacticalScores || [];
      if (cachedTacticalScores.length > 0) {
        setChannelTacticalScores(cachedTacticalScores);
      } else {
        setChannelTacticalScores([]);
      }

      tacticalProjectDataCache.set(key, {
        tacticalPlan: plan,
        channelScores: scores,
        channelTacticalScores: cachedTacticalScores,
        projectAudiences: audiences,
        fetchedAt: Date.now(),
      });

      void loadChannelTacticalScores(scores, targetProjectId);
    } finally {
      if (!options?.silent || !cached) setLoadingPlan(false);
    }
  };

  const computeChannelScore = (
    chPlan: any,
    chChannel: ChannelKey,
    fwCount: number,
    segList: any[],
    testCount: number,
    stratScore: ChannelScore | undefined
  ) => {
    let coherence = 0;
    let clarity = 0;
    let segScore = 0;

    if (chPlan.campaign_type) coherence += 25;
    if (chPlan.funnel_stage) coherence += 25;
    if (chPlan.funnel_role) coherence += 25;
    if (stratScore?.is_recommended) coherence += 25;
    else if (stratScore && !stratScore.is_recommended && chPlan.campaign_type) coherence += 10;

    if (chPlan.campaign_type) clarity += 15;
    if (chPlan.bidding_strategy) clarity += 15;
    if ((chPlan.ad_group_structure || []).length > 0) clarity += 20;
    if ((chPlan.key_metrics || []).length > 0) clarity += 15;
    if (fwCount > 0) clarity += 15;
    if (testCount > 0) clarity += 10;
    if (chChannel === "google" && (chPlan.extensions_plan || []).length > 0) clarity += 10;
    else if (chChannel !== "google") clarity += 10;

    if (segList.length > 0) segScore += 40;
    if (segList.length >= 2) segScore += 20;
    const hasAngles = segList.every((s: any) => (s.message_angle || "").trim() !== "");
    if (hasAngles && segList.length > 0) segScore += 20;
    const hasPriorities = segList.every((s: any) => s.priority);
    if (hasPriorities && segList.length > 0) segScore += 20;

    coherence = Math.min(100, coherence);
    clarity = Math.min(100, clarity);
    segScore = Math.min(100, segScore);
    const tactical = Math.round((coherence * 0.35) + (clarity * 0.4) + (segScore * 0.25));

    return { tactical_score: tactical, coherence_score: coherence, clarity_score: clarity, segmentation_score: segScore };
  };

  const loadChannelTacticalScores = async (
    stratScores?: ChannelScore[],
    targetProjectId: string = selectedProjectId || ""
  ) => {
    if (!userId || !targetProjectId) return;
    const activeStratScores = stratScores || channelScores;
    try {
      const { data: plan } = await (supabase as any)
        .from("tactical_plans")
        .select("id")
        .eq("project_id", targetProjectId)
        .eq("user_id", userId)
        .maybeSingle();
      if (!plan) return;

      const { data: chPlans } = await (supabase as any)
        .from("tactical_channel_plans")
        .select("*")
        .eq("tactical_plan_id", plan.id)
        .eq("user_id", userId);

      if (!chPlans || chPlans.length === 0) return;

      const { data: allFrameworks } = await (supabase as any)
        .from("copy_frameworks")
        .select("channel")
        .eq("tactical_plan_id", plan.id)
        .eq("user_id", userId);

      const { data: allSegs } = await (supabase as any)
        .from("segmentation_plans")
        .select("channel, message_angle, priority")
        .eq("tactical_plan_id", plan.id)
        .eq("user_id", userId);

      const { data: allTests } = await (supabase as any)
        .from("testing_plans")
        .select("channel")
        .eq("tactical_plan_id", plan.id)
        .eq("user_id", userId);

      const computed: ChannelTacticalScore[] = [];

      for (const chPlan of chPlans) {
        const ch = chPlan.channel as ChannelKey;
        const fwCount = (allFrameworks || []).filter((f: any) => f.channel === ch).length;
        const segList = (allSegs || []).filter((s: any) => s.channel === ch);
        const testCount = (allTests || []).filter((t: any) => t.channel === ch).length;
        const stratScore = activeStratScores.find((s) => s.channel === ch);

        const scores = computeChannelScore(chPlan, ch, fwCount, segList, testCount, stratScore);
        computed.push({ channel: ch, ...scores });

        // Update channel plan scores in DB
        await (supabase as any)
          .from("tactical_channel_plans")
          .update({
            tactical_score: scores.tactical_score,
            coherence_score: scores.coherence_score,
            clarity_score: scores.clarity_score,
            segmentation_score: scores.segmentation_score,
          })
          .eq("id", chPlan.id);
      }

      setChannelTacticalScores(computed);
      const key = getProjectCacheKey(targetProjectId);
      const cached = tacticalProjectDataCache.get(key);
      if (cached) {
        tacticalProjectDataCache.set(key, {
          ...cached,
          channelTacticalScores: computed,
          fetchedAt: Date.now(),
        });
      }

      // Update parent plan scores (average of channels)
      const avg = (key: keyof ChannelTacticalScore) =>
        Math.round(computed.reduce((sum, d) => sum + (d[key] || 0), 0) / computed.length);
      const oScore = avg("tactical_score");
      const cScore = avg("coherence_score");
      const clScore = avg("clarity_score");
      const sScore = avg("segmentation_score");

      await (supabase as any)
        .from("tactical_plans")
        .update({
          overall_tactical_score: oScore,
          strategic_coherence_score: cScore,
          structure_clarity_score: clScore,
          segmentation_quality_score: sScore,
        })
        .eq("id", plan.id);

      setTacticalPlan((prev) =>
        prev
          ? {
              ...prev,
              overall_tactical_score: oScore,
              strategic_coherence_score: cScore,
              structure_clarity_score: clScore,
              segmentation_quality_score: sScore,
            }
          : prev
      );
    } catch (err) {
      console.error("Error loading channel tactical scores:", err?.message || "Unknown error");
    }
  };

  const refreshScores = () => {
    if (selectedProjectId) {
      void loadChannelTacticalScores(undefined, selectedProjectId);
    }
  };

  const createTacticalPlan = async (templateId?: string | null) => {
    if (!user || !selectedProjectId) return;
    setCreating(true);
    try {
      // 1. Create the tactical plan
      const { data: plan, error: planError } = await (supabase as any)
        .from("tactical_plans")
        .insert({
          project_id: selectedProjectId,
          user_id: user.id,
          status: templateId ? "in_progress" : "draft",
        })
        .select()
        .single();

      if (planError) throw planError;

      // 2. If a template was selected, apply it
      if (templateId) {
        const template = getTemplateById(templateId);
        if (template) {
          await applyTemplate(plan.id, template);
        }
      }

      setTacticalPlan(plan);
      if (selectedProjectId) {
        tacticalProjectDataCache.delete(getProjectCacheKey(selectedProjectId));
      }
      toast.success(
        templateId
          ? "Plano tático criado com template aplicado!"
          : "Plano tático criado com sucesso!"
      );
      const pName = projects.find(p => p.id === selectedProjectId)?.name || 'Projeto';
      notifyTacticalPlanCreated(user.id, pName, !!templateId);
    } catch (err: any) {
      console.error("Error creating tactical plan:", err?.message || "Unknown error");
      toast.error("Erro ao criar plano tático");
    } finally {
      setCreating(false);
      setSelectedTemplateId(null);
    }
  };

  const applyTemplate = async (planId: string, template: TacticalTemplate) => {
    if (!user) return;

    // Insert channel plans
    for (const ch of template.channels) {
      await (supabase as any).from("tactical_channel_plans").insert({
        tactical_plan_id: planId,
        user_id: user.id,
        channel: ch.channel,
        campaign_type: ch.campaign_type,
        funnel_stage: ch.funnel_stage,
        funnel_role: ch.funnel_role,
        bidding_strategy: ch.bidding_strategy,
        ad_group_structure: ch.ad_group_structure,
        extensions_plan: ch.extensions_plan,
        quality_score_factors: ch.quality_score_factors,
        key_metrics: ch.key_metrics,
        campaign_structure: {},
        segmentation: {},
        alerts: [],
        tactical_score: 0,
        coherence_score: 0,
        clarity_score: 0,
        segmentation_score: 0,
      });
    }

    // Insert copy frameworks
    for (const fw of template.copyFrameworks) {
      await (supabase as any).from("copy_frameworks").insert({
        tactical_plan_id: planId,
        user_id: user.id,
        channel: fw.channel,
        framework_type: fw.framework_type,
        framework_name: fw.framework_name,
        structure: fw.structure,
        notes: fw.notes,
      });
    }

    // Insert segmentation plans
    for (const seg of template.segmentations) {
      await (supabase as any).from("segmentation_plans").insert({
        tactical_plan_id: planId,
        user_id: user.id,
        channel: seg.channel,
        audience_name: seg.audience_name,
        targeting_criteria: seg.targeting_criteria,
        message_angle: seg.message_angle,
        priority: seg.priority,
        notes: seg.notes,
      });
    }

    // Insert testing plans
    for (const test of template.testPlans) {
      await (supabase as any).from("testing_plans").insert({
        tactical_plan_id: planId,
        user_id: user.id,
        channel: test.channel,
        test_name: test.test_name,
        hypothesis: test.hypothesis,
        what_to_test: test.what_to_test,
        success_criteria: test.success_criteria,
        priority: test.priority,
        status: "planned",
      });
    }
  };

  const deleteTacticalPlan = async () => {
    if (!user || !tacticalPlan) return;
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este plano tático? Todos os dados (canais, copy, segmentação, testes) serão removidos. Esta ação não pode ser desfeita."
    );
    if (!confirmed) return;
    setCreating(true);
    try {
      // Delete child records first
      await (supabase as any).from("testing_plans").delete().eq("tactical_plan_id", tacticalPlan.id);
      await (supabase as any).from("segmentation_plans").delete().eq("tactical_plan_id", tacticalPlan.id);
      await (supabase as any).from("copy_frameworks").delete().eq("tactical_plan_id", tacticalPlan.id);
      await (supabase as any).from("tactical_channel_plans").delete().eq("tactical_plan_id", tacticalPlan.id);
      await (supabase as any).from("tactical_plans").delete().eq("id", tacticalPlan.id);

      setTacticalPlan(null);
      setChannelTacticalScores([]);
      if (selectedProjectId) {
        tacticalProjectDataCache.delete(getProjectCacheKey(selectedProjectId));
      }
      toast.success("Plano tático excluído. Escolha um template para recomeçar.");
    } catch (err) {
      console.error("Error deleting tactical plan:", err?.message || "Unknown error");
      toast.error("Erro ao excluir plano tático");
    } finally {
      setCreating(false);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const getChannelStratScore = (ch: ChannelKey) => channelScores.find((c) => c.channel === ch);
  const getChannelTactScore = (ch: ChannelKey) => channelTacticalScores.find((c) => c.channel === ch);

  const generatePlaybook = async () => {
    if (!tacticalPlan || !user) return;
    setRunningPlan(true);
    try {
      // Load all channel plans for this tactical plan
      const { data: channels } = await (supabase as any)
        .from("tactical_channel_plans")
        .select("*")
        .eq("tactical_plan_id", tacticalPlan.id)
        .eq("user_id", user.id);

      const { data: frameworks } = await (supabase as any)
        .from("copy_frameworks")
        .select("*")
        .eq("tactical_plan_id", tacticalPlan.id)
        .eq("user_id", user.id);

      const { data: segs } = await (supabase as any)
        .from("segmentation_plans")
        .select("*")
        .eq("tactical_plan_id", tacticalPlan.id)
        .eq("user_id", user.id);

      const { data: tests } = await (supabase as any)
        .from("testing_plans")
        .select("*")
        .eq("tactical_plan_id", tacticalPlan.id)
        .eq("user_id", user.id);

      const directives: PlaybookDirective[] = [];

      (channels || []).forEach((ch: any) => {
        const conf = CHANNELS[ch.channel as ChannelKey];
        const chFrameworks = (frameworks || []).filter((f: any) => f.channel === ch.channel);
        const chSegs = (segs || []).filter((s: any) => s.channel === ch.channel);
        const chTests = (tests || []).filter((t: any) => t.channel === ch.channel);
        const stratScore = channelScores.find((s) => s.channel === ch.channel);

        // Phase 1: Setup
        const setupActions: string[] = [];
        if (ch.campaign_type) setupActions.push(`Criar campanha do tipo "${ch.campaign_type}"`);
        if (ch.funnel_stage) setupActions.push(`Configurar para etapa do funil: ${ch.funnel_stage}`);
        if (ch.bidding_strategy) setupActions.push(`Definir estratégia de lances: ${ch.bidding_strategy}`);
        if (ch.extensions_plan?.length > 0) setupActions.push(`Ativar extensões: ${ch.extensions_plan.join(", ")}`);
        if (setupActions.length > 0) {
          directives.push({
            channel: ch.channel,
            phase: "Configuração",
            title: `${conf.fullLabel} — Estrutura da Campanha`,
            actions: setupActions,
            priority: "critical",
            kpis: (ch.key_metrics || []).map((m: any) => `${m.metric}: ${m.target}`),
          });
        }

        // Phase 2: Ad Groups
        if (ch.ad_group_structure?.length > 0) {
          directives.push({
            channel: ch.channel,
            phase: "Grupos de Anúncios",
            title: `${conf.fullLabel} — ${ch.ad_group_structure.length} Grupo(s)`,
            actions: ch.ad_group_structure.map((g: any) =>
              `Criar grupo "${g.name}" → Intenção: ${g.intent || "definir"}`
            ),
            priority: "high",
            kpis: [],
          });
        }

        // Phase 3: Copy
        if (chFrameworks.length > 0) {
          directives.push({
            channel: ch.channel,
            phase: "Criação de Copy",
            title: `${conf.fullLabel} — ${chFrameworks.length} Framework(s)`,
            actions: chFrameworks.map((f: any) => {
              const steps = Object.entries(f.structure || {}).map(([k, v]) => `${k}: ${v}`).join(" → ");
              return `Aplicar "${f.framework_name}": ${steps || "preencher estrutura"}`;
            }),
            priority: "high",
            kpis: [],
          });
        }

        // Phase 4: Segmentation
        if (chSegs.length > 0) {
          directives.push({
            channel: ch.channel,
            phase: "Segmentação",
            title: `${conf.fullLabel} — ${chSegs.length} Segmento(s)`,
            actions: chSegs.map((s: any) =>
              `Público "${s.audience_name}" → Mensagem: ${s.message_angle || "definir"} (Prioridade: ${s.priority})`
            ),
            priority: "medium",
            kpis: [],
          });
        }

        // Phase 5: Tests
        if (chTests.length > 0) {
          directives.push({
            channel: ch.channel,
            phase: "Testes",
            title: `${conf.fullLabel} — ${chTests.length} Teste(s)`,
            actions: chTests.map((t: any) =>
              `"${t.test_name}": ${t.hypothesis || "sem hipótese"} → Sucesso: ${t.success_criteria || "definir"}`
            ),
            priority: "medium",
            kpis: [],
          });
        }
      });

      setPlaybook(directives);

      // Update plan status to completed
      await (supabase as any)
        .from("tactical_plans")
        .update({ status: "completed" })
        .eq("id", tacticalPlan.id);
      setTacticalPlan((prev) => prev ? { ...prev, status: "completed" } : prev);
      if (selectedProjectId) {
        const key = getProjectCacheKey(selectedProjectId);
        const cached = tacticalProjectDataCache.get(key);
        if (cached && cached.tacticalPlan) {
          tacticalProjectDataCache.set(key, {
            ...cached,
            tacticalPlan: { ...cached.tacticalPlan, status: "completed" },
            fetchedAt: Date.now(),
          });
        }
      }

      setActiveTab("playbook");
      toast.success("Plano rodado! Diretrizes de execução geradas.");
      const pName = projects.find(p => p.id === selectedProjectId)?.name || 'Projeto';
      notifyPlaybookGenerated(user.id, pName);
    } catch (err) {
      console.error("Error generating playbook:", err?.message || "Unknown error");
      toast.error("Erro ao gerar playbook");
    } finally {
      setRunningPlan(false);
    }
  };

  const applyTemplateToExisting = async (templateId: string) => {
    if (!user || !tacticalPlan) return;
    const template = getTemplateById(templateId);
    if (!template) return;
    const confirmed = window.confirm(
      `Aplicar template "${template.name}"? Os dados existentes dos canais, copy, segmentação e testes serão substituídos pelos dados do template.`
    );
    if (!confirmed) return;
    setCreating(true);
    try {
      // Delete existing child records
      await (supabase as any).from("testing_plans").delete().eq("tactical_plan_id", tacticalPlan.id);
      await (supabase as any).from("segmentation_plans").delete().eq("tactical_plan_id", tacticalPlan.id);
      await (supabase as any).from("copy_frameworks").delete().eq("tactical_plan_id", tacticalPlan.id);
      await (supabase as any).from("tactical_channel_plans").delete().eq("tactical_plan_id", tacticalPlan.id);

      // Apply template data
      await applyTemplate(tacticalPlan.id, template);

      // Update plan status
      await (supabase as any)
        .from("tactical_plans")
        .update({ status: "in_progress" })
        .eq("id", tacticalPlan.id);

      setTacticalPlan((prev) => prev ? { ...prev, status: "in_progress" } : prev);
      if (selectedProjectId) {
        tacticalProjectDataCache.delete(getProjectCacheKey(selectedProjectId));
        void loadProjectData(selectedProjectId, { silent: true });
      }
      setActiveTab("overview");
      toast.success(`Template "${template.name}" aplicado com sucesso!`);
    } catch (err) {
      console.error("Error applying template:", err?.message || "Unknown error");
      toast.error("Erro ao aplicar template");
    } finally {
      setCreating(false);
      setSelectedTemplateId(null);
    }
  };

  const allChannelsHaveData = channelTacticalScores.length >= 4;
  const overallScore = tacticalPlan?.overall_tactical_score || 0;

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Visão Geral", icon: BarChart3 },
    ...CHANNEL_LIST.map((ch) => ({
      key: ch.key as TabKey,
      label: ch.fullLabel,
      icon: Crosshair,
    })),
    { key: "templates", label: "Templates", icon: BookOpen },
    ...(playbook.length > 0 ? [{ key: "playbook" as TabKey, label: "Playbook", icon: Rocket }] : []),
  ];

  return (
    <FeatureGate featureKey="tactical_plan" withLayout={false} pageTitle="Plano Tático">
    <DashboardLayout>
      <SEO title="Plano Tático" noindex />
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Crosshair className="h-6 w-6 text-primary" />
                  Plano Tático
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Transforme decisões estratégicas em planos táticos executáveis por canal
                </p>
              </div>

              {/* Project Selector */}
              <div className="flex items-center gap-3">
                <select
                  className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={selectedProjectId || ""}
                  onChange={(e) => {
                    setSelectedProjectId(e.target.value);
                    setActiveTab("overview");
                    setTacticalPlan(null);
                    setLoadingPlan(true);
                  }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {projectAudiences.length > 0 && (
                  <Badge variant="outline" className="text-[10px] gap-1 shrink-0">
                    <Users className="h-3 w-3" />
                    {projectAudiences.length} público{projectAudiences.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </div>

            {/* Loading / Empty States */}
            {(loading || loadingPlan) && (
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-9 w-24 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
                <div className="border border-border rounded-xl bg-card p-6 space-y-4 animate-pulse">
                  <div className="h-5 w-56 bg-muted rounded" />
                  <div className="h-3 w-80 bg-muted rounded" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-muted rounded-lg" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && !loadingPlan && projects.length === 0 && (
              <div className="flex flex-col items-center text-center py-20 space-y-4">
                <Crosshair className="h-12 w-12 text-muted-foreground/30" />
                <h2 className="text-xl font-semibold text-foreground">Transforme estratégia em execução</h2>
                <p className="text-sm text-muted-foreground max-w-md">O plano tático estrutura campanhas por canal com base no seu projeto. Crie um projeto primeiro para começar.</p>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => window.location.href = '/projects'}>
                  <FolderOpen className="h-4 w-4" />
                  Criar Projeto
                </Button>
              </div>
            )}

            {!loading && !loadingPlan && selectedProject && !tacticalPlan && (
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Criar Plano Tático para "{selectedProject.name}"
                  </h2>
                  <p className="text-muted-foreground max-w-lg mx-auto">
                    Escolha um template validado por nicho para começar com dados pré-preenchidos,
                    ou inicie do zero.
                  </p>
                </div>

                {/* Strategic dependency info */}
                <div className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card text-left">
                      {selectedProject.score > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        Score estratégico: <strong className="text-foreground">{selectedProject.score || "—"}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card text-left">
                      {channelScores.length > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        Scores por canal: <strong className="text-foreground">{channelScores.length}/4</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card text-left">
                      {projectAudiences.length > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        Públicos-alvo: <strong className="text-foreground">{projectAudiences.length}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Template Grid */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center">
                    Templates por Nicho
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TACTICAL_TEMPLATES.map((tmpl) => {
                      const isSelected = selectedTemplateId === tmpl.id;
                      return (
                        <button
                          key={tmpl.id}
                          onClick={() => setSelectedTemplateId(isSelected ? null : tmpl.id)}
                          className={`text-left rounded-xl border-2 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border bg-card hover:border-primary/30"
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg ${tmpl.bgColor} flex items-center justify-center shrink-0`}>
                              <TemplateIcon name={tmpl.icon} className={`h-5 w-5 ${tmpl.color}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground">{tmpl.name}</p>
                              <p className="text-[10px] text-muted-foreground">{tmpl.niche}</p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 ml-auto" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                            {tmpl.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {tmpl.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
                            <span>{tmpl.channels.length} canais</span>
                            <span>{tmpl.copyFrameworks.length} frameworks</span>
                            <span>{tmpl.segmentations.length} segmentos</span>
                            <span>{tmpl.testPlans.length} testes</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Template Detail */}
                {selectedTemplateId && (() => {
                  const tmpl = getTemplateById(selectedTemplateId);
                  if (!tmpl) return null;
                  return (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${tmpl.bgColor} flex items-center justify-center`}>
                          <TemplateIcon name={tmpl.icon} className={`h-4 w-4 ${tmpl.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Template: {tmpl.name}</p>
                          <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-4 gap-3">
                        {tmpl.channels.map((ch) => {
                          const conf = CHANNELS[ch.channel];
                          return (
                            <div key={ch.channel} className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-6 h-6 rounded ${conf.bgColor} flex items-center justify-center`}>
                                  <span className={`text-[10px] font-bold ${conf.color}`}>{conf.label.charAt(0)}</span>
                                </div>
                                <p className="text-xs font-semibold text-foreground">{conf.fullLabel}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{ch.campaign_type}</p>
                              <p className="text-[10px] text-muted-foreground">{ch.funnel_role}</p>
                              <div className="flex items-center gap-1 pt-1">
                                <span className="text-[10px] text-muted-foreground">{ch.ad_group_structure.length} grupos</span>
                                <span className="text-[10px] text-muted-foreground">· {ch.key_metrics.length} KPIs</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => createTacticalPlan(null)}
                    disabled={creating}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {creating && !selectedTemplateId ? "Criando..." : "Começar do Zero"}
                  </Button>
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={() => createTacticalPlan(selectedTemplateId)}
                    disabled={creating || !selectedTemplateId}
                  >
                    {creating && selectedTemplateId ? "Aplicando template..." : "Usar Template Selecionado"}
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Tactical Plan Content */}
            {!loading && tacticalPlan && (
              <div className="space-y-6">
                {/* Desktop: Tabs horizontais */}
                <div className="hidden md:flex items-center gap-1 overflow-x-auto pb-1 border-b border-border">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;
                    const isChannel = tab.key !== "overview" && tab.key !== "templates" && tab.key !== "playbook";
                    const tactScore = isChannel ? getChannelTactScore(tab.key as ChannelKey) : null;

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                          isActive
                            ? "bg-card border border-b-0 border-border text-foreground -mb-px"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {isChannel ? (
                          <img
                            src={`/${tab.key}-ads.svg`}
                            alt={tab.label}
                            className={`h-4 w-4 object-contain ${tab.key === "tiktok" ? "dark:brightness-0 dark:invert" : ""}`}
                          />
                        ) : (
                          <tab.icon className="h-4 w-4" />
                        )}
                        {tab.label}
                        {tactScore && tactScore.tactical_score > 0 && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getScoreColor(tactScore.tactical_score)} ${
                            tactScore.tactical_score >= 70 ? "bg-green-500/10" :
                            tactScore.tactical_score >= 40 ? "bg-amber-500/10" : "bg-red-500/10"
                          }`}>
                            {tactScore.tactical_score}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: Navegação + Cards de canais */}
                <div className="md:hidden space-y-3">
                  {/* Botões de navegação */}
                  <div className="flex gap-2">
                    {tabs.filter(t => t.key === "overview" || t.key === "templates" || t.key === "playbook").map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          activeTab === tab.key
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <tab.icon className="h-3.5 w-3.5" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid de canais 2x2 */}
                  <div className="grid grid-cols-2 gap-2">
                    {CHANNEL_LIST.map((ch) => {
                      const isActive = activeTab === ch.key;
                      const tactScore = getChannelTactScore(ch.key);
                      const score = tactScore?.tactical_score || 0;

                      return (
                        <button
                          key={ch.key}
                          onClick={() => setActiveTab(ch.key as TabKey)}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                            isActive
                              ? `${ch.borderColor} ${ch.bgColor} shadow-sm`
                              : "border-border bg-card hover:border-muted-foreground/20"
                          }`}
                        >
                          <img
                            src={`/${ch.key}-ads.svg`}
                            alt={ch.label}
                            className={`h-5 w-5 object-contain ${ch.key === "tiktok" ? "dark:brightness-0 dark:invert" : ""}`}
                          />
                          <div className="flex flex-col items-start min-w-0">
                            <span className={`text-xs font-semibold truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                              {ch.label}
                            </span>
                            {score > 0 && (
                              <span className={`text-[10px] font-bold ${getScoreColor(score)}`}>
                                Score: {score}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Run Plan Button */}
                {activeTab === "overview" && tacticalPlan && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="hero"
                      size="lg"
                      onClick={generatePlaybook}
                      disabled={runningPlan}
                      className="relative overflow-hidden group"
                    >
                      {runningPlan ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Gerando diretrizes...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                          Rodar Plano
                          <Rocket className="h-4 w-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    {overallScore > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                        <Trophy className={`h-4 w-4 ${getScoreColor(overallScore)}`} />
                        <span className="text-xs text-muted-foreground">Score Tático:</span>
                        <span className={`text-sm font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content */}
                {activeTab === "overview" ? (
                  <TacticalOverview
                    tacticalPlan={tacticalPlan}
                    channelScores={channelScores}
                    projectName={selectedProject?.name || ""}
                    projectAudiences={projectAudiences}
                    onTabChange={setActiveTab}
                  />
                ) : activeTab === "playbook" ? (
                  <div className="space-y-6">
                    {/* Playbook Header */}
                    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-orange-500/5 p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                          <Rocket className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                            Playbook de Execução
                            <Badge className="bg-primary/10 text-primary border-primary/30">Hora do Jogo</Badge>
                          </h2>
                          <p className="text-sm text-muted-foreground">
                            {playbook.length} diretrizes geradas para {new Set(playbook.map(d => d.channel)).size} canais
                          </p>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                          {overallScore > 0 && (
                            <div className="text-center">
                              <p className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</p>
                              <p className={`text-xs font-medium ${getScoreColor(overallScore)}`}>{getScoreLabel(overallScore)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {CHANNEL_LIST.map((ch) => {
                          const ts = getChannelTactScore(ch.key);
                          const count = playbook.filter(d => d.channel === ch.key).length;
                          return (
                            <div key={ch.key} className="rounded-lg border border-border bg-card/80 p-3 text-center">
                              <div className={`w-8 h-8 rounded-lg ${ch.bgColor} flex items-center justify-center mx-auto mb-1.5`}>
                                <span className={`text-xs font-bold ${ch.color}`}>{ch.label.charAt(0)}</span>
                              </div>
                              <p className="text-xs font-medium text-foreground">{ch.label}</p>
                              <p className={`text-lg font-bold ${ts ? getScoreColor(ts.tactical_score) : "text-muted-foreground"}`}>
                                {ts?.tactical_score || "—"}
                              </p>
                              <p className="text-[10px] text-muted-foreground">{count} diretriz(es)</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Directives by Channel */}
                    {CHANNEL_LIST.map((ch) => {
                      const chDirectives = playbook.filter(d => d.channel === ch.key);
                      if (chDirectives.length === 0) return null;
                      return (
                        <div key={ch.key} className="space-y-3">
                          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <div className={`w-6 h-6 rounded ${ch.bgColor} flex items-center justify-center`}>
                              <span className={`text-[10px] font-bold ${ch.color}`}>{ch.label.charAt(0)}</span>
                            </div>
                            {ch.fullLabel}
                          </h3>
                          {chDirectives.map((directive, i) => {
                            const priorityConfig = {
                              critical: { bg: "border-red-500/30 bg-red-500/5", badge: "bg-red-500/10 text-red-600", icon: Zap },
                              high: { bg: "border-amber-500/30 bg-amber-500/5", badge: "bg-amber-500/10 text-amber-600", icon: Target },
                              medium: { bg: "border-blue-500/30 bg-blue-500/5", badge: "bg-blue-500/10 text-blue-600", icon: Eye },
                            };
                            const pc = priorityConfig[directive.priority];
                            const PIcon = pc.icon;
                            return (
                              <div key={i} className={`rounded-xl border ${pc.bg} p-4 space-y-3`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <PIcon className="h-4 w-4" />
                                    <span className="text-xs font-semibold text-foreground">{directive.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`text-[10px] ${pc.badge}`}>{directive.phase}</Badge>
                                    <Badge variant="outline" className="text-[10px]">
                                      {directive.priority === "critical" ? "Crítico" : directive.priority === "high" ? "Alta" : "Média"}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  {directive.actions.map((action, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                      <p className="text-xs text-muted-foreground leading-relaxed">{action}</p>
                                    </div>
                                  ))}
                                </div>
                                {directive.kpis.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/50">
                                    {directive.kpis.map((kpi, k) => (
                                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        {kpi}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                    {/* Summary Footer */}
                    <div className="rounded-xl border border-border bg-muted/30 p-5 text-center space-y-3">
                      <Trophy className="h-8 w-8 text-primary mx-auto" />
                      <h3 className="text-lg font-bold text-foreground">Plano Pronto para Execução</h3>
                      <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                        Siga as diretrizes acima na ordem de prioridade. Comece pelos itens <strong>Críticos</strong>,
                        depois <strong>Alta</strong> prioridade, e finalize com <strong>Média</strong>.
                        Monitore os KPIs definidos para cada canal.
                      </p>
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-red-500" />
                          <span className="text-xs text-muted-foreground">
                            {playbook.filter(d => d.priority === "critical").length} Críticos
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-xs text-muted-foreground">
                            {playbook.filter(d => d.priority === "high").length} Alta
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-xs text-muted-foreground">
                            {playbook.filter(d => d.priority === "medium").length} Média
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeTab === "templates" ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Templates Táticos por Nicho
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Selecione um template validado pelo mercado para preencher automaticamente
                        os dados dos canais, frameworks de copy, segmentação e testes.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {TACTICAL_TEMPLATES.map((tmpl) => {
                        const isSelected = selectedTemplateId === tmpl.id;
                        return (
                          <button
                            key={tmpl.id}
                            onClick={() => setSelectedTemplateId(isSelected ? null : tmpl.id)}
                            className={`text-left rounded-xl border-2 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-md"
                                : "border-border bg-card hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-10 h-10 rounded-lg ${tmpl.bgColor} flex items-center justify-center shrink-0`}>
                                <TemplateIcon name={tmpl.icon} className={`h-5 w-5 ${tmpl.color}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">{tmpl.name}</p>
                                <p className="text-[10px] text-muted-foreground">{tmpl.niche}</p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 ml-auto" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                              {tmpl.description}
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {tmpl.tags.slice(0, 4).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground">
                              <span>{tmpl.channels.length} canais</span>
                              <span>{tmpl.copyFrameworks.length} frameworks</span>
                              <span>{tmpl.segmentations.length} segmentos</span>
                              <span>{tmpl.testPlans.length} testes</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Selected Template Detail + Apply */}
                    {selectedTemplateId && (() => {
                      const tmpl = getTemplateById(selectedTemplateId);
                      if (!tmpl) return null;
                      return (
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${tmpl.bgColor} flex items-center justify-center`}>
                                <TemplateIcon name={tmpl.icon} className={`h-4 w-4 ${tmpl.color}`} />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-foreground">Template: {tmpl.name}</p>
                                <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                              </div>
                            </div>
                            <Button
                              variant="hero"
                              size="sm"
                              onClick={() => applyTemplateToExisting(selectedTemplateId)}
                              disabled={creating}
                            >
                              {creating ? "Aplicando..." : "Aplicar Template"}
                              <ChevronRight className="h-4 w-4 ml-1.5" />
                            </Button>
                          </div>
                          <div className="grid sm:grid-cols-4 gap-3">
                            {tmpl.channels.map((ch) => {
                              const conf = CHANNELS[ch.channel];
                              return (
                                <div key={ch.channel} className="rounded-lg border border-border bg-card p-3 space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded ${conf.bgColor} flex items-center justify-center`}>
                                      <span className={`text-[10px] font-bold ${conf.color}`}>{conf.label.charAt(0)}</span>
                                    </div>
                                    <p className="text-xs font-semibold text-foreground">{conf.fullLabel}</p>
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">{ch.campaign_type}</p>
                                  <p className="text-[10px] text-muted-foreground">{ch.funnel_role}</p>
                                  <div className="flex items-center gap-1 pt-1">
                                    <span className="text-[10px] text-muted-foreground">{ch.ad_group_structure.length} grupos</span>
                                    <span className="text-[10px] text-muted-foreground">· {ch.key_metrics.length} KPIs</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground">
                              Aplicar este template irá <strong className="text-foreground">substituir</strong> todos os dados
                              atuais dos canais, frameworks de copy, segmentação e testes deste plano.
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <TacticalChannelView
                    channel={activeTab as ChannelKey}
                    tacticalPlanId={tacticalPlan.id}
                    channelScore={getChannelStratScore(activeTab as ChannelKey) || null}
                    projectId={selectedProjectId!}
                    projectAudiences={projectAudiences}
                    onScoreUpdate={refreshScores}
                  />
                )}
              </div>
            )}
          </div>
    </DashboardLayout>
    </FeatureGate>
  );
}
