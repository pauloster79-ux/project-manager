import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check database connection
    await query("SELECT 1");
    
    // Check if we have required data
    const [usersResult, orgsResult, projectsResult] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users"),
      query("SELECT COUNT(*) as count FROM organizations"),
      query("SELECT COUNT(*) as count FROM projects")
    ]);
    
    const users = parseInt(usersResult.rows[0].count);
    const orgs = parseInt(orgsResult.rows[0].count);
    const projects = parseInt(projectsResult.rows[0].count);
    
    const status = {
      database: "connected",
      users,
      organizations: orgs,
      projects,
      ready: users > 0 && orgs > 0
    };
    
    if (!status.ready) {
      return apiError(503, "Database not ready - missing users or organizations", status);
    }
    
    return okJSON(status);
  } catch (error) {
    return apiError(500, "Database connection failed", { 
      error: error instanceof Error ? error.message : String(error),
      database: "disconnected"
    });
  }
}
