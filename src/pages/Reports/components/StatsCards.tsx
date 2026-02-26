import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Star, Lightbulb, TrendingUp } from "lucide-react";
import { Report } from "../types";

interface StatsCardsProps {
  reports: Report[];
}

export function StatsCards({ reports }: StatsCardsProps) {
  const totalReports = reports.length;
  const favoriteReports = reports.filter((report) => report.isFavorite).length;
  const aiReports = reports.filter(
    (report) => report.type === "project_analysis" || report.type === "campaign_analysis"
  ).length;
  const averageScore =
    reports.length > 0 ? Math.round(reports.reduce((acc, report) => acc + report.score, 0) / reports.length) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{totalReports}</div>
          <p className="text-xs text-muted-foreground">Gerados este mês</p>
        </CardContent>
      </Card>
      <Card className="border-amber-500/20 bg-amber-500/[0.03]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Star className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{favoriteReports}</div>
          <p className="text-xs text-muted-foreground">Relatórios marcados</p>
        </CardContent>
      </Card>
      <Card className="border-emerald-500/20 bg-emerald-500/[0.03]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Análises de IA</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{aiReports}</div>
          <p className="text-xs text-muted-foreground">Com inteligência artificial</p>
        </CardContent>
      </Card>
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{averageScore}</div>
          <p className="text-xs text-muted-foreground">Qualidade geral</p>
        </CardContent>
      </Card>
    </div>
  );
}
