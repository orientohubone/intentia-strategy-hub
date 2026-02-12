import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Sparkles } from "lucide-react";
import type { CampaignMetrics as CampaignMetricsType } from "@/lib/operationalTypes";
import type { MetricsFormData } from "./CampaignMetricsForm";
import { CampaignMetricsForm } from "./CampaignMetricsForm";
import { CampaignPerformanceCards } from "./CampaignPerformanceCards";
import { CampaignMetricsList } from "./CampaignMetricsList";
import type { Campaign, MetricsSummaryData } from "../types";
import { EMPTY_METRICS_SUMMARY } from "../types";

interface CampaignExpandedMetricsProps {
  campaign: Campaign;
  summary: MetricsSummaryData | undefined;
  metricsEntries: CampaignMetricsType[];
  metricsLoading: boolean;
  metricsFormCampaignId: string | null;
  metricsFormDraft: Partial<MetricsFormData> | undefined;
  editingMetricId: string | null;
  // AI props
  canAiKeys: boolean;
  canAiPerformance: boolean;
  hasAiKeys: boolean;
  availableAiModels: { provider: string; model: string; label: string }[];
  selectedAiModel: string;
  onSelectedAiModelChange: (value: string) => void;
  aiAnalyzing: string | null;
  hasAiResult: boolean;
  onAiAnalysis: (campaign: Campaign) => void;
  onShowAiDialog: (id: string) => void;
  // Metrics callbacks
  onMetricsSubmit: (data: MetricsFormData) => void;
  onMetricsUpdate: (metricId: string, data: MetricsFormData) => void;
  onMetricsEdit: (metric: CampaignMetricsType) => void;
  onMetricsDelete: (metricId: string) => void;
  onMetricsCancel: () => void;
  onMetricsFormDraftChange: (data: MetricsFormData) => void;
  onOpenNewMetricsForm: () => void;
}

export function CampaignExpandedMetrics({
  campaign,
  summary,
  metricsEntries,
  metricsLoading,
  metricsFormCampaignId,
  metricsFormDraft,
  editingMetricId,
  canAiKeys,
  canAiPerformance,
  hasAiKeys,
  availableAiModels,
  selectedAiModel,
  onSelectedAiModelChange,
  aiAnalyzing,
  hasAiResult,
  onAiAnalysis,
  onShowAiDialog,
  onMetricsSubmit,
  onMetricsUpdate,
  onMetricsEdit,
  onMetricsDelete,
  onMetricsCancel,
  onMetricsFormDraftChange,
  onOpenNewMetricsForm,
}: CampaignExpandedMetricsProps) {
  const effectiveSummary = summary || EMPTY_METRICS_SUMMARY;

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <CampaignPerformanceCards
        summary={effectiveSummary}
        channel={campaign.channel}
        campaignName={campaign.name}
      />

      <CampaignMetricsList
        metrics={metricsEntries}
        loading={metricsLoading}
        onEdit={onMetricsEdit}
        onDelete={onMetricsDelete}
      />

      {metricsFormCampaignId === campaign.id ? (
        <CampaignMetricsForm
          campaignId={campaign.id}
          campaignName={campaign.name}
          channel={campaign.channel}
          initialData={metricsFormDraft}
          isEditing={!!editingMetricId}
          onSubmit={(data) =>
            editingMetricId
              ? onMetricsUpdate(editingMetricId, data)
              : onMetricsSubmit(data)
          }
          onCancel={onMetricsCancel}
          onChange={onMetricsFormDraftChange}
        />
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={onOpenNewMetricsForm}
        >
          <Plus className="h-3.5 w-3.5" />
          Registrar Métricas
        </Button>
      )}

      {/* AI Performance Analysis */}
      {canAiKeys && canAiPerformance && hasAiKeys && (summary?.total_entries ?? 0) > 0 && (
        <div className="flex items-center gap-1.5 pt-2 border-t">
          <Select
            value={selectedAiModel}
            onValueChange={onSelectedAiModelChange}
            disabled={aiAnalyzing === campaign.id}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs border-primary/30 bg-primary/5">
              <SelectValue placeholder="Modelo IA" />
            </SelectTrigger>
            <SelectContent>
              {availableAiModels.map((m) => (
                <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex-shrink-0"
            disabled={aiAnalyzing === campaign.id}
            title={aiAnalyzing === campaign.id ? "Analisando performance..." : "Executar análise de performance por IA"}
            onClick={() => onAiAnalysis(campaign)}
          >
            {aiAnalyzing === campaign.id ? (
              <div className="relative flex items-center justify-center h-4 w-4">
                <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-foreground animate-lab-bubble"></span>
                <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/80 animate-lab-bubble-delay -translate-x-1"></span>
                <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/60 animate-lab-bubble-delay-2 translate-x-1"></span>
              </div>
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
          {hasAiResult && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 text-primary hover:text-primary/80"
              onClick={() => onShowAiDialog(campaign.id)}
            >
              <Sparkles className="h-4 w-4" />
              Ver Análise
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
