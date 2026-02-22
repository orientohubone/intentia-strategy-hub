import { useLayoutEffect } from "react";

let activeMounts = 0;
let previousHadDark = false;
let previousColorScheme = "";

export function ForceDarkMode({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const html = document.documentElement;

    if (activeMounts === 0) {
      previousHadDark = html.classList.contains("dark");
      previousColorScheme = html.style.colorScheme;
    }
    activeMounts += 1;

    const enforceDark = () => {
      if (!html.classList.contains("dark")) {
        html.classList.add("dark");
      }
      html.style.colorScheme = "dark";
    };

    enforceDark();

    const observer = new MutationObserver(() => {
      if (activeMounts > 0) enforceDark();
    });
    observer.observe(html, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      activeMounts -= 1;
      if (activeMounts > 0) return;

      if (previousHadDark) {
        html.classList.add("dark");
      } else {
        html.classList.remove("dark");
      }
      html.style.colorScheme = previousColorScheme || "";
    };
  }, []);

  return <>{children}</>;
}
