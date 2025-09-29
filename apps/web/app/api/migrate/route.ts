import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST() {
  try {
    console.log("Starting database migration...");
    
    // Read the initial migration file
    const migrationPath = join(process.cwd(), "migrations", "0001_init.sql");
    const migrationSql = readFileSync(migrationPath, "utf-8");
    
    console.log("Running initial migration...");
    await query(migrationSql);
    
    // Read the orgs migration file
    const orgMigrationPath = join(process.cwd(), "migrations", "2025_09_28_orgs_roles.sql");
    const orgMigrationSql = readFileSync(orgMigrationPath, "utf-8");
    
    console.log("Running orgs migration...");
    await query(orgMigrationSql);
    
    // Verify tables were created
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'organizations', 'projects', 'risks', 'decisions', 'org_users', 'memberships')
      ORDER BY table_name
    `);
    
    const createdTables = tablesCheck.rows.map(row => row.table_name);
    
    return okJSON({ 
      message: "Database migrations completed successfully",
      tablesCreated: createdTables,
      status: "ready"
    });
    
  } catch (error) {
    console.error("Migration failed:", error);
    return apiError(500, "Database migration failed", { 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
