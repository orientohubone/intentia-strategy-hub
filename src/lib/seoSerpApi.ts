import { supabase } from "@/integrations/supabase/client";

export interface SerpResultItem {
  position: number;
  title: string;
  link: string;
  domain: string;
  snippet?: string;
  isTarget: boolean;
}

export interface SerpQuerySummary {
  query: string;
  resultCount: number;
  targetPosition: number | null;
  error: string | null;
}

export interface SerpResponse {
  query: string;
  targetDomain: string | null;
  targetPosition: number | null;
  results: SerpResultItem[];
  allQueries: SerpQuerySummary[];
}

export async function fetchSerpRanking(searchTerms: string[], targetDomain?: string): Promise<SerpResponse> {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    throw new Error("Usuário não autenticado. Faça login novamente.");
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(`${supabaseUrl}/functions/v1/seo-serp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": anonKey,
    },
    body: JSON.stringify({ searchTerms, targetDomain }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const msg = data?.error || `Edge Function retornou HTTP ${response.status}`;
    throw new Error(msg);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as SerpResponse;
}
