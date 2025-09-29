import { okJSON, apiError } from "@/src/lib/errors";
import { parseJSON } from "@/src/lib/validateRequest";
import { completeJSON } from "@/src/lib/llm";
import { qaSystemPrompt, buildQAPayload } from "@/src/domain/chat/prompt";
import { packContextForQuestion, packContextForRisk, packContextForDecision } from "@/src/lib/retrieval";
import { getCurrentUser, getCurrentOrgId } from "@/src/lib/session";
import { requireAccess } from "@/src/lib/authz";
import { query } from "@/src/lib/db";
import type { QAResponse } from "@/src/domain/chat/types";
import { z } from "zod";

const Body = z.object({
  project_id: z.string().uuid(),
  question: z.string().min(3),
  scope: z
    .object({
      type: z.enum(["project", "risk", "decision"]),
      id: z.string().uuid().optional().nullable(),
    })
    .default({ type: "project" }),
});

export async function POST(req: Request) {
  const { project_id, question, scope } = await parseJSON(req, Body);

  // ---- Org + access guards (Packet 17). Comment these 6 lines if 17 not installed yet.
  const user = await getCurrentUser();
  const orgId = await getCurrentOrgId();
  const pr = await query(`select id, org_id from projects where id = $1`, [project_id]);
  if (!pr.rows[0] || pr.rows[0].org_id !== orgId) return apiError(403, "Project not in current org");
  // TODO: Re-enable permission checks when implementing proper OAuth
  // await requireAccess({ userId: user.id, orgId, need: "project:read", projectId: project_id });
  // ----

  // Build retrieval context (project or entity-scoped)
  const ctx =
    scope?.type === "risk" && scope.id
      ? await packContextForRisk(project_id, scope.id)
      : scope?.type === "decision" && scope.id
      ? await packContextForDecision(project_id, scope.id)
      : await packContextForQuestion(project_id, question);

  // LLM JSON-strict call with safe fallback
  try {
    const out = await completeJSON<QAResponse>({
      system: qaSystemPrompt(),
      user: buildQAPayload({ project_id, question, scope, context: ctx }),
      schemaName: "qa",
      temperature: 0.3,
    });
    return okJSON({ answer: out.answer, citations: out.citations ?? [] });
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Deterministic fallback from context
    const bullets: string[] = [];
    if (ctx.entity_summary) bullets.push(`Context entity: ${ctx.entity_summary}`);
    for (const s of ctx.related_summaries.slice(0, 3)) bullets.push(s);
    const cites = (ctx.doc_snippets || []).slice(0, 3).map((s) => ({
      kind: "document" as const,
      attachment_id: s.attachment_id!,
      filename: s.filename,
      page: s.page,
      text_snippet: s.text.slice(0, 200),
    }));
    
    // Provide a more helpful fallback response
    const fallbackAnswer = bullets.length 
      ? `Based on the available information:\n${bullets.join("\n")}`
      : "I'm having trouble accessing the project data right now. Please try again in a moment.";
      
    return okJSON({
      answer: fallbackAnswer,
      citations: cites,
    });
  }
}
