import { NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { apiError, okJSON } from "@/src/lib/errors";
import { parseJSON } from "@/src/lib/validateRequest";
import { UUID } from "@/src/schemas";
import { ValidationResponseSchema } from "@/src/schemas";
import { completeJSON } from "@/src/lib/llm";
import { packContextForRisk, packContextForQuestion } from "@/src/lib/retrieval";
import { applyRiskRules } from "@/src/domain/risk/rules";
import { scoreFromIssues, blockedFromIssues } from "@/src/domain/risk/score";
import { riskGatewaySystemPrompt, buildRiskGatewayUserPayload } from "@/src/domain/risk/prompt";
import { z } from "zod";

const BodySchema = z.object({
  project_id: UUID,
  entity_id: UUID.optional(),
  diff: z.record(z.any()),
});

export async function POST(req: Request) {
  // 1) Parse/validate request
  const body = await parseJSON(req, BodySchema);
  const { project_id, entity_id, diff } = body;

  // 2) Load base row if editing
  let base: any | undefined;
  if (entity_id) {
    const { rows } = await query(`select * from risks where id = $1 and project_id = $2`, [entity_id, project_id]);
    if (!rows[0]) return apiError(404, "Risk not found for validate");
    base = rows[0];
  }

  // 3) Candidate = base + diff (shallow)
  const candidate = { ...(base || {}), ...(diff || {}), project_id };

  // 4) Deterministic rules first
  const todayISO = new Date().toISOString().slice(0, 10);
  const rules = applyRiskRules(base, candidate, todayISO);

  // 5) Pack retrieval context
  let context;
  if (entity_id) {
    context = await packContextForRisk(project_id, entity_id);
  } else {
    // New risk: use the candidate text to pull helpful snippets
    const q = [candidate.title, candidate.summary, candidate.mitigation].filter(Boolean).join(". ");
    context = await packContextForQuestion(project_id, q || "risk creation");
  }

  // 6) LLM JSON-strict call
  let llm;
  try {
    llm = await completeJSON({
      system: riskGatewaySystemPrompt(),
      user: buildRiskGatewayUserPayload({
        project_id,
        entity_id,
        base,
        candidate,
        diff,
        context,
        rule_issues: rules.issues,
      }),
      schemaName: "gateway",
      temperature: 0.2,
    });
  } catch (e: any) {
    // LLM failed (timeout/etc). Fall back to deterministic minimum viable response.
    const validation_score = scoreFromIssues(rules.issues);
    const blocked = blockedFromIssues(rules.issues);
    return okJSON({
      validation_score,
      blocked,
      issues: rules.issues,
      required_questions: rules.required_questions,
      safe_fixes: { normalized_fields: rules.normalized_fields },
      proposed_patch: Object.keys(rules.normalized_fields).length ? rules.normalized_fields : {},
      rationale: "Deterministic checks only (LLM unavailable).",
      coherence_refs: [],
      llm_snapshot_id: "gw:deterministic-only",
    });
  }

  // 7) Merge-safe fixes from rules with LLM output
  const parse = ValidationResponseSchema.safeParse(llm);
  if (!parse.success) {
    return apiError(500, "LLM returned an invalid ValidationResponse", parse.error.flatten());
  }
  const out = parse.data;

  // If LLM didn't include normalized_fields, add ours
  const safe_fixes = {
    normalized_fields: {
      ...(out.safe_fixes?.normalized_fields || {}),
      ...(rules.normalized_fields || {}),
    },
    grammar_rewrite: out.safe_fixes?.grammar_rewrite,
  };

  // Ensure score/blocked are at least as strict as deterministic rules
  const minScore = scoreFromIssues(rules.issues);
  const score = Math.min(100, Math.max(minScore, out.validation_score));
  const blocked = out.blocked || blockedFromIssues(rules.issues);

  return okJSON({
    ...out,
    validation_score: score,
    blocked,
    safe_fixes,
  });
}
