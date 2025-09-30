export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("Testing basic migration without main db module...");
    
    // Test 1: Basic response
    console.log("Test 1: Basic response test");
    
    // Test 2: Try to import the database module
    let dbModule;
    try {
      console.log("Test 2: Importing database module");
      dbModule = await import("@/src/lib/db");
      console.log("Database module imported successfully");
    } catch (importError) {
      console.error("Failed to import database module:", importError);
      return new Response(JSON.stringify({
        error: {
          message: "Failed to import database module",
          details: importError instanceof Error ? importError.message : String(importError),
          type: "import_error"
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Test 3: Try a simple query
    try {
      console.log("Test 3: Simple query test");
      const result = await dbModule.query("SELECT 1 as test");
      console.log("Simple query result:", result);
      
      return new Response(JSON.stringify({
        message: "Basic migration test completed successfully",
        results: {
          basicTest: "passed",
          importTest: "passed",
          queryTest: result.rows[0]
        },
        timestamp: new Date().toISOString(),
        status: "ok"
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
      
    } catch (queryError) {
      console.error("Query test failed:", queryError);
      return new Response(JSON.stringify({
        error: {
          message: "Query test failed",
          details: queryError instanceof Error ? queryError.message : String(queryError),
          type: "query_error"
        }
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error("Basic migration test failed:", error);
    
    return new Response(JSON.stringify({
      error: {
        message: "Basic migration test failed",
        details: error instanceof Error ? error.message : String(error),
        type: "unexpected_error"
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
