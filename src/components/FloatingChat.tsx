import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  X, 
  Maximize2, 
  Minimize2,
  CheckCheck,
  ChevronDown,
  Crown,
  Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { SupportTicketMessage } from "@/lib/supportTypes";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { helpCategories, faqItems } from "@/components/help";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { TiaGuidedSection } from "@/components/floating-chat/TiaGuidedSection";
import { TiaAskSection } from "@/components/floating-chat/TiaAskSection";
import type { AssistantStep, StepHelp, TiaMessage } from "@/components/floating-chat/types";

export function FloatingChat() {
  const BUTTON_SIZE = 56;
  const PANEL_GAP = 12;
  const PANEL_HEIGHT = 500;
  const VIEWPORT_PADDING = 8;

  const TIA_STEP_ORDER = [
    "onboarding-account",
    "first-project",
    "connect-integrations",
    "ai-setup",
    "next-steps",
  ] as const;

  const TIA_HELP_FOCUS_MAP: Record<string, string> = {
    "onboarding-account": "getting-started",
    "first-project": "getting-started",
    "connect-integrations": "integrations",
    "ai-setup": "ai-analysis",
    "next-steps": "benchmark",
  };

  const SUGGESTION_FOCUS_MAP: Record<string, string> = {
    "Criando sua conta": "getting-started:criando-sua-conta",
    "Primeiro projeto": "getting-started:primeiro-projeto",
    "Dashboard": "getting-started:dashboard",
  };

  const TIA_HELP_MAP: Record<string, { categories: string[]; faqCategories: string[] }> = {
    "onboarding-account": { categories: ["getting-started", "settings"], faqCategories: ["planos", "configuracoes"] },
    "first-project": { categories: ["getting-started", "url-analysis"], faqCategories: ["analise", "planos"] },
    "connect-integrations": { categories: ["integrations"], faqCategories: ["integracoes", "operacoes"] },
    "ai-setup": { categories: ["ai-analysis"], faqCategories: ["ia", "analise"] },
    "next-steps": { categories: ["benchmark", "operations", "budget"], faqCategories: ["benchmark", "operacoes", "exports"] },
  };

  const getHelpForStep = (step: string): StepHelp => {
    const map = TIA_HELP_MAP[step] ?? TIA_HELP_MAP["onboarding-account"];
    const articles = helpCategories
      .filter((c) => map.categories.includes(c.id))
      .flatMap((cat) => cat.articles.map((a) => ({ ...a, categoryTitle: cat.title })))
      .slice(0, 3);

    const faqs = faqItems
      .filter((faq) => map.faqCategories.includes(faq.category))
      .slice(0, 3);

    return { articles, faqs };
  };

  const TIA_GUIDE_STEPS: Record<string, AssistantStep> = {
    "onboarding-account": {
      key: "onboarding-account",
      title: "Criando sua conta",
      summary: "Configure seu perfil, empresa e plano para começar a medir resultados.",
      tips: [
        "Complete nome e empresa para personalizar os dashboards",
        "Defina o plano e limite inicial de análises",
        "Salve suas credenciais de acesso com segurança"
      ],
      resources: [
        { label: "Central de ajuda", href: "/help" },
        { label: "Configurações", href: "/settings" },
      ],
      next: "first-project",
    },
    "first-project": {
      key: "first-project",
      title: "Primeiro projeto",
      summary: "Cadastre a URL principal, nicho e concorrentes para gerar insights.",
      tips: [
        "Informe concorrentes para enriquecer o benchmark",
        "Revise o status do projeto após a análise",
        "Use os insights iniciais para planejar ações rápidas"
      ],
      resources: [
        { label: "Projetos", href: "/projects" },
        { label: "Insights", href: "/insights" },
      ],
      next: "connect-integrations",
    },
    "connect-integrations": {
      key: "connect-integrations",
      title: "Integrações e dados",
      summary: "Conecte contas de mídia para sincronizar métricas automaticamente.",
      tips: [
        "Google/Meta/LinkedIn/TikTok alimentam Operações e Budget",
        "Defina frequência de sync conforme volume de campanhas",
        "Tokens ficam isolados por conta e podem ser revogados"
      ],
      resources: [
        { label: "Integrações", href: "/integracoes" },
        { label: "Operações", href: "/operations" },
      ],
      next: "ai-setup",
    },
    "ai-setup": {
      key: "ai-setup",
      title: "IA e análises táticas",
      summary: "Configure chaves de IA e use diagnósticos para priorizar ações.",
      tips: [
        "Cadastre Gemini/Claude em Configurações > IA",
        "Rode o diagnóstico heurístico antes da IA",
        "Use insights de canal para ajustar budget e criativos"
      ],
      resources: [
        { label: "Configurar IA", href: "/settings" },
        { label: "Score de Canal", href: "/score-canal" },
      ],
      next: "next-steps",
    },
    "next-steps": {
      key: "next-steps",
      title: "Próximos passos",
      summary: "Planeje o roadmap: benchmarks, alertas e relatórios.",
      tips: [
        "Use alertas para evitar investimentos prematuros",
        "Revise benchmarks para achar gaps",
        "Programe relatórios e dashboards recorrentes"
      ],
      resources: [
        { label: "Alertas", href: "/alertas" },
        { label: "Benchmark", href: "/benchmark" },
      ],
    },
  };

  const { user } = useAuth();
  const { tenantSettings } = useTenantData();
  const navigate = useNavigate();

  const tenantIdForAI = (tenantSettings as any)?.id || tenantSettings?.user_id || user?.id || "";
  const tenantContext = {
    tenantId: tenantIdForAI,
    plan: tenantSettings?.plan ?? "starter",
    email: user?.email ?? "",
  };

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estado para arrastar o botão
  const [buttonPosition, setButtonPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);

  const isPro = tenantSettings?.plan === 'professional' || tenantSettings?.plan === 'enterprise';

  // Funções de arrastar para o botão
  const handleButtonMouseDown = (e: React.MouseEvent) => {
    dragMovedRef.current = false;
    if (open) {
      setIsDragging(false);
      return; // Não permite arrastar quando o chat está aberto
    }

    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    elementStartPos.current = { x: buttonPosition.x, y: buttonPosition.y };
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || open) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      dragMovedRef.current = true;
    }

    const newX = elementStartPos.current.x + deltaX;
    const newY = elementStartPos.current.y + deltaY;

    // Limitar posição dentro da viewport
    const maxX = viewportSize.width - BUTTON_SIZE;
    const maxY = viewportSize.height - BUTTON_SIZE;

    setButtonPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, open, viewportSize.width, viewportSize.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleButtonClick = () => {
    if (!open && dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    setIsDragging(false);
    setOpen(!open);
  };

  useEffect(() => {
    const onResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const maxX = viewportSize.width - BUTTON_SIZE;
    const maxY = viewportSize.height - BUTTON_SIZE;
    setButtonPosition((prev) => ({
      x: Math.max(0, Math.min(prev.x, maxX)),
      y: Math.max(0, Math.min(prev.y, maxY)),
    }));
  }, [viewportSize.width, viewportSize.height]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Buscar ticket de chat ativo (último aberto/em andamento)
  const loadActiveTicket = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await (supabase as any)
        .from("support_tickets")
        .select("id")
        .in("status", ["aberto", "em_analise", "em_andamento", "aguardando_cliente"])
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        setActiveTicketId(data[0].id);
      }
    } catch (e) {
      console.error("Error loading active ticket:", e);
    }
  }, [user]);

  // Carregar mensagens
  const loadMessages = useCallback(async () => {
    if (!activeTicketId) return;
    try {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", activeTicketId)
        .order("created_at", { ascending: true });

      if (!error) {
        setMessages(data || []);
      }
    } catch (e) {
      console.error("Error loading messages:", e);
    }
  }, [activeTicketId]);

  // Contar mensagens não lidas (admin messages sem read_at)
  const countUnread = useCallback(async () => {
    if (!activeTicketId || open) return;
    try {
      const { count, error } = await (supabase as any)
        .from("support_ticket_messages")
        .select("*", { count: "exact", head: true })
        .eq("ticket_id", activeTicketId)
        .eq("sender_type", "admin")
        .is("read_at", null);

      if (!error && count) {
        setUnreadCount(count);
      }
    } catch (e) {
      // silently fail
    }
  }, [activeTicketId, open]);

  useEffect(() => {
    if (isPro) {
      loadActiveTicket();
    }
  }, [isPro, loadActiveTicket]);

  useEffect(() => {
    if (activeTicketId) {
      loadMessages();
      countUnread();
    }
  }, [activeTicketId, loadMessages, countUnread]);

  // Real-time messages
  useEffect(() => {
    if (!activeTicketId) return;

    const channel = supabase
      .channel('floating_chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_ticket_messages',
        filter: `ticket_id=eq.${activeTicketId}`
      }, () => {
        loadMessages();
        if (!open) {
          setUnreadCount(prev => prev + 1);
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [activeTicketId, open, loadMessages]);

  // Scroll to bottom
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [open, messages.length]);

  // Mark as read when opening
  useEffect(() => {
    if (open && activeTicketId) {
      setUnreadCount(0);
      // Mark admin messages as read
      (supabase as any)
        .from("support_ticket_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("ticket_id", activeTicketId)
        .eq("sender_type", "admin")
        .is("read_at", null)
        .then(() => {});
    }
  }, [open, activeTicketId]);

  // Enviar mensagem
  const handleSend = async () => {
    if (!newMessage.trim() || sending || !activeTicketId) return;

    setSending(true);
    try {
      const { error } = await (supabase as any)
        .from("support_ticket_messages")
        .insert({
          ticket_id: activeTicketId,
          sender_id: user?.id,
          sender_type: "client",
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
      loadMessages();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error("Erro ao enviar: " + message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const fmtDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const yest = new Date(now);
    yest.setDate(yest.getDate() - 1);
    if (date.toDateString() === now.toDateString()) return 'Hoje';
    if (date.toDateString() === yest.toDateString()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
  };

  const groupByDate = () => {
    const groups: { label: string; msgs: SupportTicketMessage[] }[] = [];
    let current = '';
    messages.forEach(m => {
      const key = new Date(m.created_at).toDateString();
      if (key !== current) {
        current = key;
        groups.push({ label: fmtDate(m.created_at), msgs: [m] });
      } else {
        groups[groups.length - 1].msgs.push(m);
      }
    });
    return groups;
  };

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Eu';
  const userAvatarUrl = user?.user_metadata?.avatar_url || '';
  const userInitial = userName.charAt(0).toUpperCase();
  const panelWidth = Math.min(384, viewportSize.width - (VIEWPORT_PADDING * 2));
  const availableAbove = Math.max(0, buttonPosition.y - VIEWPORT_PADDING - PANEL_GAP);
  const availableBelow = Math.max(
    0,
    viewportSize.height - (buttonPosition.y + BUTTON_SIZE) - VIEWPORT_PADDING - PANEL_GAP
  );
  const canFitAboveFull = availableAbove >= PANEL_HEIGHT;
  const canFitBelowFull = availableBelow >= PANEL_HEIGHT;
  const shouldPlaceAbove =
    canFitAboveFull || (!canFitBelowFull && availableAbove >= availableBelow);
  const selectedSpace = shouldPlaceAbove ? availableAbove : availableBelow;
  const panelHeightForLayout = Math.max(0, Math.min(PANEL_HEIGHT, selectedSpace));
  const centeredLeft = buttonPosition.x + (BUTTON_SIZE / 2) - (panelWidth / 2);
  const clampedLeft = Math.max(
    VIEWPORT_PADDING,
    Math.min(centeredLeft, viewportSize.width - panelWidth - VIEWPORT_PADDING)
  );
  const clampedTop = shouldPlaceAbove
    ? buttonPosition.y - panelHeightForLayout - PANEL_GAP
    : buttonPosition.y + BUTTON_SIZE + PANEL_GAP;
  const floatingPanelStyle = {
    left: `${clampedLeft}px`,
    top: `${clampedTop}px`,
    width: `${panelWidth}px`,
    height: `${panelHeightForLayout}px`,
    maxHeight: `${panelHeightForLayout}px`,
  } as const;

  if (!user) return null;

  // --- Tia (Starter) — assistente guiada com conteúdo da central/FAQs ---
  const [tiaStep, setTiaStep] = useState<string>("onboarding-account");
  const [tiaMessages, setTiaMessages] = useState<TiaMessage[]>([
    { role: "assistant", content: "Oi! Sou a Tia. Pode perguntar sobre seus projetos, análises ou próximos passos." },
  ]);
  const [tiaGreeted, setTiaGreeted] = useState(false);
  const [tiaInput, setTiaInput] = useState("");
  const [tiaLoading, setTiaLoading] = useState(false);
  const [tiaMode, setTiaMode] = useState<"guided" | "ask">("guided");
  const currentStep = TIA_GUIDE_STEPS[tiaStep] ?? TIA_GUIDE_STEPS["onboarding-account"];
  const predictedStep = currentStep.next ? TIA_GUIDE_STEPS[currentStep.next] : null;
  const stepHelp = getHelpForStep(tiaStep);
  const stepIndex = TIA_STEP_ORDER.indexOf(tiaStep as typeof TIA_STEP_ORDER[number]);
  const hasPrev = stepIndex > 0;
  const hasNext = stepIndex >= 0 && stepIndex < TIA_STEP_ORDER.length - 1;

  const goPrevStep = () => {
    if (!hasPrev) return;
    const prev = TIA_STEP_ORDER[stepIndex - 1];
    setTiaStep(prev);
  };

  const goNextStep = () => {
    if (!hasNext) return;
    const nxt = TIA_STEP_ORDER[stepIndex + 1];
    setTiaStep(nxt);
  };
 
  const FUNCTION_SLUG = "assistant-ia";

  const callAssistantIA = async (messages: { role: "user" | "assistant" | "system"; content: string }[]) => {
    if (!tenantContext.tenantId) {
      toast.error("Tenant não identificado para IA");
      return null;
    }

    // Sempre pega sessão atual; se ausente, tenta refresh.
    const sessionRes = await supabase.auth.getSession();
    let accessToken = sessionRes.data.session?.access_token;
    if (!accessToken) {
      const refreshed = await supabase.auth.refreshSession();
      accessToken = refreshed.data.session?.access_token;
    }

    if (!accessToken) {
      toast.error("Sessão expirada. Faça login novamente.");
      return null;
    }

    // Usa invoke sem headers manuais (supabase-js envia o token atual)
    const invokeOnce = async () =>
      supabase.functions.invoke(FUNCTION_SLUG, {
        body: {
          messages,
          tenantContext: {
            tenantId: tenantContext.tenantId,
            plan: tenantContext.plan,
            email: user?.email ?? tenantContext.email,
          },
        },
      });

    let { data, error } = await invokeOnce();

    // Se erro for 401, tenta refresh e reenvia uma vez
    if (error && (error as any)?.status === 401) {
      const refreshed = await supabase.auth.refreshSession();
      accessToken = refreshed.data.session?.access_token;
      if (!accessToken) {
        toast.error("Sessão expirada. Faça login novamente.");
        return null;
      }
      ({ data, error } = await invokeOnce());
    }

    if (error) {
      console.error("assistant-ia invoke error", error);
      toast.error(`Erro ao acionar assistente IA${(error as any)?.status ? ` (${(error as any).status})` : ""}`);
      return null;
    }

    return data;
  };

  const sendTiaMessage = async () => {
    if (!tiaInput.trim() || tiaLoading) return;
    const userMsg = { role: "user" as const, content: tiaInput.trim() };
    const nextMessages = [...tiaMessages, userMsg];
    setTiaMessages(nextMessages);
    setTiaInput("");
    setTiaLoading(true);
    try {
      const payload = await callAssistantIA(nextMessages);
      if (payload) {
        const displayName = (user as any)?.user_metadata?.full_name || user?.email || "você";
        const email = user?.email ?? payload.user?.email ?? "";
        const answer = payload.answer || "Contexto carregado. Pergunte algo específico e trago os dados.";
        const question = userMsg.content;

        const normalized = question.trim().toLowerCase();
        const isGreeting = /^(oi|olá|ola|bom dia|boa tarde|boa noite|hey|hello|hi)\b/.test(normalized);

        const greeting = `Olá, ${displayName} (${email}). Estou dentro da sua realidade agora, junto com você todos os dias.`;
        const answerText = isGreeting ? "Tudo bem! Pode me pedir qualquer dado do seu tenant." : `Sobre sua pergunta: “${question}”: ${answer}`;

        const assistantReplies = tiaGreeted
          ? [{ role: "assistant" as const, content: answerText }]
          : [
              { role: "assistant" as const, content: greeting },
              ...(isGreeting ? [] : [{ role: "assistant" as const, content: answerText }]),
            ];

        setTiaMessages([...nextMessages, ...assistantReplies]);
        if (!tiaGreeted) setTiaGreeted(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao enviar mensagem");
    } finally {
      setTiaLoading(false);
    }
  };

  const openHelpFocused = (target?: string, suggestionTitle?: string) => {
    const focusFromSuggestion = suggestionTitle ? SUGGESTION_FOCUS_MAP[suggestionTitle] : undefined;
    const focus = focusFromSuggestion ?? (target ? TIA_HELP_FOCUS_MAP[target] ?? target : undefined);
    const url = focus ? `/help?focus=${encodeURIComponent(focus)}` : "/help";
    navigate(url);
  };

  if (!isPro) {
    return (
      <>
        {/* Botão flutuante */}
        <button
          className={`fixed z-[60] h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:scale-105 transition-transform ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
            right: 'auto',
            bottom: 'auto'
          }}
          onMouseDown={handleButtonMouseDown}
          onClick={handleButtonClick}
        >
          {open ? <ChevronDown className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>

        {/* Painel Tia */}
        {open && (
          <div
            className="fixed z-50 bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200 flex flex-col"
            style={floatingPanelStyle}
          >
            <div className="bg-gradient-to-r from-primary to-orange-500 p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.08em] text-white/70 font-semibold">Tia · Assistente</p>
                  <h3 className="font-bold text-lg leading-tight">{currentStep.title}</h3>
                  {/* tags ocultadas conforme solicitado */}
                </div>
              </div>
              {predictedStep && (
                <p className="text-xs text-white/80 mt-2">Próxima dúvida sugerida: {predictedStep.title}</p>
              )}

              <div className="mt-3 inline-flex rounded-full border border-white/30 bg-white/10 p-1 text-[11px] font-medium">
                <button
                  className={`px-3 py-1 rounded-full transition-colors ${
                    tiaMode === "guided" ? "bg-white text-primary" : "text-white/80 hover:text-white"
                  }`}
                  onClick={() => setTiaMode("guided")}
                >
                  Assistente guiada
                </button>
                <button
                  className={`px-3 py-1 rounded-full transition-colors ${
                    tiaMode === "ask" ? "bg-white text-primary" : "text-white/80 hover:text-white"
                  }`}
                  onClick={() => setTiaMode("ask")}
                >
                  Falar com a Tia
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              {tiaMode === "guided" && (
                <TiaGuidedSection
                  currentStep={currentStep}
                  predictedStep={predictedStep}
                  hasPrev={hasPrev}
                  hasNext={hasNext}
                  onPrev={goPrevStep}
                  onNext={goNextStep}
                  onReset={() => setTiaStep("onboarding-account")}
                  onNavigate={navigate}
                  openHelpFocused={openHelpFocused}
                  stepHelp={stepHelp}
                />
              )}

              {tiaMode === "ask" && (
                <TiaAskSection
                  messages={tiaMessages}
                  input={tiaInput}
                  loading={tiaLoading}
                  onChange={setTiaInput}
                  onSend={sendTiaMessage}
                />
              )}

              <div className="text-[11px] text-muted-foreground">
                Precisa falar com alguém? Abra um chamado em <button onClick={() => { setOpen(false); navigate('/support'); }} className="text-primary hover:underline">Suporte</button>.
              </div>

              <div className="bg-muted/60 border border-border rounded-xl p-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Chat ao vivo</span>
                  <Badge className="text-[10px] px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/50 shadow-sm shadow-primary/10 hover:bg-primary hover:text-primary-foreground transition-colors">Pro</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-snug">
                  Desbloqueie chat em tempo real com especialistas. Plano atual: <span className="font-semibold text-primary">{tenantContext.plan}</span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => { setOpen(false); navigate('/checkout?plan=professional'); }}
                >
                  <Crown className="h-3.5 w-3.5 mr-1.5" />
                  Fazer upgrade para Professional
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // --- Chat Panel (Professional+) ---
  const dateGroups = groupByDate();

  return (
    <>
      {/* Botão flutuante - agora arrastável */}
      <button
        className={`fixed z-[60] h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:scale-105 transition-transform ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          left: `${buttonPosition.x}px`,
          top: `${buttonPosition.y}px`,
          right: 'auto',
          bottom: 'auto'
        }}
        onMouseDown={handleButtonMouseDown}
        onClick={handleButtonClick}
      >
        {open ? (
          <ChevronDown className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat Panel - fixo, sem arrastar */}
      {open && (
        <div 
          className={`fixed z-50 bg-card border shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200 ${
            expanded 
              ? 'inset-0 rounded-none' 
              : 'rounded-2xl'
          }`}
          style={!expanded ? floatingPanelStyle : undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-orange-500 text-white shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm">Chat ao Vivo</h3>
                <p className="text-[11px] text-white/70">
                  {activeTicketId ? 'Suporte Intentia' : 'Abra um chamado para conversar'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setExpanded(!expanded)}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button
                onClick={() => { setOpen(false); setExpanded(false); }}
                className="h-8 w-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div 
            className="flex-1 overflow-y-auto px-4 py-4 bg-muted/20"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)', backgroundSize: '24px 24px' }}
          >
            {!activeTicketId ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <MessageCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">Nenhum chamado ativo</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Abra um chamado de suporte para iniciar uma conversa.
                </p>
                <Button size="sm" onClick={() => { setOpen(false); navigate('/support'); }}>
                  Abrir Chamado
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Send className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
                <p className="text-xs text-muted-foreground mt-1">Envie a primeira mensagem abaixo.</p>
              </div>
            ) : (
              <div className={`space-y-4 mx-auto ${expanded ? 'max-w-2xl' : ''}`}>
                {dateGroups.map((group, gi) => (
                  <div key={gi}>
                    <div className="flex justify-center my-3">
                      <span className="text-[10px] text-muted-foreground bg-background border rounded-full px-2.5 py-0.5 shadow-sm">
                        {group.label}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {group.msgs.map((msg) => {
                        const isAdmin = msg.sender_type === 'admin';
                        return (
                          <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                            {isAdmin && (
                              <Avatar className="h-6 w-6 mr-1.5 mt-auto shrink-0">
                                <AvatarFallback className="text-[9px] bg-primary text-primary-foreground font-semibold">
                                  S
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={`max-w-[80%]`}>
                              <div
                                className={`px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                                  isAdmin
                                    ? 'bg-background border rounded-2xl rounded-bl-md shadow-sm'
                                    : 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                                }`}
                              >
                                {msg.message}
                              </div>
                              <div className={`flex items-center gap-1 mt-0.5 px-1 ${!isAdmin ? 'justify-end' : ''}`}>
                                <span className="text-[9px] text-muted-foreground">{fmtTime(msg.created_at)}</span>
                                {!isAdmin && <CheckCheck className="h-2.5 w-2.5 text-muted-foreground" />}
                              </div>
                            </div>
                            {!isAdmin && (
                              <Avatar className="h-6 w-6 ml-1.5 mt-auto shrink-0">
                                {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-semibold">
                                  {userInitial}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {activeTicketId && (
            <div className="border-t px-3 py-2.5 bg-card shrink-0">
              <div className={`flex items-end gap-2 mx-auto ${expanded ? 'max-w-2xl' : ''}`}>
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 min-h-[36px] max-h-[100px] resize-none text-sm"
                  rows={1}
                  disabled={sending}
                />
                <Button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}




