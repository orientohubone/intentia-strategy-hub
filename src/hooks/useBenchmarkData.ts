import { useCallback, useEffect, useState } from "react";
import {
  BenchmarkSnapshot,
  fallbackBenchmarkSnapshots,
  averageBenchmarkRatio,
} from "@/lib/benchmarkData";

const API_PATH = `${import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "")}/functions/v1/benchmark-data`;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

type ResponsePayload = {
  benchmarks: BenchmarkSnapshot[];
  weightedAverage: number;
  lastUpdated: string | null;
};

export function useBenchmarkData() {
  const [data, setData] = useState<ResponsePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackUsed, setFallbackUsed] = useState(true);

  const fetchBenchmarks = useCallback(async () => {
    if (!API_PATH || !API_KEY) {
      setError("Endpoint ou chave Ausentes");
      setData({
        benchmarks: fallbackBenchmarkSnapshots(),
        weightedAverage: averageBenchmarkRatio(fallbackBenchmarkSnapshots()),
        lastUpdated: null,
      });
      setFallbackUsed(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_PATH, {
        headers: {
          "Content-Type": "application/json",
          apikey: API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const payload = (await response.json()) as ResponsePayload;
      const benchmarks = payload.benchmarks && payload.benchmarks.length > 0
        ? payload.benchmarks
        : fallbackBenchmarkSnapshots();

      setData({
        benchmarks,
        weightedAverage: payload.weightedAverage || averageBenchmarkRatio(benchmarks),
        lastUpdated: payload.lastUpdated || null,
      });
      setFallbackUsed(!payload.benchmarks?.length);
    } catch (fetchError) {
      const fallback = fallbackBenchmarkSnapshots();
      setError(fetchError instanceof Error ? fetchError.message : "Erro ao buscar benchmarks");
      setData({
        benchmarks: fallback,
        weightedAverage: averageBenchmarkRatio(fallback),
        lastUpdated: null,
      });
      setFallbackUsed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBenchmarks();
  }, [fetchBenchmarks]);

  return {
    data,
    isLoading,
    error,
    fallbackUsed,
    refetch: fetchBenchmarks,
  };
}
