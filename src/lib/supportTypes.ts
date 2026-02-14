// Tipos para o Sistema de Chamados de Atendimento

export interface SupportTicket {
  id: string;
  tenant_id: string;
  user_id: string;
  subject: string;
  category: 'comercial' | 'desenvolvimento' | 'financeiro' | 'duvidas' | 'sugestoes' | 'bug' | 'outros';
  priority: 'baixa' | 'normal' | 'alta' | 'urgente';
  status: 'aberto' | 'em_analise' | 'em_andamento' | 'aguardando_cliente' | 'resolvido' | 'cancelado';
  description: string;
  attachments: string[];
  ticket_number: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  first_response_at?: string;
  resolved_at?: string;
  sla_deadline?: string;
  response_time_minutes?: number;
  resolution_time_hours?: number;
  satisfaction_score?: number;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'client' | 'admin';
  message: string;
  attachments: string[];
  created_at: string;
  is_internal: boolean;
  read_at?: string;
}

export interface SupportCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  sla_first_response: number;
  sla_resolution: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketNote {
  id: string;
  ticket_id: string;
  admin_id: string;
  note: string;
  is_visible_to_client: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketRating {
  id: string;
  ticket_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface SupportStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  urgent_tickets: number;
  tickets_this_week: number;
  avg_response_time?: number;
  avg_resolution_time?: number;
  avg_satisfaction?: number;
}

export interface AdminSupportDashboard extends SupportTicket {
  user_email: string;
  user_name?: string;
  user_company?: string;
  assigned_to_email?: string;
  assigned_to_name?: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  message_count: number;
  last_message_at?: string;
  sla_status: 'resolved' | 'overdue' | 'due_soon' | 'on_track';
}

// Form de criação de chamado
export interface CreateTicketForm {
  subject: string;
  category: SupportCategory['slug'];
  priority: SupportTicket['priority'];
  description: string;
  attachments?: File[];
}

// Constantes
export const SUPPORT_CATEGORIES = {
  comercial: { name: 'Comercial', icon: 'DollarSign', color: '#10b981' },
  desenvolvimento: { name: 'Desenvolvimento', icon: 'Code', color: '#8b5cf6' },
  financeiro: { name: 'Financeiro', icon: 'CreditCard', color: '#f59e0b' },
  duvidas: { name: 'Dúvidas', icon: 'HelpCircle', color: '#3b82f6' },
  sugestoes: { name: 'Sugestões', icon: 'Lightbulb', color: '#06b6d4' },
  bug: { name: 'Bugs', icon: 'Bug', color: '#ef4444' },
  outros: { name: 'Outros', icon: 'MoreHorizontal', color: '#6b7280' }
} as const;

export const SUPPORT_PRIORITIES = {
  baixa: { name: 'Baixa', color: '#10b981', description: 'Não afeta operações' },
  normal: { name: 'Normal', color: '#3b82f6', description: 'Impacto moderado' },
  alta: { name: 'Alta', color: '#f59e0b', description: 'Afeta operações importantes' },
  urgente: { name: 'Urgente', color: '#ef4444', description: 'Crítico, necessita atenção imediata' }
} as const;

export const SUPPORT_STATUS = {
  aberto: { name: 'Aberto', color: '#6b7280', description: 'Chamado recém-criado' },
  em_analise: { name: 'Em Análise', color: '#3b82f6', description: 'Admin está analisando' },
  em_andamento: { name: 'Em Andamento', color: '#f59e0b', description: 'Solução em progresso' },
  aguardando_cliente: { name: 'Aguardando Cliente', color: '#8b5cf6', description: 'Aguardando resposta do cliente' },
  resolvido: { name: 'Resolvido', color: '#10b981', description: 'Problema solucionado' },
  cancelado: { name: 'Cancelado', color: '#ef4444', description: 'Chamado cancelado' }
} as const;

export const SLA_STATUS = {
  resolved: { name: 'Resolvido', color: '#10b981' },
  overdue: { name: 'Atrasado', color: '#ef4444' },
  due_soon: { name: 'Perto do Prazo', color: '#f59e0b' },
  on_track: { name: 'No Prazo', color: '#10b981' }
} as const;

// Helpers
export const getCategoryInfo = (category: string) => {
  return SUPPORT_CATEGORIES[category as keyof typeof SUPPORT_CATEGORIES] || SUPPORT_CATEGORIES.outros;
};

export const getPriorityInfo = (priority: string) => {
  return SUPPORT_PRIORITIES[priority as keyof typeof SUPPORT_PRIORITIES] || SUPPORT_PRIORITIES.normal;
};

export const getStatusInfo = (status: string) => {
  return SUPPORT_STATUS[status as keyof typeof SUPPORT_STATUS] || SUPPORT_STATUS.aberto;
};

export const getStatusColor = (status: string) => {
  const statusInfo = getStatusInfo(status);
  return statusInfo.color;
};

export const getSlaStatusInfo = (slaStatus: string) => {
  return SLA_STATUS[slaStatus as keyof typeof SLA_STATUS] || SLA_STATUS.on_track;
};

export const formatTicketNumber = (ticketNumber: string) => {
  return ticketNumber.toUpperCase();
};

export const calculateResponseTime = (createdAt: string, firstResponseAt?: string) => {
  if (!firstResponseAt) return null;
  
  const created = new Date(createdAt);
  const responded = new Date(firstResponseAt);
  const diffMs = responded.getTime() - created.getTime();
  return Math.round(diffMs / (1000 * 60)); // minutos
};

export const calculateResolutionTime = (createdAt: string, resolvedAt?: string) => {
  if (!resolvedAt) return null;
  
  const created = new Date(createdAt);
  const resolved = new Date(resolvedAt);
  const diffMs = resolved.getTime() - created.getTime();
  return Math.round(diffMs / (1000 * 60 * 60)); // horas
};

export const isSlaOverdue = (slaDeadline?: string) => {
  if (!slaDeadline) return false;
  return new Date(slaDeadline) < new Date();
};

export const isSlaDueSoon = (slaDeadline?: string, hoursThreshold = 2) => {
  if (!slaDeadline) return false;
  const deadline = new Date(slaDeadline);
  const now = new Date();
  const diffHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= hoursThreshold;
};

export const getTicketStatusColor = (ticket: SupportTicket) => {
  if (ticket.status === 'resolvido') return getStatusInfo('resolvido').color;
  if (isSlaOverdue(ticket.sla_deadline)) return '#ef4444';
  if (isSlaDueSoon(ticket.sla_deadline)) return '#f59e0b';
  return getStatusInfo(ticket.status).color;
};

export const getTicketStatusText = (ticket: SupportTicket) => {
  if (ticket.status === 'resolvido') return 'Resolvido';
  if (isSlaOverdue(ticket.sla_deadline)) return 'Atrasado';
  if (isSlaDueSoon(ticket.sla_deadline)) return 'Perto do Prazo';
  return getStatusInfo(ticket.status).name;
};
