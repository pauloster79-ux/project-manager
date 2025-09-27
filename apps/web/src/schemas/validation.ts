import { z } from "zod";

export const IssueSeverity = z.enum(["critical", "major", "minor"]);
export const IssueType = z.enum(["missing", "contradiction", "clarity", "format"]);

export const IssueSchema = z.object({
  severity: IssueSeverity,
  type: IssueType,
  message: z.string(),
  refs: z.array(z.string()).optional(),
  suggested_fix: z.string().optional(),
});

export const ValidationResponseSchema = z.object({
  validation_score: z.number().int().min(0).max(100),
  blocked: z.boolean(),
  issues: z.array(IssueSchema),
  required_questions: z.array(z.string()),
  safe_fixes: z
    .object({
      normalized_fields: z.record(z.string(), z.any()).optional(),
      grammar_rewrite: z.string().optional(),
    })
    .optional(),
  proposed_patch: z.record(z.string(), z.any()),
  rationale: z.string(),
  coherence_refs: z.array(z.string()).optional(),
  llm_snapshot_id: z.string(),
});

export type ValidationResponse = z.infer<typeof ValidationResponseSchema>;
export type Issue = z.infer<typeof IssueSchema>;
