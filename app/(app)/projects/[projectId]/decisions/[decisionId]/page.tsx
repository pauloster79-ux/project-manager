"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DecisionForm } from "@/components/DecisionForm";

export default function DecisionEditPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const decisionId = params.decisionId as string;
  const [decision, setDecision] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDecision = async () => {
      try {
        const response = await fetch(`/api/decisions/${decisionId}`);
        if (response.ok) {
          const data = await response.json();
          setDecision(data);
        } else {
          console.error("Failed to load decision");
        }
      } catch (error) {
        console.error("Error loading decision:", error);
      } finally {
        setLoading(false);
      }
    };

    if (decisionId) {
      loadDecision();
    }
  }, [decisionId]);

  const handleSave = async (decisionData: any) => {
    try {
      const response = await fetch(`/api/decisions/${decisionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(decisionData),
      });

      if (response.ok) {
        router.push(`/projects/${projectId}/decisions`);
      } else {
        alert("Failed to save decision");
      }
    } catch (error) {
      alert("Error saving decision");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!decision) {
    return <div>Decision not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Decision</h1>
      <DecisionForm decision={decision} onSave={handleSave} />
    </div>
  );
}
