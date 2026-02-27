import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🛡️ Security Console Warning - Scare tactics for attackers
if (typeof window !== "undefined") {
    // Style variables using Intentia design system colors and typography
    const primaryOrange = "#ea580c"; // Tailwind orange-600 used in design system
    const warningRed = "#ef4444"; // Tailwind red-500
    const alertYellow = "#f59e0b"; // Tailwind amber-500
    const textLight = "#f8fafc";
    const bgDark = "#0f172a"; // Tailwind slate-900
    const fontFamily = "'Inter', sans-serif, monospace";

    console.log(
        `%c 🛡️ INTENTIA STRATEGY HUB %c \n\n%cACESSO RESTRITO\n\n%cEsta é uma área sensível reservada a desenvolvedores e sistemas internos.\nQualquer tentativa de engenharia reversa, manipulação de tráfego, injeção de scripts (XSS/CSRF) ou extração maliciosa de módulos (Scraping) está sendo ativamente rastreada.\n\n%cSeu endereço IP, User-Agent e Fingerprint da máquina já foram correlacionados com sua sessão atual.\nOs Logs estão sendo direcionados em tempo real aos nossos servidores de segurança Edge.\n\n%c[ AVISO LEGAL ] O USO NÃO AUTORIZADO DESTE CONSOLE E SUAS ROTAS É CRIME CIBERNÉTICO (LEI Nº 12.737/12).\nFECHE ESTE PAINEL IMEDIATAMENTE. ESTAMOS MONITORANDO VOCÊ.`,
        `color: ${textLight}; background: ${primaryOrange}; font-size: 18px; font-weight: 900; padding: 6px 12px; border-radius: 6px; font-family: ${fontFamily};`,
        "", // clear styles for the newline
        `color: ${warningRed}; font-size: 22px; font-weight: 900; font-family: ${fontFamily}; letter-spacing: 1px;`,
        `color: ${textLight}; font-size: 14px; background: ${bgDark}; padding: 12px; border-left: 4px solid ${primaryOrange}; font-family: ${fontFamily}; line-height: 1.6; display: block; border-radius: 0 4px 4px 0;`,
        `color: ${alertYellow}; font-size: 13px; font-family: ${fontFamily}; line-height: 1.5; padding: 10px 0; font-weight: 600;`,
        `color: ${warningRed}; font-size: 13px; font-weight: 800; display: block; margin-top: 10px; text-transform: uppercase; border-top: 1px solid ${warningRed}; padding-top: 10px; font-family: ${fontFamily};`
    );

    // Armadilhas interativas ("Honeypot" de Console)
    // Ao rodar qualquer coisa no console que ative os getters (como ler propriedades complexas)
    // ou ao carregar essa rotina em produção (import.meta.env.PROD), ele aciona nosso edge serverlet.
    if (import.meta.env.PROD) {
        try {
            fetch('/api/security-logger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_type: "CONSOLE_WARNING_VIEWED",
                    url: window.location.href,
                    user_agent: navigator.userAgent,
                    details: {
                        screen: `${window.screen.width}x${window.screen.height}`,
                        language: navigator.language
                    }
                })
            });
        } catch (e) { /* Silently fail, do not expose logger errors to attacker */ }
    }

    // Opcional: Esvaziar o console para disfarçar logs nativos (se houver) periodicamente (somente em prod para não atrapalhar seu próprio dev)
    if (import.meta.env.PROD) {
        setInterval(() => {
            // Uncomment to make it even harder for attackers to read console logs
            // console.clear();
        }, 5000);
    }
}

createRoot(document.getElementById("root")!).render(<App />);
