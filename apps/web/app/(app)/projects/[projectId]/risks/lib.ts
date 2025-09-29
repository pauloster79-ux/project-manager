import { query } from "@/src/lib/db";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export interface RiskListItem {
  id: string;
  title: string;
  probability: number;
  impact: number;
  exposure: number;
  next_review_date?: string;
  updated_at: string;
}

export async function getRisks(projectId: string): Promise<{ risks: RiskListItem[]; error?: string }> {
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    await requireAccess({ userId: user.id, orgId, need: "org:read" });

    const { rows } = await query(
      `select id, title, probability, impact, (probability * impact) as exposure, next_review_date, updated_at 
       from risks 
       where project_id = $1 
       order by exposure desc, updated_at desc 
       limit 20`,
      [projectId]
    );

    return { risks: rows };
  } catch (error) {
    console.error("Error fetching risks:", error);
    return { 
      risks: [], 
      error: error instanceof Error ? error.message : "Failed to load risks" 
    };
  }
}
