import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";
import { Badge } from "./ui/badge";
import { ExternalLink, Calendar, Globe } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ProjectCardProps {
  name: string;
  niche: string;
  url: string;
  score: number;
  status: "em_analise" | "completo" | "pendente";
  lastUpdate: string;
  channelScores?: {
    google: number;
    meta: number;
    linkedin: number;
    tiktok: number;
  };
  className?: string;
}

const statusConfig = {
  em_analise: { label: "Em Análise", className: "bg-info/10 text-info border-info/30" },
  completo: { label: "Completo", className: "bg-success/10 text-success border-success/30" },
  pendente: { label: "Pendente", className: "bg-warning/10 text-warning border-warning/30" },
};

const channelColors: Record<string, string> = {
  google: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  meta: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  linkedin: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  tiktok: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

const channelNames: Record<string, string> = {
  google: "Google Ads",
  meta: "Meta Ads",
  linkedin: "LinkedIn Ads",
  tiktok: "TikTok Ads",
};

export function ProjectCard({
  name,
  niche,
  url,
  score,
  status,
  lastUpdate,
  channelScores,
  className,
}: ProjectCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <div className={cn("card-elevated p-4 sm:p-5", className)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
            <Globe className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">{name}</h3>
              <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{niche}</p>
          </div>
        </div>
        <ScoreRing score={score} size="sm" label="Score" />
      </div>

      {/* URL */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 min-w-0">
        <ExternalLink className="h-3 w-3 flex-shrink-0" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
          {url.replace(/^https?:\/\//, '')}
        </a>
      </div>

      {/* Footer: channels + date */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
        {channelScores ? (
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(channelScores).map(([ch, val]) => {
              const scoreColor = val >= 70 ? "text-green-600 dark:text-green-400" : val >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500";
              return (
                <Tooltip key={ch}>
                  <TooltipTrigger asChild>
                    <div className={cn("flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium cursor-default", channelColors[ch])}>
                      <span>{channelNames[ch]}</span>
                      <span className={cn("font-bold", scoreColor)}>{val}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    <p className="font-semibold">{channelNames[ch]}</p>
                    <p>Score: {val}/100 — {val >= 70 ? "Recomendado" : val >= 50 ? "Atenção" : "Não recomendado"}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground flex-shrink-0">
          <Calendar className="h-3 w-3" />
          <span>{lastUpdate}</span>
        </div>
      </div>
    </div>
  );
}
