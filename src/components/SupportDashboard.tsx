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
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  adminListSupportTickets, 
  adminListSupportMessages, 
  adminSendSupportMessage, 
  adminUpdateTicketStatus 
} from "@/lib/adminApi";
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
  user_avatar_url?: string;
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

interface ClientGroup {
  email: string;
  name: string;
  company: string;
  avatarUrl?: string;
  tickets: SupportTicket[];
  openCount: number;
  totalMessages: number;
  hasUrgent: boolean;
  hasOverdue: boolean;
  lastActivity: string;
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
  const [collapsedClients, setCollapsedClients] = useState<Set<string>>(new Set());

  const toggleClient = (email: string) => {
    setCollapsedClients(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  // Agrupar tickets por cliente
  const clientGroups: ClientGroup[] = React.useMemo(() => {
    const map = new Map<string, SupportTicket[]>();
    tickets.forEach(t => {
      const key = t.user_email || 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });

    const groups: ClientGroup[] = [];
    map.forEach((tks, email) => {
      const first = tks[0];
      const openStatuses = ['aberto', 'em_analise', 'em_andamento', 'aguardando_cliente'];
      groups.push({
        email,
        name: first.user_name || email.split('@')[0],
        company: first.user_company || '',
        avatarUrl: first.user_avatar_url,
        tickets: tks,
        openCount: tks.filter(t => openStatuses.includes(t.status)).length,
        totalMessages: tks.reduce((sum, t) => sum + (t.message_count || 0), 0),
        hasUrgent: tks.some(t => t.priority === 'urgente' && openStatuses.includes(t.status)),
        hasOverdue: tks.some(t => t.sla_status === 'overdue'),
        lastActivity: tks.reduce((latest, t) => {
          const d = t.last_message_at || t.created_at;
          return d > latest ? d : latest;
        }, ''),
      });
    });

    // Ordenar: clientes com tickets urgentes/overdue primeiro, depois por última atividade
    groups.sort((a, b) => {
      if (a.hasOverdue !== b.hasOverdue) return a.hasOverdue ? -1 : 1;
      if (a.hasUrgent !== b.hasUrgent) return a.hasUrgent ? -1 : 1;
      if (a.openCount !== b.openCount) return b.openCount - a.openCount;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return groups;
  }, [tickets]);

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
      console.error('Error fetching user data:', error?.message || "Unknown error");
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
      const result = await adminListSupportTickets();
      
      if (result.error) {
        console.error("Error loading tickets:", result.error?.message || "Unknown error");
        if (result.error.includes('does not exist')) {
          setTickets([]);
          toast("Sistema em Configuração", {
            description: "As tabelas do sistema de suporte ainda estão sendo criadas.",
            duration: 3000
          });
        } else {
          toast.error("Erro ao carregar chamados: " + result.error);
        }
        return;
      }

      let data = result.data || [];

      // Aplicar filtros no frontend
      if (filters.status !== "all") {
        data = data.filter((t: any) => t.status === filters.status);
      }
      if (filters.priority !== "all") {
        data = data.filter((t: any) => t.priority === filters.priority);
      }
      if (filters.category !== "all") {
        data = data.filter((t: any) => t.category === filters.category);
      }
      if (filters.search) {
        const s = filters.search.toLowerCase();
        data = data.filter((t: any) => 
          t.subject?.toLowerCase().includes(s) || t.description?.toLowerCase().includes(s)
        );
      }

      data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setTickets(data);
//       console.log("Tickets carregados:", data.length);
    } catch (error: any) {
      console.error("Error loading tickets:", error?.message || "Unknown error");
      toast.error("Erro ao carregar chamados: " + (error.message || error));
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
      const result = await adminListSupportMessages(ticketId);
      if (result.error) throw new Error(result.error);
      setMessages(result.data || []);
    } catch (error) {
      console.error("Error loading messages:", error?.message || "Unknown error");
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || newMessage;
    if (!text.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      const result = await adminSendSupportMessage(selectedTicket.id, text.trim());
      
      if (result.error) {
        throw new Error(result.error);
      }

      setNewMessage("");
      loadMessages(selectedTicket.id);
      loadTickets();
      toast.success("Mensagem enviada: O cliente será notificado sobre sua resposta.");
    } catch (error: any) {
      console.error("Error sending message:", error?.message || "Unknown error");
      toast.error("Erro ao enviar mensagem: " + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    // Atualizar localmente para feedback imediato
    const previousStatus = selectedTicket?.status;
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status } : null);
    }
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status } : ticket
    ));

