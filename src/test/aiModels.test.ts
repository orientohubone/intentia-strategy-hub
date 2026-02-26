import { describe, it, expect } from "vitest";
import {
  getClaudeMaxTokens,
  getModelsForProvider,
  GEMINI_MODELS,
  CLAUDE_MODELS,
} from "../lib/aiModels";

describe("getClaudeMaxTokens", () => {
  it("should return correct max tokens for known models", () => {
    // Known models with 8192 tokens
    expect(getClaudeMaxTokens("claude-sonnet-4-20250514")).toBe(8192);
    expect(getClaudeMaxTokens("claude-3-7-sonnet-20250219")).toBe(8192);
    expect(getClaudeMaxTokens("claude-3-5-haiku-20241022")).toBe(8192);

    // Known models with 4096 tokens
    expect(getClaudeMaxTokens("claude-3-haiku-20240307")).toBe(4096);
    expect(getClaudeMaxTokens("claude-3-opus-20240229")).toBe(4096);
  });

  it("should return default max tokens (4096) for unknown models", () => {
    expect(getClaudeMaxTokens("unknown-model")).toBe(4096);
    expect(getClaudeMaxTokens("gpt-4")).toBe(4096);
  });

  it("should return default max tokens (4096) for empty input", () => {
    expect(getClaudeMaxTokens("")).toBe(4096);
  });

  it("should be case sensitive", () => {
    // Assuming implementation is case sensitive as it uses array.find()
    expect(getClaudeMaxTokens("CLAUDE-SONNET-4-20250514")).toBe(4096); // returns default because not found
  });
});

describe("getModelsForProvider", () => {
  it("should return Gemini models for 'google_gemini' provider", () => {
    const result = getModelsForProvider("google_gemini");
    expect(result).toBe(GEMINI_MODELS);
    expect(result).toHaveLength(GEMINI_MODELS.length);
    expect(result[0].value).toContain("gemini");
  });

  it("should return Claude models for 'anthropic_claude' provider", () => {
    const result = getModelsForProvider("anthropic_claude");
    expect(result).toBe(CLAUDE_MODELS);
    expect(result).toHaveLength(CLAUDE_MODELS.length);
    expect(result[0].value).toContain("claude");
  });
});
