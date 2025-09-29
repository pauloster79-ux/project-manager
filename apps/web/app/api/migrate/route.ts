import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST() {
  try {
    console.log("Starting database migration...");
    
    // Check if we're in the right directory
    const cwd = process.cwd();
    console.log("Current working directory:", cwd);
    
    // Read the initial migration file
    const migrationPath = join(cwd, "migrations", "0001_init.sql");
    console.log("Looking for migration file at:", migrationPath);
    
    let migrationSql: string;
    try {
      migrationSql = readFileSync(migrationPath, "utf-8");
    } catch (fileError) {
      console.error("Failed to read migration file:", fileError);
      return apiError(500, `Failed to read migration file: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
    }
    
    console.log("Running initial migration...");
    try {
      await query(migrationSql);
    } catch (migrationError) {
      console.error("Initial migration failed:", migrationError);
      return apiError(500, `Initial migration failed: ${migrationError instanceof Error ? migrationError.message : String(migrationError)}`);
    }
    
    // Read the orgs migration file
    const orgMigrationPath = join(cwd, "migrations", "2025_09_28_orgs_roles.sql");
    console.log("Looking for org migration file at:", orgMigrationPath);
    
    let orgMigrationSql: string;
    try {
      orgMigrationSql = readFileSync(orgMigrationPath, "utf-8");
    } catch (fileError) {
      console.error("Failed to read org migration file:", fileError);
      return apiError(500, `Failed to read org migration file: ${fileError instanceof Error ? fileError.message : String(fileError)}`);
    }
    
    console.log("Running orgs migration...");
    try {
      await query(orgMigrationSql);
    } catch (migrationError) {
      console.error("Org migration failed:", migrationError);
      return apiError(500, `Org migration failed: ${migrationError instanceof Error ? migrationError.message : String(migrationError)}`);
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
