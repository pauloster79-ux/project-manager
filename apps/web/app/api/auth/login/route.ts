// Simple login endpoint for testing
import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return apiError(400, "Invalid JSON");

  const { email } = body;
  if (!email) return apiError(400, "Email is required");

  // Find user by email
  const { rows } = await query(
    `SELECT id, email, display_name FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );

  if (!rows[0]) {
    return apiError(404, "User not found");
  }

  const user = rows[0];

  // Set a simple session cookie
  const cookieStore = cookies();
  cookieStore.set("user_id", user.id, { 
    httpOnly: true, 
    sameSite: "lax", 
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return okJSON({
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name
    },
    message: "Logged in successfully"
  });
}
