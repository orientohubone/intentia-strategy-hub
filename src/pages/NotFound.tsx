import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SEO } from "@/components/SEO";
import { ForceLightMode } from "@/components/ForceLightMode";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, MapPin } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <ForceLightMode>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <SEO title="Página não encontrada" noindex />

        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          {/* 404 number */}
          <div className="relative mb-6">
            <span className="text-[160px] sm:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-primary/20 to-primary/5 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                <MapPin className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="text-center max-w-md mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Página não encontrada
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              A página <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-primary">{location.pathname}</code> não existe ou foi movida.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Ir para o Início
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

          {/* Helpful links */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Projetos", href: "/projects" },
              { label: "Ajuda", href: "/help" },
              { label: "Contato", href: "/contato" },
            ].map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Footer brand */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span className="text-sm font-semibold text-muted-foreground/40">
              intentia<span className="text-primary/40">.</span>
            </span>
          </div>
        </div>
      </div>
    </ForceLightMode>
  );
};

export default NotFound;
