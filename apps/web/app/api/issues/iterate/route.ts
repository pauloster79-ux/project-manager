import { okJSON, apiError } from "@/src/lib/errors";
import { parseJSON } from "@/src/lib/validateRequest";
import { completeJSON } from "@/src/lib/llm";
import { iterateSystemPrompt, buildIterateUserPayload } from "@/src/domain/issues/iteratePrompt";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";
import { query } from "@/src/lib/db";
import { packContextForRisk, packContextForDecision } from "@/src/lib/retrieval";
import { z } from "zod";

const Body = z.object({
  project_id: z.string().uuid(),
  entity_type: z.enum(["risk", "decision"]),
  entity_id: z.string().uuid(),
  instruction: z.string().min(2),
  current_patch: z.record(z.string(), z.any()).optional(),
  issues: z.array(z.object({
    severity: z.string(),
    type: z.string(),
    message: z.string(),
  })).optional(),
});

export async function POST(req: Request) {
  const { project_id, entity_type, entity_id, instruction, current_patch, issues } = await parseJSON(req, Body);

  // ---- Org/access guards (Packet 17). Comment out if 17 not present.
  const user = await getCurrentUser();
  const orgId = await getCurrentOrgId();
  const pr = await query(`select id, org_id from projects where id = $1`, [project_id]);
  if (!pr.rows[0] || pr.rows[0].org_id !== orgId) return apiError(403, "Project not in current org");
  await requireAccess({ userId: user.id, orgId, need: "project:read", projectId: project_id });
  // ----

  // Load base row + retrieval context
  let base: any;
  if (entity_type === "risk") {
    const r = await query(`select * from risks where id = $1 and project_id = $2`, [entity_id, project_id]);
    base = r.rows[0];
    if (!base) return apiError(404, "Risk not found");
  } else {
    const r = await query(`select * from decisions where id = $1 and project_id = $2`, [entity_id, project_id]);
    base = r.rows[0];
    if (!base) return apiError(404, "Decision not found");
  }

  const ctx = entity_type === "risk"
    ? await packContextForRisk(project_id, entity_id)
    : await packContextForDecision(project_id, entity_id);

  // LLM call
  try {
    const out = await completeJSON<{
      proposed_patch: Record<string, any>;
      rationale: string;
      followups?: string[];
    }>({
      system: iterateSystemPrompt(),
      user: buildIterateUserPayload({
        entity_type,
        project_id,
        entity_id,
        instruction,
        current_patch,
        issues,
        base,
        context: ctx,
      }),
      schemaName: "issues_iterate",
      temperature: 0.3,
    });

    // Minimal sanity
    const patch = out?.proposed_patch && typeof out.proposed_patch === "object" ? out.proposed_patch : {};
    const rationale = typeof out?.rationale === "string" ? out.rationale : "";
    const followups = Array.isArray(out?.followups) ? out.followups : [];

    // Strip forbidden keys (defensive)
    ["id","project_id","org_id","created_at","updated_at"].forEach((k) => delete (patch as any)[k]);

    return okJSON({ proposed_patch: patch, rationale, followups });
  } catch {
    // Fallback: echo current_patch or noop
    return okJSON({
      proposed_patch: current_patch || {},
      rationale: "Model unavailable; returning the current patch unchanged.",
      followups: [],
    });
  }
}
