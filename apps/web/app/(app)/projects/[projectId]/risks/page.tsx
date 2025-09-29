"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/catalyst/table";
import { Badge } from "@/components/catalyst/badge";
import { Button } from "@/components/catalyst/button";

export default function RisksPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetch(`/api/risks?project_id=${projectId}&sort=exposure&order=desc&limit=20`)
      .then(async (r) => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        }
        return r.json();
      })
      .then(d => {
        setItems(d.items || []);
        setError(null);
      })
      .catch(err => {
        console.error("Failed to fetch risks:", err);
        setError(err.message);
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  const getExposureColor = (exposure: number) => {
    if (exposure >= 20) return "red";
    if (exposure >= 15) return "orange";
    if (exposure >= 10) return "amber";
    if (exposure >= 5) return "yellow";
    return "green";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Risks</h1>
        <div className="text-sm text-muted-foreground">Loading...</div>
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
          The database may not be initialized. Please check the health endpoint.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Risks</h1>
        <Button
          color="blue"
          onClick={async () => {
            try {
              const response = await fetch("/api/risks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  project_id: projectId,
                  title: "New Risk",
                  probability: 3,
                  impact: 3,
                  summary: "Risk description to be filled in"
                })
              });
              
              if (response.ok) {
                const newRisk = await response.json();
                router.push(`/projects/${projectId}/risks/${newRisk.id}`);
              } else {
                alert("Failed to create risk");
              }
            } catch (error) {
              alert("Error creating risk");
            }
          }}
        >
          Add New Risk
        </Button>
      </div>
      
      <Table bleed>
        <TableHead>
          <TableRow>
            <TableHeader>Title</TableHeader>
            <TableHeader>Exposure</TableHeader>
            <TableHeader>Probability</TableHeader>
            <TableHeader>Impact</TableHeader>
            <TableHeader>Next Review</TableHeader>
            <TableHeader>Updated</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((risk) => (
            <TableRow key={risk.id}>
              <TableCell>
                <Link 
                  href={`/projects/${projectId}/risks/${risk.id}`} 
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {risk.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge color={getExposureColor(risk.exposure)}>
                  {risk.exposure}
                </Badge>
              </TableCell>
              <TableCell>{risk.probability}</TableCell>
              <TableCell>{risk.impact}</TableCell>
              <TableCell>{formatDate(risk.next_review_date)}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(risk.updated_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No risks found for this project.
        </div>
      )}
    </div>
  );
}
