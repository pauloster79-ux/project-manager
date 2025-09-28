// app/api/documents/commit/route.ts
import { NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { apiError } from "@/src/lib/errors";
import { enqueue } from "@/src/lib/queue";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");
  const { attachment_id, sha256 } = body;
  if (!attachment_id) return apiError(400, "attachment_id is required");

  const { rows } = await query(`select * from attachments where id = $1`, [attachment_id]);
  const att = rows[0];
  if (!att) return apiError(404, "Attachment not found");

  await query(`update attachments set sha256 = $1, text_extract_status = 'pending' where id = $2`, [
    sha256 || null,
    attachment_id,
  ]);

  await enqueue("embed:document", { attachment_id, project_id: att.project_id });

  return NextResponse.json({ ok: true, attachment_id });
}
