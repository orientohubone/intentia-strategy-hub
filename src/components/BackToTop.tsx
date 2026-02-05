import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <Button
        onClick={scrollToTop}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-300 hover:scale-105"
        aria-label="Voltar ao topo"
      >
        <ChevronUp className="h-4 w-4" />
        <span className="text-sm font-medium">Voltar ao topo</span>
      </Button>
    </div>
  );
}
