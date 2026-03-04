import { CampaignPerformance } from "../hooks/useResultsData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Zap, AlertCircle } from "lucide-react";

interface PerformanceAnalysisProps {
    campaigns: CampaignPerformance[];
}

export function PerformanceAnalysis({ campaigns }: PerformanceAnalysisProps) {
    const winners = campaigns.filter(c => c.roi > 50).slice(0, 3);
    const opportunities = campaigns.filter(c => c.roi <= 50).reverse().slice(0, 3);

    if (campaigns.length === 0) return null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Winners Section */}
            <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Zap className="h-5 w-5" />
                        O que Funcionou (Vencedores)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {winners.length > 0 ? winners.map((c) => (
                        <div key={c.id} className="bg-background/50 border border-green-500/10 rounded-lg p-4 flex items-center justify-between group hover:border-green-500/30 transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold bg-green-500/10 text-green-700 border-green-500/20">
                                        {c.channel}
                                    </Badge>
                                    <span className="font-semibold text-sm">{c.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Investido: <b>R$ {c.spend.toLocaleString("pt-BR")}</b></span>
                                    <span>ROI: <b className="text-green-600">{c.roi.toFixed(1)}%</b></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground uppercase font-bold text-[10px]">CAC</div>
                                <div className="font-bold text-green-600">R$ {c.cac.toFixed(2)}</div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">Dados insuficientes para identificar vencedores.</p>
                    )}
                </CardContent>
            </Card>

            {/* Opportunities Section */}
            <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <AlertCircle className="h-5 w-5" />
                        Oportunidades de Ajuste
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {opportunities.length > 0 ? opportunities.map((c) => (
                        <div key={c.id} className="bg-background/50 border border-amber-500/10 rounded-lg p-4 flex items-center justify-between group hover:border-amber-500/30 transition-colors">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-700 border-amber-500/20">
                                        {c.channel}
                                    </Badge>
                                    <span className="font-semibold text-sm">{c.name}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Investido: <b>R$ {c.spend.toLocaleString("pt-BR")}</b></span>
                                    <span>ROI: <b className="text-amber-600">{c.roi.toFixed(1)}%</b></span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground uppercase font-bold text-[10px]">CAC</div>
                                <div className="font-bold text-amber-600">R$ {c.cac.toFixed(2)}</div>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4 italic">Nenhuma campanha com performance abaixo do esperado identificada.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
