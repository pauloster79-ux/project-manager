"use client";

import { RiskTable } from "../risks/RiskTable";
import { useEffect, useState } from "react";

export const dynamic = 'force-dynamic';

interface RisksPageProps {
  params: { projectId: string };
}

export default function RisksPage({ params }: RisksPageProps) {
  const { projectId } = params;
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const response = await fetch(`/api/risks-working?projectId=${projectId}`);
        if (response.ok) {
          const data = await response.json();
          setRisks(data.items || []);
        } else {
          setError("Failed to load risks");
        }
      } catch (err) {
        console.error("Error fetching risks:", err);
        setError("Failed to load risks");
      } finally {
        setLoading(false);
      }
    };

    fetchRisks();
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Risks</h1>
        <div className="text-sm text-muted-foreground">
          Loading risks...
        </div>
        <div className="text-sm text-muted-foreground">
          Project ID: {projectId}
        </div>
      </div>
    );
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
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => alert(`Add Risk for Project: ${projectId}`)}
        >
          Add New Risk
        </button>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        Project ID: {projectId}
      </div>
      
      <RiskTable risks={risks} projectId={projectId} />
    </div>
  );
}
