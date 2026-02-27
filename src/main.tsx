import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🛡️ Security Console Warning - Scare tactics for attackers
if (typeof window !== "undefined") {
    console.log(
        "%c 🛑 ACESSO RESTRITO - INTENTIA STRATEGY HUB 🛑 \n\n%cEsta é uma área sensível reservada a desenvolvedores e sistemas internos.\nQualquer tentativa de engenharia reversa, manipulação de tráfego, injeção de scripts (XSS/CSRF)\nou extração maliciosa de módulos (Scraping) está sendo ativamente rastreada.\n\nSeu endereço IP, User-Agent e Fingerprint da máquina já foram correlacionados com sua sessão atual.\nOs Logs estão sendo direcionados em tempo real aos nossos servidores de segurança Edge.\n\n%c[ AVISO LEGAL ] O USO NÃO AUTORIZADO DESTE CONSOLE E SUAS ROTAS É CRIME CIBERNÉTICO (LEI Nº 12.737/12).\nFECHE ESTE PAINEL IMEDIATAMENTE. ESTAMOS MONITORANDO VOCÊ.",
        "color: red; font-size: 24px; font-weight: 900; background: black; padding: 10px; border-radius: 8px;",
        "color: #ddd; font-size: 14px; background: #111; padding: 15px; display: block; border-left: 5px solid red; font-family: monospace; line-height: 1.5;",
        "color: #ff2a2a; font-size: 16px; font-weight: 900; display: block; margin-top: 15px; text-transform: uppercase; text-decoration: underline;"
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
