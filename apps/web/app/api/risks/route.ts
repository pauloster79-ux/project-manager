// app/api/risks/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";
import { RiskSchema } from "@/src/schemas";
import { writeAudit } from "@/src/domain/audit";
import { enqueue } from "@/src/lib/queue";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

const SORT_WHITELIST = new Set(["exposure","updated_at","next_review_date","title"]);

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const orgId = await getCurrentOrgId();
  
  const url = new URL(req.url);
  const projectId = url.searchParams.get("project_id");
  if (!projectId) return apiError(400, "project_id is required");

  // Check project belongs to current org and user can read it
  const proj = await query(`select id, org_id from projects where id = $1`, [projectId]);
  if (!proj.rows[0] || proj.rows[0].org_id !== orgId) return apiError(403, "Project not in current org");
  await requireAccess({ userId: user.id, orgId, need: "project:read", projectId });

  const q = (url.searchParams.get("q") || "").trim();
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
  const whereSql = `where ${where.join(" and ")}`;
  const sortCol = SORT_WHITELIST.has(sort) ? sort : "exposure";

  const itemsSql = `
    select id, title, probability, impact, exposure, next_review_date, updated_at
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
  const user = await getCurrentUser();
  const orgId = await getCurrentOrgId();

  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");
  // minimally validate required fields
  const { project_id, title, probability, impact } =
    RiskSchema.pick({ project_id: true, title: true, probability: true, impact: true }).parse(body);

  // Check project belongs to current org and user can edit it
  const proj = await query(`select id, org_id from projects where id = $1`, [project_id]);
  if (!proj.rows[0] || proj.rows[0].org_id !== orgId) return apiError(403, "Project not in current org");
  await requireAccess({ userId: user.id, orgId, need: "project:edit", projectId: project_id });

  const fields = [
    "project_id", "title", "summary", "owner_id", "probability", "impact",
    "mitigation", "next_review_date", "validation_status", "validation_score",
    "issues", "ai_rewrite", "coherence_refs", "provenance", "llm_snapshot_id"
  ];
  const vals = fields.map((k) => (k in body ? body[k] : null));
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(",");

  const { rows } = await query(
    `insert into risks (${fields.join(",")}) values (${placeholders}) returning *`,
    vals
  );
  const row = rows[0];

  await writeAudit({
    project_id,
    actor_user_id: user.id,
    actor_source: "ui",
    entity_type: "risk",
    entity_id: row.id,
    action: "create",
    after: row,
  });

  // enqueue initial embedding
  await enqueue("embed:entity", { project_id, entity_type: "risk", entity_id: row.id });

  return okJSON(row);
}
