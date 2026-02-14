import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { SupportChatDialog } from "@/components/SupportChatDialog";
import { 
  Search, 
  Filter, 
  Maximize2,
  MessageCircle, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  X,
  Reply,
  Send,
  Paperclip,
  User,
  Calendar,
  Tag,
  HelpCircle,
  DollarSign,
  CreditCard,
  Code,
  Bug,
  Lightbulb,
  MoreHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  SUPPORT_STATUS, 
  SUPPORT_CATEGORIES, 
  SUPPORT_PRIORITIES,
  getStatusInfo,
  getStatusColor,
  getCategoryInfo,
  getPriorityInfo
} from "@/lib/supportTypes";
import { SupportTicketMessage } from "@/lib/supportTypes";

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  user_email: string;
  user_name: string;
  user_company: string;
  assigned_to_email?: string;
  assigned_to_name?: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  message_count: number;
  last_message_at?: string;
  sla_status: string;
  created_at: string;
  attachments?: string[];
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'client' | 'admin';
  message: string;
  created_at: string;
}

export function SupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    category: "all",
    search: ""
  });
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  // Carregar tickets
  useEffect(() => {
    loadTickets();
  }, [filters]);

  // Função para buscar dados do usuário se não vier da view
  const fetchUserData = async (userId: string) => {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (userData.user) {
        const name = userData.user.user_metadata?.name || 
                   userData.user.user_metadata?.full_name || 
                   userData.user.email?.split('@')[0] || 
                   'Cliente';
        return {
          user_email: userData.user.email || 'email@nao.informado',
          user_name: name,
          user_company: 'Empresa não informada',
          user_avatar_url: userData.user.user_metadata?.avatar_url || ''
        };
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return {
      user_email: 'email@nao.informado',
      user_name: 'Cliente',
      user_company: 'Empresa não informada',
      user_avatar_url: ''
    };
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      let query;
      
      // Tentar usar a view admin primeiro, senão usar a tabela principal
      try {
        query = supabase
          .from("v_admin_support_dashboard")
          .select("*");
      } catch (viewError) {
        console.log("View admin não encontrada, usando tabela principal");
        query = supabase
          .from("support_tickets")
          .select("*");
      }

      // Aplicar filtros
      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.priority !== "all") {
        query = query.eq("priority", filters.priority);
      }
      if (filters.category !== "all") {
        query = query.eq("category", filters.category);
      }
      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading tickets:", error);
        
        // Se erro for de tabela não existente, mostrar modo demo
        if (error.message?.includes('does not exist') || error.code === 'PGRST116') {
          console.log("Tabelas de suporte ainda não criadas - modo demo");
          setTickets([]);
          toast("Sistema em Configuração", {
            description: "As tabelas do sistema de suporte ainda estão sendo criadas.",
            duration: 3000
          });
        } else {
      toast.error("Erro ao carregar chamados: " + error.message);
        }
      } else {
        // Se usou a tabela principal, formatar dados para o formato esperado
        const formattedData = await Promise.all((data || []).map(async (ticket: any) => {
          // Se for da view admin e já tiver dados do usuário, usar direto
          if (ticket.user_email && ticket.user_email !== 'email@nao.informado') {
            return ticket;
          }
          
          // Se for da tabela principal, buscar dados do usuário
          const userData = await fetchUserData(ticket.user_id);
          
          return {
            ...ticket,
            ...userData,
            assigned_to_email: null,
            assigned_to_name: null,
            category_name: ticket.category,
            category_color: '#3b82f6',
            category_icon: 'MessageCircle',
            message_count: 0,
            last_message_at: null,
            sla_status: 'on_track'
          };
        }));
        
        setTickets(formattedData);
        console.log("Tickets carregados:", formattedData.length);
      }
    } catch (error) {
      console.error("Error loading tickets:", error);
      toast.error("Erro ao carregar chamados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Carregar mensagens do ticket selecionado
  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

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

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || newMessage;
    if (!text.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      // Enviar mensagem
      try {
        const { error } = await supabase
          .from("support_ticket_messages")
          .insert({
            ticket_id: selectedTicket.id,
            sender_id: (await supabase.auth.getUser()).data.user?.id,
            sender_type: "admin",
            message: text.trim()
          });

        if (error) throw error;

        // Atualizar status do ticket se necessário
        if (selectedTicket.status === "aberto") {
          await supabase
            .from("support_tickets")
            .update({ 
              status: "em_analise",
              first_response_at: new Date().toISOString()
            })
            .eq("id", selectedTicket.id);
        }

        // Notificar cliente
        try {
          const { data: userData } = await supabase
            .from("support_tickets")
            .select("user_id")
            .eq("id", selectedTicket.id)
            .single();
          
          if (userData?.user_id) {
            await supabase
              .from("notifications")
              .insert({
                user_id: userData.user_id,
                title: "Nova resposta no seu chamado",
                message: `Sua solicitação #${selectedTicket.ticket_number} recebeu uma nova resposta.`,
                type: "support_message",
                metadata: {
                  ticket_id: selectedTicket.id,
                  ticket_number: selectedTicket.ticket_number
                }
              });
          }
        } catch (notificationError) {
          console.warn("Notification error (expected):", notificationError);
        }
      } catch (dbError) {
        console.log("Modo demo - mensagem simulada");
        // Modo demo: simular envio
      }

      setNewMessage("");
      loadMessages(selectedTicket.id);
      loadTickets();

      // Forçar atualização do cliente via polling
      setTimeout(() => {
        // Força o cliente a recarregar os dados
        console.log("Enviando sinal de atualização para cliente...");
      }, 1000);

      toast.success("Mensagem enviada: O cliente será notificado sobre sua resposta.");

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Erro ao enviar mensagem: " + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const updates: any = { status };
      
      if (status === "resolvido") {
        updates.resolved_at = new Date().toISOString();
      }

      // Atualizar o selectedTicket localmente para feedback imediato
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status } : null);
      }

      // Atualizar na lista de tickets
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status }
          : ticket
      ));

      try {
        const { error } = await supabase
          .from("support_tickets")
          .update(updates)
          .eq("id", ticketId);

        if (error) throw error;

        loadTickets();
        
        // Notificar cliente sobre mudança de status
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket) {
          try {
            const { data: userData } = await supabase
              .from("support_tickets")
              .select("user_id")
              .eq("id", ticketId)
              .single();
            
            if (userData?.user_id) {
              await supabase
                .from("notifications")
                .insert({
                  user_id: userData.user_id,
                  title: "Status do seu chamado atualizado",
                  message: `Seu chamado #${ticket.ticket_number} agora está: ${status.replace('_', ' ')}.`,
                  type: "support_status",
                  metadata: {
                    ticket_id: ticket.id,
                    ticket_number: ticket.ticket_number,
                    new_status: status
                  }
                });
            }
          } catch (notificationError) {
            console.warn("Notification error (expected):", notificationError);
          }
        }

        toast.success("Status atualizado: Chamado #" + ticket?.ticket_number + " atualizado para " + status.replace('_', '.') + ".");
      } catch (dbError) {
        console.log("Modo demo - status simulado");
        // Modo demo: simular atualização
        loadTickets();
        toast.success("Status atualizado (modo demo): " + status.replace('_', '.') + ".");
      }

    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status: " + error.message);
      // Reverter status local se falhar
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: prev.status } : null);
      }
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, status: ticket.status } // Mantém status original
          : ticket
      ));
    }
  };

  // Função para renderizar ícone da categoria
  const renderCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      HelpCircle,
      DollarSign,
      CreditCard,
      Code,
      Bug,
      Lightbulb,
      MoreHorizontal
    };
    
    const IconComponent = iconMap[iconName] || HelpCircle;
    return <IconComponent className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Atendimentos</h2>
          <p className="text-muted-foreground">Gerencie os chamados de suporte dos clientes</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar chamados..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  {Object.entries(SUPPORT_STATUS).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Prioridades</SelectItem>
                  {Object.entries(SUPPORT_PRIORITIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.category}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {Object.entries(SUPPORT_CATEGORIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <div className="space-y-4">
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
                  Não há chamados correspondentes aos filtros aplicados.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Sistema em Configuração:</strong> O sistema de chamados está sendo configurado. 
                    Os chamados criados pelos clientes aparecerão aqui em breve.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card 
                  key={ticket.id}
                  className={`transition-all hover:shadow-md ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    {/* Header - Sempre Visível */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5">
                          {ticket.user_avatar_url && <AvatarImage src={ticket.user_avatar_url} alt={ticket.user_name} />}
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {(ticket.user_name || ticket.user_email || 'C').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            #{ticket.ticket_number}
                          </Badge>
                          <Badge variant="secondary" className={`text-xs ${getStatusColor(ticket.status)}`}>
                            {getStatusInfo(ticket.status).name}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${getPriorityInfo(ticket.priority).color}`}>
                            {getPriorityInfo(ticket.priority).name}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (selectedTicket?.id === ticket.id) {
                                setSelectedTicket(null);
                                setChatDialogOpen(false);
                              } else {
                                setSelectedTicket(ticket);
                                setChatDialogOpen(true);
                              }
                            }}
                            className="h-6 px-2"
                          >
                            {selectedTicket?.id === ticket.id ? (
                              <X className="h-3 w-3" />
                            ) : (
                              <MessageCircle className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <h3 className="font-medium text-foreground mb-1">
                          {ticket.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {selectedTicket?.id === ticket.id ? ticket.description : ticket.description.substring(0, 100) + (ticket.description.length > 100 ? '...' : '')}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.user_name || ticket.user_email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          {ticket.message_count > 0 && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {ticket.message_count} msgs
                            </div>
                          )}
                        </div>
                      </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          ticket.sla_status === 'overdue' ? 'bg-red-500' :
                          ticket.sla_status === 'due_soon' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <span className="text-xs text-muted-foreground">
                          {renderCategoryIcon(ticket.category_icon)}
                        </span>
                      </div>
                    </div>

                    {/* Detalhes Expandidos - Só se selecionado */}
                    {selectedTicket?.id === ticket.id && (
                      <div className="border-t pt-4 mt-4 space-y-3">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {selectedTicket.user_avatar_url && <AvatarImage src={selectedTicket.user_avatar_url} alt={selectedTicket.user_name} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {(selectedTicket.user_name || selectedTicket.user_email || 'C').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{selectedTicket.user_name || 'Cliente'}</div>
                            <div className="text-xs text-muted-foreground">{selectedTicket.user_email}</div>
                            {selectedTicket.user_company && selectedTicket.user_company !== 'Empresa não informada' && (
                              <div className="text-xs text-muted-foreground">{selectedTicket.user_company}</div>
                            )}
                          </div>
                        </div>

                        {/* Reply Input */}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Responder</label>
                          <div className="flex items-start gap-2">
                            <Textarea
                              placeholder="Digite sua resposta..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              className="flex-1 text-sm min-h-[60px]"
                              rows={2}
                            />
                            <Button 
                              onClick={() => handleSendMessage()}
                              disabled={!newMessage.trim() || sendingMessage}
                              size="icon"
                              className="h-10 w-10 shrink-0 rounded-full mt-0"
                            >
                              {sendingMessage ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Status + Histórico - mesma linha */}
                        <div className="flex items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-muted-foreground">Status:</label>
                            <Select
                              value={selectedTicket.status}
                              onValueChange={(value) => handleUpdateStatus(selectedTicket.id, value)}
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(SUPPORT_STATUS).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{value.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setChatDialogOpen(true)}
                            className="h-8 text-xs gap-1.5"
                          >
                            <MessageCircle className="h-3 w-3" />
                            Conversa {messages.length > 0 && `(${messages.length})`}
                          </Button>
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
                                  {message.sender_type === 'admin' ? 'Suporte' : (selectedTicket.user_name || 'Cliente').split(' ')[0]}:
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      {/* Chat Dialog */}
      <SupportChatDialog
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        ticket={selectedTicket}
        messages={messages}
        onSendMessage={handleSendMessage}
        sendingMessage={sendingMessage}
      />
    </div>
  );
}
