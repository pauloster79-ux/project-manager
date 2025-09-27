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
    select id, title, status, decided_on, updated_at
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
