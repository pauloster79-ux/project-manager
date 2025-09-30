import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Testing database connection...");
    
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
    return apiError(500, "Database connection failed", { 
      error: error instanceof Error ? error.message : String(error),
      type: "database_connection_error"
    });
  }
}
