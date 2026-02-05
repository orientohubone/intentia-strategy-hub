import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function BackToHomeButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/")}
      variant="ghost"
      size="icon"
      className="fixed top-8 left-8 z-40 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent transition-all duration-300 opacity-60 hover:opacity-100 hover:scale-110"
      aria-label="Voltar para página inicial"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
