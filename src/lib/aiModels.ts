// Centralized AI model definitions used across the application
// Settings, Projects, Benchmark, BenchmarkDetailDialog, Help, Landing

export const GEMINI_MODELS = [
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.5-pro-preview-05-06", label: "Gemini 2.5 Pro Preview" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

export const CLAUDE_MODELS = [
  { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4", maxTokens: 8192 },
  { value: "claude-3-7-sonnet-20250219", label: "Claude Sonnet 3.7", maxTokens: 8192 },
  { value: "claude-3-5-haiku-20241022", label: "Claude Haiku 3.5", maxTokens: 8192 },
  { value: "claude-3-haiku-20240307", label: "Claude Haiku 3", maxTokens: 4096 },
  { value: "claude-3-opus-20240229", label: "Claude Opus 3", maxTokens: 4096 },
];

export function getClaudeMaxTokens(model: string): number {
  const found = CLAUDE_MODELS.find((m) => m.value === model);
  return found?.maxTokens ?? 4096;
}

export const ALL_MODELS = [...GEMINI_MODELS, ...CLAUDE_MODELS];

export const AI_MODEL_LABELS: Record<string, string> = Object.fromEntries(
  ALL_MODELS.map((m) => [m.value, m.label])
);

export function getModelsForProvider(provider: "google_gemini" | "anthropic_claude") {
  return provider === "google_gemini" ? GEMINI_MODELS : CLAUDE_MODELS;
}
