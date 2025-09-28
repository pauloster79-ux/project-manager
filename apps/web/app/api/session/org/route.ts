import { okJSON, apiError } from "@/src/lib/errors";
import { setCurrentOrgCookie, getCurrentUser } from "@/src/lib/session";
import { query } from "@/src/lib/db";

export async function POST(req: Request) {
  const { org_id } = await req.json().catch(() => ({}));
  if (!org_id) return apiError(400, "org_id required");
  const user = await getCurrentUser();
  const r = await query(`select 1 from org_users where org_id = $1 and user_id = $2`, [org_id, user.id]);
  if (!r.rows[0]) return apiError(403, "Not a member of that org");
  await setCurrentOrgCookie(org_id);
  return okJSON({ ok: true });
}
