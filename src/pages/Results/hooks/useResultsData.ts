import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CampaignChannel, CampaignMetrics } from "@/lib/operationalTypes";
import injectBenchmarksRaw from "@/lib/benchmark/inject_clean.jsonl?raw";

export interface InjectBenchmark {
    topic: string;
    metric: string;
    valor: string;
    nota: string;
}

export interface CampaignData {
    id: string;
    budget_spent: number;
    start_date: string | null;
    end_date: string | null;
}

export interface CampaignPerformance {
    id: string;
    name: string;
    channel: string;
    spend: number;
    revenue: number;
    conversions: number;
    roi: number;
    ltv: number;
    cac: number;
    ratio: number;
}

export interface ComparisonMetric {
    label: string;
    key: string;
    projectValue: number | string;
    benchmarkValue: string;
    status: "above" | "below" | "neutral" | "good" | "bad";
    unit: string;
    note?: string;
}

export function useResultsData(projectId: string | null, period: string) {
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState<CampaignMetrics[]>([]);
    const [campaigns, setCampaigns] = useState<(CampaignData & { name: string; channel: string })[]>([]);
    const [totalInvested, setTotalInvested] = useState(0);
    const [benchmarks, setBenchmarks] = useState<InjectBenchmark[]>([]);

    // Parse period (YYYY-MM)
    const [year, month] = useMemo(() => {
        const parts = period.split("-");
        return [parseInt(parts[0]), parseInt(parts[1])];
    }, [period]);

    useEffect(() => {
        // Load local benchmarks
        try {
            const lines = injectBenchmarksRaw.split("\n").filter(l => l.trim());
            const parsed = lines.map(l => JSON.parse(l)) as InjectBenchmark[];
            setBenchmarks(parsed);
        } catch (err) {
            console.error("Error loading benchmarks:", err);
        }
    }, []);

    useEffect(() => {
        if (!projectId) return;

        async function fetchData() {
            setLoading(true);
            try {
                // 1. Get campaigns for this project with their budget_spent
                const { data: campaigns }: { data: (CampaignData & { name: string; channel: string })[] | null } = await supabase
                    .from("campaigns")
                    .select("id, name, channel, budget_spent, start_date, end_date")
                    .eq("project_id", projectId)
                    .eq("is_deleted", false);

                if (!campaigns || campaigns.length === 0) {
                    setMetrics([]);
                    setTotalInvested(0); // Reset totalInvested if no campaigns
                    setLoading(false);
                    return;
                }

                const campaignIds = campaigns.map(c => c.id);

                // Calculate 'Investimento' (total spent on active campaigns for the period)
                // Same logic as LiveDashboard
                const monthStart = new Date(year, month - 1, 1);
                const monthEnd = new Date(year, month, 0);

                const activeCampaigns = campaigns.filter(c => {
                    if (!c.start_date) return true;
                    const cStart = new Date(c.start_date + "T00:00:00");
                    const cEnd = c.end_date ? new Date(c.end_date + "T23:59:59") : new Date(2100, 0, 1);
                    return cStart <= monthEnd && cEnd >= monthStart;
                });

                const totalInvested = activeCampaigns.reduce((sum, c) => sum + (Number(c.budget_spent) || 0), 0);
                // We will store this in a ref or local state to override metrics cost if it's the 'Investimento' total
                // but for ROAS, we might still want metrics-based cost if metrics exist.

                // 2. Get metrics for these campaigns in the selected period
                // Fetch ALL metrics for these campaigns and filter in JS for accuracy
                const { data: metricsData } = await supabase
                    .from("campaign_metrics")
                    .select("*")
                    .in("campaign_id", campaignIds);

                const filteredMetrics = (metricsData || []).filter(m => {
                    const mDate = new Date(m.period_end || m.created_at);
                    return mDate.getFullYear() === year && (mDate.getMonth() + 1) === month;
                });

                setTotalInvested(totalInvested);
                setCampaigns(campaigns || []);
                setMetrics(filteredMetrics);
            } catch (err) {
                console.error("Error fetching results data:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [projectId, year, month]);

    const aggregatedMetrics = useMemo(() => {
        if (metrics.length === 0) return null;

        const totals = metrics.reduce((acc, curr) => ({
            cost: acc.cost + (curr.cost || 0),
            revenue: acc.revenue + (curr.revenue || 0),
            clicks: acc.clicks + (curr.clicks || 0),
            impressions: acc.impressions + (curr.impressions || 0),
            conversions: acc.conversions + (curr.conversions || 0),
        }), { cost: 0, revenue: 0, clicks: 0, impressions: 0, conversions: 0 });

        const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
        const cpc = totals.clicks > 0 ? totals.cost / totals.clicks : 0;
        const cpa = totals.conversions > 0 ? totals.cost / totals.conversions : 0;
        const roi = totalInvested > 0 ? ((totals.revenue - totalInvested) / totalInvested) * 100 : 0;

        // SaaS Metrics Aggregation
        const avgLtv = metrics.filter(m => (m.ltv || 0) > 0).reduce((acc, m, _, arr) => acc + (Number(m.ltv) || 0) / arr.length, 0);
        const totalConversions = totals.conversions || 0;
        const cac = totalConversions > 0 ? totalInvested / totalConversions : 0;
        const ltvCacRatio = cac > 0 ? avgLtv / cac : 0;

        // Payback calculation (Estimate)
        // If we assume a typical 24-month LTV for SaaS ERP/PME (common in benchmarks)
        const monthsLtv = 24;
        const monthlyArpu = avgLtv / monthsLtv;
        const payback = monthlyArpu > 0 ? cac / monthlyArpu : 0;

        return {
            ctr,
            cpc,
            cpa,
            roi,
            cac,
            ltv: avgLtv,
            ltvCacRatio,
            payback,
            ...totals
        };
    }, [metrics, totalInvested]);

    const comparison = useMemo(() => {
        if (!aggregatedMetrics) return [];

        const list: ComparisonMetric[] = [];

        // 1. LTV : CAC Ratio
        list.push({
            label: "Relação LTV : CAC",
            key: "ltv_cac",
            projectValue: aggregatedMetrics.ltvCacRatio.toFixed(2),
            benchmarkValue: ">= 3.0x",
            unit: "x",
            status: aggregatedMetrics.ltvCacRatio >= 3.0 ? "good" : (aggregatedMetrics.ltvCacRatio < 1.5 ? "bad" : "neutral"),
            note: "Saúde financeira: Cada R$ 1 investido deve trazer R$ 3 de retorno em LTV"
        });

        // 2. Payback (Meses para recuperar CAC)
        list.push({
            label: "Payback (Recuperação do CAC)",
            key: "payback",
            projectValue: aggregatedMetrics.payback.toFixed(1),
            benchmarkValue: "8 - 14 meses",
            unit: " meses",
            status: aggregatedMetrics.payback <= 12 ? "good" : (aggregatedMetrics.payback > 18 ? "bad" : "neutral"),
            note: "Tempo para o cliente 'se pagar'. Bench SaaS ERP: 12 meses."
        });

        // 3. CAC (Custo de Aquisição)
        list.push({
            label: "CAC (Custo de Aquisição)",
            key: "cac",
            projectValue: aggregatedMetrics.cac.toFixed(2),
            benchmarkValue: "Depende do LTV",
            unit: "R$",
            status: aggregatedMetrics.ltvCacRatio >= 3 ? "good" : "neutral",
            note: "Custo médio para adquirir um novo cliente"
        });

        // CTR Placeholder (standard market 1%)
        list.push({
            label: "CTR (Taxa de Clique)",
            key: "ctr",
            projectValue: aggregatedMetrics.ctr.toFixed(2),
            benchmarkValue: ">= 1.00%",
            unit: "%",
            status: aggregatedMetrics.ctr >= 1.0 ? "good" : "bad",
            note: "Média de mercado para campanhas de busca/social"
        });

        // CPC Comparison
        list.push({
            label: "CPC (Custo por Clique)",
            key: "cpc",
            projectValue: aggregatedMetrics.cpc.toFixed(2),
            benchmarkValue: "< R$ 2.50",
            unit: "R$",
            status: aggregatedMetrics.cpc <= 2.5 ? "good" : "bad",
            note: "Varia de acordo com o nicho e concorrência"
        });

        // Pacing (Budget usage) - Placeholder logic
        const pacingValue = 95; // Assuming we are on track for now
        list.push({
            label: "Pacing (Uso do Orçamento)",
            key: "pacing",
            projectValue: pacingValue,
            benchmarkValue: "80% - 110%",
            unit: "%",
            status: pacingValue >= 80 && pacingValue <= 110 ? "good" : "neutral",
            note: "Evita subutilização ou estouro de verba"
        });

        return list;
    }, [aggregatedMetrics, benchmarks]);

    const rankedCampaigns = useMemo(() => {
        if (!projectId || metrics.length === 0) return [];

        // Group metrics by campaign
        const campaignMap = new Map<string, any>();
        metrics.forEach(m => {
            const existing = campaignMap.get(m.campaign_id) || { cost: 0, revenue: 0, conversions: 0, ltvSum: 0, count: 0 };
            campaignMap.set(m.campaign_id, {
                cost: existing.cost + (m.cost || 0),
                revenue: existing.revenue + (m.revenue || 0),
                conversions: existing.conversions + (m.conversions || 0),
                ltvSum: existing.ltvSum + (m.ltv || 0),
                count: existing.count + 1
            });
        });

        // Map to Performance object
        return Array.from(campaignMap.entries()).map(([id, data]) => {
            const campaignInfo = campaigns.find(c => c.id === id);
            return {
                id,
                name: campaignInfo?.name || "Campanha " + id.substring(0, 4),
                channel: campaignInfo?.channel || "meta",
                spend: data.cost,
                revenue: data.revenue,
                conversions: data.conversions,
                roi: data.cost > 0 ? ((data.revenue - data.cost) / data.cost) * 100 : 0,
                ltv: data.count > 0 ? data.ltvSum / data.count : 0,
                cac: data.conversions > 0 ? data.cost / data.conversions : 0,
                ratio: (data.cac > 0) ? (data.ltvSum / data.count) / (data.cost / data.conversions) : 0
            };
        }).sort((a, b) => b.roi - a.roi);
    }, [metrics, campaigns, projectId]);

    return {
        loading,
        aggregatedMetrics,
        totalInvested,
        comparison,
        rankedCampaigns,
        benchmarks
    };
}
