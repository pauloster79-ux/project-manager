import { query } from "@/src/lib/db";
import type { SourceType, VectorRow } from "./types";

/**
 * Build a safe SQL vector literal for pgvector from a JS array.
 * NOTE: Input comes from our own embed() → numeric only.
 */
function toVectorLiteral(vec: number[]) {
  // Avoid scientific notation; clamp/round to 6 decimals to keep SQL short
  const parts = vec.map((x) => Number.isFinite(x) ? x.toFixed(6) : "0.000000");
  return `'[${parts.join(",")}]'::vector`;
}

/**
 * Vector search using pgvector.
 * - Orders by cosine distance ascending (via <=>), returns similarity = 1 - distance.
 * - Filters by project and source types.
 */
export async function vectorSearch(params: {
  projectId: string;
  queryVector: number[];
  k: number;
  sourceTypes?: SourceType[];
}): Promise<VectorRow[]> {
  const { projectId, queryVector, k, sourceTypes = ["attachment_chunk", "risk", "decision"] } = params;
  if (!queryVector?.length) return [];
  const vec = toVectorLiteral(queryVector);

  // Build a text[] literal for sourceTypes
  const srcList = sourceTypes.map((s) => `'${s}'`).join(",");
  const sql = `
    select id, project_id, source_type, source_id, chunk_index, chunk_text, metadata,
           1 - (embedding <=> ${vec}) as score
    from vectors
    where project_id = $1
      and source_type = any(array[${srcList}]::text[])
    order by embedding <=> ${vec} asc
    limit $2
  `;
  const { rows } = await query(sql, [projectId, k]);
  return rows as VectorRow[];
}

/**
 * Maximal Marginal Relevance (MMR) diversification.
 * items must be pre-sorted by score desc (similarity high→low).
 */
export function mmrDiversify<T extends { score: number }>(
  items: T[],
  k: number,
  lambda = toFloat(process.env.RETRIEVAL_LAMBDA, 0.7)
): T[] {
  if (items.length <= k) return items;
  const picked: T[] = [];
  const rest = items.slice();
  // seed with best
  picked.push(rest.shift()!);

  while (picked.length < k && rest.length) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < rest.length; i++) {
      const candidate = rest[i];
      // Similarity term
      const rel = candidate.score;
      // Diversity term: max similarity against already picked (proxy via score)
      const div = Math.max(...picked.map((p) => cosineProxy(candidate, p)));
      const mmr = lambda * rel - (1 - lambda) * div;
      if (mmr > bestScore) {
        bestScore = mmr;
        bestIdx = i;
      }
    }
    picked.push(rest.splice(bestIdx, 1)[0]);
  }
  return picked;
}

// Without raw vectors, approximate pairwise similarity via score product
function cosineProxy(a: { score: number }, b: { score: number }) {
  return Math.min(1, Math.max(0, a.score * b.score));
}
function toFloat(v?: string, d = 0.7) {
  const n = v ? parseFloat(v) : NaN;
  return Number.isFinite(n) ? n : d;
}
