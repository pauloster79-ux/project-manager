// app/api/projects/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 50);
  const offset = (page - 1) * limit;

  const params: any[] = [];
  const where: string[] = [];
  if (q) {
    params.push(`%${q}%`);
    where.push(`(name ilike $${params.length} or coalesce(description,'') ilike $${params.length})`);
  }
  const whereSql = where.length ? `where ${where.join(" and ")}` : "";

  const itemsSql = `
    select id, name, description, updated_at
    from projects
    ${whereSql}
    order by updated_at desc
    limit ${limit} offset ${offset}
  `;
  const countSql = `select count(*)::int as total from projects ${whereSql}`;

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
  const { name, description } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") return apiError(400, "name is required");
  const { rows } = await query(
    `insert into projects (name, description) values ($1,$2) returning *`,
    [name.trim(), description ?? null]
  );
  return okJSON(rows[0]);
}
