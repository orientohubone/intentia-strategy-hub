import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

export function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => navigate("/")}
            size="icon"
            variant="ghost"
            className="fixed top-20 left-4 z-40 h-8 w-8 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 hover:bg-accent hover:border-accent transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-110"
            aria-label="Voltar para página inicial"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          <p>Voltar para home</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
