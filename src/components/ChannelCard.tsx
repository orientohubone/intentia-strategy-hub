import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";
import { Badge } from "./ui/badge";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface ChannelCardProps {
  channel: "google" | "meta" | "linkedin" | "tiktok";
  score: number;
  objective?: string;
  funnelRole?: string;
  isRecommended?: boolean;
  risks?: string[];
  className?: string;
}

const channelConfig = {
  google: {
    name: "Google Ads",
    color: "bg-channel-google",
    borderColor: "border-blue-500/20",
    bgTint: "bg-blue-500/5",
    icon: "G",
  },
  meta: {
    name: "Meta Ads",
    color: "bg-channel-meta",
    borderColor: "border-indigo-500/20",
    bgTint: "bg-indigo-500/5",
    icon: "M",
  },
  linkedin: {
    name: "LinkedIn Ads",
    color: "bg-channel-linkedin",
    borderColor: "border-cyan-500/20",
    bgTint: "bg-cyan-500/5",
    icon: "in",
  },
  tiktok: {
    name: "TikTok Ads",
    color: "bg-channel-tiktok",
    borderColor: "border-zinc-500/20",
    bgTint: "bg-zinc-500/5",
    icon: "T",
  },
};

export function ChannelCard({
  channel,
  score,
  objective = "Não definido",
  funnelRole = "Não definido",
  isRecommended = true,
  risks = [],
  className,
}: ChannelCardProps) {
  const config = channelConfig[channel];

  const getRecommendationIcon = () => {
    if (score >= 60) return <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0" />;
    if (score >= 40) return <AlertCircle className="h-3.5 w-3.5 text-warning flex-shrink-0" />;
    return <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />;
  };

  return (
    <div className={cn(
      "rounded-xl border p-4 sm:p-5 flex flex-col gap-3",
      config.borderColor,
      config.bgTint,
      className
    )}>
      {/* Header: icon + name + score */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0",
            config.color
          )}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight">{config.name}</h3>
            <div className="flex items-center gap-1 mt-0.5">
              {getRecommendationIcon()}
              <span className="text-xs text-muted-foreground truncate">
                {score >= 60 ? "Recomendado" : score >= 40 ? "Atenção" : "Não recomendado"}
              </span>
            </div>
          </div>
        </div>
        <ScoreRing score={score} size="sm" showLabel={false} />
      </div>

      {/* Objective */}
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-0.5">Objetivo</p>
        <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">{objective}</p>
      </div>

      {/* Funnel Role */}
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Funil</p>
        <Badge variant="secondary" className="text-[11px] font-normal max-w-full">
          <span className="truncate">{funnelRole}</span>
        </Badge>
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div className="min-w-0 pt-2 border-t border-border/50">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">Riscos</p>
          <ul className="space-y-1">
            {risks.slice(0, 3).map((risk, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5 leading-snug">
                <span className="text-destructive mt-0.5 flex-shrink-0">•</span>
                <span className="line-clamp-2">{risk}</span>
              </li>
            ))}
            {risks.length > 3 && (
              <li className="text-xs text-muted-foreground/60">+{risks.length - 3} mais</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
