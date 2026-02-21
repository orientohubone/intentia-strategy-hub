import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { YouTubeEmbed } from "./YouTubeEmbed";
import type { HelpCategory } from "./helpTypes";

interface HelpCategoryDetailProps {
  category: HelpCategory;
  getDifficultyColor: (difficulty: string) => string;
  focusArticleSlug?: string | null;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function HelpCategoryDetail({ category, getDifficultyColor, focusArticleSlug }: HelpCategoryDetailProps) {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null);
  const focusRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!focusArticleSlug) return;
    const idx = category.articles.findIndex((article) => slugify(article.title) === focusArticleSlug);
    if (idx >= 0) {
      setExpandedArticle(idx);
    }
  }, [category, focusArticleSlug]);

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [expandedArticle]);

  return (
    <Card className="mb-4">
      <CardHeader className="py-3 sm:py-4 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`shrink-0 ${category.color}`}>
            {category.icon}
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base">{category.title}</CardTitle>
            <CardDescription className="text-[10px] sm:text-xs">{category.articles.length} artigos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-3 sm:px-6 space-y-3">
        {/* YouTube Video Embed */}
        <YouTubeEmbed
          videoId={category.videoId || ""}
          title={`Como usar: ${category.title}`}
          categoryId={category.id}
          categoryTitle={category.title}
          categoryDescription={category.description}
        />

        {/* Expanded article content */}
        {expandedArticle !== null && category.articles[expandedArticle] && (
          <div className="p-3 sm:p-4 rounded-xl border border-border bg-muted/30">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-semibold text-xs sm:text-sm text-foreground">{category.articles[expandedArticle].title}</h4>
              <Badge variant="secondary" className={`text-[9px] sm:text-[10px] shrink-0 ${getDifficultyColor(category.articles[expandedArticle].difficulty)}`}>
                {category.articles[expandedArticle].difficulty}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{category.articles[expandedArticle].content}</p>
          </div>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {category.articles.map((article, index) => (
            <button
              key={index}
              ref={
                focusArticleSlug && slugify(article.title) === focusArticleSlug
                  ? focusRef
                  : undefined
              }
              onClick={() => setExpandedArticle(expandedArticle === index ? null : index)}
              className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all ${
                expandedArticle === index
                  ? "border-primary/60 bg-primary/10 shadow-sm shadow-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/20"
              }`}
            >
              <h4 className="font-medium text-[11px] sm:text-xs text-foreground leading-snug mb-1.5">{article.title}</h4>
              <Badge variant="secondary" className={`text-[9px] sm:text-[10px] ${getDifficultyColor(article.difficulty)}`}>
                {article.difficulty}
              </Badge>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
