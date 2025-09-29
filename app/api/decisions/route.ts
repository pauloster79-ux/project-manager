// app/api/decisions/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("project_id");
  if (!projectId) return apiError(400, "project_id is required");

  const q = (url.searchParams.get("q") || "").trim();
  const status = url.searchParams.get("status"); // Proposed|Approved|Rejected
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 50);
  const offset = (page - 1) * limit;

  const params: any[] = [projectId];
  const where: string[] = [`project_id = $1`];
  if (status) {
    params.push(status);
    where.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    where.push(`(title ilike $${params.length} or coalesce(detail,'') ilike $${params.length})`);
  }
  const whereSql = `where ${where.join(" and ")}`;

  const itemsSql = `
    select id, title, detail, status, decided_on, updated_at
    from decisions
    ${whereSql}
    order by updated_at desc
    limit ${limit} offset ${offset}
  `;
  const countSql = `select count(*)::int as total from decisions ${whereSql}`;

  const [itemsRes, countRes] = await Promise.all([
    query(itemsSql, params),
    query<{ total: number }>(countSql, params),
  ]);

  return okJSON({
    items: itemsRes.rows,
    page,
    pageSize: limit,
    total: countRes.rows[0]?.total ?? 0,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");
  
  const { project_id, title } = body;
  if (!project_id || !title) {
    return apiError(400, "project_id and title are required");
  }

  const fields = [
    "project_id", "title", "detail", "status", "decided_by", "decided_on",
    "validation_status", "validation_score", "issues", "ai_rewrite",
    "coherence_refs", "provenance", "llm_snapshot_id"
  ];
  const vals = fields.map((k) => {
    if (k === "validation_status") return "draft";
    if (k === "validation_score") return 0;
    return (k in body ? body[k] : null);
  });
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(",");

  const { rows } = await query(
    `insert into decisions (${fields.join(",")}) values (${placeholders}) returning *`,
    vals
  );
  const row = rows[0];

  return okJSON(row);
}