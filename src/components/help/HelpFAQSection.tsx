import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { FAQCard } from "@/components/FAQCard";
import type { FAQItem, FAQCategoryFilter } from "./helpTypes";

interface HelpFAQSectionProps {
  faqItems: FAQItem[];
  faqCategories: FAQCategoryFilter[];
  searchTerm: string;
  getDifficultyColor: (difficulty: string) => string;
  getDifficultyLabel: (difficulty: string) => string;
}

export function HelpFAQSection({
  faqItems,
  faqCategories,
  searchTerm,
  getDifficultyColor,
  getDifficultyLabel,
}: HelpFAQSectionProps) {
  const [faqShowAll, setFaqShowAll] = useState(false);
  const [faqFilter, setFaqFilter] = useState<string>("todos");

  const filteredFaq = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = faqFilter === "todos" || item.category === faqFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Perguntas Frequentes</h2>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {faqCategories.slice(0, 6).map((category) => (
            <button
              key={category.id}
              onClick={() => setFaqFilter(category.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                faqFilter === category.id
                  ? "bg-primary text-primary-foreground ring-1 ring-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
            >
              <span className={faqFilter === category.id ? "text-current" : category.color}>
                {category.icon}
              </span>
              <span>{category.label}</span>
            </button>
          ))}
          <div className="relative">
            <button
              onClick={() => {
                const dropdown = document.getElementById("faq-more-categories");
                dropdown?.classList.toggle("hidden");
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
            >
              <ChevronDown className="h-3 w-3" />
              <span>Mais</span>
            </button>
            <div
              id="faq-more-categories"
              className="hidden absolute right-0 top-full mt-1 w-40 bg-popover border rounded-lg shadow-lg z-10 p-1"
            >
              {faqCategories.slice(6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setFaqFilter(category.id);
                    document.getElementById("faq-more-categories")?.classList.add("hidden");
                  }}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs hover:bg-muted/50 transition-colors"
                >
                  <span className={category.color}>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {(faqShowAll ? filteredFaq : filteredFaq.slice(0, 6)).map((item, index) => (
          <FAQCard
            key={`faq-${item.question}-${index}`}
            item={item}
            getDifficultyColor={getDifficultyColor}
            getDifficultyLabel={getDifficultyLabel}
            faqCategories={faqCategories}
          />
        ))}
      </div>

      {/* Show More Button */}
      {filteredFaq.length > 6 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setFaqShowAll(!faqShowAll)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-all border border-border/50 hover:border-border"
          >
            {faqShowAll ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Mostrar menos</span>
                <span className="text-muted-foreground">({filteredFaq.length - 6})</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Ver mais perguntas</span>
                <span className="text-muted-foreground">({filteredFaq.length - 6})</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredFaq.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <HelpCircle className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
          <h3 className="text-sm sm:text-base font-medium text-foreground mb-1 sm:mb-2">Nenhuma pergunta encontrada</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Tente ajustar os filtros ou buscar por outros termos para encontrar o que você procura.
          </p>
        </div>
      )}
    </div>
  );
}
