import { okJSON, apiError } from "@/src/lib/errors";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Debugging projects data...");
    
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
    
    // Fetch projects with detailed info
    try {
      const projectsResult = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.description,
          p.created_at,
          p.updated_at,
          o.name as org_name,
          LENGTH(p.id) as id_length,
          p.id::text as id_text
        FROM projects p
        LEFT JOIN organizations o ON p.org_id = o.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `);
      
      console.log(`Found ${projectsResult.rows.length} projects for debugging`);
      
      // Close the pool
      await pool.end();
      
      return okJSON({
        projects: projectsResult.rows,
        total: projectsResult.rows.length,
        debug: {
          sampleProject: projectsResult.rows[0] || null,
          allIds: projectsResult.rows.map(p => ({ id: p.id, idLength: p.id_length, name: p.name }))
        },
        status: "success"
      });
      
    } catch (queryError) {
      console.error("Failed to fetch projects for debugging:", queryError);
      await pool.end();
      return apiError(500, "Failed to fetch projects for debugging", {
        error: queryError instanceof Error ? queryError.message : String(queryError),
        type: "database_query_error"
      });
    }

  } catch (error) {
    console.error("Debug projects API failed:", error);
    return apiError(500, "Debug projects API failed", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "debug_projects_api_error"
    });
  }
}
