// scripts/run-migrations.ts
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { Client } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

(async () => {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const dir = join(process.cwd(), "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(dir, file), "utf8");
    console.log(`\n=== Applying ${file} ===`);
    await client.query(sql);
    console.log(`✓ Applied ${file}`);
  }

  await client.end();
  console.log("\nAll migrations applied.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
