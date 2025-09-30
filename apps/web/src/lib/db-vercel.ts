// src/lib/db-vercel.ts
// Using Vercel's PostgreSQL client which is more compatible with Next.js
import { createClient } from '@vercel/postgres';

// Ensure all required environment variables are set
if (!process.env.POSTGRES_URL && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

if (!process.env.POSTGRES_URL_NON_POOLING && process.env.DATABASE_URL) {
  process.env.POSTGRES_URL_NON_POOLING = process.env.DATABASE_URL;
}

// Create client lazily to avoid module load failures
let client: any = null;

function getClient() {
  if (!client) {
    try {
      // Check if we have the required environment variables
      if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
        throw new Error('No database URL found. Please set POSTGRES_URL or DATABASE_URL environment variable.');
      }
      client = createClient();
    } catch (error) {
      console.error('Failed to create database client:', error);
      throw error;
    }
  }
  return client;
}

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  try {
    const dbClient = getClient();
    const result = await dbClient.query(text, params);
    return { rows: result.rows as T[] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
