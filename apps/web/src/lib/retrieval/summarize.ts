import type { Risk, Decision } from "@/src/schemas";
import { format } from "date-fns";

function short(id?: string) {
  if (!id) return "—";
  return id.split("-")[0];
}

function safeDate(d?: string | null) {
  if (!d) return "—";
  try { return format(new Date(d), "yyyy-MM-dd"); } catch { return d; }
}

export function summarizeRisk(r: Partial<Risk>): string {
  const parts: string[] = [];
  parts.push(`RISK ${short(r.id)} | ${r.title ?? "Untitled"}`);
  if (r.probability != null && r.impact != null) {
    const exp = r.exposure ?? (r.probability * r.impact);
    parts.push(`p${r.probability} i${r.impact} exp${exp}`);
  }
  if (r.owner_id) parts.push(`Owner:${short(r.owner_id)}`);
  if (r.next_review_date) parts.push(`NextReview:${safeDate(r.next_review_date)}`);
  if (r.mitigation) parts.push(`Mitigation:${truncate(r.mitigation)}`);
  return parts.join(" | ");
}

export function summarizeDecision(d: Partial<Decision>): string {
  const parts: string[] = [];
  parts.push(`DECISION ${short(d.id)} | ${d.title ?? "Untitled"}`);
  if (d.status) parts.push(`Status:${d.status}`);
  if (d.decided_by) parts.push(`By:${short(d.decided_by)}`);
  if (d.decided_on) parts.push(`On:${safeDate(d.decided_on)}`);
  return parts.join(" | ");
}

function truncate(s: string, max = 120) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + "…";
}
