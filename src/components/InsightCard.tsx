import { cn } from "@/lib/utils";
import { AlertTriangle, Lightbulb, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface InsightCardProps {
  type: "warning" | "opportunity" | "improvement";
  title: string;
  description: string;
  action?: string;
  className?: string;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-warning/10",
    iconColor: "text-warning",
    borderColor: "border-l-warning",
    label: "Alerta",
  },
  opportunity: {
    icon: TrendingUp,
    bgColor: "bg-success/10",
    iconColor: "text-success",
    borderColor: "border-l-success",
    label: "Oportunidade",
  },
  improvement: {
    icon: Lightbulb,
    bgColor: "bg-info/10",
    iconColor: "text-info",
    borderColor: "border-l-info",
    label: "Melhoria",
  },
};

export function InsightCard({
  type,
  title,
  description,
  action,
  className,
}: InsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "p-3 sm:p-4 rounded-lg border-l-4",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-2.5">
        <div className={cn("mt-0.5 flex-shrink-0", config.iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{config.label}</span>
          <h4 className="font-medium text-foreground text-sm leading-snug mt-0.5">{title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-3">{description}</p>
          {action && (
            <p className="text-xs text-primary font-medium mt-1.5 leading-snug">
              <ArrowRight className="h-3 w-3 inline mr-1" />
              {action}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
