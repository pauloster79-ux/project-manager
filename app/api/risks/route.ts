// app/api/risks/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";

const SORT_WHITELIST = new Set(["exposure","updated_at","next_review_date","title"]);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("project_id");
  if (!projectId) return apiError(400, "project_id is required");

  const q = (url.searchParams.get("q") || "").trim();
  const minExposure = url.searchParams.get("min_exposure");
  const sort = (url.searchParams.get("sort") || "exposure").toLowerCase();
  const order = (url.searchParams.get("order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "20", 10), 1), 50);
  const offset = (page - 1) * limit;

  const params: any[] = [projectId];
  const where: string[] = [`project_id = $1`];
  if (q) {
    params.push(`%${q}%`);
    where.push(`(title ilike $${params.length} or coalesce(summary,'') ilike $${params.length})`);
  }
  if (minExposure && Number(minExposure) > 0) {
    params.push(Number(minExposure));
    where.push(`exposure >= $${params.length}`);
  }
  const whereSql = `where ${where.join(" and ")}`;
  const sortCol = SORT_WHITELIST.has(sort) ? sort : "exposure";

  const itemsSql = `
    select id, title, summary, probability, impact, owner_id, exposure, next_review_date, updated_at
    from risks
    ${whereSql}
    order by ${sortCol} ${order}
    limit ${limit} offset ${offset}
  `;
  const countSql = `select count(*)::int as total from risks ${whereSql}`;

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
  
  const { project_id, title, probability, impact } = body;
  if (!project_id || !title || !probability || !impact) {
    return apiError(400, "project_id, title, probability, and impact are required");
  }

  const fields = [
    "project_id", "title", "summary", "owner_id", "probability", "impact",
    "mitigation", "next_review_date", "validation_status", "validation_score",
    "issues", "ai_rewrite", "coherence_refs", "provenance", "llm_snapshot_id"
  ];
  const vals = fields.map((k) => {
    if (k === "validation_status") return "draft";
    if (k === "validation_score") return 0;
    return (k in body ? body[k] : null);
  });
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(",");

  const { rows } = await query(
    `insert into risks (${fields.join(",")}) values (${placeholders}) returning *`,
    vals
  );
  const row = rows[0];

  return okJSON(row);
}