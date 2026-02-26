import { useState } from "react";
import {
  ChevronDown,
  Expand,
  ZoomIn,
  ZoomOut,
  Minimize2,
  ArrowDown,
  ArrowRight,
  LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function InfoTip({ children, tip }: { children: React.ReactNode; tip?: string }) {
  if (!tip) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-[260px] text-[11px] leading-relaxed">
          {tip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function FlowNode({
  icon: Icon,
  label,
  sublabel,
  color = "text-foreground/80",
  bg = "bg-muted",
  border = "border-border",
  size = "normal",
  pulse = false,
  tooltip,
}: {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  color?: string;
  bg?: string;
  border?: string;
  size?: "small" | "normal" | "large";
  pulse?: boolean;
  tooltip?: string;
}) {
  const sizeClasses = {
    small: "px-3 py-2",
    normal: "px-4 py-3",
    large: "px-5 py-4",
  };
  const iconSize = {
    small: "h-3.5 w-3.5",
    normal: "h-4 w-4",
    large: "h-5 w-5",
  };

  const node = (
    <div
      className={`${bg} border ${border} rounded-xl ${sizeClasses[size]} flex items-center gap-3 relative ${
        pulse ? "animate-pulse" : ""
      } ${tooltip ? "cursor-help" : ""}`}
    >
      <Icon className={`${iconSize[size]} ${color} flex-shrink-0`} />
      <div className="min-w-0">
        <p className={`text-xs font-medium ${color}`}>{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground truncate">{sublabel}</p>}
      </div>
    </div>
  );

  return <InfoTip tip={tooltip}>{node}</InfoTip>;
}

export function ArrowConnector({ direction = "right", label }: { direction?: "right" | "down"; label?: string }) {
  if (direction === "down") {
    return (
      <div className="flex flex-col items-center gap-0.5 py-1">
        <div className="w-px h-4 bg-gradient-to-b from-border to-muted-foreground/50" />
        {label && <span className="text-[9px] text-muted-foreground px-2">{label}</span>}
        <ArrowDown className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 px-1">
      <div className="h-px w-4 bg-gradient-to-r from-border to-muted-foreground/50" />
      {label && <span className="text-[9px] text-muted-foreground whitespace-nowrap">{label}</span>}
      <ArrowRight className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}

export function DottedLine({ direction = "down" }: { direction?: "right" | "down" }) {
  if (direction === "down") {
    return <div className="w-px h-6 border-l border-dashed border-border mx-auto" />;
  }
  return <div className="h-px w-6 border-t border-dashed border-border my-auto" />;
}

export function FlowBox({
  title,
  titleColor = "text-foreground/80",
  borderColor = "border-border",
  bgColor = "bg-card",
  children,
  badge,
  defaultOpen = false,
}: {
  title: string;
  titleColor?: string;
  borderColor?: string;
  bgColor?: string;
  children: React.ReactNode;
  badge?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const content = (
    <div className="space-y-3" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top left", width: `${10000 / zoom}%` }}>
      {children}
    </div>
  );

  return (
    <>
      <div className={`${bgColor} border ${borderColor} rounded-2xl overflow-hidden`}>
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity flex-1 min-w-0"
          >
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${titleColor} truncate`}>{title}</p>
            {badge && (
              <Badge className="text-[9px] bg-muted text-muted-foreground border-border flex-shrink-0">{badge}</Badge>
            )}
          </button>
          {isOpen && (
            <button
              onClick={() => { setIsFullscreen(true); setZoom(100); }}
              className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              title="Expandir em tela cheia"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {isOpen && (
          <div className="px-4 pb-4 space-y-3">
            {children}
          </div>
        )}
      </div>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none p-0 overflow-hidden border-0 bg-background">
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-background border-b border-border">
            <div className="flex items-center gap-2">
              <p className={`text-sm font-semibold uppercase tracking-wider ${titleColor}`}>{title}</p>
              {badge && (
                <Badge className="text-[10px] bg-muted text-muted-foreground border-border">{badge}</Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                disabled={zoom <= 50}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Diminuir zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-muted-foreground font-mono w-10 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                disabled={zoom >= 200}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Aumentar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <div className="w-px h-4 bg-border mx-1" />
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                title="Fechar tela cheia"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="overflow-auto flex-1 p-6" style={{ height: "calc(100vh - 52px)" }}>
            {content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
