// Auto-authentication that logs in as the real super user
import { okJSON, apiError } from "@/src/lib/errors";
import { query } from "@/src/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    console.log("Auto-login endpoint called");
    
    // Find the real super user in the database
    const { rows } = await query(
      `SELECT id, email, display_name FROM users WHERE email = $1 LIMIT 1`,
      ["admin@example.com"]
    );

    if (!rows[0]) {
      console.log("Super user not found in database");
      return apiError(404, "Super user not found in database");
    }

    const user = rows[0];
    console.log("Found super user:", user);

    // Set a session cookie with the real user ID
    const cookieStore = cookies();
    cookieStore.set("user_id", user.id, { 
      httpOnly: true, 
      sameSite: "lax", 
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    console.log("Session cookie set for user:", user.id);

    // Return the real user data
    return okJSON({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      message: "Auto-logged in as super user"
    });
  } catch (error) {
    console.error("Auto-login error:", error);
    return apiError(500, "Failed to auto-login", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
