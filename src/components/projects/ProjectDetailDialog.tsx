import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { StructuredDataViewer } from '@/components/StructuredDataViewer';
import { StructuredDataGenerator } from '@/components/StructuredDataGenerator';
import { ChannelCard } from '@/components/ChannelCard';
import {
  TrendingUp, Eye, MousePointerClick, CheckCircle2, FileText, ChevronDown, FileSearch, Globe, Sparkles, Settings, ChevronsUpDown, BarChart2, Star, AlertTriangle, AlertCircle, Lightbulb, Zap, FolderOpen, RefreshCw, MoreVertical, Pencil, Trash2, Calendar, Shield, Download
} from 'lucide-react';
import { AiAnalysisCard } from '@/components/AiAnalysisCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { exportAsJson, exportAsMarkdown, exportAsHtml, exportAsPdf } from '@/lib/exportAnalysis';
import { AI_MODEL_LABELS } from '@/lib/aiModels';
import type { UrlAnalysis } from '@/lib/urlAnalyzer';
import type { AiAnalysisResult } from '@/lib/aiAnalyzer';
import type { CompetitorStructuredData } from '@/components/StructuredDataViewer';
import type { Insight, ChannelScore } from '@/hooks/useProjectsData';

export function ProjectDetailDialog({
  isOpen,
  onOpenChange,
  project,
  analyzing,
  user,
  expandAll,
  collapseAll,
  heuristicResults,
  toggleSection,
  isSectionCollapsed,
  hasAiKeys,
  canAiAnalysis,
  selectedAiModel,
  setSelectedAiModel,
  availableAiModels,
  aiAnalyzing,
  handleAiAnalysis,
  structuredData,
  channelList,
  channelScores,
  handleScoreChange,
  handleChannelSave,
  typeConfig,
  projectInsights,
  editingInsightId,
  editingInsight,
  setEditingInsight,
  handleInsightUpdate,
  cancelEditInsight,
  handleInsightDelete,
  startEditInsight,
  insightDraft,
  setInsightDraft,
  handleInsightCreate,
  aiResults,
  competitorSdMap,
  setChannelScores
}: any) {
  const scores = channelScores[project.id] || channelList.map((channel: any) => ({ channel, score: 0 } as ChannelScore));
  return (
    <React.Fragment>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onOpenChange?.(false); }}>
        <DialogContent className="w-full h-[100dvh] max-w-none sm:w-[95vw] sm:max-w-4xl sm:h-auto sm:max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 rounded-none sm:rounded-xl sidebar-scroll border-0 sm:border">
          <div className="space-y-6 pt-2">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2">
                <span className="line-clamp-1">{project.name}</span>
                <Badge variant={project.score >= 70 ? "default" : project.score >= 50 ? "secondary" : "destructive"} className="shrink-0 text-xs">
                  Score: {project.score}
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-xs truncate">
                <span>{project.niche}</span> • <span>{project.url}</span>
              </DialogDescription>
            </DialogHeader>
            {/* Removed old manage button row */}


            <div className="space-y-6">
              {/* Collapse / Expand All */}
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  onClick={() => expandAll(project.id)}
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                  Expandir todas
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  onClick={() => collapseAll(project.id)}
                >
                  <ChevronsUpDown className="h-3.5 w-3.5 rotate-90" />
                  Colapsar todas
                </Button>
              </div>

              {/* Heuristic Analysis Results */}
              {(heuristicResults[project.id] || project.heuristic_analysis) && (() => {
                const ha = (heuristicResults[project.id] || project.heuristic_analysis) as UrlAnalysis;
                const scoreItems = [
                  { label: "Proposta de Valor", value: ha.scores.valueProposition, icon: TrendingUp, color: "text-primary" },
                  { label: "Clareza da Oferta", value: ha.scores.offerClarity, icon: Eye, color: "text-blue-500" },
                  { label: "Jornada do Usuário", value: ha.scores.userJourney, icon: MousePointerClick, color: "text-purple-500" },
                  { label: "SEO", value: ha.scores.seoReadiness, icon: Globe, color: "text-green-500" },
                  { label: "Conversão", value: ha.scores.conversionOptimization, icon: CheckCircle2, color: "text-amber-500" },
                  { label: "Conteúdo", value: ha.scores.contentQuality, icon: FileText, color: "text-cyan-500" },
                ];
                const getScoreColor = (v: number) => v >= 70 ? "text-green-600" : v >= 50 ? "text-yellow-600" : "text-red-500";
                const getScoreBg = (v: number) => v >= 70 ? "bg-green-500" : v >= 50 ? "bg-yellow-500" : "bg-red-500";

                return (
                  <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                          onClick={() => toggleSection(project.id, "heuristic")}
                        >
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "heuristic") ? "-rotate-90" : ""}`} />
                          <FileSearch className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                          <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">Análise Heurística</h3>
                          <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline-flex">
                            {project.heuristic_completed_at
                              ? new Date(project.heuristic_completed_at).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                              : "Concluída"}
                          </Badge>
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs h-8 border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => window.location.href = `/seo-geo?project=${project.id}`}
                          title="Análise completa de SEO, Core Web Vitals e Performance"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">SEO & Performance</span>
                          <span className="sm:hidden">SEO</span>
                        </Button>
                        {hasAiKeys && canAiAnalysis ? (
                          <>
                            <Select
                              value={selectedAiModel}
                              onValueChange={setSelectedAiModel}
                              disabled={aiAnalyzing === project.id}
                            >
                              <SelectTrigger className="h-8 w-[130px] sm:w-[160px] text-xs border-primary/30 bg-primary/5">
                                <SelectValue placeholder="Modelo IA" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableAiModels.map((m) => (
                                  <SelectItem key={`${m.provider}::${m.model}`} value={`${m.provider}::${m.model}`} className="text-xs">
                                    {m.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              className="h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 flex-shrink-0"
                              disabled={project.status !== "completed" || analyzing || aiAnalyzing === project.id || !canAiAnalysis}
                              title={!canAiAnalysis ? "Análise por IA indisponível no seu plano" : project.status !== "completed" ? "Aguardando conclusão da análise heurística" : "Executar análise por IA"}
                              onClick={() => handleAiAnalysis(project.id)}
                            >
                              {aiAnalyzing === project.id ? (
                                <div className="relative flex items-center justify-center h-4 w-4">
                                  <span className="absolute h-1.5 w-1.5 rounded-full bg-primary-foreground animate-lab-bubble"></span>
                                  <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/80 animate-lab-bubble-delay -translate-x-1"></span>
                                  <span className="absolute h-1 w-1 rounded-full bg-primary-foreground/60 animate-lab-bubble-delay-2 translate-x-1"></span>
                                </div>
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground text-xs" onClick={() => window.location.href = "/settings"}>
                            <Settings className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Configurar IA</span>
                            <span className="sm:hidden">Config IA</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {!isSectionCollapsed(project.id, "heuristic") && (<>
                      {/* Score Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {scoreItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <div key={item.label} className="bg-muted/50 rounded-lg p-3 text-center space-y-1">
                              <Icon className={`h-4 w-4 mx-auto ${item.color}`} />
                              <p className={`text-xl font-bold ${getScoreColor(item.value)}`}>{item.value}</p>
                              <p className="text-[10px] text-muted-foreground leading-tight">{item.label}</p>
                              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getScoreBg(item.value)}`} style={{ width: `${item.value}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Technical & Content Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5" /> Técnico
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant={ha.technical.hasHttps ? "default" : "destructive"} className="text-[10px]">
                              {ha.technical.hasHttps ? "✓ HTTPS" : "✗ Sem HTTPS"}
                            </Badge>
                            <Badge variant={ha.technical.hasViewport ? "default" : "destructive"} className="text-[10px]">
                              {ha.technical.hasViewport ? "✓ Mobile" : "✗ Sem viewport"}
                            </Badge>
                            <Badge variant={ha.technical.hasAnalytics ? "default" : "secondary"} className="text-[10px]">
                              {ha.technical.hasAnalytics ? "✓ Analytics" : "✗ Sem analytics"}
                            </Badge>
                            <Badge variant={ha.technical.hasStructuredData ? "default" : "secondary"} className="text-[10px]">
                              {ha.technical.hasStructuredData ? "✓ Schema" : "✗ Sem schema"}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              ⏱ {ha.technical.loadTimeEstimate}
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" /> Conteúdo
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge variant="outline" className="text-[10px]">
                              {ha.content.wordCount} palavras
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {ha.content.ctaCount} CTAs
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {ha.content.formCount} formulários
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {ha.content.imageCount} imagens
                            </Badge>
                            {ha.content.hasVideo && <Badge className="text-[10px]">✓ Vídeo</Badge>}
                            {ha.content.hasSocialProof && <Badge className="text-[10px]">✓ Prova social</Badge>}
                            {ha.content.hasPricing && <Badge className="text-[10px]">✓ Preços</Badge>}
                            {ha.content.hasFAQ && <Badge className="text-[10px]">✓ FAQ</Badge>}
                          </div>
                        </div>
                      </div>

                      {/* Meta Info */}
                      {(ha.meta.title || ha.meta.description) && (
                        <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                          {ha.meta.title && (
                            <p className="text-xs"><span className="font-medium text-foreground">Título:</span> <span className="text-muted-foreground">{ha.meta.title}</span></p>
                          )}
                          {ha.meta.description && (
                            <p className="text-xs"><span className="font-medium text-foreground">Descrição:</span> <span className="text-muted-foreground">{ha.meta.description.substring(0, 160)}</span></p>
                          )}
                          {ha.content.h1.length > 0 && (
                            <p className="text-xs"><span className="font-medium text-foreground">H1:</span> <span className="text-muted-foreground">{ha.content.h1[0]}</span></p>
                          )}
                        </div>
                      )}
                    </>)}
                  </div>
                );
              })()}

              {/* Extracted Structured Data & HTML Snapshot */}
              {(heuristicResults[project.id] || project.heuristic_analysis) && (() => {
                const ha = (heuristicResults[project.id] || project.heuristic_analysis) as UrlAnalysis;
                // Build structured data from Edge Function response, DB columns, or synthesize from meta
                const sd = ha.structuredData || (project as any).structured_data;
                const hs = ha.htmlSnapshot || (project as any).html_snapshot;
                // If no structured data from Edge Function, synthesize OG from existing meta
                const fallbackSd = !sd && ha.meta ? {
                  jsonLd: [],
                  microdata: [],
                  openGraph: Object.fromEntries(
                    [
                      ha.meta.ogTitle && ["og:title", ha.meta.ogTitle],
                      ha.meta.ogDescription && ["og:description", ha.meta.ogDescription],
                      ha.meta.ogImage && ["og:image", ha.meta.ogImage],
                      ha.meta.language && ["og:locale", ha.meta.language],
                    ].filter(Boolean) as [string, string][]
                  ),
                  twitterCard: {},
                } : null;
                const finalSd = sd || fallbackSd;
                const compSd = competitorSdMap[project.id] || [];

                // Only render if there's data to show
                if (!finalSd && !hs && (!compSd || compSd.length === 0)) return null;

                return (
                  <>
                    <StructuredDataViewer
                      structuredData={finalSd}
                      htmlSnapshot={hs}
                      htmlSnapshotAt={(project as any).html_snapshot_at}
                      competitors={compSd}
                      projectName={project.name}
                    />
                    <StructuredDataGenerator
                      projectStructuredData={finalSd}
                      projectMeta={ha.meta}
                      projectUrl={project.url}
                      projectName={project.name}
                      projectNiche={project.niche}
                      competitors={compSd}
                    />
                  </>
                );
              })()}

              {/* Extracted AI Analysis Section (Status, Loading, Results) */}
              {/* AI Analysis Status / Placeholder - only show if completed & no results & not analyzing */}
              {project.status === "completed" && !aiResults[project.id] && !project.ai_analysis && aiAnalyzing !== project.id && (
                <div className={`rounded-lg border border-dashed p-3 flex items-center gap-3 ${canAiAnalysis ? "border-primary/30 bg-primary/5" : "border-amber-500/30 bg-amber-500/5"}`}>
                  <Sparkles className={`h-5 w-5 flex-shrink-0 ${canAiAnalysis ? "text-primary" : "text-amber-500"}`} />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">
                      {canAiAnalysis ? "Análise por IA disponível" : "Análise por IA indisponível no seu plano"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {!canAiAnalysis
                        ? "Faça upgrade para o plano Professional para desbloquear a análise por IA."
                        : hasAiKeys
                          ? "Clique em \"Analisar com IA\" para obter insights semânticos aprofundados."
                          : "Configure suas API keys em Configurações → Integrações de IA para habilitar."}
                    </p>
                  </div>
                  {canAiAnalysis && !hasAiKeys && (
                    <Button size="sm" variant="outline" className="text-xs flex-shrink-0" onClick={() => window.location.href = "/settings"}>
                      Configurar
                    </Button>
                  )}
                </div>
              )}

              {/* AI Analyzing Loading — Lab animation */}
              {aiAnalyzing === project.id && (
                <div className="rounded-lg border border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10 p-4 flex items-center gap-4">
                  <div className="relative h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
                    <span className="absolute h-2 w-2 rounded-full bg-primary animate-lab-bubble"></span>
                    <span className="absolute h-1.5 w-1.5 rounded-full bg-primary/70 animate-lab-bubble-delay -translate-x-1.5"></span>
                    <span className="absolute h-1.5 w-1.5 rounded-full bg-primary/50 animate-lab-bubble-delay-2 translate-x-1.5"></span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Preparando análise semântica...</p>
                    <p className="text-xs text-muted-foreground">
                      Processando com {selectedAiModel.split("::")[1] ? (AI_MODEL_LABELS[selectedAiModel.split("::")[1]] || selectedAiModel.split("::")[1]) : "IA"}. Isso pode levar até 30 segundos.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Analysis Results Section */}
              {(() => {
                const ai = aiResults[project.id] || project.ai_analysis as AiAnalysisResult | undefined;
                if (!ai) return null;

                const verdictConfig: Record<string, { label: string; color: string }> = {
                  recommended: { label: "Recomendado", color: "text-green-600 bg-green-500/10" },
                  caution: { label: "Cautela", color: "text-yellow-600 bg-yellow-500/10" },
                  not_recommended: { label: "Não recomendado", color: "text-red-500 bg-red-500/10" },
                };
                const priorityConfig: Record<string, { label: string; color: string }> = {
                  high: { label: "Alta", color: "bg-red-500" },
                  medium: { label: "Média", color: "bg-yellow-500" },
                  low: { label: "Baixa", color: "bg-blue-500" },
                };
                const readinessColor = ai.investmentReadiness.score >= 70 ? "text-green-600" : ai.investmentReadiness.score >= 50 ? "text-yellow-600" : "text-red-500";

                return (
                  <div className="border border-primary/20 rounded-xl p-3 sm:p-4 md:p-6 space-y-5 bg-primary/[0.02]">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                          onClick={() => toggleSection(project.id, "ai")}
                        >
                          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "ai") ? "-rotate-90" : ""}`} />
                          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                          <h3 className="text-sm sm:text-base font-semibold text-foreground truncate">Análise por IA</h3>
                          <Badge variant="outline" className="text-[10px] sm:text-xs hidden sm:inline-flex">
                            {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {ai.model.split("-").slice(0, 3).join("-")}
                          </Badge>
                        </button>
                        {/* Mobile: dropdown export | Desktop: inline buttons */}
                        {(() => {
                          const ha = heuristicResults[project.id] || project.heuristic_analysis as UrlAnalysis | undefined;
                          const exportData = { projectName: project.name, projectUrl: project.url, projectNiche: project.niche, heuristic: ha as UrlAnalysis | undefined, ai };
                          return (
                            <>
                              <div className="hidden sm:flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsJson(exportData)} title="Exportar JSON">
                                  <Download className="h-3 w-3 mr-1" />JSON
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsMarkdown(exportData)} title="Exportar Markdown">
                                  MD
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsHtml(exportData)} title="Exportar HTML">
                                  HTML
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground" onClick={() => exportAsPdf(exportData)} title="Exportar PDF">
                                  PDF
                                </Button>
                              </div>
                              <div className="sm:hidden">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-7 w-7">
                                      <Download className="h-3.5 w-3.5" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => exportAsJson(exportData)}>Exportar JSON</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportAsMarkdown(exportData)}>Exportar Markdown</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportAsHtml(exportData)}>Exportar HTML</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => exportAsPdf(exportData)}>Exportar PDF</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                      {ai.analyzedAt && (
                        <p className="text-[10px] text-muted-foreground pl-7 sm:pl-9">
                          {ai.provider === "google_gemini" ? "Gemini" : "Claude"} • {new Date(ai.analyzedAt).toLocaleDateString("pt-BR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>

                    {!isSectionCollapsed(project.id, "ai") && (<>
                      {/* Summary */}
                      <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-sm text-foreground leading-relaxed">{ai.summary}</p>
                      </div>

                      {/* Investment Readiness */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-muted/30 rounded-lg p-3 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Prontidão p/ Investimento</p>
                          <p className={`text-2xl font-bold ${readinessColor}`}>{ai.investmentReadiness.score}</p>
                          <Badge className={`mt-1 text-[10px] ${ai.investmentReadiness.level === "high" ? "bg-green-500" : ai.investmentReadiness.level === "medium" ? "bg-yellow-500" : "bg-red-500"}`}>
                            {ai.investmentReadiness.level === "high" ? "Alto" : ai.investmentReadiness.level === "medium" ? "Médio" : "Baixo"}
                          </Badge>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-3 sm:col-span-2">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Justificativa</p>
                          <p className="text-xs text-foreground leading-relaxed">{ai.investmentReadiness.justification}</p>
                        </div>
                      </div>

                      {/* SWOT-like: Strengths, Weaknesses, Opportunities */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 space-y-1.5">
                          <p className="text-xs font-semibold text-green-700 dark:text-green-400">Pontos Fortes</p>
                          {ai.strengths.map((s, i) => (
                            <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span> {s}
                            </p>
                          ))}
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 space-y-1.5">
                          <p className="text-xs font-semibold text-red-700 dark:text-red-400">Fraquezas</p>
                          {ai.weaknesses.map((w, i) => (
                            <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                              <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span> {w}
                            </p>
                          ))}
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 space-y-1.5">
                          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Oportunidades</p>
                          {ai.opportunities.map((o, i) => (
                            <p key={i} className="text-[11px] text-foreground flex items-start gap-1.5">
                              <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span> {o}
                            </p>
                          ))}
                        </div>
                      </div>

                      {/* Channel Recommendations */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Recomendações por Canal</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {ai.channelRecommendations.map((ch, i) => {
                            const vc = verdictConfig[ch.verdict] || verdictConfig.caution;
                            return (
                              <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-foreground">{ch.channel}</p>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${vc.color}`}>{vc.label}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{ch.reasoning}</p>
                                {ch.suggestedBudgetAllocation && (
                                  <p className="text-[10px] text-primary font-medium">Budget: {ch.suggestedBudgetAllocation}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Recomendações Estratégicas</p>
                        <div className="space-y-2">
                          {ai.recommendations.map((rec, i) => {
                            const pc = priorityConfig[rec.priority] || priorityConfig.medium;
                            return (
                              <div key={i} className="bg-muted/30 rounded-lg p-3 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`h-2 w-2 rounded-full ${pc.color} flex-shrink-0`}></span>
                                  <p className="text-xs font-semibold text-foreground">{rec.title}</p>
                                  <Badge variant="outline" className="text-[9px] ml-auto">{rec.category}</Badge>
                                </div>
                                <p className="text-[11px] text-muted-foreground pl-4">{rec.description}</p>
                                <p className="text-[10px] text-primary font-medium pl-4">Impacto: {rec.expectedImpact}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Competitive Position */}
                      {ai.competitivePosition && (
                        <div className="bg-muted/30 rounded-lg p-3">
                          <p className="text-xs font-semibold text-foreground mb-1">Posição Competitiva</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">{ai.competitivePosition}</p>
                        </div>
                      )}
                    </>)}
                  </div>
                );
              })()}

              {/* Project Score Overview */}
              <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                <button
                  type="button"
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleSection(project.id, "overview")}
                >
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "overview") ? "-rotate-90" : ""}`} />
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Visão Geral do Projeto</h3>
                </button>
                {!isSectionCollapsed(project.id, "overview") && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Score</p>
                      <p className={`text-xl sm:text-3xl font-bold ${project.score >= 70 ? "text-green-600" : project.score >= 50 ? "text-yellow-600" : "text-red-500"
                        }`}>{project.score}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">de 100</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Status</p>
                      <p className="text-sm sm:text-lg font-semibold text-foreground capitalize">{project.status === "completed" ? "Concluído" : project.status === "analyzing" ? "Analisando" : "Pendente"}</p>
                    </div>
                    <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                      <p className="text-[10px] sm:text-sm text-muted-foreground mb-1">Análise</p>
                      <p className="text-sm sm:text-lg font-semibold text-foreground">
                        {project.last_update ? new Date(project.last_update).toLocaleDateString("pt-BR", { day: "numeric", month: "short" }) : "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Channel Scores Cards */}
              <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleSection(project.id, "channels")}
                  >
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "channels") ? "-rotate-90" : ""}`} />
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">Scores por Canal</h3>
                  </button>
                  {!isSectionCollapsed(project.id, "channels") && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => handleChannelSave(project.id)}>
                      <span className="hidden sm:inline">Salvar alterações</span>
                      <span className="sm:hidden">Salvar</span>
                    </Button>
                  )}
                </div>
                {!isSectionCollapsed(project.id, "channels") && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {channelList.map((channel) => {
                      const existing = scores.find((item) => item.channel === channel) || { channel, score: 0 } as ChannelScore;
                      const channelNames: Record<string, string> = { google: "Google Ads", meta: "Meta Ads", linkedin: "LinkedIn Ads", tiktok: "TikTok Ads" };
                      const channelLogos: Record<string, string> = { google: "/google-ads.svg", meta: "/meta-ads.svg", linkedin: "/linkedin-ads.svg", tiktok: "/tiktok-ads.svg" };
                      const channelColors: Record<string, string> = { google: "border-blue-500/30 bg-blue-500/5", meta: "border-indigo-500/30 bg-indigo-500/5", linkedin: "border-cyan-500/30 bg-cyan-500/5", tiktok: "border-zinc-500/30 bg-zinc-500/5" };
                      const scoreColor = existing.score >= 70 ? "text-green-600" : existing.score >= 50 ? "text-yellow-600" : "text-red-500";

                      return (
                        <div key={channel} className={`rounded-xl border p-3 sm:p-4 space-y-3 ${channelColors[channel]}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center bg-white dark:bg-gray-900 border border-border/50 p-1 sm:p-1.5 flex-shrink-0">
                                <img src={channelLogos[channel]} alt={channelNames[channel]} className={`w-full h-full object-contain ${channel === "tiktok" ? "dark:brightness-0 dark:invert" : ""}`} />
                              </div>
                              <h4 className="text-sm sm:text-base font-semibold text-foreground">{channelNames[channel]}</h4>
                            </div>
                            <span className={`text-xl sm:text-2xl font-bold ${scoreColor}`}>{existing.score}</span>
                          </div>
                          {existing.is_recommended !== undefined && (
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${existing.is_recommended ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-500"
                              }`}>
                              {existing.is_recommended ? "✓ Recomendado" : "✗ Não recomendado"}
                            </span>
                          )}
                          {existing.objective && (
                            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Objetivo:</span> {existing.objective}</p>
                          )}
                          {existing.funnel_role && (
                            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Funil:</span> {existing.funnel_role}</p>
                          )}
                          {existing.risks && existing.risks.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-foreground mb-1">Riscos:</p>
                              <ul className="space-y-1">
                                {existing.risks.map((risk, i) => (
                                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                    <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                                    <span>{risk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Editable score */}
                          <div className="pt-2 border-t border-border/50">
                            <label className="text-xs text-muted-foreground">Ajustar score:</label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={existing.score}
                              className="h-8 mt-1"
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                setChannelScores((prev) => {
                                  const current = prev[project.id] || [];
                                  const updated = current.filter((item) => item.channel !== channel);
                                  updated.push({ ...existing, channel, score: value });
                                  return { ...prev, [project.id]: updated };
                                });
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Insights Section */}
              <div className="border border-border rounded-xl p-3 sm:p-4 md:p-6 space-y-4">
                <button
                  type="button"
                  className="flex items-center gap-1.5 sm:gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => toggleSection(project.id, "insights")}
                >
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${isSectionCollapsed(project.id, "insights") ? "-rotate-90" : ""}`} />
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">Insights ({projectInsights.length})</h3>
                </button>

                {!isSectionCollapsed(project.id, "insights") && (<>
                  {projectInsights.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">Nenhum insight gerado. Clique em "Reanalisar URL" para gerar insights automáticos.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {projectInsights.map((insight) => {
                        const typeConfig: Record<string, { label: string; color: string; icon: string }> = {
                          warning: { label: "Alerta", color: "border-yellow-500/30 bg-yellow-500/5", icon: "⚠️" },
                          opportunity: { label: "Oportunidade", color: "border-green-500/30 bg-green-500/5", icon: "💡" },
                          improvement: { label: "Melhoria", color: "border-blue-500/30 bg-blue-500/5", icon: "🔧" },
                        };
                        const config = typeConfig[insight.type] || typeConfig.improvement;

                        return editingInsightId === insight.id ? (
                          <div key={insight.id} className="border border-border rounded-lg p-3 space-y-2">
                            <select
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                              value={editingInsight.type || insight.type}
                              onChange={(e) => setEditingInsight((prev) => ({ ...prev, type: e.target.value as Insight["type"] }))}
                            >
                              <option value="warning">Alerta</option>
                              <option value="opportunity">Oportunidade</option>
                              <option value="improvement">Melhoria</option>
                            </select>
                            <Input placeholder="Título" value={editingInsight.title || ""} onChange={(e) => setEditingInsight((prev) => ({ ...prev, title: e.target.value }))} className="h-8" />
                            <Input placeholder="Descrição" value={editingInsight.description || ""} onChange={(e) => setEditingInsight((prev) => ({ ...prev, description: e.target.value }))} className="h-8" />
                            <Input placeholder="Ação (opcional)" value={editingInsight.action || ""} onChange={(e) => setEditingInsight((prev) => ({ ...prev, action: e.target.value }))} className="h-8" />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleInsightUpdate(project.id, insight.id)}>Salvar</Button>
                              <Button size="sm" variant="outline" onClick={cancelEditInsight}>Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <div key={insight.id} className={`rounded-lg border p-3 space-y-2 ${config.color}`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className="text-base flex-shrink-0">{config.icon}</span>
                                <div className="min-w-0">
                                  <span className="inline-block text-[10px] uppercase font-semibold tracking-wider text-muted-foreground mb-0.5">{config.label}</span>
                                  <p className="text-sm font-medium text-foreground leading-tight">{insight.title}</p>
                                </div>
                              </div>
                              <div className="flex gap-0.5 flex-shrink-0">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEditInsight(insight)}>
                                  <span className="text-xs">✏️</span>
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleInsightDelete(project.id, insight.id)}>
                                  <span className="text-xs">🗑️</span>
                                </Button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                            {insight.action && (
                              <p className="text-xs text-primary font-medium">→ {insight.action}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add insight form */}
                  <details className="group">
                    <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                      + Adicionar insight manualmente
                    </summary>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <select
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={insightDraft.type}
                        onChange={(e) => setInsightDraft((prev) => ({ ...prev, type: e.target.value as Insight["type"] }))}
                      >
                        <option value="warning">Alerta</option>
                        <option value="opportunity">Oportunidade</option>
                        <option value="improvement">Melhoria</option>
                      </select>
                      <Input placeholder="Título" value={insightDraft.title} onChange={(e) => setInsightDraft((prev) => ({ ...prev, title: e.target.value }))} />
                      <Input placeholder="Descrição" value={insightDraft.description} onChange={(e) => setInsightDraft((prev) => ({ ...prev, description: e.target.value }))} />
                      <Input placeholder="Ação (opcional)" value={insightDraft.action} onChange={(e) => setInsightDraft((prev) => ({ ...prev, action: e.target.value }))} />
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button size="sm" onClick={() => handleInsightCreate(project.id)}>Adicionar insight</Button>
                    </div>
                  </details>
                </>)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
