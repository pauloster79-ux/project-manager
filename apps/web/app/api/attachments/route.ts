// app/api/attachments/route.ts
import { NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { apiError } from "@/src/lib/errors";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const project_id = url.searchParams.get("project_id");
  if (!project_id) return apiError(400, "project_id is required");
  const entity_type = url.searchParams.get("entity_type"); // 'risk' | 'decision'
  const entity_id = url.searchParams.get("entity_id");

  const where: string[] = [`project_id = $1`];
  const params: any[] = [project_id];
  if (entity_type) {
    where.push(`entity_type = $${params.length + 1}`);
    params.push(entity_type);
  }
  if (entity_id) {
    where.push(`entity_id = $${params.length + 1}`);
    params.push(entity_id);
  }
  const sql = `
    select id, filename, mime_type, size_bytes, text_extract_status, uploaded_at, entity_type, entity_id
    from attachments
    where ${where.join(" and ")}
    order by uploaded_at desc
    limit 100
  `;
  const { rows } = await query(sql, params);
  return NextResponse.json({ items: rows });
}
