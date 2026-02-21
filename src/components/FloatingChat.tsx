import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity,
  MessageCircle, 
  Send, 
  X, 
  Maximize2, 
  Minimize2,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  Crown,
  Play,
  Plus,
  History,
  Trash2,
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
import type { AssistantStep, StepHelp, TiaMessage, TiaConversation } from "@/components/floating-chat/types";

export function FloatingChat() {
  const BUTTON_SIZE = 56;
  const PANEL_GAP = 12;
  const PANEL_HEIGHT = 500;
  const VIEWPORT_PADDING = 8;
  const TAB_HEIGHT = 28;

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
  const totalNeeded = PANEL_HEIGHT + TAB_HEIGHT;
  const availableAbove = Math.max(0, buttonPosition.y - VIEWPORT_PADDING - PANEL_GAP);
  const availableBelow = Math.max(
    0,
    viewportSize.height - (buttonPosition.y + BUTTON_SIZE) - VIEWPORT_PADDING - PANEL_GAP
  );
  const canFitAboveFull = availableAbove >= totalNeeded;
  const canFitBelowFull = availableBelow >= totalNeeded;
  const shouldPlaceAbove =
    canFitAboveFull || (!canFitBelowFull && availableAbove >= availableBelow);
  const selectedSpace = shouldPlaceAbove ? availableAbove : availableBelow;
  const panelHeightForLayout = Math.max(0, Math.min(PANEL_HEIGHT, selectedSpace - TAB_HEIGHT));
  const buttonCenterX = buttonPosition.x + BUTTON_SIZE / 2;
  const isButtonOnRight = buttonCenterX > viewportSize.width / 2;
  const alignedLeft = isButtonOnRight
    ? buttonPosition.x + BUTTON_SIZE - panelWidth   // borda direita alinhada
    : buttonPosition.x;                              // borda esquerda alinhada
  const clampedLeft = Math.max(
    VIEWPORT_PADDING,
    Math.min(alignedLeft, viewportSize.width - panelWidth - VIEWPORT_PADDING)
  );
  const clampedTop = shouldPlaceAbove
    ? buttonPosition.y - panelHeightForLayout - TAB_HEIGHT - PANEL_GAP
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
  const TIA_CONVERSATIONS_KEY = "intentia_tia_conversations";
  const TIA_ACTIVE_CONV_KEY = "intentia_tia_active_conv";
  const TIA_MODE_KEY = "intentia_tia_mode";
  const TIA_WELCOME: TiaMessage = { role: "assistant", content: "Oi! 👋 Sou a **Tia**, sua assistente na Intentia.\n\nPode me perguntar sobre seus **projetos**, **campanhas**, **insights** ou qualquer coisa da plataforma!" };

  const generateConvId = () => `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const deriveTitle = (msgs: TiaMessage[]): string => {
    const firstUser = msgs.find(m => m.role === "user");
    if (firstUser) {
      const text = firstUser.content.trim();
      return text.length > 50 ? text.slice(0, 47) + "…" : text;
    }
    return "Nova conversa";
  };

  const loadConversations = (): TiaConversation[] => {
    try {
      const raw = localStorage.getItem(TIA_CONVERSATIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TiaConversation[];
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { /* ignore */ }
    // Migrate from old single-conversation format
    try {
      const oldRaw = localStorage.getItem("intentia_tia_history");
      if (oldRaw) {
        const oldMsgs = JSON.parse(oldRaw) as TiaMessage[];
        if (Array.isArray(oldMsgs) && oldMsgs.length > 0) {
          const now = new Date().toISOString();
          const migrated: TiaConversation = {
            id: generateConvId(),
            title: deriveTitle(oldMsgs),
            messages: oldMsgs,
            createdAt: now,
            updatedAt: now,
          };
          localStorage.removeItem("intentia_tia_history");
          return [migrated];
        }
      }
    } catch { /* ignore */ }
    return [];
  };

  const loadActiveConvId = (): string | null => {
    try {
      return localStorage.getItem(TIA_ACTIVE_CONV_KEY);
    } catch { /* ignore */ }
    return null;
  };

  const loadStoredMode = (): "guided" | "ask" | "live" => {
    try {
      const raw = localStorage.getItem(TIA_MODE_KEY);
      if (raw === "guided" || raw === "ask" || raw === "live") return raw;
    } catch { /* ignore */ }
    return "guided";
  };

  const [tiaStep, setTiaStep] = useState<string>("onboarding-account");
  const [tiaConversations, setTiaConversations] = useState<TiaConversation[]>(loadConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>(loadActiveConvId);
  const [tiaInput, setTiaInput] = useState("");
  const [tiaLoading, setTiaLoading] = useState(false);
  const [tiaMode, setTiaMode] = useState<"guided" | "ask" | "live">(loadStoredMode);
  const [showConvList, setShowConvList] = useState(false);

  // Derive active conversation and messages
  const activeConv = tiaConversations.find(c => c.id === activeConvId) ?? null;
  const tiaMessages: TiaMessage[] = activeConv?.messages ?? [TIA_WELCOME];

  // Set messages for the active conversation
  const setTiaMessages = (msgs: TiaMessage[]) => {
    if (!activeConvId) {
      // Create a new conversation on first message
      const now = new Date().toISOString();
      const newConv: TiaConversation = {
        id: generateConvId(),
        title: deriveTitle(msgs),
        messages: msgs,
        createdAt: now,
        updatedAt: now,
      };
      setTiaConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    } else {
      setTiaConversations(prev =>
        prev.map(c =>
          c.id === activeConvId
            ? { ...c, messages: msgs, title: deriveTitle(msgs), updatedAt: new Date().toISOString() }
            : c
        )
      );
    }
  };

  // Start a new conversation
  const startNewConversation = () => {
    setActiveConvId(null);
    setShowConvList(false);
    setTiaInput("");
  };

  // Resume a conversation
  const resumeConversation = (convId: string) => {
    setActiveConvId(convId);
    setShowConvList(false);
  };

  // Delete a conversation
  const deleteConversation = (convId: string) => {
    setTiaConversations(prev => prev.filter(c => c.id !== convId));
    if (activeConvId === convId) {
      setActiveConvId(null);
    }
  };

  // Persist conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TIA_CONVERSATIONS_KEY, JSON.stringify(tiaConversations));
    } catch { /* quota exceeded — silently ignore */ }
  }, [tiaConversations]);

  // Persist active conversation id
  useEffect(() => {
    try {
      if (activeConvId) {
        localStorage.setItem(TIA_ACTIVE_CONV_KEY, activeConvId);
      } else {
        localStorage.removeItem(TIA_ACTIVE_CONV_KEY);
      }
    } catch { /* ignore */ }
  }, [activeConvId]);

  // Persist active mode
  useEffect(() => {
    try {
      localStorage.setItem(TIA_MODE_KEY, tiaMode);
    } catch { /* ignore */ }
  }, [tiaMode]);
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
        const answer = payload.answer || "Desculpe, não consegui processar sua pergunta. Tente novamente!";
        setTiaMessages([...nextMessages, { role: "assistant" as const, content: answer }]);
      }
    } catch (err) {
      console.error(err);
      setTiaMessages([...nextMessages, { role: "assistant" as const, content: "Ops, ocorreu um erro ao processar sua mensagem. Tente novamente em instantes." }]);
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
            className="fixed z-50 animate-in slide-in-from-bottom-4 fade-in duration-200"
            style={{
              left: floatingPanelStyle.left,
              top: floatingPanelStyle.top,
              width: floatingPanelStyle.width,
            }}
          >
            {/* Top tab — aba acoplada com logo Tia + curvas de acoplamento */}
            <style>{`
              .tia-tab-row {
                display: flex;
                align-items: flex-end;
                justify-content: center;
              }
              .tia-tab-ear {
                width: 12px;
                height: 12px;
                flex-shrink: 0;
              }
              .tia-tab-ear--left {
                background: radial-gradient(circle at 0% 0%, transparent 12px, #0b0d11 12px);
              }
              .tia-tab-ear--right {
                background: radial-gradient(circle at 100% 0%, transparent 12px, #0b0d11 12px);
              }
              .tia-tab {
                background: #0b0d11;
                border-radius: 12px 12px 0 0;
              }
            `}</style>
            <div className="tia-tab-row">
              <div className="tia-tab-ear tia-tab-ear--left" />
              <div className="tia-tab flex items-center gap-2 px-5 py-1.5">
                <img src="/tia-branco-ponto-laranja.svg" alt="Tia" className="h-4 w-auto" />
                <div className="flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] text-white/50 font-medium">Online</span>
                </div>
              </div>
              <div className="tia-tab-ear tia-tab-ear--right" />
            </div>

            {/* Main panel */}
            <div
              className="bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              style={{
                height: floatingPanelStyle.height,
                maxHeight: floatingPanelStyle.maxHeight,
              }}
            >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-orange-500 px-4 pt-3 pb-3 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-base leading-tight">
                    {tiaMode === "guided" ? currentStep.title : tiaMode === "ask" ? "Falar com a Tia" : "Chat ao Vivo"}
                  </h3>
                </div>
              </div>

              {/* Toggle tabs + actions */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="inline-flex rounded-full border border-white/30 bg-white/10 p-0.5 text-[10px] font-medium">
                  <button
                    className={`px-2.5 py-1 rounded-full transition-colors ${
                      tiaMode === "guided" ? "bg-white text-primary" : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => { setTiaMode("guided"); setShowConvList(false); }}
                  >
                    Guiada
                  </button>
                  <button
                    className={`px-2.5 py-1 rounded-full transition-colors flex items-center justify-center ${
                      tiaMode === "ask" ? "text-white" : "text-white/80 hover:text-white"
                    }`}
                    style={tiaMode === "ask" ? { backgroundColor: '#0b0d11' } : undefined}
                    onClick={() => { setTiaMode("ask"); setShowConvList(false); }}
                  >
                    <img src="/tia-branco-ponto-laranja.svg" alt="Tia" className="h-3 w-auto" />
                  </button>
                  <button
                    className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
                      tiaMode === "live" ? "bg-white text-primary" : "text-white/80 hover:text-white"
                    }`}
                    onClick={() => { setTiaMode("live"); setShowConvList(false); }}
                  >
                    <Activity className="h-3 w-3" />
                    Chat ao Vivo
                  </button>
                </div>

                {/* Conversation actions — only in ask mode */}
                {tiaMode === "ask" && (
                  <div className="flex items-center gap-0.5">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setShowConvList(!showConvList)}
                          className={`h-7 w-7 rounded-full flex items-center justify-center transition-colors ${
                            showConvList ? "bg-white text-primary" : "hover:bg-white/20 text-white/80"
                          }`}
                        >
                          <History className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px] border-primary">Conversas anteriores</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={startNewConversation}
                          className="h-7 w-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px] border-primary">Nova conversa</TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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

              {tiaMode === "ask" && showConvList && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1">
                    <button
                      onClick={() => setShowConvList(false)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Voltar
                    </button>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {tiaConversations.length} conversa{tiaConversations.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* New conversation button */}
                  <button
                    onClick={startNewConversation}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-colors text-left group"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Plus className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary">Nova conversa</p>
                      <p className="text-[10px] text-muted-foreground">Iniciar uma conversa do zero</p>
                    </div>
                  </button>

                  {/* Conversation list */}
                  {tiaConversations.length === 0 ? (
                    <div className="text-center py-6">
                      <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhuma conversa salva ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {tiaConversations.map((conv) => {
                        const isActive = conv.id === activeConvId;
                        const msgCount = conv.messages.filter(m => m.role === "user").length;
                        const lastMsg = conv.messages[conv.messages.length - 1];
                        const preview = lastMsg
                          ? (lastMsg.content.length > 60 ? lastMsg.content.slice(0, 57) + "…" : lastMsg.content)
                          : "";
                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(conv.updatedAt).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 1) return "agora";
                          if (mins < 60) return `${mins}min`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h`;
                          const days = Math.floor(hrs / 24);
                          return `${days}d`;
                        })();

                        return (
                          <div
                            key={conv.id}
                            className={`group flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                              isActive
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-muted/60 border border-transparent"
                            }`}
                            onClick={() => resumeConversation(conv.id)}
                          >
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                              isActive ? "bg-primary text-white" : "bg-muted"
                            }`}>
                              <MessageCircle className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs font-medium truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                                  {conv.title}
                                </p>
                                <span className="text-[9px] text-muted-foreground shrink-0">{timeAgo}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{preview}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[9px] text-muted-foreground">
                                  {msgCount} msg{msgCount !== 1 ? "s" : ""}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                                  className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {tiaMode === "ask" && !showConvList && (
                <TiaAskSection
                  messages={tiaMessages}
                  input={tiaInput}
                  loading={tiaLoading}
                  onChange={setTiaInput}
                  onSend={sendTiaMessage}
                />
              )}

              {tiaMode === "live" && (
                <div className="flex flex-col items-center justify-center text-center px-4 py-6 gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Crown className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-sm text-foreground">Chat ao Vivo com Especialistas</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Converse em tempo real com nosso time de marketing. Disponível no plano <span className="font-semibold text-primary">Professional</span>.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Plano atual: <span className="font-semibold text-primary">{tenantContext.plan}</span>
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setOpen(false); navigate('/checkout?plan=professional'); }}
                  >
                    <Crown className="h-3.5 w-3.5 mr-1.5" />
                    Fazer upgrade
                  </Button>
                  <p className="text-[10px] text-muted-foreground">
                    Ou abra um chamado em{" "}
                    <button onClick={() => { setOpen(false); navigate('/support'); }} className="text-primary hover:underline">
                      Suporte
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Sticky input — only for ask mode, hidden when showing conv list */}
            {tiaMode === "ask" && !showConvList && (
              <div className="border-t bg-card shrink-0">
                {/* Contextual conversation indicator */}
                {activeConv && tiaConversations.length > 1 && (
                  <div className="px-3 pt-2 pb-0">
                    <button
                      onClick={() => setShowConvList(true)}
                      className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-3 w-3" />
                      <span className="truncate max-w-[180px]">{activeConv.title}</span>
                      <span className="text-muted-foreground/50">·</span>
                      <span>{tiaConversations.length} conversas</span>
                    </button>
                  </div>
                )}
                <div className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Input
                      value={tiaInput}
                      onChange={(e) => setTiaInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          sendTiaMessage();
                        }
                      }}
                      placeholder={activeConvId ? "Continue a conversa…" : "Inicie uma nova conversa…"}
                      className="h-9 text-xs flex-1"
                      disabled={tiaLoading}
                    />
                    <Button
                      size="icon"
                      className="h-9 w-9 shrink-0 rounded-full"
                      onClick={sendTiaMessage}
                      disabled={tiaLoading || !tiaInput.trim()}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {tiaLoading && (
                    <p className="text-[10px] text-primary animate-pulse mt-1">Tia está digitando…</p>
                  )}
                </div>
              </div>
            )}
            </div>{/* /Main panel */}
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




