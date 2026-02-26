import {
  Layers,
  Monitor,
  Lock,
  GitBranch,
  ToggleLeft,
  Cloud,
  Database,
  ShieldCheck,
  Megaphone,
  Plug,
} from "lucide-react";
import { SectionConfig } from "./types";

export const SECTIONS: SectionConfig[] = [
  { key: "overview", label: "Visao Geral", icon: Layers, color: "text-primary", bg: "bg-primary/10" },
  { key: "frontend", label: "Frontend", icon: Monitor, color: "text-blue-400", bg: "bg-blue-500/10" },
  { key: "auth", label: "Autenticacao", icon: Lock, color: "text-green-400", bg: "bg-green-500/10" },
  { key: "data", label: "Fluxo de Dados", icon: GitBranch, color: "text-purple-400", bg: "bg-purple-500/10" },
  { key: "features", label: "Feature Flags", icon: ToggleLeft, color: "text-amber-400", bg: "bg-amber-500/10" },
  { key: "edge", label: "Edge Functions", icon: Cloud, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { key: "database", label: "Banco de Dados", icon: Database, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { key: "security", label: "Seguranca", icon: ShieldCheck, color: "text-red-400", bg: "bg-red-500/10" },
  { key: "operations", label: "Operacoes", icon: Megaphone, color: "text-orange-400", bg: "bg-orange-500/10" },
  { key: "integrations", label: "Integracoes", icon: Plug, color: "text-cyan-400", bg: "bg-cyan-500/10" },
];
