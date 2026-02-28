import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles } from "lucide-react";

const apps = [
  {
    name: "Studio Intentia",
    description:
      "Crie carrosséis, thumbnails, frameworks e showcases — tudo em um único estúdio.",
    url: "https://studio.intentia.com.br/login",
    badge: "Novo",
    icon: "https://studio.intentia.com.br/favicon.png",
  },
];

export default function AppStore() {
  return (
    <DashboardLayout>
      <SEO title="Loja de Apps" path="/apps" noindex />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Loja de Apps</h1>
              <p className="text-sm text-muted-foreground">
                Explore apps que ampliam o Intentia com fluxos prontos e experiências visuais.
              </p>
            </div>
          </div>
        </div>

        {/* Apps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <div
              key={app.name}
              className="rounded-2xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border bg-white/70 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                  {app.icon ? (
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">{app.name[0]}</span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold leading-tight">{app.name}</h3>
                    {app.badge && (
                      <Badge className="text-[11px] px-2.5 py-1 bg-primary text-primary-foreground border border-primary/60 shadow-sm">
                        {app.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {app.description}
                  </p>
                </div>
              </div>

              <Button
                variant="hero"
                className="w-full justify-center gap-2"
                onClick={() => window.open(app.url, "_blank", "noopener,noreferrer")}
              >
                Abrir aplicativo
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
