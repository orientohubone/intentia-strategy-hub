import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// PUBLIC DATA SOURCES
// =====================================================

interface SourceResult {
  source: string;
  url: string;
  text: string;
  success: boolean;
}

const SOURCES: { name: string; buildUrl: (industry: string, location: string) => string }[] = [
  {
    name: "SEBRAE",
    buildUrl: (industry, _location) =>
      `https://sebrae.com.br/sites/PortalSebrae/artigos/${encodeURIComponent(industry.toLowerCase().replace(/\s+/g, "-"))}`,
  },
  {
    name: "SEBRAE Perfil",
    buildUrl: (industry, _location) =>
      `https://datasebrae.com.br/totaldeempresas/`,
  },
  {
    name: "IBGE Cidades",
    buildUrl: (_industry, location) =>
      `https://cidades.ibge.gov.br/brasil/${encodeURIComponent(location.toLowerCase().replace(/\s+/g, "-"))}/panorama`,
  },
  {
    name: "IBGE Empresas",
    buildUrl: (_industry, _location) =>
      `https://www.ibge.gov.br/estatisticas/economicas/comercio/9016-estatisticas-do-cadastro-central-de-empresas.html`,
  },
];

async function fetchSourceText(url: string, name: string): Promise<SourceResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IntentiaBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return { source: name, url, text: "", success: false };
    }

    const html = await response.text();

    // Extract meaningful text from HTML
    const text = extractText(html);

    // Limit to ~3000 chars per source to keep prompt manageable
    const trimmed = text.slice(0, 3000);

    return { source: name, url, text: trimmed, success: trimmed.length > 100 };
  } catch (err) {
    console.warn(`[enrich-icp] Failed to fetch ${name}:`, err);
    return { source: name, url, text: "", success: false };
  }
}

function extractText(html: string): string {
  // Remove scripts, styles, nav, footer, header
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "");

  // Extract text from main/article/section or body
  const mainMatch = cleaned.match(/<(?:main|article|section)[^>]*>([\s\S]*?)<\/(?:main|article|section)>/i);
  if (mainMatch) {
    cleaned = mainMatch[1];
  }

  // Remove all remaining HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "");

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  return cleaned;
}

// =====================================================
// HANDLER
// =====================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { industry, location, companySize, keywords } = body;

    if (!industry && !location) {
      return new Response(JSON.stringify({ error: "Informe ao menos indústria ou localização" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch all sources in parallel
    const fetchPromises = SOURCES.map((source) => {
      const url = source.buildUrl(industry || "", location || "");
      return fetchSourceText(url, source.name);
    });

    const results = await Promise.all(fetchPromises);
    const successfulSources = results.filter((r) => r.success);

    return new Response(
      JSON.stringify({
        sources: results.map((r) => ({
          source: r.source,
          url: r.url,
          success: r.success,
          textLength: r.text.length,
        })),
        enrichmentData: successfulSources.map((r) => ({
          source: r.source,
          text: r.text,
        })),
        totalSourcesFound: successfulSources.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("[enrich-icp] Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
