// src/lib/llm/providers/anthropic.ts
import { LLMProvider, CompleteArgs } from "../index";

export const anthropicProvider: LLMProvider = {
  id: "anthropic",
  async complete(args: CompleteArgs): Promise<string> {
    throw new Error("Anthropic provider not configured (use LLM_PROVIDER=mock for now)");
  },
  async embed(texts: string[]): Promise<number[][]> {
    throw new Error("Anthropic provider not configured (use LLM_PROVIDER=mock for now)");
  },
};
