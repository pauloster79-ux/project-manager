export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Testing database with standard pg package...");
    
    // Check environment variables
    const envVars = {
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV || 'NOT SET'
    };
    
    console.log("Environment variables:", envVars);
    
    // Try to import the pg-based database module
    let dbModule;
    try {
      dbModule = await import("@/src/lib/db-pg");
      console.log("PG database module imported successfully");
    } catch (importError) {
      console.error("Failed to import pg database module:", importError);
      return new Response(JSON.stringify({
        error: {
          message: "Failed to import pg database module",
          details: importError instanceof Error ? importError.message : String(importError),
          type: "database_import_error",
          environment: envVars
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Try to make a simple query
    try {
      const result = await dbModule.query("SELECT 1 as test");
      console.log("Database query successful:", result);
      
      return new Response(JSON.stringify({
        message: "Database connection successful with pg package",
        testResult: result.rows[0],
        environment: envVars,
        timestamp: new Date().toISOString(),
        status: "ok"
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (queryError) {
      console.error("Database query failed:", queryError);
      return new Response(JSON.stringify({
        error: {
          message: "Database query failed",
          details: queryError instanceof Error ? queryError.message : String(queryError),
          type: "database_query_error",
          environment: envVars
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(JSON.stringify({
      error: {
        message: "Unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
        type: "unexpected_error"
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
