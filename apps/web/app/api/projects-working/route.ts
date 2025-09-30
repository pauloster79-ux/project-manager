import { okJSON, apiError } from "@/src/lib/errors";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Fetching projects using working database connection...");
    
    // Use the working PG approach directly
    const { Pool } = await import('pg');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      return apiError(500, "No database URL found", {
        type: "database_config_error"
      });
    }
    
    // Parse the database URL
    const url = new URL(databaseUrl);
    
    // Create a connection pool
    const pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: url.hostname !== 'localhost' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    console.log("Database pool created successfully for projects");
    
    // Test database connection first
    try {
      const testResult = await pool.query("SELECT 1 as test");
      console.log("Database connection successful for projects:", testResult);
    } catch (dbError) {
      console.error("Database connection failed for projects:", dbError);
      await pool.end();
      return apiError(500, "Database connection failed", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        type: "database_connection_error"
      });
    }
    
    // Fetch projects
    try {
      const projectsResult = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.created_at,
          p.updated_at,
          o.name as org_name
        FROM projects p
        LEFT JOIN organizations o ON p.org_id = o.id
        ORDER BY p.created_at DESC
      `);
      
      console.log(`Found ${projectsResult.rows.length} projects`);
      
      // Close the pool
      await pool.end();
      
      return okJSON({
        items: projectsResult.rows,
        total: projectsResult.rows.length,
        status: "success"
      });
      
    } catch (queryError) {
      console.error("Failed to fetch projects:", queryError);
      await pool.end();
      return apiError(500, "Failed to fetch projects", {
        error: queryError instanceof Error ? queryError.message : String(queryError),
        type: "database_query_error"
      });
    }

  } catch (error) {
    console.error("Projects API failed:", error);
    return apiError(500, "Projects API failed", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "projects_api_error"
    });
  }
}
