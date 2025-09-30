import { AddRiskButton } from "../risks/AddRiskButton";
import { RiskTable } from "../risks/RiskTable";

export const dynamic = 'force-dynamic';

interface RisksPageProps {
  params: { projectId: string };
}

export default async function RisksPage({ params }: RisksPageProps) {
  const { projectId } = params;
  
  // Fetch data using the working PG approach
  let risks: any[] = [];
  let error: string | undefined;
  
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
    
    // Fetch risks for this project
    const { rows } = await pool.query(
      `select id, title, probability, impact, (probability * impact) as exposure, next_review_date, updated_at 
       from risks 
       where project_id = $1 
       order by exposure desc, updated_at desc 
       limit 20`,
      [projectId]
    );
    
    risks = rows;
    
    // Close the pool
    await pool.end();
    
  } catch (err) {
    console.error("Error fetching risks:", err);
    error = err instanceof Error ? err.message : "Failed to load risks";
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Risks</h1>
        <div className="text-sm text-red-600">
          Error loading risks: {error}
        </div>
        <div className="text-sm text-muted-foreground">
          Project ID: {projectId}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Risks</h1>
        <AddRiskButton projectId={projectId} />
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Project ID: {projectId}
      </div>
      
      <RiskTable risks={risks} projectId={projectId} />
    </div>
  );
}
