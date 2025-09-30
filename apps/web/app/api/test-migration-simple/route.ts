export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log("Testing simple migration...");
    
    // Import database module dynamically
    const { query } = await import("@/src/lib/db");
    
    // Test 1: Simple connection test
    console.log("Test 1: Connection test");
    const connectionTest = await query("SELECT 1 as test");
    console.log("Connection test result:", connectionTest);
    
    // Test 2: Check if tables exist
    console.log("Test 2: Check existing tables");
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log("Existing tables:", tablesCheck.rows);
    
    // Test 3: Create a simple test table
    console.log("Test 3: Create test table");
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS test_migration (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log("Test table created successfully");
    } catch (error) {
      console.error("Error creating test table:", error);
    }
    
    // Test 4: Insert test data
    console.log("Test 4: Insert test data");
    try {
      await query(`
        INSERT INTO test_migration (name) 
        VALUES ('migration test') 
        ON CONFLICT DO NOTHING
      `);
      console.log("Test data inserted successfully");
    } catch (error) {
      console.error("Error inserting test data:", error);
    }
    
    // Test 5: Query test data
    console.log("Test 5: Query test data");
    const testData = await query("SELECT * FROM test_migration LIMIT 5");
    console.log("Test data:", testData.rows);
    
    return new Response(JSON.stringify({
      message: "Simple migration test completed successfully",
      results: {
        connectionTest: connectionTest.rows[0],
        existingTables: tablesCheck.rows.map(row => row.table_name),
        testData: testData.rows
      },
      timestamp: new Date().toISOString(),
      status: "ok"
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error("Simple migration test failed:", error);
    
    return new Response(JSON.stringify({
      error: {
        message: "Simple migration test failed",
        details: error instanceof Error ? error.message : String(error),
        type: "migration_test_error"
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
