import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function BackToHomeButton() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      // Show when near top or scrolling up
      if (currentY < 80 || currentY < lastScrollY.current) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Button
      onClick={() => navigate("/")}
      variant="ghost"
      size="icon"
      className={`fixed top-[4.5rem] sm:top-8 left-4 sm:left-8 z-40 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent transition-all duration-300 hover:scale-110 ${
        visible ? "opacity-60 hover:opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
      }`}
      aria-label="Voltar para página inicial"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
