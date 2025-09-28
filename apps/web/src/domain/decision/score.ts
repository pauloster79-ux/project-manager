// src/domain/decision/score.ts
import type { Issue } from "./rules";

export function scoreFromIssues(issues: Issue[]): number {
  // Start from 100, subtract per issue type.
  let score = 100;
  for (const i of issues) {
    if (i.severity === "critical") score -= 40;
    else if (i.severity === "major") score -= 20;
    else if (i.severity === "minor") score -= 8;
  }
  if (issues.length === 0) score = 95; // small buffer so LLM can adjust slightly
  return Math.max(0, Math.min(100, score));
}

export function blockedFromIssues(issues: Issue[]): boolean {
  return issues.some((i) => i.severity === "critical");
}
