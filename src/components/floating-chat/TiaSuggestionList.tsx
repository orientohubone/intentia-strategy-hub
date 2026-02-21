import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import type { StepHelp } from "./types";

interface Props {
  stepHelp: StepHelp;
  openHelpFocused: (target?: string, suggestionTitle?: string) => void;
  currentStepKey: string;
  navigateToHelp?: () => void;
}

export function TiaSuggestionList({ stepHelp, openHelpFocused, currentStepKey, navigateToHelp }: Props) {
  return (
    (stepHelp.articles.length > 0 || stepHelp.faqs.length > 0) && (
      <div className="bg-muted/30 border border-border rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em]">Sugestões da Central</p>
          {navigateToHelp && (
            <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2" onClick={navigateToHelp}>
              Ver mais
            </Button>
          )}
        </div>
        {stepHelp.articles.length > 0 && (
          <div className="space-y-2">
            {stepHelp.articles.map((a, idx) => (
              <div key={`${a.title}-${idx}`} className="p-2.5 rounded-lg bg-card/70 border border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-primary hover:text-primary-foreground hover:bg-primary/80"
                    onClick={() => openHelpFocused(currentStepKey, a.title)}
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Aprender
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">{a.content}</p>
              </div>
            ))}
          </div>
        )}
        {stepHelp.faqs.length > 0 && (
          <div className="space-y-2">
            {stepHelp.faqs.map((f, idx) => (
              <div key={`${f.question}-${idx}`} className="p-2.5 rounded-lg bg-card/70 border border-border/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{f.question}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] px-2 text-primary hover:text-primary-foreground hover:bg-primary/80"
                    onClick={() => openHelpFocused(currentStepKey, f.question)}
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Aprender
                  </Button>
                </div>
                {f.answerInline ? (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground leading-snug">
                    {f.answerInline}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground leading-snug">{f.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  );
}
