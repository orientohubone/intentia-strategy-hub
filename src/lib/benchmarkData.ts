export type BenchmarkOption = {
  id: string;
  label: string;
  description: string;
  display: string;
  ratio: number;
  tags?: string[];
};

export type BenchmarkSnapshot = BenchmarkOption & {
  niche_id: string;
  fetched_at: string | null;
  source_data?: Record<string, unknown>;
};

export const BENCHMARK_NICHES: BenchmarkOption[] = [
  {
    id: "saas-erp",
    label: "SaaS ERP",
    description: "Cada 1 real de CAC gera 3,00 de LTV",
    display: "1:3",
    ratio: 3,
    tags: ["erp", "saas"],
  },
  {
    id: "saas-martech",
    label: "SaaS MarTech",
    description: "Benchmark leve: 1 real gera 2,5 de LTV",
    display: "1:2,5",
    ratio: 2.5,
    tags: ["martech"],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    description: "1 real gera 4,00 de LTV em média",
    display: "1:4",
    ratio: 4,
    tags: ["marketplace"],
  },
  {
    id: "fintech",
    label: "Fintech",
    description: "1 real gera 2,0 de LTV (benchmark conservador)",
    display: "1:2",
    ratio: 2,
    tags: ["fintech"],
  },
];

export function fallbackBenchmarkSnapshots(): BenchmarkSnapshot[] {
  return BENCHMARK_NICHES.map((bench) => ({
    ...bench,
    niche_id: bench.id,
    fetched_at: null,
    source_data: { fallback: true },
  }));
}

export function averageBenchmarkRatio(snapshots: BenchmarkSnapshot[]): number {
  if (!snapshots.length) return 0;
  const total = snapshots.reduce((sum, snapshot) => sum + snapshot.ratio, 0);
  return Number((total / snapshots.length).toFixed(2));
}
