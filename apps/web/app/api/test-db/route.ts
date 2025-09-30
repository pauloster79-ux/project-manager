import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('Testing database connection in deployed app...');
    
    // Test basic connection
    const result = await query("SELECT 1 as test");
    console.log('✅ Database connection successful:', result.rows[0]);
    
    // Test if we have the required tables
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'organizations', 'projects', 'risks', 'decisions')
      ORDER BY table_name
    `);
    
    // Test if we have any data
    const usersResult = await query('SELECT COUNT(*) as count FROM users');
    const orgsResult = await query('SELECT COUNT(*) as count FROM organizations');
    const projectsResult = await query('SELECT COUNT(*) as count FROM projects');
    
    const status = {
      database: "connected",
      tables: tablesResult.rows.map(r => r.table_name),
      data_counts: {
        users: parseInt(usersResult.rows[0].count),
        organizations: parseInt(orgsResult.rows[0].count),
        projects: parseInt(projectsResult.rows[0].count),
      },
      environment_vars: {
        DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
        POSTGRES_URL: process.env.POSTGRES_URL ? "✅ Set" : "❌ Missing",
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "✅ Set" : "❌ Missing",
        LLM_PROVIDER: process.env.LLM_PROVIDER || "❌ Missing",
      }
    };
    
    return okJSON(status);
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return apiError(500, "Database connection failed", { 
      error: error instanceof Error ? error.message : String(error),
      environment_vars: {
        DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
        POSTGRES_URL: process.env.POSTGRES_URL ? "✅ Set" : "❌ Missing",
        POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING ? "✅ Set" : "❌ Missing",
        LLM_PROVIDER: process.env.LLM_PROVIDER || "❌ Missing",
      }
    });
  }
}