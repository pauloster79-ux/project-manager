// Script to add test data to the database
const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres.whyzabaxiqaqffezmrzh:2%21nXxiC%21%3F68Jn7T@aws-1-eu-west-2.pooler.supabase.com:6543/postgres';

const client = new Client({ connectionString: DATABASE_URL });

async function addTestData() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Add test projects
    const projects = [
      { name: 'Demo Project', description: 'A demonstration project for testing' },
      { name: 'Alpha Rollout', description: 'Initial rollout of new features' },
      { name: 'Beta Testing', description: 'Beta testing phase for user feedback' },
      { name: 'Production', description: 'Live production environment' }
    ];

    console.log('📝 Adding test projects...');
    for (const project of projects) {
      const result = await client.query(
        'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id, name',
        [project.name, project.description]
      );
      console.log(`✅ Added project: ${result.rows[0].name} (ID: ${result.rows[0].id})`);
    }

    // Add a test user
    console.log('👤 Adding test user...');
    const userResult = await client.query(
      'INSERT INTO users (email, display_name) VALUES ($1, $2) RETURNING id, email',
      ['demo@example.com', 'Demo User']
    );
    console.log(`✅ Added user: ${userResult.rows[0].email} (ID: ${userResult.rows[0].id})`);

    // Add some test risks
    console.log('⚠️ Adding test risks...');
    const projectResult = await client.query('SELECT id FROM projects LIMIT 1');
    const projectId = projectResult.rows[0].id;

    const risks = [
      { title: 'API Latency Issues', probability: 4, impact: 5, summary: 'Potential performance issues with external API calls' },
      { title: 'Data Migration Risk', probability: 3, impact: 4, summary: 'Risk during database migration process' },
      { title: 'Security Vulnerability', probability: 2, impact: 5, summary: 'Potential security issues in authentication' }
    ];

    for (const risk of risks) {
      const result = await client.query(
        'INSERT INTO risks (project_id, title, probability, impact, summary) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, exposure',
        [projectId, risk.title, risk.probability, risk.impact, risk.summary]
      );
      console.log(`✅ Added risk: ${result.rows[0].title} (Exposure: ${result.rows[0].exposure})`);
    }

    // Add some test decisions
    console.log('📋 Adding test decisions...');
    const decisions = [
      { title: 'Choose React Framework', status: 'Approved', detail: 'Decided to use Next.js for the frontend' },
      { title: 'Database Selection', status: 'Proposed', detail: 'Considering PostgreSQL vs MySQL for the backend' },
      { title: 'Deployment Strategy', status: 'Rejected', detail: 'Rejected Docker deployment in favor of serverless' }
    ];

    for (const decision of decisions) {
      const result = await client.query(
        'INSERT INTO decisions (project_id, title, status, detail) VALUES ($1, $2, $3, $4) RETURNING id, title, status',
        [projectId, decision.title, decision.status, decision.detail]
      );
      console.log(`✅ Added decision: ${result.rows[0].title} (Status: ${result.rows[0].status})`);
    }

    console.log('🎉 Test data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding test data:', error.message);
  } finally {
    await client.end();
  }
}

addTestData();
