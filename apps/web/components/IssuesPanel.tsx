// components/IssuesPanel.tsx
"use client";

import { useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/catalyst/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Button } from "@/components/catalyst/button";
import { Input } from "@/components/catalyst/input";
import { InlineIssueChip } from "./InlineIssueChip";
import { iterateIssue } from "@/lib/issuesClient";

type Issue = {
  severity: "critical" | "major" | "minor";
  type: "missing" | "contradiction" | "clarity" | "format";
  message: string;
};

export function IssuesPanel({
  open,
  onOpenChange,
  issues,
  proposedPatch,
  rationale,
  disabledApply = true,
  onApply,
  // NEW (optional) — enable mini-chat when provided
  projectId,
  entityType,
  entityId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  issues: Issue[];
  proposedPatch: Record<string, any> | null;
  rationale?: string | null;
  disabledApply?: boolean;
  onApply?: (patch: Record<string, any>) => void;

  projectId?: string;
  entityType?: "risk" | "decision";
  entityId?: string;
}) {
  const [workingPatch, setWorkingPatch] = useState<Record<string, any> | null>(proposedPatch || null);
  const [why, setWhy] = useState<string | null>(rationale || null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // keep workingPatch in sync when panel re-opens with a new suggestion
  // (simple heuristic)
  if (proposedPatch && !workingPatch) setWorkingPatch(proposedPatch);

  async function iterate() {
    if (!projectId || !entityType || !entityId) return; // mini-chat disabled without context
    const instruction = q.trim();
    if (!instruction) return;
    setBusy(true);
    setQ("");
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const res = await iterateIssue({
        project_id: projectId,
        entity_type: entityType,
        entity_id: entityId,
        instruction,
        current_patch: workingPatch || proposedPatch || {},
        issues: issues || [],
        signal: abortRef.current.signal,
      });
      setWorkingPatch(res.proposed_patch || {});
      setWhy(res.rationale || null);
    } catch (e: any) {
      // optionally show toast
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet open={open} onClose={() => onOpenChange(false)}>
      <SheetContent side="right" className="w-[520px]">
        <SheetHeader>
          <SheetTitle>Suggested Update</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diff</CardTitle>
            </CardHeader>
            <CardContent>
              {workingPatch ? (
                <pre className="text-xs overflow-auto">{JSON.stringify(workingPatch, null, 2)}</pre>
              ) : (
                <div className="text-sm text-muted-foreground">No suggested changes.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issues</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(!issues || !issues.length) && (
                <div className="text-sm text-muted-foreground">No issues detected.</div>
              )}
              {issues?.map((i, idx) => (
                <InlineIssueChip
                  key={idx}
                  severity={i.severity === "critical" ? "destructive" : i.severity === "major" ? "warning" : "outline"}
                  message={`${i.type}: ${i.message}`}
                />
              ))}
            </CardContent>
          </Card>

          {why && (
            <Card>
              <CardHeader>
                <CardTitle>Why</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{why}</p>
              </CardContent>
            </Card>
          )}

          {/* Mini-chat (enabled only if project/entity context is provided) */}
          {projectId && entityType && entityId && (
            <Card>
              <CardHeader>
                <CardTitle>Refine this suggestion</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Try: "Make mitigation concrete with weekly cadence" • "Add owner and set next review Friday"
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    iterate();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Give a short instruction…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <Button type="submit" disabled={busy || !q.trim()}>
                    {busy ? "…" : "Update"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              disabled={disabledApply || !workingPatch}
              onClick={() => workingPatch && onApply && onApply(workingPatch)}
              title={disabledApply ? "Saving requires PATCH (Packet 7)" : "Apply the suggested update"}
            >
              Apply Suggested Update
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
