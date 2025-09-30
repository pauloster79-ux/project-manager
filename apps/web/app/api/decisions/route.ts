// app/api/decisions/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";
import { DecisionSchema } from "@/src/schemas";
import { writeAudit } from "@/src/domain/audit";
import { enqueue } from "@/src/lib/queue";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export async function GET(req: Request) {
  try {
    console.log("Decisions API called");
    
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

    console.log("Running decisions queries...");
    const [itemsRes, countRes] = await Promise.all([
      query(itemsSql, params),
      query<{ total: number }>(countSql, params),
    ]);

    console.log("Decisions queries completed. Items:", itemsRes.rows.length);

    return okJSON({
      items: itemsRes.rows,
      page,
      pageSize: limit,
      total: countRes.rows[0]?.total ?? 0,
    });
  } catch (error) {
    console.error("Decisions API error:", error);
    return apiError(500, "Failed to fetch decisions", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const orgId = await getCurrentOrgId();

  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");

  const { project_id, title } =
    DecisionSchema.pick({ project_id: true, title: true }).parse(body);

  // Check project belongs to current org and user can edit it
  const proj = await query(`select id, org_id from projects where id = $1`, [project_id]);
  if (!proj.rows[0] || proj.rows[0].org_id !== orgId) return apiError(403, "Project not in current org");
  // TODO: Re-enable permission checks when implementing proper OAuth
  // await requireAccess({ userId: user.id, orgId, need: "project:edit", projectId: project_id });

  const fields = [
    "project_id", "title", "detail", "status", "decided_by", "decided_on",
    "validation_status", "validation_score", "issues", "ai_rewrite",
    "coherence_refs", "provenance", "llm_snapshot_id"
  ];
  const vals = fields.map((k) => (k in body ? body[k] : null));
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(",");

  const { rows } = await query(
    `insert into decisions (${fields.join(",")}) values (${placeholders}) returning *`,
    vals
  );
  const row = rows[0];

  await writeAudit({
    project_id,
    actor_user_id: user.id,
    actor_source: "ui",
    entity_type: "decision",
    entity_id: row.id,
    action: "create",
    after: row,
  });

  await enqueue("embed:entity", { project_id, entity_type: "decision", entity_id: row.id });

  return okJSON(row);
}
