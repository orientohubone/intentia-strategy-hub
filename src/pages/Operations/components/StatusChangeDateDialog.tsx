import { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    type CampaignStatus,
    CAMPAIGN_STATUS_LABELS,
} from "@/lib/operationalTypes";

interface StatusChangeDateDialogProps {
    open: boolean;
    campaignName: string;
    targetStatus: CampaignStatus;
    /** Which date field this status change sets */
    dateField: "start_date" | "end_date";
    onConfirm: (status: CampaignStatus, date: string) => void;
    onCancel: () => void;
}

const DATE_FIELD_LABELS: Record<string, string> = {
    start_date: "Data de Início (na plataforma)",
    end_date: "Data de Encerramento (na plataforma)",
};

export function StatusChangeDateDialog({
    open,
    campaignName,
    targetStatus,
    dateField,
    onConfirm,
    onCancel,
}: StatusChangeDateDialogProps) {
    const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

    // Reset date to today whenever the dialog opens
    useEffect(() => {
        if (open) {
            setDate(new Date().toISOString().split("T")[0]);
        }
    }, [open]);

    return (
        <AlertDialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
            <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Alterar para {CAMPAIGN_STATUS_LABELS[targetStatus]}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Informe a data real da plataforma do canal para a campanha{" "}
                        <span className="font-semibold text-foreground">"{campaignName}"</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2 py-2">
                    <Label htmlFor="status-change-date">{DATE_FIELD_LABELS[dateField]}</Label>
                    <Input
                        id="status-change-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full"
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => onConfirm(targetStatus, date)}
                        disabled={!date}
                    >
                        Confirmar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
