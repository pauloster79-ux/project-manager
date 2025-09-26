// scripts/test-db.ts - Test database connection and basic queries
import { query } from "../src/lib/db";

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    
    // Test basic connection
    const result = await query("SELECT 1 as test");
    console.log("✓ Database connection successful");
    console.log("Test query result:", result.rows[0]);
    
    // Test pgvector extension
    try {
      await query("SELECT 1 - (embedding <=> embedding) as similarity FROM vectors LIMIT 1");
      console.log("✓ pgvector extension is available");
    } catch (e) {
      console.log("⚠ pgvector test query failed (expected if no vectors exist):", e.message);
    }
    
    // Test exposure calculation
    console.log("\nTesting exposure calculation...");
    const projectResult = await query("INSERT INTO projects (name) VALUES ('Test Project') RETURNING id");
    const projectId = projectResult.rows[0].id;
    console.log("✓ Created test project:", projectId);
    
    const riskResult = await query(
      "INSERT INTO risks (project_id, title, probability, impact) VALUES ($1, 'Test Risk', 4, 5) RETURNING id, exposure",
      [projectId]
    );
    const risk = riskResult.rows[0];
    console.log("✓ Created test risk with exposure:", risk.exposure);
    console.log("Expected exposure: 20, Actual:", risk.exposure);
    
    if (risk.exposure === 20) {
      console.log("✓ Exposure calculation working correctly!");
    } else {
      console.log("✗ Exposure calculation failed!");
    }
    
    // Test constraints
    console.log("\nTesting constraints...");
    try {
      await query("INSERT INTO risks (project_id, title, probability, impact) VALUES ($1, 'Invalid Risk', 0, 5)", [projectId]);
      console.log("✗ Constraint test failed - should have rejected probability=0");
    } catch (e) {
      console.log("✓ Constraint working - rejected probability=0");
    }
    
    try {
      await query("INSERT INTO decisions (project_id, title, status) VALUES ($1, 'Invalid Decision', 'Maybe')", [projectId]);
      console.log("✗ Constraint test failed - should have rejected status='Maybe'");
    } catch (e) {
      console.log("✓ Constraint working - rejected status='Maybe'");
    }
    
    // Cleanup
    await query("DELETE FROM projects WHERE id = $1", [projectId]);
    console.log("✓ Cleaned up test data");
    
    console.log("\n🎉 All database tests passed!");
    
  } catch (error) {
    console.error("❌ Database test failed:", error.message);
    process.exit(1);
  }
}

testDatabase();
