import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PenSquare } from "lucide-react";
import type { EditorialLine } from "@/lib/icpEnricher";

interface EditorialDialogProps {
  title: string;
  lines: EditorialLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditorialDialog({ title, lines, open, onOpenChange }: EditorialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <PenSquare className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-base">Plano de comunicação</DialogTitle>
          </div>
        </DialogHeader>

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
