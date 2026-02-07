import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Circle } from "lucide-react";

export interface AnalysisStep {
  id: string;
  label: string;
  duration: number; // estimated ms before moving to next
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  { id: "fetch", label: "Acessando URL e baixando HTML", duration: 2500 },
  { id: "meta", label: "Extraindo meta tags e Open Graph", duration: 1800 },
  { id: "content", label: "Analisando conteúdo e CTAs", duration: 2200 },
  { id: "technical", label: "Verificando aspectos técnicos", duration: 1500 },
  { id: "structured", label: "Extraindo dados estruturados (JSON-LD)", duration: 1800 },
  { id: "scores", label: "Calculando scores por dimensão", duration: 2000 },
  { id: "channels", label: "Avaliando canais de mídia", duration: 2000 },
  { id: "insights", label: "Gerando insights estratégicos", duration: 1500 },
  { id: "snapshot", label: "Preparando snapshot do HTML", duration: 1200 },
  { id: "saving", label: "Salvando resultados", duration: 1500 },
];

const COMPETITOR_STEPS: AnalysisStep[] = [
  { id: "comp-fetch", label: "Acessando URL do concorrente", duration: 2500 },
  { id: "comp-analyze", label: "Analisando concorrente", duration: 3000 },
  { id: "comp-benchmark", label: "Gerando benchmark comparativo", duration: 2000 },
];

interface AnalysisProgressTrackerProps {
  isAnalyzing: boolean;
  competitorCount?: number;
  currentCompetitor?: number;
  isComplete?: boolean;
}

export function AnalysisProgressTracker({
  isAnalyzing,
  competitorCount = 0,
  currentCompetitor = 0,
  isComplete = false,
}: AnalysisProgressTrackerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phase, setPhase] = useState<"main" | "competitors" | "done">("main");
  const [competitorStepIndex, setCompetitorStepIndex] = useState(0);

  // Build full step list
  const allSteps = [...ANALYSIS_STEPS];

  // Reset when analysis starts
  useEffect(() => {
    if (isAnalyzing) {
      setCurrentStepIndex(0);
      setPhase("main");
      setCompetitorStepIndex(0);
    }
  }, [isAnalyzing]);

  // Advance through main steps with timers
  useEffect(() => {
    if (!isAnalyzing || phase !== "main") return;
    if (currentStepIndex >= ANALYSIS_STEPS.length - 1) return;

    const step = ANALYSIS_STEPS[currentStepIndex];
    // Add some randomness to feel natural
    const jitter = Math.random() * 800 - 400;
    const delay = step.duration + jitter;

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => Math.min(prev + 1, ANALYSIS_STEPS.length - 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [isAnalyzing, currentStepIndex, phase]);

  // Advance through competitor steps
  useEffect(() => {
    if (!isAnalyzing || phase !== "competitors") return;
    if (competitorStepIndex >= COMPETITOR_STEPS.length - 1) return;

    const step = COMPETITOR_STEPS[competitorStepIndex];
    const jitter = Math.random() * 600 - 300;
    const delay = step.duration + jitter;

    const timer = setTimeout(() => {
      setCompetitorStepIndex((prev) => Math.min(prev + 1, COMPETITOR_STEPS.length - 1));
    }, delay);

    return () => clearTimeout(timer);
  }, [isAnalyzing, competitorStepIndex, phase]);

  // Switch to competitor phase when main is done
  useEffect(() => {
    if (phase === "main" && currentStepIndex >= ANALYSIS_STEPS.length - 1 && competitorCount > 0) {
      const timer = setTimeout(() => {
        setPhase("competitors");
        setCompetitorStepIndex(0);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentStepIndex, competitorCount]);

  // Mark done
  useEffect(() => {
    if (isComplete) {
      setPhase("done");
      setCurrentStepIndex(ANALYSIS_STEPS.length);
    }
  }, [isComplete]);

  if (!isAnalyzing && !isComplete) return null;

  const completedMainSteps = isComplete ? ANALYSIS_STEPS.length : currentStepIndex;
  const totalSteps = ANALYSIS_STEPS.length + (competitorCount > 0 ? COMPETITOR_STEPS.length * competitorCount : 0);
  const completedTotal = isComplete
    ? totalSteps
    : completedMainSteps + (phase === "competitors" ? competitorStepIndex + (currentCompetitor * COMPETITOR_STEPS.length) : 0);
  const progressPercent = Math.min(100, Math.round((completedTotal / totalSteps) * 100));

  return (
    <div className="border border-primary/20 rounded-xl bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] p-4 sm:p-5 space-y-4 animate-in fade-in duration-300">
      {/* Header with progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">
            {isComplete ? "✓ Análise concluída" : "Analisando URL..."}
          </p>
          <span className="text-xs font-mono text-muted-foreground">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-1.5">
        {ANALYSIS_STEPS.map((step, index) => {
          const isDone = index < currentStepIndex || isComplete;
          const isCurrent = index === currentStepIndex && !isComplete && phase === "main";
          const isPending = index > currentStepIndex && !isComplete;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-2.5 py-1 transition-all duration-300 ${
                isPending ? "opacity-40" : "opacity-100"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
              )}
              <span
                className={`text-xs ${
                  isDone
                    ? "text-muted-foreground line-through"
                    : isCurrent
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {isDone && (
                <span className="text-[10px] text-green-600 ml-auto">✓</span>
              )}
            </div>
          );
        })}

        {/* Competitor analysis steps */}
        {competitorCount > 0 && phase === "competitors" && (
          <div className="mt-3 pt-3 border-t border-border/50 space-y-1.5">
            <p className="text-xs font-semibold text-foreground mb-2">
              Analisando concorrente {currentCompetitor + 1} de {competitorCount}
            </p>
            {COMPETITOR_STEPS.map((step, index) => {
              const isDone = index < competitorStepIndex;
              const isCurrent = index === competitorStepIndex;
              const isPending = index > competitorStepIndex;

              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2.5 py-1 transition-all duration-300 ${
                    isPending ? "opacity-40" : "opacity-100"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      isDone
                        ? "text-muted-foreground line-through"
                        : isCurrent
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
