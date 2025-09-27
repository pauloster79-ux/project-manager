import { config } from "dotenv";
import { packContextForRisk, packContextForDecision, packContextForQuestion, vectorSearch } from "../apps/web/src/lib/retrieval";

// Load environment variables
config();

async function testRetrieval() {
  console.log("🧪 Testing Retrieval Utilities...\n");

  try {
    // Get a project ID from the database
    const { query } = await import("../apps/web/src/lib/db");
    const { rows: projects } = await query("SELECT id FROM projects LIMIT 1");
    
    if (!projects.length) {
      console.log("❌ No projects found. Please run the test data script first.");
      return;
    }

    const projectId = projects[0].id;
    console.log(`📁 Using project: ${projectId}`);

    // Test 1: Risk context packing
    console.log("\n1️⃣ Testing Risk Context Packing...");
    const { rows: risks } = await query("SELECT id FROM risks WHERE project_id = $1 LIMIT 1", [projectId]);
    
    if (risks.length) {
      const riskId = risks[0].id;
      const riskContext = await packContextForRisk(projectId, riskId);
      console.log("✅ Risk context packed successfully:");
      console.log(`   Entity summary: ${riskContext.entity_summary ? "✅" : "❌"}`);
      console.log(`   Related summaries: ${riskContext.related_summaries.length} items`);
      console.log(`   Doc snippets: ${riskContext.doc_snippets.length} items`);
    } else {
      console.log("⚠️  No risks found for context testing");
    }

    // Test 2: Decision context packing
    console.log("\n2️⃣ Testing Decision Context Packing...");
    const { rows: decisions } = await query("SELECT id FROM decisions WHERE project_id = $1 LIMIT 1", [projectId]);
    
    if (decisions.length) {
      const decisionId = decisions[0].id;
      const decisionContext = await packContextForDecision(projectId, decisionId);
      console.log("✅ Decision context packed successfully:");
      console.log(`   Entity summary: ${decisionContext.entity_summary ? "✅" : "❌"}`);
      console.log(`   Related summaries: ${decisionContext.related_summaries.length} items`);
      console.log(`   Doc snippets: ${decisionContext.doc_snippets.length} items`);
    } else {
      console.log("⚠️  No decisions found for context testing");
    }

    // Test 3: Question context packing
    console.log("\n3️⃣ Testing Question Context Packing...");
    const questionContext = await packContextForQuestion(projectId, "What are the top risks by exposure?");
    console.log("✅ Question context packed successfully:");
    console.log(`   Related summaries: ${questionContext.related_summaries.length} items`);
    console.log(`   Doc snippets: ${questionContext.doc_snippets.length} items`);

    // Test 4: Vector search (with mock vector)
    console.log("\n4️⃣ Testing Vector Search...");
    const mockVector = new Array(1536).fill(0.1);
    const vectorResults = await vectorSearch({
      projectId,
      queryVector: mockVector,
      k: 5,
      sourceTypes: ["risk", "decision"]
    });
    console.log(`✅ Vector search completed: ${vectorResults.length} results`);
    
    if (vectorResults.length > 0) {
      console.log(`   Top result score: ${vectorResults[0].score.toFixed(3)}`);
      console.log(`   Source types: ${[...new Set(vectorResults.map(r => r.source_type))].join(", ")}`);
    }

    console.log("\n🎉 All retrieval tests completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testRetrieval().catch(console.error);
