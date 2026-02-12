import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { ForceLightMode } from "@/components/ForceLightMode";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rss, ShieldCheck, Server, Lock, Globe } from "lucide-react";

export default function StatusRssFallback() {
  const navigate = useNavigate();

  return (
    <ForceLightMode>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <SEO title="RSS Feed — Infraestrutura" noindex />

        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center sm:justify-center min-h-screen px-4 py-24 sm:py-16">
          {/* Icon */}
          <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8">
            <Rss className="h-10 w-10 text-primary" />
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 text-center">
            RSS Feed — Status da Plataforma
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base text-center max-w-lg mb-10 leading-relaxed">
            Este endpoint fornece o feed RSS de incidentes e manutenções da plataforma Intentia.
            Ele é servido por nossa infraestrutura segura e não está acessível diretamente pelo navegador.
          </p>

          {/* Security info cards */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl w-full mb-10">
            {[
              {
                icon: ShieldCheck,
                title: "Proxy Seguro",
                desc: "O feed é servido via proxy reverso que oculta a infraestrutura interna do banco de dados.",
              },
              {
                icon: Server,
                title: "Edge Functions",
                desc: "Processado por Supabase Edge Functions com autenticação e rate limiting integrados.",
              },
              {
                icon: Lock,
                title: "Dados Protegidos",
                desc: "Row Level Security (RLS) garante que apenas dados públicos de status sejam expostos no feed.",
              },
              {
                icon: Globe,
                title: "Disponibilidade",
                desc: "O feed está disponível em produção para leitores RSS. Use a URL em seu leitor favorito.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-4 flex gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/status")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Ver Status da Plataforma
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>

          {/* Footer brand */}
          <div className="mt-16 sm:mt-12 sm:absolute sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2">
            <span className="text-sm font-semibold text-muted-foreground/40">
              intentia<span className="text-primary/40">.</span>
            </span>
          </div>
        </div>
      </div>
    </ForceLightMode>
  );
}
