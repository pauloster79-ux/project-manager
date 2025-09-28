import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/session";

export async function GET() {
  const user = await getCurrentUser();
  const { rows } = await query(
    `select o.id, o.name, ou.role
       from organizations o
       join org_users ou on ou.org_id = o.id
      where ou.user_id = $1
      order by o.created_at asc`,
    [user.id]
  );
  return okJSON({ items: rows });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  const { name } = await req.json().catch(() => ({}));
  if (!name || typeof name !== "string") return apiError(400, "name is required");

  const org = await query(`insert into organizations (name) values ($1) returning *`, [name.trim()]);
  const orgId = org.rows[0].id;
  await query(
    `insert into org_users (org_id, user_id, role) values ($1,$2,'owner') on conflict do nothing`,
    [orgId, user.id]
  );
  return okJSON(org.rows[0]);
}
