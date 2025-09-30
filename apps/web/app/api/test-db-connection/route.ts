export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Testing database connection...");
    
    // Import database module dynamically to avoid build issues
    const { query } = await import("@/src/lib/db");
    const { okJSON, apiError } = await import("@/src/lib/errors");
    
    // Test basic database connection
    const result = await query("SELECT 1 as test");
    console.log("Database connection successful:", result);
    
    return okJSON({ 
      message: "Database connection successful",
      testResult: result.rows[0],
      timestamp: new Date().toISOString(),
      status: "ok"
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    
    // Fallback response if imports fail
    return new Response(JSON.stringify({
      error: {
        message: "Database connection failed",
        details: error instanceof Error ? error.message : String(error),
        type: "database_connection_error"
      }
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
