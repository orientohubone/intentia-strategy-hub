import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!change) return <Minus className="h-3 w-3" />;
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    return <TrendingDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground";
    if (change > 0) return "text-success";
    return "text-destructive";
  };

  return (
    <div className={cn("card-elevated p-6", className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && (
          <div className="p-2 bg-accent rounded-lg">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {(change !== undefined || changeLabel) && (
            <div className={cn("flex items-center gap-1 mt-1 text-xs", getTrendColor())}>
              {getTrendIcon()}
              <span>
                {change !== undefined && `${change > 0 ? '+' : ''}${change}%`}
                {changeLabel && ` ${changeLabel}`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
