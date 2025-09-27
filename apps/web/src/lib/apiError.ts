// src/lib/apiError.ts
import { NextResponse } from "next/server";

export function apiError(code: number, message: string, details?: any) {
  const map: Record<number,string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT"
  };
  const label = map[code] ?? "ERROR";
  return NextResponse.json({ error: { code: label, message, details } }, { status: code });
}
