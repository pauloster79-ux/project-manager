import { z } from "zod";
import { UUID, ISO_DATE, ISO_DATETIME, ValidationStatus } from "./common";

export const RiskSchema = z.object({
  id: UUID.optional(),
  project_id: UUID,
  title: z.string().min(3, "Title must be at least 3 characters"),
  summary: z.string().nullish(),
  owner_id: UUID.nullish(),
  probability: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  // exposure is derived on the DB; allow it for reads but not required on writes
  exposure: z.number().int().min(1).max(25).optional(),
  mitigation: z.string().nullish(),
  next_review_date: ISO_DATE.nullish(),
  validation_status: ValidationStatus.default("draft").optional(),
  validation_score: z.number().int().min(0).max(100).nullish(),
  issues: z.array(z.any()).optional(),
  ai_rewrite: z.string().nullish(),
  coherence_refs: z.any().optional(),
  provenance: z.any().optional(),
  llm_snapshot_id: z.string().nullish(),
  updated_at: ISO_DATETIME.optional(),
});

export type Risk = z.infer<typeof RiskSchema>;
