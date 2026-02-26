import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { ProjectReports, Report } from "../types";
import { ProjectGroup } from "./ProjectGroup";

interface ReportsListProps {
  projects: ProjectReports[];
  expandedProjects: Set<string>;
  toggleProject: (projectId: string) => void;
  expandedCategories: Set<string>;
  toggleCategory: (projectId: string, category: string) => void;
  setProjectCategoriesExpanded: (projectId: string, categories: string[], expanded: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onDownload: (report: Report, format: "pdf" | "json" | "html") => void;
}

export function ReportsList({
  projects,
  expandedProjects,
  toggleProject,
  expandedCategories,
  toggleCategory,
  setProjectCategoriesExpanded,
  onToggleFavorite,
  onDownload,
}: ReportsListProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum relatório encontrado</h3>
          <p className="text-muted-foreground text-center">
            Tente ajustar os filtros ou criar novas análises para gerar relatórios.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <ProjectGroup
          key={project.projectId}
          project={project}
          isExpanded={expandedProjects.has(project.projectId)}
          onToggleProject={() => toggleProject(project.projectId)}
          expandedCategories={expandedCategories}
          onToggleCategory={(category) => toggleCategory(project.projectId, category)}
          onSetCategoriesExpanded={(categories, expanded) =>
            setProjectCategoriesExpanded(project.projectId, categories, expanded)
          }
          onToggleFavorite={onToggleFavorite}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
}
