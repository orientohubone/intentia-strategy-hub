import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Lock, AlertTriangle, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureBlockedScreenProps {
  check: {
    available: boolean;
    status: string;
    message: string;
  };
  pageTitle?: string;
}

export function FeatureBlockedScreen({ check, pageTitle }: FeatureBlockedScreenProps) {
  const navigate = useNavigate();

  const renderContent = () => {
    switch (check.status) {
      case "plan_blocked":
        return (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
              <Crown className="h-8 w-8 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Recurso Exclusivo</h2>
              <p className="text-muted-foreground">
                {check.message || "Este recurso está disponível apenas para planos pagos."}
              </p>
            </div>
            <div className="space-y-3">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full"
                onClick={() => navigate("/checkout")}
              >
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade para Professional
                <Rocket className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Desbloqueie ferramentas avançadas de estratégia e execução</p>
              <p>Campanhas, métricas, automações e relatórios completos</p>
            </div>
          </div>
        );

      case "development":
        return (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center mx-auto">
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Em Desenvolvimento</h2>
              <p className="text-muted-foreground">
                {check.message || "Este recurso está em desenvolvimento e será lançado em breve."}
              </p>
            </div>
            <div className="space-y-3">
              <Badge variant="outline" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Em Breve
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Estamos trabalhando para trazer esta funcionalidade</p>
              <p>Fique de olho nas novidades do roadmap</p>
            </div>
          </div>
        );

      case "maintenance":
        return (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Em Manutenção</h2>
              <p className="text-muted-foreground">
                {check.message || "Este recurso está temporariamente indisponível para melhorias."}
              </p>
            </div>
            <div className="space-y-3">
              <Badge variant="destructive" className="gap-1">
                <Lock className="h-3 w-3" />
                Indisponível
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Estamos realizando melhorias para garantir a melhor experiência</p>
              <p>Volte em breve para usar este recurso</p>
            </div>
          </div>
        );

      case "disabled":
        return (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Recurso Desativado</h2>
              <p className="text-muted-foreground">
                {check.message || "Este recurso foi temporariamente desativado."}
              </p>
            </div>
            <div className="space-y-3">
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                Desativado
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Entre em contato com o suporte para mais informações</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-500/20 to-slate-500/20 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-gray-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Indisponível</h2>
              <p className="text-muted-foreground">
                {check.message || "Este recurso não está disponível no momento."}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {renderContent()}
      </div>
    </div>
  );
}
