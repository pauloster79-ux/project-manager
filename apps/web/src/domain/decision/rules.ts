// src/domain/decision/rules.ts
import { z } from "zod";
import { DecisionSchema } from "@/src/schemas";

export type Issue = {
  severity: "critical" | "major" | "minor";
  type: "missing" | "contradiction" | "clarity" | "format";
  message: string;
  refs?: string[];
  suggested_fix?: string;
};

export type RuleResult = {
  issues: Issue[];
  required_questions: string[];
  normalized_fields: Record<string, any>;
};

const VAGUE_RX = /\b(tbd|n\/a|na|waiting|later|soon|asap)\b/i;

export function applyDecisionRules(base: any, candidate: any, todayISO: string): RuleResult {
  const issues: Issue[] = [];
  const required_questions: string[] = [];
  const normalized_fields: Record<string, any> = {};

  // Validate basic shape (light – DB enforces too)
  const parsed = DecisionSchema.partial().safeParse(candidate);
  if (!parsed.success) {
    issues.push({
      severity: "critical",
      type: "format",
      message: "Decision payload fails schema checks.",
      suggested_fix: "Ensure types/enums are valid; see field errors.",
    });
  }

  // Status-specific requirements
  const status = candidate.status ?? base?.status;
  const decidedBy = candidate.decided_by ?? base?.decided_by;
  const decidedOn = candidate.decided_on ?? base?.decided_on;

  if (status === "Approved" || status === "Rejected") {
    if (!decidedBy) {
      issues.push({
        severity: "major",
        type: "missing",
        message: "Approved/Rejected decisions require a decided_by.",
        suggested_fix: "Set decided_by to the decision maker's user ID.",
      });
      required_questions.push("Who made this decision?");
    }
    if (!decidedOn) {
      issues.push({
        severity: "major",
        type: "missing",
        message: "Approved/Rejected decisions require a decided_on date.",
        suggested_fix: "Set decided_on to the decision date.",
      });
      required_questions.push("When was this decision made?");
    }
  }

  // Date sanity
  if (decidedOn && decidedOn < todayISO) {
    issues.push({
      severity: "minor",
      type: "format",
      message: "Decision date is in the past.",
      suggested_fix: "Verify the decision date is correct.",
    });
  }

  // Clarity checks
  const title = (candidate.title ?? base?.title ?? "").trim();
  const detail = (candidate.detail ?? base?.detail ?? "").trim();

  if (title.length && title.length < 3) {
    issues.push({
      severity: "minor",
      type: "clarity",
      message: "Title is very short; add context.",
    });
  }

  if (detail && VAGUE_RX.test(detail)) {
    issues.push({
      severity: "minor",
      type: "clarity",
      message: "Detail is vague.",
      suggested_fix: "Provide specific details about the decision.",
    });
  }

  // Normalizations (safe to auto-apply client-side if you want)
  if (typeof candidate.title === "string") normalized_fields.title = title;
  if (typeof candidate.detail === "string") normalized_fields.detail = detail;

  return { issues, required_questions, normalized_fields };
}
