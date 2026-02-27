import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
// AQUI usamos a chave de serviço apenas por segurança, pois essa tabela não terá permissões públicas de inserção.
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ALLOWED_ORIGINS = [
    "https://intentia.com.br",
    "http://www.intentia.com.br",
    "https://www.intentia.com.br",
    "https://intentia-strategy-hub.vercel.app",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000"
];

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const origin = req.headers.origin || "";
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (!origin) {
        res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
        console.error("[security-logger] Missing Supabase Credentials");
        return res.status(500).json({ error: "Supabase credentials missing" });
    }

    // Identificação básica via IP pro DB e Rate limit!
    const ip = (req.headers["x-forwarded-for"] as string)?.split(',')[0] || req.socket.remoteAddress || "Unknown";
    const now = Date.now();
    const rl = rateLimitMap.get(ip) || { count: 0, resetTime: now + 60000 };

    if (now > rl.resetTime) {
        rl.count = 1;
        rl.resetTime = now + 60000;
    } else {
        rl.count++;
    }
    rateLimitMap.set(ip, rl);

    // Apenas 5 eventos de segurança reportados por IP por minuto para não lotar os logs do banco!
    if (rl.count > 5) {
        return res.status(429).json({ error: "Too many spam alerts." });
    }

    try {
        const { event_type, url, user_agent, details } = req.body || {};

        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY as string);

        const { error } = await supabase.from("security_events").insert({
            event_type: event_type || "UNKNOWN_SUSPICIOUS_EVENT",
            ip_address: ip,
            user_agent: user_agent || req.headers["user-agent"] || "Unknown",
            url: url || req.headers.referer || "Unknown",
            details: details || {}
        });

        if (error) {
            console.error("[security-logger] DB Insert Error:", error.message);
            return res.status(500).json({ error: "Failed to record event." });
        }

        return res.status(200).json({ success: true, message: "Incident logged securely." });
    } catch (err: any) {
        return res.status(500).json({ error: "Internal logger error." });
    }
}
