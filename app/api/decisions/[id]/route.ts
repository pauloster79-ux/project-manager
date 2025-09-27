// app/api/decisions/[id]/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { rows } = await query(`select * from decisions where id = $1`, [id]);
  if (!rows[0]) return apiError(404, "Decision not found");
  return okJSON(rows[0]);
}
