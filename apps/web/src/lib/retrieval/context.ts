import { embed } from "@/src/lib/llm";
import { query } from "@/src/lib/db";
import { mmrDiversify, vectorSearch } from "./search";
import { summarizeDecision, summarizeRisk } from "./summarize";
import type { PackedContext, DocSnippet } from "./types";

/**
 * Pack compact context for a Risk. Pulls:
 * - Canonical summary of the risk
 * - Neighbor summaries (risks by exposure, recent decisions)
 * - Top doc snippets via vectors (≤ RETRIEVAL_DOC_CHUNKS)
 */
export async function packContextForRisk(projectId: string, riskId: string, opts?: {
  k?: number; docChunks?: number;
}): Promise<PackedContext> {
  const k = toInt(process.env.RETRIEVAL_K, 10, opts?.k);
  const docChunks = toInt(process.env.RETRIEVAL_DOC_CHUNKS, 3, opts?.docChunks);

  const { rows } = await query(`select * from risks where id = $1 and project_id = $2`, [riskId, projectId]);
  const risk = rows[0];
  if (!risk) return { entity_summary: undefined, related_summaries: [], doc_snippets: [] };

  const entity_summary = summarizeRisk(risk);

  const [riskNeighbors, decisionNeighbors, snippets] = await Promise.all([
    query(
      `select * from risks where project_id = $1 and id <> $2 order by exposure desc, updated_at desc limit $3`,
      [projectId, riskId, Math.ceil(k / 2)]
    ).then((r) => r.rows.map(summarizeRisk)),
    query(
      `select * from decisions where project_id = $1 order by updated_at desc limit $2`,
      [projectId, Math.floor(k / 2)]
    ).then((r) => r.rows.map(summarizeDecision)),
    topDocSnippetsForEntity({
      projectId,
      entityText: buildRiskQueryText(risk),
      limit: docChunks,
    }),
  ]);

  return {
    entity_summary,
    related_summaries: [...riskNeighbors, ...decisionNeighbors].slice(0, k),
    doc_snippets: snippets,
  };
}

/**
 * Pack compact context for a Decision.
 */
export async function packContextForDecision(projectId: string, decisionId: string, opts?: {
  k?: number; docChunks?: number;
}): Promise<PackedContext> {
  const k = toInt(process.env.RETRIEVAL_K, 10, opts?.k);
  const docChunks = toInt(process.env.RETRIEVAL_DOC_CHUNKS, 3, opts?.docChunks);

  const { rows } = await query(`select * from decisions where id = $1 and project_id = $2`, [decisionId, projectId]);
  const decision = rows[0];
  if (!decision) return { entity_summary: undefined, related_summaries: [], doc_snippets: [] };

  const entity_summary = summarizeDecision(decision);

  const [decisionNeighbors, riskNeighbors, snippets] = await Promise.all([
    query(
      `select * from decisions where project_id = $1 and id <> $2 order by updated_at desc limit $3`,
      [projectId, decisionId, Math.ceil(k / 2)]
    ).then((r) => r.rows.map(summarizeDecision)),
    query(
      `select * from risks where project_id = $1 order by exposure desc, updated_at desc limit $2`,
      [projectId, Math.floor(k / 2)]
    ).then((r) => r.rows.map(summarizeRisk)),
    topDocSnippetsForEntity({
      projectId,
      entityText: buildDecisionQueryText(decision),
      limit: docChunks,
    }),
  ]);

  return {
    entity_summary,
    related_summaries: [...decisionNeighbors, ...riskNeighbors].slice(0, k),
    doc_snippets: snippets,
  };
}

/**
 * Pack context for a free-form project question (Q&A).
 */
export async function packContextForQuestion(projectId: string, question: string, opts?: {
  k?: number; docChunks?: number;
}): Promise<PackedContext> {
  const k = toInt(process.env.RETRIEVAL_K, 10, opts?.k);
  const docChunks = toInt(process.env.RETRIEVAL_DOC_CHUNKS, 3, opts?.docChunks);

  // Embed the question and search vectors across all sources (bias to docs)
  const [qVec] = await embed([question]);
  const rows = await vectorSearch({
    projectId,
    queryVector: qVec,
    k: Math.max(k, docChunks * 3),
    sourceTypes: ["attachment_chunk", "risk", "decision"],
  });

  const diversified = mmrDiversify(rows, Math.max(k, docChunks * 2));
  const doc_snippets = rowsToSnippets(diversified).slice(0, docChunks);

  // Also pull quick neighbor summaries for readability
  const [risks, decisions] = await Promise.all([
    query(`select * from risks where project_id = $1 order by exposure desc, updated_at desc limit $2`, [projectId, k])
      .then((r) => r.rows.map(summarizeRisk)),
    query(`select * from decisions where project_id = $1 order by updated_at desc limit $2`, [projectId, k])
      .then((r) => r.rows.map(summarizeDecision)),
  ]);

  return {
    related_summaries: [...risks.slice(0, Math.ceil(k / 2)), ...decisions.slice(0, Math.floor(k / 2))],
    doc_snippets,
  };
}

// ---- helpers ----

async function topDocSnippetsForEntity(args: { projectId: string; entityText: string; limit: number }): Promise<DocSnippet[]> {
  const { projectId, entityText, limit } = args;
  if (!entityText?.trim()) return [];
  const [qVec] = await embed([entityText]);

  const rows = await vectorSearch({
    projectId,
    queryVector: qVec,
    k: Math.max(limit * 4, 10),
    sourceTypes: ["attachment_chunk"], // focus on docs for evidence
  });

  const diversified = mmrDiversify(rows, limit);
  return rowsToSnippets(diversified).slice(0, limit);
}

function rowsToSnippets(rows: Array<{ chunk_text: string; metadata: any; score: number; source_id: string; chunk_index: number }>): DocSnippet[] {
  return rows.map((r) => ({
    text: r.chunk_text,
    score: round(r.score, 3),
    attachment_id: r.metadata?.attachment_id ?? r.source_id,
    page: r.metadata?.page,
    filename: r.metadata?.filename,
    source_id: r.source_id,
    chunk_index: r.chunk_index,
  }));
}

function buildRiskQueryText(risk: any) {
  const parts = [
    risk?.title,
    risk?.summary,
    risk?.mitigation ? `Mitigation: ${risk.mitigation}` : null,
    risk?.next_review_date ? `Next review: ${risk.next_review_date}` : null,
  ].filter(Boolean);
  return parts.join(". ");
}

function buildDecisionQueryText(decision: any) {
  const parts = [
    decision?.title,
    decision?.detail,
    decision?.status ? `Status: ${decision.status}` : null,
    decision?.decided_on ? `Decided on: ${decision.decided_on}` : null,
  ].filter(Boolean);
  return parts.join(". ");
}

function toInt(env: string | undefined, dflt: number, override?: number) {
  if (typeof override === "number") return override;
  const n = env ? parseInt(env, 10) : NaN;
  return Number.isFinite(n) ? n : dflt;
}
function round(n: number, dp = 3) {
  const p = Math.pow(10, dp);
  return Math.round(n * p) / p;
}
