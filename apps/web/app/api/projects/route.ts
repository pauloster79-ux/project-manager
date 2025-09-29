// app/api/projects/route.ts
import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";
import { CreateProjectSchema } from "@/src/schemas/common";

export async function GET(req: Request) {
  try {
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
  } catch (error) {
    console.error("Projects API error:", error);
    return apiError(500, "Failed to fetch projects", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    const rawBody = await req.json().catch(() => ({}));
    const validatedData = CreateProjectSchema.parse(rawBody);
    
    const { rows } = await query(
      `insert into projects (name, description, org_id) values ($1,$2,$3) returning *`,
      [validatedData.name.trim(), validatedData.description ?? null, orgId]
    );
    return okJSON(rows[0]);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return apiError(400, "Invalid request data", { details: error.message });
    }
    console.error("Projects POST error:", error);
    return apiError(500, "Failed to create project");
  }
}
