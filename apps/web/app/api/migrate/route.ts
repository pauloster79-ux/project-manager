import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";

export async function POST() {
  try {
    console.log("Starting database migration...");
    
    // Run the initial migration SQL directly
    const initialMigrationSql = `
      -- Extensions
      create extension if not exists pgcrypto;
      create extension if not exists vector;

      -- Projects
      create table if not exists projects (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        description text,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );

      -- Users
      create table if not exists users (
        id uuid primary key default gen_random_uuid(),
        email text unique not null,
        display_name text,
        created_at timestamptz not null default now()
      );

      -- Organizations
      create table if not exists organizations (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        created_at timestamptz not null default now()
      );

      -- Risks
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
      );

      -- Decisions
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
      );

      -- Org Users (many-to-many relationship)
      create table if not exists org_users (
        id uuid primary key default gen_random_uuid(),
        org_id uuid not null references organizations(id) on delete cascade,
        user_id uuid not null references users(id) on delete cascade,
        role text not null default 'member',
        created_at timestamptz not null default now(),
        unique(org_id, user_id)
      );

      -- Memberships (many-to-many relationship between users and projects)
      create table if not exists memberships (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null references users(id) on delete cascade,
        project_id uuid not null references projects(id) on delete cascade,
        role text not null default 'member',
        created_at timestamptz not null default now(),
        unique(user_id, project_id)
      );

      -- Add org_id to projects table
      alter table projects add column if not exists org_id uuid references organizations(id);

      -- Indexes
      create index if not exists idx_risks_project_id on risks(project_id);
      create index if not exists idx_decisions_project_id on decisions(project_id);
      create index if not exists idx_org_users_org_id on org_users(org_id);
      create index if not exists idx_org_users_user_id on org_users(user_id);
      create index if not exists idx_memberships_user_id on memberships(user_id);
      create index if not exists idx_memberships_project_id on memberships(project_id);
      create index if not exists idx_projects_org_id on projects(org_id);
    `;
    
    console.log("Running initial migration...");
    try {
      await query(initialMigrationSql);
    } catch (migrationError) {
      console.error("Initial migration failed:", migrationError);
      return apiError(500, `Initial migration failed: ${migrationError instanceof Error ? migrationError.message : String(migrationError)}`);
    }
    
    // Verify tables were created
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships')
      ORDER BY table_name
    `);
    
    const createdTables = tablesCheck.rows.map(row => row.table_name);
    const requiredTables = ['users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships'];
    const missingTables = requiredTables.filter(table => !createdTables.includes(table));
    
    if (missingTables.length > 0) {
      return apiError(500, `Some required tables were not created: ${missingTables.join(', ')}`, {
        createdTables,
        missingTables
      });
    }
    
    return okJSON({ 
      message: "Database migrations completed successfully",
      tablesCreated: createdTables,
      status: "ready"
    });
    
  } catch (error) {
    console.error("Migration failed:", error);
    return apiError(500, "Database migration failed", { 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
