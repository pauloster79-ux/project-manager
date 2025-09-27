// app/(app)/projects/[projectId]/risks/[riskId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { RiskForm } from "@/components/RiskForm";
import { Card, CardContent } from "@/components/catalyst/card";

export default function RiskDetailPage({ params }: { params: { projectId: string; riskId: string } }) {
  const { projectId, riskId } = params;
  const [risk, setRisk] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/risks/${riskId}`);
        if (!res.ok) throw new Error(`Failed to load risk`);
        const j = await res.json();
        if (alive) setRisk(j);
      } catch (e: any) {
        if (alive) setError(e.message || "Error");
      }
    })();
    return () => { alive = false; };
  }, [riskId]);

  if (error) {
    return (
      <Card><CardContent className="p-6 text-sm text-red-600">{error}</CardContent></Card>
    );
  }
  if (!risk) {
    return (
      <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent></Card>
    );
  }

  return <RiskForm projectId={projectId} risk={risk} />;
}
