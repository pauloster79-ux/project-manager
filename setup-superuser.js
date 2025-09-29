const { Client } = require('pg');
require('dotenv').config();

async function setupSuperUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('🔗 Connected to database');

    // Create a super user
    console.log('👤 Creating super user...');
    const userResult = await client.query(`
      INSERT INTO users (email, display_name)
      VALUES ('admin@example.com', 'Super Admin')
      ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
      RETURNING id
    `);
    const userId = userResult.rows[0].id;
    console.log(`✅ Super user created: ${userId}`);

    // Create a default organization
    console.log('🏢 Creating default organization...');
    const orgResult = await client.query(`
      INSERT INTO organizations (name)
      VALUES ('Default Organization')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    
    let orgId;
    if (orgResult.rows.length > 0) {
      orgId = orgResult.rows[0].id;
    } else {
      // Organization already exists, get its ID
      const existingOrg = await client.query(`SELECT id FROM organizations WHERE name = 'Default Organization' LIMIT 1`);
      orgId = existingOrg.rows[0].id;
    }
    console.log(`✅ Organization created: ${orgId}`);

    // Add user to organization as owner
    console.log('🔗 Adding user to organization as owner...');
    await client.query(`
      INSERT INTO org_users (org_id, user_id, role)
      VALUES ($1, $2, 'owner')
      ON CONFLICT (org_id, user_id) DO UPDATE SET role = EXCLUDED.role
    `, [orgId, userId]);
    console.log('✅ User added to organization as owner');

    // Create a demo project
    console.log('📁 Creating demo project...');
    const projectResult = await client.query(`
      INSERT INTO projects (name, description, org_id)
      VALUES ($1, $2, $3)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, ['Demo Project', 'A demonstration project for testing', orgId]);
    
    let projectId;
    if (projectResult.rows.length > 0) {
      projectId = projectResult.rows[0].id;
    } else {
      // Project already exists, get its ID
      const existingProject = await client.query(`SELECT id FROM projects WHERE name = 'Demo Project' AND org_id = $1 LIMIT 1`, [orgId]);
      projectId = existingProject.rows[0].id;
    }
    console.log(`✅ Demo project created: ${projectId}`);

    // Add user to project as PM
    console.log('👑 Adding user to project as PM...');
    await client.query(`
      INSERT INTO memberships (project_id, user_id, role)
      VALUES ($1, $2, 'pm')
      ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role
    `, [projectId, userId]);
    console.log('✅ User added to project as PM');

    console.log('\n🎉 Super user setup complete!');
    console.log(`User ID: ${userId}`);
    console.log(`Org ID: ${orgId}`);
    console.log(`Project ID: ${projectId}`);
    console.log('\nYou can now access the app and should see the New Risk/Decision buttons!');

  } catch (error) {
    console.error('❌ Error setting up super user:', error);
  } finally {
    await client.end();
  }
}

setupSuperUser();
