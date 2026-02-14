import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { SupportTicketForm } from "@/components/SupportTicketForm";
import { SupportChatDialog } from "@/components/SupportChatDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Plus, 
  History, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Phone,
  Mail,
  Send,
  Calendar,
  Maximize2,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SupportTicket, SupportTicketMessage } from "@/lib/supportTypes";
import { 
  SUPPORT_CATEGORIES, 
  SUPPORT_PRIORITIES,
  getCategoryInfo, 
  getPriorityInfo,
  getStatusInfo,
  getStatusColor
} from "@/lib/supportTypes";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useTenantData } from "@/hooks/useTenantData";

export default function Support() {
  const { notifications } = useNotifications();
  const { user } = useAuth();
  const { tenantSettings } = useTenantData();
  const isProfessionalPlus = tenantSettings?.plan === 'professional' || tenantSettings?.plan === 'enterprise';
  const [showForm, setShowForm] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  // Carregar tickets do usuário
  const loadTickets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.error("Error loading tickets:", error);
        if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.log("Tabelas de suporte ainda não criadas - modo demo");
        }
      } else {
        setTickets(data || []);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar mensagens do ticket selecionado
  const loadMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Enviar mensagem
  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || newMessage;
    if (!text.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      const { error } = await supabase
        .from("support_ticket_messages")
        .insert({
          ticket_id: selectedTicket.id,
          sender_id: user?.id,
          sender_type: "client",
          message: text.trim()
        });

      if (error) throw error;

      setNewMessage("");
      loadMessages(selectedTicket.id);
      toast.success("Mensagem enviada com sucesso.");
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem: " + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Escutar quando um ticket é criado
  const handleTicketCreated = (ticket: any) => {
    setTickets(prev => [ticket, ...prev]);
    setShowForm(false);
    toast.success("Chamado criado com sucesso!", {
      description: `Seu chamado #${ticket.ticket_number} foi registrado. Nossa equipe irá analisar em breve.`,
    });
  };

  // Carregar mensagens ao selecionar ticket
  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  // Configurar notificações em tempo real
  useEffect(() => {
    loadTickets();

    const pollingInterval = setInterval(() => {
      loadTickets();
    }, 10000);

    const channel = supabase
      .channel('client_support_tickets')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'support_tickets'
      }, (payload) => {
        setTickets(prev => prev.map(t => 
          t.id === payload.new.id ? { ...t, ...payload.new } : t
        ));
        if (selectedTicket?.id === payload.new.id) {
          setSelectedTicket(prev => prev ? { ...prev, ...payload.new } : null);
        }
      })
      .subscribe();

    const messageChannel = supabase
      .channel('client_support_messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_ticket_messages' 
      }, (payload) => {
        if (selectedTicket && payload.new.ticket_id === selectedTicket.id) {
          loadMessages(selectedTicket.id);
        }
      })
      .subscribe();

    return () => {
      clearInterval(pollingInterval);
      channel.unsubscribe();
      messageChannel.unsubscribe();
    };
  }, [loadTickets, selectedTicket]);

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Eu';
  const userAvatarUrl = user?.user_metadata?.avatar_url || '';

  if (showForm) {
    return (
      <DashboardLayout>
        <SEO title="Suporte" noindex />
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Suporte
            </Button>
          </div>
          <SupportTicketForm
            onSuccess={handleTicketCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <SEO title="Suporte" noindex />
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Central de Suporte</h1>
            <p className="text-muted-foreground">
              Acompanhe seus chamados e abra novas solicitações
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Chamado
          </Button>
        </div>

        {/* Contato Rápido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">+55 (14) 99861-8547</p>
                <p className="text-xs text-muted-foreground">Seg a Sex, 9h às 18h</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">suporte@intentia.com.br</p>
                <p className="text-xs text-muted-foreground">Resposta em até 24h</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">~2 horas</p>
                <p className="text-xs text-muted-foreground">Tempo médio de resposta</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meus Chamados */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Meus Chamados</h2>
            <Badge variant="secondary" className="text-xs">{tickets.length}</Badge>
          </div>

          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </CardContent>
            </Card>
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum chamado encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Você ainda não abriu nenhum chamado de suporte.
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Abrir Primeiro Chamado
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => {
                const statusInfo = getStatusInfo(ticket.status);
                const priorityInfo = getPriorityInfo(ticket.priority);
                const isSelected = selectedTicket?.id === ticket.id;

                return (
                  <Card 
                    key={ticket.id}
                    className={`transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
                            {userAvatarUrl && <AvatarImage src={userAvatarUrl} alt={userName} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {userName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                #{ticket.ticket_number}
                              </Badge>
                              <Badge variant="secondary" className={`text-xs ${getStatusColor(ticket.status)}`}>
                                {statusInfo.name}
                              </Badge>
                              <Badge variant="outline" className={`text-xs ${priorityInfo.color}`}>
                                {priorityInfo.name}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTicket(null);
                                    setChatDialogOpen(false);
                                  } else {
                                    setSelectedTicket(ticket);
                                  }
                                }}
                                className="h-6 px-2 ml-auto"
                              >
                                {isSelected ? (
                                  <X className="h-3 w-3" />
                                ) : (
                                  <MessageCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <h3 className="font-medium text-foreground mb-1 text-sm">
                              {ticket.subject}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {isSelected ? ticket.description : ticket.description.substring(0, 120) + (ticket.description.length > 120 ? '...' : '')}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                              </span>
                              <span className="capitalize">{ticket.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Seção Expandida */}
                      {isSelected && (
                        <div className="border-t pt-4 mt-4 space-y-3">
                          {/* Reply Input */}
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Responder</label>
                            <div className="flex items-start gap-2">
                              <Textarea
                                placeholder="Digite sua mensagem..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 text-sm min-h-[60px]"
                                rows={2}
                              />
                              <Button 
                                onClick={() => handleSendMessage()}
                                disabled={!newMessage.trim() || sendingMessage}
                                size="icon"
                                className="h-10 w-10 shrink-0 rounded-full"
                              >
                                {sendingMessage ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Status + Conversa */}
                          <div className="flex items-center justify-between gap-3 pt-1">
                            <Badge variant="secondary" className={`text-xs ${getStatusColor(ticket.status)}`}>
                              {statusInfo.name}
                            </Badge>
                            {isProfessionalPlus && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setChatDialogOpen(true)}
                                className="h-8 text-xs gap-1.5"
                              >
                                <MessageCircle className="h-3 w-3" />
                                Conversa {messages.length > 0 && `(${messages.length})`}
                              </Button>
                            )}
                          </div>

                          {/* Messages - Log compacto */}
                          {messages.length > 0 && (
                            <div className="bg-muted/40 rounded-lg p-2.5 space-y-1 max-h-28 overflow-y-auto">
                              {messages.slice(-3).map((message) => (
                                <div key={message.id} className="flex items-start gap-2 text-xs">
                                  <span className="text-muted-foreground/70 whitespace-nowrap tabular-nums">
                                    {new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className={`font-medium whitespace-nowrap ${message.sender_type === 'admin' ? 'text-primary' : 'text-foreground'}`}>
                                    {message.sender_type === 'admin' ? 'Suporte' : 'Eu'}:
                                  </span>
                                  <span className="text-muted-foreground truncate">
                                    {message.message.length > 60 ? message.message.substring(0, 60) + '…' : message.message}
                                  </span>
                                </div>
                              ))}
                              {messages.length > 3 && (
                                <button
                                  onClick={() => setChatDialogOpen(true)}
                                  className="text-[11px] text-primary hover:underline"
                                >
                                  +{messages.length - 3} anteriores
                                </button>
                              )}
                            </div>
                          )}
                          {messages.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">Aguardando resposta do suporte...</p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Chat Dialog */}
        <SupportChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          ticket={selectedTicket ? {
            ...selectedTicket,
            user_name: userName,
            user_email: user?.email || '',
            user_avatar_url: userAvatarUrl
          } : null}
          messages={messages}
          onSendMessage={handleSendMessage}
          sendingMessage={sendingMessage}
        />
      </div>
    </DashboardLayout>
  );
}
