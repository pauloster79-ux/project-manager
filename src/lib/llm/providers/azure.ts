// src/lib/llm/providers/azure.ts
import { LLMProvider, CompleteArgs } from "../index";

export const azureProvider: LLMProvider = {
  id: "azure",
  async complete(args: CompleteArgs): Promise<string> {
    throw new Error("Azure provider not configured (use LLM_PROVIDER=mock for now)");
  },
  async embed(texts: string[]): Promise<number[][]> {
    throw new Error("Azure provider not configured (use LLM_PROVIDER=mock for now)");
  },
};
