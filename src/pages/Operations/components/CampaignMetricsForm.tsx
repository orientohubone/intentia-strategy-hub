import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Save, BarChart3 } from "lucide-react";
import {
  type CampaignChannel,
  type MetricFieldConfig,
  COMMON_METRICS,
  CHANNEL_SPECIFIC_METRICS,
  CHANNEL_LABELS,
} from "@/lib/operationalTypes";

interface CampaignMetricsFormProps {
  campaignId: string;
  campaignName: string;
  channel: CampaignChannel;
  onSubmit: (data: MetricsFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<MetricsFormData>;
  isEditing?: boolean;
  onChange?: (data: MetricsFormData) => void;
}

export interface MetricsFormData {
  period_start: string;
  period_end: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  conversions: string;
  cpa: string;
  roas: string;
  cost: string;
  revenue: string;
  reach: string;
  frequency: string;
  video_views: string;
  vtr: string;
  leads: string;
  cpl: string;
  quality_score: string;
  avg_position: string;
  search_impression_share: string;
  engagement_rate: string;
  sessions: string;
  first_visits: string;
  leads_month: string;
  mql_rate: string;
  sql_rate: string;
  clients_web: string;
  revenue_web: string;
  avg_ticket: string;
  google_ads_cost: string;
  cac_month: string;
  cost_per_conversion: string;
  ltv: string;
  cac_ltv_ratio: string;
  cac_ltv_benchmark: string;
  roi_accumulated: string;
  roi_period_months: string;
  notes: string;
}

const defaultFormData: MetricsFormData = {
  period_start: "",
  period_end: "",
  impressions: "",
  clicks: "",
  ctr: "",
  cpc: "",
  cpm: "",
  conversions: "",
  cpa: "",
  roas: "",
  cost: "",
  revenue: "",
  reach: "",
  frequency: "",
  video_views: "",
  vtr: "",
  leads: "",
  cpl: "",
  quality_score: "",
  avg_position: "",
  search_impression_share: "",
  engagement_rate: "",
  sessions: "",
  first_visits: "",
  leads_month: "",
  mql_rate: "",
  sql_rate: "",
  clients_web: "",
  revenue_web: "",
  avg_ticket: "",
  google_ads_cost: "",
  cac_month: "",
  cost_per_conversion: "",
  ltv: "",
  cac_ltv_ratio: "",
  cac_ltv_benchmark: "",
  roi_accumulated: "",
  roi_period_months: "",
  notes: "",
};

export function CampaignMetricsForm({
  campaignId,
  campaignName,
  channel,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  onChange,
}: CampaignMetricsFormProps) {
  const [formData, setFormData] = useState<MetricsFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [saving, setSaving] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const channelMetrics = CHANNEL_SPECIFIC_METRICS[channel] || [];
  const allMetrics = [...COMMON_METRICS, ...channelMetrics];

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      onChangeRef.current?.(next);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!formData.period_start || !formData.period_end) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  const renderMetricInput = (metric: MetricFieldConfig) => {
    const value = formData[metric.key as keyof MetricsFormData] || "";
    const step = metric.type === "integer" ? "1" : "0.01";
    const min = "0";

    return (
      <div key={metric.key} className="space-y-1.5">
        <Label htmlFor={`metric-${metric.key}`} className="text-xs font-medium text-muted-foreground">
          {metric.label}
          {metric.suffix && <span className="text-muted-foreground/60 ml-1">({metric.suffix})</span>}
          {metric.prefix && <span className="text-muted-foreground/60 ml-1">({metric.prefix})</span>}
        </Label>
        <Input
          id={`metric-${metric.key}`}
          type="number"
          min={min}
          step={step}
          placeholder="0"
          value={value}
          onChange={(e) => handleChange(metric.key, e.target.value)}
          className="h-9 text-sm"
        />
      </div>
    );
  };

  return (
    <div className="bg-card border rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm sm:text-base">
            {isEditing ? "Editar Métricas" : "Registrar Métricas"}
          </h3>
          <Badge variant="outline" className="text-xs">{campaignName}</Badge>
          <Badge variant="outline" className="text-xs">{CHANNEL_LABELS[channel]}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="period-start" className="text-xs font-medium">Início do Período *</Label>
          <Input
            id="period-start"
            type="date"
            value={formData.period_start}
            onChange={(e) => handleChange("period_start", e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="period-end" className="text-xs font-medium">Fim do Período *</Label>
          <Input
            id="period-end"
            type="date"
            value={formData.period_end}
            onChange={(e) => handleChange("period_end", e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      {/* Common Metrics */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Métricas Gerais
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COMMON_METRICS.map(renderMetricInput)}
        </div>
      </div>

      {/* Channel-Specific Metrics */}
      {channelMetrics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Métricas {CHANNEL_LABELS[channel]}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {channelMetrics.map(renderMetricInput)}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="metric-notes" className="text-xs font-medium">Observações</Label>
        <Textarea
          id="metric-notes"
          placeholder="Notas sobre este período..."
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={2}
          className="text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={saving || !formData.period_start || !formData.period_end}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : isEditing ? "Atualizar" : "Registrar"}
        </Button>
      </div>
    </div>
  );
}
