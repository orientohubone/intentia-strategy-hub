import { PropsWithChildren } from "react";

interface BrowserMockupProps {
  url?: string;
  className?: string;
}

export function BrowserMockup({
  url = "https://app.intentia.com.br/seo-monitoring",
  className = "",
  children,
}: PropsWithChildren<BrowserMockupProps>) {
  return (
    <div className={`rounded-2xl border border-border bg-card shadow-xl overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-[11px] text-muted-foreground truncate">
          {url}
        </div>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}

