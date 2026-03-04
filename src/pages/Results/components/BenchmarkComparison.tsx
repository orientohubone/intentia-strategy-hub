import { ComparisonMetric } from "../hooks/useResultsData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BenchmarkComparisonProps {
    comparison: ComparisonMetric[];
}

export function BenchmarkComparison({ comparison }: BenchmarkComparisonProps) {
    return (
        <Card className="border-border bg-card/50 overflow-hidden shadow-sm">
            <CardHeader className="pb-2 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Benchmark Comparativo: Projeto vs Mercado
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-wider bg-background/50">
                        Dados Mensais
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                                <th className="px-6 py-4 text-left">Métrica</th>
                                <th className="px-6 py-4 text-center">Seu Projeto</th>
                                <th className="px-6 py-4 text-center">Referência (Mercado)</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {comparison.map((metric) => (
                                <tr key={metric.key} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 font-medium text-foreground">
                                                {metric.label}
                                                {metric.note && (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <Info className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary transition-colors cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-[250px]">
                                                                <p className="text-xs">{metric.note}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground/70">Performance atual</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-base font-bold text-foreground">
                                            {metric.unit === "R$" && "R$ "}
                                            {metric.projectValue}
                                            {metric.unit === "%" && "%"}
                                            {metric.unit === "x" && "x"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="outline" className="text-[11px] bg-muted/50 font-semibold border-border/50">
                                            {metric.benchmarkValue}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                                                metric.status === "good" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                                                metric.status === "bad" && "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
                                                metric.status === "neutral" && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                                            )}>
                                                {metric.status === "good" && <TrendingUp className="h-3 w-3" />}
                                                {metric.status === "bad" && <TrendingDown className="h-3 w-3" />}
                                                {metric.status === "neutral" && <Minus className="h-3 w-3" />}
                                                {metric.status === "good" ? "Acima" : metric.status === "bad" ? "Abaixo" : "Dentro"}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {comparison.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        Sem dados suficientes para gerar comparação no período selecionado.
                    </div>
                )}

                <div className="p-4 bg-muted/10 border-t border-border">
                    <p className="text-[11px] text-muted-foreground text-center italic">
                        * Benchmarks baseados em médias de mercado para o segmento B2B SaaS/ERP/MarTech (EBR).
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
