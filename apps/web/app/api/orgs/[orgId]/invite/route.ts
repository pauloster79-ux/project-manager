import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { getCurrentUser } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";
import crypto from "crypto";

export async function POST(req: Request, { params }: { params: { orgId: string } }) {
  const orgId = params.orgId;
  const { email, role } = await req.json().catch(() => ({}));
  if (!email) return apiError(400, "email required");
  const wantRole = role && ["owner","admin","member","viewer"].includes(role) ? role : "member";

  const user = await getCurrentUser();
  await requireAccess({ userId: user.id, orgId, need: "org:invite" });

  const token = crypto.randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000); // 7 days

  const { rows } = await query(
    `insert into invitations (org_id, email, role, token, invited_by, expires_at)
     values ($1,$2,$3,$4,$5,$6) returning id, email, role, token, expires_at`,
    [orgId, email.toLowerCase(), wantRole, token, user.id, expires]
  );

  // In real life, email the token link. For dev, just return it.
  return okJSON({ invite: rows[0] });
}
