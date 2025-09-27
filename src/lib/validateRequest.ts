import { z } from "zod";
import { apiError } from "./errors";

/**
 * Parse a Next.js Request JSON body with a Zod schema.
 * Returns: { success: true, data } | throws a NextResponse with 400 on failure.
 */
export async function parseJSON<T extends z.ZodTypeAny>(req: Request, schema: T) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw apiError(400, "Invalid JSON body");
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw apiError(400, "Bad request: schema validation failed", result.error.flatten());
  }
  return result.data as z.infer<T>;
}
