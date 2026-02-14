import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

interface FAQCardProps {
  item: {
    question: string;
    answer: string;
    category: string;
    difficulty: string;
    icon: React.ReactNode;
    color: string;
  };
  getDifficultyColor: (difficulty: string) => string;
  getDifficultyLabel: (difficulty: string) => string;
  faqCategories: Array<{ id: string; label: string }>;
}

export function FAQCard({ 
  item, 
  getDifficultyColor, 
  getDifficultyLabel,
  faqCategories 
}: FAQCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardId = `faq-card-${item.question.replace(/\s+/g, '-').toLowerCase()}`;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div id={cardId} className="faq-card-wrapper">
      <div 
        className={`faq-card border rounded-lg p-4 bg-card hover:shadow-md transition-all cursor-pointer ${
          isExpanded ? 'faq-card-expanded' : ''
        }`}
        onClick={handleToggle}
      >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center ${item.color}`}>
          {item.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-sm text-foreground leading-snug">
              {item.question}
            </h3>
            <ChevronDown 
              className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`} 
            />
          </div>
          
          {/* Tags */}
          <div className="flex items-center gap-1.5 mb-2">
            <Badge variant="secondary" className={`text-[10px] ${getDifficultyColor(item.difficulty)}`}>
              {getDifficultyLabel(item.difficulty)}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/20">
              {faqCategories.find(c => c.id === item.category)?.label}
            </Badge>
          </div>
          
          {/* Answer */}
          {isExpanded && (
            <div className="mt-3 p-3 rounded-lg bg-muted/30 border">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
