import { useEffect } from "react";

// Ref count para evitar flash ao navegar entre páginas públicas
let activeMounts = 0;
let userTheme: string | null = null;

export function ForceLightMode({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;

    if (activeMounts === 0) {
      // Primeira montagem: salva o tema real do localStorage
      userTheme = localStorage.getItem("theme");
    }
    activeMounts++;

    // FORÇA LIGHT MODE IMEDIATAMENTE E AGRESSIVAMENTE
    html.classList.remove("dark");
    html.style.colorScheme = "light";
    
    // Remove qualquer atributo que possa causar dark mode
    html.removeAttribute('data-theme');
    
    // Observer extremamente agressivo para impedir qualquer mudança
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes") {
          // Remove qualquer classe dark que apareça
          if (html.classList.contains("dark")) {
            html.classList.remove("dark");
            html.style.colorScheme = "light";
          }
          // Remove qualquer atributo de tema
          if (html.hasAttribute('data-theme')) {
            html.removeAttribute('data-theme');
          }
        }
      });
    });
    
    observer.observe(html, { 
      attributes: true, 
      attributeFilter: ["class", "data-theme"],
      childList: false,
      subtree: false
    });

    // Também monitora mudanças no localStorage
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === "theme" && value === "dark") {
        return; // Bloqueia completamente
      }
      return originalSetItem.call(this, key, value);
    };

    return () => {
      observer.disconnect();
      activeMounts--;
      
      // Restora localStorage.setItem original
      localStorage.setItem = originalSetItem;

      // Restaura apenas quando nenhuma ForceLightMode está ativa
      if (activeMounts === 0 && userTheme === "dark") {
        html.classList.add("dark");
        html.style.colorScheme = "dark";
        userTheme = null;
      }
    };
  }, []);

  return <>{children}</>;
}
