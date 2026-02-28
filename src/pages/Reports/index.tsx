import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { FeatureGate } from "@/components/FeatureGate";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { useReports } from "./hooks/useReports";
import { ReportsHeader } from "./components/ReportsHeader";
import { StatsCards } from "./components/StatsCards";
import { ReportsFilter } from "./components/ReportsFilter";
import { ReportsList } from "./components/ReportsList";
import { downloadReport } from "./services/exportService";
import { buildConsolidatedReport } from "./services/reportBuilder";
import { ProjectReports, Report } from "./types";

export default function Reports() {
  const { reports, loading, loadReports, setReports } = useReports();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Agrupar relatórios por projeto
  const reportsByProject = reports.reduce((acc, report) => {
    const projectId = report.projectId || "unknown";
    if (!acc[projectId]) {
      acc[projectId] = {
        projectName: report.projectName || "Projeto Desconhecido",
        projectId,
        reports: [],
      };
    }
    acc[projectId].reports.push(report);
    return acc;
  }, {} as Record<string, ProjectReports>);

  // Filtrar relatórios
  const filteredProjects = Object.entries(reportsByProject)
    .map(([projectId, projectData]) => {
      const filteredReports = projectData.reports
        .filter((report) => {
          const matchesSearch =
            report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.campaignName?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesType = selectedType === "all" || report.type === selectedType;
          const matchesCategory = selectedCategory === "all" || report.category === selectedCategory;
          const matchesFavorites = !showFavoritesOnly || report.isFavorite;

          return matchesSearch && matchesType && matchesCategory && matchesFavorites;
        })
        .sort((a, b) => {
          switch (sortBy) {
            case "date_desc":
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            case "date_asc":
              return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "name_asc":
              return a.title.localeCompare(b.title);
            case "name_desc":
              return b.title.localeCompare(a.title);
            case "score_desc":
              return b.score - a.score;
            case "score_asc":
              return a.score - b.score;
            default:
              return 0;
          }
        });

      return {
        ...projectData,
        reports: filteredReports,
      };
    })
    .filter((project) => project.reports.length > 0);

  const handleDownload = async (report: Report, format: "pdf" | "json" | "html" = "html") => {
      await downloadReport(report, format);
  };

  const handleGenerateConsolidatedReport = async () => {
    const sourceReports = reports.length > 0 ? reports : await loadReports({ silent: true });

    if (!sourceReports || sourceReports.length === 0) {
      toast.error("Não há dados suficientes para gerar o consolidado.");
      return;
    }

    const baseReports = sourceReports.filter((report) => report.type !== "consolidated");
    if (baseReports.length === 0 && sourceReports.length === 0) {
      toast.error("Não há análises para consolidar.");
      return;
    }

    const consolidatedReport = buildConsolidatedReport(sourceReports);
    await downloadReport(consolidatedReport, "pdf");
  };

  const handleToggleFavorite = async (reportId: string) => {
    try {
      const currentReport = reports.find((r) => r.id === reportId);
      if (!currentReport) {
        console.error("Relatório não encontrado:", reportId?.message || "Unknown error");
        toast.error("Relatório não encontrado");
        return;
      }

      const newFavoriteStatus = !currentReport.isFavorite;

      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId ? { ...report, isFavorite: newFavoriteStatus } : report
        )
      );

      toast.success(newFavoriteStatus ? "Adicionado aos favoritos!" : "Removido dos favoritos!");
    } catch (error) {
      console.error("Erro ao atualizar favorito:", error?.message || "Unknown error");
      toast.error("Erro ao atualizar favorito");
    }
  };

  const toggleProject = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const toggleCategory = (projectId: string, category: string) => {
    const key = `${projectId}:${category}`;
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const setProjectCategoriesExpanded = (
    projectId: string,
    categories: string[],
    expanded: boolean
  ) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      categories.forEach((category) => {
        const key = `${projectId}:${category}`;
        if (expanded) next.add(key);
        else next.delete(key);
      });
      return next;
    });
  };

  if (loading) {
    return (
      <>
        <SEO title="Relatórios" description="Central de relatórios e análises" />
        <DashboardLayout>
          <FeatureGate featureKey="reports" withLayout={false} pageTitle="Relatórios">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardHeader className="space-y-2">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/70 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </FeatureGate>
        </DashboardLayout>
      </>
    );
  }

  return (
    <>
      <SEO title="Relatórios" description="Central de relatórios e análises" />
      <DashboardLayout>
        <FeatureGate featureKey="reports" withLayout={false} pageTitle="Relatórios">
          <div className="max-w-7xl mx-auto space-y-6">
            <ReportsHeader onGenerateConsolidated={handleGenerateConsolidatedReport} />
            <StatsCards reports={reports} />
            <ReportsFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sortBy={sortBy}
              setSortBy={setSortBy}
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={setShowFavoritesOnly}
            />
            <ReportsList
              projects={filteredProjects}
              expandedProjects={expandedProjects}
              toggleProject={toggleProject}
              expandedCategories={expandedCategories}
              toggleCategory={toggleCategory}
              setProjectCategoriesExpanded={setProjectCategoriesExpanded}
              onToggleFavorite={handleToggleFavorite}
              onDownload={handleDownload}
            />
          </div>
        </FeatureGate>
      </DashboardLayout>
    </>
  );
}
