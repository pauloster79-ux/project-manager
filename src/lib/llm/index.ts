// src/lib/llm/index.ts
import { ensureJSON, sleep } from "./json";
import { mockProvider } from "./providers/mock";
// (Optional scaffolds)
// import { openaiProvider } from "./providers/openai";
// import { anthropicProvider } from "./providers/anthropic";
// import { azureProvider } from "./providers/azure";

export type SchemaName = "gateway" | "iterate" | "qa" | "summary";

export type CompleteArgs = {
  system: string;
  user: string;                 // often a JSON payload as string
  schemaName?: SchemaName;
  temperature?: number;         // default 0.2 for gateway/iterate, 0.5 for qa
  maxTokens?: number;           // soft cap, provider-specific
  jsonStrict?: boolean;         // if true, we enforce parseable JSON with retries
  timeoutMs?: number;           // default from env
};

export interface LLMProvider {
  id: string;
  complete(args: CompleteArgs): Promise<string>;
  embed(texts: string[]): Promise<number[][]>;
}

function pickProvider(): LLMProvider {
  const p = (process.env.LLM_PROVIDER || "mock").toLowerCase();
  switch (p) {
    case "mock": return mockProvider;
    // case "openai": return openaiProvider;
    // case "anthropic": return anthropicProvider;
    // case "azure": return azureProvider;
    default: return mockProvider;
  }
}

export async function complete(args: CompleteArgs): Promise<string> {
  const provider = pickProvider();
  const timeout = args.timeoutMs ?? toInt(process.env.LLM_TIMEOUT_MS, 8000);
  return withTimeout(provider.complete(args), timeout);
}

export async function completeJSON<T>(args: CompleteArgs): Promise<T> {
  // wrap user message to bias JSON; provider may ignore
  const provider = pickProvider();
  const timeout = args.timeoutMs ?? toInt(process.env.LLM_TIMEOUT_MS, 8000);
  const maxRetries = 2;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const raw = await withTimeout(provider.complete({ ...args, jsonStrict: true }), timeout);
      return ensureJSON<T>(raw);
    } catch (e) {
      lastErr = e;
      if (attempt < maxRetries) await sleep(120 * (attempt + 1));
    }
  }
  throw lastErr;
}

export async function embed(texts: string[]): Promise<number[][]> {
  const provider = pickProvider();
  const timeout = toInt(process.env.LLM_TIMEOUT_MS, 8000);
  return withTimeout(provider.embed(texts), timeout);
}

// utils
function toInt(v: string | undefined, d: number) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? n : d;
}
function withTimeout<T>(p: Promise<T>, ms: number) {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`LLM timeout after ${ms}ms`)), ms);
    p.then(v => { clearTimeout(t); resolve(v); }).catch(e => { clearTimeout(t); reject(e); });
  });
}
