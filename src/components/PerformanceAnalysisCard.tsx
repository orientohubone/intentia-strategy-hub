import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Coffee, 
  Droplet, 
  Timer, 
  ArrowRight,
  CheckCircle2,
  Loader2,
  BarChart3
} from "lucide-react";

interface PerformanceAnalysisCardProps {
  campaignName: string;
  channel: string;
  model: string;
  onComplete: () => void;
  onCancel: () => void;
}

const SUGGESTIONS = [
  { icon: Coffee, text: "Pegar um café", duration: "3-5 min" },
  { icon: Droplet, text: "Beber uma água", duration: "1 min" },
  { icon: Timer, text: "Verificar e-mails", duration: "2-3 min" },
  { icon: ArrowRight, text: "Continuar trabalhando", duration: "enquanto analisa" }
];

export function PerformanceAnalysisCard({ 
  campaignName, 
  channel, 
  model, 
  onComplete, 
  onCancel 
}: PerformanceAnalysisCardProps) {
  const [progress, setProgress] = useState(0);
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Simulate progress and rotate suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 12 + 8;
        if (newProgress >= 95) {
          setIsComplete(true);
          return 95;
        }
        return newProgress;
      });
    }, 1800);

    const suggestionInterval = setInterval(() => {
      setCurrentSuggestion(prev => (prev + 1) % SUGGESTIONS.length);
    }, 3500);

    return () => {
      clearInterval(interval);
      clearInterval(suggestionInterval);
    };
  }, []);

  // Auto-complete when progress reaches 95%
  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setProgress(100);
        setTimeout(onComplete, 500);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onComplete]);

  const CurrentIcon = SUGGESTIONS[currentSuggestion].icon;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Análise de Performance em andamento</h3>
              <p className="text-sm text-muted-foreground">
                Analisando "{campaignName}" ({channel}) com {model}
              </p>
            </div>
          </div>
          {!isComplete && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso da análise</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {progress < 25 && "Coletando métricas da campanha..."}
            {progress >= 25 && progress < 50 && "Analisando performance e KPIs..."}
            {progress >= 50 && progress < 75 && "Comparando com benchmarks do setor..."}
            {progress >= 75 && !isComplete && "Gerando insights e recomendações..."}
            {isComplete && "Análise concluída!"}
          </p>
        </div>

        {/* Interactive Suggestions */}
        {!isComplete && (
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-3">
              <CurrentIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground text-sm">
                  {SUGGESTIONS[currentSuggestion].text}
                </p>
                <p className="text-xs text-muted-foreground">
                  Duração sugerida: {SUGGESTIONS[currentSuggestion].duration}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Nossa IA está analisando a performance da sua campanha. 
              Enquanto isso, que tal {SUGGESTIONS[currentSuggestion].text.toLowerCase()}? 
              Te notificaremos assim que terminar!
            </p>
          </div>
        )}

        {/* Complete State */}
        {isComplete && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-700 dark:text-green-400">
              Análise de performance concluída com sucesso!
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              Redirecionando para os resultados...
            </p>
          </div>
        )}

        {/* Loading Animation */}
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Analisando performance com IA...</span>
          </div>
        </div>

        {/* Metrics Preview */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>ROAS</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>CPA</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>CTR</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3" />
            <span>Health Score</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
