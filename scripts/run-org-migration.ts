import { readFileSync } from "fs";
import { join } from "path";
import { query } from "../apps/web/src/lib/db";

async function runOrgMigration() {
  try {
    console.log("Running organization migration...");
    
    const migrationPath = join(__dirname, "../migrations/2025_09_28_orgs_roles.sql");
    const migrationSQL = readFileSync(migrationPath, "utf8");
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(";").filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.substring(0, 100) + "...");
        await query(statement);
      }
    }
    
    console.log("Migration completed successfully!");
    
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runOrgMigration().then(() => process.exit(0));
