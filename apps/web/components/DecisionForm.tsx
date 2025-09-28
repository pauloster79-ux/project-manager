// components/DecisionForm.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DecisionSchema, DecisionStatus } from "@/src/schemas";
import { validateDecision, DecisionValidationResponse } from "@/lib/validationClient";
import { applyDecisionPatch } from "@/lib/applyPatch";

import { Label } from "@/components/catalyst/label";
import { Input } from "@/components/catalyst/input";
import { Textarea } from "@/components/catalyst/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/catalyst/select-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/catalyst/card";
import { Button } from "@/components/catalyst/button";
import { InlineIssueChip } from "./InlineIssueChip";
import { prefillChat } from "@/lib/chatBridge";

// Create a form-specific schema with required fields
const DecisionFormSchema = DecisionSchema.partial().extend({
  project_id: z.string(),
  title: z.string().min(1, "Title is required"),
  status: z.enum(["Proposed", "Approved", "Rejected"]),
});

type DecisionFormValues = z.infer<typeof DecisionFormSchema>;

function mapIssueToField(message: string): keyof DecisionFormValues | null {
  const m = message.toLowerCase();
  if (m.includes("title")) return "title";
  if (m.includes("detail")) return "detail";
  if (m.includes("status")) return "status";
  if (m.includes("decided_by") || m.includes("approved") || m.includes("rejected") || m.includes("who")) return "decided_by";
  if (m.includes("decided_on") || m.includes("when") || m.includes("date")) return "decided_on";
  return null;
}

export function DecisionForm({
  projectId,
  decision,
}: {
  projectId: string;
  decision: any; // row from /api/decisions/[id]
}) {
  const [validation, setValidation] = useState<DecisionValidationResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const baseRef = useRef<any>(decision);

  const form = useForm<DecisionFormValues>({
    resolver: zodResolver(DecisionFormSchema),
    defaultValues: {
      id: decision.id,
      project_id: projectId,
      title: decision.title ?? "",
      detail: decision.detail ?? "",
      status: (decision.status as any) ?? "Proposed",
      decided_by: decision.decided_by ?? null,
      decided_on: decision.decided_on ?? null,
      validation_status: (decision.validation_status as any) ?? "draft",
    },
    mode: "onChange",
  });

  async function validateField(field: keyof DecisionFormValues) {
    const current = form.getValues();
    const diff: Record<string, any> = {};
    diff[field as string] = (current as any)[field];

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await validateDecision({
        project_id: projectId,
        entity_id: decision.id,
        diff,
        signal: abortRef.current.signal,
      });
      setValidation(res);
      setPanelOpen(true);
    } catch (e) {
      // optional toast
      console.error(e);
    }
  }

  function applySafeFixToField(field: keyof DecisionFormValues) {
    if (!validation?.safe_fixes?.normalized_fields) return;
    const v = validation.safe_fixes.normalized_fields[field as string];
    if (v === undefined) return;
    form.setValue(field, v as any, { shouldDirty: true, shouldValidate: true });
  }

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Edit Decision</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} onBlur={() => validateField("title")} placeholder="Short, clear decision title" />
            {fieldIssues.get("title")?.map((msg, i) => (
              <InlineIssueChip key={i} message={msg} onApply={() => applySafeFixToField("title")} />
            ))}
          </div>

          {/* Detail */}
          <div>
            <Label htmlFor="detail">Detail (optional)</Label>
            <Textarea id="detail" rows={3} {...form.register("detail")} onBlur={() => validateField("detail")} />
            {fieldIssues.get("detail")?.map((msg, i) => (
              <InlineIssueChip key={i} message={msg} onApply={() => applySafeFixToField("detail")} />
            ))}
          </div>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <Select
              value={String(form.watch("status") ?? "Proposed")}
              onValueChange={(v) => {
                form.setValue("status", v as any, { shouldDirty: true });
                // validate on change to surface by/on requirements quickly
                validateField("status");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
              <SelectContent>
                {(["Proposed","Approved","Rejected"] as (z.infer<typeof DecisionStatus>)[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldIssues.get("status")?.map((msg, i) => <InlineIssueChip key={i} message={msg} />)}
          </div>

          {/* Decided by / on */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="decided_by">Decided by (user id)</Label>
              <Input id="decided_by" {...form.register("decided_by")} onBlur={() => validateField("decided_by")} placeholder="UUID (stub)" />
              {fieldIssues.get("decided_by")?.map((msg, i) => <InlineIssueChip key={i} message={msg} />)}
            </div>
            <div>
              <Label htmlFor="decided_on">Decided on</Label>
              <Input id="decided_on" type="date" {...form.register("decided_on")} onBlur={() => validateField("decided_on")} />
              {fieldIssues.get("decided_on")?.map((msg, i) => <InlineIssueChip key={i} message={msg} />)}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              outline
              onClick={() =>
                prefillChat({
                  question:
                    "Explain this decision: status, who approves, rationale, risks, next steps (cite docs).",
                  scope: { type: "decision", id: decision.id },
                })
              }
            >
              Explain this decision
            </Button>
            <Button type="button" disabled title="You can also wire a full-form Save using PATCH like Packet 9">
              Save (full form)
            </Button>
          </div>
        </CardContent>
      </Card>

    </>
  );
}
