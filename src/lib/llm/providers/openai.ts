// src/lib/llm/providers/openai.ts
import { LLMProvider, CompleteArgs } from "../index";

export const openaiProvider: LLMProvider = {
  id: "openai",
  async complete(args: CompleteArgs): Promise<string> {
    throw new Error("OpenAI provider not configured (use LLM_PROVIDER=mock for now)");
  },
  async embed(texts: string[]): Promise<number[][]> {
    throw new Error("OpenAI provider not configured (use LLM_PROVIDER=mock for now)");
  },
};
