// Temporary auth bypass for testing - automatically logs in users
import { okJSON } from "@/src/lib/errors";
import { cookies } from "next/headers";

export async function GET() {
  // Set a session cookie for automatic authentication
  const cookieStore = cookies();
  cookieStore.set("user_id", "auto-user-id", { 
    httpOnly: true, 
    sameSite: "lax", 
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });

  // Return a mock user with full permissions
  return okJSON({
    id: "auto-user-id",
    email: "admin@example.com",
    display_name: "Auto User",
    org_id: "auto-org-id",
    role: "owner"
  });
}
