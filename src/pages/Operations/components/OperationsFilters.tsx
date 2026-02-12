import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface OperationsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  filterChannel: string;
  onFilterChannelChange: (value: string) => void;
  filterProject: string;
  onFilterProjectChange: (value: string) => void;
  projects: { id: string; name: string }[];
}

export function OperationsFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
  filterChannel,
  onFilterChannelChange,
  filterProject,
  onFilterProjectChange,
  projects,
}: OperationsFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar campanhas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="draft">Rascunho</SelectItem>
          <SelectItem value="active">Ativa</SelectItem>
          <SelectItem value="paused">Pausada</SelectItem>
          <SelectItem value="completed">Concluída</SelectItem>
          <SelectItem value="archived">Arquivada</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterChannel} onValueChange={onFilterChannelChange}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Canal" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os canais</SelectItem>
          <SelectItem value="google">Google Ads</SelectItem>
          <SelectItem value="meta">Meta Ads</SelectItem>
          <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
          <SelectItem value="tiktok">TikTok Ads</SelectItem>
        </SelectContent>
      </Select>
      <Select value={filterProject} onValueChange={onFilterProjectChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Projeto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os projetos</SelectItem>
          {(projects || []).map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
