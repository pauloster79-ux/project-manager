export type Citation =
  | { kind: "risk"; id: string; title?: string }
  | { kind: "decision"; id: string; title?: string }
  | { kind: "document"; attachment_id: string; filename?: string; page?: number; text_snippet?: string };

export type QAResponse = {
  answer: string;
  citations: Citation[];
};
