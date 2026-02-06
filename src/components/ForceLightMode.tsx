import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export function ForceLightMode({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const savedTheme = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Salva o tema atual do usuário
    savedTheme.current = theme;
    // Força light mode
    setTheme("light");

    return () => {
      // Restaura o tema do usuário ao sair
      if (savedTheme.current && savedTheme.current !== "light") {
        setTheme(savedTheme.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}
