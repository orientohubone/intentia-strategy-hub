import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =====================================================
// TYPES
// =====================================================

interface CseKey {
  apiKey: string;
  cxId: string;
}

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
// GOOGLE CUSTOM SEARCH API KEY ROTATION
// =====================================================
// Env vars (individual, one per secret):
//   GOOGLE_CSE_CX     — Search Engine ID (shared across all keys)
//   GOOGLE_CSE_KEY_1  — API key 1
//   GOOGLE_CSE_KEY_2  — API key 2 (optional)
//   GOOGLE_CSE_KEY_3  — API key 3 (optional)
//
// Each key has 100 queries/day free. With 3 keys = 300 queries/day.
// Rotates through keys on quota errors (HTTP 429 or 403).
// =====================================================

function loadCseKeys(): CseKey[] {
  const cxId = Deno.env.get("GOOGLE_CSE_CX") || "";
  if (!cxId) {
    console.error("[seo-serp] GOOGLE_CSE_CX env var not set");
    return [];
  }

  const keys: CseKey[] = [];
  for (let i = 1; i <= 5; i++) {
    const apiKey = Deno.env.get(`GOOGLE_CSE_KEY_${i}`);
    if (apiKey && apiKey.trim()) {
      keys.push({ apiKey: apiKey.trim(), cxId });
    }
  }

  if (keys.length === 0) {
    console.error("[seo-serp] No GOOGLE_CSE_KEY_N env vars found (checked 1-5)");
  } else {
    console.log(`[seo-serp] Loaded ${keys.length} CSE key(s)`);
  }

  return keys;
}

// Track which key index to start with (rotates on quota errors within this invocation)
let currentKeyIndex = 0;

async function fetchGoogleCse(
  searchTerm: string,
  keys: CseKey[],
  startIndex: number = 1,
): Promise<{ items: any[]; totalResults: string; keyUsed: number; error?: string }> {
  if (keys.length === 0) {
    return { items: [], totalResults: "0", keyUsed: -1, error: "Nenhuma API key configurada. Configure GOOGLE_CSE_KEYS no Supabase." };
  }

  // Try each key starting from currentKeyIndex
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIdx = (currentKeyIndex + attempt) % keys.length;
    const key = keys[keyIdx];

    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", key.apiKey);
    url.searchParams.set("cx", key.cxId);
    url.searchParams.set("q", searchTerm);
    url.searchParams.set("num", "10");
    url.searchParams.set("start", String(startIndex));
    url.searchParams.set("gl", "br");
    url.searchParams.set("hl", "pt-BR");

    console.log(`[seo-serp] CSE request: key=${keyIdx}, term="${searchTerm}", start=${startIndex}`);

    try {
      const resp = await fetch(url.toString());
      const data = await resp.json();

      if (resp.ok) {
        console.log(`[seo-serp] CSE OK: key=${keyIdx}, items=${data.items?.length || 0}, total=${data.searchInformation?.totalResults}`);
        // Update current key index for next call
        currentKeyIndex = keyIdx;
        return {
          items: data.items || [],
          totalResults: data.searchInformation?.totalResults || "0",
          keyUsed: keyIdx,
        };
      }

      // Check if quota exceeded — rotate to next key
      const errorReason = data?.error?.errors?.[0]?.reason || "";
      const errorMessage = data?.error?.message || `HTTP ${resp.status}`;
      console.warn(`[seo-serp] CSE error: key=${keyIdx}, status=${resp.status}, reason=${errorReason}, msg=${errorMessage}`);

      if (resp.status === 429 || resp.status === 403 || errorReason === "rateLimitExceeded" || errorReason === "dailyLimitExceeded") {
        console.log(`[seo-serp] Quota exceeded on key ${keyIdx}, rotating to next key...`);
        continue; // Try next key
      }

      // Non-quota error — return it
      return { items: [], totalResults: "0", keyUsed: keyIdx, error: errorMessage };
    } catch (err: any) {
      console.error(`[seo-serp] CSE fetch error: key=${keyIdx}:`, err?.message);
      continue; // Try next key on network error
    }
  }

  // All keys exhausted
  return { items: [], totalResults: "0", keyUsed: -1, error: "Todas as API keys atingiram o limite diário. Tente novamente amanhã." };
}

// =====================================================
// PARSE CSE RESULTS
// =====================================================

function parseCseResults(items: any[], normalizedTarget: string): SerpResultItem[] {
  return items.map((item: any, i: number) => {
    let domain = "";
    try { domain = new URL(item.link).hostname.replace(/^www\./, ""); } catch {}
    return {
      position: i + 1,
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
    const body = await req.json();
    const searchTerms: string[] = body.searchTerms || (body.searchTerm ? [body.searchTerm] : []);
    const targetDomain: string = body.targetDomain || "";

    if (searchTerms.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required field: searchTerm or searchTerms" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const keys = loadCseKeys();
    const normalizedTarget = normalizeDomain(targetDomain);
    const allQueries: any[] = [];

    for (const term of searchTerms.slice(0, 10)) {
      // Fetch first 10 results per term (1 API call each)
      const page1 = await fetchGoogleCse(term, keys, 1);

      if (page1.error) {
        allQueries.push({
          query: term,
          results: [],
          targetPosition: null,
          error: page1.error,
        });
        // If all keys exhausted, stop trying more terms
        if (page1.keyUsed === -1 && keys.length > 0) break;
        continue;
      }

      const results = parseCseResults(page1.items, normalizedTarget);
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
