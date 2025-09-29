// app/api/risks/[id]/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { rows } = await query(`select * from risks where id = $1`, [id]);
  if (!rows[0]) return apiError(404, "Risk not found");
  return okJSON(rows[0]);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");

  const fields = [
    "title", "summary", "owner_id", "probability", "impact",
    "mitigation", "next_review_date", "validation_status", "validation_score",
    "issues", "ai_rewrite", "coherence_refs", "provenance", "llm_snapshot_id"
  ];
  
  const updates = fields
    .filter(field => field in body)
    .map((field, index) => `${field} = $${index + 2}`)
    .join(", ");
  
  if (!updates) return apiError(400, "No valid fields to update");
  
  const values = fields.filter(field => field in body).map(field => body[field]);
  const { rows } = await query(
    `update risks set ${updates}, updated_at = now() where id = $1 returning *`,
    [id, ...values]
  );
  
  if (!rows[0]) return apiError(404, "Risk not found");
  return okJSON(rows[0]);
}