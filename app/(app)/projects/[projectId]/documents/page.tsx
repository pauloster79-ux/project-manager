"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/catalyst/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/catalyst/table";

export default function DocumentsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [items, setItems] = useState<any[]>([]);
  
  useEffect(() => {
    // TODO: Replace with actual documents API endpoint when available
    // fetch(`/api/documents?project_id=${projectId}&limit=20`)
    //   .then(r => r.json())
    //   .then(d => setItems(d.items || []));
    
    // For now, show empty state
    setItems([]);
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documents</h1>
        <Button color="blue">New Document</Button>
      </div>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Type</TableHeader>
            <TableHeader>Linked To</TableHeader>
            <TableHeader>Uploaded</TableHeader>
            <TableHeader>Size</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No documents yet.
              </TableCell>
            </TableRow>
          ) : (
            items.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">{doc.name}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.linked_to || "—"}</TableCell>
                <TableCell>{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                <TableCell>{doc.size}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
