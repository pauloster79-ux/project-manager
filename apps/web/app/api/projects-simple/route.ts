import { query } from "@/src/lib/db";
import { okJSON, apiError } from "@/src/lib/errors";

export async function GET(req: Request) {
  try {
    console.log("Simple projects API called");
    
    // Simple query without authorization for testing
    const { rows } = await query(`
      SELECT p.id, p.name, p.description, p.updated_at
      FROM projects p
      ORDER BY p.updated_at DESC
      LIMIT 20
    `);
    
    console.log("Projects found:", rows.length);
    
    return okJSON({
      items: rows,
      page: 1,
      pageSize: 20,
      total: rows.length,
    });
  } catch (error) {
    console.error("Simple projects API error:", error);
    return apiError(500, "Failed to fetch projects (simple)", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
