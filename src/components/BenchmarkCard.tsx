import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Target, Calendar, Globe, Eye, Trash2 } from "lucide-react";
import { Button } from "./ui/button";

function getDomain(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
  } catch {
    return url.replace(/^https?:\/\//, "").split("/")[0];
  }
}

function CompetitorLogo({ domain, name }: { domain: string; name: string }) {
  const [srcIndex, setSrcIndex] = useState(0);
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    `https://${domain}/favicon.ico`,
  ];

  if (srcIndex >= sources.length) {
    return (
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-muted-foreground">{initials || "?"}</span>
      </div>
    );
  }

  return (
    <img
      src={sources[srcIndex]}
      alt={name}
      className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted object-contain shrink-0 p-1 border border-border"
      onError={() => setSrcIndex(prev => prev + 1)}
      loading="lazy"
    />
  );
}

interface BenchmarkCardProps {
  id: string;
  competitorName: string;
  competitorUrl: string;
  competitorNiche: string;
  overallScore: number;
  valuePropositionScore: number;
  offerClarityScore: number;
  userJourneyScore: number;
  scoreGap: number;
  strengths: string[];
  weaknesses: string[];
  analysisDate: string;
  channelPresence?: Record<string, any>;
  className?: string;
  onView?: () => void;
  onDelete?: () => void;
}

export function BenchmarkCard({
  id,
  competitorName,
  competitorUrl,
  competitorNiche,
  overallScore,
  valuePropositionScore,
  offerClarityScore,
  userJourneyScore,
  scoreGap,
  strengths,
  weaknesses,
  analysisDate,
  channelPresence,
  className,
  onView,
  onDelete,
}: BenchmarkCardProps) {
  const isPositiveGap = scoreGap > 0;
  const gapColor = isPositiveGap ? "text-green-600" : "text-red-500";
  const GapIcon = isPositiveGap ? TrendingUp : TrendingDown;

  return (
    <div
      className={cn(
        "card-elevated p-4 sm:p-5 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all",
        className
      )}
      onClick={onView}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <CompetitorLogo domain={getDomain(competitorUrl)} name={competitorName} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">{competitorName}</h3>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{competitorNiche}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{competitorUrl.replace(/^https?:\/\//, "")}</span>
            </div>
          </div>
        </div>
        <ScoreRing score={overallScore} size="sm" label="Score" />
      </div>

      {/* Score bars mini */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Proposta", score: valuePropositionScore, bar: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
          { label: "Clareza", score: offerClarityScore, bar: "bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
          { label: "Jornada", score: userJourneyScore, bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
        ].map(({ label, score, bar, text }) => (
          <div key={label} className="space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn("font-bold", text)}>{score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className={cn("h-full rounded-full", bar)} style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* SWOT preview */}
      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="flex flex-wrap gap-1 mb-3">
          {strengths.slice(0, 2).map((s, i) => (
            <Badge key={`s-${i}`} variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 py-0">
              <Target className="h-2.5 w-2.5 mr-0.5" />
              <span className="truncate max-w-[120px]">{s}</span>
            </Badge>
          ))}
          {weaknesses.slice(0, 2).map((w, i) => (
            <Badge key={`w-${i}`} variant="secondary" className="text-[10px] bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20 px-1.5 py-0">
              <span className="truncate max-w-[120px]">{w}</span>
            </Badge>
          ))}
          {(strengths.length + weaknesses.length > 4) && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{strengths.length + weaknesses.length - 4}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {new Date(analysisDate).toLocaleDateString("pt-BR")}
          </span>
          <div className={cn("flex items-center gap-0.5 text-[11px] font-medium", gapColor)}>
            <GapIcon className="h-3 w-3" />
            <span>{isPositiveGap ? "+" : ""}{scoreGap} gap</span>
          </div>
        </div>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={onView}>
            <Eye className="h-3.5 w-3.5" />
            Ver
          </Button>
          {onDelete && (
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
