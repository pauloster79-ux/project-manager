// Simple migration runner
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
  console.log('🚀 Starting database migrations...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Connected to database');

    // Read and run the initial migration
    const migrationPath = path.join(__dirname, 'migrations', '0001_init.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📋 Running initial migration...');
    await client.query(migrationSQL);
    console.log('✅ Initial migration completed');

    // Read and run the orgs migration
    const orgsMigrationPath = path.join(__dirname, 'migrations', '2025_09_28_orgs_roles.sql');
    const orgsMigrationSQL = fs.readFileSync(orgsMigrationPath, 'utf8');
    
    console.log('📋 Running orgs migration...');
    await client.query(orgsMigrationSQL);
    console.log('✅ Orgs migration completed');

    // Create a demo project
    console.log('📋 Creating demo project...');
    const demoProjectResult = await client.query(`
      INSERT INTO projects (id, name, description, org_id) 
      VALUES ('demo', 'Demo Project', 'A demo project for testing', (SELECT id FROM organizations LIMIT 1))
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `);
    console.log('✅ Demo project ready');

    client.release();
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

runMigrations();
