import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Wallet,
  BarChart3,
  Calendar,
  X,
  Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { notifyBudgetAllocated } from "@/lib/notificationService";
import { toast } from "sonner";
import {
  type CampaignChannel,
  type BudgetAllocationRow,
  type BudgetProjectSummary,
  type BudgetPacingStatus,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  BUDGET_PACING_CONFIG,
  MONTH_LABELS,
  getBudgetPacingStatus,
  computeBudgetProjection,
  getExpectedPacing,
  buildBudgetProjectSummary,
} from "@/lib/operationalTypes";

interface BudgetManagementProps {
  userId: string;
  projectId: string;
  projectName: string;
  onSync?: () => void;
}

const CHANNELS: CampaignChannel[] = ["google", "meta", "linkedin", "tiktok"];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export default function BudgetManagement({ userId, projectId, projectName, onSync }: BudgetManagementProps) {
  const [allocations, setAllocations] = useState<BudgetAllocationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Form state
  const now = new Date();
  const [formChannel, setFormChannel] = useState<string>("");
  const [formMonth, setFormMonth] = useState<string>(String(now.getMonth() + 1));
  const [formYear, setFormYear] = useState<string>(String(now.getFullYear()));
  const [formBudget, setFormBudget] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAllocations();
  }, [userId, projectId]);

  const loadAllocations = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("budget_allocations")
        .select("*, projects!inner(name)")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      if (error) throw error;

      const mapped: BudgetAllocationRow[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        project_id: row.project_id,
        project_name: row.projects?.name || projectName,
        channel: row.channel as CampaignChannel,
        month: row.month,
        year: row.year,
        planned_budget: Number(row.planned_budget) || 0,
        actual_spent: Number(row.actual_spent) || 0,
        pacing_percent: row.planned_budget > 0 ? Math.round((row.actual_spent / row.planned_budget) * 100 * 10) / 10 : 0,
        remaining: (Number(row.planned_budget) || 0) - (Number(row.actual_spent) || 0),
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      setAllocations(mapped);
    } catch (error: any) {
      console.error("Error loading budget allocations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formChannel || !formBudget || !formMonth || !formYear) {
      toast.error("Preencha todos os campos");
      return;
    }

    const budget = parseFloat(formBudget);
    if (isNaN(budget) || budget <= 0) {
      toast.error("Budget deve ser maior que zero");
      return;
    }

    setSaving(true);
    try {
      const month = parseInt(formMonth);
      const year = parseInt(formYear);

      // Check if allocation already exists (upsert)
      const { data: existing } = await (supabase as any)
        .from("budget_allocations")
        .select("id")
        .eq("user_id", userId)
        .eq("project_id", projectId)
        .eq("channel", formChannel)
        .eq("month", month)
        .eq("year", year)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase as any)
          .from("budget_allocations")
          .update({ planned_budget: budget })
          .eq("id", existing.id);
        if (error) throw error;
        toast.success("Budget atualizado com sucesso");
      } else {
        const { error } = await (supabase as any)
          .from("budget_allocations")
          .insert({
            user_id: userId,
            project_id: projectId,
            channel: formChannel,
            month,
            year,
            planned_budget: budget,
            actual_spent: 0,
          });
        if (error) throw error;
        toast.success("Budget alocado com sucesso");
        notifyBudgetAllocated(userId, formChannel, projectName);
      }

      resetForm();
      loadAllocations();
    } catch (error: any) {
      console.error("Error saving budget:", error);
      toast.error("Erro ao salvar budget: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await (supabase as any)
        .from("budget_allocations")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
      toast.success("Alocação removida");
      loadAllocations();
    } catch (error: any) {
      console.error("Error deleting allocation:", error);
      toast.error("Erro ao remover alocação");
    }
  };

  const handleSyncSpent = async () => {
    try {
      const { error } = await (supabase as any).rpc("sync_all_budgets", { p_user_id: userId });
      if (error) throw error;
      toast.success("Gastos sincronizados com métricas reais");
      loadAllocations();
      onSync?.();
    } catch (error: any) {
      console.error("Error syncing budgets:", error);
      toast.error("Erro ao sincronizar: " + error.message);
    }
  };

  const resetForm = () => {
    setFormChannel("");
    setFormBudget("");
    setShowForm(false);
  };

  // Group allocations by month/year
  const summaries = buildBudgetProjectSummary(allocations);
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const currentSummary = summaries.find((s) => s.month === currentMonth && s.year === currentYear);
  const expectedPacing = getExpectedPacing();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-left"
        >
          <Wallet className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Gestão de Budget</span>
          {currentSummary && (
            <Badge
              className={`text-[10px] ${
                BUDGET_PACING_CONFIG[getBudgetPacingStatus(currentSummary.overall_pacing)].bgColor
              } ${
                BUDGET_PACING_CONFIG[getBudgetPacingStatus(currentSummary.overall_pacing)].color
              }`}
            >
              {currentSummary.overall_pacing}% gasto
            </Badge>
          )}
          {allocations.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {allocations.length} alocaç{allocations.length === 1 ? "ão" : "ões"}
            </Badge>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <div className="flex items-center gap-1.5">
          {allocations.length > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={handleSyncSpent} title="Sincronizar gastos com métricas">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Sincronizar</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => { setShowForm(true); setExpanded(true); }}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden sm:inline">Alocar Budget</span>
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3">
          {/* Form */}
          {showForm && (
            <div className="bg-card border rounded-lg p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Alocar Budget</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetForm}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Canal *</Label>
                  <Select value={formChannel} onValueChange={setFormChannel}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.map((ch) => (
                        <SelectItem key={ch} value={ch}>{CHANNEL_LABELS[ch]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Mês *</Label>
                  <Select value={formMonth} onValueChange={setFormMonth}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MONTH_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ano *</Label>
                  <Select value={formYear} onValueChange={setFormYear}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Budget (R$) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={resetForm}>Cancelar</Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !formChannel || !formBudget}
                  className="gap-1.5"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          )}

          {/* Current Month Summary */}
          {currentSummary && (
            <CurrentMonthCard summary={currentSummary} expectedPacing={expectedPacing} />
          )}

          {/* All Allocations by Month */}
          {summaries.map((summary) => {
            const isCurrent = summary.month === currentMonth && summary.year === currentYear;
            if (isCurrent) return null; // Already shown above

            return (
              <MonthCard
                key={`${summary.month}-${summary.year}`}
                summary={summary}
                onDelete={handleDelete}
              />
            );
          })}

          {/* Empty state */}
          {allocations.length === 0 && !showForm && (
            <div className="text-center py-4">
              <Wallet className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Nenhum budget alocado para este projeto.
              </p>
              <p className="text-xs text-muted-foreground">
                Clique em "Alocar Budget" para definir o budget mensal por canal.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Sub-components ---

function CurrentMonthCard({ summary, expectedPacing }: { summary: BudgetProjectSummary; expectedPacing: number }) {
  const status = getBudgetPacingStatus(summary.overall_pacing);
  const config = BUDGET_PACING_CONFIG[status];
  const projection = computeBudgetProjection(summary.total_spent, summary.total_planned);

  return (
    <div className={`border rounded-lg overflow-hidden ${config.bgColor}`}>
      {/* Header */}
      <div className="px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              {MONTH_LABELS[summary.month]} {summary.year}
            </span>
            <Badge className={`text-[10px] ${config.bgColor} ${config.color} border-0`}>
              {config.label}
            </Badge>
          </div>
          <span className="text-sm font-bold">{formatCurrency(summary.total_planned)}</span>
        </div>

        {/* Overall pacing bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              {formatCurrency(summary.total_spent)} de {formatCurrency(summary.total_planned)}
            </span>
            <span className={`font-medium ${config.color}`}>{summary.overall_pacing}%</span>
          </div>
          <div className="h-2 rounded-full bg-background/60 overflow-hidden relative">
            {/* Expected pacing marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-foreground/30 z-10"
              style={{ left: `${Math.min(expectedPacing, 100)}%` }}
              title={`Esperado: ${expectedPacing}%`}
            />
            <div
              className={`h-full rounded-full transition-all ${config.barColor}`}
              style={{ width: `${Math.min(summary.overall_pacing, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>Esperado: ~{expectedPacing}%</span>
            <span>Restante: {formatCurrency(summary.total_remaining)}</span>
          </div>
        </div>

        {/* Projection */}
        {projection.projectedSpend > 0 && (
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            {projection.willOverspend ? (
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            )}
            <span className={projection.willOverspend ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground"}>
              Projeção: {formatCurrency(projection.projectedSpend)} ({projection.projectedPacing}%)
              {projection.willOverspend && " — Risco de estouro"}
            </span>
          </div>
        )}
      </div>

      {/* Channel breakdown */}
      <div className="border-t divide-y">
        {summary.channels.map((ch) => (
          <ChannelPacingRow key={ch.id} allocation={ch} />
        ))}
      </div>
    </div>
  );
}

function MonthCard({ summary, onDelete }: { summary: BudgetProjectSummary; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const status = getBudgetPacingStatus(summary.overall_pacing);
  const config = BUDGET_PACING_CONFIG[status];

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs sm:text-sm font-medium">
            {MONTH_LABELS[summary.month]} {summary.year}
          </span>
          <Badge variant="secondary" className="text-[10px]">
            {summary.channels.length} cana{summary.channels.length === 1 ? "l" : "is"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{formatCurrency(summary.total_planned)}</span>
          <Badge className={`text-[10px] ${config.bgColor} ${config.color} border-0`}>
            {summary.overall_pacing}%
          </Badge>
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t divide-y">
          {summary.channels.map((ch) => (
            <div key={ch.id} className="flex items-center gap-2 px-3 py-2 sm:px-4">
              <div className="flex-1">
                <ChannelPacingRow allocation={ch} />
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive flex-shrink-0">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover alocação?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A alocação de {formatCurrency(ch.planned_budget)} para {CHANNEL_LABELS[ch.channel]} em {MONTH_LABELS[ch.month]}/{ch.year} será removida.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(ch.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChannelPacingRow({ allocation }: { allocation: BudgetAllocationRow }) {
  const status = getBudgetPacingStatus(allocation.pacing_percent);
  const config = BUDGET_PACING_CONFIG[status];

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-2.5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <Badge className={`text-[10px] px-1.5 py-0 ${CHANNEL_COLORS[allocation.channel]}`}>
            {CHANNEL_LABELS[allocation.channel]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground">
            {formatCurrency(allocation.actual_spent)}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{formatCurrency(allocation.planned_budget)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${config.barColor}`}
            style={{ width: `${Math.min(allocation.pacing_percent, 100)}%` }}
          />
        </div>
        <span className={`text-[10px] font-medium min-w-[32px] text-right ${config.color}`}>
          {allocation.pacing_percent}%
        </span>
      </div>
    </div>
  );
}