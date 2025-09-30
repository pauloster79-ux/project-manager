// src/lib/db-pg.ts
// Using standard pg package instead of Vercel's client
import pkg from 'pg';
const { Pool } = pkg;

// Create a connection pool
let pool: any = null;

function getPool() {
  if (!pool) {
    try {
      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
      
      if (!databaseUrl) {
        throw new Error('No database URL found. Please set DATABASE_URL or POSTGRES_URL environment variable.');
      }
      
      // Parse the database URL
      const url = new URL(databaseUrl);
      
      pool = new Pool({
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
      
      console.log('Database pool created successfully');
    } catch (error) {
      console.error('Failed to create database pool:', error);
      throw error;
    }
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  const pool = getPool();
  
  try {
    const result = await pool.query(text, params);
    return { rows: result.rows as T[] };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
