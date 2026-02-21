import type { ReactNode } from "react";

export type AssistantStep = {
  key: string;
  title: string;
  summary: string;
  tips: string[];
  resources: { label: string; href: string }[];
  next?: string;
};

export type StepHelp = {
  articles: { title: string; content: string }[];
  faqs: { question: string; answer: string; answerInline?: ReactNode }[];
};

export type TiaMessage = { role: "user" | "assistant"; content: string };

export type TiaConversation = {
  id: string;
  title: string;
  messages: TiaMessage[];
  createdAt: string;
  updatedAt: string;
};
