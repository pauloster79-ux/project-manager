import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export async function GET(_: Request, { params }: { params: { orgId: string } }) {
  const user = await getCurrentUser();
  await requireAccess({ userId: user.id, orgId: params.orgId, need: "org:read" });

  const { rows } = await query(
    `select u.id, u.email, u.display_name, ou.role
       from org_users ou
       join users u on u.id = ou.user_id
      where ou.org_id = $1
      order by u.display_name nulls last, u.email asc`,
    [params.orgId]
  );
  return okJSON({ items: rows });
}
