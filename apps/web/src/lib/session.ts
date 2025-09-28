// src/lib/session.ts
import { cookies } from "next/headers";
import { query } from "@/src/lib/db";

export type SessionUser = { id: string; email?: string | null; display_name?: string | null };

export async function getCurrentUser(): Promise<SessionUser> {
  // DEV STUB: return the first user. Replace with your auth.
  const { rows } = await query(`select id, email, display_name from users order by created_at asc limit 1`);
  if (!rows[0]) throw new Error("No users found. Seed at least one user.");
  return rows[0];
}

export async function getCurrentOrgId(): Promise<string> {
  const c = cookies();
  const orgId = c.get("org_id")?.value;
  if (orgId) return orgId;

  // fallback: pick the user's first org (or create default)
  const user = await getCurrentUser();
  const r = await query(
    `select ou.org_id from org_users ou where ou.user_id = $1 order by created_at asc limit 1`,
    [user.id]
  );
  if (r.rows[0]?.org_id) return r.rows[0].org_id;

  // last resort: take the oldest org
  const any = await query(`select id from organizations order by created_at asc limit 1`);
  if (!any.rows[0]) throw new Error("No organization found. Create one first.");
  return any.rows[0].id;
}

export async function setCurrentOrgCookie(orgId: string) {
  const c = cookies();
  c.set("org_id", orgId, { httpOnly: false, sameSite: "lax", path: "/" });
}
