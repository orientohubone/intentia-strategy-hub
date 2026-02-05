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
  },
  opportunity: {
    icon: TrendingUp,
    bgColor: "bg-success/10",
    iconColor: "text-success",
    borderColor: "border-l-success",
  },
  improvement: {
    icon: Lightbulb,
    bgColor: "bg-info/10",
    iconColor: "text-info",
    borderColor: "border-l-info",
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
      "p-4 rounded-lg border-l-4",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", config.iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
          {action && (
            <Button variant="link" className="px-0 h-auto mt-2 text-sm">
              {action}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
