import { useState } from "react";
import { cn } from "@/lib/utils";
import { AI_MODEL_LABELS } from "@/lib/aiModels";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Brain,
  Briefcase,
  Users,
  MapPin,
  DollarSign,
  AlertCircle,
  Lightbulb,
  Tag,
  Maximize2,
  Minimize2,
  Target,
} from "lucide-react";
import type { IcpEnrichmentResult } from "@/lib/icpEnricher";

interface IcpEnrichmentDialogProps {
  audienceName: string;
  enrichment: IcpEnrichmentResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IcpEnrichmentDialog({
  audienceName,
  enrichment,
  open,
  onOpenChange,
}: IcpEnrichmentDialogProps) {
  const [fullscreen, setFullscreen] = useState(false);

  if (!enrichment) return null;
  const e = enrichment;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setFullscreen(false); onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-y-auto p-0 transition-all duration-200",
        fullscreen
          ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none"
          : "max-w-2xl max-h-[85vh]"
      )}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-5 py-3">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => setFullscreen((f) => !f)}
                  title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <DialogTitle className="text-base truncate">ICP Refinado — {audienceName}</DialogTitle>
              </div>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                {(AI_MODEL_LABELS as any)[e.model] || e.model}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Refined Description */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descrição Refinada</h4>
            <p className="text-sm text-foreground leading-relaxed">{e.refinedDescription}</p>
          </div>

          {/* Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {e.idealProfile.industry && (
              <div className="rounded-lg border border-border p-3 flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Segmento</p>
                  <p className="text-xs text-foreground mt-0.5">{e.idealProfile.industry}</p>
                </div>
              </div>
            )}
            {e.idealProfile.companySize && (
              <div className="rounded-lg border border-border p-3 flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Porte Ideal</p>
                  <p className="text-xs text-foreground mt-0.5">{e.idealProfile.companySize}</p>
                </div>
              </div>
            )}
            {e.idealProfile.location && (
              <div className="rounded-lg border border-border p-3 flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Localização</p>
                  <p className="text-xs text-foreground mt-0.5">{e.idealProfile.location}</p>
                </div>
              </div>
            )}
            {e.idealProfile.budgetRange && (
              <div className="rounded-lg border border-border p-3 flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <DollarSign className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Faixa de Investimento</p>
                  <p className="text-xs text-foreground mt-0.5">{e.idealProfile.budgetRange}</p>
                </div>
              </div>
            )}
          </div>

          {/* Decision Makers */}
          {e.idealProfile.decisionMakers.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decisores</h4>
              <div className="flex flex-wrap gap-1.5">
                {e.idealProfile.decisionMakers.map((d, i) => (
                  <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                    <Target className="h-3 w-3 mr-1" />
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pain Points + Buying Triggers — side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {e.idealProfile.painPoints.length > 0 && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  <h4 className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Dores Principais</h4>
                  <Badge variant="secondary" className="text-[9px] ml-auto px-1 py-0 bg-amber-500/10 text-amber-600">{e.idealProfile.painPoints.length}</Badge>
                </div>
                <ul className="space-y-1">
                  {e.idealProfile.painPoints.map((p, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {e.idealProfile.buyingTriggers.length > 0 && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-emerald-500" />
                  <h4 className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Gatilhos de Compra</h4>
                  <Badge variant="secondary" className="text-[9px] ml-auto px-1 py-0 bg-emerald-500/10 text-emerald-600">{e.idealProfile.buyingTriggers.length}</Badge>
                </div>
                <ul className="space-y-1">
                  {e.idealProfile.buyingTriggers.map((t, i) => (
                    <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5 shrink-0">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Demographic Insights */}
          {e.demographicInsights && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Dados Demográficos</h4>
              <p className="text-sm text-foreground leading-relaxed">{e.demographicInsights}</p>
            </div>
          )}

          {/* Market Context */}
          {e.marketContext && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Contexto de Mercado</h4>
              <p className="text-sm text-foreground leading-relaxed">{e.marketContext}</p>
            </div>
          )}

          {/* Suggested Keywords */}
          {e.suggestedKeywords.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Keywords Sugeridas</h4>
              <div className="flex flex-wrap gap-1.5">
                {e.suggestedKeywords.map((k, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-2 py-0.5 border-primary/30 text-primary">
                    <Tag className="h-3 w-3 mr-1" />
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {e.recommendations.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recomendações Estratégicas</h4>
              <div className="space-y-2">
                {e.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border p-2.5">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources Footer */}
          {e.dataSources.length > 0 && (
            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <span className="text-[10px] text-muted-foreground">Fontes consultadas:</span>
              {e.dataSources.map((s, i) => (
                <Badge key={i} variant="outline" className={cn(
                  "text-[10px] px-1.5 py-0",
                  s.success ? "border-emerald-500/30 text-emerald-600" : "border-muted text-muted-foreground"
                )}>
                  {s.source} {s.success ? "✓" : "✗"}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
