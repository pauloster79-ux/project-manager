// src/lib/db-vercel.ts
// Using Vercel's PostgreSQL client which is more compatible with Next.js
import { sql } from '@vercel/postgres';

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  try {
    const result = await sql.query(text, params);
    return { rows: result.rows as T[] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
