import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Play, ChevronDown, CheckCheck } from "lucide-react";
import type { AssistantStep, StepHelp } from "@/components/floating-chat/types";
import { TiaSuggestionList } from "@/components/floating-chat/TiaSuggestionList";

interface Props {
  currentStep: AssistantStep;
  predictedStep: AssistantStep | null;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
  onNavigate: (href: string) => void;
  openHelpFocused: (target?: string, suggestionTitle?: string) => void;
  stepHelp: StepHelp;
}

export function TiaGuidedSection({
  currentStep,
  predictedStep,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onReset,
  onNavigate,
  openHelpFocused,
  stepHelp,
}: Props) {
  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      <p className="text-sm text-foreground leading-relaxed">{currentStep.summary}</p>

      <div className="space-y-2">
        {currentStep.tips.map((tip) => (
          <div key={tip} className="flex items-start gap-2 text-sm text-foreground">
            <CheckCheck className="h-4 w-4 text-primary mt-0.5" />
            <span className="leading-snug">{tip}</span>
          </div>
        ))}
      </div>

      {currentStep.resources.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">Recursos rápidos</p>
            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={!hasPrev}
                    onClick={onPrev}
                    className="h-7 w-7 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90 mx-auto" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="text-xs border border-primary/50 shadow-lg shadow-primary/10">
                  Passo anterior
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={!hasNext}
                    onClick={onNext}
                    className="h-7 w-7 rounded-full border border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:border-primary/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-4 w-4 -rotate-90 mx-auto" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center" className="text-xs border border-primary/50 shadow-lg shadow-primary/10">
                  Próximo passo
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentStep.resources.map((res) => (
              <Button
                key={res.href}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onNavigate(res.href)}
              >
                {res.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={onReset}
        >
          Reiniciar fluxo
        </Button>
        <Button
          size="sm"
          className="text-xs"
          onClick={onNext}
          disabled={!hasNext}
        >
          {hasNext && currentStep.next && predictedStep ? `Próxima: ${predictedStep.title}` : 'Concluído'}
        </Button>
      </div>

      <TiaSuggestionList stepHelp={stepHelp} openHelpFocused={openHelpFocused} currentStepKey={currentStep.key} />
    </div>
  );
}
