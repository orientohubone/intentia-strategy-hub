import { useLayoutEffect } from "react";

let activeMounts = 0;
let previousHadDark = false;
let previousColorScheme = "";

export function ForceLightMode({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    const html = document.documentElement;

    if (activeMounts === 0) {
      previousHadDark = html.classList.contains("dark");
      previousColorScheme = html.style.colorScheme;
    }
    activeMounts += 1;

    const enforceLight = () => {
      if (html.classList.contains("dark")) {
        html.classList.remove("dark");
      }
      html.style.colorScheme = "light";
    };

    enforceLight();

    // Keep light if theme provider tries to re-apply dark while public page is mounted.
    const observer = new MutationObserver(() => {
      if (activeMounts > 0) enforceLight();
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

