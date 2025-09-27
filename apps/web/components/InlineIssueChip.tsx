// components/InlineIssueChip.tsx
"use client";

import { Badge } from "@/components/catalyst/badge";
import { Button } from "@/components/catalyst/button";

export function InlineIssueChip({
  severity = "warning",
  message,
  onApply,
  applyLabel = "Apply",
}: {
  severity?: "warning" | "destructive" | "success" | "outline";
  message: string;
  onApply?: () => void;
  applyLabel?: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-2 text-sm">
      <Badge variant={severity}>{message}</Badge>
      {onApply && (
        <Button size="sm" variant="ghost" onClick={onApply}>
          {applyLabel}
        </Button>
      )}
    </div>
  );
}
