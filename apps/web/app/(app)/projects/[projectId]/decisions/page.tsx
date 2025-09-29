"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/catalyst/table";
import { Badge } from "@/components/catalyst/badge";
import { Button } from "@/components/catalyst/button";

export default function DecisionsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/decisions?project_id=${projectId}&limit=20`)
      .then(r => r.json())
      .then(d => {
        setItems(d.items || []);
        setLoading(false);
      });
  }, [projectId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "green";
      case "proposed": return "amber";
      case "rejected": return "red";
      default: return "zinc";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Decisions</h1>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Decisions</h1>
        <Button
          onClick={async () => {
            try {
              const response = await fetch("/api/decisions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  project_id: projectId,
                  title: "New Decision",
                  status: "Proposed",
                  detail: "Decision details to be filled in"
                })
              });
              
              if (response.ok) {
                const newDecision = await response.json();
                window.location.href = `/projects/${projectId}/decisions/${newDecision.id}`;
              } else {
                alert("Failed to create decision");
              }
            } catch (error) {
              alert("Error creating decision");
            }
          }}
        >
          Add New Decision
        </Button>
      </div>
      
      <Table bleed>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Decided On</TableHeader>
            <TableHeader>Updated</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((decision) => (
            <TableRow key={decision.id}>
              <TableCell>
                <Link 
                  href={`/projects/${projectId}/decisions/${decision.id}`} 
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {decision.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge color={getStatusColor(decision.status)}>
                  {decision.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(decision.decided_on)}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(decision.updated_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No decisions found for this project.
        </div>
      )}
    </div>
  );
}
