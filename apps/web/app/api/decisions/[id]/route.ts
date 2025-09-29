// app/api/decisions/[id]/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";
import { buildPatchSQL } from "@/src/domain/patch";
import { writeAudit } from "@/src/domain/audit";
import { enqueue } from "@/src/lib/queue";
import { PatchDecisionSchema } from "@/src/schemas/common";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { rows } = await query(`select * from decisions where id = $1`, [id]);
  if (!rows[0]) return apiError(404, "Decision not found");
  return okJSON(rows[0]);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) return apiError(400, "Invalid JSON");
    
    const validatedData = PatchDecisionSchema.parse(rawBody);
    const project_id = validatedData.project_id;
    const patch: Record<string, any> = validatedData.patch || {};
    const ifMatch: string | undefined = validatedData.if_match_updated_at;
    const llm_snapshot_id: string | undefined = validatedData.llm_snapshot_id;

  const beforeRes = await query(`select * from decisions where id = $1 and project_id = $2`, [id, project_id]);
  const before = beforeRes.rows[0];
  if (!before) return apiError(404, "Decision not found");

  const { sql, params: sqlParams } = buildPatchSQL({
    table: "decisions",
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
    entity_type: "decision",
    entity_id: id,
    action: "update",
    before,
    after,
    issues: validatedData.issues ?? null,
    llm_snapshot_id: llm_snapshot_id ?? null,
  });

  await enqueue("embed:entity", { project_id, entity_type: "decision", entity_id: id });

  return okJSON(after);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return apiError(400, "Invalid request data", { details: error.message });
    }
    console.error("Decision PATCH error:", error);
    return apiError(500, "Failed to update decision");
  }
}
