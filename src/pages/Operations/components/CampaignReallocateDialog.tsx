import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CHANNEL_LABELS } from "@/lib/operationalTypes";

export interface CampaignLite {
  id: string;
  name: string;
  channel: string;
  project_id: string;
  budget_total: number;
  budget_spent: number;
}

interface Props {
  userId?: string;
  open: boolean;
  source: CampaignLite | null;
  targets: CampaignLite[];
  amount: string;
  targetId: string;
  month: number;
  year: number;
  onChange: (patch: Partial<Pick<Props, "amount" | "targetId">>) => void;
  onClose: () => void;
  onSuccess: (sourceId: string, targetId: string) => void;
}

const fmt = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);

export function CampaignReallocateDialog({ userId, open, source, targets, amount, targetId, month, year, onChange, onClose, onSuccess }: Props) {
  const helper = useMemo(() => (targets.length === 0 ? "Nenhuma campanha ativa estourada (≥100%) neste canal." : ""), [targets.length]);

  const handleTransfer = async () => {
    if (!userId || !source) {
      toast.error("Usuário não autenticado");
      return;
    }
    const amountNum = parseFloat(amount || "0");
    if (!targetId || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Informe valor e destino válidos");
      return;
    }
    const target = targets.find((t) => t.id === targetId);
    if (!target) {
      toast.error("Destino inválido");
      return;
    }
    const sourceRemaining = Math.max(0, (source.budget_total || 0) - (source.budget_spent || 0));
    const targetOverrun = Math.max(0, (target.budget_spent || 0) - (target.budget_total || 0));
    if (targetOverrun <= 0) {
      toast.error("A campanha destino não está estourada");
      return;
    }
    const valueToUse = Math.min(amountNum, sourceRemaining, targetOverrun);
    if (valueToUse <= 0) {
      toast.error("Saldo insuficiente");
      return;
    }

    try {
      await Promise.all([
        (supabase as any)
          .from("campaigns")
          .update({ budget_spent: Number(source.budget_spent || 0) + valueToUse })
          .eq("id", source.id)
          .eq("user_id", userId),
        (supabase as any)
          .from("campaigns")
          .update({ budget_spent: Math.max(0, Number(target.budget_spent || 0) - valueToUse) })
          .eq("id", target.id)
          .eq("user_id", userId),
      ]);

      toast.success("Saldo reaproveitado");
      onSuccess(source.id, target.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao transferir: " + (err?.message || ""));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reaproveitar saldo</DialogTitle>
          {source && <p className="text-sm text-muted-foreground">{source.name} · Saldo: {fmt(Math.max(0, (source.budget_total || 0) - (source.budget_spent || 0)))}</p>}
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Campanha estourada (≥100%)</label>
            <Select value={targetId} onValueChange={(val) => onChange({ targetId: val })} disabled={targets.length === 0}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder={targets.length === 0 ? "Nenhuma campanha estourada" : "Selecione"} />
              </SelectTrigger>
              <SelectContent>
                {targets.map((t) => {
                  const pacing = t.budget_total > 0 ? Math.round((t.budget_spent / t.budget_total) * 100) : 0;
                  return (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({pacing}% · {fmt(t.budget_total)})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {helper && <p className="text-xs text-amber-600">{helper}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Valor a transferir</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => onChange({ amount: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button disabled={targets.length === 0 || !targetId || parseFloat(amount || "0") <= 0} onClick={handleTransfer}>
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
