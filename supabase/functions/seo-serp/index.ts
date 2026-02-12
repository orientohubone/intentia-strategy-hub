import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

// =====================================================
// REGEX-BASED GOOGLE SERP PARSER (no DOM dependency)
// =====================================================

function parseGoogleResults(html: string, normalizedTarget: string) {
  const results: any[] = [];
  const seen = new Set<string>();

  // Strategy 1: Match <a href="/url?q=..."><h3>...</h3></a> pattern
  const pattern1 = /<a[^>]*href="\/url\?q=([^"&]+)[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let match;
  while ((match = pattern1.exec(html)) !== null) {
    const link = decodeURIComponent(match[1]);
    const title = decodeHtmlEntities(match[2]);
    if (title && link.startsWith("http") && !seen.has(link)) {
      seen.add(link);
      let domain = "";
      try { domain = new URL(link).hostname.replace(/^www\./, ""); } catch {}
      results.push({ title, link, domain });
    }
  }

  // Strategy 2: Match <a href="https://..."><h3>...</h3></a> (direct links)
  const pattern2 = /<a[^>]*href="(https?:\/\/(?!www\.google\.|webcache\.)[^"]+)"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  while ((match = pattern2.exec(html)) !== null) {
    const link = match[1];
    const title = decodeHtmlEntities(match[2]);
    if (title && !seen.has(link)) {
      seen.add(link);
      let domain = "";
      try { domain = new URL(link).hostname.replace(/^www\./, ""); } catch {}
      results.push({ title, link, domain });
    }
  }

  // Strategy 3: Match <h3>...</h3> near <a href="..."> (looser)
  const pattern3 = /<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]{0,200}?href="(https?:\/\/(?!www\.google\.|webcache\.)[^"]+)"/gi;
  while ((match = pattern3.exec(html)) !== null) {
    const title = decodeHtmlEntities(match[1]);
    const link = match[2];
    if (title && link && !seen.has(link)) {
      seen.add(link);
      let domain = "";
      try { domain = new URL(link).hostname.replace(/^www\./, ""); } catch {}
      results.push({ title, link, domain });
    }
  }

  // Strategy 4: Reverse — <a href="..."> near <h3>
  const pattern4 = /href="(https?:\/\/(?!www\.google\.|webcache\.)[^"]+)"[\s\S]{0,200}?<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  while ((match = pattern4.exec(html)) !== null) {
    const link = match[1];
    const title = decodeHtmlEntities(match[2]);
    if (title && link && !seen.has(link)) {
      seen.add(link);
      let domain = "";
      try { domain = new URL(link).hostname.replace(/^www\./, ""); } catch {}
      results.push({ title, link, domain });
    }
  }

  // Assign positions and target match
  return results.slice(0, 20).map((r, i) => ({
    position: i + 1,
    title: r.title,
    link: r.link,
    domain: r.domain,
    isTarget: normalizedTarget ? r.domain.includes(normalizedTarget) : false,
  }));
}

// =====================================================
// FETCH GOOGLE SERP (with proxy fallback)
// =====================================================

async function fetchGoogleSerp(searchTerm: string): Promise<{ html: string; status: number }> {
  const url = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&num=20&hl=pt-br&gl=br`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "identity",
    "Cache-Control": "no-cache",
  };

  console.log(`[seo-serp] Fetching: ${searchTerm}`);

  const response = await fetch(url, { headers, redirect: "follow" });

  if (response.ok) {
    const html = await response.text();
    console.log(`[seo-serp] Direct fetch OK, HTML length: ${html.length}`);
    return { html, status: response.status };
  }

  console.warn(`[seo-serp] Direct fetch failed: ${response.status}, trying proxy...`);

  // Proxy fallback
  const proxyUrl = Deno.env.get("PROXY_URL");
  const proxyKey = Deno.env.get("PROXY_API_KEY");
  if (proxyUrl) {
    const proxyRequestUrl = proxyKey
      ? `${proxyUrl}?url=${encodeURIComponent(url)}&api_key=${proxyKey}`
      : `${proxyUrl}?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyRequestUrl);
    if (proxyResponse.ok) {
      const html = await proxyResponse.text();
      console.log(`[seo-serp] Proxy fetch OK, HTML length: ${html.length}`);
      return { html, status: 200 };
    }
    console.error(`[seo-serp] Proxy also failed: ${proxyResponse.status}`);
    return { html: "", status: proxyResponse.status };
  }

  return { html: "", status: response.status };
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

    const normalizedTarget = normalizeDomain(targetDomain);
    const allQueries: any[] = [];

    for (const term of searchTerms.slice(0, 3)) {
      const { html, status } = await fetchGoogleSerp(term);

      if (!html) {
        allQueries.push({
          query: term,
          results: [],
          error: `HTTP ${status}`,
        });
        continue;
      }

      const results = parseGoogleResults(html, normalizedTarget);
      console.log(`[seo-serp] Query "${term}": ${results.length} results found`);

      allQueries.push({
        query: term,
        results,
        targetPosition: normalizedTarget
          ? results.find((r: any) => r.isTarget)?.position || null
          : null,
      });
    }

    // Best query = the one with the most results
    const bestQuery = allQueries.reduce((best, q) =>
      q.results.length > (best?.results?.length || 0) ? q : best
    , allQueries[0]);

    return new Response(
      JSON.stringify({
        query: bestQuery.query,
        targetDomain: normalizedTarget || null,
        targetPosition: bestQuery.targetPosition || null,
        results: bestQuery.results,
        allQueries: allQueries.map((q: any) => ({
          query: q.query,
          resultCount: q.results.length,
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
