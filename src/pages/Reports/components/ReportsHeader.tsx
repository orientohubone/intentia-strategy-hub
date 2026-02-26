import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ReportsHeaderProps {
  onGenerateConsolidated: () => void;
}

export function ReportsHeader({ onGenerateConsolidated }: ReportsHeaderProps) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/[0.07] to-orange-500/[0.05] p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Central de relatórios e análises geradas pela plataforma
          </p>
        </div>
        <Button className="gap-2 shadow-sm" onClick={onGenerateConsolidated}>
          <Download className="h-4 w-4" />
          Gerar Relatório Consolidado
        </Button>
      </div>
    </div>
  );
}
