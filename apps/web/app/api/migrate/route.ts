import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log("Starting database migration...");
    
    // Test database connection first
    try {
      const testResult = await query("SELECT 1 as test");
      console.log("Database connection successful:", testResult);
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return apiError(500, "Database connection failed", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        type: "database_connection_error"
      });
    }
    
    // Create tables one by one to avoid complex transaction issues
    const tables = [
      {
        name: "users",
        sql: `
          create table if not exists users (
            id uuid primary key default gen_random_uuid(),
            email text unique not null,
            display_name text,
            created_at timestamptz not null default now()
          )
        `
      },
      {
        name: "organizations", 
        sql: `
          create table if not exists organizations (
            id uuid primary key default gen_random_uuid(),
            name text not null,
            created_at timestamptz not null default now()
          )
        `
      },
      {
        name: "projects",
        sql: `
          create table if not exists projects (
            id uuid primary key default gen_random_uuid(),
            name text not null,
            description text,
            org_id uuid references organizations(id),
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          )
        `
      },
      {
        name: "risks",
        sql: `
          create table if not exists risks (
            id uuid primary key default gen_random_uuid(),
            project_id uuid not null references projects(id) on delete cascade,
            title text not null,
            summary text,
            probability integer check (probability >= 1 and probability <= 5),
            impact integer check (impact >= 1 and impact <= 5),
            owner_id uuid references users(id),
            next_review_date date,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          )
        `
      },
      {
        name: "decisions",
        sql: `
          create table if not exists decisions (
            id uuid primary key default gen_random_uuid(),
            project_id uuid not null references projects(id) on delete cascade,
            title text not null,
            detail text,
            status text not null default 'Proposed',
            decided_by uuid references users(id),
            decided_on date,
            created_at timestamptz not null default now(),
            updated_at timestamptz not null default now()
          )
        `
      },
      {
        name: "org_users",
        sql: `
          create table if not exists org_users (
            id uuid primary key default gen_random_uuid(),
            org_id uuid not null references organizations(id) on delete cascade,
            user_id uuid not null references users(id) on delete cascade,
            role text not null default 'member',
            created_at timestamptz not null default now(),
            unique(org_id, user_id)
          )
        `
      },
      {
        name: "memberships",
        sql: `
          create table if not exists memberships (
            id uuid primary key default gen_random_uuid(),
            user_id uuid not null references users(id) on delete cascade,
            project_id uuid not null references projects(id) on delete cascade,
            role text not null default 'member',
            created_at timestamptz not null default now(),
            unique(user_id, project_id)
          )
        `
      }
    ];
    
    const createdTables = [];
    
    for (const table of tables) {
      try {
        console.log(`Creating table: ${table.name}`);
        await query(table.sql);
        createdTables.push(table.name);
        console.log(`Successfully created table: ${table.name}`);
      } catch (error) {
        console.error(`Failed to create table ${table.name}:`, error);
        // Continue with other tables even if one fails
      }
    }
    
    // Verify tables were created
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships')
      ORDER BY table_name
    `);
    
    const verifiedTables = tablesCheck.rows.map(row => row.table_name);
    const requiredTables = ['users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships'];
    const missingTables = requiredTables.filter(table => !verifiedTables.includes(table));
    
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
