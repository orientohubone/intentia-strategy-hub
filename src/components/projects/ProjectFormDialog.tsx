import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, BarChart3 } from "lucide-react";

/**
 * ProjectFormDialog
 * Componente responsável pelo modal de Criação e Edição de projetos.
 * Ele recebe o estado do formulário e as funções de manipulação via props.
 */

interface ProjectFormState {
    name: string;
    niche: string;
    url: string;
    competitorUrls: string;
    solutionContext: string;
    missingFeatures: string;
    status: "pending" | "analyzing" | "completed";
}

interface ProjectFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editingId: string | null;
    formState: ProjectFormState;
    setFormState: React.Dispatch<React.SetStateAction<ProjectFormState>>;
    handleProjectSubmit: (e: React.FormEvent) => Promise<void>;
    analyzing: boolean;
    canAnalyze: boolean;
    heuristicCheck: any;
    tenantSettings: any;
    projectCount: number;
    onCancelEdit: () => void;
}

export function ProjectFormDialog({
    isOpen,
    onOpenChange,
    editingId,
    formState,
    setFormState,
    handleProjectSubmit,
    analyzing,
    canAnalyze,
    heuristicCheck,
    tenantSettings,
    projectCount,
    onCancelEdit,
}: ProjectFormDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-full h-[100dvh] max-w-none sm:w-[95vw] sm:max-w-2xl sm:h-auto sm:max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-none sm:rounded-xl sidebar-scroll border-0 sm:border">
                <DialogHeader>
                    <DialogTitle>{editingId ? "Editar Projeto" : "Novo Projeto"}</DialogTitle>
                    <DialogDescription>
                        {editingId ? "Atualize as informações do seu projeto." : "Preencha os dados do projeto para receber seu diagnóstico heurístico e score de mídia."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleProjectSubmit} className="grid gap-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Projeto</Label>
                            <Input
                                id="name"
                                value={formState.name}
                                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="niche">Nicho</Label>
                            <Input
                                id="niche"
                                value={formState.niche}
                                onChange={(e) => setFormState((prev) => ({ ...prev, niche: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="solutionContext">Contexto da solução</Label>
                            <textarea
                                id="solutionContext"
                                className="w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Descreva o produto/solução, funcionalidades, diferenciais e proposta de valor. Isso será usado na linha editorial."
                                value={formState.solutionContext}
                                onChange={(e) => setFormState((prev) => ({ ...prev, solutionContext: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="missingFeatures">O que não temos (lacunas/funcionalidades ausentes)</Label>
                            <textarea
                                id="missingFeatures"
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="Liste funcionalidades, integrações ou características que ainda não existem no projeto (ex.: checkout nativo, onboarding guiado, integrações ERP X)."
                                value={formState.missingFeatures}
                                onChange={(e) => setFormState((prev) => ({ ...prev, missingFeatures: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">Usaremos estas lacunas para deixar o ICP e o plano de comunicação mais coerentes (não inventar features ausentes).</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">URL do Projeto</Label>
                            <Input
                                id="url"
                                placeholder="https://meusite.com.br"
                                value={formState.url}
                                onChange={(e) => setFormState((prev) => ({ ...prev, url: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={formState.status}
                                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value as any }))}
                            >
                                <option value="pending">Pendente</option>
                                <option value="analyzing">Em análise</option>
                                <option value="completed">Concluído</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="competitors">URLs dos Concorrentes (uma por linha)</Label>
                        <textarea
                            id="competitors"
                            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder={"https://concorrente1.com.br\nhttps://concorrente2.com.br\nhttps://concorrente3.com.br"}
                            value={formState.competitorUrls}
                            onChange={(e) => setFormState((prev) => ({ ...prev, competitorUrls: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">
                            Adicione as URLs dos seus principais concorrentes para gerar um benchmark comparativo automático.
                        </p>
                    </div>
                    {!canAnalyze && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                            <span>
                                {heuristicCheck.status === "plan_blocked"
                                    ? "O Diagnóstico Heurístico de URL não está disponível no seu plano atual. Faça upgrade para desbloquear esta funcionalidade."
                                    : heuristicCheck.status === "disabled"
                                        ? "O Diagnóstico Heurístico de URL está temporariamente desativado."
                                        : heuristicCheck.status === "maintenance"
                                            ? "O Diagnóstico Heurístico de URL está em manutenção. Voltamos em breve."
                                            : heuristicCheck.status === "development"
                                                ? "O Diagnóstico Heurístico de URL está em desenvolvimento. Em breve!"
                                                : heuristicCheck.message || "Diagnóstico heurístico indisponível no momento."}
                                {" "}O projeto será criado sem análise automática.
                            </span>
                        </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button type="submit" disabled={analyzing} className="text-sm">
                            {analyzing ? (
                                <>
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></span>
                                    <span className="hidden sm:inline">Análise em andamento...</span>
                                    <span className="sm:hidden">Analisando...</span>
                                </>
                            ) : editingId ? "Salvar alterações" : canAnalyze ? (
                                <><span className="hidden sm:inline">Criar projeto e analisar URL</span><span className="sm:hidden">Criar e analisar</span></>
                            ) : "Criar projeto"}
                        </Button>
                        {editingId && (
                            <Button type="button" variant="outline" disabled={analyzing} onClick={onCancelEdit}>
                                Cancelar
                            </Button>
                        )}
                        {tenantSettings && (() => {
                            const plan = tenantSettings.plan || 'starter';
                            const maxProj = (tenantSettings as any).max_projects ?? (plan === 'starter' ? 5 : -1);
                            const projCount = projectCount;
                            const projUnlimited = maxProj < 0;
                            const projAtLimit = !projUnlimited && projCount >= maxProj;
                            const projNear = !projUnlimited && !projAtLimit && maxProj - projCount <= 1;

                            const aUsed = tenantSettings.analyses_used;
                            const aLimit = tenantSettings.monthly_analyses_limit;
                            const aUnlimited = aLimit < 0;
                            const aAtLimit = !aUnlimited && aUsed >= aLimit;
                            const aNear = !aUnlimited && !aAtLimit && aLimit - aUsed <= 2;

                            const worst = projAtLimit || aAtLimit ? "limit" : projNear || aNear ? "near" : "ok";
                            return (
                                <div className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-md border ${worst === "limit"
                                        ? "bg-red-500/10 border-red-500/20 text-red-500"
                                        : worst === "near"
                                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                                            : "bg-muted/50 border-border text-muted-foreground"
                                    }`}>
                                    <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="font-medium">
                                        {projUnlimited ? `${projCount} proj` : `${projCount}/${maxProj} proj`}
                                    </span>
                                    <span className="text-muted-foreground/50">|</span>
                                    <span className="font-medium">
                                        {aUnlimited ? `${aUsed} análises` : `${aUsed}/${aLimit} análises`}
                                    </span>
                                    {(projAtLimit || aAtLimit) && <span className="text-[10px]">• Limite atingido</span>}
                                </div>
                            );
                        })()}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
