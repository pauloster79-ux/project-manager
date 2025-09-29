// src/domain/patch.ts
type Column = string;

interface PatchOptions {
  table: "risks" | "decisions";
  id: string;
  project_id: string;
  patch: Record<string, unknown>;
  ifMatchUpdatedAt?: string;
}

export function buildPatchSQL(opts: PatchOptions) {
  const { table, id, project_id, patch, ifMatchUpdatedAt } = opts;

  const allowed: Record<typeof table, Column[]> = {
    risks: [
      "title", "summary", "owner_id", "probability", "impact",
      "mitigation", "next_review_date", "validation_status", "validation_score",
      "issues", "ai_rewrite", "coherence_refs", "provenance", "llm_snapshot_id"
    ],
    decisions: [
      "title", "detail", "status", "decided_by", "decided_on",
      "validation_status", "validation_score", "issues", "ai_rewrite",
      "coherence_refs", "provenance", "llm_snapshot_id"
    ],
  };

  const setCols: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [k, v] of Object.entries(patch)) {
    if (!allowed[table].includes(k)) continue;
    setCols.push(`${k} = $${idx++}`);
    values.push(v);
  }

  // nothing to update
  if (setCols.length === 0) {
    return { sql: null as string | null, params: [] as unknown[] };
  }

  setCols.push(`updated_at = now()`);

  // WHERE conditions
  const whereParts = [`id = $${idx++}`, `project_id = $${idx++}`];
  values.push(id, project_id);

  if (ifMatchUpdatedAt) {
    whereParts.push(`updated_at = $${idx++}`);
    values.push(ifMatchUpdatedAt);
  }

  const sql = `
    update ${table}
    set ${setCols.join(", ")}
    where ${whereParts.join(" and ")}
    returning *;
  `;
  return { sql, params: values };
}
