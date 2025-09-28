import { okJSON } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export async function GET(_: Request, { params }: { params: { orgId: string } }) {
  const user = await getCurrentUser();
  await requireAccess({ userId: user.id, orgId: params.orgId, need: "org:invite" });

  const { rows } = await query(
    `select id, email, role, token, status, expires_at
       from invitations
      where org_id = $1 and status = 'pending'
      order by created_at desc`,
    [params.orgId]
  );
  return okJSON({ items: rows });
}
