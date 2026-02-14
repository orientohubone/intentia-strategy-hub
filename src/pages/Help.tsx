import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Search, Target, Sparkles, Globe, Crosshair } from "lucide-react";
import {
  helpCategories,
  faqItems,
  faqCategoryFilters,
  HelpCategoryDetail,
  HelpCategoryGrid,
  HelpFAQSection,
  HelpContactSection,
} from "@/components/help";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "iniciante": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "intermediario": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "avancado": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "iniciante": return "Iniciante";
    case "intermediario": return "Intermediário";
    case "avancado": return "Avançado";
    default: return difficulty;
  }
};

export default function Help() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);

  const filteredCategories = helpCategories
    .map((category) => ({
      ...category,
      articles: category.articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(
      (category) =>
        category.articles.length > 0 ||
        category.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const selectedCategory = filteredCategories.find((c) => c.id === expandedCategory);

  return (
    <DashboardLayout>
      <SEO title="Ajuda" noindex />
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Centro de Ajuda</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Guia completo da plataforma Intentia — funcionalidades, fluxos e dúvidas frequentes
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar funcionalidade ou dúvida..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">6</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Scores por URL</p>
          </div>
          <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">9</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Modelos de IA</p>
          </div>
          <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
            <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">4</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Canais de Mídia</p>
          </div>
          <div className="bg-card border rounded-lg p-3 sm:p-4 text-center">
            <Crosshair className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500 mx-auto mb-1.5 sm:mb-2" />
            <p className="text-xl sm:text-2xl font-bold text-foreground">6</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Templates Táticos</p>
          </div>
        </div>

        {/* Expanded category with video + articles */}
        {selectedCategory && (
          <HelpCategoryDetail
            category={selectedCategory}
            getDifficultyColor={getDifficultyColor}
          />
        )}

        {/* Help Categories Grid */}
        <HelpCategoryGrid
          categories={filteredCategories}
          expandedCategory={expandedCategory}
          onCategoryClick={(id) => setExpandedCategory(expandedCategory === id ? null : id)}
          categoriesExpanded={categoriesExpanded}
          onToggleExpanded={() => setCategoriesExpanded(!categoriesExpanded)}
        />

        {/* FAQ */}
        <HelpFAQSection
          faqItems={faqItems}
          faqCategories={faqCategoryFilters}
          searchTerm={searchTerm}
          getDifficultyColor={getDifficultyColor}
          getDifficultyLabel={getDifficultyLabel}
        />

        {/* Contact Support */}
        <HelpContactSection />
      </div>
    </DashboardLayout>
  );
}
