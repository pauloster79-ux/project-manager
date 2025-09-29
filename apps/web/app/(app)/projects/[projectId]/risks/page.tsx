import { getRisks } from "./lib";
import { AddRiskButton } from "./AddRiskButton";
import { RiskTable } from "./RiskTable";

interface RisksPageProps {
  params: { projectId: string };
}

export default async function RisksPage({ params }: RisksPageProps) {
  const { projectId } = params;
  const { risks, error } = await getRisks(projectId);

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
