import { LucideIcon } from "lucide-react";

export type Section =
  | "overview"
  | "auth"
  | "data"
  | "features"
  | "edge"
  | "database"
  | "frontend"
  | "security"
  | "operations"
  | "integrations";

export interface SectionConfig {
  key: Section;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}
