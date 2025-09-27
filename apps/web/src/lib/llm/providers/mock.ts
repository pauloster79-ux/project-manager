// src/lib/llm/providers/mock.ts
import { CompleteArgs, LLMProvider } from "../index";
import { hash32, lcg, sleep } from "../json";

const DIM = 1536;

function nextFridayISO(): string {
  const now = new Date();
  const day = now.getUTCDay(); // 0..6
  const add = ((5 - day + 7) % 7) || 7; // next Friday
  const d = new Date(now);
  d.setUTCDate(now.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

function mockGateway(user: string) {
  // Try to detect entity type and basic fields
  let entity: "risk" | "decision" | "unknown" = "unknown";
  const lc = user.toLowerCase();
  if (lc.includes('"entity_type":"risk"') || lc.includes('"risk"') || lc.includes("probability")) entity = "risk";
  if (lc.includes('"entity_type":"decision"') || lc.includes('"decision"') || lc.includes('"status"')) entity = entity === "unknown" ? "decision" : entity;

  if (entity === "risk") {
    // naive heuristics
    const issues = [];
    if (lc.includes('"mitigation":') && (lc.includes("waiting") || lc.includes("tbc") || lc.includes("n/a"))) {
      issues.push({ severity: "minor", type: "clarity", message: "Mitigation is vague", suggested_fix: "State concrete steps and cadence." });
    }
    if (lc.includes('"probability":5') && lc.includes('"impact":5')) {
      issues.push({ severity: "major", type: "missing", message: "High exposure requires owner and next_review_date." });
    }
    const proposed_patch: Record<string, any> = {};
    if (lc.includes('"mitigation":')) {
      proposed_patch.mitigation = "Escalate to vendor; weekly checkpoints; rollback plan ready.";
    }
    if (issues.find(i => i.message.includes("next_review_date"))) {
      proposed_patch.next_review_date = nextFridayISO();
    }
    return {
      validation_score: issues.length ? 84 : 92,
      blocked: issues.some(i => i.severity === "critical") ? true : false,
      issues,
      required_questions: [],
      safe_fixes: { grammar_rewrite: proposed_patch.mitigation ? proposed_patch.mitigation : undefined },
      proposed_patch: Object.keys(proposed_patch).length ? proposed_patch : { note: "No changes needed" },
      rationale: "Improved clarity and ensured review cadence for high exposure.",
      coherence_refs: [],
      llm_snapshot_id: "mock:gw:v1",
    };
  }

  // decision
  if (entity === "decision") {
    const issues = [];
    if (lc.includes('"status":"approved"') || lc.includes('"status":"rejected"')) {
      if (!lc.includes("decided_by")) issues.push({ severity: "major", type: "missing", message: "Approved/Rejected decisions must include decided_by." });
      if (!lc.includes("decided_on")) issues.push({ severity: "major", type: "missing", message: "Approved/Rejected decisions must include decided_on." });
    }
    const proposed_patch: Record<string, any> = {};
    if (issues.length) proposed_patch.decided_on = nextFridayISO();
    return {
      validation_score: issues.length ? 78 : 90,
      blocked: false,
      issues,
      required_questions: [],
      safe_fixes: {},
      proposed_patch: Object.keys(proposed_patch).length ? proposed_patch : { note: "No changes needed" },
      rationale: "Ensured required fields when status is Approved/Rejected.",
      coherence_refs: [],
      llm_snapshot_id: "mock:gw:v1",
    };
  }

  // unknown → generic ok
  return {
    validation_score: 88,
    blocked: false,
    issues: [],
    required_questions: [],
    safe_fixes: {},
    proposed_patch: { note: "No changes needed" },
    rationale: "Entry appears clear and consistent.",
    coherence_refs: [],
    llm_snapshot_id: "mock:gw:v1",
  };
}

function mockIterate(user: string) {
  // Return a slightly shorter mitigation if present
  return {
    revised_proposed_patch: { mitigation: "Escalate weekly; rollback plan ready." },
    rationale: "Tightened wording; kept intent.",
    followup_questions: [],
    citations: [],
  };
}

function mockQA(user: string) {
  return {
    answer: "Top risks: API latency (exp20), Vendor outage (exp15), Data migration (exp12).",
    citations: [
      { type: "risk", id: "r1", title: "API latency" },
      { type: "risk", id: "r2", title: "Vendor outage" },
      { type: "risk", id: "r3", title: "Data migration" },
    ],
  };
}

export const mockProvider: LLMProvider = {
  id: "mock",
  async complete(args: CompleteArgs): Promise<string> {
    // small, realistic latency
    await sleep(120);
    const mode = args.schemaName || "gateway";
    switch (mode) {
      case "gateway":   return JSON.stringify(mockGateway(args.user));
      case "iterate":   return JSON.stringify(mockIterate(args.user));
      case "qa":        return JSON.stringify(mockQA(args.user));
      case "summary":   return JSON.stringify({ summary: "OK" });
      default:          return JSON.stringify({ ok: true });
    }
  },
  async embed(texts: string[]): Promise<number[][]> {
    // Deterministic embeddings with simple LCG seeded by hash
    return texts.map((t) => {
      const seed = hash32(t);
      const g = lcg(seed);
      const v = new Array(DIM);
      for (let i = 0; i < DIM; i++) v[i] = g.next().value as number;
      return v as number[];
    });
  },
};
