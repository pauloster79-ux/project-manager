"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RiskForm } from "@/components/RiskForm";

export default function RiskEditPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const riskId = params.riskId as string;
  const [risk, setRisk] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRisk = async () => {
      try {
        const response = await fetch(`/api/risks/${riskId}`);
        if (response.ok) {
          const data = await response.json();
          setRisk(data);
        } else {
          console.error("Failed to load risk");
        }
      } catch (error) {
        console.error("Error loading risk:", error);
      } finally {
        setLoading(false);
      }
    };

    if (riskId) {
      loadRisk();
    }
  }, [riskId]);

  const handleSave = async (riskData: any) => {
    try {
      const response = await fetch(`/api/risks/${riskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(riskData),
      });

      if (response.ok) {
        router.push(`/projects/${projectId}/risks`);
      } else {
        alert("Failed to save risk");
      }
    } catch (error) {
      alert("Error saving risk");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!risk) {
    return <div>Risk not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Risk</h1>
      <RiskForm risk={risk} onSave={handleSave} />
    </div>
  );
}
