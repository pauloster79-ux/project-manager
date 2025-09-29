import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function HomePage() {
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;
  
  // If user is not logged in, set auto-login cookie and redirect to projects
  if (!userId) {
    // Set auto-login cookie
    cookieStore.set("user_id", "auto-user-id", { 
      httpOnly: true, 
      sameSite: "lax", 
      path: "/",
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }
  
  // Always redirect to projects (user is now auto-authenticated)
  redirect("/projects");
}
