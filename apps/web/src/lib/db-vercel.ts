// src/lib/db-vercel.ts
// Using Vercel's PostgreSQL client which is more compatible with Next.js
import { createClient } from '@vercel/postgres';

// Ensure POSTGRES_URL is set from DATABASE_URL if not already set
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

// Create a client instance for better connection management
const client = createClient();

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  try {
    const result = await client.query(text, params);
    return { rows: result.rows as T[] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
