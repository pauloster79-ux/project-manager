export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Step 1: Test error handling import
    let errorModule;
    try {
      errorModule = await import("@/src/lib/errors");
      console.log("Error module imported successfully");
    } catch (importError) {
      console.error("Failed to import error module:", importError);
      return new Response(JSON.stringify({
        error: {
          message: "Failed to import error module",
          details: importError instanceof Error ? importError.message : String(importError),
          type: "import_error"
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Step 2: Test database module import
    let dbModule;
    try {
      dbModule = await import("@/src/lib/db");
      console.log("Database module imported successfully");
    } catch (importError) {
      console.error("Failed to import database module:", importError);
      return errorModule.apiError(500, "Failed to import database module", {
        details: importError instanceof Error ? importError.message : String(importError),
        type: "database_import_error"
      });
    }
    
    // Step 3: Test database connection
    try {
      const result = await dbModule.query("SELECT 1 as test");
      console.log("Database connection successful:", result);
      
      return errorModule.okJSON({ 
        message: "Database connection successful",
        testResult: result.rows[0],
        timestamp: new Date().toISOString(),
        status: "ok"
      });
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      return errorModule.apiError(500, "Database query failed", {
        details: dbError instanceof Error ? dbError.message : String(dbError),
        type: "database_query_error"
      });
    }
    
  } catch (error) {
    console.error("Unexpected error:", error);
    
    // Final fallback response
    return new Response(JSON.stringify({
      error: {
        message: "Unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
        type: "unexpected_error"
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
