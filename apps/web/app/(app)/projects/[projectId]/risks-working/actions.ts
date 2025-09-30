"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createRisk(projectId: string) {
  try {
    // Use the working PG approach directly
    const { Pool } = await import('pg');
    
    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      throw new Error('No database URL found');
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
    
    // Create a new risk
    const { rows } = await pool.query(
      `insert into risks (project_id, title, probability, impact, summary) 
       values ($1, $2, $3, $4, $5) 
       returning *`,
      [projectId, "New Risk", 3, 3, "Risk description to be filled in"]
    );

    const newRisk = rows[0];
    
    // Close the pool
    await pool.end();
    
    // Revalidate the risks page
    revalidatePath(`/projects/${projectId}/risks-working`);
    
    // Redirect to the new risk's edit page
    redirect(`/projects/${projectId}/risks/${newRisk.id}`);
  } catch (error) {
    console.error("Error creating risk:", error);
    throw new Error("Failed to create risk");
  }
}
