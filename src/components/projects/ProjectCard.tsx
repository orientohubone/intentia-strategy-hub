import React from "react";
import { FolderOpen, Globe, Calendar, RefreshCw, MoreVertical, Pencil, FileText, Trash2, FileSearch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScoreRing } from "@/components/ScoreRing";
import { toast } from "sonner";
import { fetchProjectReport, generateConsolidatedReport } from "@/lib/reportGenerator";

/**
 * ProjectCard
 * Renderiza um dos cards individuais de projeto exibidos na grade principal.
 * Inclui os scores básicos, ações como reanalisar, editar, gerar relatório e excluir.
 */

interface ProjectCardProps {
    project: any;
    user: any;
    analyzing: boolean;
    canAnalyze: boolean;
    setActiveProjectId: (id: string | null) => void;
    handleReanalyze: (id: string) => void;
    startEdit: (id: string) => void;
    handleDeleteProject: (id: string) => void;
}

export function ProjectCard({
    project,
    user,
    analyzing,
    canAnalyze,
    setActiveProjectId,
    handleReanalyze,
    startEdit,
    handleDeleteProject,
}: ProjectCardProps) {
    return (
        <div
            className="rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow group cursor-pointer relative"
            onClick={() => setActiveProjectId(project.id)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveProjectId(project.id);
                }
            }}
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{project.name}</h3>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{project.niche}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <Globe className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{project.url.replace(/^https?:\/\//, "")}</span>
                        </div>
                    </div>
                </div>
                <ScoreRing score={project.score} size="sm" label="Score" />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                <div className="flex items-center gap-2">
                    <Badge variant={project.status === "completed" ? "default" : "secondary"} className="text-[10px] h-5">
                        {project.status === "completed" ? "Concluído" : "Pendente"}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {project.last_update ? new Date(project.last_update).toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit' }) : "-"}
                    </span>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    className="inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted transition-colors disabled:opacity-50 text-muted-foreground hover:text-foreground"
                                    onClick={() => handleReanalyze(project.id)}
                                    disabled={analyzing || !canAnalyze}
                                >
                                    <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? "animate-spin" : ""}`} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                <p>Reanalisar URL</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {project.status === "completed" && project.heuristic_analysis && (
                                <DropdownMenuItem onClick={() => window.location.href = `/heuristic-analysis/${project.id}`}>
                                    <FileSearch className="h-3.5 w-3.5 mr-2" />
                                    Análise Heurística
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => startEdit(project.id)}>
                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            {project.status === "completed" && (
                                <DropdownMenuItem onClick={async () => {
                                    if (!user) return;
                                    toast.info("Gerando relatório...");
                                    try {
                                        const report = await fetchProjectReport(project.id, user.id);
                                        generateConsolidatedReport(report);
                                    } catch (e: any) {
                                        toast.error("Erro ao gerar relatório: " + e.message);
                                    }
                                }}>
                                    <FileText className="h-3.5 w-3.5 mr-2" />
                                    Relatório PDF
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Excluir
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tem certeza que deseja excluir o projeto "{project.name}"? Esta ação não pode ser desfeita.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                            Excluir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
