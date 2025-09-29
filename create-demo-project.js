// Create demo project with proper UUID
const { Pool } = require('pg');
require('dotenv').config();

async function createDemoProject() {
  console.log('🚀 Creating demo project...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    
    // Create a demo project with a proper UUID
    const demoProjectResult = await client.query(`
      INSERT INTO projects (id, name, description, org_id) 
      VALUES (gen_random_uuid(), 'Demo Project', 'A demo project for testing', (SELECT id FROM organizations LIMIT 1))
      ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
      RETURNING id
    `);
    
    const projectId = demoProjectResult.rows[0].id;
    console.log('✅ Demo project created with ID:', projectId);
    
    // Create a demo user if none exists
    const userResult = await client.query(`
      INSERT INTO users (email, display_name) 
      VALUES ('demo@example.com', 'Demo User')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);
    
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      console.log('✅ Demo user created with ID:', userId);
      
      // Add user to organization
      await client.query(`
        INSERT INTO org_users (org_id, user_id, role) 
        VALUES ((SELECT id FROM organizations LIMIT 1), $1, 'owner')
        ON CONFLICT (org_id, user_id) DO NOTHING
      `, [userId]);
      
      // Add user to project
      await client.query(`
        INSERT INTO memberships (user_id, project_id, role) 
        VALUES ($1, $2, 'pm')
        ON CONFLICT (user_id, project_id) DO NOTHING
      `, [userId, projectId]);
      
      console.log('✅ User added to organization and project');
    }
    
    client.release();
    console.log('🎉 Demo setup completed!');
    console.log('Project ID for testing:', projectId);
    
  } catch (error) {
    console.error('❌ Demo setup failed:', error.message);
  } finally {
    await pool.end();
  }
}

createDemoProject();
