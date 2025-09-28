import { query } from "../apps/web/src/lib/db";

async function seedDatabase() {
  try {
    console.log("Seeding database with required data...");
    
    // Check if we already have data
    const existingUsers = await query("SELECT COUNT(*) as count FROM users");
    const existingOrgs = await query("SELECT COUNT(*) as count FROM organizations");
    
    if (existingUsers.rows[0].count > 0 && existingOrgs.rows[0].count > 0) {
      console.log("Database already has users and organizations. Skipping seed.");
      return;
    }
    
    // Create a default user
    console.log("Creating default user...");
    const userResult = await query(`
      INSERT INTO users (email, display_name) 
      VALUES ('admin@example.com', 'Admin User') 
      RETURNING id
    `);
    const userId = userResult.rows[0].id;
    console.log("✓ Created user:", userId);
    
    // Create a default organization
    console.log("Creating default organization...");
    const orgResult = await query(`
      INSERT INTO organizations (name) 
      VALUES ('Default Organization') 
      RETURNING id
    `);
    const orgId = orgResult.rows[0].id;
    console.log("✓ Created organization:", orgId);
    
    // Add user to organization as owner
    console.log("Adding user to organization...");
    await query(`
      INSERT INTO org_users (org_id, user_id, role) 
      VALUES ($1, $2, 'owner')
    `, [orgId, userId]);
    console.log("✓ Added user to organization as owner");
    
    // Create a sample project
    console.log("Creating sample project...");
    const projectResult = await query(`
      INSERT INTO projects (name, description, org_id) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `, ['Sample Project', 'A sample project for testing', orgId]);
    const projectId = projectResult.rows[0].id;
    console.log("✓ Created sample project:", projectId);
    
    // Add user to project as PM
    console.log("Adding user to project...");
    await query(`
      INSERT INTO memberships (user_id, project_id, role) 
      VALUES ($1, $2, 'pm')
    `, [userId, projectId]);
    console.log("✓ Added user to project as PM");
    
    // Create some sample risks
    console.log("Creating sample risks...");
    const risks = [
      { title: 'Technical Risk', probability: 3, impact: 4, summary: 'Risk of technical challenges' },
      { title: 'Resource Risk', probability: 2, impact: 5, summary: 'Risk of resource constraints' },
      { title: 'Timeline Risk', probability: 4, impact: 3, summary: 'Risk of timeline delays' }
    ];
    
    for (const risk of risks) {
      await query(`
        INSERT INTO risks (project_id, title, summary, probability, impact, owner_id) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [projectId, risk.title, risk.summary, risk.probability, risk.impact, userId]);
    }
    console.log("✓ Created sample risks");
    
    // Create some sample decisions
    console.log("Creating sample decisions...");
    const decisions = [
      { title: 'Technology Choice', status: 'Approved', detail: 'We will use React for the frontend' },
      { title: 'Architecture Decision', status: 'Proposed', detail: 'Microservices architecture' },
      { title: 'Deployment Strategy', status: 'Rejected', detail: 'Manual deployment process' }
    ];
    
    for (const decision of decisions) {
      await query(`
        INSERT INTO decisions (project_id, title, detail, status, decided_by) 
        VALUES ($1, $2, $3, $4, $5)
      `, [projectId, decision.title, decision.detail, decision.status, 
          decision.status === 'Approved' ? userId : null]);
    }
    console.log("✓ Created sample decisions");
    
    console.log("\n🎉 Database seeded successfully!");
    console.log("You can now use the application with:");
    console.log("- User: admin@example.com");
    console.log("- Organization: Default Organization");
    console.log("- Project: Sample Project");
    
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase().then(() => process.exit(0));
