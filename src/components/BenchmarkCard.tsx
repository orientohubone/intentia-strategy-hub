import { cn } from "@/lib/utils";
import { ScoreRing } from "./ScoreRing";
import { Badge } from "./ui/badge";
import { ExternalLink, TrendingUp, TrendingDown, Target, Calendar, Globe } from "lucide-react";
import { Button } from "./ui/button";

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
  onEdit?: () => void;
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
  onEdit,
  onDelete,
}: BenchmarkCardProps) {
  const isPositiveGap = scoreGap > 0;
  const gapColor = isPositiveGap ? "text-success" : "text-danger";
  const gapIcon = isPositiveGap ? TrendingUp : TrendingDown;
  const gapLabel = isPositiveGap ? "Acima" : "Abaixo";

  return (
    <div className={cn("card-elevated p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{competitorName}</h3>
            <Badge variant="outline" className="bg-muted/50">
              {competitorNiche}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Concorrente analisado</p>
        </div>
        <div className="flex items-center gap-1">
          <div className={cn("flex items-center gap-1 text-sm font-medium", gapColor)}>
            {gapIcon && <gapIcon className="h-4 w-4" />}
            <span>{gapLabel}</span>
            <span className="font-bold">{Math.abs(scoreGap)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Globe className="h-4 w-4" />
        <a 
          href={competitorUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-primary truncate"
        >
          {competitorUrl.replace(/^https?:\/\//, '')}
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <ScoreRing score={overallScore} size="sm" label="Geral" />
        </div>
        <div className="text-center">
          <ScoreRing score={valuePropositionScore} size="sm" label="Proposta" />
        </div>
        <div className="text-center">
          <ScoreRing score={offerClarityScore} size="sm" label="Clareza" />
        </div>
        <div className="text-center">
          <ScoreRing score={userJourneyScore} size="sm" label="Jornada" />
        </div>
      </div>

      {(strengths.length > 0 || weaknesses.length > 0) && (
        <div className="space-y-2 mb-4">
          {strengths.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {strengths.slice(0, 2).map((strength, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-success/10 text-success border-success/30">
                  <Target className="h-3 w-3 mr-1" />
                  {strength}
                </Badge>
              ))}
              {strengths.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{strengths.length - 2}
                </Badge>
              )}
            </div>
          )}
          {weaknesses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {weaknesses.slice(0, 2).map((weakness, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-danger/10 text-danger border-danger/30">
                  {weakness}
                </Badge>
              ))}
              {weaknesses.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{weaknesses.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(analysisDate).toLocaleDateString('pt-BR')}
        </div>
        
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Editar
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10" onClick={onDelete}>
              Excluir
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
