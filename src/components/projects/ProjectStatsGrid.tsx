import { FolderOpen, Target, TrendingUp, AlertTriangle } from "lucide-react";

/**
 * Componente responsável por exibir os cards de estatísticas globais
 * no painel de projetos (Total de Projetos, Score Médio, Melhor Score, Insights).
 */

interface ProjectStatsGridProps {
    projectList: any[]; // Idealmente tipado com o tipo do Projeto
    insights: Record<string, any[]>;
}

export function ProjectStatsGrid({ projectList, insights }: ProjectStatsGridProps) {
    const averageScore = projectList.length > 0
        ? Math.round(projectList.reduce((acc, p) => acc + p.score, 0) / projectList.length)
        : 0;

    const bestScore = projectList.length > 0
        ? Math.max(...projectList.map(p => p.score))
        : 0;

    const totalInsights = Object.values(insights).reduce((acc, arr) => acc + arr.length, 0);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                        <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Projetos</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground">{projectList.length}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg shrink-0">
                        <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Score Médio</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground">
                            {averageScore}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg shrink-0">
                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Melhor Score</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground">
                            {bestScore}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-yellow-500/10 rounded-lg shrink-0">
                        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider truncate">Insights</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground">
                            {totalInsights}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
