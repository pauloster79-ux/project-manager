// Script to set up the database with required data
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({ connectionString: DATABASE_URL });

async function setupDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Create a default user
    console.log('👤 Creating default user...');
    const userResult = await client.query(`
      INSERT INTO users (email, display_name) 
      VALUES ('admin@example.com', 'Admin User') 
      ON CONFLICT (email) DO UPDATE SET display_name = EXCLUDED.display_name
      RETURNING id
    `);
    const userId = userResult.rows[0].id;
    console.log(`✅ User created/updated: ${userId}`);

    // Create a default organization
    console.log('🏢 Creating default organization...');
    const orgResult = await client.query(`
      INSERT INTO organizations (name) 
      VALUES ('Default Organization') 
      RETURNING id
    `);
    const orgId = orgResult.rows[0].id;
    console.log(`✅ Organization created: ${orgId}`);

    // Add user to organization as owner
    console.log('🔗 Adding user to organization...');
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
      RETURNING id
    `, ['Demo Project', 'A demonstration project for testing', orgId]);
    const projectId = projectResult.rows[0].id;
    console.log(`✅ Demo project created: ${projectId}`);

    // Add user to project as PM
    console.log('👥 Adding user to project...');
    await client.query(`
      INSERT INTO memberships (user_id, project_id, role) 
      VALUES ($1, $2, 'pm')
      ON CONFLICT (user_id, project_id) DO UPDATE SET role = EXCLUDED.role
    `, [userId, projectId]);
    console.log('✅ User added to project as PM');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('You can now use the application with:');
    console.log('- User: admin@example.com');
    console.log('- Organization: Default Organization');
    console.log('- Project: Demo Project');
    console.log(`- Project ID: ${projectId}`);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  } finally {
    await client.end();
  }
}

setupDatabase();
