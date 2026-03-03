import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Search, CalendarDays, Target } from "lucide-react";
import { MONTH_LABELS } from "@/lib/operationalTypes";

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
  filterPeriod: string;
  onFilterPeriodChange: (value: string) => void;
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
  filterPeriod,
  onFilterPeriodChange,
}: OperationsFiltersProps) {

  const periodOptions: { value: string; label: string }[] = [];
  const d = new Date();
  d.setDate(15);

  for (let i = 0; i < 24; i++) {
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const value = `${year}-${String(month).padStart(2, '0')}`;

    let label = `${MONTH_LABELS[month]} ${year}`;
    if (i === 0) label = `Este mês (${MONTH_LABELS[month]})`;
    else if (i === 1) label = `Mês passado (${MONTH_LABELS[month]})`;

    periodOptions.push({ value, label });
    d.setMonth(d.getMonth() - 1);
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar campanhas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-11 bg-card/50"
        />
      </div>

      {/* Row 2: Filters Grid/Wrap */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterPeriod} onValueChange={onFilterPeriodChange}>
          <SelectTrigger className="h-9 min-w-[140px] w-auto text-xs bg-card">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Período" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {periodOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="h-9 min-w-[150px] w-auto text-xs bg-card">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                Todos os status
              </div>
            </SelectItem>
            <SelectItem value="draft" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-400" />
                Rascunho
              </div>
            </SelectItem>
            <SelectItem value="active" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Ativa
              </div>
            </SelectItem>
            <SelectItem value="paused" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Pausada
              </div>
            </SelectItem>
            <SelectItem value="completed" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Concluída
              </div>
            </SelectItem>
            <SelectItem value="archived" className="text-xs">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                Arquivada
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterChannel} onValueChange={onFilterChannelChange}>
          <SelectTrigger className="h-9 min-w-[150px] w-auto text-xs bg-card">
            <SelectValue placeholder="Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                Todos os canais
              </div>
            </SelectItem>
            <SelectItem value="google" className="text-xs">
              <div className="flex items-center gap-2">
                <img src="/google-ads.svg" className="h-3.5 w-3.5 object-contain" alt="" />
                Google Ads
              </div>
            </SelectItem>
            <SelectItem value="meta" className="text-xs">
              <div className="flex items-center gap-2">
                <img src="/meta-ads.svg" className="h-3.5 w-3.5 object-contain" alt="" />
                Meta Ads
              </div>
            </SelectItem>
            <SelectItem value="linkedin" className="text-xs">
              <div className="flex items-center gap-2">
                <img src="/linkedin-ads.svg" className="h-3.5 w-3.5 object-contain" alt="" />
                LinkedIn Ads
              </div>
            </SelectItem>
            <SelectItem value="tiktok" className="text-xs">
              <div className="flex items-center gap-2">
                <img src="/tiktok-ads.svg" className="h-3.5 w-3.5 object-contain" alt="" />
                TikTok Ads
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterProject} onValueChange={onFilterProjectChange}>
          <SelectTrigger className="h-9 w-[160px] text-xs bg-card">
            <SelectValue placeholder="Projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">Todos os projetos</SelectItem>
            {(projects || []).map((p) => (
              <SelectItem key={p.id} value={p.id} className="text-xs">{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
