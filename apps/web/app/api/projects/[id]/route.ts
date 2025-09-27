// app/api/projects/[id]/route.ts
import { NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { apiError } from "@/src/lib/apiError";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const { rows } = await query(`select * from projects where id = $1`, [id]);
  if (!rows[0]) return apiError(404, "Project not found");
  return NextResponse.json(rows[0]);
}
