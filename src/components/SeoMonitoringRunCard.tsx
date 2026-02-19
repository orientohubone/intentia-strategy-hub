import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Coffee, Droplet, Timer, ArrowRight, Loader2, CheckCircle2, Radar } from "lucide-react";

type MonitoringStage = "queueing" | "processing" | "refreshing" | "done";

interface SeoMonitoringRunCardProps {
  projectName: string;
  stage: MonitoringStage;
}

const SUGGESTIONS = [
  { icon: Coffee, text: "Pegar um café", duration: "3-5 min" },
  { icon: Droplet, text: "Beber uma água", duration: "1 min" },
  { icon: Timer, text: "Organizar tarefas rápidas", duration: "2-3 min" },
  { icon: ArrowRight, text: "Continuar trabalhando", duration: "enquanto monitora" },
];

export function SeoMonitoringRunCard({ projectName, stage }: SeoMonitoringRunCardProps) {
  const [progress, setProgress] = useState(10);
  const [suggestionIndex, setSuggestionIndex] = useState(0);

  useEffect(() => {
    const suggestionTimer = window.setInterval(() => {
      setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 3500);
    return () => window.clearInterval(suggestionTimer);
  }, []);

  useEffect(() => {
    if (stage === "done") {
      setProgress(100);
      return;
    }

    const target =
      stage === "queueing" ? 28 :
      stage === "processing" ? 85 :
      stage === "refreshing" ? 96 :
      10;

    const timer = window.setInterval(() => {
      setProgress((prev) => (prev >= target ? prev : Math.min(target, prev + Math.random() * 6 + 2)));
    }, 700);

    return () => window.clearInterval(timer);
  }, [stage]);

  const stageLabel = useMemo(() => {
    if (stage === "queueing") return "Enfileirando monitoramento";
    if (stage === "processing") return "Executando análise inteligente (SEO, SERP e concorrentes)";
    if (stage === "refreshing") return "Consolidando snapshot e atualizando timeline";
    return "Monitoramento concluído";
  }, [stage]);

  const CurrentIcon = SUGGESTIONS[suggestionIndex].icon;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] overflow-hidden">
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="h-6 w-6 text-primary animate-pulse" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full animate-ping" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Monitoramento Inteligente em andamento</h3>
              <p className="text-sm text-muted-foreground">Projeto: {projectName}</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1.5">
            <Radar className="h-3.5 w-3.5" />
            Live
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{stageLabel}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {stage !== "done" ? (
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <CurrentIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground text-sm">{SUGGESTIONS[suggestionIndex].text}</p>
                <p className="text-xs text-muted-foreground">Duração sugerida: {SUGGESTIONS[suggestionIndex].duration}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Enquanto monitoramos SEO, posição e concorrência, você pode seguir com outras tarefas.
              Os insights entram automaticamente na timeline.
            </p>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="font-medium text-green-700 dark:text-green-400">Snapshot concluído com sucesso</p>
          </div>
        )}

        <div className="flex items-center justify-center py-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Monitorando mudanças e sinais de mercado...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
