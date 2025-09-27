import type { PackedContext } from "@/src/lib/retrieval";
import type { Issue } from "./rules";

export function riskGatewaySystemPrompt() {
  return [
    "You are the AI Quality Gateway for a project management hub.",
    "Your job: evaluate a RISK change for clarity, completeness, and coherence with project context.",
    "Return STRICT JSON only, matching the ValidationResponse schema. Do not add keys.",
    "",
    "Rules:",
    "- Provide a concise list of issues (severity: critical|major|minor; type: missing|contradiction|clarity|format).",
    "- Ask the minimum required follow-up questions in required_questions (strings).",
    "- Produce ONE minimal proposed_patch (only fields to change).",
    "- Keep meaning; improve grammar/clarity in proposed_patch if helpful.",
    "- If status or numbers are unchanged, do not include them in proposed_patch.",
    "- Prefer specific, actionable mitigation text (with cadence).",
    "- If context contradicts the candidate, mark an issue with type='contradiction'.",
  ].join("\n");
}

export function buildRiskGatewayUserPayload(args: {
  project_id: string;
  entity_id?: string;
  base?: any;            // existing DB row (if editing)
  candidate: any;        // base + diff (merged)
  diff: Record<string, any>;
  context: PackedContext;
  rule_issues: Issue[];
}) {
  const { project_id, entity_id, base, candidate, diff, context, rule_issues } = args;
  return JSON.stringify({
    entity_type: "risk",
    project_id,
    entity_id,
    base,
    diff,
    candidate,
    context: {
      entity_summary: context.entity_summary,
      related_summaries: context.related_summaries,
      doc_snippets: context.doc_snippets?.map((s) => ({
        text: s.text,
        source_id: s.source_id,
        page: s.page,
        filename: s.filename,
        score: s.score,
      })),
    },
    rule_issues, // deterministic hints; model can refine but should not ignore
    response_contract: {
      validation_score: "0..100 integer",
      blocked: "boolean",
      issues: "array of {severity,type,message,refs?,suggested_fix?}",
      required_questions: "string[]",
      safe_fixes: "{ normalized_fields?, grammar_rewrite? }",
      proposed_patch: "minimal diff-only patch",
      rationale: "string",
      coherence_refs: "string[]",
      llm_snapshot_id: "string",
    },
  });
}
