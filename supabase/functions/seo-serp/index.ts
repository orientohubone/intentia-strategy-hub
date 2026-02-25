import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// TYPES
// =====================================================

interface SerpResultItem {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet: string;
  isTarget: boolean;
}

// =====================================================
// HELPERS
// =====================================================

function normalizeDomain(input: string): string {
  if (!input) return "";
  try {
    if (input.startsWith("http")) return new URL(input).hostname.replace(/^www\./, "");
    return input.replace(/^www\./, "").toLowerCase();
  } catch {
    return input.replace(/^www\./, "").toLowerCase();
  }
}

// =====================================================
// SERPER.DEV API
// =====================================================
// Env vars: SERPER_API_KEY, SERPER_API_KEY_2
// Docs: https://serper.dev/docs
// Free tier: 2,500 credits per key on signup
// Each search = 1 credit
// Round-robin rotation across keys to double quota
// =====================================================

async function fetchSerperResults(
  searchTerm: string,
  apiKey: string,
  num: number = 10,
): Promise<{ organic: any[]; error?: string }> {
  console.log(`[seo-serp] Serper request: term="${searchTerm}", num=${num}`);

  try {
    const resp = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: searchTerm,
        gl: "br",
        hl: "pt-br",
        num,
      }),
    });

    const data = await resp.json();

    if (!resp.ok) {
      const errMsg = data?.message || data?.error || `HTTP ${resp.status}`;
      console.error(`[seo-serp] Serper error: ${resp.status} — ${errMsg}`);
      return { organic: [], error: errMsg };
    }

    const organic = data.organic || [];
    console.log(`[seo-serp] Serper OK: ${organic.length} organic results`);
    return { organic };
  } catch (err: any) {
    console.error(`[seo-serp] Serper fetch error:`, err?.message);
    return { organic: [], error: err?.message || "Erro de rede" };
  }
}

// =====================================================
// PARSE SERPER RESULTS
// =====================================================

function parseSerperResults(organic: any[], normalizedTarget: string): SerpResultItem[] {
  return organic.map((item: any, i: number) => {
    let domain = "";
    try { domain = new URL(item.link).hostname.replace(/^www\./, ""); } catch {}
    return {
      position: item.position || (i + 1),
      title: item.title || "",
      link: item.link || "",
      domain,
      snippet: item.snippet || "",
      isTarget: normalizedTarget ? domain.includes(normalizedTarget) : false,
    };
  });
}

// =====================================================
// MAIN HANDLER
// =====================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // -----------------------------------------------------------------------
    // AUTH CHECK
    // -----------------------------------------------------------------------
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization") ?? "" },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const searchTerms: string[] = body.searchTerms || (body.searchTerm ? [body.searchTerm] : []);
    const targetDomain: string = body.targetDomain || "";

    if (searchTerms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required field: searchTerm or searchTerms" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load API keys — support 1 or 2 keys for rotation
    const keys: string[] = [];
    const key1 = Deno.env.get("SERPER_API_KEY");
    const key2 = Deno.env.get("SERPER_API_KEY_2");
    if (key1) keys.push(key1);
    if (key2) keys.push(key2);

    if (keys.length === 0) {
      console.error("[seo-serp] No SERPER_API_KEY env vars set");
      return new Response(
        JSON.stringify({ error: "SERPER_API_KEY não configurada. Configure nas variáveis de ambiente do Supabase." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[seo-serp] ${keys.length} API key(s) loaded, round-robin rotation`);

    const normalizedTarget = normalizeDomain(targetDomain);
    const allQueries: any[] = [];

    for (let i = 0; i < Math.min(searchTerms.length, 10); i++) {
      const term = searchTerms[i];
      const apiKey = keys[i % keys.length];
      const { organic, error } = await fetchSerperResults(term, apiKey, 10);

      if (error) {
        allQueries.push({
          query: term,
          results: [],
          targetPosition: null,
          error,
        });
        continue;
      }

      const results = parseSerperResults(organic, normalizedTarget);
      console.log(`[seo-serp] Query "${term}": ${results.length} results, target found: ${results.some(r => r.isTarget)}`);

      allQueries.push({
        query: term,
        results,
        targetPosition: normalizedTarget
          ? results.find((r) => r.isTarget)?.position || null
          : null,
      });
    }

    // Best query = the one with the most results
    const bestQuery = allQueries.reduce((best, q) =>
      (q.results?.length || 0) > (best?.results?.length || 0) ? q : best
    , allQueries[0]);

    return new Response(
      JSON.stringify({
        query: bestQuery?.query || searchTerms[0],
        targetDomain: normalizedTarget || null,
        targetPosition: bestQuery?.targetPosition || null,
        results: bestQuery?.results || [],
        allQueries: allQueries.map((q: any) => ({
          query: q.query,
          resultCount: q.results?.length || 0,
          targetPosition: q.targetPosition || null,
          error: q.error || null,
        })),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[seo-serp] Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
