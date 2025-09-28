import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/session";

export async function POST(req: Request) {
  const { token } = await req.json().catch(() => ({}));
  if (!token) return apiError(400, "token required");

  const user = await getCurrentUser();
  const { rows } = await query(
    `select * from invitations where token = $1 and status = 'pending'`,
    [token]
  );
  const inv = rows[0];
  if (!inv) return apiError(404, "Invite not found");
  if (new Date(inv.expires_at) < new Date()) return apiError(400, "Invite expired");

  await query(
    `insert into org_users (org_id, user_id, role)
         values ($1,$2,$3)
    on conflict (org_id, user_id) do update set role = excluded.role`,
    [inv.org_id, user.id, inv.role]
  );
  await query(
    `update invitations set status='accepted', accepted_at = now(), accepted_user_id = $2 where id = $1`,
    [inv.id, user.id]
  );

  return okJSON({ ok: true, org_id: inv.org_id });
}
