// components/RiskForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RiskSchema } from "@/src/schemas";
import { validateRisk, ValidationResponse } from "@/lib/validationClient";
import { applyRiskPatch } from "@/lib/applyPatch";
import { Label } from "@/components/catalyst/label";
import { Input } from "@/components/catalyst/input";
import { Textarea } from "@/components/catalyst/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/catalyst/select-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Button } from "@/components/catalyst/button";
import { InlineIssueChip } from "./InlineIssueChip";
import { IssuesPanel } from "./IssuesPanel";
import { prefillChat } from "@/lib/chatBridge";

// Create a form-specific schema with required fields
const RiskFormSchema = RiskSchema.partial().extend({
  project_id: z.string(),
  title: z.string().min(1, "Title is required"),
  probability: z.number().min(1).max(5),
  impact: z.number().min(1).max(5),
});

type RiskFormValues = z.infer<typeof RiskFormSchema>;

// crude field mapping from issue message → form field (heuristic for UI hints)
function mapIssueToField(message: string): keyof RiskFormValues | null {
  const m = message.toLowerCase();
  if (m.includes("mitigation")) return "mitigation";
  if (m.includes("owner")) return "owner_id";
  if (m.includes("next review")) return "next_review_date";
  if (m.includes("title")) return "title";
  if (m.includes("probability")) return "probability" as any;
  if (m.includes("impact")) return "impact" as any;
  return null;
}

