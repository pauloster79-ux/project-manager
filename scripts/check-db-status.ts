import { query } from "../apps/web/src/lib/db";

async function checkDatabaseStatus() {
  try {
    console.log("Checking database status...");
    
    // Check if organizations table exists
    const orgsResult = await query("SELECT COUNT(*) as count FROM organizations");
    console.log(`Organizations: ${orgsResult.rows[0].count}`);
    
    // Check if org_users table exists
    const orgUsersResult = await query("SELECT COUNT(*) as count FROM org_users");
    console.log(`Org users: ${orgUsersResult.rows[0].count}`);
    
    // Check if projects have org_id
    const projectsResult = await query("SELECT COUNT(*) as count FROM projects WHERE org_id IS NOT NULL");
    console.log(`Projects with org_id: ${projectsResult.rows[0].count}`);
    
    // Check users
    const usersResult = await query("SELECT COUNT(*) as count FROM users");
    console.log(`Users: ${usersResult.rows[0].count}`);
    
    // Check if we have any org_users relationships
    const relationshipsResult = await query(`
      SELECT ou.role, COUNT(*) as count 
      FROM org_users ou 
      GROUP BY ou.role
    `);
    console.log("Org user relationships:", relationshipsResult.rows);
    
  } catch (error) {
    console.error("Database check failed:", error);
  }
}

checkDatabaseStatus().then(() => process.exit(0));
