import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTenantData } from "@/hooks/useTenantData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { analyzeUrl, saveAnalysisResults, analyzeCompetitors, cleanBenchmarks, saveCompetitorBenchmark, checkBenchmarkLimit } from "@/lib/urlAnalyzer";
import type { UrlAnalysis } from "@/lib/urlAnalyzer";
import { AnalysisProgressTracker } from "@/components/AnalysisProgressTracker";
import { AiAnalysisCard } from "@/components/AiAnalysisCard";
import { StructuredDataViewer } from "@/components/StructuredDataViewer";
import type { CompetitorStructuredData } from "@/components/StructuredDataViewer";
import { StructuredDataGenerator } from "@/components/StructuredDataGenerator";
import { runAiAnalysis, getUserActiveKeys } from "@/lib/aiAnalyzer";
import { AI_MODEL_LABELS, getModelsForProvider } from "@/lib/aiModels";
import type { AiAnalysisResult, UserApiKey } from "@/lib/aiAnalyzer";
import { exportAsJson, exportAsMarkdown, exportAsHtml, exportAsPdf } from "@/lib/exportAnalysis";
import { notifyProjectCreated, notifyProjectDeleted, notifyAiAnalysisCompleted } from "@/lib/notificationService";
import { fetchProjectReport, generateConsolidatedReport } from "@/lib/reportGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { ScoreRing } from "@/components/ScoreRing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Globe,
  Shield,
  Eye,
  MousePointerClick,
  FileText,
  Settings,
  Download,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  FolderOpen,
  ChevronDown,
  ChevronsUpDown,
  ShieldAlert,
  BarChart3,
  Plus,
  Target,
  Search,
  Calendar,
} from "lucide-react";

import { ProjectStatsGrid } from "@/components/projects/ProjectStatsGrid";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { ProjectDetailDialog } from "@/components/projects/ProjectDetailDialog";
import { useProjectsData } from "@/hooks/useProjectsData";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default function Projects() {








  const pd = useProjectsData();
  const {
    isDialogOpen, setIsDialogOpen,
    searchTerm, setSearchTerm,
    activeProjectId, setActiveProjectId,
    channelScores, insights,
    analyzing, analysisComplete,
    competitorTotal, currentCompetitorIndex,
    formState, setFormState,
    editingId, setEditingId,
    hasAiKeys, heuristicResults,
    aiAnalyzing, setAiAnalyzing, availableAiModels,
    selectedAiModel, setSelectedAiModel,
    aiResults, competitorSdMap, setChannelScores,
    editingInsightId, editingInsight, setEditingInsight,
    insightDraft, setInsightDraft,
    user, loading, canAnalyze, canAiAnalysis,
    heuristicCheck, tenantSettings, projectList, channelList,
    isSectionCollapsed, toggleSection, collapseAll, expandAll,
    handleProjectSubmit, startEdit, handleChannelSave, handleReanalyze,
    handleAiAnalysis, handleInsightCreate, handleInsightUpdate,
    handleInsightDelete, startEditInsight, cancelEditInsight, handleDeleteProject
  } = pd;


  return (
    <DashboardLayout>
      <SEO title="Projetos" noindex />
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Projetos</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus projetos e análises.</p>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo Projeto</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>

        <ProjectFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingId={editingId}
          formState={formState}
          setFormState={setFormState}
          handleProjectSubmit={handleProjectSubmit}
          analyzing={analyzing}
          canAnalyze={canAnalyze}
          heuristicCheck={heuristicCheck}
          tenantSettings={tenantSettings}
          projectCount={projectList.filter((p: any) => !p.deleted_at).length}
          onCancelEdit={() => {
            setEditingId(null);
            setFormState({ name: "", niche: "", url: "", competitorUrls: "", solutionContext: "", missingFeatures: "", status: "pending" });
            setIsDialogOpen(false);
          }}
        />

        {/* Analysis Progress Tracker */}
        <AnalysisProgressTracker
          isAnalyzing={analyzing}
          competitorCount={competitorTotal}
          currentCompetitor={currentCompetitorIndex}
          isComplete={analysisComplete}
        />

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-border rounded-lg bg-card p-4 space-y-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-muted rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-20 bg-muted rounded" />
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-24 bg-muted rounded-full" />
                  <div className="h-6 w-24 bg-muted rounded-full" />
                  <div className="h-6 w-24 bg-muted rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && projectList.length === 0 && (
          <div className="flex flex-col items-center text-center py-12 px-4 rounded-xl border border-dashed border-border bg-muted/30">
            <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Crie seu primeiro projeto</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">Primeiro passo para seu diagnóstico estratégico completo com scores, insights e recomendações por canal.</p>
            <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Projeto
            </Button>
          </div>
        )}

        {!loading && projectList.length > 0 && (
          <div className="space-y-4">
            <ProjectStatsGrid projectList={projectList} insights={insights} />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, URL ou nicho..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectList.filter(p => !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.url.toLowerCase().includes(searchTerm.toLowerCase()) || p.niche.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => {
            const isActive = activeProjectId === project.id;
            const scores = channelScores[project.id] || channelList.map((channel) => ({ channel, score: 0 } as ChannelScore));
            const projectInsights = insights[project.id] || [];

            return (
              <React.Fragment key={project.id}>
                <ProjectCard
                  project={project}
                  user={user}
                  analyzing={analyzing}
                  canAnalyze={canAnalyze}
                  setActiveProjectId={setActiveProjectId}
                  handleReanalyze={handleReanalyze}
                  startEdit={startEdit}
                  handleDeleteProject={handleDeleteProject}
                />

                {/* Project Detail Dialog overlays the space instead of expanding inline */}
                <ProjectDetailDialog
                  isOpen={isActive}
                  onOpenChange={(open) => { if (!open) setActiveProjectId(null); }}
                  project={project}
                  analyzing={analyzing}
                  user={user}
                  expandAll={expandAll}
                  collapseAll={collapseAll}
                  heuristicResults={heuristicResults}
                  toggleSection={toggleSection}
                  isSectionCollapsed={isSectionCollapsed}
                  hasAiKeys={hasAiKeys}
                  canAiAnalysis={canAiAnalysis}
                  selectedAiModel={selectedAiModel}
                  setSelectedAiModel={setSelectedAiModel}
                  availableAiModels={availableAiModels}
                  aiAnalyzing={aiAnalyzing}
                  handleAiAnalysis={handleAiAnalysis}
                  aiResults={aiResults}
                  competitorSdMap={competitorSdMap}
                  setChannelScores={setChannelScores}
                  channelList={channelList}
                  channelScores={channelScores}
                  handleChannelSave={handleChannelSave}
                  projectInsights={projectInsights}
                  editingInsightId={editingInsightId}
                  editingInsight={editingInsight}
                  setEditingInsight={setEditingInsight}
                  handleInsightUpdate={handleInsightUpdate}
                  cancelEditInsight={cancelEditInsight}
                  handleInsightDelete={handleInsightDelete}
                  startEditInsight={startEditInsight}
                  insightDraft={insightDraft}
                  setInsightDraft={setInsightDraft}
                  handleInsightCreate={handleInsightCreate}
                />


                {/* AI Analysis Card - shown when analyzing this project */}
                {aiAnalyzing === project.id && (
                  <AiAnalysisCard
                    projectName={project.name}
                    model={selectedAiModel.split("::")[1] || "IA"}
                    onComplete={() => setAiAnalyzing(null)}
                    onCancel={() => setAiAnalyzing(null)}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
