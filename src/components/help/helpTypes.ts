import type { ReactNode } from "react";

export interface HelpArticle {
  title: string;
  content: string;
  difficulty: "Iniciante" | "Intermediário" | "Avançado";
}

export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  videoId?: string; // YouTube video ID para embed
  articles: HelpArticle[];
}

export interface FAQItem {
  question: string;
  answer: string;
  answerInline?: ReactNode;
  category: string;
  difficulty: string;
  icon: ReactNode;
  color: string;
}

export interface FAQCategoryFilter {
  id: string;
  label: string;
  icon: ReactNode;
  color: string;
}
