import { okJSON, apiError } from "@/src/lib/errors";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log("Starting working database migration...");
    
    // Use the working PG approach directly
    const { Pool } = await import('pg');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      return apiError(500, "No database URL found", {
        type: "database_config_error"
      });
    }
    
    // Parse the database URL
    const url = new URL(databaseUrl);
    
    // Create a connection pool
    const pool = new Pool({
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1), // Remove leading slash
      user: url.username,
      password: url.password,
      ssl: url.hostname !== 'localhost' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    
    console.log("Database pool created successfully");
    
    // Test database connection first
    try {
      const testResult = await pool.query("SELECT 1 as test");
      console.log("Database connection successful:", testResult);
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      await pool.end();
      return apiError(500, "Database connection failed", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        type: "database_connection_error"
      });
    }
    
    // Create tables one by one
    const tables = [
      {
        name: "users",
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            display_name TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
      },
      {
        name: "organizations",
        sql: `
          CREATE TABLE IF NOT EXISTS organizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
      },
      {
        name: "projects",
        sql: `
          CREATE TABLE IF NOT EXISTS projects (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            org_id UUID REFERENCES organizations(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
      },
      {
        name: "risks",
        sql: `
          CREATE TABLE IF NOT EXISTS risks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            summary TEXT,
            probability INTEGER CHECK (probability >= 1 AND probability <= 5),
            impact INTEGER CHECK (impact >= 1 AND impact <= 5),
            owner_id UUID REFERENCES users(id),
            next_review_date DATE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
      },
      {
        name: "decisions",
        sql: `
          CREATE TABLE IF NOT EXISTS decisions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            detail TEXT,
            status TEXT NOT NULL DEFAULT 'Proposed',
            decided_by UUID REFERENCES users(id),
            decided_on DATE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `
      },
      {
        name: "org_users",
        sql: `
          CREATE TABLE IF NOT EXISTS org_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'member',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(org_id, user_id)
          )
        `
      },
      {
        name: "memberships",
        sql: `
          CREATE TABLE IF NOT EXISTS memberships (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            role TEXT NOT NULL DEFAULT 'member',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, project_id)
          )
        `
      }
    ];

    const createdTables = [];

    for (const table of tables) {
      try {
        console.log(`Creating table: ${table.name}`);
        await pool.query(table.sql);
        createdTables.push(table.name);
        console.log(`Successfully created table: ${table.name}`);
      } catch (error) {
        console.error(`Failed to create table ${table.name}:`, error);
        // Continue with other tables even if one fails
      }
    }

    // Verify tables were created
    const tablesCheck = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships')
      ORDER BY table_name
    `);

    const verifiedTables = tablesCheck.rows.map(row => row.table_name);
    const requiredTables = ['users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships'];
    const missingTables = requiredTables.filter(table => !verifiedTables.includes(table));

    // Close the pool
    await pool.end();

    if (missingTables.length > 0) {
      return apiError(500, `Some required tables were not created: ${missingTables.join(', ')}`, {
        verifiedTables,
        missingTables
      });
    }

    return okJSON({
      message: "Database migrations completed successfully",
      tablesCreated: verifiedTables,
      status: "ready"
    });

  } catch (error) {
    console.error("Migration failed:", error);
    return apiError(500, "Database migration failed", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      type: "migration_error"
    });
  }
}
