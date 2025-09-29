// app/(app)/projects/[projectId]/documents/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/catalyst/card";
import { Button } from "@/components/catalyst/button";
import { Input } from "@/components/catalyst/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/catalyst/select-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/catalyst/table";

type Att = {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number | null;
  text_extract_status: string;
  uploaded_at: string;
  entity_type: "risk" | "decision";
  entity_id: string;
};

export default function DocumentsPage({ params }: { params: { projectId: string } }) {
  const { projectId } = params;
  const [items, setItems] = useState<Att[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [entityType, setEntityType] = useState<"risk"|"decision">("risk");
  const [entityId, setEntityId] = useState<string>("");

  async function refresh() {
    const res = await fetch(`/api/attachments?project_id=${projectId}`);
    const j = await res.json();
    setItems(j.items || []);
  }
  useEffect(() => { refresh(); }, [projectId]);

  async function upload() {
    if (!file || !entityId) return alert("Choose a file and enter an entity id.");
    // 1) request upload
    const up = await fetch("/api/documents/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        entity_type: entityType,
        entity_id: entityId,
        filename: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
      })
    }).then(r => r.json());

    // 2) PUT to pre-signed URL
    await fetch(up.upload_url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });

    // 3) commit
    await fetch("/api/documents/commit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attachment_id: up.attachment_id })
    });

    alert("Uploaded. Embedding job enqueued.");
    setFile(null);
    setEntityId("");
    await refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Upload document</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Link to</div>
            <Select value={entityType} onValueChange={(v) => setEntityType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="risk">Risk (UUID)</SelectItem>
                <SelectItem value="decision">Decision (UUID)</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder={`${entityType} id (UUID)`} value={entityId} onChange={(e) => setEntityId(e.target.value)} />
            <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <Button onClick={upload} disabled={!file || !entityId}>Upload</Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Allowed types: {(process.env.ALLOWED_MIME || "text/plain,text/markdown,application/json,application/pdf")}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Documents</h2>
          <Button color="blue">New Document</Button>
        </div>
        
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Linked To</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Uploaded</TableHeader>
              <TableHeader>Size</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No documents yet.
                </TableCell>
              </TableRow>
            ) : (
              items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-medium">{it.filename}</TableCell>
                  <TableCell>{it.mime_type}</TableCell>
                  <TableCell>
                    {it.entity_type}: {it.entity_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded ${
                      it.text_extract_status === 'completed' ? 'bg-green-100 text-green-800' :
                      it.text_extract_status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {it.text_extract_status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(it.uploaded_at).toLocaleDateString()}</TableCell>
                  <TableCell>{it.size_bytes ? `${Math.round(it.size_bytes / 1024)} KB` : '—'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}