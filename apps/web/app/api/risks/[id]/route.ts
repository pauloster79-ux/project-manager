// app/api/risks/[id]/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";
import { buildPatchSQL } from "@/src/domain/patch";
import { writeAudit } from "@/src/domain/audit";
import { enqueue } from "@/src/lib/queue";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { rows } = await query(`select * from risks where id = $1`, [id]);
  if (!rows[0]) return apiError(404, "Risk not found");
  return okJSON(rows[0]);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");
  const project_id = body.project_id || body.patch?.project_id; // project_id must be provided separately
  if (!project_id) return apiError(400, "project_id is required");

  const patch: Record<string, any> = body.patch || {};
  const ifMatch: string | undefined = body.if_match_updated_at || undefined;
  const llm_snapshot_id: string | undefined = body.llm_snapshot_id;

  // Load before
  const beforeRes = await query(`select * from risks where id = $1 and project_id = $2`, [id, project_id]);
  const before = beforeRes.rows[0];
  if (!before) return apiError(404, "Risk not found");

  const { sql, params: sqlParams } = buildPatchSQL({
    table: "risks",
    id,
    project_id,
    patch: { ...patch, llm_snapshot_id },
    ifMatchUpdatedAt: ifMatch,
  });
  if (!sql) return apiError(400, "No valid fields to update");

  const { rows } = await query(sql, sqlParams);
  const after = rows[0];
  if (!after) return apiError(409, "Update conflict (stale updated_at or not found)");

  await writeAudit({
    project_id,
    actor_source: "ui",
    entity_type: "risk",
    entity_id: id,
    action: "update",
    before,
    after,
    issues: body.issues ?? null,
    llm_snapshot_id: llm_snapshot_id ?? null,
  });

  await enqueue("embed:entity", { project_id, entity_type: "risk", entity_id: id });

  return okJSON(after);
}
