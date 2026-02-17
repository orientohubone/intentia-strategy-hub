import { useEffect } from "react";

// Ref count para evitar flash ao navegar entre páginas públicas
let activeMounts = 0;
let userTheme: string | null = null;

export function ForceLightMode({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;

    if (activeMounts === 0) {
      // Primeira montagem: salva o tema real do localStorage (fonte de verdade do next-themes)
      userTheme = localStorage.getItem("theme");
    }
    activeMounts++;

    // Remove dark class
    html.classList.remove("dark");
    html.style.colorScheme = "light";

    // Observer impede que next-themes reaplique .dark enquanto montado
    const observer = new MutationObserver(() => {
      if (html.classList.contains("dark")) {
        html.classList.remove("dark");
        html.style.colorScheme = "light";
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      activeMounts--;

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
