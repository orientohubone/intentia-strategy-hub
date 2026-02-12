import {
  Megaphone,
  Play,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import type { OperationalStats } from "../types";

interface OperationsStatsProps {
  stats: OperationalStats;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function OperationsStats({ stats }: OperationsStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-card border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold">{stats.total_campaigns}</p>
        <p className="text-xs text-muted-foreground">
          {stats.active_campaigns} ativa{stats.active_campaigns !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="bg-card border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1">
          <Play className="h-4 w-4 text-green-500" />
          <span className="text-xs text-muted-foreground">Ativas</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active_campaigns}</p>
        <p className="text-xs text-muted-foreground">
          {stats.paused_campaigns} pausada{stats.paused_campaigns !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="bg-card border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="h-4 w-4 text-blue-500" />
          <span className="text-xs text-muted-foreground">Budget Total</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold">{formatCurrency(stats.total_budget)}</p>
        <p className="text-xs text-muted-foreground">
          {stats.total_budget > 0
            ? `${Math.round((stats.total_spent / stats.total_budget) * 100)}% gasto`
            : "Sem budget"}
        </p>
      </div>
      <div className="bg-card border rounded-lg p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">Investido</span>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-primary">{formatCurrency(stats.total_spent)}</p>
        <p className="text-xs text-muted-foreground">
          {stats.completed_campaigns} concluída{stats.completed_campaigns !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
