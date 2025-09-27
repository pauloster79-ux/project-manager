import { z } from "zod";
import { RiskSchema } from "@/src/schemas";

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

export function applyRiskRules(base: any, candidate: any, todayISO: string): RuleResult {
  const issues: Issue[] = [];
  const required_questions: string[] = [];
  const normalized_fields: Record<string, any> = {};

  // Validate basic shape (light – DB enforces too)
  const parsed = RiskSchema.partial().safeParse(candidate);
  if (!parsed.success) {
    issues.push({
      severity: "critical",
      type: "format",
      message: "Risk payload fails schema checks.",
      suggested_fix: "Ensure types/enums are valid; see field errors.",
    });
  }

  // Derived exposure (local computation for checks)
  const p = candidate.probability ?? base?.probability;
  const i = candidate.impact ?? base?.impact;
  const exposure = isInt(p) && isInt(i) ? p * i : undefined;

  // High exposure guardrails
  if (exposure !== undefined && exposure >= 15) {
    const owner = candidate.owner_id ?? base?.owner_id;
    const nrd = candidate.next_review_date ?? base?.next_review_date;
    if (!owner) {
      issues.push({
        severity: "major",
        type: "missing",
        message: "High exposure requires an owner.",
        suggested_fix: "Set owner_id to a responsible user.",
      });
      required_questions.push("Who owns this risk?");
    }
    if (!nrd) {
      issues.push({
        severity: "major",
        type: "missing",
        message: "High exposure requires a next_review_date.",
        suggested_fix: "Set a concrete next review date.",
      });
      required_questions.push("When is the next review?");
    }
  }

  // Date sanity
  const nrd = candidate.next_review_date ?? base?.next_review_date;
  if (nrd && nrd < todayISO) {
    issues.push({
      severity: "minor",
      type: "format",
      message: "Next review date is in the past.",
      suggested_fix: "Move to the next business day or Friday.",
    });
  }

  // Clarity checks
  const title = (candidate.title ?? base?.title ?? "").trim();
  const mitigation = (candidate.mitigation ?? base?.mitigation ?? "").trim();
  if (title.length && title.length < 3) {
    issues.push({ severity: "minor", type: "clarity", message: "Title is very short; add context." });
  }
  if (mitigation && VAGUE_RX.test(mitigation)) {
    issues.push({
      severity: "minor",
      type: "clarity",
      message: "Mitigation is vague.",
      suggested_fix: "State concrete steps and cadence.",
    });
  }

  // Normalizations (safe to auto-apply client-side if you want)
  if (typeof candidate.title === "string") normalized_fields.title = title;
  if (typeof candidate.mitigation === "string") normalized_fields.mitigation = mitigation;

  return { issues, required_questions, normalized_fields };
}

function isInt(n: any): n is number {
  return typeof n === "number" && Number.isInteger(n);
}
