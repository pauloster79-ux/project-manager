// app/api/documents/upload/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/src/lib/db";
import { apiError } from "@/src/lib/errors";
import { presignPut } from "@/src/lib/storage";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");
  const { project_id, entity_type, entity_id, filename, mime_type, size_bytes } = body || {};
  if (!project_id || !entity_type || !entity_id || !filename || !mime_type) {
    return apiError(400, "project_id, entity_type, entity_id, filename, mime_type are required");
  }

  const allowed = (process.env.ALLOWED_MIME || "").split(",").filter(Boolean);
  if (allowed.length && !allowed.includes(mime_type)) return apiError(400, "Unsupported mime_type");

  const max = Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024);
  if (size_bytes && size_bytes > max) return apiError(400, `File too large (>${max} bytes)`);

  const safeName = filename.replace(/[^\w.\- ]+/g, "_");
  const attId = crypto.randomUUID();
  const key = `${project_id}/${attId}/${safeName}`;

  // Create row (pending)
  const { rows } = await query(
    `insert into attachments
       (id, project_id, entity_type, entity_id, filename, mime_type, storage_key, size_bytes, text_extract_status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
     returning id, project_id, filename, mime_type, storage_key`,
    [attId, project_id, entity_type, entity_id, safeName, mime_type, key, size_bytes || null]
  );

  const upload_url = await presignPut(key, mime_type, 900);
  return NextResponse.json({ attachment_id: attId, upload_url, storage_key: key, item: rows[0] });
}
