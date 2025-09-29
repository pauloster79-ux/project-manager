import type { PackedContext } from "@/src/lib/retrieval";

export function iterateSystemPrompt() {
  return [
    "You are the AI Quality Gateway assistant.",
    "Task: refine a PROPOSED PATCH for an entity (risk or decision) based on a short user instruction.",
    "Constraints:",
    "- Output STRICT JSON with keys: proposed_patch (object), rationale (string), followups (string[]). Nothing else.",
    "- proposed_patch must be a MINIMAL diff: include only fields that should change.",
    "- Preserve the user's intent and project consistency. Use the context provided; do not invent facts.",
    "- If the user asks for something unsafe or contradictory to context, adjust conservatively and explain in rationale.",
    "- Prefer concrete, measurable wording (e.g., cadence, owners, dates).",
    "- Never include immutable fields like id, project_id, org_id, created_at, updated_at.",
  ].join("\n");
}

export function buildIterateUserPayload(args: {
  entity_type: "risk" | "decision";
  project_id: string;
  entity_id: string;
  instruction: string;
  current_patch?: Record<string, any>;
  issues?: Array<{ severity: string; type: string; message: string }>;
  base: any;               // full row from DB
  context: PackedContext;  // retrieval pack
}) {
  const { entity_type, project_id, entity_id, instruction, current_patch, issues, base, context } = args;
  return JSON.stringify({
    entity_type,
    project_id,
    entity_id,
    instruction,
    current_patch: current_patch || {},
    issues: issues || [],
    base_snapshot: base,
    context: {
      entity_summary: context.entity_summary,
      related_summaries: context.related_summaries,
      doc_snippets: context.doc_snippets?.map((s) => ({
        text: s.text,
        filename: s.filename,
        page: s.page,
        score: s.score,
        attachment_id: s.attachment_id,
      })),
    },
    response_contract: {
      proposed_patch: "object (minimal diff only)",
      rationale: "string",
      followups: "string[]",
    },
  });
}
