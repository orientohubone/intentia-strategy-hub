import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  X, 
  Upload,
  DollarSign,
  Code,
  CreditCard,
  HelpCircle,
  Lightbulb,
  Bug,
  MoreHorizontal
} from "lucide-react";
import { 
  SUPPORT_CATEGORIES, 
  SUPPORT_PRIORITIES, 
  getCategoryInfo, 
  getPriorityInfo,
  CreateTicketForm,
  SupportCategory
} from "@/lib/supportTypes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenantData } from "@/hooks/useTenantData";

interface SupportTicketFormProps {
  onSuccess?: (ticket: any) => void;
  onCancel?: () => void;
}

export function SupportTicketForm({ onSuccess, onCancel }: SupportTicketFormProps) {
  const { toast } = useToast();
  const { tenantSettings } = useTenantData(); // Obter tenant atual
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateTicketForm>({
    subject: "",
    category: "duvidas",
    priority: "normal",
    description: "",
    attachments: []
  });
  const [categories, setCategories] = useState<SupportCategory[]>([]);

  // Carregar categorias
  useState(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("support_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) {
        console.error("Error loading categories:", error?.message || "Unknown error");
      } else {
        setCategories(data || []);
      }
    };

    loadCategories();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o assunto e a descrição do chamado.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload de anexos (se houver)
      const attachmentUrls: string[] = [];
      if (formData.attachments && formData.attachments.length > 0) {
        for (const file of formData.attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('support-attachments')
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError?.message || "Unknown error");
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('support-attachments')
            .getPublicUrl(fileName);

          attachmentUrls.push(publicUrl);
        }
      }

      // Criar chamado
      let ticket;
      try {
        // Obter user e tenant atuais
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        // Obter tenant_id do contexto
        const tenantId = tenantSettings?.id;

        const { data: ticketData, error } = await supabase
          .from("support_tickets")
          .insert({
            tenant_id: tenantId,
            user_id: user.id,
            subject: formData.subject,
            category: formData.category,
            priority: formData.priority,
            description: formData.description,
            attachments: attachmentUrls
          })
          .select()
          .single();

        if (error) throw error;
        ticket = ticketData;
        
//         console.log("Ticket criado com sucesso:", ticket);
      } catch (dbError: any) {
        console.error("Database error REAL:", dbError?.message || "Unknown error");
        throw dbError; // Deixar o erro real aparecer
      }

      // Criar notificação interna (só se as tabelas existirem)
      try {
        await supabase
          .from("notifications")
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            title: "Novo Chamado de Suporte",
            message: `Chamado #${ticket.ticket_number}: ${formData.subject}`,
            type: "support_ticket",
            metadata: {
              ticket_id: ticket.id,
              ticket_number: ticket.ticket_number,
              category: formData.category,
              priority: formData.priority
            }
          });
      } catch (notificationError) {
        console.warn("Notification error (expected):", notificationError);
        // Continuar mesmo se notificação falhar
      }

      toast({
        title: "Chamado criado com sucesso!",
        description: `Seu chamado #${ticket.ticket_number} foi registrado. Nossa equipe irá analisar em breve.`,
      });

      onSuccess?.(ticket);

      // Reset form
      setFormData({
        subject: "",
        category: "duvidas",
        priority: "normal",
        description: "",
        attachments: []
      });

    } catch (error: any) {
      console.error("Error creating ticket:", error?.message || "Unknown error");
      toast({
        title: "Erro ao criar chamado",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      comercial: DollarSign,
      desenvolvimento: Code,
      financeiro: CreditCard,
      duvidas: HelpCircle,
      sugestoes: Lightbulb,
      bug: Bug,
      outros: MoreHorizontal
    };
    return icons[category as keyof typeof icons] || HelpCircle;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      baixa: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      normal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      alta: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      urgente: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Abrir Chamado de Suporte
        </CardTitle>
        <CardDescription>
          Descreva seu problema ou dúvida. Nossa equipe irá responder o mais breve possível.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assunto */}
          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              placeholder="Breve descrição do problema"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Categoria e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = getCategoryIcon(category.slug);
                    return (
                      <SelectItem key={category.id} value={category.slug}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" style={{ color: category.color }} />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SUPPORT_PRIORITIES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: value.color }} />
                        <span>{value.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente seu problema, dúvida ou sugestão..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isSubmitting}
              rows={6}
              required
            />
          </div>

          {/* Anexos */}
          <div className="space-y-2">
            <Label>Anexos (opcional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center cursor-pointer hover:text-primary transition-colors"
              >
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Clique para anexar arquivos ou arraste aqui
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PDF, PNG, JPG (máx. 10MB)
                </span>
              </label>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Arquivos anexados:</Label>
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alerta informativa */}
          <Alert>
            <MessageCircle className="h-4 w-4" />
            <AlertDescription>
              Tempo médio de resposta: 2 horas (horário comercial). Chamados urgentes são priorizados.
            </AlertDescription>
          </Alert>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Abrir Chamado
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
