import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, ChevronDown, ChevronRight } from "lucide-react";
import { ProjectReports, Report } from "../types";
import { ReportCard } from "./ReportCard";
import { getCategoryIcon, getCategoryTone } from "../utils/styles";

interface ProjectGroupProps {
  project: ProjectReports;
  isExpanded: boolean;
  onToggleProject: () => void;
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  onSetCategoriesExpanded: (categories: string[], expanded: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (report: Report, format: "pdf" | "json" | "html") => void;
}

export function ProjectGroup({
  project,
  isExpanded,
  onToggleProject,
  expandedCategories,
  onToggleCategory,
  onSetCategoriesExpanded,
  onToggleFavorite,
  onDownload,
}: ProjectGroupProps) {
  const reportCount = project.reports.length;
  const favoriteCount = project.reports.filter((r) => r.isFavorite).length;
  const avgScore = Math.round(project.reports.reduce((acc, r) => acc + r.score, 0) / Math.max(1, reportCount));

  const categoryPriority: Record<string, number> = {
    "Análise de Projeto": 1,
    "Insight Estratégico": 2,
    "Performance": 3,
    "Benchmark Competitivo": 4,
    "Consolidado": 5,
  };

  const reportsByCategory = project.reports.reduce((acc, report) => {
    const key = report.category || "Outros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(report);
    return acc;
  }, {} as Record<string, Report[]>);

  const sortedCategoryEntries = Object.entries(reportsByCategory).sort((a, b) => {
    const aOrder = categoryPriority[a[0]] ?? 999;
    const bOrder = categoryPriority[b[0]] ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a[0].localeCompare(b[0]);
  });

  return (
    <div className="space-y-3">
      {/* Project Header */}
      <Card className="border-border/80 shadow-sm">
        <CardContent className="p-0">
          <button
            onClick={onToggleProject}
            className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm sm:text-base">{project.projectName}</h3>
                <p className="text-xs text-muted-foreground">
                  {reportCount} relatório{reportCount !== 1 ? "s" : ""}
                  {favoriteCount > 0 && ` · ${favoriteCount} favorito${favoriteCount !== 1 ? "s" : ""}`}
                  <span className="text-xs text-muted-foreground"> · Score médio: {avgScore}/100</span>
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </CardContent>
      </Card>

      {/* Reports for this Project */}
      {isExpanded && (
        <div className="space-y-2 pl-8">
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                onSetCategoriesExpanded(
                  sortedCategoryEntries.map(([category]) => category),
                  false
                )
              }
            >
              Colapsar todas
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                onSetCategoriesExpanded(
                  sortedCategoryEntries.map(([category]) => category),
                  true
                )
              }
            >
              Expandir todas
            </Button>
          </div>
          {sortedCategoryEntries.map(([category, categoryReports]) => {
            const categoryKey = `${project.projectId}:${category}`;
            const isCategoryExpanded = expandedCategories.has(categoryKey);

            return (
              <div key={category} className="space-y-2">
                <button
                  onClick={() => onToggleCategory(category)}
                  className="w-full flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-3 py-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-7 w-7 rounded-md border flex items-center justify-center ${getCategoryTone(
                        category
                      )}`}
                    >
                      {getCategoryIcon(category)}
                    </div>
                    <p className="text-xs font-semibold text-foreground">{category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {categoryReports.length} relatório{categoryReports.length !== 1 ? "s" : ""}
                    </Badge>
                    {isCategoryExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isCategoryExpanded &&
                  categoryReports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      onToggleFavorite={onToggleFavorite}
                      onDownload={onDownload}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
