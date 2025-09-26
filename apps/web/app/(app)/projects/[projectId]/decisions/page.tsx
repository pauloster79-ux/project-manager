"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";

export default function DecisionsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch(`/api/decisions?project_id=${projectId}&limit=20`)
      .then(r => r.json())
      .then(d => setItems(d.items || []));
  }, [projectId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Decisions</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((d) => (
          <Card key={d.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">{d.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">Status: <span className="font-medium">{d.status}</span></div>
              <div className="text-xs text-muted-foreground mt-2">Updated: {new Date(d.updated_at).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
