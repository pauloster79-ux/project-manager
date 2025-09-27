import { NextResponse } from "next/server";

type Code =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_FAILED"
  | "LLM_TIMEOUT"
  | "ERROR";

const codeByStatus: Record<number, Code> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
};

export function apiError(status: number, message: string, details?: unknown) {
  const code = codeByStatus[status] ?? "ERROR";
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function okJSON(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}
