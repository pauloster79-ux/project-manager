// src/lib/llm/json.ts
export function ensureJSON<T = any>(raw: string): T {
  // direct parse
  try { return JSON.parse(raw) as T; } catch {}
  // try to extract the first {...} block
  const m = raw.match(/\{[\s\S]*\}$/m) || raw.match(/\{[\s\S]*?\}/m);
  if (m) {
    try { return JSON.parse(m[0]) as T; } catch {}
  }
  // try to convert single quotes to double quotes (best-effort)
  const fixed = raw.replace(/'/g, '"');
  try { return JSON.parse(fixed) as T; } catch {}
  throw new Error("Failed to parse model output as JSON");
}

export function hash32(s: string): number {
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function* lcg(seed: number) {
  // simple deterministic generator
  let x = seed >>> 0;
  while (true) {
    x = (1664525 * x + 1013904223) >>> 0;
    yield x / 0xffffffff;
  }
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
