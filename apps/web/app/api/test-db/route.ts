import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check if database is accessible
    await query("SELECT 1");
    
    // Check what tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    const tables = tablesResult.rows.map(row => row.table_name);
    
    // Check if we have the required tables
    const requiredTables = ['users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships'];
    const hasRequiredTables = requiredTables.every(table => tables.includes(table));
    
    // Count existing data
    let counts = { users: 0, organizations: 0, projects: 0, risks: 0, decisions: 0 };
    
    if (hasRequiredTables) {
      try {
        const usersCount = await query("SELECT COUNT(*) as count FROM users");
        const orgsCount = await query("SELECT COUNT(*) as count FROM organizations");
        const projectsCount = await query("SELECT COUNT(*) as count FROM projects");
        const risksCount = await query("SELECT COUNT(*) as count FROM risks");
        const decisionsCount = await query("SELECT COUNT(*) as count FROM decisions");
        
        counts = {
          users: parseInt(usersCount.rows[0].count),
          organizations: parseInt(orgsCount.rows[0].count),
          projects: parseInt(projectsCount.rows[0].count),
          risks: parseInt(risksCount.rows[0].count),
          decisions: parseInt(decisionsCount.rows[0].count)
        };
      } catch (error) {
        // Tables exist but might have issues
        console.warn("Error counting data:", error);
      }
    }
    
    const ready = hasRequiredTables && counts.users > 0 && counts.organizations > 0;
    
    return okJSON({
      ready,
      tables,
      hasRequiredTables,
      counts,
      message: ready 
        ? "Database is ready" 
        : hasRequiredTables 
          ? "Database tables exist but no data found"
          : "Database tables missing - run migrations first"
    });
    
  } catch (error) {
    return apiError(500, "Database connection failed", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}