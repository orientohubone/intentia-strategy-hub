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
import type { Campaign } from "../types";

interface CampaignRowProps {
  campaign: Campaign;
  isExpanded: boolean;
  hasAiResult: boolean;
  onStatusChange: (id: string, status: CampaignStatus) => void;
  onToggleExpand: (id: string) => void;
  onShowAiDialog: (id: string) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
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
  children,
}: CampaignRowProps) {
  const statusActions = getStatusActions(campaign);
  const budgetPacing = campaign.budget_total > 0
    ? Math.round((campaign.budget_spent / campaign.budget_total) * 100)
    : 0;

  return (
    <div className="p-3 sm:p-4 hover:bg-accent/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Campaign Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm sm:text-base truncate">{campaign.name}</h4>
            <Badge className={`text-xs ${CAMPAIGN_STATUS_COLORS[campaign.status]}`}>
              {CAMPAIGN_STATUS_LABELS[campaign.status]}
            </Badge>
            <Badge className={`text-xs ${CHANNEL_COLORS[campaign.channel]}`}>
              {CHANNEL_LABELS[campaign.channel]}
            </Badge>
          </div>
          {campaign.objective && (
            <p className="text-xs text-muted-foreground mt-1 truncate">
              <Target className="h-3 w-3 inline mr-1" />
              {campaign.objective}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
            {campaign.budget_total > 0 && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(campaign.budget_total)}
                {budgetPacing > 0 && (
                  <span className={`ml-1 ${budgetPacing >= 90 ? "text-red-500" : budgetPacing >= 70 ? "text-yellow-500" : "text-green-500"}`}>
                    ({budgetPacing}%)
                  </span>
                )}
              </span>
            )}
            {(campaign.start_date || campaign.end_date) && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(campaign.start_date)}
                {campaign.end_date && ` → ${formatDate(campaign.end_date)}`}
              </span>
            )}
          </div>
          {/* Budget Pacing Bar */}
          {campaign.budget_total > 0 && (
            <div className="mt-2 w-full max-w-xs">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPacing >= 90 ? "bg-red-500" : budgetPacing >= 70 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetPacing, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {statusActions.map(({ status, label, Icon }) => (
            <Button
              key={status}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={label}
              onClick={() => onStatusChange(campaign.id, status)}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${isExpanded ? "text-primary" : ""}`}
            title="Métricas"
            onClick={() => onToggleExpand(campaign.id)}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          {hasAiResult && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-purple-500"
              title="Ver Análise de Performance"
              onClick={() => onShowAiDialog(campaign.id)}
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Editar"
            onClick={() => onEdit(campaign)}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir campanha?</AlertDialogTitle>
                <AlertDialogDescription>
                  A campanha "{campaign.name}" será movida para a lixeira.
                  Esta ação pode ser revertida em até 30 dias.
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

      {/* Expanded content (metrics) */}
      {children}
    </div>
  );
}
