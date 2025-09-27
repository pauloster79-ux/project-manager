import { config } from "dotenv";
import { query } from "../apps/web/src/lib/db";

// Load environment variables
config();

async function testRiskValidation() {
  console.log("🧪 Testing Risk Validation API...\n");

  try {
    // Get a project ID from the database
    const { rows: projects } = await query("SELECT id FROM projects LIMIT 1");
    
    if (!projects.length) {
      console.log("❌ No projects found. Please run the test data script first.");
      return;
    }

    const projectId = projects[0].id;
    console.log(`📁 Using project: ${projectId}`);

    // Test 1: Create a test risk with high exposure
    console.log("\n1️⃣ Creating test risk with high exposure...");
    const { rows: riskRows } = await query(`
      INSERT INTO risks (project_id, title, probability, impact, mitigation)
      VALUES ($1, 'API latency', 4, 5, 'waiting for vendor')
      RETURNING id
    `, [projectId]);
    
    const riskId = riskRows[0].id;
    console.log(`✅ Created risk: ${riskId}`);

    // Test 2: Validate existing risk (high exposure)
    console.log("\n2️⃣ Testing validation of existing risk...");
    const validationResponse = await fetch("http://localhost:3000/api/validate/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        entity_id: riskId,
        diff: {
          probability: 5,
          impact: 5,
          mitigation: "waiting for vendor"
        }
      })
    });

    if (!validationResponse.ok) {
      console.log(`❌ Validation failed: ${validationResponse.status} ${validationResponse.statusText}`);
      const errorText = await validationResponse.text();
      console.log(`Error: ${errorText}`);
      return;
    }

    const validationResult = await validationResponse.json();
    console.log("✅ Validation completed:");
    console.log(`   Validation score: ${validationResult.validation_score}`);
    console.log(`   Blocked: ${validationResult.blocked}`);
    console.log(`   Issues: ${validationResult.issues.length} found`);
    console.log(`   Required questions: ${validationResult.required_questions.length}`);
    console.log(`   LLM snapshot: ${validationResult.llm_snapshot_id}`);

    // Show issues
    if (validationResult.issues.length > 0) {
      console.log("\n   Issues found:");
      validationResult.issues.forEach((issue: any, i: number) => {
        console.log(`   ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}`);
        if (issue.suggested_fix) {
          console.log(`      Suggested: ${issue.suggested_fix}`);
        }
      });
    }

    // Test 3: Validate new risk (no entity_id)
    console.log("\n3️⃣ Testing validation of new risk...");
    const newRiskResponse = await fetch("http://localhost:3000/api/validate/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        diff: {
          title: "Vendor instability",
          probability: 4,
          impact: 4,
          mitigation: "TBD"
        }
      })
    });

    if (!newRiskResponse.ok) {
      console.log(`❌ New risk validation failed: ${newRiskResponse.status}`);
      return;
    }

    const newRiskResult = await newRiskResponse.json();
    console.log("✅ New risk validation completed:");
    console.log(`   Validation score: ${newRiskResult.validation_score}`);
    console.log(`   Issues: ${newRiskResult.issues.length} found`);

    // Test 4: Test LLM fallback (temporarily set timeout to 1ms)
    console.log("\n4️⃣ Testing LLM fallback...");
    const originalTimeout = process.env.LLM_TIMEOUT_MS;
    process.env.LLM_TIMEOUT_MS = "1";
    
    const fallbackResponse = await fetch("http://localhost:3000/api/validate/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        entity_id: riskId,
        diff: { mitigation: "improved mitigation plan" }
      })
    });

    // Restore timeout
    if (originalTimeout) {
      process.env.LLM_TIMEOUT_MS = originalTimeout;
    } else {
      delete process.env.LLM_TIMEOUT_MS;
    }

    if (!fallbackResponse.ok) {
      console.log(`❌ Fallback test failed: ${fallbackResponse.status}`);
      return;
    }

    const fallbackResult = await fallbackResponse.json();
    console.log("✅ Fallback test completed:");
    console.log(`   LLM snapshot: ${fallbackResult.llm_snapshot_id}`);
    console.log(`   Rationale: ${fallbackResult.rationale}`);

    // Cleanup
    console.log("\n🧹 Cleaning up test data...");
    await query("DELETE FROM risks WHERE id = $1", [riskId]);
    console.log("✅ Test risk deleted");

    console.log("\n🎉 All risk validation tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testRiskValidation().catch(console.error);
