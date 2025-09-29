import { AddRiskButton } from "./AddRiskButton";
import { RiskTable } from "./RiskTable";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";

export const dynamic = 'force-dynamic';

interface RisksPageProps {
  params: { projectId: string };
}

export default async function RisksPage({ params }: RisksPageProps) {
  const { projectId } = params;
  
  // Fetch data directly in the server component to avoid import chain issues
  let risks: any[] = [];
  let error: string | undefined;
  
  try {
    const user = await getCurrentUser();
    const orgId = await getCurrentOrgId();
    
    // TODO: Re-enable permission checks when implementing proper OAuth
    // await requireAccess({ userId: user.id, orgId, need: "org:read" });

    // Dynamic import to prevent bundling
    const { query } = await import("@/src/lib/db");
    const { rows } = await query(
      `select id, title, probability, impact, (probability * impact) as exposure, next_review_date, updated_at 
       from risks 
       where project_id = $1 
       order by exposure desc, updated_at desc 
       limit 20`,
      [projectId]
    );
    
    risks = rows;
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
          The database may not be initialized. Please check the health endpoint.
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
      
      <RiskTable risks={risks} projectId={projectId} />
    </div>
  );
}
