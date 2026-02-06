import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
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
  Sparkles,
  Settings,
  Download,
  Shield,
  Crosshair,
  Zap,
  Clock,
} from "lucide-react";
import type { BenchmarkAiResult } from "@/lib/aiAnalyzer";
import { exportBenchmarkAsJson, exportBenchmarkAsMarkdown, exportBenchmarkAsHtml, exportBenchmarkAsPdf } from "@/lib/exportAnalysis";

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

interface AiModel {
  provider: string;
  model: string;
  label: string;
}

interface BenchmarkDetailDialogProps {
  benchmark: BenchmarkDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasAiKeys?: boolean;
  availableAiModels?: AiModel[];
  selectedAiModel?: string;
  onAiModelChange?: (value: string) => void;
  onAiAnalysis?: (benchmarkId: string) => void;
  aiAnalyzing?: string | null;
  aiResult?: BenchmarkAiResult | null;
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

const AI_MODEL_LABELS: Record<string, string> = {
  "gemini-2.0-flash": "Gemini 2.0 Flash",
  "gemini-3-flash-preview": "Gemini 3 Flash",
  "gemini-3-pro-preview": "Gemini 3 Pro",
  "claude-sonnet-4-20250514": "Claude Sonnet 4",
  "claude-3-7-sonnet-20250219": "Claude 3.7 Sonnet",
  "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
  "claude-3-haiku-20240307": "Claude 3 Haiku",
  "claude-3-opus-20240229": "Claude 3 Opus",
};

export function BenchmarkDetailDialog({
  benchmark,
  open,
  onOpenChange,
  hasAiKeys,
  availableAiModels,
  selectedAiModel,
  onAiModelChange,
  onAiAnalysis,
  aiAnalyzing,
  aiResult,
}: BenchmarkDetailDialogProps) {
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

          {/* AI Enrichment Section */}
          <section className="border-t border-border pt-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Enriquecimento por IA</h3>
              </div>
              <div className="flex items-center gap-1.5">
                {hasAiKeys ? (
                  <>
                    <Select
                      value={selectedAiModel || ""}
                      onValueChange={(v) => onAiModelChange?.(v)}
                      disabled={aiAnalyzing === b.id}
                    >
                      <SelectTrigger className="h-8 w-[160px] text-xs border-primary/30 bg-primary/5">
                        <SelectValue placeholder="Modelo IA" />
                      </SelectTrigger>
                      <SelectContent>
                        {(availableAiModels || []).map((m) => (
                          <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`} className="text-xs">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon"
                      className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex-shrink-0"
                      disabled={aiAnalyzing === b.id}
                      title="Enriquecer benchmark com IA"
                      onClick={() => onAiAnalysis?.(b.id)}
                    >
                      {aiAnalyzing === b.id ? (
                        <div className="relative flex items-center justify-center h-4 w-4">
                          <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-foreground animate-lab-bubble"></span>
                          <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/80 animate-lab-bubble-delay -translate-x-1"></span>
                          <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/60 animate-lab-bubble-delay-2 translate-x-1"></span>
                        </div>
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground" onClick={() => window.location.href = "/settings"}>
                    <Settings className="h-4 w-4" />
                    Configurar IA
                  </Button>
                )}
              </div>
            </div>

            {/* Lab animation during analysis */}
            {aiAnalyzing === b.id && (
              <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 p-4 flex items-center gap-4 mb-4">
                <div className="relative h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                  <span className="absolute h-2 w-2 rounded-full bg-primary animate-lab-bubble"></span>
                  <span className="absolute h-1.5 w-1.5 rounded-full bg-primary/70 animate-lab-bubble-delay -translate-x-1.5"></span>
                  <span className="absolute h-1.5 w-1.5 rounded-full bg-primary/50 animate-lab-bubble-delay-2 translate-x-1.5"></span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Enriquecendo benchmark com IA...</p>
                  <p className="text-xs text-muted-foreground">
                    Processando com {selectedAiModel?.split("::")[1] ? (AI_MODEL_LABELS[selectedAiModel.split("::")[1]] || selectedAiModel.split("::")[1]) : "IA"}. Isso pode levar até 30 segundos.
                  </p>
                </div>
              </div>
            )}

            {/* AI Results */}
            {(() => {
              const ai = aiResult || (b as any).ai_analysis as BenchmarkAiResult | undefined;
              if (!ai) {
                if (aiAnalyzing !== b.id) {
                  return (
                    <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 p-6 text-center">
                      <Sparkles className="h-6 w-6 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Clique no botão acima para enriquecer este benchmark com análise por IA.</p>
                    </div>
                  );
                }
                return null;
              }

              const threatColor = ai.overallVerdict.competitorThreatLevel >= 70 ? "text-red-500" : ai.overallVerdict.competitorThreatLevel >= 40 ? "text-yellow-600" : "text-green-600";
              const severityConfig: Record<string, { label: string; color: string }> = {
                high: { label: "Alta", color: "bg-red-500" },
                medium: { label: "Média", color: "bg-yellow-500" },
                low: { label: "Baixa", color: "bg-blue-500" },
              };
              const priorityConfig: Record<string, { label: string; color: string }> = {
                high: { label: "Alta", color: "bg-red-500" },
                medium: { label: "Média", color: "bg-yellow-500" },
                low: { label: "Baixa", color: "bg-blue-500" },
              };

              return (
                <div className="space-y-4">
                  {/* AI Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {ai.model.split("-").slice(0, 3).join("-")}
                      </Badge>
                      {ai.analyzedAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(ai.analyzedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {(() => {
                        const exportData = {
                          competitorName: b.competitor_name,
                          competitorUrl: b.competitor_url,
                          competitorNiche: b.competitor_niche,
                          projectName: b.project_name,
                          overallScore: b.overall_score,
                          scoreGap: b.score_gap,
                          ai,
                        };
                        return (
                          <>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportBenchmarkAsJson(exportData)} title="Exportar JSON">
                              <Download className="h-3 w-3 mr-1" />JSON
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportBenchmarkAsMarkdown(exportData)} title="Exportar Markdown">
                              MD
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportBenchmarkAsHtml(exportData)} title="Exportar HTML">
                              HTML
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportBenchmarkAsPdf(exportData)} title="Exportar PDF">
                              PDF
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="bg-muted/40 rounded-lg p-3">
                    <p className="text-sm text-foreground leading-relaxed">{ai.executiveSummary}</p>
                  </div>

                  {/* Threat Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Nível de Ameaça</p>
                      <p className={cn("text-2xl font-bold", threatColor)}>{ai.overallVerdict.competitorThreatLevel}</p>
                      <p className="text-[10px] text-muted-foreground">/100</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 sm:col-span-2 flex items-center">
                      <p className="text-xs text-foreground leading-relaxed">{ai.overallVerdict.summary}</p>
                    </div>
                  </div>

                  {/* Competitive Advantages vs Disadvantages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">Vantagens do Concorrente</h4>
                      </div>
                      <ul className="space-y-1">
                        {ai.competitiveAdvantages.map((item, i) => (
                          <li key={i} className="text-xs text-foreground leading-snug flex items-start gap-1.5">
                            <span className="mt-0.5 flex-shrink-0 text-green-500">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400">Desvantagens do Concorrente</h4>
                      </div>
                      <ul className="space-y-1">
                        {ai.competitiveDisadvantages.map((item, i) => (
                          <li key={i} className="text-xs text-foreground leading-snug flex items-start gap-1.5">
                            <span className="mt-0.5 flex-shrink-0 text-red-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Strategic Gaps */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Crosshair className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">Gaps Estratégicos</h4>
                    </div>
                    <div className="space-y-2">
                      {ai.strategicGaps.map((gap, i) => (
                        <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px]">{gap.area}</Badge>
                          </div>
                          <p className="text-xs text-foreground mb-1">{gap.gap}</p>
                          <p className="text-[11px] text-primary font-medium">→ {gap.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Market Positioning */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">Posicionamento de Mercado</h4>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-xs text-foreground leading-relaxed">{ai.marketPositioning}</p>
                    </div>
                  </div>

                  {/* Differentiation Opportunities */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">Oportunidades de Diferenciação</h4>
                    </div>
                    <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                      <ul className="space-y-1">
                        {ai.differentiationOpportunities.map((item, i) => (
                          <li key={i} className="text-xs text-foreground leading-snug flex items-start gap-1.5">
                            <span className="mt-0.5 flex-shrink-0 text-yellow-500">💡</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Threat Assessment */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">Avaliação de Ameaças</h4>
                    </div>
                    <div className="space-y-2">
                      {ai.threatAssessment.map((t, i) => (
                        <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("h-2 w-2 rounded-full", severityConfig[t.severity]?.color || "bg-gray-400")}></span>
                            <span className="text-xs font-medium text-foreground">{t.threat}</span>
                            <Badge variant="secondary" className="text-[10px] ml-auto">{severityConfig[t.severity]?.label || t.severity}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">Mitigação: {t.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Plan */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider">Plano de Ação</h4>
                    </div>
                    <div className="space-y-2">
                      {ai.actionPlan.map((a, i) => (
                        <div key={i} className="rounded-lg border border-primary/10 bg-primary/[0.02] p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("h-2 w-2 rounded-full", priorityConfig[a.priority]?.color || "bg-gray-400")}></span>
                            <span className="text-xs font-medium text-foreground flex-1">{a.action}</span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {a.timeframe}
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{a.expectedOutcome}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

