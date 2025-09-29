import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";

export async function GET() {
  try {
    // Test database connection
    await query("SELECT 1");
    
    // Test session
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    // Check what data exists
    const projects = await query("SELECT COUNT(*) as count FROM projects");
    const risks = await query("SELECT COUNT(*) as count FROM risks");
    const decisions = await query("SELECT COUNT(*) as count FROM decisions");
    const users = await query("SELECT COUNT(*) as count FROM users");
    const orgs = await query("SELECT COUNT(*) as count FROM organizations");
    
    // Get sample data
    const sampleProjects = await query("SELECT id, name, org_id FROM projects LIMIT 5");
    const sampleRisks = await query("SELECT id, title, project_id FROM risks LIMIT 5");
    const sampleDecisions = await query("SELECT id, title, project_id FROM decisions LIMIT 5");
    
    return okJSON({
      database: "connected",
      session: {
        user: { id: user.id, email: user.email, display_name: user.display_name },
        orgId
      },
      counts: {
        projects: parseInt(projects.rows[0].count),
        risks: parseInt(risks.rows[0].count),
        decisions: parseInt(decisions.rows[0].count),
        users: parseInt(users.rows[0].count),
        organizations: parseInt(orgs.rows[0].count)
      },
      sampleData: {
        projects: sampleProjects.rows,
        risks: sampleRisks.rows,
        decisions: sampleDecisions.rows
      }
    });
    
  } catch (error) {
    return apiError(500, "Debug check failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
