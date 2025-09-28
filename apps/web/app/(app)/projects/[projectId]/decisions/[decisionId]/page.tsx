// app/(app)/projects/[projectId]/decisions/[decisionId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { DecisionForm } from "@/components/DecisionForm";
import { Card, CardContent } from "@/components/catalyst/card";

export default function DecisionDetailPage({ params }: { params: { projectId: string; decisionId: string } }) {
  const { projectId, decisionId } = params;
  const [row, setRow] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/decisions/${decisionId}`);
        if (!res.ok) throw new Error("Failed to load decision");
        const j = await res.json();
        if (alive) setRow(j);
      } catch (e: any) {
        if (alive) setError(e.message || "Error");
      }
    })();
    return () => { alive = false; };
  }, [decisionId]);

  if (error) return <Card><CardContent className="p-6 text-sm text-red-600">{error}</CardContent></Card>;
  if (!row) return <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading…</CardContent></Card>;

  return <DecisionForm projectId={projectId} decision={row} />;
}
