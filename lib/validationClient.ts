// lib/validationClient.ts
export type ValidationResponse = {
  validation_score: number;
  blocked: boolean;
  issues: Array<{
    severity: "critical" | "major" | "minor";
    type: "missing" | "contradiction" | "clarity" | "format";
    message: string;
    suggested_fix?: string;
  }>;
  required_questions: string[];
  safe_fixes?: { normalized_fields?: Record<string, any>; grammar_rewrite?: string };
  proposed_patch: Record<string, any>;
  rationale?: string;
  coherence_refs?: string[];
  llm_snapshot_id: string;
};

export type DecisionValidationResponse = ValidationResponse; // same shape

export async function validateRisk(args: {
  project_id: string;
  entity_id?: string;
  diff: Record<string, any>;
  signal?: AbortSignal;
}): Promise<ValidationResponse> {
  const res = await fetch("/api/validate/risk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: args.signal,
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => null);
    const msg = j?.error?.message || res.statusText;
    throw new Error(msg);
  }
  return res.json();
}

export async function validateDecision(args: {
  project_id: string;
  entity_id?: string;
  diff: Record<string, any>;
  signal?: AbortSignal;
}): Promise<DecisionValidationResponse> {
  const res = await fetch("/api/validate/decision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: args.signal,
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => null);
    const msg = j?.error?.message || res.statusText;
    throw new Error(msg);
  }
  return res.json();
}
