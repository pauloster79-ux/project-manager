// components/IssuesPanel.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/catalyst/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Button } from "@/components/catalyst/button";
import { InlineIssueChip } from "./InlineIssueChip";

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
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  issues: Issue[];
  proposedPatch: Record<string, any> | null;
  rationale?: string | null;
  disabledApply?: boolean;
  onApply?: (patch: Record<string, any>) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[480px]">
        <SheetHeader>
          <SheetTitle>Suggested Update</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diff</CardTitle>
            </CardHeader>
            <CardContent>
              {proposedPatch ? (
                <pre className="text-xs overflow-auto">{JSON.stringify(proposedPatch, null, 2)}</pre>
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

          {rationale && (
            <Card>
              <CardHeader>
                <CardTitle>Why</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{rationale}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button
              disabled={disabledApply || !proposedPatch}
              onClick={() => proposedPatch && onApply && onApply(proposedPatch)}
              title={disabledApply ? "Saving arrives in Packet 7" : "Apply the suggested update"}
            >
              Apply Suggested Update
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
