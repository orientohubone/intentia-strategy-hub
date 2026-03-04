import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle2,
  Archive,
  BarChart3,
  Target,
  DollarSign,
  Calendar,
  GitCompareArrows,
  Sparkles,
} from "lucide-react";
import {
  type CampaignStatus,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  CAMPAIGN_STATUS_FLOW,
} from "@/lib/operationalTypes";
import type { PerformanceAiResult } from "@/lib/aiAnalyzer";
import { StatusChangeDateDialog } from "./StatusChangeDateDialog";
import type { Campaign } from "../types";

type ReallocateHighlight = { type: "source" | "target" } | null;

interface CampaignRowProps {
  campaign: Campaign;
  isExpanded: boolean;
  hasAiResult: boolean;
  onStatusChange: (id: string, status: CampaignStatus, date?: string) => void;
  onToggleExpand: (id: string) => void;
  onShowAiDialog: (id: string) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  onReallocate?: (campaign: Campaign, remainingBudget: number) => void;
  highlight?: ReallocateHighlight;
  children?: React.ReactNode;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (date: string | null) => {
  if (!date) return "—";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
};

const getStatusActions = (campaign: Campaign) => {
  const nextStatuses = CAMPAIGN_STATUS_FLOW[campaign.status] || [];
  const icons: Record<CampaignStatus, React.ElementType> = {
    draft: Edit2,
    active: Play,
    paused: Pause,
    completed: CheckCircle2,
    archived: Archive,
  };
  return nextStatuses.map((status) => ({
    status,
    label: CAMPAIGN_STATUS_LABELS[status],
    Icon: icons[status],
  }));
};

export function CampaignRow({
  campaign,
  isExpanded,
  hasAiResult,
  onStatusChange,
  onToggleExpand,
  onShowAiDialog,
  onEdit,
  onDelete,
  onReallocate,
  highlight,
  children,
}: CampaignRowProps) {
  const statusActions = getStatusActions(campaign);
  const budgetPacing = campaign.budget_total > 0
    ? Math.round((campaign.budget_spent / campaign.budget_total) * 100)
    : 0;
  const remainingBudget = Math.max(0, (campaign.budget_total || 0) - (campaign.budget_spent || 0));

  // Dialog state for status changes that need a platform date
  const [pendingStatus, setPendingStatus] = useState<{
    status: CampaignStatus;
    dateField: "start_date" | "end_date";
  } | null>(null);

  const handleStatusClick = (status: CampaignStatus) => {
    // "active" without existing start_date → ask for start date
    if (status === "active" && !campaign.start_date) {
      setPendingStatus({ status, dateField: "start_date" });
      return;
    }
    // "completed" → ask for end date
    if (status === "completed") {
      setPendingStatus({ status, dateField: "end_date" });
      return;
    }
    // Other transitions (paused, archived, draft) → proceed directly
    onStatusChange(campaign.id, status);
  };

  return (
    <div className={`
      relative group transition-all duration-300
      ${isExpanded
        ? "bg-card border-primary/30 shadow-md ring-1 ring-primary/20"
        : "bg-card/50 hover:bg-card border-border hover:border-primary/30 hover:shadow-sm"
      }
      border rounded-xl overflow-hidden flex flex-col h-full
    `}>
      {/* Card Header: Channel & Actions */}
      <div className="p-3 border-b bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={`text-[10px] font-bold uppercase tracking-wider ${CHANNEL_COLORS[campaign.channel]}`}>
            {CHANNEL_LABELS[campaign.channel]}
          </Badge>
          <Badge variant="outline" className={`text-[10px] font-medium border-border flex items-center gap-1.5 px-2 py-0.5 h-5 bg-background`}>
            <div className={`h-1.5 w-1.5 rounded-full ${campaign.status === "active" ? "bg-emerald-500 animate-pulse" :
              campaign.status === "paused" ? "bg-amber-500" :
                campaign.status === "completed" ? "bg-blue-500" :
                  campaign.status === "archived" ? "bg-red-500" : "bg-slate-400"
              }`} />
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </Badge>
        </div>

        <div className="flex items-center gap-0.5">
          {onReallocate && campaign.status === "completed" && remainingBudget > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-amber-600 hover:bg-amber-500/10"
              title="Reaproveitar saldo"
              onClick={() => onReallocate(campaign, remainingBudget)}
            >
              <GitCompareArrows className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Editar"
            onClick={() => onEdit(campaign)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="h-7 w-7 inline-flex items-center justify-center rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                title="Excluir"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
                <AlertDialogDescription>
                  A campanha "{campaign.name}" será movida para a lixeira.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(campaign.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Card Body: Info */}
      <div className="p-4 flex-1 space-y-3">
        <div className="space-y-1">
          <h4 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]">
            {campaign.name}
          </h4>
          {campaign.objective && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" />
              <span className="truncate">{campaign.objective}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(campaign.start_date)}
            </span>
            {campaign.budget_total > 0 && (
              <span className="font-medium">
                {formatCurrency(campaign.budget_total)}
              </span>
            )}
          </div>

          {highlight?.type === "source" && (
            <Badge variant="outline" className="w-fit text-[9px] text-amber-600 bg-amber-500/10 border-amber-500/30 font-bold uppercase py-0 px-1.5 h-4">
              Saldo reaproveitado
            </Badge>
          )}
          {highlight?.type === "target" && (
            <Badge variant="outline" className="w-fit text-[9px] text-emerald-700 bg-emerald-500/10 border-emerald-500/30 font-bold uppercase py-0 px-1.5 h-4 animate-pulse">
              Reforço recebido
            </Badge>
          )}

          {campaign.budget_total > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${budgetPacing >= 90 ? "bg-red-500" : budgetPacing >= 70 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  style={{ width: `${Math.min(budgetPacing, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px]">
                <span className={budgetPacing >= 90 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                  {budgetPacing}% consumido
                </span>
                <span className="text-muted-foreground">
                  Restante: {formatCurrency(remainingBudget)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Quick Actions & Status Flow */}
      <div className="px-3 py-2 border-t bg-muted/10 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {statusActions.map(({ status, label, Icon }) => (
            <Button
              key={status}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              title={label}
              onClick={() => handleStatusClick(status)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {hasAiResult && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-500 hover:bg-purple-500/10"
              title="Análise IA"
              onClick={() => onShowAiDialog(campaign.id)}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant={isExpanded ? "default" : "outline"}
            size="sm"
            className={`h-8 px-2 gap-1.5 text-[10px] uppercase font-bold tracking-wider`}
            onClick={() => onToggleExpand(campaign.id)}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            {isExpanded ? "Fechar" : "Métricas"}
          </Button>
        </div>
      </div>

      {/* Expanded content (metrics) */}
      {isExpanded && (
        <div className="p-4 border-t bg-muted/5 animate-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}

      {/* Date dialog for status changes */}
      {pendingStatus && (
        <StatusChangeDateDialog
          open={!!pendingStatus}
          campaignName={campaign.name}
          targetStatus={pendingStatus.status}
          dateField={pendingStatus.dateField}
          onConfirm={(status, date) => {
            onStatusChange(campaign.id, status, date);
            setPendingStatus(null);
          }}
          onCancel={() => setPendingStatus(null)}
        />
      )}
    </div>
  );
}
