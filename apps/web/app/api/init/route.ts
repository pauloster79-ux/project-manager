import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export async function POST() {
  try {
    // Check if we already have data
    const existingUsers = await query("SELECT COUNT(*) as count FROM users");
    const existingOrgs = await query("SELECT COUNT(*) as count FROM organizations");
    
    if (existingUsers.rows[0].count > 0 && existingOrgs.rows[0].count > 0) {
      return okJSON({ message: "Database already initialized", status: "ready" });
    }
    
    // Create a default user
    const userResult = await query(`
      INSERT INTO users (email, display_name) 
      VALUES ('admin@example.com', 'Admin User') 
      RETURNING id
    `);
    const userId = userResult.rows[0].id;
    
    // Create a default organization
    const orgResult = await query(`
      INSERT INTO organizations (name) 
      VALUES ('Default Organization') 
      RETURNING id
    `);
    const orgId = orgResult.rows[0].id;
    
    // Add user to organization as owner
    await query(`
      INSERT INTO org_users (org_id, user_id, role) 
      VALUES ($1, $2, 'owner')
    `, [orgId, userId]);
    
    // Create a sample project
    const projectResult = await query(`
      INSERT INTO projects (name, description, org_id) 
      VALUES ($1, $2, $3) 
      RETURNING id
    `, ['Sample Project', 'A sample project for testing', orgId]);
    const projectId = projectResult.rows[0].id;
    
    // Add user to project as PM
    await query(`
      INSERT INTO memberships (user_id, project_id, role) 
      VALUES ($1, $2, 'pm')
    `, [userId, projectId]);
    
    // Create some sample risks
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
    
    // Create some sample decisions
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
    
    return okJSON({ 
      message: "Database initialized successfully",
      status: "ready",
      data: {
        userId,
        orgId,
        projectId,
        risksCreated: risks.length,
        decisionsCreated: decisions.length
      }
    });
    
  } catch (error) {
    return apiError(500, "Database initialization failed", { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
