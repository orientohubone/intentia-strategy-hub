import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import type { CampaignFormData } from "../types";

interface CampaignFormProps {
  formData: CampaignFormData;
  editingId: string | null;
  projects: { id: string; name: string }[];
  onFormDataChange: (data: CampaignFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CampaignForm({
  formData,
  editingId,
  projects,
  onFormDataChange,
  onSubmit,
  onCancel,
}: CampaignFormProps) {
  return (
    <div className="bg-card border rounded-lg p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {editingId ? "Editar Campanha" : "Nova Campanha"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Nome da Campanha *</Label>
          <Input
            id="campaign-name"
            placeholder="Ex: Campanha de Leads Q1"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-project">Projeto *</Label>
          <Select
            value={formData.project_id}
            onValueChange={(v) => onFormDataChange({ ...formData, project_id: v })}
          >
            <SelectTrigger id="campaign-project">
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              {(projects || []).map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-channel">Canal *</Label>
          <Select
            value={formData.channel}
            onValueChange={(v) => onFormDataChange({ ...formData, channel: v })}
          >
            <SelectTrigger id="campaign-channel">
              <SelectValue placeholder="Selecione o canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Ads</SelectItem>
              <SelectItem value="meta">Meta Ads</SelectItem>
              <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
              <SelectItem value="tiktok">TikTok Ads</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-budget">Budget Total (R$)</Label>
          <Input
            id="campaign-budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={formData.budget_total}
            onChange={(e) => onFormDataChange({ ...formData, budget_total: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-start">Data de Início</Label>
          <Input
            id="campaign-start"
            type="date"
            value={formData.start_date}
            onChange={(e) => onFormDataChange({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="campaign-end">Data de Término</Label>
          <Input
            id="campaign-end"
            type="date"
            value={formData.end_date}
            onChange={(e) => onFormDataChange({ ...formData, end_date: e.target.value })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="campaign-objective">Objetivo</Label>
          <Input
            id="campaign-objective"
            placeholder="Ex: Gerar 200 leads qualificados"
            value={formData.objective}
            onChange={(e) => onFormDataChange({ ...formData, objective: e.target.value })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="campaign-notes">Observações</Label>
          <Textarea
            id="campaign-notes"
            placeholder="Notas adicionais sobre a campanha..."
            value={formData.notes}
            onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSubmit}>
          {editingId ? "Salvar Alterações" : "Criar Campanha"}
        </Button>
      </div>
    </div>
  );
}
