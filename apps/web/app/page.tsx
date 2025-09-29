import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { query } from "@/src/lib/db";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;
  
  // If user is not logged in, auto-authenticate as super user
  if (!userId) {
    try {
      // Find the real super user in the database
      const { rows } = await query(
        `SELECT id, email, display_name FROM users WHERE email = $1 LIMIT 1`,
        ["admin@example.com"]
      );

      if (rows[0]) {
        const user = rows[0];
        // Set session cookie with real super user ID
        cookieStore.set("user_id", user.id, { 
          httpOnly: true, 
          sameSite: "lax", 
          path: "/",
          maxAge: 60 * 60 * 24 * 30 // 30 days
        });
        console.log(`Auto-authenticated as super user: ${user.email} (${user.id})`);
      } else {
        console.error("Super user not found in database");
      }
    } catch (error) {
      console.error("Auto-authentication failed:", error);
    }
  }
  
  // Always redirect to projects (user is now auto-authenticated as super user)
  redirect("/projects");
}
