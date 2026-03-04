import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { useProjectsData } from "@/hooks/useProjectsData";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Search, TrendingUp, CalendarDays, ArrowLeft, RefreshCw, Coins, MousePointerClick, BarChart3 as BarChartIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTH_LABELS } from "@/lib/operationalTypes";
import { useResultsData } from "./hooks/useResultsData";
import { BenchmarkComparison } from "./components/BenchmarkComparison";
import { PerformanceAnalysis } from "./components/PerformanceAnalysis";
import { FeatureGate } from "@/components/FeatureGate";

export default function Results() {
    const { projectList, loading, searchTerm, setSearchTerm } = useProjectsData();
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [filterPeriod, setFilterPeriod] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    const { loading: resultsLoading, aggregatedMetrics, totalInvested, comparison, rankedCampaigns } = useResultsData(selectedProjectId, filterPeriod);

    const selectedProject = useMemo(() =>
        projectList.find(p => p.id === selectedProjectId),
        [projectList, selectedProjectId]
    );

    const periodOptions = useMemo(() => {
        const opts: { value: string; label: string }[] = [];
        const d = new Date();
        d.setDate(15);
        for (let i = 0; i < 24; i++) {
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            const value = `${year}-${String(month).padStart(2, '0')}`;
            let label = `${MONTH_LABELS[month]} ${year}`;
            if (i === 0) label = `Este mês (${MONTH_LABELS[month]})`;
            else if (i === 1) label = `Mês passado (${MONTH_LABELS[month]})`;
            opts.push({ value, label });
            d.setMonth(d.getMonth() - 1);
        }
        return opts;
    }, []);

    const filteredProjects = projectList.filter(p =>
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.url.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <FeatureGate
            featureKey="results"
            withLayout
            pageTitle="Resultados"
            blockWhileLoading
        >
            <DashboardLayout>
                <SEO title="Resultados | Intentia" noindex />

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {selectedProjectId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedProjectId(null)}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar à lista
                                </Button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                                    <TrendingUp className="h-6 w-6 text-primary" />
                                    Camada de Resultados
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {selectedProject
                                        ? `Análise de resultados para ${selectedProject.name}`
                                        : "Selecione um projeto para analisar o desempenho e benchmarks."
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                                <SelectTrigger className="h-10 min-w-[160px] w-auto bg-card">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder="Período" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {periodOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!selectedProjectId ? (
                        /* Project Selection Grid */
                        <div className="space-y-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar projeto..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-11 bg-card/50"
                                />
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-48 rounded-xl border border-border bg-card animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredProjects.length === 0 ? (
                                <div className="text-center py-12 border border-dashed rounded-xl bg-muted/30">
                                    <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredProjects.map((project) => (
                                        <div
                                            key={project.id}
                                            onClick={() => setSelectedProjectId(project.id)}
                                            className="cursor-pointer group"
                                        >
                                            <ProjectCard
                                                project={project}
                                                user={null}
                                                analyzing={false}
                                                canAnalyze={false}
                                                setActiveProjectId={() => setSelectedProjectId(project.id)}
                                                handleReanalyze={() => { }}
                                                startEdit={() => { }}
                                                handleDeleteProject={() => { }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Results Dashboard for Selected Project */
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {resultsLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground mt-4">Calculando resultados e benchmarks...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                <span>Investimento</span>
                                                <Coins className="h-4 w-4 opacity-50" />
                                            </div>
                                            <span className="text-2xl font-bold">R$ {totalInvested?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}</span>
                                        </div>

                                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                <span>Receita</span>
                                                <BarChartIcon className="h-4 w-4 opacity-50" />
                                            </div>
                                            <span className="text-2xl font-bold">R$ {aggregatedMetrics?.revenue?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}</span>
                                        </div>

                                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                <span>CLIQUES</span>
                                                <MousePointerClick className="h-4 w-4 opacity-50" />
                                            </div>
                                            <span className="text-2xl font-bold">{aggregatedMetrics?.clicks?.toLocaleString("pt-BR") || "0"}</span>
                                        </div>

                                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                <span>ROI</span>
                                                <TrendingUp className="h-4 w-4 opacity-50" />
                                            </div>
                                            <span className="text-2xl font-bold">{aggregatedMetrics?.roi?.toFixed(1) || "0"}%</span>
                                        </div>

                                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                <span>LTV MÉDIO</span>
                                                <Coins className="h-4 w-4 opacity-50" />
                                            </div>
                                            <span className="text-2xl font-bold">R$ {aggregatedMetrics?.ltv?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}</span>
                                        </div>

                                        <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-1">
                                            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                                                <span>PAYBACK</span>
                                                <CalendarDays className="h-4 w-4 opacity-50" />
                                            </div>
                                            <span className="text-2xl font-bold">{aggregatedMetrics?.payback?.toFixed(1) || "0"} <span className="text-sm font-normal text-muted-foreground">meses</span></span>
                                        </div>
                                    </div>

                                    {/* Benchmark Section */}
                                    <BenchmarkComparison comparison={comparison} />

                                    {/* Performance Analysis (Winners/Losers) */}
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold text-foreground">O que funcionou x O que não funcionou</h2>
                                        <PerformanceAnalysis campaigns={rankedCampaigns} />
                                    </div>

                                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-6 text-center">
                                        <h3 className="text-base font-semibold text-primary mb-1">Próximos passos na Camada de Resultados</h3>
                                        <p className="text-sm text-muted-foreground mb-4">Em breve: Análise detalhada do que funcionou vs. o que não funcionou e análise de gaps estratégicos.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </FeatureGate>
    );
}
