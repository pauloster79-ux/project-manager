import { okJSON, apiError } from "@/src/lib/errors";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { query } from "@/src/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    // Get user's org memberships
    const orgMemberships = await query(
      `SELECT ou.org_id, ou.role, o.name as org_name 
       FROM org_users ou 
       JOIN organizations o ON ou.org_id = o.id 
       WHERE ou.user_id = $1`,
      [user.id]
    );
    
    // Get user's project memberships
    const projectMemberships = await query(
      `SELECT m.project_id, m.role, p.name as project_name, p.org_id
       FROM memberships m 
       JOIN projects p ON m.project_id = p.id 
       WHERE m.user_id = $1`,
      [user.id]
    );
    
    return okJSON({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
      },
      currentOrgId: orgId,
      orgMemberships: orgMemberships.rows,
      projectMemberships: projectMemberships.rows
    });
  } catch (error) {
    return apiError(500, "Debug failed", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}