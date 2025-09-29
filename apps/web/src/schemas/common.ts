import { z } from "zod";

export const UUID = z.string().uuid();

export const ISO_DATE = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected ISO date (YYYY-MM-DD)");

export const ISO_DATETIME = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/,
    "Expected ISO datetime (e.g. 2025-09-26T10:11:12.000Z)"
  );

export const ValidationStatus = z.enum(["valid", "draft", "blocked"]);

// API Request Schemas
export const CreateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255, "Project name too long"),
  description: z.string().max(1000, "Description too long").optional(),
});

export const PatchRiskSchema = z.object({
  project_id: UUID,
  patch: z.record(z.string(), z.any()).optional(),
  if_match_updated_at: z.string().optional(),
  llm_snapshot_id: z.string().optional(),
  issues: z.array(z.any()).optional(),
});

export const PatchDecisionSchema = z.object({
  project_id: UUID,
  patch: z.record(z.string(), z.any()).optional(),
  if_match_updated_at: z.string().optional(),
  llm_snapshot_id: z.string().optional(),
  issues: z.array(z.any()).optional(),
});