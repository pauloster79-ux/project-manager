import { z } from "zod";
import { UUID, ISO_DATE, ISO_DATETIME, ValidationStatus } from "./common";

export const DecisionStatus = z.enum(["Proposed", "Approved", "Rejected"]);

export const DecisionSchema = z.object({
  id: UUID.optional(),
  project_id: UUID,
  title: z.string().min(3, "Title must be at least 3 characters"),
  detail: z.string().nullish(),
  decided_by: UUID.nullish(),
  decided_on: ISO_DATE.nullish(),
  status: DecisionStatus.default("Proposed"),
  validation_status: ValidationStatus.default("draft").optional(),
  validation_score: z.number().int().min(0).max(100).nullish(),
  issues: z.array(z.any()).optional(),
  ai_rewrite: z.string().nullish(),
  coherence_refs: z.any().optional(),
  provenance: z.any().optional(),
  llm_snapshot_id: z.string().nullish(),
  updated_at: ISO_DATETIME.optional(),
});

export type Decision = z.infer<typeof DecisionSchema>;

// API Response Types
export interface DecisionApiResponse extends Decision {
  id: string;
  project_id: string;
  title: string;
  detail?: string;
  decided_by?: string;
  decided_on?: string;
  status: "Proposed" | "Approved" | "Rejected";
  validation_status: "valid" | "draft" | "blocked";
  validation_score?: number;
  issues?: any[];
  ai_rewrite?: string;
  coherence_refs?: any;
  provenance?: any;
  llm_snapshot_id?: string;
  updated_at: string;
}