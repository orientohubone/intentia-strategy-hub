import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";
import { Badge } from "./ui/badge";
import { ExternalLink, MoreVertical, Calendar } from "lucide-react";
import { Button } from "./ui/button";

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
    <div className={cn("card-elevated p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{name}</h3>
            <Badge variant="outline" className={statusInfo.className}>
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{niche}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <ExternalLink className="h-4 w-4" />
        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">
          {url.replace(/^https?:\/\//, '')}
        </a>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-4">
          <ScoreRing score={score} size="sm" label="Score Geral" />
          
          {channelScores && (
            <div className="flex gap-2">
              <div className="text-center">
                <div className="w-8 h-8 rounded bg-channel-google/10 flex items-center justify-center text-xs font-bold text-channel-google">
                  {channelScores.google}
                </div>
                <span className="text-[10px] text-muted-foreground">Google</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded bg-channel-meta/10 flex items-center justify-center text-xs font-bold text-channel-meta">
                  {channelScores.meta}
                </div>
                <span className="text-[10px] text-muted-foreground">Meta</span>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 rounded bg-channel-linkedin/10 flex items-center justify-center text-xs font-bold text-channel-linkedin">
                  {channelScores.linkedin}
                </div>
                <span className="text-[10px] text-muted-foreground">LinkedIn</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {lastUpdate}
        </div>
      </div>
    </div>
  );
}
