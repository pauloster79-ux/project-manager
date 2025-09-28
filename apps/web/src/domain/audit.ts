// src/domain/audit.ts
import { query } from "@/src/lib/db";

export async function writeAudit(args: {
  project_id: string;
  actor_user_id?: string | null;
  actor_source: "ui" | "channel" | "api" | "worker";
  entity_type: "risk" | "decision";
  entity_id: string;
  action: "create" | "update" | "validate" | "approve" | "reject";
  before?: any;
  after?: any;
  issues?: any;
  llm_snapshot_id?: string | null;
}) {
  const {
    project_id, actor_user_id = null, actor_source,
    entity_type, entity_id, action, before, after, issues, llm_snapshot_id
  } = args;
  await query(
    `insert into audit_log (project_id, actor_user_id, actor_source, entity_type, entity_id, action, before, after, issues, llm_snapshot_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [project_id, actor_user_id, actor_source, entity_type, entity_id, action, before ?? null, after ?? null, issues ?? null, llm_snapshot_id ?? null]
  );
}
