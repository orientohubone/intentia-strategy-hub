import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function TiaCTA() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Pronto para conversar com a <span className="text-primary">Tia</span>?
          </h2>

          <p className="text-muted-foreground text-lg mb-4 max-w-lg mx-auto">
            Crie sua conta gratuita e comece a usar a assistente que entende seu negócio.
            Disponível em todos os planos.
          </p>

          <p className="text-sm text-muted-foreground/60 mb-8">
            Plano Starter gratuito inclui assistente guiada + Tia com fallback inteligente.
            Configure sua API key do Gemini para respostas com IA completa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25"
              onClick={() => navigate("/auth")}
            >
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 text-base font-semibold"
              onClick={() => navigate("/precos")}
            >
              Ver Planos
            </Button>
          </div>

          <p className="text-xs text-muted-foreground/40 mt-6">
            Sem cartão de crédito. Sem compromisso. Comece em 30 segundos.
          </p>
        </div>
      </div>
    </section>
  );
}
