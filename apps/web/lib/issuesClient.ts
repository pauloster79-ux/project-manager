export type IterateResponse = {
  proposed_patch: Record<string, any>;
  rationale: string;
  followups: string[];
};

export async function iterateIssue(args: {
  project_id: string;
  entity_type: "risk" | "decision";
  entity_id: string;
  instruction: string;
  current_patch?: Record<string, any>;
  issues?: Array<{ severity: string; type: string; message: string }>;
  signal?: AbortSignal;
}): Promise<IterateResponse> {
  const res = await fetch("/api/issues/iterate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: args.signal,
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => null);
    throw new Error(j?.error?.message || res.statusText);
  }
  return res.json();
}
