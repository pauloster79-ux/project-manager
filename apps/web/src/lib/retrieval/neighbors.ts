import { query } from "@/src/lib/db";
import { summarizeDecision, summarizeRisk } from "./summarize";

export async function getRiskNeighbors(projectId: string, riskId: string, opts?: { maxRisks?: number; maxDecisions?: number }) {
  const maxRisks = opts?.maxRisks ?? 5;
  const maxDecisions = opts?.maxDecisions ?? 5;

  const [riskRes, risksRes, decisionsRes, attsRes] = await Promise.all([
    query(`select * from risks where id = $1`, [riskId]),
    query(
      `select * from risks where project_id = $1 and id <> $2 order by exposure desc, updated_at desc limit $3`,
      [projectId, riskId, maxRisks]
    ),
    query(
      `select * from decisions where project_id = $1 order by updated_at desc limit $2`,
      [projectId, maxDecisions]
    ),
    query(
      `select * from attachments where project_id = $1 and entity_type = 'risk' and entity_id = $2 order by uploaded_at desc limit 10`,
      [projectId, riskId]
    ),
  ]);

  const risk = riskRes.rows[0] || null;
  return {
    risk,
    relatedRiskSummaries: risksRes.rows.map(summarizeRisk),
    relatedDecisionSummaries: decisionsRes.rows.map(summarizeDecision),
    linkedAttachments: attsRes.rows as Array<{
      id: string; filename: string; mime_type: string; text_extract_status: string;
    }>,
  };
}

export async function getDecisionNeighbors(projectId: string, decisionId: string, opts?: { maxDecisions?: number; maxRisks?: number }) {
  const maxDecisions = opts?.maxDecisions ?? 5;
  const maxRisks = opts?.maxRisks ?? 5;

  const [decRes, decsRes, risksRes, attsRes] = await Promise.all([
    query(`select * from decisions where id = $1`, [decisionId]),
    query(
      `select * from decisions where project_id = $1 and id <> $2 order by updated_at desc limit $3`,
      [projectId, decisionId, maxDecisions]
    ),
    query(
      `select * from risks where project_id = $1 order by exposure desc, updated_at desc limit $2`,
      [projectId, maxRisks]
    ),
    query(
      `select * from attachments where project_id = $1 and entity_type = 'decision' and entity_id = $2 order by uploaded_at desc limit 10`,
      [projectId, decisionId]
    ),
  ]);

  const decision = decRes.rows[0] || null;
  return {
    decision,
    relatedDecisionSummaries: decsRes.rows.map(summarizeDecision),
    relatedRiskSummaries: risksRes.rows.map(summarizeRisk),
    linkedAttachments: attsRes.rows as Array<{
      id: string; filename: string; mime_type: string; text_extract_status: string;
    }>,
  };
}
