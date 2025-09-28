// app/api/projects/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const orgId = await getCurrentOrgId();
  await requireAccess({ userId: user.id, orgId, need: "org:read" });

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 50);
  const offset = (page - 1) * limit;

  const params: any[] = [orgId];
  const where: string[] = ["p.org_id = $1"];
  if (q) {
    params.push(`%${q}%`);
    where.push(`(p.name ilike $${params.length} or coalesce(p.description,'') ilike $${params.length})`);
  }
  const whereSql = `where ${where.join(" and ")}`;

  const itemsSql = `
    select p.id, p.name, p.description, p.updated_at
    from projects p
    ${whereSql}
    order by p.updated_at desc
    limit ${limit} offset ${offset}
  `;
  const countSql = `select count(*)::int as total from projects p ${whereSql}`;

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
  const user = await getCurrentUser();
  const orgId = await getCurrentOrgId();
  const { name, description } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") return apiError(400, "name is required");
  const { rows } = await query(
    `insert into projects (name, description, org_id) values ($1,$2,$3) returning *`,
    [name.trim(), description ?? null, orgId]
  );
  return okJSON(rows[0]);
}
