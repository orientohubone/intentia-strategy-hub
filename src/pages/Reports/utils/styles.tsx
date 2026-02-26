import {
  Target,
  Lightbulb,
  BarChart3,
  TrendingUp,
  FileText,
  FolderOpen
} from "lucide-react";

export const getTypeIcon = (type: string) => {
  switch (type) {
    case "project_analysis":
      return <Target className="h-4 w-4" />;
    case "campaign_analysis":
      return <BarChart3 className="h-4 w-4" />;
    case "benchmark":
      return <TrendingUp className="h-4 w-4" />;
    case "consolidated":
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const getTypeContainerClass = (type: string) => {
  switch (type) {
    case "project_analysis":
      return "bg-primary/10 text-primary border-primary/20";
    case "campaign_analysis":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "benchmark":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "consolidated":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Análise de Projeto":
      return <Target className="h-3.5 w-3.5" />;
    case "Insight Estratégico":
      return <Lightbulb className="h-3.5 w-3.5" />;
    case "Performance":
      return <BarChart3 className="h-3.5 w-3.5" />;
    case "Benchmark Competitivo":
      return <TrendingUp className="h-3.5 w-3.5" />;
    case "Consolidado":
      return <FileText className="h-3.5 w-3.5" />;
    default:
      return <FolderOpen className="h-3.5 w-3.5" />;
  }
};

export const getCategoryTone = (category: string) => {
  switch (category) {
    case "Análise de Projeto":
      return "bg-primary/10 text-primary border-primary/20";
    case "Insight Estratégico":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    case "Performance":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    case "Benchmark Competitivo":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    case "Consolidado":
      return "bg-violet-500/10 text-violet-600 border-violet-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};
