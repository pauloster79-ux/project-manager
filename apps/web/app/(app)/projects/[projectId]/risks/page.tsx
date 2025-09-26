"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";

export default function RisksPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/risks?project_id=${projectId}&sort=exposure&order=desc&limit=20`)
      .then(r => r.json())
      .then(d => setItems(d.items || []));
  }, [projectId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Risks</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <Card key={r.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{r.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Exposure: <span className="font-medium">{r.exposure}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Next review: {r.next_review_date ?? "—"}
              </div>
              <div className="text-xs text-muted-foreground mt-2">Updated: {new Date(r.updated_at).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
