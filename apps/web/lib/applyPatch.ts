// lib/applyPatch.ts
export async function applyRiskPatch(args: {
  project_id: string;
  id: string;
  patch: Record<string, any>;
  llm_snapshot_id?: string;
  if_match_updated_at?: string;
}) {
  const res = await fetch(`/api/risks/${args.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => null);
    throw new Error(j?.error?.message || res.statusText);
  }
  return res.json();
}

export async function applyDecisionPatch(args: {
  project_id: string;
  id: string;
  patch: Record<string, any>;
  llm_snapshot_id?: string;
  if_match_updated_at?: string;
}) {
  const res = await fetch(`/api/decisions/${args.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => null);
    throw new Error(j?.error?.message || res.statusText);
  }
  return res.json();
}
