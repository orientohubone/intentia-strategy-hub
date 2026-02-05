import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeConfig = {
  sm: { width: 60, stroke: 4, fontSize: "text-sm" },
  md: { width: 80, stroke: 5, fontSize: "text-lg" },
  lg: { width: 120, stroke: 6, fontSize: "text-2xl" },
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return "hsl(var(--score-excellent))";
  if (score >= 60) return "hsl(var(--score-good))";
  if (score >= 40) return "hsl(var(--score-moderate))";
  if (score >= 20) return "hsl(var(--score-low))";
  return "hsl(var(--score-critical))";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Moderado";
  if (score >= 20) return "Baixo";
  return "Crítico";
};

export function ScoreRing({ 
  score, 
  size = "md", 
  showLabel = true, 
  label,
  className 
}: ScoreRingProps) {
  const config = sizeConfig[size];
  const radius = (config.width - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="score-ring">
        <svg width={config.width} height={config.width}>
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={config.stroke}
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <span 
          className={cn(
            "absolute font-bold",
            config.fontSize
          )}
          style={{ color }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {label || getScoreLabel(score)}
        </span>
      )}
    </div>
  );
}
