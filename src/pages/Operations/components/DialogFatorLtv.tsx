import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { BenchmarkSnapshot, averageBenchmarkRatio, fallbackBenchmarkSnapshots } from "@/lib/benchmarkData";

export type BenchmarkOption = BenchmarkSnapshot;

export interface DialogFatorLtvProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (bench: BenchmarkOption) => void;
}

function formatDate(value: string | null) {
  if (!value) return "Nunca";
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function DialogFatorLtv({ open, onOpenChange, onSelect }: DialogFatorLtvProps) {
  const snapshots = fallbackBenchmarkSnapshots();
  const weightedAverage = averageBenchmarkRatio(snapshots);
  const lastUpdatedLabel = "N/A";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle>Benchmarks CAC:LTV por nicho</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Selecionar aplica o benchmark ao campo automaticamente. Dados estáticos (fallback).
              </DialogDescription>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
            <span>Média ponderada atual: {weightedAverage.toFixed(2)}</span>
            <span>Última atualização: {lastUpdatedLabel}</span>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3">
          {snapshots.map((bench) => {
            const sourceLabel = typeof bench.source_data?.endpoint === "string" ? bench.source_data.endpoint : "fallback";
            return (
              <button
                key={bench.niche_id}
                onClick={() => onSelect(bench)}
                className={cn(
                  "flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary"
                )}
              >
                <span className="text-sm font-semibold">{bench.label}</span>
                <span className="text-xs text-muted-foreground">{bench.description}</span>
                <span className="text-[11px] text-primary">Sugestão: {bench.display}</span>
                <span className="text-[10px] text-muted-foreground/80">Fonte atual: {sourceLabel}</span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