export function RiskForm({
  projectId,
  risk,
}: {
  projectId: string;
  risk: any; // fetched row from /api/risks/[id]
}) {
  const [validation, setValidation] = useState<ValidationResponse | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const form = useForm<RiskFormValues>({
    resolver: zodResolver(RiskFormSchema),
    defaultValues: {
      id: risk.id,
      project_id: projectId,
      title: risk.title ?? "",
      summary: risk.summary ?? "",
      owner_id: risk.owner_id ?? null,
      probability: risk.probability ?? 3,
      impact: risk.impact ?? 3,
      mitigation: risk.mitigation ?? "",
      next_review_date: risk.next_review_date ?? null,
      validation_status: (risk.validation_status as any) ?? "draft",
    },
    mode: "onChange",
  });

  const baseRef = useRef<any>(risk); // last loaded/saved snapshot

  // Debounced on-blur validate for a single-field diff
  async function validateField(field: keyof RiskFormValues) {
    const current = form.getValues();
    const diff: Record<string, any> = {};
    diff[field as string] = (current as any)[field];

    // Abort previous inflight validate (avoid races)
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await validateRisk({
        project_id: projectId,
        entity_id: risk.id,
        diff,
        signal: abortRef.current.signal,
      });
      setValidation(res);
      setPanelOpen(true);
    } catch (e) {
      // optional: surface a toast
      console.error(e);
    }
  }

  // safe-fix apply per field (client-side only)
  function applySafeFixToField(field: keyof RiskFormValues) {
    if (!validation?.safe_fixes?.normalized_fields) return;
    const v = validation.safe_fixes.normalized_fields[field as string];
    if (v === undefined) return;
    form.setValue(field, v, { shouldDirty: true, shouldValidate: true });
  }

  // group issues per field for inline chips
  const fieldIssues = useMemo(() => {
    const map = new Map<string, string[]>();
    validation?.issues?.forEach((i) => {
      const f = mapIssueToField(i.message);
      if (!f) return;
      const arr = map.get(f) || [];
      arr.push(`${i.type}: ${i.message}`);
      map.set(f, arr);
    });
    return map;
  }, [validation]);

  // Helpers to render number select 1..5
  const scale = [1, 2, 3, 4, 5];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Risk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              onBlur={() => validateField("title")}
              placeholder="Short, clear risk title"
            />
            {fieldIssues.get("title")?.map((msg, i) => (
              <InlineIssueChip key={i} message={msg} onApply={() => applySafeFixToField("title")} />
            ))}
          </div>

          {/* Summary */}
          <div>
            <Label htmlFor="summary">Summary (optional)</Label>
            <Textarea id="summary" rows={3} {...form.register("summary")} onBlur={() => validateField("summary")} />
          </div>

          {/* Probability / Impact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Probability (1–5)</Label>
              <Select
                value={String(form.watch("probability") ?? "")}
                onValueChange={(v) => {
                  form.setValue("probability", Number(v) as any, { shouldDirty: true });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {scale.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="mt-1 text-xs text-muted-foreground">Exposure is probability × impact (computed).</div>
              {fieldIssues.get("probability")?.map((msg, i) => (
                <InlineIssueChip key={i} message={msg} />
              ))}
            </div>

            <div>
              <Label>Impact (1–5)</Label>
              <Select
                value={String(form.watch("impact") ?? "")}
                onValueChange={(v) => {
                  form.setValue("impact", Number(v) as any, { shouldDirty: true });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  {scale.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              {fieldIssues.get("impact")?.map((msg, i) => (
                <InlineIssueChip key={i} message={msg} />
              ))}
            </div>
          </div>

          {/* Mitigation */}
          <div>
            <Label htmlFor="mitigation">Mitigation</Label>
            <Textarea
              id="mitigation"
              rows={3}
              {...form.register("mitigation")}
              onBlur={() => validateField("mitigation")}
              placeholder="Concrete steps + cadence (e.g., 'Escalate weekly; rollback plan ready.')"
            />
            {fieldIssues.get("mitigation")?.map((msg, i) => (
              <InlineIssueChip key={i} message={msg} onApply={() => applySafeFixToField("mitigation")} />
            ))}
          </div>

          {/* Owner / Next Review Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="owner_id">Owner (user id for now)</Label>
              <Input id="owner_id" {...form.register("owner_id")} onBlur={() => validateField("owner_id")} placeholder="UUID (stub)" />
              {fieldIssues.get("owner_id")?.map((msg, i) => (
                <InlineIssueChip key={i} message={msg} />
              ))}
            </div>
            <div>
              <Label htmlFor="next_review_date">Next review date</Label>
              <Input
                id="next_review_date"
                type="date"
                {...form.register("next_review_date")}
                onBlur={() => validateField("next_review_date")}
              />
              {fieldIssues.get("next_review_date")?.map((msg, i) => (
                <InlineIssueChip key={i} message={msg} />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              outline
              onClick={() => setPanelOpen(true)}
              title="Open issues & suggested update"
            >
              Review Suggested Update
            </Button>
            <Button
              type="button"
              outline
              onClick={() =>
                prefillChat({
                  question:
                    "Explain this risk in 5 bullets: exposure, mitigation, owner, next review date, contradictions (cite docs).",
                  scope: { type: "risk", id: risk.id },
                })
              }
            >
              Explain this risk
            </Button>
            <Button
              type="button"
              disabled
              title="Saving arrives in Packet 7"
            >
              Save (Packet 7)
            </Button>
          </div>
        </CardContent>
      </Card>

      <IssuesPanel
        open={panelOpen}
        onOpenChange={setPanelOpen}
        issues={validation?.issues ?? []}
        proposedPatch={validation?.proposed_patch ?? null}
        rationale={validation?.rationale ?? null}
        disabledApply={false}
        onApply={async (patch) => {
          if (!validation) return;
          try {
            const updated = await applyRiskPatch({
              project_id: projectId,
              id: risk.id,
              patch,
              llm_snapshot_id: validation.llm_snapshot_id,
              if_match_updated_at: (risk.updated_at ?? baseRef.current?.updated_at) as string | undefined,
            });
            // refresh form baseline
            baseRef.current = updated;
            // sync form with server values (simple approach: reload page or set values)
            Object.entries(updated).forEach(([k, v]) => {
              // @ts-ignore
              if (form.getValues().hasOwnProperty(k)) form.setValue(k as any, v as any, { shouldDirty: false });
            });
            setValidation(null);
            setPanelOpen(false);
            alert("Update applied.");
          } catch (e: any) {
            alert(e.message || "Failed to apply update");
          }
        }}
      />
    </>
  );
}
