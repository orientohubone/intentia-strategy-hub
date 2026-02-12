import { Button } from "@/components/ui/button";
import {
  Megaphone,
  Plus,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import type { CampaignGroup } from "../types";

interface OperationsHeaderProps {
  groupedCampaigns: CampaignGroup[];
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onNewCampaign: () => void;
}

export function OperationsHeader({
  groupedCampaigns,
  onExpandAll,
  onCollapseAll,
  onNewCampaign,
}: OperationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          Operações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie campanhas, acompanhe métricas e controle budgets
        </p>
      </div>
      <div className="flex items-center gap-2">
        {groupedCampaigns.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={onExpandAll} title="Expandir todos">
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onCollapseAll} title="Recolher todos">
              <ChevronsDownUp className="h-4 w-4" />
            </Button>
          </>
        )}
        <Button onClick={onNewCampaign} className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Campanha</span>
        </Button>
      </div>
    </div>
  );
}
