"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/catalyst/table";
import { Badge } from "@/components/catalyst/badge";

export default function RisksPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/risks?project_id=${projectId}&sort=exposure&order=desc&limit=20`)
      .then(r => r.json())
      .then(d => {
        setItems(d.items || []);
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Risks</h1>
      
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
