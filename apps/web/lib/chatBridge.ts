export type ChatScope = { type: "project" | "risk" | "decision"; id?: string | null };

export function prefillChat(args: { question?: string; scope?: ChatScope }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("chat:prefill", { detail: args }));
}
