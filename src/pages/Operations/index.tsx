import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FeatureGate } from "@/components/FeatureGate";
import { SEO } from "@/components/SEO";
import { Megaphone, Plus, FolderOpen, ChevronDown, DollarSign, CalendarDays, AlertTriangle, GitCompareArrows, MonitorUp } from "lucide-react";
import {
  CHANNEL_LABELS,
  type CampaignChannel,
} from "@/lib/operationalTypes";

import { useCampaigns } from "./hooks/useCampaigns";
import { useCampaignMetrics } from "./hooks/useCampaignMetrics";
import { useAiPerformance } from "./hooks/useAiPerformance";

import { OperationsHeader } from "./components/OperationsHeader";
import { OperationsStats } from "./components/OperationsStats";
import { OperationsFilters } from "./components/OperationsFilters";
import { CampaignForm } from "./components/CampaignForm";
import { CampaignRow } from "./components/CampaignRow";
import { CampaignExpandedMetrics } from "./components/CampaignExpandedMetrics";
import CampaignPerformanceAiDialog from "./components/CampaignPerformanceAiDialog";
import { PerformanceAnalysisCard } from "@/components/PerformanceAnalysisCard";
import BudgetManagement from "./components/BudgetManagement";
import CampaignCalendarManager from "./components/CampaignCalendarManager";
import PerformanceAlerts from "./components/PerformanceAlerts";
import TacticalVsRealComparison from "./components/TacticalVsRealComparison";
import { Button } from "@/components/ui/button";

