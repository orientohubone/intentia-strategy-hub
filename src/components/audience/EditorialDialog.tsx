import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PenSquare, Download, FileText, FolderOpen } from "lucide-react";
import type { EditorialLine } from "@/lib/icpEnricher";
import { exportEditorialToHtml, exportEditorialToPdf } from "@/lib/exportEditorial";

interface EditorialDialogProps {
  title: string;
  lines: EditorialLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: () => void;
  saving?: boolean;
  onLoadSaved?: () => void;
  loadingSaved?: boolean;
  savedPlans?: { id: string; title: string; created_at: string; lines: EditorialLine[]; version?: number | null }[];
  onSelectSaved?: (planId: string) => void;
}

export function EditorialDialog({ title, lines, open, onOpenChange, onSave, saving, onLoadSaved, loadingSaved, savedPlans, onSelectSaved }: EditorialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl max-h-[85vh] overflow-y-auto overflow-x-hidden sidebar-scroll">
        <DialogHeader>
          <div className="flex items-center gap-2 justify-between">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <PenSquare className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-base">Plano de comunicação</DialogTitle>
            <div className="flex items-center gap-2">
              {onLoadSaved && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={onLoadSaved}
                  disabled={loadingSaved}
                >
                  {loadingSaved ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <FolderOpen className="h-3.5 w-3.5" />
                  )}
                  Carregar salvo
                </Button>
              )}
              {onSave && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1 text-xs"
                  onClick={onSave}
                  disabled={lines.length === 0 || saving}
                >
                  {saving ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Salvar plano
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => exportEditorialToHtml(title, lines)}
                disabled={lines.length === 0}
              >
                <FileText className="h-3.5 w-3.5" />
                HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => exportEditorialToPdf(title, lines)}
                disabled={lines.length === 0}
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {savedPlans && savedPlans.length > 0 && (
          <div className="mb-3 space-y-2">
            <p className="text-xs text-muted-foreground">Histórico recente (10 mais recentes)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {savedPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => onSelectSaved?.(plan.id)}
                  className="text-left rounded-lg border border-border bg-card px-3 py-2 hover:border-primary transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{plan.title || "Plano salvo"}</span>
                    {plan.version ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">v{plan.version}</span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(plan.created_at).toLocaleString("pt-BR")}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {lines.length === 0 && (
            <p className="text-sm text-muted-foreground">Nada gerado ainda.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lines.map((line, idx) => (
              <div key={idx} className="border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {line.audienceName && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0">
                      {line.audienceName}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] px-2 py-0">
                    Bloco {idx + 1}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Headline</p>
                  <p className="text-sm font-semibold text-foreground">{line.headline}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Reforço</p>
                  <p className="text-sm text-foreground">{line.message}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">CTA</p>
                  <p className="text-sm text-foreground">{line.cta}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Legenda</p>
                  <p className="text-sm text-foreground leading-relaxed">{line.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
