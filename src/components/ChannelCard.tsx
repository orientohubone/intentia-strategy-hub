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
    icon: "G",
  },
  meta: {
    name: "Meta Ads",
    color: "bg-channel-meta",
    icon: "M",
  },
  linkedin: {
    name: "LinkedIn Ads",
    color: "bg-channel-linkedin",
    icon: "in",
  },
  tiktok: {
    name: "TikTok Ads",
    color: "bg-channel-tiktok",
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
    if (score >= 60) return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (score >= 40) return <AlertCircle className="h-4 w-4 text-warning" />;
    return <XCircle className="h-4 w-4 text-destructive" />;
  };

  return (
    <div className={cn("card-elevated p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-primary-foreground",
            config.color
          )}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{config.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getRecommendationIcon()}
              <span>
                {score >= 60 ? "Recomendado" : score >= 40 ? "Atenção" : "Não recomendado"}
              </span>
            </div>
          </div>
        </div>
        <ScoreRing score={score} size="sm" showLabel={false} />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Objetivo Estratégico</p>
          <p className="text-sm font-medium text-foreground">{objective}</p>
        </div>
        
        <div>
          <p className="text-xs text-muted-foreground mb-1">Papel no Funil</p>
          <Badge variant="secondary" className="text-xs">
            {funnelRole}
          </Badge>
        </div>

        {risks.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Riscos Estratégicos</p>
            <div className="flex flex-wrap gap-1">
              {risks.map((risk, i) => (
                <Badge key={i} variant="outline" className="text-xs text-destructive border-destructive/30">
                  {risk}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
