import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  X, 
  Maximize2, 
  Minimize2,
  Clock,
  CheckCheck,
  Building2,
  Mail
} from "lucide-react";
import { SupportTicketMessage } from "@/lib/supportTypes";
import { getStatusInfo } from "@/lib/supportTypes";

interface SupportChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: any;
  messages: SupportTicketMessage[];
  onSendMessage: (message: string) => void;
  sendingMessage: boolean;
}

export function SupportChatDialog({ 
  open, 
  onOpenChange, 
  ticket, 
  messages, 
  onSendMessage,
  sendingMessage 
}: SupportChatDialogProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = ticket || {
    user_name: 'Cliente',
    user_email: '',
    user_company: '',
    ticket_number: '000000',
    subject: 'Chamado',
    status: 'aberto',
    priority: 'normal',
    category: 'duvidas',
    created_at: new Date().toISOString()
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(scrollToBottom, 150);
      return () => clearTimeout(timeout);
    }
  }, [open, messages.length]);

  const handleSend = () => {
    if (newMessage.trim() && !sendingMessage) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
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

  const dateGroups = groupByDate();
  const clientInitial = (t.user_name || t.user_email || 'C').charAt(0).toUpperCase();
  const clientAvatarUrl = t.user_avatar_url || '';
  const statusInfo = getStatusInfo(t.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`flex flex-col p-0 gap-0 overflow-hidden [&>button.absolute]:hidden ${
          isFullscreen
            ? 'h-screen w-screen max-w-none max-h-none rounded-none'
            : 'max-w-2xl h-[85vh] sm:rounded-xl'
        }`}
      >
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-10 w-10 shrink-0">
              {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={t.user_name} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {clientInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <DialogTitle className="text-sm font-semibold truncate">
                {t.user_name || 'Cliente'}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate">#{t.ticket_number}</span>
                <span>•</span>
                <Badge
                  variant="secondary"
                  className="h-5 text-[10px] px-1.5"
                  style={{ color: statusInfo.color, borderColor: statusInfo.color }}
                >
                  {statusInfo.name}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              aria-label={isFullscreen ? "Minimizar" : "Maximizar"}
              className="h-8 w-8"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Fechar"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ─── Ticket Info Bar ─── */}
        <div className="px-4 py-2 border-b bg-muted/40 shrink-0">
          <p className="text-xs font-medium text-foreground truncate">{t.subject}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
            {t.user_email && (
              <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{t.user_email}</span>
            )}
            {t.user_company && t.user_company !== 'Empresa não informada' && (
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{t.user_company}</span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(t.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* ─── Messages Area ─── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-muted/20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--muted)) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
                <Send className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda.</p>
              <p className="text-xs text-muted-foreground mt-1">Envie a primeira resposta abaixo.</p>
            </div>
          ) : (
            <div className={`space-y-4 mx-auto ${isFullscreen ? 'max-w-3xl' : 'max-w-xl'}`}>
              {dateGroups.map((group, gi) => (
                <div key={gi}>
                  {/* Date pill */}
                  <div className="flex justify-center my-3">
                    <span className="text-[11px] text-muted-foreground bg-background border rounded-full px-3 py-0.5 shadow-sm">
                      {group.label}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="space-y-2">
                    {group.msgs.map((msg) => {
                      const isAdmin = msg.sender_type === 'admin';
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          {/* Client avatar */}
                          {!isAdmin && (
                            <Avatar className="h-7 w-7 mr-2 mt-auto shrink-0">
                              {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={t.user_name} />}
                              <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                                {clientInitial}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div className={`max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                                isAdmin
                                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md'
                                  : 'bg-background border rounded-2xl rounded-bl-md shadow-sm'
                              }`}
                            >
                              {msg.message}
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isAdmin ? 'justify-end' : ''}`}>
                              <span className="text-[10px] text-muted-foreground">{fmtTime(msg.created_at)}</span>
                              {isAdmin && <CheckCheck className="h-3 w-3 text-muted-foreground" />}
                            </div>
                          </div>

                          {/* Admin avatar */}
                          {isAdmin && (
                            <Avatar className="h-7 w-7 ml-2 mt-auto shrink-0">
                              <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-semibold">
                                S
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

        {/* ─── Input Area ─── */}
        <div className="border-t px-4 py-3 bg-card shrink-0">
          <div className={`flex items-end gap-2 mx-auto ${isFullscreen ? 'max-w-3xl' : 'max-w-xl'}`}>
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua resposta..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none text-sm"
              rows={1}
              disabled={sendingMessage}
            />
            <Button
              onClick={handleSend}
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
      </DialogContent>
    </Dialog>
  );
}
