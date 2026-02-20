import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, X, Save, BarChart3, Binoculars } from "lucide-react";
import {
  type CampaignChannel,
  type MetricFieldConfig,
  COMMON_METRICS,
  CHANNEL_SPECIFIC_METRICS,
  CHANNEL_LABELS,
} from "@/lib/operationalTypes";
import { DialogFatorLtv, type BenchmarkOption } from "./DialogFatorLtv";
import {
  BENCHMARK_NICHES,
  fallbackBenchmarkSnapshots,
  type BenchmarkSnapshot,
} from "@/lib/benchmarkData";

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


const DERIVED_METRIC_TIPS: Record<string, string> = {
  cac_month: "CAC = Custo Google Ads ÷ Clientes Web",
  avg_ticket: "Ticket Médio = Receita Web ÷ Clientes Web",
  ltv_duration_months: "Duração média do LTV em meses (ex: 12 meses)",
  ltv: "LTV (R$) = Ticket Médio × Duração média do LTV (meses)",
  mql_rate: "Taxa Usuário → MQL (%) = Leads do Mês ÷ Primeira Visita × 100",
  sql_rate: "Taxa Lead → SQL (%) = Clientes Web ÷ Leads do Mês × 100",
  cac_ltv_benchmark: "Benchmark CAC:LTV (x): 1 real de CAC gera 3,00 de LTV (SaaS ERP).",
};

const DERIVED_ON_BLUR_METRICS = new Set([
  "google_ads_cost",
  "clients_web",
  "revenue_web",
  "ltv_duration_months",
  "first_visits",
  "leads_month",
]);

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
  ltv_duration_months: string;
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
  ltv_duration_months: "",
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
  const [benchmarkDialogOpen, setBenchmarkDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MetricsFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [saving, setSaving] = useState(false);
  const onChangeRef = useRef(onChange);
  const formRef = useRef<HTMLDivElement>(null);
  onChangeRef.current = onChange;
  const channelMetrics = CHANNEL_SPECIFIC_METRICS[channel] || [];
  const allMetrics = [...COMMON_METRICS, ...channelMetrics];

  const parseNumber = (value: string) => {
    if (!value) return 0;
    const normalized = value.toString().replace(/,/g, ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const computeDerivedValues = (data: MetricsFormData) => {
    if (channel !== "google") return;

    const clients = parseNumber(data.clients_web || "");
    if (clients > 0) {
      const cost = parseNumber(data.google_ads_cost || "");
      const cacValue = cost / clients;
      data.cac_month = cacValue > 0 ? cacValue.toFixed(2) : "0.00";

      const revenue = parseNumber(data.revenue_web || "");
      const ticket = revenue / clients;
      data.avg_ticket = ticket > 0 ? ticket.toFixed(2) : "0.00";
    } else {
      data.avg_ticket = "0.00";
    }

    const ticketParsed = parseNumber(data.avg_ticket || "");
    const ltvDuration = parseNumber(data.ltv_duration_months || "");
    if (ticketParsed > 0 && ltvDuration > 0) {
      const computedLtv = ticketParsed * ltvDuration;
      data.ltv = computedLtv > 0 ? computedLtv.toFixed(2) : "0.00";
    } else {
      data.ltv = "0.00";
    }

    const firstVisits = parseNumber(data.first_visits || "");
    const leads = parseNumber(data.leads_month || "");
    if (firstVisits > 0) {
      const rate = (leads / firstVisits) * 100;
      data.mql_rate = rate > 0 ? rate.toFixed(2) : "0.00";
    } else {
      data.mql_rate = "0.00";
    }

    const clientsWeb = parseNumber(data.clients_web || "");
    if (leads > 0) {
      const sqlRate = (clientsWeb / leads) * 100;
      data.sql_rate = sqlRate > 0 ? sqlRate.toFixed(2) : "0.00";
    } else {
      data.sql_rate = "0.00";
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      onChangeRef.current?.(next);
      return next;
    });
  };

  const handleDerivedOnBlur = () => {
    setFormData((prev) => {
      const next = { ...prev };
      computeDerivedValues(next);
      onChangeRef.current?.(next);
      return next;
    });
  };

  const handleBenchmarkSelect = (bench: BenchmarkOption) => {
    setFormData((prev) => {
      const next = { ...prev, cac_ltv_benchmark: bench.ratio.toFixed(2) };
      onChangeRef.current?.(next);
      return next;
    });
  };

  const handleEnterNavigation = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>("input:not([type=hidden]):not([disabled])"));
    const currentIndex = inputs.findIndex((el) => el === event.currentTarget);
    if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
      inputs[currentIndex + 1].focus();
    }
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

    const selectedBenchmark =
      BENCHMARK_NICHES.find((bench) => bench.ratio === parseNumber(formData.cac_ltv_benchmark || "")) ||
      BENCHMARK_NICHES[0];

    return (
      <div key={metric.key} className="space-y-1.5">
        <Label htmlFor={`metric-${metric.key}`} className="text-xs font-medium text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>{metric.label}</span>
            {metric.suffix && <span className="text-muted-foreground/60">({metric.suffix})</span>}
            {metric.prefix && <span className="text-muted-foreground/60">({metric.prefix})</span>}
            {DERIVED_METRIC_TIPS[metric.key] && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full text-orange-500 hover:text-orange-400"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-[220px] text-[11px] leading-relaxed border border-orange-500/60"
                >
                  {DERIVED_METRIC_TIPS[metric.key]}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </Label>
        <Input
          id={`metric-${metric.key}`}
          type="number"
          min={min}
          step={step}
          placeholder={metric.placeholder || "0"}
          value={value}
          onChange={(e) => handleChange(metric.key, e.target.value)}
          onBlur={
            channel === "google" && DERIVED_ON_BLUR_METRICS.has(metric.key)
              ? handleDerivedOnBlur
              : undefined
          }
          onKeyDown={handleEnterNavigation}
          className="h-9 text-sm"
        />
        {metric.key === "cac_ltv_benchmark" && (
          <div className="mt-1 flex flex-col gap-1 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBenchmarkDialogOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-muted-foreground/40 px-3 py-0.5 text-[10px] font-semibold text-primary transition hover:border-primary"
              >
                <Binoculars className="h-3 w-3" />
                Ver lista
              </button>
              <span className="text-[11px] text-muted-foreground/80">{selectedBenchmark.display}</span>
            </div>
            <p className="text-[10px] text-muted-foreground/70">Cada card mostra o benchmark ideal do nicho escolhido.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DialogFatorLtv
        open={benchmarkDialogOpen}
        onOpenChange={setBenchmarkDialogOpen}
        onSelect={(bench) => {
          handleBenchmarkSelect(bench);
          setBenchmarkDialogOpen(false);
        }}
      />
      <div ref={formRef} className="bg-card border rounded-lg p-4 sm:p-6 space-y-4">
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
    </>
  );
}
