// src/lib/authz.ts
import { query } from "@/src/lib/db";

type OrgRole = "viewer" | "member" | "admin" | "owner";
type ProjectRole = "viewer" | "member" | "pm";
export type Need = "org:read" | "org:invite" | "project:read" | "project:edit";

export async function requireAccess(args: {
  userId: string;
  orgId: string;
  need: Need;
  projectId?: string;
}) {
  const { userId, orgId, need, projectId } = args;

  const orgRole = await getOrgRole(orgId, userId);
  if (!orgRole) throw forbidden("Not in organisation");

  let projectRole: ProjectRole | null = null;
  if (projectId) {
    const r = await query(
      `select role from memberships where project_id = $1 and user_id = $2`,
      [projectId, userId]
    );
    projectRole = r.rows[0]?.role ?? null;
  }

  const orgRank = rankOrg(orgRole);
  const projRank = projectRole ? rankProj(projectRole) : 0;

  switch (need) {
    case "org:read":
      if (orgRank < rankOrg("viewer")) throw forbidden();
      break;
    case "org:invite":
      if (orgRank < rankOrg("admin")) throw forbidden();
      break;
    case "project:read":
      if (orgRank < rankOrg("viewer")) throw forbidden();
      if (!projectRole && orgRank < rankOrg("admin")) throw forbidden("No project access");
      break;
    case "project:edit":
      if (orgRank >= rankOrg("admin")) break; // admin override
      if (orgRank < rankOrg("member")) throw forbidden();
      if (projRank < rankProj("member")) throw forbidden("Insufficient project role");
      break;
  }

  return { orgRole, projectRole };
}

async function getOrgRole(orgId: string, userId: string): Promise<OrgRole | null> {
  const r = await query(`select role from org_users where org_id = $1 and user_id = $2`, [orgId, userId]);
  return (r.rows[0]?.role as OrgRole) ?? null;
}

function rankOrg(r: OrgRole) {
  return { viewer: 1, member: 2, admin: 3, owner: 4 }[r] ?? 0;
}
function rankProj(r: ProjectRole) {
  return { viewer: 1, member: 2, pm: 3 }[r] ?? 0;
}

function forbidden(message = "Forbidden") {
  const { apiError } = require("@/src/lib/errors");
  return apiError(403, message);
}
