import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  FolderOpen,
  Target,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  Rocket,
  ArrowRight,
  Trophy,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── TYPES ───

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  ctaLabel: string;
  color: string;
  bgColor: string;
  borderDone: string;
  badgeBg: string;
  checkFn: (data: OnboardingData) => boolean;
}

interface OnboardingData {
  projectsCount: number;
  hasAnalysis: boolean;
  hasAiKey: boolean;
  benchmarksCount: number;
  audiencesCount: number;
  hasAvatar: boolean;
}

interface OnboardingChecklistProps {
  data: OnboardingData;
}

// ─── STEPS ───

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "create-project",
    title: "Criar Projeto",
    description: "Insira a URL do seu negócio e receba um diagnóstico estratégico.",
    icon: FolderOpen,
    href: "/projects",
    ctaLabel: "Criar",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderDone: "border-blue-500/25 bg-blue-500/[0.04] hover:bg-blue-500/[0.08]",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    checkFn: (d) => d.projectsCount > 0,
  },
  {
    id: "run-analysis",
    title: "Analisar URL",
    description: "Execute a análise heurística e obtenha scores por dimensão.",
    icon: Target,
    href: "/projects",
    ctaLabel: "Analisar",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    borderDone: "border-orange-500/25 bg-orange-500/[0.04] hover:bg-orange-500/[0.08]",
    badgeBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    checkFn: (d) => d.hasAnalysis,
  },
  {
    id: "configure-ai",
    title: "Configurar IA",
    description: "Adicione sua API key do Gemini ou Claude para insights com IA.",
    icon: Sparkles,
    href: "/settings",
    ctaLabel: "Configurar",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderDone: "border-purple-500/25 bg-purple-500/[0.04] hover:bg-purple-500/[0.08]",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    checkFn: (d) => d.hasAiKey,
  },
  {
    id: "create-benchmark",
    title: "Benchmark",
    description: "Compare com um concorrente e gere uma análise SWOT.",
    icon: BarChart3,
    href: "/benchmark",
    ctaLabel: "Comparar",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderDone: "border-emerald-500/25 bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]",
    badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    checkFn: (d) => d.benchmarksCount > 0,
  },
  {
    id: "create-audience",
    title: "Público-Alvo",
    description: "Mapeie sua audiência B2B com indústria e keywords.",
    icon: Users,
    href: "/audiences",
    ctaLabel: "Criar",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderDone: "border-indigo-500/25 bg-indigo-500/[0.04] hover:bg-indigo-500/[0.08]",
    badgeBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    checkFn: (d) => d.audiencesCount > 0,
  },
  {
    id: "personalize-profile",
    title: "Personalizar",
    description: "Adicione foto e dados da empresa ao seu perfil.",
    icon: Settings,
    href: "/settings",
    ctaLabel: "Editar",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    borderDone: "border-rose-500/25 bg-rose-500/[0.04] hover:bg-rose-500/[0.08]",
    badgeBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    checkFn: (d) => d.hasAvatar,
  },
];

const STORAGE_KEY = "intentia_onboarding_collapsed";

// ─── COMPONENT ───

export function OnboardingChecklist({ data }: OnboardingChecklistProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const completedCount = useMemo(
    () => ONBOARDING_STEPS.filter((s) => s.checkFn(data)).length,
    [data]
  );

  const totalSteps = ONBOARDING_STEPS.length;
  const allDone = completedCount === totalSteps;

  // Find first incomplete step index for auto-scroll
  const nextStepIndex = useMemo(
    () => ONBOARDING_STEPS.findIndex((s) => !s.checkFn(data)),
    [data]
  );

  // Check scroll state
  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    if (!collapsed) {
      setTimeout(updateScrollState, 50);
    }
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", updateScrollState, { passive: true });
      window.addEventListener("resize", updateScrollState);
    }
    return () => {
      el?.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [collapsed]);

  // Auto-scroll to next step
  useEffect(() => {
    if (!collapsed && nextStepIndex > 0 && scrollRef.current) {
      const card = scrollRef.current.children[nextStepIndex] as HTMLElement;
      if (card) {
        setTimeout(() => {
          card.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }, 300);
      }
    }
  }, [nextStepIndex, collapsed]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {allDone ? <Trophy className="h-4 w-4 text-primary" /> : <Rocket className="h-4 w-4 text-primary" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {allDone ? "Missão completa!" : "Sua jornada"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {allDone ? "Você desbloqueou todo o potencial da plataforma." : `${completedCount} de ${totalSteps} conquistas`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Progress pills */}
          <div className="hidden sm:flex items-center gap-1 mr-2">
            {ONBOARDING_STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step.checkFn(data) ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
          {/* Scroll arrows — only when expanded */}
          {!collapsed && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${canScrollLeft ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/20 pointer-events-none"}`}
                onClick={() => scroll("left")}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-7 w-7 ${canScrollRight ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground/20 pointer-events-none"}`}
                onClick={() => scroll("right")}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
          {/* Collapse toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={toggleCollapsed}
          >
            {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Horizontal scrolling cards */}
      {!collapsed && <div className="relative">
        {/* Fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ONBOARDING_STEPS.map((step, index) => {
            const isDone = step.checkFn(data);
            const isNext = index === nextStepIndex;
            const isLocked = !isDone && index > nextStepIndex && nextStepIndex !== -1;
            const StepIcon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => !isLocked && navigate(step.href)}
                disabled={isLocked}
                className={`group relative flex-shrink-0 w-[140px] sm:w-[160px] rounded-xl border p-3 sm:p-4 text-left transition-all duration-300 snap-start ${
                  isDone
                    ? step.borderDone
                    : isNext
                    ? "border-primary/30 bg-primary/[0.04] hover:bg-primary/[0.08] ring-1 ring-primary/20"
                    : isLocked
                    ? "border-border/50 bg-muted/20 opacity-50 cursor-not-allowed"
                    : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/20"
                }`}
              >
                {/* Step number */}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold tabular-nums ${isDone ? step.color : isNext ? "text-primary" : "text-muted-foreground/30"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Icon */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${step.bgColor}`}>
                  {isDone ? (
                    <CheckCircle2 className={`h-5 w-5 sm:h-5.5 sm:w-5.5 ${step.color}`} />
                  ) : isLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground/40" />
                  ) : (
                    <StepIcon className={`h-5 w-5 sm:h-5.5 sm:w-5.5 ${step.color}`} />
                  )}
                </div>

                {/* Title */}
                <p className={`text-xs font-semibold mb-1 leading-tight ${
                  isDone ? step.color : isLocked ? "text-muted-foreground/50" : "text-foreground"
                }`}>
                  {step.title}
                </p>

                {/* Description */}
                <p className={`text-[10px] leading-snug ${
                  isDone ? "text-muted-foreground" : "text-muted-foreground"
                }`}>
                  {isDone ? "Concluído!" : step.description}
                </p>

                {/* CTA badge */}
                {isNext && (
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-semibold text-primary">
                    {step.ctaLabel}
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
                {isDone && (
                  <div className="mt-2.5">
                    <Badge className={`text-[9px] px-1.5 py-0 ${step.badgeBg} hover:opacity-90`}>
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Desbloqueado
                    </Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>}
    </div>
  );
}
