import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const ALLOWED_ORIGINS = [
  "https://intentia.com.br",
  "http://www.intentia.com.br",
  "https://www.intentia.com.br",
  "https://intentiahub.vercel.app",
  "http://localhost:8080",
  "http://localhost:5173",
  "http://localhost:3000"
];

export default async function handler(req: any, res: any) {
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

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: "Supabase credentials not configured" });
  }

  try {
    const { project_id } = req.body || {};
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!project_id) {
      return res.status(400).json({ error: "project_id is required" });
    }
    if (!token) {
      return res.status(401).json({ error: "Missing access token" });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Validate user token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = userData.user.id;

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, niche, url, solution_context, missing_features")
      .eq("id", project_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    if (!data) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.status(200).json({ project: data });
  } catch (err: any) {
    console.error("[project-context] Error:", err);
    return res.status(500).json({ error: err?.message || "Internal error" });
  }
}