export default function Operations() {
  const navigate = useNavigate();

  const {
    user,
    projects,
    campaigns,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterChannel,
    setFilterChannel,
    filterProject,
    setFilterProject,
    showCreateForm,
    setShowCreateForm,
    editingId,
    expandedGroups,
    formData,
    setFormData,
    groupedCampaigns,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleStatusChange,
    resetForm,
    toggleGroup,
    expandAll,
    collapseAll,
    loadCampaigns,
    loadStats,
  } = useCampaigns();

  const {
    metricsSummaries,
    metricsFormCampaignId,
    metricsFormDrafts,
    setMetricsFormDrafts,
    expandedCampaigns,
    campaignMetricsEntries,
    metricsEntriesLoading,
    editingMetricId,
    toggleCampaignExpand,
    handleMetricsSubmit,
    handleMetricsUpdate,
    handleMetricsEdit,
    handleMetricsDelete,
    cancelMetricsForm,
    openNewMetricsForm,
    loadMetricsSummaries,
  } = useCampaignMetrics();

  const {
    canAiKeys,
    canAiPerformance,
    hasAiKeys,
    availableAiModels,
    selectedAiModel,
    setSelectedAiModel,
    aiAnalyzing,
    setAiAnalyzing,
    aiResults,
    aiDialogCampaignId,
    setAiDialogCampaignId,
    handleAiPerformanceAnalysis,
  } = useAiPerformance(campaigns, metricsSummaries, campaignMetricsEntries, projects);

  // Channel expand/collapse state: key = "projectId::channel"
  const [expandedChannels, setExpandedChannels] = useState<Set<string>>(new Set());

  const toggleChannel = (key: string) => {
    setExpandedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isChannelExpanded = (projectId: string, channel: string) => {
    const key = `${projectId}::${channel}`;
    // Default to expanded (collapsed only if explicitly in the set)
    return !expandedChannels.has(key);
  };

  // Tool cards accordion: only one open per project, key = "projectId::toolName"
  const [openToolCard, setOpenToolCard] = useState<string | null>(null);

  const toggleToolCard = (projectId: string, tool: string) => {
    const key = `${projectId}::${tool}`;
    setOpenToolCard((prev) => (prev === key ? null : key));
  };

  const isToolOpen = (projectId: string, tool: string) =>
    openToolCard === `${projectId}::${tool}`;

  const onReload = () => {
    loadCampaigns();
    loadStats();
  };

  return (
    <FeatureGate featureKey="operations" withLayout={false} pageTitle="Operações">
    <DashboardLayout>
      <SEO title="Operações | Intentia" description="Gestão de campanhas e métricas operacionais" />
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

          <OperationsHeader
            groupedCampaigns={groupedCampaigns}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onNewCampaign={() => { resetForm(); setShowCreateForm(true); }}
          />

          {stats && <OperationsStats stats={stats} />}

          <OperationsFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            filterChannel={filterChannel}
            onFilterChannelChange={setFilterChannel}
            filterProject={filterProject}
            onFilterProjectChange={setFilterProject}
            projects={(projects || []).map((p: any) => ({ id: p.id, name: p.name }))}
          />

          {showCreateForm && (
            <CampaignForm
              formData={formData}
              editingId={editingId}
              projects={(projects || []).map((p: any) => ({ id: p.id, name: p.name }))}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={resetForm}
            />
          )}

          {/* Campaign List — Grouped by Project */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="border border-border rounded-lg bg-card p-4 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg" />
                      <div className="space-y-2">
                        <div className="h-4 w-40 bg-muted rounded" />
                        <div className="h-3 w-24 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-muted rounded-full" />
                      <div className="h-6 w-16 bg-muted rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : groupedCampaigns.length === 0 ? (
            <div className="bg-card border rounded-lg p-8 sm:p-12 text-center">
              <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gerencie suas campanhas de marketing</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {campaigns.length === 0
                  ? "Clique em \u00abNova Campanha\u00bb acima para criar sua primeira campanha e acompanhar m\u00e9tricas de performance por canal."
                  : "Nenhuma campanha corresponde aos filtros selecionados."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedCampaigns.map((group) => {
                const isExpanded = expandedGroups.has(group.projectId);
                const activeCount = group.campaigns.filter((c) => c.status === "active").length;
                const totalBudget = group.campaigns.reduce((sum, c) => sum + (c.budget_total || 0), 0);

                const formatCurrency = (value: number) =>
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

                return (
                  <div key={group.projectId} className="space-y-3">
                  <div className="bg-card border rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <div className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-accent/50 transition-colors text-left">
                      <button
                        onClick={() => toggleGroup(group.projectId)}
                        className="flex items-center gap-3 text-left min-w-0"
                      >
                        <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
                        <div>
                          <h3 className="font-semibold text-sm sm:text-base">{group.projectName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.campaigns.length} campanha{group.campaigns.length !== 1 ? "s" : ""}
                            {activeCount > 0 && ` · ${activeCount} ativa${activeCount !== 1 ? "s" : ""}`}
                            {totalBudget > 0 && ` · ${formatCurrency(totalBudget)}`}
                          </p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          onClick={() => navigate(`/operations/live-dashboard?projectId=${group.projectId}`)}
                        >
                          <MonitorUp className="h-3.5 w-3.5" />
                          Dashboard
                        </Button>
                        <button
                          onClick={() => toggleGroup(group.projectId)}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent"
                          aria-label={isExpanded ? "Recolher projeto" : "Expandir projeto"}
                        >
                          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Group Content — sub-grouped by channel */}
                    {isExpanded && (() => {
                      const channelOrder: CampaignChannel[] = ["google", "meta", "linkedin", "tiktok"];
                      const byChannel = channelOrder
                        .map((ch) => ({
                          channel: ch,
                          items: group.campaigns.filter((c) => c.channel === ch),
                        }))
                        .filter((g) => g.items.length > 0);

                      return (
                        <div className="border-t">
                          {byChannel.map(({ channel, items }) => (
                            <div key={channel}>
                              {/* Channel sub-header — clickable */}
                              <button
                                onClick={() => toggleChannel(`${group.projectId}::${channel}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-muted/40 border-b w-full text-left hover:bg-muted/60 transition-colors"
                              >
                                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${
                                  isChannelExpanded(group.projectId, channel) ? "rotate-180" : ""
                                }`} />
                                <img
                                  src={`/${channel === "google" ? "google-ads" : channel === "meta" ? "meta-ads" : channel === "linkedin" ? "linkedin-ads" : "tiktok-ads"}.svg`}
                                  alt={CHANNEL_LABELS[channel]}
                                  className="h-4 w-4 object-contain"
                                />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  {CHANNEL_LABELS[channel]}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  ({items.length})
                                </span>
                              </button>

                              {/* Campaigns for this channel */}
                              {isChannelExpanded(group.projectId, channel) && (
                              <div className="divide-y">
                                {items.map((campaign) => {
                                  const currentEditingMetricId =
                                    metricsFormCampaignId === campaign.id ? editingMetricId : null;

                                  return (
                                  <div key={campaign.id}>
                                    <CampaignRow
                                      campaign={campaign}
                                      isExpanded={expandedCampaigns.has(campaign.id)}
                                      hasAiResult={!!aiResults[campaign.id]}
                                      onStatusChange={handleStatusChange}
                                      onToggleExpand={toggleCampaignExpand}
                                      onShowAiDialog={setAiDialogCampaignId}
                                      onEdit={handleEdit}
                                      onDelete={handleDelete}
                                    >
                                      {expandedCampaigns.has(campaign.id) && (
                                        <CampaignExpandedMetrics
                                          campaign={campaign}
                                          summary={metricsSummaries[campaign.id]}
                                          metricsEntries={campaignMetricsEntries[campaign.id] || []}
                                          metricsLoading={metricsEntriesLoading[campaign.id] || false}
                                          metricsFormCampaignId={metricsFormCampaignId === campaign.id ? campaign.id : null}
                                          metricsFormDraft={metricsFormDrafts[campaign.id]}
                                          editingMetricId={currentEditingMetricId}
                                          canAiKeys={canAiKeys}
                                          canAiPerformance={canAiPerformance}
                                          hasAiKeys={hasAiKeys}
                                          availableAiModels={availableAiModels}
                                          selectedAiModel={selectedAiModel}
                                          onSelectedAiModelChange={setSelectedAiModel}
                                          aiAnalyzing={aiAnalyzing}
                                          hasAiResult={!!aiResults[campaign.id]}
                                          onAiAnalysis={handleAiPerformanceAnalysis}
                                          onShowAiDialog={setAiDialogCampaignId}
                                          onMetricsSubmit={(data) => handleMetricsSubmit(campaign.id, data, onReload)}
                                          onMetricsUpdate={(metricId, data) => handleMetricsUpdate(campaign.id, metricId, data, onReload)}
                                          onMetricsEdit={(metric) => handleMetricsEdit(campaign.id, metric)}
                                          onMetricsDelete={(metricId) => handleMetricsDelete(campaign.id, metricId, onReload)}
                                          onMetricsCancel={() => cancelMetricsForm(campaign.id)}
                                          onMetricsFormDraftChange={(data) => setMetricsFormDrafts((prev) => ({ ...prev, [campaign.id]: data }))}
                                          onOpenNewMetricsForm={() => openNewMetricsForm(campaign.id)}
                                        />
                                      )}
                                    </CampaignRow>
                                    
                                    {/* Performance Analysis Card - shown when analyzing this campaign */}
                                    {aiAnalyzing === campaign.id && (
                                      <PerformanceAnalysisCard
                                        campaignName={campaign.name}
                                        channel={CHANNEL_LABELS[campaign.channel] || campaign.channel}
                                        model={selectedAiModel.split("::")[1] || "IA"}
                                        onComplete={() => setAiAnalyzing(null)}
                                        onCancel={() => setAiAnalyzing(null)}
                                      />
                                    )}
                                  </div>
                                )})}
                              </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}

                  </div>

                  {/* Tools Cards — visual cards grid + accordion */}
                  {isExpanded && (() => {
                    const tools = [
                      ...(user ? [{
                        key: "budget",
                        icon: DollarSign,
                        iconColor: "text-emerald-500",
                        iconBg: "bg-emerald-500/10",
                        title: "Gestão de Budget",
                        description: "Alocação mensal por canal, pacing e projeções de gasto",
                      }] : []),
                      ...(user ? [{
                        key: "calendar",
                        icon: CalendarDays,
                        iconColor: "text-blue-500",
                        iconBg: "bg-blue-500/10",
                        title: "Calendário de Campanhas",
                        description: "Visualize cronogramas em calendário ou timeline",
                      }] : []),
                      ...(group.campaigns.length > 0 ? [{
                        key: "alerts",
                        icon: AlertTriangle,
                        iconColor: "text-amber-500",
                        iconBg: "bg-amber-500/10",
                        title: "Alertas de Performance",
                        description: "Avisos automáticos sobre métricas fora do esperado",
                      }] : []),
                      ...(group.campaigns.length > 0 ? [{
                        key: "tactical",
                        icon: GitCompareArrows,
                        iconColor: "text-purple-500",
                        iconBg: "bg-purple-500/10",
                        title: "Comparativo Tático vs Real",
                        description: "Aderência entre planejamento tático e execução real",
                      }] : []),
                    ];

                    const activeKey = tools.find((t) => isToolOpen(group.projectId, t.key))?.key || null;

                    return (
                      <div className="space-y-3">
                        {/* Cards grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {tools.map((tool) => {
                            const Icon = tool.icon;
                            const isActive = isToolOpen(group.projectId, tool.key);
                            return (
                              <button
                                key={tool.key}
                                onClick={() => toggleToolCard(group.projectId, tool.key)}
                                className={`border rounded-lg p-4 sm:p-5 text-left transition-all hover:shadow-md group ${
                                  isActive
                                    ? "bg-card border-primary/40 ring-1 ring-primary/20 shadow-sm"
                                    : "bg-card border-border hover:border-primary/30"
                                }`}
                              >
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${tool.iconBg} flex items-center justify-center mb-3`}>
                                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${tool.iconColor}`} />
                                </div>
                                <h4 className={`text-sm font-semibold mb-1 transition-colors ${
                                  isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                                }`}>
                                  {tool.title}
                                </h4>
                                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                  {tool.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>

                        {/* Expanded tool content */}
                        {activeKey === "budget" && user && (
                          <div className="bg-card border border-primary/20 rounded-lg p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <BudgetManagement
                              userId={user.id}
                              projectId={group.projectId}
                              projectName={group.projectName}
                              onSync={() => { loadStats(); loadCampaigns(); }}
                            />
                          </div>
                        )}

                        {activeKey === "calendar" && user && (
                          <div className="bg-card border border-primary/20 rounded-lg p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <CampaignCalendarManager
                              userId={user.id}
                              projectId={group.projectId}
                              projectName={group.projectName}
                            />
                          </div>
                        )}

                        {activeKey === "alerts" && (
                          <div className="bg-card border border-primary/20 rounded-lg p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <PerformanceAlerts
                              campaigns={group.campaigns.map((c) => ({
                                id: c.id,
                                name: c.name,
                                channel: c.channel,
                                status: c.status,
                                budget_total: c.budget_total,
                                budget_spent: c.budget_spent,
                                start_date: c.start_date,
                                end_date: c.end_date,
                              }))}
                              metricsSummaries={metricsSummaries as unknown as Record<string, Record<string, number | null>>}
                            />
                          </div>
                        )}

                        {activeKey === "tactical" && (
                          <div className="bg-card border border-primary/20 rounded-lg p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-200">
                            <TacticalVsRealComparison
                              projectId={group.projectId}
                              projectName={group.projectName}
                              campaigns={group.campaigns.map((c) => ({
                                id: c.id,
                                name: c.name,
                                channel: c.channel,
                                status: c.status,
                                objective: c.objective,
                              }))}
                              metricsSummaries={metricsSummaries as unknown as Record<string, Record<string, number | null>>}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
                );
              })}
            </div>
          )}
          </div>

      {/* AI Performance Analysis Dialog */}
      {aiDialogCampaignId && aiResults[aiDialogCampaignId] && (
        <CampaignPerformanceAiDialog
          open={!!aiDialogCampaignId}
          onOpenChange={(open) => { if (!open) setAiDialogCampaignId(null); }}
          analysis={aiResults[aiDialogCampaignId]}
          campaignName={campaigns.find((c) => c.id === aiDialogCampaignId)?.name || ""}
          channel={CHANNEL_LABELS[campaigns.find((c) => c.id === aiDialogCampaignId)?.channel || "google"] || ""}
        />
      )}
    </DashboardLayout>
    </FeatureGate>
  );
}
