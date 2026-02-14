import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { HelpCategory } from "./helpTypes";

interface HelpCategoryGridProps {
  categories: HelpCategory[];
  expandedCategory: string | null;
  onCategoryClick: (id: string) => void;
  categoriesExpanded: boolean;
  onToggleExpanded: () => void;
}

export function HelpCategoryGrid({
  categories,
  expandedCategory,
  onCategoryClick,
  categoriesExpanded,
  onToggleExpanded,
}: HelpCategoryGridProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Guia por Funcionalidade</h2>
        <button
          onClick={onToggleExpanded}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {categoriesExpanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Recolher</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Expandir</span>
            </>
          )}
        </button>
      </div>
      {categoriesExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className={`text-left p-3 sm:p-4 rounded-xl border transition-all ${
                expandedCategory === category.id
                  ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                  : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/20"
              }`}
            >
              <div className={`mb-2 ${category.color}`}>
                {category.icon}
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground leading-snug mb-0.5">{category.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2">{category.description}</p>
              <Badge variant="secondary" className="text-[9px] sm:text-[10px]">
                {category.articles.length} artigos
              </Badge>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
