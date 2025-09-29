import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export async function GET() {
  try {
    // Test basic connection
    await query("SELECT 1");
    
    // Check if we have the required tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'organizations', 'projects', 'risks', 'decisions')
      ORDER BY table_name
    `);
    
    const tableNames = tables.rows.map(row => row.table_name);
    
    // Check if we have any data
    const [usersCount, orgsCount, projectsCount] = await Promise.all([
      query("SELECT COUNT(*) as count FROM users").catch(() => ({ rows: [{ count: 0 }] })),
      query("SELECT COUNT(*) as count FROM organizations").catch(() => ({ rows: [{ count: 0 }] })),
      query("SELECT COUNT(*) as count FROM projects").catch(() => ({ rows: [{ count: 0 }] }))
    ]);
    
    return okJSON({
      status: "connected",
      tables: tableNames,
      counts: {
        users: parseInt(usersCount.rows[0].count),
        organizations: parseInt(orgsCount.rows[0].count),
        projects: parseInt(projectsCount.rows[0].count)
      },
      ready: tableNames.length === 5 && 
             parseInt(usersCount.rows[0].count) > 0 && 
             parseInt(orgsCount.rows[0].count) > 0
    });
  } catch (error) {
    return apiError(500, "Database test failed", { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
