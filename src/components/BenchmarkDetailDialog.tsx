import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Globe,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";

export interface BenchmarkDetail {
  id: string;
  project_id: string;
  project_name: string;
  competitor_name: string;
  competitor_url: string;
  competitor_niche: string;
  overall_score: number;
  value_proposition_score: number;
  value_proposition_analysis: string;
  offer_clarity_score: number;
  offer_clarity_analysis: string;
  user_journey_score: number;
  user_journey_analysis: string;
  channel_presence: Record<string, number>;
  channel_effectiveness: Record<string, { score: number; recommended: boolean; risks: number }>;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategic_insights: string;
  recommendations: string;
  score_gap: number;
  analysis_date: string;
}

interface BenchmarkDetailDialogProps {
  benchmark: BenchmarkDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const channelNames: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  linkedin: "LinkedIn Ads",
  tiktok: "TikTok Ads",
};

const channelColors: Record<string, string> = {
  google: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  meta: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  linkedin: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  tiktok: "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400",
};

function ScoreBar({ label, score, barColor, textColor, className }: { label: string; score: number; barColor: string; textColor: string; className?: string }) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", textColor)}>{score}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function SwotSection({
  title,
  items,
  icon: Icon,
  color,
  emptyText,
}: {
  title: string;
  items: string[];
  icon: any;
  color: string;
  emptyText: string;
}) {
  return (
    <div className={cn("rounded-lg border p-3 space-y-2", color)}>
      <div className="flex items-center gap-1.5">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <h4 className="text-xs font-semibold uppercase tracking-wider">{title}</h4>
        <Badge variant="secondary" className="text-[10px] ml-auto px-1.5 py-0">{items.length}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-xs text-foreground leading-snug flex items-start gap-1.5">
              <span className="mt-0.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BenchmarkDetailDialog({ benchmark, open, onOpenChange }: BenchmarkDetailDialogProps) {
  const [fullscreen, setFullscreen] = useState(false);

  if (!benchmark) return null;

  const b = benchmark;
  const isPositiveGap = b.score_gap > 0;
  const gapColor = isPositiveGap ? "text-green-600" : "text-red-500";
  const GapIcon = isPositiveGap ? TrendingUp : TrendingDown;

  const channelEntries = b.channel_presence ? Object.entries(b.channel_presence) : [];
  const channelEffEntries = b.channel_effectiveness ? Object.entries(b.channel_effectiveness) : [];

  const insightLines = (b.strategic_insights || "").split("\n").filter((l) => l.trim());
  const recommendationLines = (b.recommendations || "").split("\n").filter((l) => l.trim());

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) setFullscreen(false); onOpenChange(v); }}>
      <DialogContent className={cn(
        "overflow-y-auto p-0 transition-all duration-200",
        fullscreen
          ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none"
          : "max-w-3xl max-h-[90vh]"
      )}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 flex-shrink-0"
                    onClick={() => setFullscreen((f) => !f)}
                    title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
                  >
                    {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <DialogTitle className="text-lg">{b.competitor_name}</DialogTitle>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-9">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <a
                    href={b.competitor_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary truncate flex items-center gap-1"
                  >
                    {b.competitor_url.replace(/^https?:\/\//, "")}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
                <div className="flex items-center gap-2 mt-1.5 ml-9">
                  <Badge variant="outline" className="text-[10px]">{b.competitor_niche}</Badge>
                  <Badge variant="outline" className="text-[10px]">Projeto: {b.project_name}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(b.analysis_date).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center flex-shrink-0">
                <ScoreRing score={b.overall_score} size="md" label="Score" />
                <div className={cn("flex items-center gap-0.5 text-xs font-medium mt-1", gapColor)}>
                  <GapIcon className="h-3 w-3" />
                  <span>{isPositiveGap ? "+" : ""}{b.score_gap} vs projeto</span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Score Breakdown */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Scores Detalhados</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
                <ScoreBar label="Proposta de Valor" score={b.value_proposition_score} barColor="bg-blue-500" textColor="text-blue-600 dark:text-blue-400" />
                {b.value_proposition_analysis && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{b.value_proposition_analysis}</p>
                )}
              </div>
              <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 space-y-2">
                <ScoreBar label="Clareza da Oferta" score={b.offer_clarity_score} barColor="bg-violet-500" textColor="text-violet-600 dark:text-violet-400" />
                {b.offer_clarity_analysis && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{b.offer_clarity_analysis}</p>
                )}
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-2">
                <ScoreBar label="Jornada do Usuário" score={b.user_journey_score} barColor="bg-amber-500" textColor="text-amber-600 dark:text-amber-400" />
                {b.user_journey_analysis && (
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{b.user_journey_analysis}</p>
                )}
              </div>
            </div>
          </section>

          {/* Channel Scores */}
          {channelEntries.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Presença por Canal</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {channelEntries.map(([channel, score]) => {
                  const eff = b.channel_effectiveness?.[channel];
                  const isRec = eff?.recommended ?? (score as number) >= 60;
                  return (
                    <div key={channel} className={cn("rounded-lg border p-3 text-center space-y-1", channelColors[channel] || "bg-muted/50")}>
                      <p className="text-[11px] font-medium">{channelNames[channel] || channel}</p>
                      <p className={cn("text-2xl font-bold", (score as number) >= 70 ? "text-green-600" : (score as number) >= 50 ? "text-yellow-600" : "text-red-500")}>
                        {score as number}
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        {isRec ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-400" />
                        )}
                        <span className="text-[10px] text-muted-foreground">{isRec ? "Recomendado" : "Não recomendado"}</span>
                      </div>
                      {eff && eff.risks > 0 && (
                        <p className="text-[10px] text-red-400">{eff.risks} risco(s)</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SWOT */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Análise SWOT</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SwotSection
                title="Forças"
                items={b.strengths || []}
                icon={Target}
                color="bg-green-500/5 border-green-500/20"
                emptyText="Nenhuma força identificada"
              />
              <SwotSection
                title="Fraquezas"
                items={b.weaknesses || []}
                icon={AlertTriangle}
                color="bg-red-500/5 border-red-500/20"
                emptyText="Nenhuma fraqueza identificada"
              />
              <SwotSection
                title="Oportunidades"
                items={b.opportunities || []}
                icon={Lightbulb}
                color="bg-blue-500/5 border-blue-500/20"
                emptyText="Nenhuma oportunidade identificada"
              />
              <SwotSection
                title="Ameaças"
                items={b.threats || []}
                icon={ShieldAlert}
                color="bg-yellow-500/5 border-yellow-500/20"
                emptyText="Nenhuma ameaça identificada"
              />
            </div>
          </section>

          {/* Strategic Insights */}
          {insightLines.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Insights Estratégicos</h3>
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1.5">
                {insightLines.map((line, i) => (
                  <p key={i} className="text-xs text-foreground leading-relaxed">{line}</p>
                ))}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {recommendationLines.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Recomendações</h3>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-1.5">
                {recommendationLines.map((line, i) => (
                  <p key={i} className="text-xs text-foreground leading-relaxed">{line}</p>
                ))}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
