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
  Lock,
  Crown,
  ChevronDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";
import { SupportTicketMessage } from "@/lib/supportTypes";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function FloatingChat() {
  const { user } = useAuth();
  const { tenantSettings } = useTenantData();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isPro = tenantSettings?.plan === 'professional' || tenantSettings?.plan === 'enterprise';

  // Buscar ticket de chat ativo (último aberto/em andamento)
  const loadActiveTicket = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
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
      const { count, error } = await supabase
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
      supabase
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
      const { error } = await supabase
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
    } catch (error: any) {
      toast.error("Erro ao enviar: " + error.message);
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

  if (!user) return null;

  // ─── Upgrade Gate (Starter) ───
  if (!isPro) {
    return (
      <>
        {/* Botão flutuante com lock */}
        <button
          onClick={() => setOpen(!open)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>

        {/* Upgrade panel */}
        {open && (
          <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-card border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="bg-gradient-to-r from-primary to-orange-500 p-6 text-white text-center">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-lg">Chat ao Vivo</h3>
              <p className="text-sm text-white/80 mt-1">
                Converse em tempo real com nosso suporte
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-primary" />
                  <span>Respostas em tempo real</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-primary" />
                  <span>Histórico de conversas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-primary" />
                  <span>Suporte prioritário</span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground mb-1">Disponível a partir do</p>
                <div className="flex items-center justify-center gap-1.5">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Plano Professional</span>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  setOpen(false);
                  navigate('/checkout?plan=professional');
                }}
              >
                <Crown className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
              <p className="text-[11px] text-center text-muted-foreground">
                Você ainda pode abrir chamados em <button onClick={() => { setOpen(false); navigate('/support'); }} className="text-primary hover:underline">Suporte</button>
              </p>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── Chat Panel (Professional+) ───
  const dateGroups = groupByDate();

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
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

      {/* Chat Panel */}
      {open && (
        <div 
          className={`fixed z-50 bg-card border shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200 ${
            expanded 
              ? 'inset-0 rounded-none' 
              : 'bottom-24 right-6 w-80 sm:w-96 h-[500px] rounded-2xl'
          }`}
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
