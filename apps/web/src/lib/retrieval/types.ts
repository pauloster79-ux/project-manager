export type SourceType = "risk" | "decision" | "attachment_chunk";

export type VectorRow = {
  id: string;
  project_id: string;
  source_type: SourceType;
  source_id: string;
  chunk_index: number;
  chunk_text: string;
  metadata: any; // { attachment_id?: string, page?: number, filename?: string, ... }
  score: number; // similarity (0..1), higher is better
};

export type DocSnippet = {
  text: string;
  score: number;
  attachment_id?: string;
  page?: number;
  filename?: string;
  source_id: string;       // vectors.source_id (attachment id or entity id)
  chunk_index?: number;
};

export type PackedContext = {
  entity_summary?: string;          // only for entity-specific packing
  related_summaries: string[];      // compact lines for nearby entities
  doc_snippets: DocSnippet[];       // top K snippets (≤ 3 for gateway)
};
