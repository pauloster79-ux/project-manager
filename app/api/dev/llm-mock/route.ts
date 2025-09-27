// app/api/dev/llm-mock/route.ts
import { NextResponse } from "next/server";
import { completeJSON } from "@/src/lib/llm";

export async function GET() {
  const sample = {
    entity_type: "risk",
    diff: { probability: 5, impact: 5, mitigation: "waiting for vendor" }
  };
  const res = await completeJSON({
    system: "Return JSON only that matches ValidationResponse.",
    user: JSON.stringify(sample),
    schemaName: "gateway",
    temperature: 0.2,
  });
  return NextResponse.json(res);
}
