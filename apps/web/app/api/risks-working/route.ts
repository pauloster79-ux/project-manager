import { okJSON, apiError } from "@/src/lib/errors";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return apiError(400, "Project ID is required", {
        type: "missing_project_id"
      });
    }
    
    console.log("Fetching risks for project:", projectId);
    
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
    
    // Fetch risks for this project
    const { rows } = await pool.query(
      `select id, title, probability, impact, (probability * impact) as exposure, next_review_date, updated_at 
       from risks 
       where project_id = $1 
       order by exposure desc, updated_at desc 
       limit 20`,
      [projectId]
    );
    
    console.log(`Found ${rows.length} risks for project ${projectId}`);
    
    // Close the pool
    await pool.end();
    
    return okJSON({
      items: rows,
      total: rows.length,
      projectId: projectId,
      status: "success"
    });
    
  } catch (error) {
    console.error("Risks API failed:", error);
    return apiError(500, "Failed to fetch risks", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "risks_api_error"
    });
  }
}