    try {
      const result = await adminUpdateTicketStatus(ticketId, status);
      if (result.error) throw new Error(result.error);

      loadTickets();
      const ticket = tickets.find(t => t.id === ticketId);
      toast.success("Status atualizado: Chamado #" + ticket?.ticket_number + " atualizado para " + status.replace('_', ' ') + ".");
    } catch (error: any) {
      console.error("Error updating status:", error?.message || "Unknown error");
      toast.error("Erro ao atualizar status: " + error.message);
      // Reverter
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: previousStatus || prev.status } : null);
      }
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status: ticket.status } : ticket
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

      {/* Tickets List — Agrupado por Cliente */}
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
            <div className="space-y-3">
              {clientGroups.map((group) => {
                const isCollapsed = collapsedClients.has(group.email);
                return (
                  <div key={group.email} className="rounded-xl border border-border bg-card/60 overflow-hidden">
                    {/* Client Header */}
                    <button
                      onClick={() => toggleClient(group.email)}
                      className="w-full flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/40 transition-colors text-left"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <Avatar className="h-8 w-8 shrink-0">
                        {group.avatarUrl && <AvatarImage src={group.avatarUrl} alt={group.name} />}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {group.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-foreground truncate">{group.name}</span>
                          {group.company && group.company !== 'Empresa não informada' && (
                            <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {group.company}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{group.email}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {group.hasOverdue && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">SLA</Badge>
                        )}
                        {group.hasUrgent && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-red-400 text-red-500">Urgente</Badge>
                        )}
                        {group.openCount > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {group.openCount} aberto{group.openCount > 1 ? 's' : ''}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {group.tickets.length} chamado{group.tickets.length > 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </button>

                    {/* Tickets do Cliente */}
                    {!isCollapsed && (
                      <div className="border-t border-border divide-y divide-border">
                        {group.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className={`p-3 sm:p-4 transition-colors hover:bg-muted/30 ${
                              selectedTicket?.id === ticket.id ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
                            }`}
                          >
                            {/* Ticket Row */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <Badge variant="secondary" className="text-[10px]">
                                    #{ticket.ticket_number}
                                  </Badge>
                                  <Badge variant="secondary" className={`text-[10px] ${getStatusColor(ticket.status)}`}>
                                    {getStatusInfo(ticket.status).name}
                                  </Badge>
                                  <Badge variant="outline" className={`text-[10px] ${getPriorityInfo(ticket.priority).color}`}>
                                    {getPriorityInfo(ticket.priority).name}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {renderCategoryIcon(ticket.category_icon)}
                                  </span>
                                </div>
                                <h3 className="font-medium text-sm text-foreground mb-1">
                                  {ticket.subject}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-1.5">
                                  {selectedTicket?.id === ticket.id ? ticket.description : ticket.description.substring(0, 120) + (ticket.description.length > 120 ? '...' : '')}
                                </p>
                                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
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
                              <div className="flex items-center gap-2 shrink-0">
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                  ticket.sla_status === 'overdue' ? 'bg-red-500' :
                                  ticket.sla_status === 'due_soon' ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`} />
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
                                  className="h-7 px-2 gap-1"
                                >
                                  {selectedTicket?.id === ticket.id ? (
                                    <X className="h-3 w-3" />
                                  ) : (
                                    <><MessageCircle className="h-3 w-3" /><span className="text-[10px] hidden sm:inline">Abrir</span></>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Detalhes Expandidos */}
                            {selectedTicket?.id === ticket.id && (
                              <div className="border-t border-border/50 pt-3 mt-3 space-y-3">
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

                                {/* Status + Conversa */}
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
