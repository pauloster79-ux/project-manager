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
  // Map severity to Badge color
  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case "destructive": return "red";
      case "warning": return "amber";
      case "success": return "green";
      case "outline": return "zinc";
      default: return "zinc";
    }
  };

  return (
    <div className="mt-2 flex items-center gap-2 text-sm">
      <Badge color={getBadgeColor(severity)}>{message}</Badge>
      {onApply && (
        <Button plain onClick={onApply}>
          {applyLabel}
        </Button>
      )}
    </div>
  );
}
