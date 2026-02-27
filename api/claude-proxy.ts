import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const ALLOWED_ORIGINS = [
  "https://intentia.com.br",
  "http://www.intentia.com.br",
  "https://www.intentia.com.br",
  "https://intentia-strategy-hub.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000"
];

// Simple in-memory rate limiter (per Vercel instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 10; // 10 requisições
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // por minuto

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    // Permite chamadas server-to-server intra-rede
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

  // Auth check
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "").trim();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing Supabase credentials");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // --- RATE LIMITING CHK ---
  const userId = user.id;
  const now = Date.now();
  const userRate = rateLimitMap.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > userRate.resetTime) {
    userRate.count = 1;
    userRate.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    userRate.count++;
  }
  rateLimitMap.set(userId, userRate);

  if (userRate.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  // -------------------------

  try {
    const { apiKey, model, prompt, maxTokens } = req.body;

    if (!apiKey || !model || !prompt) {
      return res.status(400).json({ error: "Missing required fields: apiKey, model, prompt" });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens || 4096,
        temperature: 0.4,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: `Anthropic API error (${response.status}): ${errorData?.error?.message || response.statusText}`,
      });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text || "";

    if (!text) {
      return res.status(500).json({ error: "Empty response from Anthropic API" });
    }

    return res.status(200).json({ text });
  } catch (error: any) {
    console.error("[claude-proxy] Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
