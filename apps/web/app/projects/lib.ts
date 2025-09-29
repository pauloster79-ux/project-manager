import { query } from "@/src/lib/db";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export interface Project {
  id: string;
  name: string;
  description?: string;
  updated_at: string;
}

export async function getProjects(): Promise<{ projects: Project[]; error?: string }> {
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    await requireAccess({ userId: user.id, orgId, need: "org:read" });

    const { rows } = await query(
      `select id, name, description, updated_at from projects where org_id = $1 order by updated_at desc`,
      [orgId]
    );

    return { projects: rows };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { 
      projects: [], 
      error: error instanceof Error ? error.message : "Failed to load projects" 
    };
  }
}
