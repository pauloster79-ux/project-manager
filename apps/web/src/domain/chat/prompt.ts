import type { PackedContext } from "@/src/lib/retrieval";

export function qaSystemPrompt() {
  return [
    "You are an assistant for a project management hub.",
    "Base your answer ONLY on the provided context and project data.",
    "Write clearly; prefer short paragraphs or bullet points.",
    "Always include citations to risks, decisions, or document snippets used.",
    "Return STRICT JSON with keys: answer (string), citations (array). No extra keys.",
  ].join("\n");
}

export function buildQAPayload(args: {
  project_id: string;
  question: string;
  scope: { type: "project" | "risk" | "decision"; id?: string | null };
  context: PackedContext;
}) {
  const { project_id, question, scope, context } = args;
  return JSON.stringify({
    project_id,
    question,
    scope,
    context: {
      entity_summary: context.entity_summary,
      related_summaries: context.related_summaries,
      doc_snippets: context.doc_snippets?.map((s) => ({
        text: s.text,
        score: s.score,
        filename: s.filename,
        page: s.page,
        attachment_id: s.attachment_id,
      })),
    },
    response_contract: {
      answer: "string",
      citations:
        "array of {kind:'risk'|'decision'|'document', id|attachment_id, title?, filename?, page?, text_snippet?}",
    },
  });
}
